import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@airplane/shared", "@airplane/supabase"]
};

export default nextConfig;
