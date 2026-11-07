import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {},
  output: process.env.VERCEL ? undefined : "export",
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
