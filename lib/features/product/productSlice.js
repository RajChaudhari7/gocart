import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import axios from 'axios'

export const fetchProducts = createAsyncThunk(
    'product/fetchProducts',
    async ({ storeId }, thunkAPI) => {
        try {
            const { data } = await axios.get(
                '/api/products' + (storeId ? `?storeId=${storeId}` : '')
            )
            return data.products
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response.data)
        }
    }
)

const productSlice = createSlice({
    name: 'product',
    initialState: {
        list: [],
    },
    reducers: {
        setProduct: (state, action) => {
            state.list = action.payload
        },
        clearProduct: (state) => {
            state.list = []
        },
        updateProductStock: (state, action) => {
            const { productId, quantity } = action.payload
            const product = state.list.find(p => p.id === productId)
            if (product) {
                product.quantity = quantity
                product.inStock = quantity > 0
            }
        }
    },
    extraReducers: (builder) => {
        builder.addCase(fetchProducts.fulfilled, (state, action) => {
            state.list = action.payload
        })
    }
})

export const {
    setProduct,
    clearProduct,
    updateProductStock
} = productSlice.actions

export default productSlice.reducer
