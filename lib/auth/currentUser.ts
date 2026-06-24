import { createSSRServerClient } from "@/lib/supabase/ssrServer";

export async function getCurrentUserId(): Promise<string | null> {
  const supabase = await createSSRServerClient();
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}
