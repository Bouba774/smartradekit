import React from 'react';
import { Scale } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CalculationResult } from '@/lib/calculator';

interface CalculationResultsProps {
  result: CalculationResult;
  language: string;
}

/**
 * Affichage minimaliste des résultats de calcul
 * UNIQUEMENT : Taille de lot + Risk-Reward (si TP défini)
 */
const CalculationResults: React.FC<CalculationResultsProps> = ({
  result,
  language,
}) => {
  const isFr = language === 'fr';
  
  return (
    <div className="space-y-6">
      {/* Taille de lot - Résultat principal */}
      <div className={cn(
        'p-6 rounded-2xl text-center',
        result.direction === 'BUY' 
          ? 'bg-emerald-500/10 border-2 border-emerald-500/30' 
          : 'bg-red-500/10 border-2 border-red-500/30'
      )}>
        <p className="text-sm text-muted-foreground mb-2">
          {isFr ? 'Taille de lot' : 'Lot Size'}
        </p>
        <div className="text-5xl font-bold font-mono text-foreground">
          {result.lotSize}
        </div>
        <p className={cn(
          'text-sm font-semibold mt-2',
          result.direction === 'BUY' ? 'text-emerald-500' : 'text-red-500'
        )}>
          {result.direction}
        </p>
      </div>
      
      {/* Risk/Reward - Uniquement si TP défini */}
      {result.riskReward !== undefined && (
        <div className="p-5 rounded-xl bg-secondary/50 border border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                'w-10 h-10 rounded-lg flex items-center justify-center',
                result.riskReward >= 2 ? 'bg-emerald-500/20' :
                result.riskReward >= 1 ? 'bg-primary/20' :
                'bg-red-500/20'
              )}>
                <Scale className={cn(
                  'w-5 h-5',
                  result.riskReward >= 2 ? 'text-emerald-500' :
                  result.riskReward >= 1 ? 'text-primary' :
                  'text-red-500'
                )} />
              </div>
              <span className="text-base font-medium text-foreground">
                Risk-Reward
              </span>
            </div>
            <div className={cn(
              'text-2xl font-bold font-mono',
              result.riskReward >= 2 ? 'text-emerald-500' :
              result.riskReward >= 1 ? 'text-primary' :
              'text-red-500'
            )}>
              1:{result.riskReward.toFixed(1)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalculationResults;
