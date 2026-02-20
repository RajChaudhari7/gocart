'use client'

import { PlusIcon, SquarePenIcon, XIcon } from 'lucide-react'
import React, { useState, useEffect } from 'react'
import AddressModal from './AddressModal'
import { useDispatch, useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { Protect, useAuth, useUser } from '@clerk/nextjs'
import axios from 'axios'
import { clearCart } from '@/lib/features/cart/cartSlice'

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
  const [availableCoupons, setAvailableCoupons] = useState([])

  const shippingCost = 50

  const discount = coupon
    ? Math.min(
        (coupon.discount / 100) * totalPrice,
        coupon.maxDiscount || Infinity
      )
    : 0

  const finalTotal = totalPrice + shippingCost - discount

  /* ---------------- FETCH AVAILABLE COUPONS ---------------- */
  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        if (!user) return
        const token = await getToken()
        const { data } = await axios.get('/api/coupon/available', {
          headers: { Authorization: `Bearer ${token}` },
        })
        setAvailableCoupons(data.coupons || [])
      } catch (err) {
        console.log(err)
      }
    }

    fetchCoupons()
  }, [user])

  /* ---------------- COUPON APPLY MANUAL ---------------- */
  const handleCouponCode = async (e) => {
    e.preventDefault()

    try {
      if (!user) return toast.error('Please login to apply coupon')
      if (!couponCodeInput.trim()) {
        return toast.error('Enter coupon code')
      }

      const token = await getToken()

      const { data } = await axios.post(
        '/api/coupon',
        { code: couponCodeInput.trim().toUpperCase() },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      setCoupon(data.coupon)
      setCouponCodeInput('')
      toast.success('Coupon applied successfully')
    } catch (err) {
      toast.error(err?.response?.data?.error || err.message)
    }
  }

  /* ---------------- PLACE ORDER ---------------- */
  const handlePlaceOrder = async (e) => {
    e.preventDefault()

    try {
      if (!user) return toast.error('Please login to place order')
      if (!selectedAddress)
        return toast.error('Please select delivery address')

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
        return
      }

      toast.success(data.message || 'Order placed successfully')

      await axios.delete('/api/cart', {
        headers: { Authorization: `Bearer ${token}` },
      })

      dispatch(clearCart())
      router.push('/orders')
    } catch (err) {
      toast.error(err?.response?.data?.error || err.message)
    }
  }

  return (
    <div className="w-full max-w-lg lg:max-w-[360px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-lg text-slate-800 dark:text-slate-200">

      <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
        Payment Summary
      </h2>

      {/* PAYMENT METHOD */}
      <div className="mt-5 space-y-2">
        <p className="text-sm font-medium">Payment Method</p>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="paymentMethod"
            checked={paymentMethod === 'COD'}
            onChange={() => setPaymentMethod('COD')}
          />
          Cash on Delivery
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="paymentMethod"
            checked={paymentMethod === 'STRIPE'}
            onChange={() => setPaymentMethod('STRIPE')}
          />
          Stripe Payment
        </label>
      </div>

      {/* ADDRESS */}
      <div className="mt-6 border-t pt-4">
        <p className="text-sm font-medium mb-2">Delivery Address</p>

        {selectedAddress ? (
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm">
              {selectedAddress.name}, {selectedAddress.city},{' '}
              {selectedAddress.state} - {selectedAddress.zip}
            </p>
            <SquarePenIcon
              size={18}
              className="cursor-pointer"
              onClick={() => setSelectedAddress(null)}
            />
          </div>
        ) : (
          <>
            {addressList.length > 0 && (
              <select
                className="w-full mt-2 p-2 rounded border"
                onChange={(e) => {
                  const index = e.target.value
                  if (index !== '') {
                    setSelectedAddress(addressList[index])
                  }
                }}
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
              className="flex items-center gap-1 text-sm mt-2"
            >
              Add Address <PlusIcon size={16} />
            </button>
          </>
        )}
      </div>

      {/* PRICE BREAKDOWN */}
      <div className="mt-6 border-t pt-4 space-y-2 text-sm">
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
          <div className="flex justify-between text-green-600">
            <span>Coupon</span>
            <span>-{currency}{discount.toFixed(2)}</span>
          </div>
        )}

        {/* ================= AMAZON STYLE COUPON SECTION ================= */}

        {!coupon && (
          <>
            {/* Manual Entry */}
            <form onSubmit={handleCouponCode} className="flex gap-2 mt-3">
              <input
                value={couponCodeInput}
                onChange={(e) => setCouponCodeInput(e.target.value)}
                placeholder="Enter Coupon Code"
                className="flex-1 p-2 rounded border"
              />
              <button className="bg-slate-800 text-white px-4 rounded">
                Apply
              </button>
            </form>

            {/* Available Offers */}
            {availableCoupons.length > 0 && (
              <div className="mt-4 space-y-3">
                <p className="text-sm font-semibold">Available Offers</p>

                {availableCoupons.map((c) => {
                  const previewDiscount = Math.min(
                    (c.discount / 100) * totalPrice,
                    c.maxDiscount || Infinity
                  )

                  return (
                    <div
                      key={c.id}
                      className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl p-3"
                    >
                      <div className="flex justify-between items-start gap-3">
                        <div>
                          <p className="font-semibold text-green-700 dark:text-green-400 text-sm">
                            Save {currency}{previewDiscount.toFixed(0)} with {c.code}
                          </p>

                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                            {c.discount}% OFF
                            {c.maxDiscount && ` • Max ${currency}${c.maxDiscount}`}
                          </p>

                          {c.expiresAt && (
                            <p className="text-xs text-slate-500 mt-1">
                              Valid till {new Date(c.expiresAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>

                        <button
                          onClick={() => {
                            setCoupon(c)
                            toast.success('Coupon applied')
                          }}
                          className="text-sm font-semibold bg-yellow-400 hover:bg-yellow-500 text-black px-3 py-1 rounded-lg"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}

        {/* Applied State */}
        {coupon && (
          <div className="mt-4 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-xl p-3 flex justify-between items-center">
            <div>
              <p className="text-green-700 dark:text-green-400 font-semibold text-sm">
                ✓ {coupon.code} Applied
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                You saved {currency}{discount.toFixed(2)}
              </p>
            </div>

            <button
              onClick={() => setCoupon(null)}
              className="text-red-500 text-xs font-medium"
            >
              Remove
            </button>
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
        className="w-full mt-6 py-3 rounded-xl bg-slate-900 text-white"
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