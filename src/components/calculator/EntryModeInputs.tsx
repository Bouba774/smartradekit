import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';

interface EntryModeInputsProps {
  entryPrice: string;
  stopLoss: string;
  takeProfit: string;
  onEntryPriceChange: (value: string) => void;
  onStopLossChange: (value: string) => void;
  onTakeProfitChange: (value: string) => void;
}

const EntryModeInputs: React.FC<EntryModeInputsProps> = ({
  entryPrice,
  stopLoss,
  takeProfit,
  onEntryPriceChange,
  onStopLossChange,
  onTakeProfitChange,
}) => {
  const { t } = useLanguage();

  const handleNumericInput = (value: string, setter: (v: string) => void) => {
    const sanitized = value.replace(/[^0-9.,]/g, '').replace(',', '.');
    setter(sanitized);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="space-y-2">
        <Label>{t('entryPrice')}</Label>
        <Input
          type="text"
          inputMode="decimal"
          placeholder="1.08500"
          value={entryPrice}
          onChange={(e) => handleNumericInput(e.target.value, onEntryPriceChange)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            {t('stopLoss')}
            <span className="text-xs text-loss">({t('required')})</span>
          </Label>
          <Input
            type="text"
            inputMode="decimal"
            placeholder="1.08000"
            value={stopLoss}
            onChange={(e) => handleNumericInput(e.target.value, onStopLossChange)}
            className="border-loss/30 focus:border-loss"
          />
        </div>
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            {t('takeProfit')}
            <span className="text-xs text-muted-foreground">({t('optional')})</span>
          </Label>
          <Input
            type="text"
            inputMode="decimal"
            placeholder="1.09500"
            value={takeProfit}
            onChange={(e) => handleNumericInput(e.target.value, onTakeProfitChange)}
            className="border-profit/30 focus:border-profit"
          />
        </div>
      </div>
    </div>
  );
};

export default EntryModeInputs;
