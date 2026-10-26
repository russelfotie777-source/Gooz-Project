import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Smaller, self-contained output for a containerized deploy — see
  // frontend/next.config.ts for the same setting on the customer app.
  output: "standalone",
};

export default nextConfig;
