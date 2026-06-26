import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/sites/"],
      disallow: ["/dashboard", "/territory", "/deploy", "/arm-links", "/asset", "/login"],
    },
    sitemap: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/sitemap.xml`,
  };
}
