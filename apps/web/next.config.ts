import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const FRAPPE_URL = process.env.FRAPPE_URL ?? "http://localhost:8080";

const nextConfig: NextConfig = {
  output: "standalone",
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
      {
        source: "/files/:path*",
        destination: `${FRAPPE_URL}/files/:path*`,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
