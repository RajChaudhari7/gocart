'use client'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

const Title = ({
  title,
  description,
  visibleButton = true,
  href = '',
  theme = 'light', // 'light' | 'dark'
}) => {
  const isDark = theme === 'dark'

  return (
    <div className="flex flex-col items-center text-center">
      <h2
        className={`text-2xl sm:text-3xl font-semibold tracking-tight
        ${isDark ? 'text-white' : 'text-slate-800'}`}
      >
        {title}
      </h2>

      <div className="mt-3 flex flex-col sm:flex-row items-center gap-4">
        <p
          className={`max-w-xl text-sm
          ${isDark ? 'text-white/60' : 'text-slate-600'}`}
        >
          {description}
        </p>

        {visibleButton && href && (
          <Link
            href={href}
            className={`inline-flex items-center gap-1 text-sm font-medium transition
            ${
              isDark
                ? 'text-cyan-400 hover:text-emerald-400'
                : 'text-green-600 hover:text-green-700'
            }`}
          >
            View more <ArrowRight size={14} />
          </Link>
        )}
      </div>
    </div>
  )
}

export default Title
