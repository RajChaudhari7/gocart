"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import RatingModal from "@/components/RatingModal";
import OrderCard from "@/components/OrderCard";
import EmptyOrders from "@/components/orders/EmptyOrders";

import {
  ShoppingBag,
  Truck,
  CheckCircle,
  XCircle,
  Search,
  Package,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";

import OrderSkeleton from "@/components/orders/OrderSkeleton";
import StatsCard from "@/components/orders/StatsCard";
import Pagination from "@/components/orders/Pagination";

const ORDERS_PER_PAGE = 5;

export default function Orders() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [ratingOrder, setRatingOrder] = useState(null);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [sort, setSort] = useState("NEWEST");

  const [currentPage, setCurrentPage] = useState(1);

  // ================= FETCH =================

  const fetchOrders = async () => {
    try {
      setLoading(true);

      const token = await getToken();

      const { data } = await axios.get("/api/orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setOrders(data.orders);
    } catch (error) {
      toast.error(error?.response?.data?.error || error.message);
    } finally {
      setLoading(false);
    }
  };

  // ================= AUTH =================

  useEffect(() => {
    if (!isLoaded) return;

    if (!user) {
      router.push("/");
      return;
    }

    fetchOrders();
  }, [isLoaded]);

  // Refresh when tab active
  useEffect(() => {
    const onFocus = () => {
      if (user) {
        fetchOrders();
      }
    };

    window.addEventListener("focus", onFocus);

    return () => window.removeEventListener("focus", onFocus);
  }, [user]);

  // ================= STATS =================

  const stats = useMemo(() => {
    return {
      total: orders.length,

      delivered: orders.filter(
        (o) => o.status === "DELIVERED"
      ).length,

      cancelled: orders.filter(
        (o) => o.status === "CANCELLED"
      ).length,

      active: orders.filter(
        (o) =>
          !["DELIVERED", "CANCELLED"].includes(o.status)
      ).length,
    };
  }, [orders]);

  // ================= FILTER =================

  const filteredOrders = useMemo(() => {
    let data = [...orders];

    // Search
    if (search.trim()) {
      data = data.filter((order) =>
        order.id
          .toLowerCase()
          .includes(search.toLowerCase())
      );
    }

    // Filter
    if (filter !== "ALL") {
      if (filter === "ACTIVE") {
        data = data.filter(
          (o) =>
            !["DELIVERED", "CANCELLED"].includes(o.status)
        );
      } else {
        data = data.filter(
          (o) => o.status === filter
        );
      }
    }

    // Sort
    switch (sort) {
      case "OLDEST":
        data.sort(
          (a, b) =>
            new Date(a.createdAt) -
            new Date(b.createdAt)
        );
        break;

      case "HIGH":
        data.sort((a, b) => b.total - a.total);
        break;

      case "LOW":
        data.sort((a, b) => a.total - b.total);
        break;

      default:
        data.sort(
          (a, b) =>
            new Date(b.createdAt) -
            new Date(a.createdAt)
        );
    }

    return data;
  }, [orders, search, filter, sort]);

  // ================= PAGINATION =================

  const totalPages = Math.ceil(
    filteredOrders.length / ORDERS_PER_PAGE
  );

  const currentOrders = filteredOrders.slice(
    (currentPage - 1) * ORDERS_PER_PAGE,
    currentPage * ORDERS_PER_PAGE
  );

  const startIndex =
    (currentPage - 1) * ORDERS_PER_PAGE;

  const endIndex =
    currentPage * ORDERS_PER_PAGE;

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filter, sort]);

  // ================= LOADING =================

  if (!isLoaded || loading) {
    return (
      <section className="min-h-screen bg-slate-50 px-4 sm:px-6 py-24 text-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="h-8 w-48 bg-slate-200 rounded-lg animate-pulse" />
            <div className="h-4 w-64 bg-slate-200 rounded mt-3 animate-pulse" />
          </div>

          <OrderSkeleton count={5} />
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-slate-50 text-slate-900 py-24 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">

        {/* ================= HEADER ================= */}

        <div className="relative mb-8 sm:mb-10 overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">

          {/* Decorative background */}
          <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-emerald-100/60 blur-2xl" />
          <div className="absolute -bottom-20 right-28 h-36 w-36 rounded-full bg-indigo-100/50 blur-3xl" />

          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">

            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700">
                <Package size={14} />
                My Orders
              </div>

              <h1 className="mt-4 text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
                Your Orders
              </h1>

              <p className="mt-2 text-sm sm:text-base text-slate-500">
                Manage, track and review your purchases.
              </p>
            </div>

            <div className="hidden sm:flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <ShoppingBag size={26} />
            </div>

          </div>
        </div>

        {/* ================= STATS ================= */}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 mb-8 sm:mb-10">

          <StatsCard
            title="Total Orders"
            value={stats.total}
            icon={Package}
            color="indigo"
            subtitle="All orders"
          />

          <StatsCard
            title="Delivered"
            value={stats.delivered}
            icon={CheckCircle}
            color="emerald"
            subtitle="Successfully delivered"
          />

          <StatsCard
            title="In Progress"
            value={stats.active}
            icon={Truck}
            color="amber"
            subtitle="Currently active"
          />

          <StatsCard
            title="Cancelled"
            value={stats.cancelled}
            icon={XCircle}
            color="rose"
            subtitle="Cancelled orders"
          />

        </div>

        {/* ================= FILTERS ================= */}

        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">

          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <SlidersHorizontal size={17} />
            </div>

            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Find an order
              </h2>

              <p className="text-xs text-slate-500">
                Search, filter or sort your purchases
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-3">

            {/* Search */}

            <div className="relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search Order ID..."
                className="w-full h-12 rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-50"
              />
            </div>

            {/* Filter */}

            <div className="relative">
              <select
                value={filter}
                onChange={(e) =>
                  setFilter(e.target.value)
                }
                className="w-full h-12 appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 pr-10 text-sm font-medium text-slate-700 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-50"
              >
                <option value="ALL">
                  All Orders
                </option>

                <option value="ACTIVE">
                  Active
                </option>

                <option value="DELIVERED">
                  Delivered
                </option>

                <option value="CANCELLED">
                  Cancelled
                </option>
              </select>

              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                ▾
              </span>
            </div>

            {/* Sort */}

            <div className="relative">
              <select
                value={sort}
                onChange={(e) =>
                  setSort(e.target.value)
                }
                className="w-full h-12 appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 pr-10 text-sm font-medium text-slate-700 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-50"
              >
                <option value="NEWEST">
                  Newest
                </option>

                <option value="OLDEST">
                  Oldest
                </option>

                <option value="HIGH">
                  Highest Amount
                </option>

                <option value="LOW">
                  Lowest Amount
                </option>
              </select>

              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                ▾
              </span>
            </div>

          </div>
        </div>

        {/* ================= RESULT COUNT ================= */}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">

          <div>
            <p className="text-sm text-slate-500">
              Showing{" "}
              <span className="font-bold text-slate-900">
                {filteredOrders.length === 0
                  ? 0
                  : startIndex + 1}
              </span>
              {" - "}
              <span className="font-bold text-slate-900">
                {Math.min(
                  endIndex,
                  filteredOrders.length
                )}
              </span>
              {" "}of{" "}
              <span className="font-bold text-emerald-600">
                {filteredOrders.length}
              </span>
              {" "}orders
            </p>
          </div>

          {filteredOrders.length > 0 && (
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-500 shadow-sm">
              <Sparkles
                size={13}
                className="text-amber-500"
              />
              Latest purchases
            </div>
          )}

        </div>

        {/* ================= ORDERS ================= */}

        <div className="space-y-5 sm:space-y-6">

          {orders.length === 0 ? (

            <div className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-14 text-center shadow-sm">
              <EmptyOrders />
            </div>

          ) : currentOrders.length > 0 ? (

            currentOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onTrack={() =>
                  router.push(`/tracking/${order.id}`)
                }
                onRate={() =>
                  setRatingOrder(order)
                }
                onRefresh={fetchOrders}
              />
            ))

          ) : (

            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 sm:p-14 text-center shadow-sm">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <ShoppingBag size={30} />
              </div>

              <h2 className="mt-5 text-2xl sm:text-3xl font-black text-slate-900">
                No Matching Orders
              </h2>

              <p className="mx-auto mt-3 max-w-md text-sm sm:text-base text-slate-500">
                We couldn't find any orders matching your search or filters.
              </p>

              <button
                onClick={() => {
                  setSearch("");
                  setFilter("ALL");
                  setSort("NEWEST");
                }}
                className="mt-7 inline-flex items-center justify-center rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 hover:shadow-md active:scale-[0.98]"
              >
                Clear Filters
              </button>

            </div>

          )}

        </div>

        {/* ================= PAGINATION ================= */}

        <div className="mt-8">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>

      </div>

      {/* ================= RATING MODAL ================= */}

      {ratingOrder && (
        <RatingModal
          order={ratingOrder}
          onClose={() =>
            setRatingOrder(null)
          }
          onSuccess={() => {
            setRatingOrder(null);
            fetchOrders();
          }}
        />
      )}

    </section>
  );
}

function StatCard({ icon, title, value }) {
  const Icon = icon;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

      <div className="flex items-start justify-between gap-3">

        <div className="min-w-0">
          <p className="truncate text-xs sm:text-sm font-medium text-slate-500">
            {title}
          </p>

          <h2 className="mt-2 text-2xl sm:text-3xl font-black text-slate-900">
            {value}
          </h2>
        </div>

        <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
          <Icon size={20} />
        </div>

      </div>
    </div>
  );
}