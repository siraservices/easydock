import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://easydock.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/search", "/marinas/", "/blog/", "/pricing", "/about", "/calculator", "/claim", "/privacy", "/terms"],
        disallow: [
          "/admin",
          "/dashboard",
          "/bookings",
          "/auth",
          "/api/",
          "/login",
          "/signup",
          "/forgot-password",
          "/reset-password",
          "/slips/",
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
