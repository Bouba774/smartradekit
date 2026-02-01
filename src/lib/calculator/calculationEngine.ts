/**
 * MOTEUR DE CALCUL DE TRADING - VERSION CORRIGÉE
 * ================================================
 * Calculs fiables et vérifiés pour le position sizing
 * Conforme aux standards MT4/MT5
 * 
 * FORMULE UNIVERSELLE:
 * lot = risque_monétaire / (distance_prix × valeur_point_par_lot)
 * 
 * Où valeur_point_par_lot dépend du type d'actif:
 * - Forex: contract_size (ex: 100,000 pour EUR/USD = 10$/pip)
 * - Or XAU/USD: contract_size (100 oz = 100$/$ de mouvement)
 * - Indices: contract_size × point_value
 * - Crypto: 1 (1 lot = 1 coin)
 */

import { AssetConfig, getAssetConfig, RoundingMode } from './assetConfigs';

// ============================================================================
// TYPES
// ============================================================================

export interface CalculationInput {
  symbol: string;
  capital: number;
  riskPercent: number;
  entryPrice: number;
  stopLoss: number;
  takeProfit?: number;
  accountCurrency: string;
  exchangeRates: Record<string, number>;
}

export interface ValidationError {
  field: string;
  code: string;
  message: string;
}

export interface CalculationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: string[];
  
  // Résultats principaux
  lotSize: number | null;
  direction: 'buy' | 'sell' | null;
  
  // Détails du calcul
  riskAmount: number | null;
  slDistancePrice: number | null;
  slDistancePips: number | null;
  tpDistancePrice: number | null;
  tpDistancePips: number | null;
  pipValue: number | null;
  pipValueConverted: number | null;
  rrRatio: number | null;
  
  // Valeurs de perte/gain
  maxLoss: number | null;
  potentialGain: number | null;
  
  // Méta-données
  assetConfig: AssetConfig | null;
  lotRaw: number | null;
  conversionRate: number | null;
}

// ============================================================================
// DEVISES SUPPORTÉES
// ============================================================================

export const SUPPORTED_ACCOUNT_CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar' },
  { code: 'XAF', symbol: 'FCFA', name: 'CFA Franc BEAC' },
  { code: 'XOF', symbol: 'FCFA', name: 'CFA Franc BCEAO' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
];

// Taux fixes pour XAF/XOF (parité fixe avec EUR)
const FIXED_RATES: Record<string, number> = {
  'XAF': 655.957,
  'XOF': 655.957,
};

// ============================================================================
// FONCTIONS DE VALIDATION
// ============================================================================

export function validateInput(input: CalculationInput): ValidationError[] {
  const errors: ValidationError[] = [];
  
  if (!input.capital || input.capital <= 0) {
    errors.push({
      field: 'capital',
      code: 'INVALID_CAPITAL',
      message: 'Le capital doit être supérieur à 0',
    });
  }
  
  if (!input.riskPercent || input.riskPercent <= 0 || input.riskPercent > 100) {
    errors.push({
      field: 'riskPercent',
      code: 'INVALID_RISK',
      message: 'Le risque doit être entre 0 et 100%',
    });
  }
  
  if (!input.entryPrice || input.entryPrice <= 0) {
    errors.push({
      field: 'entryPrice',
      code: 'INVALID_ENTRY',
      message: 'Le prix d\'entrée doit être supérieur à 0',
    });
  }
  
  if (!input.stopLoss || input.stopLoss <= 0) {
    errors.push({
      field: 'stopLoss',
      code: 'INVALID_SL',
      message: 'Le stop loss doit être supérieur à 0',
    });
  }
  
  if (input.entryPrice && input.stopLoss && input.entryPrice === input.stopLoss) {
    errors.push({
      field: 'stopLoss',
      code: 'SL_EQUALS_ENTRY',
      message: 'Le stop loss ne peut pas être égal au prix d\'entrée',
    });
  }
  
  if (input.entryPrice && input.stopLoss) {
    const direction = input.entryPrice > input.stopLoss ? 'buy' : 'sell';
    
    if (input.takeProfit) {
      if (direction === 'buy' && input.takeProfit <= input.entryPrice) {
        errors.push({
          field: 'takeProfit',
          code: 'TP_WRONG_SIDE_BUY',
          message: 'Pour un achat, le TP doit être au-dessus du prix d\'entrée',
        });
      }
      if (direction === 'sell' && input.takeProfit >= input.entryPrice) {
        errors.push({
          field: 'takeProfit',
          code: 'TP_WRONG_SIDE_SELL',
          message: 'Pour une vente, le TP doit être en-dessous du prix d\'entrée',
        });
      }
    }
  }
  
  const validCurrencies = SUPPORTED_ACCOUNT_CURRENCIES.map(c => c.code);
  if (!validCurrencies.includes(input.accountCurrency)) {
    errors.push({
      field: 'accountCurrency',
      code: 'UNSUPPORTED_CURRENCY',
      message: `Devise non supportée: ${input.accountCurrency}`,
    });
  }
  
  return errors;
}

// ============================================================================
// FONCTIONS DE CONVERSION
// ============================================================================

export function getConversionRate(
  fromCurrency: string,
  toCurrency: string,
  exchangeRates: Record<string, number>
): number | null {
  if (fromCurrency === toCurrency) return 1;
  
  // Gestion XAF/XOF
  if (fromCurrency in FIXED_RATES) {
    const eurRate = FIXED_RATES[fromCurrency];
    if (toCurrency === 'EUR') return eurRate;
    const toUsdRate = exchangeRates['EUR'] || 1;
    const targetFromUsd = exchangeRates[toCurrency] ? 1 / exchangeRates[toCurrency] : null;
    if (targetFromUsd === null) return null;
    return eurRate / toUsdRate * targetFromUsd;
  }
  
  if (toCurrency in FIXED_RATES) {
    const eurRate = FIXED_RATES[toCurrency];
    if (fromCurrency === 'EUR') return 1 / eurRate;
    const fromToUsd = exchangeRates[fromCurrency] || null;
    const eurToUsd = exchangeRates['EUR'] || 1;
    if (fromToUsd === null) return null;
    return fromToUsd / eurToUsd / eurRate;
  }
  
  // Conversion standard via USD
  const fromToUsd = exchangeRates[fromCurrency];
  const toFromUsd = exchangeRates[toCurrency];
  
  if (fromCurrency === 'USD') {
    return toFromUsd ? 1 / toFromUsd : null;
  }
  
  if (toCurrency === 'USD') {
    return fromToUsd || null;
  }
  
  if (fromToUsd && toFromUsd) {
    return fromToUsd / toFromUsd;
  }
  
  return null;
}

// ============================================================================
// FONCTIONS D'ARRONDI
// ============================================================================

export function roundLot(
  lotRaw: number,
  minLot: number,
  lotStep: number,
  mode: RoundingMode
): number {
  let rounded: number;
  
  if (mode === 'DOWN') {
    rounded = Math.floor(lotRaw / lotStep) * lotStep;
  } else {
    rounded = Math.round(lotRaw / lotStep) * lotStep;
  }
  
  const decimals = getDecimalPlaces(lotStep);
  rounded = Number(rounded.toFixed(decimals));
  
  return rounded;
}

function getDecimalPlaces(value: number): number {
  const str = value.toString();
  const parts = str.split('.');
  return parts.length > 1 ? parts[1].length : 0;
}

// ============================================================================
// CALCUL VALEUR PAR POINT/PIP - CORRIGÉ
// ============================================================================

/**
 * Calcule la valeur monétaire d'un mouvement de 1 unité de prix pour 1 lot
 * 
 * RÈGLES PAR TYPE D'ACTIF:
 * 
 * FOREX (EUR/USD, GBP/USD, etc.):
 * - 1 pip = 0.0001 (ou 0.01 pour JPY)
 * - Valeur 1 pip = contract_size × pip_size = 100,000 × 0.0001 = 10 USD
 * 
 * OR (XAU/USD):
 * - 1 lot = 100 onces
 * - Mouvement de 1$ = 100$ de P/L
 * - Pour calcul: on utilise la distance en $ directement
 * 
 * INDICES (US30, US100, etc.):
 * - 1 point = 1$ (ou selon contract_size)
 * - Valeur point = contract_size
 * 
 * CRYPTO (BTC/USD, ETH/USD):
 * - 1 lot = 1 coin (généralement)
 * - Mouvement de 1$ = 1$ de P/L par coin
 */
function calculatePointValuePerLot(config: AssetConfig): number {
  switch (config.assetType) {
    case 'forex_non_jpy':
    case 'forex_jpy':
      // Forex: valeur pip = contract_size × pip_size
      // EUR/USD: 100,000 × 0.0001 = 10 USD par pip
      // USD/JPY: 100,000 × 0.01 = 1000 JPY par pip
      return config.contractSize * config.pipSize;
    
    case 'metal_gold':
    case 'metal_silver':
    case 'metal_platinum':
      // Métaux: valeur par $ de mouvement = contract_size
      // XAU/USD: 1$ mouvement × 100 oz = 100 USD
      return config.contractSize;
    
    case 'index_us':
    case 'index_eu':
    case 'index_asia':
      // Indices: valeur par point = contract_size
      return config.contractSize;
    
    case 'crypto_major':
    case 'crypto_alt':
      // Crypto: 1 lot = 1 coin, donc 1$ mouvement = 1$ P/L
      return config.contractSize;
    
    case 'energy':
      // Énergie: selon contract_size
      return config.contractSize;
    
    case 'stock':
      // Actions: 1 lot = 1 action
      return 1;
    
    default:
      return config.contractSize * config.pipSize;
  }
}

/**
 * Convertit la distance prix en "pips" selon le type d'actif
 * Pour l'affichage uniquement
 */
function calculatePipsFromPrice(distancePrice: number, config: AssetConfig): number {
  switch (config.assetType) {
    case 'forex_non_jpy':
    case 'forex_jpy':
      // Forex: distance / pip_size
      return distancePrice / config.pipSize;
    
    case 'metal_gold':
    case 'metal_silver':
    case 'metal_platinum':
      // Métaux: afficher en points (1 point = 0.1 ou 0.01 selon l'actif)
      // XAU/USD: 82.53$ de distance = 82.53 points
      return distancePrice;
    
    case 'index_us':
    case 'index_eu':
    case 'index_asia':
      // Indices: afficher en points
      return distancePrice / config.pipSize;
    
    case 'crypto_major':
    case 'crypto_alt':
      // Crypto: afficher en dollars
      return distancePrice;
    
    case 'energy':
    case 'stock':
      return distancePrice / config.pipSize;
    
    default:
      return distancePrice / config.pipSize;
  }
}

/**
 * Retourne le label pour les pips/points selon le type d'actif
 */
export function getPipsLabel(config: AssetConfig, language: 'fr' | 'en' = 'fr'): string {
  switch (config.assetType) {
    case 'forex_non_jpy':
    case 'forex_jpy':
      return 'pips';
    
    case 'metal_gold':
    case 'metal_silver':
    case 'metal_platinum':
      return language === 'fr' ? 'points ($)' : 'points ($)';
    
    case 'index_us':
    case 'index_eu':
    case 'index_asia':
      return language === 'fr' ? 'points' : 'points';
    
    case 'crypto_major':
    case 'crypto_alt':
      return '$';
    
    default:
      return 'pips';
  }
}

// ============================================================================
// MOTEUR DE CALCUL PRINCIPAL - CORRIGÉ
// ============================================================================

/**
 * Calcule la taille de lot optimale
 * 
 * FORMULE UNIVERSELLE SIMPLIFIÉE:
 * 1. distance_price = abs(entry - stop_loss)
 * 2. risk_money = capital × (risk_percent / 100)
 * 3. value_per_point = selon type d'actif (contractSize pour métaux, etc.)
 * 4. lot_raw = risk_money / (distance_price × value_per_point × conversion_rate)
 * 5. lot_final = floor(lot_raw / lot_step) × lot_step
 */
export function calculateLotSize(input: CalculationInput): CalculationResult {
  const result: CalculationResult = {
    isValid: false,
    errors: [],
    warnings: [],
    lotSize: null,
    direction: null,
    riskAmount: null,
    slDistancePrice: null,
    slDistancePips: null,
    tpDistancePrice: null,
    tpDistancePips: null,
    pipValue: null,
    pipValueConverted: null,
    rrRatio: null,
    maxLoss: null,
    potentialGain: null,
    assetConfig: null,
    lotRaw: null,
    conversionRate: null,
  };
  
  // Validation
  const validationErrors = validateInput(input);
  if (validationErrors.length > 0) {
    result.errors = validationErrors;
    return result;
  }
  
  // Obtenir config actif
  let config: AssetConfig;
  try {
    config = getAssetConfig(input.symbol);
    result.assetConfig = config;
  } catch (error) {
    result.errors.push({
      field: 'symbol',
      code: 'UNKNOWN_ASSET',
      message: error instanceof Error ? error.message : 'Actif non supporté',
    });
    return result;
  }
  
  // Direction
  result.direction = input.entryPrice > input.stopLoss ? 'buy' : 'sell';
  
  // Distance SL en prix
  result.slDistancePrice = Math.abs(input.entryPrice - input.stopLoss);
  
  // Distance SL en pips (pour affichage)
  result.slDistancePips = calculatePipsFromPrice(result.slDistancePrice, config);
  
  // Risque monétaire
  result.riskAmount = input.capital * (input.riskPercent / 100);
  
  // Valeur par point/$ de mouvement pour 1 lot
  result.pipValue = calculatePointValuePerLot(config);
  
  // Conversion devise
  const quoteCurrency = config.quoteCurrency;
  const accountCurrency = input.accountCurrency;
  
  if (quoteCurrency !== accountCurrency) {
    const rate = getConversionRate(quoteCurrency, accountCurrency, input.exchangeRates);
    
    if (rate === null) {
      result.errors.push({
        field: 'accountCurrency',
        code: 'CONVERSION_UNAVAILABLE',
        message: `Conversion ${quoteCurrency} → ${accountCurrency} non disponible`,
      });
      return result;
    }
    
    result.conversionRate = rate;
    result.pipValueConverted = result.pipValue * rate;
  } else {
    result.conversionRate = 1;
    result.pipValueConverted = result.pipValue;
  }
  
  // CALCUL DU LOT - FORMULE CORRIGÉE
  // Pour tous les actifs: lot = risk / (distance_price × value_per_unit_movement × conversion)
  let lotRaw: number;
  
  if (config.assetType === 'forex_non_jpy' || config.assetType === 'forex_jpy') {
    // Forex: utilise les pips
    // lot = risk / (pips × pip_value_converted)
    lotRaw = result.riskAmount / (result.slDistancePips * result.pipValueConverted);
  } else {
    // Métaux, Indices, Crypto: utilise la distance en prix directement
    // lot = risk / (distance_price × value_per_point × conversion)
    lotRaw = result.riskAmount / (result.slDistancePrice * result.pipValueConverted);
  }
  
  result.lotRaw = lotRaw;
  
  // Arrondir vers le bas
  const lotFinal = roundLot(lotRaw, config.minLot, config.lotStep, config.roundingMode);
  
  // Vérifier les limites
  if (lotFinal < config.minLot) {
    result.errors.push({
      field: 'lotSize',
      code: 'LOT_TOO_SMALL',
      message: `Risque trop faible. Lot minimum: ${config.minLot}`,
    });
    result.lotSize = config.minLot;
    return result;
  }
  
  if (lotFinal > config.maxLot) {
    result.warnings.push(`⚠️ Lot limité à ${config.maxLot} (max)`);
    result.lotSize = config.maxLot;
  } else {
    result.lotSize = lotFinal;
  }
  
  // Take Profit
  if (input.takeProfit && input.takeProfit > 0) {
    result.tpDistancePrice = Math.abs(input.takeProfit - input.entryPrice);
    result.tpDistancePips = calculatePipsFromPrice(result.tpDistancePrice, config);
    
    // Risk/Reward = distance_TP / distance_SL (en prix, pas en pips)
    result.rrRatio = result.tpDistancePrice / result.slDistancePrice;
    
    // Gain potentiel
    if (config.assetType === 'forex_non_jpy' || config.assetType === 'forex_jpy') {
      result.potentialGain = result.tpDistancePips * result.pipValueConverted * result.lotSize;
    } else {
      result.potentialGain = result.tpDistancePrice * result.pipValueConverted * result.lotSize;
    }
  }
  
  // Perte réelle avec lot arrondi
  if (config.assetType === 'forex_non_jpy' || config.assetType === 'forex_jpy') {
    result.maxLoss = result.slDistancePips * result.pipValueConverted * result.lotSize;
  } else {
    result.maxLoss = result.slDistancePrice * result.pipValueConverted * result.lotSize;
  }
  
  // Warnings
  if (input.riskPercent > 2) {
    result.warnings.push(`⚠️ Risque élevé: ${input.riskPercent}%`);
  }
  if (result.rrRatio !== null && result.rrRatio < 1) {
    result.warnings.push('⚠️ R:R défavorable (<1:1)');
  }
  
  result.isValid = result.errors.length === 0;
  return result;
}

// ============================================================================
// UTILITAIRES D'AFFICHAGE
// ============================================================================

export function formatRRRatio(ratio: number | null): string {
  if (ratio === null) return '-';
  return `1:${ratio.toFixed(2)}`;
}

export function formatPips(pips: number | null, decimals: number = 2): string {
  if (pips === null) return '-';
  return pips.toFixed(decimals);
}

export function getAssetTypeLabel(assetType: string, language: 'fr' | 'en' = 'fr'): string {
  const labels: Record<string, { fr: string; en: string }> = {
    'forex_non_jpy': { fr: 'Forex', en: 'Forex' },
    'forex_jpy': { fr: 'Forex (JPY)', en: 'Forex (JPY)' },
    'metal_gold': { fr: 'Or', en: 'Gold' },
    'metal_silver': { fr: 'Argent', en: 'Silver' },
    'metal_platinum': { fr: 'Platine/Palladium', en: 'Platinum/Palladium' },
    'index_us': { fr: 'Indice US', en: 'US Index' },
    'index_eu': { fr: 'Indice Europe', en: 'EU Index' },
    'index_asia': { fr: 'Indice Asie', en: 'Asia Index' },
    'crypto_major': { fr: 'Crypto', en: 'Crypto' },
    'crypto_alt': { fr: 'Altcoin', en: 'Altcoin' },
    'energy': { fr: 'Énergie', en: 'Energy' },
    'stock': { fr: 'Action', en: 'Stock' },
  };
  
  return labels[assetType]?.[language] || assetType;
}
