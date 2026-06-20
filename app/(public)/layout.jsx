'use client'
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts } from "@/lib/features/product/productSlice";
import { useAuth, useUser } from "@clerk/nextjs";
import { fetchCart, uploadCart } from "@/lib/features/cart/cartSlice";
import { fetchAddress } from "@/lib/features/address/addressSlice";
import { fetchUserRatings } from "@/lib/features/rating/ratingSlice";

export const metadata = {
    title: "Nandurbar Bazar - Shop smarter",
    description: "Nandurbar Bazar - Shop smarter",
    manifest: "/manifest.json",

    themeColor: "#06b6d4",

    icons: {
        icon: "/icon-192.png",
        apple: "/icon-192.png",
    },

    appleWebApp: {
        capable: true,
        statusBarStyle: "default",
        title: "Nandurbar Bazar",
    },
}

export default function PublicLayout({ children }) {

    const dispatch = useDispatch()
    const { user } = useUser()
    const { getToken } = useAuth()
    const { cartItems } = useSelector((state) => state.cart)

    useEffect(() => {
        dispatch(fetchProducts({}))
    }, [])

    useEffect(() => {

        if (user) {
            dispatch(fetchCart({ getToken }))
            dispatch(fetchAddress({ getToken }))
            dispatch(fetchUserRatings({ getToken }))
        }

    }, [user])

    useEffect(() => {

        if (user) {
            dispatch(uploadCart({ getToken }))
        }

    }, [cartItems])





    return (
        <>
            <Navbar />
            {children}
            <Footer />
        </>
    );
}
