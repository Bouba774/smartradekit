import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';

interface PipsModeInputsProps {
  pips: string;
  riskRatio: string;
  onPipsChange: (value: string) => void;
  onRiskRatioChange: (value: string) => void;
}

const RISK_RATIOS = ['1:1', '1:1.5', '1:2', '1:2.5', '1:3', '1:4', '1:5'];

const PipsModeInputs: React.FC<PipsModeInputsProps> = ({
  pips,
  riskRatio,
  onPipsChange,
  onRiskRatioChange,
}) => {
  const { t } = useLanguage();

  const handleNumericInput = (value: string, setter: (v: string) => void) => {
    const sanitized = value.replace(/[^0-9.,]/g, '').replace(',', '.');
    setter(sanitized);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          {t('numberOfPips')}
          <span className="text-xs text-primary">({t('required')})</span>
        </Label>
        <Input
          type="text"
          inputMode="decimal"
          placeholder="50"
          value={pips}
          onChange={(e) => handleNumericInput(e.target.value, onPipsChange)}
          className="border-primary/30 focus:border-primary text-lg font-medium"
        />
        <p className="text-xs text-muted-foreground">
          {t('pipsTooltip')}
        </p>
      </div>

      <div className="space-y-2">
        <Label>{t('riskRatioAuto')}</Label>
        <Select value={riskRatio} onValueChange={onRiskRatioChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {RISK_RATIOS.map((ratio) => (
              <SelectItem key={ratio} value={ratio}>
                R:R {ratio}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          {t('riskRatioAutoDesc')}
        </p>
      </div>

      {/* Visual indicator for the mode */}
      <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
        <p className="text-sm text-primary font-medium flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          {t('pipsModeFast')}
        </p>
      </div>
    </div>
  );
};

export default PipsModeInputs;
