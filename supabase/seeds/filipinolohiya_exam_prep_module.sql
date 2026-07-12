-- ============================================================
-- Filipinolohiya — Paghahanda sa Eksamen: Prelim at Finals
-- Subject ID: 10000000-0001-0001-0002-000000000004
-- Module ID:  a2000004-0001-0001-0002-0000000000e1
-- Purpose: exam-prep module (study guides, practice sets, mock
--          exams with answer keys) built strictly from Kabanata 1-3
--          of filipinolohiya_modules_sections.sql
-- Idempotent: deletes only this module's row first (sections cascade),
--             then INSERT-only. Safe to re-run.
-- ============================================================

DELETE FROM modules WHERE id = 'a2000004-0001-0001-0002-0000000000e1';

INSERT INTO modules (id, subject_id, title, slug, sort_order) VALUES
  ('a2000004-0001-0001-0002-0000000000e1','10000000-0001-0001-0002-000000000004','Paghahanda sa Eksamen: Prelim at Finals','exam-prep-prelims-finals',4);

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('a2000004-0001-0001-0002-0000000000e1','content','Gabay sa Prelim: Saklaw at Plano ng Pag-aaral',$md$
### Ano ang Saklaw ng Prelim?

Karaniwang sinasaklaw ng prelim exam sa Filipinolohiya ang **Kabanata 1** (Kamalayan, Kultura, at ang Kasaysayan ng Kolonyal na Edukasyon) at **Kabanata 2** (Mga Batayang Perspektibo sa Indihenisasyon ng Kaalaman). Ang Kabanata 3 ay karaniwang lumalabas na sa finals.

### Mga Uri ng Tanong na Aasahan

| Uri | Ano ang Hinihingi |
|---|---|
| **Multiple choice** | Pagpili ng tamang depinisyon, epekto, o halimbawa ng isang konsepto. |
| **Tama o Mali** | Pagsusuri kung tumpak ang isang pahayag ayon sa aralin — bantayan ang mga salitang binaligtad. |
| **Pagtutukoy (Identipikasyon)** | Pagbibigay ng eksaktong termino mula sa depinisyon o paglalarawan. |
| **Maikling pagsusuri** | Pagpapaliwanag ng ugnayan ng dalawang konsepto sa 2 hanggang 5 pangungusap. |

### Listahan ng Dapat Kabisaduhin

**Mula sa Kabanata 1:**

- Ang epekto ng kolonisasyon sa **kamalayan** at kung paano nililimitahan ng wikang banyaga ang pag-unlad ng pambansang wika at ang pagkaunawa sa sariling pagkakakilanlan.
- Ang estratehiyang **"unawa at salakay"** — masusing pag-aaral at dokumentasyon muna ng kultura ng katutubo bago ito manipulahin.
- Ang kalagayan **bago ang kolonisasyon** — walang iisang pambansang wika; magkakahiwalay na pangkat na may kanya-kanyang wika at kultura.
- Ang **pagbubura sa tala ng bayan** — hindi isinama ang boses ng katutubo sa mga opisyal na dokumento maliban kung negatibo, upang bigyang-katwiran ang pananakop.
- Ang **"lisyang edukasyon"** sa ilalim ng Amerikano: edukasyon bilang armas ng pagsupil, ang papel ng wikang Ingles bilang pader, ang oryentasyong pang-agrikultura, at ang hadlang sa tunay na demokrasya.
- Ang pares: **relihiyon** ang kasangkapan ng Espanyol; **edukasyon** ang kasangkapan ng Amerikano.

**Mula sa Kabanata 2:**

- **Sikolohiyang Pilipino** — pag-aaral ng "diwa"; tumututol sa unibersalidad ng teoryang Kanluranin; mga metodolohiyang **pakapa-kapa** at **pagdalaw-dalaw**.
- **Pilipinolohiya** — pagbuo ng kaalaman mula sa "loob"; kaiba sa **Philippine Studies** na itinuturing na area studies para sa banyagang institusyon.
- **Pantayong Pananaw** — diskursong pangkabihasnan; perspektibong **"tayo"** laban sa **"pangkami"**; ang kondisyon upang masabing may PP ang isang lipunan.
- **Filipinolohiya** — pagsisinop ng **karanasang bayan** tungo sa **talinong bayan** na gagabay sa pambansang pag-unlad.
- Ang **talahanayan ng paghahambing** ng apat na perspektibo: tuon at papel ng wika sa bawat isa.

### Mga Karaniwang Pagkakamali

- Pinagpapalit ang kasangkapan ng Espanyol (relihiyon) at ng Amerikano (edukasyon).
- Pinagpapalit ang **Pilipinolohiya** at **Filipinolohiya** — magkaiba ang tuon ng dalawa sa talahanayan ng paghahambing.
- Iniisip na ang "pangkami" ang ninanais ng Pantayong Pananaw — ang kabaligtaran ang tama.
- Pinagpapalit ang pakapa-kapa (eksploratoryo, walang paunang hinuha) at pagdalaw-dalaw (paulit-ulit na impormal na pagbisita para sa tiwala).
- Iniisip na "karanasang bayan" ang makaagham na kaalaman — iyon ang **talinong bayan**.

### 7-Araw na Plano ng Pag-aaral

| Araw | Gawain |
|---|---|
| **1** | Basahin ang unang tatlong seksiyon ng Kabanata 1: kamalayan, "unawa at salakay", at ang pagbubura sa tala ng bayan. Gumawa ng sariling listahan ng mga termino. |
| **2** | Pag-aralan ang "Lisyang Edukasyon" sa Kabanata 1 — apat na bahagi nito: armas ng pagsupil, papel ng Ingles, oryentasyong pang-agrikultura, hadlang sa demokrasya. |
| **3** | Basahin ang Sikolohiyang Pilipino at Pilipinolohiya sa Kabanata 2. Isulat ang pagkakaiba ng pakapa-kapa at pagdalaw-dalaw sa sariling salita. |
| **4** | Tapusin ang Kabanata 2: Pantayong Pananaw, Filipinolohiya, at ang talahanayan ng paghahambing. Kabisaduhin ang tuon ng bawat perspektibo. |
| **5** | Sagutan ang **Libreng Practice Set** sa ibaba nang hindi tumitingin sa susi. Balikan ang mga seksiyong may mali kang sagot. |
| **6** | Kunin ang **Prelim Mock Exam A** sa ilalim ng oras na 45 minuto. Iwasto gamit ang susi ng kasagutan. |
| **7** | Kunin ang **Prelim Mock Exam B**, pagkatapos ay basahin ang "Mga Karaniwang Patibong sa Prelim" bilang huling repaso. |
$md$, 1),

('a2000004-0001-0001-0002-0000000000e1','content','Libreng Practice Set — 15 Aytem na may Susi ng Kasagutan',$md$
### Panuto

Sagutan muna ang lahat ng 15 aytem bago tumingin sa susi ng kasagutan sa ibaba. Saklaw: Kabanata 1 at 2.

### Bahagi I: Multiple Choice

**1.** Ano ang pangunahing kasangkapan ng mga Amerikano upang sakupin ang rebolusyonaryong kamalayan ng mga Pilipino?

- A. Relihiyon
- B. Edukasyon
- C. Kalakalan
- D. Sandatahang lakas

**2.** Ano ang naging epekto ng pagpapatupad ng Ingles bilang wikang panturo?

- A. Napabilis ang pag-unlad ng pambansang wika
- B. Nagsilbing pader na naghiwalay sa mga Pilipino sa kanilang kasaysayan at naglikha ng agwat sa pagitan ng elite at masa
- C. Napagbuklod ang lahat ng rehiyon sa iisang kamalayan
- D. Napalakas ang pakikilahok ng masa sa pamamahala

**3.** Anong oryentasyon ang itinanim ng kolonyal na edukasyon tungkol sa ekonomiya ng Pilipinas?

- A. Ang Pilipinas ay dapat maging sentro ng mabigat na industriya
- B. Ang Pilipinas ay isang bansang nakalaan lamang para sa agrikultura
- C. Ang Pilipinas ay dapat umasa sa sariling teknolohiya
- D. Ang Pilipinas ay dapat magsara sa pandaigdigang kalakalan

**4.** Alin ang tamang paglalarawan sa **pakapa-kapa**?

- A. Paulit-ulit at impormal na pagbisita sa mga kalahok upang makuha ang tiwala nila
- B. Pormal na sarbey na may nakahandang talatanungan
- C. Eksploratoryong pamamaraan kung saan nagpapakiramdam ang mananaliksik sa konteksto ng komunidad nang walang paunang hinuha
- D. Pagsusuri ng mga kolonyal na dokumento

**5.** Paano inilarawan ng aralin ang tradisyunal na **Philippine Studies**?

- A. Pag-aaral ng Pilipinas mula sa "loob" gamit ang sariling kultura
- B. Diskursong pangkabihasnan sa sariling wika
- C. Pag-aaral ng Pilipinas bilang paksa o obheto (area studies) para sa pangangailangan ng mga banyagang institusyon
- D. Pag-aaral ng diwa at pakiramdam ng mga Pilipino

**6.** Sa talahanayan ng paghahambing, aling perspektibo ang may tuong "pagsasapraktika ng talino tungo sa pagtatatag ng pambansang industriya"?

- A. Sikolohiyang Pilipino
- B. Pilipinolohiya
- C. Pantayong Pananaw
- D. Filipinolohiya

**7.** Ano ang tinututulan ng Sikolohiyang Pilipino?

- A. Ang paggamit ng katutubong wika sa pananaliksik
- B. Ang ideya na ang mga teoryang Kanluranin ay unibersal at direktang mailalapat sa mga Pilipino
- C. Ang pag-aaral ng karanasan ng mga Pilipino
- D. Ang pakikipagkapwa bilang batayan ng metodolohiya

### Bahagi II: Tama o Mali

**8.** Bago dumating ang mga Espanyol, mayroon nang iisang pambansang wika at sentralisadong konsepto ng isang buong bansa.

**9.** Sa mga opisyal na dokumento ng mga kolonyalista, karaniwang hindi isinama ang aktwal na karanasan at boses ng mga katutubo, maliban kung ipinapakita ito sa negatibong paraan.

**10.** Ayon sa aralin, may Pantayong Pananaw ang isang lipunan kahit iilang piling pangkat lamang ang nakakaunawa sa mga konsepto at kodigo nito.

**11.** Sa ilalim ng lisyang edukasyon, itinuring na mga salarin o tulisan ang mga bayaning Pilipino na lumaban sa pananakop.

### Bahagi III: Pagtutukoy

**12.** Anong estratehiya ng mga Espanyol ang tumutukoy sa masusing pag-aaral at dokumentasyon ng kultura at pamumuhay ng mga katutubo bago ito tuluyang baguhin o manipulahin?

**13.** Anong metodolohiya ng Sikolohiyang Pilipino ang tumutukoy sa paulit-ulit at impormal na pagbisita sa mga kalahok upang makuha ang kanilang tiwala at tunay na saloobin?

**14.** Sa Filipinolohiya, anong termino ang tumutukoy sa makaagham at sistematikong kaalaman na produkto ng pagsisinop sa mga praktikal at pang-araw-araw na danas ng mga mamamayan?

**15.** Anong perspektibo ang tinutukoy kapag nagpapaliwanag o nagdedepensa ng sarili ang mga Pilipino sa mga dayuhan gamit ang banyagang wika?

### Susi ng Kasagutan

1. **B.** Edukasyon ang ginamit ng mga Amerikano; relihiyon naman ang pangunahing kasangkapan ng mga Espanyol.
2. **B.** Ayon sa aralin, ang Ingles bilang wikang panturo ay naging pader sa kasaysayan at naglikha ng agwat sa pagitan ng mga nakapag-aral (elite) at ng masa.
3. **B.** Itinanim ng kolonyal na edukasyon ang pananaw na para lamang sa agrikultura ang bansa, kaya nanatili itong tagaluwas ng murang hilaw na materyales.
4. **C.** Ang pakapa-kapa ay eksploratoryo at walang paunang hinuha; ang opsyong A ay paglalarawan ng pagdalaw-dalaw.
5. **C.** Ang Philippine Studies ay area studies na itinuturing na obheto lamang ang Pilipinas; ang opsyong A ay Pilipinolohiya.
6. **D.** Sa talahanayan, Filipinolohiya ang may tuong pagsasapraktika ng talino tungo sa pambansang industriya; ang Pilipinolohiya (B) ay nakatuon sa pagsusuri ng kasaysayan at lipunan mula sa sariling kultura.
7. **B.** Tinututulan ng Sikolohiyang Pilipino ang pag-aakalang unibersal ang mga teoryang Kanluranin; ang A, C, at D ay pawang mga bahagi mismo ng SP.
8. **Mali.** Bago ang kolonisasyon, nakasentro ang pamumuhay sa magkakahiwalay na pangkat o rehiyon na may kanya-kanyang wika at kultura.
9. **Tama.** Ginamit ang negatibong paglalarawan upang bigyang-katwiran ang pananakop.
10. **Mali.** May PP lamang ang isang lipunan kung ang **lahat** ng mamamayan ay gumagamit ng mga konsepto at kodigo na alam ng lahat ang kahulugan.
11. **Tama.** Natutunan ng mga Pilipino ang kasaysayan ng ibang bansa habang itinuturing na tulisan ang sariling mga bayani.
12. **Estratehiyang "unawa at salakay".** Pag-aaral muna sa kultura ng katutubo bago ito manipulahin.
13. **Pagdalaw-dalaw.** Layunin nitong makuha ang tiwala at tunay na saloobin ng mga kalahok.
14. **Talinong bayan.** Ito ang naprosesong anyo ng karanasang bayan na gagabay sa pambansang pag-unlad.
15. **Perspektibong "pangkami".** Ito ang kabaligtaran ng perspektibong "tayo" na itinataguyod ng Pantayong Pananaw.

Ang apat na kumpletong 30-aytem na mock exam sa ibaba, kasama ang buong susi ng kasagutan na may paliwanag, ay kasama na sa subject unlock ng Filipinolohiya.
$md$, 2),

('a2000004-0001-0001-0002-0000000000e1','activity','Prelim Mock Exam A — 30 Aytem',$md$
### Panuto

Saklaw: Kabanata 1 at 2. Inirerekomendang oras: 45 minuto. Sagutan nang tuluy-tuloy bago tumingin sa susi ng kasagutan.

### Bahagi I: Multiple Choice (1–10)

**1.** Ano ang pangunahing kasangkapan ng mga Espanyol sa pagbabago ng kamalayan ng mga katutubo?

- A. Edukasyon
- B. Relihiyon
- C. Kalakalan
- D. Batas

**2.** Ano ang unang hakbang ng estratehiyang "unawa at salakay"?

- A. Agarang pagpapalit ng mga katutubong lider
- B. Pagtatayo ng mga paaralan
- C. Masusing pag-aaral at dokumentasyon ng mga gawi, tradisyon, pagkain, at relihiyon ng mga katutubo
- D. Pagbabawal sa lahat ng katutubong wika

**3.** Bago ang kolonisasyon, ang pamumuhay sa kapuluan ay nakasentro sa —

- A. iisang sentralisadong pamahalaan
- B. magkakahiwalay na pangkat o rehiyon na may kanya-kanyang wika at kultura
- C. mga lungsod na pinamumunuan ng mga dayuhan
- D. iisang pambansang wika

**4.** Ano ang layunin ng sistema ng pampublikong paaralan na ipinatupad ng mga Amerikano?

- A. Ihanda ang mga Pilipino sa industriyalisasyon
- B. Payapain ang mga mamamayan at palitan ang kanilang mga likas na mithiin ng mga kaisipang banyaga
- C. Palakasin ang rebolusyonaryong kamalayan
- D. Palaganapin ang wikang Filipino

**5.** Ano ang naging resulta ng pananaw na ang Pilipinas ay nakalaan lamang para sa agrikultura?

- A. Naging pangunahing gumagawa ng makinarya ang bansa
- B. Nanatili ang bansa bilang tagaluwas ng murang hilaw na materyales at tagabili ng mamahaling yaring produkto
- C. Lumakas ang lokal na industriya ng bakal
- D. Bumaba ang produksyon ng agrikultura

**6.** Sa ilalim ng kolonyal na edukasyon, paano itinuring ang mga bayaning lumaban sa pananakop?

- A. Bilang mga modelo ng kabataan
- B. Bilang mga salarin o tulisan
- C. Bilang mga pambansang bayani
- D. Hindi sila binanggit sa anumang aklat

**7.** Ano ang pinag-aaralan ng Sikolohiyang Pilipino ayon sa aralin?

- A. Ang "diwa" na nakabatay sa aktwal na karanasan, kamalayan, at oryentasyon ng mga Pilipino
- B. Ang sikolohiya ng mga mananakop
- C. Ang mga teoryang Kanluranin sa orihinal nitong anyo
- D. Ang ekonomiya ng mga sinaunang pamayanan

**8.** Alin sa mga sumusunod ang tumpak na paglalarawan sa ugnayan ng Sikolohiyang Pilipino sa mga teoryang Kanluranin?

- A. Tinatanggap nito ang mga ito bilang unibersal
- B. Tinututulan nito ang ideyang unibersal ang mga ito at direktang mailalapat sa mga Pilipino
- C. Isinasalin lamang nito ang mga ito sa Filipino
- D. Walang pakialam ang SP sa mga teoryang Kanluranin

**9.** Ano ang pagkakaiba ng Pilipinolohiya sa tradisyunal na Philippine Studies?

- A. Ang Pilipinolohiya ay nakasulat sa Ingles, ang Philippine Studies ay sa Filipino
- B. Ang Pilipinolohiya ay bumubuo ng kaalaman mula sa "loob" gamit ang sariling kultura, samantalang ang Philippine Studies ay itinuturing na obheto lamang ang Pilipinas para sa mga banyagang institusyon
- C. Ang Pilipinolohiya ay para sa mga dayuhan, ang Philippine Studies ay para sa mga Pilipino
- D. Magkapareho lamang ang dalawa

**10.** Ano ang nilalayon ng Filipinolohiya bilang akademikong disiplina?

- A. Sinupin ang mga karanasang bayan upang maproseso bilang talinong bayan na gagabay sa pambansang pag-unlad
- B. Palitan ang wikang Filipino ng Ingles sa akademya
- C. Pag-aralan ang Pilipinas para sa mga banyagang unibersidad
- D. Itala lamang ang mga sinaunang tradisyon nang walang pagproseso

### Bahagi II: Tama o Mali (11–20)

**11.** Ang epekto ng kolonisasyon ay patuloy na makikita sa kasalukuyang sistemang pangkultura, pang-ekonomiya, at pampolitika ng bansa.

**12.** Ang paggamit ng wikang banyaga bilang pangunahing midyum sa akademikong diskurso ay nagpapabilis sa pag-unlad ng pambansang wika.

**13.** Ginamit ng mga Espanyol ang pag-aaral sa mga katutubong wika upang ipalaganap ang Kristiyanismo.

**14.** Ang katatagan ng kulturang Pilipino ay naging dahilan upang magbago ang ilang polisiya ng mga mananakop batay sa reaksyon ng mga mamamayan.

**15.** Sa ilalim ng lisyang edukasyon, natutunan ng mga Pilipino ang kasaysayan at pamumuhay ng ibang bansa.

**16.** Ang pakapa-kapa ay nangangailangan ng matibay na paunang hinuha bago pumasok sa komunidad.

**17.** Ang pagdalaw-dalaw ay isang isahang pormal na interbyu na may nakatakdang talatanungan.

**18.** Ang Pantayong Pananaw ay ipinapahayag sa pamamagitan ng sariling wika ng kultura.

**19.** Ang perspektibong "pangkami" ay tumutukoy sa pagpapaliwanag o pagdedepensa ng sarili sa mga dayuhan gamit ang banyagang wika.

**20.** Ayon sa aralin, ang mga metodolohiya ng Sikolohiyang Pilipino ay nakabatay sa pakiramdam at pakikipagkapwa.

### Bahagi III: Pagtutukoy (21–26)

**21.** Anong termino ang tumutukoy sa edukasyong ipinatupad ng mga Amerikano na ginamit upang supilin ang rebolusyonaryong kamalayan ng mga Pilipino?

**22.** Anong penomenon — kasama ng kawalan ng malay at pag-asa sa mga tradisyunal na lider — ang ibinubunsod ng kahirapan ng masa na unawain ang mga suliraning pambansa dahil Ingles ang wika ng pamumuno at batas?

**23.** Anong eksploratoryong metodolohiya ng Sikolohiyang Pilipino ang isinasagawa nang walang paunang hinuha?

**24.** Anong diskursong pangkabihasnan ang nakabatay sa panloob na pagkakaugnay-ugnay ng mga katangian, halagahin, kaalaman, at karanasan ng isang kultura na ipinapahayag sa sariling wika?

**25.** Sa Filipinolohiya, anong termino ang tumutukoy sa mga praktikal at pang-araw-araw na danas ng mga mamamayan?

**26.** Anong termino ang tumutukoy sa makaagham at sistematikong kaalaman na resulta ng pagsisinop sa mga danas ng mamamayan?

### Bahagi IV: Maikling Pagsusuri (27–30) — 3 hanggang 5 pangungusap bawat isa

**27.** Ipaliwanag kung paano naging "pader" ang wikang Ingles sa pagitan ng mga Pilipino at ng kanilang kasaysayan.

**28.** Bakit dinokumento at pinag-aralan muna ng mga Espanyol ang kultura ng mga katutubo bago ito binago?

**29.** Ihambing ang perspektibong "tayo" at ang perspektibong "pangkami" ayon sa Pantayong Pananaw.

**30.** Ipaliwanag kung paano naaapektuhan ang pagkaunawa ng mga mamamayan sa kanilang sariling pagkakakilanlan kapag nabubusot ang potensyal ng sariling wika.
$md$, 3),

('a2000004-0001-0001-0002-0000000000e1','activity','Prelim Mock Exam B — 30 Aytem',$md$
### Panuto

Saklaw: Kabanata 1 at 2, parehong saklaw ng Mock Exam A ngunit bagong mga aytem at bahagyang mas mahirap. Inirerekomendang oras: 45 minuto.

### Bahagi I: Multiple Choice (1–10)

**1.** Alin sa mga sumusunod ang **HINDI** epekto ng lisyang edukasyon sa ilalim ng mga Amerikano?

- A. Takot at pagwawalang-bahala sa industriyalisasyon
- B. Agwat sa pagitan ng mga nakapag-aral na elite at ng masa
- C. Pagpapalakas ng rebolusyonaryong kamalayan ng mga Pilipino
- D. Pagturing sa mga bayani bilang mga salarin o tulisan

**2.** Isang mananaliksik ang pumasok sa isang komunidad nang walang paunang hinuha at nagpapakiramdam lamang sa konteksto nito. Anong metodolohiya ito?

- A. Pagdalaw-dalaw
- B. Pakapa-kapa
- C. Pormal na sarbey
- D. Panayam sa mga eksperto

**3.** Isang iskolar ang sumusulat sa wikang Ingles upang ipaliwanag at idepensa ang kulturang Pilipino sa mga dayuhang mambabasa. Anong perspektibo ito ayon sa Pantayong Pananaw?

- A. Perspektibong "tayo"
- B. Perspektibong "pangkami"
- C. Perspektibong pambansa
- D. Perspektibong rehiyonal

**4.** Alin ang pinakatumpak na pagkakaiba ng Pilipinolohiya sa Philippine Studies?

- A. Mas matanda ang Pilipinolohiya bilang disiplina
- B. Ang Pilipinolohiya ay nagsasaliksik mula sa "loob" gamit ang sariling kultura, samantalang ang Philippine Studies ay area studies na tumitingin sa Pilipinas bilang obheto para sa banyagang pangangailangan
- C. Ang Pilipinolohiya ay tungkol sa wika lamang, ang Philippine Studies ay tungkol sa kasaysayan lamang
- D. Ang Philippine Studies ay isinasagawa lamang sa loob ng Pilipinas

**5.** Alin ang tamang pares ng mananakop at pangunahing kasangkapan nito sa pagsakop ng kamalayan?

- A. Espanyol — edukasyon; Amerikano — relihiyon
- B. Espanyol — relihiyon; Amerikano — edukasyon
- C. Espanyol — kalakalan; Amerikano — relihiyon
- D. Espanyol — edukasyon; Amerikano — kalakalan

**6.** Ayon sa Kabanata 1, bakit lumalabo ang pagkaunawa ng mga mamamayan sa kanilang pagkakakilanlan kapag nabubusot ang potensyal ng sariling wika?

- A. Dahil nawawalan ng trabaho ang mga guro ng Filipino
- B. Dahil naaapektuhan ang buong kultura na siyang batayan ng pagkakakilanlan at tungkulin sa bayan
- C. Dahil nagiging mas mahirap ang mga pagsusulit
- D. Dahil bumababa ang bilang ng mga aklat na nailalathala

**7.** Sa proseso ng kolonisasyon, paano ipinakita ang kultura ng mananakop at ang katutubong gawi?

- A. Parehong itinuring na superyor
- B. Ang kultura ng mananakop ay superyor, samantalang ang katutubong gawi ay ipinalabas na mababa o negatibo
- C. Ang katutubong gawi ay superyor, ang kultura ng mananakop ay mababa
- D. Parehong itinuring na mababa

**8.** Kailan lamang masasabing may Pantayong Pananaw ang isang lipunan?

- A. Kapag may sariling unibersidad ito
- B. Kapag ang lahat ng mamamayan ay gumagamit ng mga konsepto at kodigo na alam ng lahat ang kahulugan
- C. Kapag marunong mag-Ingles ang nakararami
- D. Kapag may nakasulat na kasaysayan ito sa wikang banyaga

**9.** Sa talahanayan ng paghahambing, aling perspektibo ang may tuong "panloob na talastasan ng sariling kabihasnan nang walang dayuhang panghihimasok"?

- A. Sikolohiyang Pilipino
- B. Pilipinolohiya
- C. Pantayong Pananaw
- D. Filipinolohiya

**10.** Sa talahanayan ng paghahambing, ano ang pangunahing tuon ng Pilipinolohiya?

- A. Pag-aaral ng diwa, pakiramdam, at katutubong pag-uugali
- B. Pagsusuri ng kasaysayan at lipunan mula sa sariling kultura at karanasan
- C. Panloob na talastasan nang walang dayuhang panghihimasok
- D. Pagsasapraktika ng talino tungo sa pambansang industriya

### Bahagi II: Tama o Mali (11–20)

**11.** Ang kolonyal na edukasyon ay nagtanim ng pagpapahalaga at kumpiyansa sa industriyalisasyon ng bansa.

**12.** Sa mga opisyal na dokumento ng mga kolonyalista, ang negatibong paglalarawan sa mga katutubo ay ginamit upang bigyang-katwiran ang pananakop.

**13.** Ang maagang kasaysayan ng bansa ay walang sariling sigla bago dumating ang mga dayuhan.

**14.** Direktang inilalapat ng Sikolohiyang Pilipino ang mga teoryang Kanluranin sa mga Pilipino.

**15.** Layunin ng pagdalaw-dalaw na makuha ang tiwala at tunay na saloobin ng mga kalahok.

**16.** Ang Pantayong Pananaw ay isang diskursong pangkabihasnan.

**17.** Ang Filipinolohiya ay isang purong teoretikal na disiplina na walang praktikal na bahagi.

**18.** Ang paggamit ng Ingles bilang wika ng pamumuno at batas ay nagpapadali sa masa na makilahok nang aktibo sa pamamahala.

**19.** Sa ilalim ng lisyang edukasyon, pinalitan ng mga kaisipang banyaga ang mga likas na mithiin ng mga Pilipino.

**20.** Ang "karanasang bayan" ay tumutukoy sa makaagham at sistematikong kaalaman.

### Bahagi III: Pagtutukoy (21–26)

**21.** Anong bagong kamalayan ang ipinakilala ng mga Espanyol sa mga katutubo sa pamamagitan ng pag-aaral sa mga katutubong wika?

**22.** Anong wika ang ipinatupad ng mga Amerikano bilang wikang panturo na nagsilbing pader sa pagitan ng mga Pilipino at ng kanilang kasaysayan?

**23.** Anong disiplina ang nag-aaral ng "diwa" na nakabatay sa aktwal na karanasan, kamalayan, at oryentasyon ng mga Pilipino?

**24.** Ano ang tawag sa paulit-ulit at impormal na pagbisita sa mga kalahok bilang metodolohiya ng pananaliksik?

**25.** Ano ang tawag sa tradisyunal na larangan ng pag-aaral na nakatuon sa Pilipinas bilang paksa o obheto para sa kapakinabangan ng mga banyagang institusyon?

**26.** Anong perspektibo ang binibigyang-diin ng Pantayong Pananaw — ang komunikasyon ng mga Pilipino para sa kapwa Pilipino?

### Bahagi IV: Maikling Pagsusuri (27–30) — 3 hanggang 5 pangungusap bawat isa

**27.** Bakit masasabing "armas ng pagsupil" ang edukasyon sa ilalim ng pamamalaging Amerikano, gayong sa unang tingin ay biyaya ito?

**28.** Ipaliwanag kung paano nagbubunsod ng rehiyonalismo at kawalan ng malay ang paggamit ng banyagang wika sa pamumuno at batas.

**29.** Bakit hindi sapat na "tungkol sa Pilipinas" ang isang pag-aaral upang matawag itong Pilipinolohiya? Gamitin ang paghahambing sa Philippine Studies.

**30.** Kung ang layunin ng isang mananaliksik ay unawain ang tunay na saloobin ng isang komunidad, aling dalawang metodolohiya ng Sikolohiyang Pilipino ang gagamitin niya, at paano magkaiba ang gamit ng bawat isa?
$md$, 4),

('a2000004-0001-0001-0002-0000000000e1','activity','Susi ng Kasagutan sa Prelim Mock Exams — may Paliwanag',$md$
### Prelim Mock Exam A

**Bahagi I: Multiple Choice**

1. **B.** Relihiyon ang pangunahing kasangkapan ng mga Espanyol; ang edukasyon (A) ay kasangkapan ng mga Amerikano — ito ang klasikong pinagpapalit.
2. **C.** Ang "unawa at salakay" ay nagsisimula sa masusing pag-aaral at dokumentasyon ng kultura; ang ibang opsyon ay hindi bahagi ng estratehiyang inilarawan sa aralin.
3. **B.** Walang iisang pambansang wika o sentralisadong konsepto ng bansa bago ang kolonisasyon; kaya mali ang A at D.
4. **B.** Layunin ng pampublikong paaralan na payapain ang mamamayan at palitan ang likas na mithiin ng kaisipang banyaga; ang C ay eksaktong kabaligtaran.
5. **B.** Ang oryentasyong pang-agrikultura ay nagpanatili sa bansa bilang tagaluwas ng hilaw na materyales at tagabili ng yaring produkto; ang A at C ay kabaligtaran ng nangyari.
6. **B.** Itinuring na mga salarin o tulisan ang mga bayaning lumaban — hindi mga modelo (A) o pambansang bayani (C) sa ilalim ng kolonyal na pagtuturo.
7. **A.** Ang SP ay pag-aaral ng "diwa" na nakaugat sa karanasan, kamalayan, at oryentasyon ng mga Pilipino.
8. **B.** Tinututulan ng SP ang unibersalidad ng teoryang Kanluranin; ang A ang mismong ideyang nilalabanan nito.
9. **B.** Ang Pilipinolohiya ay mula sa "loob"; ang Philippine Studies ay area studies para sa banyagang institusyon — hindi usapin ng wika lamang (A) o ng target na mambabasa lamang (C).
10. **A.** Nilalayon ng Filipinolohiya na sinupin ang karanasang bayan tungo sa talinong bayan; ang D ay kulang dahil may pagproseso tungo sa makaagham na kaalaman, hindi pagtatala lamang.

**Bahagi II: Tama o Mali**

11. **Tama.** Ito ang pangunahing tesis ng Kabanata 1 — nag-iwan ng marka ang kolonisasyon sa kultura, ekonomiya, at pulitika hanggang ngayon.
12. **Mali.** Kabaligtaran: nililimitahan nito ang pag-unlad ng pambansang wika at iba pang katutubong wika.
13. **Tama.** Ginamit ang pag-aaral sa mga katutubong wika upang ipalaganap ang Kristiyanismo.
14. **Tama.** Nabago ang ilang polisiya ng mananakop dahil sa reaksyon at katatagan ng mga mamamayan.
15. **Tama.** Natutunan ang kasaysayan at pamumuhay ng ibang bansa habang ang sariling mga bayani ay itinuring na tulisan.
16. **Mali.** Ang pakapa-kapa ay isinasagawa nang **walang** paunang hinuha — eksploratoryo ito.
17. **Mali.** Ang pagdalaw-dalaw ay **paulit-ulit at impormal**, hindi isahang pormal na interbyu.
18. **Tama.** Ipinapahayag ang PP sa pamamagitan ng sariling wika ng kultura.
19. **Tama.** Ito mismo ang depinisyon ng perspektibong "pangkami".
20. **Tama.** Nakabatay ang mga metodolohiya ng SP sa pakiramdam at pakikipagkapwa.

**Bahagi III: Pagtutukoy**

21. **Lisyang edukasyon.**
22. **Rehiyonalismo.**
23. **Pakapa-kapa.**
24. **Pantayong Pananaw.**
25. **Karanasang bayan.**
26. **Talinong bayan.**

**Bahagi IV: Maikling Pagsusuri (mga puntong dapat lumitaw sa sagot)**

27. Ang Ingles bilang wikang panturo ay naghiwalay sa mga Pilipino sa kanilang kasaysayan: natutunan nila ang kasaysayan at pamumuhay ng ibang bansa, itinuring na tulisan ang sariling mga bayani, at nalikha ang agwat sa pagitan ng elite na nakapag-aral at ng masa.
28. Sa pamamagitan ng dokumentasyon ng mga gawi, tradisyon, pagkain, at relihiyon, naging mas madali para sa mga mananakop na pasukin at baguhin ang kamalayan ng mga lokal na komunidad — ito ang buod ng "unawa at salakay".
29. Ang "tayo" ay komunikasyon ng mga Pilipino para sa kapwa Pilipino gamit ang sariling wika at mga kodigong alam ng lahat; ang "pangkami" ay pagpapaliwanag o pagdedepensa ng sarili sa mga dayuhan gamit ang banyagang wika. Ang una ang itinataguyod ng Pantayong Pananaw.
30. Kapag nabubusot ang potensyal ng sariling wika, naaapektuhan ang buong kultura; dahil ang kultura ang batayan ng pagkakakilanlan, lumalabo ang pagkaunawa ng mga mamamayan sa kanilang sarili at sa kanilang tungkulin sa bayan.

### Prelim Mock Exam B

**Bahagi I: Multiple Choice**

1. **C.** Sinupil — hindi pinalakas — ng lisyang edukasyon ang rebolusyonaryong kamalayan; ang A, B, at D ay pawang tunay na epekto nito.
2. **B.** Walang paunang hinuha at nagpapakiramdam sa konteksto — pakapa-kapa; ang pagdalaw-dalaw (A) ay nakatuon sa paulit-ulit na pagbisita para sa tiwala.
3. **B.** Pagpapaliwanag ng sarili sa mga dayuhan gamit ang banyagang wika — perspektibong "pangkami"; ang "tayo" (A) ay para sa kapwa Pilipino gamit ang sariling wika.
4. **B.** Ang pagkakaiba ay nasa pinanggagalingan at pinaglilingkuran ng kaalaman ("loob" laban sa obheto ng area studies), hindi sa edad (A) o lokasyon (D) ng disiplina.
5. **B.** Espanyol — relihiyon; Amerikano — edukasyon. Ang A ang karaniwang maling baligtad na pares.
6. **B.** Ang wika ay nakakabit sa buong kultura, at ang kultura ang batayan ng pagkakakilanlan at tungkulin sa bayan.
7. **B.** Itinanghal na superyor ang kultura ng mananakop habang ipinalabas na mababa o negatibo ang katutubong gawi.
8. **B.** Ang kondisyon ay ang **lahat** ng mamamayan ay gumagamit ng mga konsepto at kodigong alam ng lahat ang kahulugan; walang kinalaman ang unibersidad (A) o Ingles (C).
9. **C.** Ito ang tuon ng Pantayong Pananaw sa talahanayan ng paghahambing.
10. **B.** Pagsusuri ng kasaysayan at lipunan mula sa sariling kultura at karanasan; ang A ay SP, ang C ay PP, at ang D ay Filipinolohiya.

**Bahagi II: Tama o Mali**

11. **Mali.** Itinanim nito ang pagwawalang-bahala at **takot** sa industriyalisasyon.
12. **Tama.** Ipinakita ang katutubo sa negatibong paraan upang bigyang-katwiran ang pananakop.
13. **Mali.** May sariling sigla ang maagang kasaysayan ng bansa bago pa dumating ang mga dayuhan.
14. **Mali.** Tinututulan ng SP ang direktang paglalapat ng teoryang Kanluranin; bumubuo ito ng pag-unawa mula sa sariling wika at kultura.
15. **Tama.** Ito ang layunin ng paulit-ulit at impormal na pagbisita.
16. **Tama.** Ito mismo ang katawagan ng aralin sa PP — isang diskursong pangkabihasnan.
17. **Mali.** Ang Filipinolohiya ay parehong **akademiko at praktikal** na disiplina.
18. **Mali.** Kabaligtaran: nahihirapan ang masa na unawain ang mga suliraning pambansa, kaya nawawalan sila ng aktibong pakikilahok.
19. **Tama.** Pinalitan ng mga kaisipang banyaga ang mga likas na mithiin — ito ang ubod ng lisyang edukasyon.
20. **Mali.** Ang karanasang bayan ay ang mga **praktikal at pang-araw-araw na danas**; ang makaagham at sistematikong kaalaman ay ang talinong bayan.

**Bahagi III: Pagtutukoy**

21. **Kristiyanismo.**
22. **Wikang Ingles.**
23. **Sikolohiyang Pilipino.**
24. **Pagdalaw-dalaw.**
25. **Philippine Studies.**
26. **Perspektibong "tayo".**

**Bahagi IV: Maikling Pagsusuri (mga puntong dapat lumitaw sa sagot)**

27. Ginamit ang pampublikong paaralan hindi upang palayain kundi upang payapain ang mamamayan at palitan ang kanilang likas na mithiin ng kaisipang banyaga; sinakop nito ang rebolusyonaryong kamalayan na hindi nagagawa ng dahas lamang — kaya armas ito ng pagsupil na nakabalatkayong biyaya.
28. Dahil Ingles ang wika ng pamumuno at batas, nahihirapan ang masa na unawain ang mga suliraning pambansa; nagbubunga ito ng kawalan ng malay, pagkakahati-hati ayon sa rehiyon (rehiyonalismo), at pag-asa na lamang sa mga tradisyunal na lider sa halip na aktibong pakikilahok.
29. Ang Philippine Studies ay tumitingin din sa Pilipinas ngunit bilang paksa o obheto (area studies) para sa pangangailangan ng mga banyagang institusyon; ang Pilipinolohiya ay bumubuo ng kaalaman mula sa "loob" gamit ang sariling kultura — kaya ang pinanggagalingan at pinaglilingkuran ng kaalaman, hindi ang paksa, ang sukatan.
30. Gagamitin niya ang **pakapa-kapa** upang magpakiramdam muna sa konteksto ng komunidad nang walang paunang hinuha, at ang **pagdalaw-dalaw** upang sa paulit-ulit at impormal na pagbisita ay makuha ang tiwala at tunay na saloobin ng mga kalahok.
$md$, 5),

('a2000004-0001-0001-0002-0000000000e1','activity','Mga Karaniwang Patibong sa Prelim at Paano Iwasan',$md$
### Bakit Mahalaga Ito

Karamihan ng mga maling sagot sa Filipinolohiya ay hindi dahil sa kakulangan ng pag-aaral kundi dahil sa **magkakahawig na termino** na pinagpapalit. Narito ang mga pinakakaraniwang patibong, bawat isa ay may mini-drill.

### Patibong 1: Relihiyon (Espanyol) laban sa Edukasyon (Amerikano)

Dalawang mananakop, dalawang magkaibang kasangkapan sa pagsakop ng kamalayan. Espanyol — **relihiyon** (Kristiyanismo, sa pamamagitan ng pag-aaral ng katutubong wika). Amerikano — **edukasyon** (sistema ng pampublikong paaralan at wikang Ingles).

**Mini-drill:** Anong kasangkapan ang ginamit upang "payapain ang mga mamamayan at palitan ang kanilang mga likas na mithiin"?

**Sagot:** Edukasyon — ito ang wika ng aralin tungkol sa pampublikong paaralan ng mga Amerikano.

### Patibong 2: Pilipinolohiya laban sa Filipinolohiya

Magkaiba ang dalawa sa talahanayan ng paghahambing. **Pilipinolohiya** — pagsusuri ng kasaysayan at lipunan mula sa sariling kultura at karanasan; katapat ng Philippine Studies. **Filipinolohiya** — pagsasapraktika ng talino tungo sa pagtatatag ng pambansang industriya; nagpoproseso ng karanasang bayan tungo sa talinong bayan.

**Mini-drill:** Aling disiplina ang tahasang nag-uugnay ng karunungan sa pagtatatag ng pambansang industriya?

**Sagot:** Filipinolohiya. Ang Pilipinolohiya ay nakatuon sa pananaliksik mula sa "loob", ngunit ang tahasang tuon sa industriya ay sa Filipinolohiya.

### Patibong 3: "Tayo" laban sa "Pangkami"

Ang **"tayo"** ay komunikasyon ng mga Pilipino para sa kapwa Pilipino gamit ang sariling wika — ito ang itinataguyod ng Pantayong Pananaw. Ang **"pangkami"** ay pagpapaliwanag o pagdedepensa ng sarili sa mga dayuhan gamit ang banyagang wika — ito ang inilalayo ng PP.

**Mini-drill:** Tama o Mali — Itinataguyod ng Pantayong Pananaw ang perspektibong "pangkami".

**Sagot:** Mali. Ang perspektibong "tayo" ang itinataguyod nito.

### Patibong 4: Pakapa-kapa laban sa Pagdalaw-dalaw

Parehong metodolohiya ng Sikolohiyang Pilipino, ngunit magkaiba ang diin. **Pakapa-kapa** — eksploratoryo, nagpapakiramdam sa konteksto ng komunidad, **walang paunang hinuha**. **Pagdalaw-dalaw** — **paulit-ulit at impormal** na pagbisita upang makuha ang **tiwala** at tunay na saloobin.

**Mini-drill:** Kung ang susing salita sa tanong ay "tiwala", alin ang sagot? Kung "walang paunang hinuha"?

**Sagot:** "Tiwala" — pagdalaw-dalaw; "walang paunang hinuha" — pakapa-kapa.

### Patibong 5: Karanasang Bayan laban sa Talinong Bayan

Magkasunod sila sa proseso, hindi magkapalit. **Karanasang bayan** — hilaw na materyal: mga praktikal at pang-araw-araw na danas ng mga mamamayan. **Talinong bayan** — naprosesong produkto: makaagham at sistematikong kaalaman na gagabay sa pambansang pag-unlad.

**Mini-drill:** Ang paggamit ng dahon ng Tawa-tawa bilang tradisyunal na panggagamot — karanasang bayan ba ito o talinong bayan?

**Sagot:** Karanasang bayan. Nagiging talinong bayan lamang ito matapos ang makaagham na pagsisinop, gaya ng parmasyutikong pananaliksik.

### Patibong 6: Pilipinolohiya laban sa Philippine Studies

Parehong "tungkol sa Pilipinas" ang paksa, kaya madaling malito. Ang sukatan ay **kanino nanggagaling at para kanino ang kaalaman**: Pilipinolohiya — mula sa "loob", gamit ang sariling kultura; Philippine Studies — ang Pilipinas bilang obheto ng area studies para sa mga banyagang institusyon.

**Mini-drill:** Ang isang pag-aaral tungkol sa mga piyesta sa Pilipinas na isinagawa para sa pangangailangan ng isang banyagang institusyon — Pilipinolohiya ba ito?

**Sagot:** Hindi. Kahit Pilipinas ang paksa, Philippine Studies ang oryentasyon nito dahil obheto lamang ang Pilipinas at banyagang institusyon ang pinaglilingkuran.

### Patibong 7: Ang mga Pahayag na Binaligtad sa Tama o Mali

Paboritong padron ng mga tanong na Tama o Mali ang pagbaligtad ng direksyon ng epekto: "ang Ingles ay nagpaunlad sa pambansang wika" (mali — nilimitahan nito), "ang kolonyal na edukasyon ay naghikayat ng industriyalisasyon" (mali — nagtanim ito ng takot dito), "ang masa ay napadali ang pakikilahok dahil sa Ingles" (mali — nahirapan sila).

**Mini-drill:** Tama o Mali — Ang oryentasyong pang-agrikultura ng kolonyal na edukasyon ay naghanda sa Pilipinas na maging tagagawa ng mga yaring produkto.

**Sagot:** Mali. Pinanatili nito ang bansa bilang **tagaluwas ng murang hilaw na materyales** at **tagabili** ng mamahaling yaring produkto mula sa labas.
$md$, 6),

('a2000004-0001-0001-0002-0000000000e1','activity','Gabay sa Finals: Saklaw at Rapid Review Sheet',$md$
### Saklaw ng Finals

Ang finals ay **kumulatibo**: sinasaklaw nito ang Kabanata 1 hanggang 3, ngunit **mas mabigat sa Kabanata 3** (Filipinolohiya, Pambansang Industriyalisasyon, at Kaunlaran). Asahan na humigit-kumulang kalahati o higit pa ng mga aytem ay mula sa Kabanata 3, at ang natitira ay repaso ng Kabanata 1 at 2.

### Rapid Review: Kabanata 3 (Pinakamabigat)

**Depinisyon ng Pambansang Industriyalisasyon:** proseso ng pagtatatag at sistematikong pagpapaunlad sa iba't ibang antas ng mga lokal na industriya upang pasiglahin ang ekonomiya, tugunan ang pangangailangan ng mamamayan, at baguhin ang bansa mula sa pagiging **atrasadong agraryan** patungong **modernong industriyal** na lipunan.

**Tatlong antas ng industriya (dapat sabay at planado ang pagpapatatag):**

| Antas | Papel | Mga Produkto |
|---|---|---|
| **Mabigat na Industriya** | Pundasyon ng ekonomiya | Kagamitang pamproduksyon, makinarya, bakal, kemikal, enerhiya |
| **Intermedyong Industriya** | Tagapag-ugnay | Ekstrang bahagi (spare parts), kable, semi-prosesong materyales |
| **Magaang Industriya** | Pantugon sa pang-araw-araw | Pagkain, damit, gamot, kagamitan sa bahay |

**Agrikultura at industriya:** ang **tunay na reporma sa lupa** ang pangunahing basehan ng industriyalisasyon. Ang maunlad na agrikultura (sa pamamagitan ng mekanisasyon at modernisasyon) ay nagbibigay ng dalawang bagay: (1) sapat at murang pagkain, at (2) tuluy-tuloy na suplay ng lokal na hilaw na materyales para sa mga pambansang pabrika nang hindi umaasa sa import.

**Limang rekursong pang-ekonomiya ng Pilipinas:**

1. **Yamang Lupa** — milyun-milyong ektarya ng matabang lupain (palay, mais, niyog, tubo).
2. **Yamang Tubig** — karagatan, daan-daang ilog, at mga lawa (isda, irigasyon, transportasyon, enerhiya).
3. **Yamang Mineral** — isa sa pinakamalaking reserba sa mundo: ginto, tanso, nickel, chromite.
4. **Enerhiya** — natural gas, geothermal, hydropower, solar, wind energy.
5. **Yamang Tao** — milyun-milyong skilled workers at propesyonal na kilala sa buong mundo.

**Ang balangkas ng pagpapatupad ng Filipinolohiya (kabisaduhin ang daloy):**

Karanasang Bayan (wika, tao, kultura, likas na yaman) → **sisinupin ng sistema ng edukasyon** (proseso, dokumentasyon, siyentipikong balangkas) → Talinong Bayan (makaagham at lapat na karunungan) → Karunungang Gagabay (polisiyang kultural, pulitikal, ekonomikal) → Paglikha ng mga Pangangailangan (industriya, trabaho, polisiyang pang-ekonomiya) → **Pambansang Kaunlaran** (tunay na kalayaan, maunlad na lipunan).

**Halimbawang dapat tandaan:** dahon ng **Tawa-tawa** bilang tradisyunal na panggagamot sa dengue (karanasang bayan) → parmasyutikong pananaliksik na nagpatunay sa kakayahan nitong magpataas ng platelets, tungo sa mga modernong gamot na aprubado ng FDA (proseso ng Filipinolohiya).

### Rapid Review: Kabanata 1 at 2 (Pinaikling Listahan)

- Kolonisasyon → marka sa **kamalayan**; wikang banyaga → limitado ang pambansang wika → lumalabo ang pagkakakilanlan.
- **"Unawa at salakay"** — dokumentasyon muna ng kultura bago manipulahin; ipinalaganap ang Kristiyanismo sa pamamagitan ng pag-aaral ng katutubong wika.
- Bago ang kolonisasyon: magkakahiwalay na pangkat, walang iisang pambansang wika.
- **Pagbubura sa tala ng bayan** — wala ang boses ng katutubo sa mga dokumento maliban kung negatibo.
- **Lisyang edukasyon** (Amerikano): armas ng pagsupil; Ingles bilang pader; oryentasyong pang-agrikultura → takot sa industriyalisasyon; Ingles sa batas → kawalan ng malay, rehiyonalismo, pag-asa sa tradisyunal na lider.
- **Sikolohiyang Pilipino** — diwa; laban sa unibersalidad ng teoryang Kanluranin; **pakapa-kapa** (walang paunang hinuha) at **pagdalaw-dalaw** (tiwala).
- **Pilipinolohiya** — mula sa "loob"; laban sa **Philippine Studies** (area studies para sa banyaga).
- **Pantayong Pananaw** — diskursong pangkabihasnan; "tayo" hindi "pangkami"; may PP lamang kung alam ng **lahat** ang mga kodigo.
- **Filipinolohiya** — karanasang bayan → talinong bayan → pambansang pag-unlad.

### Estratehiya sa Pagsagot

- Sa mga tanong tungkol sa tatlong antas ng industriya, hanapin ang **produkto**: makinarya at bakal — mabigat; spare parts at kable — intermedyo; pagkain, damit, at gamot — magaan.
- Sa mga tanong tungkol sa balangkas, tandaan na ang **sistema ng edukasyon** ang nagpoproseso, at ang dulo ay laging **pambansang kaunlaran**.
- Sa mga kumulatibong tanong, hanapin ang tulay: ang **takot sa industriyalisasyon** (Kabanata 1) ang siyang nilulunasan ng **pambansang industriyalisasyon** (Kabanata 3).
$md$, 7),

('a2000004-0001-0001-0002-0000000000e1','activity','Final Mock Exam A — 30 Aytem',$md$
### Panuto

Kumulatibo: Kabanata 1 hanggang 3, mas mabigat sa Kabanata 3. Inirerekomendang oras: 50 minuto.

### Bahagi I: Multiple Choice (1–12)

**1.** Ano ang Pambansang Industriyalisasyon?

- A. Ang pagtatayo ng mga banyagang pagawaan sa loob ng bansa
- B. Ang proseso ng pagtatatag at sistematikong pagpapaunlad ng mga lokal na industriya upang baguhin ang bansa mula sa atrasadong agraryan patungong modernong industriyal na lipunan
- C. Ang pagluluwas ng mas maraming hilaw na materyales
- D. Ang pagpapalit ng agrikultura ng serbisyo bilang pangunahing sektor

**2.** Aling antas ng industriya ang itinuturing na "pundasyon ng ekonomiya"?

- A. Magaang industriya
- B. Intermedyong industriya
- C. Mabigat na industriya
- D. Industriya ng serbisyo

**3.** Ang paggawa ng mga ekstrang bahagi (spare parts), kable, at semi-prosesong materyales ay gawain ng —

- A. mabigat na industriya
- B. intermedyong industriya
- C. magaang industriya
- D. agrikultura

**4.** Ang pagpoproseso ng pagkain, damit, gamot, at kagamitan sa bahay ay gawain ng —

- A. mabigat na industriya
- B. intermedyong industriya
- C. magaang industriya
- D. mabigat at intermedyong industriya nang sabay

**5.** Ano ang nagsisilbing pangunahing basehan ng industriyalisasyon ayon sa aralin?

- A. Pagpapalakas ng turismo
- B. Ang pagpapatupad ng tunay na reporma sa lupa
- C. Pag-import ng mga makabagong makinarya
- D. Pagpapadami ng mga economic zone

**6.** Ano ang dalawang mahalagang ibinibigay ng maunlad na agrikultura sa bansa?

- A. Turismo at dayuhang puhunan
- B. Sapat at murang pagkain, at tuluy-tuloy na suplay ng lokal na hilaw na materyales para sa mga pambansang pabrika
- C. Mas maraming lupang maibebenta at mas mataas na buwis
- D. Murang paggawa at murang kuryente

**7.** Alin sa mga sumusunod ang **HINDI** kabilang sa mga mineral na binanggit sa aralin bilang reserba ng Pilipinas?

- A. Ginto
- B. Tanso
- C. Lithium
- D. Chromite

**8.** Sa balangkas ng pagpapatupad ng Filipinolohiya, ano ang sumisinop sa karanasang bayan upang maging talinong bayan?

- A. Ang pamahalaang lokal
- B. Ang sistema ng edukasyon
- C. Ang mga banyagang unibersidad
- D. Ang pribadong sektor

**9.** Sa halimbawa ng Tawa-tawa, ano ang kumakatawan sa "proseso ng Filipinolohiya"?

- A. Ang paggamit ng dahon nito bilang tradisyunal na panggagamot sa dengue
- B. Ang pagsasagawa ng parmasyutikong pananaliksik upang patunayan sa siyentipikong paraan ang kakayahan nitong magpataas ng platelets
- C. Ang pagtatanim ng Tawa-tawa sa mga bakuran
- D. Ang pagbebenta nito sa palengke

**10.** Ano ang pangunahing kasangkapan ng mga Amerikano sa pagsakop ng rebolusyonaryong kamalayan ng mga Pilipino?

- A. Relihiyon
- B. Edukasyon
- C. Kalakalan
- D. Sandatahang lakas

**11.** Kailan masasabing may Pantayong Pananaw ang isang lipunan?

- A. Kapag may sariling saligang-batas ito
- B. Kapag ang lahat ng mamamayan ay gumagamit ng mga konsepto at kodigo na alam ng lahat ang kahulugan
- C. Kapag maraming iskolar itong nagsusulat sa Ingles
- D. Kapag kinikilala ito ng mga banyagang institusyon

**12.** Saan nakabatay ang mga katutubong metodolohiya sa pananaliksik ng Sikolohiyang Pilipino?

- A. Sa mga pamantayang Kanluranin
- B. Sa pakiramdam at pakikipagkapwa
- C. Sa mga eksperimento sa laboratoryo
- D. Sa mga opisyal na dokumentong kolonyal

### Bahagi II: Tama o Mali (13–20)

**13.** Ang magaang industriya ang lumilikha ng mga makinarya, bakal, at kemikal.

**14.** Kinakailangan ang sabay at planadong pagpapatatag sa tatlong antas ng industriya upang maging ganap ang pag-unlad ng bansa.

**15.** Ang mekanisasyon at modernisasyon ng pagsasaka ay nagpapataas ng produktibidad ng mga bukirin.

**16.** Ayon sa aralin, kulang ang Pilipinas sa mga rekurso kaya hindi ito maaaring maging isang industriyal na bansa.

**17.** Kabilang ang yamang tao sa mga rekursong pang-ekonomiya ng Pilipinas.

**18.** Sa balangkas ng pagpapatupad ng Filipinolohiya, ang talinong bayan ay nauuna bago ang karanasang bayan.

**19.** Relihiyon ang pangunahing kasangkapan ng mga Amerikano sa pagsakop ng kamalayan ng mga Pilipino.

**20.** Ayon sa Pantayong Pananaw, dapat gamitin ang banyagang wika upang ipaliwanag ang sarili sa mga dayuhan.

### Bahagi III: Pagtutukoy (21–26)

**21.** Aling antas ng industriya ang lumilikha ng mga kagamitang pamproduksyon, makinarya, bakal, kemikal, at enerhiya?

**22.** Anong repormang pang-agraryo ang nagsisilbing pangunahing basehan ng industriyalisasyon?

**23.** Sa Filipinolohiya, ano ang tawag sa makaagham at lapat na karunungan na produkto ng pagsisinop sa karanasang bayan?

**24.** Anong yamang pang-ekonomiya ng Pilipinas ang binubuo ng malawak na karagatan, daan-daang ilog, at mga lawa na mapagkukunan ng isda, irigasyon, transportasyon, at enerhiya?

**25.** Anong estratehiya ng mga Espanyol ang pag-aaral muna sa kultura at pamumuhay ng mga katutubo bago ito tuluyang baguhin o manipulahin?

**26.** Anong metodolohiya ng Sikolohiyang Pilipino ang eksploratoryong pagpapakiramdam sa konteksto ng komunidad nang walang paunang hinuha?

### Bahagi IV: Maikling Pagsusuri (27–30) — 3 hanggang 5 pangungusap bawat isa

**27.** Bakit kinakailangang **sabay at planado** ang pagpapatatag sa tatlong antas ng industriya sa halip na isa-isa?

**28.** Ipaliwanag ang daloy mula karanasang bayan tungo sa pambansang kaunlaran ayon sa balangkas ng pagpapatupad ng Filipinolohiya.

**29.** Paano nauugnay ang oryentasyong pang-agrikultura ng lisyang edukasyon sa Kabanata 1 sa panawagan para sa pambansang industriyalisasyon sa Kabanata 3?

**30.** Bakit itinuturing na base o pundasyon ng industriyalisasyon ang tunay na reporma sa lupa at ang pagpapaunlad ng agrikultura?
$md$, 8),

('a2000004-0001-0001-0002-0000000000e1','activity','Final Mock Exam B — 30 Aytem',$md$
### Panuto

Kumulatibo: Kabanata 1 hanggang 3, mas mabigat sa Kabanata 3. Bagong mga aytem. Inirerekomendang oras: 50 minuto.

### Bahagi I: Multiple Choice (1–12)

**1.** Alin sa mga sumusunod ang **HINDI** layunin ng Pambansang Industriyalisasyon?

- A. Pasiglahin ang ekonomiya
- B. Tugunan ang pangangailangan ng mamamayan
- C. Panatilihin ang bansa bilang tagaluwas ng murang hilaw na materyales
- D. Baguhin ang bansa tungo sa isang modernong industriyal na lipunan

**2.** Alin sa mga sumusunod ang produkto ng mabigat na industriya?

- A. Damit at gamot
- B. Bakal, kemikal, at kagamitang pamproduksyon
- C. Pagkain at kagamitan sa bahay
- D. Mga produktong pansining

**3.** Ano ang papel ng intermedyong industriya sa kabuuang sistema ng industriya?

- A. Lumilikha ng enerhiya para sa buong bansa
- B. Gumagawa ng mga ekstrang bahagi, kable, at semi-prosesong materyales na kailangan sa pagbuo ng mga makina
- C. Nagpoproseso ng pagkain para sa mamamayan
- D. Nagtatanim ng mga hilaw na materyales

**4.** Isang pabrika ng gamot at isang pabrika ng damit — saang antas ng industriya sila nabibilang?

- A. Mabigat na industriya
- B. Intermedyong industriya
- C. Magaang industriya
- D. Hindi sila kabilang sa industriya

**5.** Paano tinutulungan ng maunlad na agrikultura ang mga pambansang pabrika?

- A. Nagbibigay ito ng tuluy-tuloy na suplay ng mga lokal na hilaw na materyales nang hindi umaasa sa pag-import
- B. Nagbibigay ito ng dayuhang puhunan
- C. Nagpapababa ito ng sahod ng mga manggagawa
- D. Nagbibigay ito ng mga inhinyero

**6.** Alin sa mga sumusunod ang **HINDI** kabilang sa mga pinagmumulan ng enerhiya na binanggit sa aralin?

- A. Natural gas
- B. Geothermal
- C. Nuclear
- D. Hydropower

**7.** Sa balangkas ng pagpapatupad ng Filipinolohiya, ano ang kasunod ng talinong bayan?

- A. Karanasang bayan
- B. Karunungang gagabay sa polisiyang kultural, pulitikal, at ekonomikal
- C. Pambansang kaunlaran agad
- D. Sistema ng edukasyon

**8.** Sa halimbawa ng Tawa-tawa, ano ang kumakatawan sa "karanasang bayan"?

- A. Ang parmasyutikong pananaliksik
- B. Ang paggamit ng dahon nito bilang tradisyunal na panggagamot sa mga may dengue
- C. Ang pag-apruba ng FDA sa mga modernong gamot
- D. Ang pagpapataas ng platelets

**9.** Ano ang huling yugto ng balangkas ng pagpapatupad ng Filipinolohiya?

- A. Talinong bayan
- B. Paglikha ng mga pangangailangan
- C. Pambansang kaunlaran — tunay na kalayaan at maunlad na lipunan
- D. Dokumentasyon ng karanasang bayan

**10.** Bakit itinuring na mga tulisan ang mga bayaning Pilipino sa ilalim ng kolonyal na edukasyon?

- A. Dahil talagang lumabag sila sa batas ng sariling bayan
- B. Dahil ang kasaysayang itinuro ay mula sa pananaw ng mananakop, kaya ang lumaban sa pananakop ay ipinalabas na salarin
- C. Dahil walang naitala tungkol sa kanila
- D. Dahil hiniling ito ng mga Pilipinong guro

**11.** Para kanino pangunahing ginagawa ang kaalaman sa tradisyunal na Philippine Studies ayon sa aralin?

- A. Para sa masang Pilipino
- B. Para sa kapakinabangan at pangangailangan ng mga banyagang institusyon
- C. Para sa mga lokal na pamahalaan
- D. Para sa mga guro ng Filipino

**12.** Sa talahanayan ng paghahambing, paano ginagamit ng Sikolohiyang Pilipino ang wika bilang instrumento?

- A. Katutubong wika bilang susi sa pag-unawa sa panloob na kalagayan ng tao
- B. Wika bilang pundasyon ng pambansang industriya
- C. Banyagang wika bilang tulay sa mga dayuhang mananaliksik
- D. Wika bilang paraan ng pagtuturo ng Ingles

### Bahagi II: Tama o Mali (13–20)

**13.** Ang intermedyong industriya ay gumagawa ng mga ekstrang bahagi (spare parts) at kable.

**14.** Ang layunin ng Pambansang Industriyalisasyon ay tugunan lamang ang pangangailangan ng banyagang merkado.

**15.** Ang Pilipinas ay may isa sa pinakamalaking reserba ng mga mineral sa buong mundo.

**16.** Ang yamang tao ng Pilipinas ay binubuo ng milyun-milyong skilled workers at propesyonal na kilala sa buong mundo.

**17.** Sa balangkas ng pagpapatupad ng Filipinolohiya, ang industriya, trabaho, at polisiyang pang-ekonomiya ay bahagi ng yugto ng "paglikha ng mga pangangailangan".

**18.** Ang pag-asa sa pag-import ng mga yaring produkto at makinarya ay nagpapalakas sa pag-unlad ng sariling agham at teknolohiya.

**19.** Bago ang kolonisasyon, mayroon nang sentralisadong konsepto ng isang buong bansa.

**20.** Nilalayon ng Filipinolohiya na sinupin ang mga karanasang bayan upang maproseso bilang talinong bayan.

### Bahagi III: Pagtutukoy (21–26)

**21.** Aling antas ng industriya ang nagpoproseso ng mga produktong pangkonsumo para sa pang-araw-araw na pangangailangan ng buong bayan?

**22.** Anong yamang pang-ekonomiya ang tumutukoy sa reserba ng ginto, tanso, nickel, at chromite ng bansa?

**23.** Sa Filipinolohiya, ano ang tawag sa mga praktikal at pang-araw-araw na danas ng mga mamamayan na hilaw na materyal ng talinong bayan?

**24.** Anong perspektibo ang binibigyang-diin ng Pantayong Pananaw — ang komunikasyon ng mga Pilipino para sa kapwa Pilipino?

**25.** Anong termino ang tumutukoy sa edukasyong kolonyal na ipinatupad ng mga Amerikano upang supilin ang rebolusyonaryong kamalayan?

**26.** Aling antas ng industriya ang gumagawa ng mga semi-prosesong materyales na kailangan sa pagbuo ng mga makina?

### Bahagi IV: Maikling Pagsusuri (27–30) — 3 hanggang 5 pangungusap bawat isa

**27.** Ipaliwanag kung bakit hindi katumbas ng Pambansang Industriyalisasyon ang simpleng pagtatayo lamang ng mga banyagang assembly plant o economic zone sa bansa.

**28.** Gamit ang halimbawa ng Tawa-tawa, ipakita kung paano gumagana ang balangkas ng Filipinolohiya mula karanasang bayan tungo sa kapakinabangan ng bansa.

**29.** Ano ang papel ng wika sa pambansang pag-unlad kung pagsasamahin ang mga aral ng Kabanata 1 (kolonyal na edukasyon) at Kabanata 2 (mga perspektibo sa indihenisasyon)?

**30.** Ipaliwanag ang pahayag: "Ang maunlad na agrikultura ay pundasyon ng industriyalisasyon."
$md$, 9),

('a2000004-0001-0001-0002-0000000000e1','activity','Susi ng Kasagutan sa Final Mock Exams — may Paliwanag',$md$
### Final Mock Exam A

**Bahagi I: Multiple Choice**

1. **B.** Ang NI ay pagpapaunlad ng mga **lokal** na industriya tungo sa modernong industriyal na lipunan; ang A ay banyagang pagawaan lamang, at ang C ang mismong kalagayang nilulunasan nito.
2. **C.** Ang mabigat na industriya ang pundasyon dahil lumilikha ito ng mga kagamitang pamproduksyon na ginagamit ng iba pang industriya.
3. **B.** Spare parts, kable, at semi-prosesong materyales — intermedyong industriya; ang mabigat (A) ay makinarya at bakal, ang magaan (C) ay produktong pangkonsumo.
4. **C.** Ang pagkain, damit, gamot, at kagamitan sa bahay ay mga produktong pangkonsumo ng magaang industriya.
5. **B.** Tahasang sinabi ng aralin na ang pagpapatupad ng tunay na reporma sa lupa ang pangunahing basehan ng industriyalisasyon; ang C (pag-import ng makinarya) ay sintomas ng pag-asa sa labas.
6. **B.** Dalawang ibinibigay ng maunlad na agrikultura: murang pagkain para sa mamamayan at lokal na hilaw na materyales para sa mga pabrika.
7. **C.** Ginto, tanso, nickel, at chromite ang binanggit sa aralin; walang lithium sa listahan.
8. **B.** Sa balangkas, ang sistema ng edukasyon ang sumisinop sa karanasang bayan sa pamamagitan ng proseso, dokumentasyon, at siyentipikong balangkas.
9. **B.** Ang parmasyutikong pananaliksik ang proseso ng Filipinolohiya; ang A (tradisyunal na paggamit) ang karanasang bayan — bantayan ang pagkakabaligtad.
10. **B.** Edukasyon ang kasangkapan ng mga Amerikano; relihiyon (A) ang sa mga Espanyol.
11. **B.** Ang kondisyon ng PP: gumagamit ang **lahat** ng mamamayan ng mga konsepto at kodigong alam ng lahat ang kahulugan.
12. **B.** Nakabatay ang mga metodolohiya ng SP sa pakiramdam at pakikipagkapwa — gaya ng pakapa-kapa at pagdalaw-dalaw.

**Bahagi II: Tama o Mali**

13. **Mali.** Mabigat na industriya ang lumilikha ng makinarya, bakal, at kemikal; ang magaan ay nagpoproseso ng produktong pangkonsumo.
14. **Tama.** Kinakailangan ang sabay at planadong pagpapatatag ng tatlong antas upang maging ganap ang pag-unlad.
15. **Tama.** Ito ang papel ng mekanisasyon at modernisasyon ng pagsasaka.
16. **Mali.** Ayon sa aralin, may **sapat at mayayamang** rekurso ang Pilipinas upang maging industriyal na bansa.
17. **Tama.** Ang yamang tao ay isa sa limang rekursong pang-ekonomiya na binanggit.
18. **Mali.** Ang karanasang bayan ang panimulang punto; sinisinop pa lamang ito upang maging talinong bayan.
19. **Mali.** Edukasyon ang kasangkapan ng mga Amerikano; relihiyon ang sa mga Espanyol.
20. **Mali.** Iyan ang perspektibong "pangkami" na inilalayo ng PP; ang itinataguyod nito ay ang "tayo" — komunikasyon para sa kapwa Pilipino sa sariling wika.

**Bahagi III: Pagtutukoy**

21. **Mabigat na industriya (heavy industries).**
22. **Tunay na reporma sa lupa.**
23. **Talinong bayan.**
24. **Yamang tubig.**
25. **Estratehiyang "unawa at salakay".**
26. **Pakapa-kapa.**

**Bahagi IV: Maikling Pagsusuri (mga puntong dapat lumitaw sa sagot)**

27. Magkakaugnay ang tatlong antas: ang mabigat na industriya ang lumilikha ng makinarya na ginagamit ng iba pang industriya, ang intermedyo ang nagbibigay ng mga bahagi sa pagbuo ng mga makina, at ang magaan ang tumutugon sa pang-araw-araw na pangangailangan. Kapag isa lamang ang pinaunlad, mananatili ang pag-asa sa import para sa kulang na antas, kaya dapat sabay at planado.
28. Ang karanasang bayan (wika, tao, kultura, likas na yaman) ay sinisinop ng sistema ng edukasyon sa pamamagitan ng dokumentasyon at siyentipikong balangkas upang maging talinong bayan; ang karunungang ito ang gagabay sa polisiyang kultural, pulitikal, at ekonomikal, na lilikha ng industriya at trabaho, tungo sa pambansang kaunlaran — tunay na kalayaan at maunlad na lipunan.
29. Itinanim ng lisyang edukasyon ang pananaw na para lamang sa agrikultura ang Pilipinas, na nagbunsod ng takot at pagwawalang-bahala sa industriyalisasyon at nagpanatili sa bansa bilang tagaluwas ng hilaw na materyales. Ang pambansang industriyalisasyon sa Kabanata 3 ang tugon dito: pagbabago mula atrasadong agraryan tungo sa modernong industriyal na lipunan gamit ang sariling rekurso.
30. Ang tunay na reporma sa lupa, kasama ang mekanisasyon ng pagsasaka, ay nagpapataas ng produktibidad ng mga bukirin; nagbibigay ito ng sapat at murang pagkain sa mamamayan at ng tuluy-tuloy na suplay ng lokal na hilaw na materyales sa mga pambansang pabrika nang hindi umaasa sa import — kaya ito ang base ng industriyalisasyon.

### Final Mock Exam B

**Bahagi I: Multiple Choice**

1. **C.** Ang pananatili bilang tagaluwas ng murang hilaw na materyales ang mismong kalagayang binabago ng NI; ang A, B, at D ay pawang mga layunin nito.
2. **B.** Bakal, kemikal, at kagamitang pamproduksyon — mabigat na industriya; ang A at C ay mga produkto ng magaang industriya.
3. **B.** Ang intermedyong industriya ang gumagawa ng spare parts, kable, at semi-prosesong materyales para sa pagbuo ng mga makina.
4. **C.** Ang gamot at damit ay mga produktong pangkonsumo para sa pang-araw-araw na pangangailangan — magaang industriya.
5. **A.** Ang maunlad na agrikultura ang nagbibigay ng lokal na hilaw na materyales sa mga pabrika nang hindi umaasa sa pag-import.
6. **C.** Natural gas, geothermal, hydropower, solar, at wind energy ang binanggit; walang nuclear sa listahan ng aralin.
7. **B.** Pagkatapos ng talinong bayan, ito ay nagiging karunungang gagabay sa polisiyang kultural, pulitikal, at ekonomikal bago ang paglikha ng mga pangangailangan.
8. **B.** Ang tradisyunal na paggamit ng dahon ng Tawa-tawa ang karanasang bayan; ang pananaliksik (A) ang proseso ng Filipinolohiya.
9. **C.** Ang dulo ng balangkas ay pambansang kaunlaran — tunay na kalayaan at maunlad na lipunan.
10. **B.** Ang kasaysayang itinuro ay mula sa pananaw ng mananakop, kaya ang mga lumaban ay ipinalabas na salarin o tulisan — hindi dahil totoo itong lumabag sila sa sariling bayan (A).
11. **B.** Ang Philippine Studies ay para sa kapakinabangan at pangangailangan ng mga banyagang institusyon — ito ang pagkakaiba nito sa Pilipinolohiya.
12. **A.** Sa talahanayan, ang wika para sa SP ay katutubong wika bilang susi sa pag-unawa sa panloob na kalagayan ng tao; ang B ay para sa Filipinolohiya.

**Bahagi II: Tama o Mali**

13. **Tama.** Ito mismo ang paglalarawan ng aralin sa intermedyong industriya.
14. **Mali.** Layunin ng NI na tugunan ang pangangailangan ng **mamamayan**, hindi ng banyagang merkado.
15. **Tama.** Isa ang Pilipinas sa may pinakamalaking reserba ng mineral sa buong mundo.
16. **Tama.** Ito ang paglalarawan sa yamang tao bilang rekursong pang-ekonomiya.
17. **Tama.** Sa balangkas, ang industriya, trabaho, at polisiyang pang-ekonomiya ay nasa yugto ng "paglikha ng mga pangangailangan".
18. **Mali.** Ang pag-asa sa import ay **hadlang** sa pag-unlad ng sariling agham at teknolohiya.
19. **Mali.** Walang sentralisadong konsepto ng bansa bago ang kolonisasyon; magkakahiwalay ang mga pangkat.
20. **Tama.** Ito ang pangunahing layunin ng Filipinolohiya bilang disiplina.

**Bahagi III: Pagtutukoy**

21. **Magaang industriya (light industries).**
22. **Yamang mineral.**
23. **Karanasang bayan.**
24. **Perspektibong "tayo".**
25. **Lisyang edukasyon.**
26. **Intermedyong industriya (medium industries).**

**Bahagi IV: Maikling Pagsusuri (mga puntong dapat lumitaw sa sagot)**

27. Ang NI ay pagtatatag ng mga **lokal** na industriya sa tatlong antas — mabigat, intermedyo, at magaan — na pag-aari at para sa mamamayan, upang matugunan ang pangangailangan ng bansa. Ang banyagang assembly plant ay hindi nagtatayo ng pundasyong mabigat na industriya at nagpapanatili ng pag-asa sa imported na makinarya at teknolohiya, kaya hindi nito binabago ang atrasadong agraryang katangian ng ekonomiya.
28. Ang paggamit ng dahon ng Tawa-tawa bilang panggagamot sa dengue ay karanasang bayan; sa pamamagitan ng parmasyutikong pananaliksik, napatunayan sa siyentipikong paraan ang kakayahan nitong magpataas ng platelets — naging talinong bayan ito na nagbunsod ng mga modernong gamot na aprubado ng FDA. Ipinapakita nito na ang lokal na kaalaman, kapag sininop nang makaagham, ay nagiging batayan ng industriya at kapakinabangang pambansa.
29. Ipinakita ng Kabanata 1 na ang banyagang wika ay ginamit upang ihiwalay ang mga Pilipino sa kanilang kasaysayan at pagkakakilanlan; ipinakita naman ng Kabanata 2 na ang sariling wika ang susi sa pagbuo ng kaalamang mula sa loob — sa SP, sa Pantayong Pananaw, at sa Filipinolohiya. Samakatuwid, ang wika ay hindi lamang kasangkapan ng komunikasyon kundi pundasyon ng pagkatuto, agham, at pambansang pagpapalaya.
30. Ang maunlad na agrikultura, sa pamamagitan ng tunay na reporma sa lupa at mekanisasyon, ay nagbibigay ng sapat at murang pagkain para sa mamamayan at ng tuluy-tuloy na suplay ng lokal na hilaw na materyales para sa mga pambansang pabrika. Kung walang ganitong base, mananatiling umaasa ang industriya sa inaangkat na materyales, kaya hindi ito magiging tunay na pambansa.
$md$, 10);
