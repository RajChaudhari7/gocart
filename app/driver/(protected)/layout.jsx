"use client"

import { useEffect } from "react"
import DriverLayout from "@/components/driver/DriverLayout"

export default function Layout({ children }) {

    useEffect(() => {

        if ("serviceWorker" in navigator) {

            navigator.serviceWorker.register(
                "/driver-sw.js",
                {
                    scope: "/driver/"
                }
            )

        }

    }, [])

    return (
        <DriverLayout>
            {children}
        </DriverLayout>
    )
}