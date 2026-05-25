/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  distDir: '.next-local',
  images: {
    domains: ['images.unsplash.com', 'prod.flowcvassets.com', 'assets.flowcvassets.com'],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Only puppeteer must be external — next-auth MUST be bundled by webpack in Next.js 14
      config.externals = [...(config.externals || []), 'puppeteer', 'puppeteer-core'];
    }
    return config;
  },
}

module.exports = nextConfig
