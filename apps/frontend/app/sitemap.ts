import type { MetadataRoute } from 'next';

export const revalidate = 3600;

function baseUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/+$/, '');
}

function apiUrl(): string {
  return (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace(/\/+$/, '');
}

interface SitemapBusiness {
  slug: string;
  updated_at: string;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = baseUrl();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/pricing`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/contoh`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
  ];

  let businesses: SitemapBusiness[] = [];
  try {
    const res = await fetch(`${apiUrl()}/api/v1/public/businesses/sitemap`, {
      next: { revalidate: 3600 },
    });
    if (res.ok) businesses = (await res.json()) as SitemapBusiness[];
  } catch {
    // Sitemap tetap valid walau backend sedang tidak bisa dihubungi.
  }

  return [
    ...staticRoutes,
    ...businesses.map((business) => ({
      url: `${base}/${business.slug}`,
      lastModified: business.updated_at ? new Date(business.updated_at) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
  ];
}
