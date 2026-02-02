/**
 * Asset Configuration for Trading Calculator
 * 
 * All assets with proper pip sizes, contract sizes, and point values
 * aligned with MT4/MT5/TradingView standards
 */

export type AssetType = 'forex' | 'crypto' | 'index' | 'commodity' | 'stock' | 'etf';

export interface AssetConfig {
  symbol: string;
  name: string;
  type: AssetType;
  category: string;
  pipSize: number;           // Minimum price movement (pip/point)
  contractSize: number;      // Units per 1 lot
  pipValue: number;          // Value per pip for 1 lot in quote currency
  priceDecimals: number;     // Number of decimals in price
  lotStep: number;           // Minimum lot increment
  minLot: number;            // Minimum lot size
  maxLot: number;            // Maximum lot size
  quoteCurrency: string;     // Quote currency for conversions
}

// ============================================
// FOREX - MAJORS
// ============================================
const FOREX_MAJORS: AssetConfig[] = [
  { symbol: 'EURUSD', name: 'Euro / US Dollar', type: 'forex', category: 'Forex Majors', pipSize: 0.0001, contractSize: 100000, pipValue: 10, priceDecimals: 5, lotStep: 0.01, minLot: 0.01, maxLot: 100, quoteCurrency: 'USD' },
  { symbol: 'GBPUSD', name: 'British Pound / US Dollar', type: 'forex', category: 'Forex Majors', pipSize: 0.0001, contractSize: 100000, pipValue: 10, priceDecimals: 5, lotStep: 0.01, minLot: 0.01, maxLot: 100, quoteCurrency: 'USD' },
  { symbol: 'USDJPY', name: 'US Dollar / Japanese Yen', type: 'forex', category: 'Forex Majors', pipSize: 0.01, contractSize: 100000, pipValue: 1000, priceDecimals: 3, lotStep: 0.01, minLot: 0.01, maxLot: 100, quoteCurrency: 'JPY' },
  { symbol: 'USDCHF', name: 'US Dollar / Swiss Franc', type: 'forex', category: 'Forex Majors', pipSize: 0.0001, contractSize: 100000, pipValue: 10, priceDecimals: 5, lotStep: 0.01, minLot: 0.01, maxLot: 100, quoteCurrency: 'CHF' },
  { symbol: 'USDCAD', name: 'US Dollar / Canadian Dollar', type: 'forex', category: 'Forex Majors', pipSize: 0.0001, contractSize: 100000, pipValue: 10, priceDecimals: 5, lotStep: 0.01, minLot: 0.01, maxLot: 100, quoteCurrency: 'CAD' },
  { symbol: 'AUDUSD', name: 'Australian Dollar / US Dollar', type: 'forex', category: 'Forex Majors', pipSize: 0.0001, contractSize: 100000, pipValue: 10, priceDecimals: 5, lotStep: 0.01, minLot: 0.01, maxLot: 100, quoteCurrency: 'USD' },
  { symbol: 'NZDUSD', name: 'New Zealand Dollar / US Dollar', type: 'forex', category: 'Forex Majors', pipSize: 0.0001, contractSize: 100000, pipValue: 10, priceDecimals: 5, lotStep: 0.01, minLot: 0.01, maxLot: 100, quoteCurrency: 'USD' },
];

// ============================================
// FOREX - MINORS
// ============================================
const FOREX_MINORS: AssetConfig[] = [
  { symbol: 'EURGBP', name: 'Euro / British Pound', type: 'forex', category: 'Forex Minors', pipSize: 0.0001, contractSize: 100000, pipValue: 10, priceDecimals: 5, lotStep: 0.01, minLot: 0.01, maxLot: 100, quoteCurrency: 'GBP' },
  { symbol: 'EURJPY', name: 'Euro / Japanese Yen', type: 'forex', category: 'Forex Minors', pipSize: 0.01, contractSize: 100000, pipValue: 1000, priceDecimals: 3, lotStep: 0.01, minLot: 0.01, maxLot: 100, quoteCurrency: 'JPY' },
  { symbol: 'EURAUD', name: 'Euro / Australian Dollar', type: 'forex', category: 'Forex Minors', pipSize: 0.0001, contractSize: 100000, pipValue: 10, priceDecimals: 5, lotStep: 0.01, minLot: 0.01, maxLot: 100, quoteCurrency: 'AUD' },
  { symbol: 'EURCAD', name: 'Euro / Canadian Dollar', type: 'forex', category: 'Forex Minors', pipSize: 0.0001, contractSize: 100000, pipValue: 10, priceDecimals: 5, lotStep: 0.01, minLot: 0.01, maxLot: 100, quoteCurrency: 'CAD' },
  { symbol: 'EURCHF', name: 'Euro / Swiss Franc', type: 'forex', category: 'Forex Minors', pipSize: 0.0001, contractSize: 100000, pipValue: 10, priceDecimals: 5, lotStep: 0.01, minLot: 0.01, maxLot: 100, quoteCurrency: 'CHF' },
  { symbol: 'EURNZD', name: 'Euro / New Zealand Dollar', type: 'forex', category: 'Forex Minors', pipSize: 0.0001, contractSize: 100000, pipValue: 10, priceDecimals: 5, lotStep: 0.01, minLot: 0.01, maxLot: 100, quoteCurrency: 'NZD' },
  { symbol: 'GBPJPY', name: 'British Pound / Japanese Yen', type: 'forex', category: 'Forex Minors', pipSize: 0.01, contractSize: 100000, pipValue: 1000, priceDecimals: 3, lotStep: 0.01, minLot: 0.01, maxLot: 100, quoteCurrency: 'JPY' },
  { symbol: 'GBPAUD', name: 'British Pound / Australian Dollar', type: 'forex', category: 'Forex Minors', pipSize: 0.0001, contractSize: 100000, pipValue: 10, priceDecimals: 5, lotStep: 0.01, minLot: 0.01, maxLot: 100, quoteCurrency: 'AUD' },
  { symbol: 'GBPCAD', name: 'British Pound / Canadian Dollar', type: 'forex', category: 'Forex Minors', pipSize: 0.0001, contractSize: 100000, pipValue: 10, priceDecimals: 5, lotStep: 0.01, minLot: 0.01, maxLot: 100, quoteCurrency: 'CAD' },
  { symbol: 'GBPCHF', name: 'British Pound / Swiss Franc', type: 'forex', category: 'Forex Minors', pipSize: 0.0001, contractSize: 100000, pipValue: 10, priceDecimals: 5, lotStep: 0.01, minLot: 0.01, maxLot: 100, quoteCurrency: 'CHF' },
  { symbol: 'GBPNZD', name: 'British Pound / New Zealand Dollar', type: 'forex', category: 'Forex Minors', pipSize: 0.0001, contractSize: 100000, pipValue: 10, priceDecimals: 5, lotStep: 0.01, minLot: 0.01, maxLot: 100, quoteCurrency: 'NZD' },
  { symbol: 'AUDJPY', name: 'Australian Dollar / Japanese Yen', type: 'forex', category: 'Forex Minors', pipSize: 0.01, contractSize: 100000, pipValue: 1000, priceDecimals: 3, lotStep: 0.01, minLot: 0.01, maxLot: 100, quoteCurrency: 'JPY' },
  { symbol: 'AUDCAD', name: 'Australian Dollar / Canadian Dollar', type: 'forex', category: 'Forex Minors', pipSize: 0.0001, contractSize: 100000, pipValue: 10, priceDecimals: 5, lotStep: 0.01, minLot: 0.01, maxLot: 100, quoteCurrency: 'CAD' },
  { symbol: 'AUDCHF', name: 'Australian Dollar / Swiss Franc', type: 'forex', category: 'Forex Minors', pipSize: 0.0001, contractSize: 100000, pipValue: 10, priceDecimals: 5, lotStep: 0.01, minLot: 0.01, maxLot: 100, quoteCurrency: 'CHF' },
  { symbol: 'AUDNZD', name: 'Australian Dollar / New Zealand Dollar', type: 'forex', category: 'Forex Minors', pipSize: 0.0001, contractSize: 100000, pipValue: 10, priceDecimals: 5, lotStep: 0.01, minLot: 0.01, maxLot: 100, quoteCurrency: 'NZD' },
  { symbol: 'NZDJPY', name: 'New Zealand Dollar / Japanese Yen', type: 'forex', category: 'Forex Minors', pipSize: 0.01, contractSize: 100000, pipValue: 1000, priceDecimals: 3, lotStep: 0.01, minLot: 0.01, maxLot: 100, quoteCurrency: 'JPY' },
  { symbol: 'NZDCAD', name: 'New Zealand Dollar / Canadian Dollar', type: 'forex', category: 'Forex Minors', pipSize: 0.0001, contractSize: 100000, pipValue: 10, priceDecimals: 5, lotStep: 0.01, minLot: 0.01, maxLot: 100, quoteCurrency: 'CAD' },
  { symbol: 'NZDCHF', name: 'New Zealand Dollar / Swiss Franc', type: 'forex', category: 'Forex Minors', pipSize: 0.0001, contractSize: 100000, pipValue: 10, priceDecimals: 5, lotStep: 0.01, minLot: 0.01, maxLot: 100, quoteCurrency: 'CHF' },
  { symbol: 'CADJPY', name: 'Canadian Dollar / Japanese Yen', type: 'forex', category: 'Forex Minors', pipSize: 0.01, contractSize: 100000, pipValue: 1000, priceDecimals: 3, lotStep: 0.01, minLot: 0.01, maxLot: 100, quoteCurrency: 'JPY' },
  { symbol: 'CADCHF', name: 'Canadian Dollar / Swiss Franc', type: 'forex', category: 'Forex Minors', pipSize: 0.0001, contractSize: 100000, pipValue: 10, priceDecimals: 5, lotStep: 0.01, minLot: 0.01, maxLot: 100, quoteCurrency: 'CHF' },
  { symbol: 'CHFJPY', name: 'Swiss Franc / Japanese Yen', type: 'forex', category: 'Forex Minors', pipSize: 0.01, contractSize: 100000, pipValue: 1000, priceDecimals: 3, lotStep: 0.01, minLot: 0.01, maxLot: 100, quoteCurrency: 'JPY' },
];

// ============================================
// FOREX - EXOTICS
// ============================================
const FOREX_EXOTICS: AssetConfig[] = [
  { symbol: 'USDZAR', name: 'US Dollar / South African Rand', type: 'forex', category: 'Forex Exotics', pipSize: 0.0001, contractSize: 100000, pipValue: 10, priceDecimals: 5, lotStep: 0.01, minLot: 0.01, maxLot: 100, quoteCurrency: 'ZAR' },
  { symbol: 'USDTRY', name: 'US Dollar / Turkish Lira', type: 'forex', category: 'Forex Exotics', pipSize: 0.0001, contractSize: 100000, pipValue: 10, priceDecimals: 5, lotStep: 0.01, minLot: 0.01, maxLot: 100, quoteCurrency: 'TRY' },
  { symbol: 'USDRUB', name: 'US Dollar / Russian Ruble', type: 'forex', category: 'Forex Exotics', pipSize: 0.0001, contractSize: 100000, pipValue: 10, priceDecimals: 5, lotStep: 0.01, minLot: 0.01, maxLot: 100, quoteCurrency: 'RUB' },
  { symbol: 'USDSEK', name: 'US Dollar / Swedish Krona', type: 'forex', category: 'Forex Exotics', pipSize: 0.0001, contractSize: 100000, pipValue: 10, priceDecimals: 5, lotStep: 0.01, minLot: 0.01, maxLot: 100, quoteCurrency: 'SEK' },
  { symbol: 'USDNOK', name: 'US Dollar / Norwegian Krone', type: 'forex', category: 'Forex Exotics', pipSize: 0.0001, contractSize: 100000, pipValue: 10, priceDecimals: 5, lotStep: 0.01, minLot: 0.01, maxLot: 100, quoteCurrency: 'NOK' },
  { symbol: 'USDDKK', name: 'US Dollar / Danish Krone', type: 'forex', category: 'Forex Exotics', pipSize: 0.0001, contractSize: 100000, pipValue: 10, priceDecimals: 5, lotStep: 0.01, minLot: 0.01, maxLot: 100, quoteCurrency: 'DKK' },
  { symbol: 'USDHKD', name: 'US Dollar / Hong Kong Dollar', type: 'forex', category: 'Forex Exotics', pipSize: 0.0001, contractSize: 100000, pipValue: 10, priceDecimals: 5, lotStep: 0.01, minLot: 0.01, maxLot: 100, quoteCurrency: 'HKD' },
  { symbol: 'USDSGD', name: 'US Dollar / Singapore Dollar', type: 'forex', category: 'Forex Exotics', pipSize: 0.0001, contractSize: 100000, pipValue: 10, priceDecimals: 5, lotStep: 0.01, minLot: 0.01, maxLot: 100, quoteCurrency: 'SGD' },
  { symbol: 'USDMXN', name: 'US Dollar / Mexican Peso', type: 'forex', category: 'Forex Exotics', pipSize: 0.0001, contractSize: 100000, pipValue: 10, priceDecimals: 5, lotStep: 0.01, minLot: 0.01, maxLot: 100, quoteCurrency: 'MXN' },
  { symbol: 'EURTRY', name: 'Euro / Turkish Lira', type: 'forex', category: 'Forex Exotics', pipSize: 0.0001, contractSize: 100000, pipValue: 10, priceDecimals: 5, lotStep: 0.01, minLot: 0.01, maxLot: 100, quoteCurrency: 'TRY' },
  { symbol: 'EURZAR', name: 'Euro / South African Rand', type: 'forex', category: 'Forex Exotics', pipSize: 0.0001, contractSize: 100000, pipValue: 10, priceDecimals: 5, lotStep: 0.01, minLot: 0.01, maxLot: 100, quoteCurrency: 'ZAR' },
  { symbol: 'EURNOK', name: 'Euro / Norwegian Krone', type: 'forex', category: 'Forex Exotics', pipSize: 0.0001, contractSize: 100000, pipValue: 10, priceDecimals: 5, lotStep: 0.01, minLot: 0.01, maxLot: 100, quoteCurrency: 'NOK' },
  { symbol: 'EURSEK', name: 'Euro / Swedish Krona', type: 'forex', category: 'Forex Exotics', pipSize: 0.0001, contractSize: 100000, pipValue: 10, priceDecimals: 5, lotStep: 0.01, minLot: 0.01, maxLot: 100, quoteCurrency: 'SEK' },
  { symbol: 'EURHUF', name: 'Euro / Hungarian Forint', type: 'forex', category: 'Forex Exotics', pipSize: 0.01, contractSize: 100000, pipValue: 1000, priceDecimals: 3, lotStep: 0.01, minLot: 0.01, maxLot: 100, quoteCurrency: 'HUF' },
  { symbol: 'EURPLN', name: 'Euro / Polish Zloty', type: 'forex', category: 'Forex Exotics', pipSize: 0.0001, contractSize: 100000, pipValue: 10, priceDecimals: 5, lotStep: 0.01, minLot: 0.01, maxLot: 100, quoteCurrency: 'PLN' },
  { symbol: 'GBPTRY', name: 'British Pound / Turkish Lira', type: 'forex', category: 'Forex Exotics', pipSize: 0.0001, contractSize: 100000, pipValue: 10, priceDecimals: 5, lotStep: 0.01, minLot: 0.01, maxLot: 100, quoteCurrency: 'TRY' },
  { symbol: 'GBPZAR', name: 'British Pound / South African Rand', type: 'forex', category: 'Forex Exotics', pipSize: 0.0001, contractSize: 100000, pipValue: 10, priceDecimals: 5, lotStep: 0.01, minLot: 0.01, maxLot: 100, quoteCurrency: 'ZAR' },
  { symbol: 'AUDSGD', name: 'Australian Dollar / Singapore Dollar', type: 'forex', category: 'Forex Exotics', pipSize: 0.0001, contractSize: 100000, pipValue: 10, priceDecimals: 5, lotStep: 0.01, minLot: 0.01, maxLot: 100, quoteCurrency: 'SGD' },
  { symbol: 'AUDHKD', name: 'Australian Dollar / Hong Kong Dollar', type: 'forex', category: 'Forex Exotics', pipSize: 0.0001, contractSize: 100000, pipValue: 10, priceDecimals: 5, lotStep: 0.01, minLot: 0.01, maxLot: 100, quoteCurrency: 'HKD' },
  { symbol: 'NZDSGD', name: 'New Zealand Dollar / Singapore Dollar', type: 'forex', category: 'Forex Exotics', pipSize: 0.0001, contractSize: 100000, pipValue: 10, priceDecimals: 5, lotStep: 0.01, minLot: 0.01, maxLot: 100, quoteCurrency: 'SGD' },
  { symbol: 'JPYSGD', name: 'Japanese Yen / Singapore Dollar', type: 'forex', category: 'Forex Exotics', pipSize: 0.0001, contractSize: 100000, pipValue: 10, priceDecimals: 5, lotStep: 0.01, minLot: 0.01, maxLot: 100, quoteCurrency: 'SGD' },
];

// ============================================
// CRYPTOCURRENCIES
// ============================================
const CRYPTO: AssetConfig[] = [
  { symbol: 'BTCUSD', name: 'Bitcoin / US Dollar', type: 'crypto', category: 'Crypto', pipSize: 1, contractSize: 1, pipValue: 1, priceDecimals: 2, lotStep: 0.01, minLot: 0.01, maxLot: 100, quoteCurrency: 'USD' },
  { symbol: 'ETHUSD', name: 'Ethereum / US Dollar', type: 'crypto', category: 'Crypto', pipSize: 0.01, contractSize: 1, pipValue: 0.01, priceDecimals: 2, lotStep: 0.01, minLot: 0.01, maxLot: 1000, quoteCurrency: 'USD' },
  { symbol: 'BNBUSD', name: 'Binance Coin / US Dollar', type: 'crypto', category: 'Crypto', pipSize: 0.01, contractSize: 1, pipValue: 0.01, priceDecimals: 2, lotStep: 0.01, minLot: 0.01, maxLot: 1000, quoteCurrency: 'USD' },
  { symbol: 'SOLUSD', name: 'Solana / US Dollar', type: 'crypto', category: 'Crypto', pipSize: 0.01, contractSize: 1, pipValue: 0.01, priceDecimals: 2, lotStep: 0.01, minLot: 0.01, maxLot: 1000, quoteCurrency: 'USD' },
  { symbol: 'XRPUSD', name: 'Ripple / US Dollar', type: 'crypto', category: 'Crypto', pipSize: 0.0001, contractSize: 1, pipValue: 0.0001, priceDecimals: 4, lotStep: 1, minLot: 1, maxLot: 100000, quoteCurrency: 'USD' },
  { symbol: 'ADAUSD', name: 'Cardano / US Dollar', type: 'crypto', category: 'Crypto', pipSize: 0.0001, contractSize: 1, pipValue: 0.0001, priceDecimals: 4, lotStep: 1, minLot: 1, maxLot: 100000, quoteCurrency: 'USD' },
  { symbol: 'DOGEUSD', name: 'Dogecoin / US Dollar', type: 'crypto', category: 'Crypto', pipSize: 0.00001, contractSize: 1, pipValue: 0.00001, priceDecimals: 5, lotStep: 1, minLot: 1, maxLot: 1000000, quoteCurrency: 'USD' },
  { symbol: 'AVAXUSD', name: 'Avalanche / US Dollar', type: 'crypto', category: 'Crypto', pipSize: 0.01, contractSize: 1, pipValue: 0.01, priceDecimals: 2, lotStep: 0.1, minLot: 0.1, maxLot: 10000, quoteCurrency: 'USD' },
  { symbol: 'DOTUSD', name: 'Polkadot / US Dollar', type: 'crypto', category: 'Crypto', pipSize: 0.001, contractSize: 1, pipValue: 0.001, priceDecimals: 3, lotStep: 0.1, minLot: 0.1, maxLot: 10000, quoteCurrency: 'USD' },
  { symbol: 'MATICUSD', name: 'Polygon / US Dollar', type: 'crypto', category: 'Crypto', pipSize: 0.0001, contractSize: 1, pipValue: 0.0001, priceDecimals: 4, lotStep: 1, minLot: 1, maxLot: 100000, quoteCurrency: 'USD' },
  { symbol: 'LTCUSD', name: 'Litecoin / US Dollar', type: 'crypto', category: 'Crypto', pipSize: 0.01, contractSize: 1, pipValue: 0.01, priceDecimals: 2, lotStep: 0.1, minLot: 0.1, maxLot: 10000, quoteCurrency: 'USD' },
  { symbol: 'BCHUSD', name: 'Bitcoin Cash / US Dollar', type: 'crypto', category: 'Crypto', pipSize: 0.01, contractSize: 1, pipValue: 0.01, priceDecimals: 2, lotStep: 0.01, minLot: 0.01, maxLot: 1000, quoteCurrency: 'USD' },
  { symbol: 'ATOMUSD', name: 'Cosmos / US Dollar', type: 'crypto', category: 'Crypto', pipSize: 0.001, contractSize: 1, pipValue: 0.001, priceDecimals: 3, lotStep: 0.1, minLot: 0.1, maxLot: 10000, quoteCurrency: 'USD' },
  { symbol: 'XLMUSD', name: 'Stellar / US Dollar', type: 'crypto', category: 'Crypto', pipSize: 0.0001, contractSize: 1, pipValue: 0.0001, priceDecimals: 4, lotStep: 1, minLot: 1, maxLot: 100000, quoteCurrency: 'USD' },
  { symbol: 'LINKUSD', name: 'Chainlink / US Dollar', type: 'crypto', category: 'Crypto', pipSize: 0.001, contractSize: 1, pipValue: 0.001, priceDecimals: 3, lotStep: 0.1, minLot: 0.1, maxLot: 10000, quoteCurrency: 'USD' },
  { symbol: 'SHIBUSD', name: 'Shiba Inu / US Dollar', type: 'crypto', category: 'Crypto', pipSize: 0.00000001, contractSize: 1000000, pipValue: 0.01, priceDecimals: 8, lotStep: 1, minLot: 1, maxLot: 1000, quoteCurrency: 'USD' },
  { symbol: 'TRXUSD', name: 'TRON / US Dollar', type: 'crypto', category: 'Crypto', pipSize: 0.0001, contractSize: 1, pipValue: 0.0001, priceDecimals: 4, lotStep: 1, minLot: 1, maxLot: 100000, quoteCurrency: 'USD' },
  { symbol: 'ETCUSD', name: 'Ethereum Classic / US Dollar', type: 'crypto', category: 'Crypto', pipSize: 0.01, contractSize: 1, pipValue: 0.01, priceDecimals: 2, lotStep: 0.1, minLot: 0.1, maxLot: 10000, quoteCurrency: 'USD' },
  { symbol: 'FILUSD', name: 'Filecoin / US Dollar', type: 'crypto', category: 'Crypto', pipSize: 0.001, contractSize: 1, pipValue: 0.001, priceDecimals: 3, lotStep: 0.1, minLot: 0.1, maxLot: 10000, quoteCurrency: 'USD' },
  { symbol: 'EOSUSD', name: 'EOS / US Dollar', type: 'crypto', category: 'Crypto', pipSize: 0.0001, contractSize: 1, pipValue: 0.0001, priceDecimals: 4, lotStep: 1, minLot: 1, maxLot: 100000, quoteCurrency: 'USD' },
  { symbol: 'AAVEUSD', name: 'Aave / US Dollar', type: 'crypto', category: 'Crypto', pipSize: 0.01, contractSize: 1, pipValue: 0.01, priceDecimals: 2, lotStep: 0.01, minLot: 0.01, maxLot: 1000, quoteCurrency: 'USD' },
  { symbol: 'UNIUSD', name: 'Uniswap / US Dollar', type: 'crypto', category: 'Crypto', pipSize: 0.001, contractSize: 1, pipValue: 0.001, priceDecimals: 3, lotStep: 0.1, minLot: 0.1, maxLot: 10000, quoteCurrency: 'USD' },
  { symbol: 'SUSHIUSD', name: 'SushiSwap / US Dollar', type: 'crypto', category: 'Crypto', pipSize: 0.0001, contractSize: 1, pipValue: 0.0001, priceDecimals: 4, lotStep: 1, minLot: 1, maxLot: 100000, quoteCurrency: 'USD' },
  { symbol: 'COMPUSD', name: 'Compound / US Dollar', type: 'crypto', category: 'Crypto', pipSize: 0.01, contractSize: 1, pipValue: 0.01, priceDecimals: 2, lotStep: 0.01, minLot: 0.01, maxLot: 1000, quoteCurrency: 'USD' },
  { symbol: 'NEARUSD', name: 'NEAR Protocol / US Dollar', type: 'crypto', category: 'Crypto', pipSize: 0.001, contractSize: 1, pipValue: 0.001, priceDecimals: 3, lotStep: 0.1, minLot: 0.1, maxLot: 10000, quoteCurrency: 'USD' },
  { symbol: 'ALGOUSD', name: 'Algorand / US Dollar', type: 'crypto', category: 'Crypto', pipSize: 0.0001, contractSize: 1, pipValue: 0.0001, priceDecimals: 4, lotStep: 1, minLot: 1, maxLot: 100000, quoteCurrency: 'USD' },
  { symbol: 'XTZUSD', name: 'Tezos / US Dollar', type: 'crypto', category: 'Crypto', pipSize: 0.0001, contractSize: 1, pipValue: 0.0001, priceDecimals: 4, lotStep: 1, minLot: 1, maxLot: 100000, quoteCurrency: 'USD' },
  { symbol: 'HBARUSD', name: 'Hedera / US Dollar', type: 'crypto', category: 'Crypto', pipSize: 0.0001, contractSize: 1, pipValue: 0.0001, priceDecimals: 4, lotStep: 1, minLot: 1, maxLot: 100000, quoteCurrency: 'USD' },
  { symbol: 'APTUSD', name: 'Aptos / US Dollar', type: 'crypto', category: 'Crypto', pipSize: 0.001, contractSize: 1, pipValue: 0.001, priceDecimals: 3, lotStep: 0.1, minLot: 0.1, maxLot: 10000, quoteCurrency: 'USD' },
  { symbol: 'INJUSD', name: 'Injective / US Dollar', type: 'crypto', category: 'Crypto', pipSize: 0.01, contractSize: 1, pipValue: 0.01, priceDecimals: 2, lotStep: 0.1, minLot: 0.1, maxLot: 10000, quoteCurrency: 'USD' },
  { symbol: 'OPUSD', name: 'Optimism / US Dollar', type: 'crypto', category: 'Crypto', pipSize: 0.001, contractSize: 1, pipValue: 0.001, priceDecimals: 3, lotStep: 0.1, minLot: 0.1, maxLot: 10000, quoteCurrency: 'USD' },
  { symbol: 'ARBUSD', name: 'Arbitrum / US Dollar', type: 'crypto', category: 'Crypto', pipSize: 0.0001, contractSize: 1, pipValue: 0.0001, priceDecimals: 4, lotStep: 1, minLot: 1, maxLot: 100000, quoteCurrency: 'USD' },
  { symbol: 'TIAUSD', name: 'Celestia / US Dollar', type: 'crypto', category: 'Crypto', pipSize: 0.001, contractSize: 1, pipValue: 0.001, priceDecimals: 3, lotStep: 0.1, minLot: 0.1, maxLot: 10000, quoteCurrency: 'USD' },
];

// ============================================
// INDICES
// ============================================
const INDICES: AssetConfig[] = [
  { symbol: 'US30', name: 'Dow Jones Industrial Average', type: 'index', category: 'Indices', pipSize: 1, contractSize: 1, pipValue: 1, priceDecimals: 1, lotStep: 0.1, minLot: 0.1, maxLot: 100, quoteCurrency: 'USD' },
  { symbol: 'US100', name: 'Nasdaq 100', type: 'index', category: 'Indices', pipSize: 1, contractSize: 1, pipValue: 1, priceDecimals: 1, lotStep: 0.1, minLot: 0.1, maxLot: 100, quoteCurrency: 'USD' },
  { symbol: 'SPX500', name: 'S&P 500', type: 'index', category: 'Indices', pipSize: 0.1, contractSize: 1, pipValue: 0.1, priceDecimals: 2, lotStep: 0.1, minLot: 0.1, maxLot: 100, quoteCurrency: 'USD' },
  { symbol: 'DAX40', name: 'Germany 40 (DAX)', type: 'index', category: 'Indices', pipSize: 1, contractSize: 1, pipValue: 1, priceDecimals: 1, lotStep: 0.1, minLot: 0.1, maxLot: 100, quoteCurrency: 'EUR' },
  { symbol: 'CAC40', name: 'France 40 (CAC)', type: 'index', category: 'Indices', pipSize: 0.1, contractSize: 1, pipValue: 0.1, priceDecimals: 2, lotStep: 0.1, minLot: 0.1, maxLot: 100, quoteCurrency: 'EUR' },
  { symbol: 'FTSE100', name: 'UK 100 (FTSE)', type: 'index', category: 'Indices', pipSize: 0.1, contractSize: 1, pipValue: 0.1, priceDecimals: 2, lotStep: 0.1, minLot: 0.1, maxLot: 100, quoteCurrency: 'GBP' },
  { symbol: 'IBEX35', name: 'Spain 35 (IBEX)', type: 'index', category: 'Indices', pipSize: 1, contractSize: 1, pipValue: 1, priceDecimals: 1, lotStep: 0.1, minLot: 0.1, maxLot: 100, quoteCurrency: 'EUR' },
  { symbol: 'FTSEMIB', name: 'Italy 40 (FTSE MIB)', type: 'index', category: 'Indices', pipSize: 1, contractSize: 1, pipValue: 1, priceDecimals: 0, lotStep: 0.1, minLot: 0.1, maxLot: 100, quoteCurrency: 'EUR' },
  { symbol: 'STOXX50', name: 'Euro Stoxx 50', type: 'index', category: 'Indices', pipSize: 0.1, contractSize: 1, pipValue: 0.1, priceDecimals: 2, lotStep: 0.1, minLot: 0.1, maxLot: 100, quoteCurrency: 'EUR' },
  { symbol: 'SPTSX', name: 'S&P/TSX Composite (Canada)', type: 'index', category: 'Indices', pipSize: 0.1, contractSize: 1, pipValue: 0.1, priceDecimals: 2, lotStep: 0.1, minLot: 0.1, maxLot: 100, quoteCurrency: 'CAD' },
  { symbol: 'NI225', name: 'Nikkei 225 (Japan)', type: 'index', category: 'Indices', pipSize: 1, contractSize: 1, pipValue: 1, priceDecimals: 0, lotStep: 0.1, minLot: 0.1, maxLot: 100, quoteCurrency: 'JPY' },
  { symbol: 'HSI', name: 'Hang Seng 50 (Hong Kong)', type: 'index', category: 'Indices', pipSize: 1, contractSize: 1, pipValue: 1, priceDecimals: 0, lotStep: 0.1, minLot: 0.1, maxLot: 100, quoteCurrency: 'HKD' },
  { symbol: 'CHINAA50', name: 'China A50', type: 'index', category: 'Indices', pipSize: 1, contractSize: 1, pipValue: 1, priceDecimals: 0, lotStep: 0.1, minLot: 0.1, maxLot: 100, quoteCurrency: 'USD' },
  { symbol: 'ASX200', name: 'Australia 200', type: 'index', category: 'Indices', pipSize: 0.1, contractSize: 1, pipValue: 0.1, priceDecimals: 2, lotStep: 0.1, minLot: 0.1, maxLot: 100, quoteCurrency: 'AUD' },
  { symbol: 'KOSPI', name: 'KOSPI (South Korea)', type: 'index', category: 'Indices', pipSize: 0.1, contractSize: 1, pipValue: 0.1, priceDecimals: 2, lotStep: 0.1, minLot: 0.1, maxLot: 100, quoteCurrency: 'KRW' },
  { symbol: 'NIFTY50', name: 'Nifty 50 (India)', type: 'index', category: 'Indices', pipSize: 0.1, contractSize: 1, pipValue: 0.1, priceDecimals: 2, lotStep: 0.1, minLot: 0.1, maxLot: 100, quoteCurrency: 'INR' },
  { symbol: 'SENSEX', name: 'Sensex 30 (India)', type: 'index', category: 'Indices', pipSize: 0.1, contractSize: 1, pipValue: 0.1, priceDecimals: 2, lotStep: 0.1, minLot: 0.1, maxLot: 100, quoteCurrency: 'INR' },
];

// ============================================
// COMMODITIES
// ============================================
const COMMODITIES: AssetConfig[] = [
  { symbol: 'XAUUSD', name: 'Gold / US Dollar', type: 'commodity', category: 'Metals', pipSize: 0.01, contractSize: 100, pipValue: 1, priceDecimals: 2, lotStep: 0.01, minLot: 0.01, maxLot: 100, quoteCurrency: 'USD' },
  { symbol: 'XAGUSD', name: 'Silver / US Dollar', type: 'commodity', category: 'Metals', pipSize: 0.001, contractSize: 5000, pipValue: 5, priceDecimals: 3, lotStep: 0.01, minLot: 0.01, maxLot: 100, quoteCurrency: 'USD' },
  { symbol: 'XPTUSD', name: 'Platinum / US Dollar', type: 'commodity', category: 'Metals', pipSize: 0.01, contractSize: 100, pipValue: 1, priceDecimals: 2, lotStep: 0.01, minLot: 0.01, maxLot: 100, quoteCurrency: 'USD' },
  { symbol: 'XPDUSD', name: 'Palladium / US Dollar', type: 'commodity', category: 'Metals', pipSize: 0.01, contractSize: 100, pipValue: 1, priceDecimals: 2, lotStep: 0.01, minLot: 0.01, maxLot: 100, quoteCurrency: 'USD' },
  { symbol: 'COPPER', name: 'Copper', type: 'commodity', category: 'Metals', pipSize: 0.0001, contractSize: 25000, pipValue: 2.5, priceDecimals: 4, lotStep: 0.01, minLot: 0.01, maxLot: 100, quoteCurrency: 'USD' },
  { symbol: 'USOIL', name: 'Crude Oil WTI', type: 'commodity', category: 'Energy', pipSize: 0.01, contractSize: 1000, pipValue: 10, priceDecimals: 2, lotStep: 0.01, minLot: 0.01, maxLot: 100, quoteCurrency: 'USD' },
  { symbol: 'UKOIL', name: 'Brent Crude Oil', type: 'commodity', category: 'Energy', pipSize: 0.01, contractSize: 1000, pipValue: 10, priceDecimals: 2, lotStep: 0.01, minLot: 0.01, maxLot: 100, quoteCurrency: 'USD' },
  { symbol: 'NATGAS', name: 'Natural Gas', type: 'commodity', category: 'Energy', pipSize: 0.001, contractSize: 10000, pipValue: 10, priceDecimals: 3, lotStep: 0.01, minLot: 0.01, maxLot: 100, quoteCurrency: 'USD' },
];

// ============================================
// STOCKS - USA
// ============================================
const STOCKS_USA: AssetConfig[] = [
  { symbol: 'AAPL', name: 'Apple Inc.', type: 'stock', category: 'US Stocks', pipSize: 0.01, contractSize: 1, pipValue: 0.01, priceDecimals: 2, lotStep: 1, minLot: 1, maxLot: 10000, quoteCurrency: 'USD' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', type: 'stock', category: 'US Stocks', pipSize: 0.01, contractSize: 1, pipValue: 0.01, priceDecimals: 2, lotStep: 1, minLot: 1, maxLot: 10000, quoteCurrency: 'USD' },
  { symbol: 'TSLA', name: 'Tesla Inc.', type: 'stock', category: 'US Stocks', pipSize: 0.01, contractSize: 1, pipValue: 0.01, priceDecimals: 2, lotStep: 1, minLot: 1, maxLot: 10000, quoteCurrency: 'USD' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', type: 'stock', category: 'US Stocks', pipSize: 0.01, contractSize: 1, pipValue: 0.01, priceDecimals: 2, lotStep: 1, minLot: 1, maxLot: 10000, quoteCurrency: 'USD' },
  { symbol: 'META', name: 'Meta Platforms Inc.', type: 'stock', category: 'US Stocks', pipSize: 0.01, contractSize: 1, pipValue: 0.01, priceDecimals: 2, lotStep: 1, minLot: 1, maxLot: 10000, quoteCurrency: 'USD' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', type: 'stock', category: 'US Stocks', pipSize: 0.01, contractSize: 1, pipValue: 0.01, priceDecimals: 2, lotStep: 1, minLot: 1, maxLot: 10000, quoteCurrency: 'USD' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', type: 'stock', category: 'US Stocks', pipSize: 0.01, contractSize: 1, pipValue: 0.01, priceDecimals: 2, lotStep: 1, minLot: 1, maxLot: 10000, quoteCurrency: 'USD' },
  { symbol: 'NFLX', name: 'Netflix Inc.', type: 'stock', category: 'US Stocks', pipSize: 0.01, contractSize: 1, pipValue: 0.01, priceDecimals: 2, lotStep: 1, minLot: 1, maxLot: 10000, quoteCurrency: 'USD' },
  { symbol: 'AMD', name: 'Advanced Micro Devices', type: 'stock', category: 'US Stocks', pipSize: 0.01, contractSize: 1, pipValue: 0.01, priceDecimals: 2, lotStep: 1, minLot: 1, maxLot: 10000, quoteCurrency: 'USD' },
  { symbol: 'INTC', name: 'Intel Corporation', type: 'stock', category: 'US Stocks', pipSize: 0.01, contractSize: 1, pipValue: 0.01, priceDecimals: 2, lotStep: 1, minLot: 1, maxLot: 10000, quoteCurrency: 'USD' },
  { symbol: 'IBM', name: 'IBM', type: 'stock', category: 'US Stocks', pipSize: 0.01, contractSize: 1, pipValue: 0.01, priceDecimals: 2, lotStep: 1, minLot: 1, maxLot: 10000, quoteCurrency: 'USD' },
  { symbol: 'ORCL', name: 'Oracle Corporation', type: 'stock', category: 'US Stocks', pipSize: 0.01, contractSize: 1, pipValue: 0.01, priceDecimals: 2, lotStep: 1, minLot: 1, maxLot: 10000, quoteCurrency: 'USD' },
  { symbol: 'CRM', name: 'Salesforce Inc.', type: 'stock', category: 'US Stocks', pipSize: 0.01, contractSize: 1, pipValue: 0.01, priceDecimals: 2, lotStep: 1, minLot: 1, maxLot: 10000, quoteCurrency: 'USD' },
  { symbol: 'PYPL', name: 'PayPal Holdings', type: 'stock', category: 'US Stocks', pipSize: 0.01, contractSize: 1, pipValue: 0.01, priceDecimals: 2, lotStep: 1, minLot: 1, maxLot: 10000, quoteCurrency: 'USD' },
  { symbol: 'SQ', name: 'Block Inc.', type: 'stock', category: 'US Stocks', pipSize: 0.01, contractSize: 1, pipValue: 0.01, priceDecimals: 2, lotStep: 1, minLot: 1, maxLot: 10000, quoteCurrency: 'USD' },
  { symbol: 'V', name: 'Visa Inc.', type: 'stock', category: 'US Stocks', pipSize: 0.01, contractSize: 1, pipValue: 0.01, priceDecimals: 2, lotStep: 1, minLot: 1, maxLot: 10000, quoteCurrency: 'USD' },
  { symbol: 'MA', name: 'Mastercard Inc.', type: 'stock', category: 'US Stocks', pipSize: 0.01, contractSize: 1, pipValue: 0.01, priceDecimals: 2, lotStep: 1, minLot: 1, maxLot: 10000, quoteCurrency: 'USD' },
  { symbol: 'JPM', name: 'JPMorgan Chase', type: 'stock', category: 'US Stocks', pipSize: 0.01, contractSize: 1, pipValue: 0.01, priceDecimals: 2, lotStep: 1, minLot: 1, maxLot: 10000, quoteCurrency: 'USD' },
  { symbol: 'BAC', name: 'Bank of America', type: 'stock', category: 'US Stocks', pipSize: 0.01, contractSize: 1, pipValue: 0.01, priceDecimals: 2, lotStep: 1, minLot: 1, maxLot: 10000, quoteCurrency: 'USD' },
  { symbol: 'WFC', name: 'Wells Fargo', type: 'stock', category: 'US Stocks', pipSize: 0.01, contractSize: 1, pipValue: 0.01, priceDecimals: 2, lotStep: 1, minLot: 1, maxLot: 10000, quoteCurrency: 'USD' },
  { symbol: 'XOM', name: 'Exxon Mobil', type: 'stock', category: 'US Stocks', pipSize: 0.01, contractSize: 1, pipValue: 0.01, priceDecimals: 2, lotStep: 1, minLot: 1, maxLot: 10000, quoteCurrency: 'USD' },
  { symbol: 'CVX', name: 'Chevron Corporation', type: 'stock', category: 'US Stocks', pipSize: 0.01, contractSize: 1, pipValue: 0.01, priceDecimals: 2, lotStep: 1, minLot: 1, maxLot: 10000, quoteCurrency: 'USD' },
  { symbol: 'KO', name: 'Coca-Cola Company', type: 'stock', category: 'US Stocks', pipSize: 0.01, contractSize: 1, pipValue: 0.01, priceDecimals: 2, lotStep: 1, minLot: 1, maxLot: 10000, quoteCurrency: 'USD' },
  { symbol: 'PEP', name: 'PepsiCo Inc.', type: 'stock', category: 'US Stocks', pipSize: 0.01, contractSize: 1, pipValue: 0.01, priceDecimals: 2, lotStep: 1, minLot: 1, maxLot: 10000, quoteCurrency: 'USD' },
  { symbol: 'NKE', name: 'Nike Inc.', type: 'stock', category: 'US Stocks', pipSize: 0.01, contractSize: 1, pipValue: 0.01, priceDecimals: 2, lotStep: 1, minLot: 1, maxLot: 10000, quoteCurrency: 'USD' },
  { symbol: 'WMT', name: 'Walmart Inc.', type: 'stock', category: 'US Stocks', pipSize: 0.01, contractSize: 1, pipValue: 0.01, priceDecimals: 2, lotStep: 1, minLot: 1, maxLot: 10000, quoteCurrency: 'USD' },
  { symbol: 'COST', name: 'Costco Wholesale', type: 'stock', category: 'US Stocks', pipSize: 0.01, contractSize: 1, pipValue: 0.01, priceDecimals: 2, lotStep: 1, minLot: 1, maxLot: 10000, quoteCurrency: 'USD' },
  { symbol: 'TGT', name: 'Target Corporation', type: 'stock', category: 'US Stocks', pipSize: 0.01, contractSize: 1, pipValue: 0.01, priceDecimals: 2, lotStep: 1, minLot: 1, maxLot: 10000, quoteCurrency: 'USD' },
  { symbol: 'MCD', name: "McDonald's Corp.", type: 'stock', category: 'US Stocks', pipSize: 0.01, contractSize: 1, pipValue: 0.01, priceDecimals: 2, lotStep: 1, minLot: 1, maxLot: 10000, quoteCurrency: 'USD' },
  { symbol: 'SBUX', name: 'Starbucks Corp.', type: 'stock', category: 'US Stocks', pipSize: 0.01, contractSize: 1, pipValue: 0.01, priceDecimals: 2, lotStep: 1, minLot: 1, maxLot: 10000, quoteCurrency: 'USD' },
  { symbol: 'DIS', name: 'Walt Disney Co.', type: 'stock', category: 'US Stocks', pipSize: 0.01, contractSize: 1, pipValue: 0.01, priceDecimals: 2, lotStep: 1, minLot: 1, maxLot: 10000, quoteCurrency: 'USD' },
  { symbol: 'UBER', name: 'Uber Technologies', type: 'stock', category: 'US Stocks', pipSize: 0.01, contractSize: 1, pipValue: 0.01, priceDecimals: 2, lotStep: 1, minLot: 1, maxLot: 10000, quoteCurrency: 'USD' },
  { symbol: 'LYFT', name: 'Lyft Inc.', type: 'stock', category: 'US Stocks', pipSize: 0.01, contractSize: 1, pipValue: 0.01, priceDecimals: 2, lotStep: 1, minLot: 1, maxLot: 10000, quoteCurrency: 'USD' },
  { symbol: 'ABNB', name: 'Airbnb Inc.', type: 'stock', category: 'US Stocks', pipSize: 0.01, contractSize: 1, pipValue: 0.01, priceDecimals: 2, lotStep: 1, minLot: 1, maxLot: 10000, quoteCurrency: 'USD' },
  { symbol: 'SHOP', name: 'Shopify Inc.', type: 'stock', category: 'US Stocks', pipSize: 0.01, contractSize: 1, pipValue: 0.01, priceDecimals: 2, lotStep: 1, minLot: 1, maxLot: 10000, quoteCurrency: 'USD' },
  { symbol: 'PLTR', name: 'Palantir Technologies', type: 'stock', category: 'US Stocks', pipSize: 0.01, contractSize: 1, pipValue: 0.01, priceDecimals: 2, lotStep: 1, minLot: 1, maxLot: 10000, quoteCurrency: 'USD' },
  { symbol: 'SNOW', name: 'Snowflake Inc.', type: 'stock', category: 'US Stocks', pipSize: 0.01, contractSize: 1, pipValue: 0.01, priceDecimals: 2, lotStep: 1, minLot: 1, maxLot: 10000, quoteCurrency: 'USD' },
  { symbol: 'ROKU', name: 'Roku Inc.', type: 'stock', category: 'US Stocks', pipSize: 0.01, contractSize: 1, pipValue: 0.01, priceDecimals: 2, lotStep: 1, minLot: 1, maxLot: 10000, quoteCurrency: 'USD' },
];

// ============================================
// STOCKS - EUROPE
// ============================================
const STOCKS_EUROPE: AssetConfig[] = [
  { symbol: 'VOW3', name: 'Volkswagen AG', type: 'stock', category: 'EU Stocks', pipSize: 0.01, contractSize: 1, pipValue: 0.01, priceDecimals: 2, lotStep: 1, minLot: 1, maxLot: 10000, quoteCurrency: 'EUR' },
  { symbol: 'BMW', name: 'BMW AG', type: 'stock', category: 'EU Stocks', pipSize: 0.01, contractSize: 1, pipValue: 0.01, priceDecimals: 2, lotStep: 1, minLot: 1, maxLot: 10000, quoteCurrency: 'EUR' },
  { symbol: 'MBG', name: 'Mercedes-Benz Group', type: 'stock', category: 'EU Stocks', pipSize: 0.01, contractSize: 1, pipValue: 0.01, priceDecimals: 2, lotStep: 1, minLot: 1, maxLot: 10000, quoteCurrency: 'EUR' },
  { symbol: 'AIR', name: 'Airbus SE', type: 'stock', category: 'EU Stocks', pipSize: 0.01, contractSize: 1, pipValue: 0.01, priceDecimals: 2, lotStep: 1, minLot: 1, maxLot: 10000, quoteCurrency: 'EUR' },
  { symbol: 'MC', name: 'LVMH', type: 'stock', category: 'EU Stocks', pipSize: 0.01, contractSize: 1, pipValue: 0.01, priceDecimals: 2, lotStep: 1, minLot: 1, maxLot: 10000, quoteCurrency: 'EUR' },
  { symbol: 'RMS', name: 'Hermès International', type: 'stock', category: 'EU Stocks', pipSize: 0.01, contractSize: 1, pipValue: 0.01, priceDecimals: 2, lotStep: 1, minLot: 1, maxLot: 10000, quoteCurrency: 'EUR' },
  { symbol: 'OR', name: "L'Oréal", type: 'stock', category: 'EU Stocks', pipSize: 0.01, contractSize: 1, pipValue: 0.01, priceDecimals: 2, lotStep: 1, minLot: 1, maxLot: 10000, quoteCurrency: 'EUR' },
  { symbol: 'TTE', name: 'TotalEnergies', type: 'stock', category: 'EU Stocks', pipSize: 0.01, contractSize: 1, pipValue: 0.01, priceDecimals: 2, lotStep: 1, minLot: 1, maxLot: 10000, quoteCurrency: 'EUR' },
  { symbol: 'BNP', name: 'BNP Paribas', type: 'stock', category: 'EU Stocks', pipSize: 0.01, contractSize: 1, pipValue: 0.01, priceDecimals: 2, lotStep: 1, minLot: 1, maxLot: 10000, quoteCurrency: 'EUR' },
  { symbol: 'GLE', name: 'Société Générale', type: 'stock', category: 'EU Stocks', pipSize: 0.01, contractSize: 1, pipValue: 0.01, priceDecimals: 2, lotStep: 1, minLot: 1, maxLot: 10000, quoteCurrency: 'EUR' },
  { symbol: 'SAN', name: 'Banco Santander', type: 'stock', category: 'EU Stocks', pipSize: 0.001, contractSize: 1, pipValue: 0.001, priceDecimals: 3, lotStep: 1, minLot: 1, maxLot: 10000, quoteCurrency: 'EUR' },
  { symbol: 'BARC', name: 'Barclays PLC', type: 'stock', category: 'EU Stocks', pipSize: 0.01, contractSize: 1, pipValue: 0.01, priceDecimals: 2, lotStep: 1, minLot: 1, maxLot: 10000, quoteCurrency: 'GBP' },
  { symbol: 'HSBA', name: 'HSBC Holdings', type: 'stock', category: 'EU Stocks', pipSize: 0.01, contractSize: 1, pipValue: 0.01, priceDecimals: 2, lotStep: 1, minLot: 1, maxLot: 10000, quoteCurrency: 'GBP' },
  { symbol: 'SHEL', name: 'Shell PLC', type: 'stock', category: 'EU Stocks', pipSize: 0.01, contractSize: 1, pipValue: 0.01, priceDecimals: 2, lotStep: 1, minLot: 1, maxLot: 10000, quoteCurrency: 'GBP' },
  { symbol: 'BP', name: 'BP PLC', type: 'stock', category: 'EU Stocks', pipSize: 0.01, contractSize: 1, pipValue: 0.01, priceDecimals: 2, lotStep: 1, minLot: 1, maxLot: 10000, quoteCurrency: 'GBP' },
  { symbol: 'SIE', name: 'Siemens AG', type: 'stock', category: 'EU Stocks', pipSize: 0.01, contractSize: 1, pipValue: 0.01, priceDecimals: 2, lotStep: 1, minLot: 1, maxLot: 10000, quoteCurrency: 'EUR' },
  { symbol: 'ALV', name: 'Allianz SE', type: 'stock', category: 'EU Stocks', pipSize: 0.01, contractSize: 1, pipValue: 0.01, priceDecimals: 2, lotStep: 1, minLot: 1, maxLot: 10000, quoteCurrency: 'EUR' },
  { symbol: 'DBK', name: 'Deutsche Bank', type: 'stock', category: 'EU Stocks', pipSize: 0.01, contractSize: 1, pipValue: 0.01, priceDecimals: 2, lotStep: 1, minLot: 1, maxLot: 10000, quoteCurrency: 'EUR' },
];

// ============================================
// STOCKS - ASIA
// ============================================
const STOCKS_ASIA: AssetConfig[] = [
  { symbol: 'TM', name: 'Toyota Motor', type: 'stock', category: 'Asia Stocks', pipSize: 0.01, contractSize: 1, pipValue: 0.01, priceDecimals: 2, lotStep: 1, minLot: 1, maxLot: 10000, quoteCurrency: 'USD' },
  { symbol: 'SONY', name: 'Sony Group', type: 'stock', category: 'Asia Stocks', pipSize: 0.01, contractSize: 1, pipValue: 0.01, priceDecimals: 2, lotStep: 1, minLot: 1, maxLot: 10000, quoteCurrency: 'USD' },
  { symbol: 'SSNLF', name: 'Samsung Electronics', type: 'stock', category: 'Asia Stocks', pipSize: 0.01, contractSize: 1, pipValue: 0.01, priceDecimals: 2, lotStep: 1, minLot: 1, maxLot: 10000, quoteCurrency: 'USD' },
  { symbol: 'BABA', name: 'Alibaba Group', type: 'stock', category: 'Asia Stocks', pipSize: 0.01, contractSize: 1, pipValue: 0.01, priceDecimals: 2, lotStep: 1, minLot: 1, maxLot: 10000, quoteCurrency: 'USD' },
  { symbol: 'TCEHY', name: 'Tencent Holdings', type: 'stock', category: 'Asia Stocks', pipSize: 0.01, contractSize: 1, pipValue: 0.01, priceDecimals: 2, lotStep: 1, minLot: 1, maxLot: 10000, quoteCurrency: 'USD' },
  { symbol: 'BYDDY', name: 'BYD Company', type: 'stock', category: 'Asia Stocks', pipSize: 0.01, contractSize: 1, pipValue: 0.01, priceDecimals: 2, lotStep: 1, minLot: 1, maxLot: 10000, quoteCurrency: 'USD' },
  { symbol: 'SFTBY', name: 'SoftBank Group', type: 'stock', category: 'Asia Stocks', pipSize: 0.01, contractSize: 1, pipValue: 0.01, priceDecimals: 2, lotStep: 1, minLot: 1, maxLot: 10000, quoteCurrency: 'USD' },
  { symbol: 'MSBHY', name: 'Mitsubishi Corp.', type: 'stock', category: 'Asia Stocks', pipSize: 0.01, contractSize: 1, pipValue: 0.01, priceDecimals: 2, lotStep: 1, minLot: 1, maxLot: 10000, quoteCurrency: 'USD' },
  { symbol: 'HMC', name: 'Honda Motor', type: 'stock', category: 'Asia Stocks', pipSize: 0.01, contractSize: 1, pipValue: 0.01, priceDecimals: 2, lotStep: 1, minLot: 1, maxLot: 10000, quoteCurrency: 'USD' },
  { symbol: 'PCRFY', name: 'Panasonic Holdings', type: 'stock', category: 'Asia Stocks', pipSize: 0.01, contractSize: 1, pipValue: 0.01, priceDecimals: 2, lotStep: 1, minLot: 1, maxLot: 10000, quoteCurrency: 'USD' },
];

// ============================================
// STOCKS - AFRICA
// ============================================
const STOCKS_AFRICA: AssetConfig[] = [
  { symbol: 'MTNOY', name: 'MTN Group', type: 'stock', category: 'Africa Stocks', pipSize: 0.01, contractSize: 1, pipValue: 0.01, priceDecimals: 2, lotStep: 1, minLot: 1, maxLot: 10000, quoteCurrency: 'USD' },
  { symbol: 'SCOM', name: 'Safaricom PLC', type: 'stock', category: 'Africa Stocks', pipSize: 0.01, contractSize: 1, pipValue: 0.01, priceDecimals: 2, lotStep: 1, minLot: 1, maxLot: 10000, quoteCurrency: 'USD' },
  { symbol: 'DANGCEM', name: 'Dangote Cement', type: 'stock', category: 'Africa Stocks', pipSize: 0.01, contractSize: 1, pipValue: 0.01, priceDecimals: 2, lotStep: 1, minLot: 1, maxLot: 10000, quoteCurrency: 'USD' },
  { symbol: 'AFREXIM', name: 'Afreximbank', type: 'stock', category: 'Africa Stocks', pipSize: 0.01, contractSize: 1, pipValue: 0.01, priceDecimals: 2, lotStep: 1, minLot: 1, maxLot: 10000, quoteCurrency: 'USD' },
  { symbol: 'SBKP', name: 'Standard Bank Group', type: 'stock', category: 'Africa Stocks', pipSize: 0.01, contractSize: 1, pipValue: 0.01, priceDecimals: 2, lotStep: 1, minLot: 1, maxLot: 10000, quoteCurrency: 'USD' },
  { symbol: 'ECOBANK', name: 'Ecobank Transnational', type: 'stock', category: 'Africa Stocks', pipSize: 0.01, contractSize: 1, pipValue: 0.01, priceDecimals: 2, lotStep: 1, minLot: 1, maxLot: 10000, quoteCurrency: 'USD' },
];

// ============================================
// STOCKS - MIDDLE EAST
// ============================================
const STOCKS_MIDDLE_EAST: AssetConfig[] = [
  { symbol: '2222.SR', name: 'Saudi Aramco', type: 'stock', category: 'ME Stocks', pipSize: 0.01, contractSize: 1, pipValue: 0.01, priceDecimals: 2, lotStep: 1, minLot: 1, maxLot: 10000, quoteCurrency: 'USD' },
  { symbol: 'ENBD', name: 'Emirates NBD', type: 'stock', category: 'ME Stocks', pipSize: 0.01, contractSize: 1, pipValue: 0.01, priceDecimals: 2, lotStep: 1, minLot: 1, maxLot: 10000, quoteCurrency: 'USD' },
  { symbol: 'QNB', name: 'Qatar National Bank', type: 'stock', category: 'ME Stocks', pipSize: 0.01, contractSize: 1, pipValue: 0.01, priceDecimals: 2, lotStep: 1, minLot: 1, maxLot: 10000, quoteCurrency: 'USD' },
  { symbol: 'ETISALAT', name: 'Etisalat', type: 'stock', category: 'ME Stocks', pipSize: 0.01, contractSize: 1, pipValue: 0.01, priceDecimals: 2, lotStep: 1, minLot: 1, maxLot: 10000, quoteCurrency: 'USD' },
];

// ============================================
// ETFs
// ============================================
const ETFS: AssetConfig[] = [
  { symbol: 'SPY', name: 'SPDR S&P 500 ETF', type: 'etf', category: 'ETFs', pipSize: 0.01, contractSize: 1, pipValue: 0.01, priceDecimals: 2, lotStep: 1, minLot: 1, maxLot: 10000, quoteCurrency: 'USD' },
  { symbol: 'QQQ', name: 'Invesco QQQ Trust', type: 'etf', category: 'ETFs', pipSize: 0.01, contractSize: 1, pipValue: 0.01, priceDecimals: 2, lotStep: 1, minLot: 1, maxLot: 10000, quoteCurrency: 'USD' },
  { symbol: 'VTI', name: 'Vanguard Total Stock Market', type: 'etf', category: 'ETFs', pipSize: 0.01, contractSize: 1, pipValue: 0.01, priceDecimals: 2, lotStep: 1, minLot: 1, maxLot: 10000, quoteCurrency: 'USD' },
  { symbol: 'ARKK', name: 'ARK Innovation ETF', type: 'etf', category: 'ETFs', pipSize: 0.01, contractSize: 1, pipValue: 0.01, priceDecimals: 2, lotStep: 1, minLot: 1, maxLot: 10000, quoteCurrency: 'USD' },
  { symbol: 'IWM', name: 'iShares Russell 2000', type: 'etf', category: 'ETFs', pipSize: 0.01, contractSize: 1, pipValue: 0.01, priceDecimals: 2, lotStep: 1, minLot: 1, maxLot: 10000, quoteCurrency: 'USD' },
  { symbol: 'DIA', name: 'SPDR Dow Jones ETF', type: 'etf', category: 'ETFs', pipSize: 0.01, contractSize: 1, pipValue: 0.01, priceDecimals: 2, lotStep: 1, minLot: 1, maxLot: 10000, quoteCurrency: 'USD' },
  { symbol: 'GLD', name: 'SPDR Gold Shares', type: 'etf', category: 'ETFs', pipSize: 0.01, contractSize: 1, pipValue: 0.01, priceDecimals: 2, lotStep: 1, minLot: 1, maxLot: 10000, quoteCurrency: 'USD' },
  { symbol: 'SLV', name: 'iShares Silver Trust', type: 'etf', category: 'ETFs', pipSize: 0.01, contractSize: 1, pipValue: 0.01, priceDecimals: 2, lotStep: 1, minLot: 1, maxLot: 10000, quoteCurrency: 'USD' },
];

// ============================================
// ALL ASSETS COMBINED
// ============================================
export const ALL_ASSETS: AssetConfig[] = [
  ...FOREX_MAJORS,
  ...FOREX_MINORS,
  ...FOREX_EXOTICS,
  ...CRYPTO,
  ...INDICES,
  ...COMMODITIES,
  ...STOCKS_USA,
  ...STOCKS_EUROPE,
  ...STOCKS_ASIA,
  ...STOCKS_AFRICA,
  ...STOCKS_MIDDLE_EAST,
  ...ETFS,
];

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get asset configuration by symbol
 */
export function getAssetConfig(symbol: string): AssetConfig | undefined {
  const normalizedSymbol = symbol.replace('/', '').toUpperCase();
  return ALL_ASSETS.find(
    a => a.symbol.replace('/', '').toUpperCase() === normalizedSymbol
  );
}

/**
 * Get all unique categories
 */
export function getAssetCategories(): string[] {
  return [...new Set(ALL_ASSETS.map(a => a.category))];
}

/**
 * Get assets by category
 */
export function getAssetsByCategory(category: string): AssetConfig[] {
  return ALL_ASSETS.filter(a => a.category === category);
}

/**
 * Search assets by symbol or name
 */
export function searchAssets(query: string, limit = 20): AssetConfig[] {
  const normalizedQuery = query.toLowerCase().trim();
  if (!normalizedQuery) return [];
  
  return ALL_ASSETS
    .filter(a => 
      a.symbol.toLowerCase().includes(normalizedQuery) ||
      a.name.toLowerCase().includes(normalizedQuery)
    )
    .slice(0, limit);
}
