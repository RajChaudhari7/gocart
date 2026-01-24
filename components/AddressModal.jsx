'use client'

import { addAddress } from '@/lib/features/address/addressSlice'
import { useAuth } from '@clerk/nextjs'
import axios from 'axios'
import { XIcon } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { toast } from 'react-hot-toast'
import { useDispatch } from 'react-redux'
import * as z from 'zod'
import parsePhoneNumber from 'libphonenumber-js'

// ---------------- ZOD SCHEMA ----------------
const addressSchema = z.object({
  name: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  street: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zip: z
    .string()
    .regex(/^\d{6}$/, 'Zip code must be exactly 6 digits'),
  country: z.string().min(1, 'Country is required'),
  phone: z.string().min(1, 'Phone number is required'),
})

const AddressModal = ({ setShowAddressModal }) => {
  const { getToken } = useAuth()
  const dispatch = useDispatch()

  const [address, setAddress] = useState({
    name: '',
    email: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    country: '',
    phone: '',
  })

  const [errors, setErrors] = useState({})
  const [debouncedAddress, setDebouncedAddress] = useState(address)

  /* ---------------- INPUT HANDLER ---------------- */
  const handleAddressChange = (e) => {
    const { name, value } = e.target

    // PHONE → only digits (will validate properly later with country)
    if (name === 'phone' && !/^\d*$/.test(value)) return

    // ZIP → only digits, max 6
    if (name === 'zip') {
      if (!/^\d*$/.test(value)) return
      if (value.length > 6) return
    }

    setAddress({ ...address, [name]: value })
    setErrors({ ...errors, [name]: '' })
  }

  /* ---------------- DEBOUNCE INPUT ---------------- */
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedAddress(address)
    }, 500) // 500ms debounce

    return () => clearTimeout(handler)
  }, [address])

  /* ---------------- VALIDATION ---------------- */
  const validate = () => {
    const result = addressSchema.safeParse(debouncedAddress)
    const newErrors = {}

    if (!result.success) {
      result.error.errors.forEach((err) => {
        newErrors[err.path[0]] = err.message
      })
    }

    // Country-based phone validation
    if (debouncedAddress.phone && debouncedAddress.country) {
      try {
        const phoneNumber = parsePhoneNumber(
          debouncedAddress.phone,
          debouncedAddress.country.toUpperCase()
        )
        if (!phoneNumber.isValid()) {
          newErrors.phone = 'Invalid phone number for the country'
        }
      } catch {
        newErrors.phone = 'Invalid phone number'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validate()) {
      toast.error('Please fix validation errors')
      return
    }

    try {
      const token = await getToken()

      const { data } = await axios.post(
        '/api/address',
        { address },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      dispatch(addAddress(data.newAddress))
      toast.success(data.message)
      setShowAddressModal(false)
    } catch (err) {
      toast.error(err?.response?.data?.error || err.message)
    }
  }

  return (
    <form
      onSubmit={(e) =>
        toast.promise(handleSubmit(e), { loading: 'Saving address...' })
      }
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center px-4"
    >
      {/* MODAL */}
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 animate-scaleIn">
        <XIcon
          size={22}
          onClick={() => setShowAddressModal(false)}
          className="absolute top-4 right-4 cursor-pointer text-slate-500 hover:text-slate-800 dark:hover:text-white"
        />

        <h2 className="text-2xl font-semibold mb-1 text-slate-900 dark:text-white">
          Add New Address
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
          Used for delivery & billing
        </p>

        <div className="space-y-3">
          <input
            name="name"
            value={address.name}
            onChange={handleAddressChange}
            placeholder="Full Name"
            required
            className={`input ${errors.name ? 'error' : ''}`}
          />
          {errors.name && <p className="error-text">{errors.name}</p>}

          <input
            name="email"
            type="email"
            value={address.email}
            onChange={handleAddressChange}
            placeholder="Email Address"
            required
            className={`input ${errors.email ? 'error' : ''}`}
          />
          {errors.email && <p className="error-text">{errors.email}</p>}

          <input
            name="street"
            value={address.street}
            onChange={handleAddressChange}
            placeholder="Street Address"
            required
            className={`input ${errors.street ? 'error' : ''}`}
          />
          {errors.street && <p className="error-text">{errors.street}</p>}

          <div className="grid grid-cols-2 gap-3">
            <input
              name="city"
              value={address.city}
              onChange={handleAddressChange}
              placeholder="City"
              required
              className={`input ${errors.city ? 'error' : ''}`}
            />
            {errors.city && <p className="error-text">{errors.city}</p>}

            <input
              name="state"
              value={address.state}
              onChange={handleAddressChange}
              placeholder="State"
              required
              className={`input ${errors.state ? 'error' : ''}`}
            />
            {errors.state && <p className="error-text">{errors.state}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <input
                name="zip"
                value={address.zip}
                onChange={handleAddressChange}
                placeholder="Zip Code"
                className={`input ${errors.zip ? 'error' : ''}`}
              />
              {errors.zip && <p className="error-text">{errors.zip}</p>}
            </div>

            <input
              name="country"
              value={address.country}
              onChange={handleAddressChange}
              placeholder="Country (ISO code e.g. US)"
              required
              className={`input ${errors.country ? 'error' : ''}`}
            />
            {errors.country && <p className="error-text">{errors.country}</p>}
          </div>

          <div>
            <input
              name="phone"
              value={address.phone}
              onChange={handleAddressChange}
              placeholder="Phone Number"
              className={`input ${errors.phone ? 'error' : ''}`}
            />
            {errors.phone && <p className="error-text">{errors.phone}</p>}
          </div>
        </div>

        <button
          type="submit"
          className="w-full mt-6 py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium hover:opacity-90 active:scale-95 transition"
        >
          Save Address
        </button>
      </div>

      {/* STYLES */}
      <style jsx>{`
        .input {
          width: 100%;
          padding: 0.6rem 0.75rem;
          border-radius: 0.5rem;
          border: 1px solid rgb(203 213 225);
          background: white;
          outline: none;
        }
        .dark .input {
          background: rgb(15 23 42);
          border-color: rgb(51 65 85);
          color: rgb(226 232 240);
        }
        .error {
          border-color: rgb(239 68 68);
        }
        .error-text {
          font-size: 0.75rem;
          color: rgb(239 68 68);
          margin-top: 2px;
        }
        .animate-scaleIn {
          animation: scaleIn 0.2s ease-out;
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </form>
  )
}

export default AddressModal
