/**
 * Asset Configurations for Position Size Calculator
 * 
 * This file defines ALL asset-specific parameters needed for lot size calculation.
 * Values are based on MT4/MT5/TradingView standards.
 * 
 * IMPORTANT: These are default broker values. Actual values may vary by broker.
 */

export type AssetType = 'forex' | 'forex_jpy' | 'metal' | 'index' | 'crypto' | 'energy' | 'stock';

export interface AssetConfig {
  symbol: string;
  type: AssetType;
  
  // Pip/Point definition
  pipSize: number;        // Size of one pip (0.0001 for forex, 0.01 for JPY pairs, 0.01 for gold)
  
  // Contract specification
  contractSize: number;   // Units per 1 lot (100000 for forex, 100 for gold)
  
  // Lot constraints
  minLot: number;         // Minimum tradeable lot
  maxLot: number;         // Maximum tradeable lot
  lotStep: number;        // Lot increment step
  
  // Quote currency (for conversion)
  quoteCurrency: string;  // Currency of the profit (USD for EURUSD, JPY for USDJPY)
  
  // Display
  priceDecimals: number;  // Number of decimals for price display
  pipDecimals: number;    // Number of decimals for pip display
}

/**
 * Calculate pip value in quote currency for 1 standard lot
 * Formula: pipValue = contractSize × pipSize
 */
export const calculatePipValue = (config: AssetConfig): number => {
  return config.contractSize * config.pipSize;
};

/**
 * Calculate pips from price distance
 * Formula: pips = priceDistance / pipSize
 */
export const calculatePips = (priceDistance: number, pipSize: number): number => {
  if (pipSize === 0) return 0;
  return Math.abs(priceDistance) / pipSize;
};

// ============================================================================
// FOREX MAJORS
// ============================================================================
const FOREX_MAJORS: AssetConfig[] = [
  {
    symbol: 'EUR/USD',
    type: 'forex',
    pipSize: 0.0001,
    contractSize: 100000,
    minLot: 0.01,
    maxLot: 100,
    lotStep: 0.01,
    quoteCurrency: 'USD',
    priceDecimals: 5,
    pipDecimals: 1,
  },
  {
    symbol: 'GBP/USD',
    type: 'forex',
    pipSize: 0.0001,
    contractSize: 100000,
    minLot: 0.01,
    maxLot: 100,
    lotStep: 0.01,
    quoteCurrency: 'USD',
    priceDecimals: 5,
    pipDecimals: 1,
  },
  {
    symbol: 'AUD/USD',
    type: 'forex',
    pipSize: 0.0001,
    contractSize: 100000,
    minLot: 0.01,
    maxLot: 100,
    lotStep: 0.01,
    quoteCurrency: 'USD',
    priceDecimals: 5,
    pipDecimals: 1,
  },
  {
    symbol: 'NZD/USD',
    type: 'forex',
    pipSize: 0.0001,
    contractSize: 100000,
    minLot: 0.01,
    maxLot: 100,
    lotStep: 0.01,
    quoteCurrency: 'USD',
    priceDecimals: 5,
    pipDecimals: 1,
  },
  {
    symbol: 'USD/CAD',
    type: 'forex',
    pipSize: 0.0001,
    contractSize: 100000,
    minLot: 0.01,
    maxLot: 100,
    lotStep: 0.01,
    quoteCurrency: 'CAD',
    priceDecimals: 5,
    pipDecimals: 1,
  },
  {
    symbol: 'USD/CHF',
    type: 'forex',
    pipSize: 0.0001,
    contractSize: 100000,
    minLot: 0.01,
    maxLot: 100,
    lotStep: 0.01,
    quoteCurrency: 'CHF',
    priceDecimals: 5,
    pipDecimals: 1,
  },
];

// ============================================================================
// FOREX JPY PAIRS
// ============================================================================
const FOREX_JPY: AssetConfig[] = [
  {
    symbol: 'USD/JPY',
    type: 'forex_jpy',
    pipSize: 0.01,
    contractSize: 100000,
    minLot: 0.01,
    maxLot: 100,
    lotStep: 0.01,
    quoteCurrency: 'JPY',
    priceDecimals: 3,
    pipDecimals: 1,
  },
  {
    symbol: 'EUR/JPY',
    type: 'forex_jpy',
    pipSize: 0.01,
    contractSize: 100000,
    minLot: 0.01,
    maxLot: 100,
    lotStep: 0.01,
    quoteCurrency: 'JPY',
    priceDecimals: 3,
    pipDecimals: 1,
  },
  {
    symbol: 'GBP/JPY',
    type: 'forex_jpy',
    pipSize: 0.01,
    contractSize: 100000,
    minLot: 0.01,
    maxLot: 100,
    lotStep: 0.01,
    quoteCurrency: 'JPY',
    priceDecimals: 3,
    pipDecimals: 1,
  },
  {
    symbol: 'AUD/JPY',
    type: 'forex_jpy',
    pipSize: 0.01,
    contractSize: 100000,
    minLot: 0.01,
    maxLot: 100,
    lotStep: 0.01,
    quoteCurrency: 'JPY',
    priceDecimals: 3,
    pipDecimals: 1,
  },
  {
    symbol: 'CAD/JPY',
    type: 'forex_jpy',
    pipSize: 0.01,
    contractSize: 100000,
    minLot: 0.01,
    maxLot: 100,
    lotStep: 0.01,
    quoteCurrency: 'JPY',
    priceDecimals: 3,
    pipDecimals: 1,
  },
  {
    symbol: 'CHF/JPY',
    type: 'forex_jpy',
    pipSize: 0.01,
    contractSize: 100000,
    minLot: 0.01,
    maxLot: 100,
    lotStep: 0.01,
    quoteCurrency: 'JPY',
    priceDecimals: 3,
    pipDecimals: 1,
  },
  {
    symbol: 'NZD/JPY',
    type: 'forex_jpy',
    pipSize: 0.01,
    contractSize: 100000,
    minLot: 0.01,
    maxLot: 100,
    lotStep: 0.01,
    quoteCurrency: 'JPY',
    priceDecimals: 3,
    pipDecimals: 1,
  },
];

// ============================================================================
// FOREX CROSSES
// ============================================================================
const FOREX_CROSSES: AssetConfig[] = [
  {
    symbol: 'EUR/GBP',
    type: 'forex',
    pipSize: 0.0001,
    contractSize: 100000,
    minLot: 0.01,
    maxLot: 100,
    lotStep: 0.01,
    quoteCurrency: 'GBP',
    priceDecimals: 5,
    pipDecimals: 1,
  },
  {
    symbol: 'EUR/CHF',
    type: 'forex',
    pipSize: 0.0001,
    contractSize: 100000,
    minLot: 0.01,
    maxLot: 100,
    lotStep: 0.01,
    quoteCurrency: 'CHF',
    priceDecimals: 5,
    pipDecimals: 1,
  },
  {
    symbol: 'EUR/AUD',
    type: 'forex',
    pipSize: 0.0001,
    contractSize: 100000,
    minLot: 0.01,
    maxLot: 100,
    lotStep: 0.01,
    quoteCurrency: 'AUD',
    priceDecimals: 5,
    pipDecimals: 1,
  },
  {
    symbol: 'EUR/CAD',
    type: 'forex',
    pipSize: 0.0001,
    contractSize: 100000,
    minLot: 0.01,
    maxLot: 100,
    lotStep: 0.01,
    quoteCurrency: 'CAD',
    priceDecimals: 5,
    pipDecimals: 1,
  },
  {
    symbol: 'EUR/NZD',
    type: 'forex',
    pipSize: 0.0001,
    contractSize: 100000,
    minLot: 0.01,
    maxLot: 100,
    lotStep: 0.01,
    quoteCurrency: 'NZD',
    priceDecimals: 5,
    pipDecimals: 1,
  },
  {
    symbol: 'GBP/CHF',
    type: 'forex',
    pipSize: 0.0001,
    contractSize: 100000,
    minLot: 0.01,
    maxLot: 100,
    lotStep: 0.01,
    quoteCurrency: 'CHF',
    priceDecimals: 5,
    pipDecimals: 1,
  },
  {
    symbol: 'GBP/AUD',
    type: 'forex',
    pipSize: 0.0001,
    contractSize: 100000,
    minLot: 0.01,
    maxLot: 100,
    lotStep: 0.01,
    quoteCurrency: 'AUD',
    priceDecimals: 5,
    pipDecimals: 1,
  },
  {
    symbol: 'GBP/CAD',
    type: 'forex',
    pipSize: 0.0001,
    contractSize: 100000,
    minLot: 0.01,
    maxLot: 100,
    lotStep: 0.01,
    quoteCurrency: 'CAD',
    priceDecimals: 5,
    pipDecimals: 1,
  },
  {
    symbol: 'GBP/NZD',
    type: 'forex',
    pipSize: 0.0001,
    contractSize: 100000,
    minLot: 0.01,
    maxLot: 100,
    lotStep: 0.01,
    quoteCurrency: 'NZD',
    priceDecimals: 5,
    pipDecimals: 1,
  },
  {
    symbol: 'AUD/CAD',
    type: 'forex',
    pipSize: 0.0001,
    contractSize: 100000,
    minLot: 0.01,
    maxLot: 100,
    lotStep: 0.01,
    quoteCurrency: 'CAD',
    priceDecimals: 5,
    pipDecimals: 1,
  },
  {
    symbol: 'AUD/CHF',
    type: 'forex',
    pipSize: 0.0001,
    contractSize: 100000,
    minLot: 0.01,
    maxLot: 100,
    lotStep: 0.01,
    quoteCurrency: 'CHF',
    priceDecimals: 5,
    pipDecimals: 1,
  },
  {
    symbol: 'AUD/NZD',
    type: 'forex',
    pipSize: 0.0001,
    contractSize: 100000,
    minLot: 0.01,
    maxLot: 100,
    lotStep: 0.01,
    quoteCurrency: 'NZD',
    priceDecimals: 5,
    pipDecimals: 1,
  },
  {
    symbol: 'CAD/CHF',
    type: 'forex',
    pipSize: 0.0001,
    contractSize: 100000,
    minLot: 0.01,
    maxLot: 100,
    lotStep: 0.01,
    quoteCurrency: 'CHF',
    priceDecimals: 5,
    pipDecimals: 1,
  },
  {
    symbol: 'NZD/CAD',
    type: 'forex',
    pipSize: 0.0001,
    contractSize: 100000,
    minLot: 0.01,
    maxLot: 100,
    lotStep: 0.01,
    quoteCurrency: 'CAD',
    priceDecimals: 5,
    pipDecimals: 1,
  },
  {
    symbol: 'NZD/CHF',
    type: 'forex',
    pipSize: 0.0001,
    contractSize: 100000,
    minLot: 0.01,
    maxLot: 100,
    lotStep: 0.01,
    quoteCurrency: 'CHF',
    priceDecimals: 5,
    pipDecimals: 1,
  },
];

// ============================================================================
// METALS
// ============================================================================
const METALS: AssetConfig[] = [
  {
    symbol: 'XAU/USD',
    type: 'metal',
    pipSize: 0.01,           // 1 pip = $0.01 movement
    contractSize: 100,        // 1 lot = 100 ounces
    minLot: 0.01,
    maxLot: 100,
    lotStep: 0.01,
    quoteCurrency: 'USD',
    priceDecimals: 2,
    pipDecimals: 0,
  },
  {
    symbol: 'XAG/USD',
    type: 'metal',
    pipSize: 0.001,          // 1 pip = $0.001 movement
    contractSize: 5000,       // 1 lot = 5000 ounces
    minLot: 0.01,
    maxLot: 100,
    lotStep: 0.01,
    quoteCurrency: 'USD',
    priceDecimals: 3,
    pipDecimals: 0,
  },
  {
    symbol: 'XPT/USD',
    type: 'metal',
    pipSize: 0.01,
    contractSize: 100,
    minLot: 0.01,
    maxLot: 50,
    lotStep: 0.01,
    quoteCurrency: 'USD',
    priceDecimals: 2,
    pipDecimals: 0,
  },
  {
    symbol: 'XPD/USD',
    type: 'metal',
    pipSize: 0.01,
    contractSize: 100,
    minLot: 0.01,
    maxLot: 50,
    lotStep: 0.01,
    quoteCurrency: 'USD',
    priceDecimals: 2,
    pipDecimals: 0,
  },
];

// ============================================================================
// INDICES
// ============================================================================
const INDICES: AssetConfig[] = [
  {
    symbol: 'US30',
    type: 'index',
    pipSize: 1,              // 1 point = $1 movement
    contractSize: 1,          // 1 lot = 1 contract
    minLot: 0.01,
    maxLot: 100,
    lotStep: 0.01,
    quoteCurrency: 'USD',
    priceDecimals: 0,
    pipDecimals: 0,
  },
  {
    symbol: 'US100',
    type: 'index',
    pipSize: 1,
    contractSize: 1,
    minLot: 0.01,
    maxLot: 100,
    lotStep: 0.01,
    quoteCurrency: 'USD',
    priceDecimals: 1,
    pipDecimals: 0,
  },
  {
    symbol: 'US500',
    type: 'index',
    pipSize: 0.1,
    contractSize: 10,
    minLot: 0.01,
    maxLot: 100,
    lotStep: 0.01,
    quoteCurrency: 'USD',
    priceDecimals: 1,
    pipDecimals: 1,
  },
  {
    symbol: 'US2000',
    type: 'index',
    pipSize: 0.1,
    contractSize: 1,
    minLot: 0.01,
    maxLot: 100,
    lotStep: 0.01,
    quoteCurrency: 'USD',
    priceDecimals: 1,
    pipDecimals: 1,
  },
  {
    symbol: 'GER40',
    type: 'index',
    pipSize: 1,
    contractSize: 1,
    minLot: 0.01,
    maxLot: 100,
    lotStep: 0.01,
    quoteCurrency: 'EUR',
    priceDecimals: 0,
    pipDecimals: 0,
  },
  {
    symbol: 'UK100',
    type: 'index',
    pipSize: 1,
    contractSize: 1,
    minLot: 0.01,
    maxLot: 100,
    lotStep: 0.01,
    quoteCurrency: 'GBP',
    priceDecimals: 0,
    pipDecimals: 0,
  },
  {
    symbol: 'FRA40',
    type: 'index',
    pipSize: 1,
    contractSize: 1,
    minLot: 0.01,
    maxLot: 100,
    lotStep: 0.01,
    quoteCurrency: 'EUR',
    priceDecimals: 0,
    pipDecimals: 0,
  },
  {
    symbol: 'JPN225',
    type: 'index',
    pipSize: 1,
    contractSize: 100,
    minLot: 0.01,
    maxLot: 100,
    lotStep: 0.01,
    quoteCurrency: 'JPY',
    priceDecimals: 0,
    pipDecimals: 0,
  },
  {
    symbol: 'AUS200',
    type: 'index',
    pipSize: 1,
    contractSize: 1,
    minLot: 0.01,
    maxLot: 100,
    lotStep: 0.01,
    quoteCurrency: 'AUD',
    priceDecimals: 0,
    pipDecimals: 0,
  },
  {
    symbol: 'HK50',
    type: 'index',
    pipSize: 1,
    contractSize: 1,
    minLot: 0.01,
    maxLot: 100,
    lotStep: 0.01,
    quoteCurrency: 'HKD',
    priceDecimals: 0,
    pipDecimals: 0,
  },
  {
    symbol: 'EU50',
    type: 'index',
    pipSize: 1,
    contractSize: 1,
    minLot: 0.01,
    maxLot: 100,
    lotStep: 0.01,
    quoteCurrency: 'EUR',
    priceDecimals: 0,
    pipDecimals: 0,
  },
];

// ============================================================================
// CRYPTO
// ============================================================================
const CRYPTO: AssetConfig[] = [
  {
    symbol: 'BTC/USD',
    type: 'crypto',
    pipSize: 1,              // 1 point = $1 movement
    contractSize: 1,          // 1 lot = 1 BTC
    minLot: 0.01,
    maxLot: 50,
    lotStep: 0.01,
    quoteCurrency: 'USD',
    priceDecimals: 1,
    pipDecimals: 0,
  },
  {
    symbol: 'ETH/USD',
    type: 'crypto',
    pipSize: 0.1,
    contractSize: 1,
    minLot: 0.01,
    maxLot: 100,
    lotStep: 0.01,
    quoteCurrency: 'USD',
    priceDecimals: 2,
    pipDecimals: 1,
  },
  {
    symbol: 'SOL/USD',
    type: 'crypto',
    pipSize: 0.01,
    contractSize: 1,
    minLot: 0.1,
    maxLot: 1000,
    lotStep: 0.1,
    quoteCurrency: 'USD',
    priceDecimals: 2,
    pipDecimals: 2,
  },
  {
    symbol: 'XRP/USD',
    type: 'crypto',
    pipSize: 0.0001,
    contractSize: 100,
    minLot: 0.1,
    maxLot: 1000,
    lotStep: 0.1,
    quoteCurrency: 'USD',
    priceDecimals: 4,
    pipDecimals: 0,
  },
  {
    symbol: 'BNB/USD',
    type: 'crypto',
    pipSize: 0.1,
    contractSize: 1,
    minLot: 0.01,
    maxLot: 500,
    lotStep: 0.01,
    quoteCurrency: 'USD',
    priceDecimals: 2,
    pipDecimals: 1,
  },
  {
    symbol: 'ADA/USD',
    type: 'crypto',
    pipSize: 0.0001,
    contractSize: 1000,
    minLot: 0.1,
    maxLot: 1000,
    lotStep: 0.1,
    quoteCurrency: 'USD',
    priceDecimals: 4,
    pipDecimals: 0,
  },
  {
    symbol: 'DOGE/USD',
    type: 'crypto',
    pipSize: 0.00001,
    contractSize: 10000,
    minLot: 0.1,
    maxLot: 1000,
    lotStep: 0.1,
    quoteCurrency: 'USD',
    priceDecimals: 5,
    pipDecimals: 0,
  },
  {
    symbol: 'DOT/USD',
    type: 'crypto',
    pipSize: 0.001,
    contractSize: 100,
    minLot: 0.1,
    maxLot: 1000,
    lotStep: 0.1,
    quoteCurrency: 'USD',
    priceDecimals: 3,
    pipDecimals: 0,
  },
  {
    symbol: 'AVAX/USD',
    type: 'crypto',
    pipSize: 0.01,
    contractSize: 10,
    minLot: 0.1,
    maxLot: 1000,
    lotStep: 0.1,
    quoteCurrency: 'USD',
    priceDecimals: 2,
    pipDecimals: 2,
  },
  {
    symbol: 'MATIC/USD',
    type: 'crypto',
    pipSize: 0.0001,
    contractSize: 1000,
    minLot: 0.1,
    maxLot: 1000,
    lotStep: 0.1,
    quoteCurrency: 'USD',
    priceDecimals: 4,
    pipDecimals: 0,
  },
  {
    symbol: 'LINK/USD',
    type: 'crypto',
    pipSize: 0.01,
    contractSize: 100,
    minLot: 0.1,
    maxLot: 1000,
    lotStep: 0.1,
    quoteCurrency: 'USD',
    priceDecimals: 2,
    pipDecimals: 2,
  },
  {
    symbol: 'LTC/USD',
    type: 'crypto',
    pipSize: 0.01,
    contractSize: 1,
    minLot: 0.1,
    maxLot: 500,
    lotStep: 0.1,
    quoteCurrency: 'USD',
    priceDecimals: 2,
    pipDecimals: 2,
  },
];

// ============================================================================
// ENERGIES
// ============================================================================
const ENERGIES: AssetConfig[] = [
  {
    symbol: 'USOIL',
    type: 'energy',
    pipSize: 0.01,
    contractSize: 1000,      // 1 lot = 1000 barrels
    minLot: 0.01,
    maxLot: 100,
    lotStep: 0.01,
    quoteCurrency: 'USD',
    priceDecimals: 2,
    pipDecimals: 0,
  },
  {
    symbol: 'UKOIL',
    type: 'energy',
    pipSize: 0.01,
    contractSize: 1000,
    minLot: 0.01,
    maxLot: 100,
    lotStep: 0.01,
    quoteCurrency: 'USD',
    priceDecimals: 2,
    pipDecimals: 0,
  },
  {
    symbol: 'NATGAS',
    type: 'energy',
    pipSize: 0.001,
    contractSize: 10000,
    minLot: 0.01,
    maxLot: 100,
    lotStep: 0.01,
    quoteCurrency: 'USD',
    priceDecimals: 3,
    pipDecimals: 0,
  },
];

// ============================================================================
// ALL ASSETS COMBINED
// ============================================================================
export const ALL_ASSET_CONFIGS: AssetConfig[] = [
  ...FOREX_MAJORS,
  ...FOREX_JPY,
  ...FOREX_CROSSES,
  ...METALS,
  ...INDICES,
  ...CRYPTO,
  ...ENERGIES,
];

/**
 * Get asset configuration by symbol
 */
export const getAssetConfig = (symbol: string): AssetConfig | null => {
  // Normalize symbol (remove spaces, uppercase)
  const normalized = symbol.replace(/\s/g, '').toUpperCase();
  
  // Try exact match first
  let config = ALL_ASSET_CONFIGS.find(c => c.symbol.replace(/\s/g, '').toUpperCase() === normalized);
  
  // Try with/without slash
  if (!config) {
    const withSlash = normalized.replace(/([A-Z]{3})([A-Z]{3})/, '$1/$2');
    config = ALL_ASSET_CONFIGS.find(c => c.symbol.replace(/\s/g, '').toUpperCase() === withSlash);
  }
  
  // Try without slash
  if (!config) {
    const withoutSlash = normalized.replace('/', '');
    config = ALL_ASSET_CONFIGS.find(c => c.symbol.replace('/', '').toUpperCase() === withoutSlash);
  }
  
  return config || null;
};

/**
 * Create a dynamic/custom asset config for unknown assets
 */
export const createCustomAssetConfig = (
  symbol: string,
  type: AssetType = 'forex',
  quoteCurrency: string = 'USD'
): AssetConfig => {
  const isJpy = symbol.includes('JPY');
  
  const baseConfig: Record<AssetType, Partial<AssetConfig>> = {
    forex: { pipSize: 0.0001, contractSize: 100000, priceDecimals: 5 },
    forex_jpy: { pipSize: 0.01, contractSize: 100000, priceDecimals: 3 },
    metal: { pipSize: 0.01, contractSize: 100, priceDecimals: 2 },
    index: { pipSize: 1, contractSize: 1, priceDecimals: 0 },
    crypto: { pipSize: 1, contractSize: 1, priceDecimals: 2 },
    energy: { pipSize: 0.01, contractSize: 1000, priceDecimals: 2 },
    stock: { pipSize: 0.01, contractSize: 1, priceDecimals: 2 },
  };
  
  const typeToUse = isJpy ? 'forex_jpy' : type;
  const base = baseConfig[typeToUse];
  
  return {
    symbol,
    type: typeToUse,
    pipSize: base.pipSize!,
    contractSize: base.contractSize!,
    minLot: 0.01,
    maxLot: 100,
    lotStep: 0.01,
    quoteCurrency,
    priceDecimals: base.priceDecimals!,
    pipDecimals: 1,
  };
};

/**
 * Get list of all available symbols grouped by category
 */
export const getAssetsByCategory = (): Record<string, string[]> => {
  return {
    'Forex Majors': FOREX_MAJORS.map(a => a.symbol),
    'Forex JPY': FOREX_JPY.map(a => a.symbol),
    'Forex Crosses': FOREX_CROSSES.map(a => a.symbol),
    'Metals': METALS.map(a => a.symbol),
    'Indices': INDICES.map(a => a.symbol),
    'Crypto': CRYPTO.map(a => a.symbol),
    'Energies': ENERGIES.map(a => a.symbol),
  };
};

/**
 * Get all available symbols as flat array
 */
export const getAllSymbols = (): string[] => {
  return ALL_ASSET_CONFIGS.map(a => a.symbol);
};
