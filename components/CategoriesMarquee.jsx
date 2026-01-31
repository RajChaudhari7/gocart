import { categories } from "@/assets/assets";

const CategoriesMarquee = () => {
  return (
    <div className="relative overflow-hidden w-full max-w-7xl mx-auto select-none group sm:my-24">

      {/* LEFT FADE */}
      <div
        className="absolute left-0 top-0 h-full w-24 z-10 pointer-events-none
        bg-gradient-to-r from-[#020617] to-transparent"
      />

      {/* MARQUEE TRACK */}
      <div
        className="flex min-w-[200%]
        animate-[marqueeScroll_12s_linear_infinite]
        sm:animate-[marqueeScroll_45s_linear_infinite]
        group-hover:[animation-play-state:paused]
        gap-4"
      >
        {[...categories, ...categories, ...categories].map((company, index) => (
          <button
            key={index}
            className="
              relative
              px-5 sm:px-7 py-2.5
              rounded-xl
              text-xs sm:text-sm font-semibold tracking-wide

              bg-white/5 backdrop-blur-xl
              border border-white/10
              text-white/70

              shadow-[0_10px_30px_rgba(0,0,0,0.4)]
              hover:shadow-[0_15px_45px_rgba(34,211,238,0.35)]

              hover:-translate-y-1
              hover:scale-[1.05]
              active:scale-95

              transition-all duration-300
              "
          >
            {/* Glow ring */}
            <span
              className="
                pointer-events-none
                absolute inset-0 rounded-xl
                opacity-0
                hover:opacity-100
                transition-opacity duration-300
                shadow-[0_0_25px_rgba(34,211,238,0.6)]
              "
            />

            {/* Text with subtle neon */}
            <span className="relative z-10">
              {company}
            </span>
          </button>
        ))}
      </div>

      {/* RIGHT FADE */}
      <div
        className="absolute right-0 top-0 h-full w-24 md:w-40 z-10 pointer-events-none
        bg-gradient-to-l from-[#020617] to-transparent"
      />
    </div>
  );
};

export default CategoriesMarquee;
