'use client'
import { ArrowRight, StarIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"

const ProductDescription = ({ product }) => {
    const [selectedTab, setSelectedTab] = useState('Description')

    return (
        <div className="mt-12 text-slate-700 max-w-7xl mx-auto">

            {/* Tabs */}
            <div className="flex border-b border-slate-200 mb-6">
                {['Description', 'Reviews'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setSelectedTab(tab)}
                        className={`px-3 py-2 font-medium ${selectedTab === tab ? 'border-b-2 border-green-600 font-semibold text-slate-900' : 'text-slate-400'}`}
                    >{tab}</button>
                ))}
            </div>

            {/* DESCRIPTION */}
            {selectedTab === "Description" && (
                <p className="text-sm leading-7">{product.description}</p>
            )}

            {/* REVIEWS */}
            {selectedTab === "Reviews" && (
                <div className="flex flex-col gap-6">
                    {product.rating.map((item, idx) => (
                        <div key={idx} className="flex gap-4 bg-slate-50 p-4 rounded-xl shadow-sm">
                            <Image src={item.user.image} alt="" width={60} height={60} className="rounded-full" />
                            <div>
                                <div className="flex gap-1">
                                    {Array(5).fill('').map((_, i) => (
                                        <StarIcon key={i} size={16} fill={item.rating >= i + 1 ? "#00C950" : "#D1D5DB"} className="text-transparent" />
                                    ))}
                                </div>
                                <p className="text-sm mt-2">{item.review}</p>
                                <p className="font-semibold mt-1">{item.user.name}</p>
                                <p className="text-xs text-slate-400">{new Date(item.createdAt).toDateString()}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* STORE LINK */}
            <div className="flex items-center gap-4 mt-10">
                <Image src={product.store.logo} alt="" width={60} height={60} className="rounded-full ring ring-slate-200" />
                <div>
                    <p className="font-medium">Product by {product.store.name}</p>
                    <Link href={`/shop/${product.store.username}`} className="text-green-600 flex items-center gap-1 font-medium">
                        View Store <ArrowRight size={14} />
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default ProductDescription
