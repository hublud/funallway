import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

export const createClient = () => {
  if (!supabaseUrl || !supabaseKey) {
    // Return a dummy client during build if variables are missing
    // to prevent the build from crashing.
    return createBrowserClient(
      "https://placeholder-url.supabase.co",
      "placeholder-key"
    );
  }
  return createBrowserClient(supabaseUrl, supabaseKey);
};
