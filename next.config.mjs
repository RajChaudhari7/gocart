/** @type {import('next').NextConfig} */
import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  skipWaiting: true,
  // CRITICAL: Disable PWA caching during local development 
  // so you can actually see your code changes when you refresh!
  disable: process.env.NODE_ENV === "development",
});

const nextConfig = {
  images: {
    // We removed `unoptimized: true` because you want Next.js to compress 
    // your product images for faster loading. 
    // Instead, whitelist the domains your images come from below:
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      // If your user avatars or product images come from other places,
      // add them here. For example:
      // { protocol: "https", hostname: "res.cloudinary.com" },
      // { protocol: "https", hostname: "img.clerk.com" },
    ],
  },
};

export default withPWA(nextConfig);