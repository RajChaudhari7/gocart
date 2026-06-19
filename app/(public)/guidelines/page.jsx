'use client'

import { motion } from 'framer-motion'
import {
    Store,
    Image as ImageIcon,
    Truck,
    MessageSquare,
    CreditCard,
    ShieldCheck,
    HelpCircle,
    ArrowRight
} from 'lucide-react'
import Link from 'next/link'

const guidelinesData = [
    {
        id: 'store-setup',
        title: 'Store Setup & Verification',
        icon: Store,
        color: 'text-blue-400',
        bgColor: 'bg-blue-400/10',
        borderColor: 'border-blue-400/20',
        rules: [
            'Provide accurate shop details, including exact physical address in Nandurbar and contact numbers.',
            'Submit valid KYC documents (Aadhar/PAN/GST if applicable) for account verification.',
            'Maintain an active status. If your shop is closed for holidays, use the "Pause Store" toggle in your dashboard.',
        ]
    },
    {
        id: 'product-listings',
        title: 'Product Listings & Quality',
        icon: ImageIcon,
        color: 'text-purple-400',
        bgColor: 'bg-purple-400/10',
        borderColor: 'border-purple-400/20',
        rules: [
            'Upload clear, well-lit photos of the actual products. Do not use heavily misleading stock images.',
            'Write accurate descriptions including size, weight, expiry date (for groceries), and warranty details.',
            'Strictly NO prohibited items (illegal substances, counterfeit goods, or hazardous materials).',
        ]
    },
    {
        id: 'fulfillment',
        title: 'Order Fulfillment & Packaging',
        icon: Truck,
        color: 'text-emerald-400',
        bgColor: 'bg-emerald-400/10',
        borderColor: 'border-emerald-400/20',
        rules: [
            'Accept or reject orders within 15 minutes of receiving them to ensure a fast delivery network.',
            'Pack items securely. Fragile items must be bubble-wrapped to prevent damage during transit.',
            'Hand over the package to the assigned delivery partner only after verifying the Order ID and OTP.',
        ]
    },
    {
        id: 'customer-service',
        title: 'Customer Interaction & Returns',
        icon: MessageSquare,
        color: 'text-pink-400',
        bgColor: 'bg-pink-400/10',
        borderColor: 'border-pink-400/20',
        rules: [
            'Respond to customer queries promptly and professionally.',
            'Accept returns for damaged, defective, or incorrect items as per the Nandurbar Bazar Return Policy.',
            'Do not engage in abusive language or direct off-platform transactions with customers.',
        ]
    },
    {
        id: 'payments',
        title: 'Payments & Settlement',
        icon: CreditCard,
        color: 'text-cyan-400',
        bgColor: 'bg-cyan-400/10',
        borderColor: 'border-cyan-400/20',
        rules: [
            'Payments for delivered orders are settled to your registered bank account on a weekly basis (every Tuesday).',
            'The platform commission is automatically deducted from the final payout. Ensure your pricing accounts for this.',
            'Keep your bank account details updated in the Seller Dashboard to avoid payout delays.',
        ]
    },
    {
        id: 'compliance',
        title: 'Trust & Safety',
        icon: ShieldCheck,
        color: 'text-orange-400',
        bgColor: 'bg-orange-400/10',
        borderColor: 'border-orange-400/20',
        rules: [
            'Selling expired products or engaging in fraudulent activities will result in immediate permanent store suspension.',
            'Respect customer privacy. Do not use customer phone numbers or addresses for personal marketing.',
            'Report any suspicious orders or delivery partner misconduct to our support team immediately.',
        ]
    }
]

export default function GuidelinesPage() {
    return (
        <div className="min-h-screen bg-[#020617] text-slate-200 py-20 px-4 sm:px-6 lg:px-8 selection:bg-cyan-500/30">

            {/* HEADER SECTION */}
            <div className="max-w-4xl mx-auto text-center mb-16 pt-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white mb-6">
                        Seller <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">Guidelines</span>
                    </h1>
                    <p className="text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto">
                        Welcome to <strong className="text-white">Nandurbar Bazar</strong>. To maintain a trusted and reliable marketplace for our local community, all registered shops must adhere to the following operational standards.
                    </p>
                </motion.div>
            </div>

            {/* GUIDELINES GRID */}
            <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                {guidelinesData.map((section, index) => {
                    const Icon = section.icon
                    return (
                        <motion.div
                            key={section.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 hover:bg-slate-900/80 hover:border-slate-700 transition-colors duration-300 relative overflow-hidden group"
                        >
                            {/* Subtle background glow */}
                            <div className={`absolute top-0 right-0 w-32 h-32 ${section.bgColor} blur-3xl -translate-y-1/2 translate-x-1/2 rounded-full opacity-50 group-hover:opacity-100 transition-opacity`} />

                            <div className="relative z-10">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className={`p-3 rounded-2xl ${section.bgColor} ${section.borderColor} border ${section.color}`}>
                                        <Icon size={24} strokeWidth={2.5} />
                                    </div>
                                    <h2 className="text-xl font-bold text-white tracking-wide">
                                        {section.title}
                                    </h2>
                                </div>

                                <ul className="space-y-4">
                                    {section.rules.map((rule, idx) => (
                                        <li key={idx} className="flex items-start gap-3 text-slate-400 text-sm sm:text-base leading-relaxed">
                                            <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${section.bgColor.replace('/10', '')}`} />
                                            {rule}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </motion.div>
                    )
                })}
            </div>

            {/* BOTTOM CTA */}
            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="max-w-4xl mx-auto mt-20"
            >
                <div className="bg-gradient-to-br from-indigo-500/10 to-cyan-500/10 border border-indigo-500/20 rounded-3xl p-8 sm:p-10 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay pointer-events-none" />

                    <HelpCircle size={40} className="text-cyan-400 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-white mb-3">Have a question?</h3>
                    <p className="text-slate-400 mb-8 max-w-lg mx-auto">
                        If you need clarification on any of these guidelines or need help setting up your store, our local support team is ready to assist you.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            href="/contact"
                            className="w-full sm:w-auto px-8 py-3.5 bg-white text-slate-950 font-bold rounded-full hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
                        >
                            Contact Support
                        </Link>
                        <Link
                            href="/create-store"
                            className="w-full sm:w-auto px-8 py-3.5 bg-transparent border border-slate-700 text-white font-bold rounded-full hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 group"
                        >
                            Go to Dashboard
                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>
            </motion.div>

        </div>
    )
}