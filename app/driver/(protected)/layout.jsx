import DriverLayout from "@/components/driver/DriverLayout"

export const metadata = {
    title: "Driver Dashboard",
}


export default function Layout({ children }) {
    return (
        <DriverLayout>
            {children}
        </DriverLayout>
    )
}