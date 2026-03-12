/**
 * Offline Storage Layer using IndexedDB via idb-keyval
 * Persists React Query cache and pending mutations for full offline support.
 */
import { get, set, del, keys, createStore } from 'idb-keyval';
import type { PersistedClient, Persister } from '@tanstack/react-query-persist-client';
// Dedicated stores
const queryStore = createStore('stk-query-cache', 'queries');
const mutationStore = createStore('stk-mutations', 'pending');

// =========== Query Cache Persistence ===========

export const idbPersister: Persister = {
  persistClient: async (client: PersistedClient) => {
    await set('reactQueryClient', client, queryStore);
  },
  restoreClient: async (): Promise<PersistedClient | undefined> => {
    return await get<PersistedClient>('reactQueryClient', queryStore);
  },
  removeClient: async () => {
    await del('reactQueryClient', queryStore);
  },
};

// =========== Offline Mutation Queue ===========

export interface PendingMutation {
  id: string;
  timestamp: number;
  type: 'addTrade' | 'updateTrade' | 'deleteTrade' | 'upsertJournal' | 'deleteJournal';
  payload: Record<string, unknown>;
  retries: number;
}

export const offlineMutationQueue = {
  async add(mutation: Omit<PendingMutation, 'id' | 'timestamp' | 'retries'>) {
    const entry: PendingMutation = {
      ...mutation,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      retries: 0,
    };
    await set(entry.id, entry, mutationStore);
    return entry;
  },

  async getAll(): Promise<PendingMutation[]> {
    const allKeys = await keys(mutationStore);
    const entries: PendingMutation[] = [];
    for (const key of allKeys) {
      const val = await get(key, mutationStore);
      if (val) entries.push(val as PendingMutation);
    }
    // Sort by timestamp (FIFO)
    return entries.sort((a, b) => a.timestamp - b.timestamp);
  },

  async remove(id: string) {
    await del(id, mutationStore);
  },

  async updateRetries(id: string, retries: number) {
    const entry = await get(id, mutationStore) as PendingMutation | undefined;
    if (entry) {
      entry.retries = retries;
      await set(id, entry, mutationStore);
    }
  },

  async clear() {
    const allKeys = await keys(mutationStore);
    for (const key of allKeys) {
      await del(key, mutationStore);
    }
  },

  async count(): Promise<number> {
    const allKeys = await keys(mutationStore);
    return allKeys.length;
  },
};
