import { resolve } from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingRoot: resolve(__dirname),
};

export default nextConfig;
