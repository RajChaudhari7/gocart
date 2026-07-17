'use client'

import Image from "next/image"
import { motion } from "framer-motion"
import { Upload, CheckCircle2, ArrowLeft, ArrowRight } from "lucide-react"
import { toast } from "sonner";

const docs = [
    {
        key: "profilePhoto",
        title: "Profile Photo"
    },
    {
        key: "driverLicense",
        title: "Driving Licence"
    },
    {
        key: "aadharFront",
        title: "Aadhaar Front"
    },
    {
        key: "aadharBack",
        title: "Aadhaar Back"
    },
    {
        key: "rcBook",
        title: "RC Book"
    }
]

export default function StepThree({

    form,
    setForm,
    next,
    back

}) {

    const handleFile = (e) => {

        const file = e.target.files[0]

        if (!file) return

        setForm(prev => ({
            ...prev,
            [e.target.name]: file
        }))

    }

    const validate = () => {

        for (const item of docs) {

            if (!form[item.key]) {
                return toast.error(`${item.title} is required`)
            }

        }

        next()

    }

    const getPreview = (file) => {

        if (!file) return "";

        if (typeof file === "string") {
            return file;
        }

        return URL.createObjectURL(file);

    };

    return (

        <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8"
        >

            <h2 className="text-3xl font-black text-white">

                Upload Documents

            </h2>

            <p className="text-white/50 mt-2">

                Upload all required documents for verification.

            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">

                {docs.map((doc) => (

                    <label
                        key={doc.key}
                        className="cursor-pointer"
                    >

                        <input
                            type="file"
                            accept="image/*"
                            name={doc.key}
                            hidden
                            onChange={handleFile}
                        />

                        <div className="border border-white/10 rounded-3xl bg-white/5 hover:border-cyan-400 transition p-5 h-[260px] flex flex-col justify-center items-center">

                            {

                                form[doc.key]

                                    ?

                                    <>

                                        <Image
                                            src={getPreview(form[doc.key])}
                                            alt={doc.title}
                                            width={150}
                                            height={150}
                                            className="rounded-2xl object-cover h-[150px] w-[150px]"
                                        />

                                        <div className="flex items-center gap-2 mt-4 text-green-400">

                                            <CheckCircle2 size={18} />

                                            Uploaded

                                        </div>

                                    </>

                                    :

                                    <>

                                        <Upload
                                            className="text-cyan-400"
                                            size={55}
                                        />

                                        <p className="text-white mt-5 font-semibold">

                                            {doc.title}

                                        </p>

                                        <p className="text-white/40 text-sm mt-2">

                                            Tap to upload

                                        </p>

                                    </>

                            }

                        </div>

                    </label>

                ))}

            </div>

            <div className="flex justify-between mt-10">

                <button
                    onClick={back}
                    className="px-8 py-4 rounded-2xl bg-white/10 text-white hover:bg-white/20 transition flex items-center gap-2"
                >

                    <ArrowLeft size={18} />

                    Back

                </button>

                <button
                    onClick={validate}
                    className="px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-400 to-emerald-400 text-black font-bold hover:scale-105 transition flex items-center gap-2"
                >

                    Next

                    <ArrowRight size={18} />

                </button>

            </div>

        </motion.div>

    )

}