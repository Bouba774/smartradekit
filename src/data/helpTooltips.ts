// Tooltips d'aide contextuelle pour Smart Trade Tracker
// Toutes les définitions sont en français

export interface TooltipDefinition {
  text: string;
}

// === DONNÉES D'UN TRADE (FORMULAIRE) ===
export const tradeFormTooltips = {
  instrument: "Actif tradé (Forex, crypto, indices, matières premières).",
  direction: "Achat (Buy) ou vente (Sell).",
  dateTime: "Moment réel où le trade a été exécuté sur le marché.",
  entryPrice: "Prix exact auquel la position a été ouverte.",
  exitPrice: "Prix exact auquel la position a été clôturée.",
  stopLoss: "Niveau de prix où la perte est automatiquement coupée.",
  takeProfit: "Niveau de prix où le gain est automatiquement sécurisé.",
  lotSize: "Volume réel de la position sur le marché.",
  riskPercent: "Pourcentage du capital risqué sur ce trade.",
  riskCash: "Montant en devise risqué sur ce trade.",
  pnl: "Résultat final du trade après clôture.",
  rrRatio: "Ratio risque/rendement réel du trade.",
  media: "Preuves ou commentaires liés à ce trade (images, vidéos, audio).",
  setup: "Stratégie ou configuration technique utilisée pour ce trade.",
  timeframe: "Unité de temps du graphique analysé.",
  emotion: "État émotionnel ressenti lors de la prise de position.",
  notes: "Notes personnelles et observations sur le trade.",
  exitMethod: "Méthode utilisée pour clôturer la position (SL, TP, manuel).",
  tags: "Étiquettes pour catégoriser et retrouver facilement le trade.",
  exitDateTime: "Moment réel où le trade a été clôturé.",
  duration: "Durée entre l'ouverture et la fermeture du trade.",
};

// === STATISTIQUES PRINCIPALES ===
export const mainStatsTooltips = {
  totalTrades: "Total des trades enregistrés.",
  winningTrades: "Nombre de trades clôturés en gain.",
  losingTrades: "Nombre de trades clôturés en perte.",
  winrate: "Pourcentage de trades gagnants. Formule : (Trades gagnants / Total trades) × 100",
  breakeven: "Trades clôturés sans gain ni perte.",
  totalProfit: "Somme de tous les gains et pertes.",
  netProfit: "Gain réel après déduction de toutes les pertes.",
  maxDrawdown: "Perte maximale subie sur une période donnée.",
  profitFactor: "Rapport entre gains totaux et pertes totales. Formule : Gains totaux ÷ Pertes totales",
  expectancy: "Gain moyen attendu par trade. Formule : (Win rate × gain moyen) − (Loss rate × perte moyenne)",
  avgRR: "Moyenne des ratios risque/rendement réels.",
  bestProfit: "Gain le plus élevé sur un seul trade.",
  worstLoss: "Perte la plus importante sur un seul trade.",
  avgProfitPerTrade: "Gain moyen par trade gagnant.",
  avgLossPerTrade: "Perte moyenne par trade perdant.",
  avgTradeResult: "Résultat moyen de tous les trades.",
  buyPositions: "Nombre de positions acheteuses (Buy/Long).",
  sellPositions: "Nombre de positions vendeuses (Sell/Short).",
  avgLotSize: "Volume moyen des positions prises.",
  totalLots: "Somme totale des volumes tradés.",
};

// === GESTION DU TEMPS ===
export const timeTooltips = {
  timeInPosition: "Durée entre l'ouverture et la fermeture du trade.",
  avgTimeInPosition: "Durée moyenne de maintien d'un trade.",
  totalTimeInPosition: "Temps cumulé passé en position sur tous les trades.",
  tradesPerDay: "Moyenne du nombre de trades quotidiens.",
};

// === SÉRIES & RISQUE ===
export const streaksTooltips = {
  maxWinStreak: "Plus longue série de trades gagnants consécutifs.",
  maxLossStreak: "Plus longue série de trades perdants consécutifs.",
  currentStreak: "Série actuelle de trades (gagnants ou perdants).",
};

// === ANALYSE PSYCHOLOGIQUE ===
export const psychologyTooltips = {
  emotionalState: "Ressenti du trader avant, pendant ou après le trade.",
  discipline: "Score basé sur le respect de votre plan de trading (risque, stop loss, stratégie, émotion).",
  emotionalError: "Erreur liée au stress, à la peur ou à la cupidité.",
  confidence: "Niveau de confiance ressenti lors de la prise de position.",
  psychScore: "Indicateur global de votre état mental en trading (confiance, gestion des émotions, régularité).",
  selfSabotage: "Comportements autodestructeurs détectés (FOMO, revenge trading, overtrading).",
};

// === CALCULATRICES & GESTION DU RISQUE ===
export const calculatorTooltips = {
  capital: "Solde total du compte de trading.",
  riskPerTrade: "Montant maximum accepté en perte sur un trade.",
  riskPercent: "Pourcentage du capital risqué par trade. Recommandé : 1-2%",
  pipValue: "Valeur financière d'un pip pour l'instrument sélectionné.",
  positionSize: "Volume optimal calculé selon le risque défini.",
  slPips: "Distance du Stop Loss en pips.",
  tpPips: "Distance du Take Profit en pips.",
  slValue: "Valeur monétaire de la perte si le SL est touché.",
  tpValue: "Valeur monétaire du gain si le TP est touché.",
  asset: "Instrument financier sélectionné pour le calcul.",
};

// === RAPPORTS ===
export const reportsTooltips = {
  pnlTotal: "Résultat financier total de tous les trades clôturés sur la période sélectionnée.",
  profitNet: "Gain réel après déduction de toutes les pertes. Un profit net positif indique une performance globale rentable.",
  disciplineScore: "Score basé sur le respect de votre plan de trading (risque, stop loss, stratégie, émotion).",
  psychScore: "Indicateur global de votre état mental en trading (confiance, gestion des émotions, régularité).",
  sessionAnalysis: "Analyse de vos performances par session de trading (Londres, New York, Asie, etc.).",
  bestSession: "Session de trading avec les meilleurs résultats.",
  worstSession: "Session de trading avec les moins bons résultats.",
  heatmap: "Visualisation des jours et heures les plus performants.",
  emotionCorrelation: "Analyse du lien entre vos émotions et vos résultats de trading.",
  strategyAnalysis: "Performance de chaque stratégie/setup utilisé.",
};

// === COMPARAISON DE PÉRIODES ===
export const comparisonTooltips = {
  periodA: "Première période sélectionnée pour la comparaison.",
  periodB: "Deuxième période sélectionnée pour la comparaison.",
  totalTransactions: "Nombre de trades sur chaque période.",
  winrateComparison: "Comparaison du pourcentage de trades gagnants entre les périodes.",
  pnlComparison: "Comparaison du résultat financier entre les périodes sélectionnées.",
  disciplineComparison: "Évolution de votre discipline entre deux périodes.",
  radarPerformance: "Visualisation globale de vos forces et faiblesses en trading.",
  summaryComparison: "Synthèse finale des performances entre les deux périodes.",
  avgProfit: "Gain moyen par trade gagnant.",
  avgLoss: "Perte moyenne par trade perdant.",
};

// === INDICATEURS AVANCÉS ===
export const advancedTooltips = {
  sharpeRatio: "Mesure du rendement ajusté au risque. Plus il est élevé, meilleur est le rendement par unité de risque.",
  netIndex: "Performance globale mesurée en valeur absolue.",
  consistency: "Régularité de vos performances au fil du temps.",
  riskManagement: "Qualité de votre gestion du risque (respect des SL, taille de position).",
  volume: "Nombre de trades exécutés sur la période.",
};

// === JAUGES ===
export const gaugeTooltips = {
  winrateGauge: "Probabilité moyenne de réussite de vos trades sur la période.",
  rrGauge: "Ratio risque/rendement moyen réellement obtenu sur vos trades.",
  expectancyGauge: "Gain moyen attendu par trade sur le long terme.",
  profitFactorGauge: "Rapport entre gains totaux et pertes totales. Supérieur à 1.5 = bon, supérieur à 2 = excellent.",
  disciplineGauge: "Score de discipline global basé sur le respect de votre plan.",
};

// === CHALLENGES ===
export const challengeTooltips = {
  currentLevel: "Votre niveau actuel dans le système de progression.",
  totalPoints: "Points totaux accumulés via les challenges.",
  challengeProgress: "Progression vers la complétion du challenge en cours.",
  reward: "Récompense obtenue à la complétion du challenge.",
};

// === JOURNAL ===
export const journalTooltips = {
  dailyObjective: "Objectif que vous vous êtes fixé pour la journée.",
  dailyRating: "Note personnelle de votre journée de trading.",
  lessons: "Leçons apprises et points d'amélioration identifiés.",
  checklist: "Liste des points à vérifier avant de trader.",
};

// Helper function to get tooltip by key
export const getTooltip = (category: string, key: string): string => {
  const tooltipCategories: Record<string, Record<string, string>> = {
    tradeForm: tradeFormTooltips,
    mainStats: mainStatsTooltips,
    time: timeTooltips,
    streaks: streaksTooltips,
    psychology: psychologyTooltips,
    calculator: calculatorTooltips,
    reports: reportsTooltips,
    comparison: comparisonTooltips,
    advanced: advancedTooltips,
    gauge: gaugeTooltips,
    challenge: challengeTooltips,
    journal: journalTooltips,
  };

  return tooltipCategories[category]?.[key] || '';
};
