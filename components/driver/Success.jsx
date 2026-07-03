'use client'

import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";

export default function Success() {

    const router = useRouter();

    const [status, setStatus] = useState("PENDING");
    const [reason, setReason] = useState("");

    useEffect(() => {

        const phone = JSON.parse(
            localStorage.getItem("driverApplication")
        )?.phone;

        if (!phone) return;

        const fetchStatus = async () => {

            try {

                const { data } = await axios.get(
                    `/api/driver/application-status?phone=${phone}`
                );

                setStatus(data.status);

                setReason(data.reason || "");

                // Save latest application
                localStorage.setItem(
                    "driverApplication",
                    JSON.stringify(data.application)
                );

            } catch (error) {

                console.log(error);

            }

        };

        fetchStatus();

        const interval = setInterval(
            fetchStatus,
            5000
        );

        return () => clearInterval(interval);

    }, []);

    const editApplication = () => {

        setTimeout(() => {
            router.push("/driver/register");
        }, 200);

    };

    const gotoLogin = () => {

        localStorage.removeItem("driverApplication");

        router.push("/driver/login");

    };

    return (

        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-10 text-center"
        >

            {/* Pending */}

            {status === "PENDING" && (

                <>

                    <div className="flex justify-center">

                        <div className="w-28 h-28 rounded-full bg-yellow-500/20 flex items-center justify-center">

                            <Clock
                                className="text-yellow-400"
                                size={70}
                            />

                        </div>

                    </div>

                    <h1 className="text-4xl font-black text-white mt-8">

                        Application Under Review

                    </h1>

                    <p className="text-white/60 mt-5 text-lg">

                        Your documents are being verified.

                        <br />

                        This page updates automatically.

                    </p>

                </>

            )}

            {/* Approved */}

            {status === "APPROVED" && (

                <>

                    <div className="flex justify-center">

                        <div className="w-28 h-28 rounded-full bg-green-500/20 flex items-center justify-center">

                            <CheckCircle2
                                className="text-green-400"
                                size={70}
                            />

                        </div>

                    </div>

                    <h1 className="text-4xl font-black text-white mt-8">

                        Congratulations 🎉

                    </h1>

                    <p className="text-white/60 mt-5 text-lg">

                        Your application has been approved.

                        <br />

                        You can now start earning.

                    </p>

                    <button
                        onClick={gotoLogin}
                        className="mt-10 px-10 py-4 rounded-2xl bg-gradient-to-r from-cyan-400 to-emerald-400 text-black font-bold"
                    >

                        Login Now

                    </button>

                </>

            )}

            {/* Rejected */}

            {status === "REJECTED" && (

                <>

                    <div className="flex justify-center">

                        <div className="w-28 h-28 rounded-full bg-red-500/20 flex items-center justify-center">

                            <XCircle
                                className="text-red-400"
                                size={70}
                            />

                        </div>

                    </div>

                    <h1 className="text-4xl font-black text-white mt-8">

                        Application Rejected

                    </h1>

                    <div className="mt-8 bg-red-500/10 border border-red-500/30 rounded-2xl p-6">

                        <p className="text-red-300 font-semibold">

                            Reason

                        </p>

                        <p className="text-white mt-3">

                            {reason || "Admin has rejected your application."}

                        </p>

                    </div>

                    <button
                        onClick={editApplication}
                        className="mt-10 px-10 py-4 rounded-2xl bg-gradient-to-r from-cyan-400 to-emerald-400 text-black font-bold"
                    >

                        Edit Application

                    </button>

                </>

            )}

        </motion.div>

    );

}