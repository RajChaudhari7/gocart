'use client'

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function DriverLayout({ children }) {

    const router = useRouter()

    useEffect(() => {

        const driver = localStorage.getItem("driver")

        if (!driver) {
            router.replace("/driver/login")
        }

    }, [])

    return (
        <>
            {/* Navbar */}
            {/* Sidebar */}
            {children}
        </>
    )
}