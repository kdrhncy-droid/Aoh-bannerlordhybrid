# AOH3 referansıyla kalite ve sistem işleri

## Tamamlanmış çıktılar

- [x] Dar-yatay drawer 667×375, 800×400 ve 896×414 viewportlarında haritanın çoğunluğunu görünür bırakıyor; açık panelin üstüne sabit müzik widget'ı binmiyor.
- [x] Ambargo yönü uygulayan ülkeyi kaydediyor; yalnız hedefin ticaret geliri etkileniyor, iki tarafın ambargoları bağımsız açılıp kapanıyor ve eski yönsüz kayıt tek deterministik yöne eşleniyor.
- [x] Küçük garnizonda bombardıman asker sayısını artırmıyor; taktik ve kuşatma metinleri gerçek sur/asker etkilerini bildiriyor.
- [x] Ordu sevki, geri çekilme ve araştırma ilerlemesi invariantları regresyon testleriyle doğrulandı.

## Oyun durumu ve askerî tutarlılık

- [x] Araştırma projeleri teknoloji kimliğine göre ilerleme saklıyor. Başka projeye geçmek, projeyi durdurup yeniden başlatmak veya kayıt-yükleme ilerlemeyi silmiyor; yalnız aktif proje günlük araştırma alıyor.
- [x] Taktik bombardıman mevcut düşman kuvvetini hiçbir sayıda artırmıyor. 200 altındaki kuvvet için bombardıman uygulanınca hedef asker sayısı yükselmiyor; bildirilen sonuç gerçek değişime uyuyor.
- [x] Kuşatma bombardımanı bildirilen garnizon kaybını uyguluyor ve düşük garnizonu yapay biçimde 500'e yükseltmiyor. Garnizon toplamı ve birlik bileşimi aynı oransal değişimi koruyor.
- [x] Ordu sevkinde kaynakta korunması gereken garnizon hesaba katılıyor. Gönderilen hareket kuvveti, kaynakta kalan askerlerle başlangıç toplamını aşmıyor ve arayüz gerçek sevk sayısını gösteriyor.
- [x] Manuel geri çekilme sağ kalan askerleri ve birlik bileşimini dost eyalete aktarıyor. Kaynak eyalet artık oyuncunun değilse düşman garnizonu artmıyor; dost hedef bulunmadığında güvenli biçimde reddediliyor.
- [x] Muharebe bombardımanı metni gerçek sur/asker etkisini anlatıyor; kuşatmada etkisiz düğme görünmüyor. Turan emri saldırı yüzdesi vaat etmiyorsa gerçek etkisi olan moral artışını ve üst sınırını doğru anlatıyor.

## Ekonomi ve diplomasi

- [x] Vasal haraç ulusal ekonomi dökümünde ayrı negatif gider olarak gösteriliyor; bütün görünen gelir/gider kalemleri net günlük altınla uzlaşıyor.
- [x] Abluka kaybı, azaltılmış kervan geliri içinde zaten hesaba katıldığı halde ikinci bir bütçe gideri izlenimi vermiyor; açıklama ham pay, kayıp ve net katkıyı anlaşılır biçimde ayırıyor.
- [x] Lojistik liman ve ikmal deposu kartları gerçek motor etkisini doğru birim, yüzde tabanı ve zaman aralığıyla anlatıyor.
- [x] Askerî geçiş izni açıldığında gösterilen ilişki bonusu gerçek artışla aynı. İzni iptal etmek ilişki puanı kazandırmıyor.
- [x] Kısa krallık görünümü, eyalet diplomasisi ve ayrıntılı savaş kartı savaş skorunu oyuncunun saldıran/savunan perspektifinde aynı işaretle gösteriyor.
- [x] Pakt düğmeleri hedef kabulü beklemiyorsa eylemi “öneri/teklif” gibi göstermiyor; aktifleşme mesajı imzalanan/kurulan paktı doğru anlatıyor.
- [ ] Teknoloji kartı vaatleri ile ekonomi, işgal, diplomasi, istikrar, savaş ve enflasyon/enerji mekanikleri uyuşuyor. Uygulanmayan etki vaat edilmiyor; yeni mekanik yalnız açık tasarım niyetiyle ekleniyor.

## Harita, HUD ve etkileşim

- [x] Makro harita eylemi seçimi tam eyalet çekmecesini istemsiz açmıyor. Geçersiz/düşman hedefi eylem yapmadan reddediliyor ve yanlış panel göstermiyor.
- [x] `mapLabelDensity` ayarı kullanıcı tarafından COMPACT, BALANCED veya DETAILED olarak seçilebiliyor ve aynı viewport/zoomdaki harita etiketi kararını gerçekten değiştiriyor.
- [x] Global Space kısayolu yalnız etkileşimli olmayan harita/oyun alanında duraklatıyor. Düğme, bağlantı, form alanı veya düzenlenebilir metin odaktayken doğal Space davranışı çalışıyor.
- [x] Harita lejantı tek semantik düğmeyle klavyeden açılıp kapanıyor; erişilebilir adı, kontrol ettiği bölge ve açık/kapalı durumu bildiriliyor.

## Ses, modal, bildirim ve görsel/metin kalitesi

- [x] Sistem menüsü ses ayarı yalnızca efektleri kapatıyorsa doğru adlandırılıyor; kullanıcıya kapattığı ses türü net anlatılıyor ve müzik için ayrı kontrol görünür kalıyor.
- [x] Sistem, kriz ve haber modal/drawer'ları dialog bağlamını, başlığını ve kapatma düğmesinin Türkçe erişilebilir adını bildiriyor; klavyeyle açma, içeride gezinme, kapatma ve açan kontrole geri dönme davranışı tutarlı.
- [x] Toast mesajları 320–390 px ekranlarda tek satır ellipsis ile anlam kaybetmiyor; uzun metin satıra sarılıyor, kapsayıcı ekrandan taşmıyor ve önemli sonuç görünür kalıyor.
- [x] Toast bildirimleri ekran okuyucu tarafından uygun durum/önem düzeyinde duyuruluyor; uzun mesajlar okunabilir olmadan kaybolmuyor.
- [ ] HUD, ekonomi, diplomasi, teknoloji, sistem ve kriz/haber panellerinde kritik Türkçe metin, sayı ve kontrol etiketleri 320×720, 390×844, 844×390 ve 1366×768 görünümlerinde kırpılmıyor, örtüşmüyor veya yatay taşma oluşturmuyor.
- [ ] Uzun ülke/eyalet adları, uzun toast'lar ve çok seçenekli kriz içeriği dar ekranlarda okunabilir; tüm gerekli kontroller kaydırmayla erişilebilir.

## Kapsam kanıtı ve depo temizliği

- [x] AOH3 videosunda gözlendiği raporlanan eyalet bazlı mali döküm, başkent bonusu, ordu yığınlarını ayırma/birleştirme ve diğer olası parity özellikleri resmî metin veya doğrudan oyun kanıtıyla doğrulanmadan kesin AOH3 özelliği sayılmıyor; doğrulananlar ayrı ürün çıktısı olarak kapsama alınıyor. Kanıtlar `AOH3_VIDEO_GAP_AUDIT.md` ile `references/aoh3/` altında korunuyor.
- [x] `npm test` depodaki tüm test dosyalarını çalıştırıyor ve herhangi bir başarısızlıkta non-zero çıkıyor.
- [x] `package.json` temizleme komutu depoda bulunmayan `server.js` yolunu içermiyor. Kaynak ve `public/` taramasında yüksek güvenle kullanılmayan dosya bulunmadı; referans, save-compatibility veya dinamik yüklenen dosyalar silinmiyor.
- [x] Kaynak/build yapılandırmasında kullanılmayan `@google/genai`, `dotenv`, `express`, `@types/express`, `motion` ve `autoprefixer` bağımlılıkları kaldırıldı; taramada referans kalmadı ve `bun.lock` eşitlendi.

## Kapsam dışı bırakılmış varsayımlar

- Seçilen tek AOH3 videosunda gözlenmemiş olması, özelliğin AOH3'te bulunmadığının kanıtı değildir. Kaynak kodunda ayrı eyalet finans listesi, başkent bonusu veya army split/merge yolu bulunması bu özelliklerin AOH3'te kesin var olduğunu tek başına göstermez. Bu maddeler ancak metinsel/oyun içi kanıtla doğrulanınca uygulama gereksinimine dönüşür.
- Bağımlılık kaldırma kararı, doğrudan kaynak ve proje script referanslarının aranmasıyla sınırlandırıldı; başka çalışma ortamlarındaki harici araç/CI kullanımına ilişkin varsayım yapılmadı.
