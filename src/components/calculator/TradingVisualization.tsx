import React from 'react';
import { cn } from '@/lib/utils';

interface TradingVisualizationProps {
  entry: number;
  stopLoss: number;
  takeProfit?: number;
  direction: 'BUY' | 'SELL';
  priceDecimals?: number;
}

const TradingVisualization: React.FC<TradingVisualizationProps> = ({
  entry,
  stopLoss,
  takeProfit,
  direction,
  priceDecimals = 5,
}) => {
  // Calculate positions (percentages for visual representation)
  const prices = [entry, stopLoss];
  if (takeProfit) prices.push(takeProfit);
  
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const range = maxPrice - minPrice;
  
  // Add padding to the range
  const padding = range * 0.15;
  const displayMin = minPrice - padding;
  const displayMax = maxPrice + padding;
  const displayRange = displayMax - displayMin;
  
  const getPosition = (price: number) => {
    return ((price - displayMin) / displayRange) * 100;
  };
  
  const entryPos = getPosition(entry);
  const slPos = getPosition(stopLoss);
  const tpPos = takeProfit ? getPosition(takeProfit) : null;
  
  // Determine zones
  const isBuy = direction === 'BUY';
  const profitZone = isBuy 
    ? { top: tpPos ? 100 - tpPos : 0, bottom: 100 - entryPos }
    : { top: 100 - entryPos, bottom: tpPos ? 100 - tpPos : 100 };
  const lossZone = isBuy
    ? { top: 100 - entryPos, bottom: 100 - slPos }
    : { top: 100 - slPos, bottom: 100 - entryPos };

  return (
    <div className="w-full h-48 relative bg-secondary/20 rounded-lg overflow-hidden">
      {/* Profit zone (green) */}
      {takeProfit && (
        <div 
          className="absolute left-0 right-0 bg-emerald-500/10"
          style={{ 
            top: `${Math.min(profitZone.top, profitZone.bottom)}%`,
            height: `${Math.abs(profitZone.bottom - profitZone.top)}%`
          }}
        />
      )}
      
      {/* Loss zone (red) */}
      <div 
        className="absolute left-0 right-0 bg-red-500/10"
        style={{ 
          top: `${Math.min(lossZone.top, lossZone.bottom)}%`,
          height: `${Math.abs(lossZone.bottom - lossZone.top)}%`
        }}
      />
      
      {/* Take Profit line */}
      {takeProfit && tpPos !== null && (
        <div 
          className="absolute left-0 right-0 flex items-center gap-2 px-3"
          style={{ top: `${100 - tpPos}%`, transform: 'translateY(-50%)' }}
        >
          <div className="flex-1 h-0.5 bg-emerald-500" style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 4px, currentColor 4px, currentColor 8px)' }} />
          <div className="text-xs font-medium text-emerald-500 bg-background/80 px-2 py-0.5 rounded">
            TP {takeProfit.toFixed(priceDecimals)}
          </div>
        </div>
      )}
      
      {/* Entry line */}
      <div 
        className="absolute left-0 right-0 flex items-center gap-2 px-3"
        style={{ top: `${100 - entryPos}%`, transform: 'translateY(-50%)' }}
      >
        <div className="flex-1 h-0.5 bg-primary" />
        <div className="text-xs font-bold text-primary bg-background/80 px-2 py-0.5 rounded flex items-center gap-1">
          <span className={cn(
            'text-[10px] px-1 rounded',
            isBuy ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
          )}>
            {direction}
          </span>
          Entry {entry.toFixed(priceDecimals)}
        </div>
      </div>
      
      {/* Stop Loss line */}
      <div 
        className="absolute left-0 right-0 flex items-center gap-2 px-3"
        style={{ top: `${100 - slPos}%`, transform: 'translateY(-50%)' }}
      >
        <div className="flex-1 h-0.5 bg-red-500" style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 4px, currentColor 4px, currentColor 8px)' }} />
        <div className="text-xs font-medium text-red-500 bg-background/80 px-2 py-0.5 rounded">
          SL {stopLoss.toFixed(priceDecimals)}
        </div>
      </div>
      
      {/* Direction arrow */}
      <div className="absolute top-2 left-2">
        <div className={cn(
          'flex items-center gap-1 px-2 py-1 rounded text-xs font-medium',
          isBuy ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/20 text-red-500'
        )}>
          {isBuy ? '↑' : '↓'} {direction}
        </div>
      </div>
    </div>
  );
};

export default TradingVisualization;
