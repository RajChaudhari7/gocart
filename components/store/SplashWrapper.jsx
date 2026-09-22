'use client'

import { useEffect, useState } from 'react'
import AppSplash from './AppSplash'

export default function SplashWrapper({ children }) {
    const [showSplash, setShowSplash] = useState(true)

    useEffect(() => {
        const shown = sessionStorage.getItem('seller-splash-shown')

        if (shown === 'true') {
            setShowSplash(false)
            return
        }

        const timer = setTimeout(() => {
            sessionStorage.setItem('seller-splash-shown', 'true')
            setShowSplash(false)
        }, 2800)

        return () => clearTimeout(timer)
    }, [])

    if (showSplash) {
        return <AppSplash />
    }

    return children
}