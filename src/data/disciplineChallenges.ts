import { Trade } from '@/hooks/useTrades';
import { parseISO, differenceInHours, differenceInMinutes, format, startOfWeek, endOfWeek, isWithinInterval, subDays } from 'date-fns';

export type ChallengeCategory = 'self_control' | 'risk_management' | 'analytics' | 'psychology';
export type ChallengeDifficulty = 'easy' | 'medium' | 'hard' | 'expert';

export interface DisciplineChallengeDefinition {
  id: string;
  category: ChallengeCategory;
  title: { fr: string; en: string };
  description: { fr: string; en: string };
  target: number;
  difficulty: ChallengeDifficulty;
  reward: { fr: string; en: string };
  points: number;
  icon: string;
  isStreak: boolean; // Can be reset by self-sabotage
  calculateProgress: (trades: Trade[], journalData?: any) => number;
}

export const CHALLENGE_CATEGORIES = {
  self_control: {
    title: { fr: 'Maîtrise de Soi', en: 'Self Control' },
    description: { fr: 'Anti-Revenge Trading', en: 'Anti-Revenge Trading' },
    icon: 'Brain',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
    borderColor: 'border-blue-500/30',
  },
  risk_management: {
    title: { fr: 'Gestion du Risque', en: 'Risk Management' },
    description: { fr: 'Protection du Capital', en: 'Capital Protection' },
    icon: 'Shield',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/20',
    borderColor: 'border-emerald-500/30',
  },
  analytics: {
    title: { fr: 'Rigueur Analytique', en: 'Analytical Rigor' },
    description: { fr: 'Journaling & Documentation', en: 'Journaling & Documentation' },
    icon: 'BookOpen',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/20',
    borderColor: 'border-amber-500/30',
  },
  psychology: {
    title: { fr: 'Psychologie', en: 'Psychology' },
    description: { fr: 'Mindset & Émotions', en: 'Mindset & Emotions' },
    icon: 'Heart',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20',
    borderColor: 'border-purple-500/30',
  },
};

// Helper functions for challenge calculations
const getTradesByDay = (trades: Trade[]): Record<string, Trade[]> => {
  const byDay: Record<string, Trade[]> = {};
  trades.forEach(trade => {
    const day = format(parseISO(trade.trade_date), 'yyyy-MM-dd');
    if (!byDay[day]) byDay[day] = [];
    byDay[day].push(trade);
  });
  return byDay;
};

const getConsecutiveDaysWithCondition = (
  trades: Trade[],
  condition: (dayTrades: Trade[]) => boolean
): number => {
  const byDay = getTradesByDay(trades);
  const sortedDays = Object.keys(byDay).sort().reverse();
  
  let streak = 0;
  for (const day of sortedDays) {
    if (condition(byDay[day])) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
};

const hasTradeAfterLossWithinHours = (trades: Trade[], hours: number): boolean => {
  const sortedTrades = [...trades].sort(
    (a, b) => parseISO(a.trade_date).getTime() - parseISO(b.trade_date).getTime()
  );
  
  for (let i = 1; i < sortedTrades.length; i++) {
    const prev = sortedTrades[i - 1];
    const curr = sortedTrades[i];
    
    if (prev.result === 'loss') {
      const hoursDiff = differenceInHours(
        parseISO(curr.trade_date),
        parseISO(prev.trade_date)
      );
      
      if (hoursDiff >= 0 && hoursDiff < hours) {
        return true;
      }
    }
  }
  return false;
};

export const DISCIPLINE_CHALLENGE_DEFINITIONS: DisciplineChallengeDefinition[] = [
  // ============================================
  // CATEGORY: SELF CONTROL (Anti-Revenge)
  // ============================================
  {
    id: 'the_patient',
    category: 'self_control',
    title: { fr: 'Le Patient', en: 'The Patient' },
    description: { 
      fr: 'Maximum 2 trades/jour pendant 5 jours consécutifs', 
      en: 'Max 2 trades/day for 5 consecutive days' 
    },
    target: 5,
    difficulty: 'medium',
    reward: { fr: '🧘 Badge Patience', en: '🧘 Patience Badge' },
    points: 75,
    icon: 'Clock',
    isStreak: true,
    calculateProgress: (trades) => {
      return getConsecutiveDaysWithCondition(trades, (dayTrades) => dayTrades.length <= 2);
    }
  },
  {
    id: 'the_stoic',
    category: 'self_control',
    title: { fr: 'Le Stoïque', en: 'The Stoic' },
    description: { 
      fr: 'Après une perte, attendre 2h avant le prochain trade (5 fois)', 
      en: 'After a loss, wait 2h before next trade (5 times)' 
    },
    target: 5,
    difficulty: 'hard',
    reward: { fr: '🏛️ Badge Stoïcisme', en: '🏛️ Stoicism Badge' },
    points: 100,
    icon: 'Timer',
    isStreak: false,
    calculateProgress: (trades) => {
      const sortedTrades = [...trades].sort(
        (a, b) => parseISO(a.trade_date).getTime() - parseISO(b.trade_date).getTime()
      );
      
      let count = 0;
      for (let i = 1; i < sortedTrades.length; i++) {
        const prev = sortedTrades[i - 1];
        const curr = sortedTrades[i];
        
        if (prev.result === 'loss') {
          const hoursDiff = differenceInHours(
            parseISO(curr.trade_date),
            parseISO(prev.trade_date)
          );
          
          if (hoursDiff >= 2) {
            count++;
          }
        }
      }
      return count;
    }
  },
  {
    id: 'session_end',
    category: 'self_control',
    title: { fr: 'Fin de Session', en: 'Session End' },
    description: { 
      fr: 'Clôturer toutes positions avant 21h pendant 7 jours', 
      en: 'Close all positions before 9PM for 7 days' 
    },
    target: 7,
    difficulty: 'medium',
    reward: { fr: '🌙 Badge Discipline Horaire', en: '🌙 Time Discipline Badge' },
    points: 80,
    icon: 'Moon',
    isStreak: true,
    calculateProgress: (trades) => {
      const closedTrades = trades.filter(t => t.exit_timestamp);
      return getConsecutiveDaysWithCondition(closedTrades, (dayTrades) => {
        return dayTrades.every(t => {
          if (!t.exit_timestamp) return true;
          const exitHour = parseISO(t.exit_timestamp).getHours();
          return exitHour < 21;
        });
      });
    }
  },

  // ============================================
  // CATEGORY: RISK MANAGEMENT (Protection)
  // ============================================
  {
    id: 'the_guardian',
    category: 'risk_management',
    title: { fr: 'Le Gardien', en: 'The Guardian' },
    description: { 
      fr: '10 trades consécutifs avec SL respecté', 
      en: '10 consecutive trades with SL respected' 
    },
    target: 10,
    difficulty: 'medium',
    reward: { fr: '🛡️ Badge Protection', en: '🛡️ Protection Badge' },
    points: 100,
    icon: 'ShieldCheck',
    isStreak: true,
    calculateProgress: (trades) => {
      const sortedTrades = [...trades]
        .filter(t => t.result !== 'pending')
        .sort((a, b) => parseISO(b.trade_date).getTime() - parseISO(a.trade_date).getTime());
      
      let streak = 0;
      for (const trade of sortedTrades) {
        if (trade.stop_loss !== null && trade.stop_loss !== undefined) {
          streak++;
        } else {
          break;
        }
      }
      return streak;
    }
  },
  {
    id: 'the_prudent',
    category: 'risk_management',
    title: { fr: 'Le Prudent', en: 'The Prudent' },
    description: { 
      fr: 'Réduire le lot de 50% après 2 pertes consécutives (3 fois)', 
      en: 'Reduce lot by 50% after 2 consecutive losses (3 times)' 
    },
    target: 3,
    difficulty: 'hard',
    reward: { fr: '⚖️ Badge Prudence', en: '⚖️ Prudence Badge' },
    points: 120,
    icon: 'Scale',
    isStreak: false,
    calculateProgress: (trades) => {
      const sortedTrades = [...trades]
        .filter(t => t.result !== 'pending')
        .sort((a, b) => parseISO(a.trade_date).getTime() - parseISO(b.trade_date).getTime());
      
      let count = 0;
      for (let i = 2; i < sortedTrades.length; i++) {
        const prev1 = sortedTrades[i - 2];
        const prev2 = sortedTrades[i - 1];
        const curr = sortedTrades[i];
        
        if (prev1.result === 'loss' && prev2.result === 'loss') {
          if (curr.lot_size <= prev2.lot_size * 0.6) { // 50% reduction with some margin
            count++;
          }
        }
      }
      return count;
    }
  },
  {
    id: 'precise_calculator',
    category: 'risk_management',
    title: { fr: 'Calculateur Précis', en: 'Precise Calculator' },
    description: { 
      fr: 'Utiliser le Risk Amount pour 3 jours consécutifs', 
      en: 'Use Risk Amount for 3 consecutive days' 
    },
    target: 3,
    difficulty: 'easy',
    reward: { fr: '🧮 Badge Calcul', en: '🧮 Calculation Badge' },
    points: 50,
    icon: 'Calculator',
    isStreak: true,
    calculateProgress: (trades) => {
      return getConsecutiveDaysWithCondition(trades, (dayTrades) => {
        return dayTrades.every(t => t.risk_amount !== null && t.risk_amount !== undefined && t.risk_amount > 0);
      });
    }
  },

  // ============================================
  // CATEGORY: ANALYTICS (Journaling)
  // ============================================
  {
    id: 'the_historian',
    category: 'analytics',
    title: { fr: "L'Historien", en: 'The Historian' },
    description: { 
      fr: 'Rédiger notes détaillées (setup + émotion) pour 10 trades', 
      en: 'Write detailed notes (setup + emotion) for 10 trades' 
    },
    target: 10,
    difficulty: 'medium',
    reward: { fr: '📜 Badge Documentation', en: '📜 Documentation Badge' },
    points: 80,
    icon: 'FileText',
    isStreak: false,
    calculateProgress: (trades) => {
      return trades.filter(t => 
        (t.setup || t.custom_setup) && 
        t.emotions && 
        t.notes && t.notes.length >= 10
      ).length;
    }
  },
  {
    id: 'the_specialist',
    category: 'analytics',
    title: { fr: 'Le Spécialiste', en: 'The Specialist' },
    description: { 
      fr: 'Prendre 5 trades avec le même setup spécifique', 
      en: 'Take 5 trades with the same specific setup' 
    },
    target: 5,
    difficulty: 'medium',
    reward: { fr: '🎯 Badge Spécialisation', en: '🎯 Specialization Badge' },
    points: 75,
    icon: 'Crosshair',
    isStreak: false,
    calculateProgress: (trades) => {
      const setupCounts: Record<string, number> = {};
      trades.forEach(t => {
        const setup = t.setup || t.custom_setup;
        if (setup) {
          setupCounts[setup] = (setupCounts[setup] || 0) + 1;
        }
      });
      return Math.max(...Object.values(setupCounts), 0);
    }
  },
  {
    id: 'weekend_analyst',
    category: 'analytics',
    title: { fr: 'Analyste du Week-end', en: 'Weekend Analyst' },
    description: { 
      fr: 'Avoir des trades documentés chaque semaine pendant 4 semaines', 
      en: 'Have documented trades every week for 4 weeks' 
    },
    target: 4,
    difficulty: 'hard',
    reward: { fr: '📊 Badge Analyse', en: '📊 Analysis Badge' },
    points: 100,
    icon: 'BarChart3',
    isStreak: true,
    calculateProgress: (trades) => {
      const documentedTrades = trades.filter(t => 
        (t.setup || t.custom_setup) && t.notes
      );
      
      const weeks = new Set<string>();
      documentedTrades.forEach(t => {
        const weekStart = startOfWeek(parseISO(t.trade_date), { weekStartsOn: 1 });
        weeks.add(format(weekStart, 'yyyy-MM-dd'));
      });
      
      // Count consecutive weeks from most recent
      const sortedWeeks = Array.from(weeks).sort().reverse();
      let consecutiveWeeks = 0;
      const today = new Date();
      
      for (let i = 0; i < sortedWeeks.length; i++) {
        const expectedWeekStart = startOfWeek(subDays(today, i * 7), { weekStartsOn: 1 });
        if (sortedWeeks[i] === format(expectedWeekStart, 'yyyy-MM-dd')) {
          consecutiveWeeks++;
        } else {
          break;
        }
      }
      
      return consecutiveWeeks;
    }
  },

  // ============================================
  // CATEGORY: PSYCHOLOGY (Mindset)
  // ============================================
  {
    id: 'zen_mode',
    category: 'psychology',
    title: { fr: 'Mode Zen', en: 'Zen Mode' },
    description: { 
      fr: "Enregistrer 5 trades avec l'état émotionnel 'Calme'", 
      en: "Record 5 trades with 'Calm' emotional state" 
    },
    target: 5,
    difficulty: 'easy',
    reward: { fr: '☯️ Badge Sérénité', en: '☯️ Serenity Badge' },
    points: 50,
    icon: 'Smile',
    isStreak: false,
    calculateProgress: (trades) => {
      return trades.filter(t => 
        t.emotions && (t.emotions.includes('Calme') || t.emotions.includes('Calm'))
      ).length;
    }
  },
  {
    id: 'emotional_awareness',
    category: 'psychology',
    title: { fr: 'Conscience Émotionnelle', en: 'Emotional Awareness' },
    description: { 
      fr: 'Documenter les émotions sur 15 trades consécutifs', 
      en: 'Document emotions on 15 consecutive trades' 
    },
    target: 15,
    difficulty: 'medium',
    reward: { fr: '💭 Badge Conscience', en: '💭 Awareness Badge' },
    points: 90,
    icon: 'Heart',
    isStreak: true,
    calculateProgress: (trades) => {
      const sortedTrades = [...trades]
        .sort((a, b) => parseISO(b.trade_date).getTime() - parseISO(a.trade_date).getTime());
      
      let streak = 0;
      for (const trade of sortedTrades) {
        if (trade.emotions && trade.emotions.trim().length > 0) {
          streak++;
        } else {
          break;
        }
      }
      return streak;
    }
  },
  {
    id: 'no_tilt',
    category: 'psychology',
    title: { fr: 'Contrôle Total', en: 'Total Control' },
    description: { 
      fr: 'Aucun trade avec émotion négative pendant 7 jours', 
      en: 'No trade with negative emotion for 7 days' 
    },
    target: 7,
    difficulty: 'hard',
    reward: { fr: '🧠 Badge Maîtrise Mentale', en: '🧠 Mental Mastery Badge' },
    points: 120,
    icon: 'Brain',
    isStreak: true,
    calculateProgress: (trades) => {
      const negativeEmotions = ['Stressé', 'Impulsif', 'Frustré', 'Anxieux', 'Fatigué', 'Euphorique', 'Stressed', 'Impulsive', 'Frustrated', 'Anxious', 'Tired', 'Euphoric'];
      
      return getConsecutiveDaysWithCondition(trades, (dayTrades) => {
        return dayTrades.every(t => 
          !t.emotions || !negativeEmotions.some(e => t.emotions?.includes(e))
        );
      });
    }
  },
];

// Updated user levels focused on discipline
export const DISCIPLINE_USER_LEVELS = [
  { level: 1, title: 'Novice', titleEn: 'Novice', minPoints: 0, badge: '🌱' },
  { level: 2, title: 'Apprenti', titleEn: 'Apprentice', minPoints: 100, badge: '📚' },
  { level: 3, title: 'Pratiquant', titleEn: 'Practitioner', minPoints: 250, badge: '🎯' },
  { level: 4, title: 'Discipliné', titleEn: 'Disciplined', minPoints: 500, badge: '⚡' },
  { level: 5, title: 'Trader Discipliné', titleEn: 'Disciplined Trader', minPoints: 800, badge: '🛡️' },
  { level: 6, title: 'Stratège', titleEn: 'Strategist', minPoints: 1200, badge: '🏅' },
  { level: 7, title: 'Maître', titleEn: 'Master', minPoints: 1800, badge: '⭐' },
  { level: 8, title: 'Expert Mental', titleEn: 'Mental Expert', minPoints: 2500, badge: '🧠' },
  { level: 9, title: 'Sage du Trading', titleEn: 'Trading Sage', minPoints: 3500, badge: '🏆' },
  { level: 10, title: 'Maître Psychologue', titleEn: 'Master Psychologist', minPoints: 5000, badge: '👑' },
];

// Reward chests based on discipline streaks
export const DISCIPLINE_REWARD_CHESTS = [
  {
    id: 'chest_discipline_3',
    name: { fr: 'Coffre du Débutant', en: 'Beginner Chest' },
    description: { fr: '3 jours sans faute de plan', en: '3 days without breaking plan' },
    requiredDays: 3,
    rarity: 'common' as const,
    icon: '📦',
    reward: { type: 'badge' as const, value: 'Disciplined Starter' },
  },
  {
    id: 'chest_discipline_7',
    name: { fr: 'Coffre de Bronze', en: 'Bronze Chest' },
    description: { fr: '7 jours de discipline parfaite', en: '7 days of perfect discipline' },
    requiredDays: 7,
    rarity: 'rare' as const,
    icon: '🥉',
    reward: { type: 'points' as const, value: 100 },
  },
  {
    id: 'chest_discipline_14',
    name: { fr: "Coffre d'Argent", en: 'Silver Chest' },
    description: { fr: '14 jours sans auto-sabotage', en: '14 days without self-sabotage' },
    requiredDays: 14,
    rarity: 'rare' as const,
    icon: '🥈',
    reward: { type: 'badge' as const, value: 'Consistent Trader' },
  },
  {
    id: 'chest_discipline_21',
    name: { fr: "Coffre d'Or", en: 'Gold Chest' },
    description: { fr: '21 jours de maîtrise totale', en: '21 days of total mastery' },
    requiredDays: 21,
    rarity: 'epic' as const,
    icon: '🥇',
    reward: { type: 'points' as const, value: 300 },
  },
  {
    id: 'chest_discipline_30',
    name: { fr: 'Coffre Épique', en: 'Epic Chest' },
    description: { fr: '30 jours - Un mois de discipline', en: '30 days - A month of discipline' },
    requiredDays: 30,
    rarity: 'epic' as const,
    icon: '💎',
    reward: { type: 'title' as const, value: 'Master of Discipline' },
  },
  {
    id: 'chest_discipline_60',
    name: { fr: 'Coffre Légendaire', en: 'Legendary Chest' },
    description: { fr: '60 jours - Légende vivante', en: '60 days - Living legend' },
    requiredDays: 60,
    rarity: 'legendary' as const,
    icon: '👑',
    reward: { type: 'badge' as const, value: 'Trading Legend' },
  },
];

export const RARITY_COLORS = {
  common: {
    bg: 'bg-zinc-500/20',
    border: 'border-zinc-500/30',
    text: 'text-zinc-400',
    glow: '',
  },
  rare: {
    bg: 'bg-blue-500/20',
    border: 'border-blue-500/30',
    text: 'text-blue-400',
    glow: 'shadow-blue-500/20',
  },
  epic: {
    bg: 'bg-purple-500/20',
    border: 'border-purple-500/30',
    text: 'text-purple-400',
    glow: 'shadow-purple-500/20 shadow-lg',
  },
  legendary: {
    bg: 'bg-amber-500/20',
    border: 'border-amber-500/30',
    text: 'text-amber-400',
    glow: 'shadow-amber-500/30 shadow-xl animate-pulse-neon',
  },
};
