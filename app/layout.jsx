import { Outfit } from "next/font/google"
import { Toaster } from "react-hot-toast"
import { ClerkProvider } from "@clerk/nextjs"
import StoreProvider from "@/app/StoreProvider"
import SplashWrapper from "@/components/SplashWrapper"
import "./globals.css"

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
})

export const metadata = {
  title: "Nandurbar Bazar - Shop smarter",
  description: "Nandurbar Bazar - Shop smarter",
  manifest: "/manifest.json",

  themeColor: "#06b6d4",

  icons: {
    icon: "/icon-192.png",
    apple: "/icon-192.png",
  },

  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Nandurbar Bazar",
  },
}

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${outfit.className} antialiased bg-slate-50 text-slate-900`}>
          <StoreProvider>
            <SplashWrapper>
              {children}
            </SplashWrapper>
            <Toaster />
          </StoreProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
