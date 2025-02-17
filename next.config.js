/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["@prisma/extension-accelerate"],
  },
};

module.exports = nextConfig;
