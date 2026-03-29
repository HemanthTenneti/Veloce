import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  output: "standalone",
  
  // Enable compression for faster transfers
  compress: true,
  
  // Optimize images
  images: {
    // Allow local images from public/media folder
    remotePatterns: [],
    // Use modern formats for smaller file sizes
    formats: ['image/avif', 'image/webp'],
    // Minimize layout shift with device sizes
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // Experimental performance optimizations
  experimental: {
    // Optimize package imports for faster builds
    optimizePackageImports: ['gsap', '@iconify/react', 'react-icons'],
  },
};

export default withNextIntl(nextConfig);
