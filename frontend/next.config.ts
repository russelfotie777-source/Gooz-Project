import type { NextConfig } from "next";

// Derived from the same env var lib/api.ts uses (NEXT_PUBLIC_API_URL) so
// next/image is allowed to optimize product/banner/category/brand photos
// served from the Laravel backend, wherever that ends up being deployed.
const apiOrigin = new URL(
  (process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8001/api/v1").replace(/\/api\/v1\/?$/, "")
);

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: apiOrigin.protocol.replace(":", "") as "http" | "https",
        hostname: apiOrigin.hostname,
        port: apiOrigin.port,
        pathname: "/storage/**",
      },
      // backend/.env's APP_URL (what image_url/image/logo are actually
      // built from server-side) is "http://localhost" with no port, which
      // doesn't match the 127.0.0.1:8001 dev API origin above — covering
      // both until that mismatch is reconciled.
      {
        protocol: "http",
        hostname: "localhost",
        pathname: "/storage/**",
      },
    ],
  },
  // Smaller, self-contained output for a containerized deploy — no effect
  // on `next dev`/`next start`.
  output: "standalone",
};

export default nextConfig;
