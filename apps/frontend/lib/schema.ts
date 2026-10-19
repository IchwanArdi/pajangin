// Structured data (JSON-LD) untuk halaman utama Pajangin.
// FB: FAQPage — menyalin persis pertanyaan yang tampil di Faq.tsx (via marketing-content).
import { FAQS } from './marketing-content';
import { SITE_DESCRIPTION, SITE_URL } from './seo';

export function homeJsonLd(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        name: 'Pajangin',
        url: SITE_URL,
        logo: `${SITE_URL}/icon.png`,
        description: SITE_DESCRIPTION,
      },
      {
        '@type': 'WebSite',
        name: 'Pajangin',
        url: SITE_URL,
        inLanguage: 'id-ID',
      },
      {
        '@type': 'FAQPage',
        mainEntity: FAQS.map((item) => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.a,
          },
        })),
      },
    ],
  };
}
