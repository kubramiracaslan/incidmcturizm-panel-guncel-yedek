import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Pins the workspace root to this project so Turbopack doesn't try to
  // infer it from an unrelated package-lock.json higher up the tree.
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
