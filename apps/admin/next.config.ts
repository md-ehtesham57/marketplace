import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname, "../../"),
  },
  allowedDevOrigins: ["192.168.1.3"],
};

export default nextConfig;