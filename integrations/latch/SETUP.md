# İlk Latch kurulumu — Resonance Diren Proposal Guard

Durum: yerel hazırlık. Hesap var, oluşturulmuş veya canlı doğrulanmış latch yok.

## Amaç
Diren dersindeki koşul → eylem mantığını, sınırları belirlenmiş alım önerisine taşımak. Bu ilk entegrasyon yalnızca önerinin kabulünü kontrol eder; satın alma, fon ayırma, NFT doğrulama veya işlem imzalama yapmaz.

## Kurulumdan önce
Kontrol ettiğimiz HTTPS öneri servisi ve ona ait yalnızca bu amaç için üretilmiş erişim anahtarı gerekir. Yerel 127.0.0.1 adresine uzaktaki Latch sunucusu erişemez. Rastgele bir üçüncü taraf veya model API adresi kullanmayın: bu politikadaki /proposals yolu bizim servisimize aittir. Servis yayımlama adresi henüz belirlenmedi.

## Hesapta girilecekler
- Name: Resonance Diren Proposal Guard
- Secret: yalnızca öneri servisinin anahtarı; cüzdan anahtarı değil. Latch hesabına doğrudan girilir, sohbete veya statik oyun dosyalarına konmaz.
- Upstream: doğrulanmış, kontrolümüzdeki HTTPS servis adresi (henüz hazır değil).
- Venue: Standard proxy, ilk öneri denemesi için.
- Pipeline: pipeline.json içindeki filtreler; canlı editörde uyumluluk kontrolü yapılacak.
- Kapsam: POST /proposals, action buy, asset DEMO, tam sayı amountMinor 11–2000. 2000, 20 demo kredidir. Bu bir fiyat veya gerçek token miktarı değildir.

## Doğrulama
proposal-policy.example.json içindeki sekiz senaryo Simulate ekranında çalıştırılır. Within cap izin; diğer yedi senaryo ret bekler. Ayrıca GET /proposals ve POST /other reddedilmelidir. Sonuçlar gerçek ekran izleriyle kaydedilir. Yerel testler Latch başarısı olarak sayılmaz. Simulate upstream çağırmaz ve durum tutan limitleri atlar.

## Sonraki adım
Gerçek proxy çağrısı kontrollü servise ulaşmalı; yanıtta executed:false olmalı. Fazla bütçeli istek servise ulaşmamalı. Aynı önerinin tekrar kabulü para harcama değildir; toplam bütçe ve tek yürütme güvencesi bu aşamada sağlanmaz. Ardından sunucu tarafında model, kullanıcı onayı ve onaylı plana bağlı yürütme ayrı ayrı eklenir.

Kaynaklar:
https://onlatch.com/docs/get-started/latches
https://onlatch.com/docs/filters/reference
https://onlatch.com/docs/guides/simulate
