import { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { getPublicBusiness, PublicBusinessResponse } from '../../lib/api';
import BusinessClientView from './BusinessClientView';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await getPublicBusiness(slug);
  if (!data) {
    return {
      title: 'Bisnis Tidak Ditemukan | Pajangin',
      description: 'Halaman bisnis lokal tidak ditemukan di Pajangin.',
    };
  }

  const { business } = data;
  const title = business.meta_title || `${business.name} - ${business.tagline || business.category}`;
  const description =
    business.meta_description ||
    business.description ||
    `Halaman bisnis ${business.name} di ${business.city}. Lihat layanan, jam buka, dan hubungi via WhatsApp.`;

  // --- Schema.org LocalBusiness lengkap untuk Google Rich Result ---
  // Gunakan host dari request headers (server-safe), fallback ke env
  const headersList = await headers();
  const host = headersList.get('host') || process.env.NEXT_PUBLIC_APP_URL;
  const protocol = host?.includes('localhost') ? 'http' : 'https';
  const baseUrl = host ? `${protocol}://${host}` : '';

  return {
    title,
    description,
    // Halaman yang belum lengkap tetap bisa dibuka, tapi jangan diindeks Google.
    robots: {
      index: data.complete ?? true,
      follow: true,
    },
    alternates: {
      canonical: `${baseUrl}/${business.slug}`,
    },
    openGraph: {
      title,
      description,
      type: 'website',
      url: `${baseUrl}/${business.slug}`,
      images: business.hero_image_url
        ? [{ url: business.hero_image_url }]
        : business.logo_url
          ? [{ url: business.logo_url }]
          : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: business.hero_image_url
        ? [{ url: business.hero_image_url }]
        : business.logo_url
          ? [{ url: business.logo_url }]
          : undefined,
    },
  };
}

export default async function BusinessPage({ params }: Props) {
  const { slug } = await params;
  const data: PublicBusinessResponse | null = await getPublicBusiness(slug);

  if (!data) {
    notFound();
  }

  const { business, schemaJsonLd } = data;

  return (
    <>
      {/* Schema.org Structured Data for Google Local SEO */}
      {schemaJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaJsonLd).replace(/</g, '\\u003c') }}
        />
      )}
      <BusinessClientView business={business} services={data.services} images={data.images || []} />
    </>
  );
}