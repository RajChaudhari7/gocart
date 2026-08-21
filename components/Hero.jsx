"use client";

import { ArrowRightIcon } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";

const Hero = () => {
  const router = useRouter();

  const sectionRef = useRef(null);
  const badgeRef = useRef(null);
  const titleRef = useRef(null);
  const descriptionRef = useRef(null);
  const buttonRef = useRef(null);
  const logoWrapperRef = useRef(null);
  const logoRef = useRef(null);
  const glowRef = useRef(null);
  const ringOneRef = useRef(null);
  const ringTwoRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // ==========================================
      // INITIAL ENTRANCE
      // ==========================================

      const timeline = gsap.timeline({
        defaults: {
          ease: "power3.out",
        },
      });

      timeline
        .from(badgeRef.current, {
          opacity: 0,
          y: 25,
          scale: 0.9,
          duration: 0.6,
        })
        .from(
          titleRef.current,
          {
            opacity: 0,
            y: 60,
            duration: 0.9,
          },
          "-=0.3",
        )
        .from(
          descriptionRef.current,
          {
            opacity: 0,
            y: 30,
            duration: 0.7,
          },
          "-=0.45",
        )
        .from(
          buttonRef.current,
          {
            opacity: 0,
            y: 25,
            scale: 0.9,
            duration: 0.6,
          },
          "-=0.4",
        )
        .from(
          logoWrapperRef.current,
          {
            opacity: 0,
            x: 80,
            scale: 0.75,
            rotate: 10,
            duration: 1.1,
            ease: "back.out(1.4)",
          },
          "-=1",
        );

      // ==========================================
      // FLOATING LOGO
      // ==========================================

      gsap.to(logoRef.current, {
        y: -16,
        rotate: 2,
        duration: 2.8,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      });

      // ==========================================
      // GLOW BREATHING
      // ==========================================

      gsap.to(glowRef.current, {
        scale: 1.25,
        opacity: 0.7,
        duration: 3.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      // ==========================================
      // ROTATING RINGS
      // ==========================================

      gsap.to(ringOneRef.current, {
        rotate: 360,
        duration: 24,
        repeat: -1,
        ease: "none",
      });

      gsap.to(ringTwoRef.current, {
        rotate: -360,
        duration: 30,
        repeat: -1,
        ease: "none",
      });

      // ==========================================
      // CTA PULSE
      // ==========================================

      gsap.to(buttonRef.current, {
        boxShadow: "0 0 32px rgba(34, 211, 238, 0.28)",
        duration: 1.8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // ==========================================
  // DESKTOP MOUSE PARALLAX
  // ==========================================

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) return;

    const handleMouseMove = (event) => {
      if (window.innerWidth < 768) return;

      const rect = section.getBoundingClientRect();

      const x = (event.clientX - rect.left - rect.width / 2) / rect.width;

      const y = (event.clientY - rect.top - rect.height / 2) / rect.height;

      gsap.to(logoWrapperRef.current, {
        x: x * 25,
        y: y * 20,
        duration: 0.8,
        ease: "power2.out",
      });

      gsap.to(glowRef.current, {
        x: x * -50,
        y: y * -35,
        duration: 1,
        ease: "power2.out",
      });
    };

    const handleMouseLeave = () => {
      gsap.to(logoWrapperRef.current, {
        x: 0,
        y: 0,
        duration: 0.8,
        ease: "power2.out",
      });

      gsap.to(glowRef.current, {
        x: 0,
        y: 0,
        duration: 0.8,
        ease: "power2.out",
      });
    };

    section.addEventListener("mousemove", handleMouseMove);
    section.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      section.removeEventListener("mousemove", handleMouseMove);
      section.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="
        relative
        flex
        min-h-[85vh]
        w-full
        items-center
        overflow-hidden
        bg-[#050914]
        pb-12
        pt-28
        text-white
        sm:pt-32
        md:pt-24
      "
    >
      {/* ================================= */}
      {/* BACKGROUND GRID */}
      {/* ================================= */}

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          opacity-[0.045]
          [background-image:linear-gradient(rgba(255,255,255,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.3)_1px,transparent_1px)]
          [background-size:42px_42px]
        "
      />

      {/* ================================= */}
      {/* CENTER GLOW */}
      {/* ================================= */}

      <div
        ref={glowRef}
        className="
          pointer-events-none
          absolute
          left-1/2
          top-1/2
          h-[320px]
          w-[320px]
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          bg-cyan-500/10
          blur-[110px]
          sm:h-[420px]
          sm:w-[420px]
          md:h-[600px]
          md:w-[600px]
        "
      />

      {/* SECONDARY GLOW */}

      <div className="pointer-events-none absolute -left-32 bottom-0 h-72 w-72 rounded-full bg-emerald-500/[0.07] blur-[100px]" />

      <div className="pointer-events-none absolute -right-32 top-10 h-72 w-72 rounded-full bg-indigo-500/[0.07] blur-[100px]" />

      {/* ================================= */}
      {/* DECORATIVE RINGS */}
      {/* ================================= */}

      <div
        ref={ringOneRef}
        className="
          pointer-events-none
          absolute
          right-[5%]
          top-[18%]
          hidden
          h-[320px]
          w-[320px]
          rounded-full
          border
          border-dashed
          border-cyan-400/10
          md:block
        "
      />

      <div
        ref={ringTwoRef}
        className="
          pointer-events-none
          absolute
          right-[8%]
          top-[22%]
          hidden
          h-[260px]
          w-[260px]
          rounded-full
          border
          border-emerald-400/10
          md:block
        "
      />

      {/* ================================= */}
      {/* CONTENT */}
      {/* ================================= */}

      <div className="relative z-10 mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-10 md:flex-row md:gap-12">
          {/* ================================= */}
          {/* TEXT */}
          {/* ================================= */}

          <div className="flex-1 space-y-6 text-center md:text-left">
            <div
              ref={badgeRef}
              className="
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                border-cyan-400/20
                bg-cyan-400/[0.06]
                px-3
                py-1.5
                text-[9px]
                font-bold
                uppercase
                tracking-[0.2em]
                text-cyan-400
                backdrop-blur-xl
                sm:text-[10px]
              "
            >
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              Welcome to Nandurbar Bazar
            </div>

            <h1
              ref={titleRef}
              className="
                text-4xl
                font-black
                leading-[1.05]
                tracking-[-0.045em]
                text-white
                sm:text-5xl
                md:text-6xl
                lg:text-7xl
              "
            >
              Everything You Need,
              <br />
              <span
                className="
                  bg-gradient-to-r
                  from-cyan-400
                  via-emerald-300
                  to-cyan-400
                  bg-[length:200%_auto]
                  bg-clip-text
                  text-transparent
                  animate-[gradient_5s_linear_infinite]
                "
              >
                Delivered Nearby.
              </span>
            </h1>

            <p
              ref={descriptionRef}
              className="
                mx-auto
                max-w-xl
                text-sm
                font-light
                leading-7
                text-white/50
                sm:text-base
                md:mx-0
                md:text-lg
              "
            >
              Discover products from trusted local shops near your location.
              Shop smarter, support local businesses and get your essentials
              delivered quickly.
            </p>

            <div
              ref={buttonRef}
              className="
                flex
                flex-col
                items-center
                gap-3
                sm:flex-row
                sm:justify-center
                md:justify-start
              "
            >
              <button
                type="button"
                onClick={() => router.push("/product")}
                className="
                  group
                  flex
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-full
                  bg-gradient-to-r
                  from-cyan-400
                  to-emerald-400
                  px-7
                  py-3.5
                  text-sm
                  font-black
                  text-slate-950
                  transition
                  duration-300
                  hover:-translate-y-1
                  hover:shadow-[0_15px_40px_rgba(34,211,238,0.18)]
                  active:scale-[0.97]
                  sm:w-auto
                "
              >
                Shop Nearby
                <ArrowRightIcon
                  size={17}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </button>

              <button
                type="button"
                onClick={() => router.push("/shop")}
                className="
                  w-full
                  rounded-full
                  border
                  border-white/10
                  bg-white/[0.04]
                  px-7
                  py-3.5
                  text-sm
                  font-bold
                  text-white/70
                  backdrop-blur-xl
                  transition
                  hover:border-white/20
                  hover:bg-white/[0.07]
                  hover:text-white
                  sm:w-auto
                "
              >
                Explore Shops
              </button>
            </div>

            {/* MINI TRUST ROW */}

            <div
              className="
                flex
                flex-wrap
                justify-center
                gap-x-5
                gap-y-2
                pt-2
                text-[10px]
                font-medium
                text-white/30
                sm:text-xs
                md:justify-start
              "
            >
              <span>● Nearby Stores</span>
              <span>● Local Delivery</span>
              <span>● Secure Checkout</span>
            </div>
          </div>

          {/* ================================= */}
          {/* LOGO VISUAL */}
          {/* ================================= */}

          <div
            ref={logoWrapperRef}
            className="
              order-first
              flex
              w-full
              flex-1
              justify-center
              md:order-last
            "
          >
            <div
              className="
                relative
                flex
                h-56
                w-56
                items-center
                justify-center
                sm:h-72
                sm:w-72
                md:h-[370px]
                md:w-[370px]
              "
            >
              {/* ORBIT */}

              <div
                className="
                  absolute
                  inset-0
                  rounded-full
                  border
                  border-cyan-400/10
                "
              />

              <div
                className="
                  absolute
                  inset-7
                  rounded-full
                  border
                  border-dashed
                  border-emerald-400/10
                "
              />

              {/* SMALL ORBIT DOT */}

              <div className="absolute right-[8%] top-[25%] h-3 w-3 rounded-full bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.8)]" />

              <div className="absolute bottom-[15%] left-[9%] h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.8)]" />

              {/* LOGO GLOW */}

              <div className="absolute h-[70%] w-[70%] rounded-full bg-cyan-400/10 blur-[60px]" />

              {/* LOGO */}

              <div
                ref={logoRef}
                className="
                  relative
                  h-44
                  w-44
                  sm:h-56
                  sm:w-56
                  md:h-72
                  md:w-72
                "
              >
                <Image
                  src="/app.png"
                  alt="Nandurbar Bazar Logo"
                  fill
                  className="
                    object-contain
                    drop-shadow-[0_20px_50px_rgba(34,211,238,0.2)]
                  "
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================================= */}
      {/* BOTTOM FADE */}
      {/* ================================= */}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#020617] to-transparent" />
    </section>
  );
};

export default Hero;
