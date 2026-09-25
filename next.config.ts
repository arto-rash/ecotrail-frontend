import type { NextConfig } from "next";

const apiUrl = new URL(process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api");

const nextConfig: NextConfig = {
  // Self-contained server bundle for the Docker image; Vercel ignores this.
  output: "standalone",
  images: {
    // Wikimedia rate-limits bursts; cache optimized photos for 30 days so each is fetched once.
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [
      // Community photo uploads are served from the API's /storage path.
      {
        protocol: apiUrl.protocol.replace(":", "") as "http" | "https",
        hostname: apiUrl.hostname,
        port: apiUrl.port,
        pathname: "/storage/**",
      },
      // Place photos from Wikimedia Commons.
      { protocol: "https", hostname: "upload.wikimedia.org", pathname: "/wikipedia/commons/**" },
      { protocol: "https", hostname: "thumb.wikimedia.org", pathname: "/wikipedia/commons/**" },
    ],
  },
};

export default nextConfig;
