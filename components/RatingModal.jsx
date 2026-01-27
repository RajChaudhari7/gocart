'use client'
import { Star, X, Camera } from 'lucide-react';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '@clerk/nextjs';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { addRating } from '@/lib/features/rating/ratingSlice';
import { motion, AnimatePresence } from 'framer-motion';

const RatingModal = ({ ratingModal, setRatingModal }) => {
  const { getToken } = useAuth();
  const dispatch = useDispatch();

  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [photos, setPhotos] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(/Mobi|Android/i.test(navigator.userAgent));
  }, []);

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    setPhotos(files);
  };

  const handleSubmit = async () => {
    if (rating < 1 || rating > 5) return toast('Please select a rating');
    if (review.length < 5) return toast('Write a short review');

    try {
      setSubmitting(true);
      const token = await getToken();

      const formData = new FormData();
      formData.append('productId', ratingModal.productId);
      formData.append('orderId', ratingModal.orderId);
      formData.append('rating', rating);
      formData.append('review', review);

      photos.forEach((photo) => formData.append('photos', photo));

      const { data } = await axios.post('/api/rating', formData, {
        headers: {
          Authorization: `Bearer ${token}`, // ✅ FIXED (no Content-Type)
        },
      });

      dispatch(addRating(data.rating));
      toast.success(data.message);

      setRating(0);
      setReview('');
      setPhotos([]);
      setRatingModal(null);
    } catch (error) {
      toast.error(error?.response?.data?.error || error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {ratingModal && (
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
            <button
              onClick={() => setRatingModal(null)}
              className="absolute top-4 right-4 text-white/70 hover:text-white transition"
            >
              <X size={24} />
            </button>

            <h2 className="text-2xl font-semibold text-white mb-4 text-center">
              Rate Product
            </h2>

            <div className="flex justify-center gap-2 mb-4">
              {Array.from({ length: 5 }, (_, i) => (
                <motion.div
                  key={i}
                  whileTap={{ scale: 1.3 }}
                  onClick={() => setRating(i + 1)}
                >
                  <Star
                    className={`cursor-pointer transition-transform duration-150 ${
                      rating > i ? 'text-yellow-400 fill-current scale-110' : 'text-gray-600'
                    }`}
                  />
                </motion.div>
              ))}
            </div>

            <textarea
              className="w-full p-3 rounded-xl border border-white/20 bg-white/5 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-400 mb-4 transition"
              placeholder="Write your review..."
              rows={4}
              value={review}
              onChange={(e) => setReview(e.target.value)}
            />

            <label className="flex items-center gap-3 cursor-pointer mb-4">
              <Camera className="text-white/70" size={24} />
              <span className="text-white/70 text-sm">
                {isMobile ? "Take a photo or upload from gallery" : "Upload photos"}
              </span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoChange}
                hidden
                {...(isMobile ? { capture: "environment" } : {})}
              />
            </label>

            {photos.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {photos.map((file, idx) => (
                  <img
                    key={idx}
                    src={URL.createObjectURL(file)}
                    alt={`review-photo-${idx}`}
                    className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-lg"
                  />
                ))}
              </div>
            )}

            <motion.button
              onClick={() => toast.promise(handleSubmit(), { loading: 'Submitting...' })}
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold py-2 rounded-2xl transition"
              whileTap={{ scale: 0.95 }}
              animate={submitting ? { scale: [1, 1.1, 1] } : { scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 10 }}
            >
              Submit Rating
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RatingModal;
