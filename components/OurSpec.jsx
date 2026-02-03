'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Title from './Title'
import { ourSpecsData } from '@/assets/assets'

const cardVariants = {
  hidden: { opacity: 0, y: 60 },
  show: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.15,
      duration: 0.7,
      ease: 'easeOut',
    },
  }),
}

const OurSpecs = () => {
  return (
    <div className='px-6 my-28 max-w-7xl mx-auto'>
      <Title
        visibleButton={false}
        title='Our Specifications'
        description='High-performance service standards designed for speed, trust and a truly premium shopping experience.'
      />

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 mt-24 perspective-1000'>
        {ourSpecsData.map((spec, index) => (
          <motion.div
            key={index}
            custom={index}
            variants={cardVariants}
            initial='hidden'
            whileInView='show'
            viewport={{ once: true }}
            whileHover={{
              rotateX: 10,
              rotateY: -10,
              scale: 1.05,
            }}
            transition={{ type: 'spring', stiffness: 120, damping: 14 }}
            className='relative group transform-gpu'
          >
            {/* Glow Layer */}
            <div
              className='absolute -inset-1 rounded-3xl blur-2xl opacity-30 group-hover:opacity-70 transition-all duration-500'
              style={{ background: spec.accent }}
            />

            {/* Card */}
            <div
              className='relative h-full rounded-3xl border backdrop-blur-xl bg-white/85 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.25)] p-12 text-center flex flex-col items-center justify-center overflow-hidden'
              style={{ borderColor: spec.accent + '40' }}
            >
              {/* Floating Icon */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className='mb-7'
              >
                <div
                  className='size-16 rounded-2xl flex items-center justify-center shadow-xl'
                  style={{
                    background: `linear-gradient(135deg, ${spec.accent}, #00000030)`,
                  }}
                >
                  <spec.icon size={30} className='text-white drop-shadow-lg' />
                </div>
              </motion.div>

              {/* Text */}
              <h3 className='text-xl font-semibold text-slate-900 tracking-wide'>
                {spec.title}
              </h3>

              <p className='text-sm text-slate-600 mt-4 leading-relaxed'>
                {spec.description}
              </p>

              {/* Premium shine */}
              <div className='absolute bottom-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-white/70 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500' />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default OurSpecs
