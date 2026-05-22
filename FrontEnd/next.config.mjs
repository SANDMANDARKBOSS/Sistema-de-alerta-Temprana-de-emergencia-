/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,

  // NO usar standalone — Express usa la librería `next` directamente
  // que lee el .next/ generado por `next build` (igual que `next start`)
  // output: 'standalone',  ← desactivado

  compress: true,

  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 3600,
    deviceSizes: [640, 1080, 1920],
  },

  swcMinify: true,

  // NEXT_PUBLIC_API_URL se inyecta desde las env vars de Render en build time
  // En producción apunta al mismo dominio (un solo servicio)
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
  },

  async headers() {
    return [
      {
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },

  webpack: (config, { isServer }) => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        moduleIds: 'deterministic',
      };
    }
    return config;
  },
};

export default nextConfig;
