-- Setup Supabase untuk Pajangin.
-- Jalankan sekali di Supabase SQL Editor pada project baru, setelah migration Prisma.
-- File ini tidak dijalankan oleh Prisma karena menyentuh schema storage/auth dan role Supabase.

-- Bucket publik untuk foto bisnis. Batas 5 MB dan hanya JPG/PNG/WebP.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('business-assets', 'business-assets', true, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Helper privat: cek apakah user yang login adalah pemilik business.
-- SECURITY DEFINER supaya policy Storage tetap bisa membaca public.businesses
-- walaupun RLS di tabel itu aktif.
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

create or replace function private.is_business_owner(target_business_id text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.businesses b
    where b.id::text = target_business_id
      and b.user_id = auth.uid()
  );
$$;

revoke all on function private.is_business_owner(text) from public;
grant execute on function private.is_business_owner(text) to authenticated;

-- Path upload: <business_id>/<nama-file>.
-- User hanya boleh upload/ubah/hapus file di business miliknya sendiri.

-- Bersihkan policy lama yang dibuat manual di dashboard dev. Policy permisif
-- seperti ini membuat semua user login bisa menulis ke folder bisnis lain.
do $$
declare
  p record;
begin
  for p in
    select policyname
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and (
        coalesce(qual, '') like '%business-assets%'
        or coalesce(with_check, '') like '%business-assets%'
      )
  loop
    execute format('drop policy %I on storage.objects', p.policyname);
  end loop;
end $$;

drop policy if exists "business_assets_insert_own" on storage.objects;
create policy "business_assets_insert_own" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'business-assets'
    and private.is_business_owner((storage.foldername(name))[1])
  );

drop policy if exists "business_assets_update_own" on storage.objects;
create policy "business_assets_update_own" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'business-assets'
    and private.is_business_owner((storage.foldername(name))[1])
  )
  with check (
    bucket_id = 'business-assets'
    and private.is_business_owner((storage.foldername(name))[1])
  );

drop policy if exists "business_assets_delete_own" on storage.objects;
create policy "business_assets_delete_own" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'business-assets'
    and private.is_business_owner((storage.foldername(name))[1])
  );

-- Aplikasi memakai NestJS + Prisma untuk mengakses tabel public, bukan PostgREST.
-- RLS tanpa policy membuat anon/authenticated tidak bisa membaca/menulis tabel
-- langsung lewat REST Supabase. Koneksi Prisma sebagai postgres tetap berjalan.
alter table public.users enable row level security;
alter table public.businesses enable row level security;
alter table public.services enable row level security;
alter table public.analytics_events enable row level security;
alter table public.leads enable row level security;
alter table public.business_images enable row level security;
alter table public.bookings enable row level security;
alter table public.feedback enable row level security;
