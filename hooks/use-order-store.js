import { create } from 'zustand'
import axios from 'axios'

export const useOrderStore = create((set) => ({
  orderCount: 0,

  setOrderCount: (count) => set({ orderCount: count }),

  fetchOrderCount: async () => {
    try {
      const { data } = await axios.get('/api/store/orders/count')

      set({
        orderCount: data.count
      })
    } catch (error) {
      console.log("Order count error:", error)
    }
  }
}))