'use client'

import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link"
import Image from "next/image"
import {
    ArrowLeft,
    User,
    Phone,
    Mail,
    Bike,
    Calendar,
    Landmark,
    CreditCard,
    BadgeCheck,
    CircleX,
    FileText
} from "lucide-react"
import Loading from "@/components/Loading";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function DriverDetailsPage({ params }) {

    const [driver, setDriver] = useState(null);
    const [loading, setLoading] = useState(false);

    const [remark, setRemark] = useState("");

    const router = useRouter();

    const fetchDriver = async () => {
        try {
            const { data } = await axios.get(
                `/api/admin/driver-applications/${params.id}`
            );

            setDriver(data);
        } catch (error) {
            console.log(error);
        }
    };

    const approveDriver = async () => {
        if (loading) return;

        try {
            setLoading(true);

            await axios.patch(
                `/api/admin/driver-applications/${params.id}/approve`
            );

            toast.success("Driver Approved");

            router.replace("/admin/driverTable");

        } catch (error) {

            toast.error(
                error.response?.data?.error ||
                "Approval failed"
            );

        } finally {
            setLoading(false);
        }
    };

    const rejectDriver = async () => {

        if (!remark)
            return toast.error("Please enter rejection reason");

        try {

            await axios.patch(
                `/api/admin/driver-applications/${params.id}/reject`,
                {
                    remark,
                }
            );

            toast.success("Driver Rejected");

            router.push("/admin/driverTable");

        } catch (error) {

            toast.error(
                error.response?.data?.error ||
                "Rejection failed"
            );

        }

    };

    useEffect(() => {
        fetchDriver();
    }, []);

    if (!driver) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loading />
            </div>
        );
    }

    return (

        <div className="min-h-screen bg-slate-100 p-6">

            <div className="max-w-7xl mx-auto">

                {/* Header */}

                <div className="flex items-center justify-between mb-8">

                    <div>

                        <Link
                            href="/admin/driverTable"
                            className="flex items-center gap-2 text-gray-600 hover:text-black mb-3"
                        >

                            <ArrowLeft size={18} />

                            Back

                        </Link>

                        <h1 className="text-4xl font-black">
                            Driver Application
                        </h1>

                    </div>

                    <span
                        className={`px-5 py-2 rounded-full font-semibold
                                ${driver.status === "PENDING"
                                ? "bg-yellow-100 text-yellow-700"
                                : driver.status === "APPROVED"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                            }`}
                    >
                        {driver.status}
                    </span>

                </div>

                {/* Top Card */}

                <div className="bg-white rounded-3xl shadow-md p-8 flex flex-col md:flex-row items-center gap-8">

                    <Image
                        src={driver.profilePhoto}
                        alt=""
                        width={130}
                        height={130}
                        className="rounded-full border-4 border-cyan-500"
                    />

                    <div className="flex-1">

                        <h2 className="text-3xl font-bold">

                            {driver.name}

                        </h2>

                        <p className="text-gray-500 mt-1">

                            Delivery Partner Application

                        </p>

                        <div className="grid md:grid-cols-2 gap-5 mt-8">

                            <div className="flex items-center gap-3">

                                <Phone className="text-cyan-600" />

                                {driver.phone}

                            </div>

                            <div className="flex items-center gap-3">

                                <Mail className="text-cyan-600" />

                                {driver.email}

                            </div>

                            <div className="flex items-center gap-3">

                                <Bike className="text-cyan-600" />

                                {driver.vehicleType}

                            </div>

                            <div className="flex items-center gap-3">

                                <Calendar className="text-cyan-600" />

                                {new Date(driver.createdAt).toLocaleString()}

                            </div>

                        </div>

                    </div>

                </div>

                {/* Vehicle */}

                <div className="bg-white rounded-3xl shadow-md p-8 mt-8">

                    <h2 className="text-2xl font-bold mb-6">

                        Vehicle Details

                    </h2>

                    <div className="grid md:grid-cols-2 gap-8">

                        <div>

                            <p className="text-gray-500">

                                Vehicle Type

                            </p>

                            <h3 className="font-semibold mt-1">

                                {driver.vehicleType}

                            </h3>

                        </div>

                        <div>

                            <p className="text-gray-500">

                                Number Plate

                            </p>

                            <h3 className="font-semibold mt-1">

                                {driver.vehicleNumber}

                            </h3>

                        </div>

                    </div>

                </div>

                {/* Documents */}

                <div className="bg-white rounded-3xl shadow-md p-8 mt-8">

                    <h2 className="text-2xl font-bold mb-8">

                        Uploaded Documents

                    </h2>

                    <div className="grid lg:grid-cols-2 gap-8">

                        {[
                            {
                                title: "Driving License",
                                img: driver.driverLicense
                            },
                            {
                                title: "Aadhaar Front",
                                img: driver.aadharFront
                            },
                            {
                                title: "Aadhaar Back",
                                img: driver.aadharBack
                            },
                            {
                                title: "RC Book",
                                img: driver.rcBook
                            }
                        ].map((doc) => (
                            <div
                                key={doc.title}
                                className="border rounded-2xl overflow-hidden"
                            >

                                <Image
                                    src={doc.img}
                                    width={600}
                                    height={400}
                                    className="w-full h-64 object-cover"
                                    alt={doc.title}
                                />

                                <div className="flex items-center justify-between p-4">

                                    <span className="font-semibold">

                                        {doc.title}

                                    </span>

                                    <a
                                        href={doc.img}
                                        target="_blank"
                                        className="text-cyan-600 font-semibold"
                                    >
                                        View Full
                                    </a>

                                </div>

                            </div>
                        ))}

                    </div>

                </div>

                {/* Bank */}

                <div className="bg-white rounded-3xl shadow-md p-8 mt-8">

                    <h2 className="text-2xl font-bold mb-8">

                        Bank Details

                    </h2>

                    <div className="grid md:grid-cols-2 gap-8">

                        <div className="flex gap-3">

                            <Landmark />

                            <div>

                                <p className="text-gray-500">

                                    Bank

                                </p>

                                <h3 className="font-semibold">

                                    {driver.bankName}

                                </h3>

                            </div>

                        </div>

                        <div className="flex gap-3">

                            <User />

                            <div>

                                <p className="text-gray-500">

                                    Holder

                                </p>

                                <h3 className="font-semibold">

                                    {driver.accountHolder}

                                </h3>

                            </div>

                        </div>

                        <div className="flex gap-3">

                            <CreditCard />

                            <div>

                                <p className="text-gray-500">

                                    Account Number

                                </p>

                                <h3 className="font-semibold">

                                    {driver.accountNumber}

                                </h3>

                            </div>

                        </div>

                        <div>

                            <p className="text-gray-500">

                                IFSC

                            </p>

                            <h3 className="font-semibold">

                                {driver.ifsc}

                            </h3>

                        </div>

                        <div>

                            <p className="text-gray-500">

                                UPI

                            </p>

                            <h3 className="font-semibold">

                                {driver.upiId}

                            </h3>

                        </div>

                    </div>

                </div>

                {/* Admin */}

                <div className="bg-white rounded-3xl shadow-md p-8 mt-8">

                    <h2 className="text-2xl font-bold mb-6">

                        Admin Decision

                    </h2>

                    {driver.status !== "APPROVED" && (
                        <textarea
                            rows={4}
                            value={remark}
                            onChange={(e) => setRemark(e.target.value)}
                            placeholder="Reason if rejecting..."
                            className="w-full border rounded-2xl p-4 resize-none outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                    )}

                    {driver.status === "REJECTED" && driver.adminRemark && (
                        <div className="mt-5 rounded-xl bg-red-50 border border-red-200 p-4">
                            <h3 className="font-semibold text-red-600">
                                Previous Rejection Reason
                            </h3>

                            <p className="text-gray-700 mt-2">
                                {driver.adminRemark}
                            </p>
                        </div>
                    )}

                    <div className="flex justify-end gap-4 mt-6">

                        {driver.status !== "APPROVED" && (
                            <button
                                onClick={approveDriver}
                                disabled={loading}
                                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-8 py-3 rounded-2xl flex items-center gap-2"
                            >
                                <BadgeCheck size={18} />
                                {loading ? "Approving..." : "Approve"}
                            </button>
                        )}

                        {driver.status !== "APPROVED" && (
                            <button
                                onClick={rejectDriver}
                                className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-2xl flex items-center gap-2"
                            >
                                <CircleX size={18} />
                                Reject
                            </button>
                        )}

                    </div>

                </div>

            </div>

        </div>

    )

}