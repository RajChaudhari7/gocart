'use client'

import { motion } from "framer-motion"
import Title from "./Title"
import { ourSpecsData } from "@/assets/assets"

const OurSpecs = () => {
  return (
    <section className="px-6 md:px-8 my-24 max-w-7xl mx-auto">
      <Title
        visibleButton={false}
        title="Our Specifications"
        description="We provide smooth, secure, and hassle-free shopping experiences for modern users."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
        {ourSpecsData.map((spec, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -5 }}
            className="relative rounded-2xl bg-white p-8 text-center shadow-md hover:shadow-xl transition-shadow duration-300"
          >
            {/* Icon */}
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-6 shadow-lg"
              style={{ backgroundColor: spec.accent }}
            >
              <spec.icon size={24} className="text-white" />
            </div>

            {/* Title */}
            <h3 className="text-lg font-semibold text-slate-800 mb-2">{spec.title}</h3>

            {/* Description */}
            <p className="text-sm text-slate-600 leading-relaxed">{spec.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

export default OurSpecs
