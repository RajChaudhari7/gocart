'use client'

import { usePathname } from "next/navigation"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useState } from "react"

const routeMap = {
  '/store': 'Dashboard',
  '/store/add-product': 'Add Product',
  '/store/manage-product': 'Manage Products',
  '/store/orders': 'Orders',
}

const MobileBreadcrumbs = () => {
  const pathname = usePathname()
  const [visible, setVisible] = useState(true)

  const currentPage = routeMap[pathname] || 'Store'

  /* 🔁 Reopen breadcrumb on every route change */
  useEffect(() => {
    setVisible(true)
  }, [pathname])

  /* ❌ Close breadcrumb when nav item clicked */
  useEffect(() => {
    const close = () => setVisible(false)
    document.addEventListener('breadcrumb:close', close)
    return () => document.removeEventListener('breadcrumb:close', close)
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="
            sm:hidden
            sticky top-[56px]
            z-20
            bg-white
            border-b border-slate-200
            px-4 py-2
          "
        >
          <div className="flex items-center text-sm text-slate-600">
            <Link
              href="/store"
              onClick={() => setVisible(false)}
              className="font-medium text-slate-700"
            >
              Store
            </Link>

            <ChevronRight size={16} className="mx-2 text-slate-400" />

            <span className="font-semibold text-emerald-600">
              {currentPage}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default MobileBreadcrumbs
