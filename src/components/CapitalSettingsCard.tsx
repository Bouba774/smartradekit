import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useInitialCapital } from '@/hooks/useInitialCapital';
import { SUPPORTED_ACCOUNT_CURRENCIES } from '@/data/currencies';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Wallet, Check, AlertCircle, TrendingUp, PieChart } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';

const CapitalSettingsCard: React.FC = () => {
  const { language } = useLanguage();
  const { capitalInfo, setCapital, isLoading } = useInitialCapital();
  
  const [editMode, setEditMode] = useState(false);
  const [amount, setAmount] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState(capitalInfo.currency);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Sync state when capitalInfo changes
  useEffect(() => {
    if (capitalInfo.capital) {
      setAmount(capitalInfo.capital.toString());
    }
    setSelectedCurrency(capitalInfo.currency);
  }, [capitalInfo]);

  const handleAmountChange = (value: string) => {
    const sanitized = value.replace(/[^0-9.,]/g, '').replace(',', '.');
    const parts = sanitized.split('.');
    if (parts.length > 2) return;
    if (parts[1] && parts[1].length > 2) return;
    setAmount(sanitized);
    setError('');
  };

  const handleSave = async () => {
    const numAmount = parseFloat(amount);
    
    if (!amount || isNaN(numAmount)) {
      setError(language === 'fr' ? 'Veuillez entrer un montant valide' : 'Please enter a valid amount');
      return;
    }
    
    if (numAmount <= 0) {
      setError(language === 'fr' ? 'Le capital doit être supérieur à 0' : 'Capital must be greater than 0');
      return;
    }

    setIsSaving(true);
    const success = await setCapital(numAmount, selectedCurrency);
    setIsSaving(false);

    if (success) {
      setEditMode(false);
      toast.success(language === 'fr' ? 'Capital mis à jour' : 'Capital updated');
    }
  };

  const handleCancel = () => {
    setAmount(capitalInfo.capital?.toString() || '');
    setSelectedCurrency(capitalInfo.currency);
    setError('');
    setEditMode(false);
  };

  const getCurrencySymbol = (code: string) => {
    const curr = SUPPORTED_ACCOUNT_CURRENCIES.find(c => c.code === code);
    return curr?.symbol || code;
  };

  const formatLastUpdated = () => {
    if (!capitalInfo.capitalLastUpdated) return null;
    try {
      const date = new Date(capitalInfo.capitalLastUpdated);
      return format(date, "d MMMM yyyy 'à' HH:mm", { locale: language === 'fr' ? fr : undefined });
    } catch {
      return null;
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-3">
        <div className="h-4 bg-muted rounded w-1/3"></div>
        <div className="h-10 bg-muted rounded"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Current Status */}
      {capitalInfo.capitalDefined && !editMode ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-profit/10 border border-profit/20">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-profit/20">
                <Check className="w-4 h-4 text-profit" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {language === 'fr' ? 'Capital défini' : 'Capital defined'}
                </p>
                <p className="text-2xl font-bold text-profit">
                  {getCurrencySymbol(capitalInfo.currency)}{capitalInfo.capital?.toLocaleString()}
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setEditMode(true)}
            >
              {language === 'fr' ? 'Modifier' : 'Edit'}
            </Button>
          </div>
          
          {/* Last updated */}
          {formatLastUpdated() && (
            <p className="text-xs text-muted-foreground">
              {language === 'fr' ? 'Dernière modification : ' : 'Last updated: '}
              {formatLastUpdated()}
            </p>
          )}

          {/* Benefits reminder */}
          <div className="text-xs text-muted-foreground space-y-1">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-3 h-3 text-profit" />
              <span>{language === 'fr' ? 'Courbe d\'équité précise' : 'Accurate equity curve'}</span>
            </div>
            <div className="flex items-center gap-2">
              <PieChart className="w-3 h-3 text-primary" />
              <span>{language === 'fr' ? 'Drawdown et ROI fiables' : 'Reliable drawdown and ROI'}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Not defined warning */}
          {!capitalInfo.capitalDefined && !editMode && (
            <div className="flex items-start gap-3 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <AlertCircle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">
                  {language === 'fr' ? 'Capital non défini' : 'Capital not defined'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {language === 'fr' 
                    ? 'Certaines statistiques comme le drawdown et le ROI ne seront pas disponibles.' 
                    : 'Some statistics like drawdown and ROI will not be available.'}
                </p>
                <Button 
                  size="sm" 
                  className="mt-3"
                  onClick={() => setEditMode(true)}
                >
                  <Wallet className="w-4 h-4 mr-2" />
                  {language === 'fr' ? 'Définir maintenant' : 'Set now'}
                </Button>
              </div>
            </div>
          )}

          {/* Edit Form */}
          {editMode && (
            <div className="space-y-4 p-4 rounded-lg border border-border bg-secondary/30">
              <div className="space-y-2">
                <Label>
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
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  className="flex-1"
                >
                  {language === 'fr' ? 'Annuler' : 'Cancel'}
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isSaving || !amount}
                  className="flex-1"
                >
                  {isSaving 
                    ? (language === 'fr' ? 'Enregistrement...' : 'Saving...') 
                    : (language === 'fr' ? 'Enregistrer' : 'Save')}
                </Button>
              </div>
              
              <p className="text-xs text-muted-foreground">
                {language === 'fr' 
                  ? 'Ce montant sera utilisé comme base pour calculer votre courbe d\'équité et vos statistiques de performance.' 
                  : 'This amount will be used as the base for calculating your equity curve and performance statistics.'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CapitalSettingsCard;
