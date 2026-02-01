import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface CapitalInfo {
  capital: number | null;
  currency: string;
  capitalDefined: boolean;
  capitalLastUpdated: string | null;
}

export interface UseInitialCapitalReturn {
  capitalInfo: CapitalInfo;
  isLoading: boolean;
  showPrompt: boolean;
  setCapital: (amount: number, currency?: string) => Promise<boolean>;
  dismissPrompt: () => void;
  resetPromptDismissal: () => void;
}

const PROMPT_DISMISSED_KEY = 'capital-prompt-dismissed';

export const useInitialCapital = (): UseInitialCapitalReturn => {
  const { user } = useAuth();
  const [capitalInfo, setCapitalInfo] = useState<CapitalInfo>({
    capital: null,
    currency: 'USD',
    capitalDefined: false,
    capitalLastUpdated: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showPrompt, setShowPrompt] = useState(false);
  const [promptDismissed, setPromptDismissed] = useState(false);

  // Check if prompt was dismissed in this session
  useEffect(() => {
    const dismissed = sessionStorage.getItem(PROMPT_DISMISSED_KEY);
    setPromptDismissed(dismissed === 'true');
  }, []);

  // Load capital info from database
  useEffect(() => {
    const loadCapitalInfo = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_settings')
          .select('default_capital, capital_currency, capital_defined, capital_last_updated')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error loading capital info:', error);
        }

        if (data) {
          const info: CapitalInfo = {
            capital: data.default_capital ?? null,
            currency: data.capital_currency ?? 'USD',
            capitalDefined: data.capital_defined ?? false,
            capitalLastUpdated: data.capital_last_updated ?? null,
          };
          setCapitalInfo(info);

          // Show prompt if capital not defined and not dismissed
          if (!info.capitalDefined && !promptDismissed) {
            setShowPrompt(true);
          }
        } else {
          // No settings yet, show prompt
          if (!promptDismissed) {
            setShowPrompt(true);
          }
        }
      } catch (e) {
        console.error('Error loading capital info:', e);
      } finally {
        setIsLoading(false);
      }
    };

    loadCapitalInfo();
  }, [user, promptDismissed]);

  // Set capital
  const setCapital = useCallback(async (amount: number, currency?: string): Promise<boolean> => {
    if (!user) return false;

    // Validation
    if (amount <= 0) {
      toast.error('Le capital doit être supérieur à 0');
      return false;
    }

    // Round to 2 decimals
    const roundedAmount = Math.round(amount * 100) / 100;
    const finalCurrency = currency || capitalInfo.currency;

    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          default_capital: roundedAmount,
          capital_currency: finalCurrency,
          capital_defined: true,
          capital_last_updated: new Date().toISOString(),
        }, { onConflict: 'user_id' });

      if (error) {
        console.error('Error saving capital:', error);
        toast.error('Erreur lors de la sauvegarde du capital');
        return false;
      }

      setCapitalInfo({
        capital: roundedAmount,
        currency: finalCurrency,
        capitalDefined: true,
        capitalLastUpdated: new Date().toISOString(),
      });
      setShowPrompt(false);
      toast.success('Capital initial enregistré avec succès');
      return true;
    } catch (e) {
      console.error('Error setting capital:', e);
      toast.error('Erreur lors de la sauvegarde');
      return false;
    }
  }, [user, capitalInfo.currency]);

  // Dismiss prompt (temporarily for this session)
  const dismissPrompt = useCallback(() => {
    sessionStorage.setItem(PROMPT_DISMISSED_KEY, 'true');
    setPromptDismissed(true);
    setShowPrompt(false);
  }, []);

  // Reset dismissal (for testing or if user wants to see it again)
  const resetPromptDismissal = useCallback(() => {
    sessionStorage.removeItem(PROMPT_DISMISSED_KEY);
    setPromptDismissed(false);
    if (!capitalInfo.capitalDefined) {
      setShowPrompt(true);
    }
  }, [capitalInfo.capitalDefined]);

  return {
    capitalInfo,
    isLoading,
    showPrompt,
    setCapital,
    dismissPrompt,
    resetPromptDismissal,
  };
};

export default useInitialCapital;
