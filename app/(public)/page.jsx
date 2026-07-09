'use client'

import Script from "next/script";
import BestSelling from "@/components/BestSelling";
import Hero from "@/components/Hero";
import LatestProducts from "@/components/LatestProducts";
import Categories from "@/components/Categories";
import RecommendedProducts from "@/components/RecommendedProducts";

export default function Home() {
    return (
        <>
            <Script
                id="organization-jsonld"
                type="application/ld+json"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Organization",
                        name: "Nandurbar Bazar",
                        url: "https://gocart-delta.vercel.app",
                        logo: "https://gocart-delta.vercel.app/icon-192.png",
                        sameAs: [],
                    }),
                }}
            />

            <Hero />
            <BestSelling />
            <RecommendedProducts />
            <Categories />
            <LatestProducts />
        </>
    );
}