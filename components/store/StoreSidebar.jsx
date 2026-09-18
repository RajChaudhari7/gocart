"use client";

import { usePathname } from "next/navigation";
import {
  BarChart3Icon,
  HomeIcon,
  LayoutListIcon,
  SquarePenIcon,
  SquarePlusIcon,
  TruckIcon,
  UsersIcon,
  StoreIcon,
  Settings2Icon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const StoreSidebar = ({
  storeInfo,
  pendingOrdersCount = 0,
}) => {
  const pathname = usePathname();

  const sidebarLinks = [
    {
      name: "Dashboard",
      href: "/store",
      icon: HomeIcon,
    },
    {
      name: "Followers",
      href: "/store/followers",
      icon: UsersIcon,
    },
    {
      name: "Add Product",
      href: "/store/add-product",
      icon: SquarePlusIcon,
    },
    {
      name: "Manage Products",
      href: "/store/manage-product",
      icon: SquarePenIcon,
    },
    {
      name: "Product Analytics",
      href: "/store/product-analytics",
      icon: BarChart3Icon,
    },
    {
      name: "Pending Orders",
      href: "/store/orders",
      icon: LayoutListIcon,
      badge: pendingOrdersCount,
    },
    {
      name: "Delivered Orders",
      href: "/store/delivered-orders",
      icon: TruckIcon,
    },
    {
      name: "Store Profile",
      href: "/store/profile",
      icon: StoreIcon,
    },
  ];

  return (
    <>
      {/* =====================================================
          DESKTOP SIDEBAR
      ===================================================== */}

      <aside className="hidden h-full w-64 shrink-0 flex-col border-r border-slate-200 bg-white sm:flex">

        {/* ================= STORE HEADER ================= */}

        <div className="shrink-0 border-b border-slate-100 px-5 py-7">
          <div className="flex flex-col items-center">

            {/* Store logo */}

            <div className="relative h-16 w-16 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm">
              {storeInfo?.logo ? (
                <Image
                  src={storeInfo.logo}
                  alt={storeInfo?.name || "Store logo"}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <StoreIcon
                    size={25}
                    className="text-orange-400"
                  />
                </div>
              )}
            </div>

            {/* Store name */}

            <p className="mt-3 max-w-full truncate px-2 text-sm font-black text-slate-900">
              {storeInfo?.name || "Your Store"}
            </p>

            {/* Seller panel */}

            <div className="mt-1 flex items-center gap-1.5">
              <span className="text-xs font-medium text-slate-400">
                Seller Panel
              </span>

              <span
                className={`h-1.5 w-1.5 rounded-full ${storeInfo?.isActive
                    ? "bg-emerald-500"
                    : "bg-red-400"
                  }`}
              />
            </div>

          </div>
        </div>

        {/* ================= NAVIGATION ================= */}

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">

          {sidebarLinks.map((link) => {
            const active = pathname === link.href;
            const Icon = link.icon;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200 ${active
                    ? "bg-orange-50 text-orange-600"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  }`}
              >

                {/* Active indicator */}

                {active && (
                  <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-orange-500" />
                )}

                {/* Icon */}

                <Icon
                  size={18}
                  strokeWidth={active ? 2.4 : 2}
                  className={`shrink-0 ${active
                      ? "text-orange-500"
                      : "text-slate-400 group-hover:text-slate-600"
                    }`}
                />

                {/* Label */}

                <span className="min-w-0 flex-1 truncate">
                  {link.name}
                </span>

                {/* Pending order badge */}

                {link.badge > 0 && (
                  <span className="flex min-w-[22px] items-center justify-center rounded-full bg-orange-500 px-1.5 py-0.5 text-[10px] font-black text-white">
                    {link.badge > 99 ? "99+" : link.badge}
                  </span>
                )}
              </Link>
            );
          })}

        </nav>

        {/* ================= BOTTOM STORE STATUS ================= */}

        <div className="border-t border-slate-100 p-3">

          <div className="rounded-xl bg-slate-50 px-3 py-3">

            <div className="flex items-center gap-2">

              <span
                className={`h-2 w-2 rounded-full ${storeInfo?.isActive
                    ? "bg-emerald-500"
                    : "bg-red-400"
                  }`}
              />

              <span className="text-xs font-bold text-slate-600">
                {storeInfo?.isActive
                  ? "Store is open"
                  : "Store is closed"}
              </span>
            </div>

            <p className="mt-1 text-[10px] leading-4 text-slate-400">
              Manage your store information from Store Profile.
            </p>

          </div>
        </div>
      </aside>

      {/* =====================================================
          MOBILE BOTTOM NAVIGATION
      ===================================================== */}

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:hidden">

        <div className="scrollbar-hide flex overflow-x-auto px-2 py-2">

          {sidebarLinks.map((link) => {
            const active = pathname === link.href;
            const Icon = link.icon;

            return (
              <Link
                key={link.href}
                href={link.href}
                className="relative flex min-w-[76px] flex-1 flex-col items-center justify-center gap-1 px-1"
              >

                {/* Icon */}

                <div
                  className={`relative flex h-9 w-9 items-center justify-center rounded-xl transition-all ${active
                      ? "bg-orange-500 text-white shadow-sm shadow-orange-200"
                      : "text-slate-400"
                    }`}
                >
                  <Icon
                    size={18}
                    strokeWidth={active ? 2.5 : 2}
                  />

                  {/* Badge */}

                  {link.badge > 0 && (
                    <span className="absolute -right-1.5 -top-1.5 flex min-h-[17px] min-w-[17px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-black text-white ring-2 ring-white">
                      {link.badge > 9 ? "9+" : link.badge}
                    </span>
                  )}
                </div>

                {/* Label */}

                <span
                  className={`max-w-[72px] truncate text-[9px] font-bold ${active
                      ? "text-orange-600"
                      : "text-slate-400"
                    }`}
                >
                  {link.name}
                </span>

                {/* Active dot */}

                {active && (
                  <span className="absolute -bottom-1 h-1 w-1 rounded-full bg-orange-500" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default StoreSidebar;