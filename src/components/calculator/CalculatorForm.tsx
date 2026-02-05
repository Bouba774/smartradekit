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

interface CalculatorFormProps {
  // Asset
  selectedAsset: string;
  assetConfig: AssetConfig | null;
  onAssetChange: (symbol: string, config: AssetConfig | null) => void;
  // Risk
  riskPercent: string;
  onRiskPercentChange: (value: string) => void;
  // Prices
  entryPrice: string;
  onEntryPriceChange: (value: string) => void;
  stopLoss: string;
  onStopLossChange: (value: string) => void;
  takeProfit: string;
  onTakeProfitChange: (value: string) => void;
  // UI
  language: string;
  onCalculate: () => void;
}

const CalculatorForm: React.FC<CalculatorFormProps> = ({
  selectedAsset,
  assetConfig,
  onAssetChange,
  riskPercent,
  onRiskPercentChange,
  entryPrice,
  onEntryPriceChange,
  stopLoss,
  onStopLossChange,
  takeProfit,
  onTakeProfitChange,
  language,
  onCalculate,
}) => {
  const isFr = language === 'fr';
  
  // Asset selector state
  const [isAssetOpen, setIsAssetOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const assetRef = useRef<HTMLDivElement>(null);
  
  // Get selected asset details
  const selectedAssetDetails = useMemo(() => {
    return ALL_ASSETS.find(a => a.symbol === selectedAsset);
  }, [selectedAsset]);
  
  // Get categories
  const categories = useMemo(() => getAssetCategories(), []);
  
  // Get filtered assets
  const filteredAssets = useMemo(() => {
    if (searchQuery.trim()) {
      return searchAssets(searchQuery, 50);
    }
    if (selectedCategory) {
      return getAssetsByCategory(selectedCategory);
    }
    return [];
  }, [searchQuery, selectedCategory]);
  
  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (assetRef.current && !assetRef.current.contains(e.target as Node)) {
        setIsAssetOpen(false);
      }
    };
    
    if (isAssetOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isAssetOpen]);
  
  const handleAssetSelect = (asset: AssetConfig) => {
    onAssetChange(asset.symbol, asset);
    setIsAssetOpen(false);
    setSearchQuery('');
    setSelectedCategory(null);
  };

  const handleNumericInput = (
    value: string,
    onChange: (value: string) => void
  ) => {
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
      {/* Actif */}
      <div className="space-y-2" ref={assetRef}>
        <div className="flex items-center gap-2">
          <Label className="text-base font-semibold text-foreground">
            {isFr ? 'Actif' : 'Asset'}
          </Label>
        </div>
        
        {/* Asset Selector Button */}
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
            <ChevronDown className={cn('w-5 h-5 text-muted-foreground transition-transform', isAssetOpen && 'rotate-180')} />
          </button>
          
          {/* Dropdown */}
          {isAssetOpen && (
            <div className="absolute z-50 w-full mt-2 rounded-xl border bg-popover shadow-xl overflow-hidden">
              {/* Search */}
              <div className="p-3 border-b">
                <Input
                  type="text"
                  placeholder={isFr ? 'Rechercher un actif...' : 'Search asset...'}
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSelectedCategory(null);
                  }}
                  className="h-10"
                  autoFocus
                />
              </div>
              
              {/* Categories */}
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
              
              {/* Results */}
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
                        <Star className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{asset.symbol}</span>
                        <span className="text-muted-foreground text-sm truncate">
                          {asset.name}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center text-muted-foreground text-sm">
                    {searchQuery || selectedCategory
                      ? (isFr ? 'Aucun résultat' : 'No results')
                      : (isFr ? 'Sélectionnez une catégorie ou recherchez' : 'Select a category or search')
                    }
                  </div>
                )}
              </ScrollArea>
            </div>
          )}
        </div>
        
        {/* Category label */}
        {selectedAssetDetails && (
          <p className="text-sm text-cyan-400">
            {isFr ? 'Catégorie' : 'Category'}: {getCategoryLabel(selectedAssetDetails.type)}
          </p>
        )}
      </div>

      {/* Risque % uniquement */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label className="text-base font-semibold text-foreground">
            {isFr ? 'Risque (%)' : 'Risk (%)'}
          </Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="w-4 h-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">
                  {isFr 
                    ? 'Le pourcentage de votre capital que vous risquez sur ce trade'
                    : 'The percentage of your capital you risk on this trade'}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="relative">
          <Input
            type="text"
            inputMode="decimal"
            value={riskPercent}
            onChange={(e) => handleNumericInput(e.target.value, onRiskPercentChange)}
            placeholder="2"
            className="h-14 text-lg font-medium bg-secondary/50 border-0 rounded-xl pr-12"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-lg font-medium">
            %
          </span>
        </div>
      </div>
      
      <Separator className="my-4" />

      {/* Prix d'Entrée */}
      <div className="space-y-2">
        <Label className="text-base font-semibold text-foreground">
          {isFr ? "Prix d'Entrée" : "Entry Price"}
        </Label>
        <Input
          type="text"
          inputMode="decimal"
          value={entryPrice}
          onChange={(e) => handleNumericInput(e.target.value, onEntryPriceChange)}
          placeholder="1.08500"
          className="h-14 text-lg font-medium bg-secondary/50 border-0 rounded-xl"
        />
      </div>

      {/* Stop Loss & Take Profit */}
      <div className="grid grid-cols-2 gap-3">
        {/* Stop Loss */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label className="text-base font-semibold text-foreground">
              Stop Loss
            </Label>
            <span className="text-xs text-destructive font-medium">
              ({isFr ? 'obligatoire' : 'required'})
            </span>
          </div>
          <Input
            type="text"
            inputMode="decimal"
            value={stopLoss}
            onChange={(e) => handleNumericInput(e.target.value, onStopLossChange)}
            placeholder="1.08200"
            className="h-14 text-lg font-medium bg-secondary/50 border-0 rounded-xl"
          />
        </div>
        {/* Take Profit */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label className="text-base font-semibold text-foreground">
              Take Profit
            </Label>
            <span className="text-xs text-muted-foreground">
              ({isFr ? 'optionnel' : 'optional'})
            </span>
          </div>
          <Input
            type="text"
            inputMode="decimal"
            value={takeProfit}
            onChange={(e) => handleNumericInput(e.target.value, onTakeProfitChange)}
            placeholder="1.09000"
            className="h-14 text-lg font-medium bg-secondary/50 border-0 rounded-xl"
          />
        </div>
      </div>
      
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
