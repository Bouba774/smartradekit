/**
 * Professional Trading Calculator - Calculation Engine
 * 
 * DETERMINISTIC calculation engine aligned with MT4/MT5/TradingView standards.
 * Contract sizes are INTERNAL and NEVER exposed to users.
 * 
 * Core Formula:
 * LotSize = RiskAmount / (SL_Distance × ContractSize × ConversionRate)
 */

import { AssetConfig } from './assetConfigs';

// ============================================
// TYPES
// ============================================

export interface CalculationInput {
  capital: number;
  riskPercent: number;
  accountCurrency: string;
  asset: AssetConfig;
  entryPrice: number;
  stopLoss: number;
  takeProfit?: number;
  exchangeRates: Record<string, number>;
}

export interface CalculationResult {
  direction: 'BUY' | 'SELL';
  lotSize: number;
  riskAmount: number;
  gainAmount?: number;
  riskReward?: number;
  slPips: number;
  tpPips?: number;
  warnings: string[];
}

export interface CalculationError {
  error: string;
  code: 'INVALID_INPUT' | 'MISSING_RATE' | 'CALCULATION_ERROR';
}

// ============================================
// VALIDATION
// ============================================

interface ValidationError {
  message: string;
  code: 'CAPITAL' | 'RISK' | 'ASSET' | 'ENTRY' | 'STOP_LOSS' | 'TAKE_PROFIT' | 'CALCULATION';
}

function validateInput(input: CalculationInput, isFr: boolean = false): ValidationError | null {
  if (!input.capital || input.capital <= 0 || !isFinite(input.capital)) {
    return { message: isFr ? 'Capital invalide' : 'Invalid capital', code: 'CAPITAL' };
  }
  if (!input.riskPercent || input.riskPercent <= 0 || !isFinite(input.riskPercent)) {
    return { message: isFr ? 'Risque incorrect' : 'Invalid risk', code: 'RISK' };
  }
  if (!input.asset || !input.asset.symbol) {
    return { message: isFr ? 'Actif non pris en charge' : 'Unsupported asset', code: 'ASSET' };
  }
  if (!input.entryPrice || input.entryPrice <= 0 || !isFinite(input.entryPrice)) {
    return { message: isFr ? "Prix d'entrée invalide" : 'Invalid entry price', code: 'ENTRY' };
  }
  if (!input.stopLoss || input.stopLoss <= 0 || !isFinite(input.stopLoss)) {
    return { message: isFr ? 'Stop loss requis' : 'Stop loss required', code: 'STOP_LOSS' };
  }
  if (input.entryPrice === input.stopLoss) {
    return { message: isFr ? 'Stop loss incorrect' : 'Invalid stop loss', code: 'STOP_LOSS' };
  }
  
  const isBuy = input.entryPrice > input.stopLoss;
  
  if (input.takeProfit !== undefined && input.takeProfit > 0) {
    if (!isFinite(input.takeProfit)) {
      return { message: isFr ? 'Take profit incorrect' : 'Invalid take profit', code: 'TAKE_PROFIT' };
    }
    if (isBuy && input.takeProfit <= input.entryPrice) {
      return { message: isFr ? 'Take profit incorrect' : 'Invalid take profit', code: 'TAKE_PROFIT' };
    }
    if (!isBuy && input.takeProfit >= input.entryPrice) {
      return { message: isFr ? 'Take profit incorrect' : 'Invalid take profit', code: 'TAKE_PROFIT' };
    }
  }
  
  return null;
}

// ============================================
// CONVERSION HELPERS
// ============================================

/**
 * Get exchange rate FROM -> TO.
 * Supports two rate formats:
 *  1) USD-based single-currency rates: rates[CCY] = units of CCY per 1 USD
 *     (e.g. rates.JPY = 154.25 means 1 USD = 154.25 JPY)
 *  2) Pair-based rates: rates["EURUSD"] = price of EUR in USD
 * Falls back through USD when needed. Returns null only if truly impossible.
 */
function getExchangeRate(
  fromCurrency: string,
  toCurrency: string,
  rates: Record<string, number>
): number | null {
  if (!fromCurrency || !toCurrency) return null;
  if (fromCurrency === toCurrency) return 1;

  // 1) Direct pair (legacy)
  const directPair = `${fromCurrency}${toCurrency}`;
  if (rates[directPair] && isFinite(rates[directPair]) && rates[directPair] > 0) {
    return rates[directPair];
  }
  const inversePair = `${toCurrency}${fromCurrency}`;
  if (rates[inversePair] && isFinite(rates[inversePair]) && rates[inversePair] > 0) {
    return 1 / rates[inversePair];
  }

  // 2) USD-based single-currency rates
  // rates[X] = X per 1 USD => 1 X = 1/rates[X] USD
  const fromPerUsd = fromCurrency === 'USD' ? 1 : rates[fromCurrency];
  const toPerUsd = toCurrency === 'USD' ? 1 : rates[toCurrency];

  if (fromPerUsd && toPerUsd && isFinite(fromPerUsd) && isFinite(toPerUsd) && fromPerUsd > 0 && toPerUsd > 0) {
    // 1 FROM = (1/fromPerUsd) USD = (toPerUsd/fromPerUsd) TO
    return toPerUsd / fromPerUsd;
  }

  return null;
}

// ============================================
// CORE CALCULATION
// ============================================

export function calculatePosition(
  input: CalculationInput,
  isFr: boolean = false
): CalculationResult | CalculationError {
  const validationError = validateInput(input, isFr);
  if (validationError) {
    return { error: validationError.message, code: 'INVALID_INPUT' };
  }
  
  const { capital, riskPercent, accountCurrency, asset, entryPrice, stopLoss, takeProfit, exchangeRates } = input;
  const warnings: string[] = [];
  
  const direction: 'BUY' | 'SELL' = entryPrice > stopLoss ? 'BUY' : 'SELL';
  const riskAmount = capital * (riskPercent / 100);
  const slDistancePrice = Math.abs(entryPrice - stopLoss);
  
  // Convert SL distance to pips
  const slPips = Number((slDistancePrice / asset.pipSize).toFixed(1));
  
  // Convert TP distance to pips
  let tpPips: number | undefined;
  if (takeProfit !== undefined && takeProfit > 0) {
    const tpDistancePrice = Math.abs(takeProfit - entryPrice);
    tpPips = Number((tpDistancePrice / asset.pipSize).toFixed(1));
  }
  
  // Get conversion rate
  let conversionRate = 1;
  if (asset.quoteCurrency !== accountCurrency) {
    const rate = getExchangeRate(asset.quoteCurrency, accountCurrency, exchangeRates);
    if (rate === null) {
      return { error: `Cannot convert ${asset.quoteCurrency} to ${accountCurrency}. Missing exchange rate.`, code: 'MISSING_RATE' };
    }
    conversionRate = rate;
  }
  
  // LotSize = RiskAmount / (SL_Distance × ContractSize × ConversionRate)
  const rawLotSize = riskAmount / (slDistancePrice * asset.contractSize * conversionRate);
  
  if (!isFinite(rawLotSize) || isNaN(rawLotSize) || rawLotSize <= 0) {
    return { error: isFr ? 'Calcul impossible' : 'Calculation error', code: 'CALCULATION_ERROR' };
  }
  
  const lotSteps = Math.floor(rawLotSize / asset.lotStep);
  let lotSize = lotSteps * asset.lotStep;
  
  if (!isFinite(lotSize) || isNaN(lotSize) || lotSize <= 0) {
    return { error: isFr ? 'Calcul impossible' : 'Calculation error', code: 'CALCULATION_ERROR' };
  }
  
  if (lotSize < asset.minLot) {
    lotSize = asset.minLot;
    warnings.push(`Lot size adjusted to minimum: ${asset.minLot}`);
  }
  if (lotSize > asset.maxLot) {
    lotSize = asset.maxLot;
    warnings.push(`Lot size limited to maximum: ${asset.maxLot}`);
  }
  
  // RR & Gain
  let riskReward: number | undefined;
  let gainAmount: number | undefined;
  
  if (tpPips !== undefined && tpPips > 0 && slPips > 0) {
    riskReward = Number((tpPips / slPips).toFixed(2));
    // Gain = Lot × TP_pips × PipValue × ConversionRate
    gainAmount = Number((lotSize * tpPips * asset.pipValue * conversionRate).toFixed(2));
  }
  
  if (riskPercent > 5) warnings.push(isFr ? 'Risque élevé' : 'High risk');
  
  return {
    direction,
    lotSize: Number(lotSize.toFixed(2)),
    riskAmount: Number(riskAmount.toFixed(2)),
    gainAmount,
    riskReward,
    slPips,
    tpPips,
    warnings,
  };
}

export function isCalculationError(
  result: CalculationResult | CalculationError
): result is CalculationError {
  return 'error' in result;
}

// ============================================
// PIPS MODE CALCULATION
// ============================================

export interface PipsCalculationInput {
  capital: number;
  riskPercent: number;
  accountCurrency: string;
  asset: AssetConfig;
  slPips: number;
  tpPips?: number;
  direction: 'BUY' | 'SELL';
  exchangeRates: Record<string, number>;
}

export function calculatePositionFromPips(
  input: PipsCalculationInput,
  isFr: boolean = false
): CalculationResult | CalculationError {
  const { capital, riskPercent, accountCurrency, asset, slPips, tpPips, direction, exchangeRates } = input;
  const warnings: string[] = [];

  if (!capital || capital <= 0) return { error: isFr ? 'Capital invalide' : 'Invalid capital', code: 'INVALID_INPUT' };
  if (!riskPercent || riskPercent <= 0) return { error: isFr ? 'Risque incorrect' : 'Invalid risk', code: 'INVALID_INPUT' };
  if (!asset) return { error: isFr ? 'Actif non pris en charge' : 'Unsupported asset', code: 'INVALID_INPUT' };
  if (!slPips || slPips <= 0) return { error: isFr ? 'SL invalide' : 'Invalid SL', code: 'INVALID_INPUT' };
  if (tpPips !== undefined && tpPips < 0) return { error: isFr ? 'TP invalide' : 'Invalid TP', code: 'INVALID_INPUT' };

  const riskAmount = capital * (riskPercent / 100);
  const pipValuePerLot = asset.pipValue;

  let conversionRate = 1;
  if (asset.quoteCurrency !== accountCurrency) {
    const rate = getExchangeRate(asset.quoteCurrency, accountCurrency, exchangeRates);
    if (rate === null) {
      return { error: `Cannot convert ${asset.quoteCurrency} to ${accountCurrency}`, code: 'MISSING_RATE' };
    }
    conversionRate = rate;
  }

  const rawLotSize = riskAmount / (slPips * pipValuePerLot * conversionRate);

  if (!isFinite(rawLotSize) || isNaN(rawLotSize) || rawLotSize <= 0) {
    return { error: isFr ? 'Calcul impossible' : 'Calculation error', code: 'CALCULATION_ERROR' };
  }

  const lotSteps = Math.floor(rawLotSize / asset.lotStep);
  let lotSize = lotSteps * asset.lotStep;

  if (lotSize < asset.minLot) {
    lotSize = asset.minLot;
    warnings.push(`Lot size adjusted to minimum: ${asset.minLot}`);
  }
  if (lotSize > asset.maxLot) {
    lotSize = asset.maxLot;
    warnings.push(`Lot size limited to maximum: ${asset.maxLot}`);
  }

  let riskReward: number | undefined;
  let gainAmount: number | undefined;
  
  if (tpPips !== undefined && tpPips > 0 && slPips > 0) {
    riskReward = Number((tpPips / slPips).toFixed(2));
    gainAmount = Number((lotSize * tpPips * pipValuePerLot * conversionRate).toFixed(2));
  }

  if (riskPercent > 5) warnings.push(isFr ? 'Risque élevé' : 'High risk');

  return {
    direction,
    lotSize: Number(lotSize.toFixed(2)),
    riskAmount: Number(riskAmount.toFixed(2)),
    gainAmount,
    riskReward,
    slPips,
    tpPips,
    warnings,
  };
}
