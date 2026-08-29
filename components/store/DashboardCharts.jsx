"use client";

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";
import {
  BarChart3,
  CircleDollarSign,
  ShoppingBag,
  TrendingDown,
  Package,
} from "lucide-react";

const cardClass =
  "rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl";

const tooltipStyle = {
  backgroundColor: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: "14px",
  boxShadow: "0 10px 30px rgba(15, 23, 42, 0.10)",
};

function EmptyChart({ message }) {
  return (
    <div className="flex h-[270px] flex-col items-center justify-center rounded-2xl bg-slate-50">
      <BarChart3 className="mb-3 h-9 w-9 text-slate-300" />

      <p className="text-sm font-semibold text-slate-500">No data available</p>

      <p className="mt-1 max-w-xs text-center text-xs text-slate-400">
        {message}
      </p>
    </div>
  );
}

function ChartHeader({ icon: Icon, title, description, badge, badgeClass }) {
  return (
    <div className="mb-5 flex items-start justify-between gap-4">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100">
          <Icon className="h-5 w-5 text-slate-600" />
        </div>

        <div className="min-w-0">
          <h3 className="text-sm font-bold text-slate-800">{title}</h3>

          <p className="mt-0.5 text-xs text-slate-400">{description}</p>
        </div>
      </div>

      {badge && (
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-[10px] font-bold ${badgeClass}`}
        >
          {badge}
        </span>
      )}
    </div>
  );
}

function ChartWrapper({ children }) {
  return (
    <div className="h-[270px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  );
}

function CustomTooltip({ active, payload, label, prefix = "" }) {
  if (!active || !payload || !payload.length) {
    return null;
  }

  const value = payload[0]?.value ?? 0;

  return (
    <div style={tooltipStyle} className="px-4 py-3">
      <p className="mb-1 text-xs font-medium text-slate-400">{label}</p>

      <p className="text-sm font-black text-slate-800">
        {prefix}
        {Number(value).toLocaleString()}
      </p>
    </div>
  );
}

export default function DashboardCharts({
  earningsData = [],
  ordersData = [],
  canceledOrdersData = [],
  topProducts = [],
}) {
  /* =====================================================
     SAFE DATA
  ===================================================== */

  const safeEarnings = Array.isArray(earningsData)
    ? earningsData.map((item) => ({
        name: item?.name ?? "",
        value: Number(item?.value ?? 0),
      }))
    : [];

  const safeOrders = Array.isArray(ordersData)
    ? ordersData.map((item) => ({
        name: item?.name ?? "",
        value: Number(item?.value ?? 0),
      }))
    : [];

  const safeCanceled = Array.isArray(canceledOrdersData)
    ? canceledOrdersData.map((item) => ({
        name: item?.name ?? "",
        value: Number(item?.value ?? 0),
      }))
    : [];

  /* =====================================================
     TOP PRODUCTS
  ===================================================== */

  const safeTopProducts = Array.isArray(topProducts)
    ? topProducts
        .map((product) => ({
          name: product?.name || "Unknown Product",
          sold: Number(
            product?.totalSold ??
              product?.sold ??
              product?.quantitySold ??
              product?.totalOrders ??
              product?.count ??
              product?._count?.orders ??
              0,
          ),
        }))
        .filter((product) => product.sold > 0)
        .sort((a, b) => b.sold - a.sold)
        .slice(0, 8)
    : [];

  /* =====================================================
     TOTALS
  ===================================================== */

  const totalEarnings = safeEarnings.reduce((sum, item) => sum + item.value, 0);

  const totalOrders = safeOrders.reduce((sum, item) => sum + item.value, 0);

  const totalCanceled = safeCanceled.reduce((sum, item) => sum + item.value, 0);

  const topProduct = safeTopProducts[0];

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div className="mb-12 space-y-8">
      {/* =================================================
          QUICK PERFORMANCE SUMMARY
      ================================================= */}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="grid grid-cols-1 gap-4 sm:grid-cols-3"
      >
        {/* Earnings */}
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
              <CircleDollarSign className="h-5 w-5 text-emerald-600" />
            </div>

            <div>
              <p className="text-xs font-medium text-slate-500">
                Period earnings
              </p>

              <p className="text-xl font-black text-slate-800">
                ₹{totalEarnings.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Orders */}
        <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
              <ShoppingBag className="h-5 w-5 text-blue-600" />
            </div>

            <div>
              <p className="text-xs font-medium text-slate-500">
                Period orders
              </p>

              <p className="text-xl font-black text-slate-800">
                {totalOrders.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Canceled */}
        <div className="rounded-2xl border border-red-100 bg-red-50/60 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100">
              <TrendingDown className="h-5 w-5 text-red-600" />
            </div>

            <div>
              <p className="text-xs font-medium text-slate-500">
                Canceled orders
              </p>

              <p className="text-xl font-black text-slate-800">
                {totalCanceled.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* =================================================
          MAIN CHARTS
      ================================================= */}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* =================================================
            EARNINGS
        ================================================= */}

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className={cardClass}
        >
          <ChartHeader
            icon={CircleDollarSign}
            title="Earnings trend"
            description="Track how your earnings change over the period"
            badge="EARNINGS"
            badgeClass="bg-emerald-50 text-emerald-600"
          />

          {safeEarnings.length === 0 ? (
            <EmptyChart message="Earnings data will appear here once you receive orders." />
          ) : (
            <ChartWrapper>
              <LineChart
                data={safeEarnings}
                margin={{
                  top: 10,
                  right: 10,
                  left: -15,
                  bottom: 5,
                }}
              >
                <CartesianGrid
                  stroke="#e2e8f0"
                  strokeDasharray="4 5"
                  vertical={false}
                />

                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: "#94a3b8",
                    fontSize: 11,
                  }}
                  tickMargin={10}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: "#94a3b8",
                    fontSize: 11,
                  }}
                  tickFormatter={(value) =>
                    value >= 1000
                      ? `₹${(value / 1000).toFixed(0)}k`
                      : `₹${value}`
                  }
                />

                <Tooltip content={<CustomTooltip prefix="₹" />} />

                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{
                    r: 3,
                    strokeWidth: 2,
                    fill: "#ffffff",
                  }}
                  activeDot={{
                    r: 6,
                    strokeWidth: 0,
                  }}
                  animationDuration={1000}
                />
              </LineChart>
            </ChartWrapper>
          )}
        </motion.div>

        {/* =================================================
            ORDERS
        ================================================= */}

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.08 }}
          className={cardClass}
        >
          <ChartHeader
            icon={ShoppingBag}
            title="Order activity"
            description="See when customers are placing orders"
            badge="ORDERS"
            badgeClass="bg-blue-50 text-blue-600"
          />

          {safeOrders.length === 0 ? (
            <EmptyChart message="Order activity will appear here once customers place orders." />
          ) : (
            <ChartWrapper>
              <BarChart
                data={safeOrders}
                margin={{
                  top: 10,
                  right: 10,
                  left: -15,
                  bottom: 5,
                }}
              >
                <CartesianGrid
                  stroke="#e2e8f0"
                  strokeDasharray="4 5"
                  vertical={false}
                />

                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: "#94a3b8",
                    fontSize: 11,
                  }}
                  tickMargin={10}
                />

                <YAxis
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: "#94a3b8",
                    fontSize: 11,
                  }}
                />

                <Tooltip content={<CustomTooltip />} />

                <Bar
                  dataKey="value"
                  fill="#3b82f6"
                  radius={[8, 8, 4, 4]}
                  maxBarSize={42}
                  animationDuration={900}
                />
              </BarChart>
            </ChartWrapper>
          )}
        </motion.div>

        {/* =================================================
            CANCELED ORDERS
        ================================================= */}

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.16 }}
          className={cardClass}
        >
          <ChartHeader
            icon={TrendingDown}
            title="Canceled orders"
            description="Understand order cancellations and potential losses"
            badge="ATTENTION"
            badgeClass="bg-red-50 text-red-600"
          />

          {safeCanceled.length === 0 || totalCanceled === 0 ? (
            <div className="flex h-[270px] flex-col items-center justify-center rounded-2xl bg-emerald-50/50">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                <TrendingDown className="h-5 w-5 text-emerald-600" />
              </div>

              <p className="mt-3 text-sm font-bold text-emerald-700">
                No canceled orders
              </p>

              <p className="mt-1 text-xs text-emerald-600/70">
                Great! Your orders are staying on track.
              </p>
            </div>
          ) : (
            <ChartWrapper>
              <BarChart
                data={safeCanceled}
                margin={{
                  top: 10,
                  right: 10,
                  left: -15,
                  bottom: 5,
                }}
              >
                <CartesianGrid
                  stroke="#e2e8f0"
                  strokeDasharray="4 5"
                  vertical={false}
                />

                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: "#94a3b8",
                    fontSize: 11,
                  }}
                  tickMargin={10}
                />

                <YAxis
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: "#94a3b8",
                    fontSize: 11,
                  }}
                />

                <Tooltip content={<CustomTooltip />} />

                <Bar
                  dataKey="value"
                  fill="#ef4444"
                  radius={[8, 8, 4, 4]}
                  maxBarSize={42}
                  animationDuration={900}
                />
              </BarChart>
            </ChartWrapper>
          )}
        </motion.div>

        {/* =================================================
            SELLER INSIGHT
        ================================================= */}

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.24 }}
          className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white shadow-lg"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
              <TrendingDown className="h-5 w-5 text-white" />
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-white/40">
                Seller insight
              </p>

              <h3 className="mt-1 text-lg font-black">
                Your business at a glance
              </h3>
            </div>
          </div>

          <div className="mt-7 space-y-4">
            <div className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
              <span className="text-sm text-white/60">Total earnings</span>

              <span className="font-bold text-emerald-400">
                ₹{totalEarnings.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
              <span className="text-sm text-white/60">Orders received</span>

              <span className="font-bold">{totalOrders.toLocaleString()}</span>
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
              <span className="text-sm text-white/60">Canceled orders</span>

              <span
                className={
                  totalCanceled > 0
                    ? "font-bold text-red-400"
                    : "font-bold text-emerald-400"
                }
              >
                {totalCanceled.toLocaleString()}
              </span>
            </div>

            <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs leading-relaxed text-white/50">
                {totalCanceled > 0
                  ? "Keep an eye on canceled orders. Reducing cancellations can directly improve your store performance."
                  : "Excellent performance. You currently have no canceled orders in this period."}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* =================================================
          TOP PRODUCTS
      ================================================= */}

      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.3 }}
        className={cardClass}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50">
              <Package className="h-5 w-5 text-purple-600" />
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-800">
                Best-selling products
              </h3>

              <p className="mt-0.5 text-xs text-slate-400">
                Products generating the most customer demand
              </p>
            </div>
          </div>

          {topProduct && (
            <span className="rounded-full bg-purple-50 px-3 py-1 text-[10px] font-bold text-purple-600">
              TOP PRODUCT
            </span>
          )}
        </div>

        {safeTopProducts.length === 0 ? (
          <EmptyChart message="Your best-selling products will appear here after customers start buying." />
        ) : (
          <div className="space-y-3">
            {safeTopProducts.map((product, index) => {
              const maxSold = safeTopProducts[0]?.sold || 1;

              const percentage = Math.max(5, (product.sold / maxSold) * 100);

              return (
                <motion.div
                  key={`${product.name}-${index}`}
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: 0.35 + index * 0.05,
                  }}
                  className="group"
                >
                  <div className="mb-1.5 flex items-center justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-black text-slate-500">
                        {index + 1}
                      </span>

                      <span className="truncate text-sm font-semibold text-slate-700">
                        {product.name}
                      </span>
                    </div>

                    <span className="shrink-0 text-xs font-bold text-slate-500">
                      {product.sold} sold
                    </span>
                  </div>

                  <div className="ml-10 h-2 overflow-hidden rounded-full bg-slate-100">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{
                        duration: 0.8,
                        delay: 0.35 + index * 0.05,
                        ease: "easeOut",
                      }}
                      className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500"
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}
