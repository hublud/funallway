import { createClient } from "@/utils/supabase/client";

export interface PlatformSettings {
  weekly_sub_price: number;
  monthly_sub_price: number;
  connection_fee: number;
}

export const DEFAULT_SETTINGS: PlatformSettings = {
  weekly_sub_price: 15000,
  monthly_sub_price: 45000,
  connection_fee: 5000
};

/**
 * Fetches the current platform settings from the database.
 * If fetching fails, returns the default fallback settings.
 */
export async function getPlatformSettings(): Promise<PlatformSettings> {
  const supabase = createClient();
  
  try {
    const { data, error } = await supabase
      .from("platform_settings")
      .select("weekly_sub_price, monthly_sub_price, connection_fee")
      .eq("id", "global")
      .single();

    if (error || !data) {
      console.warn("Failed to fetch platform settings, using defaults:", error?.message);
      return DEFAULT_SETTINGS;
    }

    return data as PlatformSettings;
  } catch (err) {
    console.error("Error fetching platform settings:", err);
    return DEFAULT_SETTINGS;
  }
}
