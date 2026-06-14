import { createClient } from "@supabase/supabase-js";
import { requireEnv } from "./env";

export function createBrowserClient() {
  return createClient(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY")
  );
}
