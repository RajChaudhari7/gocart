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
  idle: { scale: 1 },
  active: {
    scale: [1, 1.2, 1],
    transition: { duration: 0.4 },
  },
};

const drawerVariants = {
  hidden: { x: "100%" },
  visible: {
    x: 0,
    transition: { type: "spring", stiffness: 260, damping: 25 },
  },
  exit: { x: "100%", transition: { duration: 0.2 } },
};

const Navbar = () => {
  const { user } = useUser();
  const { openSignIn } = useClerk();
  const pathname = usePathname();
  const router = useRouter();

  const { customerLocation, locationLoading, serviceable, serviceRadius } =
    useCustomerLocation();

  const cartCount = useSelector(
    (state) => state.cart?.total || state.cart?.items?.length || 0,
  );

  const wishlistCount = useSelector(
    (state) => state.wishlist?.products?.length || 0,
  );

  const prevCartCount = useRef(cartCount);

  const [pulse, setPulse] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isTWA, setIsTWA] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  /* ================= PWA ================= */
  useEffect(() => {
    const checkInstalled = () => {
      const standalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        window.navigator.standalone === true;

      const twa = document.referrer.includes("android-app://");

      const ua = navigator.userAgent.toLowerCase();

      setIsAndroid(/android/.test(ua));

      setIsIOS(
        /iphone|ipad|ipod/.test(ua) ||
          (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1),
      );

      setIsInstalled(standalone);
      setIsTWA(twa || standalone);
    };

    checkInstalled();

    /* USER APP SERVICE WORKER */
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .catch((err) => console.log("SW Error:", err));
    }

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const installedHandler = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", installedHandler);
    window.addEventListener("focus", checkInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installedHandler);
      window.removeEventListener("focus", checkInstalled);
    };
  }, []);

  const installApp = async () => {
    // Android
    if (isAndroid) {
      window.location.href = "/apk/nandurbar-bazar.apk";
      return;
    }

    // iPhone / iPad
    if (isIOS) {
      alert(
        `Install Nandurbar Bazar

1. Tap Share (⬆️)

2. Tap "Add to Home Screen"

3. Tap Add`,
      );

      return;
    }

    // Windows / macOS

    if (deferredPrompt) {
      deferredPrompt.prompt();

      const result = await deferredPrompt.userChoice;

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

  const isActive = (href) => pathname === href;

  /* ================= CART PULSE ================= */
  useEffect(() => {
    if (cartCount !== prevCartCount.current) {
      setPulse(true);
      prevCartCount.current = cartCount;

      const timer = setTimeout(() => setPulse(false), 400);
      return () => clearTimeout(timer);
    }
  }, [cartCount]);

  const getButtonText = () => {
    if (isAndroid) return "Download Android App";

    if (isIOS) return "Install on iPhone";

    return "Install Desktop App";
  };

  const getLocationTitle = () => {
    if (locationLoading) {
      return "Detecting location";
    }

    if (!customerLocation) {
      return "Select location";
    }

    return customerLocation.label || "Delivery Location";
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

    if (customerLocation.source === "CURRENT") {
      return "Using your current location";
    }

    return serviceable
      ? `Delivery available within ${serviceRadius} km`
      : "Currently unavailable here";
  };

  const openLocationSelector = () => {
    router.push("/location");
  };

  const desktopLinks = [
    { name: "Home", href: "/" },
    { name: "Product", href: "/product" },
    { name: "Shop", href: "/shop" },
    // { name: 'About', href: '/about' },
    { name: "Contact", href: "/contact" },
    { name: "Orders", href: "/orders" },
  ];

  const mobileLinks = [
    { id: "home", href: "/", icon: <HomeIcon size={18} />, label: "Home" },
    {
      id: "product",
      href: "/product",
      icon: <Search size={18} />,
      label: "Product",
    },
    { id: "shop", href: "/shop", icon: <Search size={18} />, label: "Shop" },
    {
      id: "orders",
      href: "/orders",
      icon: <PackageIcon size={18} />,
      label: "Orders",
    },
    {
      id: "cart",
      href: "/cart",
      icon: <ShoppingCart size={18} />,
      label: "Cart",
      count: cartCount,
    },
    {
      id: "wishlist",
      href: "/wishlist",
      icon: <Heart size={18} />,
      label: "Wishlist",
      count: wishlistCount,
    },
  ];

  return (
    <>
      {/* MOBILE TOP NAV */}
      <nav className="sm:hidden fixed top-0 inset-x-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-2xl">
        {/* Main row */}
        <div className="flex items-center justify-between px-3 pt-2.5">
          <Link href="/" className="flex items-center">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <Image
                src="/app.png"
                alt="Nandurbar Bazar Logo"
                width={52}
                height={52}
                className="object-contain"
                priority
              />
            </motion.div>
          </Link>

          <div className="flex items-center gap-2">
            {!user ? (
              <button
                onClick={openSignIn}
                className="rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 px-3.5 py-2 text-xs font-bold text-black"
              >
                Login
              </button>
            ) : (
              <UserButton
                appearance={{
                  elements: {
                    userButtonAvatarBox: "w-9 h-9 border-2 border-cyan-400/30",
                  },
                }}
              />
            )}
          </div>
        </div>

        {/* Delivery Location */}
        <button
          type="button"
          onClick={openLocationSelector}
          className="
      mx-3
      mb-3
      mt-1
      flex
      w-[calc(100%-1.5rem)]
      items-center
      gap-3
      rounded-2xl
      border
      border-white/10
      bg-white/[0.055]
      px-3.5
      py-2.5
      text-left
      transition
      active:scale-[0.99]
    "
        >
          <div
            className={`
        flex h-10 w-10 shrink-0 items-center justify-center rounded-xl
        ${
          serviceable
            ? "bg-emerald-500/10 text-emerald-400"
            : "bg-amber-500/10 text-amber-400"
        }
      `}
          >
            {locationLoading ? (
              <LocateFixed size={18} className="animate-pulse" />
            ) : (
              <MapPin size={18} />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1">
              <p className="truncate text-xs font-black text-white">
                {getLocationTitle()}
              </p>

              <ChevronDown size={14} className="shrink-0 text-white/40" />
            </div>

            <p
              className={`mt-0.5 truncate text-[10px] ${
                !locationLoading && !serviceable
                  ? "text-amber-400"
                  : "text-white/40"
              }`}
            >
              {getLocationSubtitle()}
            </p>
          </div>
        </button>
      </nav>

      {/* DESKTOP NAV */}

      <nav className="hidden sm:block fixed top-0 inset-x-0 z-50 bg-black/60 backdrop-blur-2xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <Link href="/" className="relative flex items-center">
              <motion.div
                initial={{
                  opacity: 0,
                  scale: 0.5,
                  rotate: -180,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  rotate: 0,
                }}
                transition={{
                  duration: 0.8,
                  type: "spring",
                  stiffness: 100,
                }}
                className="relative h-14 w-14"
              >
                <Image
                  src="/app.png"
                  alt="Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </motion.div>

              <Protect plan="prime">
                <span className="absolute -right-4 -top-1 rounded-full bg-cyan-400 px-2 py-0.5 text-[10px] font-bold text-black">
                  prime
                </span>
              </Protect>
            </Link>

            {/* DELIVERY LOCATION */}
            <button
              type="button"
              onClick={openLocationSelector}
              className="
      group
      flex
      max-w-[260px]
      items-center
      gap-2.5
      rounded-2xl
      border
      border-white/10
      bg-white/[0.045]
      px-3.5
      py-2.5
      text-left
      transition
      hover:border-emerald-400/30
      hover:bg-white/[0.07]
    "
            >
              <div
                className={`
        flex h-9 w-9 shrink-0 items-center justify-center rounded-xl
        ${
          serviceable
            ? "bg-emerald-500/10 text-emerald-400"
            : "bg-amber-500/10 text-amber-400"
        }
      `}
              >
                {locationLoading ? (
                  <LocateFixed size={17} className="animate-pulse" />
                ) : (
                  <MapPin size={17} />
                )}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <p className="truncate text-xs font-bold text-white">
                    {getLocationTitle()}
                  </p>

                  <ChevronDown
                    size={13}
                    className="shrink-0 text-white/30 transition group-hover:text-emerald-400"
                  />
                </div>

                <p
                  className={`mt-0.5 max-w-[180px] truncate text-[10px] ${
                    !locationLoading && !serviceable
                      ? "text-amber-400"
                      : "text-white/35"
                  }`}
                >
                  {getLocationSubtitle()}
                </p>
              </div>
            </button>
          </div>

          <div className="flex items-center gap-6 text-white/70">
            {desktopLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`${isActive(link.href) ? "text-cyan-400" : "hover:text-cyan-400"}`}
              >
                {link.name}
              </Link>
            ))}

            {/* Wishlist */}

            <Link href="/wishlist" className="relative">
              <motion.div
                whileHover={{ scale: 1.08 }}
                className="flex items-center gap-1"
              >
                <Heart
                  size={18}
                  className="text-pink-400"
                  fill={wishlistCount > 0 ? "currentColor" : "none"}
                />
                Wishlist
              </motion.div>

              {wishlistCount > 0 && (
                <span className="absolute -top-3 -right-4 text-xs px-2 py-0.5 rounded-full bg-pink-500 text-white font-bold">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}

            <Link href="/cart" className="relative">
              <motion.div
                variants={cartPulse}
                animate={pulse ? "active" : "idle"}
                className="flex items-center gap-1"
              >
                <ShoppingCart size={18} />
                Cart
              </motion.div>

              {cartCount > 0 && (
                <span className="absolute -top-3 -right-4 text-xs px-2 py-0.5 rounded-full bg-cyan-400 text-black font-bold">
                  {cartCount}
                </span>
              )}
            </Link>

            {!isTWA && <button onClick={installApp}>{getButtonText()}</button>}

            {!user ? (
              <button
                onClick={openSignIn}
                className="px-5 py-2 rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 text-black"
              >
                Login
              </button>
            ) : (
              <div className="ml-2">
                <UserButton
                  appearance={{
                    elements: {
                      userButtonAvatarBox:
                        "w-10 h-10 sm:w-20 sm:h-20 border-2 border-cyan-400/30",
                    },
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* MOBILE BOTTOM */}
      <div className="sm:hidden fixed bottom-0 inset-x-0 z-50 bg-black/70 backdrop-blur-2xl border-t border-white/10">
        <div className="flex justify-around py-2 text-xs">
          {mobileLinks.map((link) => (
            <Link
              key={link.id}
              href={link.href}
              className={`flex flex-col items-center gap-1 ${
                isActive(link.href) ? "text-cyan-400" : "text-white/70"
              }`}
            >
              <div className="relative">
                {link.icon}

                {link.count > 0 && (
                  <span className="absolute -top-2 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-pink-500 text-white text-[10px] flex items-center justify-center">
                    {link.count}
                  </span>
                )}
              </div>
              {link.label}
            </Link>
          ))}

          <button
            onClick={() => setMenuOpen(true)}
            className="flex flex-col items-center gap-1 text-white/70"
          >
            <Menu size={18} />
            Menu
          </button>
        </div>
      </div>

      {/* MOBILE DRAWER */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 bg-black/60 z-[60]"
            />

            <motion.div
              variants={drawerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed top-0 right-0 h-full w-72 bg-black z-[70] p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg text-white">Menu</h2>
                <button onClick={() => setMenuOpen(false)}>
                  <X size={20} />
                </button>
              </div>

              <div className="flex flex-col gap-4 text-white/80">
                {desktopLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                ))}

                <Link href="/wishlist" onClick={() => setMenuOpen(false)}>
                  Wishlist ({wishlistCount})
                </Link>

                <Link href="/cart" onClick={() => setMenuOpen(false)}>
                  Cart ({cartCount})
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
