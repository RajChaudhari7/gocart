import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import axios from 'axios'

let debounceTimer = null

export const uploadCart = createAsyncThunk(
  'cart/uploadCart',
  async ({ getToken }, thunkAPI) => {
    try {
      clearTimeout(debounceTimer)

      debounceTimer = setTimeout(async () => {
        const { cartItems } = thunkAPI.getState().cart
        const token = await getToken()

        await axios.post(
          '/api/cart',
          { cart: cartItems },
          { headers: { Authorization: `Bearer ${token}` } }
        )
      }, 800)
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data)
    }
  }
)

export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async ({ getToken }, thunkAPI) => {
    try {
      const token = await getToken()
      const { data } = await axios.get('/api/cart', {
        headers: { Authorization: `Bearer ${token}` }
      })
      return data
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data)
    }
  }
)

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    cartItems: {}, // { productId: quantity }
    total: 0,
  },

  reducers: {
    /* ✅ USED BY PRODUCT DETAILS PAGE */
    setCartItemQuantity: (state, action) => {
      const { productId, quantity, maxQuantity } = action.payload
      const safeQty = Math.min(quantity, maxQuantity)

      if (safeQty <= 0) {
        delete state.cartItems[productId]
      } else {
        state.cartItems[productId] = safeQty
      }

      state.total = Object.values(state.cartItems).reduce(
        (sum, qty) => sum + qty,
        0
      )
    },


    /* ✅ USED BY CART PAGE (+ button) */
    incrementItem: (state, action) => {
      const { productId, maxQuantity } = action.payload
      const currentQty = state.cartItems[productId] || 0

      if (currentQty >= maxQuantity) return

      state.cartItems[productId] = currentQty + 1
      state.total += 1
    },

    /* ✅ USED BY CART PAGE (− button) */
    decrementItem: (state, action) => {
      const { productId } = action.payload
      if (!state.cartItems[productId]) return

      state.cartItems[productId] -= 1
      state.total -= 1

      if (state.cartItems[productId] === 0) {
        delete state.cartItems[productId]
      }
    },

    deleteItemFromCart: (state, action) => {
      const { productId } = action.payload
      state.total -= state.cartItems[productId] || 0
      delete state.cartItems[productId]
    },

    clearCart: (state) => {
      state.cartItems = {}
      state.total = 0
    },
  },

  extraReducers: (builder) => {
    builder.addCase(fetchCart.fulfilled, (state, action) => {
      state.cartItems = action.payload.cart
      state.total = Object.values(action.payload.cart).reduce(
        (sum, qty) => sum + qty,
        0
      )
    })
  }
})

export const {
  setCartItemQuantity,
  incrementItem,
  decrementItem,
  deleteItemFromCart,
  clearCart,
} = cartSlice.actions

export default cartSlice.reducer
