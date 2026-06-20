import DriverLayout from "@/components/driver/DriverLayout"
import InstallButton from "@/components/InstallButton" // Import the component we created

export const metadata = {
    title: "Nandurbar Bazar Driver",
    manifest: "/driver-manifest.json",

    icons: {
        icon: "/driver-192.png",
        apple: "/driver-192.png"
    },

    appleWebApp: {
        capable: true,
        title: "NB Driver",
        statusBarStyle: "black-translucent"
    }
};

export default function Layout({ children }) {
    return (
        <DriverLayout>
            {/* Placing it here so it appears in the navbar of your DriverLayout */}
            <div className="fixed top-4 right-4 z-50">
                <InstallButton />
            </div>
            {children}
        </DriverLayout>
    )
}