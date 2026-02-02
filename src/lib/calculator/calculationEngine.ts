/**
 * Position Size Calculation Engine
 * 
 * Core calculation logic for determining optimal lot size based on:
 * - Account capital and risk parameters
 * - Entry, Stop Loss, and Take Profit prices
 * - Asset specifications (pip size, contract size, quote currency)
 * - Account currency with automatic conversion
 * 
 * FORMULA (Universal):
 * LotSize = RiskAmount / (PipsAtRisk × PipValueInAccountCurrency)
 * 
 * Where:
 * - RiskAmount = Capital × (RiskPercent / 100)
 * - PipsAtRisk = |Entry - StopLoss| / PipSize
 * - PipValue = ContractSize × PipSize (in quote currency)
 * - PipValueInAccountCurrency = PipValue × ConversionRate
 */

import { AssetConfig, calculatePips } from './assetConfigs';

// ============================================================================
// TYPES
// ============================================================================

export interface CalculatorInput {
  // Account parameters
  capital: number;
  riskPercent: number;
  accountCurrency: string;
  
  // Trade parameters
  asset: AssetConfig;
  entryPrice: number;
  stopLoss: number;
  takeProfit?: number;
  
  // Exchange rates for conversion (quote currency to account currency)
  exchangeRates: Record<string, number>;
}

export interface CalculationResult {
  // Main result
  lotSize: number;
  
  // Risk details
  riskAmount: number;           // Amount at risk in account currency
  actualRisk: number;           // Actual risk after lot rounding
  
  // Stop Loss details
  slDistancePrice: number;      // Price distance to SL
  slDistancePips: number;       // Pips to SL
  potentialLoss: number;        // Potential loss in account currency
  
  // Take Profit details (optional)
  tpDistancePrice?: number;
  tpDistancePips?: number;
  potentialProfit?: number;
  
  // Risk/Reward
  riskRewardRatio?: number;
  
  // Position direction
  direction: 'BUY' | 'SELL';
  
  // Conversion info
  pipValueQuote: number;        // Pip value in quote currency
  pipValueAccount: number;      // Pip value in account currency
  conversionRate: number;       // Rate used for conversion
  
  // Warnings
  warnings: string[];
}

export interface CalculationError {
  error: string;
  code: 'INVALID_CAPITAL' | 'INVALID_SL' | 'INVALID_ENTRY' | 'MISSING_RATE' | 'CALCULATION_ERROR';
}

// ============================================================================
// CORE CALCULATION
// ============================================================================

/**
 * Main calculation function
 * 
 * @param input - All required calculation parameters
 * @returns CalculationResult or CalculationError
 */
export const calculatePosition = (input: CalculatorInput): CalculationResult | CalculationError => {
  const warnings: string[] = [];
  
  // =========================================================================
  // STEP 1: Validate inputs
  // =========================================================================
  
  if (!input.capital || input.capital <= 0) {
    return { error: 'Capital must be greater than 0', code: 'INVALID_CAPITAL' };
  }
  
  if (!input.riskPercent || input.riskPercent <= 0 || input.riskPercent > 100) {
    return { error: 'Risk percent must be between 0 and 100', code: 'INVALID_CAPITAL' };
  }
  
  if (!input.entryPrice || input.entryPrice <= 0) {
    return { error: 'Entry price must be greater than 0', code: 'INVALID_ENTRY' };
  }
  
  if (!input.stopLoss || input.stopLoss <= 0) {
    return { error: 'Stop Loss must be greater than 0', code: 'INVALID_SL' };
  }
  
  if (input.entryPrice === input.stopLoss) {
    return { error: 'Entry and Stop Loss cannot be the same', code: 'INVALID_SL' };
  }
  
  // =========================================================================
  // STEP 2: Determine direction
  // =========================================================================
  
  const direction: 'BUY' | 'SELL' = input.entryPrice > input.stopLoss ? 'BUY' : 'SELL';
  
  // =========================================================================
  // STEP 3: Calculate distances
  // =========================================================================
  
  const slDistancePrice = Math.abs(input.entryPrice - input.stopLoss);
  const slDistancePips = calculatePips(slDistancePrice, input.asset.pipSize);
  
  let tpDistancePrice: number | undefined;
  let tpDistancePips: number | undefined;
  
  if (input.takeProfit && input.takeProfit > 0) {
    tpDistancePrice = Math.abs(input.takeProfit - input.entryPrice);
    tpDistancePips = calculatePips(tpDistancePrice, input.asset.pipSize);
  }
  
  // =========================================================================
  // STEP 4: Calculate pip value
  // =========================================================================
  
  // Pip value in quote currency (per 1 lot)
  // Formula: ContractSize × PipSize
  const pipValueQuote = input.asset.contractSize * input.asset.pipSize;
  
  // =========================================================================
  // STEP 5: Currency conversion
  // =========================================================================
  
  let conversionRate = 1;
  const quoteCurrency = input.asset.quoteCurrency.toUpperCase();
  const accountCurrency = input.accountCurrency.toUpperCase();
  
  if (quoteCurrency !== accountCurrency) {
    // Get rate from quote currency to account currency
    // Rates are USD-based, so we need to handle conversions
    
    const quoteToUsd = input.exchangeRates[quoteCurrency];
    const accountToUsd = input.exchangeRates[accountCurrency];
    
    if (!quoteToUsd || !accountToUsd) {
      // Try direct pair
      const directRate = input.exchangeRates[`${quoteCurrency}/${accountCurrency}`];
      if (directRate) {
        conversionRate = directRate;
      } else {
        // Use fallback rate of 1 with warning
        warnings.push(`Missing exchange rate for ${quoteCurrency}/${accountCurrency}. Using 1:1 rate.`);
        conversionRate = 1;
      }
    } else {
      // Convert through USD
      // Quote to USD, then USD to Account
      conversionRate = accountToUsd / quoteToUsd;
    }
  }
  
  // Pip value in account currency
  const pipValueAccount = pipValueQuote * conversionRate;
  
  // =========================================================================
  // STEP 6: Calculate risk amount
  // =========================================================================
  
  const riskAmount = input.capital * (input.riskPercent / 100);
  
  // =========================================================================
  // STEP 7: Calculate lot size
  // =========================================================================
  
  // Formula: LotSize = RiskAmount / (PipsAtRisk × PipValueAccount)
  const pipValueTotal = slDistancePips * pipValueAccount;
  
  if (pipValueTotal === 0) {
    return { error: 'Cannot calculate lot size: pip value is zero', code: 'CALCULATION_ERROR' };
  }
  
  const rawLotSize = riskAmount / pipValueTotal;
  
  // =========================================================================
  // STEP 8: Round lot size (always DOWN to respect risk)
  // =========================================================================
  
  const { minLot, maxLot, lotStep } = input.asset;
  
  // Round down to nearest lot step
  const stepsDown = Math.floor(rawLotSize / lotStep);
  let finalLotSize = stepsDown * lotStep;
  
  // Apply min/max constraints
  if (finalLotSize < minLot) {
    finalLotSize = minLot;
    warnings.push(`Lot size adjusted to minimum (${minLot}). Actual risk may exceed target.`);
  }
  
  if (finalLotSize > maxLot) {
    finalLotSize = maxLot;
    warnings.push(`Lot size capped at maximum (${maxLot}).`);
  }
  
  // Round to avoid floating point issues
  const lotDecimals = -Math.log10(lotStep);
  finalLotSize = Number(finalLotSize.toFixed(Math.max(0, lotDecimals)));
  
  // =========================================================================
  // STEP 9: Calculate actual values with rounded lot
  // =========================================================================
  
  const actualRisk = finalLotSize * slDistancePips * pipValueAccount;
  const potentialLoss = actualRisk;
  
  let potentialProfit: number | undefined;
  let riskRewardRatio: number | undefined;
  
  if (tpDistancePips !== undefined && tpDistancePips > 0) {
    potentialProfit = finalLotSize * tpDistancePips * pipValueAccount;
    riskRewardRatio = Number((tpDistancePips / slDistancePips).toFixed(2));
  }
  
  // =========================================================================
  // STEP 10: Return result
  // =========================================================================
  
  return {
    lotSize: finalLotSize,
    riskAmount,
    actualRisk: Number(actualRisk.toFixed(2)),
    slDistancePrice: Number(slDistancePrice.toFixed(input.asset.priceDecimals)),
    slDistancePips: Number(slDistancePips.toFixed(input.asset.pipDecimals)),
    potentialLoss: Number(potentialLoss.toFixed(2)),
    tpDistancePrice: tpDistancePrice ? Number(tpDistancePrice.toFixed(input.asset.priceDecimals)) : undefined,
    tpDistancePips: tpDistancePips ? Number(tpDistancePips.toFixed(input.asset.pipDecimals)) : undefined,
    potentialProfit: potentialProfit ? Number(potentialProfit.toFixed(2)) : undefined,
    riskRewardRatio,
    direction,
    pipValueQuote: Number(pipValueQuote.toFixed(4)),
    pipValueAccount: Number(pipValueAccount.toFixed(4)),
    conversionRate: Number(conversionRate.toFixed(6)),
    warnings,
  };
};

/**
 * Check if result is an error
 */
export const isCalculationError = (result: CalculationResult | CalculationError): result is CalculationError => {
  return 'error' in result;
};

/**
 * Format pip display based on asset type
 */
export const formatPipsDisplay = (pips: number, assetType: string): string => {
  // For indices and crypto, show as "points" instead of "pips"
  const unit = assetType === 'index' || assetType === 'crypto' ? 'pts' : 'pips';
  
  // Format with appropriate decimals
  const decimals = pips >= 100 ? 0 : pips >= 10 ? 1 : 2;
  return `${pips.toFixed(decimals)} ${unit}`;
};

/**
 * Validate TP position relative to entry and direction
 */
export const validateTakeProfit = (
  entry: number,
  stopLoss: number,
  takeProfit: number
): { valid: boolean; error?: string } => {
  const direction = entry > stopLoss ? 'BUY' : 'SELL';
  
  if (direction === 'BUY') {
    if (takeProfit <= entry) {
      return { valid: false, error: 'Take Profit must be above Entry for BUY positions' };
    }
  } else {
    if (takeProfit >= entry) {
      return { valid: false, error: 'Take Profit must be below Entry for SELL positions' };
    }
  }
  
  return { valid: true };
};
