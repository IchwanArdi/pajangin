// Normalisasi nomor WA ke format wa.me (62xxxxxxxxxx). Backend juga menormalisasi saat simpan;
// ini lapisan pengaman untuk data lama & tampilan.
export function toWaNumber(input: string | null | undefined): string {
  let digits = String(input ?? '').replace(/\D/g, '');
  if (digits.startsWith('0')) digits = `62${digits.slice(1)}`;
  else if (digits.startsWith('8')) digits = `62${digits}`;
  return digits;
}

// Validasi ringan di form (aturan sama dengan backend)
export function isValidWhatsapp(input: string): boolean {
  const n = toWaNumber(input);
  return /^628\d{7,11}$/.test(n) || /^(?!62)[1-9]\d{9,14}$/.test(n);
}

// Tampilan ramah: 6281234567890 → +62 812-3456-7890
export function formatWaDisplay(input: string | null | undefined): string {
  const n = toWaNumber(input);
  if (!n.startsWith('62')) return n ? `+${n}` : '';
  const local = n.slice(2);
  return `+62 ${local.slice(0, 3)}-${local.slice(3, 7)}-${local.slice(7)}`.replace(/-$/, '');
}
