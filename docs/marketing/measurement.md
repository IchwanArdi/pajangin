# Measurement & Marketing Foundation

Dokumen kerja untuk 3 hari pertama setelah landing Pajangin siap.

## Tujuan

Bukan mengejar traffic sebanyak-banyaknya. Tujuan awalnya:

1. Tahu channel mana yang membawa pemilik usaha.
2. Tahu di langkah mana mereka berhenti.
3. Tahu apakah produk benar-benar menghasilkan kontak pertama untuk bisnis.

North Star awal: **bisnis yang publish halaman lalu menerima minimal satu klik WhatsApp/booking dalam 7 hari.**

## Stack

| Tool | Fungsi | Biaya |
|---|---|---|
| GA4 | Traffic, source/medium, campaign, CTA, halaman marketing | Gratis |
| Google Search Console | Query organik, indexing, sitemap | Gratis |
| Microsoft Clarity | Heatmap dan session recording | Gratis |
| Supabase | Data produk: signup, bisnis, event halaman bisnis, lead | Sudah ada |
| Looker Studio / Google Sheets | Review mingguan | Gratis |

GA4 bukan sumber kebenaran untuk signup/publish. Supabase tetap sumber kebenaran produk. Ad blocker, consent, dan cookie restrictions bisa membuat event GA4 hilang.

## Setup manual yang hanya bisa dilakukan pemilik akun

### 1. GA4

1. Buka <https://analytics.google.com>.
2. Admin → Create property → isi nama `Pajangin`.
3. Buat Web data stream:
   - URL: `https://pajangin-app.vercel.app`
   - Stream name: `Pajangin production`
4. Salin **Measurement ID** (`G-XXXXXXXXXX`).
5. Tambahkan ke Vercel → Project → Settings → Environment Variables:
   - Name: `NEXT_PUBLIC_GA_MEASUREMENT_ID`
   - Value: `G-XXXXXXXXXX`
   - Environment: Production
6. Redeploy production.

### 2. Google Search Console

Karena `vercel.app` bukan domain milik kita, gunakan **URL-prefix property**, bukan Domain property.

1. Buka <https://search.google.com/search-console>.
2. Add property → URL prefix → `https://pajangin-app.vercel.app/`.
3. Pilih verifikasi **HTML tag**.
4. Salin hanya nilai `content="..."` (token-nya), bukan seluruh tag.
5. Tambahkan ke Vercel:
   - `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` = token tadi
   - Environment: Production
6. Redeploy, lalu klik Verify.
7. Setelah terverifikasi, submit `https://pajangin-app.vercel.app/sitemap.xml`.

### 3. Microsoft Clarity

1. Buka <https://clarity.microsoft.com>.
2. Add new project → nama `Pajangin`, URL `https://pajangin-app.vercel.app`.
3. Salin **Project ID**.
4. Tambahkan ke Vercel:
   - `NEXT_PUBLIC_CLARITY_PROJECT_ID` = Project ID
   - Environment: Production
5. Redeploy.

### 4. QA lokal (opsional)

Untuk menguji event di localhost, isi measurement ID/Clarity ID di `.env.local` dan set:

```env
NEXT_PUBLIC_ANALYTICS_DEBUG=1
```

Jangan set variabel ini di production.

## Perilaku analytics di kode

- Script GA4/Clarity hanya dimuat setelah pengguna memilih **Terima analitik**.
- Banner consent muncul di halaman marketing, login, dan onboarding. Tidak muncul di dashboard atau halaman bisnis pelanggan.
- Preview Vercel dan localhost tidak masuk data production karena ada pengecekan hostname.
- Pilihan consent disimpan di `localStorage` (`pajangin_consent_v1`).
- “Pengaturan cookie” di footer dan halaman Privasi bisa membuka banner lagi.
- Jika pengguna mencabut consent, cookie analytics dibersihkan dan halaman dimuat ulang agar script berhenti.
- UTM/referrer first-touch disimpan di cookie first-party `pajangin_acquisition` selama 90 hari.
- Saat callback Google, atribusi disimpan ke metadata user Supabase jika belum ada.
- Tidak ada nama, email, nomor WhatsApp, atau isi pesan yang dikirim ke GA4/Clarity.

## Event yang sudah dipasang

| Event | Lokasi | Parameter penting |
|---|---|---|
| `page_view` | Landing, pricing, contoh, login, onboarding | `page_path`, `page_location` |
| `cta_clicked` | Hero, nav, final CTA, pricing, footer, contoh | `location`, `label` |
| `preview_tab_clicked` | Tab preview hero | `tab` |
| `login_started` | Tombol Google | `method=google` |
| `sign_up` | Setelah callback user baru | `method`, `acq_source`, `acq_medium`, `acq_campaign` |
| `login` | Setelah callback user lama | `method`, attribution |
| `onboarding_started` | Halaman onboarding | `flow` |
| `onboarding_step_completed` | Pindah dari langkah 1/2 | `step`, `step_name` |
| `business_published` | Setelah bisnis berhasil dibuat | `category`, `city`, `service_count` |
| `share_clicked` | Salin link, QR, share WhatsApp | `channel` |

Event produk lain (page view halaman bisnis, klik WhatsApp, lead) sudah tercatat di backend/Supabase melalui `analytics_events`.

## Konvensi UTM

Selalu lowercase dan pakai tanda hubung.

```text
https://pajangin-app.vercel.app/?utm_source=instagram&utm_medium=social&utm_campaign=pilot-purwokerto&utm_content=reel-01
https://pajangin-app.vercel.app/?utm_source=whatsapp&utm_medium=community&utm_campaign=pilot-purwokerto&utm_content=group-bengkel
https://pajangin-app.vercel.app/?utm_source=partner&utm_medium=referral&utm_campaign=komunitas-umkm&utm_content=qr-sticker
```

Aturan:

- `utm_source`: platform atau partner (instagram, whatsapp, google, partner).
- `utm_medium`: jenis traffic (social, community, referral, cpc, newsletter).
- `utm_campaign`: nama kampanye yang konsisten.
- `utm_content`: varian kreatif/placement.
- Jangan taruh email, nama, nomor WA, atau ID user di UTM.

## Query Supabase untuk sumber pendaftaran\n\nJalankan di Supabase SQL Editor setelah ada beberapa user:\n\n```sql\nselect\n  coalesce(u.raw_user_meta_data -> 'acquisition' ->> 'source', 'direct') as source,\n  coalesce(u.raw_user_meta_data -> 'acquisition' ->> 'campaign', '(none)') as campaign,\n  count(distinct u.id) as users,\n  count(distinct b.id) as businesses\nfrom auth.users u\nleft join public.businesses b on b.user_id = u.id\ngroup by 1, 2\norder by businesses desc, users desc;\n```\n\nKalau `businesses` masih 0 untuk semua source, masalahnya bukan di channel — masalahnya di onboarding atau pesan landing. Itu sinyal untuk wawancara, bukan untuk menambah iklan.\n\n## Review mingguan

Lihat 6 angka ini, bukan semua metrik:

1. Session per channel (GA4).
2. Landing → CTA click (GA4).
3. CTA → signup (GA4 + Supabase).
4. Signup → publish ≤ 7 hari (Supabase).
5. Publish → kontak pertama ≤ 7 hari (Supabase).
6. Week-2 return / bisnis yang masih aktif (Supabase).

Pertanyaan review:

- Channel mana yang menghasilkan bisnis yang publish, bukan cuma klik?
- Di langkah mana onboarding paling banyak berhenti?
- Objection apa yang paling sering muncul saat wawancara/outreach?
- Apakah pesan landing sesuai dengan alasan mereka mendaftar?

## Rencana 3 hari

### Hari 1

- Buat GA4, GSC, dan Clarity.
- Isi env di Vercel, redeploy.
- Verifikasi GSC dan submit sitemap.
- Buka production, terima consent, cek GA4 Realtime/DebugView.
- Cek Clarity merekam kunjungan.

### Hari 2

- Test semua event: CTA, login, onboarding, publish, share.
- Pastikan preview deployment tidak masuk GA4.
- Wawancara 3–5 pemilik usaha. Catat pertanyaan dan objection.
- Tentukan satu niche pilot (contoh: bengkel/otomotif Purwokerto).

### Hari 3

- Buat daftar 20–30 calon bisnis.
- Susun pesan outreach WhatsApp dan penawaran pilot:
  **“Gratis, dibantu setup, untuk 10 bisnis pertama di Purwokerto.”**
- Kirim 10–15 pesan pertama dengan link UTM.
- Review data awal dan perbaiki satu titik funnel yang paling bocor.

## Setelah 3 hari

- Lanjutkan pilot sampai 10 bisnis.
- Jangan pasang iklan dulu.
- Bangun 1 case study dan 1 halaman SEO.
- Pindah ke domain sendiri setelah ada sinyal traction, bukan sebelum pilot.
