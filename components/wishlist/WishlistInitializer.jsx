"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useDispatch } from "react-redux";
import axios from "axios";

import { setWishlist } from "@/lib/features/wishlist/wishlistSlice";

export default function WishlistInitializer() {
    const { user } = useUser();
    const dispatch = useDispatch();

    useEffect(() => {
        if (!user) return;

        const loadWishlist = async () => {
            try {
                const { data } = await axios.get("/api/wishlist");

                dispatch(setWishlist(data));
            } catch (err) {
                console.log(err);
            }
        };

        loadWishlist();
    }, [user, dispatch]);

    return null;
}