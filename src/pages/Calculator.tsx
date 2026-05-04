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
import type { CalculatorMode } from '@/components/calculator/CalculatorForm';
import CalculationResults from '@/components/calculator/CalculationResults';
import {
  AssetConfig,
  calculatePosition,
  calculatePositionFromPips,
  isCalculationError,
  CalculationResult,
} from '@/lib/calculator';

import { PENDING_TRADE_KEY } from '@/pages/AddTrade';

const RISK_PERSIST_KEY = 'smart-trade-kit-calc-risk-percent';
const COMMISSION_PERSIST_KEY = 'smart-trade-kit-calc-commission-per-lot';

const Calculator: React.FC = () => {
  const { language } = useLanguage();
  const { settings, isLoaded: settingsLoaded } = useSettings();
  const { rates } = useExchangeRates();
  const navigate = useNavigate();
  
  const isFr = language === 'fr';
  
  const [mode, setMode] = useState<CalculatorMode>('pips');
  const [selectedAsset, setSelectedAsset] = useState<string>('');
  const [assetConfig, setAssetConfig] = useState<AssetConfig | null>(null);
  const [capitalInput, setCapitalInput] = useState<string>('');
  const [riskPercentInput, setRiskPercentInput] = useState<string>('');
  const [riskAmountInput, setRiskAmountInput] = useState<string>('');
  
  const [entryPrice, setEntryPrice] = useState<string>('');
  const [stopLoss, setStopLoss] = useState<string>('');
  const [takeProfit, setTakeProfit] = useState<string>('');
  
  const [slPips, setSlPips] = useState<string>('');
  const [tpPips, setTpPips] = useState<string>('');
  const [pipsDirection, setPipsDirection] = useState<'BUY' | 'SELL'>('BUY');
  const [commissionInput, setCommissionInput] = useState<string>(() => localStorage.getItem(COMMISSION_PERSIST_KEY) || '');
  
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const accountCurrency = settings.capitalCurrency || settings.currency || 'USD';
  const currencySymbol = accountCurrency === 'EUR' ? '€' : accountCurrency === 'GBP' ? '£' : '$';
  
  useEffect(() => {
    if (error) setError(null);
  }, [selectedAsset, capitalInput, riskPercentInput, entryPrice, stopLoss, takeProfit, slPips, tpPips, pipsDirection, mode]);
  
  useEffect(() => {
    setResult(null);
    setError(null);
  }, [mode]);
  
  // Init from settings + persisted risk
  useEffect(() => {
    if (settingsLoaded) {
      // Load persisted risk% first, then fallback to settings
      const savedRisk = localStorage.getItem(RISK_PERSIST_KEY);
      if (savedRisk && !riskPercentInput) {
        setRiskPercentInput(savedRisk);
        if (settings.defaultCapital) {
          const percent = parseFloat(savedRisk);
          if (!isNaN(percent)) {
            setRiskAmountInput((settings.defaultCapital * (percent / 100)).toFixed(2));
          }
        }
      } else if (settings.defaultRiskPercent && !riskPercentInput) {
        setRiskPercentInput(settings.defaultRiskPercent.toString());
      }
      if (settings.defaultCapital && !capitalInput) {
        setCapitalInput(settings.defaultCapital.toString());
        const rp = parseFloat(riskPercentInput) || settings.defaultRiskPercent || 0;
        if (rp > 0) {
          setRiskAmountInput((settings.defaultCapital * (rp / 100)).toFixed(2));
        }
      }
    }
  }, [settingsLoaded, settings.defaultRiskPercent, settings.defaultCapital]);
  
  const capital = parseFloat(capitalInput) || 0;
  const riskPercent = parseFloat(riskPercentInput) || 0;
  
  const handleRiskPercentChange = useCallback((value: string) => {
    setRiskPercentInput(value);
    // Persist risk%
    if (value) localStorage.setItem(RISK_PERSIST_KEY, value);
    const percent = parseFloat(value);
    if (!isNaN(percent) && capital > 0) {
      setRiskAmountInput((capital * (percent / 100)).toFixed(2));
    } else if (value === '') setRiskAmountInput('');
  }, [capital]);
  
  const handleRiskAmountChange = useCallback((value: string) => {
    setRiskAmountInput(value);
    const amount = parseFloat(value);
    if (!isNaN(amount) && capital > 0) {
      const newPercent = ((amount / capital) * 100).toFixed(2);
      setRiskPercentInput(newPercent);
      localStorage.setItem(RISK_PERSIST_KEY, newPercent);
    } else if (value === '') setRiskPercentInput('');
  }, [capital]);
  
  const handleCapitalChange = useCallback((value: string) => {
    setCapitalInput(value);
    const cap = parseFloat(value);
    const percent = parseFloat(riskPercentInput);
    if (!isNaN(cap) && !isNaN(percent) && cap > 0) {
      setRiskAmountInput((cap * (percent / 100)).toFixed(2));
    }
  }, [riskPercentInput]);
  
  const handleAssetChange = useCallback((symbol: string, config: AssetConfig | null) => {
    setSelectedAsset(symbol);
    setAssetConfig(config);
    setResult(null);
    setError(null);
  }, []);
  
  const handleCommissionChange = useCallback((value: string) => {
    setCommissionInput(value);
    if (value) localStorage.setItem(COMMISSION_PERSIST_KEY, value);
    else localStorage.removeItem(COMMISSION_PERSIST_KEY);
  }, []);

  const performCalculation = useCallback(() => {
    setError(null);
    setResult(null);
    
    if (capital <= 0 || !isFinite(capital)) {
      setError(isFr ? 'Capital invalide' : 'Invalid capital');
      return;
    }
    if (riskPercent <= 0 || !isFinite(riskPercent)) {
      setError(isFr ? 'Risque incorrect' : 'Invalid risk');
      return;
    }
    if (!selectedAsset || !assetConfig) {
      setError(isFr ? 'Actif non pris en charge' : 'Unsupported asset');
      return;
    }

    const commissionPerLot = (() => {
      const v = parseFloat(commissionInput);
      return !isNaN(v) && v > 0 ? v : undefined;
    })();
    
    if (mode === 'price') {
      const entry = parseFloat(entryPrice);
      if (isNaN(entry) || entry <= 0) { setError(isFr ? "Prix d'entrée invalide" : 'Invalid entry price'); return; }
      const sl = parseFloat(stopLoss);
      if (isNaN(sl) || sl <= 0) { setError(isFr ? 'Stop loss requis' : 'Stop loss required'); return; }
      if (entry === sl) { setError(isFr ? 'Stop loss incorrect' : 'Invalid stop loss'); return; }
      
      const tp = takeProfit ? parseFloat(takeProfit) : undefined;
      if (tp !== undefined && tp > 0) {
        const isBuy = entry > sl;
        if (isBuy && tp <= entry) { setError(isFr ? 'Take profit incorrect' : 'Invalid take profit'); return; }
        if (!isBuy && tp >= entry) { setError(isFr ? 'Take profit incorrect' : 'Invalid take profit'); return; }
      }
      
      const calcResult = calculatePosition({
        capital, riskPercent, accountCurrency, asset: assetConfig,
        entryPrice: entry, stopLoss: sl, takeProfit: tp, exchangeRates: rates, commissionPerLot,
      }, isFr);
      
      if (isCalculationError(calcResult)) { setError(calcResult.error); return; }
      if (!calcResult.lotSize || calcResult.lotSize <= 0) { setError(isFr ? 'Calcul impossible' : 'Calculation error'); return; }
      setResult(calcResult);
      
    } else {
      const sl = parseFloat(slPips);
      if (isNaN(sl) || sl <= 0) { setError(isFr ? 'SL invalide' : 'Invalid SL'); return; }
      const tp = tpPips ? parseFloat(tpPips) : undefined;
      if (tp !== undefined && tp < 0) { setError(isFr ? 'TP invalide' : 'Invalid TP'); return; }
      
      const calcResult = calculatePositionFromPips({
        capital, riskPercent, accountCurrency, asset: assetConfig,
        slPips: sl, tpPips: tp, direction: pipsDirection, exchangeRates: rates, commissionPerLot,
      }, isFr);
      
      if (isCalculationError(calcResult)) { setError(calcResult.error); return; }
      if (!calcResult.lotSize || calcResult.lotSize <= 0) { setError(isFr ? 'Calcul impossible' : 'Calculation error'); return; }
      setResult(calcResult);
    }
  }, [selectedAsset, assetConfig, capital, riskPercent, accountCurrency, entryPrice, stopLoss, takeProfit, slPips, tpPips, pipsDirection, rates, isFr, mode, commissionInput]);
  
  const sendToTrade = useCallback(() => {
    if (!result || !selectedAsset) return;
    
    const riskAmount = capital * (riskPercent / 100);
    const pendingTrade = {
      asset: selectedAsset,
      direction: result.direction.toLowerCase() as 'buy' | 'sell',
      entryPrice: mode === 'price' ? entryPrice : '',
      stopLoss: mode === 'price' ? stopLoss : '',
      takeProfit: mode === 'price' ? (takeProfit || '') : '',
      lotSize: result.lotSize.toString(),
      riskCash: riskAmount.toFixed(2),
      risk: riskPercent.toString(),
      capital: capital.toString(),
    };
    
    localStorage.setItem(PENDING_TRADE_KEY, JSON.stringify(pendingTrade));
    toast.success(isFr ? 'Données envoyées au formulaire' : 'Data sent to form');
    navigate('/add-trade');
  }, [result, selectedAsset, entryPrice, stopLoss, takeProfit, riskPercent, capital, navigate, isFr, mode]);

  if (!settingsLoaded) {
    return (
      <div className="py-4 w-full space-y-6 px-3">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="py-4 w-full px-3">
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
        <CardContent className="pt-6 px-3 sm:px-6">
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
            slPips={slPips}
            onSlPipsChange={setSlPips}
            tpPips={tpPips}
            onTpPipsChange={setTpPips}
            pipsDirection={pipsDirection}
            onPipsDirectionChange={setPipsDirection}
            mode={mode}
            onModeChange={setMode}
            language={language}
            currency={accountCurrency}
            onCalculate={performCalculation}
          />
        </CardContent>
      </Card>
      
      {/* Error */}
      {error && (
        <div className={cn(
          "mb-6 p-4 rounded-xl",
          "bg-destructive/15 border border-destructive/30",
        )}>
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 text-destructive" />
            <span className="font-medium text-destructive-foreground">⚠️ {error}</span>
          </div>
        </div>
      )}
      
      {/* Results */}
      {result && (
        <Card className="glass-card mb-6">
          <CardContent className="pt-6 px-3 sm:px-6">
            <CalculationResults result={result} language={language} currencySymbol={currencySymbol} />
            
            <Button onClick={sendToTrade} className="w-full mt-6" size="lg">
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
