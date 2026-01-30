import React from 'react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { type SupportedLanguage, type MultilingualTooltip } from '@/data/helpTooltips';
import TooltipInfo from '@/components/ui/TooltipInfo';

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

  // Keep props (side/align) for compatibility, but TooltipInfo auto-positions.
  // preferredSide is mapped from the old API.
  return (
    <TooltipInfo
      preferredSide={side === 'top' || side === 'bottom' ? side : undefined}
      content={<span>{tooltipText}</span>}
      ariaLabel="Aide"
      size={size}
      className={cn(className)}
      iconClassName={cn(iconClassName)}
      withArrow
    />
  );
};

export default HelpTooltip;
