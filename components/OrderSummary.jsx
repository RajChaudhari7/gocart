'use client'

import { PlusIcon, MapPinIcon, CheckCircle2Icon, TagIcon, XIcon, CreditCardIcon, BanknoteIcon } from 'lucide-react'
import React, { useEffect, useState } from 'react'
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
  const [settings, setSettings] = useState({
    deliveryFee: 50,
    freeDeliveryAbove: 999999
  });

  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '₹'
  const addressList = useSelector(state => state.address.list)

  const [paymentMethod, setPaymentMethod] = useState('COD')
  const [selectedAddress, setSelectedAddress] = useState(null)
  const [showAddressModal, setShowAddressModal] = useState(false)
  const [couponCodeInput, setCouponCodeInput] = useState('')
  const [coupon, setCoupon] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const stores = items.reduce((acc, item) => {
    const storeId = item.storeId;
    const storeName = item.store?.name || item.storeName || "Store";

    if (!acc[storeId]) {
      acc[storeId] = {
        name: storeName,
        subtotal: 0,
      };
    }

    acc[storeId].subtotal += item.price * item.quantity;

    return acc;
  }, {});

  const shippingCost = Object.values(stores).reduce((sum, store) => {
    if (
      totalPrice >= settings.freeDeliveryAbove
    ) {
      return sum;
    }

    return sum + settings.deliveryFee;
  }, 0);

  const discount = coupon ? (coupon.discount / 100) * totalPrice : 0
  const finalTotal = totalPrice + shippingCost - discount

  /* ---------------- COUPON ---------------- */
  const handleCouponCode = async (e) => {
    e.preventDefault()
    if (!couponCodeInput.trim()) return

    try {
      if (!user) return toast.error('Please login to apply coupon')

      const token = await getToken()
      const { data } = await axios.post(
        '/api/coupon',
        { code: couponCodeInput.toUpperCase() },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      setCoupon(data.coupon)
      toast.success('Coupon applied successfully!')
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Invalid coupon code')
    }
  }

  /* ---------------- PLACE ORDER ---------------- */
  const handlePlaceOrder = async (e) => {
    e.preventDefault()

    try {
      if (!user) return toast.error('Please login to place order')
      if (!selectedAddress) return toast.error('Please select a delivery address')

      setIsProcessing(true)
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

      // Stripe Redirect
      if (paymentMethod === 'STRIPE') {
        window.location.href = data.session.url
        return
      }

      // COD Flow
      toast.success(data.message || 'Order placed successfully! 🎉')
      await axios.delete('/api/cart', {
        headers: { Authorization: `Bearer ${token}` },
      })
      dispatch(clearCart())
      router.push('/orders')

    } catch (err) {
      toast.error(err?.response?.data?.error || err.message)
      setIsProcessing(false)
    }
  }

  useEffect(() => {
    async function loadSettings() {
      try {
        const { data } = await axios.get("/api/platform/settings");
        setSettings(data);
      } catch {
        console.log("Using default settings");
      }
    }

    loadSettings();
  }, []);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-6 shadow-xl text-slate-200">

      <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        Order Summary
      </h2>

      {/* PAYMENT METHOD */}
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Payment Method</p>
        <div className="grid grid-cols-2 gap-3">

          <div
            onClick={() => setPaymentMethod('COD')}
            className={`cursor-pointer rounded-xl border p-3 flex flex-col items-center gap-2 transition-all ${paymentMethod === 'COD'
              ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400'
              : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600'
              }`}
          >
            <BanknoteIcon size={24} />
            <span className="text-xs font-semibold">COD</span>
          </div>

          <div
            onClick={() => toast.error('Stripe service is currently unavailable')}
            className={`cursor-not-allowed opacity-50 rounded-xl border p-3 flex flex-col items-center gap-2 transition-all ${paymentMethod === 'STRIPE'
              ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400'
              : 'bg-slate-950 border-slate-800 text-slate-500'
              }`}
          >
            <CreditCardIcon size={24} />
            <span className="text-xs font-semibold">Card</span>
          </div>

        </div>
      </div>

      {/* ADDRESS SECTION */}
      <div className="mb-6 pt-6 border-t border-slate-800/80">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Delivery Address</p>
          <button
            onClick={() => setShowAddressModal(true)}
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
          >
            <PlusIcon size={14} /> Add New
          </button>
        </div>

        {selectedAddress ? (
          <div className="bg-slate-950 border border-indigo-500/30 rounded-xl p-4 relative group">
            <div className="flex gap-3">
              <MapPinIcon size={18} className="text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-white mb-1">{selectedAddress.name}</p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {selectedAddress.city}, {selectedAddress.state} <br /> {selectedAddress.zip}
                </p>
              </div>
            </div>
            <button
              onClick={() => setSelectedAddress(null)}
              className="absolute top-3 right-3 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded transition-colors"
            >
              Change
            </button>
          </div>
        ) : (
          <div className="relative">
            {/* FIXED SELECT DROPDOWN */}
            <select
              className="w-full bg-slate-950 text-white text-sm border border-slate-700 hover:border-slate-600 rounded-xl p-3.5 appearance-none outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer"
              onChange={e => {
                const index = e.target.value
                if (index !== '') setSelectedAddress(addressList[index])
              }}
              defaultValue=""
            >
              <option value="" disabled className="bg-slate-900 text-slate-400">Choose an address...</option>
              {addressList.map((addr, i) => (
                <option key={i} value={i} className="bg-slate-900 text-white">
                  {addr.name} — {addr.city}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
              ▼
            </div>
          </div>
        )}
      </div>

      {/* COUPON SECTION */}
      <div className="mb-6 pt-6 border-t border-slate-800/80">
        {!coupon ? (
          <form onSubmit={handleCouponCode} className="relative flex items-center">
            <TagIcon size={18} className="absolute left-3.5 text-slate-500" />
            <input
              value={couponCodeInput}
              onChange={e => setCouponCodeInput(e.target.value)}
              placeholder="Have a promo code?"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-24 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500 transition-colors uppercase"
            />
            <button
              type="submit"
              disabled={!couponCodeInput.trim()}
              className="absolute right-2 top-2 bottom-2 bg-slate-800 hover:bg-indigo-600 disabled:bg-slate-800 disabled:text-slate-600 text-white text-xs font-bold px-4 rounded-lg transition-colors"
            >
              Apply
            </button>
          </form>
        ) : (
          <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl">
            <div className="flex items-center gap-2">
              <CheckCircle2Icon size={18} className="text-emerald-400" />
              <span className="text-sm font-bold text-emerald-400 uppercase tracking-wide">
                {coupon.code}
              </span>
            </div>
            <button
              onClick={() => { setCoupon(null); setCouponCodeInput(''); }}
              className="text-emerald-400 hover:text-emerald-300 p-1 bg-emerald-500/10 rounded-md transition-colors"
            >
              <XIcon size={14} />
            </button>
          </div>
        )}
      </div>

      {/* PRICE BREAKDOWN */}
      <div className="pt-6 border-t border-slate-800/80 space-y-4">

        {Object.values(stores).map((store, index) => (
          <div
            key={index}
            className="rounded-xl bg-slate-950 border border-slate-800 p-3"
          >

            <p className="text-sm font-bold text-white mb-2">
              {store.name}
            </p>

            <div className="flex justify-between text-sm text-slate-400">
              <span>Products</span>
              <span>
                {currency}
                {store.subtotal}
              </span>
            </div>

            <div className="flex justify-between text-sm text-slate-400 mt-1">
              <span>Delivery</span>

              <Protect
                plan="prime"
                fallback={
                  <span>{currency}{settings.deliveryFee}</span>
                }
              >
                <span className="text-emerald-400 font-bold">
                  Free
                </span>
              </Protect>

            </div>

          </div>
        ))}

        <div className="flex justify-between text-sm text-slate-400">
          <span>Subtotal</span>
          <span className="text-white">
            {currency}{totalPrice}
          </span>
        </div>

        <div className="flex justify-between text-sm text-slate-400">
          <span>Total Delivery</span>

          <Protect
            plan="prime"
            fallback={
              <span className="text-white">
                {currency}{shippingCost}
              </span>
            }
          >
            <span className="font-bold text-emerald-400">
              Free
            </span>
          </Protect>

        </div>

        {coupon && (
          <div className="flex justify-between text-sm text-emerald-400">
            <span>
              Discount ({coupon.discount}%)
            </span>
            <span>
              -{currency}{discount.toFixed(2)}
            </span>
          </div>
        )}

      </div>

      {/* TOTAL */}
      <div className="flex justify-between items-center mt-6 pt-6 border-t border-slate-700 border-dashed">
        <span className="text-base text-slate-400">Total</span>
        <span className="text-3xl font-black text-white">{currency}{finalTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
      </div>

      {/* PLACE ORDER BUTTON */}
      <button
        onClick={handlePlaceOrder}
        disabled={isProcessing || !selectedAddress}
        className={`w-full mt-8 py-4 rounded-xl font-bold tracking-wide transition-all shadow-lg flex items-center justify-center gap-2
          ${isProcessing || !selectedAddress
            ? 'bg-slate-800 text-slate-500 cursor-not-allowed shadow-none'
            : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/25 active:scale-[0.98]'
          }`}
      >
        {isProcessing ? 'Processing...' : 'Complete Checkout'}
      </button>

      {showAddressModal && (
        <AddressModal setShowAddressModal={setShowAddressModal} />
      )}
    </div>
  )
}

export default OrderSummary