import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimisation des images Next.js
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.s3.eu-west-3.amazonaws.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.s3.amazonaws.com',
        pathname: '/**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
  },

  // Compression automatique
  compress: true,

  // Headers de sécurité
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
        ],
      },
    ];
  },

  // Optimisations expérimentales
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
};

export default nextConfig;
