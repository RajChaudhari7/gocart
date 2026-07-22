
import DriverLayout from "@/components/driver/DriverLayout"
import SplashWrapper from "@/components/driver/SplashWrapper"
import { DriverProvider } from "@/context/DriverContext"

export const metadata = {
    title: "Nandurbar Bazar Driver",
    manifest: "/driver-manifest.json",
}

export default function Layout({ children }) {
    return (
        <DriverProvider>
            <SplashWrapper>
                <DriverLayout>
                    {children}
                </DriverLayout>
            </SplashWrapper>
        </DriverProvider>
    )
}