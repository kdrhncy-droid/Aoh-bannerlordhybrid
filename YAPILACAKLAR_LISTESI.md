# Imperium 2026 — Master Mimari Belgesi, Nerede Kaldık Özeti ve Hibrit (AoH3 + Bannerlord) Yol Haritası

Bu belge, projede **nerede kaldığımızı unutmamak**, hangi sistemlerin tamamlandığını takip etmek ve **Age of History 3 (Büyük Strateji HUD & Harita)** ile **Mount & Blade II: Bannerlord (Otonom Lordlar, Tımar, Köy/Kale ve Sancak Ordusu)** arasındaki **En İyi Hibrit Sistemi** adım adım inşa etmek için ana referans kaynağımızdır.

---

## BÖLÜM 1: Nerede Kaldık? (Şu Ana Kadar Tamamlanan Sistemler — ✅)

### 1. Çekirdek Harita & Coğrafya Motoru (✅ Tamamlandı)
- **Çoklu Eyalet (Sub-Provinces) Bölünmesi**: Ülkeler sadece tek parça değil; Türkiye (İstanbul, Ankara, İzmir, Erzurum vb.), Rusya, ABD, Çin, Almanya gibi ülkeler birden fazla stratejik eyalete bölündü.
- **Antimeridyen (180° Boylam) ve Rusya Düzeltmesi**: Sibirya/Çukotka gibi 180° boylamını aşan ülkelerin koordinat sarma (wrapping) hatası giderildi; Rusya ve tüm ada/kıta ülkeleri eksiksiz görünüyor.
- **Age of History 3 Harita Kalitesi**:
  - Poligon dışına taşmayan (`ctx.clip`) **AoH3 İç Sınır Derinlik Gölgesi**.
  - **5 Gerçekçi Arazi Tipi (`OVA`, `DAGLIK`, `ORMAN`, `COL`, `METROPOL`)**, araziye göre savaş/savunma/zırhlı bonusları ve **`Arazi` Harita Modu**.
  - Harita yakınlaştırıldığında (`Zoom >= 1.85x`) ordu rozetinin yanında beliren **İnteraktif Köy (`⌂+`)** ve **Kale/Tımar (`⚜` / `♜`)** uydu ikonları.

### 2. Kayıt, Ayarlar ve Ulusal Müzik Motoru (✅ Tamamlandı)
- **Çoklu Kayıt Yuvası (`AUTOSAVE`, `SLOT_1`, `SLOT_2`, `SLOT_3`)** ve **JSON İndir / Yükle** yedekleme merkezi.
- **Kullanıcı Özelleştirme & Ayarlar Paneli**:
  - Otomatik kayıt sıklığı (`Kapalı`, `30`, `90`, `180`, `300`, `365 Gün`),
  - Yapay Zeka Saldırganlığı (`Pasif`, `Normal`, `Saldırgan`, `Tarihsel`),
  - Savaş Sisi (`Fog of War`) Aç/Kapat,
  - Harita Sağ Alt Yakınlaştırma (`+ / - / Ortala`) Butonlarını Aç/Kapat,
  - Kabine Kriz Olayları Sıklığı.
- **Ulusal Marş & Müzik Sentezleyicisi**:
  - **"Olur mu Böyle Olur mu (Kardeş Kardeşi Vurur mu)"** çok sesli marş sentezleyicisi, **Ceddin Deden (Mehter Marşı)**, **Imperium Strateji Senfonisi** ve cihazdan **Özel MP3 Yükleme** desteği.

### 3. Diplomasi, Çoklu Eyalet AI, İsyan ve Dünya Sıralaması (✅ Tamamlandı)
- **Çoklu Eyalet Stratejik AI**: AI devletler iç eyaletlerdeki atıl ordularını tehdit altındaki sınır eyaletlerine kaydırır, cephe hattında asker basar ve birkaç sınır eyaletinden aynı anda çok cepheli saldırı başlatır.
- **Tam Diplomasi & Vasal Sistemi**: İlişki geliştirme, nota/hakaret, İttifak, Saldırmazlık Paktı (`NAP`), Askeri Geçiş İzni, Ticaret Anlaşması, Ekonomik Ambargo, **Vasal Ültimatomu** ve **Vasal İlhakı**.
- **Haftalık Huzursuzluk (`Unrest`) ve Gerçek İsyan Motoru**: Asimile edilmemiş yüksek huzursuzluklu eyaletler `%85` eşiğinde ayaklanarak garnizonu kırarsa eski devletine/bağımsızlığına döner.
- **Dünya Süper Güç Sıralaması (Leaderboard)**: Tüm devletlerin Ekonomi (GSYİH), Ordu, Eyalet ve Toplam Süper Güç Puanı tablosu.

### 4. Bannerlord Temel Paket (Faz 1 — ✅ Tamamlandı)
- **Şehir - Kale - 2 Köy Yerleşke Hiyerarşisi**: Köylerde haftalık biriken gönüllü askerleri haritadan veya eyalet çekmecesinden toplama (`+Ordu XP`).
- **Bannerlord Asker Terfi Ağacı (`★ XP`)**: `Piyade ➔ Zırhlı Tugay` ve `Piyade ➔ Seçkin SİHA/Komando` terfileri.
- **Temel Tımar (Fief) Ataması**: Eyaleti bir Paşa/Lord'a verme ve Lordun haftalık otomatik garnizon desteği.
- **Klan Nüfuzu (`⚜`) ve Sancağa Çağırma**: Nüfuz harcayarak Lordları şahsi muhafız ordularıyla beraber kuşatma seferine katma.
- **Kale Suru (`%0-100`) ve Kuşatma Bombardımanı**: Topçu ateşi ve SİHA baskını ile taarruz öncesi düşman surlarını yıkma.

---

## BÖLÜM 2: Üzerinde Konuştuğumuz Yeni Vizyon — "En İyi Hibrit Sistem" (AoH3 HUD + Otonom Bannerlord Lord AI)

Kullanıcımızın tespit ettiği **en kritik tasarım sorusu** şudur:
> *"Oyuncu tüm şehirleri kendine alıp tek tek geliştirebilir AMA şehirleri Lordlara Tımar olarak vererek hem RAHATLIK (Lordun kendi şehrinde ekonomiyi, ticareti, araştırmayı ve orduyu kendi AI kararlarıyla geliştirmesi ve bunun bizim AoH3 üst HUD'umuza `100 Gold ➔ 120 Gold` olarak yansıması) hem de RİSK (Lordun güçlenip sadakati düşerse isyan etmesi) elde etmeli. Peki bu Lord AI'ını ve haritada gezen Lordları yapmak çok zor veya yorucu olmaz mı? Oyuncu da haritada bir karakter olmalı mı?"*

### Mimari Cevap 1: Bu Yapay Zeka (AI) Zor mu, Bilgisayarı/Telefonu Yorar mı?
**Hayır, doğru mimariyle kurulduğunda hiç yormaz!**
- Neden? Çünkü bir strateji oyununda AI kararlarını her saniye (60 FPS) değil, **Haftalık veya 10 Günlük Karar Döngülerinde (Tick bazlı Utility AI / Puanlama Motoru)** çalıştırırız.
- Bir Lordun karar vermesi kodda sadece **4 satırlık bir öncelik puanlamasıdır (Utility Scoring)**:
  1. *"Tımarımdaki kale suru veya garnizon zayıf mı?"* ➔ Parayı **Kışla / Kale** ve **Asker Toplamaya** harca.
  2. *"Sınırda tehlike yok ve kasamda altın birikti mi?"* ➔ Kişiliğime göre **Fabrika (Ekonomi)** veya **Üniversite (Araştırma)** seviyesini +1 artır!
  3. *"Savaş var mı?"* ➔ Şahsi ordumu (`Lord Army`) haritaya çıkarıp düşman sınırına veya Hükümdarın sancağına yürüt!
- Bu yapı hem **çok gerçekçi ve canlı** görünür hem de işlemciyi **%0.1 bile yormaz**.

### Mimari Cevap 2: Oyuncu Haritada Fiziksel Bir Karakter Olmalı mı? (En İyi Hibrit Çözüm)
Eğer oyuncuyu *sadece* tek bir karakter yapıp devlet yönetimini kısıtlarsak oyun *Age of History 3* olmaktan çıkar; ama oyuncuyu *sadece* görünmez bir tanrı-ekran yaparsak da *Bannerlord* ruhu eksik kalır.
**En İyi Hibrit Çözüm: "Hükümdar Sancağı (Kralın Şahsi Ordusu) + Makro Devlet HUD'u"**
1. **AoH3 Makro Kontrolü Korunur**: Oyuncu yine tüm ülkenin vergisini, diplomasisini, teknolojisini ve doğrudan kendine bağlı **"Has Toprakları (Merkez Eyaletleri)"** AoH3 rahatlığıyla yönetir.
2. **Haritada "Hükümdar Sancağı (👑 Kral/Cumhurbaşkanı Ordusu)"**: Oyuncunun haritada altın taçlı özel bir **Hükümdar Birliği** bulunur. Oyuncu isterse bu birliğiyle köyleri gezip sıfır maliyetle gönüllü toplar ve gittiği eyalete `+Moral / +İstikrar` verir; isterse de hiç mikro-yönetimle uğraşmadan AoH3 gibi haritadan emir verir!

### Mimari Cevap 3: "Rahatlık vs. Risk" — Otonom Lord Yatırımları ve AoH3 HUD Entegrasyonu
Bu sistem oyunu dünyadaki diğer tüm mobil/web strateji oyunlarından ayıran **ana imza mekaniği** olacaktır:

#### A. Neden Tüm Şehirleri Kendimiz Tutmayalım? ("İdari Kapasite / Yönetim Limiti")
- Hükümdar tek başına örneğin en fazla **6 Eyaleti (Doğrudan Has Toprak)** sıfır ceza ile yönetebilir.
- İmparatorluk büyüyüp 15-20 eyalete çıktığında, fazla eyaletleri kendinizde tutarsanız **"Bürokratik Aşırı Yük"** oluşur (vergi kaybı ve mikro-yönetim yorgunluğu).
- Çözüm: Fazla şehirleri güvendiğiniz **Klan Lordlarına / Paşalara Tımar (Fief)** olarak dağıtırsınız!

#### B. Lordlara Şehir Verince Ne Olur? (Otonom Geliştirme & AoH3 HUD Yansıması)
Her Lordun kendine ait bir **Lord Kasası (Altın)** ve **Yönetim Arketipi (Kişiliği)** olur:
1. **İktisatçı / Tüccar Lord (Örn: Ekonomi Odaklı Vali)**:
   - Tımarındaki verginin bir kısmıyla her birkaç haftada bir o şehre **kendiliğinden Fabrika ve İkmal Merkezi inşa eder**.
   - Siz hiçbir tuşa basmadan bir bakarsınız: *"🔔 Hulusi Paşa, İzmir eyaletinde Fabrika Seviyesini 3'e yükseltti! Günlük Hazine Geliriniz: +100 Altın ➔ +122 Altın oldu!"*
2. **Alim / Teknokrat Lord (Araştırma Odaklı)**:
   - Tımarındaki şehre **Üniversite & Araştırma Лабораtuvarı** kurar.
   - Üst bardaki AoH3 Araştırma sayacınız kendiliğinden `+4.2 ➔ +6.8`'e fırlar!
3. **Mareşal / Savaşçı Lord (Ordu Odaklı)**:
   - Tımarındaki köylerden sürekli asker toplar, onları **Zırhlı Tugay / Seçkin Birliğe** terfi ettirir ve haritada **Canlı Gezen Lord Ordusu** olarak sınırlarınızı korur, savaşta düşman şehirlerini kuşatır!
   - Üst bardaki **Toplam İmparatorluk Ordusu** sayacınız kendiliğinden büyür!

#### C. Peki Bunun "Riski" Nedir? (Sadakat, Kibir ve İç Savaş Tehlikesi)
- Lordlara çok fazla zengin şehir verirseniz, o Lordun **Güç Oranı** ve **Hırsı (Ambition)** artar.
- Her Lordun `%0 - %100` arası **Sadakat (Loyalty)** barı vardır:
  - Ona tımar vermek, maaş/ödül vermek veya birlikte zafer kazanmak sadakatini artırır.
  - Ancak tımarını elinden almak, yüksek vergi dayatmak veya gücünün sizden fazla olması sadakatini düşürür.
  - **Kritik Risk**: Sadakati `%25`'in altına düşen güçlü bir Lord, **kendi geliştirdiği şehirleri ve topladığı ordularıyla birlikte sancağını çekip İç Savaş (İsyan)** başlatabilir!

---

## BÖLÜM 3: Sonraki Aşamalar Yol Haritası (Onayınızla Adım Adım Yapılacaklar)

> **Not**: Kullanıcı talimatı gereği hiçbir kod değişikliği sizden onay alınmadan yapılmaz. Aşağıdaki aşamalar sırasıyla onayınıza sunulacaktır:

### 5. Savunma Paktı & Saldırı Paktı Ayrımı (✅ Tamamlandı)
- **Savunma Paktı (Defensive Pact - 🛡️)**: Yalnızca bir üye dış saldırıya uğradığında tetiklenir; taarruz savaşlarına katılmaz.
- **Saldırı Paktı & Askeri Koalisyon (Offensive Pact - ⚔️)**: Ortak hedeflere karşı savaş açıldığında ve savunmada tam ittifak halinde birlikte taarruza katılır.
- **Savaş Öncesi Koalisyon İstihbarat Paneli**: Savaş ilan edilmeden önce hedefin savunma paktı müttefikleri ve oyuncunun saldırı paktı ortakları ekranda canlı listelenir.
- **Diplomatik Harita Modu**: Savunma Paktı (Açık Mavi/Kalkan `#0284C7`) ve Saldırı Paktı (Zümrüt Yeşili/Kılıç `#10B981`) olarak ayrıştırıldı.
- **Çoklu Eyalet AI Entegrasyonu**: AI savaş açtığında veya savaşa uğradığında pakt üyeleri otomatik olarak taraflara katılır.

### 6. Bannerlord Faz 2: Otonom Lord AI, Şehir Yatırımları ve İdari Kapasite (✅ Tamamlandı)
- **Lord Karakterleri (Archetypes)**:
  - `İktisatçı & Tüccar`: Tımarında Fabrika ve Ticaret Limanı kurar (`100 ➔ 122 Altın/Gün`).
  - `Alim & Teknokrat`: Tımarında Üniversite ve Ar-Ge laboratuvarı kurar (`+1.5 Bilim/Gün`).
  - `Gazi Mareşal`: Tımarında Kışla ve Kale tahkimatını büyütür.
- **Otonom Yatırım Bildirimleri**: Lord kendi şehrini geliştirdiğinde bildirim ve haber üretilir (*"🔔 Hulusi Paşa, İzmir eyaletinde Fabrika kurdu! Günlük geliriniz +22 Altın arttı!"*).
- **İdari Kapasite (Doğrudan Has Toprak Limiti: 5 Eyalet)**: Fazla sahipsiz eyaletler bürokratik aşırı yüke yol açar; şehirleri Lordlara Tımar vererek bu yük kaldırılır.

---

## BÖLÜM 3: Sıradaki En Önemli Yapılacaklar Listesi (Öncelik Sırasıyla)

### 7. 2D Taktiksel Meydan Muharebesi & Doktrin Kartları (✅ Tamamlandı)
- **2D Taktiksel Meydan Muharebesi Ekranı**: Ordular eyalet sınırlarında çarpıştığında oyuncunun bizzat katılabileceği canlı taktik harp ekranı (`TacticalBattleModal.tsx`).
- **6 Taktiksel Doktrin Kartı**:
  - `🏹 Hilal / Turan Taktiği (Kurt Kapanı)`: Sahte geri çekilme ile düşman kanatlarını çembere alma (+%28 Kuşatma Hasarı, -%24 Düşman Morali).
  - `⚡ Kanat Yarma & Yıldırım Darbesi`: Zırhlı tugaylarla zayıf kanada yıldırım darbesi (+%24 Taarruz).
  - `🎯 SİHA & Topçu Baraj Ateşi`: Hücum öncesi düşman kale surlarını ve tahkimatını dövme (-%35 Siper Dayanıklılığı).
  - `🛡️ Kirpi Savunması & Tahkimat`: Sayıca üstün düşmana karşı mevzi savunması (+%35 Direnç, -%35 Kayıp Azaltma).
  - `⚔️ Topyekûn Süngü Hücumu`: Yüksek riskli kesin sonuç taarruzu (+%35 Hasar, +%30 Moral Şoku).
  - `⚖️ Dengeli Cephe Hattı`: Nizami ve dengeli ordu manevrası.
- **Canlı Harp Günlüğü & Zafer Fanfarı**: Raund raund hesaplanan muharebe seyri, canlı metin günlüğü, zafer/ricat ses efektleri ile Bannerlord Ordu XP (★) ve Klan Nüfuz (⚜) ödülleri.
- **Otomatik Hesapla Butonu**: Hızlı oynamak isteyenler için tek tıkla taktiksel simülasyonu tamamlama imkanı.

---

### 8. Haritada Yaşayan Canlı Bannerlord / Warband Lord Partileri & Hükümdar Sancağı (✅ Tamamlandı)
- **Haritada Gezen Canlı Lord Partileri (`ActiveLordParty`)**:
  - Oyuncunun ve diğer tüm ülkelerin Lordları ve komutanları harita üzerinde fiziki olarak sancağı, asker sayısı ve görev rozetiyle (`🛡️ Devriye`, `🌾 Asker Toplama`, `⚔️ Kuşatma`, `🚩 Sefer`) gezer.
  - Barış zamanı kendi tımarlarında devriye atar, köylerden gönüllü toplar; savaş çıktığında sınır boylarına veya düşman kalelerine doğru yürür.
- **Oyuncunun Kontrol Edebildiği `👑 Hükümdar Sancağı` (Kralın Şahsi Ordusu)**:
  - Oyuncunun bizzat yönettiği altın taçlı ve parıltılı hareye sahip şahsi Hükümdar Ordusu haritada yer alır.
  - Harita üzerinden veya Eyalet Çekmecesinden tek tıkla (`👑 Hükümdar Sancağını Buraya Yürüt`) hedeflenen şehre/kaleye yürütülebilir.
  - Yakınlaştıkça köylerden gönüllü asker toplayabilir ve kuşatmalara bizzat katılarak moral üstünlüğü sağlayabilir.
- **Mesafe Bazlı Savaş Sisi & Kuşatma Keşfi (Proximity Reconnaissance)**:
  - Oyuncu veya Hükümdar Sancağı düşman ordusuna/kuşatmasına uzaktayken asker sayısı gizlenir (`? ? ?`).
  - Oyuncu veya birlikler yaklaştığında gerçek garnizon ve kuşatma ordusu sayısı görünür hale gelir.
- **Performans hedefi (ölçüm bekliyor)**: HTML5 2D Canvas harita render’ı için 60 FPS hedeflenir; cihaz/viewport ve etkileşim ölçümü olmadan başarı olarak işaretlenmez.
### 9. 1440 Tarihsel Birimler, Serbest Gezinti & Deniz/Kara Varlık Modelleri (✅ Tamamlandı)
- **Haritada Serbest Yürüyüş & Varınca Açılan Menü**:
  - Şehir veya kaleye tıklandığında menü pat diye ekranı kaplamaz; `👑 Hükümdar Sancağı` arazi boyunca Bannerlord gibi fiziki olarak hedefe doğru yürür ve şehre ayak bastığında yerleşke divanı açılır.
  - Hükümdar boş arazilere ve sınırlara tıklanarak serbestçe kırlarda gezdirilebilir, devriye atabilir.
- **Tarihsel 1440 Dokusu (Osmanlı & Çağlar)**:
  - 1440 senaryosunda modern İHA/SİHA ve Zırhlı Tugay kaldırıldı; yerini **Yeniçeri Ocağı (Kapıkulu & Savunma)**, **Tımarlı Sipahi (Kanat Yarma & Süvari)** ve **Şahi Darbzen Kuşatma Topu** aldı.
  - Tarihsel komutanlar eklendi: *Çandarlı Halil Paşa, Zağanos Paşa, Turahan Bey, Şahabeddin Paşa, Baltaoğlu Süleyman Bey*.
- **2D Kara / Deniz Varlık Modelleri (performans ölçümü bekliyor)**: Kara/deniz varlıkları için akıcılık hedeflenir; gerçek cihaz ölçümü olmadan 60 FPS garantisi verilmez.
  - Birlikler ve lordlar denize (Boğazlar, Ege, Karadeniz, Akdeniz) açıldıklarında otomatik olarak **Minyatür Osmanlı Kadırgası (Yelkenli Gemi)** modeline dönüşür, su dalgası izi bırakır.
  - Karaya çıktıklarında atlı sancak beyi siluetine dönerler.
- **Dinamik & Rastgele Olay Motoru**:
  - Sabit kriz sırası yerine 1440 çağına uygun rastgele havuzdan (*Yeniçeri Bahşişi, İpek Yolu Kervanı, Şahi Topu Dökümü, Tımar Tahriri*) dinamik olasılıklarla krizler tetiklenir.
- **Gelişmiş Anadolu & Osmanlı Sancakları**:
  - Antalya (Teke Sancağı), Bursa (Hüdavendigar), Konya (Karaman), İzmir (Aydın & Saruhan), Trabzon (Canik) gibi gerçek tarihsel sancaklar, kaleiçleri ve köyleri eklendi.
- **Haritada Berrak Dost / Düşman Görsel Ayrımı**:
  - İttifaklar zümrüt yeşili sınır aurası ve kalkanlarla, savaş halindeki düşmanlar ise kırmızı sancaklar ve kesikli kırmızı sınır auralarıyla anında anlaşılır.

### 10. Android Mobil Ergonomisi, Sade Divan/Krallık Ekranı & Harita Üstü Lord Müdahalesi (✅ Tamamlandı)
- **Çift Parmak Yakınlaştırma (Pinch-to-Zoom) Yanlış Tıklama Koruması**:
  - Telefondan oynarken yakınlaştırma/uzaklaştırma veya haritayı kaydırma esnasında parmak kaldırıldığında yanlışlıkla şehre tıklanıp menünün açılması sorunu tamamen engellendi (Pinch sonrası 450ms boyunca ve 10px üzeri kaydırmalarda tıklamalar bastırıldı).
- **Dikey & Yatay (Portrait & Landscape) Ekran Tam Uyumu**:
  - Mobil cihazlarda hem dikey hem yatay tutuşta butonlar $\ge 44$px dokunmatik standartlarına uygun hale getirildi; çekmece yüksekliği yatay ekranda otomatik uyarlanarak haritayı kapatmayacak şekilde ayarlandı.
- **Sade & Net Krallıklar ve Hükümdarlar Ekranı (Divan-ı Hümayun)**:
  - Kullanıcıyı onlarca karmaşık butonla boğmayan, tek bakışta anlaşılan sade özet görünümü eklendi (`👑 Krallıklar & Hükümdarlar`).
  - Her ülkenin hükümdarı (Sultan II. Murad, İmparator XI. Konstantinos, Sultan Seyfeddin Çakmak, vb.), toplam ordu sayısı, eyalet adedi ve görevdeki lordları berrak çipler halinde listelendi.
  - Yapay zekanın da oyuncu gibi ülkesini yönettiği, devriye attığı ve sancağa toplandığı bilgisi aktarıldı. Sadece 3 net eylem: `⚔️ Savaş`, `🛡️ Pakt`, `📍 Harita`.
- **Harita Üstünden Doğrudan Lorda Saldırma & Fiili Savaş (On-Map Interception)**:
  - Haritada gezen yabancı lordun üstüne dokunulduğunda özel karşılaşma penceresi açılır: `⚔️ Bu Lorda Saldır! (Fiili Savaş Başlat)`.
  - Seçildiğinde diplomasi menüsüne girmeden fiili olarak savaş patlak verir ve Hükümdar Sancağı derhal düşman lordun peşine düşerek hücuma geçer.

### 11. AoH3 + Bannerlord Bütünleştirme: Teknolojiye Dayalı Ordu Modernizasyonu, 1440 Tarihsel Arındırma & Mobil 3-Sekmeli Eyalet Menüsü (✅ Tamamlandı)
- **Köy Gönüllüsü (`⌂+`) ve XP Terfi Sisteminin Kaldırılması**:
  - Büyük strateji ölçeğiyle çatışan köyden gönüllü toplama ve bireysel XP terfi kutuları tamamen kaldırıldı; oyun tek bir tutarlı **Büyük Strateji + Tımar/Sancak** kimliğinde birleştirildi.
- **Çağa Uyumlu (`1440` & `2026`) Teknoloji Ağacı ve Ulusal Ordu Modernizasyonu (`Nesil I ➔ Nesil V`)**:
  - 1440 senaryosu için tam tarihsel Teknoloji Ağacı (*Kapıkulu Nizâmı, Barutlu Arkebüz & Tabur Cengi, Şahi Darbzen Dökümhanesi, Nizâm-ı Cedîd, Tahrir Defteri, İstimalet, Sahn-ı Seman, Pîrî Reis Haritacılığı*) ve 1440 Ulusal Reformları eklendi.
  - Askeri teknolojiler açıldıkça yeni nesil birlikler (*Azap/Akıncı ➔ Yeniçeri/Sipahi ➔ Tüfekli Ocak ➔ Şahi Topçusu ➔ Nizâm-ı Cedîd*) aktifleşir ve tek tuşla **Mevcut Tüm Orduları Yeni Teknolojiye Modernize Et** sistemiyle sahadaki tüm tümenler güncellenir (+%12 ➔ +%55 Modernizasyon Gücü). Yapay zeka devletleri de teknolojisi ilerledikçe ordularını modernize eder.
- **1440 Tarihsel Komutan & Harita Etiket Temizliği**:
  - 1440 senaryosunda yabancı devletlerde modern 2026 komutan isimlerinin (*Mareşal Mete Korkmaz*, *Bey _alp*) görünmesi hatası giderildi; 16 imparatorluğun tamamına gerçek tarihsel hükümdar ve komutanlar tanımlandı.
  - Siyasi harita görünümünde uzak ölçekte garnizon ve devriye etiketlerinin üst üste binmesi temizlendi; çift kral ikonu tek pelerinli taç silüetinde birleştirildi.
- **Android Sıfır-Kaydırma (Zero-Scroll) 3-Sekmeli Eyalet Çekmecesi & Hızlı PWA Güncellemesi**:
  - Mobilde eyalet çekmecesi `⚔️ Ordu & Sefer`, `🏛️ Bina & İdare` ve `⚜️ Tımar & Vali` alt sekmelerine bölündü.
  - PWA önbelleği ~2.85 MB'dan ~736 KB'a düşürüldü ve yeni sürümleri açılışta anında kontrol eden otomatik güncelleme dinleyicisi eklendi.

### 12. Aşama 1: "Tek Dosya Tek İşlev" Modüler Mimari Dönüşümü, Zustand + IndexedDB + RBush Entegrasyonu ve Yatay/Dikey Kamera Kilidi (✅ Tamamlandı)
- **Dev Dosyaların (Monolith) Tek Sorumluluklu Modüllere Bölünmesi (1.000+ Satırlık Dosya Kalmadı)**:
  - `src/App.tsx` (`2.932` satır ➔ `312` satır): Sadece yaşam döngüsü ve ekran orkestrasyonu bıraktı; HUD bileşenleri `src/components/hud/` (`TopHudBar.tsx`, `MapModePillBar.tsx`, `BottomNavBar.tsx`, `LordEncounterModal.tsx`) altına ayrıldı.
  - `src/components/CommandDrawers.tsx` (`2.626` satır ➔ `113` satır kabuk): `src/components/drawers/` altında 8 bağımsız çekmece modülüne (`ProvinceDrawer.tsx`, `ProvinceForeignDiplomacyPanel.tsx`, `EconomyDrawer.tsx`, `DiplomacyDrawer.tsx`, `GovernmentTechDrawer.tsx`, `MilitaryDrawer.tsx`, `ArmyModernizationCard.tsx`, `drawerTypes.ts`) bölündü.
  - `src/data/world2026Data.ts` (`1.886` satır ➔ `5` satır barrel): `gameModesAndIdeologies.ts`, `techAndArmyTiers.ts`, `countries2026.ts` ve `commandersAndCrises.ts` olarak 4 veri modülüne ayrıldı.
  - `src/components/WorldMapCanvas.tsx` (`1.445` satır ➔ `384` satır): `src/map/` altında `spatialIndex.ts` (`RBush`), `useMapGestures.ts`, `mapPolygonRenderer.ts` ve `mapLabelsAndUnitsRenderer.ts` modüllerine bölündü.
- **Kritik Simülasyon Tick (Bayat State / Stale-Closure) Hatasının Giderilmesi (`src/engine/tickEngine.ts`)**:
  - Eskiden 7. gün (Bannerlord tımar güncellemesi) ve 10. gün (AI turu) aynı tick içinde eski React state referansını ezerek günlük hazine, insan gücü ve araştırma artışını sıfırlayabiliyordu. Yeni tek geçişli atomik `computeGameTick` motoru tüm aşamaları sırayla zincirleyip tek seferde güncelliyor.
- **Onaylı Hafif Kütüphane Entegrasyonları & Çöp Temizliği**:
  - **`zustand` (`src/store/useGameStore.ts` + `empireAndArmyActions.ts` + `diplomacyAndWarActions.ts`)**: Prop-drilling ve gereksiz yeniden çizimleri ortadan kaldıran merkezi state yönetimi kuruldu (Mobil JS RAM kullanımı `13.77 MB` ➔ `11.56 MB` seviyesine indi).
  - **`idb-keyval` (`src/engine/saveManager.ts`, Şema v5)**: `localStorage` 5 MB kota sınırına takılmayan asenkron **IndexedDB** kayıt motoru + eski kayıtları otomatik taşıma (migration) eklendi.
  - **`rbush` (`src/map/spatialIndex.ts`)**: Harita poligon görünürlük kırpması (viewport culling) ve dokunmatik eyalet tespiti `O(N)` yerine `O(log N)` 2D uzamsal indeks ile hızlandırıldı.
  - **Ölü Dosya & Paket Temizliği**: Kullanılmayan `.aistudio/` klasörü (~870 KB), eski kök dizin ekran görüntüleri ve kullanılmayan `@google/genai`, `dotenv`, `motion`, `autoprefixer` paketleri kaldırıldı.
- **Dikey (`Portrait`) ↔ Yatay (`Landscape`) Canlı Ekran Döndürme Coğrafi Merkez Kilidi**:
  - Telefon dikeyden yataya (veya yataydan dikeye) çevrildiğinde haritanın okyanusa kaymasını önleyen `reprojectOnResize` projeksiyon merkez koruma algoritması eklendi; hem dikey (`390x844`) hem yatay (`844x390`) modda HUD, çekmeceler ve harita sıfır taşma ile doğrulandı.

---

### 13. Aşama 2 & Mimari Sadeleştirme (1. Yol): Tek Ordu Sistemli Akıllı Harita + Derin Paşa, Tımar ve Sadakat/İç Savaş Motoru (✅ Tamamlandı)
- **Çift Ordu Karmaşasının Kaldırılması & Sıfır Gecikmeli AoH3 Harita Akışı**:
  - Harita üstünde serbest koordinatta yüzen ikinci ordu katmanı (`ActiveLordParty` / Hükümdar yürüyüş bekleme gecikmesi / lord yakalama penceresi) tamamen kaldırıldı (`-1.564` satır fazlalık kod ve görsel harita kalabalığı temizlendi; üretim paketi `212.03 kB` gzip seviyesine indi).
  - Eyalete dokunulduğu salise ekranı kaplayan büyük çekmece yerine harita üzerinde sadece kompakt hızlı aksiyon barı (`SelectedProvinceBar`) açılır; sahada **tek ve net bir ordu gerçeği** (eyalet garnizonları ve sefere çıkan ordular) bulunur.
- **Dağınık Paşa/Tımar Dosyalarının Tek Sorumluluklu `src/engine/pashaAndFiefEngine.ts` Altında Birleştirilmesi**:
  - Aşırı dosya bölünmesini önlemek adına arazi bonusları, tarihsel hükümdar/divan paşaları, idari kapasite, otonom Paşa şehir yatırımları, Paşa sadakati ve Paşa isyanı tek ve bütünlüklü bir modülde (`pashaAndFiefEngine.ts`) toplandı; eski `bannerlordEngine.ts`, `lordAllegianceEngine.ts`, `lordMapCombatEngine.ts` ve `LordEncounterModal.tsx` silindi.
- **Çok Eyaletli `A*` Akıllı Rota Planlayıcı (`src/engine/pathfindingEngine.ts` — Sıfır Ek Kütüphane)**:
  - Orduları yalnızca bitişik komşu eyalete yürütme zorunluluğu kaldırıldı. Artık haritada uzaktaki herhangi bir dost, vasal, müttefik, askeri geçiş izinli veya düşman eyalete dokunulduğunda en kısa meşru koridor `A*` algoritmasıyla hesaplanır.
  - Harita üzerinde ordunun gideceği tüm ara eyaletler **kesikli taktik güzergâh çizgisiyle** gösterilir; düşman kalesine (`Zone of Control`) girildiğinde ordu otomatik olarak 2D Taktiksel Muharebeye (`TacticalBattleModal`) tutuşur.
  - **Sancağa Çağrılan Paşalar (`35 ⚜ Nüfuz`)**: Sefer emri verildiğinde kendi şahsi muhafız birliklerini doğrudan taarruz ordusuna katarak cepheye yürür.
- **Paşa Sadakati (`♥ %0–%100`), `"🎁 İhsan & Hil'at"` ve İç Savaş / İsyan Motoru**:
  - Her Paşa/Komutan için dinamik **Sadakat (`♥ %0–%100`)** takibi eklendi: Tımar verme (`+12`), tımar azletme (`-22`), muharebe zaferi (`+6`), yenilgi (`-4`), 3+ tımar aşırı güçlenme hırsı (`-(tımar-2)*3/hafta`), yüksek vergi ve sancak yıpranması.
  - Hem **Ordugâh (`MilitaryDrawer`)** hem **Eyalet Tımar (`ProvinceDrawer`)** panellerine dikey ve yatay ekrana tam uyumlu **Sadakat Barı**, haftalık eğilim uyarısı ve **`🎁 İhsan Ver (180 Altın ➔ +18 Sadakat, +5 ⚜ Nüfuz)`** aksiyonu eklendi.
  - **Paşa İsyanı & İç Savaş**: Sadakati `%25` altına düşen tımar sahibi bir Paşa, elindeki şehirlerin garnizonlarını ayaklandırarak komşu/rakip devlete iltihak eder ve doğrudan savaş başlatır!

---

### 14. Harita Dokunma Ergonomisi (AoH3 Stili), Dikey/Yatay Okunabilirlik Cilası, Stratejik Yapay Zeka (AI) Zekâ Güncellemesi ve Eski Sistem Kalıntı Temizliği (✅ Tamamlandı)
- **Haritada Şehre Tıklayınca Koca HUD Açılmaması (`SelectedProvinceBar.tsx` + `selectTerritoryOnMap`)**:
  - Harita üzerinde herhangi bir şehre/eyalete dokunulduğunda ekranın `%75+`'ini kapatan büyük çekmece (`ProvinceDrawer`) artık **otomatik açılmaz**!
  - Bunun yerine harita %90 açık kalacak şekilde eyalet altın sınırla vurgulanır ve altta kompakt **Hızlı Eyalet Çubuğu (`SelectedProvinceBar`)** belirir: `[⚔️ Sefer Başlat]` ile çekmece açmadan doğrudan `A*` yürüyüş emri verilebilir, `[🏛️ Yönet / 🔍 Diplomasi & İncele]` ile yalnızca istendiğinde detaylı çekmece açılır, denize/okyanusa veya `[✕]` butonuna basıldığında seçim kapanır.
- **Harita Sınır Estetiği, Ülke Adları ve Çift Yıldız (`★ ★`) Hatasının Giderilmesi**:
  - Başkent isimlerindeki çift yıldız (`★ ★ Payitaht Edirne`) hatası temizlenerek tek ve net `★` gösterimine geçirildi.
  - Oyuncu ülkesinin iç eyalet sınırlarındaki göz yoran parlak beyaz çizgiler yumuşak parşömen-altın tona çekilerek imparatorluğun tek parça, bütünlüklü görünmesi sağlandı; seçili eyalet için komşu poligonların üstüne çizilen kesintisiz altın çerçeve eklendi.
  - Uzak/stratejik zoom seviyesinde (`Cinzel` serif büyük harflerle **OSMANLI DEVLETİ**, **TİMUR İMPARATORLUĞU**, **ALTIN ORDA**) ülke adları, yakınlaşıldığında ise eyalet adları ve garnizon kalkanları görünecek şekilde LOD geçişi iyileştirildi.
- **Dikey (`Portrait`) ve Yatay (`Landscape`) Mobil HUD Sıfır Kesilme (Zero-Truncation) Düzeni**:
  - Dikey modda daha önce sağdan kesilen Ana Menü `Başlat` butonu, üst bardaki **Tarih / İnsan Gücü / Ordu / Bilim** göstergeleri, harita modu barındaki `Askeri` sekmesi ve alt navigasyon etiketleri (`Eyalet · Ekonomi · Diplomasi · Yönetim · Ordugâh`) sıfır taşma ve sıfır üç-nokta (`...`) kesilmesiyle yeniden düzenlendi.
- **Akıllı Yapay Zeka (`src/engine/aiAndRebellionEngine.ts`) Güncellemesi**:
  - **Çağa Uygun Teknoloji (`1440` vs `2026`)**: Yapay zekanın `1440` modunda yanlışlıkla `2026` teknoloji ağacını kullanması düzeltildi (`getTechTreeForMode(gameMode)`).
  - **İntihar Saldırılarının Önlenmesi & İttifak Gücü Hesabı**: AI artık savaş ilan etmeden önce tek bir sınır garnizonuna değil, iki tarafın **toplam imparatorluk + savunma/saldırı paktı müttefik ordularının gücüne** bakar; aktif savaşta da kendisinden çok daha güçlü kalelere körlemesine küçük birlikler gönderip intihar etmez.
  - **İç İdare, Asimilasyon, Bina Yatırımı ve `A*` Cephe Kaydırma**: AI yüksek huzursuzluklu (`>=55`) eyaletleri asimile eder, barış döneminde fazla hazinesiyle ekonomik/bilimsel binalar (`factory`, `tradeHub`, `university`, `barracks`, `fortress`) inşa eder ve iç bölgelerdeki yedek ordularını `A*` ile cepheye kaydırır.
  - **AI-AI Barış Antlaşmaları**: Kesin üstünlük (`>=60` gün ve `|warScore| >= 45`) veya uzun yıpratma (`>=160` gün) durumunda AI devletler savaş tazminatı ve `140` günlük ateşkes antlaşması imzalayarak savaşı sonlandırır.
- **Eski Sistem Kalıntılarının Temizlenmesi**:
  - Yabancı eyalet diplomasi panelindeki işlevsiz/kopya eski Bannerlord `"🔥 Köyleri Yağmala"` butonu ve kullanılmayan `villageRecruitsAvailable` veri alanları kaldırıldı; manuel Divan/Kabine kararı (`triggerManualCabinetDecision`) ve Ekonomi/Diplomasi metinleri `1440` / `2026` çağına tam uyumlu hale getirildi.

---

### 15. Aşama 3: Stratejik Boğazlar, Deniz Hakimiyeti / Abluka ve Canlı Ticaret Kervanları (`src/engine/straitsAndTradeEngine.ts` — ✅ Tamamlandı)
- **9 Küresel Stratejik Boğaz & Gümrük Hakimiyeti (`STRATEGIC_STRAITS`)**:
  - Hem `1440` hem `2026` senaryolarındaki gerçek kıyı eyaletlerine bağlı 9 stratejik boğaz eklendi: **İstanbul & Çanakkale Boğazları**, **Cebelitarık Boğazı**, **Süveyş & Kızıldeniz Geçidi**, **Hürmüz & Basra Boğazı**, **Sicilya & Otranto Boğazı**, **Danimarka Sund & Baltık Boğazı**, **Manş Denizi**, **Kore & Tsuşima Boğazı** ve **Malakka Boğazı**.
  - Boğaz kıyılarından birini tutan devlet gümrük payı alır; **tüm kıyıları tutan devlet `+%25 Tam Hakimiyet Bonusu`** kazanır (`Ticaret Merkezi` binalarıyla gelir katlanır).
- **Askeri Boğaz Ablukası (`checkStraitMilitaryBlockade` + `pathfindingEngine.ts` + `tickEngine.ts`)**:
  - Deniz geçiş bağlantıları doğrudan `worldBuilder.ts` ve `scenario1440Builder.ts` komşuluk grafiğine işlendi (ayrıca `1440` alt eyalet adlandırma büyük/küçük harf eşleşmesi düzeltilerek *Kırım & Kuban Hanlığı*, *Akitanya & Bordeaux*, *Doğu Türkistan & Kaşgar* gibi tüm tarihsel adlar eksiksiz aktif edildi).
  - Savaş sırasında düşman devlete ait tahkimatlı (`>=3.500` garnizonlu) bir boğazdan transit deniz geçişi yapılmak istendiğinde **`A*` rota motoru ve hareket motoru boğaz ablukasını devreye sokar**; düşman orduları boğaz kıyısını ele geçirmeden karşıya sızamaz!
- **6 Büyük Ticaret Koridoru, Canlı Harita Kervan Akışı ve Savaşta Kervan Baskını (`TRADE_CORRIDORS`)**:
  - **Büyük İpek Yolu / Avrasya Koridoru**, **Baharat & Kızıldeniz Yolu**, **Karadeniz-Kıpçak Tahıl Hattı**, **Batı Akdeniz Hattı**, **Hansa & Baltık Deniz Hattı** ve **Doğu Asya Deniz Hattı** eklendi.
  - Harita üstünden **Ekonomi** görünümü seçildiğinde kavşaklar arasındaki ticaret hatları ve akan **canlı kervan/konvoy ışıkları + `⚓` boğaz madalyonları** ölçümlenebilir harita render’ı üzerinde çizilir (harita kalabalığı yaratmadan sıfır tıklama çakışmasıyla).
  - Düşman bir boğazı veya ambargoyu kontrol ettiğinde koridor gelirinizde **Abluka Kaybı** oluşur (`Kale` ve `İkmal Deposu` binalarıyla konvoy koruması sağlanır).
  - Aktif savaşta **Ekonomi Çekmecesi** üzerinden **`🏴‍☠️ Düşman Kervanlarına / Konvoyuna Akın Düzenle`** (`20 ⚜ Nüfuz · 1.200 İnsan Gücü` ➔ `+180..680 Altın` ganimet, düşman istikrar ve asayiş darbesi) aksiyonu eklendi.
  - Yapay zeka (`aiAndRebellionEngine.ts` + `tickEngine.ts`) artık haftalık araştırma puanı ve boğaz gümrüğü kazanır, boğaz şehirlerinde öncelikli olarak **Ticaret Merkezi ve Kale** inşa eder.

---

## BÖLÜM 4: Sıradaki Profesyonel Yol Haritası (Öncelik Sırasıyla)

### AŞAMA 4: Tak-Çıkar Özelleştirilebilirlik (Plug & Play) ve Görsel Cilalama
- [ ] **Tak-Çıkar Senaryo Kayıt Defteri (Scenario Plugin Registry)**: Tek bir veri dosyası ekleyerek yeni çağlar (`1440`, `1936 II. Dünya Savaşı`, `1962 Soğuk Savaş`, `2026 Modern`) ve oyun içi özel senaryo oluşturabilme altyapısı.
- [ ] **Sinematik Dikey/Yatay Ana Menü ve 60 FPS Harita Parşömen/Su Efektleri**.



---

## 2026-11-08 — Dar Yatay HUD Okunabilirlik Güncellemesi (✅ Tamamlandı)

- **Harita modu şeridi** artık açık bir `Harita modu` başlığı, seçili mod göstergesi ve yatay kaydırılabilir mod düğmeleri içeriyor. Böylece `Siyasi`, `Din`, `Kültür`, `Arazi`, `Diplomasi` ve diğer görünümler dar ekranda birbirine karışmıyor.
- **Hızlı işlemler şeridi** ayrı bir `Hızlı işlemler` başlığı ve `Haritada eyalete dokun` yönlendirmesiyle gruplandı. `Seçim`, `+1B Asker`, `Ekonomi Kur` ve `Kale Kur` eylemleri aynı yatay kaydırma alanında kaldı.
- **Seçili eyalet aksiyonları** dar yatay görünümde özet ve eylem grubu olarak yan yana hizalanıyor; eylemler taşarsa yatay kaydırılabiliyor. Yakınlaştırma yuvası için sağ kenarda güvenli boşluk korundu.
- **Alt aksiyon şeridi** erişilebilir `aria-label` ve aktif sekme durum bilgileriyle güncellendi; yatay modda düğmeler tek satırda, ikon + kısa etiket biçiminde gösteriliyor.
- Değişen dosyalar: `src/components/hud/MapModePillBar.tsx`, `src/components/hud/SelectedProvinceBar.tsx`, `src/components/hud/BottomNavBar.tsx`, `src/index.css`.


## 2026-11-08 — Cihaz ve Etkileşim Performans Ölçümü (🟡 Ölçüm altyapısı eklendi)

Görsel ekran görüntüsü tek başına performans kanıtı değildir. `src/utils/performanceTelemetry.ts` artık son 20 oturum için cihaz/user-agent, platform, donanım paralelliği, cihaz belleği bilgisi, device pixel ratio, viewport genişlik-yükseklik/yön bilgisi, harita etkileşimi (`pan`/`zoom`), örnek süresi, kare sayısı, ölçülen FPS ve dropped-frame oranını `localStorage` içindeki `imperium-performance-telemetry-v1` anahtarında saklar. Simülasyon için de tick örnekleri, ortalama tick süresi, p95 ve maksimum tick süresi kaydedilir.

Bu kayıtlar `WorldMapCanvas` render döngüsüne ve `App` simülasyon tick döngüsüne bağlandı. Bundan sonra 60 FPS, yalnızca gerçek cihaz + gerçek viewport + pan/zoom etkileşimi için alınmış ölçüm kaydı hedef koşulu karşılıyorsa raporlanabilir; mevcut commit için 60 FPS başarı iddiası yapılmamalıdır.


### İlk örneklem kaydı — 2026-11-08

İlk çalışan örneklemde kayıt şu şekilde oluştu: viewport `1280×1100`, yön `landscape`, DPR `1`; harita etkileşimi `zoom`, örnek süresi `5001 ms`, `284` kare, ölçülen FPS `56.8`, dropped-frame oranı `0.004`; simülasyon tick ortalaması `650 ms`, p95 `650.2 ms`, maksimum `650.2 ms` ve `6` örnek. Bu kayıt **60 FPS başarı kanıtı değildir**; tersine bu örneklemde 60 FPS’e ulaşılmadığını gösterir. Mobil `896×414` ekran görüntüsü de görsel düzen doğrulamasıdır, performans ölçümü olarak sayılmaz.


## Ürün Yönü — AOH3 Seviyesi Önceliği (2026-11-08)

Bu projenin birinci hedefi, kendi özgün fikirlerini eklemeden önce **Age of History 3 seviyesinde anlaşılır, yoğun ama düzenli bir büyük strateji deneyimi** oluşturmaktır. Bundan sonraki görsel değişikliklerde AOH3’ün harita, HUD, panel hiyerarşisi, renk kodları, bilgi yoğunluğu, buton gruplama ve dokunma davranışları referans alınacaktır. Görsel uygulamalarda önce AOH3 karşılığı kurulacak; Bannerlord hibrit unsurları ve özgün fikirler bu temel bozulmadan ikinci aşamada eklenecektir.

Uygulama sırası şöyledir: (1) mevcut build’in AOH3 görsel/UX fark analizi, (2) harita ve HUD bilgi hiyerarşisinin AOH3 standardına çekilmesi, (3) eyalet/ekonomi/diplomasi/ordu panellerinin aynı görsel sistem altında birleştirilmesi, (4) mobil ve dar yatay dokunma akışlarının doğrulanması, (5) pan/zoom/simülasyon performans ölçümlerinin gerçek cihaz ve viewport kayıtlarıyla yapılması, (6) ancak bu temel kabul edildikten sonra özgün oyun fikirlerinin ayrı ve ölçülebilir dilimler hâlinde eklenmesi.

AOH3 parity tamamlanmadan yeni dekoratif efekt, yeni hibrit mekanik veya rastgele görsel yön değişikliği eklenmeyecektir. Her görsel değişiklik için referans ekran, hedeflenen AOH3 davranışı ve mobil/dar yatay etkisi ayrıca belirtilmelidir. 60 FPS gibi performans iddiaları yalnızca ölçüm kaydıyla raporlanacaktır.

## AOH3 Karşılaştırmalı Düzeltme 01 — Eyalet Nüfusu ve Supply Depot (2026-11-08)

İlk tekil öncelik olarak ekonomi döngüsünün eyalet temelini düzelttik. Önceden `Territory.population` yalnızca dünya kurulurken atanıyor ve günlük simülasyonda hiç değişmiyordu. Bu nedenle AOH3 tarzı nüfus → manpower/ekonomi büyümesi kampanya boyunca çalışmıyordu. `src/engine/tickEngine.ts` içinde günlük nüfus büyümesi eklendi; büyüme huzursuzlukla yavaşlıyor ve `supplyDepot` seviyesiyle artıyor. Aynı binanın tanımlı yerel düzen etkisi de günlük huzursuzluk azaltımı olarak bağlandı.

Bu değişiklik yeni mekanik eklemekten çok mevcut veri modelindeki kopukluğu giderir. Production build başarılıdır. TypeScript kontrolü, bu değişiklikle ilgisi olmayan mevcut `geojson` tip paketi/implicit-any hataları nedeniyle tamamlanamamıştır ve ayrı altyapı işi olarak izlenmelidir. Bir sonraki AOH3 karşılaştırma düzeltmesine geçmeden önce bu ekonomi döngüsü için hedefli regresyon testi eklenmelidir.

### Düzeltme 01 doğrulaması

`node --import tsx --test src/engine/simulationEngine.test.ts` sonucu: **14 test geçti, 0 hata**. Misyonerlik/asayiş senaryosu artık nüfus büyümesini ve supply depot huzursuzluk etkisini birlikte doğruluyor.

## AOH3 Karşılaştırmalı Düzeltme 02 — Kaynak Uzmanlaşması ve Trade Hub Etkisi (2026-11-08)

Kaynak kartlarındaki bonus açıklamaları artık yalnızca görsel metin değil. Her kaynak türünün ülke çapında tek uzmanlaşma bonusu ekonomi hesabına bağlandı: petrol üretim, tahıl manpower, finans merkezi vergi, ticaret boğazı ticaret, yarı iletken/nadir toprak araştırma ve demir-çelik ordu bakım maliyeti etkiliyor. Aynı kaynak türü birden fazla eyalette varsa bonusun sınırsız biçimde katlanmasını önlemek için tür başına bir kez uygulanıyor; eyaletin yerel GDP çarpanı ise korunuyor.

`tradeHub` seviyeleri ayrıca ulusal günlük enflasyon artışını sınırlı biçimde azaltıyor. Böylece bina tanımındaki ekonomi ve istikrar etkisi simülasyonda karşılık buluyor. Doğrulama: `node --import tsx --test src/engine/simulationEngine.test.ts` sonucu **15 test geçti, 0 hata**; production build başarılı.

## AOH3 Karşılaştırmalı Düzeltme 03 — Diplomasi Puanı ve Eylem Koşulları (2026-11-08)

Diplomasi sistemi artık hazine altınıyla sınırsız tıklama modelinden ayrıldı. Uluslara 0–100 arası `diplomacyPoints` havuzu eklendi; oyuncunun puanı günlük +1 yenileniyor. İlişki geliştirme, hakaret, saldırmazlık, askeri geçiş, ticaret, ambargo ve savunma/saldırı paktları artık diplomasi puanı tüketiyor. Pakt imzalama mevcut ilişki koşullarını koruyor.

AOH3 karşılaştırmasıyla savaş ilanı da düzeltildi: hedefle ilişki `-30` veya daha düşük olmadan savaş açılamıyor ve savaş ilanı 10 diplomasi puanı tüketiyor. Diplomasi panelinde puan havuzu, günlük yenilenme, savaş ilişki eşiği ve maliyet görünür hâle getirildi. Doğrulama: `node --import tsx --test src/engine/simulationEngine.test.ts` sonucu **16 test geçti, 0 hata**; production build başarılı.

## AOH3 Görsel Araştırma ve HUD Sadeleştirme (2026-11-08)

Chrome üzerinden AOH3’ün diplomasi zirvesi, teknoloji ağacı, ekonomi yatırımı, eyalet/diplomasi ve bina panelleri incelendi. Ortak görsel dil: harita sürekli ana yüzey olarak kalıyor; üstte yalnızca temel kaynak ve tarih HUD’u bulunuyor; sistemler tek bir dikey giriş çubuğu veya bağlamsal panelden açılıyor; eylemler kart/ızgara içinde gruplanıyor; teknoloji ağacı tam ekran bağlantılı ilerleme ağı olarak çalışıyor; bina/ekonomi işlemleri maliyet, süre ve beklenen bonusu aynı satırda gösteriyor.

Bizim Chrome önizlememizde en belirgin yoğunluk, harita modlarının, hızlı işlemlerin ve alt navigasyonun aynı anda açık olmasıydı. İlk görsel düzeltmede `MapModePillBar` sadeleştirildi: Harita modları artık başlangıçta tek satırlık “Katmanlar” başlığı altında kapalı, hızlı işlemler de tek satırlık bağlamsal başlık altında kapalı geliyor. Seçili mod ve aktif hızlı işlem başlıkta görünür kalıyor; tıklama ile seçenekler açılıyor. Böylece işlev kaybolmadan haritanın ilk bakıştaki bilgi yükü azaltıldı.

AOH3 referans görselleri `references/aoh3/` klasöründe saklanıyor. İlk değişiklik Chrome masaüstü önizlemesinde doğrulandı; production build başarılı. Sonraki görsel dilim: AOH3’teki sol dikey sistem çubuğuna yaklaşmak için mevcut alt navigasyonu masaüstünde kompakt bir sistem rail’ine, mobilde ise yatay dokunma çubuğuna dönüştürmek; ardından eyalet panelindeki eylemleri aynı bağlamsal kart mantığıyla azaltmak.

### Sistem rail doğrulaması

Alt navigasyon masaüstünde 1280×720 Chrome görünümünde sol tarafta kompakt dikey sistem rail’i olarak doğrulandı. Eyalet, ekonomi, diplomasi, yönetim ve ordugâh girişleri ikon + kısa etiketlerle tek yerde toplandı. 896×414 dar yatay Chrome görünümünde mobil kullanıcılar için alt yatay dokunma çubuğu korundu; böylece masaüstü AOH3 hiyerarşisi ile mobil erişilebilirlik birlikte sürdürüldü.

## Mobil Seçili Eyalet Paneli Sadeleştirme (2026-11-08)

Seçili eyalet alt şeridinde normal yardımcı eylemler artık varsayılan olarak kapalı bir `Eylemler` grubunda. Savaş/kuşatma bildirimi varsa görünür kalıyor; ana bağlam düğmesi `İnşa & Eyalet` veya `İncele` olarak kalıyor. Kullanıcı `Eylemler`e dokunduğunda yalnızca o eyalete uygun Sefer, hızlı asker toplama veya Diplomasi eylemi açılıyor. Bu düzen AOH3’teki bağlamsal panel yaklaşımına daha yakın ve telefonda yatay buton sıkışmasını azaltıyor.

Chrome doğrulaması: yabancı eyalet seçimi ve Eylemler açılımı mobil viewport’ta başarılı. Production build başarılı. TypeScript kontrolü yalnızca mevcut `geojson` tip paketi eksikliği nedeniyle başarısız; yeni panel JSX hatası giderildi.

## Mobil Eyalet Yönetim Sekmeleri ve Görsel Hiyerarşi (2026-11-08)

Seçili oyuncu eyaletinin mobil yönetim panelindeki sekmeler sadeleştirildi: `Ordu` (sefer & birlik), `Ekonomi` (bina & gelir) ve `Yönetim` (tımar & vali). Sekmeler artık erişilebilir tab rolleri taşıyor, 48px dokunma hedefi kullanıyor, kısa açıklama satırı içeriyor ve panel kaydırılırken üstte sabit kalıyor. Bu yapı AOH3’teki bağlamsal sistem bölümlerine daha yakın; kullanıcı hangi kart grubunu açtığını ilk bakışta anlayabiliyor.

Chrome’da seçili eyalet paneli görsel olarak doğrulandı: eyalet özeti üstte, ordu/sefer ve bina-yatırım kartları ayrı yüzeylerde okunuyor. Production build başarılı. TypeScript kontrolündeki kalan hatalar mevcut `geojson` tip paketi eksikliğinden kaynaklanıyor.

## Mobil Ekonomi ve Bina Kartları Sadeleştirme (2026-11-08)

Eyalet ekonomi bölümündeki bina kartları mobil tarama sırasına göre yeniden düzenlendi: bina adı ve seviye, tek satır etkisi, maliyet/süre meta satırı ve kısa `Yükselt` düğmesi. Uzun genel açıklama mobilde gizlendi; geniş ekranlarda bağlam için korunuyor. İnşaat sırası varsa aynı meta satırında kalan gün, tamamlanan bina için `Tamamlandı` durumu gösteriliyor. Bölüm başlığı da `Binalar & Altyapı` olarak kısaltıldı.

Chrome’da açık eyalet paneliyle görsel doğrulama yapıldı; kartlar daha kısa, düğmeler daha anlaşılır ve alt alta taranabilir durumda. Production build başarılı. TypeScript kontrolündeki kalan hata mevcut `geojson` tip paketi eksikliğidir.

## Görsel Tema ve HUD Profesyonelleştirme Paketi (2026-11-08)

Birden fazla görsel güncelleme birlikte uygulandı ve en sonda toplu doğrulandı:

- Global HUD renk tokenları eklendi: koyu mürekkep/panel yüzeyleri, tek altın vurgu rengi, ikincil mavi, olumlu yeşil ve savaş kırmızısı. Alt navigasyon, üst HUD, harita katmanları ve diplomasi yüzeyleri bu hiyerarşiye bağlandı.
- Harita katmanları artık yalnızca metin değil; her mod ikon/glif ve renk tonuyla seçiliyor: Siyasi, Din, Kültür, Asimilasyon, Arazi, Diplomasi, Ekonomi, İdeoloji ve Askeri.
- İdeoloji seçimi görsel kartlara dönüştürüldü: ideoloji glifi, ideolojiye özgü renk, kısa açıklama, Vergi/Ordu bonus çipleri ve `AKTİF` durumu aynı kartta gösteriliyor.
- Diplomasi krallık kartlarına ulus rengi boyunca dikey durum şeridi ve ilişki durumuna göre renkli sınır eklendi. Böylece ülke kartları yalnızca metin listesi değil, hızlı okunabilir görsel istihbarat yüzeyleri oldu.
- Üst HUD ve alt navigasyon ortak yüzey/aktiflik stillerini kullanıyor; buton renkleri daha az dağınık ve daha tutarlı.

Toplu doğrulama: production build başarılı; `node --import tsx --test src/engine/simulationEngine.test.ts` sonucu 16/16 başarılı. Chrome’da harita katmanları, ideoloji kartları ve diplomasi kartları görsel olarak kontrol edildi. TypeScript kontrolü mevcut `geojson` tip paketi eksikliğinde duruyor; bu turdaki görsel dosyalarda ek TypeScript hatası yok.
