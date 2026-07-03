'use client'

import ProgressBar from "@/components/driver/ProgressBar"
import StepFour from "@/components/driver/StepFour"
import StepOne from "@/components/driver/StepOne"
import StepThree from "@/components/driver/StepThree"
import StepTwo from "@/components/driver/StepTwo"
import Success from "@/components/driver/Success"
import { useState } from "react"
import Link from "next/link";


export default function DriverRegister() {

    const [step, setStep] = useState(1)

    const [form, setForm] = useState({

        // Personal
        name: "",
        phone: "",
        email: "",
        password: "",
        confirmPassword: "",

        // Vehicle
        vehicleType: "",
        vehicleNumber: "",

        // Documents
        profilePhoto: null,
        driverLicense: null,
        aadharFront: null,
        aadharBack: null,
        rcBook: null,

        // Bank
        bankName: "",
        accountHolder: "",
        accountNumber: "",
        ifsc: "",
        upiId: ""
    })

    const next = () => setStep(step + 1)

    const back = () => setStep(step - 1)

    return (

        <div className="min-h-screen bg-[#050914] py-10 px-4">

            <div className="max-w-6xl mx-auto">

                <ProgressBar step={step} />

                <div className="flex justify-end mt-4 mb-6">
                    <Link
                        href="/driver/login"
                        className="text-cyan-400 hover:text-cyan-300 font-semibold transition"
                    >
                        Already have an account? Login →
                    </Link>
                </div>

                {step === 1 &&
                    <StepOne
                        form={form}
                        setForm={setForm}
                        next={next}
                    />
                }

                {step === 2 &&
                    <StepTwo
                        form={form}
                        setForm={setForm}
                        next={next}
                        back={back}
                    />
                }

                {step === 3 &&
                    <StepThree
                        form={form}
                        setForm={setForm}
                        next={next}
                        back={back}
                    />
                }

                {step === 4 &&
                    <StepFour
                        form={form}
                        setForm={setForm}
                        back={back}
                        setStep={setStep}
                    />
                }

                {step === 5 &&
                    <Success />
                }

            </div>

        </div>

    )

}