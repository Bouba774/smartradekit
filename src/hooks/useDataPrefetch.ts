import { useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Hook to prefetch data for frequently visited pages
 * Improves navigation speed by loading data in the background
 */
export const useDataPrefetch = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Prefetch trades data
  const prefetchTrades = useCallback(async () => {
    if (!user) return;

    await queryClient.prefetchQuery({
      queryKey: ['trades', user.id],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('trades')
          .select('*')
          .eq('user_id', user.id)
          .order('trade_date', { ascending: false });

        if (error) throw error;
        return data;
      },
      staleTime: 1000 * 60 * 5, // 5 minutes
    });
  }, [user, queryClient]);

  // Prefetch profile data
  const prefetchProfile = useCallback(async () => {
    if (!user) return;

    await queryClient.prefetchQuery({
      queryKey: ['profile', user.id],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data;
      },
      staleTime: 1000 * 60 * 10, // 10 minutes
    });
  }, [user, queryClient]);

  // Prefetch settings data
  const prefetchSettings = useCallback(async () => {
    if (!user) return;

    await queryClient.prefetchQuery({
      queryKey: ['settings', user.id],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('user_settings')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data;
      },
      staleTime: 1000 * 60 * 10, // 10 minutes
    });
  }, [user, queryClient]);

  // Prefetch challenges data
  const prefetchChallenges = useCallback(async () => {
    if (!user) return;

    await queryClient.prefetchQuery({
      queryKey: ['challenges', user.id],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('user_challenges')
          .select('*')
          .eq('user_id', user.id);

        if (error) throw error;
        return data;
      },
      staleTime: 1000 * 60 * 5, // 5 minutes
    });
  }, [user, queryClient]);

  // Prefetch journal entries
  const prefetchJournal = useCallback(async () => {
    if (!user) return;

    await queryClient.prefetchQuery({
      queryKey: ['journalEntries', user.id],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('journal_entries')
          .select('*')
          .eq('user_id', user.id)
          .order('entry_date', { ascending: false })
          .limit(30);

        if (error) throw error;
        return data;
      },
      staleTime: 1000 * 60 * 5, // 5 minutes
    });
  }, [user, queryClient]);

  // Prefetch all priority data
  const prefetchPriorityData = useCallback(async () => {
    if (!user) return;

    // Use requestIdleCallback for non-blocking prefetch
    const prefetchFn = async () => {
      try {
        // Prefetch in parallel with staggered timing
        await Promise.allSettled([
          prefetchTrades(),
          new Promise(resolve => setTimeout(resolve, 100)).then(prefetchProfile),
          new Promise(resolve => setTimeout(resolve, 200)).then(prefetchSettings),
          new Promise(resolve => setTimeout(resolve, 300)).then(prefetchChallenges),
          new Promise(resolve => setTimeout(resolve, 400)).then(prefetchJournal),
        ]);
      } catch {
        // Silently fail - data will load normally when needed
      }
    };

    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(prefetchFn, { timeout: 2000 });
    } else {
      setTimeout(prefetchFn, 500);
    }
  }, [user, prefetchTrades, prefetchProfile, prefetchSettings, prefetchChallenges, prefetchJournal]);

  return {
    prefetchTrades,
    prefetchProfile,
    prefetchSettings,
    prefetchChallenges,
    prefetchJournal,
    prefetchPriorityData,
  };
};

/**
 * Hook to automatically prefetch data on authentication
 */
export const useAutoPrefetch = () => {
  const { user } = useAuth();
  const { prefetchPriorityData } = useDataPrefetch();

  useEffect(() => {
    if (user) {
      // Wait for initial render, then prefetch
      const timer = setTimeout(() => {
        prefetchPriorityData();
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [user, prefetchPriorityData]);
};

/**
 * Hook to prefetch data on route hover (for bottom navigation)
 */
export const usePrefetchOnHover = () => {
  const { prefetchTrades, prefetchProfile, prefetchChallenges, prefetchJournal } = useDataPrefetch();

  const prefetchForRoute = useCallback((route: string) => {
    switch (route) {
      case '/dashboard':
      case '/history':
      case '/reports':
        prefetchTrades();
        break;
      case '/profile':
        prefetchProfile();
        break;
      case '/challenges':
        prefetchChallenges();
        break;
      case '/journal':
        prefetchJournal();
        break;
    }
  }, [prefetchTrades, prefetchProfile, prefetchChallenges, prefetchJournal]);

  return { prefetchForRoute };
};

export default useDataPrefetch;
