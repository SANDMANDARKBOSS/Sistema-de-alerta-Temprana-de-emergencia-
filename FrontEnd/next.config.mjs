/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Desactivamos el cache persistente de webpack si detectamos inestabilidad en Windows
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Forzamos a webpack a no cachear módulos que causan el error ./682.js
      config.cache = false;
    }
    return config;
  },
  // Optimización de fuentes para evitar errores de hidratación
  optimizeFonts: true,
};

export default nextConfig;
