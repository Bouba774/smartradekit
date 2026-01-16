import React from 'react';
import { cn } from '@/lib/utils';

interface GaugeChartProps {
  value: number;
  max?: number;
  label: string;
  displayValue?: string; // Optional custom display value
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'profit' | 'loss';
  className?: string;
}

// Utility: Clamp value between min and max
const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

// Utility: Round to 1 decimal
const roundToOneDecimal = (value: number): number => {
  return Math.round(value * 10) / 10;
};

const GaugeChart: React.FC<GaugeChartProps> = ({
  value,
  max = 100,
  label,
  displayValue,
  size = 'md',
  variant = 'primary',
  className,
}) => {
  // Clamp and round the percentage for visual display
  const safeValue = Number.isFinite(value) ? value : 0;
  const safeMax = Number.isFinite(max) && max > 0 ? max : 100;
  
  // Calculate percentage clamped between 0-100
  const rawPercentage = (safeValue / safeMax) * 100;
  const percentage = clamp(roundToOneDecimal(rawPercentage), 0, 100);
  
  // Rotation for needle: -90deg (0%) to +90deg (100%)
  const rotation = (percentage / 100) * 180 - 90;
  
  // Display value: use custom or calculated
  const displayText = displayValue !== undefined 
    ? displayValue 
    : roundToOneDecimal(safeValue).toString();
  
  const sizes = {
    sm: { container: 'w-24 h-12', text: 'text-lg' },
    md: { container: 'w-32 h-16', text: 'text-xl' },
    lg: { container: 'w-40 h-20', text: 'text-2xl' },
  };

  const colors = {
    primary: { stroke: 'stroke-primary', fill: 'text-primary', glow: 'shadow-neon' },
    profit: { stroke: 'stroke-profit', fill: 'text-profit', glow: 'shadow-profit' },
    loss: { stroke: 'stroke-loss', fill: 'text-loss', glow: 'shadow-loss' },
  };

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div className={cn("relative", sizes[size].container)}>
        <svg
          viewBox="0 0 100 50"
          className="w-full h-full overflow-visible"
        >
          {/* Background arc */}
          <path
            d="M 5 50 A 45 45 0 0 1 95 50"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-muted/30"
            strokeLinecap="round"
          />
          
          {/* Value arc - percentage clamped to valid range */}
          <path
            d="M 5 50 A 45 45 0 0 1 95 50"
            fill="none"
            strokeWidth="8"
            className={colors[variant].stroke}
            strokeLinecap="round"
            strokeDasharray={`${percentage * 1.41} 141`}
            style={{
              filter: variant === 'primary' 
                ? 'drop-shadow(0 0 8px hsl(var(--primary)))' 
                : variant === 'profit'
                ? 'drop-shadow(0 0 8px hsl(var(--profit)))'
                : 'drop-shadow(0 0 8px hsl(var(--loss)))'
            }}
          />
          
          {/* Needle */}
          <g transform={`rotate(${rotation}, 50, 50)`}>
            <line
              x1="50"
              y1="50"
              x2="50"
              y2="12"
              stroke="currentColor"
              strokeWidth="2"
              className={colors[variant].fill}
              strokeLinecap="round"
            />
            <circle
              cx="50"
              cy="50"
              r="4"
              className={cn("fill-current", colors[variant].fill)}
            />
          </g>
        </svg>
        
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
          <span className={cn(
            "font-display font-bold",
            sizes[size].text,
            colors[variant].fill
          )}>
            {displayText}
          </span>
        </div>
      </div>
      
      <p className="text-xs text-muted-foreground mt-2 font-medium uppercase tracking-wide">
        {label}
      </p>
    </div>
  );
};

export default GaugeChart;
