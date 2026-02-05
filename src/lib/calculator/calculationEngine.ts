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
  
  // Risk/Reward
  riskReward?: number;                 // Risk/Reward ratio
  
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
  * 
  * Formula: LotSize = RiskAmount / (SL_Distance × ContractSize × ConversionRate)
  * 
  * Contract sizes are retrieved automatically from asset configuration:
  * - Forex: 100,000 units
  * - Gold (XAUUSD): 100 oz
  * - Silver (XAGUSD): 5,000 oz
  * - Indices: 1 contract
  * - Crypto: 1 unit
  * - Oil: 1,000 barrels
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
  
  // ============================================
   // STEP 4: Get conversion rate to account currency
   // Contract size is INTERNAL - never exposed to user
  // ============================================
  let conversionRate = 1;
  
  if (asset.quoteCurrency !== accountCurrency) {
     const rate = getExchangeRate(
      asset.quoteCurrency,
      accountCurrency,
      exchangeRates
    );
    
     if (rate === null) {
      return {
        error: `Cannot convert ${asset.quoteCurrency} to ${accountCurrency}. Missing exchange rate.`,
        code: 'MISSING_RATE'
      };
    }
    
     conversionRate = rate;
  }
  
  // ============================================
   // STEP 5: Calculate lot size using the EXACT formula
   // LotSize = RiskAmount / (SL_Distance × ContractSize × ConversionRate)
   // ContractSize is from asset config (INTERNAL - never shown to user)
  // ============================================
   const rawLotSize = riskAmount / (slDistancePrice * asset.contractSize * conversionRate);
  
  // ============================================
   // STEP 6: Round lot size DOWN to nearest lot step
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
   // STEP 7: Calculate RR (if TP provided)
   // RR = TP_Distance / SL_Distance
  // ============================================
  let riskReward: number | undefined;
  
  if (takeProfit !== undefined) {
    // Validate TP direction
    const isValidTp = direction === 'BUY' 
      ? takeProfit > entryPrice 
      : takeProfit < entryPrice;
    
    if (isValidTp) {
       const tpDistance = Math.abs(takeProfit - entryPrice);
       riskReward = tpDistance / slDistancePrice;
    } else {
      warnings.push('Take profit is on the wrong side of entry price');
    }
  }
  
  // ============================================
   // STEP 8: Generate warnings/advice (minimal)
  // ============================================
  
  // Risk too high
  if (riskPercent > 5) {
    warnings.push('High risk: Consider reducing to 1-2% per trade');
  }
  
  // Poor RR ratio
  if (riskReward !== undefined && riskReward < 1) {
    warnings.push('Risk/Reward below 1:1 - Consider adjusting TP or SL');
  }
  
  // ============================================
   // RETURN RESULT - Only lot size and RR
   // NO internal values exposed (contract size, pip values, etc.)
  // ============================================
  return {
    direction,
    lotSize: Number(lotSize.toFixed(2)),
    riskReward: riskReward !== undefined ? Number(riskReward.toFixed(2)) : undefined,
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
