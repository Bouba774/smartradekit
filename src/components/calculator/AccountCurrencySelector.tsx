import React from 'react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SUPPORTED_ACCOUNT_CURRENCIES } from '@/lib/calculator/calculationEngine';
import { useLanguage } from '@/contexts/LanguageContext';

interface AccountCurrencySelectorProps {
  value: string;
  onChange: (currency: string) => void;
  disabled?: boolean;
}

const AccountCurrencySelector: React.FC<AccountCurrencySelectorProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const { language } = useLanguage();

  return (
    <div className="space-y-2">
      <Label>
        {language === 'fr' ? 'Devise du compte' : 'Account Currency'}
      </Label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={language === 'fr' ? 'Sélectionner...' : 'Select...'} />
        </SelectTrigger>
        <SelectContent className="bg-popover border-border">
          {SUPPORTED_ACCOUNT_CURRENCIES.map((currency) => (
            <SelectItem key={currency.code} value={currency.code}>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm w-12">{currency.code}</span>
                <span className="text-muted-foreground">{currency.symbol}</span>
                <span className="text-xs text-muted-foreground hidden sm:inline">
                  - {currency.name}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default AccountCurrencySelector;
