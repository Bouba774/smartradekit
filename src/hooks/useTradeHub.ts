import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface CommunityProfile {
  id: string;
  user_id: string;
  pseudo: string;
  avatar_url: string | null;
  is_public: boolean;
  preferred_assets: string[] | null;
  preferred_sessions: string[] | null;
  strategy: string | null;
  bio: string | null;
}

export interface CommunityStats {
  user_id: string;
  global_score: number;
  discipline_score: number;
  rr_score: number;
  winrate_score: number;
  regularity_score: number;
  drawdown_score: number;
  total_trades: number;
  winrate_pct: number;
  avg_rr: number;
  badges: string[];
}

export interface SharedTrade {
  id: string;
  user_id: string;
  asset: string;
  direction: 'buy' | 'sell';
  session_label: string | null;
  rr: number | null;
  result: 'win' | 'loss' | 'breakeven' | null;
  note: string | null;
  created_at: string;
  community_profiles?: { pseudo: string; avatar_url: string | null } | null;
  reactions?: { reaction: string; count: number; mine: boolean }[];
}

const randomPseudo = () => `Trader${Math.floor(1000 + Math.random() * 9000)}`;

export const useMyCommunityProfile = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['community-profile', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('community_profiles')
        .select('*')
        .eq('user_id', user!.id)
        .maybeSingle();
      if (error) throw error;
      return data as CommunityProfile | null;
    },
  });
};

export const useEnsureCommunityProfile = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');
      const existing = await supabase
        .from('community_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (existing.data) return existing.data;
      // Try a few pseudos to avoid collision
      for (let i = 0; i < 5; i++) {
        const pseudo = randomPseudo();
        const { data, error } = await supabase
          .from('community_profiles')
          .insert({ user_id: user.id, pseudo, is_public: false })
          .select()
          .single();
        if (!error) return data;
        if (!`${error.message}`.toLowerCase().includes('unique')) throw error;
      }
      throw new Error('Could not generate unique pseudo');
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['community-profile'] }),
  });
};

export const useUpdateCommunityProfile = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (patch: Partial<CommunityProfile>) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('community_profiles')
        .update(patch)
        .eq('user_id', user.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['community-profile'] });
      qc.invalidateQueries({ queryKey: ['leaderboard'] });
      toast.success('Profil mis à jour');
    },
    onError: (e: any) => toast.error(e.message || 'Erreur'),
  });
};

export const useMyCommunityStats = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['community-stats', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from('community_stats')
        .select('*')
        .eq('user_id', user!.id)
        .maybeSingle();
      return data as CommunityStats | null;
    },
  });
};

export const useLeaderboard = () => {
  return useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      // Get public profiles
      const { data: profiles, error: pErr } = await supabase
        .from('community_profiles')
        .select('user_id, pseudo, avatar_url, strategy, preferred_assets')
        .eq('is_public', true);
      if (pErr) throw pErr;
      if (!profiles?.length) return [];

      const userIds = profiles.map((p) => p.user_id);
      const { data: stats } = await supabase
        .from('community_stats')
        .select('*')
        .in('user_id', userIds);

      const statsMap = new Map((stats || []).map((s) => [s.user_id, s]));
      return profiles
        .map((p) => ({
          ...p,
          stats: statsMap.get(p.user_id) as CommunityStats | undefined,
        }))
        .filter((p) => p.stats && p.stats.total_trades > 0)
        .sort((a, b) => (b.stats?.global_score || 0) - (a.stats?.global_score || 0))
        .slice(0, 100);
    },
    staleTime: 1000 * 60 * 2,
  });
};

export const useSharedTrades = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['shared-trades'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shared_trades')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;

      const userIds = [...new Set((data || []).map((d) => d.user_id))];
      const [{ data: profiles }, { data: reactions }] = await Promise.all([
        supabase
          .from('community_profiles')
          .select('user_id, pseudo, avatar_url')
          .in('user_id', userIds),
        supabase
          .from('trade_reactions')
          .select('shared_trade_id, reaction, user_id')
          .in('shared_trade_id', (data || []).map((d) => d.id)),
      ]);

      const profMap = new Map((profiles || []).map((p) => [p.user_id, p]));
      return (data || []).map((d) => {
        const tradeReactions = (reactions || []).filter((r) => r.shared_trade_id === d.id);
        const grouped = ['like', 'useful', 'fire'].map((r) => ({
          reaction: r,
          count: tradeReactions.filter((tr) => tr.reaction === r).length,
          mine: tradeReactions.some((tr) => tr.reaction === r && tr.user_id === user?.id),
        }));
        return {
          ...d,
          community_profiles: profMap.get(d.user_id) || null,
          reactions: grouped,
        } as SharedTrade;
      });
    },
    staleTime: 1000 * 30,
  });
};

export const useToggleReaction = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ tradeId, reaction, mine }: { tradeId: string; reaction: string; mine: boolean }) => {
      if (!user) throw new Error('Not authenticated');
      if (mine) {
        await supabase
          .from('trade_reactions')
          .delete()
          .eq('shared_trade_id', tradeId)
          .eq('user_id', user.id)
          .eq('reaction', reaction);
      } else {
        await supabase
          .from('trade_reactions')
          .insert({ shared_trade_id: tradeId, user_id: user.id, reaction });
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['shared-trades'] }),
  });
};

export const useShareTrade = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (trade: {
      trade_id?: string;
      asset: string;
      direction: 'buy' | 'sell';
      session_label?: string | null;
      rr?: number | null;
      result?: 'win' | 'loss' | 'breakeven' | null;
      note?: string | null;
    }) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('shared_trades')
        .insert({ ...trade, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['shared-trades'] });
      toast.success('Trade partagé dans TradeHub');
    },
    onError: (e: any) =>
      toast.error(e.message?.includes('row-level') ? 'Active ton profil public pour partager' : e.message),
  });
};

export const useCommunityFollows = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const followingQuery = useQuery({
    queryKey: ['follows', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from('community_follows')
        .select('following_id')
        .eq('follower_id', user!.id);
      return new Set((data || []).map((f) => f.following_id));
    },
  });

  const toggle = useMutation({
    mutationFn: async ({ targetId, currently }: { targetId: string; currently: boolean }) => {
      if (!user) throw new Error('Not authenticated');
      if (currently) {
        await supabase
          .from('community_follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', targetId);
      } else {
        await supabase.from('community_follows').insert({
          follower_id: user.id,
          following_id: targetId,
        });
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['follows'] }),
  });

  return { following: followingQuery.data || new Set<string>(), toggle: toggle.mutate };
};

export const useDiscoverTraders = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['discover-traders', user?.id],
    queryFn: async () => {
      const { data: profiles } = await supabase
        .from('community_profiles')
        .select('user_id, pseudo, avatar_url, strategy, preferred_assets, preferred_sessions')
        .eq('is_public', true)
        .neq('user_id', user?.id || '');
      const userIds = (profiles || []).map((p) => p.user_id);
      if (!userIds.length) return [];
      const { data: stats } = await supabase
        .from('community_stats')
        .select('*')
        .in('user_id', userIds);
      const statsMap = new Map((stats || []).map((s) => [s.user_id, s]));
      return (profiles || [])
        .map((p) => ({ ...p, stats: statsMap.get(p.user_id) as CommunityStats | undefined }))
        .filter((p) => p.stats && p.stats.total_trades > 0);
    },
  });
};

export const useCommunityChallenges = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['community-challenges', user?.id],
    queryFn: async () => {
      const [{ data: list }, { data: progress }] = await Promise.all([
        supabase.from('community_challenges').select('*').eq('is_active', true),
        supabase
          .from('community_challenge_progress')
          .select('*')
          .eq('user_id', user?.id || ''),
      ]);
      const progMap = new Map((progress || []).map((p) => [p.challenge_id, p]));
      return (list || []).map((c) => ({
        ...c,
        progress: progMap.get(c.id)?.progress || 0,
        completed: progMap.get(c.id)?.completed || false,
      }));
    },
    enabled: !!user,
  });
};
