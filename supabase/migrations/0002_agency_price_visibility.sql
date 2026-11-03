-- 0002_agency_price_visibility.sql
--
-- Acente basina fiyat gorme anahtari. Bu dosya CALISTIRILMADI -- TEST
-- projesinde (exfoiezgsvidpbdbkpqw) elle uygulanmasi icin yazildi.
-- Idempotent: tekrar calistirilmasi guvenlidir (add column if not exists,
-- drop policy if exists + yeniden olustur).
--
-- a) acentalar tablosuna can_view_prices sutunu eklenir (varsayilan true --
--    mevcut onayli acenteler bu degisiklikle fiyat gorme yetkisini
--    kaybetmez, admin dilerse sonradan kapatir).
alter table public.acentalar
  add column if not exists can_view_prices boolean not null default true;

-- b) tour_group_prices'in SELECT politikasi, admin veya (onayli VE fiyat
--    gorme yetkisi acik) acente ile sinirlanir. 0001'deki politika adiyla
--    ayni isim kullanilir -- drop + yeniden olusturma, ayri bir politika
--    biriktirmez.
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
        and a.can_view_prices = true
    )
  );
