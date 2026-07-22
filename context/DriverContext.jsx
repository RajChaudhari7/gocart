"use client";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";
import axios from "axios";
import { toast } from "sonner";

const DriverContext = createContext(null);

export function DriverProvider({ children }) {
    const [driver, setDriver] = useState(null);
    const [isOnline, setIsOnline] = useState(false);
    const [activeOrder, setActiveOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [statusUpdating, setStatusUpdating] = useState(false);

    const refreshDriver = useCallback(async () => {
        const storedDriver = localStorage.getItem("driver");

        if (!storedDriver) {
            setDriver(null);
            setIsOnline(false);
            setActiveOrder(null);
            setLoading(false);
            return;
        }

        try {
            const parsedDriver = JSON.parse(storedDriver);

            const { data } = await axios.get(
                "/api/driver/profile",
                {
                    params: {
                        driverId: parsedDriver.id,
                    },
                }
            );

            const latestDriver = data.driver;

            setDriver(latestDriver);
            setIsOnline(Boolean(latestDriver?.isOnline));
            setActiveOrder(
                data.activeOrder ||
                latestDriver?.activeOrder ||
                null
            );

            localStorage.setItem(
                "driver",
                JSON.stringify({
                    ...parsedDriver,
                    ...latestDriver,
                })
            );
        } catch (error) {
            console.error("Unable to load driver:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshDriver();
    }, [refreshDriver]);

    const toggleStatus = useCallback(async () => {
        if (!driver?.id || statusUpdating) return;

        if (isOnline && activeOrder) {
            toast.error(
                "Complete your active delivery before going offline."
            );
            return;
        }

        try {
            setStatusUpdating(true);

            const { data } = await axios.post(
                "/api/driver/toggle-status",
                {
                    driverId: driver.id,
                }
            );

            setIsOnline(Boolean(data.isOnline));

            const updatedDriver = {
                ...driver,
                isOnline: Boolean(data.isOnline),
            };

            setDriver(updatedDriver);

            localStorage.setItem(
                "driver",
                JSON.stringify(updatedDriver)
            );

            toast.success(
                data.isOnline
                    ? "You are now online"
                    : "You are now offline"
            );
        } catch (error) {
            toast.error(
                error?.response?.data?.error ||
                    "Failed to update status"
            );

            await refreshDriver();
        } finally {
            setStatusUpdating(false);
        }
    }, [
        driver,
        isOnline,
        activeOrder,
        statusUpdating,
        refreshDriver,
    ]);

    return (
        <DriverContext.Provider
            value={{
                driver,
                setDriver,
                isOnline,
                setIsOnline,
                activeOrder,
                setActiveOrder,
                loading,
                statusUpdating,
                toggleStatus,
                refreshDriver,
            }}
        >
            {children}
        </DriverContext.Provider>
    );
}

export function useDriver() {
    const context = useContext(DriverContext);

    if (!context) {
        throw new Error(
            "useDriver must be used inside DriverProvider"
        );
    }

    return context;
}