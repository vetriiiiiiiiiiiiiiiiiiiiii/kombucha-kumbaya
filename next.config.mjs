/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  // three / drei ship untranspiled ESM helpers
  transpilePackages: ['three'],
};

export default nextConfig;
