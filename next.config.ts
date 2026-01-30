import type { NextConfig } from "next";

const nextConfig: NextConfig = {

  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  devIndicators: {
    appIsrStatus: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'footballmonk.in',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      }
    ],
  },
};

export default nextConfig;
