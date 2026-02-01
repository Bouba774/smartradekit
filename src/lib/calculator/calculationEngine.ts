/**
 * MOTEUR DE CALCUL DE TRADING
 * ============================
 * Calculs fiables et vérifiés pour le position sizing
 * Conforme aux standards MT4/MT5
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
  exchangeRates: Record<string, number>; // Taux vers USD (ex: EUR: 1.08, GBP: 1.27)
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
  riskAmount: number | null;           // Montant du risque en devise du compte
  slDistancePrice: number | null;      // Distance SL en prix
  slDistancePips: number | null;       // Distance SL en pips
  tpDistancePrice: number | null;      // Distance TP en prix
  tpDistancePips: number | null;       // Distance TP en pips
  pipValue: number | null;             // Valeur d'1 pip pour 1 lot
  pipValueConverted: number | null;    // Valeur d'1 pip convertie en devise compte
  rrRatio: number | null;              // Risk/Reward ratio
  
  // Valeurs de perte/gain
  maxLoss: number | null;              // Perte maximale avec le lot calculé
  potentialGain: number | null;        // Gain potentiel si TP atteint
  
  // Méta-données
  assetConfig: AssetConfig | null;
  lotRaw: number | null;               // Lot avant arrondi (pour debug)
  conversionRate: number | null;       // Taux de conversion utilisé
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
  'XAF': 655.957, // 1 EUR = 655.957 XAF
  'XOF': 655.957, // 1 EUR = 655.957 XOF
};

// ============================================================================
// FONCTIONS DE VALIDATION
// ============================================================================

/**
 * Valide les entrées avant calcul
 */
export function validateInput(input: CalculationInput): ValidationError[] {
  const errors: ValidationError[] = [];
  
  // Validation capital
  if (!input.capital || input.capital <= 0) {
    errors.push({
      field: 'capital',
      code: 'INVALID_CAPITAL',
      message: 'Le capital doit être supérieur à 0',
    });
  }
  
  // Validation risque
  if (!input.riskPercent || input.riskPercent <= 0 || input.riskPercent > 100) {
    errors.push({
      field: 'riskPercent',
      code: 'INVALID_RISK',
      message: 'Le risque doit être entre 0 et 100%',
    });
  }
  
  // Validation prix d'entrée
  if (!input.entryPrice || input.entryPrice <= 0) {
    errors.push({
      field: 'entryPrice',
      code: 'INVALID_ENTRY',
      message: 'Le prix d\'entrée doit être supérieur à 0',
    });
  }
  
  // Validation stop loss
  if (!input.stopLoss || input.stopLoss <= 0) {
    errors.push({
      field: 'stopLoss',
      code: 'INVALID_SL',
      message: 'Le stop loss doit être supérieur à 0',
    });
  }
  
  // Validation SL = Entry
  if (input.entryPrice && input.stopLoss && input.entryPrice === input.stopLoss) {
    errors.push({
      field: 'stopLoss',
      code: 'SL_EQUALS_ENTRY',
      message: 'Le stop loss ne peut pas être égal au prix d\'entrée',
    });
  }
  
  // Validation direction vs SL/TP
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
  
  // Validation devise du compte
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

/**
 * Valide le format du prix selon l'actif
 */
export function validatePriceFormat(price: number, config: AssetConfig): boolean {
  const priceStr = price.toString();
  const decimalPart = priceStr.split('.')[1] || '';
  return decimalPart.length <= config.priceDecimals;
}

/**
 * Formate un prix selon les décimales de l'actif
 */
export function formatPrice(price: number, config: AssetConfig): string {
  return price.toFixed(config.priceDecimals);
}

/**
 * Parse et valide un prix saisi
 */
export function parsePrice(input: string, config: AssetConfig): { value: number | null; error: string | null } {
  const sanitized = input.replace(/[^0-9.,]/g, '').replace(',', '.');
  
  if (!sanitized) {
    return { value: null, error: null };
  }
  
  const value = parseFloat(sanitized);
  
  if (isNaN(value)) {
    return { value: null, error: 'Format de prix invalide' };
  }
  
  if (value <= 0) {
    return { value: null, error: 'Le prix doit être positif' };
  }
  
  // Vérifier le nombre de décimales
  const decimalPart = sanitized.split('.')[1] || '';
  if (decimalPart.length > config.priceDecimals) {
    return { 
      value: null, 
      error: `Trop de décimales (max: ${config.priceDecimals})` 
    };
  }
  
  return { value, error: null };
}

// ============================================================================
// FONCTIONS DE CONVERSION
// ============================================================================

/**
 * Obtient le taux de conversion entre deux devises
 */
export function getConversionRate(
  fromCurrency: string,
  toCurrency: string,
  exchangeRates: Record<string, number>
): number | null {
  if (fromCurrency === toCurrency) return 1;
  
  // Gestion des devises à parité fixe (XAF, XOF)
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

/**
 * Arrondit le lot selon le mode spécifié
 * DOWN = toujours vers le bas (sécurité)
 * HALF_UP = arrondi standard
 */
export function roundLot(
  lotRaw: number,
  minLot: number,
  lotStep: number,
  mode: RoundingMode
): number {
  // Arrondir au lotStep
  let rounded: number;
  
  if (mode === 'DOWN') {
    // Toujours arrondir vers le bas pour la sécurité
    rounded = Math.floor(lotRaw / lotStep) * lotStep;
  } else {
    // Arrondi standard
    rounded = Math.round(lotRaw / lotStep) * lotStep;
  }
  
  // Précision pour éviter les erreurs de floating point
  const decimals = getDecimalPlaces(lotStep);
  rounded = Number(rounded.toFixed(decimals));
  
  return rounded;
}

/**
 * Obtient le nombre de décimales d'un nombre
 */
function getDecimalPlaces(value: number): number {
  const str = value.toString();
  const parts = str.split('.');
  return parts.length > 1 ? parts[1].length : 0;
}

// ============================================================================
// MOTEUR DE CALCUL PRINCIPAL
// ============================================================================

/**
 * Calcule la taille de lot optimale
 * 
 * FORMULE CANONIQUE:
 * 1. distance_price = abs(entry - stop_loss)
 * 2. distance_pips = distance_price / pip_size
 * 3. risk_money = capital × (risk_percent / 100)
 * 4. pip_value_1_lot = contract_size × pip_size
 * 5. pip_value_converted = pip_value_1_lot × conversion_rate
 * 6. lot_raw = risk_money / (distance_pips × pip_value_converted)
 * 7. lot_final = floor(lot_raw / lot_step) × lot_step
 */
export function calculateLotSize(input: CalculationInput): CalculationResult {
  // Initialiser le résultat
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
  
  // Étape 0: Validation des entrées
  const validationErrors = validateInput(input);
  if (validationErrors.length > 0) {
    result.errors = validationErrors;
    return result;
  }
  
  // Étape 1: Obtenir la configuration de l'actif
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
  
  // Étape 2: Déterminer la direction
  result.direction = input.entryPrice > input.stopLoss ? 'buy' : 'sell';
  
  // Étape 3: Calculer la distance SL
  // distance_price = abs(entry - stop_loss)
  result.slDistancePrice = Math.abs(input.entryPrice - input.stopLoss);
  
  // Étape 4: Convertir en pips
  // distance_pips = distance_price / pip_size
  result.slDistancePips = result.slDistancePrice / config.pipSize;
  
  // Étape 5: Calculer le risque monétaire
  // risk_money = capital × (risk_percent / 100)
  result.riskAmount = input.capital * (input.riskPercent / 100);
  
  // Étape 6: Calculer la valeur d'un pip pour 1 lot standard
  // pip_value_1_lot = contract_size × pip_size
  result.pipValue = config.contractSize * config.pipSize;
  
  // Étape 7: Conversion de devise si nécessaire
  // La valeur du pip est en quote currency de l'actif
  // Il faut la convertir en devise du compte
  const quoteCurrency = config.quoteCurrency;
  const accountCurrency = input.accountCurrency;
  
  if (quoteCurrency !== accountCurrency) {
    const rate = getConversionRate(quoteCurrency, accountCurrency, input.exchangeRates);
    
    if (rate === null) {
      result.errors.push({
        field: 'accountCurrency',
        code: 'CONVERSION_UNAVAILABLE',
        message: `Impossible de convertir ${quoteCurrency} vers ${accountCurrency}. Vérifiez les taux de change.`,
      });
      return result;
    }
    
    result.conversionRate = rate;
    result.pipValueConverted = result.pipValue * rate;
  } else {
    result.conversionRate = 1;
    result.pipValueConverted = result.pipValue;
  }
  
  // Étape 8: Calculer le lot brut (SANS arrondi)
  // lot_raw = risk_money / (distance_pips × pip_value_converted)
  const lotRaw = result.riskAmount / (result.slDistancePips * result.pipValueConverted);
  result.lotRaw = lotRaw;
  
  // Étape 9: Arrondir vers le bas avec respect du lot_step
  // lot_final = floor(lot_raw / lot_step) × lot_step
  const lotFinal = roundLot(lotRaw, config.minLot, config.lotStep, config.roundingMode);
  
  // Étape 10: Vérifier les limites
  if (lotFinal < config.minLot) {
    result.errors.push({
      field: 'lotSize',
      code: 'LOT_TOO_SMALL',
      message: `Risque trop faible pour ce stop loss. Lot minimum: ${config.minLot}`,
    });
    result.lotSize = config.minLot; // Afficher le minimum quand même
    return result;
  }
  
  if (lotFinal > config.maxLot) {
    result.warnings.push(`⚠️ Lot maximum dépassé. Limité à ${config.maxLot}`);
    result.lotSize = config.maxLot;
  } else {
    result.lotSize = lotFinal;
  }
  
  // Étape 11: Calculer le Take Profit si fourni
  if (input.takeProfit && input.takeProfit > 0) {
    result.tpDistancePrice = Math.abs(input.takeProfit - input.entryPrice);
    result.tpDistancePips = result.tpDistancePrice / config.pipSize;
    
    // Risk/Reward = distance_TP / distance_SL
    result.rrRatio = result.tpDistancePips / result.slDistancePips;
    
    // Gain potentiel
    result.potentialGain = result.tpDistancePips * result.pipValueConverted * result.lotSize;
  }
  
  // Étape 12: Calculer la perte réelle avec le lot arrondi
  result.maxLoss = result.slDistancePips * result.pipValueConverted * result.lotSize;
  
  // Étape 13: Générer les warnings
  if (input.riskPercent > 2) {
    result.warnings.push(`⚠️ Risque élevé: ${input.riskPercent}% (recommandé: ≤2%)`);
  }
  if (input.riskPercent > 5) {
    result.warnings.push(`🚨 DANGER: Risque excessif de ${input.riskPercent}%`);
  }
  if (result.slDistancePips < 5 && config.assetType.startsWith('forex')) {
    result.warnings.push('⚠️ Stop loss très serré (risque de slippage)');
  }
  if (result.rrRatio !== null && result.rrRatio < 1) {
    result.warnings.push('⚠️ Ratio Risk/Reward défavorable (<1:1)');
  }
  if (result.lotSize > 10) {
    result.warnings.push('🚨 Position très importante');
  }
  
  result.isValid = result.errors.length === 0;
  return result;
}

// ============================================================================
// UTILITAIRES D'AFFICHAGE
// ============================================================================

/**
 * Formate le ratio RR pour l'affichage
 */
export function formatRRRatio(ratio: number | null): string {
  if (ratio === null) return '-';
  return `1:${ratio.toFixed(2)}`;
}

/**
 * Formate les pips pour l'affichage
 */
export function formatPips(pips: number | null, decimals: number = 1): string {
  if (pips === null) return '-';
  return pips.toFixed(decimals);
}

/**
 * Obtient le label du type d'actif
 */
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
    'crypto_major': { fr: 'Crypto Majeure', en: 'Major Crypto' },
    'crypto_alt': { fr: 'Altcoin', en: 'Altcoin' },
    'energy': { fr: 'Énergie', en: 'Energy' },
    'stock': { fr: 'Action', en: 'Stock' },
  };
  
  return labels[assetType]?.[language] || assetType;
}
