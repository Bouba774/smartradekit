import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useInitialCapital } from '@/hooks/useInitialCapital';
import { useCurrency } from '@/hooks/useCurrency';
import { SUPPORTED_ACCOUNT_CURRENCIES } from '@/lib/calculator/calculationEngine';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Wallet, TrendingUp, PieChart, AlertCircle, X } from 'lucide-react';

interface InitialCapitalPromptProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCapitalSet?: () => void;
  onDismiss?: () => void;
}

const InitialCapitalPrompt: React.FC<InitialCapitalPromptProps> = ({
  open,
  onOpenChange,
  onCapitalSet,
  onDismiss,
}) => {
  const { language } = useLanguage();
  const { setCapital, capitalInfo } = useInitialCapital();
  const { currency: defaultCurrency } = useCurrency();
  
  const [amount, setAmount] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState(defaultCurrency || 'USD');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAmountChange = (value: string) => {
    // Only allow numbers and one decimal point
    const sanitized = value.replace(/[^0-9.,]/g, '').replace(',', '.');
    
    // Limit to 2 decimal places
    const parts = sanitized.split('.');
    if (parts.length > 2) return;
    if (parts[1] && parts[1].length > 2) return;
    
    setAmount(sanitized);
    setError('');
  };

  const handleSubmit = async () => {
    const numAmount = parseFloat(amount);
    
    if (!amount || isNaN(numAmount)) {
      setError(language === 'fr' ? 'Veuillez entrer un montant valide' : 'Please enter a valid amount');
      return;
    }
    
    if (numAmount <= 0) {
      setError(language === 'fr' ? 'Le capital doit être supérieur à 0' : 'Capital must be greater than 0');
      return;
    }

    setIsSubmitting(true);
    const success = await setCapital(numAmount, selectedCurrency);
    setIsSubmitting(false);

    if (success) {
      onOpenChange(false);
      onCapitalSet?.();
    }
  };

  const handleDismiss = () => {
    onOpenChange(false);
    onDismiss?.();
  };

  const getCurrencySymbol = (code: string) => {
    const curr = SUPPORTED_ACCOUNT_CURRENCIES.find(c => c.code === code);
    return curr?.symbol || code;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-xl bg-primary/20 border border-primary/30">
              <Wallet className="w-6 h-6 text-primary" />
            </div>
            <DialogTitle className="text-xl font-display">
              {language === 'fr' ? 'Définir votre capital' : 'Set Your Capital'}
            </DialogTitle>
          </div>
          <DialogDescription className="text-base leading-relaxed">
            {language === 'fr' 
              ? 'Pour des statistiques plus précises (courbe d\'équité, drawdown, performance), vous pouvez indiquer votre capital de trading actuel.'
              : 'For more accurate statistics (equity curve, drawdown, performance), you can enter your current trading capital.'}
          </DialogDescription>
        </DialogHeader>

        {/* Benefits */}
        <div className="space-y-2 py-4">
          <div className="text-sm text-muted-foreground mb-3">
            {language === 'fr' ? 'Avantages :' : 'Benefits:'}
          </div>
          <div className="flex items-center gap-3 text-sm">
            <TrendingUp className="w-4 h-4 text-profit shrink-0" />
            <span>{language === 'fr' ? 'Courbe d\'équité réaliste' : 'Realistic equity curve'}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <PieChart className="w-4 h-4 text-primary shrink-0" />
            <span>{language === 'fr' ? 'Drawdown et ROI précis' : 'Accurate drawdown and ROI'}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <AlertCircle className="w-4 h-4 text-yellow-500 shrink-0" />
            <span>{language === 'fr' ? 'Gestion du risque fiable' : 'Reliable risk management'}</span>
          </div>
        </div>

        {/* Input */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="capital">
              {language === 'fr' ? 'Capital initial' : 'Initial Capital'}
            </Label>
            <div className="flex gap-2">
              <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
                <SelectTrigger className="w-24 shrink-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {SUPPORTED_ACCOUNT_CURRENCIES.map((curr) => (
                    <SelectItem key={curr.code} value={curr.code}>
                      {curr.code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {getCurrencySymbol(selectedCurrency)}
                </span>
                <Input
                  id="capital"
                  type="text"
                  inputMode="decimal"
                  placeholder="10000"
                  value={amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            {error && (
              <p className="text-sm text-loss">{error}</p>
            )}
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2 mt-4">
          <Button
            variant="ghost"
            onClick={handleDismiss}
            className="text-muted-foreground"
          >
            <X className="w-4 h-4 mr-2" />
            {language === 'fr' ? 'Plus tard' : 'Later'}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !amount}
            className="bg-gradient-primary"
          >
            <Wallet className="w-4 h-4 mr-2" />
            {isSubmitting 
              ? (language === 'fr' ? 'Enregistrement...' : 'Saving...') 
              : (language === 'fr' ? 'Valider' : 'Confirm')}
          </Button>
        </DialogFooter>

        {/* Note */}
        <p className="text-xs text-muted-foreground text-center mt-2">
          {language === 'fr' 
            ? 'Vous pourrez modifier ce montant à tout moment dans les paramètres.'
            : 'You can change this amount anytime in settings.'}
        </p>
      </DialogContent>
    </Dialog>
  );
};

export default InitialCapitalPrompt;
