import type { NextConfig } from "next";

const FRAPPE_URL = process.env.FRAPPE_URL ?? "http://localhost:8080";

const nextConfig: NextConfig = {
  transpilePackages: ["@veloce/shared"],
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8080",
        pathname: "/**",
      },
    ],
  },
  async rewrites() {
    return [
      // Proxy Frappe file paths so next/image can optimise them as local assets
      {
        source: "/files/:path*",
        destination: `${FRAPPE_URL}/files/:path*`,
      },
    ];
  },
};

export default nextConfig;
