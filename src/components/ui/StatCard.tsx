import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import HelpTooltip from '@/components/ui/HelpTooltip';
import { MultilingualTooltip } from '@/data/helpTooltips';

interface StatCardProps {
  title: string;
  value: React.ReactNode;
  icon?: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  variant?: 'default' | 'profit' | 'loss' | 'neutral';
  className?: string;
  delay?: number;
  tooltip?: string | MultilingualTooltip;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  variant = 'default',
  className,
  delay = 0,
  tooltip,
}) => {
  const variantStyles = {
    default: '',
    profit: '',
    loss: '',
    neutral: '',
  };

  const valueStyles = {
    default: 'text-foreground',
    profit: 'profit-text',
    loss: 'loss-text',
    neutral: 'text-muted-foreground',
  };

  return (
    <div
      className={cn(
        "stat-card animate-fade-in",
        variantStyles[variant],
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
            {title}
          </p>
          {tooltip && (
            typeof tooltip === 'string' 
              ? <HelpTooltip text={tooltip} size="sm" />
              : <HelpTooltip tooltip={tooltip} size="sm" />
          )}
        </div>
      </div>
      
      <div className="flex items-end justify-between">
        <p className={cn(
          "text-2xl font-display font-bold",
          valueStyles[variant]
        )}>
          {value}
        </p>
        
        {trend && trendValue && (
          <span className={cn(
            "text-xs font-medium px-2 py-1 rounded-full",
            trend === 'up' && 'bg-profit/20 text-profit',
            trend === 'down' && 'bg-loss/20 text-loss',
            trend === 'neutral' && 'bg-muted text-muted-foreground'
          )}>
            {trend === 'up' && '↑'} {trend === 'down' && '↓'} {trendValue}
          </span>
        )}
      </div>
    </div>
  );
};

export default StatCard;
