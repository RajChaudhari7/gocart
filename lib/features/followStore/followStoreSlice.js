import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    stores: [],
};

const followStoreSlice = createSlice({

    name: "followStore",

    initialState,

    reducers: {

        setFollowedStores: (state, action) => {
            state.stores = action.payload;
        },

        followStore: (state, action) => {

            const exists = state.stores.some(
                (store) => store.id === action.payload.id
            );

            if (!exists) {
                state.stores.push(action.payload);
            }

        },

        unfollowStore: (state, action) => {

            state.stores = state.stores.filter(
                (store) => store.id !== action.payload
            );

        },

        clearFollowedStores: (state) => {
            state.stores = [];
        },

    },

});

export const {

    setFollowedStores,
    followStore,
    unfollowStore,
    clearFollowedStores,

} = followStoreSlice.actions;

export default followStoreSlice.reducer;