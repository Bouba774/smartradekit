import React from 'react';
import { Info } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface CalculatorInputsProps {
  capital: string;
  onCapitalChange: (value: string) => void;
  riskPercent: string;
  onRiskPercentChange: (value: string) => void;
  riskAmount: string;
  onRiskAmountChange: (value: string) => void;
  entryPrice: string;
  onEntryPriceChange: (value: string) => void;
  stopLoss: string;
  onStopLossChange: (value: string) => void;
  takeProfit: string;
  onTakeProfitChange: (value: string) => void;
  currencySymbol: string;
  language: string;
}

const CalculatorInputs: React.FC<CalculatorInputsProps> = ({
  capital,
  onCapitalChange,
  riskPercent,
  onRiskPercentChange,
  riskAmount,
  onRiskAmountChange,
  entryPrice,
  onEntryPriceChange,
  stopLoss,
  onStopLossChange,
  takeProfit,
  onTakeProfitChange,
  currencySymbol,
  language,
}) => {
  const isFr = language === 'fr';

  const handleNumericInput = (
    value: string,
    onChange: (value: string) => void
  ) => {
    if (value === '' || /^[0-9]*\.?[0-9]*$/.test(value)) {
      onChange(value);
    }
  };

  return (
    <div className="space-y-6">
      {/* Capital */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label className="text-base font-semibold text-foreground">
            Capital ({currencySymbol})
          </Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="w-4 h-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">
                  {isFr 
                    ? 'Votre capital de trading total'
                    : 'Your total trading capital'}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Input
          type="text"
          inputMode="decimal"
          value={capital}
          onChange={(e) => handleNumericInput(e.target.value, onCapitalChange)}
          placeholder="10000"
          className="h-14 text-lg font-medium bg-background/80 border-0 rounded-xl"
        />
      </div>

      {/* Risque */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label className="text-base font-semibold text-foreground">
            {isFr ? 'Risque' : 'Risk'}
          </Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="w-4 h-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">
                  {isFr 
                    ? 'Le pourcentage de votre capital que vous risquez sur ce trade'
                    : 'The percentage of your capital you risk on this trade'}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {/* Risk Percent */}
          <div className="relative">
            <Input
              type="text"
              inputMode="decimal"
              value={riskPercent}
              onChange={(e) => handleNumericInput(e.target.value, onRiskPercentChange)}
              placeholder="2"
              className="h-14 text-lg font-medium bg-background/80 border-0 rounded-xl pr-12"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-lg font-medium">
              %
            </span>
          </div>
          {/* Risk Amount */}
          <div className="relative">
            <Input
              type="text"
              inputMode="decimal"
              value={riskAmount}
              onChange={(e) => handleNumericInput(e.target.value, onRiskAmountChange)}
              placeholder="200.00"
              className="h-14 text-lg font-medium bg-background/80 border-0 rounded-xl pr-12"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-lg font-medium">
              {currencySymbol}
            </span>
          </div>
        </div>
      </div>

      {/* Prix d'Entrée */}
      <div className="space-y-2">
        <Label className="text-base font-semibold text-foreground">
          {isFr ? "Prix d'Entrée" : "Entry Price"}
        </Label>
        <Input
          type="text"
          inputMode="decimal"
          value={entryPrice}
          onChange={(e) => handleNumericInput(e.target.value, onEntryPriceChange)}
          placeholder="5504.54"
          className="h-14 text-lg font-medium bg-background/80 border-0 rounded-xl"
        />
      </div>

      {/* Stop Loss & Take Profit */}
      <div className="grid grid-cols-2 gap-3">
        {/* Stop Loss */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label className="text-base font-semibold text-foreground">
              Stop Loss
            </Label>
            <span className="text-sm text-destructive font-medium">
              ({isFr ? 'obligatoire' : 'required'})
            </span>
          </div>
          <Input
            type="text"
            inputMode="decimal"
            value={stopLoss}
            onChange={(e) => handleNumericInput(e.target.value, onStopLossChange)}
            placeholder="5587.07"
            className="h-14 text-lg font-medium bg-background/80 border-0 rounded-xl"
          />
        </div>
        {/* Take Profit */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label className="text-base font-semibold text-foreground">
              Take Profit
            </Label>
            <span className="text-sm text-muted-foreground">
              ({isFr ? 'optionnel' : 'optional'})
            </span>
          </div>
          <Input
            type="text"
            inputMode="decimal"
            value={takeProfit}
            onChange={(e) => handleNumericInput(e.target.value, onTakeProfitChange)}
            placeholder="5127.21"
            className="h-14 text-lg font-medium bg-background/80 border-0 rounded-xl"
          />
        </div>
      </div>
    </div>
  );
};

export default CalculatorInputs;
