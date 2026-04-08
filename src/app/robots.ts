import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/contact", "/privacy", "/terms", "/profile/", "/auth"],
        disallow: ["/admin", "/dashboard", "/api/", "/payment/"],
      },
    ],
    sitemap: "https://www.baddies212.com/sitemap.xml",
  };
}
