
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
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

export default nextConfig;
