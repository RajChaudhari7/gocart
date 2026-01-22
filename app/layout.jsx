import { Outfit } from "next/font/google"
import { Toaster } from "react-hot-toast"
import StoreProvider from "@/app/StoreProvider"
import { ClerkProvider } from "@clerk/nextjs"
import NextTopLoader from "nextjs-toploader"
import "./globals.css"

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
})

export const metadata = {
  title: "GlobalMart. - Shop smarter",
  description: "GlobalMart. - Shop smarter",
}

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${outfit.className} antialiased`}>

          {/* 🔥 TOP PAGE LOADER */}
          <NextTopLoader
            color="#22d3ee"
            height={3}
            showSpinner={false}
            easing="ease"
            speed={300}
          />

          <StoreProvider>
            <Toaster
              position="bottom-center"
              toastOptions={{
                style: {
                  background: "#0f172a",
                  color: "#fff",
                },
              }}
            />
            {children}
          </StoreProvider>

        </body>
      </html>
    </ClerkProvider>
  )
}
