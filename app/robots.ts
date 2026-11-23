import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXTAUTH_URL ||
    "https://perpustakaan.smknegeri1beringin.sch.id";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/buku/", "/kartu", "/kiosk"],
        disallow: [
          "/admin",
          "/admin/",
          "/api/",
          "/login",
          "/switch-demo",
          "/upload-audio",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
