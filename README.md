# Pajangin — Halaman Bisnis & Analitik Gratis untuk UMKM Lokal

> **Bukan sekadar website katalog statis. Bukan sekadar CRUD biasa.**
> Pajangin adalah platform micro-landing page builder berbasis Technical SEO lokal yang dilengkapi first-party event tracking, CRO funnel analytics, dan **Automated Marketing Insight Engine** untuk membantu bisnis kecil mengubah traffic menjadi calon pelanggan nyata di WhatsApp.
>
> **Gratis 100%.** Tanpa langganan dan tanpa paywall — semua fitur terbuka. Ada batas wajar (fair use) agar biaya server tetap terkendali: AI 20 generate/hari/akun, galeri 24 foto/bisnis, dan notifikasi WhatsApp maksimal 20 pesan/hari/bisnis. Endpoint publik juga diberi rate limit untuk mencegah penyalahgunaan.
>
> **Produksi:** https://pajangin.web.id

---

## 🌟 Data Nyata, Tanpa Dummy

Tidak ada data demo atau seed. Semua user, bisnis, layanan, event analitik, dan lead tersimpan di **Supabase Postgres** dan berasal dari penggunaan sungguhan. Data bisa langsung dianalisis lewat Supabase Table Editor / SQL Editor atau `pnpm --filter backend db:studio`.

---

## 🏗️ Tech Stack & Arsitektur Monorepo

| Layer | Teknologi | Rationale / Keunggulan |
| :--- | :--- | :--- |
| **Backend** | **NestJS 12 + TypeScript (ESM)** | Enterprise-grade modular architecture, Dependency Injection, REST API |
| **Database** | **Supabase Postgres + Prisma ORM 7** (`@prisma/adapter-pg`) | Managed Postgres, schema & migrasi terversi, type-safe query; runtime via transaction pooler, migrasi via session pooler |
| **Auth** | **Supabase Auth** (`@supabase/ssr`) + verifikasi JWT ES256 via JWKS (`jose`) di NestJS | Verifikasi email, lupa password, login Google, sesi cookie yang di-refresh di `proxy.ts` |
| **Frontend** | **Next.js 16 (App Router) + React 19** | Dynamic SSR/ISR, React Server Components, Fast Turbopack |
| **Styling** | **Tailwind CSS 4** | Mobile-first high-converting responsive UI |
| **SEO** | **Technical SEO + Schema.org JSON-LD** | Dynamic `LocalBusiness`, `AutoRepair`, `CafeOrCoffeeShop`, `DryCleaningOrLaundry` structured data |
| **Analytics** | **First-Party Cookie-less Event Pipeline** | Ingestion endpoint (`page_view`, `service_view`, `whatsapp_click`, `phone_click`, `lead_submit`), UTM & Referrer attribution, lead tersimpan + masuk dashboard |
| **Insights** | **Rule-Based Heuristic CRO Engine** | Algoritma deteksi *friction*, *star performers*, dominasi Google SEO, dan rekomendasi perbaikan marketing |

---

## 🚀 Cara Menjalankan Project

### 1. Prasyarat
- Node.js `v22+`
- pnpm `v10+` / `v12+`

### 2. Konfigurasi Database (Supabase)
```bash
# salin template lalu isi DATABASE_URL (pooler 6543) & DIRECT_URL (5432) dari Supabase → Connect
cp apps/backend/.env.example apps/backend/.env

# buat/terapkan tabel di Supabase
pnpm --filter backend db:deploy     # production / DB baru
pnpm --filter backend db:migrate    # development (membuat migrasi baru saat schema berubah)
```
> Schema ada di `apps/backend/prisma/schema.prisma`. Prisma Client di-generate otomatis ke `apps/backend/src/generated/prisma` saat `pnpm install` / `build`.
>
> Isi `ADMIN_EMAILS` di `apps/backend/.env` (pisahkan dengan koma) untuk membuka console founder di `/admin`. Kosong = admin ditutup.

### 3. Konfigurasi Supabase Auth
```bash
cp apps/frontend/.env.example apps/frontend/.env.local   # isi URL + publishable key
```
Di Supabase Dashboard:
- **Authentication → URL Configuration**: Site URL `http://localhost:3000`, Redirect URLs `http://localhost:3000/auth/callback`
- **Authentication → Providers → Email**: aktifkan *Confirm email*; set minimal password 8 karakter
- **Authentication → Providers → Google** (opsional): isi Client ID & Secret dari Google Cloud Console (redirect URI: `https://<project-ref>.supabase.co/auth/v1/callback`)
- Produksi: pasang SMTP sendiri (SMTP bawaan Supabase dibatasi beberapa email/jam)

Alur: `/register` → email verifikasi → `/auth/callback` → `/onboarding` (buat bisnis) → `/dashboard`. Lupa password: `/forgot-password` → email → `/reset-password`.

### 4. Jalankan Backend (Port 3001)
```bash
# Dari root project:
pnpm dev:backend
# Atau jalankan compiled dist:
pnpm build:backend && pnpm start:backend
```

### 5. Jalankan Frontend (Port 3000)
```bash
# Dari root project:
pnpm dev:frontend
```

Buka browser:
- **Homepage**: `http://localhost:3000`
- **Daftar bisnis**: `http://localhost:3000/register`
- **Dashboard Pemilik**: `http://localhost:3000/dashboard`
- **Bantuan & Masukan**: `http://localhost:3000/dashboard/masukan`
- **Admin console (founder)**: `http://localhost:3000/admin`
- **Admin · Pengguna**: `http://localhost:3000/admin/pengguna`
- **Admin · Bisnis**: `http://localhost:3000/admin/bisnis`
- **Admin · Masukan**: `http://localhost:3000/admin/masukan`
- **Halaman publik bisnis**: `http://localhost:3000/<slug-bisnis-anda>`

---

## 📊 Core Features Walkthrough

### 1. Dynamic Public Microsite (`/[slug]`)
- Fast Server-Side Rendering dengan OpenGraph & Canonical meta tags.
- Injeksi otomatis script `<script type="application/ld+json">` yang dikenali Google Rich Results untuk bisnis lokal.
- Mobile-first layout dengan tombol sticky WhatsApp di bawah layar.
- Setiap klik layanan memicu event `service_view` dan setiap klik WA memicu `whatsapp_click` yang otomatis diatribusikan ke layanan terkait.

### 2. Owner Analytics Dashboard (`/dashboard`)
- **Metric Cards**: Pengunjung Unik (Sessions), Total Page Views, WhatsApp Clicks, Phone Clicks, dan Conversion Rate (CRO %).
- **Business Switcher**: Dropdown untuk berganti antar bisnis milik user yang login (multi-tenant).
- **Traffic Sources Breakdown**: Distribusi persentase akuisisi dari Google Organik (SEO), Instagram, dan Direct.
- **Top Services Performance Table**: Menampilkan performa views vs klik kontak untuk setiap layanan.

### 3. Automated Marketing Insight Engine
Bukan hanya menyajikan grafik mati, engine ini menganalisis:
- Layanan yang ramai dilihat tapi sepi peminat (deteksi gesekan harga / CTA yang kurang jelas).
- Layanan dengan tingkat konversi tertinggi (rekomendasi untuk dijadikan *highlight* teratas).
- Analisis dominasi traffic pencarian Google lokal vs ketergantungan media sosial.
- Rekomendasi optimasi *mobile-first*.

### 4. Founder Admin Console (`/admin`)
- **Ringkasan platform**: jumlah akun & bisnis, pertumbuhan, aktivitas halaman/WA, lead, booking, dan tingkat aktivasi bisnis.
- **Daftar pengguna** (`/admin/pengguna`): pencarian nama/email/WhatsApp, filter kepemilikan bisnis, jumlah masukan, dan tautan ke bisnis publik.
- **Daftar bisnis** (`/admin/bisnis`): pencarian nama/slug/kota/pemilik, filter kota/kategori/kelengkapan, traffic 30 hari, lead, dan booking.
- **Inbox masukan**: ide, kritik, dan laporan bug dari pemilik usaha; status bisa ditandai `baru` → `dibaca` → `selesai`.
- **Akses terbatas**: login Supabase tetap diperlukan, lalu dicek terhadap allowlist `ADMIN_EMAILS` di backend. Data pengguna/bisnis bersifat read-only dari console.
- **Tanpa notifikasi WhatsApp**: masukan hanya masuk ke inbox admin, tidak dikirim ke WA.
