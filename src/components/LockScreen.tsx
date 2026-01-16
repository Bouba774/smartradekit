import React, { useState, useCallback, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Lock, Fingerprint, AlertTriangle, Timer } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { PINInput } from '@/components/PINInput';
import appLogo from '@/assets/app-logo.jpg';

interface LockScreenProps {
  onUnlock: (pin: string) => Promise<boolean>;
  onBiometricUnlock?: () => Promise<boolean>;
  onForgotPin?: () => void;
  failedAttempts: number;
  maxAttempts: number;
  showBiometric: boolean;
  pinLength?: number;
  isVerifying?: boolean;
  // Brute force protection
  cooldownEndTime?: number | null;
  onCooldownEnd?: () => void;
}

export const LockScreen: React.FC<LockScreenProps> = ({
  onUnlock,
  onBiometricUnlock,
  onForgotPin,
  failedAttempts,
  maxAttempts,
  showBiometric,
  pinLength = 4,
  isVerifying = false,
  cooldownEndTime,
  onCooldownEnd,
}) => {
  const { language } = useLanguage();
  const [error, setError] = useState(false);
  const [pinValue, setPinValue] = useState('');
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const biometricTriggeredRef = useRef(false);
  const attemptsLeft = maxAttempts - failedAttempts;

  // Calculate cooldown remaining
  useEffect(() => {
    if (!cooldownEndTime) {
      setIsBlocked(false);
      setCooldownRemaining(0);
      return;
    }

    const updateCooldown = () => {
      const remaining = Math.max(0, cooldownEndTime - Date.now());
      setCooldownRemaining(Math.ceil(remaining / 1000));
      setIsBlocked(remaining > 0);

      if (remaining <= 0 && onCooldownEnd) {
        onCooldownEnd();
      }
    };

    updateCooldown();
    const interval = setInterval(updateCooldown, 1000);
    return () => clearInterval(interval);
  }, [cooldownEndTime, onCooldownEnd]);

  // Reset error state after a delay
  useEffect(() => {
    if (error) {
      // Trigger haptic feedback (vibration)
      if ('vibrate' in navigator) {
        navigator.vibrate([100, 50, 100]);
      }
      const timer = setTimeout(() => setError(false), 500);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Watch for failed attempts changes to trigger error
  useEffect(() => {
    if (failedAttempts > 0) {
      setError(true);
    }
  }, [failedAttempts]);

  // Auto-trigger biometric on mount
  useEffect(() => {
    if (showBiometric && onBiometricUnlock && !biometricTriggeredRef.current && !isBlocked) {
      biometricTriggeredRef.current = true;
      // Small delay to let the UI render first
      const timer = setTimeout(() => {
        handleBiometric();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [showBiometric, onBiometricUnlock, isBlocked]);

  const handlePinComplete = useCallback(async (pin: string) => {
    if (isBlocked) return;
    
    setPinValue(pin);
    const success = await onUnlock(pin);
    if (!success) {
      setError(true);
    }
  }, [onUnlock, isBlocked]);

  const handleBiometric = useCallback(async () => {
    if (isBlocked) return;
    
    if (onBiometricUnlock) {
      try {
        const success = await onBiometricUnlock();
        if (!success) {
          setError(true);
        }
      } catch {
        // Biometric failed or was cancelled
        console.log('Biometric authentication cancelled or failed');
      }
    }
  }, [onBiometricUnlock, isBlocked]);

  // Format cooldown time
  const formatCooldown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    return `${secs}s`;
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-background flex flex-col items-center justify-center p-6 select-none">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center gap-8 max-w-sm w-full">
        {/* App Logo */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-lg">
            <img
              src={appLogo}
              alt="Smart Trade Tracker"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-display font-semibold text-foreground">
              Smart Trade Tracker
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {isBlocked 
                ? (language === 'fr' ? 'Verrouillé temporairement' : 'Temporarily locked')
                : (language === 'fr' ? 'Entrez votre code PIN' : 'Enter your PIN code')}
            </p>
          </div>
        </div>

        {/* Cooldown Timer */}
        {isBlocked && (
          <div className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-destructive/10 border border-destructive/20 animate-pulse">
            <Timer className="w-8 h-8 text-destructive" />
            <div className="text-center">
              <p className="text-lg font-semibold text-destructive">
                {formatCooldown(cooldownRemaining)}
              </p>
              <p className="text-sm text-destructive/80">
                {language === 'fr' 
                  ? 'Trop de tentatives. Réessayez bientôt.'
                  : 'Too many attempts. Try again soon.'}
              </p>
            </div>
          </div>
        )}

        {/* PIN Input */}
        {!isBlocked && (
          <PINInput
            length={pinLength}
            onComplete={handlePinComplete}
            onBiometric={showBiometric ? handleBiometric : undefined}
            showBiometric={showBiometric}
            disabled={isVerifying || isBlocked}
            error={error}
          />
        )}

        {/* Failed attempts warning */}
        {!isBlocked && failedAttempts > 0 && attemptsLeft > 0 && (
          <div className={cn(
            "flex items-center gap-2 text-sm animate-fade-in px-4 py-2 rounded-lg",
            attemptsLeft <= 2 ? "text-destructive bg-destructive/10" : "text-amber-500 bg-amber-500/10"
          )}>
            <AlertTriangle className="w-4 h-4" />
            <span>
              {language === 'fr'
                ? `${attemptsLeft} tentative${attemptsLeft > 1 ? 's' : ''} restante${attemptsLeft > 1 ? 's' : ''}`
                : `${attemptsLeft} attempt${attemptsLeft > 1 ? 's' : ''} remaining`}
            </span>
          </div>
        )}

        {/* Forgot PIN */}
        {onForgotPin && !isBlocked && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onForgotPin}
            className="text-muted-foreground hover:text-foreground"
          >
            {language === 'fr' ? 'Code PIN oublié ?' : 'Forgot PIN?'}
          </Button>
        )}
      </div>

      {/* Loading overlay */}
      {isVerifying && (
        <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      )}
    </div>
  );
};

export default LockScreen;
