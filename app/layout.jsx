import { Outfit } from "next/font/google"
import { Toaster } from "react-hot-toast"
import { ClerkProvider } from "@clerk/nextjs"
import StoreProvider from "@/app/StoreProvider"
import "./globals.css"

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
})



export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${outfit.className} antialiased bg-slate-50 text-slate-900`}>
          <StoreProvider>
            {children}
            <Toaster />
          </StoreProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
