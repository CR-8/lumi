import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Load takumi-pdf with Node's resolver: its Node entry reads the WASM from disk,
  // while the bundler entry Turbopack would pick imports `.wasm?module`, which it can't resolve.
  serverExternalPackages: ["takumi-pdf"],
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
