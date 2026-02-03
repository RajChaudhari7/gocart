'use client'

import PageTitle from "@/components/PageTitle"
import { useEffect, useState } from "react"
import OrderItem from "@/components/OrderItem"
import { useAuth, useUser } from "@clerk/nextjs"
import axios from "axios"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"
import Loading from "@/components/Loading"
import TrackingModal from "@/components/TrackingModal"

export default function Orders() {
  const { getToken } = useAuth()
  const { user, isLoaded } = useUser()
  const router = useRouter()

  const [orders, setOrders] = useState([])
  const [trackingOrder, setTrackingOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchOrders = async () => {
    try {
      const token = await getToken()
      const { data } = await axios.get('/api/orders', {
        headers: { Authorization: `Bearer ${token}` },
      })
      setOrders(data.orders)
    } catch (error) {
      toast.error(error?.response?.data?.error || error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isLoaded) {
      user ? fetchOrders() : router.push('/')
    }
  }, [isLoaded, user])

  const cancelOrder = async (order) => {
    if (order.status === 'DELIVERED') return

    if (!confirm("Are you sure you want to cancel this order?")) return
    try {
      const token = await getToken()
      await axios.post(`/api/orders/cancel`, { orderId: order.id }, {
        headers: { Authorization: `Bearer ${token}` },
      })
      toast.success("Order canceled successfully")
      fetchOrders()
    } catch (error) {
      toast.error(error?.response?.data?.error || error.message)
    }
  }

  if (!isLoaded || loading) return <Loading />

  return (
    <section className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#020617] to-black text-white px-6">
      <div className="max-w-7xl mx-auto py-24">

        {/* Updated Page Title */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
            Your Orders
          </h1>
          <p className="text-white/60 text-lg">
            You have placed <span className="text-indigo-400 font-semibold">{orders.length}</span> {orders.length === 1 ? 'order' : 'orders'}.
          </p>
        </div>

        {orders.length > 0 ? (
          <div className="mt-16 overflow-x-auto">
            <table className="w-full border-separate border-spacing-y-6 hidden md:table">
              <thead>
                <tr className="text-sm text-white/60">
                  <th className="text-left pl-6">Product</th>
                  <th className="text-center">Total</th>
                  <th className="text-left">Payment</th>
                  <th className="text-left">Address</th>
                  <th className="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <OrderItem
                    key={order.id}
                    order={order}
                    onCancel={() => cancelOrder(order)}
                    onTrack={() => setTrackingOrder(order)}
                  />
                ))}
              </tbody>
            </table>

            {/* Mobile */}
            <div className="space-y-6 md:hidden">
              {orders.map(order => (
                <OrderItem
                  key={order.id}
                  order={order}
                  mobile
                  onCancel={() => cancelOrder(order)}
                  onTrack={() => setTrackingOrder(order)}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center min-h-[60vh] text-center">
            <div>
              <h1 className="text-3xl font-semibold mb-2">No Orders Yet</h1>
              <p className="text-white/60 mb-6">
                Looks like you haven’t placed any orders.
              </p>
              <button
                onClick={() => router.push('/')}
                className="px-6 py-3 bg-indigo-600 rounded-lg hover:bg-indigo-500 transition"
              >
                Shop Now
              </button>
            </div>
          </div>
        )}
      </div>

      {trackingOrder && (
        <TrackingModal
          order={trackingOrder}
          onClose={() => setTrackingOrder(null)}
        />
      )}
    </section>
  )
}
