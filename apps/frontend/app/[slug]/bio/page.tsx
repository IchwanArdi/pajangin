import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPublicBusiness } from '../../../lib/api';
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

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'profile',
      images: business.logo_url ? [{ url: business.logo_url }] : undefined,
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
