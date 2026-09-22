'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { ShoppingBag, MapPin, Package, Store } from 'lucide-react'

export default function AppSplash() {
  return (
    <div className="fixed inset-0 z-[9999] overflow-hidden bg-[#fafafa]">

      {/* Subtle ambient background */}
      <div className="absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[320px] w-[320px] sm:h-[500px] sm:w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-100/60 blur-[90px]" />

        <div className="absolute -left-20 -top-20 h-56 w-56 rounded-full bg-yellow-100/40 blur-[80px]" />

        <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-orange-100/40 blur-[90px]" />
      </div>

      {/* Very subtle grid texture */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            'linear-gradient(#111 1px, transparent 1px), linear-gradient(90deg, #111 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Floating shopping icons */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.7 }}
        className="absolute left-[12%] top-[28%] hidden sm:block"
      >
        <motion.div
          animate={{ y: [-6, 6, -6], rotate: [-3, 3, -3] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-[0_8px_30px_rgba(0,0,0,0.08)]"
        >
          <ShoppingBag className="h-5 w-5 text-orange-500" />
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.7 }}
        className="absolute right-[13%] top-[34%] hidden sm:block"
      >
        <motion.div
          animate={{ y: [6, -6, 6], rotate: [3, -3, 3] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
          className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-[0_8px_30px_rgba(0,0,0,0.08)]"
        >
          <Store className="h-5 w-5 text-orange-500" />
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.7 }}
        className="absolute bottom-[27%] left-[18%] hidden sm:block"
      >
        <motion.div
          animate={{ y: [-5, 5, -5] }}
          transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut' }}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-[0_8px_30px_rgba(0,0,0,0.07)]"
        >
          <MapPin className="h-4 w-4 text-orange-500" />
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1, duration: 0.7 }}
        className="absolute bottom-[29%] right-[18%] hidden sm:block"
      >
        <motion.div
          animate={{ y: [5, -5, 5] }}
          transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-[0_8px_30px_rgba(0,0,0,0.07)]"
        >
          <Package className="h-4 w-4 text-orange-500" />
        </motion.div>
      </motion.div>

      {/* Main content */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-5">

        {/* Logo */}
        <motion.div
          initial={{
            opacity: 0,
            scale: 0.75,
            y: 15,
          }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
          }}
          transition={{
            duration: 0.9,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="relative"
        >
          {/* Soft logo aura */}
          <motion.div
            animate={{
              opacity: [0.35, 0.6, 0.35],
              scale: [0.92, 1.06, 0.92],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute inset-0 rounded-[32px] bg-orange-200/50 blur-2xl"
          />

          <div className="relative flex h-36 w-36 items-center justify-center rounded-[32px] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.10)] sm:h-44 sm:w-44 sm:rounded-[38px]">
            <Image
              src="/app.png"
              alt="Nandurbar Bazar"
              width={180}
              height={180}
              priority
              className="h-[82%] w-[82%] object-contain"
            />
          </div>
        </motion.div>

        {/* Brand */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.45,
            duration: 0.7,
            ease: 'easeOut',
          }}
          className="mt-7 text-center"
        >
          <h1 className="text-[28px] font-bold tracking-[-0.6px] text-gray-900 sm:text-[36px]">
            Nandurbar Bazar
          </h1>

          <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.22em] text-gray-500 sm:text-xs">
            Your local market, delivered
          </p>
        </motion.div>

        {/* Small status */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.85,
            duration: 0.6,
          }}
          className="mt-8 flex items-center gap-2 rounded-full border border-gray-200 bg-white/80 px-4 py-2 shadow-sm backdrop-blur-sm"
        >
          <motion.span
            animate={{ scale: [1, 1.25, 1] }}
            transition={{
              duration: 1.6,
              repeat: Infinity,
            }}
            className="h-2 w-2 rounded-full bg-orange-500"
          />

          <span className="text-xs font-medium text-gray-600">
            Getting things ready...
          </span>
        </motion.div>
      </div>

      {/* Bottom loading indicator */}
      <div className="absolute bottom-10 left-1/2 w-[140px] -translate-x-1/2 sm:bottom-12 sm:w-[180px]">
        <div className="h-[3px] overflow-hidden rounded-full bg-gray-200">
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{
              duration: 1.6,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="h-full w-1/2 rounded-full bg-orange-500"
          />
        </div>

        <p className="mt-3 text-center text-[10px] font-medium tracking-wide text-gray-400">
          SHOP LOCAL • SHOP EASY
        </p>
      </div>
    </div>
  )
}