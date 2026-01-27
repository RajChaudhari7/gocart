/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'ik.imagekit.io',      // ImageKit (products, reviews)
      'images.clerk.dev',    // Clerk user avatars
    ],
  },
};

export default nextConfig;
