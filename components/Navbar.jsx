"use client";

import {
  PackageIcon,
  ShoppingCart,
  Menu,
  X,
  HomeIcon,
  Search,
  Heart,
  MapPin,
  ChevronDown,
  LocateFixed,
  Store,
  Download,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useUser, useClerk, UserButton, Protect } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useCustomerLocation } from "@/context/CustomerLocationContext";

/* ================= ANIMATION VARIANTS ================= */

const cartPulse = {
  idle: {
    scale: 1,
  },
  active: {
    scale: [1, 1.18, 1],
    transition: {
      duration: 0.4,
    },
  },
};

const drawerVariants = {
  hidden: {
    x: "100%",
  },

  visible: {
    x: 0,
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 25,
    },
  },

  exit: {
    x: "100%",
    transition: {
      duration: 0.2,
    },
  },
};

const Navbar = () => {
  const { user } = useUser();
  const { openSignIn } = useClerk();

  const pathname = usePathname();
  const router = useRouter();

  const {
    customerLocation,
    locationLoading,
    serviceable,
    serviceRadius,
  } = useCustomerLocation();

  /* ================= REDUX ================= */

  const cartCount = useSelector(
    (state) =>
      state.cart?.total ||
      state.cart?.items?.length ||
      0,
  );

  const wishlistCount = useSelector(
    (state) =>
      state.wishlist?.products?.length || 0,
  );

  /* ================= STATE ================= */

  const prevCartCount = useRef(cartCount);

  const [pulse, setPulse] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const [deferredPrompt, setDeferredPrompt] =
    useState(null);

  const [isInstalled, setIsInstalled] =
    useState(false);

  const [isTWA, setIsTWA] = useState(false);

  const [isAndroid, setIsAndroid] =
    useState(false);

  const [isIOS, setIsIOS] = useState(false);

  /* ================= PWA ================= */

  useEffect(() => {
    const checkInstalled = () => {
      const standalone =
        window.matchMedia(
          "(display-mode: standalone)",
        ).matches ||
        window.navigator.standalone === true;

      const twa =
        document.referrer.includes(
          "android-app://",
        );

      const ua =
        navigator.userAgent.toLowerCase();

      setIsAndroid(/android/.test(ua));

      setIsIOS(
        /iphone|ipad|ipod/.test(ua) ||
        (navigator.platform === "MacIntel" &&
          navigator.maxTouchPoints > 1),
      );

      setIsInstalled(standalone);
      setIsTWA(twa || standalone);
    };

    checkInstalled();

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js", {
          scope: "/",
        })
        .catch((err) =>
          console.log("SW Error:", err),
        );
    }

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const installedHandler = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener(
      "beforeinstallprompt",
      handler,
    );

    window.addEventListener(
      "appinstalled",
      installedHandler,
    );

    window.addEventListener(
      "focus",
      checkInstalled,
    );

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handler,
      );

      window.removeEventListener(
        "appinstalled",
        installedHandler,
      );

      window.removeEventListener(
        "focus",
        checkInstalled,
      );
    };
  }, []);

  /* ================= INSTALL APP ================= */

  const installApp = async () => {
    if (isAndroid) {
      window.location.href =
        "/apk/nandurbar-bazar.apk";
      return;
    }

    if (isIOS) {
      alert(
        `Install Nandurbar Bazar

1. Tap Share (⬆️)

2. Tap "Add to Home Screen"

3. Tap Add`,
      );

      return;
    }

    if (deferredPrompt) {
      deferredPrompt.prompt();

      const result =
        await deferredPrompt.userChoice;

      if (result.outcome === "accepted") {
        setIsInstalled(true);
      }

      setDeferredPrompt(null);

      return;
    }

    alert(
      "Open this website in Google Chrome or Microsoft Edge to install the desktop app.",
    );
  };

  /* ================= ACTIVE LINK ================= */

  const isActive = (href) =>
    pathname === href;

  /* ================= CART ANIMATION ================= */

  useEffect(() => {
    if (
      cartCount !== prevCartCount.current
    ) {
      setPulse(true);

      prevCartCount.current = cartCount;

      const timer = setTimeout(
        () => setPulse(false),
        400,
      );

      return () => clearTimeout(timer);
    }
  }, [cartCount]);

  /* ================= INSTALL TEXT ================= */

  const getButtonText = () => {
    if (isAndroid)
      return "Download Android App";

    if (isIOS)
      return "Install on iPhone";

    return "Install App";
  };

  /* ================= LOCATION ================= */

  const getLocationTitle = () => {
    if (locationLoading) {
      return "Detecting location";
    }

    if (!customerLocation) {
      return "Select location";
    }

    return (
      customerLocation.label ||
      "Delivery Location"
    );
  };

  const getLocationSubtitle = () => {
    if (locationLoading) {
      return "Please wait...";
    }

    if (!customerLocation) {
      return "Choose where to deliver";
    }

    if (customerLocation.formattedAddress) {
      return customerLocation.formattedAddress;
    }

    if (
      customerLocation.source === "CURRENT"
    ) {
      return "Using your current location";
    }

    return serviceable
      ? `Delivery available within ${serviceRadius} km`
      : "Currently unavailable here";
  };

  const openLocationSelector = () => {
    router.push("/location");
  };

  /* ================= DESKTOP LINKS ================= */

  const desktopLinks = [
    {
      name: "Home",
      href: "/",
      icon: HomeIcon,
    },
    {
      name: "Products",
      href: "/product",
      icon: Search,
    },
    {
      name: "Shops",
      href: "/shop",
      icon: Store,
    },
    {
      name: "Contact",
      href: "/contact",
      icon: PackageIcon,
    },
    {
      name: "Orders",
      href: "/orders",
      icon: PackageIcon,
    },
  ];

  /* ================= MOBILE LINKS ================= */

  const mobileLinks = [
    {
      id: "home",
      href: "/",
      icon: HomeIcon,
      label: "Home",
    },

    {
      id: "product",
      href: "/product",
      icon: Search,
      label: "Explore",
    },

    {
      id: "shop",
      href: "/shop",
      icon: Store,
      label: "Shops",
    },

    {
      id: "orders",
      href: "/orders",
      icon: PackageIcon,
      label: "Orders",
    },

    {
      id: "cart",
      href: "/cart",
      icon: ShoppingCart,
      label: "Cart",
      count: cartCount,
    },
  ];

  return (
    <>
      {/* =====================================================
          MOBILE TOP NAVBAR
      ===================================================== */}

      <nav className="fixed inset-x-0 top-0 z-50 border-b border-slate-200/80 bg-white/95 shadow-sm backdrop-blur-xl sm:hidden">
        <div className="mx-auto max-w-screen-sm">
          {/* ================= MAIN ROW ================= */}

          <div className="flex h-[62px] items-center justify-between px-3.5">
            {/* LOGO */}

            <Link
              href="/"
              className="flex items-center"
            >
              <motion.div
                initial={{
                  opacity: 0,
                  scale: 0.8,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                }}
                transition={{
                  duration: 0.45,
                }}
                className="relative h-11 w-11"
              >
                <Image
                  src="/app.png"
                  alt="Nandurbar Bazar"
                  fill
                  className="object-contain"
                  priority
                />
              </motion.div>

              <div className="ml-2">
                <p className="text-sm font-black tracking-tight text-slate-900">
                  Nandurbar
                  <span className="text-emerald-600">
                    Bazar
                  </span>
                </p>

                <p className="text-[8px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                  Local shopping
                </p>
              </div>
            </Link>

            {/* PROFILE / LOGIN */}

            <div className="flex items-center gap-2">
              {!user ? (
                <button
                  onClick={openSignIn}
                  className="
                    rounded-full
                    bg-emerald-500
                    px-4
                    py-2
                    text-xs
                    font-extrabold
                    text-white
                    shadow-sm
                    shadow-emerald-200
                    transition
                    active:scale-95
                  "
                >
                  Login
                </button>
              ) : (
                <UserButton
                  appearance={{
                    elements: {
                      userButtonAvatarBox:
                        "w-9 h-9 border-2 border-emerald-100",
                    },
                  }}
                />
              )}
            </div>
          </div>

          {/* ================= LOCATION ================= */}

          <div className="px-3 pb-3">
            <button
              type="button"
              onClick={
                openLocationSelector
              }
              className="
                flex
                w-full
                items-center
                gap-3
                rounded-2xl
                border
                border-slate-200
                bg-slate-50
                px-3
                py-2.5
                text-left
                shadow-sm
                transition
                active:scale-[0.99]
              "
            >
              {/* LOCATION ICON */}

              <div
                className={`
                  flex
                  h-9
                  w-9
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  ${serviceable
                    ? "bg-emerald-100 text-emerald-600"
                    : "bg-amber-100 text-amber-600"
                  }
                `}
              >
                {locationLoading ? (
                  <LocateFixed
                    size={17}
                    className="animate-pulse"
                  />
                ) : (
                  <MapPin size={17} />
                )}
              </div>

              {/* LOCATION TEXT */}

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1">
                  <p className="truncate text-[11px] font-extrabold text-slate-800">
                    {getLocationTitle()}
                  </p>

                  <ChevronDown
                    size={13}
                    className="shrink-0 text-slate-400"
                  />
                </div>

                <p
                  className={`
                    mt-0.5
                    truncate
                    text-[9px]
                    ${!locationLoading &&
                      !serviceable
                      ? "text-amber-600"
                      : "text-slate-400"
                    }
                  `}
                >
                  {getLocationSubtitle()}
                </p>
              </div>

              <span className="shrink-0 rounded-full bg-white px-2 py-1 text-[8px] font-bold text-emerald-600 shadow-sm ring-1 ring-slate-200">
                Change
              </span>
            </button>
          </div>
        </div>
      </nav>

      {/* MOBILE TOP SPACING */}

      <div className="h-[127px] sm:hidden" />

      {/* =====================================================
          DESKTOP NAVBAR
      ===================================================== */}

      <nav className="fixed inset-x-0 top-0 z-50 hidden border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur-xl sm:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          {/* ================= LEFT ================= */}

          <div className="flex items-center gap-5">
            {/* LOGO */}

            <Link
              href="/"
              className="relative flex items-center"
            >
              <motion.div
                initial={{
                  opacity: 0,
                  scale: 0.8,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                }}
                transition={{
                  duration: 0.5,
                }}
                className="relative h-12 w-12"
              >
                <Image
                  src="/app.png"
                  alt="Nandurbar Bazar"
                  fill
                  className="object-contain"
                  priority
                />
              </motion.div>

              <div className="ml-2">
                <p className="text-sm font-black tracking-tight text-slate-900">
                  Nandurbar
                  <span className="text-emerald-600">
                    Bazar
                  </span>
                </p>

                <p className="text-[8px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                  Local shopping
                </p>
              </div>

              <Protect plan="prime">
                <span className="absolute -right-7 -top-1 rounded-full bg-amber-400 px-2 py-0.5 text-[8px] font-black text-amber-950 shadow-sm">
                  PRIME
                </span>
              </Protect>
            </Link>

            {/* LOCATION */}

            <button
              type="button"
              onClick={
                openLocationSelector
              }
              className="
                group
                flex
                max-w-[280px]
                items-center
                gap-2.5
                rounded-2xl
                border
                border-slate-200
                bg-slate-50
                px-3
                py-2
                text-left
                transition
                hover:border-emerald-200
                hover:bg-emerald-50/50
              "
            >
              <div
                className={`
                  flex
                  h-9
                  w-9
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  ${serviceable
                    ? "bg-emerald-100 text-emerald-600"
                    : "bg-amber-100 text-amber-600"
                  }
                `}
              >
                {locationLoading ? (
                  <LocateFixed
                    size={17}
                    className="animate-pulse"
                  />
                ) : (
                  <MapPin size={17} />
                )}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <p className="truncate text-xs font-bold text-slate-800">
                    {getLocationTitle()}
                  </p>

                  <ChevronDown
                    size={13}
                    className="text-slate-400 transition group-hover:text-emerald-600"
                  />
                </div>

                <p
                  className={`
                    mt-0.5
                    max-w-[190px]
                    truncate
                    text-[9px]
                    ${!locationLoading &&
                      !serviceable
                      ? "text-amber-600"
                      : "text-slate-400"
                    }
                  `}
                >
                  {getLocationSubtitle()}
                </p>
              </div>
            </button>
          </div>

          {/* ================= RIGHT ================= */}

          <div className="flex items-center gap-5">
            {/* NAV LINKS */}

            <div className="flex items-center gap-1">
              {desktopLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(
                  link.href,
                );

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`
                      flex
                      items-center
                      gap-1.5
                      rounded-full
                      px-3
                      py-2
                      text-xs
                      font-semibold
                      transition

                      ${active
                        ? "bg-emerald-50 text-emerald-700"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                      }
                    `}
                  >
                    <Icon size={15} />
                    {link.name}
                  </Link>
                );
              })}
            </div>

            {/* WISHLIST */}

            <Link
              href="/wishlist"
              className="relative"
            >
              <motion.div
                whileHover={{
                  scale: 1.05,
                }}
                className={`
                  flex
                  items-center
                  gap-1.5
                  rounded-full
                  px-3
                  py-2
                  text-xs
                  font-semibold
                  transition
                  ${isActive("/wishlist")
                    ? "bg-pink-50 text-pink-600"
                    : "text-slate-500 hover:bg-pink-50 hover:text-pink-600"
                  }
                `}
              >
                <Heart
                  size={16}
                  fill={
                    wishlistCount > 0
                      ? "currentColor"
                      : "none"
                  }
                />
                Wishlist
              </motion.div>

              {wishlistCount > 0 && (
                <span className="absolute -right-1 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-pink-500 px-1 text-[8px] font-bold text-white">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* CART */}

            <Link
              href="/cart"
              className="relative"
            >
              <motion.div
                variants={cartPulse}
                animate={
                  pulse ? "active" : "idle"
                }
                className={`
                  flex
                  items-center
                  gap-1.5
                  rounded-full
                  px-3
                  py-2
                  text-xs
                  font-semibold
                  transition
                  ${isActive("/cart")
                    ? "bg-emerald-50 text-emerald-700"
                    : "text-slate-500 hover:bg-emerald-50 hover:text-emerald-600"
                  }
                `}
              >
                <ShoppingCart size={16} />
                Cart
              </motion.div>

              {cartCount > 0 && (
                <span className="absolute -right-1 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-500 px-1 text-[8px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* INSTALL */}

            {!isTWA && (
              <button
                onClick={installApp}
                className="
                  flex
                  items-center
                  gap-1.5
                  rounded-full
                  border
                  border-slate-200
                  bg-white
                  px-3
                  py-2
                  text-xs
                  font-semibold
                  text-slate-600
                  transition
                  hover:border-emerald-200
                  hover:bg-emerald-50
                  hover:text-emerald-700
                "
              >
                <Download size={14} />
                {getButtonText()}
              </button>
            )}

            {/* LOGIN / USER */}

            {!user ? (
              <button
                onClick={openSignIn}
                className="
                  rounded-full
                  bg-emerald-500
                  px-5
                  py-2.5
                  text-xs
                  font-extrabold
                  text-white
                  shadow-sm
                  shadow-emerald-200
                  transition
                  hover:bg-emerald-600
                  hover:shadow-md
                  active:scale-95
                "
              >
                Login
              </button>
            ) : (
              <div className="ml-1">
                <UserButton
                  appearance={{
                    elements: {
                      userButtonAvatarBox:
                        "w-10 h-10 border-2 border-emerald-100",
                    },
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* =====================================================
          MOBILE BOTTOM NAVIGATION
      ===================================================== */}

      <div
        className="
          fixed
          inset-x-0
          bottom-0
          z-50
          border-t
          border-slate-200
          bg-white/95
          pb-[env(safe-area-inset-bottom)]
          shadow-[0_-4px_20px_rgba(15,23,42,0.08)]
          backdrop-blur-xl
          sm:hidden
        "
      >
        <div className="grid grid-cols-6 px-1 py-1.5">
          {mobileLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(
              link.href,
            );

            return (
              <Link
                key={link.id}
                href={link.href}
                className={`
                  flex
                  flex-col
                  items-center
                  justify-center
                  gap-0.5
                  rounded-xl
                  py-1.5
                  text-[9px]
                  font-semibold
                  transition

                  ${active
                    ? "text-emerald-600"
                    : "text-slate-400"
                  }
                `}
              >
                <div
                  className={`
                    relative
                    flex
                    h-7
                    w-10
                    items-center
                    justify-center
                    rounded-full
                    transition

                    ${active
                      ? "bg-emerald-50"
                      : ""
                    }
                  `}
                >
                  <Icon
                    size={18}
                    strokeWidth={
                      active ? 2.5 : 2
                    }
                  />

                  {link.count > 0 && (
                    <span className="absolute -right-0.5 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-pink-500 px-1 text-[8px] font-bold text-white">
                      {link.count}
                    </span>
                  )}
                </div>

                {link.label}
              </Link>
            );
          })}

          {/* MENU */}

          <button
            onClick={() => setMenuOpen(true)}
            className="flex flex-col items-center justify-center gap-0.5 rounded-xl py-1.5 text-[9px] font-semibold text-slate-400"
          >
            <div className="flex h-7 w-10 items-center justify-center">
              <Menu size={18} />
            </div>

            Menu
          </button>
        </div>
      </div>

      {/* =====================================================
          MOBILE DRAWER
      ===================================================== */}

      <AnimatePresence>
        {menuOpen && (
          <>
            {/* BACKDROP */}

            <motion.div
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
              }}
              onClick={() =>
                setMenuOpen(false)
              }
              className="fixed inset-0 z-[60] bg-slate-900/30 backdrop-blur-sm"
            />

            {/* DRAWER */}

            <motion.div
              variants={drawerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="
                fixed
                right-0
                top-0
                z-[70]
                flex
                h-full
                w-[min(86vw,360px)]
                flex-col
                border-l
                border-slate-200
                bg-white
                p-5
                shadow-2xl
              "
            >
              {/* HEADER */}

              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="relative h-9 w-9">
                    <Image
                      src="/app.png"
                      alt="Nandurbar Bazar"
                      fill
                      className="object-contain"
                    />
                  </div>

                  <div>
                    <h2 className="text-sm font-black text-slate-900">
                      Nandurbar
                      <span className="text-emerald-600">
                        Bazar
                      </span>
                    </h2>

                    <p className="text-[8px] uppercase tracking-wider text-slate-400">
                      Menu
                    </p>
                  </div>
                </div>

                <button
                  onClick={() =>
                    setMenuOpen(false)
                  }
                  className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-full
                    bg-slate-100
                    text-slate-500
                    transition
                    hover:bg-slate-200
                  "
                >
                  <X size={18} />
                </button>
              </div>

              {/* LOCATION CARD */}

              <button
                onClick={() => {
                  setMenuOpen(false);
                  openLocationSelector();
                }}
                className="
                  mb-6
                  flex
                  items-center
                  gap-3
                  rounded-2xl
                  border
                  border-emerald-100
                  bg-emerald-50/70
                  p-3
                  text-left
                "
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm">
                  <MapPin size={18} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold text-emerald-700">
                    Deliver to
                  </p>

                  <p className="truncate text-xs font-bold text-slate-800">
                    {getLocationTitle()}
                  </p>
                </div>

                <ChevronDown
                  size={16}
                  className="text-emerald-500"
                />
              </button>

              {/* MENU LINKS */}

              <div className="flex flex-col gap-1">
                {desktopLinks.map((link) => {
                  const Icon = link.icon;
                  const active =
                    isActive(link.href);

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() =>
                        setMenuOpen(false)
                      }
                      className={`
                        flex
                        items-center
                        gap-3
                        rounded-2xl
                        px-4
                        py-3
                        text-sm
                        font-semibold
                        transition

                        ${active
                          ? "bg-emerald-50 text-emerald-700"
                          : "text-slate-600 hover:bg-slate-50"
                        }
                      `}
                    >
                      <Icon size={18} />
                      {link.name}
                    </Link>
                  );
                })}

                {/* WISHLIST */}

                <Link
                  href="/wishlist"
                  onClick={() =>
                    setMenuOpen(false)
                  }
                  className="
                    flex
                    items-center
                    justify-between
                    rounded-2xl
                    px-4
                    py-3
                    text-sm
                    font-semibold
                    text-slate-600
                    transition
                    hover:bg-pink-50
                    hover:text-pink-600
                  "
                >
                  <span className="flex items-center gap-3">
                    <Heart size={18} />
                    Wishlist
                  </span>

                  {wishlistCount > 0 && (
                    <span className="rounded-full bg-pink-500 px-2 py-0.5 text-[9px] font-bold text-white">
                      {wishlistCount}
                    </span>
                  )}
                </Link>

                {/* CART */}

                <Link
                  href="/cart"
                  onClick={() =>
                    setMenuOpen(false)
                  }
                  className="
                    flex
                    items-center
                    justify-between
                    rounded-2xl
                    px-4
                    py-3
                    text-sm
                    font-semibold
                    text-slate-600
                    transition
                    hover:bg-emerald-50
                    hover:text-emerald-600
                  "
                >
                  <span className="flex items-center gap-3">
                    <ShoppingCart size={18} />
                    Cart
                  </span>

                  {cartCount > 0 && (
                    <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[9px] font-bold text-white">
                      {cartCount}
                    </span>
                  )}
                </Link>
              </div>

              {/* INSTALL */}

              {!isTWA && (
                <button
                  onClick={installApp}
                  className="
                    mt-auto
                    flex
                    items-center
                    justify-center
                    gap-2
                    rounded-2xl
                    bg-slate-900
                    px-4
                    py-3
                    text-xs
                    font-bold
                    text-white
                    transition
                    hover:bg-slate-800
                  "
                >
                  <Download size={15} />
                  {getButtonText()}
                </button>
              )}

              {/* FOOTER */}

              <p className="mt-4 text-center text-[9px] text-slate-400">
                Shop local. Discover more.
              </p>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;