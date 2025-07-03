const withPWA = require('next-pwa');

const pwaOptions = {
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
};

const nextConfig = withPWA({
  pwa: pwaOptions,
});

nextConfig.images = {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'placehold.co',
      port: '',
      pathname: '/**',
    },
  ],
};
nextConfig.typescript = {
  ignoreBuildErrors: true,
};
nextConfig.eslint = {
  ignoreDuringBuilds: true,
};

module.exports = nextConfig;
