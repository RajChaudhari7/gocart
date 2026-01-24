'use client'

import {
  PlusIcon,
  SquarePenIcon,
  XIcon
} from 'lucide-react'
import React, { useState } from 'react'
import AddressModal from './AddressModal'
import { useDispatch, useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { Protect, useAuth, useUser } from '@clerk/nextjs'
import axios from 'axios'
import { fetchCart } from '@/lib/features/cart/cartSlice'

const OrderSummary = ({ totalPrice = 0, items = [] }) => {
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

  const shippingCharge = 50
  const discountAmount = coupon
    ? (coupon.discount / 100) * totalPrice
    : 0

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
      toast.success('Coupon applied successfully')
    } catch (error) {
      toast.error(error?.response?.data?.error || error.message)
    }
  }

  /* ---------------- ORDER ---------------- */
  const handlePlaceOrder = async (e) => {
    e.preventDefault()

    try {
      if (!user) return toast.error('Please login to place order')
      if (!selectedAddress) return toast.error('Please select an address')

      const token = await getToken()

      const orderData = {
        addressId: selectedAddress.id,
        items,
        paymentMethod,
        ...(coupon && { couponCode: coupon.code })
      }

      const { data } = await axios.post(
        '/api/orders',
        orderData,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (paymentMethod === 'STRIPE') {
        window.location.href = data.session.url
      } else {
        toast.success(data.message)
        dispatch(fetchCart({ getToken }))
        router.push('/orders')
      }
    } catch (error) {
      toast.error(error?.response?.data?.error || error.message)
    }
  }

  return (
    <div className="w-full max-w-lg lg:max-w-[360px] rounded-2xl p-6
      bg-white border border-slate-200 shadow-lg text-sm">

      {/* TITLE */}
      <h2 className="text-xl font-semibold text-slate-800 mb-4">
        Payment Summary
      </h2>

      {/* PAYMENT METHOD */}
      <p className="text-xs text-slate-500 mb-2">Payment Method</p>

      <div className="space-y-1">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="payment"
            checked={paymentMethod === 'COD'}
            onChange={() => setPaymentMethod('COD')}
            className="accent-slate-700"
          />
          COD
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="payment"
            checked={paymentMethod === 'STRIPE'}
            onChange={() => setPaymentMethod('STRIPE')}
            className="accent-slate-700"
          />
          Stripe Payment
        </label>
      </div>

      {/* ADDRESS */}
      <div className="my-5 py-4 border-y border-slate-200">
        <p className="text-slate-600 mb-2">Delivery Address</p>

        {selectedAddress ? (
          <div className="flex items-center gap-2">
            <p className="text-slate-700">
              {selectedAddress.name}, {selectedAddress.city},
              {selectedAddress.state} - {selectedAddress.zip}
            </p>
            <SquarePenIcon
              size={16}
              className="cursor-pointer text-slate-500"
              onClick={() => setSelectedAddress(null)}
            />
          </div>
        ) : (
          <>
            {addressList.length > 0 && (
              <select
                className="w-full border border-slate-300 p-2 rounded mb-2"
                onChange={e =>
                  setSelectedAddress(addressList[e.target.value])
                }
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
              className="flex items-center gap-1 text-slate-700 text-sm"
            >
              Add Address <PlusIcon size={16} />
            </button>
          </>
        )}
      </div>

      {/* PRICE BREAKDOWN */}
      <div className="border-b border-slate-200 pb-4 space-y-2">
        <div className="flex justify-between text-slate-600">
          <span>Subtotal</span>
          <span>{currency}{totalPrice.toLocaleString()}</span>
        </div>

        <div className="flex justify-between text-slate-600">
          <span>Shipping</span>
          <Protect plan="prime" fallback={`${currency}${shippingCharge}`}>
            Free
          </Protect>
        </div>

        {coupon && (
          <div className="flex justify-between text-green-600">
            <span>Coupon</span>
            <span>-{currency}{discountAmount.toFixed(2)}</span>
          </div>
        )}

        {!coupon ? (
          <form
            onSubmit={e =>
              toast.promise(handleCouponCode(e), {
                loading: 'Checking coupon...'
              })
            }
            className="flex gap-2 mt-3"
          >
            <input
              value={couponCodeInput}
              onChange={e => setCouponCodeInput(e.target.value)}
              placeholder="Coupon Code"
              className="flex-1 border border-slate-300 p-2 rounded"
            />
            <button className="bg-slate-700 text-white px-4 rounded">
              Apply
            </button>
          </form>
        ) : (
          <div className="flex items-center justify-between text-xs mt-2">
            <span>
              {coupon.code.toUpperCase()} — {coupon.description}
            </span>
            <XIcon
              size={16}
              className="cursor-pointer text-red-600"
              onClick={() => setCoupon(null)}
            />
          </div>
        )}
      </div>

      {/* TOTAL */}
      <div className="flex justify-between items-center py-4">
        <span className="text-base font-semibold">Total</span>
        <span className="text-lg font-bold text-slate-800">
          <Protect
            plan="prime"
            fallback={`${currency}${(totalPrice + shippingCharge - discountAmount).toFixed(2)}`}
          >
            {currency}{(totalPrice - discountAmount).toFixed(2)}
          </Protect>
        </span>
      </div>

      {/* PLACE ORDER */}
      <button
        onClick={e =>
          toast.promise(handlePlaceOrder(e), {
            loading: 'Placing order...'
          })
        }
        className="w-full bg-slate-800 text-white py-3 rounded-xl
        hover:bg-slate-900 active:scale-95 transition"
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
