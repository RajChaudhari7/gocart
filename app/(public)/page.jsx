'use client'
import BestSelling from "@/components/BestSelling";
import Hero from "@/components/Hero";
// import OurSpecs from "@/components/OurSpec";
import LatestProducts from "@/components/LatestProducts";
import Categories from "@/components/Categories";

export default function Home() {
    return (
        <div>
            <Hero />
            <BestSelling />
            <Categories />
            <LatestProducts />
            {/* <OurSpecs /> */}
        </div>
    );
}
