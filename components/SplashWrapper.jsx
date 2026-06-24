'use client'

import { useEffect, useState } from 'react'
import AppSplash from './AppSplash'

export default function SplashWrapper({ children }) {

    const [showSplash, setShowSplash] = useState(true)

    useEffect(() => {

        const shown = sessionStorage.getItem('nb-splash')

        if (shown) {
            setShowSplash(false)
            return
        }

        sessionStorage.setItem('nb-splash', 'true')

        const timer = setTimeout(() => {
            setShowSplash(false)
        }, 2800)

        return () => clearTimeout(timer)

    }, [])

    if (showSplash) {
        return <AppSplash />
    }

    return children
}