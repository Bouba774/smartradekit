import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSettings } from '@/hooks/useSettings';
import { useExchangeRates } from '@/hooks/useExchangeRates';
import { useCurrency } from '@/hooks/useCurrency';
import { Calculator as CalcIcon, Send, AlertCircle, RefreshCw, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

import CalculatorForm from '@/components/calculator/CalculatorForm';
import CalculationResults from '@/components/calculator/CalculationResults';
import TradingVisualization from '@/components/calculator/TradingVisualization';
import {
  AssetConfig,
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
  const [capitalInput, setCapitalInput] = useState<string>('');
  const [riskPercentInput, setRiskPercentInput] = useState<string>('');
  const [riskAmountInput, setRiskAmountInput] = useState<string>('');
  
  // Calculation result
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Initialize from settings
  useEffect(() => {
    if (settingsLoaded) {
      if (settings.defaultCapital && !capitalInput) {
        setCapitalInput(settings.defaultCapital.toString());
      }
      if (settings.defaultRiskPercent && !riskPercentInput) {
        setRiskPercentInput(settings.defaultRiskPercent.toString());
      }
    }
  }, [settingsLoaded, settings.defaultCapital, settings.defaultRiskPercent]);
  
  // Get account parameters
  const accountCurrency = settings.capitalCurrency || settings.currency || 'USD';
  const currencySymbol = getCurrencySymbol();
  
  // Parse values
  const capital = parseFloat(capitalInput) || 0;
  const riskPercent = parseFloat(riskPercentInput) || 0;
  
  // Sync risk percent <-> risk amount
  const handleRiskPercentChange = useCallback((value: string) => {
    setRiskPercentInput(value);
    const percent = parseFloat(value);
    if (!isNaN(percent) && capital > 0) {
      const amount = capital * (percent / 100);
      setRiskAmountInput(amount.toFixed(2));
    }
  }, [capital]);
  
  const handleRiskAmountChange = useCallback((value: string) => {
    setRiskAmountInput(value);
    const amount = parseFloat(value);
    if (!isNaN(amount) && capital > 0) {
      const percent = (amount / capital) * 100;
      setRiskPercentInput(percent.toFixed(2));
    }
  }, [capital]);
  
  const handleCapitalChange = useCallback((value: string) => {
    setCapitalInput(value);
    const cap = parseFloat(value);
    const percent = parseFloat(riskPercentInput);
    if (!isNaN(cap) && !isNaN(percent) && cap > 0) {
      const amount = cap * (percent / 100);
      setRiskAmountInput(amount.toFixed(2));
    }
  }, [riskPercentInput]);
  
  // Handle asset selection
  const handleAssetChange = useCallback((symbol: string, config: AssetConfig | null) => {
    setSelectedAsset(symbol);
    setAssetConfig(config);
    setResult(null);
    setError(null);
  }, []);
  
  // Perform calculation
  const performCalculation = useCallback(() => {
    setError(null);
    setResult(null);
    
    // Validation
    if (!selectedAsset || !assetConfig) {
      setError(isFr ? 'Veuillez sélectionner un actif' : 'Please select an asset');
      return;
    }
    
    if (capital <= 0) {
      setError(isFr ? 'Veuillez définir votre capital' : 'Please set your capital');
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
    
    // Calculate
    const calcResult = calculatePosition({
      capital,
      riskPercent,
      accountCurrency,
      asset: assetConfig,
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
    
    toast.success(isFr ? 'Données envoyées au formulaire' : 'Data sent to form');
    navigate('/add-trade');
  }, [result, selectedAsset, entryPrice, stopLoss, takeProfit, riskPercent, navigate, isFr]);
  
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
      <div className="py-4 max-w-2xl mx-auto space-y-6 px-4">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="py-4 max-w-2xl mx-auto px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
            {isFr ? 'Calculatrice de Lot' : 'Lot Calculator'}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isFr 
              ? 'Calculatrice de taille de position professionnelle' 
              : 'Professional position size calculator'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="w-12 h-12 rounded-xl">
            <Save className="w-5 h-5" />
          </Button>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shadow-lg">
            <CalcIcon className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>
      
      {/* Main Form Card */}
      <Card className="glass-card mb-6">
        <CardContent className="pt-6">
          <h2 className="text-xl font-bold mb-6">
            {isFr ? 'Paramètres' : 'Parameters'}
          </h2>
          
          <CalculatorForm
            selectedAsset={selectedAsset}
            assetConfig={assetConfig}
            onAssetChange={handleAssetChange}
            capital={capitalInput}
            onCapitalChange={handleCapitalChange}
            riskPercent={riskPercentInput}
            onRiskPercentChange={handleRiskPercentChange}
            riskAmount={riskAmountInput}
            onRiskAmountChange={handleRiskAmountChange}
            entryPrice={entryPrice}
            onEntryPriceChange={setEntryPrice}
            stopLoss={stopLoss}
            onStopLossChange={setStopLoss}
            takeProfit={takeProfit}
            onTakeProfitChange={setTakeProfit}
            currencySymbol={currencySymbol}
            language={language}
            onCalculate={performCalculation}
          />
        </CardContent>
      </Card>
      
      {/* Error display */}
      {error && (
        <div className="glass-card p-4 mb-6 border-red-500/30 bg-red-500/5 rounded-xl">
          <div className="flex items-center gap-2 text-red-500">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        </div>
      )}
      
      {/* Results Section */}
      {result && (
        <Card className="glass-card mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-xl font-bold">
                {isFr ? 'Résultats' : 'Results'}
              </h2>
              <span className={cn(
                'flex items-center gap-1 text-sm font-bold',
                result.direction === 'BUY' ? 'text-emerald-500' : 'text-red-500'
              )}>
                {result.direction === 'BUY' ? '↗' : '↘'} {result.direction}
              </span>
            </div>
            
            <CalculationResults
              result={result}
              currencySymbol={currencySymbol}
              assetType={assetConfig?.type || 'forex'}
              language={language}
            />
            
            {/* Visualization */}
            {entryPrice && stopLoss && (
              <div className="mt-6">
                <TradingVisualization
                  entry={parseFloat(entryPrice) || 0}
                  stopLoss={parseFloat(stopLoss) || 0}
                  takeProfit={takeProfit ? parseFloat(takeProfit) : undefined}
                  direction={direction}
                  priceDecimals={assetConfig?.priceDecimals || 5}
                />
              </div>
            )}
            
            {/* Send to trade button */}
            <Button
              onClick={sendToTrade}
              className="w-full mt-6"
              size="lg"
            >
              <Send className="w-4 h-4 mr-2" />
              {isFr ? 'Envoyer vers un nouveau trade' : 'Send to new trade'}
            </Button>
          </CardContent>
        </Card>
      )}
      
      {/* Rates status */}
      {isStale && (
        <div className="flex items-center justify-between p-3 rounded-xl bg-yellow-500/10 text-yellow-600 text-xs">
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
  );
};

export default Calculator;
