import React from 'react';
import { Scale, TrendingDown, TrendingUp, Target, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CalculationResult } from '@/lib/calculator';

interface CalculationResultsProps {
  result: CalculationResult;
  language: string;
  currencySymbol?: string;
}

const CalculationResults: React.FC<CalculationResultsProps> = ({
  result,
  language,
  currencySymbol = '$',
}) => {
  const isFr = language === 'fr';
  
  return (
    <div className="space-y-4">
      {/* Lot Size - Hero */}
      <div className={cn(
        'p-5 rounded-2xl text-center',
        result.direction === 'BUY' 
          ? 'bg-emerald-500/10 border-2 border-emerald-500/30' 
          : 'bg-red-500/10 border-2 border-red-500/30'
      )}>
        <p className="text-sm text-muted-foreground mb-1">
          {isFr ? 'Taille de lot' : 'Lot Size'}
        </p>
        <div className="text-5xl font-bold font-mono text-foreground">
          {result.lotSize}
        </div>
        <p className={cn(
          'text-sm font-semibold mt-1',
          result.direction === 'BUY' ? 'text-emerald-500' : 'text-red-500'
        )}>
          {result.direction}
        </p>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Risk $ */}
        <div className="p-3.5 rounded-xl bg-red-500/8 border border-red-500/20">
          <div className="flex items-center gap-2 mb-1">
            <ShieldAlert className="w-4 h-4 text-red-500" />
            <span className="text-xs text-muted-foreground">{isFr ? 'Risque' : 'Risk'}</span>
          </div>
          <p className="text-lg font-bold font-mono text-red-500">
            {result.riskAmount.toFixed(2)} {currencySymbol}
          </p>
        </div>

        {/* Gain $ */}
        <div className="p-3.5 rounded-xl bg-emerald-500/8 border border-emerald-500/20">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <span className="text-xs text-muted-foreground">{isFr ? 'Gain' : 'Gain'}</span>
          </div>
          <p className="text-lg font-bold font-mono text-emerald-500">
            {result.gainAmount !== undefined ? `${result.gainAmount.toFixed(2)} ${currencySymbol}` : '—'}
          </p>
        </div>

        {/* RR */}
        <div className="p-3.5 rounded-xl bg-secondary/50 border border-border/50">
          <div className="flex items-center gap-2 mb-1">
            <Scale className={cn('w-4 h-4', 
              result.riskReward !== undefined && result.riskReward >= 2 ? 'text-emerald-500' :
              result.riskReward !== undefined && result.riskReward >= 1 ? 'text-primary' : 'text-red-500'
            )} />
            <span className="text-xs text-muted-foreground">R:R</span>
          </div>
          <p className={cn('text-lg font-bold font-mono',
            result.riskReward !== undefined && result.riskReward >= 2 ? 'text-emerald-500' :
            result.riskReward !== undefined && result.riskReward >= 1 ? 'text-primary' : 'text-red-500'
          )}>
            {result.riskReward !== undefined ? `1:${result.riskReward.toFixed(2)}` : '—'}
          </p>
        </div>

        {/* SL Pips */}
        <div className="p-3.5 rounded-xl bg-secondary/50 border border-border/50">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown className="w-4 h-4 text-red-400" />
            <span className="text-xs text-muted-foreground">SL</span>
          </div>
          <p className="text-lg font-bold font-mono text-foreground">
            {result.slPips} pips
          </p>
        </div>
      </div>

      {/* TP Pips - full width if present */}
      {result.tpPips !== undefined && (
        <div className="p-3.5 rounded-xl bg-secondary/50 border border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-muted-foreground">TP</span>
            </div>
            <p className="text-lg font-bold font-mono text-foreground">
              {result.tpPips} pips
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalculationResults;
