import withPWA from 'next-pwa';
import type { NextConfig } from 'next';

const baseConfig: NextConfig = {
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
};

const pwaConfig = {
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
};

const nextConfig = withPWA({
  ...baseConfig,
  pwa: pwaConfig,
});

nextConfig.typescript = {
  ignoreBuildErrors: true,
};
nextConfig.eslint = {
  ignoreDuringBuilds: true,
};

export default nextConfig;
