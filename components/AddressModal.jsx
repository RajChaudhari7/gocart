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
    country: INDIA_NAME,
    phone: '',
  })

  const [errors, setErrors] = useState({})
  const [countries, setCountries] = useState([])
  const [states, setStates] = useState([])
  const [loadingStates, setLoadingStates] = useState(false)
  const [pinLoading, setPinLoading] = useState(false)
  const [isPinVerified, setIsPinVerified] = useState(false)

  /* ---------------- INIT ---------------- */
  useEffect(() => {
    const init = async () => {
      try {
        const { data } = await axios.get(
          'https://country-api.drnyeinchan.com/v1/countries'
        )
        setCountries(data)

        // Load India states
        setLoadingStates(true)
        const res = await axios.get(
          `https://country-api.drnyeinchan.com/v1/countries/${INDIA_CODE}/states`
        )
        setStates(res.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoadingStates(false)
      }
    }

    init()
  }, [])

  /* ---------------- INPUT ---------------- */
  const handleAddressChange = (e) => {
    const { name, value } = e.target

    if (name === 'phone') {
      if (!/^\d*$/.test(value)) return
      if (value.length > 10) return
    }

    if (name === 'zip') {
      if (!/^\d*$/.test(value)) return
      if (value.length > 6) return

      setAddress((prev) => ({ ...prev, zip: value }))
      setIsPinVerified(false)

      // 🔥 FIX: call with VALUE not state
      if (value.length === 6) {
        handlePinLookup(value)
      }
      return
    }

    setAddress((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  /* ---------------- PIN LOOKUP ---------------- */
  const handlePinLookup = async (zip) => {
    try {
      setPinLoading(true)

      const res = await axios.get(
        `https://api.postalpincode.in/pincode/${zip}`
      )

      const result = res.data?.[0]

      if (!result || result.Status !== 'Success') {
        throw new Error('Invalid PIN')
      }

      const po = result.PostOffice?.[0]

      if (!po) throw new Error('No location found')

      const detectedState = po.State
      const detectedCity = po.District

      // ✅ Ensure state exists in dropdown
      const matchedState = states.find(
        (s) => s.name.toLowerCase() === detectedState.toLowerCase()
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
      setIsPinVerified(false)
      setErrors((prev) => ({
        ...prev,
        zip: 'Invalid PIN code',
      }))
    } finally {
      setPinLoading(false)
    }
  }

  /* ---------------- VALIDATION ---------------- */
  const validate = () => {
    const newErrors = {}

    if (address.phone.length !== 10) {
      newErrors.phone = 'Phone must be 10 digits'
    }

    if (!isPinVerified) {
      newErrors.zip = 'Verify PIN code'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validate()) {
      toast.error('Fix errors first')
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
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-3"
    >
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xl">

        <XIcon
          onClick={() => setShowAddressModal(false)}
          className="absolute top-4 right-4 cursor-pointer"
        />

        <h2 className="text-xl font-semibold mb-4">Add Address</h2>

        <div className="space-y-3">
          <input name="name" placeholder="Name" className="input" onChange={handleAddressChange} />
          <input name="email" placeholder="Email" className="input" onChange={handleAddressChange} />
          <input name="street" placeholder="Street" className="input" onChange={handleAddressChange} />

          <input
            name="zip"
            placeholder="PIN Code"
            className="input"
            onChange={handleAddressChange}
          />

          {pinLoading && <p className="text-xs">Checking...</p>}
          {isPinVerified && <p className="text-xs text-green-600">✓ Verified</p>}
          {errors.zip && <p className="text-xs text-red-500">{errors.zip}</p>}

          <input value={address.city} disabled className="input" placeholder="City" />

          <select value={address.state} className="input" disabled>
            <option>{address.state || 'State'}</option>
          </select>

          <input
            name="phone"
            placeholder="Phone"
            className="input"
            onChange={handleAddressChange}
          />
        </div>

        <button className="w-full mt-4 py-3 bg-black text-white rounded-xl">
          Save Address
        </button>
      </div>

      <style jsx>{`
        .input {
          width: 100%;
          padding: 10px;
          border: 1px solid #ccc;
          border-radius: 8px;
        }
      `}</style>
    </form>
  )
}

export default AddressModal