import { useMemo } from 'react';
import { Trade } from './useTrades';
import { parseISO, differenceInDays, differenceInHours } from 'date-fns';

export interface DrawdownPeriod {
  startDate: string;
  endDate: string | null;
  depth: number;
  depthPercent: number;
  durationDays: number;
  recovered: boolean;
  recoveryDays: number | null;
}

export interface DrawdownAnalysis {
  currentDrawdown: number;
  currentDrawdownPercent: number;
  maxDrawdown: number;
  maxDrawdownPercent: number;
  avgDrawdownDuration: number; // in days
  avgRecoveryTime: number; // in days
  longestDrawdown: number; // in days
  drawdownPeriods: DrawdownPeriod[];
  isInDrawdown: boolean;
  peakEquity: number;
  currentEquity: number;
}

export const useDrawdownAnalysis = (trades: Trade[], startingCapital: number = 10000): DrawdownAnalysis => {
  return useMemo(() => {
    const defaultAnalysis: DrawdownAnalysis = {
      currentDrawdown: 0,
      currentDrawdownPercent: 0,
      maxDrawdown: 0,
      maxDrawdownPercent: 0,
      avgDrawdownDuration: 0,
      avgRecoveryTime: 0,
      longestDrawdown: 0,
      drawdownPeriods: [],
      isInDrawdown: false,
      peakEquity: startingCapital,
      currentEquity: startingCapital,
    };

    if (!trades || trades.length === 0) return defaultAnalysis;

    // Sort trades by date
    const sortedTrades = [...trades]
      .filter(t => t.profit_loss !== null)
      .sort((a, b) => parseISO(a.trade_date).getTime() - parseISO(b.trade_date).getTime());

    if (sortedTrades.length === 0) return defaultAnalysis;

    // Calculate equity curve and drawdown periods
    let equity = startingCapital;
    let peakEquity = startingCapital;
    let maxDrawdown = 0;
    let maxDrawdownPercent = 0;

    const drawdownPeriods: DrawdownPeriod[] = [];
    let currentDrawdownPeriod: DrawdownPeriod | null = null;

    sortedTrades.forEach((trade, index) => {
      equity += trade.profit_loss || 0;

      if (equity > peakEquity) {
        // New peak - end any current drawdown period
        if (currentDrawdownPeriod) {
          currentDrawdownPeriod.endDate = trade.trade_date;
          currentDrawdownPeriod.recovered = true;
          currentDrawdownPeriod.durationDays = differenceInDays(
            parseISO(trade.trade_date),
            parseISO(currentDrawdownPeriod.startDate)
          );
          
          // Calculate recovery time (from lowest point to recovery)
          const lowestIndex = sortedTrades.findIndex((t, i) => {
            if (i < index) {
              let tempEquity = startingCapital;
              for (let j = 0; j <= i; j++) {
                tempEquity += sortedTrades[j].profit_loss || 0;
              }
              return tempEquity === peakEquity - currentDrawdownPeriod!.depth;
            }
            return false;
          });
          
          if (lowestIndex >= 0) {
            currentDrawdownPeriod.recoveryDays = differenceInDays(
              parseISO(trade.trade_date),
              parseISO(sortedTrades[lowestIndex].trade_date)
            );
          }

          drawdownPeriods.push(currentDrawdownPeriod);
          currentDrawdownPeriod = null;
        }
        peakEquity = equity;
      } else if (equity < peakEquity) {
        // In drawdown
        const drawdownAmount = peakEquity - equity;
        const drawdownPercent = (drawdownAmount / peakEquity) * 100;

        if (!currentDrawdownPeriod) {
          // Start new drawdown period
          currentDrawdownPeriod = {
            startDate: trade.trade_date,
            endDate: null,
            depth: drawdownAmount,
            depthPercent: drawdownPercent,
            durationDays: 0,
            recovered: false,
            recoveryDays: null,
          };
        } else {
          // Update current drawdown if deeper
          if (drawdownAmount > currentDrawdownPeriod.depth) {
            currentDrawdownPeriod.depth = drawdownAmount;
            currentDrawdownPeriod.depthPercent = drawdownPercent;
          }
        }

        if (drawdownAmount > maxDrawdown) {
          maxDrawdown = drawdownAmount;
          maxDrawdownPercent = drawdownPercent;
        }
      }
    });

    // If still in drawdown, add current period
    if (currentDrawdownPeriod) {
      currentDrawdownPeriod.durationDays = differenceInDays(
        new Date(),
        parseISO(currentDrawdownPeriod.startDate)
      );
      drawdownPeriods.push(currentDrawdownPeriod);
    }

    // Calculate averages
    const recoveredPeriods = drawdownPeriods.filter(p => p.recovered);
    const avgDrawdownDuration = drawdownPeriods.length > 0
      ? drawdownPeriods.reduce((sum, p) => sum + p.durationDays, 0) / drawdownPeriods.length
      : 0;

    const avgRecoveryTime = recoveredPeriods.length > 0
      ? recoveredPeriods.reduce((sum, p) => sum + (p.recoveryDays || 0), 0) / recoveredPeriods.length
      : 0;

    const longestDrawdown = drawdownPeriods.length > 0
      ? Math.max(...drawdownPeriods.map(p => p.durationDays))
      : 0;

    const currentDrawdown = peakEquity - equity;
    const currentDrawdownPercent = peakEquity > 0 ? (currentDrawdown / peakEquity) * 100 : 0;

    return {
      currentDrawdown: Math.round(currentDrawdown * 100) / 100,
      currentDrawdownPercent: Math.round(currentDrawdownPercent * 100) / 100,
      maxDrawdown: Math.round(maxDrawdown * 100) / 100,
      maxDrawdownPercent: Math.round(maxDrawdownPercent * 100) / 100,
      avgDrawdownDuration: Math.round(avgDrawdownDuration * 10) / 10,
      avgRecoveryTime: Math.round(avgRecoveryTime * 10) / 10,
      longestDrawdown,
      drawdownPeriods: drawdownPeriods.slice(-10), // Last 10 periods
      isInDrawdown: currentDrawdown > 0,
      peakEquity: Math.round(peakEquity * 100) / 100,
      currentEquity: Math.round(equity * 100) / 100,
    };
  }, [trades, startingCapital]);
};
