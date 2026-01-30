import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Cache storage (in-memory for edge function)
interface CacheEntry {
  data: ExchangeRatesResponse;
  timestamp: number;
}

let ratesCache: CacheEntry | null = null;
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

// Crypto ID mapping for CoinGecko
const CRYPTO_IDS: Record<string, string> = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  USDT: 'tether',
  USDC: 'usd-coin',
  BNB: 'binancecoin',
  SOL: 'solana',
  XRP: 'ripple',
  ADA: 'cardano',
  DOGE: 'dogecoin',
  TRX: 'tron',
  MATIC: 'matic-network',
  LTC: 'litecoin',
  DOT: 'polkadot',
  AVAX: 'avalanche-2',
  LINK: 'chainlink',
  SHIB: 'shiba-inu',
  TON: 'the-open-network',
  NEAR: 'near',
  PEPE: 'pepe',
  FLOKI: 'floki',
  ARB: 'arbitrum',
  OP: 'optimism',
  APT: 'aptos',
  SUI: 'sui',
  INJ: 'injective-protocol',
  FTM: 'fantom',
  ATOM: 'cosmos',
  UNI: 'uniswap',
  AAVE: 'aave',
  MKR: 'maker',
  CRO: 'crypto-com-chain',
  ALGO: 'algorand',
  XLM: 'stellar',
  VET: 'vechain',
  FIL: 'filecoin',
  ICP: 'internet-computer',
  RENDER: 'render-token',
  GRT: 'the-graph',
  IMX: 'immutable-x',
  WIF: 'dogwifcoin',
  BONK: 'bonk',
};

interface ExchangeRatesResponse {
  fiatRates: Record<string, number>;
  cryptoRates: Record<string, number>;
  cryptoChanges24h: Record<string, number>;
  timestamp: number;
  source: string;
}

// Primary fiat API: exchangerate-api.com (free tier, reliable)
async function fetchFiatRatesPrimary(): Promise<Record<string, number> | null> {
  try {
    const response = await fetch('https://open.er-api.com/v6/latest/USD', {
      signal: AbortSignal.timeout(8000),
    });
    
    if (!response.ok) return null;
    
    const data = await response.json();
    if (!data.rates) return null;
    
    // Add pegged currencies
    const rates: Record<string, number> = { USD: 1 };
    for (const [code, rate] of Object.entries(data.rates)) {
      rates[code] = rate as number;
    }
    
    // XAF and XOF are pegged to EUR (1 EUR = 655.957 XAF/XOF)
    if (rates.EUR) {
      rates.XAF = rates.EUR * 655.957;
      rates.XOF = rates.EUR * 655.957;
    }
    
    return rates;
  } catch (error) {
    console.error('Primary fiat API failed:', error);
    return null;
  }
}

// Fallback fiat API: fawazahmed0 currency-api
async function fetchFiatRatesFallback(): Promise<Record<string, number> | null> {
  try {
    const response = await fetch(
      'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json',
      { signal: AbortSignal.timeout(8000) }
    );
    
    if (!response.ok) return null;
    
    const data = await response.json();
    if (!data.usd) return null;
    
    const rates: Record<string, number> = { USD: 1 };
    for (const [code, rate] of Object.entries(data.usd)) {
      rates[code.toUpperCase()] = rate as number;
    }
    
    // XAF and XOF peg
    if (rates.EUR) {
      rates.XAF = rates.EUR * 655.957;
      rates.XOF = rates.EUR * 655.957;
    }
    
    return rates;
  } catch (error) {
    console.error('Fallback fiat API failed:', error);
    return null;
  }
}

// Primary crypto API: CoinGecko (free tier, most reliable)
async function fetchCryptoRatesPrimary(): Promise<{ rates: Record<string, number>; changes: Record<string, number> } | null> {
  try {
    const ids = Object.values(CRYPTO_IDS).join(',');
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`,
      { signal: AbortSignal.timeout(10000) }
    );
    
    if (!response.ok) return null;
    
    const data = await response.json();
    
    const rates: Record<string, number> = {};
    const changes: Record<string, number> = {};
    
    for (const [symbol, geckoId] of Object.entries(CRYPTO_IDS)) {
      const coinData = data[geckoId];
      if (coinData) {
        // Store as 1 USD = X crypto (inverse of price)
        rates[symbol] = coinData.usd > 0 ? 1 / coinData.usd : 0;
        changes[symbol] = coinData.usd_24h_change || 0;
      }
    }
    
    return { rates, changes };
  } catch (error) {
    console.error('Primary crypto API failed:', error);
    return null;
  }
}

// Fallback crypto API: CoinCap
async function fetchCryptoRatesFallback(): Promise<{ rates: Record<string, number>; changes: Record<string, number> } | null> {
  try {
    const response = await fetch(
      'https://api.coincap.io/v2/assets?limit=50',
      { signal: AbortSignal.timeout(10000) }
    );
    
    if (!response.ok) return null;
    
    const data = await response.json();
    if (!data.data) return null;
    
    const rates: Record<string, number> = {};
    const changes: Record<string, number> = {};
    
    const symbolMap: Record<string, string> = {
      'bitcoin': 'BTC',
      'ethereum': 'ETH',
      'tether': 'USDT',
      'usd-coin': 'USDC',
      'binance-coin': 'BNB',
      'solana': 'SOL',
      'xrp': 'XRP',
      'cardano': 'ADA',
      'dogecoin': 'DOGE',
      'litecoin': 'LTC',
      'polkadot': 'DOT',
      'avalanche': 'AVAX',
      'chainlink': 'LINK',
      'shiba-inu': 'SHIB',
      'toncoin': 'TON',
      'near-protocol': 'NEAR',
      'cosmos': 'ATOM',
      'uniswap': 'UNI',
      'stellar': 'XLM',
      'filecoin': 'FIL',
      'internet-computer': 'ICP',
    };
    
    for (const coin of data.data) {
      const symbol = coin.symbol?.toUpperCase();
      const id = coin.id?.toLowerCase();
      
      // Match by symbol or id
      const targetSymbol = symbolMap[id] || (Object.keys(CRYPTO_IDS).includes(symbol) ? symbol : null);
      
      if (targetSymbol && coin.priceUsd) {
        const price = parseFloat(coin.priceUsd);
        if (price > 0) {
          rates[targetSymbol] = 1 / price;
          changes[targetSymbol] = parseFloat(coin.changePercent24Hr) || 0;
        }
      }
    }
    
    return { rates, changes };
  } catch (error) {
    console.error('Fallback crypto API failed:', error);
    return null;
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const now = Date.now();
    
    // Check cache (5 minutes)
    if (ratesCache && (now - ratesCache.timestamp) < CACHE_DURATION_MS) {
      console.log('Returning cached rates');
      return new Response(JSON.stringify(ratesCache.data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Fetching fresh rates...');

    // Fetch fiat and crypto in parallel
    const [fiatRates, cryptoResult] = await Promise.all([
      // Fiat with fallback
      fetchFiatRatesPrimary().then(rates => rates || fetchFiatRatesFallback()),
      // Crypto with fallback
      fetchCryptoRatesPrimary().then(result => result || fetchCryptoRatesFallback()),
    ]);

    // Determine source for debugging
    let source = 'mixed';
    
    // Build response
    const response: ExchangeRatesResponse = {
      fiatRates: fiatRates || {},
      cryptoRates: cryptoResult?.rates || {},
      cryptoChanges24h: cryptoResult?.changes || {},
      timestamp: now,
      source,
    };

    // Check if we got any data
    const hasFiatData = Object.keys(response.fiatRates).length > 5;
    const hasCryptoData = Object.keys(response.cryptoRates).length > 5;

    if (!hasFiatData && !hasCryptoData) {
      throw new Error('All API sources failed');
    }

    // Update cache
    ratesCache = { data: response, timestamp: now };

    return new Response(JSON.stringify(response), {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300', // 5 minutes
      },
    });
  } catch (error) {
    console.error('Exchange rates error:', error);
    
    // Return cached data if available (stale cache better than no data)
    if (ratesCache) {
      console.log('Returning stale cache due to error');
      return new Response(JSON.stringify({
        ...ratesCache.data,
        stale: true,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({ 
        error: 'Unable to fetch exchange rates',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      { 
        status: 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
