/**
 * Professional Trading Calculator - Calculation Engine
 * 
 * DETERMINISTIC calculation engine aligned with MT4/MT5/TradingView standards.
 * 
 * Core Formula:
 * LotSize = RiskAmount / (SL_Distance_in_Pips × PipValue_in_AccountCurrency)
 */

import { AssetConfig } from './assetConfigs';

// ============================================
// TYPES
// ============================================

export interface CalculationInput {
  capital: number;                    // Account capital
  riskPercent: number;                // Risk percentage (e.g., 1 = 1%)
  accountCurrency: string;            // Account currency (USD, EUR, etc.)
  asset: AssetConfig;                 // Asset configuration
  entryPrice: number;                 // Entry price
  stopLoss: number;                   // Stop loss price
  takeProfit?: number;                // Take profit price (optional)
  exchangeRates: Record<string, number>; // Exchange rates for conversion
}

export interface CalculationResult {
  // Core results
  direction: 'BUY' | 'SELL';          // Trade direction
  lotSize: number;                     // Recommended lot size
  
  // Risk analysis
  riskAmount: number;                  // Risk amount in account currency
  actualRisk: number;                  // Actual risk after lot rounding
  
  // Stop Loss details
  slDistancePips: number;              // SL distance in pips/points
  slDistancePrice: number;             // SL distance in price
  potentialLoss: number;               // Potential loss in account currency
  
  // Take Profit details (if TP provided)
  tpDistancePips?: number;             // TP distance in pips/points
  tpDistancePrice?: number;            // TP distance in price
  potentialProfit?: number;            // Potential profit in account currency
  
  // Risk/Reward
  riskReward?: number;                 // Risk/Reward ratio
  
  // Conversion details
  pipValueInQuote: number;             // Pip value in quote currency
  pipValueInAccount: number;           // Pip value in account currency
  conversionRate: number;              // Conversion rate used
  
  // Warnings
  warnings: string[];                  // Any warnings or advice
}

export interface CalculationError {
  error: string;
  code: 'INVALID_INPUT' | 'MISSING_RATE' | 'CALCULATION_ERROR';
}

// ============================================
// VALIDATION
// ============================================

function validateInput(input: CalculationInput): string | null {
  if (!input.capital || input.capital <= 0) {
    return 'Capital must be greater than 0';
  }
  
  if (!input.riskPercent || input.riskPercent <= 0 || input.riskPercent > 100) {
    return 'Risk percent must be between 0 and 100';
  }
  
  if (!input.entryPrice || input.entryPrice <= 0) {
    return 'Entry price must be greater than 0';
  }
  
  if (!input.stopLoss || input.stopLoss <= 0) {
    return 'Stop loss must be greater than 0';
  }
  
  if (input.entryPrice === input.stopLoss) {
    return 'Entry price and stop loss cannot be the same';
  }
  
  if (input.takeProfit !== undefined && input.takeProfit <= 0) {
    return 'Take profit must be greater than 0';
  }
  
  return null;
}

// ============================================
// CONVERSION HELPERS
// ============================================

/**
 * Get exchange rate between two currencies
 * Exchange rates are in format: "EURUSD": 1.08 means 1 EUR = 1.08 USD
 */
function getExchangeRate(
  fromCurrency: string,
  toCurrency: string,
  rates: Record<string, number>
): number | null {
  // Same currency
  if (fromCurrency === toCurrency) {
    return 1;
  }
  
  // Direct pair
  const directPair = `${fromCurrency}${toCurrency}`;
  if (rates[directPair]) {
    return rates[directPair];
  }
  
  // Inverse pair
  const inversePair = `${toCurrency}${fromCurrency}`;
  if (rates[inversePair]) {
    return 1 / rates[inversePair];
  }
  
  // Try through USD
  if (fromCurrency !== 'USD' && toCurrency !== 'USD') {
    const fromToUsd = getExchangeRate(fromCurrency, 'USD', rates);
    const usdToTarget = getExchangeRate('USD', toCurrency, rates);
    if (fromToUsd && usdToTarget) {
      return fromToUsd * usdToTarget;
    }
  }
  
  return null;
}

/**
 * Convert amount from one currency to another
 */
function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  rates: Record<string, number>
): { value: number; rate: number } | null {
  const rate = getExchangeRate(fromCurrency, toCurrency, rates);
  if (rate === null) return null;
  return { value: amount * rate, rate };
}

// ============================================
// CORE CALCULATION
// ============================================

/**
 * Calculate position size with full deterministic logic
 */
export function calculatePosition(
  input: CalculationInput
): CalculationResult | CalculationError {
  // Validate input
  const validationError = validateInput(input);
  if (validationError) {
    return { error: validationError, code: 'INVALID_INPUT' };
  }
  
  const { capital, riskPercent, accountCurrency, asset, entryPrice, stopLoss, takeProfit, exchangeRates } = input;
  const warnings: string[] = [];
  
  // ============================================
  // STEP 1: Determine direction
  // ============================================
  const direction: 'BUY' | 'SELL' = entryPrice > stopLoss ? 'BUY' : 'SELL';
  
  // ============================================
  // STEP 2: Calculate risk amount
  // ============================================
  const riskAmount = capital * (riskPercent / 100);
  
  // ============================================
  // STEP 3: Calculate SL distance
  // ============================================
  const slDistancePrice = Math.abs(entryPrice - stopLoss);
  const slDistancePips = slDistancePrice / asset.pipSize;
  
  // ============================================
  // STEP 4: Calculate pip value in quote currency
  // For most assets: pipValue = contractSize × pipSize
  // ============================================
  const pipValueInQuote = asset.contractSize * asset.pipSize;
  
  // ============================================
  // STEP 5: Convert pip value to account currency
  // ============================================
  let pipValueInAccount = pipValueInQuote;
  let conversionRate = 1;
  
  if (asset.quoteCurrency !== accountCurrency) {
    const conversion = convertCurrency(
      pipValueInQuote,
      asset.quoteCurrency,
      accountCurrency,
      exchangeRates
    );
    
    if (!conversion) {
      return {
        error: `Cannot convert ${asset.quoteCurrency} to ${accountCurrency}. Missing exchange rate.`,
        code: 'MISSING_RATE'
      };
    }
    
    pipValueInAccount = conversion.value;
    conversionRate = conversion.rate;
  }
  
  // ============================================
  // STEP 6: Calculate lot size
  // LotSize = RiskAmount / (SL_Pips × PipValue_in_Account)
  // ============================================
  const rawLotSize = riskAmount / (slDistancePips * pipValueInAccount);
  
  // ============================================
  // STEP 7: Round lot size DOWN to nearest lot step
  // Always round DOWN to ensure we don't exceed risk
  // ============================================
  const lotSteps = Math.floor(rawLotSize / asset.lotStep);
  let lotSize = lotSteps * asset.lotStep;
  
  // Ensure minimum lot
  if (lotSize < asset.minLot) {
    lotSize = asset.minLot;
    warnings.push(`Lot size adjusted to minimum: ${asset.minLot}`);
  }
  
  // Ensure maximum lot
  if (lotSize > asset.maxLot) {
    lotSize = asset.maxLot;
    warnings.push(`Lot size limited to maximum: ${asset.maxLot}`);
  }
  
  // ============================================
  // STEP 8: Calculate actual risk after rounding
  // ============================================
  const actualRisk = lotSize * slDistancePips * pipValueInAccount;
  const potentialLoss = actualRisk;
  
  // ============================================
  // STEP 9: Calculate TP details (if provided)
  // ============================================
  let tpDistancePips: number | undefined;
  let tpDistancePrice: number | undefined;
  let potentialProfit: number | undefined;
  let riskReward: number | undefined;
  
  if (takeProfit !== undefined) {
    // Validate TP direction
    const isValidTp = direction === 'BUY' 
      ? takeProfit > entryPrice 
      : takeProfit < entryPrice;
    
    if (isValidTp) {
      tpDistancePrice = Math.abs(takeProfit - entryPrice);
      tpDistancePips = tpDistancePrice / asset.pipSize;
      potentialProfit = lotSize * tpDistancePips * pipValueInAccount;
      riskReward = potentialProfit / actualRisk;
    } else {
      warnings.push('Take profit is on the wrong side of entry price');
    }
  }
  
  // ============================================
  // STEP 10: Generate warnings/advice
  // ============================================
  
  // Risk too high
  if (riskPercent > 5) {
    warnings.push('High risk: Consider reducing to 1-2% per trade');
  }
  
  // SL too tight (less than 5 pips for forex)
  if (asset.type === 'forex' && slDistancePips < 5) {
    warnings.push('Very tight SL: Consider wider stop for market volatility');
  }
  
  // Poor RR ratio
  if (riskReward !== undefined && riskReward < 1) {
    warnings.push('Risk/Reward below 1:1 - Consider adjusting TP or SL');
  }
  
  // Large deviation from target risk
  const riskDeviation = Math.abs(riskAmount - actualRisk) / riskAmount;
  if (riskDeviation > 0.1) {
    warnings.push(`Actual risk differs from target by ${(riskDeviation * 100).toFixed(1)}% due to lot step rounding`);
  }
  
  // ============================================
  // RETURN RESULT
  // ============================================
  return {
    direction,
    lotSize: Number(lotSize.toFixed(2)),
    riskAmount: Number(riskAmount.toFixed(2)),
    actualRisk: Number(actualRisk.toFixed(2)),
    slDistancePips: Number(slDistancePips.toFixed(1)),
    slDistancePrice: Number(slDistancePrice.toFixed(asset.priceDecimals)),
    potentialLoss: Number(potentialLoss.toFixed(2)),
    tpDistancePips: tpDistancePips !== undefined ? Number(tpDistancePips.toFixed(1)) : undefined,
    tpDistancePrice: tpDistancePrice !== undefined ? Number(tpDistancePrice.toFixed(asset.priceDecimals)) : undefined,
    potentialProfit: potentialProfit !== undefined ? Number(potentialProfit.toFixed(2)) : undefined,
    riskReward: riskReward !== undefined ? Number(riskReward.toFixed(2)) : undefined,
    pipValueInQuote: Number(pipValueInQuote.toFixed(4)),
    pipValueInAccount: Number(pipValueInAccount.toFixed(4)),
    conversionRate: Number(conversionRate.toFixed(6)),
    warnings,
  };
}

/**
 * Type guard to check if result is an error
 */
export function isCalculationError(
  result: CalculationResult | CalculationError
): result is CalculationError {
  return 'error' in result;
}
