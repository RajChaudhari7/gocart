'use client'
import { useEffect, useState } from "react"
import Image from "next/image"
import toast from "react-hot-toast"
import Loading from "@/components/Loading"
import { useAuth, useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import axios from "axios"
import { CheckCircle2, XCircle, Clock, ShieldCheck, ImagePlus } from "lucide-react"

export default function CreateStore() {
    const { user } = useUser()
    const router = useRouter()
    const { getToken } = useAuth()

    const [alreadySubmitted, setAlreadySubmitted] = useState(false)
    const [status, setStatus] = useState("")
    const [loading, setLoading] = useState(true)
    const [message, setMessage] = useState("")
    const [countdown, setCountdown] = useState(5)

    const [gstValid, setGstValid] = useState(false)
    const [gstError, setGstError] = useState("")

    const [storeInfo, setStoreInfo] = useState({
        name: "",
        username: "",
        description: "",
        email: "",
        contact: "",
        address: "",
        image: "",
        gst: "",
        category: "",
        customCategory: ""
    })

    const validateGST = (gst) => {
        const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
        if (!gst) {
            setGstError("GST is required")
            setGstValid(false)
            return
        }
        if (!gstRegex.test(gst)) {
            setGstError("Invalid GST format")
            setGstValid(false)
            return
        }
        setGstError("")
        setGstValid(true)
    }

    const onChangeHandler = (e) => {
        const { name, value } = e.target

        if (name === "contact") {
            const val = value.replace(/\D/g, "")
            if (val.length > 10) return
            setStoreInfo({ ...storeInfo, contact: val })
            return
        }

        if (name === "gst") {
            const val = value.toUpperCase()
            setStoreInfo({ ...storeInfo, gst: val })

            if (val.length === 15) {
                validateGST(val)
            } else {
                setGstValid(false)
                setGstError("GST must be exactly 15 characters")
            }
            return
        }

        setStoreInfo({ ...storeInfo, [name]: value })
    }

    const fetchSellerStatus = async () => {
        const token = await getToken()
        try {
            const { data } = await axios.get('/api/store/create', {
                headers: { Authorization: `Bearer ${token}` }
            })

            if (['approved', 'rejected', 'pending'].includes(data.status)) {
                setStatus(data.status)
                setAlreadySubmitted(true)

                if (data.status === 'approved') {
                    setMessage("Your store is approved! Redirecting...")
                } else if (data.status === 'rejected') {
                    setMessage("Your store request has been rejected.")
                } else {
                    setMessage("Your store is under review.")
                }
            } else {
                setAlreadySubmitted(false)
            }
        } catch (error) {
            toast.error(error?.response?.data?.error || error.message)
        }
        setLoading(false)
    }

    const onSubmitHandler = async (e) => {
        e.preventDefault()

        if (!user) return toast("Please login")
        if (storeInfo.contact.length !== 10) return toast.error("Enter valid phone")

        try {
            const token = await getToken()
            const formData = new FormData()

            Object.keys(storeInfo).forEach(key => {
                formData.append(key, storeInfo[key])
            })

            const { data } = await axios.post('/api/store/create', formData, {
                headers: { Authorization: `Bearer ${token}` }
            })

            toast.success(data.message)
            await fetchSellerStatus()

        } catch (error) {
            toast.error(error?.response?.data?.error || error.message)
        }
    }

    useEffect(() => {
        if (status !== "approved") return
        if (countdown === 0) {
            router.push("/store")
            return
        }
        const timer = setTimeout(() => setCountdown(prev => prev - 1), 1000)
        return () => clearTimeout(timer)
    }, [status, countdown])

    useEffect(() => {
        if (user) fetchSellerStatus()
    }, [user])

    const inputClass = "block w-full rounded-xl py-3 px-4 ring-1 ring-gray-200 bg-gray-50"

    if (!user) return <Loading />

    return !loading ? (
        <div className="max-w-3xl mx-auto pt-24">

            {!alreadySubmitted ? (
                <form onSubmit={onSubmitHandler} className="space-y-6">

                    <h1 className="text-2xl font-bold">Create Store</h1>

                    <input name="name" placeholder="Store Name" onChange={onChangeHandler} className={inputClass} />
                    <input name="username" placeholder="Username" onChange={onChangeHandler} className={inputClass} />
                    <input name="email" placeholder="Email" onChange={onChangeHandler} className={inputClass} />

                    {/* ✅ SIMPLE PHONE INPUT */}
                    <input
                        name="contact"
                        placeholder="10-digit phone number"
                        value={storeInfo.contact}
                        onChange={onChangeHandler}
                        className={inputClass}
                    />

                    <input name="gst" placeholder="GST Number" onChange={onChangeHandler} className={inputClass} />

                    {storeInfo.gst && (
                        <p className={gstValid ? "text-green-500" : "text-red-500"}>
                            {gstValid ? "Valid GST" : gstError}
                        </p>
                    )}

                    <textarea name="address" placeholder="Address" onChange={onChangeHandler} className={inputClass} />

                    <select
                        onChange={(e) => setStoreInfo({ ...storeInfo, category: e.target.value })}
                        className={inputClass}
                    >
                        <option value="">Select Category</option>
                        <option>Clothing</option>
                        <option>Electronics</option>
                        <option>Grocery</option>
                        <option>Other</option>
                    </select>

                    {storeInfo.category === "Other" && (
                        <input
                            placeholder="Custom Category"
                            onChange={(e) => setStoreInfo({ ...storeInfo, customCategory: e.target.value })}
                            className={inputClass}
                        />
                    )}

                    <input type="file" onChange={(e) => setStoreInfo({ ...storeInfo, image: e.target.files[0] })} />

                    <button
                        disabled={
                            !gstValid ||
                            storeInfo.contact.length !== 10 ||
                            !storeInfo.category
                        }
                        className="bg-indigo-600 text-white px-6 py-3 rounded-xl disabled:bg-gray-300"
                    >
                        Submit
                    </button>
                </form>
            ) : (
                <div className="text-center">
                    <h2 className="text-xl font-bold">{status}</h2>
                    <p>{message}</p>
                </div>
            )}

        </div>
    ) : <Loading />
}