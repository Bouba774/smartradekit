import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Info, ChevronDown, Star, Calculator } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { 
  ALL_ASSETS, 
  getAssetCategories, 
  getAssetsByCategory, 
  searchAssets,
  AssetConfig 
} from '@/lib/calculator';
import useFavoriteAssets from '@/hooks/useFavoriteAssets';

export type CalculatorMode = 'price' | 'pips';

interface CalculatorFormProps {
  selectedAsset: string;
  assetConfig: AssetConfig | null;
  onAssetChange: (symbol: string, config: AssetConfig | null) => void;
  capital: string;
  onCapitalChange: (value: string) => void;
  riskPercent: string;
  onRiskPercentChange: (value: string) => void;
  riskAmount: string;
  onRiskAmountChange: (value: string) => void;
  entryPrice: string;
  onEntryPriceChange: (value: string) => void;
  stopLoss: string;
  onStopLossChange: (value: string) => void;
  takeProfit: string;
  onTakeProfitChange: (value: string) => void;
  slPips: string;
  onSlPipsChange: (value: string) => void;
  tpPips: string;
  onTpPipsChange: (value: string) => void;
  pipsDirection: 'BUY' | 'SELL';
  onPipsDirectionChange: (dir: 'BUY' | 'SELL') => void;
  mode: CalculatorMode;
  onModeChange: (mode: CalculatorMode) => void;
  language: string;
  currency: string;
  onCalculate: () => void;
}

const CalculatorForm: React.FC<CalculatorFormProps> = ({
  selectedAsset,
  assetConfig,
  onAssetChange,
  capital,
  onCapitalChange,
  riskPercent,
  onRiskPercentChange,
  riskAmount,
  onRiskAmountChange,
  entryPrice,
  onEntryPriceChange,
  stopLoss,
  onStopLossChange,
  takeProfit,
  onTakeProfitChange,
  slPips,
  onSlPipsChange,
  tpPips,
  onTpPipsChange,
  pipsDirection,
  onPipsDirectionChange,
  mode,
  onModeChange,
  language,
  currency,
  onCalculate,
}) => {
  const isFr = language === 'fr';
  const { favorites, toggleFavorite, isFavorite } = useFavoriteAssets();
  
  const [isAssetOpen, setIsAssetOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const assetRef = useRef<HTMLDivElement>(null);
  
  const selectedAssetDetails = useMemo(() => {
    return ALL_ASSETS.find(a => a.symbol === selectedAsset);
  }, [selectedAsset]);
  
  const categories = useMemo(() => getAssetCategories(), []);
  
  const filteredAssets = useMemo(() => {
    if (searchQuery.trim()) return searchAssets(searchQuery, 50);
    if (selectedCategory) return getAssetsByCategory(selectedCategory);
    return [];
  }, [searchQuery, selectedCategory]);

  // Get favorite asset configs (max 2 displayed)
  const favoriteAssets = useMemo(() => {
    return favorites
      .slice(0, 2)
      .map(sym => ALL_ASSETS.find(a => a.symbol === sym))
      .filter(Boolean) as AssetConfig[];
  }, [favorites]);
  
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (assetRef.current && !assetRef.current.contains(e.target as Node)) {
        setIsAssetOpen(false);
      }
    };
    if (isAssetOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isAssetOpen]);
  
  const handleAssetSelect = (asset: AssetConfig) => {
    onAssetChange(asset.symbol, asset);
    setIsAssetOpen(false);
    setSearchQuery('');
    setSelectedCategory(null);
  };

  const handleNumericInput = (value: string, onChange: (value: string) => void) => {
    if (value === '' || /^[0-9]*\.?[0-9]*$/.test(value)) {
      onChange(value);
    }
  };

  const getCategoryLabel = (type: string) => {
    const labels: Record<string, { fr: string; en: string }> = {
      forex: { fr: 'Forex', en: 'Forex' },
      crypto: { fr: 'Cryptomonnaies', en: 'Cryptocurrencies' },
      index: { fr: 'Indices', en: 'Indices' },
      commodity: { fr: 'Métaux', en: 'Metals' },
      stock: { fr: 'Actions', en: 'Stocks' },
      etf: { fr: 'ETF', en: 'ETF' },
    };
    return labels[type]?.[isFr ? 'fr' : 'en'] || type;
  };

  return (
    <div className="space-y-5">
      {/* Mode Toggle with label */}
      <div className="flex flex-col items-center gap-1.5">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Mode</span>
        <div className="inline-flex rounded-xl bg-secondary/50 p-1 gap-1">
          <button
            type="button"
            onClick={() => onModeChange('price')}
            className={cn(
              'px-5 py-2.5 rounded-lg text-sm font-semibold transition-all',
              mode === 'price'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {isFr ? 'Prix' : 'Price'}
          </button>
          <button
            type="button"
            onClick={() => onModeChange('pips')}
            className={cn(
              'px-5 py-2.5 rounded-lg text-sm font-semibold transition-all',
              mode === 'pips'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Pips
          </button>
        </div>
      </div>

      {/* Asset Selector */}
      <div className="space-y-2" ref={assetRef}>
        <div className="flex items-center gap-2">
          <Label className="text-base font-semibold text-foreground">
            {isFr ? 'Actif' : 'Asset'}
          </Label>
        </div>
        <div className="relative">
          <button
            type="button"
            className={cn(
              'w-full h-14 px-4 flex items-center justify-between',
              'bg-secondary/50 rounded-xl text-left',
              'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
            )}
            onClick={() => setIsAssetOpen(!isAssetOpen)}
          >
            <span className="flex items-center gap-3">
              <Star className="w-5 h-5 text-muted-foreground" />
              <span className="text-lg font-medium">
                {selectedAssetDetails?.symbol || (isFr ? 'Sélectionner...' : 'Select...')}
              </span>
            </span>
            <div className="flex items-center gap-2">
              {selectedAssetDetails && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); toggleFavorite(selectedAssetDetails.symbol); }}
                  className="p-1"
                >
                  <Star className={cn('w-4 h-4', isFavorite(selectedAssetDetails.symbol) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground')} />
                </button>
              )}
              <ChevronDown className={cn('w-5 h-5 text-muted-foreground transition-transform', isAssetOpen && 'rotate-180')} />
            </div>
          </button>
          
          {isAssetOpen && (
            <div className="absolute z-50 w-full mt-2 rounded-xl border bg-popover shadow-xl overflow-hidden">
              <div className="p-3 border-b">
                <Input
                  type="text"
                  placeholder={isFr ? 'Rechercher un actif...' : 'Search asset...'}
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setSelectedCategory(null); }}
                  className="h-10"
                  autoFocus
                />
              </div>
              {!searchQuery && (
                <div className="p-3 border-b">
                  <div className="flex flex-wrap gap-2">
                    {categories.map(cat => (
                      <button
                        key={cat}
                        type="button"
                        className={cn(
                          'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                          selectedCategory === cat 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-secondary/50 text-muted-foreground hover:bg-secondary'
                        )}
                        onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <ScrollArea className="max-h-[250px]">
                {filteredAssets.length > 0 ? (
                  <div className="p-2">
                    {filteredAssets.map(asset => (
                      <button
                        key={asset.symbol}
                        type="button"
                        className={cn(
                          'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left',
                          'hover:bg-accent transition-colors',
                          asset.symbol === selectedAsset && 'bg-accent'
                        )}
                        onClick={() => handleAssetSelect(asset)}
                      >
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); toggleFavorite(asset.symbol); }}
                          className="p-0.5"
                        >
                          <Star className={cn('w-4 h-4', isFavorite(asset.symbol) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground')} />
                        </button>
                        <span className="font-medium">{asset.symbol}</span>
                        <span className="text-muted-foreground text-sm truncate">{asset.name}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center text-muted-foreground text-sm">
                    {searchQuery || selectedCategory
                      ? (isFr ? 'Aucun résultat' : 'No results')
                      : (isFr ? 'Sélectionnez une catégorie ou recherchez' : 'Select a category or search')}
                  </div>
                )}
              </ScrollArea>
            </div>
          )}
        </div>

        {/* Favorite Assets Quick Access */}
        {favoriteAssets.length > 0 && !isAssetOpen && (
          <div className="flex items-center gap-2 pt-1">
            <span className="text-xs text-muted-foreground">{isFr ? 'Favoris' : 'Favorites'}:</span>
            {favoriteAssets.map(asset => (
              <button
                key={asset.symbol}
                type="button"
                onClick={() => handleAssetSelect(asset)}
                className={cn(
                  'px-3 py-1 rounded-lg text-xs font-semibold transition-colors border',
                  asset.symbol === selectedAsset
                    ? 'bg-primary/15 border-primary/40 text-primary'
                    : 'bg-secondary/50 border-border/50 text-foreground hover:bg-secondary'
                )}
              >
                {asset.symbol}
              </button>
            ))}
          </div>
        )}

        {selectedAssetDetails && (
          <p className="text-sm text-cyan-400">
            {isFr ? 'Catégorie' : 'Category'}: {getCategoryLabel(selectedAssetDetails.type)}
          </p>
        )}
      </div>

      {/* Capital */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label className="text-base font-semibold text-foreground">Capital ({currency})</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger><Info className="w-4 h-4 text-muted-foreground" /></TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">{isFr ? 'Le capital total de votre compte de trading' : 'The total capital of your trading account'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Input
          type="text"
          inputMode="decimal"
          value={capital}
          onChange={(e) => handleNumericInput(e.target.value, onCapitalChange)}
          placeholder="10000"
          className="h-14 text-lg font-medium bg-secondary/50 border-0 rounded-xl"
        />
      </div>

      {/* Risk */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label className="text-base font-semibold text-foreground">{isFr ? 'Risque' : 'Risk'}</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger><Info className="w-4 h-4 text-muted-foreground" /></TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">{isFr ? 'Le pourcentage de votre capital que vous risquez sur ce trade' : 'The percentage of your capital you risk on this trade'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="relative">
            <Input
              type="text" inputMode="decimal" value={riskPercent}
              onChange={(e) => handleNumericInput(e.target.value, onRiskPercentChange)}
              placeholder="2"
              className="h-14 text-lg font-medium bg-secondary/50 border-0 rounded-xl pr-12"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-lg font-medium">%</span>
          </div>
          <div className="relative">
            <Input
              type="text" inputMode="decimal" value={riskAmount}
              onChange={(e) => handleNumericInput(e.target.value, onRiskAmountChange)}
              placeholder="200.00"
              className="h-14 text-lg font-medium bg-secondary/50 border-0 rounded-xl pr-12"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-lg font-medium">{currency}</span>
          </div>
        </div>
      </div>
      
      <Separator className="my-4" />

      {/* === PRICE MODE FIELDS === */}
      {mode === 'price' && (
        <>
          <div className="space-y-2">
            <Label className="text-base font-semibold text-foreground">
              {isFr ? "Prix d'Entrée" : "Entry Price"}
            </Label>
            <Input
              type="text" inputMode="decimal" value={entryPrice}
              onChange={(e) => handleNumericInput(e.target.value, onEntryPriceChange)}
              placeholder="1.08500"
              className="h-14 text-lg font-medium bg-secondary/50 border-0 rounded-xl"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label className="text-base font-semibold text-foreground">Stop Loss</Label>
                <span className="text-xs text-destructive font-medium">({isFr ? 'obligatoire' : 'required'})</span>
              </div>
              <Input
                type="text" inputMode="decimal" value={stopLoss}
                onChange={(e) => handleNumericInput(e.target.value, onStopLossChange)}
                placeholder="1.08200"
                className="h-14 text-lg font-medium bg-secondary/50 border-0 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label className="text-base font-semibold text-foreground">Take Profit</Label>
                <span className="text-xs text-muted-foreground">({isFr ? 'optionnel' : 'optional'})</span>
              </div>
              <Input
                type="text" inputMode="decimal" value={takeProfit}
                onChange={(e) => handleNumericInput(e.target.value, onTakeProfitChange)}
                placeholder="1.09000"
                className="h-14 text-lg font-medium bg-secondary/50 border-0 rounded-xl"
              />
            </div>
          </div>
        </>
      )}

      {/* === PIPS MODE FIELDS === */}
      {mode === 'pips' && (
        <>
          {/* Direction selector - smaller */}
          <div className="space-y-2">
            <Label className="text-base font-semibold text-foreground">Direction</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => onPipsDirectionChange('BUY')}
                className={cn(
                  'h-11 rounded-xl font-semibold text-base transition-all',
                  pipsDirection === 'BUY'
                    ? 'bg-emerald-500/20 border-2 border-emerald-500 text-emerald-500'
                    : 'bg-secondary/50 border-2 border-transparent text-muted-foreground hover:text-foreground'
                )}
              >
                BUY
              </button>
              <button
                type="button"
                onClick={() => onPipsDirectionChange('SELL')}
                className={cn(
                  'h-11 rounded-xl font-semibold text-base transition-all',
                  pipsDirection === 'SELL'
                    ? 'bg-red-500/20 border-2 border-red-500 text-red-500'
                    : 'bg-secondary/50 border-2 border-transparent text-muted-foreground hover:text-foreground'
                )}
              >
                SELL
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label className="text-base font-semibold text-foreground">SL (pips)</Label>
                <span className="text-xs text-destructive font-medium">({isFr ? 'obligatoire' : 'required'})</span>
              </div>
              <Input
                type="text" inputMode="decimal" value={slPips}
                onChange={(e) => handleNumericInput(e.target.value, onSlPipsChange)}
                placeholder="30"
                className="h-14 text-lg font-medium bg-secondary/50 border-0 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label className="text-base font-semibold text-foreground">TP (pips)</Label>
                <span className="text-xs text-muted-foreground">({isFr ? 'optionnel' : 'optional'})</span>
              </div>
              <Input
                type="text" inputMode="decimal" value={tpPips}
                onChange={(e) => handleNumericInput(e.target.value, onTpPipsChange)}
                placeholder="60"
                className="h-14 text-lg font-medium bg-secondary/50 border-0 rounded-xl"
              />
            </div>
          </div>
        </>
      )}
      
      {/* Calculate Button */}
      <Button
        onClick={onCalculate}
        className="w-full h-14 text-lg font-semibold mt-6 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
        size="lg"
      >
        <Calculator className="w-5 h-5 mr-2" />
        {isFr ? 'Calculer' : 'Calculate'}
      </Button>
    </div>
  );
};

export default CalculatorForm;
