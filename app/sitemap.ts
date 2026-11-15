import type { MetadataRoute } from "next";
import { getAllLabArticles } from "@/lib/lab/catalog";
import { getAllComponentMeta } from "@/lib/registry/catalog";
import { siteUrl } from "@/lib/site";

function absolute(path: string) {
  return new URL(path, siteUrl).toString();
}

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: absolute("/"), lastModified, changeFrequency: "weekly", priority: 1 },
    {
      url: absolute("/components"),
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: absolute("/lab"),
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: absolute("/docs"),
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: absolute("/legal"),
      lastModified,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  const componentRoutes: MetadataRoute.Sitemap = getAllComponentMeta().map(
    (meta) => ({
      url: absolute(`/components/${meta.slug}`),
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    }),
  );

  const labRoutes: MetadataRoute.Sitemap = getAllLabArticles().map(
    (article) => ({
      url: absolute(`/lab/${article.slug}`),
      lastModified,
      changeFrequency: "monthly",
      priority: 0.6,
    }),
  );

  return [...staticRoutes, ...componentRoutes, ...labRoutes];
}
