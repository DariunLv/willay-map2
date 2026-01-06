/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['leaflet', 'react-leaflet'],
  images: {
    domains: ['images.unsplash.com', 'lottiefiles.com'],
  },
}

module.exports = nextConfig