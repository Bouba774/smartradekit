import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';

interface EmailValidationResult {
  valid: boolean;
  status: 'accepted' | 'rejected' | 'pending_confirmation';
  message?: string;
}

interface UseEmailValidationReturn {
  validateEmail: (email: string, isAdminAttempt?: boolean) => Promise<EmailValidationResult>;
  isValidating: boolean;
  lastResult: EmailValidationResult | null;
  getErrorMessage: () => string | null;
}

export const useEmailValidation = (): UseEmailValidationReturn => {
  const { language } = useLanguage();
  const [isValidating, setIsValidating] = useState(false);
  const [lastResult, setLastResult] = useState<EmailValidationResult | null>(null);

  const getLocalizedMessage = useCallback((status: 'rejected' | 'pending_confirmation'): string => {
    if (status === 'rejected') {
      return language === 'fr'
        ? 'Veuillez utiliser une adresse email personnelle ou professionnelle valide. Les adresses email temporaires ne sont pas autorisées.'
        : 'Please use a valid personal or professional email address. Temporary email addresses are not allowed.';
    }
    
    return language === 'fr'
      ? 'Une confirmation supplémentaire sera requise pour cet email.'
      : 'Additional confirmation will be required for this email.';
  }, [language]);

  const validateEmail = useCallback(async (
    email: string,
    isAdminAttempt: boolean = false
  ): Promise<EmailValidationResult> => {
    setIsValidating(true);
    
    try {
      // Basic client-side validation first
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email) || email.length > 254) {
        const result: EmailValidationResult = {
          valid: false,
          status: 'rejected',
          message: language === 'fr' ? 'Format d\'email invalide' : 'Invalid email format',
        };
        setLastResult(result);
        return result;
      }

      // Call backend validation
      const { data, error } = await supabase.functions.invoke('validate-email', {
        body: {
          email,
          isAdminAttempt,
          userAgent: navigator.userAgent,
        },
      });

      if (error) {
        console.error('Email validation error:', error);
        // On error, allow the email (don't block legitimate users)
        const result: EmailValidationResult = {
          valid: true,
          status: 'accepted',
        };
        setLastResult(result);
        return result;
      }

      const result: EmailValidationResult = {
        valid: data.valid,
        status: data.status,
        message: data.valid ? undefined : getLocalizedMessage(data.status),
      };

      setLastResult(result);
      return result;
    } catch (err) {
      console.error('Email validation failed:', err);
      // On error, allow the email (don't block legitimate users)
      const result: EmailValidationResult = {
        valid: true,
        status: 'accepted',
      };
      setLastResult(result);
      return result;
    } finally {
      setIsValidating(false);
    }
  }, [language, getLocalizedMessage]);

  const getErrorMessage = useCallback((): string | null => {
    if (!lastResult || lastResult.valid) return null;
    return lastResult.message || getLocalizedMessage('rejected');
  }, [lastResult, getLocalizedMessage]);

  return {
    validateEmail,
    isValidating,
    lastResult,
    getErrorMessage,
  };
};
