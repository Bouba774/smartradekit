import React from 'react';
import { cn } from '@/lib/utils';

interface TradingVisualizationProps {
  entry: number;
  stopLoss: number;
  takeProfit?: number;
  direction: 'BUY' | 'SELL';
  priceDecimals: number;
}

const TradingVisualization: React.FC<TradingVisualizationProps> = ({
  entry,
  stopLoss,
  takeProfit,
  direction,
  priceDecimals,
}) => {
  // Calculate positions for visualization
  const prices = [entry, stopLoss];
  if (takeProfit) prices.push(takeProfit);
  
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const range = maxPrice - minPrice;
  const padding = range * 0.15;
  
  const visualMin = minPrice - padding;
  const visualMax = maxPrice + padding;
  const visualRange = visualMax - visualMin;
  
  const getPosition = (price: number) => {
    return ((price - visualMin) / visualRange) * 100;
  };
  
  const entryPos = getPosition(entry);
  const slPos = getPosition(stopLoss);
  const tpPos = takeProfit ? getPosition(takeProfit) : null;
  
  const formatPrice = (price: number) => price.toFixed(priceDecimals);
  
  return (
    <div className="relative h-48 w-full rounded-lg bg-secondary/30 overflow-hidden">
      {/* Background gradient zones */}
      {direction === 'BUY' ? (
        <>
          {/* Loss zone (below entry) */}
          <div 
            className="absolute left-0 right-0 bg-red-500/10"
            style={{ 
              bottom: 0, 
              height: `${entryPos}%` 
            }}
          />
          {/* Profit zone (above entry) */}
          {takeProfit && (
            <div 
              className="absolute left-0 right-0 bg-emerald-500/10"
              style={{ 
                bottom: `${entryPos}%`, 
                height: `${100 - entryPos}%` 
              }}
            />
          )}
        </>
      ) : (
        <>
          {/* Profit zone (below entry for SELL) */}
          {takeProfit && (
            <div 
              className="absolute left-0 right-0 bg-emerald-500/10"
              style={{ 
                bottom: 0, 
                height: `${entryPos}%` 
              }}
            />
          )}
          {/* Loss zone (above entry for SELL) */}
          <div 
            className="absolute left-0 right-0 bg-red-500/10"
            style={{ 
              bottom: `${entryPos}%`, 
              height: `${100 - entryPos}%` 
            }}
          />
        </>
      )}
      
      {/* Take Profit Line */}
      {takeProfit && tpPos !== null && (
        <div 
          className="absolute left-0 right-0 flex items-center"
          style={{ bottom: `${tpPos}%`, transform: 'translateY(50%)' }}
        >
          <div className="flex-1 h-0.5 bg-emerald-500 opacity-80" />
          <div className="absolute right-2 px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/50">
            <span className="text-xs font-mono text-emerald-500">
              TP: {formatPrice(takeProfit)}
            </span>
          </div>
        </div>
      )}
      
      {/* Entry Line */}
      <div 
        className="absolute left-0 right-0 flex items-center z-10"
        style={{ bottom: `${entryPos}%`, transform: 'translateY(50%)' }}
      >
        <div className="flex-1 h-0.5 bg-primary" />
        <div className="absolute left-2 px-2 py-0.5 rounded bg-primary/20 border border-primary/50">
          <span className="text-xs font-mono text-primary font-medium">
            Entry: {formatPrice(entry)}
          </span>
        </div>
      </div>
      
      {/* Stop Loss Line */}
      <div 
        className="absolute left-0 right-0 flex items-center"
        style={{ bottom: `${slPos}%`, transform: 'translateY(50%)' }}
      >
        <div className="flex-1 h-0.5 bg-red-500 opacity-80" />
        <div className="absolute right-2 px-2 py-0.5 rounded bg-red-500/20 border border-red-500/50">
          <span className="text-xs font-mono text-red-500">
            SL: {formatPrice(stopLoss)}
          </span>
        </div>
      </div>
      
      {/* Direction indicator */}
      <div className={cn(
        'absolute top-2 left-2 px-2 py-1 rounded text-xs font-bold',
        direction === 'BUY' 
          ? 'bg-emerald-500/20 text-emerald-500' 
          : 'bg-red-500/20 text-red-500'
      )}>
        {direction === 'BUY' ? '↑ BUY' : '↓ SELL'}
      </div>
    </div>
  );
};

export default TradingVisualization;
