'use client'

import { useEffect, useState } from 'react'
import AppSplash from './AppSplash'

export default function SplashWrapper({ children }) {
    const [showSplash, setShowSplash] = useState(true)

    useEffect(() => {
        const shown = sessionStorage.getItem(
            'driver-splash-shown'
        )

        if (shown) {
            setShowSplash(false)
            return
        }

        sessionStorage.setItem(
            'driver-splash-shown',
            'true'
        )

        const timer = setTimeout(() => {
            setShowSplash(false)
        }, 3500)

        return () => clearTimeout(timer)
    }, [])

    if (showSplash) {
        return <AppSplash />
    }

    return children
}