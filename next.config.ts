const withPWA = require('next-pwa');

const nextConfig = withPWA({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
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
