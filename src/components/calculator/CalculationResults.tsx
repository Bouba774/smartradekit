import React from 'react';
import { cn } from '@/lib/utils';
import { AlertTriangle, CheckCircle, TrendingDown, TrendingUp, ArrowRightLeft } from 'lucide-react';
import { CalculationResult } from '@/lib/calculator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
  const unit = assetType === 'index' || assetType === 'crypto' ? (isFr ? 'pts' : 'pts') : 'pips';
  
  const formatCurrency = (value: number) => {
    return `${value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currencySymbol}`;
  };

  return (
    <div className="space-y-4">
      {/* Main result - Lot Size */}
      <div className="glass-card p-4 border-2 border-primary/30 bg-primary/5">
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-1">
            {isFr ? 'Taille de position recommandée' : 'Recommended Position Size'}
          </p>
          <p className="text-4xl font-bold text-primary">
            {result.lotSize.toFixed(2)} <span className="text-xl">lots</span>
          </p>
          <div className={cn(
            'inline-flex items-center gap-1 mt-2 px-3 py-1 rounded-full text-sm font-medium',
            result.direction === 'BUY' 
              ? 'bg-emerald-500/20 text-emerald-500' 
              : 'bg-red-500/20 text-red-500'
          )}>
            {result.direction === 'BUY' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {result.direction}
          </div>
        </div>
      </div>

      {/* Risk Details */}
      <div className="grid grid-cols-2 gap-3">
        {/* Stop Loss */}
        <div className="glass-card p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-sm font-medium text-muted-foreground">Stop Loss</span>
          </div>
          <p className="text-lg font-semibold">
            {result.slDistancePips.toFixed(result.slDistancePips >= 100 ? 0 : 1)} {unit}
          </p>
          <p className="text-sm text-red-500">
            -{formatCurrency(result.potentialLoss)}
          </p>
        </div>

        {/* Take Profit (if defined) */}
        {result.tpDistancePips !== undefined && result.potentialProfit !== undefined ? (
          <div className="glass-card p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-sm font-medium text-muted-foreground">Take Profit</span>
            </div>
            <p className="text-lg font-semibold">
              {result.tpDistancePips.toFixed(result.tpDistancePips >= 100 ? 0 : 1)} {unit}
            </p>
            <p className="text-sm text-emerald-500">
              +{formatCurrency(result.potentialProfit)}
            </p>
          </div>
        ) : (
          <div className="glass-card p-3 opacity-50">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-muted" />
              <span className="text-sm font-medium text-muted-foreground">Take Profit</span>
            </div>
            <p className="text-sm text-muted-foreground italic">
              {isFr ? 'Non défini' : 'Not set'}
            </p>
          </div>
        )}
      </div>

      {/* Risk/Reward & Risk Details */}
      <div className="glass-card p-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">
              {isFr ? 'Risque réel' : 'Actual Risk'}
            </p>
            <p className="text-lg font-semibold">{formatCurrency(result.actualRisk)}</p>
          </div>
          
          {result.riskRewardRatio !== undefined && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground mb-1">Risk/Reward</p>
                    <p className={cn(
                      'text-lg font-bold',
                      result.riskRewardRatio >= 2 ? 'text-emerald-500' :
                      result.riskRewardRatio >= 1 ? 'text-yellow-500' : 'text-red-500'
                    )}>
                      1:{result.riskRewardRatio.toFixed(2)}
                    </p>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {isFr 
                      ? `Pour 1${currencySymbol} risqué, gain potentiel de ${result.riskRewardRatio.toFixed(2)}${currencySymbol}`
                      : `For every 1${currencySymbol} risked, potential gain of ${result.riskRewardRatio.toFixed(2)}${currencySymbol}`
                    }
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>

      {/* Conversion info (collapsed by default) */}
      {result.conversionRate !== 1 && (
        <details className="glass-card p-3 cursor-pointer">
          <summary className="flex items-center gap-2 text-sm text-muted-foreground">
            <ArrowRightLeft className="w-4 h-4" />
            {isFr ? 'Détails de conversion' : 'Conversion details'}
          </summary>
          <div className="mt-2 pt-2 border-t border-border/50 text-xs space-y-1">
            <p>
              <span className="text-muted-foreground">{isFr ? 'Valeur pip (quote):' : 'Pip value (quote):'}</span>{' '}
              {result.pipValueQuote.toFixed(4)}
            </p>
            <p>
              <span className="text-muted-foreground">{isFr ? 'Valeur pip (compte):' : 'Pip value (account):'}</span>{' '}
              {result.pipValueAccount.toFixed(4)} {currencySymbol}
            </p>
            <p>
              <span className="text-muted-foreground">{isFr ? 'Taux de conversion:' : 'Conversion rate:'}</span>{' '}
              {result.conversionRate.toFixed(6)}
            </p>
          </div>
        </details>
      )}

      {/* Warnings */}
      {result.warnings.length > 0 && (
        <div className="space-y-2">
          {result.warnings.map((warning, index) => (
            <div key={index} className="flex items-start gap-2 p-2 rounded bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 text-sm">
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{warning}</span>
            </div>
          ))}
        </div>
      )}

      {/* Success indicator */}
      <div className="flex items-center justify-center gap-2 text-emerald-500 text-sm">
        <CheckCircle className="w-4 h-4" />
        <span>{isFr ? 'Calcul vérifié' : 'Calculation verified'}</span>
      </div>
    </div>
  );
};

export default CalculationResults;
