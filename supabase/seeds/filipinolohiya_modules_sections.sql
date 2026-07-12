-- ============================================================
-- Filipinolohiya, Modules & Sections
-- Subject ID: 10000000-0001-0001-0002-000000000004
-- Run after migration 002 and 1st_year_subjects.sql
-- ============================================================

DELETE FROM modules WHERE subject_id = '10000000-0001-0001-0002-000000000004';

INSERT INTO modules (id, subject_id, title, slug, sort_order) VALUES
  ('a2000004-0001-0001-0002-000000000001','10000000-0001-0001-0002-000000000004','Kabanata 1: Kamalayan, Kultura, at ang Kasaysayan ng Kolonyal na Edukasyon','kabanata-1-kamalayan-kultura',1),
  ('a2000004-0001-0001-0002-000000000002','10000000-0001-0001-0002-000000000004','Kabanata 2: Mga Batayang Perspektibo sa Indihenisasyon ng Kaalaman','kabanata-2-perspektibo',2),
  ('a2000004-0001-0001-0002-000000000003','10000000-0001-0001-0002-000000000004','Kabanata 3: Filipinolohiya, Pambansang Industriyalisasyon, at Kaunlaran','kabanata-3-industriyalisasyon',3);

-- ============================================================
-- KABANATA 1: Kamalayan, Kultura, at ang Kasaysayan ng Kolonyal na Edukasyon
-- ============================================================

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('a2000004-0001-0001-0002-000000000001','content','Ang Konsepto ng Kamalayan at Kulturang Pilipino',$md$
Ang kasaysayan ng Pilipinas ay malalim na nakaugat sa mahabang panahon ng pananakop ng iba't ibang dayuhang kapangyarihan. Ang karanasang ito ay hindi lamang nagpabago sa pisikal at materyal na kalagayan ng bansa, kundi nag-iwan din ng malaking marka sa kolektibong pag-iisip o **kamalayan** ng mga mamamayan. Ang epekto ng kolonisasyon ay patuloy na makikita sa kasalukuyang sistemang pangkultura, pang-ekonomiya, at pampolitika ng bansa.

Isang malinaw na halimbawa nito ay ang pagpapanatili ng wikang banyaga (gaya ng Ingles) bilang pangunahing midyum sa akademikong diskurso at mga opisyal na transaksyon. Dahil dito, nagkakaroon ng limitasyon ang pag-unlad ng pambansang wika at iba pang katutubong wika sa kapuluan. Kapag nabubusot ang potensyal ng sariling wika, naaapektuhan nito ang buong kultura, na nagiging dahilan upang lumabo ang pagkaunawa ng mga mamamayan sa kanilang sariling pagkakakilanlan at ang kanilang tungkulin sa bayan.
$md$, 1),

('a2000004-0001-0001-0002-000000000001','content','Ang Estratehiyang "Unawa at Salakay"',$md$
Noong panahon ng kolonyalismong Espanyol, ginamit ng mga mananakop ang estratehiya ng masusing pag-aaral sa kultura at pamumuhay ng mga katutubo bago ito tuluyang baguhin o manipulahin. Sa pamamagitan ng dokumentasyon at pagtatala ng mga gawi, tradisyon, pagkain, at relihiyon ng mga sinaunang Pilipino, naging mas madali para sa mga dayuhan na pasukin at baguhin ang kamalayan ng mga lokal na komunidad.

Bago ang kolonisasyon, walang iisang pambansang wika o sentralisadong konsepto ng isang buong bansa. Ang pamumuhay ay nakasentro sa magkakahiwalay na pangkat o rehiyon na may kanya-kanyang wika at kultura. Ginamit ng mga Espanyol ang pag-aaral sa mga wikang ito upang ipalaganap ang Kristiyanismo, na nagpakilala ng isang bagong kamalayan. Ang prosesong ito ay nagbunsod upang unti-unting magbago ang pagtingin ng mga katutubo sa kanilang sarili, kung saan ang kultura at identidad ng mananakop ang itinuring na superyor at ang katutubong gawi naman ay ipinalabas na mababa o negatibo.
$md$, 2),

('a2000004-0001-0001-0002-000000000001','content','Ang Kasaysayan ng Pagbubura sa Tala ng Bayan',$md$
Isang malaking hamon sa pag-unawa sa sinaunang kasaysayan ng Pilipinas ay ang paraan ng pagsulat ng mga kolonyalista. Sa kanilang mga opisyal na dokumento, madalas na hindi isinasama ang aktwal na karanasan at boses ng mga katutubo, maliban na lamang kung ang mga ito ay ipinapakita sa negatibong paraan upang bigyang-katwiran ang pananakop.

Gayunpaman, sa likod ng mga dokumentong ito, makikita ang mga patunay ng matinding paglaban at kabayanihan ng mga katutubo. Ang maagang kasaysayan ng bansa ay may sariling sigla bago pa man dumating ang mga dayuhan, at ang katatagan ng kulturang Pilipino ay naging dahilan upang magbago rin ang ilang polisiya ng mga mananakop batay sa reaksyon ng mga mamamayan.
$md$, 3),

('a2000004-0001-0001-0002-000000000001','content','Ang "Lisyang Edukasyon" sa Ilalim ng Pamamalaging Amerikano',$md$
### Edukasyon Bilang Armas ng Pagsupil

Kung relihiyon ang naging pangunahing kasangkapan ng mga Espanyol, edukasyon naman ang ginamit ng mga Amerikano upang sakupin ang rebolusyonaryong kamalayan ng mga Pilipino. Ginamit ang sistema ng pampublikong paaralan upang payapain ang mga mamamayan at palitan ang kanilang mga likas na mithiin ng mga kaisipang banyaga.

### Ang Papel ng Wikang Ingles

Ang pagpapatupad ng Ingles bilang wikang panturo ay nagsilbing pader na naghiwalay sa mga Pilipino sa kanilang kasaysayan at naglikha ng malaking agwat sa pagitan ng mga nakapag-aral (elite) at ng masa. Dahil dito, natutunan ng mga Pilipino ang kasaysayan at pamumuhay ng ibang bansa habang itinuturing na mga salarin o tulisan ang sarili nilang mga bayani na lumaban sa pananakop.

### Oryentasyong Pang-agrikultura at Kawalan ng Industriya

Itinanim ng kolonyal na edukasyon ang pananaw na ang Pilipinas ay isang bansa na nakalaan lamang para sa agrikultura. Ang larawang ito ay nagbunsod ng pagwawalang-bahala at takot sa industriyalisasyon, na nagpanatili sa bansa bilang tagaluwas ng mga murang hilaw na materyales at tagabili ng mga mamahaling yaring produkto mula sa labas.

### Hadlang sa Tunay na Demokrasya

Dahil ang wika ng pamumuno at batas ay Ingles, ang masa ay nahihirapang unawain ang mga suliraning pambansa. Ito ay nagbubunsod ng kawalan ng malay, rehiyonalismo, at pag-asa na lamang sa mga tradisyunal na lider sa halip na magkaroon ng aktibong pakikilahok sa pamamahala.
$md$, 4);

-- ============================================================
-- KABANATA 2: Mga Batayang Perspektibo sa Indihenisasyon ng Kaalaman
-- ============================================================

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('a2000004-0001-0001-0002-000000000002','content','Sikolohiyang Pilipino (SP)',$md$
Ipinakilala ito bilang pag-aaral ng "diwa" na nakabatay sa aktwal na karanasan, kamalayan, at oryentasyon ng mga Pilipino, na malalim na nakakabit sa wika at kultura ng bansa. Tinututulan nito ang ideya na ang mga teoryang Kanluranin ay unibersal at direktang mailalapat sa mga Pilipino. Gumagamit ito ng mga katutubong metodolohiya sa pananaliksik na nakabatay sa pakiramdam at pakikipagkapwa, gaya ng:

- **Pakapa-kapa**, Isang eksploratoryong pamamaraan kung saan nagpapakiramdam ang mananaliksik sa konteksto ng komunidad nang walang paunang hinuha.
- **Pagdalaw-dalaw**, Ang paulit-ulit at impormal na pagbisita sa mga kalahok upang makuha ang kanilang tiwala at tunay na saloobin.
$md$, 1),

('a2000004-0001-0001-0002-000000000002','content','Pilipinolohiya bilang Disiplina',$md$
Isang disiplina na naglalayong magsaliksik at bumuo ng kaalaman tungkol sa Pilipinas mula sa "loob" at gamit ang sariling kultura. Kaiba ito sa tradisyunal na **Philippine Studies** na madalas ay nakatuon lamang sa Pilipinas bilang isang paksa o obheto ng pag-aaral (area studies) para sa kapakinabangan at pangangailangan ng mga banyagang institusyon.
$md$, 2),

('a2000004-0001-0001-0002-000000000002','content','Pantayong Pananaw (PP)',$md$
Isang diskursong pangkabihasnan na nakabatay sa panloob na pagkakaugnay-ugnay ng mga katangian, halagahin, kaalaman, at karanasan ng isang kultura na ipinapahayag sa pamamagitan ng sariling wika. Binibigyang-diin nito ang komunikasyon ng mga Pilipino para sa kapwa Pilipino (perspektibong **"tayo"**), sa halip na magpaliwanag o magdepensa ng sarili sa mga dayuhan (perspektibong **"pangkami"**) gamit ang banyagang wika. May **PP** lamang ang isang lipunan kung ang lahat ng mamamayan ay gumagamit ng mga konsepto at kodigo na alam ng lahat ang kahulugan.
$md$, 3),

('a2000004-0001-0001-0002-000000000002','content','Filipinolohiya bilang Akademikong Disiplina',$md$
Isang sistema at akademiko at praktikal na disiplina ng karunungan na nakasalig sa makaagham na pagsusuri sa pinagmulan, kalikasan, at ugnayan ng wika, panitikan, kultura, lipunan, komunikasyon, at kasaysayan ng Pilipinas. Nilalayon nitong sinupin ang mga **"karanasang bayan"** (mga praktikal at pang-araw-araw na danas ng mga mamamayan) upang maproseso ito bilang **"talinong bayan"** (makaagham at sistematikong kaalaman) na gagabay sa pambansang pag-unlad.
$md$, 4),

('a2000004-0001-0001-0002-000000000002','content','Paghahambing ng mga Perspektibo',$md$
| Perspektibo | Pangunahing Tuon | Wika bilang Instrumento |
|---|---|---|
| **Sikolohiyang Pilipino** | Pag-aaral ng diwa, pakiramdam, at katutubong pag-uugali. | Katutubong wika bilang susi sa pag-unawa sa panloob na kalagayan ng tao. |
| **Pilipinolohiya** | Pagsusuri ng kasaysayan at lipunan mula sa sariling kultura at karanasan. | Wikang Filipino bilang pangunahing daluyan ng teorya at pananaliksik. |
| **Pantayong Pananaw** | Panloob na talastasan ng sariling kabihasnan nang walang dayuhang panghihimasok. | Paggamit ng sariling wika upang magkaunawaan ang iba't ibang pangkat sa bansa. |
| **Filipinolohiya** | Pagsasapraktika ng talino tungo sa pagtatatag ng pambansang industriya. | Wika bilang pundasyon ng pagkatuto, agham, at pambansang pagpapalaya. |
$md$, 5);

-- ============================================================
-- KABANATA 3: Filipinolohiya, Pambansang Industriyalisasyon, at Kaunlaran
-- ============================================================

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('a2000004-0001-0001-0002-000000000003','content','Ano ang Pambansang Industriyalisasyon?',$md$
Ang **Pambansang Industriyalisasyon** (National Industrialization) ay ang proseso ng pagtatatag at sistematikong pagpapaunlad sa iba't ibang antas ng mga lokal na industriya upang pasiglahin ang ekonomiya, tugunan ang pangangailangan ng mamamayan, at baguhin ang bansa mula sa pagiging atrasadong agraryan patungong isang modernong industriyal na lipunan.

Upang maging ganap ang pag-unlad ng isang bansa, kinakailangan ang sabay at planadong pagpapatatag sa tatlong pangunahing antas ng industriya:

- **Mabigat na Industriya (Heavy Industries)**, Ito ang pundasyon ng ekonomiya. Lumilikha ito ng mga kagamitang pamproduksyon, makinarya, bakal, kemikal, at enerhiya na ginagamit para sa iba pang industriya.
- **Intermedyong Industriya (Medium Industries)**, Gumagawa ng mga ekstrang bahagi (spare parts), kable, at mga semi-prosesong materyales na kailangan sa pagbuo ng mga makina.
- **Magaang Industriya (Light Industries)**, Nagpoproseso ng mga produktong pangkonsumo para sa pang-araw-araw na pangangailangan ng buong bayan (gaya ng pagkain, damit, gamot, at kagamitan sa bahay).
$md$, 1),

('a2000004-0001-0001-0002-000000000003','content','Ang Ugnayan ng Agrikultura at Industriya',$md$
Ang pagpapatupad ng tunay na reporma sa lupa ang nagsisilbing pangunahing basehan ng industriyalisasyon. Sa pamamagitan ng mekanisasyon at modernisasyon ng pagsasaka, napapataas ang produktibidad ng mga bukirin. Ang maunlad na agrikultura ay nagbibigay ng dalawang mahalagang bagay sa bansa:

- Sapat at murang pagkain para sa mga mamamayan.
- Tuluy-tuloy na suplay ng mga lokal na hilaw na materyales para sa mga pambansang pabrika nang hindi umaasa sa pag-import mula sa ibang bansa.
$md$, 2),

('a2000004-0001-0001-0002-000000000003','content','Mga Rekursong Pang-ekonomiya ng Pilipinas',$md$
May sapat at mayayamang rekurso ang Pilipinas upang maging isang industriyal na bansa:

- **Yamang Lupa**, Milyun-milyong ektarya ng matabang lupain na angkop sa pagtatanim ng palay, mais, niyog, tubo, at iba pang pananim.
- **Yamang Tubig**, Malawak na karagatan, daan-daang ilog, at mga lawa na mapagkukunan ng isda, irigasyon, transportasyon, at enerhiya.
- **Yamang Mineral**, Isa sa may pinakamalaking reserba ng mga mineral sa buong mundo, kabilang ang ginto, tanso, nickel, at chromite na mahahalagang sangkap sa mabigat na industriya.
- **Enerhiya**, Mayaman sa mga likas na pinagmumulan ng kuryente gaya ng natural gas, geothermal, hydropower, solar, at wind energy.
- **Yamang Tao**, Milyun-milyong skilled workers, propesyonal, at mga manggagawa na kilala sa buong mundo sa kanilang kahusayan at kakayahan sa produksyon.
$md$, 3),

('a2000004-0001-0001-0002-000000000003','content','Ang Balangkas ng Pagpapatupad ng Filipinolohiya',$md$
Ang proseso ng pagpapatupad ng Filipinolohiya tungo sa pambansang kaunlaran ay maaaring i-grap sa ganitong estruktura:

```
[Karanasang Bayan] ──► [Sisinupin ng Sistema ng Edukasyon] ──► [Talinong Bayan]
(Wika, Tao, Kultura,  (Proseso, Dokumentasyon,             (Makaagham at Lapat
 Likas na Yaman)       Siyentipikong Balangkas)              na Karunungan)
                                                                    │
                                                                    ▼
[Pambansang Kaunlaran] ◄── [Paglikha ng mga Pangangailangan] ◄── [Karunungang Gagabay]
(Tunay na Kalayaan,        (Industriya, Trabaho,             (Polisiyang Kultural,
 Maunlad na Lipunan)        Polisiyang Pang-ekonomiya)        Pulitikal, Ekonomikal)
```
$md$, 4),

('a2000004-0001-0001-0002-000000000003','activity','Gawaing Pampanitikan: Tula ng Pagkakakilanlan',$md$
**Instruksyon:** Pumili ng isa o kombinasyon ng mga sumusunod na paksa at sumulat ng isang orihinal na tula na may 3 hanggang 4 na saknong. Maaari itong maging malayang taludturan o may sukat at tugma. Lagyan ito ng sariling pamagat.

**Mga Paksa:**
- Wikang Filipino at Pambansang Pag-unlad
- Pagpapalaya ng Kamalayan
- Edukasyong may Katuturan
- Pagpapahalaga sa Identidad
$md$, 5),

('a2000004-0001-0001-0002-000000000003','activity','Pagsasanay 1: Pagpoproseso ng Karanasang Bayan (Analitikal na Talahanayan)',$md$
Gagabayan ka ng analitikong balangkas ng Filipinolohiya upang maitawid ang mga katutubong pamamaraan patungo sa isang siyentipiko at pambansang kapakinabangan. Suriin ang halimbawa sa ibaba at punan ang mga sumusunod na bilang:

**Halimbawa:**

- **Karanasang Bayan:** Paggamit ng dahon ng Tawa-tawa bilang tradisyunal na panggagamot sa mga may dengue.
- **Proseso ng Filipinolohiya:** Pagsasagawa ng parmasyutikong pananaliksik upang patunayan sa siyentipikong paraan ang kakayahan nitong magpataas ng platelets, na nagbunsod sa paggawa ng mga modernong gamot na aprubado ng FDA.

**Gawain:** Magbigay ng tatlong (3) sariling halimbawa ng karanasang bayan sa Pilipinas (mula sa kultura, agrikultura, medisina, o lokal na teknolohiya) at ipaliwanag kung paano ito mapoproseso gamit ang makaagham na oryentasyon upang makatulong sa pambansang industriya.

| # | Karanasang Bayan (Tradisyunal/Lokal na Gawi) | Proseso ng Filipinolohiya (Makaagham na Pagsisinop at Pagpapaunlad) |
|---|---|---|
| 1 | | |
| 2 | | |
| 3 | | |
$md$, 6),

('a2000004-0001-0001-0002-000000000003','activity','Pagsasanay 2: Kritikal na Pag-unawa sa Pambansang Industriya',$md$
Sagutin ang mga sumusunod na katanungan nang direkta at komprehensibo (3 hanggang 5 pangungusap bawat bilang):

1. Ano ang pangunahing pagkakaiba ng "Pambansang Industriyalisasyon" (NI) sa simpleng pagtatayo lamang ng mga banyagang assembly plants o economic zones sa bansa?
2. Ipaliwanag kung paano nagiging hadlang sa pag-unlad ng sariling agham at teknolohiya ang pag-asa ng bansa sa pag-import ng mga yaring produkto at makinarya.
3. Bakit itinuturing na "base" o pundasyon ng industriyalisasyon ang pagpapatupad ng tunay na reporma sa lupa at pagpapaunlad ng agrikultura?
$md$, 7),

('a2000004-0001-0001-0002-000000000003','activity','Proyekto: Pagsulat ng Sanaysay (Pinal na Kahingian)',$md$
**Instruksyon:** Pumili ng isang tiyak na aspeto ng kalinangang bayan o lokal na rekurso sa Pilipinas. Sumulat ng isang akademikong sanaysay na tumatalakay kung paano ito pauunlarin gamit ang oryentasyong Filipinolohiya upang makapaglunsad ng isang pambansang industriya.

**Mga Pamantayan sa Pagsulat:**

- **Nilalaman**, Dapat malinaw na maipakita ang ugnayan ng wika, kultura, at ekonomiya tungo sa kagalingan ng nakararaming mamamayan.
- **Bahagi**, Mayroong malinaw na Panimula, Katawan (Pagsusuri), Konklusyon, at Talaan ng mga Batayang Ginamit (References) sa dulo.
- **Haba**, Minimum na 3 pahina at maximum na 7 pahina.
$md$, 8);
