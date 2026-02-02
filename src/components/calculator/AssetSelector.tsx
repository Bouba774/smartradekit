import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, ChevronDown, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { 
  ALL_ASSETS, 
  getAssetCategories, 
  getAssetsByCategory, 
  searchAssets,
  AssetConfig 
} from '@/lib/calculator';

interface AssetSelectorProps {
  value: string;
  onChange: (symbol: string, config: AssetConfig | null) => void;
  language: string;
}

const AssetSelector: React.FC<AssetSelectorProps> = ({ value, onChange, language }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const isFr = language === 'fr';
  
  // Get selected asset
  const selectedAsset = useMemo(() => {
    return ALL_ASSETS.find(a => a.symbol === value);
  }, [value]);
  
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
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);
  
  const handleSelect = (asset: AssetConfig) => {
    onChange(asset.symbol, asset);
    setIsOpen(false);
    setSearchQuery('');
    setSelectedCategory(null);
  };
  
  const handleClear = () => {
    onChange('', null);
    setSearchQuery('');
  };
  
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'forex': return 'bg-blue-500/10 text-blue-500 border-blue-500/30';
      case 'crypto': return 'bg-orange-500/10 text-orange-500 border-orange-500/30';
      case 'index': return 'bg-purple-500/10 text-purple-500 border-purple-500/30';
      case 'commodity': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30';
      case 'stock': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30';
      case 'etf': return 'bg-pink-500/10 text-pink-500 border-pink-500/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };
  
  return (
    <div ref={containerRef} className="relative">
      {/* Trigger Button */}
      <Button
        type="button"
        variant="outline"
        className={cn(
          'w-full justify-between h-11 font-normal',
          !selectedAsset && 'text-muted-foreground'
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="flex items-center gap-2 truncate">
          {selectedAsset ? (
            <>
              <Badge variant="outline" className={cn('text-xs', getTypeColor(selectedAsset.type))}>
                {selectedAsset.type.toUpperCase()}
              </Badge>
              <span className="font-medium">{selectedAsset.symbol}</span>
              <span className="text-muted-foreground text-sm truncate">
                {selectedAsset.name}
              </span>
            </>
          ) : (
            <span>{isFr ? 'Sélectionner un actif...' : 'Select an asset...'}</span>
          )}
        </span>
        <div className="flex items-center gap-1">
          {selectedAsset && (
            <X
              className="w-4 h-4 text-muted-foreground hover:text-foreground"
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
            />
          )}
          <ChevronDown className={cn('w-4 h-4 transition-transform', isOpen && 'rotate-180')} />
        </div>
      </Button>
      
      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 rounded-lg border bg-popover shadow-xl">
          {/* Search */}
          <div className="p-2 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder={isFr ? 'Rechercher un actif...' : 'Search asset...'}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSelectedCategory(null);
                }}
                className="pl-9 h-9"
                autoFocus
              />
            </div>
          </div>
          
          {/* Categories */}
          {!searchQuery && (
            <div className="p-2 border-b">
              <div className="flex flex-wrap gap-1">
                {categories.map(cat => (
                  <Badge
                    key={cat}
                    variant={selectedCategory === cat ? 'default' : 'outline'}
                    className="cursor-pointer text-xs"
                    onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                  >
                    {cat}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {/* Results */}
          <ScrollArea className="max-h-[300px]">
            {filteredAssets.length > 0 ? (
              <div className="p-1">
                {filteredAssets.map(asset => (
                  <button
                    key={asset.symbol}
                    type="button"
                    className={cn(
                      'w-full flex items-center gap-2 px-3 py-2 rounded-md text-left',
                      'hover:bg-accent transition-colors',
                      asset.symbol === value && 'bg-accent'
                    )}
                    onClick={() => handleSelect(asset)}
                  >
                    <Badge variant="outline" className={cn('text-xs shrink-0', getTypeColor(asset.type))}>
                      {asset.type.slice(0, 3).toUpperCase()}
                    </Badge>
                    <span className="font-medium">{asset.symbol}</span>
                    <span className="text-muted-foreground text-sm truncate">
                      {asset.name}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-muted-foreground text-sm">
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
  );
};

export default AssetSelector;
