import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue,
} from '@/components/ui/select';
import { 
  RefreshCw, 
  ArrowLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Wifi,
  WifiOff,
  Coins,
  Banknote,
  LayoutGrid,
  Search,
  X,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { useExchangeRates } from '@/hooks/useExchangeRates';

interface Asset {
  code: string;
  name: string;
  nameFr: string;
  symbol: string;
  decimals: number;
  type: 'fiat' | 'crypto';
  flag?: string;
}

// Fiat currencies with flag emojis
const FIAT_CURRENCIES: Asset[] = [
  { code: 'USD', name: 'US Dollar', nameFr: 'Dollar américain', symbol: '$', decimals: 2, type: 'fiat', flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro', nameFr: 'Euro', symbol: '€', decimals: 2, type: 'fiat', flag: '🇪🇺' },
  { code: 'GBP', name: 'British Pound', nameFr: 'Livre sterling', symbol: '£', decimals: 2, type: 'fiat', flag: '🇬🇧' },
  { code: 'JPY', name: 'Japanese Yen', nameFr: 'Yen japonais', symbol: '¥', decimals: 0, type: 'fiat', flag: '🇯🇵' },
  { code: 'CHF', name: 'Swiss Franc', nameFr: 'Franc suisse', symbol: 'CHF', decimals: 2, type: 'fiat', flag: '🇨🇭' },
  { code: 'CAD', name: 'Canadian Dollar', nameFr: 'Dollar canadien', symbol: 'CA$', decimals: 2, type: 'fiat', flag: '🇨🇦' },
  { code: 'AUD', name: 'Australian Dollar', nameFr: 'Dollar australien', symbol: 'A$', decimals: 2, type: 'fiat', flag: '🇦🇺' },
  { code: 'NZD', name: 'New Zealand Dollar', nameFr: 'Dollar néo-zélandais', symbol: 'NZ$', decimals: 2, type: 'fiat', flag: '🇳🇿' },
  { code: 'CNY', name: 'Chinese Yuan', nameFr: 'Yuan chinois', symbol: '¥', decimals: 2, type: 'fiat', flag: '🇨🇳' },
  { code: 'HKD', name: 'Hong Kong Dollar', nameFr: 'Dollar de Hong Kong', symbol: 'HK$', decimals: 2, type: 'fiat', flag: '🇭🇰' },
  { code: 'SGD', name: 'Singapore Dollar', nameFr: 'Dollar de Singapour', symbol: 'S$', decimals: 2, type: 'fiat', flag: '🇸🇬' },
  { code: 'XAF', name: 'CFA Franc (CEMAC)', nameFr: 'Franc CFA (CEMAC)', symbol: 'FCFA', decimals: 0, type: 'fiat', flag: '🌍' },
  { code: 'XOF', name: 'CFA Franc (UEMOA)', nameFr: 'Franc CFA (UEMOA)', symbol: 'FCFA', decimals: 0, type: 'fiat', flag: '🌍' },
  { code: 'ZAR', name: 'South African Rand', nameFr: 'Rand sud-africain', symbol: 'R', decimals: 2, type: 'fiat', flag: '🇿🇦' },
  { code: 'NGN', name: 'Nigerian Naira', nameFr: 'Naira nigérian', symbol: '₦', decimals: 2, type: 'fiat', flag: '🇳🇬' },
  { code: 'GHS', name: 'Ghanaian Cedi', nameFr: 'Cedi ghanéen', symbol: '₵', decimals: 2, type: 'fiat', flag: '🇬🇭' },
  { code: 'KES', name: 'Kenyan Shilling', nameFr: 'Shilling kényan', symbol: 'KSh', decimals: 2, type: 'fiat', flag: '🇰🇪' },
  { code: 'EGP', name: 'Egyptian Pound', nameFr: 'Livre égyptienne', symbol: 'E£', decimals: 2, type: 'fiat', flag: '🇪🇬' },
  { code: 'MAD', name: 'Moroccan Dirham', nameFr: 'Dirham marocain', symbol: 'MAD', decimals: 2, type: 'fiat', flag: '🇲🇦' },
  { code: 'AED', name: 'UAE Dirham', nameFr: 'Dirham des Émirats', symbol: 'AED', decimals: 2, type: 'fiat', flag: '🇦🇪' },
  { code: 'SAR', name: 'Saudi Riyal', nameFr: 'Riyal saoudien', symbol: 'SAR', decimals: 2, type: 'fiat', flag: '🇸🇦' },
  { code: 'INR', name: 'Indian Rupee', nameFr: 'Roupie indienne', symbol: '₹', decimals: 2, type: 'fiat', flag: '🇮🇳' },
  { code: 'KRW', name: 'South Korean Won', nameFr: 'Won sud-coréen', symbol: '₩', decimals: 0, type: 'fiat', flag: '🇰🇷' },
  { code: 'THB', name: 'Thai Baht', nameFr: 'Baht thaïlandais', symbol: '฿', decimals: 2, type: 'fiat', flag: '🇹🇭' },
  { code: 'MYR', name: 'Malaysian Ringgit', nameFr: 'Ringgit malaisien', symbol: 'RM', decimals: 2, type: 'fiat', flag: '🇲🇾' },
  { code: 'IDR', name: 'Indonesian Rupiah', nameFr: 'Roupie indonésienne', symbol: 'Rp', decimals: 0, type: 'fiat', flag: '🇮🇩' },
  { code: 'PHP', name: 'Philippine Peso', nameFr: 'Peso philippin', symbol: '₱', decimals: 2, type: 'fiat', flag: '🇵🇭' },
  { code: 'VND', name: 'Vietnamese Dong', nameFr: 'Dong vietnamien', symbol: '₫', decimals: 0, type: 'fiat', flag: '🇻🇳' },
  { code: 'SEK', name: 'Swedish Krona', nameFr: 'Couronne suédoise', symbol: 'kr', decimals: 2, type: 'fiat', flag: '🇸🇪' },
  { code: 'NOK', name: 'Norwegian Krone', nameFr: 'Couronne norvégienne', symbol: 'kr', decimals: 2, type: 'fiat', flag: '🇳🇴' },
  { code: 'DKK', name: 'Danish Krone', nameFr: 'Couronne danoise', symbol: 'kr', decimals: 2, type: 'fiat', flag: '🇩🇰' },
  { code: 'PLN', name: 'Polish Zloty', nameFr: 'Zloty polonais', symbol: 'zł', decimals: 2, type: 'fiat', flag: '🇵🇱' },
  { code: 'CZK', name: 'Czech Koruna', nameFr: 'Couronne tchèque', symbol: 'Kč', decimals: 2, type: 'fiat', flag: '🇨🇿' },
  { code: 'HUF', name: 'Hungarian Forint', nameFr: 'Forint hongrois', symbol: 'Ft', decimals: 0, type: 'fiat', flag: '🇭🇺' },
  { code: 'RON', name: 'Romanian Leu', nameFr: 'Leu roumain', symbol: 'lei', decimals: 2, type: 'fiat', flag: '🇷🇴' },
  { code: 'RUB', name: 'Russian Ruble', nameFr: 'Rouble russe', symbol: '₽', decimals: 2, type: 'fiat', flag: '🇷🇺' },
  { code: 'UAH', name: 'Ukrainian Hryvnia', nameFr: 'Hryvnia ukrainienne', symbol: '₴', decimals: 2, type: 'fiat', flag: '🇺🇦' },
  { code: 'TRY', name: 'Turkish Lira', nameFr: 'Livre turque', symbol: '₺', decimals: 2, type: 'fiat', flag: '🇹🇷' },
  { code: 'MXN', name: 'Mexican Peso', nameFr: 'Peso mexicain', symbol: 'MX$', decimals: 2, type: 'fiat', flag: '🇲🇽' },
  { code: 'BRL', name: 'Brazilian Real', nameFr: 'Réal brésilien', symbol: 'R$', decimals: 2, type: 'fiat', flag: '🇧🇷' },
  { code: 'ARS', name: 'Argentine Peso', nameFr: 'Peso argentin', symbol: 'AR$', decimals: 2, type: 'fiat', flag: '🇦🇷' },
  { code: 'CLP', name: 'Chilean Peso', nameFr: 'Peso chilien', symbol: 'CL$', decimals: 0, type: 'fiat', flag: '🇨🇱' },
  { code: 'COP', name: 'Colombian Peso', nameFr: 'Peso colombien', symbol: 'CO$', decimals: 0, type: 'fiat', flag: '🇨🇴' },
  { code: 'PEN', name: 'Peruvian Sol', nameFr: 'Sol péruvien', symbol: 'S/', decimals: 2, type: 'fiat', flag: '🇵🇪' },
];

// Cryptocurrencies with icons
const CRYPTOCURRENCIES: Asset[] = [
  { code: 'BTC', name: 'Bitcoin', nameFr: 'Bitcoin', symbol: '₿', decimals: 8, type: 'crypto', flag: '🪙' },
  { code: 'ETH', name: 'Ethereum', nameFr: 'Ethereum', symbol: 'Ξ', decimals: 8, type: 'crypto', flag: '💎' },
  { code: 'USDT', name: 'Tether', nameFr: 'Tether', symbol: '₮', decimals: 6, type: 'crypto', flag: '💵' },
  { code: 'USDC', name: 'USD Coin', nameFr: 'USD Coin', symbol: '$', decimals: 6, type: 'crypto', flag: '💰' },
  { code: 'BNB', name: 'Binance Coin', nameFr: 'Binance Coin', symbol: 'BNB', decimals: 8, type: 'crypto', flag: '🔶' },
  { code: 'SOL', name: 'Solana', nameFr: 'Solana', symbol: 'SOL', decimals: 9, type: 'crypto', flag: '☀️' },
  { code: 'XRP', name: 'Ripple', nameFr: 'Ripple', symbol: 'XRP', decimals: 6, type: 'crypto', flag: '💧' },
  { code: 'ADA', name: 'Cardano', nameFr: 'Cardano', symbol: 'ADA', decimals: 6, type: 'crypto', flag: '🔷' },
  { code: 'DOGE', name: 'Dogecoin', nameFr: 'Dogecoin', symbol: 'Ð', decimals: 8, type: 'crypto', flag: '🐕' },
  { code: 'TRX', name: 'Tron', nameFr: 'Tron', symbol: 'TRX', decimals: 6, type: 'crypto', flag: '⚡' },
  { code: 'MATIC', name: 'Polygon', nameFr: 'Polygon', symbol: 'MATIC', decimals: 8, type: 'crypto', flag: '🔮' },
  { code: 'LTC', name: 'Litecoin', nameFr: 'Litecoin', symbol: 'Ł', decimals: 8, type: 'crypto', flag: '🥈' },
  { code: 'DOT', name: 'Polkadot', nameFr: 'Polkadot', symbol: 'DOT', decimals: 10, type: 'crypto', flag: '⚪' },
  { code: 'AVAX', name: 'Avalanche', nameFr: 'Avalanche', symbol: 'AVAX', decimals: 9, type: 'crypto', flag: '🔺' },
  { code: 'LINK', name: 'Chainlink', nameFr: 'Chainlink', symbol: 'LINK', decimals: 8, type: 'crypto', flag: '🔗' },
  { code: 'SHIB', name: 'Shiba Inu', nameFr: 'Shiba Inu', symbol: 'SHIB', decimals: 8, type: 'crypto', flag: '🐶' },
  { code: 'TON', name: 'Toncoin', nameFr: 'Toncoin', symbol: 'TON', decimals: 9, type: 'crypto', flag: '💠' },
  { code: 'NEAR', name: 'Near Protocol', nameFr: 'Near Protocol', symbol: 'NEAR', decimals: 8, type: 'crypto', flag: '🌐' },
  { code: 'PEPE', name: 'Pepe', nameFr: 'Pepe', symbol: 'PEPE', decimals: 8, type: 'crypto', flag: '🐸' },
  { code: 'FLOKI', name: 'Floki', nameFr: 'Floki', symbol: 'FLOKI', decimals: 8, type: 'crypto', flag: '🐕‍🦺' },
  { code: 'ARB', name: 'Arbitrum', nameFr: 'Arbitrum', symbol: 'ARB', decimals: 8, type: 'crypto', flag: '🔵' },
  { code: 'OP', name: 'Optimism', nameFr: 'Optimism', symbol: 'OP', decimals: 8, type: 'crypto', flag: '🔴' },
  { code: 'APT', name: 'Aptos', nameFr: 'Aptos', symbol: 'APT', decimals: 8, type: 'crypto', flag: '🟢' },
  { code: 'SUI', name: 'Sui', nameFr: 'Sui', symbol: 'SUI', decimals: 9, type: 'crypto', flag: '💙' },
  { code: 'INJ', name: 'Injective', nameFr: 'Injective', symbol: 'INJ', decimals: 8, type: 'crypto', flag: '💉' },
  { code: 'FTM', name: 'Fantom', nameFr: 'Fantom', symbol: 'FTM', decimals: 8, type: 'crypto', flag: '👻' },
  { code: 'ATOM', name: 'Cosmos', nameFr: 'Cosmos', symbol: 'ATOM', decimals: 6, type: 'crypto', flag: '⚛️' },
  { code: 'UNI', name: 'Uniswap', nameFr: 'Uniswap', symbol: 'UNI', decimals: 8, type: 'crypto', flag: '🦄' },
  { code: 'AAVE', name: 'Aave', nameFr: 'Aave', symbol: 'AAVE', decimals: 8, type: 'crypto', flag: '👻' },
  { code: 'MKR', name: 'Maker', nameFr: 'Maker', symbol: 'MKR', decimals: 8, type: 'crypto', flag: '🏭' },
  { code: 'CRO', name: 'Cronos', nameFr: 'Cronos', symbol: 'CRO', decimals: 8, type: 'crypto', flag: '🦁' },
  { code: 'ALGO', name: 'Algorand', nameFr: 'Algorand', symbol: 'ALGO', decimals: 6, type: 'crypto', flag: '🔷' },
  { code: 'XLM', name: 'Stellar', nameFr: 'Stellar', symbol: 'XLM', decimals: 7, type: 'crypto', flag: '⭐' },
  { code: 'VET', name: 'VeChain', nameFr: 'VeChain', symbol: 'VET', decimals: 8, type: 'crypto', flag: '✔️' },
  { code: 'FIL', name: 'Filecoin', nameFr: 'Filecoin', symbol: 'FIL', decimals: 8, type: 'crypto', flag: '📁' },
  { code: 'ICP', name: 'Internet Computer', nameFr: 'Internet Computer', symbol: 'ICP', decimals: 8, type: 'crypto', flag: '🖥️' },
  { code: 'RENDER', name: 'Render', nameFr: 'Render', symbol: 'RENDER', decimals: 8, type: 'crypto', flag: '🎨' },
  { code: 'GRT', name: 'The Graph', nameFr: 'The Graph', symbol: 'GRT', decimals: 8, type: 'crypto', flag: '📊' },
  { code: 'IMX', name: 'Immutable X', nameFr: 'Immutable X', symbol: 'IMX', decimals: 8, type: 'crypto', flag: '🎮' },
  { code: 'WIF', name: 'Dogwifhat', nameFr: 'Dogwifhat', symbol: 'WIF', decimals: 8, type: 'crypto', flag: '🎩' },
  { code: 'BONK', name: 'Bonk', nameFr: 'Bonk', symbol: 'BONK', decimals: 8, type: 'crypto', flag: '🦴' },
];

const ALL_ASSETS: Asset[] = [...FIAT_CURRENCIES, ...CRYPTOCURRENCIES];

interface ConversionSlot {
  id: number;
  assetCode: string;
  isEditing: boolean;
}

// Memoized asset item component for performance
const AssetItem = React.memo(({ asset, language }: { asset: Asset; language: string }) => (
  <div className="flex items-center gap-3">
    <span className="text-xl">{asset.flag}</span>
    <div>
      <span className="font-medium">{asset.code}</span>
      <span className="text-muted-foreground ml-2 text-sm">
        {language === 'fr' ? asset.nameFr : asset.name}
      </span>
    </div>
  </div>
));

AssetItem.displayName = 'AssetItem';

const CurrencyConversion: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  
  // Use the new hook with Edge Function
  const {
    rates,
    cryptoChanges24h,
    isLoading,
    isRefreshing,
    error,
    lastUpdated,
    isStale,
    refetch,
    convertHighPrecision
  } = useExchangeRates();
  
  const [baseAmount, setBaseAmount] = useState<string>('100');
  const [slots, setSlots] = useState<ConversionSlot[]>([
    { id: 1, assetCode: 'USD', isEditing: true },
    { id: 2, assetCode: 'XAF', isEditing: false },
    { id: 3, assetCode: 'EUR', isEditing: false },
    { id: 4, assetCode: 'BTC', isEditing: false },
  ]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [editingSlotId, setEditingSlotId] = useState<number | null>(1);
  const [assetFilter, setAssetFilter] = useState<'all' | 'fiat' | 'crypto'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filtered and searched assets - memoized for performance
  const filteredAssets = useMemo(() => {
    let assets: Asset[];
    switch (assetFilter) {
      case 'fiat':
        assets = FIAT_CURRENCIES;
        break;
      case 'crypto':
        assets = CRYPTOCURRENCIES;
        break;
      default:
        assets = ALL_ASSETS;
    }
    
    if (!searchQuery.trim()) return assets;
    
    const query = searchQuery.toLowerCase().trim();
    return assets.filter(a => 
      a.code.toLowerCase().includes(query) ||
      a.name.toLowerCase().includes(query) ||
      a.nameFr.toLowerCase().includes(query)
    );
  }, [assetFilter, searchQuery]);

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Get asset data - memoized
  const getAsset = useCallback((code: string): Asset | undefined => {
    return ALL_ASSETS.find(a => a.code === code);
  }, []);

  // Get asset name based on language
  const getAssetName = useCallback((code: string): string => {
    const asset = getAsset(code);
    if (!asset) return code;
    return language === 'fr' ? asset.nameFr : asset.name;
  }, [getAsset, language]);

  // Convert amount using high precision
  const convertAmount = useCallback((amount: number, fromCode: string, toCode: string): string => {
    if (!amount || isNaN(amount) || fromCode === toCode) {
      return formatDisplayNumber(amount || 0, getAsset(toCode)?.decimals || 4);
    }
    return convertHighPrecision(amount, fromCode, toCode);
  }, [convertHighPrecision, getAsset]);

  // Format number with proper decimals for display
  const formatDisplayNumber = useCallback((num: number, decimals: number = 4): string => {
    if (num === 0) return '0';
    
    const absNum = Math.abs(num);
    let formattedDecimals = decimals;
    
    // Auto-adjust decimals for very small/large numbers
    if (absNum < 0.000001) formattedDecimals = 10;
    else if (absNum < 0.0001) formattedDecimals = 8;
    else if (absNum < 0.01) formattedDecimals = 6;
    else if (absNum < 1) formattedDecimals = 4;
    else if (absNum >= 1000000) formattedDecimals = 0;
    else if (absNum >= 1000) formattedDecimals = 2;
    
    const formatted = num.toFixed(Math.min(formattedDecimals, decimals));
    const parts = formatted.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    
    if (parts[1]) {
      parts[1] = parts[1].replace(/0+$/, '');
      if (parts[1] === '') return parts[0];
    }
    
    return parts.join(',');
  }, []);

  // Update slot asset
  const updateSlotAsset = useCallback((slotId: number, newAssetCode: string) => {
    setSlots(prev => prev.map(slot => 
      slot.id === slotId ? { ...slot, assetCode: newAssetCode } : slot
    ));
    setSearchQuery('');
  }, []);

  // Get the base slot
  const baseSlot = useMemo(() => {
    return slots.find(s => s.id === editingSlotId) || slots[0];
  }, [slots, editingSlotId]);

  // Calculate converted values
  const getConvertedValue = useCallback((slotId: number): string => {
    const slot = slots.find(s => s.id === slotId);
    if (!slot) return '0';
    
    if (slot.id === editingSlotId) {
      return formatDisplayNumber(parseFloat(baseAmount) || 0, getAsset(slot.assetCode)?.decimals || 4);
    }
    
    const amount = parseFloat(baseAmount) || 0;
    return convertAmount(amount, baseSlot.assetCode, slot.assetCode);
  }, [slots, baseAmount, editingSlotId, baseSlot, convertAmount, formatDisplayNumber, getAsset]);

  // Handle slot click
  const handleSlotClick = useCallback((slotId: number) => {
    const slot = slots.find(s => s.id === slotId);
    if (!slot) return;
    
    const currentValue = getConvertedValue(slotId);
    // Parse the formatted value back to a number string
    const numericValue = currentValue.replace(/\s/g, '').replace(',', '.');
    setBaseAmount(numericValue);
    setEditingSlotId(slotId);
  }, [slots, getConvertedValue]);

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between px-4 py-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="text-foreground"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          
          <h1 className="text-lg font-semibold text-foreground">
            {language === 'fr' ? 'Convertisseur de devises' : 'Currency Converter'}
          </h1>
          
          <div className="flex items-center gap-2">
            {isOnline ? (
              <Wifi className="w-5 h-5 text-profit" />
            ) : (
              <WifiOff className="w-5 h-5 text-loss" />
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => refetch()}
              disabled={isRefreshing}
              className="text-foreground"
            >
              <RefreshCw className={cn("w-5 h-5", isRefreshing && "animate-spin")} />
            </Button>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mx-4 mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/30 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-destructive shrink-0" />
          <span className="text-sm text-destructive">{error}</span>
        </div>
      )}

      {/* Stale Data Warning */}
      {isStale && !error && (
        <div className="mx-4 mt-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-yellow-500 shrink-0" />
          <span className="text-sm text-yellow-500">
            {language === 'fr' 
              ? 'Taux potentiellement obsolètes - actualisation en cours...' 
              : 'Rates may be outdated - refreshing...'}
          </span>
        </div>
      )}

      {/* Conversion List */}
      <div className="px-2 py-4">
        <div className="divide-y divide-border/50">
          {slots.map((slot) => {
            const asset = getAsset(slot.assetCode);
            const isEditing = slot.id === editingSlotId;
            const value = getConvertedValue(slot.id);
            const priceChange = cryptoChanges24h[slot.assetCode];
            const hasRate = rates[slot.assetCode] !== undefined;
            
            return (
              <div
                key={slot.id}
                className={cn(
                  "flex items-center justify-between py-5 px-3 cursor-pointer",
                  isEditing && "bg-primary/5"
                )}
                onClick={() => !isEditing && handleSlotClick(slot.id)}
              >
                {/* Left: Flag/Icon + Code */}
                <div className="flex items-center gap-4">
                  <div className="text-3xl">
                    {asset?.flag || '💱'}
                  </div>
                  
                  <Select
                    value={slot.assetCode}
                    onValueChange={(v) => updateSlotAsset(slot.id, v)}
                  >
                    <SelectTrigger className="w-auto border-0 bg-transparent p-0 h-auto shadow-none focus:ring-0">
                      <SelectValue>
                        <div className="flex items-center gap-1">
                          <span className="text-lg font-semibold text-foreground">
                            {slot.assetCode}
                          </span>
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="max-h-[400px] bg-background border border-border">
                      {/* Search bar */}
                      <div className="p-2 border-b border-border sticky top-0 bg-background z-20">
                        <div className="relative">
                          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={language === 'fr' ? 'Rechercher...' : 'Search...'}
                            className="h-8 pl-8 pr-8 text-sm"
                            onClick={(e) => e.stopPropagation()}
                          />
                          {searchQuery && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                clearSearch();
                              }}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                      
                      {/* Filter tabs */}
                      <div className="flex gap-1 p-2 border-b border-border sticky top-[52px] bg-background z-10">
                        <Button
                          size="sm"
                          variant={assetFilter === 'all' ? 'default' : 'ghost'}
                          className="h-7 text-xs flex-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            setAssetFilter('all');
                          }}
                        >
                          <LayoutGrid className="w-3 h-3 mr-1" />
                          {language === 'fr' ? 'Tout' : 'All'}
                        </Button>
                        <Button
                          size="sm"
                          variant={assetFilter === 'fiat' ? 'default' : 'ghost'}
                          className="h-7 text-xs flex-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            setAssetFilter('fiat');
                          }}
                        >
                          <Banknote className="w-3 h-3 mr-1" />
                          Fiat
                        </Button>
                        <Button
                          size="sm"
                          variant={assetFilter === 'crypto' ? 'default' : 'ghost'}
                          className="h-7 text-xs flex-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            setAssetFilter('crypto');
                          }}
                        >
                          <Coins className="w-3 h-3 mr-1" />
                          Crypto
                        </Button>
                      </div>
                      
                      {/* Asset list */}
                      {filteredAssets.length === 0 ? (
                        <div className="p-4 text-center text-muted-foreground text-sm">
                          {language === 'fr' ? 'Aucun résultat' : 'No results'}
                        </div>
                      ) : (
                        filteredAssets.map((a) => (
                          <SelectItem key={a.code} value={a.code}>
                            <AssetItem asset={a} language={language} />
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  
                  {/* 24h change indicator for crypto */}
                  {priceChange !== undefined && (
                    <span className={cn(
                      "text-xs font-medium flex items-center gap-0.5",
                      priceChange >= 0 ? "text-profit" : "text-loss"
                    )}>
                      {priceChange >= 0 ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      {Math.abs(priceChange).toFixed(2)}%
                    </span>
                  )}
                </div>

                {/* Right: Value + Name */}
                <div className="flex flex-col items-end">
                  {isLoading && !hasRate ? (
                    <div className="flex items-center gap-2 h-10">
                      <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {language === 'fr' ? 'Chargement...' : 'Loading...'}
                      </span>
                    </div>
                  ) : isEditing ? (
                    <Input
                      type="text"
                      inputMode="decimal"
                      value={baseAmount}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9.,]/g, '');
                        setBaseAmount(val);
                      }}
                      className="text-right text-2xl font-semibold h-10 w-40 bg-transparent border-0 border-b-2 border-primary rounded-none shadow-none focus-visible:ring-0 px-0"
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <span className="text-2xl font-semibold text-foreground">
                      {value}
                    </span>
                  )}
                  <span className="text-sm text-muted-foreground mt-1">
                    {getAssetName(slot.assetCode)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Last updated info */}
      <div className="px-4 py-3 text-center">
        {lastUpdated ? (
          <span className="text-xs text-muted-foreground">
            {language === 'fr' ? 'Dernière mise à jour: ' : 'Last updated: '}
            {lastUpdated.toLocaleTimeString()}
            {isRefreshing && (
              <span className="ml-2 text-primary">
                {language === 'fr' ? '(actualisation...)' : '(refreshing...)'}
              </span>
            )}
            {isStale && !isRefreshing && (
              <span className="ml-2 text-yellow-500">
                {language === 'fr' ? '(données en cache)' : '(cached data)'}
              </span>
            )}
          </span>
        ) : isLoading ? (
          <span className="text-xs text-muted-foreground flex items-center justify-center gap-2">
            <Loader2 className="w-3 h-3 animate-spin" />
            {language === 'fr' ? 'Chargement des taux...' : 'Loading rates...'}
          </span>
        ) : null}
      </div>
    </div>
  );
};

export default CurrencyConversion;
