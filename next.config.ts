import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prevent webpack from bundling Supabase into server chunks.
  // As external packages, Node.js requires() them at runtime — after
  // instrumentation.ts register() has already patched globalThis.localStorage.
  serverExternalPackages: ["@supabase/supabase-js", "@supabase/auth-js", "@vercel/sandbox"],
};

export default nextConfig;
