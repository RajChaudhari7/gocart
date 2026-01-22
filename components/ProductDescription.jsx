'use client'

import { ArrowRight, StarIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

const tabs = ['Description', 'Reviews']

const ProductDescription = ({ product }) => {
    const [selectedTab, setSelectedTab] = useState('Description')

    return (
        <div className="my-14 px-6 max-w-7xl mx-auto text-gray-900">

            {/* PREMIUM TABS */}
            <div className="relative flex gap-8 border-b border-gray-200 mb-12 max-w-md">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setSelectedTab(tab)}
                        className={`relative pb-3 text-sm font-semibold transition-all duration-300
                            ${
                                selectedTab === tab
                                    ? 'bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent'
                                    : 'text-gray-400 hover:text-gray-700'
                            }
                        `}
                    >
                        {tab}

                        {/* ACTIVE DOT */}
                        {selectedTab === tab && (
                            <motion.span
                                layoutId="active-dot"
                                className="absolute -bottom-[6px] left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-gradient-to-r from-purple-600 to-pink-500"
                            />
                        )}
                    </button>
                ))}

                {/* SLIDING UNDERLINE */}
                <motion.div
                    layout
                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                    className="absolute bottom-0 h-[3px] w-1/2 rounded-full bg-gradient-to-r from-purple-600 via-pink-500 to-red-500"
                    style={{
                        left: selectedTab === 'Description' ? '0%' : '50%',
                    }}
                />
            </div>

            {/* TAB CONTENT */}
            <AnimatePresence mode="wait">
                {selectedTab === "Description" && (
                    <motion.div
                        key="description"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 15 }}
                        transition={{ duration: 0.35 }}
                        className="rounded-3xl bg-white p-8 shadow-lg border border-gray-100"
                    >
                        <p className="text-gray-700 text-lg leading-relaxed">
                            {product.description}
                        </p>
                    </motion.div>
                )}

                {selectedTab === "Reviews" && (
                    <motion.div
                        key="reviews"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 15 }}
                        transition={{ duration: 0.35 }}
                        className="flex flex-col gap-6"
                    >
                        {product.rating.length === 0 && (
                            <p className="text-gray-400 text-center italic py-8">
                                No reviews yet
                            </p>
                        )}

                        {product.rating.map((item, index) => (
                            <motion.div
                                key={index}
                                whileHover={{ scale: 1.02 }}
                                className="flex gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-all"
                            >
                                <Image
                                    src={item.user.image}
                                    alt={item.user.name}
                                    width={56}
                                    height={56}
                                    className="rounded-full border border-gray-200"
                                />

                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <StarIcon
                                                key={i}
                                                size={16}
                                                className={
                                                    item.rating >= i + 1
                                                        ? "text-yellow-400 fill-yellow-400"
                                                        : "text-gray-300"
                                                }
                                            />
                                        ))}
                                        <span className="text-xs text-gray-400">
                                            {new Date(item.createdAt).toDateString()}
                                        </span>
                                    </div>

                                    <p className="text-gray-700 mb-1">
                                        {item.review}
                                    </p>

                                    <p className="font-medium text-gray-900">
                                        {item.user.name}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* STORE CARD */}
            <div className="mt-16 flex items-center gap-5 rounded-3xl bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 p-8 shadow-xl text-white">
                <Image
                    src={product.store.logo}
                    alt={product.store.name}
                    width={72}
                    height={72}
                    className="rounded-full bg-white p-1"
                />

                <div>
                    <p className="text-lg font-semibold">
                        Product by {product.store.name}
                    </p>
                    <Link
                        href={`/shop/${product.store.username}`}
                        className="inline-flex items-center gap-2 mt-1 text-white/90 hover:text-white font-medium"
                    >
                        Visit Store <ArrowRight size={18} />
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default ProductDescription
