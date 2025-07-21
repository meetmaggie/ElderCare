
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    allowedDevOrigins: ['*.replit.dev'],
  },
  async rewrites() {
    return []
  },
}

module.exports = nextConfig
