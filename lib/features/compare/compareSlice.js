import { createSlice } from "@reduxjs/toolkit";
import { toast } from "sonner";

const initialState = {
    products: [],
};

const compareSlice = createSlice({
    name: "compare",

    initialState,

    reducers: {

        addToCompare(state, action) {

            const exists = state.products.find(
                p => p.id === action.payload.id
            );

            if (exists) {
                toast("Already added for comparison");
                return;
            }

            if (
                state.products.length > 0 &&
                state.products[0].category !== action.payload.category
            ) {
                toast.error("Compare products from the same category.");
                return;
            }

            if (state.products.length >= 4) {
                toast.error("Maximum 4 products allowed.");
                return;
            }

            state.products.push(action.payload);
        },

        removeFromCompare(state, action) {
            state.products = state.products.filter(
                p => p.id !== action.payload
            );
        },

        clearCompare(state) {
            state.products = [];
        },

    }

});

export const {
    addToCompare,
    removeFromCompare,
    clearCompare
} = compareSlice.actions;

export default compareSlice.reducer;