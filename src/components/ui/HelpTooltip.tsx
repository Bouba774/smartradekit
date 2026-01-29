import React from 'react';
import { Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { type SupportedLanguage, type MultilingualTooltip } from '@/data/helpTooltips';

interface HelpTooltipProps {
  /** Static text string for simple tooltips */
  text?: string;
  /** Multilingual tooltip object for translated tooltips */
  tooltip?: MultilingualTooltip;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  className?: string;
  iconClassName?: string;
  size?: 'sm' | 'md' | 'lg';
}

const HelpTooltip: React.FC<HelpTooltipProps> = ({
  text,
  tooltip,
  side = 'top',
  align = 'center',
  className,
  iconClassName,
  size = 'sm',
}) => {
  const { language } = useLanguage();
  
  // Get the tooltip text based on language
  const getTooltipText = (): string => {
    if (text) return text;
    if (tooltip) {
      const lang = language as SupportedLanguage;
      return tooltip[lang] || tooltip.fr || '';
    }
    return '';
  };

  const tooltipText = getTooltipText();
  
  if (!tooltipText) return null;

  const sizeClasses = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            className={cn(
              "inline-flex items-center justify-center rounded-full",
              "text-muted-foreground hover:text-primary focus:text-primary",
              "transition-colors duration-200",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
              "touch-manipulation",
              className
            )}
            aria-label="Aide"
          >
            <Info className={cn(sizeClasses[size], iconClassName)} />
          </button>
        </TooltipTrigger>
        <TooltipContent
          side={side}
          align={align}
          className={cn(
            "max-w-[280px] text-sm leading-relaxed",
            "bg-popover text-popover-foreground",
            "border border-border shadow-lg",
            "z-[100]"
          )}
          sideOffset={5}
        >
          <p>{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default HelpTooltip;
