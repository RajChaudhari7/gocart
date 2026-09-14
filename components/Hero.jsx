"use client";

import React, { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  MapPin,
  ShoppingBag,
  Store,
  Sparkles,
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const Hero = () => {
  const router = useRouter();

  const sectionRef = useRef(null);
  const badgeRef = useRef(null);
  const titleRef = useRef(null);
  const descriptionRef = useRef(null);
  const buttonsRef = useRef(null);
  const trustRef = useRef(null);
  const visualRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;


    if (!section) return;

    const ctx = gsap.context(() => {
      const timeline = gsap.timeline({
        defaults: {
          ease: "power3.out",
        },
      });

      gsap.set(badgeRef.current, {
        opacity: 0,
        y: 20,
      });

      gsap.set(titleRef.current, {
        opacity: 0,
        y: 35,
      });

      gsap.set(descriptionRef.current, {
        opacity: 0,
        y: 20,
      });

      gsap.set(buttonsRef.current, {
        opacity: 0,
        y: 20,
      });

      gsap.set(trustRef.current, {
        opacity: 0,
        y: 15,
      });

      gsap.set(visualRef.current, {
        opacity: 0,
        y: 30,
        scale: 0.96,
      });

      timeline
        .to(badgeRef.current, {
          opacity: 1,
          y: 0,
          duration: 0.5,
        })
        .to(
          titleRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
          },
          "-=0.2"
        )
        .to(
          descriptionRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
          },
          "-=0.4"
        )
        .to(
          buttonsRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
          },
          "-=0.3"
        )
        .to(
          trustRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
          },
          "-=0.25"
        )
        .to(
          visualRef.current,
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            ease: "back.out(1.2)",
          },
          "-=0.5"
        );

      // Subtle floating animation
      gsap.to(visualRef.current, {
        y: -6,
        duration: 2.8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      // Scroll animation
      gsap.to(visualRef.current, {
        y: -25,
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

  // Magnetic button effect
  const handleButtonMove = (event) => {
    if (window.innerWidth < 768) return;


    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();

    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;

    gsap.to(button, {
      x: x * 0.06,
      y: y * 0.08,
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

  return (<section
    ref={sectionRef}
    className="
     relative
     overflow-hidden
     bg-[#fffaf5]
     px-5
     pb-16
     pt-28
     sm:px-6
     sm:pt-32
     md:min-h-[78vh]
     md:pt-24
     lg:px-8
   "
  >
    {/* Soft decorative background shapes */}


    <div
      className="
      pointer-events-none
      absolute
      -left-32
      top-20
      h-64
      w-64
      rounded-full
      bg-orange-200/30
      blur-3xl
    "
    />

    <div
      className="
      pointer-events-none
      absolute
      -right-32
      bottom-0
      h-72
      w-72
      rounded-full
      bg-emerald-200/30
      blur-3xl
    "
    />

    <div
      className="
      pointer-events-none
      absolute
      right-[15%]
      top-10
      h-24
      w-24
      rounded-full
      bg-purple-200/20
      blur-2xl
    "
    />

    <div className="relative z-10 mx-auto max-w-7xl">
      <div className="grid items-center gap-12 md:grid-cols-[1.1fr_0.9fr] lg:gap-20">

        {/* LEFT CONTENT */}

        <div className="text-center md:text-left">

          {/* Badge */}

          <div
            ref={badgeRef}
            className="
            mb-6
            inline-flex
            items-center
            gap-2
            rounded-full
            border
            border-orange-200
            bg-white
            px-4
            py-2
            text-[10px]
            font-bold
            uppercase
            tracking-[0.15em]
            text-orange-600
            shadow-sm
          "
          >
            <span className="flex h-2 w-2">
              <span className="h-2 w-2 rounded-full bg-orange-500" />
            </span>

            Your Local Marketplace
          </div>

          {/* Heading */}

          <h1
            ref={titleRef}
            className="
            text-[2.8rem]
            font-black
            leading-[1.04]
            tracking-[-0.055em]
            text-slate-900
            sm:text-5xl
            md:text-6xl
            lg:text-[4.4rem]
          "
          >
            Everything You Need,

            <br />

            <span className="relative inline-block text-orange-500">
              Right Around You.
            </span>
          </h1>

          {/* Description */}

          <p
            ref={descriptionRef}
            className="
            mx-auto
            mt-6
            max-w-xl
            text-sm
            leading-7
            text-slate-600
            sm:text-base
            md:mx-0
            md:text-lg
            md:leading-8
          "
          >
            Discover products from trusted local shops,
            find great deals nearby, and get what you need
            without going far.
          </p>

          {/* Buttons */}

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
              group
              flex
              w-full
              items-center
              justify-center
              gap-2
              rounded-full
              bg-slate-900
              px-7
              py-3.5
              text-sm
              font-bold
              text-white
              shadow-lg
              shadow-slate-900/10
              transition-all
              hover:-translate-y-0.5
              hover:bg-slate-800
              active:scale-95
              sm:w-auto
            "
            >
              Start Shopping

              <ArrowRight
                size={17}
                className="
                transition-transform
                duration-300
                group-hover:translate-x-1
              "
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
              border-slate-200
              bg-white
              px-7
              py-3.5
              text-sm
              font-bold
              text-slate-700
              shadow-sm
              transition-all
              hover:-translate-y-0.5
              hover:border-orange-200
              hover:text-orange-600
              active:scale-95
              sm:w-auto
            "
            >
              <Store
                size={16}
                className="text-orange-500"
              />

              Explore Shops
            </button>
          </div>

          {/* Trust */}

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
            font-medium
            text-slate-500
            sm:text-xs
            md:justify-start
          "
          >
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Local Stores
            </span>

            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
              Nearby Shopping
            </span>

            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
              Secure Checkout
            </span>
          </div>
        </div>

        {/* RIGHT SIDE */}

        <div
          ref={visualRef}
          className="
          relative
          mx-auto
          w-full
          max-w-md
        "
        >
          {/* Main discovery card */}

          <div
            className="
            relative
            overflow-hidden
            rounded-[2rem]
            border
            border-slate-200
            bg-white
            p-6
            shadow-[0_20px_60px_rgba(15,23,42,0.08)]
            sm:p-8
          "
          >
            {/* Top row */}

            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400">
                  Shopping nearby
                </p>

                <h3 className="mt-1 text-xl font-black text-slate-900">
                  Discover local
                </h3>
              </div>

              <div
                className="
                flex
                h-11
                w-11
                items-center
                justify-center
                rounded-2xl
                bg-orange-50
                text-orange-500
              "
              >
                <ShoppingBag size={20} />
              </div>
            </div>

            {/* Location */}

            <div
              className="
              mt-6
              flex
              items-center
              gap-3
              rounded-2xl
              bg-slate-50
              p-4
            "
            >
              <div
                className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-emerald-50
                text-emerald-600
              "
              >
                <MapPin size={18} />
              </div>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Your area
                </p>

                <p className="mt-0.5 text-sm font-bold text-slate-800">
                  Find shops near you
                </p>
              </div>
            </div>

            {/* Mini categories */}

            <div className="mt-5 grid grid-cols-3 gap-3">
              <div className="rounded-2xl bg-emerald-50 p-4 text-center">
                <div className="text-xl">🥦</div>
                <p className="mt-2 text-[11px] font-bold text-slate-700">
                  Fresh
                </p>
              </div>

              <div className="rounded-2xl bg-orange-50 p-4 text-center">
                <div className="text-xl">🛍️</div>
                <p className="mt-2 text-[11px] font-bold text-slate-700">
                  Shopping
                </p>
              </div>

              <div className="rounded-2xl bg-purple-50 p-4 text-center">
                <div className="text-xl">✨</div>
                <p className="mt-2 text-[11px] font-bold text-slate-700">
                  Deals
                </p>
              </div>
            </div>

            {/* Bottom highlight */}

            <div
              className="
              mt-5
              flex
              items-center
              gap-3
              rounded-2xl
              border
              border-orange-100
              bg-orange-50/70
              p-4
            "
            >
              <div
                className="
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-white
                text-orange-500
                shadow-sm
              "
              >
                <Sparkles size={16} />
              </div>

              <div>
                <p className="text-xs font-bold text-slate-800">
                  Great things are closer than you think.
                </p>

                <p className="mt-0.5 text-[10px] text-slate-500">
                  Support local. Shop nearby.
                </p>
              </div>
            </div>
          </div>

          {/* Small floating location pill */}

          <div
            className="
            absolute
            -bottom-4
            -left-3
            flex
            items-center
            gap-2
            rounded-full
            border
            border-slate-200
            bg-white
            px-4
            py-2.5
            text-xs
            font-bold
            text-slate-700
            shadow-lg
            sm:-left-6
          "
          >
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Local & nearby
          </div>

          {/* Small deals pill */}

          <div
            className="
            absolute
            -right-3
            top-8
            flex
            items-center
            gap-2
            rounded-full
            border
            border-orange-100
            bg-white
            px-4
            py-2.5
            text-xs
            font-bold
            text-orange-600
            shadow-lg
            sm:-right-5
          "
          >
            ✨ Fresh deals
          </div>
        </div>
      </div>
    </div>

    {/* Bottom spacing */}

    <div className="h-4 sm:h-8" />
  </section>


  );
};

export default Hero;
