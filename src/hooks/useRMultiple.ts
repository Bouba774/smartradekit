import { useMemo } from 'react';
import { Trade } from './useTrades';

export interface RMultipleStats {
  avgR: number;
  maxR: number;
  minR: number;
  totalRWon: number;
  totalRLost: number;
  expectancyR: number;
  distribution: {
    range: string;
    count: number;
    percentage: number;
  }[];
  recentRs: number[];
}

export const useRMultiple = (trades: Trade[]): RMultipleStats => {
  return useMemo(() => {
    const defaultStats: RMultipleStats = {
      avgR: 0,
      maxR: 0,
      minR: 0,
      totalRWon: 0,
      totalRLost: 0,
      expectancyR: 0,
      distribution: [],
      recentRs: [],
    };

    if (!trades || trades.length === 0) return defaultStats;

    // Calculate R-Multiple for each trade
    // R = (Exit - Entry) / (Entry - SL) for longs
    // R = (Entry - Exit) / (SL - Entry) for shorts
    const tradesWithR: { trade: Trade; r: number }[] = [];

    trades.forEach(trade => {
      if (!trade.stop_loss || !trade.exit_price) return;
      
      const entry = trade.entry_price;
      const exit = trade.exit_price;
      const sl = trade.stop_loss;
      
      let r: number;
      
      if (trade.direction === 'long') {
        const risk = Math.abs(entry - sl);
        if (risk === 0) return;
        r = (exit - entry) / risk;
      } else {
        const risk = Math.abs(sl - entry);
        if (risk === 0) return;
        r = (entry - exit) / risk;
      }

      tradesWithR.push({ trade, r: Math.round(r * 100) / 100 });
    });

    if (tradesWithR.length === 0) return defaultStats;

    const rValues = tradesWithR.map(t => t.r);
    const avgR = rValues.reduce((a, b) => a + b, 0) / rValues.length;
    const maxR = Math.max(...rValues);
    const minR = Math.min(...rValues);

    const totalRWon = rValues.filter(r => r > 0).reduce((a, b) => a + b, 0);
    const totalRLost = Math.abs(rValues.filter(r => r < 0).reduce((a, b) => a + b, 0));

    const wins = rValues.filter(r => r > 0).length;
    const losses = rValues.filter(r => r < 0).length;
    const winRate = tradesWithR.length > 0 ? wins / tradesWithR.length : 0;
    const avgWin = wins > 0 ? totalRWon / wins : 0;
    const avgLoss = losses > 0 ? totalRLost / losses : 0;
    const expectancyR = (winRate * avgWin) - ((1 - winRate) * avgLoss);

    // Distribution by R ranges
    const ranges = [
      { min: -Infinity, max: -2, label: '< -2R' },
      { min: -2, max: -1, label: '-2R à -1R' },
      { min: -1, max: 0, label: '-1R à 0' },
      { min: 0, max: 1, label: '0 à 1R' },
      { min: 1, max: 2, label: '1R à 2R' },
      { min: 2, max: 3, label: '2R à 3R' },
      { min: 3, max: Infinity, label: '> 3R' },
    ];

    const distribution = ranges.map(range => {
      const count = rValues.filter(r => r > range.min && r <= range.max).length;
      return {
        range: range.label,
        count,
        percentage: Math.round((count / rValues.length) * 100),
      };
    });

    // Recent R values (last 20)
    const recentRs = rValues.slice(0, 20);

    return {
      avgR: Math.round(avgR * 100) / 100,
      maxR: Math.round(maxR * 100) / 100,
      minR: Math.round(minR * 100) / 100,
      totalRWon: Math.round(totalRWon * 100) / 100,
      totalRLost: Math.round(totalRLost * 100) / 100,
      expectancyR: Math.round(expectancyR * 100) / 100,
      distribution,
      recentRs,
    };
  }, [trades]);
};
