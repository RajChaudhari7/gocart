'use client'

import Loading from "@/components/Loading"
import DashboardCharts from "@/components/store/DashboardCharts"
import { useAuth } from "@clerk/nextjs"
import axios from "axios"
import {
  CircleDollarSignIcon,
  ShoppingBasketIcon,
  StarIcon,
  TagsIcon,
  XCircleIcon,
  TrendingUpIcon
} from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect, useState, useMemo } from "react"
import toast from "react-hot-toast"
import { motion } from "framer-motion"
import { Sun, Moon } from "lucide-react"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"

// Helper to calculate financials
const getOrderFinances = (orderItems) => {
  const productTotal = orderItems?.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  ) || 0;

  const sellerEarnings = productTotal * 0.90;
  return { productTotal, sellerEarnings };
};

export default function Dashboard() {
  const { getToken } = useAuth()
  const router = useRouter()
  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '₹'

  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState({
    totalProducts: 0,
    totalEarnings: 0,
    totalOrders: 0,
    ratings: [],
    earningsChart: [],
    ordersChart: [],
    canceledChart: [],
    returnedChart: [],
    returnedProducts: 0,
    returnedAmount: 0,
    orders: [],
    topProducts: [],
    storeName: "",
    storeLogo: "",
    monthlyReport: {}
  })

  /* ---------------- YEAR + MONTH FILTER ---------------- */
  const currentYear = new Date().getFullYear()
  const yearOptions = [currentYear, currentYear - 1, currentYear - 2]

  const [filterYear, setFilterYear] = useState(currentYear)
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth())
  const [storeActive, setStoreActive] = useState(false)
  const [toggling, setToggling] = useState(false)

  const monthOptions = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ]

  /* -------------------- FETCH -------------------- */
  const fetchDashboardData = async () => {
    try {
      const token = await getToken()
      const { data } = await axios.get(
        `/api/store/dashboard?year=${filterYear}&month=${filterMonth}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setDashboardData(data.dashboardData)
      setStoreActive(data.dashboardData.storeIsActive)
    } catch (error) {
      toast.error(error?.response?.data?.error || error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const token = await getToken()
        await axios.post(
          "/api/store/location",
          {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          },
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )
      }
    )
  }, [getToken])

  useEffect(() => {
    fetchDashboardData()
  }, [filterYear, filterMonth])

  const handleDownloadPDF = async () => {
    const element = document.getElementById("pdf-report")
    if (!element) return

    document.body.style.background = "#ffffff"
    await new Promise((resolve) => setTimeout(resolve, 500))

    const canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor: "#ffffff",
      useCORS: true
    })

    const imgData = canvas.toDataURL("image/png")
    const pdf = new jsPDF("p", "mm", "a4")
    const imgWidth = 210
    const imgHeight = (canvas.height * imgWidth) / canvas.width

    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight)
    pdf.save(`Report-${filterYear}-${filterMonth + 1}.pdf`)
  }

  const toggleStore = async () => {
    if (toggling) return
    try {
      setToggling(true)
      const token = await getToken()

      const { data } = await axios.patch(
        "/api/store/toggle",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )

      setStoreActive(data.isActive)
      toast.success(
        data.isActive ? "Shop is now OPEN 🌞" : "Shop is now CLOSED 🌙"
      )
    } catch (err) {
      toast.error("Failed to update store status")
    } finally {
      setToggling(false)
    }
  }

  /* -------------------- FINANCIAL KPIs -------------------- */
  const filteredOrders = dashboardData.orders || []

  // Net Earnings (90% of product total, ignoring delivery fees)
  const netEarnings = useMemo(() => {
    return filteredOrders
      .filter(o => o.status !== "CANCELLED" && o.status !== "RETURNED")
      .reduce((sum, o) => sum + getOrderFinances(o.orderItems).sellerEarnings, 0)
  }, [filteredOrders])

  // Lost Revenue from Cancelled Orders (Product total only)
  const cancelledRevenueLoss = useMemo(() => {
    return dashboardData.monthlyReport?.cancelledDetails?.reduce((a, c) => a + (c.price * c.quantity), 0) || 0
  }, [dashboardData.monthlyReport])

  // Lost Revenue from Returned Orders (Product total only)
  const returnedRevenueLoss = useMemo(() => {
    return dashboardData.monthlyReport?.returnedDetails?.reduce((a, c) => a + (c.price * c.quantity), 0) || 0
  }, [dashboardData.monthlyReport])

  const filteredCanceled = filteredOrders.filter(o => o.status === "CANCELLED").length
  const totalCanceledOrders = filteredCanceled

  const productsSoldPercent = filteredOrders.length
    ? ((filteredOrders.length / (dashboardData.totalOrders || 1)) * 100).toFixed(1)
    : 0

  const canceledPercent = totalCanceledOrders
    ? ((filteredCanceled / (totalCanceledOrders || 1)) * 100).toFixed(1)
    : 0

  const avgRating = dashboardData.ratings.length
    ? (
      dashboardData.ratings.reduce((a, b) => a + b.rating, 0) /
      dashboardData.ratings.length
    ).toFixed(1)
    : 0

  const stats = [
    { title: "Products", value: dashboardData.totalProducts, icon: ShoppingBasketIcon },
    {
      title: "Net Earnings (90%)",
      value: currency + netEarnings.toFixed(2),
      icon: CircleDollarSignIcon
    },
    { title: "Orders", value: dashboardData.totalOrders + ` (${productsSoldPercent}%)`, icon: TagsIcon },
    {
      title: "Returns",
      value: dashboardData.returnedProducts || 0,
      icon: TrendingUpIcon
    },
    { title: "Avg Rating", value: avgRating + " ⭐", icon: StarIcon },
    { title: "Canceled", value: totalCanceledOrders + ` (${canceledPercent}%)`, icon: XCircleIcon },
  ]

  /* -------------------- CHART DATA -------------------- */
  // Scale charts down to 90% logic (optional, assuming chart data is raw totals)
  const earningsData = useMemo(
    () => dashboardData.earningsChart.map(i => ({ name: i.name, value: (i.value || 0) * 0.90 })),
    [dashboardData.earningsChart]
  )

  const ordersData = useMemo(
    () => dashboardData.ordersChart.map(i => ({ name: i.name, value: i.value || 0 })),
    [dashboardData.ordersChart]
  )

  const canceledOrdersData = useMemo(
    () => dashboardData.canceledChart.map(i => ({ name: i.name, value: i.value || 0 })),
    [dashboardData.canceledChart]
  )

  const returnedOrdersData = useMemo(
    () => dashboardData.returnedChart.map(i => ({ name: i.name, value: i.value || 0 })),
    [dashboardData.returnedChart]
  )

  if (loading) return <Loading />

  return (
    <div className="max-w-7xl mx-auto pb-28 px-4 lg:px-6 space-y-10">

      <button
        onClick={handleDownloadPDF}
        className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition text-sm"
      >
        Download Premium Report
      </button>

      <motion.button
        onClick={toggleStore}
        whileTap={{ scale: 0.9 }}
        className={`relative w-20 h-10 rounded-full flex items-center px-1 transition-colors
      ${storeActive ? "bg-yellow-400" : "bg-slate-800"}
      `}
      >
        <motion.div
          layout
          transition={{ type: "spring", stiffness: 700, damping: 30 }}
          className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md"
          style={{ x: storeActive ? 40 : 0 }}
        >
          {storeActive ? (
            <Sun className="w-5 h-5 text-yellow-500" />
          ) : (
            <Moon className="w-5 h-5 text-slate-700" />
          )}
        </motion.div>
      </motion.button>

      <span className="text-sm font-medium">
        {storeActive ? "Shop Open" : "Shop Closed"}
      </span>

      {/* Header + Year Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">
            Monitor your business performance with analytics and insights
          </p>
        </motion.div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">Year:</span>
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(Number(e.target.value))}
              className="border rounded-lg px-3 py-2 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {yearOptions.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">Month:</span>
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(Number(e.target.value))}
              className="border rounded-lg px-3 py-2 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {monthOptions.map((m, i) => (
                <option key={i} value={i}>{m}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <motion.div
        className="grid grid-cols-2 lg:grid-cols-5 gap-6"
        initial="hidden"
        animate="visible"
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
      >
        {stats.map((item, i) => (
          <motion.div
            key={i}
            className="bg-white border rounded-2xl p-5 shadow-md hover:shadow-xl transition-shadow cursor-pointer"
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            whileHover={{ scale: 1.03 }}
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs text-slate-500">{item.title}</p>
                <p className="text-xl font-semibold mt-1">{item.value}</p>
              </div>
              <item.icon className="w-6 h-6 text-indigo-500" />
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts */}
      <DashboardCharts
        earningsData={earningsData}
        ordersData={ordersData}
        canceledOrdersData={canceledOrdersData}
        returnedOrdersData={returnedOrdersData}
        topProducts={dashboardData.topProducts}
      />

      {/* Insights */}
      <motion.div
        className="bg-white border rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow"
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-2 mb-2">
          <TrendingUpIcon className="w-5 h-5 text-green-600" />
          <h3 className="text-sm font-semibold">Insights</h3>
        </div>
        <ul className="text-sm text-slate-600 space-y-1">
          <li>📈 Net Earnings for {filterYear}: {currency}{netEarnings.toFixed(2)}</li>
          <li>⭐ Average rating: {avgRating}</li>
          <li>❌ {totalCanceledOrders} total canceled orders</li>
        </ul>
      </motion.div>

      {/* Reviews */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Recent Reviews</h2>
        <span className="text-sm text-slate-500">{dashboardData.ratings.length} total</span>
      </div>

      <motion.div
        className="space-y-5 max-w-4xl"
        initial="hidden"
        animate="visible"
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
      >
        {dashboardData.ratings.map((review, index) => (
          <motion.div
            key={index}
            className="bg-white border rounded-2xl p-5 shadow-md hover:shadow-lg transition-shadow"
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          >
            <div className="flex justify-between gap-6">
              <div className="flex gap-4">
                {review.user?.image ? (
                  <Image
                    src={review.user.image}
                    alt={review.user.name}
                    width={50}
                    height={50}
                    className="rounded-full object-cover ring-2 ring-indigo-500"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold text-lg ring-2 ring-indigo-500">
                    {review.user?.name?.[0]}
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold">{review.user.name}</p>
                  <p className="text-xs text-slate-400">
                    {new Date(review.createdAt).toDateString()}
                  </p>
                  <p className="text-sm text-slate-600 mt-2">{review.review}</p>
                  {review.reply && (
                    <p className="text-xs text-green-600 mt-1">
                      Reply: {review.reply}
                    </p>
                  )}
                </div>
              </div>

              <div className="text-right">
                <p className="text-xs text-slate-500">{review.product?.category}</p>
                <p className="text-sm font-semibold">{review.product?.name}</p>
                <div className="flex justify-end mt-1 space-x-1">
                  {[1, 2, 3, 4, 5].map(i => (
                    <StarIcon
                      key={i}
                      size={16}
                      fill={review.rating >= i ? "#16A34A" : "#E5E7EB"}
                      className="text-transparent"
                    />
                  ))}
                </div>
                <button
                  onClick={() => router.push(`/product/${review.product.id}`)}
                  className="mt-3 text-xs px-4 py-2 border rounded-md bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-medium transition"
                >
                  View product
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* ---------------- PDF REPORT UI (HIDDEN) ---------------- */}
      <div
        id="pdf-report"
        style={{
          position: "fixed",
          left: "-9999px",
          top: 0,
          width: "800px",
          background: "#ffffff",
          color: "#1e293b",
          padding: "40px",
          fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
          boxSizing: "border-box"
        }}
      >
        {/* 🏢 HEADER SECTION */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "2px solid #e2e8f0",
          paddingBottom: "20px",
          marginBottom: "30px"
        }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            {dashboardData.storeLogo && (
              <img
                src={dashboardData.storeLogo}
                alt="Store Logo"
                style={{
                  width: "55px",
                  height: "55px",
                  borderRadius: "8px",
                  marginRight: "16px",
                  objectFit: "cover",
                  border: "1px solid #e2e8f0"
                }}
              />
            )}
            <div>
              <h1 style={{ margin: 0, fontSize: "24px", color: "#0f172a" }}>
                {dashboardData.storeName}
              </h1>
              <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Vendor Performance Report
              </p>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ margin: 0, fontSize: "14px", color: "#64748b", fontWeight: 500 }}>
              Reporting Period
            </p>
            <p style={{ margin: "4px 0 0", fontSize: "16px", color: "#0f172a", fontWeight: "bold" }}>
              {monthOptions[filterMonth]} {filterYear}
            </p>
          </div>
        </div>

        {/* 📊 EXECUTIVE SUMMARY (GRID) */}
        <h2 style={{ fontSize: "18px", color: "#0f172a", borderBottom: "1px solid #f1f5f9", paddingBottom: "8px", marginBottom: "15px" }}>
          Executive Summary
        </h2>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "15px",
          marginBottom: "30px"
        }}>
          {[
            { label: "Net Earnings", value: `${currency}${netEarnings.toFixed(2)}`, color: "#0ea5e9", bg: "#f0f9ff", border: "#bae6fd" },
            { label: "Total Orders", value: dashboardData.totalOrders, color: "#10b981", bg: "#ecfdf5", border: "#a7f3d0" },
            { label: "Cancelled", value: dashboardData.monthlyReport?.cancelledOrders || 0, color: "#ef4444", bg: "#fef2f2", border: "#fecaca" },
            { label: "Returned", value: dashboardData.returnedProducts || 0, color: "#f59e0b", bg: "#fffbeb", border: "#fde68a" }
          ].map((card, idx) => (
            <div key={idx} style={{
              backgroundColor: card.bg,
              border: `1px solid ${card.border}`,
              padding: "16px",
              borderRadius: "8px",
              textAlign: "center"
            }}>
              <p style={{ margin: 0, fontSize: "12px", color: "#475569", fontWeight: 600, textTransform: "uppercase" }}>
                {card.label}
              </p>
              <p style={{ margin: "8px 0 0", fontSize: "20px", color: card.color, fontWeight: "bold" }}>
                {card.value}
              </p>
            </div>
          ))}
        </div>

        {/* 💰 FINANCIAL & TOP PRODUCTS (TWO COLUMNS) */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "30px" }}>

          {/* Financial Breakdown */}
          <div>
            <h2 style={{ fontSize: "16px", color: "#0f172a", borderBottom: "1px solid #e2e8f0", paddingBottom: "8px", marginBottom: "12px" }}>
              Financial Breakdown
            </h2>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
              <tbody>
                <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "10px 0", color: "#475569" }}>Net Earnings (90%)</td>
                  <td style={{ padding: "10px 0", textAlign: "right", fontWeight: "bold", color: "#0f172a" }}>
                    {currency}{netEarnings.toFixed(2)}
                  </td>
                </tr>
                <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "10px 0", color: "#475569" }}>Cancelled Revenue Loss</td>
                  <td style={{ padding: "10px 0", textAlign: "right", fontWeight: "bold", color: "#ef4444" }}>
                    {currency}{cancelledRevenueLoss.toFixed(2)}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: "10px 0", color: "#475569" }}>Returned Revenue Loss</td>
                  <td style={{ padding: "10px 0", textAlign: "right", fontWeight: "bold", color: "#f59e0b" }}>
                    {currency}{returnedRevenueLoss.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Top Products */}
          <div>
            <h2 style={{ fontSize: "16px", color: "#0f172a", borderBottom: "1px solid #e2e8f0", paddingBottom: "8px", marginBottom: "12px" }}>
              Top Performing Products
            </h2>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
              <tbody>
                {dashboardData.monthlyReport?.topProducts?.length > 0 ? (
                  dashboardData.monthlyReport.topProducts.map((p, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "8px 0", color: "#0f172a", fontWeight: 500 }}>{p.name}</td>
                      <td style={{ padding: "8px 0", textAlign: "right", color: "#475569" }}>
                        <span style={{ fontWeight: "bold" }}>{p.sold}</span> units sold
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td style={{ padding: "8px 0", color: "#94a3b8" }}>No data available.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ❌ CANCELLED & RETURNED ORDERS TABLES */}
        {[
          { title: "Cancelled Orders", data: dashboardData.monthlyReport?.cancelledDetails },
          { title: "Returned Orders", data: dashboardData.monthlyReport?.returnedDetails }
        ].map((section, idx) => (
          <div key={idx} style={{ marginBottom: "30px" }}>
            <h2 style={{ fontSize: "16px", color: "#0f172a", borderBottom: "2px solid #e2e8f0", paddingBottom: "8px", marginBottom: "12px" }}>
              {section.title}
            </h2>
            {section.data && section.data.length > 0 ? (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f8fafc", color: "#475569", textAlign: "left" }}>
                    <th style={{ padding: "10px", borderBottom: "1px solid #e2e8f0" }}>Product Name</th>
                    <th style={{ padding: "10px", borderBottom: "1px solid #e2e8f0", textAlign: "center" }}>Quantity</th>
                    <th style={{ padding: "10px", borderBottom: "1px solid #e2e8f0", textAlign: "right" }}>Unit Price</th>
                    <th style={{ padding: "10px", borderBottom: "1px solid #e2e8f0", textAlign: "right" }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {section.data.map((item, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "10px", color: "#0f172a" }}>{item.productName}</td>
                      <td style={{ padding: "10px", textAlign: "center", color: "#475569" }}>{item.quantity}</td>
                      <td style={{ padding: "10px", textAlign: "right", color: "#475569" }}>{currency}{item.price}</td>
                      <td style={{ padding: "10px", textAlign: "right", fontWeight: "bold", color: "#0f172a" }}>
                        {currency}{item.price * item.quantity}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={{ fontSize: "13px", color: "#94a3b8", fontStyle: "italic" }}>No {section.title.toLowerCase()} recorded for this period.</p>
            )}
          </div>
        ))}

        {/* 🏁 FOOTER */}
        <div style={{
          marginTop: "40px",
          paddingTop: "20px",
          borderTop: "1px solid #e2e8f0",
          textAlign: "center",
        }}>
          <p style={{ margin: 0, fontSize: "12px", color: "#94a3b8", fontWeight: 500 }}>
            CONFIDENTIAL & PROPRIETARY • GENERATED BY SMART ANALYTICS
          </p>
          <p style={{ margin: "4px 0 0", fontSize: "11px", color: "#cbd5e1" }}>
            Report generated on {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  )
}