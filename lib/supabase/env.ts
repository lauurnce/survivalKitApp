/**
 * Read a required environment variable, failing loudly with the variable's
 * name instead of Supabase's cryptic "supabaseUrl is required" error. Makes a
 * missing/misnamed Vercel env var obvious in the logs.
 */
export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. ` +
        `Set it in your Vercel project settings (and .env.local for local dev).`
    );
  }
  return value;
}
