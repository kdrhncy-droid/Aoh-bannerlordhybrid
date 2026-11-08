# Video-to-repository denetimi — askerî kategori

**Kategori:** Military / askerî sistemler<br>
**İncelenen video:** *How to Play Age of History 3 – Full Tutorial.* — Warence, https://www.youtube.com/watch?v=Ur_1Rvt0BWM<br>
**Denetim tarihi:** 2026-11-08<br>
**Kapsam:** İnsan gücü ve asker alımı, birlik türleri/istatistikleri, ordu kurma ve sevk, gruplama/bölme/birleştirme, çoklu seçim, muharebe genişliği, ön/arka hat, moral, kuşatma, savaş ve nükleer silahlar. Bu not, `/home/ubuntu/Aoh-bannerlordhybrid` kaynak ağacını esas alır; uygulama kodunda değişiklik yapılmadı.

## 1. Videoda görünür olanlar — yaklaşık zaman kanıtı

Aşağıdaki zamanlar yalnızca sağlanan görsel-işitsel analiz notundan alınmıştır; bağımsız kare kare doğrulama veya kelimesi kelimesine transkript değildir.

- **02:26–02:54:** Analiz, “Recruit Regiments” panelinde insan gücü ve üç örnek birlik (Future Infantry, Future Tank, Future Drone) ile saldırı/savunma değerlerinin gösterildiğini bildiriyor. Kaynak: `references/aoh3/aoh3-video-analysis-Ur_1Rvt0BWM-raw.md:31`.
- **02:55–03:22:** Analiz, bir eyalet seçilip Shift+Click ile beşli asker alımını ve “Army deployment” penceresinde **40/40** muharebe genişliğini bildiriyor. Kaynak: aynı dosya, `:32`.
- **03:23–03:51:** Analiz, ordu panelinde moral/hız bilgisini ve birden fazla eyalet seçmeye yarayan bir araç kullanımını bildiriyor. Kaynak: aynı dosya, `:33`.
- **03:52–04:35:** Analiz, “Reorganize Units” arayüzünde yeni orduya ayırma ve Ctrl+Click ile birleştirme, ayrıca haritadaki birim işaretlerini açıp kapatma davranışını bildiriyor. Kaynak: aynı dosya, `:34`.
- **06:07–06:58:** Analiz, nükleer santral/bomba yapımı ve Ottawa ile ilişkili savaş/nükleer etkileri bildiriyor. Kaynak: aynı dosya, `:38`.
- Bu analizde gerçek bir muharebe çözümünün ön/arka hat hesabı veya kuşatma sürecinin nasıl işlediği açıkça gösterilmiş olarak raporlanmıyor. Bu nedenle bunlar videoda gözlendi diye ileri sürülmemelidir.

## 2. Depoda uygulanan davranış — arayüzden motora iz

### İnsan gücü, birlik türleri ve asker alımı

- Eyalet çekmecesi oyuncuya ait eyalette üç alım düğmesi sunuyor: `infantry` (5.000), `armor` (2.500) ve `airDrone` (1.000); her düğme maliyet ve seçili nesil adını gösteriyor. `src/components/drawers/ProvinceDrawer.tsx:529-612`.
- Çağrı zinciri çekmecedeki `onRecruitUnit` olayından Zustand eylemine ve saf alan eylemine gidiyor: `src/store/useGameStore.ts:582-593`; alan eylemi mülkiyet, hazine ve insan gücünü doğrulayıp hem ülke insan gücünü/altınını hem eyalet garnizonunu/birim bileşimini güncelliyor: `src/engine/empireAndArmyActions.ts:154-224`.
- Depodaki birlik modeli üç sayısal yığından oluşuyor; `UnitType` ve `UnitComposition` bunu açıkça tanımlıyor: `src/types/game.ts:51-57`. Nesil verisi adları ve toplam modernizasyon savaş bonusunu tutuyor, birim başına saldırı/savunma statı tanımlamıyor: `src/data/techAndArmyTiers.ts:355-366`, `:368-492`. Bu yüzden depo, analiz notundaki örnek AOH3 saldırı/savunma kartlarının birebir karşılığı değildir.

### Ordu kurma, bölme/birleştirme ve yürüyüş

- Depoda ayrı, kalıcı bir “ordu yığını” varlığı yerine ordu gücü eyaletin `garrison` ve `units` alanlarında; haritadaki sefer ise `ArmyMovement` nesnesi olarak modellenir. `src/types/game.ts:150-168`, `:342-353`.
- Oran seçicisi eyalet garnizonunun %25/%50/%75/%100’ünü yürüyüşe ayırır; yürüyüş, haritadan hedef seçme veya komşu hedef düğmesiyle başlatılır. `src/components/drawers/ProvinceDrawer.tsx:615-690`. Harita hedef seçimi, etkin kaynak eyaletten `executeArmyMove` çağırır: `src/components/WorldMapCanvas.tsx:130-151`.
- `executeArmyMoveDomain`, yalnızca oyuncu kontrolündeki kaynak eyaletten hareketi kabul eder, tarafsız yabancı eyalete savaş ilanı onayı ister, A* rota bulur, seçilen oranın asker/birim bileşimini kaynağın garnizonundan çıkarıp harekete ekler. `src/engine/empireAndArmyActions.ts:533-635`, `:714-769`; çok adımlı rota ve ara eyalet geçişi `src/engine/pathfindingEngine.ts:24-75`, `:90-155` ve `src/engine/tickEngine.ts:211-283`.
- Kaynak ağacında “reorganize/split/merge” işlevi veya Ctrl+Click ile ayrı orduları birleştiren bir arayüz bulunamadı. Mevcut kanıt, kaynak eyalet garnizonunun bir oranını sevk eden modeldir; bu nedenle AOH3 videosundaki bağımsız birlik yığınlarını bölme/birleştirme işlevi burada **eşleşmiyor / uygulanmış görünmüyor**. Kaynak-model dayanakları: `src/types/game.ts:150-168`, `:342-353`; sevk oranı: `src/components/drawers/ProvinceDrawer.tsx:615-653`.
- Harita tekerleği yalnızca imleç çevresinde yakınlaştırma/uzaklaştırma yapıyor (`src/map/useMapGestures.ts:189-208`); fare basılı tutma/tap seçimi tek bir poligon kimliğine gider (`src/map/useMapGestures.ts:149-187`, `src/components/WorldMapCanvas.tsx:130-151`). Çoklu eyalet seçimi için orta tuş/brush/ordu gruplama yolu saptanmadı.

### Savaş, genişlik, hatlar, moral ve kuşatma

- Savaş nesnesi tarafların asker/birim sayılarını, isteğe bağlı `combatWidth`, morali ve ön/arka hat sayılarını taşır. `src/types/game.ts:318-340`.
- Düşman eyalete varış, garnizon varsa araziye göre muharebe genişliği (12.000–35.000) belirleyerek canlı harita muharebesi başlatır; savunmacı ve saldırgan birlik bileşimini ön hat (piyade+zırhlı) / arka hat (airDrone) olarak yazar. `src/engine/tickEngine.ts:329-401`.
- Muharebe turları ön hattı genişlikle sınırlar, arka hat `airDrone` gücünü ayrı katsayıyla hesaba katar, kayıplara bağlı moral şoku ve duvar hasarı üretir. `src/engine/tickEngine.ts:440-543`; devam eden savaş state’i ve hat değerleri güncellenir: `:554-581`. Arayüz genişliği, moral ve hat sayılarını gösterir: `src/components/AoH3BattleOverviewModal.tsx:49-73`, `:100-105`, `:175-211`.
- Kale garnizonsuz fakat tahkimatlıysa varış kuşatma başlatır: `src/engine/tickEngine.ts:402-423`. Günlük kuşatma ilerlemesi garnizon/kuşatma kuvveti, topçu oranı ve kale direncinden hesaplanır; tamamlanınca eyalet ele geçirilir: `src/engine/tickEngine.ts:768-865`. Yabancı eyalet panelinde bombardıman eylemleri bulunur (`src/components/drawers/ProvinceForeignDiplomacyPanel.tsx:55-110`); uygulama maliyet ve komşu cephe kontrolüyle sur/garnizon değerlerini değiştirir (`src/engine/empireAndArmyActions.ts:909-998`).
- Savaşta oyuncuya taktik emirleri (Turan, bombardıman, geri çekilme) sunulur: `src/components/AoH3BattleOverviewModal.tsx:315-353`; durum eylemi bunları mevcut muharebeye/kuşatmaya yönlendirir: `src/store/useGameStore.ts:273-340`.
- Savaş ilanı, katılımcı/müttefikleri ve hareketi günceller; tarafsız yabancı hedef için bekleyen onay davranışı vardır. `src/engine/empireAndArmyActions.ts:578-607`, `:642-706`; varlık modeli `src/types/game.ts:305-316`.

## 3. Eksik, tamamlanmamış veya referansla uyuşmayan davranışlar

- **Ayrı ordu yığınlarının kurulması ve yeniden düzenlenmesi:** Videoda bildirilen bağımsız ordu/stack bölme-birleştirme iş akışı ile depodaki eyalet garnizonundan oranlı kuvvet yürütme iş akışı aynı sistem değildir. Yukarıdaki `Territory`/`ArmyMovement` modelinde ayrı ordu kimliği veya yığın düzenleme alanı yoktur. Bu, video referansına göre kapsam uyuşmazlığıdır; AOH3’teki özelliğin projede mutlaka bulunması gerektiği varsayılmamalıdır.
- **Çoklu eyalet seçimi:** Video analizinde mouse-wheel aracıyla çoklu seçim bildiriliyor; depodaki wheel handler yalnızca zoom, canvas seçim callback’i ise tek hit eyaletidir. Bu nedenle raporlanan çoklu seçim davranışı projede eşdeğer görünmüyor (`src/map/useMapGestures.ts:189-208`; `src/components/WorldMapCanvas.tsx:130-151`).
- **Birim stat kartları:** Video analizinde verilen Future Infantry/Tank/Drone saldırı-savunma değerleri ile depodaki üç kategori + modernizasyon bonusu veri modeli uyuşmuyor (`src/types/game.ts:51-57`; `src/data/techAndArmyTiers.ts:355-366`). Mevcut UI asker tiplerini, alım miktarını ve maliyeti gösteriyor; saldırı/savunma sayıları bu alım düğmelerinde yok (`src/components/drawers/ProvinceDrawer.tsx:549-612`).
- **Nükleer silahlar:** Depo kaynak ağacında nükleer bomba/reaktör/ateşleme eylemi veya nükleer durum alanı saptanmadı (ör. askerî teknoloji ağacı `src/data/techAndArmyTiers.ts:7-47`, ülke alanları `src/types/game.ts:257-288`). Bu, bu projede uygulama bulunamadığına dair kaynak denetimi sonucudur; AOH3’te özelliğin eksik olduğu iddiası değildir.

## 4. Bozuk/yanlış davranış

- **P2 — Taktik bombardıman 200 askerin altındaki düşman kuvvetini artırabilir (doğrulanmış kod yolu).** `BOMBARD` için `hit = min(enemyTroops - 200, round(enemyTroops * 15%))` hesaplanıyor; sonra hedef kuvvet `max(200, enemyTroops - hit)` yapılıyor. Düşman 200’ün altına düştüyse `hit` negatif olabilir ve sonuç kuvveti 200’e yükseltir. Örneğin 180 asker için `hit = -20`; yeni kuvvet 200 olur. Bu emir muharebe penceresinden tetiklenebiliyor (`src/components/AoH3BattleOverviewModal.tsx:333-340`), kırılgan hesap ve iki tarafın seçimi store’da `src/store/useGameStore.ts:325-336`. Bu, “düşman saflarını vurma” davranışıyla çelişen somut bir artış yoludur.
- Proje kontrolü sırasında `npm run lint` (`tsc --noEmit`) başarıyla tamamlandı; bu statik kontrol yukarıdaki çalışma zamanı kenar durumunu yakalamıyor. Paket betikleri `package.json:6-11`.

## 5. Projede olup bu videoda gözlenmeyen askerî özellikler

- Araziye göre muharebe genişliği, ön/arka hat sayımı ve morale bağlı canlı çatışma çözümü (`src/engine/tickEngine.ts:440-543`; `src/types/game.ts:318-340`).
- Kale/sur sağlığına bağlı kuşatma, kuşatma ilerlemesi ve ayrı bombardıman eylemleri (`src/engine/tickEngine.ts:768-865`; `src/engine/empireAndArmyActions.ts:909-998`).
- Oyuncu muharebe taktik emirleri ve geri çekilme (`src/components/AoH3BattleOverviewModal.tsx:315-353`; `src/store/useGameStore.ts:273-340`).
- A* çok eyaletli yürüyüş, askeri erişim/yabancı ülke geçiş kuralları ve savaş ilanı onayı (`src/engine/pathfindingEngine.ts:24-75`, `:90-155`; `src/engine/empireAndArmyActions.ts:578-635`).
- Komutan/genel sistemi, ordu modernizasyonu ve iki oyun modu için asker nesilleri (`src/components/drawers/MilitaryDrawer.tsx:40-98`; `src/data/techAndArmyTiers.ts:368-492`). Bunlar AOH3 videosunda aynı biçimde bulunduğu varsayılarak değil, proje ekstraları olarak kaydedilmiştir.

## 6. Görsel / varlık sorunları

- Kod incelemesinde bu kategoride doğrulanmış bir görünür görsel/varlık kusuru saptanmadı; uygulama ekranı üzerinde ayrıca görsel QA yapılmadı. Asker kartları özel inline SVG çizimleri kullanıyor (`src/components/illustrations/AoH3Illustrations.tsx:192-272`).
- Sağlanan analiz, AOH3’te bazı uzun ipuçlarının alttaki düğmelerle örtüşebildiğini bildiriyor (`references/aoh3/aoh3-video-analysis-Ur_1Rvt0BWM-raw.md:71-75`); bu, hedef videoya ilişkin bağımsız olarak doğrulanmış ekran incelemesi değildir ve depo kusuru olarak yansıtılmamıştır.

## 7. Belirsizlikler ve kanıt sınırları

- Sağlanan analiz başlığı videoyu genel olarak “Age of History 3 Tutorial” diye adlandırırken YouTube sayfası tam başlığı *How to Play Age of History 3 – Full Tutorial.* olarak ve üreticiyi **Warence** olarak veriyor (`references/aoh3/aoh3-video-analysis-Ur_1Rvt0BWM-raw.md:12-19`; `/home/ubuntu/page_texts/www.youtube.com_watch_v_Ur_1Rvt0BWM.md:1-17`). Analizdeki “Creator: Unstated” bilgisi YouTube sayfası metaverisiyle çelişir.
- Analiz süresini **06:58** verirken bir satırda diplomasi/savaş için **07:02** zamanını da verir (`references/aoh3/aoh3-video-analysis-Ur_1Rvt0BWM-raw.md:17`, `:55`). Bu nedenle tüm video zamanları yaklaşık yön bulma işaretleridir; 07:02 gözlemi süre beyanıyla tutarsızdır.
- Aynı dosya, aracın görsel-işitsel analiz yaptığını ve kelimesi kelimesine transkript olmadığını açıkça belirtir (`references/aoh3/aoh3-video-analysis-Ur_1Rvt0BWM-raw.md:8-9`). “Spoken Quotes” bölümü bağımsız transkript/alıntı doğrulaması değildir; birebir söz olarak kanıt gösterilmemelidir.
- Bir sistemin seçilen tek videoda görülmemesi, AOH3’te veya projede bulunmadığını ispatlamaz. Özellikle nükleer durum için bu not yalnızca deponun incelenen kaynaklarında uygulama bulunamadığını söyler.
- `references/aoh3/UI-RESEARCH-2026-11-08.md:15-21` AOH3 kaynaklarından ordu ön/arka hat farkını ve teknoloji/açılan birim ilişkisini genel olarak destekler; ancak bu askerî işlevler için ek kanıt değildir ve bu nottaki depo tespitlerinin yerine geçmez.
