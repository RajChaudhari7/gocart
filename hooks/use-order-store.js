import { create } from 'zustand'

export const useOrderStore = create((set) => ({
  orderCount: 0,
  setOrderCount: (count) => set({ orderCount: count }),
}))