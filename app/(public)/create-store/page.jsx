'use client'
import { assets } from "@/assets/assets"
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
        if (!enteredCode) return toast.error("Please enter the OTP")
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

    // Reusable styling classes for ultra-clean UI
    const inputClass = "block w-full rounded-xl border-0 py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 transition-all duration-200 bg-gray-50/50 hover:bg-gray-50 focus:bg-white outline-none dark:bg-white/5 dark:text-white dark:ring-white/10 dark:focus:ring-indigo-500 dark:hover:bg-white/10"
    const labelClass = "block text-sm font-medium leading-6 text-gray-900 dark:text-gray-100 mb-2"

    if (!user) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center px-6">
                <div className="bg-white dark:bg-zinc-900 p-10 rounded-3xl shadow-xl ring-1 ring-gray-200 dark:ring-zinc-800 text-center max-w-md w-full">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Login Required</h1>
                    <p className="text-gray-500 dark:text-gray-400">Please login to create your GlobalMart store.</p>
                </div>
            </div>
        )
    }

    return !loading ? (
        <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 selection:bg-indigo-100 selection:text-indigo-900">
            {!alreadySubmitted ? (
                <div className="max-w-3xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-10">
                        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
                            Launch Your Store
                        </h1>
                        <p className="mt-3 text-sm sm:text-base text-gray-600 dark:text-gray-400">
                            Join <span className="font-semibold text-gray-900 dark:text-white">GlobalMart</span> and showcase your products to millions.
                        </p>
                    </div>

                    {/* Form Card */}
                    <form 
                        onSubmit={e => toast.promise(onSubmitHandler(e), { loading: "Setting up your store..." })}
                        className="bg-white dark:bg-zinc-900 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-gray-200 dark:ring-zinc-800 rounded-2xl sm:rounded-3xl overflow-hidden"
                    >
                        <div className="p-6 sm:p-10 space-y-12">
                            
                            {/* Section 1: Store Profile */}
                            <div>
                                <h2 className="text-lg font-semibold leading-7 text-gray-900 dark:text-white">Store Profile</h2>
                                <p className="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-400">This information will be displayed publicly on your store page.</p>

                                <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-6">
                                    {/* Logo Upload - Clean unified component */}
                                    <div className="col-span-full">
                                        <label className={labelClass}>Store Logo</label>
                                        <div className="mt-2 flex items-center gap-x-5">
                                            <div className="h-24 w-24 sm:h-20 sm:w-20 rounded-2xl bg-gray-50 dark:bg-zinc-800 ring-1 ring-inset ring-gray-200 dark:ring-zinc-700 flex items-center justify-center overflow-hidden shrink-0">
                                                {storeInfo.image ? (
                                                    <Image
                                                        src={URL.createObjectURL(storeInfo.image)}
                                                        alt="Logo Preview"
                                                        width={96}
                                                        height={96}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <ImagePlus className="h-8 w-8 text-gray-400" strokeWidth={1.5} />
                                                )}
                                            </div>
                                            <label className="rounded-xl bg-white dark:bg-zinc-800 px-4 py-2.5 text-sm font-semibold text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-zinc-600 hover:bg-gray-50 dark:hover:bg-zinc-700 cursor-pointer transition-colors">
                                                Change Logo
                                                <input type="file" accept="image/*" onChange={(e) => setStoreInfo({ ...storeInfo, image: e.target.files[0] })} hidden />
                                            </label>
                                        </div>
                                    </div>

                                    <div className="sm:col-span-3">
                                        <label className={labelClass}>Username</label>
                                        <input name="username" onChange={onChangeHandler} value={storeInfo.username} type="text" placeholder="@yourstore" className={inputClass} />
                                    </div>

                                    <div className="sm:col-span-3">
                                        <label className={labelClass}>Store Name</label>
                                        <input name="name" onChange={onChangeHandler} value={storeInfo.name} type="text" placeholder="e.g. Acme Corp" className={inputClass} />
                                    </div>

                                    <div className="col-span-full">
                                        <label className={labelClass}>Description</label>
                                        <textarea name="description" onChange={onChangeHandler} value={storeInfo.description} rows={3} placeholder="Tell customers what your store is about..." className={`${inputClass} resize-none`} />
                                    </div>
                                </div>
                            </div>

                            <hr className="border-gray-200 dark:border-zinc-800" />

                            {/* Section 2: Contact Details */}
                            <div>
                                <h2 className="text-lg font-semibold leading-7 text-gray-900 dark:text-white">Contact Details</h2>
                                <p className="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-400">Where customers and support can reach you.</p>

                                <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-6">
                                    <div className="sm:col-span-3">
                                        <label className={labelClass}>Support Email</label>
                                        <input name="email" onChange={onChangeHandler} value={storeInfo.email} type="email" placeholder="support@yourstore.com" className={inputClass} />
                                    </div>

                                    <div className="sm:col-span-3">
                                        <label className={labelClass}>Business Phone</label>
                                        <div className="mt-2 flex gap-2">
                                            <input 
                                                name="contact" 
                                                onChange={onChangeHandler} 
                                                value={storeInfo.contact} 
                                                type="text" 
                                                placeholder="10-digit number" 
                                                maxLength={10} 
                                                className={inputClass} 
                                                disabled={whatsappVerified} 
                                            />
                                            {!whatsappVerified && (
                                                <button type="button" onClick={sendOtp} className="shrink-0 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-4 py-3 text-sm font-semibold hover:opacity-90 transition-opacity">
                                                    Send OTP
                                                </button>
                                            )}
                                        </div>

                                        {/* OTP Input Field */}
                                        {!whatsappVerified && storeInfo.contact.length === 10 && (
                                            <div className="mt-3 flex gap-2 animate-in slide-in-from-top-2 fade-in duration-300">
                                                <input 
                                                    type="text" 
                                                    placeholder="Enter 6-digit code" 
                                                    value={enteredCode} 
                                                    onChange={(e) => setEnteredCode(e.target.value)} 
                                                    className={inputClass} 
                                                />
                                                <button type="button" onClick={verifyOtp} className="shrink-0 rounded-xl bg-indigo-600 text-white px-6 py-3 text-sm font-semibold hover:bg-indigo-500 transition-colors">
                                                    Verify
                                                </button>
                                            </div>
                                        )}

                                        {whatsappVerified && (
                                            <div className="mt-2.5 flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                                                <ShieldCheck size={18} /> Verified Successfully
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <hr className="border-gray-200 dark:border-zinc-800" />

                            {/* Section 3: Legal & Location */}
                            <div>
                                <h2 className="text-lg font-semibold leading-7 text-gray-900 dark:text-white">Legal & Location</h2>
                                <p className="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-400">Required for taxation and shipping purposes.</p>

                                <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-6">
                                    <div className="sm:col-span-full">
                                        <label className={labelClass}>Registered GST Number</label>
                                        <input name="gst" onChange={onChangeHandler} value={storeInfo.gst} type="text" placeholder="15-character GSTIN" maxLength={15} className={inputClass} />
                                        {storeInfo.gst.length > 0 && (
                                            <p className={`mt-2 text-sm font-medium flex items-center gap-1.5 ${gstValid ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500"}`}>
                                                {gstValid ? (
                                                    <><CheckCircle2 size={16} /> Valid GST format</>
                                                ) : storeInfo.gst.length < 15 ? (
                                                    "GST must be exactly 15 characters"
                                                ) : (
                                                    <><XCircle size={16} /> Invalid GST format</>
                                                )}
                                            </p>
                                        )}
                                    </div>

                                    <div className="col-span-full">
                                        <label className={labelClass}>Business Address</label>
                                        <textarea name="address" onChange={onChangeHandler} value={storeInfo.address} rows={3} placeholder="Complete registered business address..." className={`${inputClass} resize-none`} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Submit Action Footer */}
                        <div className="bg-gray-50 dark:bg-zinc-800/50 px-6 py-5 sm:px-10 border-t border-gray-200 dark:border-zinc-800 flex items-center justify-end gap-x-4">
                            {(!gstValid || !whatsappVerified) && (
                                <span className="text-sm text-gray-500 hidden sm:block">
                                    Please verify number & GST to submit
                                </span>
                            )}
                            <button
                                disabled={!gstValid || !whatsappVerified}
                                className={`w-full sm:w-auto px-8 py-3.5 text-sm font-semibold rounded-xl transition-all duration-300
                                    ${gstValid && whatsappVerified
                                        ? "bg-indigo-600 text-white hover:bg-indigo-500 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
                                        : "bg-gray-200 text-gray-400 dark:bg-zinc-700 dark:text-zinc-500 cursor-not-allowed"
                                    }`}
                            >
                                Submit Application
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="min-h-[60vh] flex flex-col items-center justify-center">
                    <div className="bg-white dark:bg-zinc-900 p-10 sm:p-14 rounded-3xl shadow-xl ring-1 ring-gray-200 dark:ring-zinc-800 max-w-lg w-full text-center relative overflow-hidden">
                        <div className="relative z-10">
                            <div className="mb-8 flex justify-center">
                                {status === "approved" && <CheckCircle2 className="text-emerald-500" size={64} strokeWidth={1.5} />}
                                {status === "pending" && <Clock className="text-amber-500" size={64} strokeWidth={1.5} />}
                                {status === "rejected" && <XCircle className="text-rose-500" size={64} strokeWidth={1.5} />}
                            </div>
                            
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                                {status === "approved" && "Application Approved!"}
                                {status === "pending" && "Application Under Review"}
                                {status === "rejected" && "Application Rejected"}
                            </h2>
                            
                            <p className="text-gray-500 dark:text-gray-400 leading-relaxed mb-8">
                                {message}
                            </p>

                            {status === "approved" && (
                                <div className="inline-flex items-center gap-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-6 py-3 rounded-full font-medium text-sm border border-emerald-100 dark:border-emerald-500/20">
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