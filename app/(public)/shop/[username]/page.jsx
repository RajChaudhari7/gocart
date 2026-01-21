'use client'

import ProductCard from "@/components/ProductCard"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { MailIcon, MapPinIcon } from "lucide-react"
import Loading from "@/components/Loading"
import Image from "next/image"
import axios from "axios"
import toast from "react-hot-toast"

export default function StoreShop() {
    const { username } = useParams()
    const [products, setProducts] = useState([])
    const [storeInfo, setStoreInfo] = useState(null)
    const [loading, setLoading] = useState(true)

    const fetchStoreData = async () => {
        try {
            const { data } = await axios.get(`/api/store/data?username=${username}`)
            setStoreInfo(data.store)
            setProducts(data.store.Product)
        } catch (error) {
            toast.error(error?.response?.data?.error || error.message)
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchStoreData()
    }, [])

    if (loading) return <Loading />

    return (
        <div className="min-h-[70vh] px-6 py-10">
            {storeInfo && (
                <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-md p-6 md:p-10 flex flex-col md:flex-row items-center gap-6">
                    <Image
                        src={storeInfo.logo}
                        alt={storeInfo.name}
                        width={200}
                        height={200}
                        className="rounded-xl border border-slate-200 object-cover"
                    />
                    <div className="text-center md:text-left flex-1">
                        <h1 className="text-3xl font-bold text-slate-900">{storeInfo.name}</h1>
                        <p className="text-slate-600 mt-3 max-w-lg">{storeInfo.description}</p>

                        <div className="mt-5 flex flex-col gap-2 text-sm text-slate-500">
                            <div className="flex items-center gap-2">
                                <MapPinIcon className="w-4 h-4 text-gray-500" /> {storeInfo.address}
                            </div>
                            <div className="flex items-center gap-2">
                                <MailIcon className="w-4 h-4 text-gray-500" /> {storeInfo.email}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Products */}
            <div className="max-w-7xl mx-auto mt-12">
                <h2 className="text-2xl font-semibold text-slate-800 mb-6">Shop Products</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                    {products.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </div>
        </div>
    )
}
