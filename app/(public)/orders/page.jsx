"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import RatingModal from "@/components/RatingModal";
import OrderCard from "@/components/OrderCard";
import EmptyOrders from "@/components/orders/EmptyOrders";

import {
  ShoppingBag,
  Truck,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Package,
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

    return () =>
      window.removeEventListener("focus", onFocus);

  }, [user]);

  // ================= STATS =================

  const stats = useMemo(() => {

    return {

      total: orders.length,

      delivered: orders.filter(
        o => o.status === "DELIVERED"
      ).length,

      cancelled: orders.filter(
        o => o.status === "CANCELLED"
      ).length,

      active: orders.filter(
        o =>
          !["DELIVERED", "CANCELLED"].includes(
            o.status
          )
      ).length,

    };

  }, [orders]);

  // ================= FILTER =================

  const filteredOrders = useMemo(() => {

    let data = [...orders];

    // Search

    if (search.trim()) {

      data = data.filter(order =>
        order.id
          .toLowerCase()
          .includes(search.toLowerCase())
      );

    }

    // Filter

    if (filter !== "ALL") {

      if (filter === "ACTIVE") {

        data = data.filter(
          o =>
            ![
              "DELIVERED",
              "CANCELLED",
            ].includes(o.status)
        );

      }

      else {

        data = data.filter(
          o => o.status === filter
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

        data.sort(
          (a, b) => b.total - a.total
        );

        break;

      case "LOW":

        data.sort(
          (a, b) => a.total - b.total
        );

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

  const startIndex = (currentPage - 1) * ORDERS_PER_PAGE;
  const endIndex = currentPage * ORDERS_PER_PAGE;

  useEffect(() => {

    setCurrentPage(1);

  }, [search, filter, sort]);

  if (!isLoaded || loading) {
    return (
      <section className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#020617] to-black px-6 py-24">
        <div className="max-w-7xl mx-auto">
          <OrderSkeleton count={5} />
        </div>
      </section>
    );
  }

  return (

    <section className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#020617] to-black text-white py-24 px-4">

      <div className="max-w-7xl mx-auto">

        {/* Header */}

        <div className="mb-10">

          <h1 className="text-4xl font-bold">
            Your Orders
          </h1>

          <p className="text-white/50 mt-2">
            Manage and track your purchases.
          </p>

        </div>

        {/* Stats */}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">

          <StatsCard
            title="Total Orders"
            value={orders.length}
            icon={Package}
            color="indigo"
            subtitle="All orders"
          />

          <StatsCard
            title="Delivered"
            value={
              orders.filter(
                o => o.status === "DELIVERED"
              ).length
            }
            icon={CheckCircle}
            color="emerald"
            subtitle="Successfully delivered"
          />

          <StatsCard
            title="In Progress"
            value={
              orders.filter(
                o =>
                  ![
                    "DELIVERED",
                    "CANCELLED",
                  ].includes(o.status)
              ).length
            }
            icon={Truck}
            color="amber"
            subtitle="Currently active"
          />

          <StatsCard
            title="Cancelled"
            value={
              orders.filter(
                o => o.status === "CANCELLED"
              ).length
            }
            icon={XCircle}
            color="rose"
            subtitle="Cancelled orders"
          />

        </div>

        {/* Filters */}

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-8">

          <div className="grid lg:grid-cols-3 gap-4">

            <div className="relative">

              <Search
                size={18}
                className="absolute left-4 top-4 text-white/40"
              />

              <input
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search Order ID..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-indigo-500"
              />

            </div>

            <select
              value={filter}
              onChange={(e) =>
                setFilter(e.target.value)
              }
              className="bg-slate-950 border border-slate-700 rounded-xl p-3"
            >
              <option value="ALL">All Orders</option>
              <option value="ACTIVE">Active</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>

            <select
              value={sort}
              onChange={(e) =>
                setSort(e.target.value)
              }
              className="bg-slate-950 border border-slate-700 rounded-xl p-3"
            >
              <option value="NEWEST">Newest</option>
              <option value="OLDEST">Oldest</option>
              <option value="HIGH">Highest Amount</option>
              <option value="LOW">Lowest Amount</option>
            </select>

          </div>

        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-3">

          <p className="text-slate-400 text-sm">
            Showing{" "}
            <span className="font-semibold text-white">
              {filteredOrders.length === 0
                ? 0
                : startIndex + 1}
            </span>

            -

            <span className="font-semibold text-white">
              {Math.min(
                endIndex,
                filteredOrders.length
              )}
            </span>

            {" "}of{" "}

            <span className="text-indigo-400 font-bold">
              {filteredOrders.length}
            </span>

            {" "}orders

          </p>

        </div>

        {/* Orders */}

        <div className="space-y-6">

          {orders.length === 0 ? (

            <EmptyOrders />

          ) : currentOrders.length > 0 ? (

            currentOrders.map((order) => (

              <OrderCard
                key={order.id}
                order={order}
                onTrack={() => router.push(`/tracking/${order.id}`)}
                onRate={() => setRatingOrder(order)}
                onRefresh={fetchOrders}
              />

            ))

          ) : (

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-14 text-center">

              <ShoppingBag
                size={60}
                className="mx-auto text-slate-500 mb-5"
              />

              <h2 className="text-3xl font-bold text-white">
                No Matching Orders
              </h2>

              <p className="text-slate-400 mt-3">
                We couldn't find any orders matching your search or filters.
              </p>

              <button
                onClick={() => {
                  setSearch("");
                  setFilter("ALL");
                  setSort("NEWEST");
                }}
                className="mt-8 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 transition font-semibold"
              >
                Clear Filters
              </button>

            </div>

          )}

        </div>

        {/* Pagination */}

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />

      </div>

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

  return (

    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">

      <div className="flex justify-between">

        <div>

          <p className="text-white/50 text-sm">
            {title}
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {value}
          </h2>

        </div>

        <div className="text-indigo-400">
          {icon}
        </div>

      </div>

    </div>

  );

}