import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // A cached service worker would pin the app to an old build, so this
        // one file is always revalidated. `Service-Worker-Allowed` lets it
        // control every route, not just `/sw.js`'s own folder.
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
    ];
  },
};

export default nextConfig;
