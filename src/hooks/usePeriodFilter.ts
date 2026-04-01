import { useState, useMemo, useCallback } from 'react';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';

export type PeriodType = 'day' | 'week' | 'month' | 'all' | 'custom';

export interface PeriodFilterState {
  period: PeriodType;
  setPeriod: (p: PeriodType) => void;
  customStart: Date | undefined;
  customEnd: Date | undefined;
  setCustomStart: (d: Date | undefined) => void;
  setCustomEnd: (d: Date | undefined) => void;
}

export const usePeriodFilter = (defaultPeriod: PeriodType = 'all') => {
  const [period, setPeriod] = useState<PeriodType>(defaultPeriod);
  const [customStart, setCustomStart] = useState<Date | undefined>(undefined);
  const [customEnd, setCustomEnd] = useState<Date | undefined>(undefined);

  const filterByPeriod = useCallback(<T extends { trade_date: string }>(items: T[]): T[] => {
    if (period === 'all') return items;

    const now = new Date();
    let start: Date;
    let end: Date;

    switch (period) {
      case 'day':
        start = startOfDay(now);
        end = endOfDay(now);
        break;
      case 'week':
        start = startOfWeek(now, { weekStartsOn: 1 });
        end = endOfWeek(now, { weekStartsOn: 1 });
        break;
      case 'month':
        start = startOfMonth(now);
        end = endOfMonth(now);
        break;
      case 'custom':
        if (!customStart || !customEnd) return items;
        start = startOfDay(customStart);
        end = endOfDay(customEnd);
        break;
      default:
        return items;
    }

    return items.filter(item => {
      const d = parseISO(item.trade_date);
      return isWithinInterval(d, { start, end });
    });
  }, [period, customStart, customEnd]);

  return {
    period,
    setPeriod,
    customStart,
    customEnd,
    setCustomStart,
    setCustomEnd,
    filterByPeriod,
  };
};
