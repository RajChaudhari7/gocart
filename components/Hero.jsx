
"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  MapPin,
  Search,
  ShoppingBag,
  Store,
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const Hero = () => {
  const router = useRouter();

  const sectionRef = useRef(null);
  const contentRef = useRef(null);
  const badgeRef = useRef(null);
  const titleRef = useRef(null);
  const descriptionRef = useRef(null);
  const buttonsRef = useRef(null);
  const trustRef = useRef(null);

  const visualRef = useRef(null);
  const logoRef = useRef(null);
  const glowRef = useRef(null);
  const ringOneRef = useRef(null);
  const ringTwoRef = useRef(null);

  const searchCardRef = useRef(null);
  const storeCardRef = useRef(null);
  const deliveryCardRef = useRef(null);

  const gridRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) return;

    const ctx = gsap.context(() => {
      const timeline = gsap.timeline({
        defaults: {
          ease: "power3.out",
        },
      });

      // ---------------------------------------
      // INITIAL STATES
      // ---------------------------------------

      gsap.set(badgeRef.current, {
        opacity: 0,
        y: 25,
      });

      gsap.set(titleRef.current, {
        opacity: 0,
        y: 45,
      });

      gsap.set(descriptionRef.current, {
        opacity: 0,
        y: 25,
      });

      gsap.set(buttonsRef.current, {
        opacity: 0,
        y: 25,
      });

      gsap.set(trustRef.current, {
        opacity: 0,
        y: 20,
      });

      gsap.set(visualRef.current, {
        opacity: 0,
        x: 80,
        scale: 0.8,
      });

      gsap.set(
        [
          searchCardRef.current,
          storeCardRef.current,
          deliveryCardRef.current,
        ],
        {
          opacity: 0,
          scale: 0.7,
        }
      );

      // ---------------------------------------
      // ENTRANCE ANIMATION
      // ---------------------------------------

      timeline
        .to(badgeRef.current, {
          opacity: 1,
          y: 0,
          duration: 0.6,
        })
        .to(
          titleRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
          },
          "-=0.25"
        )
        .to(
          descriptionRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
          },
          "-=0.45"
        )
        .to(
          buttonsRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
          },
          "-=0.4"
        )
        .to(
          trustRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
          },
          "-=0.3"
        )
        .to(
          visualRef.current,
          {
            opacity: 1,
            x: 0,
            scale: 1,
            duration: 1.1,
            ease: "back.out(1.4)",
          },
          "-=0.8"
        )
        .to(
          searchCardRef.current,
          {
            opacity: 1,
            scale: 1,
            duration: 0.6,
            ease: "back.out(1.7)",
          },
          "-=0.5"
        )
        .to(
          storeCardRef.current,
          {
            opacity: 1,
            scale: 1,
            duration: 0.6,
            ease: "back.out(1.7)",
          },
          "-=0.45"
        )
        .to(
          deliveryCardRef.current,
          {
            opacity: 1,
            scale: 1,
            duration: 0.6,
            ease: "back.out(1.7)",
          },
          "-=0.45"
        );

      // ---------------------------------------
      // LOGO FLOAT
      // ---------------------------------------

      gsap.to(logoRef.current, {
        y: -14,
        duration: 2.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      // ---------------------------------------
      // LOGO ROTATION
      // ---------------------------------------

      gsap.to(logoRef.current, {
        rotation: 2,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      // ---------------------------------------
      // GLOW ANIMATION
      // ---------------------------------------

      gsap.to(glowRef.current, {
        scale: 1.25,
        opacity: 0.65,
        duration: 3.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      // ---------------------------------------
      // RING ANIMATIONS
      // ---------------------------------------

      gsap.to(ringOneRef.current, {
        rotation: 360,
        duration: 22,
        repeat: -1,
        ease: "none",
      });

      gsap.to(ringTwoRef.current, {
        rotation: -360,
        duration: 28,
        repeat: -1,
        ease: "none",
      });

      // ---------------------------------------
      // FLOATING CARDS
      // ---------------------------------------

      gsap.to(searchCardRef.current, {
        y: -10,
        duration: 2.4,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      gsap.to(storeCardRef.current, {
        y: 10,
        duration: 2.8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      gsap.to(deliveryCardRef.current, {
        y: -8,
        duration: 2.6,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      // ---------------------------------------
      // BUTTON GLOW
      // ---------------------------------------

      gsap.to(".hero-main-button", {
        boxShadow:
          "0 0 10px rgba(34,211,238,0.15), 0 0 30px rgba(34,211,238,0.2)",
        duration: 1.8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      // ---------------------------------------
      // GRADIENT ANIMATION
      // ---------------------------------------

      gsap.to(".hero-gradient-text", {
        backgroundPosition: "200% center",
        duration: 5,
        repeat: -1,
        ease: "linear",
      });

      // ---------------------------------------
      // SCROLL PARALLAX
      // ---------------------------------------

      gsap.to(gridRef.current, {
        y: 100,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom top",
          scrub: 1,
        },
      });

      gsap.to(visualRef.current, {
        y: -50,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom top",
          scrub: 1,
        },
      });
    }, section);

    return () => {
      ctx.revert();
    };
  }, []);

  // ==========================================
  // MOUSE PARALLAX
  // ==========================================

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) return;

    const handleMouseMove = (event) => {
      if (window.innerWidth < 768) return;

      const rect = section.getBoundingClientRect();

      const x =
        (event.clientX - rect.left - rect.width / 2) /
        rect.width;

      const y =
        (event.clientY - rect.top - rect.height / 2) /
        rect.height;

      gsap.to(logoRef.current, {
        x: x * 20,
        y: y * 15,
        rotationY: x * 6,
        rotationX: y * -5,
        duration: 0.7,
        ease: "power2.out",
        overwrite: true,
      });

      gsap.to(glowRef.current, {
        x: x * -40,
        y: y * -30,
        duration: 1,
        ease: "power2.out",
        overwrite: true,
      });

      gsap.to(searchCardRef.current, {
        x: x * 12,
        duration: 0.8,
        ease: "power2.out",
        overwrite: true,
      });

      gsap.to(storeCardRef.current, {
        x: x * -15,
        duration: 0.9,
        ease: "power2.out",
        overwrite: true,
      });

      gsap.to(deliveryCardRef.current, {
        x: x * 15,
        duration: 1,
        ease: "power2.out",
        overwrite: true,
      });
    };

    const handleMouseLeave = () => {
      gsap.to(
        [
          logoRef.current,
          glowRef.current,
          searchCardRef.current,
          storeCardRef.current,
          deliveryCardRef.current,
        ],
        {
          x: 0,
          y: 0,
          rotationX: 0,
          rotationY: 0,
          duration: 0.8,
          ease: "power3.out",
        }
      );
    };

    section.addEventListener("mousemove", handleMouseMove);
    section.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      section.removeEventListener("mousemove", handleMouseMove);
      section.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  // ==========================================
  // BUTTON MAGNETIC EFFECT
  // ==========================================

  const handleButtonMove = (event) => {
    if (window.innerWidth < 768) return;

    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();

    const x =
      event.clientX - rect.left - rect.width / 2;

    const y =
      event.clientY - rect.top - rect.height / 2;

    gsap.to(button, {
      x: x * 0.08,
      y: y * 0.12,
      duration: 0.25,
      ease: "power2.out",
    });
  };

  const handleButtonLeave = (event) => {
    gsap.to(event.currentTarget, {
      x: 0,
      y: 0,
      duration: 0.5,
      ease: "elastic.out(1, 0.5)",
    });
  };

  return (
    <section
      ref={sectionRef}
      className="
        relative
        min-h-[90vh]
        w-full
        overflow-hidden
        bg-[#030712]
        pt-28
        pb-16
        text-white
        sm:pt-32
        md:flex
        md:items-center
        md:pt-24
      "
    >
      {/* ========================================
          BACKGROUND GRID
      ======================================== */}

      <div
        ref={gridRef}
        className="
          pointer-events-none
          absolute
          inset-[-10%]
          opacity-[0.045]
          [background-image:linear-gradient(rgba(255,255,255,0.35)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.35)_1px,transparent_1px)]
          [background-size:48px_48px]
        "
      />

      {/* ========================================
          BACKGROUND GLOWS
      ======================================== */}

      <div
        className="
          pointer-events-none
          absolute
          left-[-150px]
          bottom-[-150px]
          h-[400px]
          w-[400px]
          rounded-full
          bg-emerald-500/[0.06]
          blur-[120px]
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          right-[-150px]
          top-[-100px]
          h-[400px]
          w-[400px]
          rounded-full
          bg-blue-500/[0.06]
          blur-[120px]
        "
      />

      {/* ========================================
          CONTENT
      ======================================== */}

      <div className="relative z-10 mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 md:grid-cols-2 lg:gap-20">

          {/* ====================================
              LEFT SIDE
          ==================================== */}

          <div
            ref={contentRef}
            className="text-center md:text-left"
          >
            {/* BADGE */}

            <div
              ref={badgeRef}
              className="
                mb-6
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                border-cyan-400/20
                bg-cyan-400/[0.06]
                px-4
                py-2
                text-[9px]
                font-bold
                uppercase
                tracking-[0.2em]
                text-cyan-300
                backdrop-blur-xl
                sm:text-[10px]
              "
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative h-2 w-2 rounded-full bg-emerald-400" />
              </span>

              Nandurbar&apos;s Local Marketplace
            </div>

            {/* TITLE */}

            <h1
              ref={titleRef}
              className="
                text-[2.7rem]
                font-black
                leading-[1.03]
                tracking-[-0.055em]
                sm:text-5xl
                md:text-6xl
                lg:text-[4.5rem]
                xl:text-[5rem]
              "
            >
              Everything You Need,
              <br />

              <span
                className="
                  hero-gradient-text
                  inline-block
                  bg-gradient-to-r
                  from-cyan-300
                  via-emerald-300
                  to-cyan-300
                  bg-[length:200%_auto]
                  bg-clip-text
                  text-transparent
                "
              >
                Right Around You.
              </span>
            </h1>

            {/* DESCRIPTION */}

            <p
              ref={descriptionRef}
              className="
                mx-auto
                mt-6
                max-w-xl
                text-sm
                leading-7
                text-white/45
                sm:text-base
                md:mx-0
                md:text-lg
                md:leading-8
              "
            >
              Discover products from trusted local shops in
              Nandurbar. Shop nearby, support local businesses
              and get what you need without going far.
            </p>

            {/* BUTTONS */}

            <div
              ref={buttonsRef}
              className="
                mt-8
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
                onMouseMove={handleButtonMove}
                onMouseLeave={handleButtonLeave}
                className="
                  hero-main-button
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
                  transition-all
                  hover:brightness-110
                  active:scale-95
                  sm:w-auto
                "
              >
                Start Shopping

                <ArrowRight
                  size={17}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </button>

              <button
                type="button"
                onClick={() => router.push("/shop")}
                onMouseMove={handleButtonMove}
                onMouseLeave={handleButtonLeave}
                className="
                  group
                  flex
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-full
                  border
                  border-white/10
                  bg-white/[0.035]
                  px-7
                  py-3.5
                  text-sm
                  font-bold
                  text-white/70
                  backdrop-blur-xl
                  transition-all
                  hover:border-cyan-400/20
                  hover:bg-white/[0.07]
                  hover:text-white
                  active:scale-95
                  sm:w-auto
                "
              >
                <Store
                  size={16}
                  className="text-cyan-400"
                />

                Explore Shops
              </button>
            </div>

            {/* TRUST */}

            <div
              ref={trustRef}
              className="
                mt-7
                flex
                flex-wrap
                justify-center
                gap-x-5
                gap-y-2
                text-[10px]
                text-white/30
                sm:text-xs
                md:justify-start
              "
            >
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Local Stores
              </span>

              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                Nearby Shopping
              </span>

              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
                Secure Checkout
              </span>
            </div>
          </div>

          {/* ====================================
              RIGHT SIDE
          ==================================== */}

          <div
            ref={visualRef}
            className="
              relative
              mx-auto
              flex
              h-[400px]
              w-full
              max-w-[480px]
              items-center
              justify-center
              sm:h-[470px]
              md:h-[520px]
            "
          >
            {/* MAIN GLOW */}

            <div
              ref={glowRef}
              className="
                pointer-events-none
                absolute
                h-[260px]
                w-[260px]
                rounded-full
                bg-cyan-400/10
                blur-[90px]
                sm:h-[360px]
                sm:w-[360px]
              "
            />

            {/* RING ONE */}

            <div
              ref={ringOneRef}
              className="
                absolute
                h-[280px]
                w-[280px]
                rounded-full
                border
                border-dashed
                border-cyan-400/10
                sm:h-[360px]
                sm:w-[360px]
                md:h-[400px]
                md:w-[400px]
              "
            >
              <span
                className="
                  absolute
                  right-0
                  top-1/2
                  h-2.5
                  w-2.5
                  rounded-full
                  bg-cyan-400
                  shadow-[0_0_20px_rgba(34,211,238,0.9)]
                "
              />
            </div>

            {/* RING TWO */}

            <div
              ref={ringTwoRef}
              className="
                absolute
                h-[220px]
                w-[220px]
                rounded-full
                border
                border-emerald-400/[0.08]
                sm:h-[300px]
                sm:w-[300px]
                md:h-[330px]
                md:w-[330px]
              "
            >
              <span
                className="
                  absolute
                  left-0
                  top-1/3
                  h-2
                  w-2
                  rounded-full
                  bg-emerald-400
                  shadow-[0_0_18px_rgba(52,211,153,0.8)]
                "
              />
            </div>

            {/* LOGO */}

            <div
              ref={logoRef}
              className="
                relative
                z-10
                h-48
                w-48
                sm:h-60
                sm:w-60
                md:h-[300px]
                md:w-[300px]
              "
            >
              <Image
                src="/app.png"
                alt="Nandurbar Bazar Logo"
                fill
                priority
                className="
                  object-contain
                  drop-shadow-[0_30px_70px_rgba(34,211,238,0.25)]
                "
              />
            </div>

            {/* ==================================
                SEARCH CARD
            ================================== */}

            <div
              ref={searchCardRef}
              className="
                absolute
                left-0
                top-[17%]
                z-20
                rounded-2xl
                border
                border-white/[0.08]
                bg-[#0b1220]/90
                p-3
                shadow-2xl
                backdrop-blur-xl
                sm:left-[2%]
              "
            >
              <div className="flex items-center gap-3">
                <div
                  className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-xl
                    bg-cyan-400/10
                    text-cyan-400
                  "
                >
                  <Search size={16} />
                </div>

                <div>
                  <p className="text-[9px] uppercase tracking-wider text-white/25">
                    Discover
                  </p>

                  <p className="mt-0.5 text-xs font-semibold text-white/75">
                    Shops near you
                  </p>
                </div>
              </div>
            </div>

            {/* ==================================
                STORE CARD
            ================================== */}

            <div
              ref={storeCardRef}
              className="
                absolute
                right-0
                top-[12%]
                z-20
                rounded-2xl
                border
                border-white/[0.08]
                bg-[#0b1220]/90
                p-3
                shadow-2xl
                backdrop-blur-xl
                sm:right-[2%]
              "
            >
              <div className="flex items-center gap-3">
                <div
                  className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-xl
                    bg-emerald-400/10
                    text-emerald-400
                  "
                >
                  <ShoppingBag size={16} />
                </div>

                <div>
                  <p className="text-[9px] uppercase tracking-wider text-white/25">
                    Local
                  </p>

                  <p className="mt-0.5 text-xs font-semibold text-white/75">
                    Trusted sellers
                  </p>
                </div>
              </div>
            </div>

            {/* ==================================
                DELIVERY CARD
            ================================== */}

            <div
              ref={deliveryCardRef}
              className="
                absolute
                bottom-[13%]
                right-[1%]
                z-20
                rounded-2xl
                border
                border-white/[0.08]
                bg-[#0b1220]/90
                p-3
                shadow-2xl
                backdrop-blur-xl
                sm:right-[5%]
              "
            >
              <div className="flex items-center gap-3">
                <div
                  className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-xl
                    bg-purple-400/10
                    text-purple-400
                  "
                >
                  <MapPin size={16} />
                </div>

                <div>
                  <p className="text-[9px] uppercase tracking-wider text-white/25">
                    Nearby
                  </p>

                  <p className="mt-0.5 text-xs font-semibold text-white/75">
                    Local shopping
                  </p>
                </div>
              </div>
            </div>

            {/* DECORATIVE DOT */}

            <div
              className="
                absolute
                bottom-[20%]
                left-[8%]
                h-2
                w-2
                rounded-full
                bg-emerald-400
                shadow-[0_0_18px_rgba(52,211,153,0.8)]
              "
            />

            <div
              className="
                absolute
                right-[12%]
                bottom-[30%]
                h-1.5
                w-1.5
                rounded-full
                bg-cyan-400
                shadow-[0_0_15px_rgba(34,211,238,0.8)]
              "
            />
          </div>
        </div>
      </div>

      {/* ========================================
          BOTTOM FADE
      ======================================== */}

      <div
        className="
          pointer-events-none
          absolute
          inset-x-0
          bottom-0
          h-32
          bg-gradient-to-t
          from-[#020617]
          to-transparent
        "
      />
    </section>
  );
};

export default Hero;
