import type { NextConfig } from "next";

const apiUrl = new URL(process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api");

const nextConfig: NextConfig = {
  // Self-contained server bundle for the Docker image; Vercel ignores this.
  output: "standalone",
  images: {
    // Community photo uploads are served from the API's /storage path.
    remotePatterns: [
      {
        protocol: apiUrl.protocol.replace(":", "") as "http" | "https",
        hostname: apiUrl.hostname,
        port: apiUrl.port,
        pathname: "/storage/**",
      },
    ],
  },
};

export default nextConfig;
