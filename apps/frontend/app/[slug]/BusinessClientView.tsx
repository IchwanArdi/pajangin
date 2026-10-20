'use client';

import type { Business, BusinessImageItem, Service } from '../../lib/api';
import { getTemplateConfig } from '../../lib/templates';
import Tracker, { trackBusinessEvent } from '../../components/Tracker';
import {
  bookingHeadingFor,
  buildBookingLink,
  buildConsultationLink,
  buildWhatsAppLink,
  galleryHeadingFor,
  getOpenStatus,
  parseFaq,
  parseTestimonials,
  primaryCtaLabelFor,
  serviceCtaLabelFor,
  serviceHeadingFor,
  stickyCtaLabelFor,
} from '../../lib/business-page';
import { accentVars, normalizeAccent } from '../../lib/site-accent';
import SiteHeader, { type NavItem } from '../../components/site/SiteHeader';
import SiteHero from '../../components/site/SiteHero';
import ServicesSection from '../../components/site/ServicesSection';
import GallerySection from '../../components/site/GallerySection';
import { AboutSection, FaqSection, LocationSection, TestimonialsSection } from '../../components/site/InfoSections';
import BookingSection from '../../components/site/BookingSection';
import ContactSection from '../../components/site/ContactSection';
import SiteFooter from '../../components/site/SiteFooter';
import StickyCta from '../../components/site/StickyCta';

interface Props {
  business: Business;
  services: Service[];
  images?: BusinessImageItem[];
}

export default function BusinessClientView({ business, services, images = [] }: Props) {
  const template = getTemplateConfig(business.template);
  const accent = normalizeAccent(business.theme_color, business.template);

  const serviceHeading = serviceHeadingFor(business.template);
  const galleryHeading = galleryHeadingFor(business.template);
  const openStatus = getOpenStatus(business.opening_hours);
  const faqItems = parseFaq(business.faq);
  const testimonials = parseTestimonials(business.testimonials);

  const bookingAvailable = business.booking_enabled && services.length > 0;

  const waLink = buildWhatsAppLink(business);
  const emergencyWaLink = buildWhatsAppLink(business, { actionType: 'emergency' });

  const navItems: NavItem[] = [
    ...(services.length > 0 ? [{ id: 'layanan', label: serviceHeading.title.split('&')[0].trim() }] : []),
    ...(images.length > 0 ? [{ id: 'galeri', label: 'Galeri' }] : []),
    ...(bookingAvailable ? [{ id: 'booking', label: 'Booking' }] : []),
    { id: 'tentang', label: 'Tentang' },
    ...(faqItems.length > 0 ? [{ id: 'faq', label: 'FAQ' }] : []),
    { id: 'lokasi', label: 'Lokasi' },
  ];

  // urutan seksi yang benar-benar tampil → latar berselang-seling tetap rapi
  // walau ada seksi opsional (galeri/testimoni/faq/booking) yang tidak muncul
  const flow = [
    ...(services.length > 0 ? ['layanan'] : []),
    ...(images.length > 0 ? ['galeri'] : []),
    'tentang',
    ...(testimonials.length > 0 ? ['testimoni'] : []),
    ...(faqItems.length > 0 ? ['faq'] : []),
    'lokasi',
    ...(bookingAvailable ? ['booking'] : []),
    'kontak',
  ];
  const toneFor = (key: string) => (flow.indexOf(key) % 2 === 0 ? ('soft' as const) : ('plain' as const));

  const handleServiceClick = (service: Service) => {
    trackBusinessEvent(business.id, 'service_view', service.id, service.name);
  };

  const handleWhatsAppClick = (serviceId?: string, serviceName?: string) => {
    trackBusinessEvent(business.id, 'whatsapp_click', serviceId || 'general_cta', serviceName || 'CTA Utama');
  };

  const handlePhoneClick = () => {
    trackBusinessEvent(business.id, 'phone_click', 'phone_call', business.phone || '');
  };

  return (
    <div className="min-h-screen bg-paper pb-24 text-ink md:pb-12" style={accentVars(accent)}>
      <Tracker businessId={business.id} slug={business.slug} />

      <SiteHeader
        business={business}
        navItems={navItems}
        waLink={waLink}
        onWhatsAppClick={() => handleWhatsAppClick()}
        onPhoneClick={handlePhoneClick}
      />

      <main>
        <SiteHero
          business={business}
          template={template}
          openStatus={openStatus}
          primaryCtaLabel={primaryCtaLabelFor(business.template)}
          waLink={waLink}
          emergencyWaLink={emergencyWaLink}
          images={images}
          serviceCount={services.length}
          onWhatsAppClick={handleWhatsAppClick}
          onPhoneClick={handlePhoneClick}
        />

        {services.length > 0 && (
          <ServicesSection
            services={services}
            heading={serviceHeading}
            layout={template.servicesLayout}
            ctaLabel={serviceCtaLabelFor(business.template)}
            buildWaLink={(serviceName) => buildWhatsAppLink(business, { serviceName })}
            onServiceClick={handleServiceClick}
            onWhatsAppClick={handleWhatsAppClick}
            tone={toneFor('layanan')}
          />
        )}

        {images.length > 0 && <GallerySection images={images} heading={galleryHeading} tone={toneFor('galeri')} />}

        <AboutSection business={business} tone={toneFor('tentang')} />

        <TestimonialsSection
          testimonials={testimonials}
          rating={business.rating}
          reviewCount={business.review_count}
        />

        <FaqSection items={faqItems} tone={toneFor('faq')} />

        <LocationSection
          business={business}
          waLink={waLink}
          onWhatsAppClick={handleWhatsAppClick}
          tone={toneFor('lokasi')}
        />

        {bookingAvailable && (
          <BookingSection
            business={business}
            services={services}
            heading={bookingHeadingFor(business.template)}
            buildBookingLink={(draft) => buildBookingLink(business, draft)}
            tone={toneFor('booking')}
          />
        )}

        <ContactSection
          business={business}
          buildConsultationLink={(name, phone, need) => buildConsultationLink(business, name, phone, need)}
          tone={toneFor('kontak')}
        />
      </main>

      <SiteFooter
        business={business}
        waLink={waLink}
        onWhatsAppClick={() => handleWhatsAppClick()}
        onPhoneClick={handlePhoneClick}
      />

      {business.whatsapp && (
        <StickyCta
          label={stickyCtaLabelFor(business.template)}
          waLink={waLink}
          phone={business.phone}
          onWhatsAppClick={() => handleWhatsAppClick()}
          onPhoneClick={handlePhoneClick}
        />
      )}
    </div>
  );
}
