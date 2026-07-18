"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import axios from "axios";

import { setWishlist } from "@/lib/features/wishlist/wishlistSlice";

export default function WishlistLoader() {

    const dispatch = useDispatch();

    useEffect(() => {

        async function loadWishlist() {

            try {

                const { data } = await axios.get(
                    "/api/wishlist"
                );

                dispatch(
                    setWishlist(data)
                );

            } catch (error) {

                console.log(error);

            }

        }

        loadWishlist();

    }, []);

    return null;

}