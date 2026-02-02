import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSettings } from '@/hooks/useSettings';
import { useExchangeRates } from '@/hooks/useExchangeRates';
import { useCurrency } from '@/hooks/useCurrency';
import { Calculator as CalcIcon, Send, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

import AssetSelector from '@/components/calculator/AssetSelector';
import PriceInput from '@/components/calculator/PriceInput';
import CalculationResults from '@/components/calculator/CalculationResults';
import TradingVisualization from '@/components/calculator/TradingVisualization';
import {
  AssetConfig,
  getAssetConfig,
  createCustomAssetConfig,
  calculatePosition,
  isCalculationError,
  CalculationResult,
} from '@/lib/calculator';

// Key for passing trade data to AddTrade page
const PENDING_TRADE_KEY = 'smart-trade-tracker-pending-trade';

const Calculator: React.FC = () => {
  const { language } = useLanguage();
  const { settings, isLoaded: settingsLoaded } = useSettings();
  const { rates, isLoading: ratesLoading, isStale, refetch: refetchRates } = useExchangeRates();
  const { getCurrencySymbol } = useCurrency();
  const navigate = useNavigate();
  
  const isFr = language === 'fr';
  
  // Form state
  const [selectedAsset, setSelectedAsset] = useState<string>('');
  const [assetConfig, setAssetConfig] = useState<AssetConfig | null>(null);
  const [entryPrice, setEntryPrice] = useState<string>('');
  const [stopLoss, setStopLoss] = useState<string>('');
  const [takeProfit, setTakeProfit] = useState<string>('');
  const [riskPercent, setRiskPercent] = useState<number>(1);
  
  // Calculation result
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Initialize risk percent from settings
  useEffect(() => {
    if (settingsLoaded && settings.defaultRiskPercent) {
      setRiskPercent(settings.defaultRiskPercent);
    }
  }, [settingsLoaded, settings.defaultRiskPercent]);
  
  // Get account parameters
  const accountCurrency = settings.capitalCurrency || settings.currency || 'USD';
  const capital = settings.defaultCapital || 0;
  const currencySymbol = getCurrencySymbol();
  
  // Calculate risk amount
  const riskAmount = useMemo(() => {
    return capital * (riskPercent / 100);
  }, [capital, riskPercent]);
  
  // Handle asset selection
  const handleAssetChange = useCallback((symbol: string, config: AssetConfig | null) => {
    setSelectedAsset(symbol);
    setAssetConfig(config);
    // Reset result when asset changes
    setResult(null);
    setError(null);
  }, []);
  
  // Perform calculation
  const performCalculation = useCallback(() => {
    setError(null);
    setResult(null);
    
    // Validation
    if (!selectedAsset) {
      setError(isFr ? 'Veuillez sélectionner un actif' : 'Please select an asset');
      return;
    }
    
    if (capital <= 0) {
      setError(isFr ? 'Veuillez définir votre capital dans les paramètres' : 'Please set your capital in settings');
      return;
    }
    
    const entry = parseFloat(entryPrice);
    const sl = parseFloat(stopLoss);
    const tp = takeProfit ? parseFloat(takeProfit) : undefined;
    
    if (isNaN(entry) || entry <= 0) {
      setError(isFr ? 'Prix d\'entrée invalide' : 'Invalid entry price');
      return;
    }
    
    if (isNaN(sl) || sl <= 0) {
      setError(isFr ? 'Stop Loss invalide' : 'Invalid Stop Loss');
      return;
    }
    
    if (entry === sl) {
      setError(isFr ? 'Entry et SL ne peuvent pas être identiques' : 'Entry and SL cannot be the same');
      return;
    }
    
    // Get or create asset config
    let config = assetConfig;
    if (!config) {
      config = createCustomAssetConfig(selectedAsset, 'forex', 'USD');
    }
    
    // Calculate
    const calcResult = calculatePosition({
      capital,
      riskPercent,
      accountCurrency,
      asset: config,
      entryPrice: entry,
      stopLoss: sl,
      takeProfit: tp,
      exchangeRates: rates,
    });
    
    if (isCalculationError(calcResult)) {
      setError(calcResult.error);
      return;
    }
    
    setResult(calcResult);
  }, [selectedAsset, assetConfig, capital, riskPercent, accountCurrency, entryPrice, stopLoss, takeProfit, rates, isFr]);
  
  // Send to trade form
  const sendToTrade = useCallback(() => {
    if (!result || !selectedAsset) return;
    
    const entry = parseFloat(entryPrice);
    const sl = parseFloat(stopLoss);
    const tp = takeProfit ? parseFloat(takeProfit) : undefined;
    
    const pendingTrade = {
      asset: selectedAsset,
      direction: result.direction.toLowerCase(),
      entry_price: entry,
      stop_loss: sl,
      take_profit: tp,
      lot_size: result.lotSize,
      risk_amount: result.actualRisk,
      risk_percent: riskPercent,
    };
    
    // Store in sessionStorage
    sessionStorage.setItem(PENDING_TRADE_KEY, JSON.stringify(pendingTrade));
    
    // Navigate to AddTrade
    toast.success(isFr ? 'Données envoyées au formulaire' : 'Data sent to form');
    navigate('/add-trade');
  }, [result, selectedAsset, entryPrice, stopLoss, takeProfit, riskPercent, navigate, isFr]);
  
  // Auto-calculate when inputs change
  useEffect(() => {
    if (selectedAsset && entryPrice && stopLoss && capital > 0) {
      // Debounce calculation
      const timer = setTimeout(performCalculation, 300);
      return () => clearTimeout(timer);
    }
  }, [selectedAsset, entryPrice, stopLoss, takeProfit, riskPercent, capital, performCalculation]);
  
  // Determine direction for visualization
  const direction = useMemo(() => {
    const entry = parseFloat(entryPrice);
    const sl = parseFloat(stopLoss);
    if (isNaN(entry) || isNaN(sl)) return 'BUY';
    return entry > sl ? 'BUY' : 'SELL';
  }, [entryPrice, stopLoss]);

  // Loading state
  if (!settingsLoaded) {
    return (
      <div className="py-4 max-w-5xl mx-auto space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="py-4 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
            {isFr ? 'Calculatrice' : 'Calculator'}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isFr 
              ? 'Calcul précis de la taille de position' 
              : 'Precise position size calculation'}
          </p>
        </div>
        <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center shadow-neon">
          <CalcIcon className="w-6 h-6 text-primary-foreground" />
        </div>
      </div>
      
      {/* Capital warning */}
      {capital <= 0 && (
        <div className="glass-card p-4 mb-6 border-yellow-500/30 bg-yellow-500/5">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
            <div>
              <p className="font-medium text-yellow-500">
                {isFr ? 'Capital non défini' : 'Capital not set'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {isFr 
                  ? 'Définissez votre capital dans les paramètres pour utiliser la calculatrice.'
                  : 'Set your capital in settings to use the calculator.'}
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={() => navigate('/settings')}
              >
                {isFr ? 'Paramètres' : 'Settings'}
              </Button>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Left column - Inputs */}
        <div className="space-y-4">
          {/* Asset Selection */}
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                {isFr ? 'Actif' : 'Asset'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AssetSelector
                value={selectedAsset}
                onChange={handleAssetChange}
                language={language}
              />
              {assetConfig && (
                <div className="mt-2 text-xs text-muted-foreground flex gap-4">
                  <span>1 pip = {assetConfig.pipSize}</span>
                  <span>1 lot = {assetConfig.contractSize.toLocaleString()} {assetConfig.type === 'forex' ? 'units' : ''}</span>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Risk Management */}
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                {isFr ? 'Gestion du risque' : 'Risk Management'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Capital display */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                <span className="text-sm text-muted-foreground">
                  {isFr ? 'Capital' : 'Capital'}
                </span>
                <span className="font-mono font-medium">
                  {capital.toLocaleString()} {currencySymbol}
                </span>
              </div>
              
              {/* Risk percentage slider */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">
                    {isFr ? 'Risque' : 'Risk'} ({riskPercent}%)
                  </Label>
                  <span className="text-sm font-medium text-primary">
                    {riskAmount.toFixed(2)} {currencySymbol}
                  </span>
                </div>
                <Slider
                  value={[riskPercent]}
                  onValueChange={([value]) => setRiskPercent(value)}
                  min={0.1}
                  max={10}
                  step={0.1}
                  className="py-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0.1%</span>
                  <span>5%</span>
                  <span>10%</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Price Inputs */}
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                {isFr ? 'Prix' : 'Prices'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <PriceInput
                label={isFr ? "Prix d'entrée" : "Entry Price"}
                value={entryPrice}
                onChange={setEntryPrice}
                variant="entry"
                required
                placeholder={assetConfig ? `0.${'0'.repeat(assetConfig.priceDecimals)}` : '0.00000'}
                tooltip={isFr ? 'Prix auquel vous entrez en position' : 'Price at which you enter the trade'}
              />
              
              <PriceInput
                label="Stop Loss"
                value={stopLoss}
                onChange={setStopLoss}
                variant="sl"
                required
                placeholder={assetConfig ? `0.${'0'.repeat(assetConfig.priceDecimals)}` : '0.00000'}
                tooltip={isFr ? 'Prix de sortie en cas de perte' : 'Exit price in case of loss'}
              />
              
              <PriceInput
                label="Take Profit"
                value={takeProfit}
                onChange={setTakeProfit}
                variant="tp"
                placeholder={assetConfig ? `0.${'0'.repeat(assetConfig.priceDecimals)}` : '0.00000'}
                tooltip={isFr ? 'Prix de sortie en cas de gain (facultatif)' : 'Exit price in case of profit (optional)'}
              />
              
              {/* Direction indicator */}
              {entryPrice && stopLoss && (
                <div className={cn(
                  'flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium',
                  direction === 'BUY' 
                    ? 'bg-emerald-500/10 text-emerald-500' 
                    : 'bg-red-500/10 text-red-500'
                )}>
                  {direction === 'BUY' ? '↑' : '↓'} {isFr ? 'Position' : 'Position'}: {direction}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Right column - Results & Visualization */}
        <div className="space-y-4">
          {/* Visualization */}
          {entryPrice && stopLoss && (
            <Card className="glass-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  {isFr ? 'Visualisation' : 'Visualization'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TradingVisualization
                  entry={parseFloat(entryPrice) || 0}
                  stopLoss={parseFloat(stopLoss) || 0}
                  takeProfit={takeProfit ? parseFloat(takeProfit) : undefined}
                  direction={direction}
                  priceDecimals={assetConfig?.priceDecimals || 5}
                />
              </CardContent>
            </Card>
          )}
          
          {/* Error display */}
          {error && (
            <div className="glass-card p-4 border-red-500/30 bg-red-500/5">
              <div className="flex items-center gap-2 text-red-500">
                <AlertCircle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            </div>
          )}
          
          {/* Results */}
          {result && (
            <Card className="glass-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  {isFr ? 'Résultats' : 'Results'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CalculationResults
                  result={result}
                  currencySymbol={currencySymbol}
                  assetType={assetConfig?.type || 'forex'}
                  language={language}
                />
                
                {/* Send to trade button */}
                <Button
                  onClick={sendToTrade}
                  className="w-full mt-4"
                  size="lg"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {isFr ? 'Envoyer vers un nouveau trade' : 'Send to new trade'}
                </Button>
              </CardContent>
            </Card>
          )}
          
          {/* Empty state when no calculation */}
          {!result && !error && selectedAsset && (
            <Card className="glass-card">
              <CardContent className="py-12 text-center">
                <CalcIcon className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">
                  {isFr 
                    ? 'Remplissez les champs pour voir le résultat'
                    : 'Fill in the fields to see the result'}
                </p>
              </CardContent>
            </Card>
          )}
          
          {/* Rates status */}
          {isStale && (
            <div className="flex items-center justify-between p-2 rounded bg-yellow-500/10 text-yellow-600 text-xs">
              <span>{isFr ? 'Taux de change obsolètes' : 'Exchange rates outdated'}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={refetchRates}
                disabled={ratesLoading}
              >
                <RefreshCw className={cn('w-3 h-3 mr-1', ratesLoading && 'animate-spin')} />
                {isFr ? 'Actualiser' : 'Refresh'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Calculator;
