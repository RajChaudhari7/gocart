'use client'

import { assets } from "@/assets/assets"
import { useEffect, useState } from "react"
import Image from "next/image"
import toast from "react-hot-toast"
import Loading from "@/components/Loading"
import { useAuth, useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import axios from "axios"
import { CheckCircle, XCircle, Clock } from "lucide-react"

/* ------------------ REUSABLE COMPONENTS ------------------ */

const Input = ({ label, ...props }) => (
  <div>
    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
      {label}
    </label>
    <input
      {...props}
      className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none"
    />
  </div>
)

const Textarea = ({ label, ...props }) => (
  <div>
    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
      {label}
    </label>
    <textarea
      {...props}
      rows={4}
      className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
    />
  </div>
)

/* ------------------ MAIN COMPONENT ------------------ */

export default function CreateStore() {
  const { user } = useUser()
  const { getToken } = useAuth()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [alreadySubmitted, setAlreadySubmitted] = useState(false)
  const [status, setStatus] = useState("")
  const [message, setMessage] = useState("")
  const [countdown, setCountdown] = useState(5)

  const [enteredCode, setEnteredCode] = useState("")
  const [whatsappVerified, setWhatsappVerified] = useState(false)

  const [gstValid, setGstValid] = useState(false)
  const [gstError, setGstError] = useState("")

  const [storeInfo, setStoreInfo] = useState({
    name: "",
    username: "",
    description: "",
    email: "",
    contact: "",
    address: "",
    image: null,
    gst: ""
  })

  /* ------------------ OTP ------------------ */

  const sendOtp = async () => {
    if (storeInfo.contact.length !== 10) {
      return toast.error("Enter valid number")
    }

    try {
      await axios.post("/api/sms/send-otp", {
        phone: storeInfo.contact
      })

      toast.success("OTP sent")
    } catch {
      toast.error("Failed to send OTP")
    }
  }

  const verifyOtp = async () => {
    try {
      const { data } = await axios.post("/api/sms/verify-otp", {
        phone: storeInfo.contact,
        otp: enteredCode
      })

      if (data.success) {
        setWhatsappVerified(true)
        toast.success("Verified successfully")
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Invalid OTP")
    }
  }

  /* ------------------ GST ------------------ */

  const validateGST = (gst) => {
    const regex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/

    if (!regex.test(gst)) {
      setGstValid(false)
      setGstError("Invalid GST number")
    } else {
      setGstValid(true)
      setGstError("")
    }
  }

  /* ------------------ INPUT ------------------ */

  const onChangeHandler = (e) => {
    const { name, value } = e.target

    if (name === "contact") {
      const val = value.replace(/\D/g, "")
      if (val.length > 10) return

      setStoreInfo({ ...storeInfo, contact: val })
      setWhatsappVerified(false)
      return
    }

    if (name === "gst") {
      const val = value.toUpperCase()
      setStoreInfo({ ...storeInfo, gst: val })

      if (val.length === 15) validateGST(val)
      return
    }

    setStoreInfo({ ...storeInfo, [name]: value })
  }

  /* ------------------ FETCH STATUS ------------------ */

  const fetchStatus = async () => {
    const token = await getToken()

    try {
      const { data } = await axios.get("/api/store/create", {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (["approved", "pending", "rejected"].includes(data.status)) {
        setAlreadySubmitted(true)
        setStatus(data.status)

        if (data.status === "approved") {
          setMessage("Store approved 🎉")
        } else if (data.status === "pending") {
          setMessage("Waiting for approval...")
        } else {
          setMessage("Store rejected")
        }
      }
    } catch (err) {
      toast.error(err.message)
    }

    setLoading(false)
  }

  /* ------------------ SUBMIT ------------------ */

  const onSubmitHandler = async (e) => {
    e.preventDefault()

    if (!user) return toast.error("Login required")

    if (!whatsappVerified)
      return toast.error("Verify number first")

    try {
      const token = await getToken()

      const formData = new FormData()
      Object.entries(storeInfo).forEach(([key, val]) => {
        formData.append(key, val)
      })

      const { data } = await axios.post("/api/store/create", formData, {
        headers: { Authorization: `Bearer ${token}` }
      })

      toast.success(data.message)
      fetchStatus()

    } catch (err) {
      toast.error(err.response?.data?.error || err.message)
    }
  }

  /* ------------------ EFFECTS ------------------ */

  useEffect(() => {
    if (user) fetchStatus()
  }, [user])

  useEffect(() => {
    if (status === "approved") {
      if (countdown === 0) return router.push("/store")
      setTimeout(() => setCountdown(prev => prev - 1), 1000)
    }
  }, [countdown, status])

  /* ------------------ UI ------------------ */

  if (!user) return <div className="text-center mt-20">Login required</div>
  if (loading) return <Loading />

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-900 dark:to-black p-4">

      {!alreadySubmitted ? (
        <div className="w-full max-w-4xl bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-2xl">

          <h1 className="text-3xl font-bold text-center mb-8">
            Create Store 🚀
          </h1>

          <form onSubmit={onSubmitHandler} className="space-y-6">

            {/* Image */}
            <div className="flex justify-center">
              <label className="cursor-pointer">
                <Image
                  src={storeInfo.image ? URL.createObjectURL(storeInfo.image) : assets.upload_area}
                  width={120}
                  height={120}
                  alt=""
                  className="rounded-xl border"
                />
                <input
                  type="file"
                  hidden
                  onChange={(e) =>
                    setStoreInfo({ ...storeInfo, image: e.target.files[0] })
                  }
                />
              </label>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <Input name="username" label="Username" onChange={onChangeHandler} />
              <Input name="name" label="Store Name" onChange={onChangeHandler} />
              <Input name="email" label="Email" onChange={onChangeHandler} />
              <Input name="contact" label="Contact" onChange={onChangeHandler} />
            </div>

            <Textarea name="description" label="Description" onChange={onChangeHandler} />

            {/* OTP */}
            <div className="flex gap-2">
              <button type="button" onClick={sendOtp} className="btn">
                Send OTP
              </button>
              <input
                value={enteredCode}
                onChange={(e) => setEnteredCode(e.target.value)}
                className="flex-1 border p-2 rounded"
              />
              <button type="button" onClick={verifyOtp} className="btn bg-green-500">
                Verify
              </button>
            </div>

            {/* GST */}
            <Input name="gst" label="GST" onChange={onChangeHandler} />
            {storeInfo.gst && (
              <p className={gstValid ? "text-green-500" : "text-red-500"}>
                {gstValid ? "Valid GST" : gstError}
              </p>
            )}

            <Textarea name="address" label="Address" onChange={onChangeHandler} />

            <button
              disabled={!gstValid || !whatsappVerified}
              className="w-full bg-indigo-600 text-white py-3 rounded-xl"
            >
              Submit
            </button>

          </form>
        </div>

      ) : (
        <div className="text-center">
          <p className="text-xl">{message}</p>
        </div>
      )}
    </div>
  )
}