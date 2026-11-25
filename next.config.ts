import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Trang giới thiệu tĩnh ở "/", app demo nằm ở "/demo".
  async rewrites() {
    return { beforeFiles: [{ source: "/", destination: "/index.html" }] };
  },
};

export default nextConfig;
