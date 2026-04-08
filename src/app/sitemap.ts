import { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

const BASE_URL = "https://www.baddies212.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // --- Static public pages ---
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/auth`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  // --- Dynamic profile pages (active & subscribed escorts) ---
  let profilePages: MetadataRoute.Sitemap = [];

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!
    );

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, created_at")
      .eq("status", "active")
      .eq("is_subscribed", true);

    if (profiles) {
      profilePages = profiles.map((profile) => ({
        url: `${BASE_URL}/profile/${profile.id}`,
        lastModified: new Date(profile.created_at),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      }));
    }
  } catch (err) {
    console.error("Sitemap profile fetch error:", err);
  }

  return [...staticPages, ...profilePages];
}
