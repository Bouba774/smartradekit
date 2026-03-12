import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { offlineMutationQueue } from '@/lib/offlineStorage';

interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
}

export interface JournalEntry {
  id: string;
  user_id: string;
  entry_date: string;
  checklist: ChecklistItem[];
  daily_objective: string | null;
  lessons: string | null;
  notes: string | null;
  rating: number | null;
  created_at: string;
  updated_at: string;
}

export const useJournalEntries = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['journal-entries', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('entry_date', { ascending: false });

      if (error) throw error;
      
      return (data || []).map(entry => ({
        ...entry,
        checklist: Array.isArray(entry.checklist) ? entry.checklist : JSON.parse(entry.checklist as string || '[]'),
      })) as JournalEntry[];
    },
    enabled: !!user,
  });

  const getEntryByDate = (date: Date): JournalEntry | undefined => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return entries.find(entry => entry.entry_date === dateStr);
  };

  const upsertEntry = useMutation({
    mutationFn: async (entry: {
      entry_date: string;
      checklist?: ChecklistItem[];
      daily_objective?: string;
      lessons?: string;
      notes?: string;
      rating?: number;
    }) => {
      if (!user) throw new Error('User not authenticated');

      const entryData = {
        user_id: user.id,
        entry_date: entry.entry_date,
        checklist: JSON.stringify(entry.checklist || []),
        daily_objective: entry.daily_objective || null,
        lessons: entry.lessons || null,
        notes: entry.notes || null,
        rating: entry.rating ?? null,
      };

      // Check if entry exists in local cache
      const existingEntry = entries.find(e => e.entry_date === entry.entry_date);

      if (!navigator.onLine) {
        await offlineMutationQueue.add({
          type: 'upsertJournal',
          payload: {
            ...entryData,
            existingId: existingEntry?.id || null,
          },
        });
        return {
          ...entryData,
          id: existingEntry?.id || crypto.randomUUID(),
          checklist: entry.checklist || [],
          created_at: existingEntry?.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      }

      let result;
      if (existingEntry) {
        const { data, error } = await supabase
          .from('journal_entries')
          .update(entryData)
          .eq('id', existingEntry.id)
          .select()
          .single();
        if (error) throw error;
        result = data;
      } else {
        const { data, error } = await supabase
          .from('journal_entries')
          .insert(entryData)
          .select()
          .single();
        if (error) throw error;
        result = data;
      }

      return result;
    },
    onMutate: async (newEntry) => {
      if (!user) return;
      await queryClient.cancelQueries({ queryKey: ['journal-entries', user.id] });
      const previous = queryClient.getQueryData<JournalEntry[]>(['journal-entries', user.id]);
      
      const existingEntry = previous?.find(e => e.entry_date === newEntry.entry_date);
      const optimistic: JournalEntry = {
        id: existingEntry?.id || crypto.randomUUID(),
        user_id: user.id,
        entry_date: newEntry.entry_date,
        checklist: newEntry.checklist || [],
        daily_objective: newEntry.daily_objective || null,
        lessons: newEntry.lessons || null,
        notes: newEntry.notes || null,
        rating: newEntry.rating ?? null,
        created_at: existingEntry?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      queryClient.setQueryData<JournalEntry[]>(['journal-entries', user.id], (old = []) => {
        const filtered = old.filter(e => e.entry_date !== newEntry.entry_date);
        return [optimistic, ...filtered].sort((a, b) => b.entry_date.localeCompare(a.entry_date));
      });
      
      return { previous };
    },
    onError: (_err, _entry, context) => {
      if (context?.previous && user) {
        queryClient.setQueryData(['journal-entries', user.id], context.previous);
      }
    },
    onSettled: () => {
      if (navigator.onLine) {
        queryClient.invalidateQueries({ queryKey: ['journal-entries', user?.id] });
      }
    },
  });

  const deleteEntry = useMutation({
    mutationFn: async (entryId: string) => {
      if (!user) throw new Error('User not authenticated');

      if (!navigator.onLine) {
        await offlineMutationQueue.add({
          type: 'deleteJournal',
          payload: { id: entryId },
        });
        return;
      }

      const { error } = await supabase
        .from('journal_entries')
        .delete()
        .eq('id', entryId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onMutate: async (entryId) => {
      if (!user) return;
      await queryClient.cancelQueries({ queryKey: ['journal-entries', user.id] });
      const previous = queryClient.getQueryData<JournalEntry[]>(['journal-entries', user.id]);
      
      queryClient.setQueryData<JournalEntry[]>(['journal-entries', user.id], (old = []) =>
        old.filter(e => e.id !== entryId)
      );
      
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous && user) {
        queryClient.setQueryData(['journal-entries', user.id], context.previous);
      }
    },
    onSettled: () => {
      if (navigator.onLine) {
        queryClient.invalidateQueries({ queryKey: ['journal-entries', user?.id] });
      }
    },
  });

  return {
    entries,
    isLoading,
    getEntryByDate,
    upsertEntry,
    deleteEntry,
  };
};
