/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['images.unsplash.com', 'prod.flowcvassets.com', 'assets.flowcvassets.com'],
  },
  // Puppeteer must run server-side only
  serverExternalPackages: ['puppeteer', 'puppeteer-core'],
}

module.exports = nextConfig
