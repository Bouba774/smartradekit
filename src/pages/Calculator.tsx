import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCurrency } from '@/hooks/useCurrency';
import { useFavoriteAssets } from '@/hooks/useFavoriteAssets';
import { useSettings } from '@/hooks/useSettings';
import { useExchangeRates } from '@/hooks/useExchangeRates';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Calculator as CalcIcon, Send, Search, Star, Save, RefreshCw, Info } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import EntryModeInputs from '@/components/calculator/EntryModeInputs';
import AccountCurrencySelector from '@/components/calculator/AccountCurrencySelector';
import CalculationResults from '@/components/calculator/CalculationResults';
import HelpTooltip from '@/components/ui/HelpTooltip';
import { calculatorTooltips } from '@/data/helpTooltips';

import { 
  ASSET_CONFIGS, 
  getAssetConfig, 
  isAssetSupported,
  getAllSupportedSymbols,
  AssetConfig
} from '@/lib/calculator/assetConfigs';
import { 
  calculateLotSize, 
  CalculationInput, 
  CalculationResult,
  SUPPORTED_ACCOUNT_CURRENCIES 
} from '@/lib/calculator/calculationEngine';
import { ASSET_CATEGORIES } from '@/data/assets';

export const PENDING_TRADE_KEY = 'pending_trade_data';

const Calculator: React.FC = () => {
  const { t, language } = useLanguage();
  const { formatAmount, getCurrencySymbol, currency } = useCurrency();
  const { favorites, toggleFavorite, isFavorite } = useFavoriteAssets();
  const { settings, updateSetting, isLoaded: settingsLoaded } = useSettings();
  const { rates, isLoading: ratesLoading, lastUpdated, refetch: refetchRates } = useExchangeRates();
  const navigate = useNavigate();
  const [assetSearch, setAssetSearch] = useState('');

  const [formData, setFormData] = useState({
    capital: '',
    riskPercent: '',
    riskCash: '',
    entryPrice: '',
    stopLoss: '',
    takeProfit: '',
    asset: 'EUR/USD',
    accountCurrency: 'USD',
  });

  const [lastModifiedRiskField, setLastModifiedRiskField] = useState<'percent' | 'cash' | null>(null);
  const [calculationResult, setCalculationResult] = useState<CalculationResult | null>(null);
  const [currentAssetConfig, setCurrentAssetConfig] = useState<AssetConfig | null>(null);
  const [inputErrors, setInputErrors] = useState<Record<string, string>>({});

  // Charger la config de l'actif sélectionné
  useEffect(() => {
    if (formData.asset && isAssetSupported(formData.asset)) {
      try {
        const config = getAssetConfig(formData.asset);
        setCurrentAssetConfig(config);
      } catch {
        setCurrentAssetConfig(null);
      }
    } else {
      setCurrentAssetConfig(null);
    }
  }, [formData.asset]);

  // Charger les paramètres par défaut
  useEffect(() => {
    if (settingsLoaded) {
      setFormData(prev => {
        const newData = { ...prev };
        
        // Capital par défaut
        if (settings.defaultCapital !== null && prev.capital === '') {
          newData.capital = settings.defaultCapital.toString();
        }
        
        // Risque par défaut
        if (settings.defaultRiskPercent !== null && prev.riskPercent === '') {
          newData.riskPercent = settings.defaultRiskPercent.toString();
          const capital = settings.defaultCapital ?? parseFloat(prev.capital);
          if (capital && settings.defaultRiskPercent) {
            newData.riskCash = ((capital * settings.defaultRiskPercent) / 100).toFixed(2);
          }
        }
        
        // Devise du compte basée sur les settings
        if (settings.currency) {
          const supportedCodes = SUPPORTED_ACCOUNT_CURRENCIES.map(c => c.code);
          if (supportedCodes.includes(settings.currency)) {
            newData.accountCurrency = settings.currency;
          }
        }
        
        return newData;
      });
      if (settings.defaultRiskPercent !== null) {
        setLastModifiedRiskField('percent');
      }
    }
  }, [settingsLoaded, settings.defaultCapital, settings.defaultRiskPercent, settings.currency]);

  // Filtrer les actifs supportés
  const { filteredAssets, filteredFavorites } = useMemo(() => {
    const searchLower = assetSearch.toLowerCase();
    const result: { [key: string]: string[] } = {};
    const favs: string[] = [];
    
    for (const [category, assets] of Object.entries(ASSET_CATEGORIES)) {
      const filtered = assets.filter(asset => {
        // Ne montrer que les actifs avec configuration
        if (!isAssetSupported(asset)) return false;
        
        const matches = !assetSearch || asset.toLowerCase().includes(searchLower);
        if (matches && favorites.includes(asset)) {
          favs.push(asset);
        }
        return matches;
      });
      if (filtered.length > 0) {
        result[category] = filtered;
      }
    }
    return { filteredAssets: result, filteredFavorites: favs };
  }, [assetSearch, favorites]);

  // Handlers pour les champs
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setInputErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleRiskPercentChange = (value: string) => {
    setFormData(prev => {
      const newData = { ...prev, riskPercent: value };
      const capital = parseFloat(prev.capital);
      const percent = parseFloat(value);
      
      if (!isNaN(capital) && !isNaN(percent) && capital > 0) {
        newData.riskCash = ((capital * percent) / 100).toFixed(2);
      } else {
        newData.riskCash = '';
      }
      return newData;
    });
    setLastModifiedRiskField('percent');
  };

  const handleRiskCashChange = (value: string) => {
    setFormData(prev => {
      const newData = { ...prev, riskCash: value };
      const capital = parseFloat(prev.capital);
      const cash = parseFloat(value);
      
      if (!isNaN(capital) && !isNaN(cash) && capital > 0) {
        newData.riskPercent = ((cash / capital) * 100).toFixed(2);
      } else {
        newData.riskPercent = '';
      }
      return newData;
    });
    setLastModifiedRiskField('cash');
  };

  const handleCapitalChange = (value: string) => {
    setFormData(prev => {
      const newData = { ...prev, capital: value };
      const capital = parseFloat(value);
      
      if (lastModifiedRiskField === 'percent' && prev.riskPercent) {
        const percent = parseFloat(prev.riskPercent);
        if (!isNaN(capital) && !isNaN(percent) && capital > 0) {
          newData.riskCash = ((capital * percent) / 100).toFixed(2);
        }
      } else if (lastModifiedRiskField === 'cash' && prev.riskCash) {
        const cash = parseFloat(prev.riskCash);
        if (!isNaN(capital) && !isNaN(cash) && capital > 0) {
          newData.riskPercent = ((cash / capital) * 100).toFixed(2);
        }
      }
      return newData;
    });
  };

  // Construire les taux de change pour le moteur de calcul
  const buildExchangeRates = useCallback((): Record<string, number> => {
    const exchangeRates: Record<string, number> = { USD: 1 };
    
    if (rates) {
      // Les rates du hook sont en format: devise -> valeur en USD
      Object.entries(rates).forEach(([currency, rate]) => {
        if (typeof rate === 'number') {
          exchangeRates[currency] = rate;
        }
      });
    }
    
    return exchangeRates;
  }, [rates]);

  // Calculer le lot
  const calculateLot = useCallback(() => {
    const capital = parseFloat(formData.capital);
    const riskPercent = parseFloat(formData.riskPercent);
    const entryPrice = parseFloat(formData.entryPrice);
    const stopLoss = parseFloat(formData.stopLoss);
    const takeProfit = formData.takeProfit ? parseFloat(formData.takeProfit) : undefined;

    // Validation basique
    const errors: Record<string, string> = {};
    
    if (!capital || capital <= 0) {
      errors.capital = language === 'fr' ? 'Capital requis' : 'Capital required';
    }
    if (!riskPercent || riskPercent <= 0) {
      errors.riskPercent = language === 'fr' ? 'Risque requis' : 'Risk required';
    }
    if (!entryPrice || entryPrice <= 0) {
      errors.entryPrice = language === 'fr' ? 'Prix requis' : 'Price required';
    }
    if (!stopLoss || stopLoss <= 0) {
      errors.stopLoss = language === 'fr' ? 'Stop Loss requis' : 'Stop Loss required';
    }
    
    if (Object.keys(errors).length > 0) {
      setInputErrors(errors);
      toast.error(language === 'fr' ? 'Veuillez remplir tous les champs obligatoires' : 'Please fill all required fields');
      return;
    }

    // Vérifier que les taux sont disponibles
    if (!rates || Object.keys(rates).length === 0) {
      toast.error(language === 'fr' 
        ? 'Taux de change non disponibles. Actualisez ou réessayez.' 
        : 'Exchange rates not available. Refresh or try again.');
      return;
    }

    // Construire l'input pour le moteur de calcul
    const input: CalculationInput = {
      symbol: formData.asset,
      capital,
      riskPercent,
      entryPrice,
      stopLoss,
      takeProfit,
      accountCurrency: formData.accountCurrency,
      exchangeRates: buildExchangeRates(),
    };

    // Exécuter le calcul
    const result = calculateLotSize(input);
    setCalculationResult(result);

    if (result.isValid) {
      toast.success(language === 'fr' ? 'Calcul effectué!' : 'Calculation done!');
    } else if (result.errors.length > 0) {
      // Mapper les erreurs aux champs
      const newErrors: Record<string, string> = {};
      result.errors.forEach(err => {
        newErrors[err.field] = err.message;
      });
      setInputErrors(newErrors);
    }
  }, [formData, rates, buildExchangeRates, language]);

  // Envoyer vers Add Trade
  const sendToTrade = () => {
    if (!calculationResult?.isValid || !calculationResult.lotSize) return;
    
    const pendingTradeData = {
      asset: formData.asset,
      entryPrice: formData.entryPrice,
      stopLoss: formData.stopLoss,
      takeProfit: formData.takeProfit,
      lotSize: calculationResult.lotSize.toString(),
      direction: calculationResult.direction,
      risk: formData.riskPercent,
      riskCash: formData.riskCash,
      capital: formData.capital,
    };
    localStorage.setItem(PENDING_TRADE_KEY, JSON.stringify(pendingTradeData));
    toast.success(t('dataSentToTrade'));
    navigate('/add-trade');
  };

  // Formater le montant pour l'affichage
  const formatDisplayAmount = (amount: number) => {
    const currencySymbols: Record<string, string> = {
      USD: '$', EUR: '€', GBP: '£', CHF: 'CHF', JPY: '¥',
      CAD: 'C$', AUD: 'A$', NZD: 'NZ$', XAF: 'FCFA', XOF: 'FCFA', CNY: '¥'
    };
    const symbol = currencySymbols[formData.accountCurrency] || formData.accountCurrency;
    return `${symbol}${amount.toFixed(2)}`;
  };

  return (
    <div className="py-4 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
            {t('calculator')}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {language === 'fr' 
              ? 'Calcul précis de la taille de position' 
              : 'Precise position size calculation'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const capital = parseFloat(formData.capital);
              const risk = parseFloat(formData.riskPercent);
              if (!capital && !risk) {
                toast.error(language === 'fr' ? 'Entrez un capital ou un risque à sauvegarder' : 'Enter a capital or risk to save');
                return;
              }
              updateSetting('defaultCapital', capital || null);
              updateSetting('defaultRiskPercent', risk || null);
              toast.success(language === 'fr' ? 'Paramètres par défaut sauvegardés' : 'Default settings saved');
            }}
            className="gap-1"
          >
            <Save className="w-4 h-4" />
            <span className="hidden sm:inline">{language === 'fr' ? 'Sauvegarder' : 'Save defaults'}</span>
          </Button>
          <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center shadow-neon">
            <CalcIcon className="w-6 h-6 text-primary-foreground" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section Entrées */}
        <div className="glass-card p-6 space-y-6 animate-fade-in">
          <h3 className="font-display font-semibold text-foreground">{t('parameters')}</h3>

          <div className="space-y-4">
            {/* Devise du compte */}
            <AccountCurrencySelector
              value={formData.accountCurrency}
              onChange={(v) => handleInputChange('accountCurrency', v)}
            />

            {/* Sélecteur d'actif */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Label>{t('asset')}</Label>
                <HelpTooltip tooltip={calculatorTooltips.asset} />
              </div>
              <Select value={formData.asset} onValueChange={(v) => {
                handleInputChange('asset', v);
                setAssetSearch('');
                setCalculationResult(null);
              }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border max-h-80">
                  <div className="p-2 sticky top-0 bg-popover border-b border-border z-10">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder={t('searchPlaceholder')}
                        value={assetSearch}
                        onChange={(e) => setAssetSearch(e.target.value)}
                        className="pl-10 h-8"
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {/* Favoris */}
                    {filteredFavorites.length > 0 && (
                      <div>
                        <div className="px-2 py-1.5 text-xs font-semibold text-yellow-500 bg-yellow-500/10 sticky top-0 flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-500" />
                          {language === 'fr' ? 'Favoris' : 'Favorites'}
                        </div>
                        {filteredFavorites.map(asset => (
                          <SelectItem key={`fav-${asset}`} value={asset} className="pl-2">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); e.preventDefault(); toggleFavorite(asset); }}
                                className="hover:scale-110 transition-transform"
                              >
                                <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                              </button>
                              <span>{asset}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </div>
                    )}
                    {/* Catégories */}
                    {Object.entries(filteredAssets).map(([category, assets]) => (
                      <div key={category}>
                        <div className="px-2 py-1.5 text-xs font-semibold text-primary bg-primary/10 sticky top-0">
                          {category}
                        </div>
                        {assets.map(asset => (
                          <SelectItem key={asset} value={asset} className="pl-2">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); e.preventDefault(); toggleFavorite(asset); }}
                                className="hover:scale-110 transition-transform"
                              >
                                <Star className={cn(
                                  "w-4 h-4",
                                  isFavorite(asset) ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground"
                                )} />
                              </button>
                              <span>{asset}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </div>
                    ))}
                    {Object.keys(filteredAssets).length === 0 && filteredFavorites.length === 0 && (
                      <div className="p-3 text-sm text-muted-foreground text-center">
                        {t('noAssetFound')}
                      </div>
                    )}
                  </div>
                </SelectContent>
              </Select>
              {currentAssetConfig && (
                <p className="text-xs text-muted-foreground">
                  {language === 'fr' ? 'Type' : 'Type'}: {currentAssetConfig.assetType.replace(/_/g, ' ')} • 
                  Quote: {currentAssetConfig.quoteCurrency}
                </p>
              )}
            </div>

            {/* Capital et Risque */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <Label>{t('capital')}</Label>
                  <HelpTooltip tooltip={calculatorTooltips.capital} />
                </div>
                <Input
                  type="text"
                  inputMode="decimal"
                  placeholder="10000"
                  value={formData.capital}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9.,]/g, '').replace(',', '.');
                    handleCapitalChange(value);
                  }}
                  className={cn(inputErrors.capital && "border-loss")}
                />
                {inputErrors.capital && (
                  <p className="text-xs text-loss">{inputErrors.capital}</p>
                )}
              </div>
              <div className="space-y-2 col-span-2">
                <div className="flex items-center gap-1.5">
                  <Label>{t('risk')}</Label>
                  <HelpTooltip tooltip={calculatorTooltips.riskPercent} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="relative">
                    <Input
                      type="text"
                      inputMode="decimal"
                      placeholder="1.0"
                      value={formData.riskPercent}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9.,]/g, '').replace(',', '.');
                        handleRiskPercentChange(value);
                      }}
                      className={cn(
                        "pr-8",
                        parseFloat(formData.riskPercent) > 2 && "border-loss/50",
                        inputErrors.riskPercent && "border-loss"
                      )}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
                  </div>
                  <div className="relative">
                    <Input
                      type="text"
                      inputMode="decimal"
                      placeholder="100.00"
                      value={formData.riskCash}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9.,]/g, '').replace(',', '.');
                        handleRiskCashChange(value);
                      }}
                      className="pr-12"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">
                      {formData.accountCurrency}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Prix d'entrée, SL, TP */}
            <div className="pt-4 border-t border-border">
              <EntryModeInputs
                entryPrice={formData.entryPrice}
                stopLoss={formData.stopLoss}
                takeProfit={formData.takeProfit}
                onEntryPriceChange={(v) => handleInputChange('entryPrice', v)}
                onStopLossChange={(v) => handleInputChange('stopLoss', v)}
                onTakeProfitChange={(v) => handleInputChange('takeProfit', v)}
                assetConfig={currentAssetConfig}
                errors={{
                  entryPrice: inputErrors.entryPrice,
                  stopLoss: inputErrors.stopLoss,
                  takeProfit: inputErrors.takeProfit,
                }}
              />
            </div>
          </div>

          {/* Bouton Calculer */}
          <Button
            onClick={calculateLot}
            disabled={ratesLoading}
            className="w-full gap-2 bg-gradient-primary hover:opacity-90 font-display"
          >
            <CalcIcon className="w-4 h-4" />
            {ratesLoading 
              ? (language === 'fr' ? 'Chargement des taux...' : 'Loading rates...') 
              : t('calculate')}
          </Button>

          {/* Indicateur taux de change */}
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border">
            <div className="flex items-center gap-1">
              <Info className="w-3 h-3" />
              <span>
                {language === 'fr' ? 'Dernière MAJ taux' : 'Rates updated'}: 
                {lastUpdated ? ` ${lastUpdated.toLocaleTimeString()}` : ' -'}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => refetchRates()}
              disabled={ratesLoading}
              className="h-6 px-2"
            >
              <RefreshCw className={cn("w-3 h-3", ratesLoading && "animate-spin")} />
            </Button>
          </div>
        </div>

        {/* Section Résultats */}
        <div className="space-y-6">
          {calculationResult && (
            <>
              <CalculationResults
                result={calculationResult}
                formatAmount={formatDisplayAmount}
              />
              
              {/* Bouton Envoyer vers Trade */}
              {calculationResult.isValid && calculationResult.lotSize && (
                <Button
                  variant="outline"
                  className="w-full gap-2 border-primary/50 hover:bg-primary/10"
                  onClick={sendToTrade}
                >
                  <Send className="w-4 h-4" />
                  {t('sendToTrade')}
                </Button>
              )}
            </>
          )}

          {/* Message initial */}
          {!calculationResult && (
            <div className="glass-card p-8 text-center text-muted-foreground">
              <CalcIcon className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>{language === 'fr' 
                ? 'Remplissez les paramètres et cliquez sur Calculer' 
                : 'Fill in parameters and click Calculate'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Calculator;
