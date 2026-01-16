import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface TradeFocusState {
  isEnabled: boolean;
  tradingPlan: string;
  dailyGoal: string;
  maxTrades: number;
  maxLoss: number;
  toggle: () => void;
  setTradingPlan: (plan: string) => void;
  setDailyGoal: (goal: string) => void;
  setMaxTrades: (max: number) => void;
  setMaxLoss: (max: number) => void;
}

export const useTradeFocus = create<TradeFocusState>()(
  persist(
    (set) => ({
      isEnabled: false,
      tradingPlan: '',
      dailyGoal: '',
      maxTrades: 5,
      maxLoss: 100,
      toggle: () => set((state) => ({ isEnabled: !state.isEnabled })),
      setTradingPlan: (plan) => set({ tradingPlan: plan }),
      setDailyGoal: (goal) => set({ dailyGoal: goal }),
      setMaxTrades: (max) => set({ maxTrades: max }),
      setMaxLoss: (max) => set({ maxLoss: max }),
    }),
    {
      name: 'trade-focus-storage',
    }
  )
);
