import React from 'react';
import { Button } from '@/components/ui/button';
import { Copy, TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { CalculationResult, formatRRRatio, formatPips, getAssetTypeLabel } from '@/lib/calculator/calculationEngine';
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

  if (!result.isValid && result.errors.length > 0) {
    return (
      <div className="glass-card p-6 animate-fade-in border-loss/30">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-loss" />
          <h3 className="font-display font-semibold text-loss">
            {language === 'fr' ? 'Erreurs de calcul' : 'Calculation Errors'}
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
      <h3 className="font-display font-semibold text-foreground mb-6 flex items-center gap-2">
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
        {result.assetConfig && (
          <span className="text-xs text-muted-foreground ml-auto">
            {getAssetTypeLabel(result.assetConfig.assetType, language === 'fr' ? 'fr' : 'en')}
          </span>
        )}
      </h3>

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
          {t('recommendedLotSize')}
        </p>
        <p className="font-display text-5xl font-bold text-primary neon-text">
          {result.lotSize}
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          {t('standardLots')}
        </p>
        {result.lotRaw !== null && result.lotRaw !== result.lotSize && (
          <p className="text-xs text-muted-foreground mt-1">
            ({language === 'fr' ? 'Lot brut' : 'Raw lot'}: {result.lotRaw.toFixed(4)})
          </p>
        )}
      </div>

      {/* Grille de résultats détaillés */}
      <div className="grid grid-cols-2 gap-4">
        {/* Risque */}
        <div className="p-4 rounded-lg bg-secondary/50">
          <p className="text-xs text-muted-foreground">{t('riskAmount')}</p>
          <p className="font-display text-xl font-bold text-foreground">
            {result.riskAmount !== null ? formatAmount(result.riskAmount, false, true) : '-'}
          </p>
        </div>

        {/* R:R Ratio */}
        {result.rrRatio !== null && (
          <div className="p-4 rounded-lg bg-secondary/50">
            <p className="text-xs text-muted-foreground">R:R Ratio</p>
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
          <p className="text-xs text-muted-foreground">{t('slPoints')}</p>
          <p className="font-display text-xl font-bold text-loss">
            {formatPips(result.slDistancePips)} pips
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {t('maxLoss')}: {result.maxLoss !== null ? formatAmount(result.maxLoss, false, true) : '-'}
          </p>
        </div>

        {/* Take Profit */}
        <div className="p-4 rounded-lg bg-profit/10 border border-profit/20">
          <p className="text-xs text-muted-foreground">{t('tpPoints')}</p>
          <p className="font-display text-xl font-bold text-profit">
            {result.tpDistancePips !== null ? `${formatPips(result.tpDistancePips)} pips` : '-'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {t('potentialGain')}: {result.potentialGain !== null ? formatAmount(result.potentialGain, false, true) : '-'}
          </p>
        </div>
      </div>

      {/* Visualisation SL/TP */}
      {result.tpDistancePips !== null && result.tpDistancePips > 0 && result.slDistancePips !== null && (
        <div className="mt-6 p-4 bg-secondary/30 rounded-lg">
          <p className="text-xs text-muted-foreground mb-3 text-center">
            {language === 'fr' ? 'Visualisation du trade' : 'Trade Visualization'}
          </p>
          <div className="relative h-8 rounded-full bg-gradient-to-r from-loss via-secondary to-profit overflow-hidden">
            <div 
              className="absolute top-0 bottom-0 w-1 bg-foreground"
              style={{ 
                left: `${(result.slDistancePips / (result.slDistancePips + result.tpDistancePips)) * 100}%` 
              }}
            />
            <div className="absolute top-0 left-0 bottom-0 flex items-center px-2 text-xs text-loss-foreground font-medium">
              SL
            </div>
            <div className="absolute top-0 right-0 bottom-0 flex items-center px-2 text-xs text-profit-foreground font-medium">
              TP
            </div>
          </div>
        </div>
      )}

      {/* Détails techniques */}
      {result.assetConfig && (
        <div className="mt-4 p-3 rounded-lg bg-muted/30 text-xs space-y-1">
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              {language === 'fr' ? 'Valeur pip (1 lot)' : 'Pip value (1 lot)'}:
            </span>
            <span className="font-mono">
              {result.pipValue?.toFixed(4)} {result.assetConfig.quoteCurrency}
            </span>
          </div>
          {result.conversionRate && result.conversionRate !== 1 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {language === 'fr' ? 'Taux conversion' : 'Conversion rate'}:
              </span>
              <span className="font-mono">{result.conversionRate.toFixed(6)}</span>
            </div>
          )}
          {result.pipValueConverted !== result.pipValue && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {language === 'fr' ? 'Valeur pip convertie' : 'Converted pip value'}:
              </span>
              <span className="font-mono">{result.pipValueConverted?.toFixed(4)}</span>
            </div>
          )}
        </div>
      )}

      {/* Warnings */}
      {result.warnings.length > 0 && (
        <div className="mt-4 p-4 rounded-lg border border-yellow-500/30 bg-yellow-500/10">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-medium text-yellow-500">
              {language === 'fr' ? 'Avertissements' : 'Warnings'}
            </span>
          </div>
          <ul className="space-y-1">
            {result.warnings.map((warning, index) => (
              <li key={index} className="text-sm text-muted-foreground">
                {warning}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Validation checkmark */}
      <div className="mt-4 flex items-center justify-center gap-2 text-sm text-profit">
        <CheckCircle className="w-4 h-4" />
        <span>{language === 'fr' ? 'Calcul vérifié' : 'Calculation verified'}</span>
      </div>
    </div>
  );
};

export default CalculationResults;
