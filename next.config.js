
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return []
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['*']
    },
    esmExternals: 'loose'
  },
  allowedDevOrigins: ['*'],
  webpack: (config, { isServer }) => {
    config.externals = config.externals || []
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
    }
    // Fix for clientReferenceManifest error
    config.module = config.module || {}
    config.module.rules = config.module.rules || []
    return config
  },
  transpilePackages: ['ws', 'node-fetch'],
  outputFileTracing: false
}

module.exports = nextConfig
