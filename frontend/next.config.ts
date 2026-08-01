import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  output: "standalone",
  distDir: isDev ? "/tmp/next-build-air" : ".next",
};

export default nextConfig;
