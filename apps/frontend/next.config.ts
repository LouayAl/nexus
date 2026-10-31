// Nexus/apps/frontend/next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    const scriptSources = process.env.NODE_ENV === "production"
      ? "'self' 'unsafe-inline'"
      : "'self' 'unsafe-inline' 'unsafe-eval'";

    return [{
      source: "/:path*",
      headers: [
        {
          key: "Content-Security-Policy",
          // Next.js emits inline hydration scripts. External script hosts are
          // deliberately excluded; adding analytics requires a security review.
          value: `script-src ${scriptSources}; object-src 'none'; base-uri 'self'; frame-ancestors 'none'`,
        },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      ],
    }];
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:3001/api/:path*",
      },
    ];
  },
  
};

export default nextConfig;
