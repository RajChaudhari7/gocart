'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Loading from '@/components/Loading'

const REDIRECT_DELAY = 8000 // ms

export default function LoadingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [secondsLeft, setSecondsLeft] = useState(REDIRECT_DELAY / 1000)

  const nextUrl = useMemo(() => {
    const url = searchParams.get('nextUrl')
    // basic safety check (only allow internal redirects)
    if (url && url.startsWith('/')) return url
    return null
  }, [searchParams])

  useEffect(() => {
    if (!nextUrl) return

    const redirectTimer = setTimeout(() => {
      router.replace(nextUrl)
    }, REDIRECT_DELAY)

    const countdownTimer = setInterval(() => {
      setSecondsLeft((prev) => Math.max(prev - 1, 0))
    }, 1000)

    return () => {
      clearTimeout(redirectTimer)
      clearInterval(countdownTimer)
    }
  }, [nextUrl, router])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <Loading />
      {nextUrl && (
        <p className="text-sm text-gray-500">
          Redirecting in {secondsLeft}s…
        </p>
      )}
    </div>
  )
}
