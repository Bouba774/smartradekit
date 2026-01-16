import React from 'react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';

export type CalculatorMode = 'entry' | 'pips';

interface CalculatorModeToggleProps {
  mode: CalculatorMode;
  onModeChange: (mode: CalculatorMode) => void;
}

const CalculatorModeToggle: React.FC<CalculatorModeToggleProps> = ({ mode, onModeChange }) => {
  const { t } = useLanguage();

  return (
    <div className="flex items-center justify-center gap-3">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="relative flex items-center bg-secondary/50 rounded-full p-1 border border-border">
              {/* Sliding background indicator */}
              <div
                className={cn(
                  "absolute top-1 bottom-1 rounded-full bg-gradient-primary transition-all duration-300 ease-in-out shadow-neon",
                  mode === 'pips' ? "left-1 w-[calc(50%-4px)]" : "left-[50%] w-[calc(50%-4px)]"
                )}
              />
              
              {/* Pips Mode Button */}
              <button
                type="button"
                onClick={() => onModeChange('pips')}
                className={cn(
                  "relative z-10 px-4 py-2 rounded-full text-sm font-medium transition-colors duration-300 min-w-[100px]",
                  mode === 'pips' 
                    ? "text-primary-foreground" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {t('modePips')}
              </button>
              
              {/* Entry Mode Button */}
              <button
                type="button"
                onClick={() => onModeChange('entry')}
                className={cn(
                  "relative z-10 px-4 py-2 rounded-full text-sm font-medium transition-colors duration-300 min-w-[100px]",
                  mode === 'entry' 
                    ? "text-primary-foreground" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {t('modeEntry')}
              </button>
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-xs text-center">
            <p className="text-sm">
              <strong>{t('modeEntry')}</strong>: {t('modeEntryDesc')}<br/>
              <strong>{t('modePips')}</strong>: {t('modePipsDesc')}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center cursor-help">
              <Info className="w-4 h-4 text-muted-foreground" />
            </div>
          </TooltipTrigger>
          <TooltipContent side="right" className="max-w-xs">
            <p className="text-sm">
              <strong>{t('modeEntry')}</strong>: {t('modeEntryDesc')}<br/><br/>
              <strong>{t('modePips')}</strong>: {t('modePipsDesc')}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default CalculatorModeToggle;
