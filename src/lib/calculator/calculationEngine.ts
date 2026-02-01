/**
 * MOTEUR DE CALCUL DE TRADING - VERSION CORRIGÉE FINALE
 * ======================================================
 * Calculs 100% fiables et conformes MT4/MT5
 * 
 * FORMULE UNIVERSELLE (SEULE MÉTHODE AUTORISÉE):
 * 1. distance_SL = |prix_entrée - stop_loss|
 * 2. pips_SL = distance_SL / taille_pip
 * 3. risque = capital × (risque% / 100)
 * 4. lot = risque / (pips_SL × valeur_pip_par_lot)
 * 5. lot_final = arrondi_au_pas_du_broker
 * 
 * VALEURS PIP OBLIGATOIRES (par lot standard):
 * - EUR/USD, GBP/USD, etc. (non-JPY): 10 USD/pip
 * - USD/JPY: ~1000 JPY/pip ≈ 6.67 USD/pip
 * - XAU/USD: 1 USD/pip (1 pip = 0.01, 100oz × 0.01)
 * - XAG/USD: 5 USD/pip (1 pip = 0.001, 5000oz × 0.001)
 * - Indices: variable selon contrat
 * - Crypto: 1 USD par $ de mouvement par coin
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
// VALIDATION
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
// CONVERSION DEVISES
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
// ARRONDI
// ============================================================================

export function roundLot(
  lotRaw: number,
  minLot: number,
  lotStep: number,
  mode: RoundingMode
): number {
  // TOUJOURS arrondir vers le bas pour la sécurité
  let rounded = Math.floor(lotRaw / lotStep) * lotStep;
  
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
// VALEUR PIP CORRECTE - FORMULE STRICTE
// ============================================================================

/**
 * Calcule la valeur monétaire de 1 PIP pour 1 lot standard
 * 
 * FORMULE: valeur_pip = contract_size × pip_size
 * 
 * EXEMPLES CORRECTS:
 * - EUR/USD: 100,000 × 0.0001 = 10 USD/pip
 * - USD/JPY: 100,000 × 0.01 = 1000 JPY/pip
 * - XAU/USD: 100 oz × 0.01 = 1 USD/pip
 * - XAG/USD: 5000 oz × 0.001 = 5 USD/pip
 * - US30: 1 × 1 = 1 USD/point
 * - BTC/USD: 1 × 1 = 1 USD par $ de mouvement
 */
function calculatePipValue(config: AssetConfig): number {
  return config.contractSize * config.pipSize;
}

/**
 * Convertit la distance prix en pips
 * FORMULE UNIVERSELLE: pips = distance_prix / pip_size
 */
function priceToPips(distance: number, pipSize: number): number {
  return distance / pipSize;
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
      return 'pips';
    
    case 'index_us':
    case 'index_eu':
    case 'index_asia':
      return language === 'fr' ? 'pts' : 'pts';
    
    case 'crypto_major':
    case 'crypto_alt':
      return '$';
    
    default:
      return 'pips';
  }
}

// ============================================================================
// MOTEUR DE CALCUL PRINCIPAL
// ============================================================================

/**
 * CALCUL DE LA TAILLE DE LOT
 * 
 * FORMULE STRICTE (SEULE AUTORISÉE):
 * 1. distance_SL = |entry - SL|
 * 2. pips_SL = distance_SL / pip_size
 * 3. risque = capital × (risk% / 100)
 * 4. valeur_pip = contract_size × pip_size (converti en devise compte)
 * 5. lot = risque / (pips_SL × valeur_pip)
 * 6. lot_final = floor(lot / lot_step) × lot_step
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
  
  // === ÉTAPE 1: VALIDATION ===
  const validationErrors = validateInput(input);
  if (validationErrors.length > 0) {
    result.errors = validationErrors;
    return result;
  }
  
  // === ÉTAPE 2: CONFIGURATION ACTIF ===
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
  
  // === ÉTAPE 3: DIRECTION ===
  result.direction = input.entryPrice > input.stopLoss ? 'buy' : 'sell';
  
  // === ÉTAPE 4: DISTANCE STOP LOSS ===
  // Distance en prix
  result.slDistancePrice = Math.abs(input.entryPrice - input.stopLoss);
  
  // Distance en PIPS (formule universelle: distance / pip_size)
  result.slDistancePips = priceToPips(result.slDistancePrice, config.pipSize);
  
  // === ÉTAPE 5: RISQUE MONÉTAIRE ===
  result.riskAmount = input.capital * (input.riskPercent / 100);
  
  // === ÉTAPE 6: VALEUR PIP ===
  // Valeur pip pour 1 lot (en devise de cotation)
  result.pipValue = calculatePipValue(config);
  
  // === ÉTAPE 7: CONVERSION DEVISE ===
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
  
  // === ÉTAPE 8: CALCUL DU LOT ===
  // FORMULE STRICTE: lot = risque / (pips_SL × valeur_pip_convertie)
  const lotRaw = result.riskAmount / (result.slDistancePips * result.pipValueConverted);
  result.lotRaw = lotRaw;
  
  // === ÉTAPE 9: ARRONDI VERS LE BAS ===
  const lotFinal = roundLot(lotRaw, config.minLot, config.lotStep, config.roundingMode);
  
  // === ÉTAPE 10: VÉRIFICATION LIMITES ===
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
  
  // === ÉTAPE 11: CALCUL PERTE RÉELLE ===
  // Perte basée sur le lot ARRONDI (pas le lot brut)
  result.maxLoss = result.slDistancePips * result.pipValueConverted * result.lotSize;
  
  // === ÉTAPE 12: TAKE PROFIT (OPTIONNEL) ===
  if (input.takeProfit && input.takeProfit > 0) {
    result.tpDistancePrice = Math.abs(input.takeProfit - input.entryPrice);
    result.tpDistancePips = priceToPips(result.tpDistancePrice, config.pipSize);
    
    // Risk/Reward = distance_TP / distance_SL
    result.rrRatio = result.tpDistancePrice / result.slDistancePrice;
    
    // Gain potentiel avec lot arrondi
    result.potentialGain = result.tpDistancePips * result.pipValueConverted * result.lotSize;
  }
  
  // === ÉTAPE 13: WARNINGS ===
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
