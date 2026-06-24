import DriverLayout from "@/components/driver/DriverLayout"
import SplashWrapper from "@/components/driver/SplashWrapper"

export const metadata = {
    title: "Nandurbar Bazar Driver",
    manifest: "/driver-manifest.json",
}

export default function Layout({ children }) {
    return (
        <SplashWrapper>
            <DriverLayout>
                {children}
            </DriverLayout>
        </SplashWrapper>
    )
}