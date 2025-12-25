/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Disabled to prevent double-mounting during development
  typescript: {
    tsconfigPath: './tsconfig.json'
  }
};

module.exports = nextConfig;
