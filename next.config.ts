import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    if (process.env.NODE_ENV === 'development') {
      return {
        beforeFiles: [
          {
            source: '/api/:path*',
            destination: 'http://127.0.0.1:8080/api/:path*',
          },
        ],
      };
    }
    return [];
  },
};

export default nextConfig;
