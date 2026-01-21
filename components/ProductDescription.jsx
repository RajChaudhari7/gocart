'use client'

import { ArrowRight, StarIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"

const ProductDescription = ({ product }) => {
    const [selectedTab, setSelectedTab] = useState('Description')

    return (
        <div className="my-14 px-6 max-w-7xl mx-auto text-white">

            {/* Tabs */}
            <div className="flex border-b border-white/20 mb-6 rounded-xl overflow-hidden max-w-xs">
                {['Description', 'Reviews'].map((tab, index) => (
                    <button
                        key={index}
                        onClick={() => setSelectedTab(tab)}
                        className={`px-4 py-2 text-sm font-medium transition-all ${
                            tab === selectedTab 
                                ? 'bg-gradient-to-r from-cyan-400 to-emerald-400 text-black' 
                                : 'text-white/60 hover:text-white'
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Description */}
            {selectedTab === "Description" && (
                <div className="bg-white/5 p-6 rounded-2xl shadow-lg mb-6">
                    <p className="text-slate-200">{product.description}</p>
                </div>
            )}

            {/* Reviews */}
            {selectedTab === "Reviews" && (
                <div className="flex flex-col gap-6">
                    {product.rating.length === 0 && (
                        <p className="text-slate-400 text-center py-6">No reviews yet</p>
                    )}
                    {product.rating.map((item, index) => (
                        <div key={index} className="flex gap-4 bg-white/5 p-4 rounded-2xl shadow-md">
                            <Image
                                src={item.user.image}
                                alt={item.user.name}
                                width={60}
                                height={60}
                                className="rounded-full border border-white/20"
                            />
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    {Array(5).fill('').map((_, i) => (
                                        <StarIcon
                                            key={i}
                                            size={16}
                                            fill={item.rating >= i + 1 ? "#00C950" : "#D1D5DB"}
                                            className="text-transparent"
                                        />
                                    ))}
                                    <span className="text-sm text-slate-400">{new Date(item.createdAt).toDateString()}</span>
                                </div>
                                <p className="text-slate-200 mb-1">{item.review}</p>
                                <p className="font-medium text-white">{item.user.name}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Store Info */}
            <div className="flex items-center gap-4 mt-10 p-4 bg-white/5 rounded-2xl shadow-lg">
                <Image
                    src={product.store.logo}
                    alt={product.store.name}
                    width={60}
                    height={60}
                    className="rounded-full border border-white/20"
                />
                <div>
                    <p className="text-slate-200 font-medium">Product by {product.store.name}</p>
                    <Link
                        href={`/shop/${product.store.username}`}
                        className="inline-flex items-center gap-1 text-cyan-400 font-semibold mt-1 hover:underline"
                    >
                        View Store <ArrowRight size={16} />
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default ProductDescription
