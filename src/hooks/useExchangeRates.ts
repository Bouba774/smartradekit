import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ExchangeRatesData {
  fiatRates: Record<string, number>;
  cryptoRates: Record<string, number>;
  cryptoChanges24h: Record<string, number>;
  timestamp: number;
  source?: string;
  stale?: boolean;
}

interface UseExchangeRatesReturn {
  rates: Record<string, number>;
  cryptoChanges24h: Record<string, number>;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  lastUpdated: Date | null;
  isStale: boolean;
  refetch: () => Promise<void>;
  convert: (amount: number, fromCurrency: string, toCurrency: string) => number;
  convertHighPrecision: (amount: number, fromCurrency: string, toCurrency: string) => string;
}

const CACHE_KEY = 'exchange-rates-v2';
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes
const AUTO_REFRESH_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

// Fallback rates in case everything fails
const FALLBACK_FIAT_RATES: Record<string, number> = {
  USD: 1, EUR: 0.92, GBP: 0.79, JPY: 154.25, CHF: 0.88,
  CAD: 1.36, AUD: 1.54, NZD: 1.68, CNY: 7.24, HKD: 7.82,
  SGD: 1.34, XAF: 603.67, XOF: 603.67, ZAR: 18.5, NGN: 1550,
  GHS: 15.5, KES: 153, EGP: 49, MAD: 10, AED: 3.67,
  SAR: 3.75, INR: 83.5, KRW: 1340, THB: 35.5, MYR: 4.7,
  IDR: 15800, PHP: 56.5, VND: 24500, SEK: 10.5, NOK: 10.8,
  DKK: 6.9, PLN: 4.0, CZK: 23.5, HUF: 365, RON: 4.6,
  RUB: 92, UAH: 38, TRY: 32, MXN: 17.2, BRL: 5.0,
  ARS: 900, CLP: 950, COP: 4000, PEN: 3.75,
};

const FALLBACK_CRYPTO_RATES: Record<string, number> = {
  BTC: 0.0000095, // ~$105,000
  ETH: 0.00028, // ~$3,500
  USDT: 1, USDC: 1,
  BNB: 0.0014, SOL: 0.0044, XRP: 0.38,
  ADA: 1.1, DOGE: 2.8, TRX: 3.8,
};

export const useExchangeRates = (): UseExchangeRatesReturn => {
  const [data, setData] = useState<ExchangeRatesData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isStale, setIsStale] = useState(false);
  
  const isMountedRef = useRef(true);
  const refreshIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load from localStorage cache
  const loadFromCache = useCallback((): ExchangeRatesData | null => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;
      
      const parsed = JSON.parse(cached) as ExchangeRatesData;
      const cacheAge = Date.now() - parsed.timestamp;
      
      // Consider stale if older than 5 minutes
      if (cacheAge > CACHE_DURATION_MS) {
        return { ...parsed, stale: true };
      }
      
      return parsed;
    } catch {
      return null;
    }
  }, []);

  // Save to localStorage cache
  const saveToCache = useCallback((ratesData: ExchangeRatesData) => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(ratesData));
    } catch {
      // Ignore storage errors
    }
  }, []);

  // Fetch rates from Edge Function
  const fetchRates = useCallback(async (silent = false) => {
    if (!silent) {
      setIsLoading(true);
    }
    setIsRefreshing(true);
    setError(null);

    try {
      // Check cache first
      const cached = loadFromCache();
      if (cached && !cached.stale) {
        if (isMountedRef.current) {
          setData(cached);
          setIsLoading(false);
          setIsRefreshing(false);
          setIsStale(false);
        }
        return;
      }

      // Fetch from Edge Function
      const { data: responseData, error: fetchError } = await supabase.functions.invoke(
        'exchange-rates',
        { method: 'GET' }
      );

      if (!isMountedRef.current) return;

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      if (responseData.error) {
        throw new Error(responseData.error);
      }

      const ratesData: ExchangeRatesData = {
        fiatRates: responseData.fiatRates || {},
        cryptoRates: responseData.cryptoRates || {},
        cryptoChanges24h: responseData.cryptoChanges24h || {},
        timestamp: responseData.timestamp || Date.now(),
        source: responseData.source,
        stale: responseData.stale || false,
      };

      setData(ratesData);
      setIsStale(ratesData.stale || false);
      saveToCache(ratesData);

    } catch (err) {
      console.error('Exchange rates fetch error:', err);
      
      // Use cached data as fallback
      const cached = loadFromCache();
      if (cached) {
        setData({ ...cached, stale: true });
        setIsStale(true);
        setError('Utilisation des taux en cache');
      } else {
        // Last resort: use hardcoded fallback
        const fallbackData: ExchangeRatesData = {
          fiatRates: FALLBACK_FIAT_RATES,
          cryptoRates: FALLBACK_CRYPTO_RATES,
          cryptoChanges24h: {},
          timestamp: Date.now(),
          stale: true,
        };
        setData(fallbackData);
        setIsStale(true);
        setError('Impossible de récupérer les taux actuels, vérifiez votre connexion');
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
  }, [loadFromCache, saveToCache]);

  // Setup auto-refresh and initial fetch
  useEffect(() => {
    isMountedRef.current = true;
    
    // Initial fetch
    fetchRates(false);

    // Auto-refresh every 10 minutes
    refreshIntervalRef.current = setInterval(() => {
      console.log('Auto-refreshing exchange rates...');
      fetchRates(true);
    }, AUTO_REFRESH_INTERVAL_MS);

    return () => {
      isMountedRef.current = false;
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [fetchRates]);

  // Merge fiat and crypto rates
  const allRates = {
    ...(data?.fiatRates || FALLBACK_FIAT_RATES),
    ...(data?.cryptoRates || FALLBACK_CRYPTO_RATES),
  };

  // Standard precision conversion
  const convert = useCallback((amount: number, fromCurrency: string, toCurrency: string): number => {
    if (!amount || isNaN(amount)) return 0;
    if (fromCurrency === toCurrency) return amount;

    const fromRate = allRates[fromCurrency];
    const toRate = allRates[toCurrency];

    if (!fromRate || !toRate) {
      console.warn(`Missing rate for ${fromCurrency} or ${toCurrency}`);
      return 0;
    }

    // Convert through USD as base
    const amountInUsd = amount / fromRate;
    return amountInUsd * toRate;
  }, [allRates]);

  // High precision conversion for crypto/small amounts
  const convertHighPrecision = useCallback((amount: number, fromCurrency: string, toCurrency: string): string => {
    if (!amount || isNaN(amount)) return '0';
    if (fromCurrency === toCurrency) return amount.toString();

    const fromRate = allRates[fromCurrency];
    const toRate = allRates[toCurrency];

    if (!fromRate || !toRate) return '0';

    // Use BigInt-like precision for very small numbers
    const amountInUsd = amount / fromRate;
    const result = amountInUsd * toRate;

    // Determine precision based on value magnitude
    if (result === 0) return '0';
    
    const absResult = Math.abs(result);
    let decimals = 2;

    if (absResult < 0.00000001) decimals = 12;
    else if (absResult < 0.000001) decimals = 10;
    else if (absResult < 0.0001) decimals = 8;
    else if (absResult < 0.01) decimals = 6;
    else if (absResult < 1) decimals = 4;
    else if (absResult >= 10000) decimals = 0;

    // Format with appropriate decimals, then trim trailing zeros
    const formatted = result.toFixed(decimals);
    return formatted.replace(/\.?0+$/, '') || '0';
  }, [allRates]);

  return {
    rates: allRates,
    cryptoChanges24h: data?.cryptoChanges24h || {},
    isLoading,
    isRefreshing,
    error,
    lastUpdated: data?.timestamp ? new Date(data.timestamp) : null,
    isStale,
    refetch: () => fetchRates(false),
    convert,
    convertHighPrecision,
  };
};

export default useExchangeRates;
