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

interface ValidationError {
  message: string;
  code: 'CAPITAL' | 'RISK' | 'ASSET' | 'ENTRY' | 'STOP_LOSS' | 'TAKE_PROFIT' | 'CALCULATION';
}

/**
 * Validate inputs with priority order and short user-friendly messages
 * Priority: Capital → Risk → Asset → Entry → Stop Loss → Take Profit
 */
function validateInput(input: CalculationInput, isFr: boolean = false): ValidationError | null {
  // 1. Capital validation (highest priority)
  if (!input.capital || input.capital <= 0 || !isFinite(input.capital)) {
    return {
      message: isFr ? 'Capital invalide' : 'Invalid capital',
      code: 'CAPITAL'
    };
  }
  
  // 2. Risk validation
  if (!input.riskPercent || input.riskPercent <= 0 || input.riskPercent > 10 || !isFinite(input.riskPercent)) {
    return {
      message: isFr ? 'Risque incorrect' : 'Invalid risk',
      code: 'RISK'
    };
  }
  
  // 3. Asset validation
  if (!input.asset || !input.asset.symbol) {
    return {
      message: isFr ? 'Actif non pris en charge' : 'Unsupported asset',
      code: 'ASSET'
    };
  }
  
  // 4. Entry price validation
  if (!input.entryPrice || input.entryPrice <= 0 || !isFinite(input.entryPrice)) {
    return {
      message: isFr ? "Prix d'entrée invalide" : 'Invalid entry price',
      code: 'ENTRY'
    };
  }
  
  // 5. Stop loss required
  if (!input.stopLoss || input.stopLoss <= 0 || !isFinite(input.stopLoss)) {
    return {
      message: isFr ? 'Stop loss requis' : 'Stop loss required',
      code: 'STOP_LOSS'
    };
  }
  
  // 6. Stop loss cannot equal entry
  if (input.entryPrice === input.stopLoss) {
    return {
      message: isFr ? 'Stop loss incorrect' : 'Invalid stop loss',
      code: 'STOP_LOSS'
    };
  }
  
  // 7. Determine direction and validate SL position
  const isBuy = input.entryPrice > input.stopLoss;
  
  // For BUY: SL must be below entry (already checked by direction detection)
  // For SELL: SL must be above entry (already checked by direction detection)
  // This is implicitly validated by the direction detection logic
  
  // 8. Take profit validation (if defined)
  if (input.takeProfit !== undefined && input.takeProfit > 0) {
    if (!isFinite(input.takeProfit)) {
      return {
        message: isFr ? 'Take profit incorrect' : 'Invalid take profit',
        code: 'TAKE_PROFIT'
      };
    }
    
    // Validate TP position relative to entry
    if (isBuy && input.takeProfit <= input.entryPrice) {
      return {
        message: isFr ? 'Take profit incorrect' : 'Invalid take profit',
        code: 'TAKE_PROFIT'
      };
    }
    
    if (!isBuy && input.takeProfit >= input.entryPrice) {
      return {
        message: isFr ? 'Take profit incorrect' : 'Invalid take profit',
        code: 'TAKE_PROFIT'
      };
    }
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
  input: CalculationInput,
  isFr: boolean = false
): CalculationResult | CalculationError {
  // Validate input
  const validationError = validateInput(input, isFr);
  if (validationError) {
    return { error: validationError.message, code: 'INVALID_INPUT' };
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
  
  // Validate calculation result
  if (!isFinite(rawLotSize) || isNaN(rawLotSize) || rawLotSize <= 0) {
    return {
      error: isFr ? 'Calcul impossible' : 'Calculation error',
      code: 'CALCULATION_ERROR'
    };
  }
  
  // ============================================
   // STEP 6: Round lot size DOWN to nearest lot step
  // Always round DOWN to ensure we don't exceed risk
  // ============================================
  const lotSteps = Math.floor(rawLotSize / asset.lotStep);
  let lotSize = lotSteps * asset.lotStep;
  
  // Validate final lot size
  if (!isFinite(lotSize) || isNaN(lotSize) || lotSize <= 0) {
    return {
      error: isFr ? 'Calcul impossible' : 'Calculation error',
      code: 'CALCULATION_ERROR'
    };
  }
  
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
  
  if (takeProfit !== undefined && takeProfit > 0) {
    const tpDistance = Math.abs(takeProfit - entryPrice);
    const calculatedRR = tpDistance / slDistancePrice;
    
    if (isFinite(calculatedRR) && !isNaN(calculatedRR)) {
      riskReward = calculatedRR;
    }
  }
  
  // ============================================
   // STEP 8: Generate warnings/advice (minimal)
  // ============================================
  
  // Risk too high
  if (riskPercent > 5) {
    warnings.push(isFr ? 'Risque élevé' : 'High risk');
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
