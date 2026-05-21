/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Desactivamos strict mode para reducir re-renders en desarrollo y estabilizar HMR
  webpack: (config) => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    return config;
  },
};

export default nextConfig;
