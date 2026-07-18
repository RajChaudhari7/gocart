import { Outfit } from "next/font/google"
// import { Toaster } from "react-hot-toast"
import { Toaster } from "sonner"
import { ClerkProvider } from "@clerk/nextjs"
import StoreProvider from "@/app/StoreProvider"
import SplashWrapper from "@/components/SplashWrapper"
import { GoogleAnalytics } from "@next/third-parties/google"
import "./globals.css"
import AIChatButton from "@/components/AIChat/AIChatButton"
import CompareBar from "@/components/CompareBar"
import WishlistLoader from "@/components/WishlistLoader"
import WishlistInitializer from "@/components/wishlist/WishlistInitializer"

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
})

export const metadata = {
  metadataBase: new URL("https://gocart-delta.vercel.app"),

  verification: {
    google: "google970ad242fb17dc77.html",
  },

  title: {
    default: "Nandurbar Bazar | Online Grocery & Local Shopping",
    template: "%s | Nandurbar Bazar",
  },

  description:
    "Order groceries, fruits, vegetables, dairy products and daily essentials from trusted local shops in Nandurbar. Fast delivery with Cash on Delivery available.",

  keywords: [
    "Nandurbar Bazar",
    "Nandurbar Grocery",
    "Online Grocery",
    "Local Shops",
    "Nandurbar Online Shopping",
    "Vegetables",
    "Fruits",
    "Milk",
    "Daily Essentials",
    "COD Grocery",
    "Hyperlocal Delivery",
    "Local Market",
    "Nandurbar",
  ],

  authors: [
    {
      name: "Raj Chaudhari",
    },
  ],

  creator: "Raj Chaudhari",

  publisher: "Nandurbar Bazar",

  applicationName: "Nandurbar Bazar",

  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  openGraph: {
    title: "Nandurbar Bazar",
    description:
      "Buy groceries and daily essentials from trusted local shops in Nandurbar with quick delivery.",

    url: "https://gocart-delta.vercel.app",

    siteName: "Nandurbar Bazar",

    locale: "en_IN",

    type: "website",

    images: [
      {
        url: "/seo-banner.png",
        width: 1200,
        height: 630,
        alt: "Nandurbar Bazar",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Nandurbar Bazar",
    description:
      "Order groceries online from local stores in Nandurbar.",

    images: ["/seo-banner.png"],
  },

  icons: {
    icon: "/icon-192.png",
    shortcut: "/icon-192.png",
    apple: "/icon-192.png",
  },

  manifest: "/manifest.json",

  themeColor: "#06b6d4",

  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Nandurbar Bazar",
  },
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${outfit.className} antialiased bg-slate-50 text-slate-900`}>
          <StoreProvider>
            <WishlistLoader />
            <WishlistInitializer />
            <SplashWrapper>
              {children}
            </SplashWrapper>
            <Toaster
              richColors
              position="top-right"
              expand
            />
            <AIChatButton />
            <CompareBar />
          </StoreProvider>
          <GoogleAnalytics
            gaId={process.env.NEXT_PUBLIC_GA_ID}
          />
        </body>
      </html>
    </ClerkProvider>
  )
}
