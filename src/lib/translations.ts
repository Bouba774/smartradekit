// Complete translation system for Smart Trade Kit
// All UI strings must be defined here for full multilingual support

export type Language = 'en' | 'fr' | 'es' | 'pt' | 'ar' | 'zh' | 'hi' | 'ru' | 'de' | 'ja';

export interface Translations {
  [key: string]: {
    fr: string;
    en: string;
  };
}

export const translations: Translations = {
  // ============================================
  // NAVIGATION
  // ============================================
  home: { fr: 'Accueil', en: 'Home' },
  dashboard: { fr: 'Tableau de Bord', en: 'Dashboard' },
  addTrade: { fr: 'Ajout de Trade', en: 'Add Trade' },
  history: { fr: 'Historique Complet', en: 'Full History' },
  calculator: { fr: 'Calculatrice de Lot', en: 'Lot Calculator' },
  journal: { fr: 'Leçons & Routine', en: 'Lessons & Routine' },
  challenges: { fr: 'Défis', en: 'Challenges' },
  settings: { fr: 'Paramètres', en: 'Settings' },
  profile: { fr: 'Profil', en: 'Profile' },
  reports: { fr: 'Rapports', en: 'Reports' },
  psychology: { fr: 'Analyse Psychologique', en: 'Psychological Analysis' },
  videoJournal: { fr: 'Journal Vidéo/Audio', en: 'Video/Audio Journal' },
  about: { fr: 'À Propos', en: 'About' },
  currencyConversion: { fr: 'Conversion Devises', en: 'Currency Conversion' },

  // ============================================
  // COMMON / GENERAL
  // ============================================
  welcome: { fr: 'Bienvenue', en: 'Welcome' },
  slogan: { fr: 'Créé par un trader pour les traders. ALPHA FX.', en: 'Created by a trader for traders. ALPHA FX.' },
  startTrading: { fr: 'Commencer à Trader', en: 'Start Trading' },
  viewDashboard: { fr: 'Voir le Dashboard', en: 'View Dashboard' },
  save: { fr: 'Enregistrer', en: 'Save' },
  cancel: { fr: 'Annuler', en: 'Cancel' },
  edit: { fr: 'Modifier', en: 'Edit' },
  delete: { fr: 'Supprimer', en: 'Delete' },
  filter: { fr: 'Filtrer', en: 'Filter' },
  search: { fr: 'Rechercher', en: 'Search' },
  noData: { fr: 'Aucune donnée', en: 'No data' },
  loading: { fr: 'Chargement...', en: 'Loading...' },
  error: { fr: 'Erreur', en: 'Error' },
  success: { fr: 'Succès', en: 'Success' },
  level: { fr: 'Niveau', en: 'Level' },
  confirm: { fr: 'Confirmer', en: 'Confirm' },
  back: { fr: 'Retour', en: 'Back' },
  next: { fr: 'Suivant', en: 'Next' },
  previous: { fr: 'Précédent', en: 'Previous' },
  all: { fr: 'Tous', en: 'All' },
  today: { fr: "Aujourd'hui", en: 'Today' },
  thisWeek: { fr: 'Cette semaine', en: 'This week' },
  thisMonth: { fr: 'Ce mois', en: 'This month' },
  thisYear: { fr: 'Cette année', en: 'This year' },
  custom: { fr: 'Personnalisé', en: 'Custom' },
  period: { fr: 'Période', en: 'Period' },
  reset: { fr: 'Réinitialiser', en: 'Reset' },
  select: { fr: 'Sélectionner', en: 'Select' },
  continue: { fr: 'Continuer', en: 'Continue' },
  close: { fr: 'Fermer', en: 'Close' },
  yes: { fr: 'Oui', en: 'Yes' },
  no: { fr: 'Non', en: 'No' },
  or: { fr: 'ou', en: 'or' },
  and: { fr: 'et', en: 'and' },
  of: { fr: 'de', en: 'of' },
  
  // ============================================
  // DASHBOARD - Statistics
  // ============================================
  globalPerformance: { fr: 'Performance Globale', en: 'Global Performance' },
  winrate: { fr: 'Taux de Réussite', en: 'Win Rate' },
  totalPnL: { fr: 'PnL Total', en: 'Total PnL' },
  totalGains: { fr: 'Gains Totaux', en: 'Total Gains' },
  totalLosses: { fr: 'Pertes Totales', en: 'Total Losses' },
  riskReward: { fr: 'Ratio R:R', en: 'R:R Ratio' },
  netProfit: { fr: 'Bénéfice Net', en: 'Net Profit' },
  profitFactor: { fr: 'Facteur de Profit', en: 'Profit Factor' },
  totalTrades: { fr: 'Total Transactions', en: 'Total Trades' },
  winningTrades: { fr: 'Trades Gagnants', en: 'Winning Trades' },
  losingTrades: { fr: 'Trades Perdants', en: 'Losing Trades' },
  buyPositions: { fr: 'Positions Buy', en: 'Buy Positions' },
  sellPositions: { fr: 'Positions Sell', en: 'Sell Positions' },
  breakeven: { fr: 'Break-even', en: 'Break-even' },
  bestProfit: { fr: 'Meilleur Profit', en: 'Best Profit' },
  biggestLoss: { fr: 'Plus Grande Perte', en: 'Biggest Loss' },
  avgProfit: { fr: 'Profit Moyen', en: 'Avg Profit' },
  avgLoss: { fr: 'Perte Moyenne', en: 'Avg Loss' },
  avgTradeSize: { fr: 'Taille Moyenne', en: 'Avg Trade Size' },
  avgDuration: { fr: 'Durée Moyenne', en: 'Avg Duration' },
  discipline: { fr: 'Discipline', en: 'Discipline' },
  emotions: { fr: 'Émotions', en: 'Emotions' },
  riskManagement: { fr: 'Gestion du Risque', en: 'Risk Management' },
  tradeQuality: { fr: 'Qualité des Trades', en: 'Trade Quality' },
  equityCurve: { fr: 'Courbe Equity', en: 'Equity Curve' },
  gainLossChart: { fr: 'Gains/Pertes', en: 'Gains/Losses' },
  heatmap: { fr: 'Heures de Trading', en: 'Trading Hours' },
  monthlyPerformance: { fr: 'Performance Mensuelle', en: 'Monthly Performance' },
  expectancy: { fr: 'Espérance', en: 'Expectancy' },
  winStreak: { fr: 'Série Gagnante', en: 'Win Streak' },
  lossStreak: { fr: 'Série Perdante', en: 'Loss Streak' },
  maxDrawdown: { fr: 'Drawdown Max', en: 'Max Drawdown' },
  totalTime: { fr: 'Temps Total', en: 'Total Time' },
  noDataRecorded: { fr: 'Aucune donnée enregistrée', en: 'No data recorded' },
  startAddingTrades: { fr: 'Commencez à ajouter vos trades', en: 'Start adding your trades' },
  
  // Dashboard section headers
  mainStatistics: { fr: 'Statistiques Principales', en: 'Main Statistics' },
  positions: { fr: 'Positions', en: 'Positions' },
  profitsAndLosses: { fr: 'Profits & Pertes', en: 'Profits & Losses' },
  performanceIndicators: { fr: 'Indicateurs de Performance', en: 'Performance Indicators' },
  streaks: { fr: 'Séries', en: 'Streaks' },
  tradeDuration: { fr: 'Durée des Trades', en: 'Trade Duration' },
  positionDistribution: { fr: 'Répartition des Positions', en: 'Position Distribution' },
  resultsDistribution: { fr: 'Répartition des Résultats', en: 'Results Distribution' },
  performanceRadar: { fr: 'Radar de Performance', en: 'Performance Radar' },
  gaugeIndicators: { fr: 'Indicateurs Jauge', en: 'Gauge Indicators' },
  
  // Dashboard card titles
  totalTransactions: { fr: 'Total Transactions', en: 'Total Transactions' },
  winningTransactions: { fr: 'Trans. Gagnantes', en: 'Winning Trans.' },
  losingTransactions: { fr: 'Trans. Perdantes', en: 'Losing Trans.' },
  victoryRate: { fr: 'Taux de Victoire', en: 'Victory Rate' },
  avgLotSize: { fr: 'Taille Moy. (Lots)', en: 'Avg Size (Lots)' },
  pending: { fr: 'En Attente', en: 'Pending' },
  worstLoss: { fr: 'Pire Perte', en: 'Worst Loss' },
  avgProfitPerTrade: { fr: 'Profit Moyen', en: 'Avg Profit' },
  avgLossPerTrade: { fr: 'Perte Moyenne', en: 'Avg Loss' },
  totalProfit: { fr: 'Profit Total', en: 'Total Profit' },
  totalLoss: { fr: 'Perte Totale', en: 'Total Loss' },
  profitFactorLabel: { fr: 'Facteur Profit', en: 'Profit Factor' },
  avgRiskReward: { fr: 'R:R Moyen', en: 'Avg R:R' },
  avgTradeResult: { fr: 'Résultat Moyen', en: 'Avg Result' },
  maxWinStreak: { fr: 'Série Gagnante Max', en: 'Max Win Streak' },
  maxLossStreak: { fr: 'Série Perdante Max', en: 'Max Loss Streak' },
  avgTradeDuration: { fr: 'Durée Moyenne', en: 'Average Duration' },
  totalTimeInPosition: { fr: 'Temps Total en Position', en: 'Total Time in Position' },
  noDataYet: { fr: '📊 Aucune donnée enregistrée pour le moment. Ajoutez vos premiers trades pour voir vos statistiques.', en: '📊 No data recorded yet. Add your first trades to see your statistics.' },
  capital: { fr: 'Capital', en: 'Capital' },
  winners: { fr: 'Gagnants', en: 'Winners' },
  losers: { fr: 'Perdants', en: 'Losers' },
  consistency: { fr: 'Consistance', en: 'Consistency' },
  longPositions: { fr: 'Long', en: 'Long' },
  shortPositions: { fr: 'Short', en: 'Short' },
  streak: { fr: 'Série', en: 'Streak' },
  overview: { fr: "Vue d'ensemble", en: 'Overview' },
  keyIndicators: { fr: 'Indicateurs Clés', en: 'Key Indicators' },
  securityIndicator: { fr: 'Sécurité', en: 'Security' },
  resultsLabel: { fr: 'Résultats', en: 'Results' },
  
  // ============================================
  // TRADE FORM
  // ============================================
  asset: { fr: 'Actif', en: 'Asset' },
  direction: { fr: 'Direction', en: 'Direction' },
  buy: { fr: 'Acheter', en: 'Buy' },
  sell: { fr: 'Vendre', en: 'Sell' },
  entryPrice: { fr: "Prix d'Entrée", en: 'Entry Price' },
  exitPrice: { fr: 'Prix de Sortie', en: 'Exit Price' },
  stopLoss: { fr: 'Stop Loss', en: 'Stop Loss' },
  takeProfit: { fr: 'Take Profit', en: 'Take Profit' },
  lotSize: { fr: 'Taille du Lot', en: 'Lot Size' },
  pnl: { fr: 'PnL', en: 'PnL' },
  risk: { fr: 'Risque', en: 'Risk' },
  setup: { fr: 'Setup', en: 'Setup' },
  timeframe: { fr: 'Timeframe', en: 'Timeframe' },
  emotion: { fr: 'Émotion', en: 'Emotion' },
  notes: { fr: 'Notes', en: 'Notes' },
  tags: { fr: 'Tags', en: 'Tags' },
  images: { fr: 'Images', en: 'Images' },
  saveTrade: { fr: 'Enregistrer le Trade', en: 'Save Trade' },
  dateTime: { fr: 'Date & Heure', en: 'Date & Time' },
  
  // Emotions
  calm: { fr: 'Calme', en: 'Calm' },
  stressed: { fr: 'Stressé', en: 'Stressed' },
  confident: { fr: 'Confiant', en: 'Confident' },
  impulsive: { fr: 'Impulsif', en: 'Impulsive' },
  fearful: { fr: 'Craintif', en: 'Fearful' },
  greedy: { fr: 'Avide', en: 'Greedy' },
  patient: { fr: 'Patient', en: 'Patient' },
  focused: { fr: 'Concentré', en: 'Focused' },
  euphoric: { fr: 'Euphorique', en: 'Euphoric' },
  tired: { fr: 'Fatigué', en: 'Tired' },
  frustrated: { fr: 'Frustré', en: 'Frustrated' },
  anxious: { fr: 'Anxieux', en: 'Anxious' },
  neutral: { fr: 'Neutre', en: 'Neutral' },
  
  // Trade form sections
  basicInformation: { fr: 'Informations de Base', en: 'Basic Information' },
  assetSelection: { fr: "Sélection de l'Actif", en: 'Asset Selection' },
  tradeDetails: { fr: 'Détails du Trade', en: 'Trade Details' },
  exitDetails: { fr: 'Détails de Sortie', en: 'Exit Details' },
  setupAndTimeframe: { fr: 'Setup & Timeframe', en: 'Setup & Timeframe' },
  emotionAndNotes: { fr: 'Émotion & Notes', en: 'Emotion & Notes' },
  tagsAndImages: { fr: 'Tags & Images', en: 'Tags & Images' },
  hour: { fr: 'Heure', en: 'Time' },
  searchAsset: { fr: 'Rechercher un actif...', en: 'Search asset...' },
  selectAsset: { fr: 'Sélectionner un actif', en: 'Select an asset' },
  customAsset: { fr: 'Ou saisir un actif personnalisé', en: 'Or enter custom asset' },
  registerNewTrade: { fr: 'Enregistrez votre nouveau trade avec tous les détails', en: 'Record your new trade with all details' },
  exitDate: { fr: 'Date de Sortie', en: 'Exit Date' },
  exitMethod: { fr: 'Méthode de Sortie', en: 'Exit Method' },
  manual: { fr: 'Manuel', en: 'Manual' },
  customSetup: { fr: 'Setup personnalisé', en: 'Custom setup' },
  customTimeframe: { fr: 'Timeframe personnalisé', en: 'Custom timeframe' },
  selectTags: { fr: 'Sélectionner des tags', en: 'Select tags' },
  addImages: { fr: 'Ajouter des images', en: 'Add images' },
  maxImages: { fr: 'Maximum 4 images', en: 'Maximum 4 images' },
  tradeRegistered: { fr: 'Trade enregistré avec succès!', en: 'Trade registered successfully!' },
  errorSavingTrade: { fr: "Erreur lors de l'enregistrement du trade", en: 'Error saving trade' },
  score: { fr: 'Score', en: 'Score' },
  exitPriceCantBeNegative: { fr: 'Le prix de sortie ne peut pas être négatif', en: 'Exit price cannot be negative' },

  // ============================================
  // CALCULATOR
  // ============================================
  riskPercent: { fr: 'Risque (%)', en: 'Risk (%)' },
  riskAmount: { fr: 'Montant du Risque', en: 'Risk Amount' },
  slPoints: { fr: 'SL en Points', en: 'SL in Points' },
  tpPoints: { fr: 'TP en Points', en: 'TP in Points' },
  calculatedLot: { fr: 'Taille de Lot Calculée', en: 'Calculated Lot Size' },
  calculate: { fr: 'Calculer', en: 'Calculate' },
  sendToTrade: { fr: 'Envoyer vers Ajout de Trade', en: 'Send to Add Trade' },
  dataSentToTrade: { fr: 'Données envoyées vers l\'ajout de trade', en: 'Data sent to add trade' },

  // ============================================
  // SETTINGS
  // ============================================
  theme: { fr: 'Thème', en: 'Theme' },
  dark: { fr: 'Sombre', en: 'Dark' },
  light: { fr: 'Clair', en: 'Light' },
  language: { fr: 'Langue', en: 'Language' },
  vibration: { fr: 'Vibration', en: 'Vibration' },
  notifications: { fr: 'Notifications', en: 'Notifications' },
  journalReminder: { fr: 'Rappel Journal', en: 'Journal Reminder' },
  weeklyReport: { fr: 'Bilan Hebdomadaire', en: 'Weekly Report' },
  overtradingAlert: { fr: 'Alerte Surtrading', en: 'Overtrading Alert' },
  exportData: { fr: 'Exporter les Données', en: 'Export Data' },
  logout: { fr: 'Se Déconnecter', en: 'Logout' },
  deleteAccount: { fr: 'Supprimer le Compte', en: 'Delete Account' },
  displayMode: { fr: "Mode d'affichage", en: 'Display Mode' },
  primaryColor: { fr: 'Couleur principale', en: 'Primary Color' },
  fontSize: { fr: 'Taille de police', en: 'Font Size' },
  sounds: { fr: 'Sons', en: 'Sounds' },
  animations: { fr: 'Animations', en: 'Animations' },
  background: { fr: "Fond d'écran", en: 'Background' },
  resetDisplay: { fr: "Réinitialiser l'affichage", en: 'Reset display' },
  settingUpdated: { fr: 'Paramètre mis à jour', en: 'Setting updated' },
  colorUpdated: { fr: 'Couleur mise à jour', en: 'Color updated' },
  interfaceReset: { fr: 'Interface réinitialisée', en: 'Interface reset' },
  mainCurrency: { fr: 'Devise Principale', en: 'Main Currency' },
  selectCurrency: { fr: 'Sélectionner une devise', en: 'Select currency' },
  currencyConversionNote: { fr: 'Toutes les valeurs seront converties automatiquement avec les taux de change actuels', en: 'All values will be automatically converted using current exchange rates' },
  customizeExperience: { fr: 'Personnalisez votre expérience', en: 'Customize your experience' },
  options: { fr: 'Options', en: 'Options' },
  small: { fr: 'Petite', en: 'Small' },
  standard: { fr: 'Standard', en: 'Standard' },
  large: { fr: 'Grande', en: 'Large' },
  defaultBg: { fr: 'Par défaut', en: 'Default' },
  gradient: { fr: 'Gradient', en: 'Gradient' },
  solidDark: { fr: 'Sombre uni', en: 'Solid dark' },
  solidLight: { fr: 'Clair uni', en: 'Solid light' },
  blue: { fr: 'Bleu', en: 'Blue' },
  green: { fr: 'Vert', en: 'Green' },
  red: { fr: 'Rouge', en: 'Red' },
  purple: { fr: 'Violet', en: 'Purple' },
  orange: { fr: 'Orange', en: 'Orange' },
  cyan: { fr: 'Cyan', en: 'Cyan' },

  // ============================================
  // PROFILE
  // ============================================
  myProfile: { fr: 'Mon Profil', en: 'My Profile' },
  manageAccount: { fr: 'Gérez votre compte', en: 'Manage your account' },
  titleLevel: { fr: 'Titre & Niveau', en: 'Title & Level' },
  points: { fr: 'points', en: 'points' },
  actions: { fr: 'Actions', en: 'Actions' },
  changePhoto: { fr: 'Changer la photo', en: 'Change photo' },
  uploading: { fr: 'Téléchargement...', en: 'Uploading...' },
  signOut: { fr: 'Se déconnecter', en: 'Sign out' },
  dangerZone: { fr: 'Zone de danger', en: 'Danger Zone' },
  deleteAllData: { fr: 'Supprimer toutes mes données', en: 'Delete all my data' },
  deleteAccountPermanently: { fr: 'Supprimer définitivement le compte', en: 'Permanently delete account' },
  deleteDataConfirm: { fr: 'Supprimer toutes les données?', en: 'Delete all data?' },
  deleteDataDesc: { fr: 'Cette action supprimera tous vos trades, journaux, routines, vidéos, analyses psychologiques et défis. Votre compte restera actif. Cette action est irréversible.', en: 'This will delete all your trades, journals, routines, videos, psychological analyses and challenges. Your account will remain active. This action is irreversible.' },
  deleteAccountConfirm: { fr: 'Supprimer le compte?', en: 'Delete account?' },
  deleteAccountDesc: { fr: 'Cette action supprimera définitivement votre compte et toutes vos données. Vous ne pourrez plus vous connecter. Cette action est irréversible!', en: 'This will permanently delete your account and all your data. You will no longer be able to sign in. This action is irreversible!' },
  deleteAll: { fr: 'Supprimer tout', en: 'Delete all' },
  dataDeleted: { fr: 'Toutes vos données ont été supprimées', en: 'All your data has been deleted' },
  accountDeleted: { fr: 'Compte supprimé. Au revoir!', en: 'Account deleted. Goodbye!' },
  exportJSON: { fr: 'Exporter en JSON', en: 'Export as JSON' },
  exportCSV: { fr: 'Exporter en CSV', en: 'Export as CSV' },
  exportPDF: { fr: 'Exporter en PDF', en: 'Export as PDF' },
  exportSuccess: { fr: 'Données exportées avec succès', en: 'Data exported successfully' },
  exportError: { fr: "Erreur lors de l'exportation", en: 'Export error' },
  noDataToExport: { fr: 'Aucune donnée à exporter', en: 'No data to export' },
  nicknameCantBeEmpty: { fr: 'Le pseudo ne peut pas être vide', en: 'Nickname cannot be empty' },
  nicknameUpdated: { fr: 'Pseudo mis à jour!', en: 'Nickname updated!' },
  updateError: { fr: 'Erreur lors de la mise à jour', en: 'Update error' },

  // ============================================
  // JOURNAL
  // ============================================
  selectDate: { fr: 'Sélectionner une date', en: 'Select a date' },
  preMarketChecklist: { fr: 'Check-list Pré-Marché', en: 'Pre-Market Checklist' },
  completed: { fr: 'complété', en: 'completed' },
  todaysObjectives: { fr: 'Objectifs du Jour', en: "Today's Objectives" },
  lessonsLearned: { fr: 'Leçons Apprises', en: 'Lessons Learned' },
  commonMistakes: { fr: 'Erreurs Récurrentes', en: 'Common Mistakes' },
  strengths: { fr: 'Points Forts', en: 'Strengths' },
  dayRating: { fr: 'Évaluation de la Journée', en: 'Day Rating' },
  saveJournal: { fr: 'Enregistrer le journal', en: 'Save journal' },
  journalSaved: { fr: 'Journal enregistré!', en: 'Journal saved!' },
  mustBeLoggedIn: { fr: 'Vous devez être connecté', en: 'You must be logged in' },
  addItem: { fr: 'Ajouter un élément', en: 'Add item' },
  newItem: { fr: 'Nouvel élément...', en: 'New item...' },
  labelEmpty: { fr: 'Le libellé ne peut pas être vide', en: 'Label cannot be empty' },
  dailyRoutine: { fr: 'Routine quotidienne et leçons apprises', en: 'Daily routine and lessons learned' },
  reviewPastData: { fr: 'Revoir les données passées', en: 'Review past data' },
  objectivesPlaceholder: { fr: "Quels sont vos objectifs pour aujourd'hui?\n- Max 3 trades\n- Risque max 2%\n- Respecter le plan...", en: "What are your goals for today?\n- Max 3 trades\n- Max 2% risk\n- Follow the plan..." },
  lessonsPlaceholder: { fr: "Qu'avez-vous appris aujourd'hui?\n- La patience paie\n- Ne pas entrer trop tôt...", en: "What did you learn today?\n- Patience pays off\n- Don't enter too early..." },
  mistakesPlaceholder: { fr: "Quelles erreurs éviter?\n- FOMO sur les breakouts\n- Trading pendant les news...", en: "What mistakes to avoid?\n- FOMO on breakouts\n- Trading during news..." },
  strengthsPlaceholder: { fr: "Vos forces de la journée?\n- Bon timing d'entrée\n- Patience sur les positions...", en: "Your strengths today?\n- Good entry timing\n- Patience on positions..." },
  howWasYourDay: { fr: 'Comment évaluez-vous votre journée?', en: 'How do you rate your day?' },
  journalSaveError: { fr: "Erreur lors de l'enregistrement", en: 'Error saving' },

  // ============================================
  // VIDEO JOURNAL
  // ============================================
  videoAudioJournal: { fr: 'Journal Vidéo/Audio', en: 'Video/Audio Journal' },
  recordFeelings: { fr: 'Enregistrez votre ressenti du jour (max 60s)', en: 'Record your daily feelings (max 60s)' },
  newRecording: { fr: 'Nouvel Enregistrement', en: 'New Recording' },
  recordVideo: { fr: 'Enregistrer Vidéo', en: 'Record Video' },
  recordAudio: { fr: 'Enregistrer Audio', en: 'Record Audio' },
  stop: { fr: 'Arrêter', en: 'Stop' },
  switchCamera: { fr: 'Changer Caméra', en: 'Switch Camera' },
  frontCamera: { fr: 'Avant', en: 'Front' },
  backCamera: { fr: 'Arrière', en: 'Back' },
  freeNote: { fr: 'Note libre (optionnelle)', en: 'Free note (optional)' },
  addNote: { fr: 'Ajoutez une note à cet enregistrement...', en: 'Add a note to this recording...' },
  recordingSaved: { fr: 'Enregistrement sauvegardé!', en: 'Recording saved!' },
  recordingDeleted: { fr: 'Enregistrement supprimé', en: 'Recording deleted' },
  cameraError: { fr: "Erreur d'accès à la caméra/micro. Veuillez autoriser l'accès.", en: 'Error accessing camera/microphone. Please allow access.' },
  fileNotAvailable: { fr: 'Fichier non disponible (session expirée)', en: 'File not available (session expired)' },
  myRecordings: { fr: 'Mes Enregistrements', en: 'My Recordings' },
  noRecordings: { fr: 'Aucun enregistrement', en: 'No recordings' },
  startRecording: { fr: 'Commencez à enregistrer', en: 'Start recording' },
  noteUpdated: { fr: 'Note mise à jour', en: 'Note updated' },

  // ============================================
  // LEVELS
  // ============================================
  beginner: { fr: 'Débutant', en: 'Beginner' },
  intermediate: { fr: 'Intermédiaire', en: 'Intermediate' },
  analyst: { fr: 'Analyste', en: 'Analyst' },
  pro: { fr: 'Pro', en: 'Pro' },
  expert: { fr: 'Expert', en: 'Expert' },
  legend: { fr: 'Légende', en: 'Legend' },

  // ============================================
  // CHALLENGES
  // ============================================
  challengesTitle: { fr: 'Défis', en: 'Challenges' },
  challengesDesc: { fr: 'Relevez des défis pour progresser', en: 'Complete challenges to progress' },
  takeOnChallenges: { fr: 'Relevez des défis et montez en niveau', en: 'Take on challenges and level up' },
  challengesCompleted: { fr: 'défis complétés', en: 'challenges completed' },
  pointsRemaining: { fr: 'points restants', en: 'points remaining' },
  completedLabel: { fr: 'Complétés', en: 'Completed' },
  inProgress: { fr: 'En cours', en: 'In Progress' },
  progress: { fr: 'Progression', en: 'Progress' },
  reward: { fr: 'Récompense', en: 'Reward' },
  levelProgression: { fr: 'Progression des Niveaux', en: 'Level Progression' },
  congratulations: { fr: 'Bravo!', en: 'Congratulations!' },
  youHaveCompleted: { fr: 'Vous avez complété', en: 'You have completed' },
  easy: { fr: 'Facile', en: 'Easy' },
  medium: { fr: 'Moyen', en: 'Medium' },
  hard: { fr: 'Difficile', en: 'Hard' },
  expertDifficulty: { fr: 'Expert', en: 'Expert' },

  // ============================================
  // REPORTS
  // ============================================
  reportsTitle: { fr: 'Rapports', en: 'Reports' },
  reportsDesc: { fr: 'Analysez vos performances', en: 'Analyze your performance' },
  performanceAnalysis: { fr: 'Analyse de vos performances', en: 'Performance analysis' },
  week: { fr: 'Semaine', en: 'Week' },
  month: { fr: 'Mois', en: 'Month' },
  dailyPnL: { fr: 'PnL Journalier', en: 'Daily PnL' },
  emotionDistribution: { fr: 'Répartition Émotionnelle', en: 'Emotion Distribution' },
  monthlyEvolution: { fr: 'Évolution Mensuelle', en: 'Monthly Evolution' },
  bestSetup: { fr: 'Meilleur Setup', en: 'Best Setup' },
  bestAsset: { fr: 'Meilleur Actif', en: 'Best Asset' },
  dominantEmotion: { fr: 'Émotion Dominante', en: 'Dominant Emotion' },
  bestDayLabel: { fr: 'Meilleur Jour', en: 'Best Day' },
  worstDayLabel: { fr: 'Pire Jour', en: 'Worst Day' },
  noTradesInPeriod: { fr: 'Pas de trades sur cette période', en: 'No trades in this period' },
  addTradesToSeeReports: { fr: 'Ajoutez des trades pour voir vos rapports de performance', en: 'Add trades to see your performance reports' },

  // ============================================
  // PSYCHOLOGY / ANALYSIS
  // ============================================
  psychologyTitle: { fr: 'Analyse Psychologique', en: 'Psychological Analysis' },
  psychologyDesc: { fr: 'Comprendre vos émotions et comportements', en: 'Understand your emotions and behaviors' },
  emotionalTrends: { fr: 'Tendances Émotionnelles', en: 'Emotional Trends' },
  tradingPatterns: { fr: 'Patterns de Trading', en: 'Trading Patterns' },
  behaviorAnalysis: { fr: 'Analyse Comportementale', en: 'Behavior Analysis' },
  addEmotionData: { fr: 'Ajoutez des données émotionnelles pour voir votre analyse', en: 'Add emotion data to see your analysis' },

  // ============================================
  // HISTORY
  // ============================================
  historyTitle: { fr: 'Historique Complet', en: 'Full History' },
  findAllTrades: { fr: 'Retrouvez tous vos trades passés', en: 'Find all your past trades' },
  trades: { fr: 'trades', en: 'trades' },
  noTradeFound: { fr: 'Aucun trade trouvé', en: 'No trade found' },
  startRecordingTrades: { fr: 'Commencez à enregistrer vos trades pour les voir ici', en: 'Start recording your trades to see them here' },
  tryModifyingFilters: { fr: 'Essayez de modifier vos filtres', en: 'Try modifying your filters' },
  resetFilters: { fr: 'Réinitialiser les filtres', en: 'Reset filters' },
  long: { fr: 'Long', en: 'Long' },
  short: { fr: 'Short', en: 'Short' },
  win: { fr: 'Gain', en: 'Win' },
  loss: { fr: 'Perte', en: 'Loss' },
  inProgressTrade: { fr: 'En cours', en: 'In progress' },
  lots: { fr: 'lots', en: 'lots' },
  startDate: { fr: 'Date début', en: 'Start date' },
  endDate: { fr: 'Date fin', en: 'End date' },
  sortBy: { fr: 'Trier par', en: 'Sort by' },
  date: { fr: 'Date', en: 'Date' },
  result: { fr: 'Résultat', en: 'Result' },
  tradeDeleted: { fr: 'Trade supprimé', en: 'Trade deleted' },
  deleteTradeConfirm: { fr: 'Êtes-vous sûr de vouloir supprimer ce trade?', en: 'Are you sure you want to delete this trade?' },
  deleteError: { fr: 'Erreur lors de la suppression', en: 'Error deleting' },

  // ============================================
  // AUTH
  // ============================================
  signIn: { fr: 'Se connecter', en: 'Sign In' },
  signUp: { fr: "S'inscrire", en: 'Sign Up' },
  email: { fr: 'Email', en: 'Email' },
  password: { fr: 'Mot de passe', en: 'Password' },
  nickname: { fr: 'Pseudo', en: 'Nickname' },
  chooseNickname: { fr: 'Choisissez un pseudo', en: 'Choose a nickname' },
  yourEmail: { fr: 'Votre email', en: 'Your email' },
  yourPassword: { fr: 'Votre mot de passe', en: 'Your password' },
  noAccountYet: { fr: 'Pas encore de compte?', en: "Don't have an account?" },
  alreadyHaveAccount: { fr: 'Déjà un compte?', en: 'Already have an account?' },
  createAccount: { fr: 'Créer un compte', en: 'Create account' },
  loginSuccess: { fr: 'Connexion réussie!', en: 'Login successful!' },
  signupSuccess: { fr: 'Inscription réussie! Vérifiez votre email.', en: 'Sign up successful! Check your email.' },
  authError: { fr: "Erreur d'authentification", en: 'Authentication error' },
  consentMessage: { fr: 'En continuant, vous acceptez nos', en: 'By continuing, you agree to our' },
  privacyRules: { fr: 'règles de confidentialité', en: 'privacy policy' },
  termsOfUse: { fr: "conditions d'utilisation", en: 'terms of use' },
  and_connector: { fr: 'et', en: 'and' },
  welcomeToApp: { fr: 'Bienvenue sur', en: 'Welcome to' },
  tradingJournalDesc: { fr: 'Votre journal de trading intelligent pour améliorer vos performances', en: 'Your smart trading journal to improve your performance' },
  login: { fr: 'Connexion', en: 'Login' },
  yourTraderNickname: { fr: 'Votre pseudo de trader', en: 'Your trader nickname' },
  invalidEmail: { fr: 'Email invalide', en: 'Invalid email' },
  passwordMin6: { fr: 'Le mot de passe doit contenir au moins 6 caractères', en: 'Password must be at least 6 characters' },
  nicknameMin2: { fr: 'Le pseudo doit contenir au moins 2 caractères', en: 'Nickname must be at least 2 characters' },
  invalidCredentials: { fr: 'Email ou mot de passe incorrect', en: 'Invalid email or password' },
  emailAlreadyUsed: { fr: 'Cet email est déjà utilisé', en: 'This email is already registered' },
  accountCreated: { fr: 'Compte créé avec succès!', en: 'Account created successfully!' },
  cameraActivated: { fr: 'Caméra {camera} activée', en: '{camera} camera activated' },
  cameraSelected: { fr: 'Caméra {camera} sélectionnée', en: '{camera} camera selected' },
  cameraSwitchUnavailable: { fr: 'Changement de caméra non disponible', en: 'Camera switch not available' },

  // ============================================
  // AI ASSISTANT
  // ============================================
  aiAssistant: { fr: 'Assistant IA', en: 'AI Assistant' },
  askQuestion: { fr: 'Posez votre question...', en: 'Ask your question...' },
  aiGreeting: { fr: 'Bonjour! 👋', en: 'Hello! 👋' },
  aiIntro: { fr: "Je suis votre assistant IA de trading. Posez-moi des questions sur vos performances, demandez des conseils, ou analysons ensemble vos trades!", en: "I'm your AI trading assistant. Ask me about your performance, get advice, or let's analyze your trades together!" },
  analyzeMyStats: { fr: 'Analyse mes stats', en: 'Analyze my stats' },
  dailyTips: { fr: 'Conseils du jour', en: 'Daily tips' },
  bestSetupQuestion: { fr: 'Meilleur setup?', en: 'Best setup?' },
  connectionError: { fr: 'Erreur de connexion', en: 'Connection error' },
  errorOccurred: { fr: 'Une erreur est survenue.', en: 'An error occurred.' },

  // ============================================
  // LEGAL PAGES
  // ============================================
  privacyPolicy: { fr: 'Politique de Confidentialité', en: 'Privacy Policy' },
  termsOfService: { fr: "Conditions d'Utilisation", en: 'Terms of Use' },
  legalInformation: { fr: 'Informations Légales', en: 'Legal Information' },
  lastUpdated: { fr: 'Dernière mise à jour', en: 'Last updated' },

  // ============================================
  // ABOUT PAGE
  // ============================================
  aboutTitle: { fr: 'À Propos', en: 'About' },
  aboutDesc: { fr: 'En savoir plus sur Smart Trade Kit', en: 'Learn more about Smart Trade Kit' },
  aboutSmartTradeTracker: { fr: 'À Propos de Smart Trade Kit', en: 'About Smart Trade Kit' },
  missionStatement: { fr: 'Notre Mission', en: 'Our Mission' },
  missionDesc: { fr: "Smart Trade Kit a été créé avec un seul objectif : aider les traders à développer la discipline et la clarté dont ils ont besoin pour réussir. Nous croyons que la rentabilité constante vient de la compréhension de votre psychologie, du suivi de vos données et de l'apprentissage de chaque trade. Notre mission est de fournir les outils qui transforment un trading dispersé en un parcours structuré et basé sur les données vers la maîtrise.", en: "Smart Trade Kit was created with one purpose: to help traders develop the discipline and clarity they need to succeed. We believe that consistent profitability comes from understanding your psychology, tracking your data, and learning from every trade. Our mission is to provide the tools that turn scattered trading into a structured, data-driven journey toward mastery." },
  whatIs: { fr: "Qu'est-ce que Smart Trade Kit?", en: 'What is Smart Trade Kit?' },
  whatIsDesc: { fr: "Smart Trade Kit est un journal de trading complet conçu pour vous aider à suivre chaque trade, analyser vos performances et maîtriser vos émotions. Il résout les problèmes les plus courants rencontrés par les traders :", en: "Smart Trade Kit is a comprehensive trading journal designed to help you track every trade, analyze your performance, and master your emotions. It solves the most common problems traders face:" },
  ourVision: { fr: 'Notre Vision', en: 'Our Vision' },
  visionDesc: { fr: "Nous envisageons un monde où chaque trader dispose des outils pour devenir constamment rentable. Notre objectif est de vous aider à prendre des décisions basées sur les données, atteindre l'équilibre psychologique et maîtriser la discipline qui sépare les traders performants des autres. La maîtrise à long terme se construit trade après trade — et nous sommes là pour vous aider à suivre chaque étape de ce parcours.", en: "We envision a world where every trader has the tools to become consistently profitable. Our goal is to help you make data-driven decisions, achieve psychological balance, and master the discipline that separates successful traders from the rest. Long-term mastery is built one trade at a time — and we're here to help you track every step of that journey." },
  keyFeatures: { fr: 'Fonctionnalités Principales', en: 'Key Features' },
  whatMakesUnique: { fr: 'Ce Qui Rend Smart Trade Kit Unique', en: 'What Makes Smart Trade Kit Unique' },
  ourCommitment: { fr: 'Notre Engagement envers les Utilisateurs', en: 'Our Commitment to Users' },
  callToAction: { fr: 'Commencez Votre Parcours Aujourd\'hui', en: 'Start Your Journey Today' },
  callToActionDesc: { fr: "Chaque trader performant suit ses trades. Chaque trader constant connaît ses données. Commencez à enregistrer vos trades aujourd'hui et découvrez le pouvoir de la discipline et du trading basé sur les données.", en: "Every successful trader tracks their trades. Every consistent trader knows their data. Start logging your trades today and discover the power of discipline and data-driven trading." },
  disciplineQuote: { fr: '"La discipline est le pont entre les objectifs et l\'accomplissement."', en: '"Discipline is the bridge between goals and accomplishment."' },
  contactUs: { fr: 'Nous contacter', en: 'Contact us' },
  contact: { fr: 'Contact', en: 'Contact' },
  
  // About page - Problem list
  emotionalTrading: { fr: 'Trading émotionnel', en: 'Emotional trading' },
  emotionalTradingDesc: { fr: 'Comprenez comment vos émotions affectent vos décisions', en: 'Understand how your feelings affect your decisions' },
  inconsistency: { fr: 'Inconsistance', en: 'Inconsistency' },
  inconsistencyDesc: { fr: 'Développez des habitudes avec des routines quotidiennes et des checklists', en: 'Build habits with daily routines and checklists' },
  overtrading: { fr: 'Overtrading', en: 'Overtrading' },
  overtradingDesc: { fr: 'Suivez votre activité et identifiez les patterns nuisibles', en: 'Track your activity and identify harmful patterns' },
  lackOfData: { fr: 'Manque de données', en: 'Lack of data' },
  lackOfDataDesc: { fr: "Chaque trade est enregistré avec tous les détails pour l'analyse", en: 'Every trade is logged with full details for analysis' },
  confusion: { fr: 'Confusion', en: 'Confusion' },
  confusionDesc: { fr: 'Des tableaux de bord clairs montrent exactement où vous en êtes', en: 'Clear dashboards and reports show exactly where you stand' },
  
  // About page - Features
  featureDashboard: { fr: 'Tableau de Bord', en: 'Dashboard' },
  featureDashboardDesc: { fr: 'Vue complète de vos performances de trading avec statistiques en temps réel et graphiques visuels.', en: 'Complete overview of your trading performance with real-time statistics and visual charts.' },
  featureTradeEntry: { fr: 'Saisie de Trade & Historique Complet', en: 'Trade Entry & Full History' },
  featureTradeEntryDesc: { fr: 'Enregistrez chaque trade avec des informations détaillées et consultez votre historique complet à tout moment.', en: 'Log every trade with detailed information and review your complete trading history anytime.' },
  featureReports: { fr: 'Rapports & Analytics Avancés', en: 'Advanced Reports & Analytics' },
  featureReportsDesc: { fr: 'Analyses approfondies de vos performances avec courbes equity, taux de réussite et filtrage par date.', en: 'Deep insights into your performance with equity curves, win rates, and custom date filtering.' },
  featureEmotional: { fr: 'Analyse Émotionnelle Hebdomadaire', en: 'Weekly Emotional Analysis' },
  featureEmotionalDesc: { fr: 'Suivez vos états émotionnels et comprenez leur impact sur vos décisions de trading.', en: 'Track your emotional states and understand how they impact your trading decisions.' },
  featurePsychology: { fr: 'Outils Psychologiques', en: 'Psychological Tools' },
  featurePsychologyDesc: { fr: 'Identifiez les patterns dans votre comportement pour surmonter la peur, la cupidité et le trading impulsif.', en: 'Identify patterns in your behavior to overcome fear, greed, and impulsive trading.' },
  featureVideoJournal: { fr: 'Journal Vidéo/Audio de Trading', en: 'Video/Audio Trading Journal' },
  featureVideoJournalDesc: { fr: 'Enregistrez jusqu\'à 60 secondes de vidéo ou audio pour capturer vos pensées et analyses du marché.', en: 'Record up to 60 seconds of video or audio to capture your thoughts and market analysis.' },
  featureLessons: { fr: 'Leçons & Routine Quotidienne', en: 'Lessons & Daily Routine' },
  featureLessonsDesc: { fr: 'Checklists pré-marché, objectifs quotidiens et suivi des leçons pour développer des habitudes constantes.', en: 'Pre-market checklists, daily objectives, and lesson tracking to build consistent habits.' },
  featureChallenges: { fr: 'Défis & Gamification', en: 'Challenges & Gamification' },
  featureChallengesDesc: { fr: 'Progressez à travers les niveaux de Débutant à Légende en relevant des défis de trading.', en: 'Progress through levels from Beginner to Legend by completing trading challenges.' },
  featureCalculator: { fr: 'Calculatrice de Lot', en: 'Lot Size Calculator' },
  featureCalculatorDesc: { fr: 'Calculez les tailles de position optimales pour Forex, Crypto, Indices et Métaux avec précision.', en: 'Calculate optimal position sizes for Forex, Crypto, Indices, and Metals with precision.' },
  featureAI: { fr: 'Assistant IA 24/7', en: 'AI Assistant 24/7' },
  featureAIDesc: { fr: 'Obtenez des insights et analyses personnalisés d\'une IA qui connaît vos données de trading.', en: 'Get personalized trading insights and analysis from an AI that knows your trading data.' },
  
  // About page - Unique features
  allInOneSystem: { fr: 'Système Tout-en-Un', en: 'All-in-One System' },
  allInOneDesc: { fr: 'Tout ce dont vous avez besoin pour suivre, analyser et améliorer votre trading en un seul endroit.', en: 'Everything you need to track, analyze, and improve your trading in one place.' },
  autoCurrencyConversion: { fr: 'Conversion de Devise Automatique', en: 'Automatic Currency Conversion' },
  autoCurrencyDesc: { fr: 'Taux de change en temps réel pour USD, EUR, GBP, JPY, XAF et XOF.', en: 'Real-time exchange rates for USD, EUR, GBP, JPY, XAF, and XOF.' },
  cleanUX: { fr: 'UX Claire & Intuitive', en: 'Clean & Intuitive UX' },
  cleanUXDesc: { fr: 'Design moderne optimisé pour le trading mobile en déplacement.', en: 'Modern design optimized for mobile-first trading on the go.' },
  deepPsychology: { fr: 'Intégration Psychologique Profonde', en: 'Deep Psychological Integration' },
  deepPsychologyDesc: { fr: 'Suivi émotionnel intégré à chaque aspect de votre journal de trading.', en: 'Emotional tracking woven into every aspect of your trading journal.' },
  builtForDiscipline: { fr: 'Conçu pour la Vraie Discipline', en: 'Built for Real Discipline' },
  builtForDisciplineDesc: { fr: 'Outils conçus par un trader pour renforcer discipline et constance.', en: 'Tools designed by a trader to enforce discipline and consistency.' },
  
  // About page - Commitment
  privacyProtection: { fr: 'Protection de la Vie Privée', en: 'Privacy Protection' },
  privacyProtectionDesc: { fr: 'Vos données de trading sont cryptées et sécurisées', en: 'Your trading data is encrypted and secure' },
  noDataSale: { fr: 'Pas de Vente de Données Personnelles', en: 'No Sale of Personal Data' },
  noDataSaleDesc: { fr: 'Vos informations ne sont jamais vendues à des tiers', en: 'Your information is never sold to third parties' },
  fullTransparency: { fr: 'Transparence Totale', en: 'Full Transparency' },
  fullTransparencyDesc: { fr: 'Politiques claires et communication honnête', en: 'Clear policies and honest communication' },
  secureDataHandling: { fr: 'Gestion Sécurisée des Données', en: 'Secure Data Handling' },
  secureDataHandlingDesc: { fr: 'Stockage local et cloud avec sécurité aux normes de l\'industrie', en: 'Local and cloud storage with industry-standard security' },

  // ============================================
  // PDF EXPORT
  // ============================================
  selectPeriod: { fr: 'Sélectionner la période', en: 'Select period' },
  exportReport: { fr: 'Exporter le Rapport', en: 'Export Report' },
  generatingPDF: { fr: 'Génération du PDF...', en: 'Generating PDF...' },
  allTime: { fr: 'Depuis le début', en: 'All time' },
  last7Days: { fr: '7 derniers jours', en: 'Last 7 days' },
  last30Days: { fr: '30 derniers jours', en: 'Last 30 days' },
  last90Days: { fr: '90 derniers jours', en: 'Last 90 days' },
  customRange: { fr: 'Plage personnalisée', en: 'Custom range' },

  // ============================================
  // CALCULATOR - Additional
  // ============================================
  calculatorDesc: { fr: 'Calculatrice de taille de position professionnelle', en: 'Professional position size calculator' },
  searchAssetCalc: { fr: 'Rechercher un actif', en: 'Search asset' },
  searchPlaceholder: { fr: 'Rechercher...', en: 'Search...' },
  category: { fr: 'Catégorie', en: 'Category' },
  required: { fr: 'obligatoire', en: 'required' },
  optional: { fr: 'optionnel', en: 'optional' },
  parameters: { fr: 'Paramètres', en: 'Parameters' },
  results: { fr: 'Résultats', en: 'Results' },
  recommendedLotSize: { fr: 'Taille de Lot Recommandée', en: 'Recommended Lot Size' },
  standardLots: { fr: 'Standard Lots', en: 'Standard Lots' },
  mini: { fr: 'Mini', en: 'Mini' },
  micro: { fr: 'Micro', en: 'Micro' },
  maxLoss: { fr: 'Perte max', en: 'Max loss' },
  potentialGain: { fr: 'Gain potentiel', en: 'Potential gain' },
  visualization: { fr: 'Visualisation', en: 'Visualization' },
  warnings: { fr: 'Avertissements', en: 'Warnings' },
  bestPractices: { fr: 'Bonnes Pratiques', en: 'Best Practices' },
  formulasUsed: { fr: 'Formules utilisées', en: 'Formulas used' },
  fillAllFields: { fr: 'Veuillez remplir tous les champs obligatoires', en: 'Please fill all required fields' },
  calculationDone: { fr: 'Calcul effectué!', en: 'Calculation done!' },
  warningRisk2: { fr: 'Risque > 2% : Position agressive', en: 'Risk > 2%: Aggressive position' },
  warningRisk5: { fr: 'Risque > 5% : Très dangereux!', en: 'Risk > 5%: Very dangerous!' },
  warningSLTight: { fr: 'SL très serré (< 5 pips) : Trade risqué', en: 'Very tight SL (< 5 pips): Risky trade' },
  warningSpread: { fr: 'SL serré : Attention au spread', en: 'Tight SL: Watch the spread' },
  warningRRBad: { fr: 'R:R < 1:1 : Ratio défavorable', en: 'R:R < 1:1: Unfavorable ratio' },
  warningLotHigh: { fr: 'Lot size > 10 : Vérifiez votre calcul', en: 'Lot size > 10: Check your calculation' },
  tipNeverRisk2: { fr: 'Ne risquez jamais plus de 2% par trade', en: 'Never risk more than 2% per trade' },
  tipUseAlwaysSL: { fr: 'Utilisez toujours un Stop Loss', en: 'Always use a Stop Loss' },
  tipAimRR2: { fr: 'Visez un R:R minimum de 1:2', en: 'Aim for a minimum R:R of 1:2' },
  tipAdaptLot: { fr: 'Adaptez votre lot à votre capital', en: 'Adapt your lot to your capital' },

  // ============================================
  // PSYCHOLOGY - Additional
  // ============================================
  understandEmotionsImpact: { fr: 'Comprenez vos émotions et leur impact', en: 'Understand your emotions and their impact' },
  disciplineFactors: { fr: 'Facteurs de Discipline', en: 'Discipline Factors' },
  followingPlan: { fr: 'Respect du plan', en: 'Following plan' },
  noOvertrading: { fr: "Pas d'overtrading", en: 'No overtrading' },
  slAlwaysSet: { fr: 'SL toujours en place', en: 'SL always set' },
  noRevengeTrading: { fr: 'Pas de revenge trading', en: 'No revenge trading' },
  winrateByEmotion: { fr: 'Winrate par Émotion', en: 'Winrate by Emotion' },
  emotionDistributionChart: { fr: 'Répartition des Émotions', en: 'Emotion Distribution' },
  weeklyEmotionTrends: { fr: 'Tendances Émotionnelles Hebdomadaires', en: 'Weekly Emotion Trends' },
  mentalSummary: { fr: 'Bilan Mental', en: 'Mental Summary' },
  positiveSigns: { fr: 'Points Positifs', en: 'Positive Signs' },
  areasToImprove: { fr: "Points d'Amélioration", en: 'Areas to Improve' },
  addTradesWithEmotions: { fr: "Ajoutez des trades avec vos émotions pour voir l'analyse psychologique", en: 'Add trades with your emotions to see psychological analysis' },
  gains: { fr: 'Gains', en: 'Gains' },

  // ============================================
  // CHALLENGES - Additional
  // ============================================
  challengesTakeOn: { fr: 'Relevez des défis et montez en niveau', en: 'Take on challenges and level up' },
  niv: { fr: 'Niv.', en: 'Lv.' },

  // ============================================
  // PERIOD COMPARISON
  // ============================================
  periodComparison: { fr: 'Comparaison', en: 'Comparison' },
  comparePeriods: { fr: 'Analysez vos performances mois vs mois', en: 'Analyze your performance month vs month' },

  // ============================================
  // R-MULTIPLE & DRAWDOWN
  // ============================================
  rMultipleAnalysis: { fr: 'Analyse R-Multiple', en: 'R-Multiple Analysis' },
  avgR: { fr: 'R Moyen', en: 'Avg R' },
  maxR: { fr: 'R Max', en: 'Max R' },
  rLost: { fr: 'R Perdu', en: 'R Lost' },
  rWon: { fr: 'R Gagné', en: 'R Won' },
  rDistribution: { fr: 'Distribution R', en: 'R Distribution' },
  drawdownAnalysis: { fr: 'Analyse Drawdown', en: 'Drawdown Analysis' },
  avgDrawdownDuration: { fr: 'Durée Moy. DD', en: 'Avg DD Duration' },
  recoveryTime: { fr: 'Temps de Récup.', en: 'Recovery Time' },
  maxDepth: { fr: 'Profondeur Max', en: 'Max Depth' },
  currentDrawdown: { fr: 'DD Actuel', en: 'Current DD' },
  days: { fr: 'jours', en: 'days' },

  // ============================================
  // DISCIPLINE STREAKS
  // ============================================
  disciplineStreak: { fr: 'Série de Discipline', en: 'Discipline Streak' },
  currentStreak: { fr: 'Série Actuelle', en: 'Current Streak' },
  longestStreak: { fr: 'Plus Longue Série', en: 'Longest Streak' },
  daysWithoutViolation: { fr: 'jours sans enfreindre le plan', en: 'days without breaking the plan' },
  streakBroken: { fr: 'Série brisée', en: 'Streak broken' },

  // ============================================
  // SECRET CHALLENGES
  // ============================================
  secretChallenges: { fr: 'Défis Secrets', en: 'Secret Challenges' },
  hiddenChallenge: { fr: 'Défi Caché', en: 'Hidden Challenge' },
  unlockCondition: { fr: 'Condition de déblocage', en: 'Unlock condition' },
  rare: { fr: 'Rare', en: 'Rare' },
  epic: { fr: 'Épique', en: 'Epic' },
  legendary: { fr: 'Légendaire', en: 'Legendary' },

  // ============================================
  // PATTERN DETECTION
  // ============================================
  patternDetection: { fr: 'Détection de Patterns', en: 'Pattern Detection' },
  personalPatterns: { fr: 'Patterns Personnels', en: 'Personal Patterns' },
  cognitiveBiases: { fr: 'Biais Cognitifs', en: 'Cognitive Biases' },
  yourStrengths: { fr: 'Vos Forces', en: 'Your Strengths' },
  yourWeaknesses: { fr: 'Vos Faiblesses', en: 'Your Weaknesses' },

  // ============================================
  // TRADE FOCUS MODE
  // ============================================
  tradeFocusMode: { fr: 'Mode Focus', en: 'Focus Mode' },
  focusOnPlan: { fr: 'Concentrez-vous sur votre plan', en: 'Focus on your plan' },
  tradingPlan: { fr: 'Plan de Trading', en: 'Trading Plan' },
  dailyGoal: { fr: 'Objectif du Jour', en: 'Daily Goal' },
  maxTradesDay: { fr: 'Max trades/jour', en: 'Max trades/day' },
  maxLossDay: { fr: 'Perte max ($)', en: 'Max loss ($)' },
  tradesToday: { fr: "Trades aujourd'hui", en: 'Trades today' },
  stopTradingWarning: { fr: "Arrêtez de trader pour aujourd'hui", en: 'Stop trading for today' },

  // ============================================
  // SESSION ANALYSIS
  // ============================================
  sessionAnalysis: { fr: 'Analyse par Session', en: 'Session Analysis' },
  londonSession: { fr: 'Londres', en: 'London' },
  newYorkSession: { fr: 'New York', en: 'New York' },
  asiaSession: { fr: 'Asie', en: 'Asia' },
  overlapSession: { fr: 'Chevauchement', en: 'Overlap' },
  bestSessionTrader: { fr: 'Meilleur trader session', en: 'Best session trader' },
  sessionStats: { fr: 'Stats par session', en: 'Stats by session' },

  // ============================================
  // STRATEGY ANALYSIS
  // ============================================
  strategyAnalysis: { fr: 'Analyse par Stratégie', en: 'Strategy Analysis' },
  bestStrategyLabel: { fr: 'Meilleure Stratégie', en: 'Best Strategy' },
  worstStrategyLabel: { fr: 'Pire Stratégie', en: 'Worst Strategy' },
  byStrategy: { fr: 'Par Stratégie', en: 'By Strategy' },

  // ============================================
  // SELF SABOTAGE
  // ============================================
  selfSabotage: { fr: 'Détection d\'Auto-sabotage', en: 'Self-Sabotage Detection' },
  sabotageAlerts: { fr: 'Alertes de Sabotage', en: 'Sabotage Alerts' },
  sabotageScore: { fr: 'Score de Sabotage', en: 'Sabotage Score' },
  tradingAfterLoss: { fr: 'Trading après perte', en: 'Trading after loss' },
  lotIncreaseAfterWin: { fr: 'Lot augmenté après gain', en: 'Lot increase after win' },
  emotionalTradingAlert: { fr: 'Trading émotionnel', en: 'Emotional trading' },
  revengeTradingAlert: { fr: 'Revenge trading', en: 'Revenge trading' },
  overtradingSabotage: { fr: 'Overtrading', en: 'Overtrading' },
  noSabotageDetected: { fr: 'Aucun auto-sabotage détecté', en: 'No self-sabotage detected' },

  // ============================================
  // DISCIPLINE SCORE
  // ============================================
  disciplineScoreLabel: { fr: 'Score de Discipline', en: 'Discipline Score' },
  slRespect: { fr: 'Respect du SL', en: 'SL Respect' },
  tpRespect: { fr: 'Respect du TP', en: 'TP Respect' },
  planRespect: { fr: 'Respect du Plan', en: 'Plan Respect' },
  noOvertradingMetric: { fr: 'Pas d\'overtrading', en: 'No Overtrading' },
  disciplineHistory: { fr: 'Historique Discipline', en: 'Discipline History' },
  currentStreakLabel: { fr: 'Série Actuelle', en: 'Current Streak' },
  bestStreakLabel: { fr: 'Meilleure Série', en: 'Best Streak' },
  daysStreak: { fr: 'jours', en: 'days' },
  disciplineGrade: { fr: 'Note', en: 'Grade' },

  // ============================================
  // PERFORMANCE HEATMAP
  // ============================================
  performanceHeatmap: { fr: 'Heatmap des Performances', en: 'Performance Heatmap' },
  byDayOfWeek: { fr: 'Par Jour', en: 'By Day' },
  byHour: { fr: 'Par Heure', en: 'By Hour' },
  bestTradingDay: { fr: 'Meilleur Jour', en: 'Best Day' },
  worstTradingDay: { fr: 'Pire Jour', en: 'Worst Day' },
  bestTradingHour: { fr: 'Meilleure Heure', en: 'Best Hour' },
  worstTradingHour: { fr: 'Pire Heure', en: 'Worst Hour' },
  tradesCount: { fr: 'Trades', en: 'Trades' },

  // ============================================
  // EMOTION CORRELATION
  // ============================================
  emotionCorrelation: { fr: 'Corrélation Émotions ↔ Résultats', en: 'Emotion ↔ Results Correlation' },
  calmVsStress: { fr: 'Calme vs Stress', en: 'Calm vs Stress' },
  calmPnl: { fr: 'PnL Calme', en: 'Calm PnL' },
  stressPnl: { fr: 'PnL Stressé', en: 'Stress PnL' },
  emotionImpact: { fr: 'Impact des Émotions', en: 'Emotion Impact' },
  positiveImpact: { fr: 'Impact positif', en: 'Positive impact' },
  negativeImpact: { fr: 'Impact négatif', en: 'Negative impact' },
  neutralImpact: { fr: 'Impact neutre', en: 'Neutral impact' },

  // ============================================
  // AI SUMMARY & REWARDS
  // ============================================
  aiDailySummary: { fr: 'Résumé IA du Jour', en: 'AI Daily Summary' },
  rewardChests: { fr: 'Coffres de Récompenses', en: 'Reward Chests' },
  aiStrengths: { fr: 'Points forts', en: 'Strengths' },
  toImprove: { fr: 'À améliorer', en: 'To Improve' },
  nextChest: { fr: 'Prochain coffre', en: 'Next chest' },
  chestsUnlocked: { fr: 'Coffres débloqués', en: 'Chests unlocked' },
  unlockedByDiscipline: { fr: 'Débloqués par la discipline', en: 'Unlocked by discipline' },
};



export const getTranslation = (key: string, language: Language): string => {
  const translation = translations[key];
  if (!translation) {
    console.warn(`Translation missing for key: ${key}`);
    return key;
  }
  return translation[language];
};
