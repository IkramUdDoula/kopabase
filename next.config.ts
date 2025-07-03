import withPWA from 'next-pwa';
import type { NextConfig } from 'next';

const pwaConfig = {
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
};

const withPwaConfig = withPWA({
  pwa: pwaConfig,
});

withPwaConfig.images = {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'placehold.co',
      port: '',
      pathname: '/**',
    },
  ],
};
withPwaConfig.typescript = {
  ignoreBuildErrors: true,
};
withPwaConfig.eslint = {
  ignoreDuringBuilds: true,
};

export default withPwaConfig;
