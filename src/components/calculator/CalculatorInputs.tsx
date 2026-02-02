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
    // Allow empty, numbers, and one decimal point
    if (value === '' || /^[0-9]*\.?[0-9]*$/.test(value)) {
      onChange(value);
    }
  };

  return (
    <div className="space-y-5">
      {/* Capital */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5">
          <Label className="text-sm font-medium text-foreground">
            Capital ({currencySymbol})
          </Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="w-3.5 h-3.5 text-muted-foreground" />
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
          className="h-12 font-mono text-base bg-secondary/50"
        />
      </div>

      {/* Risque - Two columns */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5">
          <Label className="text-sm font-medium text-foreground">
            {isFr ? 'Risque' : 'Risk'}
          </Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="w-3.5 h-3.5 text-muted-foreground" />
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
              className="h-12 font-mono text-base bg-secondary/50 pr-10"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
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
              className="h-12 font-mono text-base bg-secondary/50 pr-10"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
              {currencySymbol}
            </span>
          </div>
        </div>
      </div>

      {/* Prix d'Entrée */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground">
          {isFr ? "Prix d'Entrée" : "Entry Price"}
        </Label>
        <Input
          type="text"
          inputMode="decimal"
          value={entryPrice}
          onChange={(e) => handleNumericInput(e.target.value, onEntryPriceChange)}
          placeholder="0.00000"
          className="h-12 font-mono text-base bg-secondary/50"
        />
      </div>

      {/* Stop Loss & Take Profit - Two columns */}
      <div className="grid grid-cols-2 gap-3">
        {/* Stop Loss */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <Label className="text-sm font-medium text-foreground">
              Stop Loss
            </Label>
            <span className="text-xs text-destructive">
              ({isFr ? 'obligatoire' : 'required'})
            </span>
          </div>
          <Input
            type="text"
            inputMode="decimal"
            value={stopLoss}
            onChange={(e) => handleNumericInput(e.target.value, onStopLossChange)}
            placeholder="0.00000"
            className="h-12 font-mono text-base bg-secondary/50"
          />
        </div>
        {/* Take Profit */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <Label className="text-sm font-medium text-foreground">
              Take Profit
            </Label>
            <span className="text-xs text-muted-foreground">
              ({isFr ? 'optionnel' : 'optional'})
            </span>
          </div>
          <Input
            type="text"
            inputMode="decimal"
            value={takeProfit}
            onChange={(e) => handleNumericInput(e.target.value, onTakeProfitChange)}
            placeholder="0.00000"
            className="h-12 font-mono text-base bg-secondary/50"
          />
        </div>
      </div>
    </div>
  );
};

export default CalculatorInputs;
