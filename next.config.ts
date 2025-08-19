
import type {NextConfig} from 'next';

const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'flagcdn.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api.qrserver.com',
        port: '',
        pathname: '/**',
      }
    ],
  },
  async rewrites() {
    // This is a temporary workaround for a CORS issue in the dev environment.
    // In a real production environment, you would want to configure CORS properly on your server.
    return [
      {
        source: '/api/auth/:path*',
        destination: `https://identitytoolkit.googleapis.com/:path*`,
      },
       {
        source: '/api/firestore/:path*',
        destination: `https://firestore.googleapis.com/:path*`,
      },
    ];
  },
};

export default withPWA(nextConfig);
