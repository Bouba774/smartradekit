import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useTrades, Trade } from './useTrades';
import { useSelfSabotage } from './useSelfSabotage';
import { useDisciplineScore } from './useDisciplineScore';
import { 
  DISCIPLINE_CHALLENGE_DEFINITIONS, 
  DISCIPLINE_USER_LEVELS, 
  DISCIPLINE_REWARD_CHESTS,
  DisciplineChallengeDefinition,
  ChallengeCategory,
  CHALLENGE_CATEGORIES,
  RARITY_COLORS
} from '@/data/disciplineChallenges';

export interface UserChallenge {
  id: string;
  user_id: string;
  challenge_id: string;
  progress: number;
  target: number;
  completed: boolean;
  completed_at: string | null;
  points_earned: number;
  popup_shown: boolean;
  created_at: string;
  updated_at: string;
}

// Legacy interface for backwards compatibility
export interface ChallengeDefinition {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  target: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  reward: string;
  points: number;
  icon: string;
  calculateProgress: (trades: any[], stats: any) => number;
}

// Convert new format to legacy format for compatibility
const convertToLegacyFormat = (def: DisciplineChallengeDefinition): ChallengeDefinition => ({
  id: def.id,
  title: def.title.fr,
  titleEn: def.title.en,
  description: def.description.fr,
  descriptionEn: def.description.en,
  target: def.target,
  difficulty: def.difficulty,
  reward: def.reward.fr,
  points: def.points,
  icon: def.icon,
  calculateProgress: def.calculateProgress,
});

// Export legacy format for backwards compatibility
export const CHALLENGE_DEFINITIONS = DISCIPLINE_CHALLENGE_DEFINITIONS.map(convertToLegacyFormat);
export const USER_LEVELS = DISCIPLINE_USER_LEVELS;

export interface ChallengeWithProgress extends DisciplineChallengeDefinition {
  progress: number;
  completed: boolean;
  userChallenge?: UserChallenge;
  isNewlyCompleted: boolean;
  popupShown: boolean;
  wasReset: boolean;
}

export interface RewardChestWithStatus {
  id: string;
  name: { fr: string; en: string };
  description: { fr: string; en: string };
  requiredDays: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  icon: string;
  reward: { type: 'badge' | 'title' | 'points'; value: string | number };
  unlocked: boolean;
  progress: number;
}

export const useChallenges = () => {
  const { user, profile, updateProfile } = useAuth();
  const { trades, stats } = useTrades();
  const queryClient = useQueryClient();
  
  // Use discipline hooks for reset detection
  const sabotageAnalysis = useSelfSabotage(trades);
  const disciplineScore = useDisciplineScore(trades);

  const challengesQuery = useQuery({
    queryKey: ['user_challenges', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('user_challenges')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      return data as UserChallenge[];
    },
    enabled: !!user
  });

  // Detect if there's been self-sabotage that should reset streak challenges
  const hasSabotage = sabotageAnalysis.sabotageScore > 30 || 
    sabotageAnalysis.alerts.some(a => a.severity === 'danger');

  // Calculate progress for all challenges
  const challengesWithProgress: ChallengeWithProgress[] = DISCIPLINE_CHALLENGE_DEFINITIONS.map(def => {
    const userChallenge = challengesQuery.data?.find(c => c.challenge_id === def.id);
    const calculatedProgress = def.calculateProgress(trades);
    const progress = Math.min(calculatedProgress, def.target);
    const completed = progress >= def.target;
    
    const popupAlreadyShown = userChallenge?.popup_shown === true;
    const wasAlreadyCompleted = userChallenge?.completed === true;
    
    // Check if streak challenge should be reset due to sabotage
    const wasReset = def.isStreak && hasSabotage && !wasAlreadyCompleted;

    return {
      ...def,
      progress: wasReset ? 0 : progress,
      completed: wasReset ? false : completed,
      userChallenge,
      isNewlyCompleted: completed && !wasAlreadyCompleted && !popupAlreadyShown && !wasReset,
      popupShown: popupAlreadyShown,
      wasReset,
    };
  });

  // Group challenges by category
  const challengesByCategory = (Object.keys(CHALLENGE_CATEGORIES) as ChallengeCategory[]).reduce(
    (acc, category) => {
      acc[category] = challengesWithProgress.filter(c => c.category === category);
      return acc;
    },
    {} as Record<ChallengeCategory, ChallengeWithProgress[]>
  );

  // Calculate reward chests status
  const currentDisciplineStreak = disciplineScore.streak;
  const rewardChests: RewardChestWithStatus[] = DISCIPLINE_REWARD_CHESTS.map(chest => ({
    ...chest,
    unlocked: currentDisciplineStreak >= chest.requiredDays,
    progress: Math.min((currentDisciplineStreak / chest.requiredDays) * 100, 100),
  }));

  // Sync challenges with database
  const syncChallenge = useMutation({
    mutationFn: async (challenge: ChallengeWithProgress) => {
      if (!user) throw new Error('Not authenticated');

      const existingChallenge = challenge.userChallenge;

      if (existingChallenge) {
        const shouldMarkPopupShown = challenge.completed || existingChallenge.popup_shown;
        const isNewlyCompleted = challenge.completed && !existingChallenge.completed;
        
        // Handle reset for streak challenges
        if (challenge.wasReset && existingChallenge.progress > 0) {
          const { error } = await supabase
            .from('user_challenges')
            .update({
              progress: 0,
              completed: false,
              completed_at: null,
              points_earned: 0,
            })
            .eq('id', existingChallenge.id);

          if (error) throw error;
          return;
        }
        
        const { error } = await supabase
          .from('user_challenges')
          .update({
            progress: challenge.progress,
            completed: challenge.completed,
            completed_at: isNewlyCompleted ? new Date().toISOString() : existingChallenge.completed_at,
            points_earned: challenge.completed ? challenge.points : existingChallenge.points_earned,
            popup_shown: shouldMarkPopupShown,
          })
          .eq('id', existingChallenge.id);

        if (error) throw error;

        if (isNewlyCompleted && !existingChallenge.points_earned) {
          const newPoints = (profile?.total_points || 0) + challenge.points;
          const newLevel = DISCIPLINE_USER_LEVELS.reduce((acc, lvl) => 
            newPoints >= lvl.minPoints ? lvl.level : acc
          , 1);

          await updateProfile({ 
            total_points: newPoints,
            level: newLevel
          });
        }
      } else {
        const { error } = await supabase
          .from('user_challenges')
          .insert({
            user_id: user.id,
            challenge_id: challenge.id,
            progress: challenge.progress,
            target: challenge.target,
            completed: challenge.completed,
            completed_at: challenge.completed ? new Date().toISOString() : null,
            points_earned: challenge.completed ? challenge.points : 0,
            popup_shown: challenge.completed ? true : false,
          });

        if (error) throw error;

        if (challenge.completed) {
          const newPoints = (profile?.total_points || 0) + challenge.points;
          const newLevel = DISCIPLINE_USER_LEVELS.reduce((acc, lvl) => 
            newPoints >= lvl.minPoints ? lvl.level : acc
          , 1);

          await updateProfile({ 
            total_points: newPoints,
            level: newLevel
          });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_challenges', user?.id] });
    }
  });

  const syncAllChallenges = async () => {
    for (const challenge of challengesWithProgress) {
      await syncChallenge.mutateAsync(challenge);
    }
  };

  // Get current level info
  const currentLevel = DISCIPLINE_USER_LEVELS.find((l, i) => 
    (profile?.total_points || 0) >= l.minPoints && 
    (DISCIPLINE_USER_LEVELS[i + 1] ? (profile?.total_points || 0) < DISCIPLINE_USER_LEVELS[i + 1].minPoints : true)
  ) || DISCIPLINE_USER_LEVELS[0];

  const nextLevel = DISCIPLINE_USER_LEVELS[DISCIPLINE_USER_LEVELS.indexOf(currentLevel) + 1];
  
  const progressToNextLevel = nextLevel 
    ? (((profile?.total_points || 0) - currentLevel.minPoints) / (nextLevel.minPoints - currentLevel.minPoints)) * 100 
    : 100;

  const completedCount = challengesWithProgress.filter(c => c.completed).length;
  const totalChallenges = challengesWithProgress.length;

  return {
    // New discipline-based data
    challenges: challengesWithProgress,
    challengesByCategory,
    categories: CHALLENGE_CATEGORIES,
    rewardChests,
    disciplineStreak: currentDisciplineStreak,
    hasSabotage,
    sabotageAlerts: sabotageAnalysis.alerts,
    
    // Legacy compatibility
    userChallenges: challengesQuery.data || [],
    isLoading: challengesQuery.isLoading,
    currentLevel,
    nextLevel,
    progressToNextLevel,
    totalPoints: profile?.total_points || 0,
    syncAllChallenges,
    syncChallenge,
    completedCount,
    totalChallenges,
    
    // Constants
    USER_LEVELS: DISCIPLINE_USER_LEVELS,
    RARITY_COLORS,
  };
};
