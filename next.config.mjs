/** @type {import('next').NextConfig} */

import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  skipWaiting: true
});

const nextConfig = {
  images: {
    unoptimized: true
  }
};

export default withPWA(nextConfig);