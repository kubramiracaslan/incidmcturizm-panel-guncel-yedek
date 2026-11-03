-- 0001_tour_group_prices.sql
--
-- Yeni tablo: tour_group_prices (hucre bazli grup fiyat tablosu).
-- Bu dosya CALISTIRILMADI -- TEST projesinde (exfoiezgsvidpbdbkpqw) elle
-- uygulanmasi icin yazildi.
--
-- Yetki modeli:
--   - anon: hic izin yok (ne okuma ne yazma).
--   - authenticated: SADECE SELECT grant edilir; RLS politikasi bunu
--     admin (app_metadata.role = 'admin') veya onayli acente
--     (acentalar.status = 'approved', user_id = auth.uid()) ile sinirlar.
--   - INSERT/UPDATE/DELETE icin hicbir role (anon/authenticated) policy
--     tanimlanmaz -- RLS acikken policy yoksa o komut herkese kapali
--     demektir. Yazma sadece service_role ile yapilir (service_role RLS'i
--     tamamen bypass eder, policy'den bagimsizdir) -- bu da panelin
--     tour/blog/ana-sayfa icin kullandigi ayni yontemdir (bkz. Bolum 1).
--   - tour_id -> tours(id) ON DELETE CASCADE: tur silinince bu tablodaki
--     satirlari veritabani seviyesinde otomatik siler (uygulama kodu
--     tarafindan ayrica silinmesine gerek yok).

create table if not exists public.tour_group_prices (
  id uuid primary key default gen_random_uuid(),
  tour_id uuid not null references public.tours(id) on delete cascade,
  row_label text not null,
  group_label text not null,
  min_pax integer not null default 0,
  price numeric not null,
  currency text not null default 'EUR',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (tour_id, row_label, group_label)
);

create index if not exists tour_group_prices_tour_id_idx
  on public.tour_group_prices (tour_id, sort_order);

-- RLS'i ac.
alter table public.tour_group_prices enable row level security;

-- Tablo duzeyinde GRANT: anon'a hicbir sey verilmez, authenticated'a sadece SELECT.
revoke all on public.tour_group_prices from anon;
revoke all on public.tour_group_prices from authenticated;
grant select on public.tour_group_prices to authenticated;
-- 30 Ekim'den sonra yeni tablolarda service_role icin otomatik grant yok --
-- acikca yazilmali, yoksa service_role client'i bile bu tabloya yazamaz.
grant select, insert, update, delete on public.tour_group_prices to service_role;

-- Okuma politikasi: admin veya onayli acente.
drop policy if exists tour_group_prices_select_admin_or_approved_agent on public.tour_group_prices;
create policy tour_group_prices_select_admin_or_approved_agent
  on public.tour_group_prices
  for select
  to authenticated
  using (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    or exists (
      select 1
      from public.acentalar a
      where a.user_id = auth.uid()
        and a.status = 'approved'
    )
  );

-- Not: INSERT/UPDATE/DELETE icin bilerek hicbir policy eklenmedi --
-- anon/authenticated bu tabloya hicbir sekilde yazamaz. Yazma yalnizca
-- service_role client'i (admin panelinin sunucu action'lari) ile yapilir.
