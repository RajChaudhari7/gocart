/** @type {import('next').NextConfig} */

import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

const nextConfig = {
  images: {
    unoptimized: true,
  },

  async redirects() {
    return [
      {
        source: "/store",
        destination: "/store/",
        permanent: false,
      },
    ];
  },
};

export default withPWA(nextConfig);