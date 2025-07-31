
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return []
  },
  // Ensure the dev server binds to all interfaces
  experimental: {
    serverActions: {
      allowedOrigins: ['*']
    }
  }
}

module.exports = nextConfig
