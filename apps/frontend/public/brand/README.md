# Pajangin brand assets

## Warna

| Token | Hex | Pakai |
| --- | --- | --- |
| Ink | `#1A1511` | Latar app icon, teks utama, mark di latar terang |
| Paper | `#FEFCFB` | Latar terang, mark di latar gelap |
| Coral | `#E24A3F` | Aksen lipatan halaman, kata “in” pada wordmark |

Coral adalah aksen, bukan latar utama. Jangan menaruh mark di atas blok coral penuh.

## Mark dan logo

| File | Ukuran | Catatan |
| --- | --- | --- |
| `pajangin-mark-ink.svg` | vektor | Mark ink + lipatan coral, untuk latar terang |
| `pajangin-mark-paper.svg` | vektor | Mark paper + lipatan coral, untuk latar gelap |
| `pajangin-mark-1024.png` | 1024×1024 | Transparan |
| `pajangin-logo-light.svg` | 1200×400 | Wordmark ink + coral, font Bricolage tertanam |
| `pajangin-logo-dark.svg` | 1200×400 | Wordmark paper + coral, font Bricolage tertanam |
| `pajangin-logo-light.png` | 1200×400 | Transparan, untuk platform eksternal |
| `pajangin-logo-dark.png` | 1200×400 | Transparan, untuk platform eksternal |

## App icon dan PWA

| File | Ukuran | Catatan |
| --- | --- | --- |
| `app/icon.png` | 512×512 | Ikon utama, full-bleed ink |
| `app/apple-icon.png` | 180×180 | Apple touch icon, full-bleed ink |
| `app/favicon.ico` | 16/32/48 | Multi-size ICO |
| `public/icons/icon-192.png` | 192×192 | PWA |
| `public/icons/icon-512.png` | 512×512 | PWA |
| `public/icons/maskable-512.png` | 512×512 | Safe zone maskable |
| `public/icons/social-avatar-512.png` | 512×512 | Avatar sosial |

## OG

| File | Ukuran | Catatan |
| --- | --- | --- |
| `public/og.png` | 1200×630 | OG/Twitter card default |

## Aturan pakai

- Jangan mengubah warna lipatan coral atau memakai gradasi.
- Jangan menambahkan bayangan, 3D, atau outline.
- Di latar terang pakai mark ink; di latar gelap pakai mark paper.
- Ukuran minimum mark: 16px. Di bawah itu, gunakan versi yang disederhanakan.
- Logo PNG adalah sumber utama untuk platform eksternal; SVG logo menyertakan font Bricolage agar teks tetap konsisten.
