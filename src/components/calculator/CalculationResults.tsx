import React from 'react';
import { Button } from '@/components/ui/button';
import { Copy, TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { CalculationResult, formatRRRatio, formatPips, getPipsLabel } from '@/lib/calculator/calculationEngine';
import { toast } from 'sonner';

interface CalculationResultsProps {
  result: CalculationResult;
  formatAmount: (amount: number, showSymbol?: boolean, showDecimals?: boolean) => string;
}

const CalculationResults: React.FC<CalculationResultsProps> = ({
  result,
  formatAmount,
}) => {
  const { t, language } = useLanguage();

  const copyLotSize = () => {
    if (result.lotSize !== null) {
      navigator.clipboard.writeText(result.lotSize.toString());
      toast.success(language === 'fr' ? 'Lot copié!' : 'Lot copied!');
    }
  };

  // Obtenir le label pips/points selon l'actif
  const pipsLabel = result.assetConfig 
    ? getPipsLabel(result.assetConfig, language === 'fr' ? 'fr' : 'en')
    : 'pips';

  if (!result.isValid && result.errors.length > 0) {
    return (
      <div className="glass-card p-6 animate-fade-in border-loss/30">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-loss" />
          <h3 className="font-display font-semibold text-loss">
            {language === 'fr' ? 'Erreur' : 'Error'}
          </h3>
        </div>
        <ul className="space-y-2">
          {result.errors.map((error, index) => (
            <li key={index} className="text-sm text-loss flex items-start gap-2">
              <span className="mt-1">•</span>
              <span>{error.message}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (!result.isValid || result.lotSize === null) {
    return null;
  }

  return (
    <div className="glass-card p-6 animate-fade-in">
      {/* Header avec direction */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
          {t('results')}
          {result.direction === 'buy' ? (
            <span className="flex items-center gap-1 text-sm text-profit px-2 py-0.5 rounded-full bg-profit/10">
              <TrendingUp className="w-4 h-4" /> BUY
            </span>
          ) : result.direction === 'sell' ? (
            <span className="flex items-center gap-1 text-sm text-loss px-2 py-0.5 rounded-full bg-loss/10">
              <TrendingDown className="w-4 h-4" /> SELL
            </span>
          ) : null}
        </h3>
        <div className="flex items-center gap-1 text-profit">
          <CheckCircle className="w-4 h-4" />
          <span className="text-xs">{language === 'fr' ? 'Vérifié' : 'Verified'}</span>
        </div>
      </div>

      {/* Résultat principal - Lot Size */}
      <div className="text-center p-6 rounded-xl bg-primary/10 border border-primary/30 mb-6 relative">
        <Button
          variant="ghost"
          size="sm"
          onClick={copyLotSize}
          className="absolute top-2 right-2 h-8 w-8 p-0"
          title={language === 'fr' ? 'Copier' : 'Copy'}
        >
          <Copy className="w-4 h-4" />
        </Button>
        <p className="text-sm text-muted-foreground uppercase tracking-wide mb-2">
          {language === 'fr' ? 'Taille de lot recommandée' : 'Recommended lot size'}
        </p>
        <p className="font-display text-5xl font-bold text-primary">
          {result.lotSize}
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          {language === 'fr' ? 'lots standard' : 'standard lots'}
        </p>
      </div>

      {/* Grille de résultats simplifiée */}
      <div className="grid grid-cols-2 gap-4">
        {/* Risque réel */}
        <div className="p-4 rounded-lg bg-secondary/50">
          <p className="text-xs text-muted-foreground">
            {language === 'fr' ? 'Risque réel' : 'Actual risk'}
          </p>
          <p className="font-display text-xl font-bold text-foreground">
            {result.maxLoss !== null ? formatAmount(result.maxLoss) : '-'}
          </p>
        </div>

        {/* R:R Ratio - seulement si TP défini */}
        {result.rrRatio !== null && (
          <div className="p-4 rounded-lg bg-secondary/50">
            <p className="text-xs text-muted-foreground">Risk/Reward</p>
            <p className={cn(
              "font-display text-xl font-bold",
              result.rrRatio >= 2 ? "text-profit" : 
              result.rrRatio >= 1 ? "text-primary" : "text-loss"
            )}>
              {formatRRRatio(result.rrRatio)}
            </p>
          </div>
        )}

        {/* Stop Loss */}
        <div className="p-4 rounded-lg bg-loss/10 border border-loss/20">
          <p className="text-xs text-muted-foreground">Stop Loss</p>
          <p className="font-display text-xl font-bold text-loss">
            {formatPips(result.slDistancePips)} {pipsLabel}
          </p>
        </div>

        {/* Take Profit - seulement si défini */}
        {result.tpDistancePips !== null && (
          <div className="p-4 rounded-lg bg-profit/10 border border-profit/20">
            <p className="text-xs text-muted-foreground">Take Profit</p>
            <p className="font-display text-xl font-bold text-profit">
              {formatPips(result.tpDistancePips)} {pipsLabel}
            </p>
          </div>
        )}
      </div>

      {/* Gain potentiel - seulement si TP défini */}
      {result.potentialGain !== null && (
        <div className="mt-4 p-3 rounded-lg bg-profit/5 border border-profit/20 text-center">
          <p className="text-xs text-muted-foreground">
            {language === 'fr' ? 'Gain potentiel' : 'Potential gain'}
          </p>
          <p className="font-display text-lg font-bold text-profit">
            +{formatAmount(result.potentialGain)}
          </p>
        </div>
      )}

      {/* Warnings */}
      {result.warnings.length > 0 && (
        <div className="mt-4 p-3 rounded-lg border border-yellow-500/30 bg-yellow-500/10">
          <ul className="space-y-1">
            {result.warnings.map((warning, index) => (
              <li key={index} className="text-sm text-yellow-500">
                {warning}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CalculationResults;
