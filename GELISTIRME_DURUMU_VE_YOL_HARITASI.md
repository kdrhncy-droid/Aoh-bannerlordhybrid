# Imperium 2026 — Geliştirme Durumu, Test Geçmişi ve Yol Haritası

**Proje:** Aoh-bannerlordhybrid  
**Ürün yönü:** Önce Age of History 3 sistem ve görsel hiyerarşi seviyesine yaklaşmak, ardından özgün fikirleri eklemek.  
**Platform önceliği:** Telefon; özellikle dar yatay kullanım. Masaüstü yalnızca ikincil uyarlama olarak ele alınıyor.  
**Son güncelleme:** 2026-11-08

---

## 1. Ürün ve görsel kararlar

- Harita, oyunun sürekli görünen ana yüzeyi olarak kalacak.
- Üst HUD yalnızca kritik kaynakları, tarihi, zamanı, hızı ve önemli uyarıları gösterecek.
- Gereksiz butonlar başlangıçta sürekli görünmeyecek; bağlamsal panel veya açılır grup içinde gösterilecek.
- Telefonlarda en az yaklaşık 44–48 px dokunma hedefleri korunacak.
- Hover’a bağlı işlev kullanılmayacak; bütün önemli işlemler dokunma ile erişilebilir olacak.
- Renk kullanımı ortak bir hiyerarşiye bağlı kalacak:
  - Altın: ana seçim, yönetim ve vurgu
  - Mavi: bilgi, araştırma ve teknoloji
  - Yeşil: olumlu durum, aktif anlaşma, tamamlanan işlem
  - Kırmızı: savaş, tehdit, kilitli veya riskli durum
  - Lacivert/mürekkep: ana arka plan ve paneller
- AOH3 referansındaki görsel yaklaşım korunacak: ikon, kart, durum çipi, ilerleme çubuğu, maliyet/süre satırı ve bağlamsal eylem.

---

## 2. Şimdiye kadar yapılan sistem ve görsel güncellemeler

### 2.1 Harita HUD’u

- Harita katmanları ve hızlı işlemler başlangıçta kapalı, kompakt başlıklara dönüştürüldü.
- Harita modları ikon/glif ve renk kimliği kazandı:
  - ◈ Siyasi
  - ☪ Din
  - 🏹 Kültür
  - ✦ Asimilasyon
  - ⌁ Arazi
  - ⚖ Diplomasi
  - ◉ Ekonomi
  - ◆ İdeoloji
  - ⚔ Askeri
- Din, kültür ve asimilasyon haritaları için görsel lejantlar korunarak iyileştirildi.
- Hızlı asker toplama, ekonomi kurma ve kale kurma işlemleri bağlamsal makro işlem grubu içinde tutuldu.

### 2.2 Sistem navigasyonu

- Geniş masaüstü görünümünde alt navigasyon AOH3 tarzı sol dikey sistem rail’ine dönüştürüldü.
- Telefon ve dar yatay görünümde yatay dokunma çubuğu korundu.
- Eyalet, Ekonomi, Diplomasi, Yönetim ve Ordugâh girişleri tek bir sistem navigasyonunda toplandı.
- Aktif/pasif durumlar ortak HUD renk temasıyla yeniden düzenlendi.

### 2.3 Seçili eyalet şeridi

- Başlangıçta fazla sayıda aksiyon butonu gösterilmesi kaldırıldı.
- Varsayılan görünümde özet, kritik savaş uyarısı, `Eylemler` ve `İnşa & Eyalet` / `İncele` kaldı.
- `Eylemler` açıldığında yalnızca bağlama uygun Sefer, hızlı asker toplama veya Diplomasi gösteriliyor.
- Yabancı eyalette gereksiz askerî eylemler görünmüyor.

### 2.4 Eyalet yönetim paneli

- Mobil sekmeler üç net bölüme ayrıldı:
  - Ordu — sefer ve birlik
  - Ekonomi — bina ve gelir
  - Yönetim — tımar ve vali
- Sekmeler 48 px dokunma hedefi, ikon ve kısa açıklama kullanıyor.
- Sekme çubuğu panel kaydırılırken üstte sabit kalıyor.
- Bina kartları mobil tarama sırasına göre düzenlendi:
  1. Bina adı ve seviye
  2. Tek satır bonus
  3. Maliyet ve süre
  4. Kısa `Yükselt` butonu
- Uzun açıklamalar küçük ekranda gizlenip geniş ekranda korunuyor.

### 2.5 Renk teması ve HUD

- Ortak HUD renk tokenları oluşturuldu.
- Üst HUD, alt navigasyon ve harita panelleri ortak yüzey/aktiflik stillerine bağlandı.
- Aşırı dağınık sarı, mavi, yeşil ve kırmızı kullanımının yerine önem seviyesine dayalı renk hiyerarşisi getirildi.

### 2.6 İdeoloji, reform ve teknoloji

- İdeoloji seçimleri düz metin butonlarından görsel kartlara dönüştürüldü:
  - İdeoloji glifi
  - İdeolojiye özel renk
  - Kısa açıklama
  - Vergi ve ordu bonus çipleri
  - `AKTİF` göstergesi
- Ulusal reformlar ikonlu kısa kartlara dönüştürüldü.
- Reform maliyetleri `G` ve `RP` biçiminde daha kompakt gösteriliyor.
- Teknoloji düğümlerine dal ikonları eklendi:
  - Askeri: ⚔
  - Ekonomi: ◉
  - İdare: ♜
  - Bilim: ✦
- Teknoloji etkileri görsel bonus çipi olarak gösteriliyor.
- Mobilde uzun teknoloji açıklamaları kısaltılıyor.
- Kilitli, araştırılan ve tamamlanan teknolojiler renk ve durum butonlarıyla ayrıştırılıyor.

### 2.7 Diplomasi

- Diplomasi krallık kartlarına ulus renginde dikey durum şeridi eklendi.
- İlişki durumuna göre kart sınırları renklendirildi:
  - Savaş
  - İttifak
  - Barış
  - Oyuncu devleti
- Bayrak, hükümdar, ordu, eyalet ve paşa bilgileri kart hiyerarşisine alındı.
- Diplomasi eylemleri kart içinde gruplanmış durumda.

### 2.8 Simülasyon çekirdeği

- Eyalet nüfus büyümesi günlük simülasyon akışına bağlandı.
- Supply depot nüfus ve lojistik etkisi simülasyona bağlandı.
- Kaynak uzmanlaşmaları ekonomi hesaplarına bağlandı.
- Trade hub enflasyon rahatlatma etkisi ulusal tick akışına bağlandı.
- Diplomasi puanı, diplomatik eylem maliyetleri ve savaş ilanı ilişki koşulları eklendi.
- Diplomasi puanı günlük yenileniyor.
- Performans telemetrisi eklendi:
  - Cihaz bilgisi
  - Viewport bilgisi
  - Pan/zoom kare aralıkları
  - Simülasyon tick aralıkları
- Telemetri ölçümü olmadan 60 FPS başarı iddiası yapılmıyor.

---

## 3. Yapılan testler ve doğrulamalar

### 3.1 Production build

Son görsel paket dahil olmak üzere production build tekrar tekrar çalıştırıldı.

**Son durum:** Başarılı.

Vite PWA çıktısı üretildi. Build sırasında yalnızca mevcut büyük bundle uyarısı bulunuyor:

- Ana JavaScript chunk yaklaşık 884 kB.
- Code splitting ileride yapılabilir; şu an build’i durduran bir hata değil.

### 3.2 Simülasyon regresyon testleri

Komut:

```bash
node --import tsx --test src/engine/simulationEngine.test.ts
```

Son doğrulama:

- Test: **16**
- Başarılı: **16**
- Başarısız: **0**
- İptal: **0**

Kapsanan önemli alanlar:

- Tarih ve saat formatlama
- İlişki anahtarları ve diplomatik ilişki varsayılanları
- Savaş katılımcıları ve ittifaklar
- Savaş durumu
- Yabancı eyalete yetkisiz ordu hareketinin engellenmesi
- İmparatorluk kurma şartları
- Savaş ilanı ve düşman seferberliği
- AOH3 ilişki eşiği ve diplomasi puanı harcaması
- Barış anlaşması savaş skoru koşulları
- Taktik savaş sonucu ve geri çekilme
- Saatlik ordu hareketi ve savaşlar
- Dünya haritası eyalet kapsamı
- Kuşatma ve cephe morali
- Araştırma, inşa kuyruğu ve asimilasyon
- Din sistemi ve harita modları
- Kaynak uzmanlaşması ve trade hub ekonomisi

### 3.3 TypeScript kontrolü

Komut:

```bash
./node_modules/.bin/tsc --noEmit
```

Mevcut durum: **Başarısız; hata mevcut altyapı bağımlılığından geliyor.**

Hatalar görsel değişikliklerden kaynaklanmıyor. Repoda `geojson` tip paketi eksik olduğu için şu dosyalarda hata oluşuyor:

- `src/engine/polygonSubdivider.ts`
- `src/engine/worldBuilder.ts`

Sonuç olarak `geojson` modülü bulunamıyor ve ilgili callback parametreleri tiplenemiyor. Bu borç ayrıca ele alınacak; yeni görsel dosyalarda ek TypeScript hatası görülmedi.

### 3.4 Chrome masaüstü görsel doğrulamaları

Kontrol edilen görünümler:

- 1280×720 masaüstü görünümü
- Geniş harita HUD’u
- Sol sistem rail’i
- Katmanlar ve hızlı işlemler
- Seçili eyalet paneli
- Ekonomi ve bina kartları
- İdeoloji kartları
- Reform kartları
- Teknoloji dalları
- Diplomasi krallık kartları

### 3.5 Chrome mobil/dar yatay doğrulamaları

Kontrol edilen emüle edilmiş dar-yatay görünümler:

- 667×375 telefon görünümü
- 800×400 telefon görünümü
- 896×414 dar yatay telefon görünümü

Kontrol edilen etkileşimler:

- Haritadan eyalet seçme
- Yabancı eyalette `Eylemler` grubunu açma
- Yalnızca bağlama uygun Diplomasi eyleminin gösterilmesi
- Oyuncu eyaletine geçme
- Eyalet yönetim panelini açma
- Mobil alt navigasyonun korunması
- Eyalet özeti ve bina/sefer kartlarının taşmaması
- 2026-11-08'de Ekonomi drawer'ı üç viewportta açıkken karşılaştırma: genişlik %56'dan %48'e indirildi; ölçülen drawer genişlikleri 320 px, 384 px ve 430 px.
- Üç viewportta `documentElement.scrollWidth` ve `body.scrollWidth`, viewport genişliğine eşit; yatay sayfa taşması görülmedi.
- Drawer katmanı sabit müzik widget'ının üstüne alındı; aktif panel içeriği widget tarafından örtülmüyor.

### 3.6 Görsel çıktı arşivi

AOH3 referansları ve proje görsel kontrolleri şu klasörde tutuluyor:

```text
references/aoh3/
```

Önemli çıktılar:

- `imperium-rail-desktop.webp`
- `imperium-rail-landscape.webp`
- `imperium-province-actions-mobile.webp`
- `imperium-province-drawer-after.webp`
- `imperium-building-cards-after.webp`
- `imperium-map-layers-themed.webp`
- `imperium-ideology-cards-themed.webp`
- `imperium-diplomacy-cards-themed.webp`
- `imperium-reforms-tech-themed.webp`
- `imperium-panel-mobile-667x375-after.png`
- `imperium-panel-mobile-800x400-after.png`
- `imperium-panel-mobile-896x414-after.png`

### 3.7 2026-11-08 — AOH3 referanslı dar-yatay drawer iyileştirmesi

- Önce AOH3 resmi Google Play ekran görüntüleri ve Steam'deki eyalet geliştirici yazısı incelendi. Kaynaklar ve çıkarım sınırları `references/aoh3/UI-RESEARCH-2026-11-08.md` içinde tutuluyor.
- `src/index.css` içindeki yatay telefon kuralında drawer genişliği `%56vw` yerine `min(48vw, 480px)` oldu. Harita ana yüzey olarak daha fazla görünür kalıyor.
- Drawer `z-index: 40` ile sabit müzik kontrolünün üstünde açılıyor; açık panel içeriğinin üzerine widget binmiyor.
- `npm run build`: başarılı. Bundle boyutu için mevcut 750 kB üzeri uyarısı sürüyor.
- `node --import tsx --test src/engine/simulationEngine.test.ts`: 16 test geçti, 0 başarısız.
- Kontrol yalnızca tarayıcı emülasyonudur; portre görünüm, gerçek Android cihaz, safe-area/çentik ve diğer drawer türleri henüz doğrulanmadı. TODO'da açık bırakıldı.

### 3.8 2026-11-08 — Yönlü ticaret ambargosu düzeltmesi

- `DiplomaticRelation` yönlü `embargoingNationIds` alanını taşıyor; ekonomi cezası yalnız ambargo hedefinin gelirine uygulanıyor.
- Boğaz/koridor engeli gelen ambargoyu dikkate alıyor; ambargo uygulayıcısının kendi ticaret rotası cezalandırılmıyor. İki ülkenin karşılıklı ambargoları bağımsız açılıp kapanabiliyor.
- Eyalet diplomasisi paneli uygulayıcı ve hedef yönünü ayrı gösteriyor. Ticaret anlaşması eylemi mevcut simetrik davranışla tutarlı olarak ambargo listesini de temizliyor.
- Eski kayıtlardaki yönsüz `hasEmbargo` için deterministik uyumluluk kuralı: yön listesi yoksa `nationA` uygulayıcı sayılır; iki taraf birden cezalandırılmaz.
- `npm run lint`: başarılı. `node --import tsx --test src/engine/simulationEngine.test.ts`: 22 test geçti, 0 başarısız. `npm run build`: başarılı; 750 kB üzeri JS chunk uyarısı devam ediyor.

---

## 4. Tespit edilen dikkat noktaları ve açık sorunlar

1. Oyun telefon öncelikli olmasına rağmen bazı büyük paneller geniş ekran mantığıyla daha fazla içeriği aynı anda gösterebiliyor. Küçük ekranlarda tam ekran panel ve yarım panel davranışı daha fazla ayrıştırılmalı.
2. Diplomasi ekranında çok sayıda devlet kartı aynı akışta olduğu için filtreleme ve arama daha görünür olmalı.
3. Teknoloji ağacı görsel kartlara yaklaştı ancak gerçek bağlantılı düğüm/ağaç çizgileri henüz yapılmadı.
4. Reform kartları ikonlu hâle geldi fakat reformların kategori ve önkoşul ilişkileri görsel bir ağ olarak gösterilmiyor.
5. Din ve kültür lejantları görsel olsa da eyalet panelinde seçim/uygulama akışı daha fazla ikonlaştırılabilir.
6. Bazı uzun özel isimler ve açıklamalar dar telefonlarda tek satıra sıkışabiliyor; tüm kritik metinlerde daha agresif `line-clamp` ve ikincil detay açılımı gerekebilir.
7. `npm run lint` (`tsc --noEmit`) 2026-11-08'de geçti; önceki `geojson` tip çözümleme hatası mevcut kurulumda tekrarlanmadı. Temiz kurulum/CI ortamında da yeniden doğrulanmalı.
8. Ana JavaScript bundle büyük; ileride panel bazlı lazy loading ve code splitting yapılmalı.
9. Telemetri mevcut fakat gerçek fiziksel telefon cihazları üzerinde kapsamlı pan/zoom ve simülasyon benchmark’ı henüz yapılmadı.
10. 60 FPS için henüz genel başarı iddiası yapılmamalı; cihaz bazlı ölçüm raporu gerekli.
11. HUD renkleri ortaklaştırıldı ancak tüm eski `bg-*`, `text-*` ve `border-*` sınıflarının tamamı henüz token tabanlı değil.
12. AOH3 seviyesine ulaşmak için bazı ekranlarda metin yoğunluğu hâlâ fazla; özellikle diplomasi ayrıntı paneli, formable empire bölümü ve teknoloji açıklamaları sadeleştirilmeli.

---

## 5. Bundan sonra yapılacak tüm görevler

### Öncelik A — Mobil görsel ve etkileşim temeli

- [ ] Gerçek telefon boyutları için dikey viewport testleri eklemek: 360×800, 390×844, 412×915.
- [ ] Dar yatay testlerini 667×375, 800×400 ve 896×414 boyutlarında tekrarlamak.
- [ ] Tüm panel açılışlarında tam ekran/yarım panel davranışını telefona göre düzeltmek.
- [ ] Panel başlıklarını mobilde sticky ve daha kısa hâle getirmek.
- [ ] Panel kapatma, geri dönme ve haritaya dönüş davranışlarını tek bir standartta birleştirmek.
- [ ] Tüm kritik butonları en az 44–48 px dokunma hedefiyle denetlemek.
- [ ] Dar ekranlarda yatay taşma ve metin kesilmesi için görsel regression kontrolü eklemek.
- [ ] Safe-area, çentik ve Android gezinme çubuğu alanlarını gerçek cihazlarda kontrol etmek.

### Öncelik B — Teknoloji ve reform ağacını AOH3 seviyesine yaklaştırma

- [ ] Teknoloji dallarını gerçek bağlantılı düğüm ağacına dönüştürmek.
- [ ] Önkoşul oklarını ve kilit ilişkilerini görsel çizgilerle göstermek.
- [ ] Araştırılan teknoloji için ilerleme çubuğu ve kalan gün kartını öne çıkarmak.
- [ ] Teknoloji dallarında mobil yatay kaydırma veya zoom yapılabilir alan tasarlamak.
- [ ] Reformları ekonomi, ordu, idare, diplomasi ve bilim kategorilerine ayırmak.
- [ ] Reform önkoşullarını ve etkilerini görsel çiplerle göstermek.
- [ ] Aktif reformları ayrı “Yürürlükte” grubuna taşımak.
- [ ] Formable empire ekranını uzun metin yerine gereksinim ikonları ve ilerleme göstergeleriyle düzenlemek.

### Öncelik C — Diplomasi ekranı

- [ ] Diplomasi kartlarına arama alanı eklemek.
- [ ] `Tümü`, `Savaş`, `Komşular`, `Müttefikler`, `Ticaret` filtrelerini ikonlu filtre çiplerine dönüştürmek.
- [ ] Kartlarda eylemleri varsayılan olarak azaltıp `Eylemler` açılımına almak.
- [ ] İlişki skoru için negatif/pozitif görsel eksen veya mini bar eklemek.
- [ ] Savaş skoru, pakt, ateşkes ve diplomasi puanını ayrı durum çipleriyle göstermek.
- [ ] Diplomasi ayrıntı panelini ülke başlığı, ilişki özeti ve eylem grupları olarak bölmek.
- [ ] Mobilde ülke kartlarını tek sütun, masaüstünde kontrollü iki sütun olarak doğrulamak.

### Öncelik D — Eyalet ve ekonomi

- [ ] Eyalet metriklerini ikonlu mini stat kartlarına dönüştürmek.
- [ ] Nüfus, huzursuzluk, kaynak, garnizon ve sur durumunu aynı bilgi hiyerarşisine almak.
- [ ] Bina kartlarında tamamlanma/ilerleme görselini geliştirmek.
- [ ] İnşaat kuyruğunu ayrı timeline veya mini sıra olarak göstermek.
- [ ] Bina kategorilerini ekonomi, ordu, savunma, araştırma ve refah olarak ayırmak.
- [ ] Kaynak uzmanlaşmasını renkli kaynak rozeti ve bonus paneli olarak göstermek.
- [ ] Ekonomi özetinde gelir, gider, enflasyon ve ticaret akışını mini grafiklerle görselleştirmek.

### Öncelik E — Harita ve HUD

- [ ] Harita modlarında ortak renk kontrastını gerçek cihaz parlaklığında tekrar test etmek.
- [ ] Harita lejantlarını mobilde kart açılımı olarak daha kompakt hâle getirmek.
- [ ] Üst HUD’da kritik olmayan bilgileri ikinci satır veya detay açılımına taşımak.
- [ ] Ordu & Cephe outliner’ını mobilde daraltılabilir listeye çevirmek.
- [ ] Toast, haber ve savaş uyarılarının birbirinin üstüne binmesini engellemek.
- [ ] Seçili eyalet barı, alt navigasyon ve zoom dock çakışmalarını tüm viewport’larda test etmek.
- [ ] Masaüstü rail ile mobil alt çubuğun aynı ikon/renk dilini kullanmasını sürdürmek.

### Öncelik F — Görsel kalite ve asset sistemi

- [ ] Din ve kültür için daha tutarlı ikon seti oluşturmak.
- [ ] İdeoloji, reform, teknoloji ve kaynak ikonlarını aynı stroke/ölçek sistemine taşımak.
- [ ] Bina kartlarındaki illüstrasyonları ortak perspektif ve ışık diliyle uyumlamak.
- [ ] Eyalet ve diplomasi başlıklarında daha fazla görsel panorama/portre kullanmak.
- [ ] Emoji kullanımını kritik olmayan yerlerde ikon bileşenleriyle değiştirmek.
- [ ] Renk kontrastı ve renk körlüğü için görsel erişilebilirlik kontrolü yapmak.
- [ ] AOH3 referans görsellerini doğrudan kopyalamadan, aynı bilgi hiyerarşisini özgün asset’lerle sürdürmek.

### Öncelik G — Teknik kalite ve performans

- [ ] Eksik `geojson` tip paketini düzeltmek ve temiz `tsc --noEmit` sonucu almak.
- [ ] Test komutunu package script olarak standartlaştırmak.
- [ ] Panel ve ağır görsel bileşenlerde lazy loading/code splitting uygulamak.
- [ ] Harita canvas render maliyetini masaüstü ve telefon cihazlarında ayrı ölçmek.
- [ ] Pan/zoom FPS, simülasyon tick gecikmesi ve input gecikmesi için cihaz bazlı rapor üretmek.
- [ ] 60 FPS iddiasını ancak gerçek cihaz ölçümleri yeterli olduğunda değerlendirmek.
- [ ] Görsel regression için standart viewport ekran görüntüsü seti oluşturmak.
- [ ] Console error/warning taramasını her büyük UI paketinin sonunda çalıştırmak.

### Öncelik H — Oyun sistemi kapsamı

- [ ] AOH3 çekirdek sistem karşılaştırmasını tamamlamak: ekonomi, diplomasi, savaş, teknoloji, nüfus, yönetim.
- [ ] Diplomasi antlaşmalarına süre, güven, ilişki ve ihlal sonuçlarını eklemek.
- [ ] Savaş/kuşatma/cephe sisteminde mobil okunabilir ordu emirleri geliştirmek.
- [ ] Teknoloji ve reformların ekonomi/savaş sonuçlarını daha görünür yapmak.
- [ ] Valiler, tımarlar ve idari kapasite sistemini daha anlaşılır karar ekranına dönüştürmek.
- [ ] Nüfus, kültür, din ve asimilasyon döngüsünü harita ve eyalet panelinde birlikte göstermek.
- [ ] AI devletlerinin diplomasi, ekonomi ve ordu kararlarını görsel haber akışına bağlamak.
- [ ] Zafer, kriz, isyan ve formable empire hedeflerini oyuncuya daha iyi anlatmak.

### Öncelik I — Sonraki özgün fikir aşaması

AOH3 çekirdek görsel ve sistem paritesi yeterli seviyeye ulaştıktan sonra:

- [ ] Kullanıcının özgün oyun fikirlerini ayrı tasarım kararları olarak belgelemek.
- [ ] AOH3’ten ayrılan sistemleri ayrı renk/ikon diliyle işaretlemek.
- [ ] Yeni sistemleri önce küçük prototip ve test kapsamıyla eklemek.
- [ ] Her özgün sistem için mobil UX, ekonomi etkisi ve performans etkisi değerlendirmesi yapmak.
- [ ] Özgün özelliklerin mevcut AOH3-benzeri temel akışları bozmadığını regresyon testiyle kontrol etmek.

---

## 6. Kabul kriterleri

Bir görev tamamlandı sayılmadan önce aşağıdaki kontroller yapılacak:

1. Production build başarılı olmalı.
2. İlgili simülasyon veya UI regression testi başarılı olmalı.
3. En az bir telefon viewport’unda Chrome görsel kontrolü yapılmalı.
4. Gerekliyse 1280×720 masaüstü görünümünde de kontrol yapılmalı.
5. Metin taşması, buton çakışması, düşük kontrast ve panel clipping kontrol edilmeli.
6. Mobil dokunma hedefleri korunmalı.
7. Değişiklik ve test sonucu bu dosyaya yazılmalı.
8. Değişiklik GitHub ana dalına açık commit mesajıyla gönderilmeli.
9. Ölçüm yapılmadan 60 FPS veya “tam optimize” iddiası yazılmamalı.

---

## 7. Son kayıt

Bu dosya, proje geliştirme sırasındaki testleri, görsel gözlemleri, açık teknik borçları ve sonraki görevleri tek yerde toplamak için oluşturuldu. Ayrıntılı değişiklik geçmişi ve tarihli düzeltmeler ayrıca `YAPILACAKLAR_LISTESI.md` içinde tutuluyor.


### 3.9 2026-11-08 — Mobil HUD/toast düzeltmeleri ve son regresyon geçişi

- 320×720, 390×844, 844×390 ve 1366×768 viewportlarında taze oyun başlatma ile kontrol yapıldı. Sayfa ve gövde yatay genişliği her görünümde viewport genişliğiyle aynı kaldı; emüle edilmiş mobil ekranlarda görünen kritik düğmeler 44 px dokunma alanı kuralına uyuyor.
- Dar portre başlığında devlet adı/tarihi ile simülasyon düğmeleri ayrı satırlara akıtıldı. 390×844 Ekonomi çekmecesinde başlık, gelir/gider satırları ve eylemler görünür; panel HUD altından başlıyor ve alt gezinme üzerinde bitiyor. Drawer müzik dock'unun üstünde kalıyor.
- Uzun toast'lar artık dar cihazlarda normal satırlara sarılıyor, viewport genişliğine göre sınırlandırılıyor ve gerektiğinde içeride kaydırılabiliyor. `role="status"`, `aria-live="polite"` ve `aria-atomic="true"` korunuyor. 320×720, 390×844 ve 844×390 emülasyonlarında bildirim yatay taşma üretmedi; yatay toast iki satırlı üst HUD'un altına yerleşiyor. Drawer açıkken panel, toast katmanının üzerinde kalıyor.
- Askerî geçiş izni verilirken ilişkiye +8 ekleniyor; iptal işlemi ilişki puanı veya diplomasi puanı kazandırmıyor. UI, etkin iznin iptal durumunda bonus kazanılacağı izlenimini vermiyor. Bu davranış için regresyon testi eklendi.
- Yeni görsel kanıtlar `references/aoh3/responsive-final/` altında korundu: `aoh-responsive-320x720.png`, `aoh-responsive-390x844-economy.png`, `aoh-responsive-844x390.png` ve `aoh-responsive-1366x768.png`.
- Son doğrulama: `npm test` **37/37 geçti**, `npm run lint` başarılı, `npm run build` başarılı. Eski `server.js` clean hedefi kaldırıldı; kaynakta kullanılmayan `@google/genai`, `dotenv`, `express`, `@types/express` ve `motion` ile bunlara ait lock girdileri temizlendi. Doğrudan kaynak/script taramasında bu paketlere başvuru kalmadı.
- Kontroller Chromium viewport emülasyonudur; gerçek Android cihaz, ekran çentiği/safe-area ve fiziksel gezinme hareketleri bu geçişte doğrulanmadı. Diğer bütün ekonomi/diplomasi/teknoloji/kriz ekranlarının metinlerini tüm dört boyutta tek tek doğrulama işi TODO'da açık kalıyor.


Ayrıca Sistem menüsü gerçek HUD düğmesiyle açılarak klavye duman testi yapıldı: açılış odağı dialog içine girdi; Tab ve Shift+Tab iki uçta odak döngüsünü korudu; Escape iletişim kutusunu kapattı ve odağı açan Menü düğmesine geri verdi. TODO'da açık kalan üç başlık, teknoloji kartlarının tüm mekaniklerle eksiksiz çapraz denetimi ile bütün panel/kriz metinlerinin dört viewportta tek tek görsel kontrolüdür.


Son bağımlılık taramasında `autoprefixer` için de kaynak, build yapılandırması veya script referansı bulunmadığından kaldırıldı; `bun.lock` güncellendi. Böylece açıkça kullanılmayan paket temizliği, var olan tarihî yapılacaklar notuyla da uyumlu hâle getirildi.
