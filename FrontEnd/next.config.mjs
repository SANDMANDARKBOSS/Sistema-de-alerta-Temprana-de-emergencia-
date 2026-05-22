/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Desactivamos strict mode para reducir re-renders en desarrollo y estabilizar HMR
  
  // Salida standalone para VPS de bajos recursos (menor footprint en disco y memoria)
  output: 'standalone',

  // Compresion gzip habilitada para reducir bytes transferidos
  compress: true,

  // Optimizacion de imagenes con calidad reducida para VPS
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 3600,
    deviceSizes: [640, 1080, 1920],
  },

  // Minificacion con SWC (mas rapido que Terser, sin consumir tanta RAM)
  swcMinify: true,

  // Headers de cache agresivo para assets estaticos
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

    // Reducir tamano del bundle en cliente
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
