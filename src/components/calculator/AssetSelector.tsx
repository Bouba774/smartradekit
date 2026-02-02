import React, { useState, useMemo } from 'react';
import { Search, ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getAssetsByCategory, getAssetConfig, AssetConfig } from '@/lib/calculator';

interface AssetSelectorProps {
  value: string;
  onChange: (symbol: string, config: AssetConfig | null) => void;
  language: string;
}

const AssetSelector: React.FC<AssetSelectorProps> = ({ value, onChange, language }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  
  const isFr = language === 'fr';
  const categories = getAssetsByCategory();
  
  const categoryLabels: Record<string, { en: string; fr: string }> = {
    'Forex Majors': { en: 'Forex Majors', fr: 'Forex Majeurs' },
    'Forex JPY': { en: 'Forex JPY Pairs', fr: 'Forex Paires JPY' },
    'Forex Crosses': { en: 'Forex Crosses', fr: 'Forex Croisées' },
    'Metals': { en: 'Metals', fr: 'Métaux' },
    'Indices': { en: 'Indices', fr: 'Indices' },
    'Crypto': { en: 'Crypto', fr: 'Crypto' },
    'Energies': { en: 'Energies', fr: 'Énergies' },
  };
  
  const filteredCategories = useMemo(() => {
    if (!search) return categories;
    
    const searchLower = search.toLowerCase().replace(/[^a-z0-9]/g, '');
    const filtered: Record<string, string[]> = {};
    
    for (const [category, symbols] of Object.entries(categories)) {
      const matchingSymbols = symbols.filter(symbol => 
        symbol.toLowerCase().replace(/[^a-z0-9]/g, '').includes(searchLower)
      );
      if (matchingSymbols.length > 0) {
        filtered[category] = matchingSymbols;
      }
    }
    
    return filtered;
  }, [search, categories]);
  
  const handleSelect = (symbol: string) => {
    const config = getAssetConfig(symbol);
    onChange(symbol, config);
    setOpen(false);
    setSearch('');
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-secondary/50 border-0 h-11"
        >
          <span className={cn(!value && 'text-muted-foreground')}>
            {value || (isFr ? 'Sélectionner un actif...' : 'Select an asset...')}
          </span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <div className="p-2 border-b">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={isFr ? 'Rechercher...' : 'Search...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-9"
            />
          </div>
        </div>
        <ScrollArea className="h-[300px]">
          {Object.entries(filteredCategories).map(([category, symbols]) => (
            <div key={category}>
              <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground bg-muted/50 sticky top-0">
                {categoryLabels[category]?.[isFr ? 'fr' : 'en'] || category}
              </div>
              {symbols.map((symbol) => (
                <button
                  key={symbol}
                  onClick={() => handleSelect(symbol)}
                  className={cn(
                    'w-full px-3 py-2 text-sm text-left hover:bg-accent flex items-center justify-between',
                    value === symbol && 'bg-accent'
                  )}
                >
                  <span>{symbol}</span>
                  {value === symbol && <Check className="h-4 w-4 text-primary" />}
                </button>
              ))}
            </div>
          ))}
          {Object.keys(filteredCategories).length === 0 && (
            <div className="p-4 text-center text-sm text-muted-foreground">
              {isFr ? 'Aucun actif trouvé' : 'No assets found'}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default AssetSelector;
