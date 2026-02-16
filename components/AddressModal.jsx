'use client'

import { addAddress } from '@/lib/features/address/addressSlice'
import { useAuth } from '@clerk/nextjs'
import axios from 'axios'
import { XIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { useDispatch } from 'react-redux'

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
  })

  const [errors, setErrors] = useState({})

  // 🌍 Country & State
  const [countries, setCountries] = useState([])
  const [states, setStates] = useState([])
  const [loadingStates, setLoadingStates] = useState(false)
  const [pinLoading, setPinLoading] = useState(false)

  // ✅ PIN verification flag
  const [isPinVerified, setIsPinVerified] = useState(false)

  /* ---------------- FETCH COUNTRIES + PRELOAD INDIA ---------------- */
  useEffect(() => {
    const init = async () => {
      try {
        const { data } = await axios.get(
          'https://country-api.drnyeinchan.com/v1/countries'
        )
        setCountries(data)

        // 🇮🇳 Auto-select India
        setAddress((prev) => ({
          ...prev,
          country: INDIA_NAME,
          state: '',
          city: '',
          zip: '',
        }))

        setIsPinVerified(false)

        // 🇮🇳 Preload Indian states
        setLoadingStates(true)
        const statesRes = await axios.get(
          `https://country-api.drnyeinchan.com/v1/countries/${INDIA_CODE}/states`
        )
        setStates(statesRes.data)
      } catch (err) {
        console.error('Init failed')
      } finally {
        setLoadingStates(false)
      }
    }

    init()
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
  const handleCountrySelect = async (e) => {
    const countryCode = e.target.value
    const countryName =
      countries.find((c) => c.code === countryCode)?.name || ''

    setAddress((prev) => ({
      ...prev,
      country: countryName,
      state: '',
      city: '',
      zip: '',
    }))

    setIsPinVerified(false)

    if (!countryCode) {
      setStates([])
      return
    }

    // Country Api
    try {
      setLoadingStates(true)
      const { data } = await axios.get(
        `https://country-api.drnyeinchan.com/v1/countries/${countryCode}/states`
      )
      setStates(data)
    } catch {
      setStates([])
    } finally {
      setLoadingStates(false)
    }
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

      setAddress((prev) => ({
        ...prev,
        city: detectedCity,
        state: detectedState,
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
                {loadingStates ? 'Loading states...' : 'Select State'}
              </option>
              {states.map((s) => (
                <option key={s.code} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                <p className="text-xs text-slate-500">Verifying PIN...</p>
              )}
              {isPinVerified && (
                <p className="text-xs text-green-600">PIN verified ✓</p>
              )}
              {errors.zip && <p className="error-text">{errors.zip}</p>}
            </div>

            <select
              value={
                countries.find((c) => c.name === address.country)?.code || ''
              }
              onChange={handleCountrySelect}
              required
              className="input"
            >
              <option value="">Select Country</option>
              {countries.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </select>
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
