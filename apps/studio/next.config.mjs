/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@framework/blocks", "@framework/patterns"],
  experimental: {
    typedRoutes: false,
  },
};

export default nextConfig;
