'use client'

import { PlusIcon, SquarePenIcon, XIcon } from 'lucide-react'
import React, { useState } from 'react'
import AddressModal from './AddressModal'
import { useDispatch, useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { Protect, useAuth, useUser } from '@clerk/nextjs'
import axios from 'axios'
import { fetchCart } from '@/lib/features/cart/cartSlice'

const OrderSummary = ({ totalPrice, items }) => {
  const { user } = useUser()
  const { getToken } = useAuth()
  const router = useRouter()
  const dispatch = useDispatch()

  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '₹'
  const addressList = useSelector(state => state.address.list)

  const [paymentMethod, setPaymentMethod] = useState('COD')
  const [selectedAddress, setSelectedAddress] = useState(null)
  const [showAddressModal, setShowAddressModal] = useState(false)
  const [couponCodeInput, setCouponCodeInput] = useState('')
  const [coupon, setCoupon] = useState(null)

  const shippingCost = 50
  const discount = coupon ? (coupon.discount / 100) * totalPrice : 0
  const finalTotal = totalPrice + shippingCost - discount

  /* ---------------- COUPON ---------------- */
  const handleCouponCode = async (e) => {
    e.preventDefault()

    try {
      if (!user) return toast.error('Please login to apply coupon')

      const token = await getToken()
      const { data } = await axios.post(
        '/api/coupon',
        { code: couponCodeInput },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      setCoupon(data.coupon)
      toast.success('Coupon applied')
    } catch (err) {
      toast.error(err?.response?.data?.error || err.message)
    }
  }

  /* ---------------- PLACE ORDER ---------------- */
  const handlePlaceOrder = async (e) => {
    e.preventDefault()

    try {
      if (!user) return toast.error('Please login to place order')
      if (!selectedAddress) return toast.error('Please select delivery address')

      const token = await getToken()

      const orderData = {
        addressId: selectedAddress.id,
        items,
        paymentMethod,
        couponCode: coupon?.code,
      }

      const { data } = await axios.post('/api/orders', orderData, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (paymentMethod === 'STRIPE') {
        window.location.href = data.session.url
      } else {
        toast.success(data.message)
        router.push('/orders')
        dispatch(fetchCart({ getToken }))
      }
    } catch (err) {
      toast.error(err?.response?.data?.error || err.message)
    }
  }

  return (
    <div
      className="
        w-full max-w-lg lg:max-w-[360px]
        bg-white dark:bg-slate-900
        border border-slate-200 dark:border-slate-700
        rounded-2xl p-6
        shadow-lg
        text-slate-800 dark:text-slate-200
      "
    >
      {/* TITLE */}
      <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
        Payment Summary
      </h2>

      {/* PAYMENT METHOD */}
      <div className="mt-5 space-y-2">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Payment Method
        </p>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            checked={paymentMethod === 'COD'}
            onChange={() => setPaymentMethod('COD')}
            className="accent-slate-800"
          />
          Cash on Delivery
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            checked={paymentMethod === 'STRIPE'}
            onChange={() => setPaymentMethod('STRIPE')}
            className="accent-slate-800"
          />
          Stripe Payment
        </label>
      </div>

      {/* ADDRESS */}
      <div className="mt-6 border-t border-slate-200 dark:border-slate-700 pt-4">
        <p className="text-sm font-medium mb-2">Delivery Address</p>

        {selectedAddress ? (
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm text-slate-700 dark:text-slate-300">
              {selectedAddress.name}, {selectedAddress.city},{' '}
              {selectedAddress.state} - {selectedAddress.zip}
            </p>
            <SquarePenIcon
              size={18}
              className="cursor-pointer text-slate-600 dark:text-slate-400"
              onClick={() => setSelectedAddress(null)}
            />
          </div>
        ) : (
          <>
            {addressList.length > 0 && (
              <select
                className="
                  w-full mt-2 p-2 rounded
                  bg-white dark:bg-slate-800
                  border border-slate-300 dark:border-slate-600
                  text-slate-800 dark:text-slate-200
                "
                onChange={e => setSelectedAddress(addressList[e.target.value])}
              >
                <option value="">Select Address</option>
                {addressList.map((addr, i) => (
                  <option key={i} value={i}>
                    {addr.name}, {addr.city}
                  </option>
                ))}
              </select>
            )}

            <button
              onClick={() => setShowAddressModal(true)}
              className="flex items-center gap-1 text-sm text-slate-700 dark:text-slate-300 mt-2"
            >
              Add Address <PlusIcon size={16} />
            </button>
          </>
        )}
      </div>

      {/* PRICE BREAKDOWN */}
      <div className="mt-6 border-t border-slate-200 dark:border-slate-700 pt-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{currency}{totalPrice.toLocaleString()}</span>
        </div>

        <div className="flex justify-between">
          <span>Shipping</span>
          <Protect plan="prime" fallback={`${currency}${shippingCost}`}>
            Free
          </Protect>
        </div>

        {coupon && (
          <div className="flex justify-between text-green-600 dark:text-green-400">
            <span>Coupon</span>
            <span>-{currency}{discount.toFixed(2)}</span>
          </div>
        )}

        {/* COUPON INPUT */}
        {!coupon ? (
          <form onSubmit={handleCouponCode} className="flex gap-2 mt-3">
            <input
              value={couponCodeInput}
              onChange={e => setCouponCodeInput(e.target.value)}
              placeholder="Coupon Code"
              className="
                flex-1 p-2 rounded
                bg-white dark:bg-slate-800
                border border-slate-300 dark:border-slate-600
                text-slate-800 dark:text-slate-200
              "
            />
            <button className="bg-slate-800 text-white px-4 rounded">
              Apply
            </button>
          </form>
        ) : (
          <div className="flex items-center justify-between mt-2 text-xs">
            <span className="font-medium">{coupon.code.toUpperCase()}</span>
            <XIcon
              size={16}
              className="cursor-pointer hover:text-red-500"
              onClick={() => setCoupon(null)}
            />
          </div>
        )}
      </div>

      {/* TOTAL */}
      <div className="flex justify-between items-center mt-6 text-lg font-semibold">
        <span>Total</span>
        <span>{currency}{finalTotal.toFixed(2)}</span>
      </div>

      {/* PLACE ORDER */}
      <button
        onClick={handlePlaceOrder}
        className="
          w-full mt-6 py-3 rounded-xl
          bg-slate-900 dark:bg-white
          text-white dark:text-slate-900
          hover:opacity-90
          transition
        "
      >
        Place Order
      </button>

      {showAddressModal && (
        <AddressModal setShowAddressModal={setShowAddressModal} />
      )}
    </div>
  )
}

export default OrderSummary
