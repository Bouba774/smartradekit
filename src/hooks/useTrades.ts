import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { offlineMutationQueue } from '@/lib/offlineStorage';

export interface Trade {
  id: string;
  user_id: string;
  asset: string;
  direction: 'long' | 'short';
  entry_price: number;
  exit_price: number | null;
  stop_loss: number | null;
  take_profit: number | null;
  lot_size: number;
  setup: string | null;
  custom_setup: string | null;
  result: 'win' | 'loss' | 'breakeven' | 'pending' | null;
  profit_loss: number | null;
  risk_amount: number | null;
  notes: string | null;
  emotions: string | null;
  images: string[] | null;
  videos: string[] | null;
  audios: string[] | null;
  trade_date: string;
  created_at: string;
  updated_at: string;
  exit_timestamp: string | null;
  exit_method: 'sl' | 'tp' | 'manual' | null;
  duration_seconds: number | null;
  timeframe: string | null;
}

export const useTrades = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const tradesQuery = useQuery({
    queryKey: ['trades', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', user.id)
        .order('trade_date', { ascending: false });

      if (error) throw error;
      return data as Trade[];
    },
    enabled: !!user
  });

  const addTrade = useMutation({
    mutationFn: async (trade: Omit<Trade, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user) throw new Error('Not authenticated');

      const tradeWithUser = { ...trade, user_id: user.id };

      if (!navigator.onLine) {
        // Queue for later sync
        const tempId = crypto.randomUUID();
        await offlineMutationQueue.add({
          type: 'addTrade',
          payload: tradeWithUser as unknown as Record<string, unknown>,
        });
        return { ...tradeWithUser, id: tempId, created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as Trade;
      }

      const { data, error } = await supabase
        .from('trades')
        .insert(tradeWithUser)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onMutate: async (newTrade) => {
      if (!user) return;
      await queryClient.cancelQueries({ queryKey: ['trades', user.id] });
      const previous = queryClient.getQueryData<Trade[]>(['trades', user.id]);
      
      const optimistic: Trade = {
        ...newTrade,
        id: crypto.randomUUID(),
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      queryClient.setQueryData<Trade[]>(['trades', user.id], (old = []) => [optimistic, ...old]);
      return { previous };
    },
    onError: (_err, _newTrade, context) => {
      if (context?.previous && user) {
        queryClient.setQueryData(['trades', user.id], context.previous);
      }
    },
    onSettled: () => {
      if (navigator.onLine) {
        queryClient.invalidateQueries({ queryKey: ['trades', user?.id] });
      }
    }
  });

  const updateTrade = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Trade> & { id: string }) => {
      if (!navigator.onLine) {
        await offlineMutationQueue.add({
          type: 'updateTrade',
          payload: { id, ...updates } as unknown as Record<string, unknown>,
        });
        return { id, ...updates } as Trade;
      }

      const { data, error } = await supabase
        .from('trades')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onMutate: async (updatedTrade) => {
      if (!user) return;
      await queryClient.cancelQueries({ queryKey: ['trades', user.id] });
      const previous = queryClient.getQueryData<Trade[]>(['trades', user.id]);
      
      queryClient.setQueryData<Trade[]>(['trades', user.id], (old = []) =>
        old.map(t => t.id === updatedTrade.id ? { ...t, ...updatedTrade } : t)
      );
      return { previous };
    },
    onError: (_err, _trade, context) => {
      if (context?.previous && user) {
        queryClient.setQueryData(['trades', user.id], context.previous);
      }
    },
    onSettled: () => {
      if (navigator.onLine) {
        queryClient.invalidateQueries({ queryKey: ['trades', user?.id] });
      }
    }
  });

  const deleteTrade = useMutation({
    mutationFn: async (id: string) => {
      if (!navigator.onLine) {
        await offlineMutationQueue.add({
          type: 'deleteTrade',
          payload: { id },
        });
        return;
      }

      const { error } = await supabase
        .from('trades')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onMutate: async (id) => {
      if (!user) return;
      await queryClient.cancelQueries({ queryKey: ['trades', user.id] });
      const previous = queryClient.getQueryData<Trade[]>(['trades', user.id]);
      
      queryClient.setQueryData<Trade[]>(['trades', user.id], (old = []) =>
        old.filter(t => t.id !== id)
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous && user) {
        queryClient.setQueryData(['trades', user.id], context.previous);
      }
    },
    onSettled: () => {
      if (navigator.onLine) {
        queryClient.invalidateQueries({ queryKey: ['trades', user?.id] });
      }
    }
  });

  // Calculate statistics
  const stats = tradesQuery.data ? {
    totalTrades: tradesQuery.data.length,
    winningTrades: tradesQuery.data.filter(t => t.result === 'win').length,
    losingTrades: tradesQuery.data.filter(t => t.result === 'loss').length,
    breakeven: tradesQuery.data.filter(t => t.result === 'breakeven').length,
    totalProfit: tradesQuery.data
      .filter(t => t.profit_loss && t.profit_loss > 0)
      .reduce((sum, t) => sum + (t.profit_loss || 0), 0),
    totalLoss: tradesQuery.data
      .filter(t => t.profit_loss && t.profit_loss < 0)
      .reduce((sum, t) => sum + Math.abs(t.profit_loss || 0), 0),
    winrate: tradesQuery.data.length > 0 
      ? (tradesQuery.data.filter(t => t.result === 'win').length / 
         tradesQuery.data.filter(t => t.result !== 'pending').length) * 100 
      : 0
  } : null;

  return {
    trades: tradesQuery.data || [],
    isLoading: tradesQuery.isLoading,
    error: tradesQuery.error,
    stats,
    addTrade,
    updateTrade,
    deleteTrade,
    refetch: tradesQuery.refetch
  };
};
