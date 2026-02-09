'use client'

import { Star, X } from 'lucide-react'
import { useState, useEffect, useMemo } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '@clerk/nextjs'
import { useDispatch } from 'react-redux'
import axios from 'axios'
import { addRating } from '@/lib/features/rating/ratingSlice'
import { motion, AnimatePresence } from 'framer-motion'

const ratingLabels = ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent']

const RatingModal = ({ order, onClose, onSuccess }) => {
  const { getToken } = useAuth()
  const dispatch = useDispatch()

  const [rating, setRating] = useState(0)
  const [review, setReview] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const firstItem = useMemo(() => {
    return order?.orderItems?.[0] || null
  }, [order])

  const handleSubmit = async () => {
    if (!firstItem?.productId) {
      toast.error('Product not found for this order')
      return
    }

    if (rating < 1 || rating > 5) {
      toast('Please select a rating')
      return
    }

    if (review.trim().length < 5) {
      toast('Write a short review')
      return
    }

    const toastId = toast.loading('Submitting...')
    setSubmitting(true)

    try {
      const token = await getToken()

      const payload = {
        productId: firstItem.productId,
        orderId: order.id,
        rating,
        review,
      }

      const { data } = await axios.post('/api/rating', payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      dispatch(addRating(data.rating))
      toast.success(data.message || 'Rating submitted', { id: toastId })

      setRating(0)
      setReview('')

      onSuccess?.()
      onClose()
    } catch (error) {
      console.error('RATING ERROR:', error)
      toast.error(
        error?.response?.data?.error || error.message,
        { id: toastId }
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="relative bg-gradient-to-br from-gray-800 to-gray-900 p-6 sm:p-8 rounded-3xl shadow-2xl w-full max-w-md border border-white/10"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white"
          >
            <X size={24} />
          </button>

          <h2 className="text-2xl font-semibold text-white mb-4 text-center">
            Rate Product
          </h2>

          {/* Stars */}
          <div className="flex justify-center gap-2 mb-1">
            {Array.from({ length: 5 }, (_, i) => (
              <motion.div
                key={i}
                whileTap={{ scale: 1.3 }}
                onClick={() => setRating(i + 1)}
              >
                <Star
                  className={`cursor-pointer ${
                    rating > i
                      ? 'text-yellow-400 fill-current scale-110'
                      : 'text-gray-600'
                  }`}
                />
              </motion.div>
            ))}
          </div>

          {rating > 0 && (
            <p className="text-center text-yellow-400 text-sm mb-3">
              {ratingLabels[rating - 1]}
            </p>
          )}

          <textarea
            className="w-full p-3 rounded-xl border border-white/20 bg-white/5 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-400 mb-4"
            placeholder="Write your review..."
            rows={4}
            value={review}
            onChange={(e) => setReview(e.target.value)}
          />

          <motion.button
            disabled={submitting}
            onClick={handleSubmit}
            className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:opacity-50 text-gray-900 font-semibold py-2 rounded-2xl"
            whileTap={{ scale: 0.95 }}
          >
            {submitting ? 'Submitting...' : 'Submit Rating'}
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default RatingModal
