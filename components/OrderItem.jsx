'use client'

import Image from "next/image"
import { DotIcon, CreditCard } from "lucide-react"
import { useSelector } from "react-redux"
import Rating from "./Rating"
import { useState } from "react"
import RatingModal from "./RatingModal"

const OrderItem = ({ order, mobile, onCancel }) => {
  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '₹'
  const [ratingModal, setRatingModal] = useState(null)
  const { ratings } = useSelector(state => state.rating)

  const paymentLabel = {
    STRIPE: 'Card / Stripe',
    RAZORPAY: 'Razorpay',
    COD: 'Cash on Delivery',
    UPI: 'UPI',
  }[order.paymentMethod] || order.paymentMethod

  const statusColor = {
    CONFIRMED: 'text-yellow-400 bg-yellow-400/10',
    DELIVERED: 'text-emerald-400 bg-emerald-400/10',
    SHIPPED: 'text-cyan-400 bg-cyan-400/10',
    CANCELLED: 'text-red-400 bg-red-400/10',
  }[order.status] || 'text-white/60 bg-white/10'

  const isDelivered = order.status === 'DELIVERED'
  const isCanceled = order.status === 'CANCELLED'

  return (
    <>
      {/* Desktop */}
      <tr className="hidden md:table-row bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
        <td className="py-6 pl-6">
          <div className="flex flex-col gap-6">
            {order.orderItems.map((item, index) => {
              const existingRating = ratings.find(
                r => r.orderId === order.id && r.productId === item.product.id
              )
              return (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-20 aspect-square bg-white/10 rounded-xl flex items-center justify-center">
                    <Image
                      src={item.product.images[0]}
                      alt={item.product.name}
                      width={56}
                      height={56}
                      className="object-contain"
                    />
                  </div>

                  <div>
                    <p className="font-medium text-white">{item.product.name}</p>
                    <p className="text-sm text-white/60">
                      {currency}{item.price} × {item.quantity}
                    </p>
                    <p className="text-xs text-white/50">
                      {new Date(order.createdAt).toDateString()}
                    </p>

                    <div className="mt-1">
                      {existingRating ? (
                        <Rating value={existingRating.rating} />
                      ) : (
                        <button
                          onClick={() =>
                            setRatingModal({
                              orderId: order.id,
                              productId: item.product.id,
                            })
                          }
                          className={`text-emerald-400 text-sm hover:underline ${!isDelivered && 'hidden'
                            }`}
                        >
                          Rate Product
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </td>

        <td className="text-center font-semibold">{currency}{order.total}</td>

        <td className="text-white/70 flex items-center gap-2">
          <CreditCard size={14} /> {paymentLabel}
        </td>

        <td className="text-white/60 max-w-xs">
          <p>{order.address.name}</p>
          <p>{order.address.city}, {order.address.state}</p>
        </td>

        <td>
          <span
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs ${statusColor}`}
          >
            <DotIcon size={10} className="scale-150" />
            {order.status.replace(/_/g, ' ').toLowerCase()}
          </span>
        </td>

        <td className="text-center">
          {!isCanceled && onCancel && (
            <button
              onClick={onCancel}
              className="px-4 py-1 bg-red-600 rounded hover:bg-red-500 text-sm"
            >
              Cancel
            </button>
          )}
        </td>
      </tr>

      {/* Mobile */}
      <tr className="md:hidden">
        <td colSpan={5} className="py-6">
          <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 space-y-3">
            {order.orderItems.map((item, idx) => {
              const existingRating = ratings.find(
                r => r.orderId === order.id && r.productId === item.product.id
              );
              return (
                <div key={idx} className="border-b border-white/10 pb-3 mb-3 last:border-none last:pb-0 last:mb-0">
                  <div className="w-20 aspect-square bg-white/10 rounded-xl flex items-center justify-center mb-2">
                    <Image
                      src={item.product.images[0]}
                      alt={item.product.name}
                      width={56}
                      height={56}
                      className="object-contain"
                    />
                  </div>

                  <p className="text-sm text-white/60">{item.product.name}</p>
                  <p className="text-xs text-white/50">{currency}{item.price} × {item.quantity}</p>
                  <p className="text-xs text-white/50">{new Date(order.createdAt).toDateString()}</p>

                  {existingRating ? (
                    <Rating value={existingRating.rating} />
                  ) : (
                    isDelivered && (
                      <button
                        onClick={() =>
                          setRatingModal({ orderId: order.id, productId: item.product.id })
                        }
                        className="text-emerald-400 text-sm hover:underline mt-1"
                      >
                        Rate Product
                      </button>
                    )
                  )}
                </div>
              );
            })}

            <p className="text-sm"><span className="text-white/50">Payment:</span> {paymentLabel}</p>
            <p className="text-sm text-white/60">{order.address.name}, {order.address.street}, {order.address.city}, {order.address.state}, {order.address.zip}</p>
            <p className="text-sm text-white/50">{order.address.phone}</p>

            <div className="flex justify-between items-center">
              <span className={`px-6 py-1.5 rounded-full text-xs ${statusColor}`}>
                {order.status.replace(/_/g, ' ').toLowerCase()}
              </span>
              {!isCanceled && onCancel && (
                <button
                  onClick={onCancel}
                  className="px-4 py-1 bg-red-600 rounded hover:bg-red-500 text-sm"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </td>
      </tr>

      {ratingModal && <RatingModal ratingModal={ratingModal} setRatingModal={setRatingModal} />}
    </>
  )
}

export default OrderItem
