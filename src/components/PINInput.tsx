import React, { useState, useCallback, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Delete, Fingerprint } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface PINInputProps {
  length?: number;
  onComplete: (pin: string) => void;
  onBiometric?: () => void;
  showBiometric?: boolean;
  disabled?: boolean;
  error?: boolean;
  className?: string;
}

export const PINInput: React.FC<PINInputProps> = ({
  length = 4,
  onComplete,
  onBiometric,
  showBiometric = false,
  disabled = false,
  error = false,
  className,
}) => {
  const { language } = useLanguage();
  const [pin, setPin] = useState('');
  const [shake, setShake] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Trigger shake animation on error with enhanced vibration
  useEffect(() => {
    if (error) {
      setShake(true);
      setPin('');
      
      // Enhanced haptic feedback pattern
      if ('vibrate' in navigator) {
        navigator.vibrate([50, 30, 50, 30, 100]);
      }
      
      const timer = setTimeout(() => setShake(false), 600);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Auto-submit when PIN is complete
  useEffect(() => {
    if (pin.length === length) {
      // Small delay for visual feedback
      const timer = setTimeout(() => {
        onComplete(pin);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [pin, length, onComplete]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (disabled) return;
      
      if (e.key >= '0' && e.key <= '9') {
        handleDigit(e.key);
      } else if (e.key === 'Backspace') {
        handleDelete();
      } else if (e.key === 'Escape') {
        handleClear();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [disabled, pin]);

  const handleDigit = useCallback((digit: string) => {
    if (disabled || pin.length >= length) return;
    
    // Haptic feedback on digit press
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
    
    setPin((prev) => prev + digit);
  }, [disabled, pin.length, length]);

  const handleDelete = useCallback(() => {
    if (disabled) return;
    setPin((prev) => prev.slice(0, -1));
  }, [disabled]);

  const handleClear = useCallback(() => {
    if (disabled) return;
    setPin('');
  }, [disabled]);

  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

  return (
    <div ref={containerRef} className={cn('flex flex-col items-center gap-8', className)}>
      {/* PIN Dots */}
      <div 
        className={cn(
          'flex gap-4 transition-transform',
          shake && 'animate-shake'
        )}
        style={{
          animation: shake ? 'shake 0.6s cubic-bezier(.36,.07,.19,.97) both' : undefined,
        }}
      >
        {Array.from({ length }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'w-4 h-4 rounded-full border-2 transition-all duration-200',
              i < pin.length
                ? 'bg-primary border-primary scale-125 shadow-lg shadow-primary/30'
                : 'bg-transparent border-muted-foreground/40',
              error && i < pin.length && 'border-destructive bg-destructive animate-pulse'
            )}
          />
        ))}
      </div>

      {/* Numeric Keypad */}
      <div className="grid grid-cols-3 gap-4">
        {digits.map((digit) => (
          <button
            key={digit}
            type="button"
            onClick={() => handleDigit(digit)}
            disabled={disabled}
            className={cn(
              'w-16 h-16 rounded-full text-2xl font-medium',
              'bg-secondary/50 hover:bg-secondary active:bg-primary active:text-primary-foreground',
              'transition-all duration-150 active:scale-90',
              'flex items-center justify-center',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'focus:outline-none focus:ring-2 focus:ring-primary/50',
              'touch-manipulation' // Improve touch response
            )}
          >
            {digit}
          </button>
        ))}

        {/* Bottom row: Biometric / 0 / Delete */}
        <button
          type="button"
          onClick={onBiometric}
          disabled={disabled || !showBiometric}
          className={cn(
            'w-16 h-16 rounded-full',
            'flex items-center justify-center',
            'transition-all duration-150 active:scale-90',
            'touch-manipulation',
            showBiometric
              ? 'bg-secondary/50 hover:bg-secondary active:bg-primary active:text-primary-foreground focus:outline-none focus:ring-2 focus:ring-primary/50'
              : 'opacity-0 cursor-default pointer-events-none'
          )}
        >
          {showBiometric && <Fingerprint className="w-6 h-6" />}
        </button>

        <button
          type="button"
          onClick={() => handleDigit('0')}
          disabled={disabled}
          className={cn(
            'w-16 h-16 rounded-full text-2xl font-medium',
            'bg-secondary/50 hover:bg-secondary active:bg-primary active:text-primary-foreground',
            'transition-all duration-150 active:scale-90',
            'flex items-center justify-center',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'focus:outline-none focus:ring-2 focus:ring-primary/50',
            'touch-manipulation'
          )}
        >
          0
        </button>

        <button
          type="button"
          onClick={handleDelete}
          disabled={disabled || pin.length === 0}
          className={cn(
            'w-16 h-16 rounded-full',
            'bg-secondary/50 hover:bg-secondary active:bg-destructive active:text-destructive-foreground',
            'transition-all duration-150 active:scale-90',
            'flex items-center justify-center',
            'disabled:opacity-30 disabled:cursor-not-allowed',
            'focus:outline-none focus:ring-2 focus:ring-primary/50',
            'touch-manipulation'
          )}
        >
          <Delete className="w-6 h-6" />
        </button>
      </div>

      {/* Shake animation keyframes */}
      <style>{`
        @keyframes shake {
          10%, 90% { transform: translateX(-1px); }
          20%, 80% { transform: translateX(2px); }
          30%, 50%, 70% { transform: translateX(-4px); }
          40%, 60% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.6s cubic-bezier(.36,.07,.19,.97) both;
        }
      `}</style>
    </div>
  );
};

export default PINInput;
