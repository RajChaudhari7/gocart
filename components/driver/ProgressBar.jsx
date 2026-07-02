'use client'

export default function ProgressBar({ step }) {

    return (

        <div className="mb-10">

            <div className="flex gap-3">

                {[1, 2, 3, 4].map((item) => (

                    <div
                        key={item}
                        className={`h-2 flex-1 rounded-full transition-all duration-300 ${step >= item
                                ? "bg-cyan-400"
                                : "bg-white/10"
                            }`}
                    />

                ))}

            </div>

            <p className="text-white/60 mt-3">

                Step {step <= 4 ? step : 4} of 4

            </p>

        </div>

    )

}