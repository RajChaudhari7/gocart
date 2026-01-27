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

export default function CreateStore() {
    const { user } = useUser()
    const router = useRouter()
    const { getToken } = useAuth()

    const [alreadySubmitted, setAlreadySubmitted] = useState(false)
    const [status, setStatus] = useState("")
    const [loading, setLoading] = useState(true)
    const [message, setMessage] = useState("")

    const [storeInfo, setStoreInfo] = useState({
        name: "",
        username: "",
        description: "",
        email: "",
        contact: "",
        address: "",
        image: ""
    })

    const onChangeHandler = (e) => {
        // For contact, limit to 10 digits only
        if (e.target.name === "contact") {
            const val = e.target.value.replace(/\D/g, "") // remove non-digits
            if (val.length > 10) return
            setStoreInfo({ ...storeInfo, contact: val })
        } else {
            setStoreInfo({ ...storeInfo, [e.target.name]: e.target.value })
        }
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
                        setMessage("Your store has been approved! You can now add products from the dashboard.")
                        setTimeout(() => router.push("/store"), 5000)
                        break;

                    case 'rejected':
                        setMessage("Your store request has been rejected. Contact admin for more details.")
                        break;

                    case 'pending':
                        setMessage("Your store request is pending. Please wait for admin approval.")
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
        try {
            const token = await getToken()
            const formData = new FormData()
            formData.append("name", storeInfo.name)
            formData.append("username", storeInfo.username)
            formData.append("description", storeInfo.description)
            formData.append("email", storeInfo.email)
            formData.append("contact", storeInfo.contact)
            formData.append("address", storeInfo.address)
            formData.append("image", storeInfo.image)

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
        if (user) fetchSellerStatus()
    }, [user])

    if (!user) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center px-6">
                <h1 className="text-2xl sm:text-4xl font-semibold text-center">
                    Please <span className="text-indigo-500">Login</span> to continue
                </h1>
            </div>
        )
    }

    return !loading ? (
        <>
            {!alreadySubmitted ? (
                <div className="mx-6 min-h-[70vh] my-16 flex flex-col items-center">
                    {/* Header Section */}
                    <div className="text-center mb-10 max-w-2xl">
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Join Us by Creating Your Store</h1>
                        <p className="mt-3 text-lg text-gray-600 dark:text-gray-300">
                            Become a seller on <span className="font-semibold text-indigo-600">GlobalMart</span> and reach thousands of customers worldwide. Submit your store details below and get verified by our team to start selling!
                        </p>
                    </div>

                    {/* Form Section */}
                    <form 
                        onSubmit={e => toast.promise(onSubmitHandler(e), { loading: "Submitting data..." })}
                        className="w-full max-w-3xl bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 space-y-6"
                    >
                        {/* Store Logo */}
                        <label className="block cursor-pointer">
                            <span className="font-medium text-gray-700 dark:text-gray-200">Store Logo</span>
                            <div className="mt-2 flex items-center gap-4">
                                <Image 
                                    src={storeInfo.image ? URL.createObjectURL(storeInfo.image) : assets.upload_area} 
                                    alt="Store Logo" 
                                    width={100} 
                                    height={100} 
                                    className="rounded-lg border border-gray-300 dark:border-gray-700 object-contain h-24 w-24"
                                />
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    onChange={(e) => setStoreInfo({ ...storeInfo, image: e.target.files[0] })} 
                                    hidden 
                                />
                                <span className="text-sm text-gray-500 dark:text-gray-400">Click the image to upload</span>
                            </div>
                        </label>

                        {/* Username & Name */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <label className="text-gray-700 dark:text-gray-200">Username</label>
                                <input 
                                    name="username" 
                                    onChange={onChangeHandler} 
                                    value={storeInfo.username} 
                                    type="text" 
                                    placeholder="Enter your store username" 
                                    className="mt-1 w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-gray-700 dark:text-gray-200">Store Name</label>
                                <input 
                                    name="name" 
                                    onChange={onChangeHandler} 
                                    value={storeInfo.name} 
                                    type="text" 
                                    placeholder="Enter your store name" 
                                    className="mt-1 w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="text-gray-700 dark:text-gray-200">Description</label>
                            <textarea 
                                name="description" 
                                onChange={onChangeHandler} 
                                value={storeInfo.description} 
                                rows={4} 
                                placeholder="Enter your store description" 
                                className="mt-1 w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 resize-none focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>

                        {/* Email & Contact */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <label className="text-gray-700 dark:text-gray-200">Email</label>
                                <input 
                                    name="email" 
                                    onChange={onChangeHandler} 
                                    value={storeInfo.email} 
                                    type="email" 
                                    placeholder="Enter your store email" 
                                    className="mt-1 w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-gray-700 dark:text-gray-200">Contact Number</label>
                                <input 
                                    name="contact" 
                                    onChange={onChangeHandler} 
                                    value={storeInfo.contact} 
                                    type="text" 
                                    placeholder="Enter 10-digit contact number" 
                                    maxLength={10}
                                    className="mt-1 w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                        </div>

                        {/* Address */}
                        <div>
                            <label className="text-gray-700 dark:text-gray-200">Address</label>
                            <textarea 
                                name="address" 
                                onChange={onChangeHandler} 
                                value={storeInfo.address} 
                                rows={4} 
                                placeholder="Enter your store address" 
                                className="mt-1 w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 resize-none focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>

                        <button className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 active:scale-95 transition-all mt-4">
                            Submit
                        </button>
                    </form>
                </div>
            ) : (
                <div className="min-h-[80vh] flex flex-col items-center justify-center px-6 space-y-6 text-center">
                    <div className={`p-8 rounded-2xl shadow-lg max-w-xl w-full
                        ${status === "approved" ? "bg-green-50 dark:bg-green-900" : ""}
                        ${status === "pending" ? "bg-yellow-50 dark:bg-yellow-900" : ""}
                        ${status === "rejected" ? "bg-red-50 dark:bg-red-900" : ""}`}>
                        {/* Icon */}
                        <div className="mb-4 flex justify-center">
                            {status === "approved" && <CheckCircle className="text-green-600 dark:text-green-400" size={48} />}
                            {status === "pending" && <Clock className="text-yellow-600 dark:text-yellow-400" size={48} />}
                            {status === "rejected" && <XCircle className="text-red-600 dark:text-red-400" size={48} />}
                        </div>
                        <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">{message}</p>
                        {status === "approved" && <p className="mt-3 text-gray-500 dark:text-gray-400">Redirecting to dashboard in <span className="font-semibold">5 seconds</span></p>}
                    </div>
                </div>
            )}
        </>
    ) : (<Loading />)
}
