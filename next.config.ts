import type { NextConfig } from 'next';

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    appDir: true,
  },
} satisfies NextConfig;

export default nextConfig;
