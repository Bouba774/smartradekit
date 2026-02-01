import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';
import { AssetConfig } from '@/lib/calculator/assetConfigs';
import { cn } from '@/lib/utils';

interface EntryModeInputsProps {
  entryPrice: string;
  stopLoss: string;
  takeProfit: string;
  onEntryPriceChange: (value: string) => void;
  onStopLossChange: (value: string) => void;
  onTakeProfitChange: (value: string) => void;
  assetConfig?: AssetConfig | null;
  errors?: {
    entryPrice?: string;
    stopLoss?: string;
    takeProfit?: string;
  };
}

const EntryModeInputs: React.FC<EntryModeInputsProps> = ({
  entryPrice,
  stopLoss,
  takeProfit,
  onEntryPriceChange,
  onStopLossChange,
  onTakeProfitChange,
  assetConfig,
  errors,
}) => {
  const { t, language } = useLanguage();

  // Génère le placeholder basé sur la config de l'actif
  const getPlaceholder = (type: 'entry' | 'sl' | 'tp'): string => {
    if (!assetConfig) {
      return type === 'entry' ? '1.08500' : type === 'sl' ? '1.08000' : '1.09500';
    }

    const decimals = assetConfig.priceDecimals;
    
    // Exemples adaptés au type d'actif
    const examples: Record<string, { entry: string; sl: string; tp: string }> = {
      'forex_non_jpy': { entry: '1.08500', sl: '1.08000', tp: '1.09500' },
      'forex_jpy': { entry: '150.500', sl: '150.000', tp: '151.500' },
      'metal_gold': { entry: '2350.00', sl: '2340.00', tp: '2380.00' },
      'metal_silver': { entry: '28.500', sl: '28.000', tp: '29.500' },
      'index_us': { entry: '44000', sl: '43800', tp: '44400' },
      'crypto_major': { entry: '85000.00', sl: '84000.00', tp: '88000.00' },
      'energy': { entry: '75.50', sl: '74.00', tp: '78.00' },
      'stock': { entry: '185.50', sl: '180.00', tp: '195.00' },
    };

    const typeKey = assetConfig.assetType.replace(/_/g, '_');
    const example = examples[typeKey] || examples['forex_non_jpy'];
    return example[type];
  };

  // Formatage et validation de l'input
  const handleNumericInput = (value: string, setter: (v: string) => void) => {
    // Accepter uniquement les chiffres, point et virgule
    const sanitized = value.replace(/[^0-9.,]/g, '').replace(',', '.');
    
    // Éviter plusieurs points
    const parts = sanitized.split('.');
    if (parts.length > 2) {
      return; // Ignorer si plus d'un point
    }
    
    setter(sanitized);
  };

  // Vérifier si le nombre de décimales est valide
  const getDecimalWarning = (value: string): string | null => {
    if (!assetConfig || !value) return null;
    
    const parts = value.split('.');
    if (parts.length !== 2) return null;
    
    const decimals = parts[1].length;
    if (decimals > assetConfig.priceDecimals) {
      return language === 'fr' 
        ? `Max ${assetConfig.priceDecimals} décimales pour cet actif`
        : `Max ${assetConfig.priceDecimals} decimals for this asset`;
    }
    return null;
  };

  const entryDecimalWarning = getDecimalWarning(entryPrice);
  const slDecimalWarning = getDecimalWarning(stopLoss);
  const tpDecimalWarning = getDecimalWarning(takeProfit);

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Prix d'entrée */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          {t('entryPrice')}
          {assetConfig && (
            <span className="text-xs text-muted-foreground">
              ({assetConfig.priceDecimals} {language === 'fr' ? 'décimales' : 'decimals'})
            </span>
          )}
        </Label>
        <Input
          type="text"
          inputMode="decimal"
          placeholder={getPlaceholder('entry')}
          value={entryPrice}
          onChange={(e) => handleNumericInput(e.target.value, onEntryPriceChange)}
          className={cn(
            errors?.entryPrice && "border-loss",
            entryDecimalWarning && "border-yellow-500"
          )}
        />
        {(errors?.entryPrice || entryDecimalWarning) && (
          <p className={cn(
            "text-xs",
            errors?.entryPrice ? "text-loss" : "text-yellow-500"
          )}>
            {errors?.entryPrice || entryDecimalWarning}
          </p>
        )}
      </div>

      {/* Stop Loss & Take Profit */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            {t('stopLoss')}
            <span className="text-xs text-loss">({t('required')})</span>
          </Label>
          <Input
            type="text"
            inputMode="decimal"
            placeholder={getPlaceholder('sl')}
            value={stopLoss}
            onChange={(e) => handleNumericInput(e.target.value, onStopLossChange)}
            className={cn(
              "border-loss/30 focus:border-loss",
              errors?.stopLoss && "border-loss",
              slDecimalWarning && "border-yellow-500"
            )}
          />
          {(errors?.stopLoss || slDecimalWarning) && (
            <p className={cn(
              "text-xs",
              errors?.stopLoss ? "text-loss" : "text-yellow-500"
            )}>
              {errors?.stopLoss || slDecimalWarning}
            </p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            {t('takeProfit')}
            <span className="text-xs text-muted-foreground">({t('optional')})</span>
          </Label>
          <Input
            type="text"
            inputMode="decimal"
            placeholder={getPlaceholder('tp')}
            value={takeProfit}
            onChange={(e) => handleNumericInput(e.target.value, onTakeProfitChange)}
            className={cn(
              "border-profit/30 focus:border-profit",
              errors?.takeProfit && "border-loss",
              tpDecimalWarning && "border-yellow-500"
            )}
          />
          {(errors?.takeProfit || tpDecimalWarning) && (
            <p className={cn(
              "text-xs",
              errors?.takeProfit ? "text-loss" : "text-yellow-500"
            )}>
              {errors?.takeProfit || tpDecimalWarning}
            </p>
          )}
        </div>
      </div>

    </div>
  );
};

export default EntryModeInputs;
