import DriverLayout from "@/components/driver/DriverLayout"

export const metadata = {
    title: "Nandurbar Bazar Driver",
    manifest: "/driver-manifest.json",
}

export default function Layout({ children }) {
    return (
        <DriverLayout>
            {children}
        </DriverLayout>
    )
}