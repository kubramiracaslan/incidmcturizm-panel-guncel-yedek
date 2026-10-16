# OperationManagement (OM) Entegrasyonu

Admin bir talebi **Onaylandı** yaptığında panel, talebi OM'e gönderir ve OM'de bir tur oluşur.
OM kapalıysa talep kaybolmaz, bekleme listesine girer ve OM açılınca gönderilir.
Acenteye giden e-posta bu akıştan bağımsızdır.

## Nasıl çalışır

1. Onay anında `talepler.om_sync_status` değeri `pending` yazılır ve bir deneme yapılır.
2. Başarılıysa durum `sent` olur ve `om_synced_at` dolar.
3. Bekleyen talepler iki yolla tekrar denenir:
   - **Admin butonu:** Talepler tablosunda "Şimdi tekrar gönder".
   - **Cron adresi:** `POST /api/cron/om-sync`, başlık `Authorization: Bearer <OM_SYNC_CRON_SECRET>`.
     Yanıt: `{ processed, sent, failed, stoppedEarly }`.

## Durumlar ve deneme kuralları

| Durum | Anlamı |
|---|---|
| `pending` | Gönderilmeyi bekliyor |
| `sent` | OM'de tur oluştu |
| `failed` | OM isteği 10 kez reddetti, elle bakılmalı |

- **OM'e ulaşılamadı** (kapalı, zaman aşımı, adres yok): deneme sayısı artmaz, talep `pending` kalır, sadece `om_sync_last_error` güncellenir. Cron bu durumda kalan talepleri denemeden durur (`stoppedEarly: true`).
- **OM yanıt verdi ama reddetti** (4xx/5xx): `om_sync_attempts` bir artar, 10'a ulaşınca `failed` olur.
- Cron her çalışmada en eski 20 bekleyen talebi sırayla işler.
- Tur adı ya da acente bilgisi eksik talep atlanır ve `pending` kalır (loga yazılır).
- Aynı talep iki kez gönderilse bile OM'de tek tur oluşur (`source_request_id` benzersiz, OM yinelemede 200 döner).

## Ortam değişkenleri (panel)

| Değişken | Açıklama |
|---|---|
| `OPERATION_MANAGEMENT_BASE_URL` | OM'in adresi, örn. `http://localhost:4000` |
| `OPERATION_MANAGEMENT_API_SECRET` | OM'deki `PANEL_INTEGRATION_SECRET` ile aynı değer olmalı |
| `OM_SYNC_CRON_SECRET` | Cron adresini koruyan gizli anahtar |
| `SUPABASE_SERVICE_ROLE_KEY` | Cron'un oturumsuz çalışması için gerekli |

Gerçek değerler `.env.local` dosyasında durur, repoya girmez.

## Veritabanı

Yeni kolonlar yoksa onaylama sırasında kayıt yazılamaz ve OM'e istek gitmez. Her ortamda (test, canlı) kodu yayına almadan önce bir kez çalıştırılmalı:

```sql
alter table talepler
  add column if not exists om_sync_status text check (om_sync_status in ('pending', 'sent', 'failed')),
  add column if not exists om_sync_attempts integer not null default 0,
  add column if not exists om_sync_last_error text,
  add column if not exists om_synced_at timestamptz;
```

## Sorun giderme

- **Talep `pending` kalıyor:** OM açık mı, `OPERATION_MANAGEMENT_BASE_URL` doğru mu bak. Düzelince butona bas ya da cron'un çalışmasını bekle. `om_sync_last_error` sebebi gösterir.
- **Talep `failed` oldu:** Genellikle iki taraftaki secret farklıdır ya da OM hata veriyordur. OM loguna bak, düzelttikten sonra butona bas.
- **Elle sıfırlama:** `update talepler set om_sync_status = 'pending', om_sync_attempts = 0 where id = '<talep-id>';`
