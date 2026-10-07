import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // This site has no request-time routes. Export it as static HTML so hosts
  // such as Vercel can serve vinext's client output without expecting a
  // Next.js `.next` build directory.
  output: "export",
};

export default nextConfig;
