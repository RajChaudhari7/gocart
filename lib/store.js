import { configureStore } from '@reduxjs/toolkit'
import cartReducer from './features/cart/cartSlice'
import productReducer from './features/product/productSlice'
import addressReducer from './features/address/addressSlice'
import ratingReducer from './features/rating/ratingSlice'
import compareReducer from './features/compare/compareSlice'

export const makeStore = () => {
    return configureStore({
        reducer: {
            cart: cartReducer,
            compare: compareReducer,
            product: productReducer,
            address: addressReducer,
            rating: ratingReducer,
        },
    })
}