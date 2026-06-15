import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  experimental: {
    cacheComponents: true,
  },
  turbopack: {
    root: path.resolve("."),
  },
};

export default nextConfig;
