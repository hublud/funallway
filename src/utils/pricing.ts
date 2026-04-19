import { createClient } from "@/utils/supabase/client";

export interface PlatformSettings {
  weekly_sub_price: number;
  monthly_sub_price: number;
  connection_fee: number;
  header_ad_url?: string;
  header_ad_caption?: string;
  footer_ad_url?: string;
  footer_ad_caption?: string;
}

export const DEFAULT_SETTINGS: PlatformSettings = {
  weekly_sub_price: 15000,
  monthly_sub_price: 45000,
  connection_fee: 5000,
  header_ad_url: "/images/advertisement-fun.jpg",
  header_ad_caption: "Place Your Adverts Here",
  footer_ad_url: "/images/bottom-banner.jpg",
  footer_ad_caption: "Place Your Adverts Here"
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
      .select("weekly_sub_price, monthly_sub_price, connection_fee, header_ad_url, header_ad_caption, footer_ad_url, footer_ad_caption")
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
