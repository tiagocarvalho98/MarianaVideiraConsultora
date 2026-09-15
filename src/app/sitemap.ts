import type { MetadataRoute } from "next";
import { brand } from "@/config/brand";

const routes = ["/", "/vender", "/comprar", "/sobre", "/contacto", "/privacidade", "/cookies"] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: `${brand.siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "/" ? "weekly" : "monthly",
    priority: route === "/" ? 1 : 0.7,
  }));
}
