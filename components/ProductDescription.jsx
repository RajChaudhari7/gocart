'use client'

import { ArrowRight, StarIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

const ProductDescription = ({ product }) => {
    const [selectedTab, setSelectedTab] = useState('Description')

    return (
        <div className="my-14 px-6 max-w-7xl mx-auto text-white">

            {/* Tabs with sliding indicator */}
            <div className="relative flex border-b border-gray-700 mb-10 max-w-xs">
                {['Description', 'Reviews'].map((tab, index) => (
                    <button
                        key={index}
                        onClick={() => setSelectedTab(tab)}
                        className={`px-6 py-3 text-sm font-semibold transition-colors z-10 ${
                            tab === selectedTab ? 'text-white' : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        {tab}
                    </button>
                ))}
                {/* Sliding indicator */}
                <motion.div
                    layout
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="absolute bottom-0 h-1 rounded-full bg-gradient-to-r from-purple-600 via-pink-500 to-red-500"
                    style={{
                        width: '50%',
                        left: selectedTab === 'Description' ? '0%' : '50%',
                    }}
                />
            </div>

            {/* Tab Content with smooth fade */}
            <AnimatePresence mode="wait">
                {selectedTab === "Description" && (
                    <motion.div
                        key="desc"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.4 }}
                        className="relative bg-gradient-to-tr from-gray-900/30 via-gray-800/30 to-gray-900/30 p-8 rounded-3xl shadow-xl backdrop-blur-md border border-gray-700 mb-8"
                    >
                        {/* Dark overlay for text contrast */}
                        <div className="absolute inset-0 bg-black/20 rounded-3xl"></div>
                        <p className="relative text-white text-lg leading-relaxed drop-shadow-md">
                            {product.description}
                        </p>
                    </motion.div>
                )}

                {selectedTab === "Reviews" && (
                    <motion.div
                        key="reviews"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.4 }}
                        className="flex flex-col gap-6"
                    >
                        {product.rating.length === 0 && (
                            <p className="text-gray-400 text-center py-6 italic">No reviews yet</p>
                        )}
                        {product.rating.map((item, index) => (
                            <motion.div
                                key={index}
                                whileHover={{ scale: 1.02 }}
                                className="relative flex gap-4 p-5 rounded-2xl shadow-lg bg-gradient-to-r from-gray-800/40 to-gray-900/50 backdrop-blur-md border border-gray-700 transition-all duration-300"
                            >
                                {/* Overlay for text visibility */}
                                <div className="absolute inset-0 bg-black/20 rounded-2xl"></div>

                                <Image
                                    src={item.user.image}
                                    alt={item.user.name}
                                    width={60}
                                    height={60}
                                    className="relative z-10 rounded-full border border-gray-600"
                                />
                                <div className="flex-1 relative z-10">
                                    <div className="flex items-center gap-2 mb-2">
                                        {Array(5).fill('').map((_, i) => (
                                            <StarIcon
                                                key={i}
                                                size={16}
                                                fill={item.rating >= i + 1 ? "#FFD700" : "#555555"}
                                                className="text-transparent"
                                            />
                                        ))}
                                        <span className="text-gray-400 text-sm">{new Date(item.createdAt).toDateString()}</span>
                                    </div>
                                    <p className="text-white mb-1 drop-shadow-md">{item.review}</p>
                                    <p className="font-medium text-white drop-shadow-md">{item.user.name}</p>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Store Info */}
            <div className="relative flex items-center gap-4 mt-12 p-6 rounded-3xl shadow-xl bg-gradient-to-r from-purple-700 via-pink-600 to-red-500 overflow-hidden transition-transform hover:scale-105 duration-300">
                {/* Dark overlay for text contrast */}
                <div className="absolute inset-0 bg-black/25 rounded-3xl"></div>

                <Image
                    src={product.store.logo}
                    alt={product.store.name}
                    width={70}
                    height={70}
                    className="relative z-10 rounded-full border border-gray-600"
                />
                <div className="relative z-10">
                    <p className="text-white font-semibold text-lg drop-shadow-md">
                        Product by {product.store.name}
                    </p>
                    <Link
                        href={`/shop/${product.store.username}`}
                        className="inline-flex items-center gap-1 text-pink-300 font-semibold mt-1 hover:underline drop-shadow-md"
                    >
                        Visit Store <ArrowRight size={18} />
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default ProductDescription
