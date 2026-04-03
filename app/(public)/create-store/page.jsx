'use client'
import { assets } from "@/assets/assets"
import { useEffect, useState } from "react"
import Image from "next/image"
import toast from "react-hot-toast"
import Loading from "@/components/Loading"
import { useAuth, useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import axios from "axios"
import { CheckCircle, XCircle, Clock, ShieldCheck, UploadCloud } from "lucide-react"

export default function CreateStore() {
    const { user } = useUser()
    const router = useRouter()
    const { getToken } = useAuth()

    const [alreadySubmitted, setAlreadySubmitted] = useState(false)
    const [status, setStatus] = useState("")
    const [loading, setLoading] = useState(true)
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
        image: "",
        gst: "",
        isWhatsapp: false
    })

    const sendOtp = async () => {
        if (storeInfo.contact.length !== 10) {
            toast.error("Enter a valid 10-digit number")
            return
        }

        try {
            const { data } = await axios.post("/api/sms/send-otp", {
                phone: storeInfo.contact
            })
            toast.success("OTP sent via SMS")
        } catch (err) {
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
                toast.success("Number verified successfully")
            }
        } catch (err) {
            toast.error(err.response?.data?.error || "Verification failed")
        }
    }

    const validateGST = (gst) => {
        const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

        if (!gst) {
            setGstError("GST is required")
            setGstValid(false)
            return
        }

        if (!gstRegex.test(gst)) {
            setGstError("Invalid GST number format")
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
            setWhatsappVerified(false)
            setEnteredCode("")
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
                switch (data.status) {
                    case 'approved':
                        setMessage("Your store is approved! You can now add products from the dashboard.")
                        setCountdown(5)
                        break;
                    case 'rejected':
                        setMessage("Your store request has been rejected. Contact administration for more details.")
                        break;
                    case 'pending':
                        setMessage("Your store request is currently under review. Please wait for admin approval.")
                        break;
                    default:
                        break;
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

        if (!user) return toast("Please login to continue")
        if (storeInfo.contact.length !== 10) return toast.error("Contact number must be 10 digits")
        if (!whatsappVerified) return toast.error("Please verify your number before submitting")

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

        const timer = setTimeout(() => {
            setCountdown(prev => prev - 1)
        }, 1000)

        return () => clearTimeout(timer)
    }, [status, countdown, router])

    useEffect(() => {
        if (user) fetchSellerStatus()
    }, [user])

    // Common input styling class
    const inputClass = "mt-2 w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all duration-200 outline-none dark:bg-zinc-800/50 dark:border-zinc-700 dark:text-white dark:focus:ring-white dark:focus:bg-zinc-800 text-gray-900"
    const labelClass = "text-sm font-medium text-gray-700 dark:text-gray-300"

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950 px-6">
                <div className="bg-white dark:bg-zinc-900 p-10 rounded-3xl shadow-xl border border-gray-100 dark:border-zinc-800 text-center max-w-md w-full">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Welcome Back
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">Please login to create your GlobalMart store.</p>
                </div>
            </div>
        )
    }

    return !loading ? (
        <div className="min-h-screen bg-[#fafafa] dark:bg-zinc-950 py-12 px-4 sm:px-6 lg:px-8 selection:bg-zinc-900 selection:text-white dark:selection:bg-white dark:selection:text-zinc-900">
            {!alreadySubmitted ? (
                <div className="max-w-4xl mx-auto">
                    {/* Header Section */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-4">
                            Launch Your Store
                        </h1>
                        <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
                            Join <span className="font-semibold text-black dark:text-white">GlobalMart</span> and showcase your products to millions. Fill out the details below to get verified and start selling.
                        </p>
                    </div>

                    {/* Form Section */}
                    <form
                        onSubmit={e => toast.promise(onSubmitHandler(e), { loading: "Setting up your store..." })}
                        className="bg-white dark:bg-zinc-900 rounded-[2rem] shadow-sm border border-gray-200/60 dark:border-zinc-800 p-6 sm:p-10 lg:p-12"
                    >
                        {/* Section 1: Store Profile */}
                        <div className="mb-10">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                <span className="bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
                                Store Profile
                            </h2>
                            
                            <div className="flex flex-col sm:flex-row gap-8 items-start mb-8">
                                <label className="group relative flex flex-col items-center justify-center w-32 h-32 rounded-2xl border-2 border-dashed border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800/50 hover:bg-gray-100 dark:hover:bg-zinc-800 cursor-pointer transition-all overflow-hidden shrink-0">
                                    {storeInfo.image ? (
                                        <Image
                                            src={URL.createObjectURL(storeInfo.image)}
                                            alt="Store Logo"
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center gap-2 text-gray-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
                                            <UploadCloud size={28} />
                                            <span className="text-xs font-medium">Upload Logo</span>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setStoreInfo({ ...storeInfo, image: e.target.files[0] })}
                                        hidden
                                    />
                                </label>
                                
                                <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <label className={labelClass}>Username</label>
                                        <input
                                            name="username"
                                            onChange={onChangeHandler}
                                            value={storeInfo.username}
                                            type="text"
                                            placeholder="@yourstore"
                                            className={inputClass}
                                        />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Store Name</label>
                                        <input
                                            name="name"
                                            onChange={onChangeHandler}
                                            value={storeInfo.name}
                                            type="text"
                                            placeholder="e.g. Acme Corp"
                                            className={inputClass}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className={labelClass}>Description</label>
                                <textarea
                                    name="description"
                                    onChange={onChangeHandler}
                                    value={storeInfo.description}
                                    rows={3}
                                    placeholder="Tell customers what your store is about..."
                                    className={`${inputClass} resize-none`}
                                />
                            </div>
                        </div>

                        <hr className="border-gray-100 dark:border-zinc-800 my-10" />

                        {/* Section 2: Contact Details */}
                        <div className="mb-10">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                <span className="bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
                                Contact Details
                            </h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <label className={labelClass}>Support Email</label>
                                    <input
                                        name="email"
                                        onChange={onChangeHandler}
                                        value={storeInfo.email}
                                        type="email"
                                        placeholder="support@yourstore.com"
                                        className={inputClass}
                                    />
                                </div>
                                
                                <div className="bg-gray-50 dark:bg-zinc-800/30 p-4 rounded-2xl border border-gray-100 dark:border-zinc-700/50">
                                    <label className={labelClass}>Business Phone</label>
                                    <div className="relative">
                                        <input
                                            name="contact"
                                            onChange={onChangeHandler}
                                            value={storeInfo.contact}
                                            type="text"
                                            placeholder="10-digit number"
                                            maxLength={10}
                                            className={`${inputClass} pr-24`}
                                            disabled={whatsappVerified}
                                        />
                                        {!whatsappVerified && storeInfo.contact.length === 10 && (
                                            <button
                                                type="button"
                                                onClick={sendOtp}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 mt-1 px-3 py-1.5 text-sm font-medium bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 rounded-lg hover:opacity-90 transition-opacity"
                                            >
                                                Send OTP
                                            </button>
                                        )}
                                    </div>

                                    {!whatsappVerified && enteredCode !== undefined && (
                                        <div className="mt-4 flex gap-3 animate-in fade-in slide-in-from-top-2">
                                            <input
                                                type="text"
                                                placeholder="Enter OTP"
                                                value={enteredCode}
                                                onChange={(e) => setEnteredCode(e.target.value)}
                                                className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-zinc-900 outline-none dark:bg-zinc-800 dark:border-zinc-600 dark:text-white dark:focus:ring-white transition-all"
                                            />
                                            <button
                                                type="button"
                                                onClick={verifyOtp}
                                                className="px-6 py-2.5 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 font-medium rounded-xl hover:opacity-90 transition-opacity"
                                            >
                                                Verify
                                            </button>
                                        </div>
                                    )}

                                    {whatsappVerified && (
                                        <div className="mt-3 flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                                            <ShieldCheck size={18} />
                                            Number securely verified
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <hr className="border-gray-100 dark:border-zinc-800 my-10" />

                        {/* Section 3: Legal & Location */}
                        <div className="mb-10">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                <span className="bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">3</span>
                                Legal & Location
                            </h2>
                            
                            <div className="grid grid-cols-1 gap-8">
                                <div>
                                    <label className={labelClass}>Registered GST Number</label>
                                    <input
                                        name="gst"
                                        onChange={onChangeHandler}
                                        value={storeInfo.gst}
                                        type="text"
                                        placeholder="15-character GSTIN"
                                        maxLength={15}
                                        className={inputClass}
                                    />
                                    {storeInfo.gst.length > 0 && (
                                        <p className={`mt-2 text-sm font-medium flex items-center gap-1 ${gstValid ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500"}`}>
                                            {gstValid ? (
                                                <><CheckCircle size={16} /> Valid GST format</>
                                            ) : storeInfo.gst.length < 15 ? (
                                                "GST must be exactly 15 characters"
                                            ) : (
                                                <><XCircle size={16} /> Invalid GST format</>
                                            )}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className={labelClass}>Business Address</label>
                                    <textarea
                                        name="address"
                                        onChange={onChangeHandler}
                                        value={storeInfo.address}
                                        rows={3}
                                        placeholder="Complete registered business address..."
                                        className={`${inputClass} resize-none`}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Submit Action */}
                        <div className="pt-6 mt-6 border-t border-gray-100 dark:border-zinc-800">
                            <button
                                disabled={!gstValid || !whatsappVerified}
                                className={`w-full py-4 text-lg font-semibold rounded-xl transition-all duration-300
                                    ${gstValid && whatsappVerified
                                        ? "bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-gray-100 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
                                        : "bg-gray-100 text-gray-400 dark:bg-zinc-800 dark:text-zinc-500 cursor-not-allowed"
                                    }`}
                            >
                                Submit Store Request
                            </button>
                            {(!gstValid || !whatsappVerified) && (
                                <p className="text-center text-sm text-gray-500 mt-4">
                                    Please complete GST validation and number verification to continue.
                                </p>
                            )}
                        </div>
                    </form>
                </div>
            ) : (
                <div className="min-h-[70vh] flex flex-col items-center justify-center">
                    <div className="bg-white dark:bg-zinc-900 p-10 sm:p-14 rounded-[2rem] shadow-2xl border border-gray-100 dark:border-zinc-800 max-w-lg w-full text-center relative overflow-hidden">
                        
                        {/* Background subtle glow */}
                        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 opacity-20 blur-3xl rounded-full
                            ${status === "approved" ? "bg-emerald-500" : ""}
                            ${status === "pending" ? "bg-amber-500" : ""}
                            ${status === "rejected" ? "bg-rose-500" : ""}
                        `} />

                        <div className="relative z-10">
                            <div className="mb-8 flex justify-center transform transition-transform hover:scale-110 duration-300">
                                {status === "approved" && <CheckCircle className="text-emerald-500" size={72} strokeWidth={1.5} />}
                                {status === "pending" && <Clock className="text-amber-500" size={72} strokeWidth={1.5} />}
                                {status === "rejected" && <XCircle className="text-rose-500" size={72} strokeWidth={1.5} />}
                            </div>
                            
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                {status === "approved" && "Application Approved!"}
                                {status === "pending" && "Application Under Review"}
                                {status === "rejected" && "Application Rejected"}
                            </h2>
                            
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                                {message}
                            </p>

                            {status === "approved" && (
                                <div className="inline-flex items-center gap-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-6 py-3 rounded-full font-medium text-sm">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    Redirecting to dashboard in {countdown}s
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    ) : (
        <Loading />
    )
}