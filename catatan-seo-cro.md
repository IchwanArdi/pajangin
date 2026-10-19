# Catatan Audit SEO & CRO — Pajangin

**Tanggal:** 19 Oktober 2026 · **Status:** pre-launch (sebelum deploy)
**Metode:** inspeksi kode + HTML render lokal (dev server), memakai skill `seo-audit` & `cro` (marketingskills).
**Batasan:** situs belum live → belum ada data Google Search Console/Core Web Vitals; re-audit 2–4 minggu setelah deploy.

---

## Ringkasan Eksekutif

- Fondasi teknis **baik** (di atas rata-rata untuk produk pre-launch): sitemap dinamis, robots, noindex halaman tidak lengkap, Schema LocalBusiness per bisnis.
- **7 temuan P0 sudah diperbaiki hari ini** (lihat bagian ✅).
- Prioritas berikutnya: Search Console (hari pertama live) → konten (bulan 1–3) → programmatic SEO (setelah cukup bisnis).
- SEO = kanal compounding. Kanal tercepat tetap: onboarding offline + WhatsApp + footer viral.

---

## ✅ Yang Sudah Diperbaiki (P0 — 19 Okt 2026)

| # | Temuan | Perbaikan |
|---|--------|-----------|
| 1 | Landing tanpa OpenGraph/Twitter/canonical/`metadataBase` — link share tampil polos di WA/IG | `metadataBase` + openGraph + twitter di root layout; **OG image brand 1200×630** (`public/og.png`, digenerate lokal) |
| 2 | Tanpa structured data di halaman utama | JSON-LD **Organization + WebSite + FAQPage** (9 FAQ, persis konten yang tampil) di `app/page.tsx` via `lib/schema.ts` |
| 3 | Favicon masih default Next.js (25,9 KB) + tanpa ikon app | Set ikon brand: `favicon.ico` 64px (979 B), `icon.png` 512px, `apple-icon.png` 180px |
| 4 | Halaman `/[slug]/bio` berpotensi duplikat konten dengan halaman bisnis | `canonical` → `/[slug]` + og:url + twitter card + fallback OG brand |
| 5 | Halaman bisnis tanpa foto → tanpa og:image | Fallback OG brand untuk og + twitter |
| 6 | Sitemap: `lastModified` halaman statis selalu "sekarang" (kesegaran palsu) | Field dihapus untuk entri statis |
| 7 | `/pricing` & `/contoh` tanpa canonical/OG | Canonical + openGraph + twitter masing-masing |

**Verifikasi:** `next build` ✅ (TS bersih, 25 halaman) · ESLint ✅ (0 error) · HTML dev dicek: `og:image` absolut, `canonical`, `twitter:*`, JSON-LD valid (9 FAQ) ✅

## ✅ Yang Sudah Benar (tidak diubah)

- `robots.txt`: blokir `/dashboard`, `/api/`, rute auth; sitemap dideklarasikan.
- `sitemap.xml` dinamis (bisnis dari API, revalidate 1 jam; aman saat backend down).
- Halaman bisnis: title/desc dinamis, canonical, **`robots.index=false` untuk halaman belum lengkap** (anti thin-content), Schema LocalBusiness.
- Satu `<h1>` per halaman; `lang="id"`; font via `next/font`; URL deskriptif (slug).

---

## Backlog P1 — Aksi Setelah Deploy (hari pertama live)

1. **Google Search Console** (+ Bing Webmaster): verifikasi domain, submit `sitemap.xml`, cek coverage & Rich Results (LocalBusiness).
2. **Tes preview OG nyata:** kirim `https://pajangin.web.id/` ke chat WhatsApp sendiri — pastikan kartu preview (judul + gambar) muncul.
3. Tandai baseline: jumlah halaman terindeks vs halaman bisnis live (target: sama).
4. Opsional: Google Business Profile untuk brand Pajangin.

## Backlog P2 — Compounding (bulan 1–3)

1. **Konten cluster edukasi UMKM** (5–10 artikel), keyword awal: "cara membuat halaman bisnis online gratis", "website UMKM gratis", "link in bio untuk usaha", "cara terima pesanan lewat WhatsApp", "QR menu warung". Gunakan skill `content-strategy` + `programmatic-seo`.
2. **Programmatic SEO**: halaman `/kota/[kota]` dan `/kategori/[kategori]` — tunggu ≥10–15 bisnis per kota agar tidak jadi thin pages.
3. **Backlink ringan & distribusi:** setiap bisnis yang onboard diminta memasang linknya di bio Instagram + Google Business Profile mereka.
4. **AI search (GEO):** rapikan konten FAQ/panduan agar mudah dikutip ChatGPT/Perplexity/AI Overviews — skill `ai-seo`.
5. **Performa gambar:** pertimbangkan `next/image` untuk foto bisnis (LCP); ukur PageSpeed Insights dulu di produksi.

---

## Audit CRO Landing (kerangka skill `cro`)

**Penilaian umum:** struktur kuat (value prop jelas, CTA primer+sekunder, FAQ menangani keberatan, testimoni jujur berupa placeholder). Yang perlu diperkuat menjelang launch:

### Quick Wins
1. **H1 belum memuat kata "gratis"** — padahal itu diferensiasi terbesar vs jasa website. Opsi headline:
   - A: "Halaman bisnis gratis yang tampil profesional dan menghasilkan chat WhatsApp."
   - B: "Buat halaman bisnis online — gratis, tanpa hosting, siap dibagikan hari ini."
   - C: (pertahankan H1 sekarang; tambah baris kecil di atas CTA: "Gratis selamanya — tanpa kartu kredit.")
2. **Section testimoni menampilkan 3 slot kosong** ("menunggu testimoni"). Jujur, tapi untuk trafik dingin bisa menurunkan kesan. Opsi: sembunyikan sampai ada 1 testimoni asli, atau ganti isinya menjadi blok "Kenapa gratis?" + batas wajar.
3. **Tambah pill "100% Gratis"** di baris pill hero (saat ini: Tanpa hosting sendiri / SEO & Schema.org bawaan / Bahasa Indonesia).
4. **CTA copy test:** "Buat halaman bisnis" vs "Buat halaman gratis" (tambahkan kata gratis di tombol).

### High-Impact
5. **Message-match per sumber trafik:** siapkan varian sambutan untuk pengunjung dari QR/kegiatan offline (mis. header kecil "Untuk usaha di Purwokerto") — atribusi UTM/sesi sudah siap di analitik.
6. **Bukti sosial setelah pilot:** tampilkan counter "X usaha sudah punya halaman" atau screenshot chat nyata (dengan izin) — begitu ada data.

### Test Ideas (jalankan via skill `ab-testing` setelah trafik cukup)
- Headline gratis vs outcome; pill gratis vs tidak; CTA "Buat halaman bisnis" vs "Buat halaman gratis".

### Pengukuran
Konversi = daftar → halaman live → share → klik WhatsApp pertama (KPI funnel sudah terpasang di analitik internal).

---

## Metode & Catatan

- Skill dipakai: `seo-audit`, `cro` dari paket marketingskills (`.agents/skills/`).
- Verifikasi schema: cek langsung HTML server-render (bukan `web_fetch` yang membuang `<script>`).
- Dokumen ini diperbarui setelah re-audit pasca-deploy.
