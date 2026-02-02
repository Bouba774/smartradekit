import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface PriceInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  tooltip?: string;
  variant?: 'default' | 'entry' | 'sl' | 'tp';
  required?: boolean;
  error?: string;
}

const PriceInput: React.FC<PriceInputProps> = ({
  label,
  value,
  onChange,
  placeholder = '0.00000',
  tooltip,
  variant = 'default',
  required = false,
  error,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    // Allow empty, numbers, and one decimal point
    if (newValue === '' || /^[0-9]*\.?[0-9]*$/.test(newValue)) {
      onChange(newValue);
    }
  };
  
  const variantStyles = {
    default: 'border-border/50',
    entry: 'border-primary/30 focus-within:border-primary',
    sl: 'border-red-500/30 focus-within:border-red-500',
    tp: 'border-emerald-500/30 focus-within:border-emerald-500',
  };
  
  const dotStyles = {
    default: 'bg-muted',
    entry: 'bg-primary',
    sl: 'bg-red-500',
    tp: 'bg-emerald-500',
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <div className={cn('w-2 h-2 rounded-full', dotStyles[variant])} />
        <Label className="text-sm font-medium">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </Label>
        {tooltip && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="w-3.5 h-3.5 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <Input
        type="text"
        inputMode="decimal"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className={cn(
          'h-11 font-mono transition-colors',
          variantStyles[variant],
          error && 'border-red-500'
        )}
      />
      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  );
};

export default PriceInput;
