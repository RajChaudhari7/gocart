import React from "react";
import Title from "./Title";
import { ourSpecsData } from "@/assets/assets";

const OurSpecs = () => {
  return (
    <section className="px-5 md:px-8 my-20 max-w-7xl mx-auto">
      <Title
        visibleButton={false}
        title="Our Specifications"
        description="We offer top-tier service and convenience to ensure your shopping experience is smooth, secure and completely hassle-free."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mt-14">
        {ourSpecsData.map((spec, index) => (
          <div
            key={index}
            className="group relative rounded-2xl border bg-white p-8 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            style={{ borderColor: spec.accent + "30" }}
          >
            {/* Icon */}
            <div
              className="absolute -top-6 left-1/2 -translate-x-1/2 size-12 rounded-xl flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110"
              style={{ backgroundColor: spec.accent }}
            >
              <spec.icon size={22} className="text-white" />
            </div>

            {/* Content */}
            <h3 className="mt-6 text-lg font-semibold text-slate-800">
              {spec.title}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              {spec.description}
            </p>

            {/* Accent glow */}
            <div
              className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-30"
              style={{ backgroundColor: spec.accent }}
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default OurSpecs;
