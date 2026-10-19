import { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { getPublicBusiness } from '../../../lib/api';
import { DEFAULT_OG_IMAGE } from '../../../lib/seo';
import BioClientView from './BioClientView';

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
      description: 'Halaman Link in Bio tidak ditemukan di Pajangin.',
    };
  }

  const { business } = data;
  const title = `${business.name} | Link in Bio`;
  const description =
    business.tagline ||
    business.description ||
    `Kumpulan link dan kontak langsung ${business.name} di ${business.city}.`;

  const headersList = await headers();
  const host = headersList.get('host') || process.env.NEXT_PUBLIC_APP_URL;
  const protocol = host?.includes('localhost') ? 'http' : 'https';
  const baseUrl = host ? `${protocol}://${host}` : '';

  return {
    title,
    description,
    // Ini tampilan alternatif dari halaman bisnis utama — konsolidasikan sinyal
    // SEO ke halaman utama (tempat LocalBusiness schema berada) agar tidak duplikat.
    alternates: {
      canonical: `${baseUrl}/${business.slug}`,
    },
    openGraph: {
      title,
      description,
      type: 'profile',
      url: `${baseUrl}/${business.slug}/bio`,
      images: business.logo_url ? [{ url: business.logo_url }] : DEFAULT_OG_IMAGE,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: business.logo_url ? [{ url: business.logo_url }] : DEFAULT_OG_IMAGE,
    },
  };
}

export default async function BioPage({ params }: Props) {
  const { slug } = await params;
  const data = await getPublicBusiness(slug);

  if (!data) {
    notFound();
  }

  return (
    <BioClientView
      business={data.business}
      services={data.services}
    />
  );
}
