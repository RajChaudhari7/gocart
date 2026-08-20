import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

// ==================================================
// FETCH SAVED ADDRESSES
// ==================================================

export const fetchAddress = createAsyncThunk(
  "address/fetchAddress",

  async ({ getToken }, thunkAPI) => {
    try {
      const token = await getToken();

      const { data } = await axios.get("/api/address", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return Array.isArray(data?.addresses) ? data.addresses : [];
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error?.response?.data || {
          error: "Unable to load addresses",
        },
      );
    }
  },
);

// ==================================================
// ADDRESS SLICE
// ==================================================

const addressSlice = createSlice({
  name: "address",

  initialState: {
    list: [],

    loading: false,

    error: null,
  },

  reducers: {
    // ----------------------------------------------
    // ADD ADDRESS
    // ----------------------------------------------

    addAddress: (state, action) => {
      const newAddress = action.payload;

      if (!newAddress?.id) return;

      /*
       * Prevent duplicate address in Redux.
       *
       * This can happen if:
       *
       * 1. AddressModal dispatches addAddress()
       * 2. fetchAddress() runs afterward
       * 3. Component gets mounted again
       */

      const exists = state.list.some((address) => address.id === newAddress.id);

      if (!exists) {
        /*
         * Put newest address first.
         *
         * This is useful because the newly created
         * address should immediately appear at the
         * top of checkout/address selection.
         */
        state.list.unshift(newAddress);
      }

      /*
       * If this new address is default,
       * make sure Redux doesn't show multiple
       * default addresses.
       */

      if (newAddress.isDefault) {
        state.list = state.list.map((address) => ({
          ...address,

          isDefault: address.id === newAddress.id,
        }));
      }
    },

    // ----------------------------------------------
    // UPDATE ADDRESS IN REDUX
    // ----------------------------------------------

    updateAddress: (state, action) => {
      const updatedAddress = action.payload;

      if (!updatedAddress?.id) return;

      const index = state.list.findIndex(
        (address) => address.id === updatedAddress.id,
      );

      if (index !== -1) {
        state.list[index] = {
          ...state.list[index],
          ...updatedAddress,
        };
      }

      if (updatedAddress.isDefault) {
        state.list = state.list.map((address) => ({
          ...address,

          isDefault: address.id === updatedAddress.id,
        }));
      }
    },

    // ----------------------------------------------
    // REMOVE ADDRESS FROM REDUX
    // ----------------------------------------------

    removeAddress: (state, action) => {
      const addressId = action.payload;

      state.list = state.list.filter((address) => address.id !== addressId);
    },

    // ----------------------------------------------
    // CLEAR ADDRESSES
    // ----------------------------------------------

    clearAddresses: (state) => {
      state.list = [];

      state.loading = false;

      state.error = null;
    },
  },

  // ==================================================
  // FETCH ADDRESS STATES
  // ==================================================

  extraReducers: (builder) => {
    builder

      // --------------------------------------------
      // PENDING
      // --------------------------------------------

      .addCase(fetchAddress.pending, (state) => {
        state.loading = true;

        state.error = null;
      })

      // --------------------------------------------
      // SUCCESS
      // --------------------------------------------

      .addCase(fetchAddress.fulfilled, (state, action) => {
        state.loading = false;

        state.error = null;

        state.list = Array.isArray(action.payload) ? action.payload : [];
      })

      // --------------------------------------------
      // ERROR
      // --------------------------------------------

      .addCase(fetchAddress.rejected, (state, action) => {
        state.loading = false;

        state.error = action.payload?.error || "Unable to load addresses";
      });
  },
});

// ==================================================
// EXPORT ACTIONS
// ==================================================

export const { addAddress, updateAddress, removeAddress, clearAddresses } =
  addressSlice.actions;

// ==================================================
// EXPORT REDUCER
// ==================================================

export default addressSlice.reducer;
