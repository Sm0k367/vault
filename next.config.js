/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  // Configured specifically for https://github.com/Sm0k367/vault
  basePath: '/vault',
  assetPrefix: '/vault/',
  images: {
    unoptimized: true,
  },
  transpilePackages: ['three', '@react-three/fiber', '@react-three/drei'],
};

module.exports = nextConfig;
