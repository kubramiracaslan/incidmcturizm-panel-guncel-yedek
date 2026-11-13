-- 0004_tours_is_active.sql
--
-- "Pasife al" ozelligi: turu SILMEDEN yayindan kaldirabilmek icin
-- tours.is_active sutunu ekler. CALISTIRILMADI -- once TEST, sonra LIVE
-- projesinde elle calistirilmasi icin yazildi. Idempotent (add column if
-- not exists).
--
-- not null default true: butun mevcut turlar bu sutun eklendigi anda
-- aktif sayilir -- geriye donuk olarak hicbir turu gizlemez.
alter table public.tours
  add column if not exists is_active boolean not null default true;
