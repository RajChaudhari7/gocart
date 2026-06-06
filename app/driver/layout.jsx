import DriverNavbar from "@/components/driver/DriverNavbar"
import DriverSidebar from "@/components/driver/DriverSidebar"

export default function DriverLayout({ children }) {
    return (
        <div className="min-h-screen bg-slate-50">

            <DriverNavbar />

            <div className="flex">
                <DriverSidebar />

                <main className="flex-1 p-6">
                    {children}
                </main>
            </div>

        </div>
    )
}