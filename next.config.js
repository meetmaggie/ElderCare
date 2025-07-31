
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
    },
    allowedDevOrigins: ['*']
  },
  // Configure server to accept external connections
  server: {
    host: '0.0.0.0'
  }
}

module.exports = nextConfig
