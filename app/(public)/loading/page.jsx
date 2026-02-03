'use client'

import Loading from "@/components/Loading"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { useAuth } from "@clerk/nextjs"
import axios from "axios"
import { useDispatch } from "react-redux"
import { clearCart } from "@/lib/features/cart/cartSlice"
import toast from "react-hot-toast"

export default function LoadingPage() {
  const router = useRouter()
  const { getToken } = useAuth()
  const dispatch = useDispatch()

  useEffect(() => {
    const run = async () => {
      try {
        const params = new URLSearchParams(window.location.search)
        const nextUrl = params.get('nextUrl')

        const token = await getToken()

        // 🔥 CLEAR SERVER CART AFTER STRIPE SUCCESS
        await axios.delete('/api/cart', {
          headers: { Authorization: `Bearer ${token}` }
        })

        // 🔥 CLEAR REDUX CART
        dispatch(clearCart())

        // ⏩ REDIRECT
        if (nextUrl) {
          setTimeout(() => {
            router.push(`/${nextUrl}`)
          }, 2000)
        } else {
          router.push('/orders')
        }

      } catch (err) {
        console.error(err)
        toast.error('Payment completed, but cart cleanup failed')
        router.push('/orders')
      }
    }

    run()
  }, [router, getToken, dispatch])

  return <Loading />
}
