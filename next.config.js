/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverExternalPackages: ["@prisma/extension-accelerate"],
  },
};

module.exports = nextConfig;
