# AOH3 referansıyla oyun kalite ve sistem bütünlüğü planı

## Ürün hedefi

Mevcut Aoh-bannerlordhybrid oyununu, depoda kodla doğrulanmış oyun mantığı kusurları ve kullanıcıya yanlış bilgi veren HUD/metinlerden arındırmak; açıkça tanımlanmış ayarların gerçekten çalışmasını sağlamak; klavye ve ekran okuyucu kullanımını düzeltmek; mevcut dark-map görsel dilini koruyarak dar ekranlarda okunabilir, tutarlı bir arayüz sunmak. Amaç, AOH3'ün kanıtlanmamış özelliklerini kopyalamak değil; doğrulanmış davranış tutarsızlıklarını gidermek ve metin kaynaklarıyla doğrulanan özellik kapsamını güvenle ele almaktır.

## Tasarım yönü

Mevcut harita-merkezli koyu strateji/HUD dili korunacak. AOH3 mobil ekranlarından alınan referans ilkeleri—haritayı ana yüzey olarak görünür tutmak, bağlamsal yönetim panellerini kenarda tutmak ve görsel hiyerarşiyi kompaktlaştırmak—uygulanacak; piksel piksel kopyalama yapılmayacak. Panel, toast ve ikon davranışları var olan uygulama stiliyle tutarlı kalacak; yeni renk/asset sistemi veya oyun dışı dekoratif katman eklenmeyecek. Kanıt görselleri ve AOH3 araştırma notları `references/aoh3/` altında korunacak.

## Uygulama yaklaşımı

1. Mevcut yönlü ambargo düzeltmesini ve mobil drawer iyileştirmesini başlangıç durumu olarak koru; ilgili regressions'ları sonraki test koşularına kat.
2. Önce veri-koruma ve askerî durum invariantlarını düzelt: araştırma ilerlemesini teknoloji kimliğine göre sakla; asker sayısı, birlik bileşimi, garnizon, hareket ve geri çekilme yollarını birbirine uzlaştır.
3. Ekonomi ve diplomasi hesaplarını kullanıcıya gösterilen günlük bütçe, ilişki puanı, savaş skoru ve eylem etiketleriyle aynı anlamda tut.
4. Teknoloji/bina etkilerinde mevcut motor davranışı ile veri kartı vaadi arasında tek gerçeklik oluştur; hedeflenmeyen modifier'ı kullanıcıya vaat etme.
5. HUD/harita ayarlarını gerçek render yoluna bağla; modal, toast, klavye kısayolu ve lejant kontrollerini semantik ve erişilebilir kıl.
6. Eski dosya temizliğini statik import/entrypoint/dinamik asset taraması ve proje build/test'iyle kanıtla. Denetimde `src/` veya `public/` için güvenli silme adayı bulunmadı; yalnız `package.json` clean komutundaki artık `server.js` hedefi kaldırılabilir. Referans, save-compatibility ve kullanıcı kanıt dosyaları silinmeyecek; doğrudan kullanım kanıtı olmadan bağımlılık kaldırılmayacak.
7. Videoda gözlendiği raporlanan ancak bağımsız görüntü ve AOH3 metin kaynaklarıyla doğrulanmayan eyalet bazlı mali görünüm, başkent bonusu, ayrı asker yığını/split-merge ve benzeri parity iddialarını dış kaynakla doğrula; AOH3'teki davranış için kanıt bulunduktan sonra ürün kapsamına al. Tek video analizinde gözlenmemiş olmak, AOH3'te sistem olmadığı anlamına gelmez.

## Etkilenecek proje yapısı

- `src/engine/`: Saf oyun hesapları ve aksiyon domain'leri. Araştırma, ekonomi, diplomasi, muharebe ve ticaret geçişleri burada bulunur; değişiklikler veri modeliyle uyumlu tutulur.
- `src/store/`: Oyun state'i ve kullanıcı eylemlerini engine domain'lerine bağlayan store. Makro harita eylemi, taktik emir ve modal state akışı burada düzenlenir.
- `src/components/` ve `src/components/drawers/`: HUD, ekonomi, eyalet, diplomasi, teknoloji ve sistem modalları. Gösterilen metinler/aksiyonlar gerçek engine etkileriyle eşleştirilir.
- `src/map/`: Canvas harita, etiketler ve harita etkileşimleri. `mapLabelDensity` ayarı bu render yoluna bağlanır.
- `src/types/`: Kalıcı state ve domain veri sözleşmeleri. Yeni alanlarda eski save yükleme varsayılanı korunur.
- `src/data/`: Bina, teknoloji ve oyun modu tanımları; görünen açıklamalar ile motor etkilerinin kaynağı.
- `src/engine/simulationEngine.test.ts` ve yeni ilgili testler: Domain regresyonları. Projede `node --import tsx --test` ve `npm run lint`/`npm run build` mevcut; test komutu package scripts'e eklenir.
- `public/`: Manifest ve statik varlıklar. Kullanım grafiğinde referansı bulunan varlıklar korunur.
- `references/aoh3/`: Kaynak araştırma notları, audit çıktıları ve ekran kanıtları; uygulama kodu değildir, korunur.

## Teknik kısıtlar

Frontend-only Vite/React/TypeScript uygulaması mevcut `npm run dev` ve Vite production build akışıyla devam eder; yeni backend veya servis eklenmez. Büyük oyun dengesi değişiklikleri yerine, mümkün olduğunda mevcut engine etkisi korunup yanıltıcı etiket düzeltilir. Save formatı genişletildiğinde eski kayıtlar için açık varsayılan/migration sağlanır. Test bağımlılığı eklemek gerekirse kilit dosyasıyla birlikte ve yalnız doğrulama ihtiyacı için eklenir; mevcut doğrudan kullanılmayan paketler dolaylı/araç tüketimi araştırılmadan silinmez.

## Açık kanıt kararı

Audit sonucu çalışma sırası, `TODO.md` içindeki ayrı, tamamlanabilir ürün çıktılarıdır. Kodla doğrulanmış sorunlar bu plana dahildir. AOH3 video analiziyle sınırlı özellik farkları ise resmî mağaza/geliştirici metni veya doğrudan doğrulanmış oyun davranışı bulunmadan implementasyon hedefi sayılmaz; bu kanıtlar bulunduğunda plana eklenir.
