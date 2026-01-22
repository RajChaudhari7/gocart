import { Outfit } from "next/font/google"
import { Toaster } from "react-hot-toast"
import StoreProvider from "@/app/StoreProvider"
import { ClerkProvider } from "@clerk/nextjs"
import Navbar from "@/components/Navbar"
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
        <body className={`${outfit.className} antialiased bg-black text-white`}>
          <StoreProvider>
            <main className="pt-20 pb-20">
              {children}
            </main>
            <Toaster />
          </StoreProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
