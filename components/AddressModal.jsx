'use client'

import { addAddress } from '@/lib/features/address/addressSlice'
import { useAuth } from '@clerk/nextjs'
import axios from 'axios'
import { XIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { useDispatch } from 'react-redux'
import { indianStates } from '@/assets/indianStates'

const INDIA_CODE = 'IN'
const INDIA_NAME = 'India'

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
    latitude: null,
    longitude: null
  })

  const [errors, setErrors] = useState({})

  //  Country & State
  const countries = [{ name: 'India', code: 'IN' }]
  const [states, setStates] = useState([])
  const [loadingStates, setLoadingStates] = useState(false)
  const [pinLoading, setPinLoading] = useState(false)

  // PIN verification flag
  const [isPinVerified, setIsPinVerified] = useState(false)

  /* ---------------- FETCH COUNTRIES + PRELOAD INDIA ---------------- */
  useEffect(() => {
    // 🇮🇳 Set India by default
    setAddress((prev) => ({
      ...prev,
      country: INDIA_NAME,
    }))

    // 🇮🇳 Load Indian states
    setStates(indianStates)
  }, [])

  /* ---------------- INPUT HANDLER ---------------- */
  const handleAddressChange = (e) => {
    const { name, value } = e.target

    if (name === 'phone') {
      if (!/^\d*$/.test(value)) return
      if (value.length > 10) return
    }

    if (name === 'zip') {
      if (!/^\d*$/.test(value)) return
      if (value.length > 6) return
      setIsPinVerified(false) // zip edited → invalidate
    }

    if (name === 'city') {
      setIsPinVerified(false)
    }

    setAddress({ ...address, [name]: value })
    setErrors({ ...errors, [name]: '' })
  }

  /* ---------------- COUNTRY CHANGE ---------------- */
  const handleCountrySelect = (e) => {
    const countryCode = e.target.value

    setAddress((prev) => ({
      ...prev,
      country: INDIA_NAME,
    }))

    setStates(indianStates)
    setIsPinVerified(false)
  }

  /* ---------------- STATE CHANGE ---------------- */
  const handleStateSelect = (e) => {
    setAddress((prev) => ({ ...prev, state: e.target.value }))
    setIsPinVerified(false)
  }

  /* ---------------- 🇮🇳 PIN CODE LOOKUP ---------------- */
  const handlePinBlur = async () => {
    if (address.country !== INDIA_NAME) return
    if (address.zip.length !== 6) return

    try {
      setPinLoading(true)

      const { data } = await axios.get(
        `https://api.postalpincode.in/pincode/${address.zip}`
      )

      if (data[0].Status !== 'Success') {
        setErrors((prev) => ({
          ...prev,
          zip: 'Invalid PIN code',
        }))
        setIsPinVerified(false)
        return
      }

      const postOffice = data[0].PostOffice[0]
      const detectedCity = postOffice.District
      const detectedState = postOffice.State

      // find matching state from dropdown list
      const matchedState = states.find(
        (s) => s.name.toLowerCase().trim() === detectedState.toLowerCase().trim()
      )
      setAddress((prev) => ({
        ...prev,
        city: detectedCity,
        state: matchedState ? matchedState.name : detectedState,
        country: INDIA_NAME,
      }))
      setIsPinVerified(true)
      setErrors((prev) => ({ ...prev, zip: '' }))
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        zip: 'PIN verification failed',
      }))
      setIsPinVerified(false)
    } finally {
      setPinLoading(false)
    }
  }

  /* ---------------- VALIDATION ---------------- */
  const validate = () => {
    const newErrors = {}

    if (address.phone.length !== 10) {
      newErrors.phone = 'Phone number must be exactly 10 digits'
    }

    if (address.country === INDIA_NAME) {
      if (address.zip.length !== 6) {
        newErrors.zip = 'Indian PIN must be 6 digits'
      }

      if (!isPinVerified) {
        newErrors.zip = 'Please verify PIN code'
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

      if (!data?.newAddress) {
        toast.error("Address not saved properly")
        return
      }

      dispatch(addAddress(data.newAddress))
      toast.success(data.message)
      setShowAddressModal(false)
    } catch (err) {
      toast.error(err?.response?.data?.error || err.message)
    }
  }

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {

          setAddress(prev => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }))

        },
        (error) => {
          console.log("Location permission denied", error)
        }
      )

    }
  }, [])

  return (
    <form
      onSubmit={(e) =>
        toast.promise(handleSubmit(e), { loading: 'Saving address...' })
      }
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center px-3 sm:px-4"
    >
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-700 animate-scaleIn">
        <XIcon
          size={22}
          onClick={() => setShowAddressModal(false)}
          className="absolute top-4 right-4 cursor-pointer"
        />

        <h2 className="text-xl sm:text-2xl font-semibold mb-4">
          Add New Address
        </h2>

        <div className="space-y-3">
          <input name="name" value={address.name} onChange={handleAddressChange} placeholder="Full Name" required className="input" />
          <input name="email" type="email" value={address.email} onChange={handleAddressChange} placeholder="Email Address" required className="input" />
          <input name="street" value={address.street} onChange={handleAddressChange} placeholder="Street Address" required className="input" />

          {/* PIN CODE */}
          <div>
            <input
              name="zip"
              value={address.zip}
              onChange={handleAddressChange}
              onBlur={handlePinBlur}
              placeholder="PIN Code (Auto-verified)"
              className={`input ${errors.zip ? 'error' : ''}`}
            />

            {pinLoading && (
              <p className="text-xs text-slate-500">
                Verifying PIN...
              </p>
            )}

            {isPinVerified && (
              <p className="text-xs text-green-600">
                PIN verified ✓
              </p>
            )}

            {errors.zip && (
              <p className="error-text">
                {errors.zip}
              </p>
            )}
          </div>

          {/* CITY + STATE */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

            <input
              name="city"
              value={address.city}
              onChange={handleAddressChange}
              placeholder="City (Auto-filled by PIN)"
              required
              disabled={isPinVerified}
              className="input"
            />

            <select
              value={address.state}
              onChange={handleStateSelect}
              required
              disabled={loadingStates || isPinVerified}
              className="input"
            >
              <option value="">
                {loadingStates
                  ? 'Loading states...'
                  : 'Select State'}
              </option>

              {states.map((s) => (
                <option key={s.code} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>

          </div>

          {/* COUNTRY */}
          <select
            value={
              countries.find(
                (c) => c.name === address.country
              )?.code || ''
            }
            onChange={handleCountrySelect}
            required
            className="input"
          >
            <option value="">
              Select Country
            </option>

            {countries.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </select>
          <div>
            <input
              name="phone"
              value={address.phone}
              onChange={handleAddressChange}
              placeholder="Phone Number"
              required
              className={`input ${errors.phone ? 'error' : ''}`}
            />
            {errors.phone && <p className="error-text">{errors.phone}</p>}
          </div>
        </div>

        <button
          type="submit"
          className="w-full mt-6 py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium"
        >
          Save Address
        </button>
      </div>

      <style jsx>{`
        .input {
          width: 100%;
          padding: 0.65rem 0.75rem;
          border-radius: 0.5rem;
          border: 1px solid rgb(203 213 225);
          background: white;
          outline: none;
          color: rgb(15 23 42);
          font-size: 16px;
        }

        .dark .input {
          background: rgb(15 23 42);
          border-color: rgb(51 65 85);
          color: rgb(226 232 240);
        }

        .input::placeholder {
          color: rgb(100 116 139);
        }

        .dark .input::placeholder {
          color: rgb(148 163 184);
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
