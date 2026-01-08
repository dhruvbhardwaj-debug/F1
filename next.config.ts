import { webpack } from "next/dist/compiled/webpack/webpack";
import { config } from "zod/v4/core";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "utfs.io",
      },
      {
        protocol: "https",
        hostname: "ufs.sh",
      },
      {
        protocol: "https",
        hostname: "uploadthing.com",
      },
      {
        protocol: "https",
        hostname: "**.ufs.sh", // Matches your specific subdomain ykuzzix508.ufs.sh
      },
    ],
  },
};

export default nextConfig;