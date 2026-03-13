import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSettings } from '@/hooks/useSettings';
import { useExchangeRates } from '@/hooks/useExchangeRates';
import { Calculator as CalcIcon, Send, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

import CalculatorForm from '@/components/calculator/CalculatorForm';
import CalculationResults from '@/components/calculator/CalculationResults';
import {
  AssetConfig,
  calculatePosition,
  isCalculationError,
  CalculationResult,
} from '@/lib/calculator';

// Import the PENDING_TRADE_KEY from AddTrade to ensure consistency
import { PENDING_TRADE_KEY } from '@/pages/AddTrade';

const Calculator: React.FC = () => {
  const { language } = useLanguage();
  const { settings, isLoaded: settingsLoaded } = useSettings();
  const { rates } = useExchangeRates();
  const navigate = useNavigate();
  
  const isFr = language === 'fr';
  
  // Form state
  const [selectedAsset, setSelectedAsset] = useState<string>('');
  const [assetConfig, setAssetConfig] = useState<AssetConfig | null>(null);
  const [capitalInput, setCapitalInput] = useState<string>('');
  const [entryPrice, setEntryPrice] = useState<string>('');
  const [stopLoss, setStopLoss] = useState<string>('');
  const [takeProfit, setTakeProfit] = useState<string>('');
  const [riskPercentInput, setRiskPercentInput] = useState<string>('');
  const [riskAmountInput, setRiskAmountInput] = useState<string>('');
  
  // Calculation result
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Get currency from settings
  const accountCurrency = settings.capitalCurrency || settings.currency || 'USD';
  
  // Clear error when inputs change
  useEffect(() => {
    if (error) {
      setError(null);
    }
  }, [selectedAsset, capitalInput, riskPercentInput, entryPrice, stopLoss, takeProfit]);
  
  // Initialize from settings (optional defaults)
  useEffect(() => {
    if (settingsLoaded) {
      if (settings.defaultRiskPercent && !riskPercentInput) {
        setRiskPercentInput(settings.defaultRiskPercent.toString());
      }
      if (settings.defaultCapital && !capitalInput) {
        setCapitalInput(settings.defaultCapital.toString());
        // Sync risk amount if percent is set
        if (settings.defaultRiskPercent) {
          const amount = settings.defaultCapital * (settings.defaultRiskPercent / 100);
          setRiskAmountInput(amount.toFixed(2));
        }
      }
    }
  }, [settingsLoaded, settings.defaultRiskPercent, settings.defaultCapital]);
  
  // Parse capital from input
  const capital = parseFloat(capitalInput) || 0;
  const riskPercent = parseFloat(riskPercentInput) || 0;
  
  // Sync risk % → amount
  const handleRiskPercentChange = useCallback((value: string) => {
    setRiskPercentInput(value);
    const percent = parseFloat(value);
    if (!isNaN(percent) && capital > 0) {
      setRiskAmountInput((capital * (percent / 100)).toFixed(2));
    } else if (value === '') {
      setRiskAmountInput('');
    }
  }, [capital]);
  
  // Sync amount → risk %
  const handleRiskAmountChange = useCallback((value: string) => {
    setRiskAmountInput(value);
    const amount = parseFloat(value);
    if (!isNaN(amount) && capital > 0) {
      setRiskPercentInput(((amount / capital) * 100).toFixed(2));
    } else if (value === '') {
      setRiskPercentInput('');
    }
  }, [capital]);
  
  // Sync capital changes with risk amount
  const handleCapitalChange = useCallback((value: string) => {
    setCapitalInput(value);
    const cap = parseFloat(value);
    const percent = parseFloat(riskPercentInput);
    if (!isNaN(cap) && !isNaN(percent) && cap > 0) {
      setRiskAmountInput((cap * (percent / 100)).toFixed(2));
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
    
    // Pre-validation with priority order (single error at a time)
    
    // 1. Capital
    if (capital <= 0 || !isFinite(capital)) {
      setError(isFr ? 'Capital invalide' : 'Invalid capital');
      return;
    }
    
    // 2. Risk
    if (riskPercent <= 0 || riskPercent > 10 || !isFinite(riskPercent)) {
      setError(isFr ? 'Risque incorrect' : 'Invalid risk');
      return;
    }
    
    // 3. Asset
    if (!selectedAsset || !assetConfig) {
      setError(isFr ? 'Actif non pris en charge' : 'Unsupported asset');
      return;
    }
    
    // 4. Entry price
    const entry = parseFloat(entryPrice);
    if (isNaN(entry) || entry <= 0 || !isFinite(entry)) {
      setError(isFr ? 'Prix d\'entrée invalide' : 'Invalid entry price');
      return;
    }
    
    // 5. Stop loss
    const sl = parseFloat(stopLoss);
    if (isNaN(sl) || sl <= 0 || !isFinite(sl)) {
      setError(isFr ? 'Stop loss requis' : 'Stop loss required');
      return;
    }
    
    // 6. Stop loss cannot equal entry
    if (entry === sl) {
      setError(isFr ? 'Stop loss incorrect' : 'Invalid stop loss');
      return;
    }
    
    // 7. Take profit validation (if defined)
    const tp = takeProfit ? parseFloat(takeProfit) : undefined;
    if (tp !== undefined && tp > 0) {
      const isBuy = entry > sl;
      if (isBuy && tp <= entry) {
        setError(isFr ? 'Take profit incorrect' : 'Invalid take profit');
        return;
      }
      if (!isBuy && tp >= entry) {
        setError(isFr ? 'Take profit incorrect' : 'Invalid take profit');
        return;
      }
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
    }, isFr);
    
    if (isCalculationError(calcResult)) {
      setError(calcResult.error || (isFr ? 'Calcul impossible' : 'Calculation error'));
      return;
    }
    
    // Final validation of result
    if (!calcResult.lotSize || calcResult.lotSize <= 0 || !isFinite(calcResult.lotSize)) {
      setError(isFr ? 'Calcul impossible' : 'Calculation error');
      return;
    }
    
    setResult(calcResult);
  }, [selectedAsset, assetConfig, capital, riskPercent, accountCurrency, entryPrice, stopLoss, takeProfit, rates, isFr]);
  
  // Send to trade form
  const sendToTrade = useCallback(() => {
    if (!result || !selectedAsset) return;
    
    const riskAmount = capital * (riskPercent / 100);
    
    // Build trade data with field names matching AddTrade.tsx expectations
    // Keep full precision for prices - use raw string values
    const pendingTrade = {
      asset: selectedAsset,
      direction: result.direction.toLowerCase() as 'buy' | 'sell',
      entryPrice: entryPrice, // Keep original input with full precision
      stopLoss: stopLoss, // Keep original input with full precision
      takeProfit: takeProfit || '', // Keep original input with full precision
      lotSize: result.lotSize.toString(),
      riskCash: riskAmount.toFixed(2),
      risk: riskPercent.toString(),
      capital: capital.toString(),
    };
    
    // Store in localStorage (matching AddTrade.tsx expectations)
    localStorage.setItem(PENDING_TRADE_KEY, JSON.stringify(pendingTrade));
    
    toast.success(isFr ? 'Données envoyées au formulaire' : 'Data sent to form');
    navigate('/add-trade');
  }, [result, selectedAsset, entryPrice, stopLoss, takeProfit, riskPercent, capital, navigate, isFr]);

  // Loading state
  if (!settingsLoaded) {
    return (
      <div className="py-4 max-w-2xl mx-auto space-y-6 px-5 sm:px-8">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="py-4 max-w-2xl mx-auto px-5 sm:px-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
            {isFr ? 'Calculatrice de Lot' : 'Lot Calculator'}
          </h1>
        </div>
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shadow-lg">
          <CalcIcon className="w-6 h-6 text-white" />
        </div>
      </div>
      
      {/* Main Form Card */}
      <Card className="glass-card mb-6">
        <CardContent className="pt-6">
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
            language={language}
            currency={accountCurrency}
            onCalculate={performCalculation}
          />
        </CardContent>
      </Card>
      
      {/* Error display */}
      {error && (
        <div 
          className={cn(
            "mb-6 p-4 rounded-xl",
            "bg-destructive/15 border border-destructive/30",
            "animate-in fade-in-0 slide-in-from-top-2 duration-200"
          )}
        >
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 text-destructive" />
            <span className="font-medium text-destructive-foreground">⚠️ {error}</span>
          </div>
        </div>
      )}
      
      {/* Results Section - UNIQUEMENT lot size et RR */}
      {result && (
        <Card className="glass-card mb-6">
          <CardContent className="pt-6">
            <CalculationResults
              result={result}
              language={language}
            />
            
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
    </div>
  );
};

export default Calculator;
