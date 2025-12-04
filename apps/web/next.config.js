const { PrismaPlugin } = require('@prisma/nextjs-monorepo-workaround-plugin');

/**
 * @type {import('next').NextConfig}
 */
module.exports = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.plugins = [...config.plugins, new PrismaPlugin()];
    }

    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'static.mercdn.net',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: '**',
        pathname: '/**'
      }
    ]
  }
};
