import { createClient } from "@supabase/supabase-js";
import { requireEnv } from "./env";

export function createServerClient() {
  return createClient(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
        // Provide an in-memory storage so Supabase never touches Node's globalThis.localStorage
        storage: {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        },
      },
    }
  );
}
