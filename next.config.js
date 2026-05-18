/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['images.unsplash.com', 'prod.flowcvassets.com', 'assets.flowcvassets.com'],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [...(config.externals || []), 'next-auth', '@next-auth/prisma-adapter', '@prisma/client'];
    }
    return config;
  },
}

module.exports = nextConfig
