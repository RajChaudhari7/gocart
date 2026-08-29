"use client";

import Loading from "@/components/Loading";
import DashboardCharts from "@/components/store/DashboardCharts";

import { useAuth } from "@clerk/nextjs";
import axios from "axios";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { useEffect, useMemo, useState } from "react";

import {
  BarChart3,
  CheckCircle2,
  CircleDollarSign,
  Download,
  Moon,
  Package,
  ShoppingBag,
  Star,
  Store,
  Sun,
  TrendingDown,
  TrendingUp,
  XCircle,
} from "lucide-react";

import { motion } from "framer-motion";
import { toast } from "sonner";

import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function Dashboard() {
  const { getToken } = useAuth();
  const router = useRouter();

  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "₹";

  /* =====================================================
     STATE
  ===================================================== */

  const [loading, setLoading] = useState(true);

  const [dashboardData, setDashboardData] = useState({
    totalProducts: 0,
    totalEarnings: 0,
    totalOrders: 0,

    ratings: [],

    earningsChart: [],
    ordersChart: [],
    canceledChart: [],

    returnedProducts: 0,
    returnedAmount: 0,

    orders: [],
    topProducts: [],

    storeName: "",
    storeLogo: "",

    monthlyReport: {},

    settings: {
      commissionPercent: 10,
    },

    storeIsActive: false,
  });

  const [storeActive, setStoreActive] = useState(false);
  const [toggling, setToggling] = useState(false);

  const [filterYear, setFilterYear] = useState(new Date().getFullYear());

  const [filterMonth, setFilterMonth] = useState(new Date().getMonth());

  /* =====================================================
     FILTER OPTIONS
  ===================================================== */

  const currentYear = new Date().getFullYear();

  const yearOptions = [currentYear, currentYear - 1, currentYear - 2];

  const monthOptions = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  /* =====================================================
     FETCH DASHBOARD
  ===================================================== */

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const token = await getToken();

      const { data } = await axios.get(
        `/api/store/dashboard?year=${filterYear}&month=${filterMonth}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const result = data?.dashboardData;

      if (!result) {
        throw new Error("Dashboard data unavailable.");
      }

      setDashboardData(result);
      setStoreActive(Boolean(result.storeIsActive));
    } catch (error) {
      console.error("DASHBOARD ERROR:", error);

      toast.error(
        error?.response?.data?.error ||
          error?.message ||
          "Unable to load dashboard.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [filterYear, filterMonth]);

  /* =====================================================
     STORE STATUS
  ===================================================== */

  const toggleStore = async () => {
    if (toggling) return;

    try {
      setToggling(true);

      const token = await getToken();

      const { data } = await axios.patch(
        "/api/store/toggle",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const active = Boolean(data?.isActive);

      setStoreActive(active);

      toast.success(
        active ? "Your shop is now open" : "Your shop is now closed",
      );
    } catch (error) {
      console.error("STORE TOGGLE ERROR:", error);

      toast.error(
        error?.response?.data?.error || "Unable to update shop status.",
      );
    } finally {
      setToggling(false);
    }
  };

  /* =====================================================
     ORDERS
  ===================================================== */

  const filteredOrders = dashboardData.orders || [];

  const activeOrders = filteredOrders.filter(
    (order) => order.status !== "CANCELLED" && order.status !== "RETURNED",
  );

  const cancelledOrders = filteredOrders.filter(
    (order) => order.status === "CANCELLED",
  );

  const returnedOrders = filteredOrders.filter(
    (order) => order.status === "RETURNED",
  );

  /* =====================================================
     COMMISSION
  ===================================================== */

  const currentCommission = dashboardData.settings?.commissionPercent ?? 10;

  /* =====================================================
     NET EARNINGS
  ===================================================== */

  const netEarnings = useMemo(() => {
    return activeOrders.reduce((total, order) => {
      const productTotal = (order.orderItems || []).reduce(
        (sum, item) =>
          sum + Number(item.price || 0) * Number(item.quantity || 0),
        0,
      );

      const commission = order.commissionPercent ?? currentCommission;

      const sellerAmount =
        productTotal - (productTotal * Number(commission)) / 100;

      return total + sellerAmount;
    }, 0);
  }, [activeOrders, currentCommission]);

  /* =====================================================
     CANCELLED LOSS
  ===================================================== */

  const cancelledRevenueLoss = useMemo(() => {
    return (
      dashboardData.monthlyReport?.cancelledDetails?.reduce(
        (total, item) =>
          total + Number(item.price || 0) * Number(item.quantity || 0),
        0,
      ) || 0
    );
  }, [dashboardData.monthlyReport]);

  /* =====================================================
     RETURNED LOSS
  ===================================================== */

  const returnedRevenueLoss = useMemo(() => {
    return (
      dashboardData.monthlyReport?.returnedDetails?.reduce(
        (total, item) =>
          total + Number(item.price || 0) * Number(item.quantity || 0),
        0,
      ) || 0
    );
  }, [dashboardData.monthlyReport]);

  /* =====================================================
     RATING
  ===================================================== */

  const avgRating = useMemo(() => {
    if (!dashboardData.ratings?.length) return "0.0";

    const total = dashboardData.ratings.reduce(
      (sum, item) => sum + Number(item.rating || 0),
      0,
    );

    return (total / dashboardData.ratings.length).toFixed(1);
  }, [dashboardData.ratings]);

  /* =====================================================
     CHART DATA
  ===================================================== */

  const earningsData = useMemo(
    () =>
      (dashboardData.earningsChart || []).map((item) => ({
        name: item.name,
        value: Number(item.value || 0),
      })),
    [dashboardData.earningsChart],
  );

  const ordersData = useMemo(
    () =>
      (dashboardData.ordersChart || []).map((item) => ({
        name: item.name,
        value: Number(item.value || 0),
      })),
    [dashboardData.ordersChart],
  );

  const canceledOrdersData = useMemo(
    () =>
      (dashboardData.canceledChart || []).map((item) => ({
        name: item.name,
        value: Number(item.value || 0),
      })),
    [dashboardData.canceledChart],
  );

  /* =====================================================
     DOWNLOAD PDF
  ===================================================== */

  const handleDownloadPDF = async () => {
    const element = document.getElementById("pdf-report");

    if (!element) {
      toast.error("Report is not available.");
      return;
    }

    try {
      toast.loading("Preparing your report...", {
        id: "pdf-report",
      });

      await new Promise((resolve) => setTimeout(resolve, 400));

      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
      });

      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("p", "mm", "a4");

      const pageWidth = 210;
      const pageHeight = 297;

      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);

      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;

        pdf.addPage();

        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);

        heightLeft -= pageHeight;
      }

      pdf.save(`Seller-Report-${filterYear}-${filterMonth + 1}.pdf`);

      toast.success("Report downloaded successfully.", {
        id: "pdf-report",
      });
    } catch (error) {
      console.error("PDF ERROR:", error);

      toast.error("Unable to generate the report.", {
        id: "pdf-report",
      });
    }
  };

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return <Loading />;
  }

  /* =====================================================
     UI
  ===================================================== */

  return (
    <div className="min-h-screen bg-slate-50 px-4 pb-28 pt-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* =================================================
            TOP HEADER
        ================================================= */}

        <motion.div
          initial={{
            opacity: 0,
            y: -15,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between"
        >
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                <Store size={21} />
              </div>

              <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                  Seller Dashboard
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Manage your shop and track your performance.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleDownloadPDF}
            className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800 active:scale-[0.98]"
          >
            <Download size={17} />
            Download Report
          </button>
        </motion.div>

        {/* =================================================
            SHOP STATUS
        ================================================= */}

        <motion.div
          initial={{
            opacity: 0,
            y: 15,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className={`relative overflow-hidden rounded-3xl border p-5 shadow-sm sm:p-6 ${
            storeActive
              ? "border-emerald-200 bg-emerald-50"
              : "border-slate-200 bg-white"
          }`}
        >
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-2xl ${
                  storeActive
                    ? "bg-emerald-100 text-emerald-600"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {storeActive ? <Sun size={26} /> : <Moon size={26} />}
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Shop status
                </p>

                <h2 className="mt-1 text-xl font-black text-slate-900">
                  {storeActive ? "Your shop is open" : "Your shop is closed"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {storeActive
                    ? "Customers can currently place orders."
                    : "Customers cannot place new orders right now."}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={toggleStore}
              disabled={toggling}
              className={`relative h-12 w-24 rounded-full p-1 transition ${
                storeActive ? "bg-emerald-500" : "bg-slate-300"
              } disabled:cursor-not-allowed disabled:opacity-60`}
            >
              <motion.div
                animate={{
                  x: storeActive ? 48 : 0,
                }}
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 30,
                }}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md"
              >
                {storeActive ? (
                  <Sun size={19} className="text-emerald-500" />
                ) : (
                  <Moon size={19} className="text-slate-500" />
                )}
              </motion.div>
            </button>
          </div>
        </motion.div>

        {/* =================================================
            FILTERS
        ================================================= */}

        <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold text-slate-900">
              Performance overview
            </p>

            <p className="text-xs text-slate-400">
              Select a period to view your business performance.
            </p>
          </div>

          <div className="flex gap-3">
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(Number(e.target.value))}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            >
              {monthOptions.map((month, index) => (
                <option key={month} value={index}>
                  {month}
                </option>
              ))}
            </select>

            <select
              value={filterYear}
              onChange={(e) => setFilterYear(Number(e.target.value))}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            >
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* =================================================
            KPI CARDS
        ================================================= */}

        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.08,
              },
            },
          }}
          className="grid grid-cols-2 gap-4 xl:grid-cols-5"
        >
          {[
            {
              title: "Products",
              value: dashboardData.totalProducts,
              icon: Package,
              description: "Products listed",
              iconStyle: "bg-blue-50 text-blue-600",
            },

            {
              title: "Net Earnings",
              value: currency + netEarnings.toFixed(2),
              icon: CircleDollarSign,
              description: "After commission",
              iconStyle: "bg-emerald-50 text-emerald-600",
            },

            {
              title: "Orders",
              value: dashboardData.totalOrders,
              icon: ShoppingBag,
              description: "Total orders",
              iconStyle: "bg-indigo-50 text-indigo-600",
            },

            {
              title: "Rating",
              value: `${avgRating} / 5`,
              icon: Star,
              description: `${dashboardData.ratings?.length || 0} reviews`,
              iconStyle: "bg-amber-50 text-amber-600",
            },

            {
              title: "Cancelled",
              value: cancelledOrders.length,
              icon: XCircle,
              description: "Cancelled orders",
              iconStyle: "bg-red-50 text-red-600",
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <motion.div
                key={item.title}
                variants={{
                  hidden: {
                    opacity: 0,
                    y: 15,
                  },
                  visible: {
                    opacity: 1,
                    y: 0,
                  },
                }}
                whileHover={{
                  y: -3,
                }}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${item.iconStyle}`}
                  >
                    <Icon size={21} />
                  </div>
                </div>

                <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {item.title}
                </p>

                <p className="mt-1 truncate text-xl font-black text-slate-900">
                  {item.value}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  {item.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* =================================================
            QUICK SUMMARY
        ================================================= */}

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
            <div className="flex items-center gap-3">
              <TrendingUp size={20} className="text-emerald-600" />

              <p className="text-sm font-bold text-emerald-800">
                Your earnings
              </p>
            </div>

            <p className="mt-3 text-2xl font-black text-emerald-700">
              {currency}
              {netEarnings.toFixed(2)}
            </p>

            <p className="mt-1 text-xs text-emerald-700/60">
              Estimated seller earnings after commission
            </p>
          </div>

          <div className="rounded-2xl border border-red-100 bg-red-50 p-5">
            <div className="flex items-center gap-3">
              <TrendingDown size={20} className="text-red-600" />

              <p className="text-sm font-bold text-red-800">
                Cancelled revenue
              </p>
            </div>

            <p className="mt-3 text-2xl font-black text-red-700">
              {currency}
              {cancelledRevenueLoss.toFixed(2)}
            </p>

            <p className="mt-1 text-xs text-red-700/60">
              Revenue lost from cancelled orders
            </p>
          </div>

          <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5">
            <div className="flex items-center gap-3">
              <Package size={20} className="text-amber-600" />

              <p className="text-sm font-bold text-amber-800">
                Returned revenue
              </p>
            </div>

            <p className="mt-3 text-2xl font-black text-amber-700">
              {currency}
              {returnedRevenueLoss.toFixed(2)}
            </p>

            <p className="mt-1 text-xs text-amber-700/60">
              Revenue affected by returned orders
            </p>
          </div>
        </div>

        {/* =================================================
            ANALYTICS
        ================================================= */}

        <div>
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <BarChart3 size={20} />
            </div>

            <div>
              <h2 className="text-xl font-black text-slate-900">
                Business analytics
              </h2>

              <p className="text-sm text-slate-400">
                Understand how your shop is performing.
              </p>
            </div>
          </div>

          <DashboardCharts
            earningsData={earningsData}
            ordersData={ordersData}
            canceledOrdersData={canceledOrdersData}
            topProducts={dashboardData.topProducts}
          />
        </div>

        {/* =================================================
            INSIGHTS
        ================================================= */}

        <motion.div
          initial={{
            opacity: 0,
            y: 15,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
          }}
          className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-6"
        >
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
              <TrendingUp size={21} />
            </div>

            <div>
              <h3 className="font-black text-slate-900">Shop summary</h3>

              <p className="mt-1 text-sm text-slate-500">
                Here is a quick look at your current performance.
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl bg-white p-3 shadow-sm">
                  <p className="text-xs text-slate-400">Earnings</p>

                  <p className="mt-1 font-black text-slate-900">
                    {currency}
                    {netEarnings.toFixed(2)}
                  </p>
                </div>

                <div className="rounded-xl bg-white p-3 shadow-sm">
                  <p className="text-xs text-slate-400">Average rating</p>

                  <p className="mt-1 font-black text-slate-900">
                    ⭐ {avgRating}
                  </p>
                </div>

                <div className="rounded-xl bg-white p-3 shadow-sm">
                  <p className="text-xs text-slate-400">Returned orders</p>

                  <p className="mt-1 font-black text-slate-900">
                    {returnedOrders.length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* =================================================
            REVIEWS
        ================================================= */}

        <div>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-900">
                Customer reviews
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                See what customers think about your products.
              </p>
            </div>

            <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
              {dashboardData.ratings?.length || 0} reviews
            </div>
          </div>

          {!dashboardData.ratings?.length ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <Star size={32} className="mx-auto text-slate-300" />

              <p className="mt-3 font-bold text-slate-600">No reviews yet</p>

              <p className="mt-1 text-sm text-slate-400">
                Customer reviews will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {dashboardData.ratings.map((review, index) => (
                <motion.div
                  key={review.id || `${review.createdAt}-${index}`}
                  initial={{
                    opacity: 0,
                    y: 10,
                  }}
                  whileInView={{
                    opacity: 1,
                    y: 0,
                  }}
                  viewport={{
                    once: true,
                  }}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
                >
                  <div className="flex flex-col gap-5 sm:flex-row sm:justify-between">
                    {/* USER */}

                    <div className="flex gap-4">
                      {review.user?.image ? (
                        <Image
                          src={review.user.image}
                          alt={review.user?.name || "Customer"}
                          width={48}
                          height={48}
                          className="h-12 w-12 rounded-full object-cover ring-2 ring-slate-100"
                        />
                      ) : (
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-100 font-black text-indigo-600">
                          {review.user?.name?.charAt(0)?.toUpperCase() || "C"}
                        </div>
                      )}

                      <div>
                        <p className="font-bold text-slate-900">
                          {review.user?.name || "Customer"}
                        </p>

                        <p className="mt-0.5 text-xs text-slate-400">
                          {review.createdAt
                            ? new Date(review.createdAt).toLocaleDateString()
                            : ""}
                        </p>

                        <div className="mt-2 flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              size={15}
                              fill={
                                Number(review.rating) >= star
                                  ? "#f59e0b"
                                  : "transparent"
                              }
                              className={
                                Number(review.rating) >= star
                                  ? "text-amber-500"
                                  : "text-slate-300"
                              }
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* PRODUCT */}

                    <div className="sm:text-right">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Product
                      </p>

                      <p className="mt-1 font-bold text-slate-800">
                        {review.product?.name || "Product"}
                      </p>

                      {review.product?.category && (
                        <p className="mt-1 text-xs text-slate-400">
                          {review.product.category}
                        </p>
                      )}

                      {review.product?.id && (
                        <button
                          onClick={() =>
                            router.push(`/product/${review.product.id}`)
                          }
                          className="mt-3 rounded-lg bg-indigo-50 px-3 py-2 text-xs font-bold text-indigo-600 transition hover:bg-indigo-100"
                        >
                          View product
                        </button>
                      )}
                    </div>
                  </div>

                  {/* REVIEW */}

                  <div className="mt-5 rounded-xl bg-slate-50 p-4">
                    <p className="text-sm leading-relaxed text-slate-600">
                      “{review.review || "No written review."}”
                    </p>
                  </div>

                  {/* SELLER REPLY */}

                  {review.reply && (
                    <div className="mt-3 rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                      <p className="text-xs font-bold text-emerald-700">
                        Your reply
                      </p>

                      <p className="mt-1 text-sm text-emerald-800">
                        {review.reply}
                      </p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* =================================================
            PDF REPORT
        ================================================= */}

        <div
          id="pdf-report"
          style={{
            position: "fixed",
            left: "-99999px",
            top: 0,
            width: "800px",
            background: "#ffffff",
            color: "#1e293b",
            padding: "40px",
            fontFamily: "Arial, Helvetica, sans-serif",
            boxSizing: "border-box",
          }}
        >
          {/* HEADER */}

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "2px solid #e2e8f0",
              paddingBottom: "20px",
              marginBottom: "30px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
              }}
            >
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
                  }}
                />
              )}

              <div>
                <h1
                  style={{
                    margin: 0,
                    fontSize: "24px",
                  }}
                >
                  {dashboardData.storeName || "Seller Store"}
                </h1>

                <p
                  style={{
                    margin: "5px 0 0",
                    color: "#64748b",
                    fontSize: "13px",
                  }}
                >
                  Seller Performance Report
                </p>
              </div>
            </div>

            <div
              style={{
                textAlign: "right",
              }}
            >
              <p
                style={{
                  margin: 0,
                  color: "#64748b",
                  fontSize: "12px",
                }}
              >
                Reporting Period
              </p>

              <p
                style={{
                  margin: "4px 0 0",
                  fontSize: "15px",
                  fontWeight: "bold",
                }}
              >
                {monthOptions[filterMonth]} {filterYear}
              </p>
            </div>
          </div>

          {/* SUMMARY */}

          <h2
            style={{
              fontSize: "18px",
              marginBottom: "15px",
            }}
          >
            Executive Summary
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "12px",
              marginBottom: "30px",
            }}
          >
            {[
              {
                label: "Net Earnings",
                value: currency + netEarnings.toFixed(2),
              },
              {
                label: "Orders",
                value: dashboardData.totalOrders,
              },
              {
                label: "Cancelled",
                value: cancelledOrders.length,
              },
              {
                label: "Returned",
                value: returnedOrders.length,
              },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  padding: "16px",
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  textAlign: "center",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontSize: "11px",
                    color: "#64748b",
                    textTransform: "uppercase",
                  }}
                >
                  {item.label}
                </p>

                <p
                  style={{
                    margin: "8px 0 0",
                    fontSize: "19px",
                    fontWeight: "bold",
                  }}
                >
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          {/* FINANCIAL */}

          <h2
            style={{
              fontSize: "17px",
              marginBottom: "12px",
            }}
          >
            Financial Summary
          </h2>

          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginBottom: "30px",
            }}
          >
            <tbody>
              <tr>
                <td
                  style={{
                    padding: "10px",
                    borderBottom: "1px solid #e2e8f0",
                  }}
                >
                  Net Earnings
                </td>

                <td
                  style={{
                    padding: "10px",
                    textAlign: "right",
                    fontWeight: "bold",
                  }}
                >
                  {currency}
                  {netEarnings.toFixed(2)}
                </td>
              </tr>

              <tr>
                <td
                  style={{
                    padding: "10px",
                    borderBottom: "1px solid #e2e8f0",
                  }}
                >
                  Cancelled Revenue Loss
                </td>

                <td
                  style={{
                    padding: "10px",
                    textAlign: "right",
                    fontWeight: "bold",
                  }}
                >
                  {currency}
                  {cancelledRevenueLoss.toFixed(2)}
                </td>
              </tr>

              <tr>
                <td
                  style={{
                    padding: "10px",
                  }}
                >
                  Returned Revenue Loss
                </td>

                <td
                  style={{
                    padding: "10px",
                    textAlign: "right",
                    fontWeight: "bold",
                  }}
                >
                  {currency}
                  {returnedRevenueLoss.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>

          {/* TOP PRODUCTS */}

          <h2
            style={{
              fontSize: "17px",
              marginBottom: "12px",
            }}
          >
            Top Products
          </h2>

          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
            }}
          >
            <tbody>
              {dashboardData.monthlyReport?.topProducts?.length > 0 ? (
                dashboardData.monthlyReport.topProducts.map(
                  (product, index) => (
                    <tr key={index}>
                      <td
                        style={{
                          padding: "9px",
                          borderBottom: "1px solid #e2e8f0",
                        }}
                      >
                        {product.name}
                      </td>

                      <td
                        style={{
                          padding: "9px",
                          textAlign: "right",
                        }}
                      >
                        <strong>{product.sold}</strong> units sold
                      </td>
                    </tr>
                  ),
                )
              ) : (
                <tr>
                  <td
                    style={{
                      padding: "9px",
                      color: "#94a3b8",
                    }}
                  >
                    No product data available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* FOOTER */}

          <div
            style={{
              marginTop: "40px",
              paddingTop: "20px",
              borderTop: "1px solid #e2e8f0",
              textAlign: "center",
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: "11px",
                color: "#94a3b8",
              }}
            >
              Generated by Seller Analytics
            </p>

            <p
              style={{
                margin: "5px 0 0",
                fontSize: "10px",
                color: "#cbd5e1",
              }}
            >
              {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
