import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  adapterPath: path.join(
    process.cwd(),
    "node_modules/@next-community/adapter-vercel/dist/index.js"
  ),
};

export default nextConfig;
