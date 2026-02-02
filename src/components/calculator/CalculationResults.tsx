import React from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, Target, Shield, Scale } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CalculationResult } from '@/lib/calculator';

interface CalculationResultsProps {
  result: CalculationResult;
  currencySymbol: string;
  assetType: string;
  language: string;
}

const CalculationResults: React.FC<CalculationResultsProps> = ({
  result,
  currencySymbol,
  assetType,
  language,
}) => {
  const isFr = language === 'fr';
  
  const pipsLabel = assetType === 'index' || assetType === 'commodity' 
    ? 'points' 
    : 'pips';
  
  return (
    <div className="space-y-4">
      {/* Main Result - Lot Size */}
      <div className={cn(
        'p-4 rounded-xl text-center',
        result.direction === 'BUY' 
          ? 'bg-emerald-500/10 border border-emerald-500/30' 
          : 'bg-red-500/10 border border-red-500/30'
      )}>
        <div className="flex items-center justify-center gap-2 mb-2">
          {result.direction === 'BUY' 
            ? <TrendingUp className="w-5 h-5 text-emerald-500" />
            : <TrendingDown className="w-5 h-5 text-red-500" />
          }
          <span className={cn(
            'font-semibold',
            result.direction === 'BUY' ? 'text-emerald-500' : 'text-red-500'
          )}>
            {result.direction}
          </span>
        </div>
        <div className="text-3xl font-bold font-mono text-foreground">
          {result.lotSize} lots
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {isFr ? 'Taille de position recommandée' : 'Recommended position size'}
        </p>
      </div>
      
      {/* Risk Analysis */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-lg bg-secondary/50">
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-4 h-4 text-red-500" />
            <span className="text-xs text-muted-foreground">Stop Loss</span>
          </div>
          <div className="font-mono font-semibold text-red-500">
            {result.slDistancePips} {pipsLabel}
          </div>
          <div className="text-xs text-muted-foreground">
            -{result.potentialLoss.toFixed(2)} {currencySymbol}
          </div>
        </div>
        
        {result.tpDistancePips !== undefined && (
          <div className="p-3 rounded-lg bg-secondary/50">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-emerald-500" />
              <span className="text-xs text-muted-foreground">Take Profit</span>
            </div>
            <div className="font-mono font-semibold text-emerald-500">
              {result.tpDistancePips} {pipsLabel}
            </div>
            <div className="text-xs text-muted-foreground">
              +{result.potentialProfit?.toFixed(2)} {currencySymbol}
            </div>
          </div>
        )}
      </div>
      
      {/* Risk/Reward */}
      {result.riskReward !== undefined && (
        <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Risk/Reward</span>
            </div>
            <div className={cn(
              'text-lg font-bold font-mono',
              result.riskReward >= 2 ? 'text-emerald-500' :
              result.riskReward >= 1 ? 'text-primary' :
              'text-red-500'
            )}>
              1:{result.riskReward.toFixed(2)}
            </div>
          </div>
          <div className="mt-2 h-2 bg-secondary rounded-full overflow-hidden">
            <div 
              className={cn(
                'h-full rounded-full',
                result.riskReward >= 2 ? 'bg-emerald-500' :
                result.riskReward >= 1 ? 'bg-primary' :
                'bg-red-500'
              )}
              style={{ width: `${Math.min(result.riskReward / 4 * 100, 100)}%` }}
            />
          </div>
        </div>
      )}
      
      {/* Risk Details */}
      <div className="p-3 rounded-lg bg-secondary/30 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{isFr ? 'Risque cible' : 'Target risk'}</span>
          <span className="font-mono">{result.riskAmount.toFixed(2)} {currencySymbol}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{isFr ? 'Risque réel' : 'Actual risk'}</span>
          <span className="font-mono font-medium">{result.actualRisk.toFixed(2)} {currencySymbol}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{isFr ? 'Valeur pip' : 'Pip value'}</span>
          <span className="font-mono">{result.pipValueInAccount.toFixed(4)} {currencySymbol}</span>
        </div>
      </div>
      
      {/* Warnings */}
      {result.warnings.length > 0 && (
        <div className="space-y-2">
          {result.warnings.map((warning, i) => (
            <div key={i} className="flex items-start gap-2 p-2 rounded bg-yellow-500/10 border border-yellow-500/20">
              <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 shrink-0" />
              <span className="text-xs text-yellow-600 dark:text-yellow-400">{warning}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CalculationResults;
