// Secret challenges that are hidden until unlocked
export interface SecretChallenge {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  unlockCondition: string;
  unlockConditionEn: string;
  target: number;
  points: number;
  reward: string;
  rewardEn: string;
  icon: string;
  rarity: 'rare' | 'epic' | 'legendary';
}

export const SECRET_CHALLENGES: SecretChallenge[] = [
  {
    id: 'secret_perfect_week',
    title: 'Semaine Parfaite',
    titleEn: 'Perfect Week',
    description: '7 jours consécutifs avec 100% de winrate',
    descriptionEn: '7 consecutive days with 100% winrate',
    unlockCondition: 'Atteindre 5 jours avec 100% winrate',
    unlockConditionEn: 'Achieve 5 days with 100% winrate',
    target: 7,
    points: 500,
    reward: '🏆 Titre "Perfectionniste"',
    rewardEn: '🏆 "Perfectionist" Title',
    icon: 'Crown',
    rarity: 'legendary',
  },
  {
    id: 'secret_comeback_king',
    title: 'Roi du Comeback',
    titleEn: 'Comeback King',
    description: 'Récupérer 100% d\'un drawdown de +20%',
    descriptionEn: 'Recover 100% from a 20%+ drawdown',
    unlockCondition: 'Avoir eu un drawdown de +15%',
    unlockConditionEn: 'Have experienced a 15%+ drawdown',
    target: 1,
    points: 400,
    reward: '👑 Badge "Résilient"',
    rewardEn: '👑 "Resilient" Badge',
    icon: 'TrendingUp',
    rarity: 'epic',
  },
  {
    id: 'secret_sniper',
    title: 'Sniper',
    titleEn: 'Sniper',
    description: '10 trades consécutifs avec R > 2',
    descriptionEn: '10 consecutive trades with R > 2',
    unlockCondition: 'Avoir 5 trades avec R > 2',
    unlockConditionEn: 'Have 5 trades with R > 2',
    target: 10,
    points: 350,
    reward: '🎯 Titre "Précision Mortelle"',
    rewardEn: '🎯 "Deadly Precision" Title',
    icon: 'Target',
    rarity: 'epic',
  },
  {
    id: 'secret_zen_master',
    title: 'Maître Zen',
    titleEn: 'Zen Master',
    description: '30 trades consécutifs avec émotion "Calme"',
    descriptionEn: '30 consecutive trades with "Calm" emotion',
    unlockCondition: 'Avoir 15 trades avec émotion "Calme"',
    unlockConditionEn: 'Have 15 trades with "Calm" emotion',
    target: 30,
    points: 450,
    reward: '🧘 Badge "Maîtrise Émotionnelle"',
    rewardEn: '🧘 "Emotional Mastery" Badge',
    icon: 'Brain',
    rarity: 'legendary',
  },
  {
    id: 'secret_diversifier',
    title: 'Diversificateur Expert',
    titleEn: 'Expert Diversifier',
    description: 'Trader profitablement 10 actifs différents',
    descriptionEn: 'Trade 10 different assets profitably',
    unlockCondition: 'Trader 5 actifs différents',
    unlockConditionEn: 'Trade 5 different assets',
    target: 10,
    points: 300,
    reward: '🌐 Titre "Multi-Marchés"',
    rewardEn: '🌐 "Multi-Markets" Title',
    icon: 'Globe',
    rarity: 'rare',
  },
  {
    id: 'secret_discipline_legend',
    title: 'Légende de Discipline',
    titleEn: 'Discipline Legend',
    description: '30 jours consécutifs sans violation de règle',
    descriptionEn: '30 consecutive days without rule violation',
    unlockCondition: 'Avoir 10 jours sans violation',
    unlockConditionEn: 'Have 10 days without violation',
    target: 30,
    points: 600,
    reward: '⚔️ Badge "Discipline de Fer"',
    rewardEn: '⚔️ "Iron Discipline" Badge',
    icon: 'Shield',
    rarity: 'legendary',
  },
  {
    id: 'secret_early_bird',
    title: 'Lève-Tôt Champion',
    titleEn: 'Early Bird Champion',
    description: '20 trades gagnants avant 9h',
    descriptionEn: '20 winning trades before 9AM',
    unlockCondition: 'Avoir 5 trades avant 9h',
    unlockConditionEn: 'Have 5 trades before 9AM',
    target: 20,
    points: 250,
    reward: '🌅 Titre "Chasseur d\'Aube"',
    rewardEn: '🌅 "Dawn Hunter" Title',
    icon: 'Sunrise',
    rarity: 'rare',
  },
  {
    id: 'secret_night_owl',
    title: 'Hibou Nocturne',
    titleEn: 'Night Owl',
    description: '20 trades gagnants après 21h',
    descriptionEn: '20 winning trades after 9PM',
    unlockCondition: 'Avoir 5 trades après 21h',
    unlockConditionEn: 'Have 5 trades after 9PM',
    target: 20,
    points: 250,
    reward: '🦉 Titre "Maître de la Nuit"',
    rewardEn: '🦉 "Night Master" Title',
    icon: 'Moon',
    rarity: 'rare',
  },
];

export const RARITY_COLORS = {
  rare: {
    bg: 'bg-blue-500/20',
    border: 'border-blue-500/50',
    text: 'text-blue-400',
    glow: 'shadow-blue-500/30',
  },
  epic: {
    bg: 'bg-purple-500/20',
    border: 'border-purple-500/50',
    text: 'text-purple-400',
    glow: 'shadow-purple-500/30',
  },
  legendary: {
    bg: 'bg-yellow-500/20',
    border: 'border-yellow-500/50',
    text: 'text-yellow-400',
    glow: 'shadow-yellow-500/30',
  },
};
