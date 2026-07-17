import { createSlice } from "@reduxjs/toolkit"
import { toast } from "sonner";


const initialState = {
    products : [],
}

const wishlistSlice = createSlice({
    name: "wishlist",

    initialState,

    reducers: {
        addToWishlist(state,action) {
            const exists = state.products.find(
                product => product.id ===action.payload.id
            );

            if (exists) {
                
                toast.info("Already in wishlist ❤");
                return;

            }

            state.products.push(action.payload);

            toast.success("Added to wishlist ❤");
        },

        removeFromWishlist(state,action) {

            state.products = state.products.filter(
                product => product.id !== action.payload
            );

            toast.success("Removed from wishlist");

        },

        clearWishlist(state) {

            state.products = [];

            toast.success("Wishlist Cleared");

        }
    }
});

export const {
    addToWishlist,
    removeFromWishlist,
    clearWishlist
} = wishlistSlice.actions;

export default wishlistSlice.reducer;