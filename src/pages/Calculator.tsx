import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSettings } from '@/hooks/useSettings';
import { useExchangeRates } from '@/hooks/useExchangeRates';
import { Calculator as CalcIcon, Send, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

import CalculatorForm from '@/components/calculator/CalculatorForm';
import CalculationResults from '@/components/calculator/CalculationResults';
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
    
    // Validation
    if (!selectedAsset || !assetConfig) {
      setError(isFr ? 'Veuillez sélectionner un actif' : 'Please select an asset');
      return;
    }
    
    if (capital <= 0) {
      setError(isFr ? 'Capital non défini – configurez-le dans les paramètres' : 'Capital not set – configure it in settings');
      return;
    }
    
    if (riskPercent <= 0) {
      setError(isFr ? 'Risque invalide – doit être > 0' : 'Invalid risk – must be > 0');
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
      setError(isFr ? 'Entrées invalides – vérifiez le Stop Loss' : 'Invalid inputs – check Stop Loss');
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
     const riskAmount = capital * (riskPercent / 100);
    
    const pendingTrade = {
      asset: selectedAsset,
      direction: result.direction.toLowerCase(),
      entry_price: entry,
      stop_loss: sl,
      take_profit: tp,
      lot_size: result.lotSize,
       risk_amount: riskAmount,
      risk_percent: riskPercent,
    };
    
    // Store in sessionStorage
    sessionStorage.setItem(PENDING_TRADE_KEY, JSON.stringify(pendingTrade));
    
    toast.success(isFr ? 'Données envoyées au formulaire' : 'Data sent to form');
    navigate('/add-trade');
  }, [result, selectedAsset, entryPrice, stopLoss, takeProfit, riskPercent, navigate, isFr]);

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
        <div className="glass-card p-4 mb-6 border-red-500/30 bg-red-500/5 rounded-xl">
          <div className="flex items-center gap-2 text-red-500">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
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
