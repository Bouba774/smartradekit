import { create } from "zustand";

type TooltipStore = {
  openId: string | null;
  setOpenId: (id: string | null) => void;
};

/**
 * Global store to guarantee that opening a tooltip closes all other tooltips.
 */
export const useTooltipStore = create<TooltipStore>((set) => ({
  openId: null,
  setOpenId: (id) => set({ openId: id }),
}));
