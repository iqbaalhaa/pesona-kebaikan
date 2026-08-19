import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export const revalidate = 3600;

const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://pesonakebaikan.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [campaigns, fundraisers, blogs, categories] = await Promise.all([
    prisma.campaign.findMany({
      where: { status: "ACTIVE" },
      select: { slug: true, id: true, updatedAt: true },
    }),
    prisma.fundraiser.findMany({
      where: { campaign: { status: "ACTIVE" } },
      select: { slug: true, updatedAt: true },
    }),
    prisma.blog.findMany({
      select: { id: true, slug: true, updatedAt: true },
    }),
    prisma.campaignCategory.findMany({
      where: { isActive: true },
      select: { slug: true, id: true },
    }),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/donasi`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/kategori`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/galang-dana`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/galang-dana/panduan`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/galang-dana/kategori`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/panduan-fundraiser`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ];

  const campaignRoutes: MetadataRoute.Sitemap = campaigns.map((c) => ({
    url: `${BASE_URL}/donasi/${c.slug || c.id}`,
    lastModified: c.updatedAt,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  const fundraiserRoutes: MetadataRoute.Sitemap = fundraisers
    .filter((f) => f.slug)
    .map((f) => ({
      url: `${BASE_URL}/donasi/fundraiser/${f.slug}`,
      lastModified: f.updatedAt,
      changeFrequency: "daily" as const,
      priority: 0.7,
    }));

  const blogRoutes: MetadataRoute.Sitemap = blogs.map((b) => ({
    url: `${BASE_URL}/blog/${b.slug || b.id}`,
    lastModified: b.updatedAt,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const categoryRoutes: MetadataRoute.Sitemap = categories
    .filter((c) => c.slug)
    .map((c) => ({
      url: `${BASE_URL}/kategori/${c.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));

  return [
    ...staticRoutes,
    ...campaignRoutes,
    ...fundraiserRoutes,
    ...blogRoutes,
    ...categoryRoutes,
  ];
}
