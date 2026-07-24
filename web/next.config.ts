import type { NextConfig } from "next";

const BACKEND_URL = process.env.AMBS_BACKEND_URL ?? "http://localhost:3001";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.101.252"],
  turbopack: {
    root: __dirname,
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
