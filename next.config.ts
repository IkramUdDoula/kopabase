import withPWA from 'next-pwa';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  pwa: {
    dest: 'public',
    disable: process.env.NODE_ENV === 'development',
  },
};

const config = withPWA(nextConfig);

config.typescript = {
  ignoreBuildErrors: true,
};
config.eslint = {
  ignoreDuringBuilds: true,
};

export default config;
