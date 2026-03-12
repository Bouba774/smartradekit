/**
 * Offline Sync Engine
 * Processes pending mutations when the app comes back online.
 */
import { supabase } from '@/integrations/supabase/client';
import { offlineMutationQueue, PendingMutation } from './offlineStorage';

const MAX_RETRIES = 3;

async function processMutation(mutation: PendingMutation): Promise<boolean> {
  const { type, payload } = mutation;

  try {
    switch (type) {
      case 'addTrade': {
        const { error } = await supabase.from('trades').insert(payload as any);
        if (error) throw error;
        return true;
      }
      case 'updateTrade': {
        const { id, ...updates } = payload;
        const { error } = await supabase.from('trades').update(updates as any).eq('id', id as string);
        if (error) throw error;
        return true;
      }
      case 'deleteTrade': {
        const { error } = await supabase.from('trades').delete().eq('id', payload.id as string);
        if (error) throw error;
        return true;
      }
      case 'upsertJournal': {
        const { existingId, ...entryData } = payload;
        if (existingId) {
          const { error } = await supabase.from('journal_entries').update(entryData as any).eq('id', existingId as string);
          if (error) throw error;
        } else {
          const { error } = await supabase.from('journal_entries').insert(entryData as any);
          if (error) throw error;
        }
        return true;
      }
      case 'deleteJournal': {
        const { error } = await supabase.from('journal_entries').delete().eq('id', payload.id as string);
        if (error) throw error;
        return true;
      }
      default:
        console.warn('[OfflineSync] Unknown mutation type:', type);
        return true; // Remove unknown mutations
    }
  } catch (error) {
    console.error('[OfflineSync] Mutation failed:', type, error);
    return false;
  }
}

let isSyncing = false;

export async function syncPendingMutations(): Promise<{ synced: number; failed: number }> {
  if (isSyncing) return { synced: 0, failed: 0 };
  if (!navigator.onLine) return { synced: 0, failed: 0 };

  isSyncing = true;
  let synced = 0;
  let failed = 0;

  try {
    const pending = await offlineMutationQueue.getAll();
    
    for (const mutation of pending) {
      const success = await processMutation(mutation);
      
      if (success) {
        await offlineMutationQueue.remove(mutation.id);
        synced++;
      } else {
        if (mutation.retries >= MAX_RETRIES) {
          // Drop mutation after max retries
          await offlineMutationQueue.remove(mutation.id);
          failed++;
        } else {
          await offlineMutationQueue.updateRetries(mutation.id, mutation.retries + 1);
          failed++;
        }
      }
    }
  } finally {
    isSyncing = false;
  }

  return { synced, failed };
}

// Auto-sync when coming back online
let listenerAttached = false;

export function initOfflineSync() {
  if (listenerAttached) return;
  listenerAttached = true;

  window.addEventListener('online', async () => {
    // Small delay to let connection stabilize
    await new Promise(r => setTimeout(r, 1500));
    const result = await syncPendingMutations();
    if (result.synced > 0) {
      // Dispatch event for React Query invalidation
      window.dispatchEvent(new CustomEvent('offline-sync-complete', { detail: result }));
    }
  });
}
