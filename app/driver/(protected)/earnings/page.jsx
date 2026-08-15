"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowDownRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  IndianRupee,
  MapPin,
  PackageCheck,
  Search,
  SlidersHorizontal,
  TrendingUp,
  Wallet,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { useDriver } from "@/context/DriverContext";

const MONTHS = [
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

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const formatDate = (value) => {
  if (!value) return "--";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
};

const formatTime = (value) => {
  if (!value) return "--";

  return new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
};

export default function DriverEarningsPage() {
  const { driver, loading: driverLoading } = useDriver();

  const [earnings, setEarnings] = useState([]);
  const [summary, setSummary] = useState(null);

  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);

  const [month, setMonth] = useState(
    new Date().getMonth() + 1
  );

  const [year, setYear] = useState(
    new Date().getFullYear()
  );

  const [search, setSearch] = useState("");

  const fetchEarnings = useCallback(async () => {
    if (!driver?.id) return;

    try {
      setLoading(true);

      const { data } = await axios.get(
        "/api/driver/earnings",
        {
          params: {
            driverId: driver.id,
            month,
            year,
          },
        }
      );

      setEarnings(
        Array.isArray(data.earnings)
          ? data.earnings
          : []
      );

      setSummary(data.summary || null);
    } catch (error) {
      console.error(error);

      toast.error(
        error?.response?.data?.error ||
          "Unable to load earnings"
      );
    } finally {
      setLoading(false);
    }
  }, [driver?.id, month, year]);

  useEffect(() => {
    fetchEarnings();
  }, [fetchEarnings]);

  const filteredEarnings = useMemo(() => {
    const text = search
      .trim()
      .toLowerCase();

    if (!text) return earnings;

    return earnings.filter((item) => {
      return (
        item.id
          ?.toLowerCase()
          .includes(text) ||
        item.store?.name
          ?.toLowerCase()
          .includes(text) ||
        item.address?.name
          ?.toLowerCase()
          .includes(text) ||
        item.address?.city
          ?.toLowerCase()
          .includes(text)
      );
    });
  }, [earnings, search]);

  const totalRevenue = useMemo(() => {
    return filteredEarnings.reduce(
      (sum, order) =>
        sum + Number(order.driverFee || 0),
      0
    );
  }, [filteredEarnings]);

  if (driverLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#f4f7fb] pb-24">

      {/* HERO */}
      <section className="rounded-b-[2.2rem] bg-slate-950 px-4 pb-20 pt-8 text-white shadow-xl sm:px-6 sm:pb-24">
        <div className="mx-auto max-w-6xl">

          <div className="flex items-start justify-between gap-4">

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                Driver Earnings
              </p>

              <h1 className="mt-2 text-3xl font-black sm:text-4xl">
                Earnings History
              </h1>

              <p className="mt-2 max-w-lg text-sm text-slate-400">
                Track completed deliveries, earnings,
                and payout performance.
              </p>
            </div>

            <div className="hidden rounded-2xl border border-white/10 bg-white/5 p-4 sm:block">
              <Wallet
                size={28}
                className="text-emerald-400"
              />
            </div>

          </div>

          {/* SUMMARY CARD */}
          <div className="mt-8 grid gap-3 sm:grid-cols-3">

            <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur">
              <p className="text-xs uppercase tracking-wider text-slate-400">
                This Period
              </p>

              <h2 className="mt-2 text-3xl font-black text-emerald-400">
                {formatCurrency(
                  summary?.totalRevenue ??
                    totalRevenue
                )}
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Total earnings
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-5">
              <p className="text-xs uppercase tracking-wider text-slate-400">
                Deliveries
              </p>

              <h2 className="mt-2 text-3xl font-black">
                {summary?.totalDeliveries ??
                  filteredEarnings.length}
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Completed orders
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-5">
              <p className="text-xs uppercase tracking-wider text-slate-400">
                Avg. Per Delivery
              </p>

              <h2 className="mt-2 text-3xl font-black text-indigo-300">
                {formatCurrency(
                  summary?.averagePerDelivery ??
                    (filteredEarnings.length
                      ? totalRevenue /
                        filteredEarnings.length
                      : 0)
                )}
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Average earning
              </p>
            </div>

          </div>

        </div>
      </section>

      <section className="mx-auto -mt-12 max-w-6xl space-y-6 px-3 sm:px-6">

        {/* FILTER BAR */}
        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

            <div className="relative flex-1">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search order, store or customer..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-500"
              />
            </div>

            <button
              type="button"
              onClick={() =>
                setFilterOpen(
                  (current) => !current
                )
              }
              className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <SlidersHorizontal size={17} />
              Filters
            </button>

          </div>

          {filterOpen && (
            <div className="mt-4 grid gap-3 border-t border-slate-100 pt-4 sm:grid-cols-2">

              <select
                value={month}
                onChange={(e) =>
                  setMonth(
                    Number(e.target.value)
                  )
                }
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
              >
                {MONTHS.map(
                  (label, index) => (
                    <option
                      key={label}
                      value={index + 1}
                    >
                      {label}
                    </option>
                  )
                )}
              </select>

              <select
                value={year}
                onChange={(e) =>
                  setYear(
                    Number(e.target.value)
                  )
                }
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
              >
                {[2024, 2025, 2026, 2027].map(
                  (value) => (
                    <option
                      key={value}
                      value={value}
                    >
                      {value}
                    </option>
                  )
                )}
              </select>

            </div>
          )}

        </div>

        {/* QUICK SUMMARY */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50">
              <TrendingUp
                size={18}
                className="text-emerald-600"
              />
            </div>

            <p className="mt-3 text-xs text-slate-400">
              Revenue
            </p>

            <p className="mt-1 text-lg font-bold">
              {formatCurrency(
                summary?.totalRevenue ??
                  totalRevenue
              )}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50">
              <PackageCheck
                size={18}
                className="text-indigo-600"
              />
            </div>

            <p className="mt-3 text-xs text-slate-400">
              Orders
            </p>

            <p className="mt-1 text-lg font-bold">
              {filteredEarnings.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50">
              <IndianRupee
                size={18}
                className="text-amber-600"
              />
            </div>

            <p className="mt-3 text-xs text-slate-400">
              Best Delivery
            </p>

            <p className="mt-1 text-lg font-bold">
              {formatCurrency(
                Math.max(
                  0,
                  ...filteredEarnings.map(
                    (item) =>
                      Number(
                        item.driverFee || 0
                      )
                  )
                )
              )}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50">
              <CalendarDays
                size={18}
                className="text-sky-600"
              />
            </div>

            <p className="mt-3 text-xs text-slate-400">
              Period
            </p>

            <p className="mt-1 truncate text-sm font-bold">
              {MONTHS[month - 1]} {year}
            </p>
          </div>

        </div>

        {/* HISTORY LIST */}
        <div className="space-y-3">

          <div className="flex items-center justify-between px-1">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Completed Deliveries
              </p>

              <h2 className="mt-1 text-xl font-bold text-slate-900">
                Transaction History
              </h2>
            </div>

            <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-600">
              {filteredEarnings.length}
            </span>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-32 animate-pulse rounded-3xl bg-white"
                />
              ))}
            </div>
          ) : filteredEarnings.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-5 py-16 text-center">
              <Wallet
                size={42}
                className="mx-auto text-slate-300"
              />

              <h3 className="mt-4 text-lg font-bold text-slate-800">
                No earnings found
              </h3>

              <p className="mt-2 text-sm text-slate-400">
                Completed deliveries for this period
                will appear here.
              </p>
            </div>
          ) : (
            filteredEarnings.map((order) => (
              <article
                key={order.id}
                className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md sm:p-5"
              >

                <div className="flex items-start justify-between gap-4">

                  <div className="min-w-0">

                    <div className="flex flex-wrap items-center gap-2">

                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                        DELIVERED
                      </span>

                      <span className="text-xs text-slate-400">
                        #{order.id?.slice(-6)}
                      </span>

                    </div>

                    <h3 className="mt-3 truncate text-base font-bold text-slate-900 sm:text-lg">
                      {order.store?.name ||
                        "Store"}
                    </h3>

                    <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                      <MapPin size={13} />

                      <span className="truncate">
                        {order.address?.name ||
                          order.address?.city ||
                          "Customer"}
                      </span>
                    </div>

                  </div>

                  <div className="shrink-0 text-right">

                    <p className="text-xs text-slate-400">
                      You earned
                    </p>

                    <p className="mt-1 text-xl font-black text-emerald-600">
                      {formatCurrency(
                        order.driverFee
                      )}
                    </p>

                  </div>

                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 rounded-2xl bg-slate-50 p-3 sm:grid-cols-4">

                  <div>
                    <p className="text-[10px] uppercase text-slate-400">
                      Date
                    </p>

                    <p className="mt-1 text-xs font-semibold text-slate-700">
                      {formatDate(
                        order.deliveredAt ||
                          order.createdAt
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] uppercase text-slate-400">
                      Time
                    </p>

                    <p className="mt-1 text-xs font-semibold text-slate-700">
                      {formatTime(
                        order.deliveredAt ||
                          order.createdAt
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] uppercase text-slate-400">
                      Order Total
                    </p>

                    <p className="mt-1 text-xs font-semibold text-slate-700">
                      {formatCurrency(
                        order.total
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] uppercase text-slate-400">
                      Payment
                    </p>

                    <p className="mt-1 text-xs font-semibold text-slate-700">
                      {order.paymentMethod ||
                        "--"}
                    </p>
                  </div>

                </div>

              </article>
            ))
          )}

        </div>

      </section>
    </main>
  );
}