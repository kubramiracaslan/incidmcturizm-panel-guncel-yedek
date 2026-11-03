-- 0003_talepler_status_changed_at.sql
--
-- "X saat once onaylandi" gibi goreli zaman metinleri su ana kadar
-- talepler.created_at (talebin OLUSTURULMA zamani) uzerinden hesaplaniyordu
-- -- onay/revize/red gibi DURUM DEGISIKLIGI icin ayri bir zaman damgasi
-- hic yoktu, bu yuzden saatler once olusturulup az once onaylanan bir
-- talep hala "23 saat once onaylandi" gosteriyordu. Bu dosya CALISTIRILMADI
-- -- TEST projesinde (exfoiezgsvidpbdbkpqw) elle uygulanmasi icin yazildi.
-- Idempotent (add column if not exists).
--
-- Nullable birakildi: eski satirlar icin uygulama kodu status_changed_at
-- yoksa created_at'a geri doner (bkz. lib/activity.ts) -- gecmis veri
-- geriye donuk olarak yanlis bir deger almiyor, sadece "bilinmiyor" sayilip
-- eski davranisina (created_at) devam ediyor.
alter table public.talepler
  add column if not exists status_changed_at timestamptz;
