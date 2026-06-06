import DriverSidebar from "@/components/driver/DriverSidebar"

export default function DriverLayout({ children }) {
    return (
        <div className="flex min-h-screen">
            <DriverSidebar />

            <main className="flex-1 p-6 bg-slate-50">
                {children}
            </main>
        </div>
    )
}