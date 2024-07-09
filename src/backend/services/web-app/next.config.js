/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    instrumentationHook: true
  },
  output: 'standalone',
  logging: {
    fetches: {
      fullUrl: true
    }
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.buzzfeed.com'
      },
      {
        protocol: 'http',
        hostname: 'localhost'
      },
      {
        protocol: 'http',
        hostname: 'traefik'
      },
      {
        protocol: 'http',
        hostname: 'host.docker.internal'
      }
    ]
  },

  async redirects() {
    return [
      {
        source: '/',
        destination: '/foods',
        permanent: true
      }
    ];
  }
};

module.exports = nextConfig;
