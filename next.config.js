/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Allow leaflet images if needed
  images: {
    domains: ["images.unsplash.com", "unpkg.com"],
  },
};

module.exports = nextConfig;
