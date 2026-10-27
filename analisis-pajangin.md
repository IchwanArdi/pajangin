# 🔍 Analisis Pajangin — Apa yang Kurang & Bagaimana Memperbaikinya

## Status Proyek Saat Ini

**Tech Stack:** Next.js 16 + NestJS + Prisma + Supabase Auth + Tailwind v4 + shadcn/ui  
**Target:** Pebisnis lokal Indonesia (bengkel, makanan, salon, dll) yang ingin punya halaman online + terlihat di Google

### Fitur yang Sudah Ada
| Fitur | Status |
|---|---|
| Auth (login dengan Google OAuth) | ✅ Ada |
| Onboarding wizard (2 langkah) | ✅ Ada |
| Dashboard ringkasan (KPI, tren, funnel, sumber traffic) | ✅ Ada |
| Kelola layanan/produk (CRUD, reorder, gambar, harga) | ✅ Ada |
| Profil bisnis (SEO, testimonial, logo, hero image) | ✅ Ada |
| Halaman publik bisnis (`/[slug]`) + Schema.org JSON-LD | ✅ Ada |
| Analytics event tracking (page view, WA click, phone click) | ✅ Ada |
| Lead capture form | ✅ Ada |
| Landing page marketing | ✅ Ada |
| Multi-bisnis per akun | ✅ Ada |

---

## 🚨 Yang KRITIS Kurang (Harus Ditambahkan)

### 1. Template/Tema Website untuk Klien — **PRIORITAS #1**

**Masalah:** Semua bisnis mendapat tampilan yang SAMA. Bengkel dan restoran terlihat identik.

**Solusi:**
- Buat minimal **5-8 template** yang disesuaikan per kategori bisnis:
  - 🍜 **Makanan/Restoran** — hero besar dengan foto menu, menu grid, jam buka prominent
  - 🔧 **Bengkel/Jasa** — daftar layanan + harga, before/after gallery, area layanan
  - 💇 **Salon/Kecantikan** — portfolio galeri, booking, harga paket
  - 🏪 **Toko Retail** — katalog produk grid, promo banner
  - 🏠 **Properti/Kontrakan** — gallery listing, peta lokasi, ketersediaan
  - 📚 **Kursus/Les** — jadwal, program, testimoni murid
  - 🏥 **Klinik/Kesehatan** — jadwal dokter, layanan, booking appointment

**Database:** Tambah field `template` di model `Business`:
```prisma
model Business {
  // ... existing fields
  template    String   @default("default")  // "restaurant", "workshop", "salon", dll
  themeColor  String?  @map("theme_color")  // hex warna aksen pilihan klien
}
```

**Impact:** Ini yang membuat pebisnis mau bayar. Tanpa ini, halaman publik terasa "generik" dan klien malu share ke pelanggan.

---

### 2. Galeri Foto/Media Manager — **PRIORITAS #2**

**Masalah:** Saat ini hanya ada logo + hero image. Untuk bisnis makanan, bengkel, salon — FOTO adalah segalanya.

**Solusi:**
```prisma
model BusinessImage {
  id          String   @id @default(uuid()) @db.Uuid
  businessId  String   @map("business_id") @db.Uuid
  url         String
  caption     String?
  category    String?  // "menu", "portfolio", "before-after", "interior"
  orderIndex  Int      @default(0) @map("order_index")
  createdAt   DateTime @default(now()) @map("created_at")
  business    Business @relation(fields: [businessId], references: [id], onDelete: Cascade)
  
  @@index([businessId, orderIndex])
  @@map("business_images")
}
```

**Di Dashboard:** Drag-and-drop image gallery manager  
**Di Halaman Publik:** Lightbox gallery yang teroptimasi

---

### 3. Custom Domain / Subdomain — **PRIORITAS #3**

**Masalah:** URL saat ini `pajangin.web.id/bengkel-jaya`. Pebisnis yang serius mau `bengkeljaya.com` atau `bengkeljaya.pajangin.web.id`.

**Solusi (2 tahap):**
1. **Tahap 1:** Subdomain otomatis → `bengkeljaya.pajangin.web.id`
2. **Tahap 2:** Custom domain → `bengkeljaya.com` (perlu Vercel/Caddy reverse proxy)

```prisma
model Business {
  // ... existing
  customDomain  String?  @unique @map("custom_domain")
  subdomain     String?  @unique  // auto-generated dari slug
}
```

---

### 4. Sistem Booking/Appointment — **PRIORITAS #4**

**Masalah:** Ada field `booking_enabled` di schema tapi **tidak ada fitur booking yang terbangun**. Ini fitur "dummy".

**Solusi:**
```prisma
model Booking {
  id          String        @id @default(uuid()) @db.Uuid
  businessId  String        @map("business_id") @db.Uuid
  serviceId   String?       @map("service_id") @db.Uuid
  name        String
  phone       String
  date        DateTime
  timeSlot    String        @map("time_slot")  // "09:00-10:00"
  status      BookingStatus @default(pending)
  notes       String?
  createdAt   DateTime      @default(now()) @map("created_at")
  business    Business      @relation(fields: [businessId], references: [id], onDelete: Cascade)
  
  @@map("bookings")
}

enum BookingStatus {
  pending
  confirmed
  completed
  cancelled
}
```

**Di Dashboard:** Kalender booking + notifikasi WhatsApp ke pemilik  
**Di Halaman Publik:** Form booking yang terintegrasi dengan layanan

---

### 5. Notifikasi Real-time — **PRIORITAS #5**

**Masalah:** Pebisnis tidak tahu ada lead baru kecuali buka dashboard.

**Solusi:**
- **WhatsApp Notification** via Fonnte/Woowa API: setiap lead baru → kirim WA ke pemilik
- **Email Notification** untuk lead/booking baru
- **Push Notification** browser (optional, tahap 2)

```prisma
model NotificationSetting {
  id              String   @id @default(uuid()) @db.Uuid
  businessId      String   @unique @map("business_id") @db.Uuid
  emailOnLead     Boolean  @default(true)  @map("email_on_lead")
  waOnLead        Boolean  @default(true)  @map("wa_on_lead")
  emailOnBooking  Boolean  @default(true)  @map("email_on_booking")
  dailyReport     Boolean  @default(false) @map("daily_report")
  business        Business @relation(fields: [businessId], references: [id], onDelete: Cascade)
  
  @@map("notification_settings")
}
```

---

## ⚡ Fitur yang Bikin OUTSTANDING vs Kompetitor

### 6. AI Content Generator (USP Utama)

**Kenapa penting:** Pebisnis lokal **tidak bisa menulis copywriting**. Ini pain point #1.

**Fitur:**
- Auto-generate deskripsi bisnis dari nama + kategori + kota
- Auto-generate deskripsi layanan dari nama layanan + harga
- Auto-generate meta title & description untuk SEO
- Auto-generate respons FAQ yang relevan per kategori
- Saran tagline/slogan

**Implementasi:** Cukup pakai OpenAI API / Google Gemini API dengan prompt template per kategori bisnis. Biaya sangat rendah karena output pendek.

```typescript
// contoh endpoint
POST /api/businesses/:id/generate-content
{
  "type": "service_description",  // atau "meta_title", "tagline", "faq"
  "context": { "serviceName": "Servis AC", "price": 150000 }
}
```

---

### 7. Google Business Profile Integration

**Kenapa:** Target market Anda adalah bisnis yang ingin terlihat di Google. Integrasi langsung = killer feature.

**Fitur:**
- Sinkronisasi info bisnis ke Google Business Profile
- Import reviews dari Google
- Update jam operasional di kedua tempat sekaligus
- Posting ke Google Business dari dashboard

---

### 8. QR Code & Link in Bio Page

**Kenapa:** Pebisnis lokal Indonesia sangat aktif di Instagram & sering butuh QR untuk toko fisik.

**Fitur:**
- Auto-generate QR Code dengan logo bisnis
- Download QR untuk dicetak (stiker, banner, kartu nama)
- Halaman "Link in Bio" otomatis dari data bisnis
- Tracking klik per channel (QR vs link vs langsung)

---

### 9. Promo/Diskon System

**Masalah:** Tidak ada cara untuk pebisnis membuat promo.

```prisma
model Promotion {
  id          String    @id @default(uuid()) @db.Uuid
  businessId  String    @map("business_id") @db.Uuid
  title       String    // "Diskon 20% Servis AC"
  description String?
  badgeText   String?   @map("badge_text")  // "PROMO", "NEW", "HOT"
  startDate   DateTime  @map("start_date")
  endDate     DateTime  @map("end_date")
  isActive    Boolean   @default(true) @map("is_active")
  imageUrl    String?   @map("image_url")
  business    Business  @relation(fields: [businessId], references: [id], onDelete: Cascade)
  
  @@map("promotions")
}
```

**Di Halaman Publik:** Banner promo yang eye-catching, badge "PROMO" di layanan terkait

---

### 10. Pricing Plans & Billing

**Masalah:** Tidak ada model monetisasi yang terbangun. Ini SaaS tapi tidak ada cara bayar.

**Rekomendasi pricing:**
| Plan | Harga | Fitur |
|---|---|---|
| **Gratis** | Rp 0 | 1 bisnis, 5 layanan, halaman publik basic, analytics basic |
| **Pro** | Rp 99k/bln | Unlimited layanan, template premium, galeri foto, SEO lanjutan, lead management |
| **Business** | Rp 249k/bln | Custom domain, booking system, AI content, notifikasi WA, laporan mingguan |

```prisma
enum PlanTier {
  free
  pro
  business
}

model Subscription {
  id          String    @id @default(uuid()) @db.Uuid
  userId      String    @unique @map("user_id") @db.Uuid
  plan        PlanTier  @default(free)
  startsAt    DateTime  @map("starts_at")
  expiresAt   DateTime? @map("expires_at")
  // Midtrans / Xendit payment gateway integration
  paymentId   String?   @map("payment_id")
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("subscriptions")
}
```

---

## 🎨 Masalah UI/UX yang Harus Diperbaiki

### A. Halaman Publik Bisnis (`/[slug]`)
- ❌ Tidak ada variasi visual antar kategori bisnis
- ❌ Tidak ada galeri foto
- ❌ Tidak ada peta Google Maps yang terembed
- ❌ Tidak ada jam operasional yang terformat baik
- ❌ Tidak ada social proof yang kuat (review, rating bintang)

### B. Dashboard
- ❌ Tidak ada halaman leads management (daftar orang yang menghubungi)
- ❌ Tidak ada export data (PDF laporan, CSV leads)
- ❌ Tidak ada insight/tips yang actionable ("Upload foto → 3x lebih banyak klik")

### C. Landing Page Marketing
- ❌ Tidak ada halaman pricing
- ❌ Tidak ada halaman contoh/showcase bisnis nyata
- ❌ Tidak ada testimoni dari pengguna

---

## 📋 Urutan Pengerjaan (Roadmap Prioritas)

```
FASE 1 — Fondasi (Harus segera)
├── Template/tema per kategori bisnis
├── Galeri foto bisnis
├── Pricing page + plan system
└── Leads management dashboard

FASE 2 — Differentiator (Bulan depan)
├── AI content generator
├── Booking/appointment system
├── QR Code generator
└── Notifikasi WA untuk lead baru

FASE 3 — Scale (2-3 bulan)
├── Custom domain
├── Google Business Profile integration
├── Promo/diskon system
├── Export laporan PDF/CSV
└── Halaman showcase/contoh
```

---

## 💡 Kesimpulan

**Dari sisi developer:** Fondasi teknis sudah solid (Next.js 16 + NestJS + Prisma + Supabase). Arsitektur monorepo rapi. Yang kurang adalah **fitur-fitur yang membuat produk "lengkap" sebagai SaaS** — terutama template, galeri, billing, dan leads management.

**Dari sisi pebisnis:** Saat ini proyek ini hanya membuat "halaman info" yang statis dan generik. Pebisnis butuh:
1. **Tampilan yang bikin bangga** (template yang sesuai bisnisnya)
2. **Foto yang banyak** (galeri, bukan cuma 1 hero image)
3. **Tahu ada yang menghubungi** (notifikasi real-time)
4. **Bantuan nulis konten** (AI generate deskripsi, meta SEO)
5. **Cara terima booking** (terutama salon, klinik, bengkel)

**Yang membuat OUTSTANDING vs kompetitor (Wix, GoDaddy, dll):**
- Fokus 100% ke bisnis lokal Indonesia (bahasa, WhatsApp-first, Rupiah)
- AI yang membantu menulis konten (pebisnis lokal tidak bisa copywriting)
- Setup 2 menit tanpa perlu pikir desain (template otomatis per kategori)
- Booking + lead management + notifikasi WA dalam 1 platform
