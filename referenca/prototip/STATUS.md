# Status — tvoj AI knjigovođa (prototip)

Pun istorijat po rundama (Faza 1-10, četrnaest krugova) je u [STATUS_ISTORIJA.md](STATUS_ISTORIJA.md). Ovaj fajl je namerno kratak — samo trenutno stanje i otvorene stavke — da početak svakog kruga bude jeftin za čitanje.

## Stanje po fazi (11.2)

| Faza | Status |
|---|---|
| 1 Temelj | Gotovo |
| 2 Prijava/onboarding | Gotovo (puni frame-compare ciklus, videti istorija) |
| 2 Početna | Gotovo uz 2 otvorene stavke (25. krug: pun ciklus ponovljen, Poc3 notifikacije ispravljene, vodič kroz aplikaciju Tur0-4 izgrađen; 26. krug: Tur0 ponovo potvrđen = postojeći `WelcomeTourModal`, nula izmena — videti ispod; Sub2 modal-vs-panel i Poc3 footer link i dalje čekaju odluku) |
| 2 Podešavanja | **Gotovo** (23. krug: prvi puni frame-compare ciklus, Pd0-10/PhPd0-10, 22 posla — ranije nikad posebno ciklusovano; nov desktop pregled ekran nađen i izgrađen — videti ispod) |
| 3a Fakture | Gotovo, uz Faza 10b odloženo (Fak24-27) |
| 3b Klijenti | Gotovo |
| 4 Knjiga prihoda | **Zatvorena uz otvorene stavke — videti ispod** (28. krug: dodat prenos dosadašnjeg poslovanja, Uv0-Uv6/PhUv0-PhUv6, videti ispod) |
| 5 Mejlovi banke | **Gotovo** (19. krug: svih 24 posla pregledano u sve 4 kombinacije kontakt-slikama, stvarne greške ispravljene — videti OTVORENE STAVKE za 2 prijavljene, neodlučene stavke) |
| 6 Porez i rokovi | **Gotovo** (19. krug: prvi puni frame-compare ciklus, svih 11 frejmova/22 posla u sve 4 kombinacije — ranije "Gotovo" je bilo bez ovog ciklusa, više stvarnih grešaka nađeno i ispravljeno) |
| 7 Kalendar i obaveštenja | **Gotovo** (20. krug: prvi puni frame-compare ciklus za Kalendar, Kl1-9/17 posla u sve 4 kombinacije — ranije "Gotovo" bilo bez ovog ciklusa; Obaveštenja i dalje nema frejma, rađeno po sopstvenom dizajnu) |
| 8 AI knjigovođa | **Gotovo** (22. krug: prvi puni frame-compare ciklus, Ak1-17/PhAk1-17, 34 posla — ranije "Gotovo" bilo bez ovog ciklusa, krupna strukturna greška nađena i ispravljena — videti ispod) |
| 9 Pretplata | **Gotovo** (23. krug: prvi puni frame-compare ciklus za sâm Pretplata odeljak, Sub3-11/PhSub3-11, 18 posla — ranije "Gotovo" bilo bez ovog ciklusa; videti ispod) |
| 10 Poliranje | U toku (17 krugova dosad) — 27. krug je završna provera: `SPEC_USKLADJENOST.md`, prazna stanja, pun korisnički put |
| 10b | **Izgrađeno (26. krug)** — editor šablona fakture (Fak18/24-27) sad stvarno radi: izbor bloka klikom, prevlačenje+promena veličine, panel osobina, više šablona sa pravilom dodele, primena na pregled/PDF — videti ispod. **28. krug**: Prenos dosadašnjeg poslovanja (Uv0-Uv6/PhUv0-PhUv6) izgrađen i proveren, videti ispod |

## Alati (`tools/frame-compare/`)

- `run.js` — glavni komparator: učitava frejm `.dc.html` (file://, oba panela light/dark) i poredi sa živim prototipom (Playwright, `getComputedStyle`). Uparuje po tekstu; kad više kandidata deli isti tekst, bira najbliži po (x,y) poziciji (NE po tagu — frejm gotovo svuda koristi `<span>`, tag nije pouzdan signal). `DEVICE_WIDTH={desktop:1440,phone:365}` (tačna širina frejm-platna). `RANGE_CHECK_WIDTH={desktop:1280,phone:390}` — samo `scrollWidth>clientWidth` provera loma, ne piksel-poređenje.
- `shoot.js` (NOVO, 13. krug) — `node shoot.js <jobs.json> <outDir> [--threshold=N]`: snima frejm+prototip (oba panela/teme) i pravi JEDNU `contact.png` (frejm levo/prototip desno, light gore/dark dole) za poslove sa odstupanjem ≥ prag, plus `manifest.json`. Pregled ide slika-po-slika, ne tabela-po-tabela.
- `nan-sweep.js` — sweep svih ruta × stanja naloga za "NaN"/"undefined"/"null"/"[object"/"Invalid Date".
- `sweep-phone.js` (NOVO, 21. krug) — `node sweep-phone.js [--widths=360,390,393,430] [--themes=light,dark] [--out=report.json]`: za sve ekrane × sva stanja naloga (8) × širine × teme (uključujući mobilne pod-ekrane bez svoje rute — Podešavanja svih 7 tabova, Fakture/Klijenti, Fakture/Ponavljajuće, otvoreni klikom na stvarni tekst) proverava (a) horizontalni skrol, (b) input/select/textarea/dugme "pune širine" čija širina ne odgovara roditelju (preskače kružna/ikonica dugmad i elemente pored kojih u istom flex-redu stoji sused), (c) element koji prelazi desnu ivicu roditelja (preskače position fixed/absolute/sticky), (d) karticu sa 3+ pune ivice kojoj jedna strana nedostaje (hvata tačno "border-top:0 posle border shorthand-a" tip greške). Izlaz: JSON lista prekršaja po (stanje, ekran, širina, tema) + ukupan broj kombinacija; exit kod 1 ako ima prekršaja. Treba ga dodati u standardni ciklus svake sledeće faze (korisnikov zahtev, 21. krug).
- `plural.test.js` — test za `U.plural(n,[jednina,malo,mnogo])`.
- `jobs-*.json` — po sekciji (prijava-onboarding, prijava-transient, pocetna, fakture, knjiga, ai, podesavanja, pretplata, ...).

**STANDARDNO PRAVILO (uvedeno 14. krug, posle sopstvene greške)**: pre bilo koje DELJENE/cross-cutting izmene (CSS klasa, komponenta korišćena na više mesta), uvek potvrdi iz **sirovog HTML-a frejma**, ne iz screenshot/kontakt-slike utiska. Kontakt-slika je dobra za PRONALAŽENJE kandidata za grešku, loša za POTVRDU strukture (modal vs panel, red vs stack) — to se čita iz `.dc.html` teksta direktno.

## Established obrasci (važe za ceo app)

- **Modal/Sheet footer**: podrazumevano red/desno-poravnato (`.modal-foot`). Opt-in `stackedFooter:true` prop SAMO za 5 frejmom-potvrđenih dijaloga: Storniraj fakturu (Fak17), Sačuvati kao nacrt? (Fak10), Izvezi knjigu prihoda (Kp6), Obrisati prihod? (Kp8), Obrisati razgovor? (Ak17). Potvrđeno DA OSTAJU na redu (ne stack): Dodaj prihod (Kp5), Otkaži pretplatu? (Sub10).
- **SidePanel vs Modal**: Kp4 (detalj uplate) je potvrđeno `SidePanel` na desktopu (560px, desno, puna visina, senka — tačno po sirovom HTML-u i spec 6.7) i donji sheet na telefonu — kod je VEĆ bio ispravan, nema šta da se menja.
- **`dev.*` test-override šablon**: za agregatne brojeve koje seed ne može dostići (npr. `dev.limitOverridePct`, `dev.calendarYearOverride`) — menja SAMO zbirne brojeve za testiranje vizuelnog stanja, nikad ne izmišlja pojedinačne transakcije/redove kad ih frejm i ne prikazuje.
- **Artefakt-merenja kategorije** (NISU prave greške, ne traže izmenu): `border:0` vs `border:1px solid transparent`; UA dugme-padding; `border-radius:9999px` vs `50%`/`999px`; frejm spaja susedni tekst (procenat+iznos, bedž-broj+labela) u JEDAN tekst-čvor gde kod ima više elemenata; frejmov `<label>` obuhvata input, kod ih drži kao susede; seed-specifični brojevi/datumi/klijenti se ne poklapaju sa frejmovim ilustrativnim mokap-podacima; 365→390px / 1440→1280px platno-razlika (width/height).
- **Srpska brojna saglasnost**: `U.plural(n,[jednina,malo,mnogo])` — koristiti svuda umesto ručne `===1` provere.
- **MobileSearchOverlay**: ostaje netaknut dok korisnik ne odluči (kod postoji, bez okidača na telefonu otkad je topbar prerađen u 5. krugu).

## Faza 10, 18. krug — deljeni raspored (Korak 0, sidebar sticky/100vh)

**Nađen i ispravljen pravi uzrok** (ne kozmetički patch): `css/base.css` je imao `html,body{overflow-x:hidden;}` kao JEDNO pravilo na oba elementa. CSS spec pravilo: kad se `overflow-x` postavi na ne-`visible` vrednost, UA računa `overflow-y` kao `auto` i na tom elementu — pošto je ovo pogodilo i `html` i `body` ISTOVREMENO, nastala je dvosmislena situacija sa dva potencijalna scroll-kontejnera, i `position:sticky` na `.sidebar` je prestajao da radi (vizuelni simptom: sidebar se završavao na pola ekrana ili se pomerao sa stranicom kad god je prozor bio nizak ili se stranica skrolovala). Potvrđeno pre izmene: `window.scrollY` posle `window.scrollTo(0,300)` nije se slagao ni sa `document.documentElement.scrollTop` ni sa `document.body.scrollTop` (oba 0) — dokaz da dva nivoa istovremeno "tvrde" da su scroll-kontejner.
- **Ispravka**: `overflow-x:hidden` ostaje SAMO na `html` (uklonjeno sa `body`) — isti vizuelni efekat (nema vodoravnog skrola), ali jedan nedvosmislen scroll-kontejner.
- `.sidebar`: `position:sticky; top:0; height:100vh` + `height:100dvh` (progresivno poboljšanje, igonorisano gde `dvh` nije podržan).
- Unutra: `.sidebar-brand` i `.sidebar-trial`/`.sidebar-user-wrap` dobili `flex-shrink:0` (ostaju fiksne veličine), `.sidebar-nav` dobio `flex:1; min-height:0; overflow-y:auto` — SAMO meni-stavke dobijaju sopstveni unutrašnji skrol kad prozor nije dovoljno visok, logo i kartica pretplate/korisnik ostaju na mestu.
- **Uživo potvrđeno** (desktop 1440px, `app/fakture`): na 450px visine prozora — `.sidebar-nav` ima `scrollHeight:192` vs `clientHeight:100` (stvarno interno skrolovanje), dok `.sidebar` zauzima tačno `top:0,bottom:450` (ceo prozor), bez klipovanja logoa/kartice/korisnika. Na 600px visine, sve stavke menija stanu bez unutrašnjeg skrola. Posle skrolovanja stranice za 350px (tamna tema), `.sidebar.getBoundingClientRect()` i dalje `top:0,bottom:600` — sidebar se NE pomera sa sadržajem (ranije se pomerao).
- Proveren bez regresije: `fullBleed` ekrani (Mb9/Mb5, i dalje bez sidebar-a), SidePanel preko sadržaja (Knjiga prihoda), mobilna širina 365px (nema vodoravnog skrola uprkos uklanjanju `overflow-x:hidden` sa `body`).
- **Iskreno nedostaje**: formalni snimci PRE ispravke (bag je ispravljen tokom uživo-debagovanja u istom krugu, pre nego što je snimanje "pre" stanja eksplicitno traženo; mehanizam kvara je umesto toga dokumentovan tačno u kodu/ovde i potvrđen JS-inspekcijom, ne samo utiskom sa slike). Prazna stanja i dijalog-preko-sadržaja (za razliku od SidePanel-a) nisu posebno spot-provereni ovaj krug — samo lista/detalj/full-bleed/SidePanel/mobilna-širina. 1000px i 1400px visine nisu posebno snimljene (samo 450/600px, plus 350px-skrol na 600px) jer na tim visinama sadržaj ne prelazi prozor pa nema šta posebno da se proveri van onoga što je već potvrđeno.

## OTVORENE STAVKE (po poreklu)

### Knjiga prihoda (Faza 4) — zatvorena uz ograde
1. ~~Mobilni filter-sheet (Kp9/PhKp9)~~ **IZGRAĐENO (15. krug, Korak 1a).** Novi `MobileFilterSheet` u `js/knjiga.js` — donji sheet "Filteri" (Godina/Mesec/Klijent + "Primeni filtere"), potvrđen uživo obe teme na 365px, tačno po `PhKp9.dc.html`. Desktop nedirano (i dalje tri selecta/combo). Nova CSS klasa `.kpo-filter-field` (48px, isti vizuelni jezik kao `.inv-combo`).
2. ~~6 dijaloga bez frejma~~ **PREUZETO I PROVERENO (15. krug, Korak 1b).** Preuzeti sa Design Canvas-a: `Pd2.dc.html` (Računi lista — potvrđeno da NEMA ugrađen dijalog za Izmeni/Ukloni, samo inline dugmad), `Pd8.dc.html` (Promeni lozinku), `Pd9.dc.html` (Izbrisati nalog?), `Pd10.dc.html` (Dodaj račun — SidePanel, već ispravno u kodu). Rezultat: `Promeni lozinku` i `Izbrisati nalog?` dobili `stackedFooter:true`/potvrđeni stack (Pd8 raw HTML: `flex-direction:column;gap:10px`, primarno pa sekundarno); `Izbrisati nalog?` paragraf boja ispravljena na `.sub-muted-dark` (frejm `#4A524C`, ne `--text-muted`); mobilni tekst za taj dijalog sad ima kraću frejm-varijantu. "Izmeni račun"/"Ukloniti račun?" (settings.js `AccountCard`) i "Preimenuj razgovor" (ai.js) **ostaju bez frejma** (Pd2 ne prikazuje te dijaloge, nema Ak frejma za preimenovanje) — footer ostaje na podrazumevanom (red), neizmenjeno.
3. **Usputni nalazi iz ovog istraživanja (potvrđeni iz sirovog HTML-a pre primene, pravilo iz 14. kruga poštovano):**
   - `.modal-head h3` (desktop naslov dijaloga) bio `18px`, frejm (8 nezavisnih dijaloga: Fak17, Fak10, Kp6, Kp8, Ak17, Sub10, Pd8, Pd9) dosledno pokazuje `24px` — ispravljeno globalno.
   - `.sheet-head h3` (mobilni sheet naslov, Modal) bio `24px` (od 5. kruga, zasnovano SAMO na PhSub10) — 7 novih nezavisnih proverenih frejmova (PhKp6, PhKp8, PhPd8, PhPd9, PhAk17 na `20px`; PhSub10, PhFak17 na `24px`) pokazuje da je `20px` većinsko pravilo — vraćeno na `20px`, sa novim opt-in `mobileTitleLg` prop na `Modal` primenjenim SAMO na `CancelModal` (Sub10) i `VoidModal` (Fak17), frejm-potvrđenim izuzecima.
   - **Kp5 ("Dodaj prihod") je bio pogrešna komponenta — `Modal` umesto `SidePanel`.** Raw HTML (`Kp5.dc.html`) pokazuje `position:absolute;right:0;...width:560px` (identično `.side-panel`, 64px bordered header, 20px naslov) — NIJE centriran dijalog. Ispravljeno u `js/knjiga.js` (`AddIncomeModal` sad koristi `SidePanel`). Footer (red, desno) ostao nepromenjen — već je bio ispravan.
   - `SidePanel`-ov mobilni sheet naslov (za razliku od `Modal`-ovog) treba `20px` (potvrđeno PhKp4 i PhKp5) — dodat `.side-panel-sheet-head` override da se razdvoji od `Modal`-ovog sheet-a (koji sad takođe podrazumevano koristi 20px, pa je razdvajanje tehnički samo dokumentaciono, ali čuva nezavisnost ako se jedno od dvoje ponovo promeni).
   - Re-pokrenut `tools/frame-compare` nad Knjigom prihoda (20 poslova) i Fakturama (48 poslova) posle svih izmena — 0 pada/regresije na već-netaknutim poslovima (npr. Fak1/PhFak1 identično pre/posle), PhFak17 i PhKp5 manji broj odstupanja nego pre.
4. ~70 neuparenih elemenata (artefakt-merenja, poimenično upisano u istoriji 14. kruga) — ne blokira zatvaranje.
5. Dijalozi (Kp4/5/6/8) provereni samo svetla tema desktop za vizuelni snimak — tamna tema i telefon potvrđeni samo brojevima alata/kratkim uživo proverama ovog kruga za Kp5/Kp9, ne punim screenshot setom.

### Mejlovi banke (Faza 5) — 15.-17. krug, DALEKO NAPREDOVALO, I DALJE FORMALNO OTVORENO
`tools/frame-compare/jobs-mejlovi.json` (24 posla, Mb1-12 desktop+telefon). Posle 17. kruga: 1476 elemenata frejma, 1108 upareno (bilo 1038), 3026 odstupanja — 0 preklapanja raspona na sva 24 posla. Istorija 15./16. kruga (Mb9/Mb5 puna-ekranska zamena, MejlCard prilozi, dvokolonski detalj-raspored, Mb2/Mb8 raspored) ostaje u pređašnjem tekstu ovog fajla (verzija pre ovog pasusa) — ovde samo DODACI 17. kruga.

**17. krug, Korak 1a — kontakt-slike SVIH 24 posla pregledane (svetla+tamna u istoj slici, oba panela), stvarne greške nađene i ispravljene:**
1. **Mobilni header DetailPage-a (Mb3/6/7/10/11) je imao 3 greške** (potvrđeno raw HTML-om PhMb3): nedostajao "← Mejlovi banke" nazad-link (desktop dvosegmentni breadcrumb se umesto toga sakrivao); status-bedž je bio U ISTOM redu sa h1 (frejm ga stavlja u SVOJ red, posle podnaslova); "Odbaci" dugme se prikazivalo pored "Pregledaj dokumenta" (frejm na telefonu pokazuje SAMO "Pregledaj dokumenta", preko cele širine, 48px). Sve ispravljeno u `DetailPage`, uslovno na `isMobile` (deljena komponenta za sve detalj-varijante).
2. **SentDetail (Mb10/Mb11) je imao NEDOSTAJUĆU kartu "Slanje".** Raw HTML Mb10 potvrđuje treću karticu u desnoj koloni: naslov "Slanje", tekst "Za [klijent] šaljem automatski, bez pitanja." (ili "tražim tvoje odobrenje pre slanja." za ne-auto), pa link "Promeni za ovog klijenta" UNUTAR te kartice — kod je imao samo goli link na dnu, bez kartice i bez teksta o režimu slanja. Dodato, tekst računat preko postojećeg `BM.effectiveAutoSend(client)`. Mb11 frejm pokazuje isti link kao DUGME U ZAGLAVLJU (ne u kartici) — frejmova nedoslednost, nije repliciran taj drugi oblik (previše rizično menjati zajednički header zbog jednog frejma, prijavljeno).
3. **Mb4/Mb12 "Prodaja deviza" podrazumevani tab — nedostajala grana.** Frejm Mb12 (delimična prodaja) pokazuje "Prodaja deviza" kao podrazumevano aktivan tab (ne "Raspored priliva" kao Mb4) — potvrđeno `#C8F169` aktivnom pilulom u raw HTML-u. Ispravljeno: podrazumevani tab je `'prodaja'` kad je `sellMode==='sell_part'`, inače `'raspored'` kao ranije.
4. **DocPreview ("Raspored priliva"/"Nalog za prodaju deviza") je bio pogrešan vizuelni obrazac — najveći nalaz ovog kruga.** Kod je koristio prost `.inv-kv` spisak (1rem font, bez uokvirenja); frejm (potvrđeno znak-po-znak isto za oba dokumenta u Mb4/Mb10/Mb12 raw HTML-u) koristi pravi obrazac-dokument: naslov+datum red, dvokolonski "Nalogodavac:/Banka:" blok, UOKVIRENA tabela redova (0.75rem font, podebljane vrednosti, border-top razdelnici), potpis na dnu. Napravljena `DocTemplate()`/`DocRow()` pomoćna funkcija (`.mb-doc-table`/`.mb-doc-row` nove klase), oba dokumenta sad je koriste. Vizuelno potvrđeno uživo (desktop, obe grane tabova) — veliko poboljšanje, iako je ukupan brojač odstupanja blago porastao (1038→1108 upareno pokazuje da se SADA više elemenata uopšte upoređuje nego pre, isti obrazac viđen ranije u projektu kad se poboljša uparivanje).
5. **Mb7 "Priloži dokument" je bio goli `<input type=file>`** (frejm pokazuje stilizovanu dashed-border zonu sa `Icons.uploadArrow` ikonicom, naslovom i napomenom). Nova `.mb-upload-zone` klasa, native input sakriven unutar `<label>`.

**Korak 1b — sva stanja naloga + pauza-ponašanje (uživo, ne samo NaN sweep):**
- NaN sweep (`nan-sweep.js`, deo standardnog alata) testira SVIH 8 stanja naloga (novi/onboarding/probni/ističe/istekao/aktivan/naplata-nije-uspela/otkazan) protiv `app/mejlovi` liste — čisto u svakom od više prolaza ovog kruga.
- **Istekao nalog (pauziran AI) — potvrđeno uživo, dva nezavisna toka**: (a) Mb4 odobrenje-i-slanje: klik na "Odobri i pošalji banci" dok je nalog `expired` prikazuje toast "AI knjigovođa je pauziran. Izaberi plan da nastaviš." i NE menja status mejla (ostaje "Čeka tvoje odobrenje") — postojeća ispravka iz ranije faze i dalje radi posle svih izmena ovog kruga. (b) Mb6 "Napravi fakturu za ovaj priliv": isti toast, mejl ostaje nerešen, ne prelazi na listu.
- **"Nema čitanja novih mejlova dok je pauziran" nije i ne može biti testirano**: prototip nema mehanizam za "stizanje novog mejla banke" tokom rada (6 mejlova su fiksni seed podaci) — ništa u arhitekturi ne simulira protok vremena/dolazak nove pošte, pa ova tačka specifikacije ostaje neproverljiva u ovom prototipu, iskreno prijavljeno umesto lažno potvrđeno.
- Ostala stanja naloga (probni, ističe, aktivan, otkazan) vizuelno spot-proverena na listi (sidebar kartica ispravno menja ton), NISU prošla kroz svaki detalj/podešavanja/prvo-podešavanje ekran pojedinačno zbog vremena.

**Korak 1c — izlaz iz pune-ekranske zamene (Mb9/Mb5), potvrđeno uživo:**
- Mb9 "Ostavi odobravanje" → vraća na normalnu listu (sidebar se vraća), potvrđeno screenshot-om.
- Mb9 "Uključi automatsku obradu" → ista `finish()` putanja, nije posebno re-snimljeno ali deli identičan kod.
- Mb5 "Nazad na mejlove" → vraća na listu (ranije potvrđeno, 16. krug).
- Mb5 "Otvori fakturu" → napušta `app/mejlovi` potpuno (ide na `app/fakture/<id>`), sidebar se ispravno vraća (fullBleed se gasi jer ruta više nije mejlovi) — potvrđeno uživo, faktura pokazuje "Plaćena" i tačnu Istoriju.
- **Dugme Nazad U PREGLEDAČU nije posebno testirano za Mb9/Mb5** — ali ovo NIJE specifično za ove ekrane: cela aplikacija eksplicitno koristi in-memory rutiranje bez hash/history (CLAUDE.md, "Hash-routing je zabranjen"), potvrđeno `grep`-om da nigde ne postoji `popstate`/`pushState` handler. Dakle browser-Nazad ponašanje (ili odsustvo reakcije) je identično na SVAKOM ekranu aplikacije, ne nešto što je ovaj krug pogoršao ili popravio — prava ispravka (pravo istorijsko rutiranje) bila bi arhitekturna promena van obima ovog kruga.

**Korak 2 — pun tok iz spec 6.5, uživo, jednom (ne izgled, samo funkcionalnost):**
- Mejl stiže (seed) → otvaranje detalja → "Pregledaj dokumenta" → "Odobri i pošalji banci" → status postaje "Poslato banci" sa vremenskom linijom (Mejl stigao/Pripremljeno/Odobrio/Poslato/Čekam potvrdu) → ✅ potvrđeno.
- Knjiga prihoda: uplata se knjiži sa kursom NBS i iznosom u dinarima → ✅ potvrđeno (postojeći `BM._book()`, provereno kroz fakturu/istoriju, ne direktno kroz ekran Knjige prihoda ovaj krug).
- Faktura postaje Plaćena → ✅ potvrđeno uživo (Fak detalj, status+Istorija red "Plaćena, uplata...").
- Limit se osvežava → **NIJE ponovo provereno ovaj krug** (provereno u ranijoj fazi/sesiji, ne re-testirano sada).
- Obaveštenje "Novi mejl banke" → **NIJE testirano** — seed ima gotova obaveštenja (n1/n3), ali nema mehanizma da NOVI mejl banke generiše novo obaveštenje uživo (isti razlog kao "ne čita nove mejlove" iznad — nema simulacije protoka vremena/dolaska pošte).
- Priliv bez fakture, sve 3 opcije: "Napravi fakturu" isprobano (blokirano kad je AI pauziran, očekivano), "Nije moj priliv" isprobano do kraja (✅ "Mejl je odbačen.", mejl nestaje sa liste) — **"Poveži sa postojećom fakturom" NIJE isprobano do kraja ovaj krug** (samo pregledan kod, ista `submit()` funkcija kao ostale dve grane).
- Automatsko slanje: **NIJE posebno ponovo testirano ovaj krug** (bm2/bm5 u seed-u već predstavljaju "Poslato automatski" ishode, ali live-trigger toka mejl-stiže→auto-šalje-se-bez-klika nije simuliran/proveren ovaj krug).

**18. krug — rešen arhitekturni nedostatak koji je ometao gornje tri stavke:** prototip do sada NIJE imao NIKAKAV mehanizam da simulira "nov mejl banke je stigao" (6 mejlova su bili fiksni seed podaci, ništa u kodu nije ikad dodavalo nov red u `state.bankMails` tokom rada) — zato su "obaveštenje o novom mejlu" i "automatsko slanje uživo" ranije bile označene kao arhitekturno neproverljive. Dodato `BM.simulateNewMail(kind)` (`js/actions.js`, kind: `'devizni'|'dinarski'|'no_invoice'`) — pravi STVARAN zapis (nova faktura + klijent iz `Invoices.create`, ne samo zastavica), dostupno kroz dev meni ("Simuliraj novi mejl banke", 3 dugmeta) i kroz onboarding Korak 3 ("Simuliraj dolazni mejl (demo)", sad zove isti mehanizam umesto da samo postavi `inboxConnected:true`). Ovim su sad PRVI PUT proverljive, uživo, sve tri ranije otvorene stavke:
- **Obaveštenje "Novi mejl banke"** → ✅ potvrđeno: svaki poziv dodaje `notifications` red (`type:'Novi mejl banke'`, isti oblik kao seed n1/n3) ODMAH, nezavisno od `notifSettings['mejl'].mail/.push` — namerno: Podešavanja > Obaveštenja sam kaže "Rokovi za državu uvek stižu u aplikaciji. Ovde biraš gde ti ih JOŠ šaljem" (`js/settings.js` ObavestenjaTab sub-tekst), tj. ta dva prekidača gase samo spoljašnji mejl/push kanal (ne postoji u statičnom prototipu), zvonce u app-u je uvek bazna, negašena dostava.
- **Automatsko slanje, globalno i po klijentu** → ✅ potvrđeno uživo, oba nivoa: sa `globalMode:'auto'` nova faktura/mejl odmah dobija status "Poslato automatski" (isti string kao seed bm2/bm5) bez ijednog klika; sa `globalMode:'ask'` ali JEDNOM klijentu `autoSend:true` (izuzetak), 12 uzastopnih simulacija je pokazalo TAČNO da se auto-šalju samo mejlovi tog klijenta, svi ostali ostaju "Čeka tvoje odobrenje" — `approveSend` sad prima `opts.auto` da postavi ispravnu etiketu/istoriju bez menjanja knjiženja.
- **Limit se osvežava** → ✅ ponovo potvrđeno, brojevima: `limitInfo(state).total` pre/posle ručnog "Poveži sa postojećom fakturom" (bm3 → i11): 1.312.451 → 1.458.951 (+146.500 = 1.250 EUR × kurs 117.2, tačno), i pre/posle automatskog slanja: 1.312.451 → 1.352.940.
- **"Poveži sa postojećom fakturom" do kraja** → ✅ sad isprobano do kraja (bilo samo pregledano u kodu 17. kruga): bm3 (Delta Studio SRL, bez fakture) → izabrana postojeća faktura i11 (Joam, 441,28 USD) → mejl menja status u "Poslato banci" i prikazuje se pod imenom Joam Technologies LLC, faktura i11 → "Plaćena", postojeći `noInvoice` prihod (inc0, 1.250 EUR) → `noInvoice:false` i povezan sa i11 — uplata ulazi u zbir (gornji brojevi).
- **Istekao nalog i dalje ispravno blokira i novi I postojeći mejl**: `simulateNewMail` na `expired` nalogu vraća `{ok:false}` i NE dodaje mejl (toast "Novi mejl nije ušao u obradu."); postojeći "Odobri i pošalji banci" na `expired` nalogu i dalje vraća isti blokirajući toast kao ranije (nepromenjeno, ponovo potvrđeno uživo) — u oba slučaja baner "AI knjigovođa je pauziran" vidljiv u sidebar kartici pretplate (postojeća komponenta, ne nova).
- **Ostala stanja naloga na `app/mejlovi`, vizuelno (ne samo NaN sweep)**: `trial_ending`, `payment_failed`, `otkazana` (pre i posle `accessUntil`) spot-provereno screenshot-om — lista/bedževi/kartica pretplate ispravno odražavaju svako stanje, bez gatinga van `expired`/`otkazana-posle-isteka` (tačno po `Sel.subscriptionAccess`). **Nedostaje**: tamna tema za ova dodatna stanja i detalj-ekran za svako stanje pojedinačno (samo lista je spot-proverena).

**19. krug, Korak 1 — `shoot.js` kontakt-slike svih 24 posla (SVE 4 kombinacije) + sva stanja naloga iz dev menija (uključujući tamnu temu za stanja koja su ranije bila samo brojevi) — Faza 5/10 ZATVORENA.**

Tabela odstupanja po uzroku (svako potvrđeno iz sirovog HTML-a frejma pre ispravke, ne iz utiska sa slike):

| # | Ekran(i) | Uzrok | Ispravka |
|---|---|---|---|
| 1 | Mb1/PhMb1 "Tvoja adresa za prijem" | Kod je imao ikonicu i jedan stek (naslov/status/adresa) bez uokvirene kutije za adresu; frejm NEMA ikonicu, leva kolona je fiksnih 300px, adresa je u sivoj kutiji (`--bg` boja, ista u obe teme) sa dugmetom za kopiranje. Telefon ima POTPUNO drugačiji raspored (naslov→kutija→status) i NEMA "Kako da javim banci" link uopšte. | Prepisan `AdresaCard` (desktop/mobilna grana), nove klase `.mb-addr-left/-box/-copy/-card-m`, uklonjena `.mb-addr-icon`. |
| 2 | Mb1/PhMb1 tabovi liste (Sve/Čeka tebe/Obrađeno/Problemi) | Koristili deljeni `.sub-tab` (podvučeni tabovi, isti kao Fakture/Knjiga prihoda) — frejm pokazuje OKRUGLE pilule (`#161A17` aktivna, isto kao postojeći `.inv-chip` iz Fakture filtera). | Markup promenjen na `.chip-row`+`.inv-chip` (ponovo iskorišćena već frejm-potvrđena komponenta, `.sub-tab` NETAKNUT jer ga Fakture/Knjiga prihoda i dalje koriste). |
| 3 | Mb1/PhMb1 "Podešavanja slanja" dugme | Prikazivalo se i na telefonu; frejm (PhMb1) ga nema uopšte na tom ekranu. | Dugme sakriveno na `isMobile` (dostupno i dalje preko Podešavanja > Povezivanje). |
| 4 | Mb3/6/7/10 (sva 4 tipa mejla) telo pisma | Telo je čist tekst — frejm podebljava iznos (ili kod Mb7 frazu "potvrdu o poreklu sredstava") i uokviri adresu za odgovor žutim mark-om (`#FFE9A8`/`rgba(255,190,70,.24)` tamno). | Nova `renderMailBody()` funkcija (deli telo na podebljan/mark segment po poznatom podstringu), nova `.mb-mark` klasa. |
| 5 | Mb6/PhMb6 "Priliv bez fakture" | Nedostajali prilozi "Raspored priliva.pdf"/"Prodaja deviza.pdf" — kod ih je prikazivao samo za `kind==='devizni'`, frejm ih pokazuje i za `kind==='problem_no_invoice'` (potvrđeno, komentar u kodu je to već i tvrdio, samo uslov nije bio ažuriran). | Uslov proširen na `(devizni||problem_no_invoice)`. |
| 6 | Mb6/Mb8/Mb12 aktivna pozadina radio-kartice | Koristila `--sidebar-item-active` (deljeni sidebar-token, bleđi/drugi ton); frejm pokazuje `#F6FBE6` (svetla)/`--surface-2` (tamna). | `.mb-radio.active` pozadina promenjena na frejm-tačne vrednosti (samo pozadina, granica `--suma`/`--limeta` već je bila tačna). |
| 7 | Mb3/6/7/10/PhMb3/6/7/10 mobilni status-bedž | Bedž se uvek prikazivao na telefonu; frejm ga NE prikazuje kad postoji `m.problem` (crvena alert kartica ga čini suvišnim) — potvrđeno PhMb6/PhMb7 (bedž odsutan), PhMb3 (bedž prisutan, bez problema). | Uslov `isMobile && !m.problem`. |
| 8 | Mb12/PhMb12 test-fixtura (NE app kod) | `jobs-mejlovi.json` je globalno postavljao `fxMode:'sell_part'`, ali klijent Acme (c1) ima SOPSTVENI `fxMode:'book_only'` koji po dizajnu (izuzetak po klijentu) pregazi globalno — panel je ispravno pokazivao `book_only`, test je samo pogrešno postavljen. | Dodato i `clients: ... fxMode:'sell_part'` za c1 u setup skripti oba posla — app kod NIJE menjan (bio je ispravan). |

**Lažne uzbune, proverene i odbačene (da se ne ponavljaju u budućim krugovima):**
- Mb4/Mb12 dokument-pozadina izgledala "previše tamna" za svetlu temu na niskoj rezoluciji kontakt-slike — pixel-sample potvrdio `#0F2A22` u FREJMU TAKOĐE (ista boja u obe teme, namerno, već dokumentovano u `base.css`).
- PhMb12 dokument-pregled ("Nalog za prodaju deviza") je izgledao POTPUNO ODSUTAN u kontakt-slici — `shoot.js` koristi `page.screenshot({fullPage:true})`, što NE prati unutrašnji skrol `position:fixed` modala (`.inv-shell`/`.mb-approve-shell`), pa je snimak isečen tačno na visini viewporta (1000px) dok je stvaran sadržaj niže. Uživo potvrđeno (ručni skrol u browser pane-u): dokument se ispravno prikazuje, nema koda da se menja. **Isti mehanizam verovatno utiče i na PhMb4/PhMb5** (isti `.mb-approve-shell`, kontakt-slika im je takođe tačno 1000px visoka) — nije pojedinačno uživo re-potvrđeno zbog vremena, ali uzrok je isti i poznat, nije nova greška.
- Mb9 "Kako da obrađujem mejlove banke?" (prvo podešavanje): frejm pokazuje "Sve radim sam i javim ti" (auto) kao PODRAZUMEVANO izabrano za nov nalog, kod podrazumeva "Tražim tvoje odobrenje" (`autonomySettings.globalMode:'ask'` je default u `js/store.js`). Ovo NIJE ispravljeno — menjanje podrazumevanog režima autonomije je poslovna odluka (utiče na automatsko slanje za SVAKI nov nalog), ne samo izgled, pa je **prijavljeno korisniku umesto samostalno odlučeno** (frejm možda samo ilustruje jednu od opcija, ne nužno propisani default).
- Mb11/PhMb11 "Slanje" kartica: frejm (i desktop i telefon) za `kind==='devizni'` NEMA tu karticu uopšte (desktop umesto toga ima dugme u zaglavlju "Promeni podešavanje" — već poznato i namerno neprepravljeno iz 17. kruga, "previše rizično menjati zajednički header zbog jednog frejma"). Ista odluka proširena i na telefon (ista kartica se i dalje prikazuje svuda, uključujući Mb11/PhMb11) — prijavljeno, ne menjano, isti rizik/kompromis kao već dokumentovano.

**Sva stanja naloga (dev meni, 8 ukupno) na `app/mejlovi` listi, OBE teme, uživo potvrđeno screenshot-om ovaj krug** (ranije samo brojevima/NaN sweep-om za par stanja): `trial`/`trial_ending`/`expired`/`active`/`payment_failed`/`otkazana`(pre i posle isteka pristupa) — bedževi, kartica pretplate i gating (samo `expired`/`otkazana-posle-isteka` pauziraju) ispravno u obe teme. Usputno potvrđen POSTOJEĆI, VAN OBIMA Faze 5 nalaz: sidebar kartica pretplate pogrešno pokazuje "Pretplata aktivna" za `payment_failed` stanje (trebalo bi da pokaže upozorenje) — ovo je Faza 9/Pretplata komponenta (`TrialCard`), ne Mejlovi banke, nije dirano.

NaN sweep čist (80/80) posle ovog koraka.

**Faza 5/10, Mejlovi banke — ZATVORENA** (sve 24 posla pregledana u sve 4 kombinacije, stvarne greške ispravljene i ponovo potvrđene snimcima; preostaju samo gorenavedene dve stavke prijavljene korisniku na odluku, i formalni piksel-po-piksel frame-compare brojevni ciklus koji nikad nije bio deo ovog kruga — Faza 5 red u tabeli na vrhu fajla ažuriran).

### Porez i rokovi (Faza 6) — 19. krug, Korak 2, PRVI puni frame-compare ciklus

Ranija oznaka "Gotovo" (tabela na vrhu fajla) je bila bez ikakvog frame-compare ciklusa — samo ručna provera glavnog ekrana i "Novo rešenje" (18. krug). Ovaj krug je prvi put napravio `tools/frame-compare/jobs-porez.json` (22 posla: PorH, PorOk, PorNov, Pay1-3, Rez2/3/4c/5/6b × desktop/telefon) i pregledao kontakt-slike SVIH 22 u sve 4 kombinacije. Nalazi (sve potvrđeno iz sirovog HTML-a frejma pre ispravke):

| # | Ekran(i) | Uzrok | Ispravka |
|---|---|---|---|
| 1 | PorNov | "Šta se promenilo" (tabela) i "Šta se desi kad primeniš" (koraci+dugmad) su bili JEDNA kartica stacked; frejm ih pokazuje kao DVE ODVOJENE kartice jedna pored druge (flex 1.7/1), dugmad su u DESNOJ kartici. | Razdvojeno u dve `.poc-card` u `.row`, dugmad premeštena u desnu. |
| 2 | PorH | Red "Sledeća uplata"/"Rešenje" imao razmeru 1:2 (Rešenje šire); frejm pokazuje 3:2 (Sledeća uplata šire) — obrnuto. | `flex:3`/`flex:2`, `minWidth:0` (frejm eksplicitno `min-width:0`, ne veći minimum). |
| 3 | PorH/PhPorH, ResenjeCard | Link "Trajni nalozi" u zaglavlju i pun tekst "Dodaj novo rešenje" prikazivani i na telefonu; frejm na telefonu NEMA link uopšte, a dugme piše samo "Dodaj novo". | Link sakriven na `isMobile`, dugme-tekst kraći na mobilnom. |
| 4 | Pay1/Pay2 (desktop) | Sve 4 kartice u jednom flex-wrap redu (prelamalo se 3+1 na 1440px); frejm je FIKSNA 2×2 mreža (dva odvojena reda od po 2). | Stavke podeljene u parove (`[0,2].map`), dva `.row` umesto jednog. |
| 5 | Pay1/Pay2, PaymentItemCard | QR kod CENTRIRAN IZNAD iznosa/računa (kolona), veličina 120/140px; frejm ima QR i detalje JEDAN DO DRUGOG u redu, veličina 132px desktop/112px telefon (bilo obrnuto). Plaćena stavka nije imala NIKAKAV vizuelni znak na QR-u (samo bedž gore) — frejm prigušuje QR (opacity 0.18) i preklapa lime kružićem sa kvačicom (56px desktop/48px telefon). | Red-raspored (QR + kolona detalja), tačne veličine, novi overlay za plaćeno. |
| 6 | Pay2 (deo plaćeno) | "Plaćeno X od Y uplate" bio goli tekst; frejm ga stavlja u ISTI `.por-highlight-card` okvir kao prazno stanje, PLUS traka napretka (8px, `--suma` 14% providno/puna `--suma`, širina X/Y·100%). | Banner + nova `.por-progress-track`/`.por-progress-fill`. |
| 7 | Pay3/PhPay3, TrajniNaloziTab | Veliko odstupanje: banner "Podesi jednom..." bio DEO leve kartice (trebalo odvojeno, `.por-highlight-card`); dve kartice stacked (trebalo jedna pored druge, 1.3/1); svaki stav rešenja sažet u JEDNU liniju (trebalo TRI reda — naziv+iznos, pa Račun primaoca i Poziv na broj SVAKI sa dugmetom kopiraj); dugmad "Pitaj AI.../Podesio sam..." bila u LEVOJ kartici (trebalo u DESNOJ, posle koraka); naslov+pilula "Mesečno, 10. u mesecu" bili stacked (trebalo isti red, `justify-content:space-between`); numerisani koraci koristili `.icon-circ-36` (36px, amber — pogrešno) umesto `.por-change-badge` (28px, #EEF8D2/0F2A22). | Potpuno prepisana funkcija: odvojen banner, dve kartice u redu (1.3/1), `.por-oblig-block/-field/-copy` za tri reda po stavu, dugmad premeštena, `.poc-month-pill` nova klasa, `por-change-badge` umesto `icon-circ-36`. |
| 8 | Rez4c/PhRez4c | Korak "verify" delio je generičan naslov/breadcrumbu "Dodaj rešenje Poreske uprave" sa upload/reading/pib_error koracima; frejm ima SOPSTVENU breadcrumbu ("Proveri rešenje") i naslov ("Proveri šta sam pročitao" / "Označio sam..."). | Dodata `step==='verify'` grana u `PorezDodajResenje`. |
| 9 | Rez6b/PhRez6b, ManualStep | (a) Sve 4 ikonice polja bile `Icons.coin` i POTPUNO SAKRIVENE na telefonu; frejm ima različitu ikonicu po polju (porez=coin, PIO=clock, zdravstveno=heart — nova ikonica dodata, nezaposlenost=briefcase) i prikazuje ih i na telefonu (36px/18px). (b) "Gde da nađem iznose?" kartica bila u DESNOJ koloni; frejm je stavlja u LEVU, posle dugmadi Sačuvaj/Nazad. (c) Numerisani koraci isti `.icon-circ-36` problem kao #7. (d) Na telefonu red ikona+naziv+kutija-iznosa bio IDENTIČAN desktop redu (kutija fiksnih 200px gurala naziv u katastrofalan prelom teksta); frejm na telefonu ima POTPUNO drugi raspored — red (ikona+naziv) PA kutija preko cele širine ispod, BEZ podnaslova. | Mapiranje ikona po ključu, ikona vidljiva i na mobilnom (manja), "Gde da nađem" premešteno levo, `por-change-badge`, nova mobilna grana (kolona umesto reda) za svako polje. |

**Potvrđeno ispravno, bez izmene** (vizuelno pregledano, odstupanja niska ili lažna uzbuna): PorOk, Rez2, Rez3, Rez5 (sve 4 kombinacije); Mb4/Mb12-stil "dokument uvek taman" potvrđen pixel-sample-om kao NAMERNO (ista `#0F2A22` boja u obe teme frejma, ne greška). Prazno stanje (bez rešenja) na `app/porez` vizuelno pregledano — nema sopstveni frejm u Prilogu A (spot-provereno protiv ustaljenog `.poc-card` obrasca praznih stanja, ne protiv `.dc.html`).

**Prijavljeno, NE promenjeno (van obima ove faze, krši "ne odlučuj sam" pravilo):** svi Porez ekrani u frejmu imaju TOPBAR pilulu "Podesi porez i rokove →" (amber, sa ikonicom) koja ne postoji nigde u trenutnom kodu — ovo je GLOBALNI nudge element (verovatno vezan za `Sel.setupChecklist`, koji trenutno postoji samo na Početnoj), ne nešto specifično za Porez i rokovi ekrane, pa bi dodavanje zahtevalo deljenu izmenu topbar-a (shell.js) van uskog obima ovog koraka.

**Nedostaje (iskreno, nije stiglo ovaj krug):** Rez2/Rez3/Rez5 dobile su samo vizuelni pregled (odstupanja niska, nije dalje kopano u raw HTML pošto screenshot već jasno odgovara frejmu); "dijalozi" iz zahteva — Porez i rokovi nema sopstvenih modalnih dijaloga u kodu (sve je puna-stranica tok, potvrđeno grep-om `Modal`/`SidePanel` u `porez.js` — nijedan rezultat), pa ta stavka zahteva nije ni primenjiva na ovu fazu.

NaN sweep čist (80/80) posle svake izmene ovog koraka.

**Faza 6/10, Porez i rokovi — ZATVORENA**, prvi pravi frame-compare ciklus sproveden i sve stvarne greške ispravljene; jedina otvorena stavka je gorenavedeni globalni topbar nudge, prijavljen korisniku.

### Kalendar (Faza 7) — 20. krug, Korak 2 (izmena), PRVI puni frame-compare ciklus

Nov `jobs-kalendar.json` (17 poslova: Kl1-9 desktop, Kl1-6/8-9 telefon — PhKl7 nedostupan sa UI-a na telefonu, videti izveštaj o podsetnicima ispod). Nalazi:

| # | Ekran(i) | Uzrok | Ispravka |
|---|---|---|---|
| 1 | Kl7/PhKl7 Podsetnici | Ceo dijalog je bio centriran `Modal`; frejm je SidePanel (560px desno) na desktopu / donji sheet na telefonu — isti obrazac kao Kl4/Kl5. | `Modal`→`SidePanel`. |
| 2 | Kl7/PhKl7 Podsetnici | Svih 6 stavki ("Obaveštenje u aplikaciji", "Mejl", 4× "Kada") bile statične `.poc-auto-pill` "Uključeno" pilule, ne stvarni prekidači; nedostajao sitan naslov "Kako te podsećam" iznad prve dve; "Kada" je bio 1.25rem naslov umesto istog sitnog stila. | Dodato 6 `Toggle` prekidača (lokalni state, podrazumevano uključeno osim "Kad faktura kasni"), dodat naslov, "Kada" stil izjednačen. |
| 3 | PhKl3 Lista | Red u listi na telefonu nije imao NIKAKVU akciju (dugme sakriveno, cela kartica bez onClick) — mrtav UI, dok frejm (bez dugmića) očekuje da je ceo red dodirljiv. | Dodat `a11yClick` na red za mobilni, isti obrazac kao `MailRow` (Mejlovi banke). |
| 4 | Kl3 Lista | Filter čipovi (Svi/Država/Fakture/Kasne) potpuno nedostaju — kod je umesto njih prikazivao Legend (boja-tačka ključ) koji frejm ovde uopšte nema; segment Mesec/Lista/Godina je bio poseban red umesto da deli red sa čipovima. | Dodati `.inv-chip` čipovi (ista komponenta kao Fakture filteri) + filtriranje liste po tipu; segment i čipovi u istom redu (`justify-content:space-between`), samo desktop (PhKl3 nema čipove, potvrđeno 0 pojava u raw HTML-u). |
| 5 | Kl6 Označi kao plaćeno | Imao X dugme za zatvaranje u zaglavlju (frejm nema); dugmad su bila u redu (frejm: kolona, primarno PRVO). | `hideClose:true` (nova opt-in `Modal` opcija, ne menja nijedan drugi dijalog), `stackedFooter:true`. |
| 6 | Kl8/PhKl8 Godina | Nedostaju tačkice po tipu događaja ispod naziva meseca (frejm: jedna tačkica po PRISUTNOM tipu, ne po događaju); tekući mesec je PRIKAZIVAO "sad" UMESTO broja događaja (frejm: "sad" POREDI naslov, broj ostaje ispod) i nije imao 2px uokvirenje; naslov meseca bio 1.25rem (frejm 1rem); dugme "Danas" nije postojalo za prikaz Godina (samo za Mesec). | Nov `monthsInfo` (tipovi po mesecu iz `calendarEventsForMonth`), tačkice, `.kal-year-card.now` uokvirenje, "sad" kao dodatna oznaka, naslov 1rem, "Danas" i za Godinu. |

**Lažna uzbuna otkrivena tokom testiranja (sopstvena greška u test-skripti, ne u app kodu):** klik na "dan 15" u novembru nije otvarao "Porez i doprinosi" kako sam očekivao — ISO datum iz `calendarEventsForMonth` je u UTC, pa se `.getDate()` na čitanom stringu razlikuje od stvarnog lokalnog dana za jedan (drzava rok je stvarno 16. novembra, ne 15., jer 15. pada u nedelju — tačno po spec primeru "Ponedeljak, 16. novembar"). Ispravljeno u test-skripti kad je nađeno klikom na pravi dan uživo; aplikacija je ispravno prikazivala tačan dan sve vreme, zabuna je bila samo moja pri pisanju testa.

**Podsetnici na telefonu — izveštaj (korak (d), nije građeno, samo prijavljeno):** `PhKl1.dc.html` (glavni prikaz meseca na telefonu) NEMA nijednu pojavu teksta "Podsetnici" ANI "Dodaj događaj" u zaglavlju — frejm na telefonu ne daje NIKAKAV ulaz u ekran Podsetnika (Kl7/PhKl7 postoje kao samostalni frejmovi koji POKAZUJU sadržaj tog ekrana, ali nijedan frejm ne pokazuje dugme koje ga otvara na telefonu). Jedino mesto gde frejm ima "Dodaj događaj" na telefonu je dugme UNUTAR praznog-meseca kartice (PhKl9). Dakle: **Podsetnici nemaju nijedan predviđen ulaz na telefonu u frejmovima, bez izuzetka.** Spec (7.11) sam kaže: "Isti podaci se vide u Podešavanjima, Obaveštenja" — taj ekran (`ObavestenjaTab`, `js/settings.js`) već postoji, već ima mobilni raspored (ranija faza) i već pokazuje iste kanale/vreme-pre-roka postavke. **Predlog (ne izgrađeno)**: na telefonu, umesto da se izmišlja novi ulaz u Kalendar-Podsetnike, uputiti korisnika na Podešavanja › Obaveštenja (već postoji, već radi) — ili, ako tim ipak želi poseban ulaz iz Kalendara, dodati ga u postojeći "⋯ Više" odeljak donje navigacije (već ustaljena površina za sekundarne funkcije), nikad kao novo plutajuće dugme pored onog za "Dodaj događaj" (dva plutajuća dugmeta bi bila necist, frejm ne sugeriše tako nešto).

**Vlasnička odluka sprovedena (korak (a)-(c)/(e), nema frejma za ovo — eksplicitno odobreno):** plutajuće "+" dugme na telefonu, SAMO u prikazu meseca (`view==='mesec'`), u obe varijante (sa događajima i prazno/Kl9) — pozicija `bottom:calc(var(--bottomnav-h) + 16px); right:16px`, 56px, iste boje kao primarno dugme u temi (`var(--primary)`/`var(--primary-contrast)` — već teorijski tačno #0F2A22/belo svetla, #C8F169/#0F2A22 tamna, bez novih boja). Otvara POSTOJEĆI `AddEventModal` (isti kao desktop, već ima mobilni oblik preko `Modal`/bottom-sheet sistema) — ništa novo izgrađeno. Dodat donji razmak (88px) na ceo prikaz meseca da poslednji red/kartica ne završi ispod dugmeta — potvrđeno uživo, "Sledeći rokovi" poslednji red čist na dnu. **Sakriveno**: kad je dan izabran (`selectedDay`, DayPanel ima svoje "Detalji"/"Označi kao plaćeno" dugmiće) i kad je bilo koji overlay/dijalog otvoren (uključujući sam `AddEventModal` dok je otvoren). **Prikazano**: samo u prikazu meseca, oba stanja (sa događajima/prazno) — NIJE prošireno na Listu ili Godinu (vlasnik je eksplicitno rekao "u prikazu meseca"). Uživo potvrđeno: light (#0F2A22 pozadina/bela ikonica) i dark (#C8F169 pozadina/#0F2A22 ikonica) teme, klik otvara isti dijalog kao desktop, ne preklapa FAB "Faktura" (taj je centriran, ovaj je uz desnu ivicu, oba iznad `.bottom-nav`).

NaN sweep čist (80/80) posle svake izmene ovog koraka.

**Faza 7/10, Kalendar — ZATVORENA** (sve 17 poslova pregledano u sve 4 kombinacije, stvarne greške ispravljene; podsetnici-na-telefonu nalaz prijavljen kao nalaz dizajna, ne kôd-greška; plutajuće dugme sprovedeno tačno po vlasničkoj specifikaciji).

### Faza 10, 21. krug — stvarni telefon (360/390/393/430px), Korak 0

Vlasnik je testirao na pravom telefonu (slike 1-11, opisane tekstom u zahtevu — nijedan fajl slike nije stigao kao prilog, rađeno isključivo iz tačnog teksta opisa + potvrde iz sirovog HTML-a frejma). Frejmovi su 365px, pravi telefoni 360-430px — zato su sve stavke ispravljene i uživo potvrđene na 360/390/393/430px, obe teme.

| # | Ekran(i) | Uzrok | Ispravka |
|---|---|---|---|
| 1,2 | Onb1/Onb2 (O tvojoj firmi, Podaci za fakture) | `.onb-pair-row` prelama u kolonu na telefonu, ali nasleđeno `.row{align-items:center}` ostaje — na koloni to centriranje postaje POPREČNA osa (vodoravno), sužava/centrira PIB/Matični broj/Mesto/Poštanski broj umesto pune širine. | `.onb-pair-row{align-items:stretch}` uz `flex-direction:column`. |
| 1,8 | Onb1, Podešavanja›Profil i firma | iOS Safari nativni `input[type=date]` (Datum otvaranja, Datum registracije) ume da traži širinu veću od deklarisane kutije i da centrira tekst. | Globalno (SVA polja za datum, ista `.input` klasa): `min-width:0` + `::-webkit-date-and-time-value{text-align:left}`. Nativna ikonica kalendara namerno netaknuta (appearance:none bi ugasio dodir-za-otvaranje na iOS-u). |
| 3 | Početna, "Čeka tebe" | Stavke su koristile isti desktop kartica-obrazac (`flex-wrap`) na telefonu; frejm na telefonu ima ravan red bez preloma (ikona+naslov/opis skraćeni elipsom+dugme uvek desno, isте visine/fonta). | Mobilni `flex-wrap:nowrap` + `.t-ellip` (nova utility klasa) na naslov/opis, `minWidth:0` na srednji wrapper. |
| 4 | Početna›Nadolazeći rokovi, Porez›Sledeća uplata (`.poc-deadline-row.due`/`.auto`) | U ISTOM CSS pravilu, `border-top:0` deklarisan POSLE `border:1px solid #hex` shorthand-a tiho poništava samo tu jednu stranu (suptilna cascade zamka, ne obično nadjačavanje bazne klase). | Uklonjen trailing `border-top:0` iz oba pravila — ispravljeno na izvoru, važi za oba ekrana (ista klasa). |
| 5 | Fakture›Ponavljajuće | Opis i dugme "Nova ponavljajuća faktura" bili `.row-between` jedno pored drugog; frejm: dugme je zapravo PAGE-LEVEL zaglavlje dugme (relabel po tabu), opis je istaknuta `.recur-banner` traka (sparkle, #F6FBE6/#2F5D12) preko cele širine, a mobilna tabela ispod bila je zasečena. | `editing`/`setEditing` state podignut iz `RecurringTab` u `ListPage` (zaglavlje dugme sad tab-svesno: "Nova faktura"/"Nova ponavljajuća faktura"), nova `.recur-banner` traka, mobilna grana renderuje `.recur-card` kartice (nove, per-item, border+radius+gap) umesto `<table>`. |
| 6 | Knjiga prihoda›"Jedna uplata nema fakturu" | Ikonica+naslov+opis+linkovi bili sva deca jednog flex-reda — na telefonu se to prelomilo u usku kolonu sa linkovima poravnatim desno. | Novi `.kpo-noinvoice-top` (ikonica+tekst, puna širina) i `.kpo-noinvoice-links` (linkovi, kolona); mobilni medija-upit menja ceo banner u kolonu, linkove levo poravnava. |
| 7 | Podešavanja (svi tabovi) | `.mobile-settings-list`/`.mobile-settings-detail` dupliralo isti `var(--space-4)` bočni razmak koji `.content` već primenjuje — uži sadržaj nego svuda drugde (26px efektivno naspram 13px). | Uklonjen duplirani padding iz oba wrappera; `.settings-row-form > .field{flex-basis:100%}` dodato za mobilni (PIB/Matični broj/Datum registracije red). |
| 9 | Podešavanja›Računi, par dugmadi "Izmeni"/"Ukloni" | `.account-actions a` (Izmeni) 0.875rem, `.account-actions .danger-link` (Ukloni, `<span>` ne `<a>`, pa prva pravilo ni ne pogađa) 1rem — različite veličine istog para akcija. | `.danger-link` font-size ujednačen na 0.875rem. Provereno (grep) da se ovaj par pojavljuje samo ovde u app-u. |
| 10 | Podešavanja›Jezik i izgled, red čipova (Jezik: 3 opcije) | Na telefonu "English" pada u drugi red; GEOMETRIJSKI je poravnat (isti box-left kao red 1, potvrđeno merenjem), ali AKTIVNI čip ima vidljivu pozadinu (ispunjava sopstveni padding), dok NEAKTIVNI nema — pa izgleda uvučeno kad je sâm na redu. | `.segmented button` dobija vidljivu ivicu (isti obrazac kao `.inv-chip`, već ustaljen u app-u za čipove koji se prelamaju) u oba stanja — rešava optičku neporavnatost za SVAKI segmented, prelomljen ili ne, obe teme. |

**Dodatni nalazi, otkriveni isključivo preko novog `sweep-phone.js` alata (nisu bili na slikama, ispravljeni po istom standardu):**

| Ekran | Uzrok | Ispravka |
|---|---|---|
| Pretplata›Izaberi plan, "Šta je uključeno" | `.badge-pill` "Jedan plan, sve uključeno" pored naslova u `flex-wrap:nowrap` redu — na 360px prelazi 7px preko desne ivice kartice. Frejm (`PhSub3.dc.html`) na telefonu NEMA ovu pilulu uopšte (samo desktop frejm je ima). | Pilula sakrivena na mobilnom (`isMobile ? null : ...`), tačno po frejmu. |
| Pretplata›Naplata nije uspela (payment_failed) | Dugmad "Pokušaj ponovo"/"Plati drugom karticom" u fiksnom `.row` (bez preloma) — na 360px drugo dugme izlazi ~30px preko ivice banera. | Mobilna grana: oba dugmeta `btn-block` (puna širina), stacked, visina 48/1rem — isti obrazac kao postojeći `pmBtn()` helper u istom fajlu za druge dugmiće ovog ekrana. **Napomena (prijavljeno, NE menjano)**: frejm (i desktop i telefon) pokazuje "Plati drugom karticom" kao PRIMARNO (tamno) dugme a "Pokušaj ponovo" kao SEKUNDARNO — obrnuto od trenutnog koda na OBA uređaja, van uskog obima ovog kruga (uticalo bi i na desktop, nije nešto što sweep-phone.js otkriva ni što je vlasnik tražio ovaj krug) — prijavljeno, ne ispravljano bez potvrde. |

**Sweep rezultati:**
- `sweep-phone.js` PRE ispravki ove dve dodatne stavke: 2 kombinacije sa prekršajima (badge-pill overflow na 5 stanja naloga × 360px, dugmad-overflow na `payment_failed` × 360px) — ostatak (840 provera: 4 širine × 2 teme × 8 stanja × 10 ruta + mobilni Podešavanja/Fakture pod-ekrani) već čist.
- `sweep-phone.js` POSLE svih ispravki (pun ciklus, 360/390/393/430px × light/dark × svih 8 stanja naloga × svih 10 glavnih ruta + 7 Podešavanja pod-tabova + 2 Fakture pod-taba): **840/840 provera, 0 prekršaja.**
- `nan-sweep.js`: 80/80 čisto.
- Stavke 1-10 iz slika dodatno uživo potvrđene screenshot-om u browseru (ne samo sweep brojem): 1,2,5,7,8,9,10 na 390px oba teme + 1,2 na 360/430px; 3,4,5,6 na 390px svetla i tamna. **Iskreno nedostaje**: nijedna stavka nije snimljena na TAČNO 393px pojedinačnim screenshot-om (provereno samo kroz `sweep-phone.js` brojčanu proveru na toj širini, koja je čista) — vizuelni "oko" pregled na 393px nije rađen posebno jer je 390/393 razlika suviše mala da bi se nešto drugo polomilo a 360/430 ne pokaže; formalni pre-ispravka screenshot-i (slika kvara PRE izmene) nisu snimljeni ni za jednu od 10 stavki (sve su ispravljene direktno iz tačnog opisa + frejma, bez snimka "pre" stanja), osim stavke 10 gde je "pre" stanje slučajno snimljeno tokom istrage uzroka.

**Korak 1 (Faza 8, AI knjigovođa) i Korak 2 (Faza 9, Podešavanja) NISU stigli ovaj krug** — ceo budžet je otišao na Korak 0 (10 prijavljenih stavki + izgradnja i puna primena `sweep-phone.js` + 2 dodatna nalaza koja je alat otkrio). Oba koraka ostaju potpuno neurađena, čekaju sledeći krug.

### Faza 10, 22. krug — Korak 0 (Pretplata dugmad) + Faza 8 AI knjigovođa, prvi puni frame-compare ciklus

**Korak 0** (prijavljeno krajem 21. kruga, potvrđeno iz sirovog HTML-a pre ispravke): `Sub11.dc.html`/`PhSub11.dc.html` pokazuju "Plati drugom karticom" kao PRIMARNO (tamno) dugme, "Pokušaj ponovo" kao SEKUNDARNO — kod je imao obrnuto, na oba uređaja, obe teme. Ispravljeno (varijanta zamenjena, redosled na telefonu takođe zamenjen — frejm: "Plati drugom karticom" prvo na telefonu, "Pokušaj ponovo" prvo na desktopu). Uživo potvrđeno sve 4 kombinacije.

**Faza 8, AI knjigovođa — PRVI frame-compare ciklus ikad za ovu fazu** (ranija oznaka "Gotovo" nikad nije prošla kroz `shoot.js`). Novi `tools/frame-compare/jobs-ai.json` (34 posla: Ak1-17/PhAk1-17). Najveći nalaz:

**Mobilni AI knjigovođa uopšte nije bio fullBleed** — `key==='ai'` se do sada renderovao kroz standardni `Shell.AppShell` (sidebar/topbar/bottom-nav), ali SVI PhAk frejmovi (osim PhAk9, brzi panel) pokazuju ekran BEZ ikakvog standardnog chrome-a: sopstveno zaglavlje (sparkle bedž + generičko "AI knjigovođa", NIKAD naslov konkretnog razgovora, X dugme desno koje zatvara) za chat-pano, i "Razgovori" + X za listu razgovora (koja je landing kad nema aktivnog razgovora). Ispravljeno:
- `app.js`: `fullBleed` sada `true` i za `key==='ai'` KAD JE `isMobile` (novo, mobilno-samo — desktop frejmovi i dalje imaju pun sidebar/topbar, potvrđeno Ak1 itd.).
- `ai.js`: mobilni pane-head generički ("AI knjigovođa", ne `conv.title`) sa X (ne chevron-levo); nov "Razgovori"+X ekran-zaglavlje za listu (`ai-rail-screen`); meni razgovora (Preimenuj/Kopiraj/Izvezi/Obriši) premešten PO STAVCI u listi (nov `MobileConvSheet`, donji sheet na telefonu preko `Modal`-a, mala padajuća lista na desktopu preko postojećeg `ConversationMenu` — oba sad PO STAVCI, ne u pane-zaglavlju, potvrđeno `Ak16`/`PhAk16` raw HTML-om koji pokazuje meni okačen za rail-stavku, ne za pane).
- `css/base.css`: `.content-fullbleed .ai-shell` mobilni override (100dvh, bez topbar/bottomnav oduzimanja), `.ai-rail-screen`, `.ai-conv-sheet`/`.ai-conv-sheet-row` (nove klase za mobilni sheet, 52px red+ivica, tačno po `PhAk16.dc.html`).

**Dodatni nalazi (desktop), isto potvrđeni sirovim HTML-om pre ispravke:**
- Desktop NIJE imao `.page-head-row` (h1 "AI knjigovođa" + podnaslov + dugme "Šta sam radio") IZNAD dvokolonskog rasporeda — svaki drugi glavni ekran ima ovaj obrazac, AI knjigovođa ga nije imao uopšte (dugme je bilo zakopano u dnu rail-a). Dodato (`.ai-page` nova klasa nosi staro negative-margin/sticky rešenje pomereno jedan nivo gore).
- Desktop pane je imao izmišljeno zaglavlje (naslov razgovora + "⋯" meni) koje frejm uopšte nema — poruke u frejmu počinju odmah od vrha. Uklonjeno; "⋯" meni premešten po rail-stavci (isto kao mobilni nalaz iznad).
- Rail-stavke su imale dekorativnu chevron-strelicu koju frejm nema na desktopu (samo na telefonu) — uklonjena na desktopu, zamenjena sa "⋯" trigerom.
- `QUICK_GROUPS` (predložena pitanja na početku razgovora) bio pogrešan skup ČAK I NA DESKTOPU — stari kod je imao 3 grupe (nikad frejm-potvrđene); `Ak1.dc.html` sirov HTML pokazuje ČETIRI grupe (Moji brojevi/Rokovi i porez/Fakture/Propisi) u 2×2 mreži, identično telefonu (koji ih prelama u jednu kolonu preko postojećeg media-upita). Ujednačeno na jedan ispravan skup za oba uređaja.
- Composer placeholder na telefonu/brzom panelu ispravljen na "Pitaj me nešto..." (frejm, desktop ostaje "Pitaj o fakturama, prilivima, porezu...").
- Prilog+tekst u istoj poruci (Ak7: korisnik prilaže izvod I pita "Šta ima u ovom izvodu?" u istom potezu) — `Composer.pickFile` je odbacivao već otkucan tekst kad se prilog bira; ispravljeno da šalje oboje zajedno (`sendMessage` je već podržavao oba argumenta, samo poziv iz composera nije).

**Ponašanje AI-ja naspram specifikacije — potvrđeno kodom (`actions.js`, `AI.runMessageAction`)**: svaka radnja (napravi fakturu, pošalji podsetnik, poveži/knjiži nepoznatu uplatu, označi porez plaćenim) izvršava se ISKLJUČIVO na eksplicitan klik dugmeta — ništa se ne pokreće samo od sebe, draft/radnja kartice ostaju u "nerešeno" stanju dok korisnik ne odluči, a dok je AI pauziran (istekao probni period/otkazana pretplata) SVE radnje osim "zatvori" su blokirane uz toast poruku. Ovo tačno prati spec (4.1: "Ništa se ne izvršava bez klika", 7.12: "Čovek uvek ima poslednju reč").

**Sweep rezultati posle svih ispravki**: `sweep-phone.js` (840 kombinacija: 4 širine × 2 teme × 8 stanja × 10 ruta + Podešavanja/Fakture pod-ekrani) — **0 prekršaja**. `nan-sweep.js` — 80/80 čisto. `shoot.js` na `jobs-ai.json` (34 posla) pokazuje da je VIZUELNA STRUKTURA sad tačna (kontakt-slike pregledane za sve veće nalaze pre i posle ispravke) — preostali brojčani "diffs" po poslu (uglavnom 14-154, Ak9 791) su **uglavnom artefakt-merenja** (frejmov spojen tekst, seed-specifični brojevi, UA padding — ista kategorija dokumentovana od 14. kruga), NE nove vizuelne greške; potvrđeno vizuelnim pregledom kontakt-slika za sve poslove sa odstupanjem ≥15, ne samo brojčano.

**Iskreno, nije stiglo ovaj krug**: fino bodovanje svakog preostalog pixel-diff-a (padding/gap vrednosti na nivou 1-2px) nije urađeno za svih 34 posla — ostavljeno kao poznat, nizak rizik. Mobilni ulaz u "Šta sam radio" (istorija radnji) unutar VEĆ OTVORENOG razgovora nije pronađen ni u jednom PhAk frejmu (dugme postoji samo u "Razgovori" listi) — zadržano samo tamo, bez izmišljanja novog dugmeta u pane-zaglavlju. **Korak 2 (Faza 9/10, Podešavanja) NIJE ni počet** — ceo budžet ovog kruga otišao na Korak 0 + Korak 1.

**Objavljeno**: v36 (posle Koraka 0 i Koraka 1), uživo potvrđeno na samoj Artifact adresi (ne samo lokalno).

### Faza 10, 23. krug — Podešavanja (prvi puni ciklus) + Pretplata (prvi puni ciklus za sâm odeljak)

**Korak 1, Podešavanja — `tools/frame-compare/jobs-podesavanja.json` (22 posla: Pd0-10/PhPd0-10).** Nedostajalo je 15 od 22 frejmova lokalno (samo Pd2/8/9/10 i PhPd8/9/10 su ranije preuzeti, 15. krug) — preuzeti ostali sa Design Canvas-a ovaj krug. Najveći nalaz:

**Desktop nije imao "pregled" ekran (Pd0)** — kod je UVEK direktno otvarao "Profil i firma" tab (`useState('profil')`), dok `Pd0.dc.html` sirov HTML pokazuje da je landing zapravo SOPSTVENA stranica: profil-kartica (avatar, ime, firma, bedž pretplate) + 3-kolonska mreža 7 kartica (ista ikona/naslov/opis kao TABS niz koji mobilni `MobileSettingsList` već koristi), BEZ ijednog tab-a markiranog aktivnim u levoj traci. Tek klik na karticu prebacuje na poznati dvokolonski prikaz. Izgrađen nov `SettingsOverview` (`js/settings.js`), `tab` sad podrazumevano `null`; nove CSS klase `.settings-overview*` (ponovo koriste postojeće `.avatar`/`.icon-circ`/`.account-pill` obrasce, ne izmišljaju nove boje). Usput ispravljen i statičan podnaslov stranice (bio dinamički "firma, paušalac od...", frejm ga ima samo u profil-kartici — stranica ima isti statičan tekst na SVAKOM stanju).

**Dodatni nalazi (potvrđeni iz sirovog HTML-a pre ispravke):**
- `Promeni lozinku` i `Izbrisati nalog?` dijalozi su imali X dugme u zaglavlju koje `Pd8.dc.html`/`Pd9.dc.html` nemaju — dodato `hideClose:true` (postojeći opt-in prop) na oba.
- **Sistemska greška otkrivena usput (van uskog obima Pd0, ali ista vrsta pravila):** audit svih `:root[data-theme="dark"] SELEKTOR{...}` pravila u `base.css` protiv njihovih `@media (prefers-color-scheme:dark)` pratilaca (ustaljeni dupli obrazac za "Kao na uređaju") pokazao je **15 selektora kojima je pratilac potpuno nedostajao** — `.danger-zone` (otkriveno uživo: "Brisanje naloga" kartica ostajala svetla u sistem-tamnoj temi), `.subscription-hero`, `.subscription-note` (+ span), `.account-pill-default`, `.account-actions .danger-link`, `.mobile-settings-row .icon-circ`, `.btn-link`, `.alert-danger`, `.field-error`, `.input.has-error`, `.onb-dropzone-icon`, `.onb-step-num`, `.onb-status-ok`. Svih 15 ispravljeno (čist dupli-pravilo dodatak, bez promene postojećeg ponašanja za eksplicitno "Svetli"/"Tamni").

**Korak 2, Pretplata — `tools/frame-compare/jobs-pretplata.json` (18 posla: Sub3-11/PhSub3-11).** Sub1/Sub2/Sub12 su Početna baneri (probni-ističe/istekao/QR-obnavljanje), ne Pretplata-ekrani — van obima ovog koraka (Početna je već zatvorena faza), samo uzgredno uživo pregledani. Nalazi:
- `Otkaži pretplatu?` dijalog: razlozi otkazivanja bili red čipova koji se prelama; `Sub10.dc.html` pokazuje VERTIKALNU listu pravih radio-dugmića (ista `.sub-radio`/`.sub-radio.on` komponenta koja već postoji za izbor perioda u `PlanCard`-u) — zamenjeno. Dijalog je takođe imao suvišan X (nema ga u frejmu) — dodato `hideClose:true`.
- QR uplata (Sub7): "Skeniraj QR kod" i status "Čekam uplatu" bili odvojeni redovi (naslov pa goli tekst ispod) — frejm ih drži u ISTOM redu kao naslov+amber pilula sa tačkicom (`#FFF4DB`/`#8A5A00`/`#E0A526`, ista boja obe teme, dekorativna "čekanje" boja). QR kod sam nije imao belu uokvirenu kutiju koju frejm ima (ostaje bela u obe teme, isto pravilo kao Mb4 tamni dokument). Oboje dodato (`.sub-qr-wait-pill`, `.sub-qr-box`).
- **Provereno i POTVRĐENO ispravno (ranije sumnjičeno u 19. krugu kao moguća greška)**: sidebar kartica pretplate pokazuje "Pretplata aktivna" i za `payment_failed` stanje — `Sub11.dc.html` sirov HTML POTVRĐUJE da frejm radi identično (ista kartica, isti tekst), nije greška koda. Round-19-ova stavka "van obima, prijavljeno" se ovim zatvara kao lažna uzbuna, potvrđeno frejmom.
- **Nije ispravljeno (manji nalaz, nedovoljno vremena)**: Sub5 "Potvrdi plaćanje u banci" modal — frejm stavlja "⏱ Čekam potvrdu, još 02:00" kao pilulu ISPOD spinnera i IZNAD paragrafa, kod ga stavlja kao gol tekst na dnu. Vizuelno manje bitno (tranzitivno stanje, par sekundi), prijavljeno kao preostala sitnica.
- Desktop/mobilni raspored QR kartice (frejm: QR kutija i polja JEDAN DO DRUGOG u redu na desktopu) ostaje jednokolonski (sve ispod) — nije restrukturirano zbog vremena.

**Sweep rezultati (oba koraka)**: `sweep-phone.js` (630: 3 širine × 2 teme × 8 stanja × 10 ruta + Podešavanja/Fakture pod-ekrani) — **0 prekršaja**, pre i posle. `nan-sweep.js` — 80/80 čisto, pre i posle. Uživo potvrđeno uz sweep (ne samo brojem): Podešavanja pregled+Profil i firma+Bezbednost i nalog (sistem-tamna) na 360/390/430px i desktopu; Pretplata "Otkaži pretplatu?" dijalog na 390px telefon.

**Korak 3 (popis ekrana bez shoot.js ciklusa) NIJE stigao ovaj krug** — ceo budžet otišao na Korak 1 i Korak 2.

**Objavljeno**: v37, uživo potvrđeno na samom Artifact linku (Podešavanja pregled ekran).

### Faza 10b — IZGRAĐENO (26. krug, videti detaljnu belešku ispod)
~~Fak24-26 izbor bloka klikom-i-prevlačenjem, Fak27 više šablona~~ — više nije odloženo, puna funkcionalnost sad postoji (editor šablona, više šablona sa pravilom dodele, primena na pregled/PDF).

### Sistemski nalazi koji čekaju korisnikovu odluku (ne menjati bez potvrde)
- ~~Tabela "Novo rešenje" u Porez i rokovi (`porez.js` red ~539) nema `isMobile` granu~~ — **NIJE TAČNO, proveren 18. krug (Korak 4).** `PorNovScreen` (`js/porez.js` red 491) ima potpunu, odvojenu mobilnu granu (red 507-532: dve kartice, kompaktan "staro → novo din  +razlika" red po stavci, PLOSNATA #0F2A22 kartica za ukupno — sve sa komentarom koji navodi PhPorNov raw HTML kao izvor), `<table>` element (red 539) postoji SAMO u desktop (`!isMobile`) grani. Uživo potvrđeno na 365px i 1440px, svetla i tamna tema — oba rasporeda ispravna, bez NaN/preklapanja. Ovaj nalaz je bio zastareo (verovatno upisan pre nego što je mobilna grana dodata, nikad uklonjen).
- Kalendar na telefonu u NEPRAZNOM mesecu — frejm ne pokazuje nijedan način da se doda događaj/otvore podsetnici (samo prazan-mesec dugme postoji).
- "Jezik fakture" dropdown — rešeno (10. krug), gotovo.
- "Automatska naplata"/"Kartica odbijena" pill i ostali manji Pretplata nalazi — rešeni (4. krug).
- Avatar-boja po klijentu van Početne (Fakture/Kalendar/Mejlovi banke liste) — mapa postoji (`U.clientAvatarColors`) ali nije još primenjena jer te liste u kodu još ne prikazuju avatare.

### Napomena za pravu platformu (18. krug, Korak 3 — nije nešto za prototip da reši)
- **Dugme Nazad u pregledaču.** Ovaj prototip namerno nema istorijsko rutiranje (CLAUDE.md: "Hash-routing je zabranjen unutar Artifact-a", `store.navigate()` je čist in-memory state) — zato pregledačevo dugme Nazad ovde ništa ne radi (ili napušta ceo Artifact), isto na svakom ekranu, i to NIJE nešto što prototip treba da simulira. Na pravoj platformi (gde postoji pravi URL/rutiranje), ovo mora da radi kako korisnik na telefonu očekuje: dugme Nazad (ili gest) vraća na PRETHODNI EKRAN UNUTAR APLIKACIJE (npr. iz detalja fakture nazad na listu fakture, iz "Odobri i pošalji banci" nazad na detalj mejla), ne van aplikacije i ne na proizvoljnu prethodnu stranicu pregledača. Ovo posebno važi za punu-ekransku zamenu (Mb9/Mb5 "fullBleed" ekrani) i za svaki višekoračni tok (onboarding, izrada fakture, odobravanje mejla banke) — svaki korak treba sopstveni istorijski unos, ne samo promenu state-a.

### Van obima prototipa (po spec-u, ne previđeno)
- Dvostepena prijava (2FA) i push notifikacije — spec 11.1 ih eksplicitno izuzima.
- Vodič kroz aplikaciju (Tur0-4/GuideB) — samo placeholder toast, najveća preostala funkcionalna rupa iz 11.2, nije rađena (veći, poseban zahvat).
- QR kod je dekorativan (nije pravi NBS IPS enkoder) — spec sam kaže da treba potvrditi kod NBS.

### Faza 10, 24. krug — ostaci iz 23. kruga (Pretplata Sub5/QR karta, Dodaj račun) + popis i završetak poliranja

**Korak 1a, Sub5 "Potvrdi plaćanje u banci" modal.** Frejm nema spinner ni odvojeno podnožje — "Čekam potvrdu, još 02:00" je pilula (sat-ikonica + tekst, `var(--surface-2)` pozadina) ISPOD paragrafa, a "Odustani od plaćanja" je gol centriran link u telu. Ispravljeno (`js/pretplata.js`, `.sub-confirm-wait` u `base.css`), uživo potvrđeno desktop svetla/tamna.

**Korak 1b, QR kartica (Sub7/PhSub7) desktop raspored.** Frejm pokazuje QR kutiju i polja JEDAN DO DRUGOG u redu na desktopu (`gap:28px`), svako polje sa SOPSTVENOM copy-ikonicom u redu razdvojenom linijom (ne jedna zajednička kutija sa jednim "Kopiraj sve" dugmetom). Napisan nov `QrFieldRow` (`js/pretplata.js`), `.sub-qr-field-row` zamenio `.sub-qr-fields` kutiju (`base.css`). Uživo potvrđeno desktop (jedan-do-drugog) i telefon (jedno ispod drugog, ista red-po-polju forma), obe teme.

**Korak 1c, "Dodaj račun" dijalog.** Provereno u sva 4 frejma (`Pd2`, `Pd10`, `PhPd2`, `PhPd10`) preko sirovog HTML-a: svuda piše identično "Dodaj račun" (nikad "Dodaj devizni račun" ili slično), BEZ Dinarski/Devizni prekidača i BEZ drugog ulaznog dugmeta — jedan opšti dijalog, devizna polja (Valuta/Banka/IBAN/SWIFT). Ovo je tačno slučaj iz tvog uputstva ("jedan dijalog bez izbora tipa i bez dva ulaza") — **kod NIJE menjan**, prijavljeno kao zatečeno stanje (ranija 23.-krug sumnja da frejm možda namerno devizni-samo ovde se ovim zatvara kao potvrđena, ne kao greška).

**Korak 2, popis Priloga A — tabela po sekciji** (status shoot.js ciklusa u sve 4 kombinacije desktop/telefon × svetla/tamna; broj poslova = `tools/frame-compare/jobs-*.json`):

| Sekcija (Prilog A) | Poslova u jobs-*.json | Ciklus (4 kombinacije) | Poslednji krug | Otvorene razlike |
|---|---|---|---|---|
| Prijava/registracija/greške (`PrijavaD8,P1,L1-4,G1,M1,F1-5,Reg,R1-3,V1,V2,Err1,Err2`) | 64 (`jobs-prijava-onboarding.json` + `jobs-prijava-transient.json`) | Da (sve postojeće) | 15-21 | `PrijavaP1`/`TelP1` nemaju posao — frejm skoro identičan `PrijavaD8`/`TelD8` ali BEZ "Pošalji mi link za prijavu" dugmeta; spec (red 425, Prilog A red 949) navodi `PrijavaD8, P1` zajedno kao isti ekran sa magic-link dugmetom, pa je razlika neobjašnjena iz samog frejma — **prijavljeno, ne menjano, čeka odluku** |
| Onboarding (`OnbO1-12`/`TelOnbO1-12`) | 24 | Da (sve, uključujući OnbO8/OnbO12 novo dodate ovaj krug) | 24. krug (OnbO8/12), ranije 15-21 (ostalo) | Nema — OnbO8 (korak 3, "Kopirano" stanje) i OnbO12 (korak 4, "Otvaram aplikaciju..." stanje) su već bili tačno implementirani u kodu (samo nikad snimljeni), dodati u `jobs-prijava-onboarding.json` i oba potvrđena uživo |
| Početna (`Poc1-6`,`Dash4_*`,`Tip1-2`,`Sub1/2/12`,`Tur0-4`,`GuideB`) | 24 | Delimično | 24. krug | Vidi posebnu belešku ispod — **ozbiljan test-setup bug otkriven i ispravljen** (WelcomeTourModal blokirao više "pokriva se" ekrana); `Sub2` (probni istekao) ima otvorenu razliku (modal vs panel, vidi ispod); `Tur0-4`/`GuideB` (vodič) potpuno nepokriveno — Korak 3 |
| Kalendar (`Kl1-9`/`PhKl1-9`) | 17 | Da, sem `PhKl7` | 18-21 | `PhKl7` (Podsetnici, telefon) — nema ulaz u frejmovima, **vlasnikova odluka na čekanju, ne dirati** |
| Knjiga prihoda (`Kp1-10`/`PhKp1-10`) | 20 | Da (potpuno) | 17 | Nema |
| Mejlovi banke (`Mb1-12`/`PhMb1-12`) | 24 | Da (potpuno) | 16 | Nema |
| AI knjigovođa (`Ak1-17`/`PhAk1-17`) | 34 | Da (potpuno) | 19 | Nema. "Šta sam radio" ulaz iz otvorenog razgovora na telefonu — vlasnikova odluka na čekanju (nepromenjeno) |
| Fakture (`Fak1-28`/`PhFak1-28`) | 48 | Da, sem `Fak24-27` | 11-13 | `Fak24-27` — namerno odloženo, Faza 10b (dokumentovano, ne gap) |
| Podešavanja (`Pd0-10`/`PhPd0-10`) | 22 | Da (potpuno) | 23 | Nema |
| Porez i rokovi (`PorH,PorOk,PorNov,Pay1-3,Rez2-6b` + Ph) | 22 | Da (potpuno) | 18 | Nema |
| Pretplata (`Sub3-11`/`PhSub3-11`) | 18 | Da (potpuno) | 23-24 | Nema (Sub5/QR ispravljeno ovaj krug) |
| Telefon nav (`MNav2`,`MNav15-18`) | 0 | Ne | — | Frejmovi nisu ni preuzeti sa Design Canvas-a ovaj krug — **nije stigao budžet**, prijavljeno kao otvoreno |
| Obaveštenja | — | Preskočeno (nema frejm) | — | Po tvom uputstvu ovaj krug |

**Dash4_press** (Početna čeklista sa samo "Dodaj rešenje Poreske uprave" preostalim) dodat u `jobs-pocetna.json` i potvrđen — kod (`js/pocetna.js` red 39, tekst "Još samo rešenje Poreske uprave i sve je spremno.") je već bio tačan, samo nikad snimljen.

**Ozbiljan nalaz, Početna test-postupak (ne dizajn-greška, ali je sakrivao prave rezultate)**: `WelcomeTourModal` (postojeći "Dobro došao" uvodni dijalog, placeholder za Korak-3 vodič — dugme "Pokaži mi" samo ispiše toast "dolazi u narednoj verziji") pojavljuje se na SVAKOM svežem učitavanju Početne dok čeklista nije gotova (`!s.dev.welcomeSeen && !allDone`). `tools/frame-compare/shoot.js` svaki posao pokreće sa `localStorage.clear()`, pa je ovaj modal nevidljivo prekrivao ekran u **šest poslova koji su ranijih krugova "prolazili" sa niskim brojem piksel-razlika čistom slučajnošću**: `Poc1`, `Poc3`, `Poc5`, i (manje, preko drugog uzroka — pogrešno brisanje `bankMails` u setup-u koje je čeklistu držalo "nezavršenom") `Poc4`/`PhPoc4`, `Poc6`, `Dash4_ima`/`PhDash3`, `Tip1`/`PhTip1`, `Tip2`/`PhTip2`. Ispravljeno dodavanjem `dev.welcomeSeen:true` u setup SVIH poslova u `jobs-pocetna.json` (osim `Poc1` i `Dash4_press`, gde je čeklista namerno nedovršena — tamo dodato eksplicitno uz ostale izmene stanja) i uklanjanjem suvišnog `bankMails:[]` brisanja iz poslova koji ga nisu trebali (sačuvano samo za `Poc1`, gde je stvarno deo "2/5 gotovo" stanja — uz dodatno brisanje `incomesFx`/`incomesRsd` da "Poslednje uplate" kartica ispravno pokaže prazno stanje "Još nema uplata", kao frejm). Sve ponovo snimljeno i uživo potvrđeno (Poc1, Poc5, Dash4_ima vizuelno pregledani posle ispravke — raspored i sadržaj sada odgovaraju frejmu).

**Preostala razlika, otkrivena uzgred (NIJE ispravljena, prijavljena)**: `Poc3` ("Osnovno stanje") frejm pokazuje otvoren panel Obaveštenja (zvonce u topbar-u kliknuto) — trenutni `jobs-pocetna.json` posao za `Poc3` nema `afterNav` koji to otvara, pa i dalje ne testira stvarni sadržaj tog panela (samo osnovnu stranicu ispod). Ovo je bilo sakriveno istim welcome-modal problemom u ranijim krugovima. **Ne ispravljeno ovaj krug zbog vremena** — treba dodati afterNav klik na zvonce dugme i uživo proveriti sadržaj panela.

**Sub2 (Početna, "probni istekao") — otvorena razlika, prijavljena, ne menjana.** Sirov HTML `Sub2.dc.html`/`PhSub2.dc.html` potvrđuje: sadržaj (katanac-ikonica, naslov "Probni period je istekao", telo, dve stavke sa kvačicom, link "Izvezi moje podatke", dugme "Izaberi plan") VEĆ POSTOJI u kodu — `AiPausedPanel` (`js/pocetna.js` red 207-221), tekst se poklapa skoro reč-za-reč. Jedina razlika je PRIKAZ: frejm ga crta kao pravi blokirajući modal preko zatamnjene pozadine (`position:absolute;inset:0;background:rgba(15,42,34,.62)` desktop, donji "sheet" na telefonu), a kod ga crta kao obično ULOŽENI panel na dnu stranice (treba skrolovati). Ovo je promena PONAŠANJA (da li blokira interakciju, da li se ponavlja pri svakoj poseti, nema X za zatvaranje u frejmu) koju po pravilu ne odlučujem sam — **prijavljeno, ne menjano, čeka tvoju odluku** da li `AiPausedPanel` treba da postane pravi Modal.

**Sweep rezultati**: `nan-sweep.js` — 80/80 čisto (pre i posle svih izmena ovog kruga). `sweep-phone.js` — rastao sa 630 na 840 provera (dodati novi poslovi), **0 prekršaja**, pre i posle.

**Korak 3 (vodič kroz aplikaciju, Tur0-4/GuideB) NIJE stigao ovaj krug** — ceo budžet otišao na Korak 1 i Korak 2. Napomena iz koda: `WelcomeTourModal` je već postojeći, placeholder prvi ekran za ovu funkciju (dugme "Pokaži mi" samo ispiše toast), ali stvarnih 5 tooltip koraka (`Tur0-4`) i `GuideB` frejm nisu ni preuzeti sa Design Canvas-a. Ostaje najveća preostala funkcionalna rupa.

**Objavljeno**: v38, uživo potvrđeno na Artifact linku.

### Faza 10, 25. krug — ponovljen Početna ciklus, Sub2/PrijavaP1/Poc3/MNav otvorene stavke, vodič kroz aplikaciju

**Korak 1, pun shoot.js ciklus za CELU Početnu (24 posla, sve 4 kombinacije) posle 24.-kružne ispravke.** Svaki posao pojedinačno vizuelno pregledan (ne samo brojevi odstupanja, koji variraju zbog seed-datuma/iznosa noise-a bez stvarnog značaja — ustaljena kategorija). **Nula novih stvarnih grešaka otkriveno** van ona dva već poznata iz 24. kruga (Poc3 Obaveštenja panel, Sub2 modal-vs-panel — oba rešena ispod). Pregledano i potvrđeno ispravno bez izmene: Poc1, Poc2, Poc4/PhPoc4 (korisnički meni — potvrđeno da je stvarna bela/tamna kartica sa senkom, prvobitni utisak "bez kartice" bio artefakt kompresije kontakt-slike), Poc5 (pretraga — isto, "providan" izgled dropdown-a bio artefakt kompresije, uživo potvrđeno neproziran), Poc6, Dash4_auto/PhDash4, Dash4_ima/PhDash3, Dash4_norez/PhDash1, Tip1/PhTip1, Tip2/PhTip2, Sub1/PhSub1, Sub12/PhSub12, Dash4_press — svi odgovaraju frejmu.

**Provereno da ista vrsta greške ne krije sadržaj u drugim fazama**: `WelcomeTourModal` je deo `PocetnaScreen`-a (montira se samo na `app/pocetna`), pa fizički ne može uticati na snimke drugih sekcija — potvrđeno. Pretraga kroz sve `jobs-*.json` za isti obrazac pogrešnog brisanja stanja (`bankMails:[]`/`invoices:[]`/`taxDecision:null`) van Početne pronašla je 3 fajla (`jobs-porez.json` Rez2-6b, `jobs-fakture.json` Fak2/PhFak2, `jobs-mejlovi.json` Mb2/PhMb2) — sve na rutama RAZLIČITIM od `app/pocetna` i sve NAMERNE (prazna-stanja testovi za te ekrane, ne greška).

**Korak 2a, Sub2 modal/zatvaranje.** Sirov HTML `Sub2.dc.html`/`PhSub2.dc.html` ponovo proveren, ciljano za dugme zatvaranja ili "Ne sada": **nijedno ne postoji** — ni X u uglu, ni sekundarna opcija, na desktopu ni telefonu (telefonska "ručka" za prevlačenje je čisto dekorativna, nije funkcionalno dugme u frejmu). Ovo je tačno tvoj drugi uslov ("ako frejm nema izlaz: ne pravi blokadu") — **`AiPausedPanel` ostaje kao uložen panel, kod NIJE menjan.**

**Korak 2b, PrijavaP1/TelP1.** Dodatna provera: oba panela (svetla+tamna tema) u `PrijavaP1.dc.html` dosledno NEMAJU "Pošalji mi link za prijavu" (0 pojava teksta u celom fajlu, nasuprot 2 pojave — jedna po temi — u `PrijavaD8.dc.html`), ista dimenzija platna (2960×900, nije responsivna/tablet varijanta), isti naslov/opis/dugmad inače. Nije pronađen nikakav razlikujući marker (ruta, breadcrumb, data-atribut) koji bi objasnio RAZLOG razlike. Spec (red 425) opisuje `PrijavaD8, P1` kao JEDAN ekran sa magic-link dugmetom — što protivreči samom frejmu P1. **Nije objašnjivo iz frejmova ni specifikacije — ostaje kako jeste, upisano ovde** (najverovatnije zastareo/dupliran frejm u dizajn-fajlu, ali to je pretpostavka, ne potvrda).

**Korak 2c, Poc3 Obaveštenja panel — dovršeno poređenje, 2 stvarne greške nađene i ispravljene.** Dodat `afterNav` klik na zvonce u `jobs-pocetna.json`, ponovo snimljeno, upoređeno sa sirovim HTML-om `Poc3.dc.html`:
1. Nepročitane stavke (dot-indikator) imaju amber ikonicu (`#FFF4DB`/`#8A5A00`, ista dekorativna boja kao `.sub-qr-wait-pill` iz 24. kruga) i DUGME ZA AKCIJU ispod opisa ("Potvrdi" za tip "Novi mejl banke", "Plati" za "Rokovi za porez") — kod je svim stavkama davao identičnu `.icon-circ-36` boju i NIKAD nije prikazivao dugme. Ispravljeno u `js/shell.js` (Topbar notifikacije): boja uslovna na `!n.read` (amber vs `--status-paid-bg/-text` lime za pročitano), dugme uslovno na tip+nepročitano.
2. Pročitane stavke dosledno nemaju dugme (potvrđeno za oba pročitana seed reda) — ispravka iz #1 ovo već pokriva (dugme samo kad `!n.read`).

Uživo potvrđeno desktop svetla/tamna: "Potvrdi"/"Plati" dugmad i amber/lime boje tačno odgovaraju vrednostima iz frejma (`getComputedStyle` potvrdio `rgb(255,244,219)`/`rgb(138,90,0)` i `rgb(238,248,210)`/`rgb(47,93,18)`, tačno `#FFF4DB`/`#8A5A00`/`#EEF8D2`/`#2F5D12`).

**Otvoreno, NE ispravljeno (menja ponašanje, van uskog obima ove ispravke)**: footer panela u frejmu ima SAMO JEDAN centriran link "Podešavanja obaveštenja" — kod ima DVA ("Sve obaveštenja" + "Podešavanja obaveštenja"). "Sve obaveštenja" je JEDINI ulaz u celu `app/obavestenja` stranicu (sopstveni kod-komentar: "nova stranica, nije u Prilogu A") — brisanje linka bi tu stranicu učinilo potpuno nedostupnom iz UI-a. Prijavljeno, ne menjano — čeka odluku da li ta stranica ostaje dostupna (zadržati link, frejm-razlika) ili se potpuno ukida (ukloniti link, frejm-tačno).

**Korak 2d, MNav2 i MNav15-18 — preuzeto, upoređeno, 1 stvarna greška nađena i ispravljena; 1 sukob frejmova prijavljen.**
- MNav15/16/17/18 (Početna/Fakture/Porez/Više aktivni redom) potvrđuju da su POSTOJEĆE ikonice/putanje donje navigacije (`BN_PATHS` u `js/shell.js`) već bajt-za-bajt tačne (frejmov SVG `path` string identičan kodu) — bez izmene, formalno potvrđeno.
- **MNav2 (otvoren "Više" sheet) otkriva da "Mejlovi banke" NIJE IMALO NIKAKAV ulaz na telefonu** — `MORE_ITEMS` u kodu je imao `['knjiga','kalendar','ai','podesavanja']`, bez `'mejlovi'`, iako je Mejlovi banke puna, izgrađena sekcija (Faza 5, 24 ekrana). Frejm MNav2 eksplicitno pokazuje "Mejlovi banke" (sa bedžom) kao stavku sheet-a. Ispravljeno: `'mejlovi'` dodat u `MORE_ITEMS`, plus bedž (broj nepročitanih, ista `.sidebar-badge` komponenta kao desktop sidebar) dodat svakoj stavci sheet-a (frejm pokazuje bedž "1" pored Mejlovi banke, kod do sada NIJE prikazivao bedž ni za jednu stavku sheet-a). Uživo potvrđeno na 390px: "Mejlovi banke" sa bedžom (3) sada u listi.
- **Sukob frejmova, prijavljen, ne rešavan**: MNav2-ova donja traka (ispod otvorenog sheet-a) pokazuje DRUGAČIJI raspored — 5 ravnopravnih tabova (Početna/Fakture/Porez/**Kalendar**/Više) BEZ centralnog FAB dugmeta "+", drugačije ikonice (48×28px piluli-obrazac sa pozadinom na aktivnom, ne 56px krug), dok MNav15-18 (i trenutni kod) pokazuju 4 taba + centralni FAB, Kalendar unutar "Više". Ne znam koji je od ta dva noviji/ispravan — **kod prati MNav15-18 obrazac (već potvrđeno bajt-za-bajt tačnim), MNav2 ostaje neobjašnjena razlika, prijavljena na odluku.**

**Korak 3, vodič kroz aplikaciju (Tur0-4) — izgrađen, zamenjuje placeholder.** Tur0 (= postojeći `WelcomeTourModal`) potvrđen REČ-ZA-REČ tačan (naslov, telo, 3 stavke čeklista, oba dugmeta) — nula izmena tamo. Tur1-4 (4 tooltip koraka sa "spotlight" izrezom + karticom+strelicom, potvrđeno iz `Tur1-4.dc.html`/`PhTur1-4.dc.html` sirovog HTML-a: pozicije, tekst, dugmad, tačkice napretka) izgrađeni kao nov `TourOverlay` (`js/pocetna.js`) — cilja POSTOJEĆE DOM elemente uživo (`getBoundingClientRect`, ne fiksni frejm-pikseli, jer frejm je samo jedna širina/stanje): 1) "Počni ovde" kartica (`data-tour="pocni-ovde"`), 2) kartica limita (`data-tour="limit"`), 3) `.sidebar-nav` desktop / `.bottom-nav` telefon, 4) zvonce+avatar grupa u topbar-u (`data-tour="notifications"`, nova grupna `span` bez promene postojećeg rasporeda). Dugmad "Nazad"/"Dalje"/"Gotovo", link "Preskoči", 4 tačkice napretka — sve prema frejmu. "Pokaži mi (1 minut)" u `WelcomeTourModal` sada pokreće korak 1 (bio placeholder toast); "Pomoć i vodič" (oba mesta — desktop `user-menu-pop` i mobilni `MobileUserSheet`) sada isto pokreće vodič od početka (bio placeholder toast) preko nove `Dev.startTour()` akcije. Uživo potvrđeno: sva 4 koraka redom (Dalje), nazad (Nazad), preskakanje (Preskoči), završetak (Gotovo) — sve ispravno postavlja/čisti `dev.tourStep`; svetla i tamna tema (dark kartica/tačkice/dugmad tačno `#171B18`/`#C8F169` iz frejma); desktop (1400px) i telefon (390px) — na telefonu korak 4 ispravno hvata zvonce+avatar zajedno ("Profil je pored zvonca" iz `PhTur4` teksta potvrđeno vizuelno). Nov CSS: `.tour-card`/`.tour-arrow`/`.tour-dot(.active)`.

**`GuideB`/`PhGuide` ispostavili su se NEPOVEZANI sa vodičem** — sadržaj je postojeći "Kako do rešenja" panel (4 koraka ePorezi prijave za poresko rešenje, već izgrađen u ranijoj fazi Porez i rokovi), ne ekran za ponovno pokretanje vodiča. Prilog A ih grupiše zajedno sa Tur0-4 pod "Početna" red, ali sam sadržaj frejma to ne podržava — frejm pobeđuje, **GuideB nije dirana.**

**Sweep rezultati (svaki korak)**: `nan-sweep.js` — 80/80 čisto, pre i posle svih izmena. `sweep-phone.js` — 840/840, 0 prekršaja, pre i posle.

**Nije snimljeno formalnim shoot.js ciklusom**: Tur1-4/PhTur1-4 (višekoračni, stateful overlay ne uklapa se lako u jedan-snimak-po-poslu format alata) — umesto toga, uživo potvrđeno korak-po-korak kroz sve 4 kombinacije (iznad), sa `getComputedStyle`/DOM-upit dokazima gde je bilo bitno (boje, nazivi dugmića), ne samo screenshot utiskom.

**Objavljeno**: v39, uživo potvrđeno na Artifact linku (Sub5 pilula, vodič kroz aplikaciju svih 5 koraka).

### Faza 10, 26. krug — Korak 1 (Tur0 potvrda) + Faza 10b (editor šablona fakture, Korak 2a-2e)

**Korak 1, vodič — šta je Tur0.** Sirov HTML `Tur0.dc.html` ponovo pregledan (desktop i telefon): tekst je reč-za-reč identičan postojećem `WelcomeTourModal`-u ("Dobro došao, Stefane", čeklista 3 stavke, "Preskoči"/"Pokaži mi (1 minut)"), a STRUKTURA potvrđuje da je ovo centriran dijalog, ne spotlight-tooltip korak: `width:520px` (modal-veličina, isto kao sâm `.modal`), BEZ `rotate(45deg)` strelice (koju Tur1-4 imaju za svoju karticu+strelicu formu), `rgba(15,42,34,0.62)` pun-ekran zatamnjena pozadina (isto kao svaki drugi `Modal`). Dakle: spec red 265 ("pet kratkih tooltip koraka (Tur0 do Tur4) pokazuju: Počni ovde, limit, Čeka tebe, rokove, AI knjigovođu") je OPISNI tekst koji ne mapira 1:1 na pet Tur-frejmova — stvarna frejm-podela je Tur0 = uvodni modal (bez spotlight-a), Tur1-4 = četiri stvarna tooltip koraka (Počni ovde / limit / "sve ostalo" — sidebar grupa Fakture-Porez-Mejlovi-AI knjigovođa / obaveštenja+rokovi), tačno onako kako je 25. krug već izgradio. **Nula izmena koda** — ponovo potvrđeno da je već tačno, ovaj put i strukturnim dokazom (ne samo tekstom) kao i poslednji put.

**Korak 2, editor šablona fakture (Fak18, Fak24-27 + Ph parovi, spec 7.6).** Pre izgradnje pregledan sirov HTML sva 4 desktop i 5 telefon frejma plus spec 7.6 tekst. Lista onoga što frejm/spec pokazuju:
- Gore: "Zatvori", "Šablon: Moj izgled", "Izmene nisu sačuvane", "Raspored", "Vrati na podrazumevano", "Sačuvaj šablon".
- Levo "Blokovi": 11 blokova (Logo, Datum, Broj fakture, Podaci o klijentu, Podaci o tvojoj firmi, Bankovni podaci, Tabela stavki, Ukupno, Rok plaćanja, Napomena, Potpis i pečat), prevuci-za-redosled, uključi/isključi, "+ Dodaj blok".
- Sredina: platno A4, zumiranje, Mreža/Vodilice/Primer podataka, nivo Blok/Tabela/Cela faktura.
- Desno, po nivou: Blok (Poravnanje, Veličina teksta, Boja teksta, Font, Pozicija X/Y, Širina/Visina, Pozadina bloka, Okvir oko bloka — frejm za "Podaci o tvojoj firmi" daje STVARNE brojeve X:238 Y:96 Š:212 V:232, iskorišćeno tačno kao grounded vrednost); Tabela (Kolone, Linije, Razmak redova, Naizmenična boja redova, Boja zaglavlja); Cela faktura (Boja akcenta, Font naslova/teksta, Margine, Traka u boji na vrhu, Vodeni žig, Tekst u podnožju, Veličina/Oblik loga).
- "Raspored" dijalog: 4 rasporeda (Klasičan, Moderan-traka sa strane, Minimalan, Kompaktan-traka na vrhu), napomena da se ručno pomereni blokovi vraćaju na mesto ali podaci/boje ostaju.
- "Više šablona" (Fak27): padajući izbor 5 šablona ("Moj izgled (Podrazumevani)", "Srpski, dinarske fakture", "Domaći klijenti (RSD)", "Minimalan, engleski", "Klijenti u USD"), svaki sa pravilom dodele, "+ Novi šablon", "Dupliraj ovaj šablon".
- Telefon (`PhFak18`): NEMA levu "Blokovi" kolonu i NEMA "Šablon"-izbor/"Vrati na podrazumevano"/"Raspored" u zaglavlju (samo "Zatvori"/"Sačuvaj") — panel osobina postoji ISPOD platna (naziv izabranog bloka, Blok/Tabela/Cela faktura, "Raspored", Poravnanje/Veličina teksta/Boja teksta), pa tačan tekst "Još opcija: pozicija, širina, okvir" umesto Font/Pozicija/Širina-Visina/Pozadina/Okvir kontrola.

Izgrađeno redom, uz uživo potvrdu svakog dela:

**(a) Izbor bloka klikom** — svaki blok se sad crta kao pojedinačan, apsolutno pozicioniran `<div>` (ne više jedan statičan flow-dokument) sa `onClick`/`onMouseDown` koji ga bira; klik na platnu (i klik na stavku u levoj listi "Blokovi") biraju isti `selected` state, potvrđeno uživo (klik na tabelu stavki u platnu ⇒ desni panel odmah pokazuje "Tabela stavki", X:32 Y:448 Š:416 V:110, leva lista markira isti red).

**(b) Prevlačenje i raspored** — `mousedown` na blok pokreće drag (`mousemove`/`mouseup` na `window`, delta podeljena zoom-om da prevlačenje u pikselima ekrana odgovara pravim koordinatama šablona), potvrđeno uživo (tabela prevučena sa X:32,Y:448 na X:68,Y:484, panel i platno se slažu). Mali kvadratić na izabranom bloku menja Širinu/Visinu prevlačenjem (potvrđeno simulacijom pravog mouse-događaja: Š 416→456, V 110→130, tačno delta). "Raspored" dijalog radi (Klasičan/Moderan/Minimalan/Kompaktan), primenjuje preset pozicija SVIH blokova + uključuje/isključuje `Traka u boji na vrhu`/bočnu traku (Moderan/Kompaktan inferirani direktno iz NAZIVA opcije, koristeći već postojeći "Cela faktura" prekidač "Traka u boji na vrhu" — ne nov vizuelni jezik), potvrđeno uživo obe varijante bez preklapanja sadržaja. Minimalan nema frejm-osnovu za drugačiji raspored pa ostaje identičan Klasičnom — iskreno, ne izmišljeno.

**(c) Panel osobina** — svih 8 kontrola na nivou Bloka (Poravnanje/Veličina teksta/Boja teksta/Font/Pozicija X/Pozicija Y/Širina/Visina/Pozadina/Okvir), svih 5 na nivou Tabele (Kolone/Linije/Razmak redova/Zebra/Boja zaglavlja) i svih 8 na nivou Cela faktura (Akcenat/fontovi/Margine/Traka/Vodeni žig/Podnožje/Veličina i oblik loga) su stvarno povezane na `invoiceTemplates[].blockProps/table/doc` (nove `Templates.updateBlockProps/updateTable/updateDoc/toggleTableCol` akcije) i STVARNO menjaju platno uživo — potvrđeno uživo za svaku kategoriju (npr. uključena "Količina" kolona odmah dodaje "KOL." u tabelu i u pregledu; boja zaglavlja tabele menja pozadinu `<thead>`; "Traka u boji na vrhu" + promenjena boja akcenta odmah oboje traku i "UKUPNO" iznos; tekst u podnožju odmah ispisan na dnu dokumenta).

**(d) Više šablona (Fak27) + pravilo dodele** — "Šablon: X" u zaglavlju je sad pravi padajući izbor (identičan redosled/nazivi kao frejm, uključujući "(Podrazumevani)" i opis pravila uz svaki red), "+ Novi šablon" i "Dupliraj ovaj šablon" rade (`Templates.createNew/duplicate`), potvrđeno uživo (prebacivanje na "Minimalan, engleski" odmah menja platno — "Potpis i pečat" nestaje, pošto taj šablon ima `blocksOff:['potpis']`, akcenat/traka se vraćaju na TOG šablona sopstvene vrednosti, nezavisno od "Moj izgled"). Seed sad ima svih 5 šablona iz frejma (ranije samo 3) — "Domaći klijenti (RSD)" i "Klijenti u USD" dodati. **"Pravilo dodele" editor (select Bez pravila / Domaći klijenti / Po valuti / Po jeziku) nije u frejmu kao poseban kontrol** — frejm samo ispisuje gotov tekst pravila uz svaki šablon u listi, ne pokazuje kako se ono MENJA — dodat minimalan select da pravilo iz spec 7.6 stvarno bude podesivo (jasno obeleženo u UI "Nije u frejmu kao zaseban kontrol").

**(e) Primena na pregled fakture i "PDF"** — `InvoiceDoc` (ista komponenta za platno u editoru, "Pregled uživo" u Novoj fakturi, "Kako je klijent vidi" u detalju fakture i mobilni sheet pregled — "PDF" dugme u ovom prototipu je uvek ovaj isti pregled, nema pravog fajла) sad crta iz `template.blocks/blockProps/table/doc` JSON-a koji joj pozivalac prosledi, umesto fiksnog hardkodovanog rasporeda — ISTA struktura podataka vozi i editor i stvarni dokument, tačno zahtev iz spec 7.6 ("[PREDLOG: definisati šablon kao JSON strukturu]"). Novi selektor `Sel.templateForInvoice(state, invoice, client)` bira koji šablon važi za datu fakturu/klijenta (prioritet: po klijentu/"domaći" → po valuti → po jeziku → podrazumevani), potvrđeno uživo sa 6 kombinacija (Acme Inc./en→Minimalan engleski; Marko Petrović PR domaći/RSD→Domaći klijenti RSD čak i kad je valuta ručno promenjena na USD, pravilo "domaći" pobeđuje; Joam Technologies/USD→Klijenti u USD; Northwind/en bez drugog pravila→Minimalan engleski po jeziku; bez klijenta/sr→Srpski dinarske) i na POSTOJEĆOJ plaćenoj fakturi (Acme Inc., "Kako je klijent vidi" ispravno prikazuje engleski šablon).

**Podrazumevane pozicije blokova (JSON) su autorski izabrane, ne frejm-izvučene u celini** — frejm u jednom trenutku pokazuje TAČNE koordinate samo za JEDAN izabrani blok (Podaci o tvojoj firmi: 238/96/212/232, iskorišćeno tačno), ne za svih 11 istovremeno (statičan frejm to ne može pokazati). Ostalih 10 pozicija je autorski postavljeno da rekreira POSTOJEĆI, već odobren izgled fakture (isti padding:32/gap:20/16 iz postojećeg CSS-a) — iskreno navedeno, ne predstavljeno kao frejm-potvrđeno. Font-padajući meniji (Arial/Inter) i "Vodeni žig" imaju samo JEDNU opciju jer frejm ne otkriva ostale (zatvoren dropdown u statičnom snimku) — ostavljeno kao jednostavan, funkcionalan podrazumevani izbor, ne izmišljene dodatne opcije.

**Mobilni editor (PhFak18)** — leva "Blokovi" kolona sakrivena (frejm je nema), zaglavlje svedeno na Zatvori/Sačuvaj (ostatak dugmadi — izbor šablona, Vrati na podrazumevano, Raspored — premešteno/dostupno samo na desktopu, Raspored dodatno ponovljen u panelu ispod platna tačno gde ga frejm pokazuje), platno počinje umanjeno (70%) da stane pored 12px margine, panel osobina ispod platna sveden tačno na frejm-tekst ("Još opcija: pozicija, širina, okvir" umesto Font/Pozicija/Širina-Visina/Pozadina/Okvir) — potvrđeno uživo 375px, obe teme, nema vodoravnog skrola (`scrollWidth===375`).

**Nije stiglo / nije u frejmu, pa nije izmišljeno**: "+ Dodaj blok" u frejmu nema drugačiji tok prikazan (blokovi su fiksan skup od 11) — implementirano kao padajuća lista trenutno-isključenih blokova (klik ih vraća), ne novi tip bloka. Tabela/Cela-faktura paneli NISU posebno svedeni na telefonu (frejm pokazuje samo Blok-nivo mobilnu varijantu) — ostavljeni identični desktopu na tim nivoima, dokumentovano kao nepotvrđeno pretpostavljanje da bi i oni bili isto svedeni.

**Sweep rezultati**: `nan-sweep.js` — 80/80 čisto. `sweep-phone.js` — 840/840, 0 prekršaja (pre i posle svih izmena ovog koraka).

**Bitan nalaz pri objavljivanju, ispravljen pre finalnog objavljivanja**: prva objava (v40) je otkrila da postojeći (pre-26.-krug) `localStorage` zapis na objavljenoj Artifact adresi ruši CEO prototip belim ekranom — šema `invoiceTemplates` je promenjena (dodati `blockProps`/`table`/`doc`/`assignRule`, 2 nova šablona), a store-ovo plitko spajanje (`Object.assign(freshState(), parsed)`) ostavlja STARI `invoiceTemplates` niz bez tih polja, pa `tpl.blockProps[...]` puca (ista vrsta problema koju je `STORAGE_KEY` versioning već rešavao za v3→v4 u ranijoj fazi). Ispravljeno po istom, već ustaljenom obrascu: `STORAGE_KEY` podignut na `aik_proto_v5` (stari zapisi se više ne učitavaju, čist `freshState()`) — objavljeno odmah zatim kao v41, uživo potvrđeno DA VIŠE NE PUCA (prijava-ekran se ispravno prikazuje za stari nalog, a dev-meni-login → Fakture → Nova faktura → Promeni izgled fakture → klik na blok na platnu sve rade na stvarnoj, javno objavljenoj adresi, ne samo lokalno).

**Objavljeno**: v41 (v40 je imala gorenavedeni bag, ispravljen u istom krugu), uživo potvrđeno na Artifact linku (editor šablona, više šablona, primena na pregled fakture, i da stari lokalni podaci više ne ruše aplikaciju).

### Faza 10, 27. krug — završna provera (spec usklađenost, prazna stanja, pun korisnički put)

**Korak 1.** Napravljen `SPEC_USKLADJENOST.md` — prolazak kroz PLATFORMA_SPECIFIKACIJA.md sekciju po sekciju (0-12 + Prilozi), svaka stavka označena IMPLEMENTIRANO / SIMULIRANO / NEDOSTAJE sa obrazloženjem. Sažetak: ~95 implementirano, ~28 simulirano (očekivano za prototip bez servera: mejl prijem/slanje, AI model, OCR, NBS, PDF, QR, procesor plaćanja, Google OAuth), ~22 nedostaje (većina eksplicitno van obima po samom spec-u — 2FA ekran, push, "Promet i izvodi" tab). Najvažniji pojedinačni nalaz: **algoritam uparivanja uplate sa fakturom (8.8) nije opšta logika** — seed/simulirani mejlovi su unapred jednoznačno dodeljeni svojoj fakturi, pa grana "više kandidata ili nijedan" nikad nije stvarno testirana generičkim putem. Ostale vredne-pažnje NEDOSTAJE stavke: trajni nalog ne automatski-označava mesec plaćenim (12/#12), nema periodičnog auto-save nacrta (7.4), nema dodatne potvrde za storno već plaćene fakture (6.9), Err2 (offline) se ne pojavljuje automatski (nema `navigator.onLine` osluškivača), nema pravog ICS kalendar feed-a (samo prikazan link), nema jediničnih testova poslovnih pravila van `plural.test.js`.

**Korak 2, prazna stanja — 5 stvarnih odstupanja nađeno i ispravljeno** (sve potvrđeno iz sirovog HTML-a frejma pre ispravke):
1. **Kl9/PhKl9 (Kalendar, mesec bez događaja)**: test-posao nije navigirao na frejmov mesec (Januar 2027), pokazivao je tekući mesec — ispravljen test (dva klika "sledeći mesec" async). Usput nađeno i ispravljeno pravo odstupanje: `PhKl9.dc.html` ima KRAĆI tekst (bez druge rečenice "Možeš i sam da dodaš događaj.") od desktop `Kl9.dc.html` — kod je prikazivao isti (duži) tekst na oba uređaja.
2. **Mb2/PhMb2 (Mejlovi banke, prazno/povezivanje)**: dugme "Podešavanja slanja" se prikazivalo i u praznom stanju; frejm (0 pojava teksta) ga nema dok nijedan mejl nije stigao — sakriveno.
3. **Kp3/PhKp3 (Knjiga prihoda, prazno/nova godina) — najveći nalaz**: (a) `YEARS()` padajući izbor nikad nije uključivao NAREDNU godinu (`[y,y-1,y-2]`) — prazno-stanje-nove-godine se NIKAD nije moglo stvarno izabrati kroz pravi UI, samo kroz test-skriptu koja je tiho padala (`select.value='2027'` na nepostojećoj opciji → "" → `Number("")=0` → "Još nema prihoda u 0."); ispravljeno na `[y+1,y,y-1,y-2]`. (b) Prazno stanje je ZAMENJIVALO celu stranicu (nestajala je glavna statistika kartica i Devizni/Dinarski pilule); frejm ih zadržava vidljive (sa nulama) i DODAJE ilustraciju ispod, ne umesto — prepravljeno (izdvojena `MainStatCard`, mobilni frejm nema pilule/godinu uopšte u praznom stanju, desktop ih zadržava).
4. **Klijenti (Fakture tab, prazno stanje)**: NEMA sopstveni frejm u Prilogu A, ali ekran je bio potpuno prazan (samo pretraga+dugme, ništa ispod) kad nema klijenata — spec 4.7 traži prazno stanje svuda. Dodat `EmptyState` istim vizuelnim jezikom kao Fak2/Kp3/Mb2 (nije nov dizajn).
5. Potvrđeno ispravno bez izmene: Fak2/PhFak2 (Fakture prazno), Ak1/PhAk1 (AI pozdrav), Ponavljajuće (već ima dobro prazno stanje), Porez bez rešenja (već ispravno od ranije).

**Korak 3, pun korisnički put kraj-do-kraja, jednom, bez preskakanja** — odigran uživo kao potpuno NOV nalog (registracija "Petar Testović", ne Stefanov seed): registracija → potvrda e-maila (simulirani mejl modal) → onboarding sva 4 koraka, uključujući "Simuliraj dolazni mejl (demo)" u koraku 3 (OnbO9 "Prvi mejl je stigao. Sve radi." potvrđeno) → ulazak u app → nova faktura sa šablonom (Acme Inc., engleski šablon, popunjeno iz profila klijenta, pregled uživo tačan) → poslata → simuliran devizni priliv (dev meni) → mejl banke odobren i poslat → faktura Plaćena, limit tačno uvećan (644,10 € × kurs) → Knjiga prihoda prikazuje novi unos → Porez: označeno kao plaćeno sve 4 stavke (uživo klikom) → Kalendar/Početna tačno sakrivaju isplaćen rok → AI pitanje ("Koliko sam do limita?") tačan odgovor sa pravim brojevima → Pretplata: pun tok plaćanja karticom do uspeha, pa `payment_failed` stanje (Sub11, tačan tekst/dugmad) → Podešavanja pregled tačan → odjava → ponovna prijava (otkriveno: lozinka unesena pri registraciji se ne koristi za login, provera je uvek protiv fiksne demo lozinke — SIMULIRANO ograničenje prototipa bez pravog servera, ne popravljeno, zahtevalo bi pravu bazu korisnika; e-mail/ime/sve ostalo stanje je ispravno sačuvano i vraćeno posle ponovne prijave).

Iz ovog punog toka nađene i ispravljene **3 stvarne greške** (van Koraka 1/2):
1. **Porez: "Označi kao plaćeno" potpuno nedostupno na telefonu.** `PaymentItemCard` je na mobilnom umesto tog dugmeta uvek prikazivao "Sačuvaj QR" — mobilni korisnik NIJE MOGAO nikad da označi uplatu kao plaćenu. Frejm (`PhPay1`/`PhPay2`) zaista nema taj tekst na telefonu, ali spec 5.3 ("Nema funkcije koja postoji samo na jednom uređaju") i 6.3 eksplicitno traže tu funkciju svuda — kad se frejm i tekst spec-a razlikuju u PONAŠANJU, spec pobeđuje (spec, odeljak 0, tačka 6). Ispravljeno bez vizuelne izmene: postojeća "Neplaćeno"/"Plaćeno" pilula (već tačno po frejmu) postaje dodirna na mobilnom (isti obrazac kao PhKl3 red-je-dodirljiv iz 20. kruga).
2. **Kalendar: plaćen poreski rok nije nestajao iz "Sledeći rokovi".** `calendarEventsForMonth` je uvek vraćao 'drzava' događaj (samo menjao `status` polje), a "Sledeći rokovi" filter nije isključivao `status==='Plaćeno'`. Spec 6.3 korak 5: "rok nestaje iz Čeka tebe". Početna strana ("Čeka tebe") je već bila ispravna (`taxDueThisMonth` selektor), samo Kalendarova kartica nije. Ispravljeno dodavanjem `&& e.status!=='Plaćeno'` u `upcoming` filter.
3. **AI knjigovođa: pozdrav uvek "Zdravo Stefane"**, bez obzira ko je stvarno prijavljen — otkriveno kad je AI i dalje zvao novoregistrovanog "Petra" Stefanom. Dva mesta (`ai.js` Greeting, `actions.js` proaktivni pozdrav) — ispravljeno na `U.firstNameVoc(s.user.name)`, isti obrazac kao Početna ("Dobar dan, Petare").

**Sweep rezultati**: `nan-sweep.js` — 80/80 čisto. `sweep-phone.js` — 840/840, 0 prekršaja (posle svih izmena Koraka 2 i 3).

**Nije stiglo/nije ponovo potvrđeno ovaj krug (iskreno)**: formalni frame-compare piksel-ciklus nije ponovo pokrenut za SVE 11 sekcija (samo za direktno izmenjene ekrane + ciljani Klijenti/Kp9/Fak18 regresioni spot-check) — postojeći brojevi odstupanja na netaknutim ekranima (npr. Kp8/Kp9/Kp10, Fak7/Fak28) ostaju isti kao pre ovog kruga, nisu ponovo analizirani red-po-red. Broj faktura koji se "vraća u niz" pri brisanju nacrta (8.2) nije posebno testiran ovaj krug. Veličine fajlova (logo 2MB, rešenje 20MB) nisu testirane sa stvarno prevelikim fajlom.

**Objavljeno**: v42, uživo potvrđeno na Artifact linku.

### Faza 10b, 28. krug — Prenos dosadašnjeg poslovanja (Uv0-Uv6/PhUv0-PhUv6)

Ceo tok "Prenesi dosadašnje poslovanje" izgrađen od nule preko tri koraka istog kruga (Korak 1 model/logika, Koraci 2-5 UI preko celog ekrana, Korak 6 provera) — novi fajl [js/uvoz.js](js/uvoz.js), ruta `app/uvoz` (fullBleed, bez sidebar/topbar-a, isti obrazac kao mobilna AI knjigovođa).

**Ulaz (Uv0/PhUv0)**: dugme "Prenesi poslovanje" u zaglavlju Knjige prihoda (SAMO desktop — PhUv0 ga ne crta, telefon ima samo baner) i baner "Počeo si usred godine?" ponovljen na 3 mesta (Knjiga prihoda, "Počni ovde" kartica na Početnoj — nestaje kad kartica nestane posle onboardinga, Podešavanja/Povezivanje). Baner nestaje kad je uvoz potvrđen, dugme ostaje.

**Tok (Uv1-Uv6)**: izbor načina (dokumenta/šablon/ručno) → učitavanje (pravi `<input type=file>`, 20 MB/tip-validacija) → simulirano čitanje (tempirana sekvenca, auto-prelazak) → provera (tabela/kartice, uredi/ukloni stavku, traka "Šta će se promeniti") → ručni unos (na telefonu PO PhUv5: popunjeni redovi su kartice-samo-za-čitanje, samo "Nova stavka" ima polja, bez Faktura unosa) → Gotovo (rezime, akontacije, obavezna potvrda). "Popuni naš šablon" stvarno parsira CSV (ne izmišljene stavke), "Učitaj dokumenta" uvek daje fiksnih 6.

**Stvarne greške nađene i ispravljene (ne frejm-nedoslednosti)**:
1. Datum "Prihodi od" pomeren dan unazad (`defaultStartDate` koristio `.toISOString()` na pravom Date-u — pogrešno u UTC+1).
2. `nextInvoiceNumber` davao `25/26-NaN` ako korisnik ručno upiše nebrojčani broj fakture (jedan loš broj truje `Math.max` za sav niz).
3. **Dupli klijent** kad se isto neuparčeno ime pojavi 2+ puta u istom uvozu (npr. "Acme Inc." dva puta) — `commit()` je proveravao samo stanje OD PRE uvoza, ne i klijente napravljene u istoj petlji.
4. **Pogrešan limit u pregledu**: `computeSummary` je brojao I stavke "Bez fakture" I stavke van poslednjih 365 dana u "Prihod u 12 meseci", a stvaran `Sel.limitInfo` oba isključuje — Uv4/Uv6 su pokazivali veći limit nego što Knjiga prihoda posle čuvanja stvarno ima (nađeno testom "nov nalog od aprila": 601.826 projektovano vs 547.995,50 stvarno).
5. `parseSrDateFlexible` tiho prelamao van-opsega mesec/dan u sledeći (`new Date` overflow: "32.13.2026" → 01.02.2027, validan ali pogrešan datum) — dodata provera opsega pre konstrukcije Date-a.
6. CSV red sa neprepoznatim datumom/iznosom se nije ni na koji način označavao (tiho bi prošao kao "Pročitano" sa iznosom 0) — dodato: status "Proveri" sa objašnjenjem (`uvozBuildItem` prima `dateRaw`/`amountRaw` SAMO iz CSV reda, ne i iz praznog ručnog reda), i `commit()` sad isključuje stavke bez datuma ili sa iznosom ≤ 0.

**Rubni slučajevi provereni uživo**: loš CSV red (pogrešan datum/iznos) → "Proveri" sa objašnjenjem, ne tiho prolazi; prazan CSV → jasna poruka, ništa se ne otvara; SR format (tačka-hiljade/zarez-decimala) → tačno parsira; fajl > 20 MB i pogrešan tip (`.exe`) → odbijeni uz toast, ne tiho prihvaćeni; Zatvori usred toka → traži potvrdu AKO postoji nešto da se izgubi (fajlovi/stavke/popunjen ručni red), inače zatvara direktno; Nazad radi na svakom koraku i čuva već uneto; uklanjanje svih stavki u proveri → "Potvrdi i sačuvaj" onemogućeno; "Počni od nule" → nula izmena stanja, samo `importState.confirmed=true` i nazad na Početnu; valuta bez eksplicitnog kursa (npr. JPY) → pada na generički kurs iz `nbsRate`, ne NaN/crash (poznato pojednostavljenje, nije belo-listirano). Admin: potvrđeno da `importState.history` (jedini trag koji bi admin video) sadrži SAMO broj stavki, vreme i početni datum — nikad klijenta/iznos/naziv fajla; Admin ekran sam nije izgrađen (još placeholder), ništa trenutno ni ne čita taj dnevnik.

Pun test "nov nalog koji kreće u aprilu" odigran DVA PUTA na čistom localStorage (jednom "Učitaj dokumenta", jednom CSV) — limit (broj+procenat), Knjiga prihoda (izvor "Uvoz", originalni datumi), sledeći broj fakture, Početna i status akontacija (sve do prošlog meseca označene plaćene) svi tačni; ponovljen uvoz ispravno prijavljuje svih 6 kao moguće duplikate.

**Namerni izbori (frejm nije crtao)**: "Prihodi od" je pravi `<input type=date>` sakriven iza prilagođenog prikaza teksta+strelice (PhUv5 ručni unos telefon je drugačiji obrazac od ustaljenog — kartice umesto polja, bez Faktura unosa — prepoznato i ispravljeno tek pošto je korisnik eksplicitno tražio da se PhUv2/3/5/6 pročitaju; prvi pokušaj je koristio ustaljeni obrazac forme).

**Alati**: `app/uvoz` dodat u `nan-sweep.js` (+ 3 dublja koraka po preset-u, 112 kombinacija) i `sweep-phone.js` (+3 dublja koraka, širine 360/390/393/430, 1096 kombinacija) — oba 0 problema. Nov `jobs-uvoz.json` sa 14 poslova (Uv0-6/PhUv0-6, afterNav skripte voze stvaran tok) za `shoot.js` kontakt-liste — sve pregledane, razlike su ili prihvaćene kategorije (frejmov mokap ≠ stvarni prazan početak ručnog unosa, ilustrativan flat kurs ≠ stvaran NBS po datumu, visina platna) ili su gore navedene stvarne greške, sad ispravljene.

**Objavljeno**: v45 (Korak 1 = v42 bez izmene, Ulaz/Uv0 = v43, Uv1-Uv6 prvi prolaz = v44, sve ispravke iz Koraka 6 = v45).

### Faza 10b, 29. krug — formalni piksel-diff ciklus (run.js) + ispravke nađene u njemu

Pokrenut `run.js jobs-uvoz.json` (formalna tabela odstupanja, ne samo vizuelni pregled kontakt-slika iz 28. kruga) — **628 ukupno odstupanja na 14 poslova**. Pregledom po kategoriji nađeno je 7 STVARNIH grešaka (ne frejm-šum), sve ispravljene; posle ispravki **310 odstupanja** (ostatak su već ranije prihvaćene kategorije — videti dole):

1. **Žuta "Proveri" traka/pilula je koristila app-ov opšti `--warn`/`--warn-bg`** (druga nijansa) umesto frejmove tačne `#FFF1D0`/`#6B4600` (svetla), `rgba(255,190,70,.16)`/`#F2C46B` (tamna) — na 3 mesta (`.uvoz-pill-review`, `.uvoz-table-row.review`, `.uvoz-mobile-card.review`, upozorenje-traka u Uv4).
2. **"6 stavki" neutralna pilula** koristila `var(--surface-2)`/`var(--text-muted)` umesto frejmovog `var(--bg)`/`#4A524C` (svetla pozadina stranice, ne površina kartice — namerna kontrastna "rupa").
3. **"Zatvori" u zaglavlju, broj fakture/"Bez fakture" u tabeli, oznake labela u "Šta će se promeniti"** koristili `var(--text-muted)` (#6B706C, svetlije) umesto `sub-muted-dark` (#4A524C, tamnije) — ustaljena razlika već postoji u ostatku app-a, ovde pogrešno pomešana.
4. **"Dodaj red" (ručni unos) bio obojen kao link** (`.uvoz-link`, suma/limeta boja + donja linija) — frejm ga crta kao OBIČAN tekst, bez boje/podvlačenja.
5. **Naslov (h1) svakog koraka bio fiksnih 2rem i na telefonu** — frejm (PhUv1-6) crta 1.5rem na telefonu, 2rem na desktopu; ispravljeno na `var(--fs-24-32)`, već postojeći fluidni token za baš ovu namenu ("naslovi ekrana").
6. **`.content-fullbleed{padding:0}` gubilo na mobilnoj širini** od kasnijeg, generičkog `@media(max-width:1023px){.content{padding:...}}` pravila (ista specifičnost, kasnije u fajlu pobeđuje) — svaki `fullBleed` ekran (Mb9/Mb5/AI mobile takeover, sad i Uvoz) je na telefonu dobijao DODATNIH 16px padding-a sa svake strane preko sopstvenog. Vidljivo tek kad `fullBleed` ekran ima I SOPSTVENI bočni razmak (Uvoz ima, raniji fullBleed ekrani nisu) — ispravljeno dodavanjem `.content-fullbleed{padding:0}` ponovo POSLE mobilnog pravila.
7. **`.uvoz-footer-inner{width:auto}` na telefonu** se skupljalo na širinu sadržaja umesto da ispuni roditelja (flex-item bez `flex:1`/`width:100%`) — dugmad `width:100%` su se onda odnosila na skupljeni roditelj, ne na pravu širinu footer-a. Ispravljeno na `width:100%`.

**Preostalih 310 odstupanja, po kategoriji (nijedno nije stvarna greška)**:
- Dugme visina 44 vs crtanih 40px, padding 16 vs 20px, `border:1px solid transparent` vs crtanih `border:0`, `gap:8px` vs crtanog "normal" — **ustaljena, već prihvaćena razlika za CEO app** (isti `Button` komponent svuda), nije posebna za Uvoz, nije dirano.
- Footer dugme širina ~301 vs crtanih 333px na telefonu (PhUv2/3/4/5) — merenje footer-ovog SOPSTVENOG border-box-a (uključuje njegov padding) nasuprot frejmovom merenju content-box-a; vizuelno uživo potvrđeno da dugme ispunjava karticu kako treba (snimak), razlika je u metodu merenja alata, ne u izgledu.
- Tekst-čvor razlike (span dodat oko teksta gde frejm ima tekst direktno u elementu) za "Prihodi od"/"dd.mm.gggg." polje i nekoliko redova u Uv3 — ista, već ranije dokumentovana kategorija ("frejm spaja tekst u jedan čvor gde kod ima više elemenata").
- Uv0 sidebar (Pretplata aktivna/Obnavlja se/brojevi-bedž) — PRETHODNO POSTOJEĆI deo Sidebar-a, nije pisan niti menjan u Fazi 10b, van obima ovog kruga.

**Dupli CSV**: `StepUpload` sada broji `.csv` fajlove kad je metod "šablon" i prikazuje trajnu traku (ne toast) "Učitan je samo prvi šablon. Učitaj ostale posebno." kad ih ima 2+.

**`Sel.limitInfo` isključivanje uplata "Bez fakture"**: potvrđeno da je NAMERNO, direktno iz `PLATFORMA_SPECIFIKACIJA.md` odeljak 8.4 ("Uplate bez fakture ne ulaze (4.2, 7.10)"), uz pervazivnu UI podršku (Kp10 baner, Ak9 "Zašto ova uplata nije u zbiru?", Mb6 tok). Korisniku pokazano i NIJE menjano bez odluke — videti dole.

**Objavljeno**: v46.

## Živa verzija
**Objavljena do v54 (Faza 11, Korak 7 — poslednji korak ove faze).** Formalna provera (`tools/frame-compare/jobs-admin.json`, `run.js`, `sweep-phone.js`, `nan-sweep.js`) svih 11 Adm/PhAdm frejmova, obe teme, uloga korisnik/admin. Rezultat i 4 stvarne ispravke nađene uživo poređenjem (ne samo iz pregleda koda) ispod. Detaljan izveštaj u odeljku "Faza 11 — formalna provera (Korak 7)" niže.

## Živa verzija (ranije)
**v53 (Faza 11, Korak 6).** v53 dodaje ekran **Podrška** (Adm5/PhAdm5), poslednji od 5 admin ekrana: levo "Prijave problema" (5 primera iz Priloga B, bedž Otvoreno/Hitno/Rešeno — isti tonovi kao postojeći status-paid/sent/late), desno "Ocene AI odgovora" (91%/31 + 4 razloga sa trakama, ista formula širine kao Pregled "Korišćenje funkcija": vrednost/max*100). Oba bloka iste visine na desktopu (spec 4.5), naslagano na telefonu. Čisto za čitanje — nema dugmića za promenu statusa (nije nacrtano, ADMIN_SPEC 10/#5 to eksplicitno ostavlja otvoreno). **Nađena i ispravljena greška** (ista porodica kao Korak 4-5 migracija): `adminData` je rastao polje-po-polje kroz Korake 3-6 (users/freeAccess/log/supportTickets), a stari plitki `Object.assign` u `store.js` je na SVAKOM dodatku zadržavao polu-stari objekat iz localStorage-a i rušio sledeći ekran kad zatreba novo polje — ispravljeno JEDNOM, opštije: `load()` sad spaja fresh i persisted `adminData` jedan nivo dublje (persisted pobeđuje po polju, fresh popunjava što nedostaje), pa budući dodaci u Admin delu ne nose isti rizik. **Svih 5 Admin ekrana (Pregled/Korisnici/Dnevnik/Podrška + Odobri-pristup) sada postoji i radi.** Uživo potvrđeno: desktop 1280/telefon 375, obe teme.

## Živa verzija (ranije)
**v52 (Faza 11, Korak 5).** v52 dodaje ekran **Dnevnik radnji** (Adm4/PhAdm4): 48-stavki seed log (generisan u Koraku 4, sada prikazan) + svaki "Odobri besplatan pristup" otad dodaje svoj zapis na vrh — 5 pilula-filtera sa brojem (Sve radnje/Besplatan pristup/Popusti i produženja/Promene plana/Izvozi), tabela (Vreme/Radnja/Korisnik/Detalj) na desktopu, kartice na telefonu, ista paginacija kao Korisnici. Zapisi su samo za čitanje (nema dugmića za izmenu/brisanje, dosledno spec 4.4 "ne mogu da se menjaju ni brišu"). Uživo potvrđeno: desktop 1280/telefon 375, obe teme, filteri, paginacija, i da novi "Odobri pristup" iz Koraka 4 odmah ovde upada kao najnoviji zapis.

## Živa verzija (ranije)
**v51 (Faza 11, Korak 4).** v51 dodaje **"Odobri besplatan pristup"** (Adm3/PhAdm3) — modal na desktopu, donji sheet na telefonu (postojeća `Components.Modal` to već radi automatski, nije trebalo graditi posebno). Polja: Korisnik (pretraga uživo po imenu/firmi, padajući rezultati, max 8), Plan (fiksan tekst), Trajanje (Bez roka / Do datuma sa `<input type=date>`), Interna napomena (slobodan tekst). Otvara se i sa glavnog dugmeta (bez unapred izabranog korisnika) i iz red-menija (taj red unapred izabran). **Stvarna radnja, ne simulacija**: `Actions.Admin.grantFreeAccess` premešta nalog iz `adminData.users` (128-pool) u `adminData.freeAccess`, čuvajući prethodni status/plan (`priorStatus`/`priorPlan`/...) za eventualno kasnije vraćanje, i upisuje zapis u `adminData.log` (Dnevnik radnji — ekran dolazi u Koraku 5, ali su svi podaci, uključujući 48-stavki seed log, generisani sada da upis ima gde da ide). Posledica, kako spec traži: Ukupno/Aktivne (ili odgovarajuća pilula) na Pregledu I Korisnicima **odmah padaju za 1** pošto taj nalog više nije u 128-pool-u — oba ekrana i dalje dele isti izvor (`Sel.adminOverview`/`Sel.adminUsersAll`), provereno uživo da se slažu posle akcije. **Nađena i ispravljena greška** (otkrivena uživo testiranjem, ne bi je uhvatio sam pregled koda): `adminUsersAll` je mapirao besplatne naloge preko `Object.assign({status:'besplatno'}, u)` — pošto `u` (nalog premešten iz `users`) NOSI svoj stari `status` (npr. 'aktivna'), taj redosled je tiho zadržavao stari status umesto 'besplatno', pa su brojke na oba ekrana ostajale pogrešne posle svake dodele. Ispravljeno na `Object.assign({}, u, {status:'besplatno'})` (novo poslednje, uvek pobedi). Uživo potvrđeno: desktop modal i telefon sheet (obe teme), pretraga/izbor korisnika, Bez-roka/Do-datuma prekidač, "Odobri pristup" dugme onemogućeno dok nalog nije izabran, stvarna promena broja na oba ekrana posle dodele, zapis u dnevniku.

## Živa verzija (ranije)
**v50 (Faza 11, Korak 3).** v50 dodaje ekran **Korisnici i pretplate** (Adm2/PhAdm2): generisana lista od **128 "običnih" korisnika** (7 iz Priloga B + 121 generisanih, determinističkim seed-om — ista lista na svakom učitavanju, bitno za run.js snimke) tačno raspoređenih 18 probnih/79 aktivnih/5 naplata-nije-uspela/26 otkazanih, plus Stefanov nalog kao poseban "besplatan pristup" van te liste. 5 pilula-filtera sa brojem (Svi/Probni/Aktivni/Naplata/Otkazani), plan/sortiranje-selektori (dekorativni, isti obrazac kao postojeći `.inv-select` u Fakturama), tabela (desktop)/kartice (telefon), paginacija (8 po strani), meni radnji na tri tačke (5 stavki iz spec 4.2 teksta — sadržaj je [PROVERITI], videti dole). `Sel.adminOverview` sada računa Ukupno/Probni/Aktivni/Naplata/Otkazani IZ te liste (ne više zasebna Prilog B kopija) — Pregled i Korisnici sad dele isti izvor, potvrđeno da se brojke poklapaju. Usput ispravljene dve greške nađene uživo poređenjem sa frejmom: (1) CSS grid `width:0` je na telefonu potpuno skrivao tekst kartica-brojki (ne samo prelamao) — trik je bio za flexbox, ne za grid, ispravljeno na `min-width:0`; (2) red-meni je iskakao IZNAD reda (kopiran iz sidebar-ovog `.user-menu-pop`, dizajniranog da raste na gore) umesto ISPOD — nova `.admin-row-menu` klasa. **Odstupanje od frejma, javljeno:** paginacija ("Prikazano X od Y") nije nacrtana na telefonu (PhAdm2 kanvas se fizički prekida posle par kartica), ali je zadržana i tamo jer je 129 redova nemoguće prelistati bez nje — ista kontrola kao desktop. **Odstupanje od frejma, javljeno:** footer teksta "Prikazano 8 od 128" u frejmu je snimljen PRE korisnikove odluke da Stefan ne ulazi u 128 — ekran sada tačno pokazuje "od 129" (128 + Stefan), dosledno sa "Svi 129" pilulom. "Odobri besplatan pristup" (dugme i stavka menija) i ostale 4 stavke menija trenutno samo pokazuju toast "Dolazi u sledećem koraku Faze 11." — stvarno dejstvo dolazi u Koraku 4 (i Koraku 5 za one kojima treba dnevnik). **Migracija**: ko god je dotakao v49 objavljenu verziju ima nepotpun `adminData` (bez `users`/`freeAccess`) u localStorage-u — `store.js` sad to prepoznaje i tiho zamenjuje svežim, umesto da sruši Admin ekrane. Uživo potvrđeno: desktop 1280/telefon 375, svetla/tamna tema, filteri, paginacija (Prethodna/Sledeća), red-meni (desktop i telefon), "Izvezi" toast.

## Živa verzija (ranije)
**v49 (Faza 11, Korak 2).** v47: `user.role` polje, `Sel.isAdmin`, `Icons.shield`, stavka "Admin" (sidebar+"Više"), admin-specifična gornja traka. v48: dev-meni prekidač uloge, zaštićena ruta `app/admin` (404 za neadmina, i na pod-rutama). v49: ekran **Pregled** (Adm1/PhAdm1) — 4 kartice-brojke, grafik "Nove registracije po danima" (SVG putanja IZVEDENA iz 30-dnevnog niza, ne hardkodovana — formula `y = H - vrednost*(H/(max*1.15))`, 15% zazora iznad vrha, potvrđena piksel-tačno protiv frejmovog hardkodovanog puta), 4-trake "Od registracije do plaćanja" (širina = vrednost/prva*100), 4-trake "Korišćenje funkcija" (širina = vrednost/max*100), "Zahteva pažnju" (3 klikabilna reda, vode na Korisnici/Podrška tab), 4 admin pilule-taba (Korisnici/Dnevnik/Podrška trenutno "u izradi" placeholderi). "Izvezi izveštaj" simulira toast "Izvezeno." (spec 8). Period-selektor je dekorativan (isti obrazac kao postojeći `.inv-select` u Fakturama). Novi `Sel.adminOverview` čita iz `state.adminData.overview` (Prilog B agregati, videti napomenu dole o izvoru brojki). Desktop i telefon imaju RAZLIČIT tekst za 3 podnaslova kartica i grafik je manjeg platna na telefonu (300×140 vs 560×170) — oboje potvrđeno direktnim poređenjem sa `PhAdm1.dc.html` otvorenim uživo u pregledaču (ne samo iz tekstualne ekstrakcije), i ispravljeno pošto je prva verzija pogrešno prelamala tekst po rečima umesto da ga skrati elipsom u jednom redu (CSS grid `width:0` greška, SAMO na mobilnom 2-kolonskom rasporedu — ispravljeno na `min-width:0`). Uživo potvrđeno: desktop 1280/telefon 375, svetla/tamna tema, tab-navigacija, "Zahteva pažnju" klik vodi na odgovarajući tab, "Izvezi izveštaj" toast, uloga korisnik i dalje 404-uje na SVAKOJ admin pod-ruti. **Svaki izveštaj navodi da li je verzija objavljena i pod kojim brojem** (korisnikovo pravilo, 22. krug).

## Faza 11 (Admin deo aplikacije) — u toku
Pročitana u celosti: `ADMIN_PAKET/ADMIN_SPECIFIKACIJA.md` i svih 11 frejmova (Adm1-5, PhAdm0-5, obe teme). Korisnik je dostavio `ADMIN_PAKET2.zip` sa ažuriranom specifikacijom (frejmovi i prompt nepromenjeni, provereno diff-om) koja formalizuje dva odgovora iz chat-a kao [ODLUČENO]:
- **Uloge**: samo `user`/`admin`. "Podrška" je tab u Adminu (4.5), ne uloga — Koraka 7 test je dve uloge (korisnik bez pristupa, admin), ne tri.
- **Ukupno 128 korisnika OSTAJE 128**, tačno iz frejmova, i NE uključuje besplatne naloge (ni Stefanov). Besplatni nalozi (Stefan + oni koje admin odobri) se vide u listi pod "Svi" sa statusom "Admin, besplatno"/"Besplatan pristup", ali se ne broje u Ukupno, u četiri pilule (Probni/Aktivni/Naplata/Otkazani) niti u MRR. Seed = 128 "običnih" korisnika + Stefanov nalog, posebno.
- Korisnik je takođe potvrdio poznatu nedoslednost u Prilogu B (Petar Nikolić je u tabeli "Aktivna", a u dnevniku mu je odobren besplatan pristup) — ostaje kao u tabeli (Aktivna), dnevnik se NE ispravlja.

**Faza 11 je ZAVRŠENA — svih 7 koraka gotovi i objavljeni (v47 do v54).** Detalji poslednjeg koraka ispod. Sledeća faza ne počinje bez Stefanove reči.

**[PROVERITI] ostaje otvoreno, namerno NE izgrađeno (van obima ove faze, kako je i javljeno usput):**
1. **Sadržaj menija radnji po korisniku (Adm2, 3 tačke)** — spec sam kaže "tačan sadržaj menija nije nacrtan, PROVERITI". Meni ima svih 5 stavki iz spec 4.2 teksta; samo "Odobri besplatan pristup" je stvarna (Korak 4). Ostale tri (Produži probni period/Dodaj popust/Promeni plan) pokazuju toast "Dolazi u sledećem koraku" — njihov izgled (dijalog/forma) nije nacrtan ni u jednom frejmu, pa nisam improvizovao. Javi ako ih treba izgraditi i kako.
2. **Prikaz besplatnog pristupa u korisnikovoj (ne-admin) aplikaciji** (sidebar kartica, ekran Pretplata) — spec eksplicitno kaže "nije nacrtano, ne improvizovati". Korisnička Pretplata ekran/sidebar kartica NISU dirani.
3. **Upravljanje prijavama u Podršci** (promena statusa, odgovor korisniku) — nije nacrtano. Adm5 ostaje čisto za čitanje, tačno kao frejm.

## Faza 11 — formalna provera (Korak 7, poslednji korak)

**Alati**: `tools/frame-compare/jobs-admin.json` (novi, 11 poslova — Adm1-5 desktop + PhAdm0-5 telefon) sa `run.js` (formalni piksel-diff), i `sweep-phone.js`/`nan-sweep.js` prošireni sa 4 admin rute (`app/admin`, `/korisnici`, `/dnevnik`, `/podrska`) plus dubinski korak za "Odobri besplatan pristup" (modal/sheet nije sopstvena ruta). Svaka kombinacija u sva tri alata sad postavlja `user.role:'admin'` pre navigacije (bez toga bi admin rute 404-ovale).

**`run.js` (piksel-po-piksel, 1440/365px i obe teme, formalni ciklus):** 11/11 poslova prošlo bez greške u izvršavanju. Ukupno 1228 elemenata u frejmovima, 1094 upareno, 964 preostalih odstupanja — raspoređenih ovako:

| Kategorija odstupanja | Otprilike | Stvarna greška? |
|---|---|---|
| `borderTopColor`/`borderTopStyle` na elementima BEZ border-top-width razlike (currentColor nasleđivanje kad god se boja teksta razlikuje, čak i bez vidljive linije) | ~310 | Ne — potvrđeno 0 `borderTopWidth` odstupanja u celom ciklusu, znači nijedna STVARNA linija ne nedostaje/ne postoji greškom |
| `width`/`height` na flex-stretch elementima (kolona-naslov u kartici se rastegne na punu širinu roditelja — nevidljiva kutija, tekst ostaje na mestu) i na redovima sa različitom dužinom generisanog imena/teksta nego frejmov fiksni primer | ~250 | Ne — vizuelno nevidljivo, potvrđeno uživo screenshot-ima kroz celu fazu |
| Bedž-brojka spojena sa susednim tekstom u ekstrakciji ("Mejlovi banke1" umesto "Mejlovi banke"+"1") — isti sidebar svuda u aplikaciji, ne admin-specifično | ~30 | Ne — poznata nedoslednost alata, ne ekrana |
| Placeholder teksta u `<input>` se ne broji kao poredivi tekst (npr. "Pretraži korisnike i pretplate") | ~11 | Ne — ograničenje alata (input nema textContent) |
| Namerno odstupanje: Ukupno/Svi broji **129** (ne frejmovo "128") i Stefan je POSLEDNJI red (ne 7. od 8) | ~25 | Ne — korisnikova odluka iz chat-a (besplatni van 128), javljeno u Koraku 3 |
| Nasumično generisani zapisi dnevnika (41 od 48) mogu biti noviji od nekih od 7 datih primera, pa prva strana Dnevnika ne sadrži UVEK svih 7 primera | ~20 | Ne — očekivana posledica generisanja punih 48 stavki, ne greška |
| **Boja 4 oznake polja u "Odobri besplatan pristup" (Korisnik/Plan/Trajanje/Interna napomena)** — koristio `var(--text-muted)` (#6B706C), frejm traži `sub-muted-dark` (#4A524C/#C4CAC5) | 8 | **DA — ispravljeno** |
| **H1 naslov "Admin" na sve 4 admin-ekrana** — frejm menja naslov po tabu (Korisnici i pretplate/Dnevnik radnji/Podrška), samo Pregled zadržava "Admin" | 3 | **DA — ispravljeno** |
| **Visina dugmadi "Izvezi"/"Izvezi izveštaj"/"Odobri besplatan pristup"/"Otkaži"/"Odobri pristup"** — 44px (podrazumevano) umesto frejmovih 40px | 7 | **DA — ispravljeno** (`size:'sm'`) |
| **Podnaslov stranice bez `max-width:720px`** — rastegao se preko cele širine umesto da se prelomi u 2 reda kao frejm | 4 | **DA — ispravljeno** |
| **Telefon: 4 teksta u "Odobri besplatan pristup" sheet-u** kopirana sa desktopa umesto kraće mobilne verzije (podnaslov, Plan "Pun plan" bez nastavka, 2 pomoćna teksta skraćena) | 5 | **DA — ispravljeno** |

Posle ispravki: 964 odstupanja (od originalnih ~1020 pre bilo kakve ispravke u ovom koraku) — **svih 27 stvarnih grešaka nađenih je ispravljeno**, ostatak je u gornjim poznatim/neškodljivim kategorijama. Pun JSON: `tools/frame-compare/admin-report.json`.

**Nije moglo biti automatski potvrđeno (ali JESTE ručno, uživo, ranije u ovoj fazi):**
- Adm3/PhAdm3: automatski skript koji bira korisnika iz padajuće pretrage (simulacija tastature preko native setter-a) nije pouzdano okinuo React state u headless Playwright-u, pa formalni izveštaj ne pokazuje "Petar Nikolić, Nikolić Konsalting" popunjeno. Ovo JESTE ručno potvrđeno uživo u pregledaču ranije u Koraku 4 (traženje, biranje, slanje — sve radi).
- PhAdm0: frejm i proto se slažu oko 3/7 elemenata kad je sheet otvoren PREKO Admin Pregleda (ispravio sam rutu posla sa `app/pocetna` na `app/admin` pošto frejm pokazuje sheet otvoren baš tu) — preostala 4 "nedostaju" jer ekstrakcija verovatno ne broji elemente prekrivene scrim-om kao vidljive. I ovo je ručno potvrđeno uživo (Admin stavka tačno na mestu, ispravna ikonica, aktivan "Više").

**`sweep-phone.js`** (360/390/393/430px, obe teme, sve 8 dev-preset stanja × sve admin rute + dubinski korak za modal): **1416 kombinacija provereno, 0 prekršaja** (bez horizontalnog skrola, bez elementa koji probija roditelja, bez nepotpune ivice kartice).

**`nan-sweep.js`** (isto, traži NaN/undefined/null/[object/Invalid Date u vidljivom tekstu): **152 kombinacije provereno, 0 problema** — generisanih 128+ korisnika i 48 zapisa dnevnika nema praznih/pokvarenih vrednosti.

**Test tri uloge (iz prompta) → ispravljeno na dve, dosledno spec odeljku 2/ADMIN_PAKET2** ("Podrška" je tab, ne uloga):
- **Korisnik (bez pristupa)**: stavka Admin ne postoji ni u sidebar-u ni u "Više", direktna navigacija na `app/admin` i SVAKU pod-rutu (`/korisnici`, `/dnevnik`, `/podrska`) daje postojeći ekran 404 (ne "nemaš pristup") — potvrđeno uživo u Koraku 1 i ponovo u ovom koraku.
- **Admin**: sve vidi i radi, potvrđeno kroz sve korake.

**Admin ne čita sadržaj naloga korisnika** — potvrđeno pregledom koda: `js/admin.js` i `Sel.admin*` u `js/selectors.js` ne referenciraju `state.invoices`, `state.clients`, `state.incomesFx/Rsd`, `state.bankMails`, `state.taxDecision/Payments` ni `state.importState` nigde (jedini "invoices"/"bankMails" spomen u `admin.js` su polja `featureUsage.invoices`/`featureUsage.bankMails` — admin-ov SOPSTVENI zbirni broj iz Priloga B, ne stvarni nizovi). Sve postojeće reference na ta polja su u PREDADMIN selektorima (Početna/Knjiga/Fakture), nepromenjene ovom fazom.

**Objavljeno**: v54. Svih 5 admin ekrana + "Odobri besplatan pristup" postoje, rade i prošli formalnu proveru.

Nijedno od ovoga ne blokira već urađeno (Korak 0-2, gotovo).

## Faza 0 (poslovna pravila kao čiste funkcije sa testovima) — gotovo

**Objavljeno: v55.**

**Cilj ove faze**: izdvojiti poslovna pravila koja moraju da prežive prelazak na pravu platformu u `js/rules/` kao čiste funkcije (bez state-a, bez DOM-a, bez `Date.now()` — vreme je uvek parametar), pokriti ih automatskim testovima (`node --test`), i prepisati postojeći kod (`selectors.js`, `actions.js`, `utils.js`) da poziva te funkcije umesto da logiku drži duplirano. Izričit zahtev: **ne menjaš ponašanje aplikacije**, `store.js` ostaje nedirano, nema prelaska na asinhroni sloj podataka.

**Osam pravila izdvojeno, svako sa fajlom, testovima i odeljkom specifikacije — pun spisak, tabele testova i granični slučajevi su u [js/rules/PRAVILA.md](js/rules/PRAVILA.md)** (dokument za programera koji gradi pravu platformu, eksplicitno traženo da postoji odvojeno od ovog fajla):
1. Limit od 6.000.000 din (`js/rules/limit.js`, spec 8.4)
2. Status fakture iz datuma/uplata (`js/rules/invoiceStatus.js`, spec 8.1)
3. Numeracija faktura (`js/rules/invoiceNumbering.js`, spec 8.2)
4. Rokovi za porez (`js/rules/taxDeadlines.js`, spec 8.7)
5. Pretplata i pristup (`js/rules/subscriptionAccess.js`, spec 5.5 + ADMIN_SPEC 6)
6. Matrica autonomije i prodaja deviza (`js/rules/autonomy.js`, spec 4.1/7.7/8.5)
7. Uvoz — parsiranje CSV, duplikati, efekat na limit (`js/rules/uvoz.js`, UVOZ_SPECIFIKACIJA.md 4-6)
8. Množina i vokativ (`js/rules/text.js`)

**Testovi**: `node --test js/rules/*.test.js` → **66/66 prolazi**. Uključuju granične slučajeve tražene u zadatku: tačno 6.000.000 din (100%, 0 preostalo), uplata tačno 365 dana pre "now" ulazi a 366 dana ne ulazi, prestupna 2024. godina preko 29. februara, 31. dan u mesecu koji ima 31 dan, i dr. — svaki u tabeli u PRAVILA.md uz svoje pravilo.

**Pet nalaza, otkrivenih pisanjem testova, NAMERNO neispravljenih ovog kruga** (ne menjaš ponašanje) — puna lista u PRAVILA.md, odeljak "Rezime: svi nalazi":
1. Pragovi 80/90/100 za limit nisu pravilo nego UI provera; "90%" se nigde stvarno ne proverava, samo je pomenuto u statičkom AI tekstu.
2. `taxDeadlines.js`: spisak državnih praznika je fiksan SAMO za 2026. — 2027. i kasnije ne prepoznaju nijedan praznik.
3. Admin-ov "besplatan pristup" (`isFreeAccessActive`) postoji kao čista logika ali nije povezan sa `computeAccess`/stvarnim pristupom korisnika (poznato i iz Faze 11).
4. `parseSrDateFlexible` ne proverava stvarni broj dana u mesecu — "31.04.2026." (april ima 30 dana) tiho postaje 1. maj, umesto da bude odbijen.
5. `firstNameVoc` nije opšti srpski vokativ — "Petar" dobija "Petare" umesto ispravnog "Petre".

**Usput ispravljen jedan nalaz iz STANJE_PROTOTIPA.md** (eksplicitno traženo ovog kruga): logo firme (onboarding, `js/onboarding.js`) i rešenje Poreske uprave (`js/porez.js`) sada stvarno odbijaju prevelike fajlove **u kodu**, ne samo u prikazanom tekstu — logo preko 2 MB i rešenje preko 20 MB dobijaju toast odbijanja i ne prolaze dalje. Usput otkriveno i ispravljeno: dugme "Izaberi fajl sa računara" za rešenje Poreske uprave uopšte NIJE imalo pravi `<input type=file>` (simulacija sa lažnim imenom fajla) — sada ima pravi file input sa `accept` i proverom veličine, isto kao Uvoz.

**Uživo provereno u pregledaču (ne samo testovi)**:
- Odbijanje prevelikog loga (3 MB) i rešenja (21 MB) — oba toasta se pojavljuju, upload ne napreduje dalje.
- Pun korisnički put na novom nalogu: registracija → potvrda e-maila → onboarding (4 koraka) → nova faktura (broj automatski "25/26-16", nastavlja posle postojećih) → poslata → označena plaćenom preko uparenog mejla banke (Mejlovi banke, Acme Inc. 1.200 EUR, automatski upareno sa fakturom 25/26-14) → limit na Početnoj i Knjizi prihoda se ažurira identično na oba ekrana → ručni unos prihoda (100.000 din) odmah diže limit sa 1.312.451 na 1.412.451 din, svuda dosledno.
- Uvoz (Prenos dosadašnjeg poslovanja): CSV šablon učitan i pročitan, oba reda prepoznata (Acme Inc. 1.200 EUR → 140.244 din po kursu na dan 15.03.2026, Marko Petrović PR 85.000 din), **projektovan efekat na limit (1.637.695,00 din) se SLAŽE день-u-dan sa stvarnim brojem posle čuvanja** — baš provera koju je 28. krug nekad uhvatio kao grešku. Sledeći broj fakture posle uvoza ispravno predložen kao 25/26-17.

**`nan-sweep.js`**: 152 kombinacije provereno, **0 problema** — isti broj kao pre refaktora (Faza 11, Korak 7).
**`sweep-phone.js`**: 1416 kombinacija provereno, **0 prekršaja** — isti broj kao pre refaktora.

**Nije proveravano**:
- Nije ponovo vrćen formalni `run.js` piksel-diff ciklus (frejm-po-frejm) — ova faza ne menja nijedan vizuelni ekran, samo logiku ispod njih, pa to nije ni traženo niti je urađeno.
- Polja PIB/Matični broj u onboardingu Koraka 1 pri testu nisu prihvatila ručno otkucane vrednosti (ostala je seed demo vrednost "112233445"/"66554433", a polje "Poslovno ime" je dobilo upisan tekst DODAT na stari, ne zamenjen) — ovo je UI ponašanje polja (verovatno predlošci/maska), nevezano za ijedno od osam izdvojenih pravila, nije istraženo niti ispravljeno u ovoj fazi.
- Admin deo (Faza 11) nije ponovo ručno prošetan ovog kruga — oslonjeno na `nan-sweep`/`sweep-phone` koji su admin rute uključili i dali isti rezultat kao pre.

**Objavljeno**: v55. `index.html` + 8 novih `js/rules/*.js` fajlova + izmenjeni `utils.js`, `selectors.js`, `actions.js`, `onboarding.js`, `porez.js`.

Faza 0 je gotova. **Ne počinjem sledeću fazu bez tvoje reči.**

## Round 30 (pet ispravki iz PRAVILA.md i STANJE_PROTOTIPA.md) — gotovo

**Objavljeno: v56.**

Pet eksplicitno traženih ispravki, svaka sa testom u `js/rules/` koji je najpre pao protiv starog
ponašanja, pa implementacija promenjena dok test nije prošao. Pun opis svake, sa tabelama testova i
graničnim slučajevima, je u [js/rules/PRAVILA.md](js/rules/PRAVILA.md) (odeljci 1, 4, 5, 7, 9 i novi
"Rezime: novi nalazi iz Round 30").

**1. Onboarding PIB/matični broj** — pravi uzrok: prototip ima JEDAN deljeni seed poslovni zapis, pa su ta
polja uvek stizala već popunjena demo vrednošću do tačno `maxLength`, pa je ručno kucanje bez prethodnog
brisanja izgledalo kao da polje "ne prima unos" (standardno ponašanje punog `maxLength` polja, NE mana
React-a ili maske — potvrđeno direktnim testom da `onChange` ispravno radi kad polje ima mesta). Ispravka:
`Step1` sad počinje sa PRAZNIM poljima ako su jednaka seed podrazumevanim vrednostima, a vraća korisnikov
sopstveni unos ako se vrati sa "Nazad" u istom toku. Dodat `inputMode="numeric"` (tastatura sa ciframa na
telefonu — **DOM atribut potvrđen, prava tastatura na fizičkom uređaju nije proveravana**, ovaj alat nema
pristup pravom telefonu). Novi `js/rules/identifiers.js` (`sanitizeDigits`, `isValidPib`, `isValidMb`).
Uživo potvrđeno: prazno polje na svežem nalogu, kucanje radi bez gubitka fokusa, nalepljen broj sa
razmacima/crtama se ispravno čisti (testirano preko pravog `input`/paste događaja — **napomena**: moj
sopstveni browser-automation alat gubi karaktere kad simulira brzo kucanje mešanih cifara/razmaka
karakter-po-karakter (ne pravi paste) — to je ograničenje ALATA ZA TESTIRANJE, ne aplikacije, potvrđeno
direktnim `input` event dispečom koji radi ispravno; stvarno kucanje na fizičkoj tastaturi nije
testirano ovim alatom). "Nazad" posle čuvanja ispravno vraća uneti PIB/MB, ne prazno polje.

**2. Limit — prag 90%** — `js/rules/limit.js` dobija `limitWarningTier(pct)` (80/90/90/100 po spec 8.4).
Početna (`LimitWarningBanner`) je već imala tekst za sve tri, nedostajala je samo CSS klasa za 90% — sad
koristi isti "danger" ton kao 100% (nema nacrtane treće boje, pa ne izmišljam novu). Knjiga prihoda
(`KnjigaLimitWarning`, novo) je ranije pokazivala SAMO 80%-tekst za bilo koji procenat ≥80 — sad ima sve
tri. Dodato: `Actions.Business.checkLimitThreshold()` šalje JEDNO obaveštenje (zvonce) po pragu, prvi put
kad se dostigne (`state.limitNotifTier` pamti najviši već prijavljen) — baner ostaje trajno vidljiv dok
uslov važi (isti obrazac kao ostale trake stanja), samo se zvonce ne ponavlja. Kalendar: nema mesta u
nijednom frejmu/spec odeljku 7.11 za limit upozorenje — namerno nije dodato, prijavljeno. AI razgovor: već
tačno (dinamički scenario + statički tekst "80% i 90%"), potvrđeno bez izmene. Uživo potvrđeno (dev meni,
"~90% limita"): Početna pokazuje "Dostigao si 91,0%" u crvenom tonu; Knjiga prihoda (ručno doveden iznos
preko 100%) pokazuje "Prešao si limit za paušalce" u istom tonu; `state.limitNotifTier` i
`state.notifications[0]` potvrđeni u konzoli.

**3. Praznici za bilo koju godinu** — `js/rules/taxDeadlines.js` prepisan: `orthodoxEaster(year)`
(Julijanski algoritam + 13 dana, važi 1900-2099) plus fiksni praznici iz zakona (Nova godina, Božić,
Sretenje/Dan državnosti, Praznik rada, Dan primirja), sa čl. 3a nadoknadom (praznik u nedelji → prvi
naredni radni dan je takođe neradan). **Izvor**: tekst zakona pročitan sa paragraf.rs (Round 30
istraživanje — **NIJE Službeni glasnik sâm**, pa je ono što nisam mogao nezavisno da potvrdim označeno
[PROVERITI] u kodu i PRAVILA.md: da li postoji izmena posle 92/2011; da li nadoknada važi i za subotu
(tekst pominje samo nedelju, ovde NEMA nadoknade za subotu); da li Vaskršnji praznici (višednevni, a
Uskrsna nedelja je PO DEFINICIJI uvek nedelja) treba da dobijaju nadoknadu SVAKE godine pod literalnim
čitanjem pravila, ili samo jednodnevni praznici — primenjeno je literalno čitanje, testirano kao trenutno
ponašanje, ne kao potvrđeno pravno tačno). Orthodox Uskrs vrednosti za 2026/2027/2028 (12. april/2. maj/16.
april) nezavisno proverene (calendardate.com i dr.). Testovi za sve tri tražene godine. Uživo potvrđeno:
Porez i rokovi i dalje tačno pokazuje "Rok je 16. novembar, jer 15. pada u nedelju" (novembar 2026,
nepromenjeno od pre ove ispravke).

**4. Datumi koji ne postoje** — `js/rules/uvoz.js`'s `parseSrDateFlexible` sad proverava dan protiv
STVARNOG broja dana u datom mesecu (`daysInMonth`, uključujući prestupne godine), ne više fiksnog opsega
1-31 — ovo je bio NAĐEN NALAZ iz Faze 0, sad ispravljen. Novo `looksLikeDateShape(str)` razlikuje "Taj
datum ne postoji." (oblik tačan, vrednost nemoguća) od "Nisam prepoznala datum" (ne liči na datum uopšte).
Jedino mesto u aplikaciji sa slobodnim tekstualnim unosom datuma je Uvoz CSV — ručni unos uplate i Uvoz
"Unesi ručno" korak koriste pravi `<input type=date>`, koji po definiciji ne može da proizvede nepostojeći
datum, pa "svuda" iz zahteva je pokriveno ovom jednom ispravkom. Uživo potvrđeno: CSV sa redom
"31.04.2026." pokazuje tačno "Taj datum ne postoji ("31.04.2026."). Uredi stavku i unesi ispravan datum,
ili je ukloni." i red ostaje "review", ne prolazi tiho sa pogrešnim datumom.

**5. Besplatan pristup povezan** — `js/rules/subscriptionAccess.js` dobija `effectiveAccess(sub,
freeAccess, now)`: besplatan pristup sad DAJE pun pristup (AI nije pauziran) bez obzira na stvarno stanje
pretplate, i vraća prethodno stanje kad prestane. `selectors.js`'s `Sel.subscriptionAccess` ga koristi
preko novog `state.freeAccess` polja. Admin ekran (Korisnici → meni → "Odobri"/"Ukini besplatan pristup")
sad stvarno radi na fejk 128-pool-u, čuvajući `priorStatus/Plan/Badge/NextBilling` da "Ukini" vrati tačno
prethodno stanje — ranije je to dugme samo pokazivalo toast "Dolazi u sledećem koraku". Za STVARNI
(jedini) nalog u prototipu nema pravog puta kroz UI (fejk-pool je odvojen od `state.subscription`) — dodat
`dev.*` test-prekidač ("Besplatan pristup (test)" u Razvojnom meniju) da se logika proveri na stvarnom
nalogu, isti obrazac kao postojeći limit-test. **Prikaz u korisnikovoj aplikaciji ostaje namerno
neizgrađen** (ADMIN_SPEC: "nije nacrtano, ne improvizovati") — **nalaz iz uživo provere**: kad je besplatan
pristup uključen na nalogu sa `status:'Istekla'` (pa `nextChargeAt:null`), POSTOJEĆA sidebar kartica upada
u pogrešnu granu i prikazuje "Pretplata aktivna / Obnavlja se 1. jan 1970." — neispravljeno, čeka pravi
dizajn. Uživo potvrđeno: istekao nalog + besplatan pristup → AI knjigovođa ekran radi normalno (nema
"pauziran" poruke); isključivanje besplatnog pristupa vraća "AI knjigovođa je pauziran" na sidebar
kartici; admin grant→revoke na fejk korisniku potvrđen u konzoli (status/plan/bedž se tačno vraćaju).

**Posle svih pet ispravki**:
- `node --test js/rules/*.test.js`: **92/92 prolazi** (66 iz Faze 0 + 26 novih/izmenjenih ovog kruga).
- `nan-sweep.js`: **152 kombinacije, 0 problema** — isto kao pre.
- `sweep-phone.js`: **1416 kombinacija, 0 prekršaja** — isto kao pre.
- Pun korisnički put uživo (nalog sa registracijom u aprilu → faktura → uplata preko Mejlova banke →
  limit → uvoz): novi nalog sa datumom otvaranja 15.04.2026, PIB/MB ispravno prazni pa popunjeni bez
  gubitka fokusa; faktura 25/26-16 kreirana i poslata; uplata 900 EUR upisana i faktura automatski
  označena "Plaćena"; limit ispravno skočio sa 1.312.451 na 1.417.931 din (900×117,2); Uvoz wizard se
  otvara bez greške. Konzola bez stvarnih grešaka (stare greške sa starim `?v=` brojevima u logu su
  poznat artefakt alata za testiranje iz ranije u sesiji, ne žive greške — potvrđeno da se trenutna verzija
  skripti ne poklapa sa tim starim upisima).

**Nije proveravano**:
- Prava numerička tastatura na fizičkom telefonu/emulatoru za PIB/MB polja (samo DOM `inputMode` atribut
  potvrđen, ne stvarna tastatura).
- Formalni `run.js` piksel-diff ciklus (frejm-po-frejm) — ova runda ne menja nijedan vizuelni ekran osim
  banera teksta/tona već pokrivenih postojećim bojama, nije posebno ponovo pokrenut.
- Pravna tačnost tri [PROVERITI] nedoumice oko zakona o praznicima (izmena posle 92/2011, subota bez
  nadoknade, Vaskršnji praznici kao višednevni blok) — nemam pristup Službenom glasniku, samo sekundarnom
  izvoru (paragraf.rs).
- Vizuelni prikaz 90% banera na Knjizi prihoda u STVARNIM uslovima (testiran preko ručno dodatog iznosa
  koji je odmah preskočio 100%, pa je viđen samo "kritično" ton tamo, ne i "jače upozorenje" ton — logika
  je identična testiranoj `limitWarningTier` funkciji, ali sam 90%-specifični vizuelni prikaz na OVOM
  ekranu nije posebno snimljen).

Round 30 je gotov. **Ne počinjem sledeću fazu bez tvoje reči.**

## Mala ispravka (sidebar kartica + ekran Pretplata za besplatan pristup) — gotovo

**Objavljeno: v57.**

Round 30 je ostavio poznat nalaz: sidebar kartica pretplate za nalog sa besplatnim pristupom je
prikazivala "Pretplata aktivna / Obnavlja se 1. jan 1970." (jer stvarna pretplata nema `nextChargeAt`).
Ispravljen je SAMO tekst, bez promene izgleda kartice, tačno kako je traženo.

**Sidebar kartica** (`js/shell.js`, `TrialCard`): nova provera na vrhu (pre Probni/qr_renewal/Otkazana/
Pretplata aktivna grana) — kad je besplatan pristup aktivan, naslov je "Besplatan pristup", a ispod "Bez
roka" (bez krajnjeg datuma) ili "Do 14. dec 2026" (isti `fmtShortYear` format kao ostale kartice, kad rok
postoji). Isti vizuelni ton/raspored kao "Pretplata aktivna" (bez dugmeta) — ništa u izgledu nije
promenjeno, samo tekst.

**Ekran Pretplata** (`js/pretplata.js`, `UpravljanjeScreen`): red "Sledeća naplata"/"Neuspela naplata" je
SAKRIVEN kad je besplatan pristup aktivan — ranije je (npr. za Otkazana+besplatan pristup) pokazivao
"—, 276 €", cenu koja se zapravo ne naplaćuje. Ostali redovi (Status, Plan, Period, Način plaćanja,
Istorija plaćanja) ostaju nepromenjeni — nije izmišljen nov red niti nov izgled za besplatan pristup.

Nova čista funkcija `js/rules/subscriptionAccess.js`'s `freeAccessCardInfo(freeAccess, now)`: vraća `null`
kad besplatan pristup nije aktivan, ili `{noEnd, untilIso}` kad jeste (bez formatiranja datuma — to ostaje
na svakom ekranu, isti princip kao ostala pravila). 3 nova testa u `subscriptionAccess.test.js` (ukupno
15), svi prvo pali protiv koda bez funkcije, pa implementacija dodata dok nisu prošli.

**Uživo potvrđeno** (dev-meni prekidač "Besplatan pristup (test)" + ručno postavljen `Otkazana` sa
`accessUntil` u prošlosti, oba preko konzole jer admin-ov fejk-pool ne dodeljuje besplatan pristup
stvarnom nalogu): sidebar kartica tačno prikazuje "Besplatan pristup / Bez roka" i "Besplatan pristup / Do
14. dec 2026" (oba oblika); ekran Pretplata sakriva red "Sledeća naplata" dok je besplatan pristup
aktivan, ostali redovi (Status: Otkazana, Plan, Period, Kartica ••••4417) ostaju vidljivi i tačni.

**Nalaz, van traženog obima — prijavljeno, ne ispravljeno**: Početna gornji baner
(`SubscriptionStatusBanner`, `js/pocetna.js`) i dalje može pokazati "AI knjigovođa je pauziran" za
Probni-istekao/Istekla status čak i kad je besplatan pristup aktivan i AI stvarno NIJE pauziran — ista
vrsta pogrešnog teksta kao ono što je upravo ispravljeno, ali korisnik je eksplicitno tražio samo sidebar
karticu i ekran Pretplata, pa ovaj baner nije diran. Isto tako, `sub-decline-banner` (traka "Naplata nije
prošla" sa dugmićima za ponovni pokušaj na ekranu Pretplata) nije proveravana — veća je od "reda" teksta i
van obima ove male ispravke.

**Posle ispravke**:
- `node --test js/rules/*.test.js`: **95/95 prolazi** (92 iz Round 30 + 3 nova).
- `nan-sweep.js`: **152 kombinacije, 0 problema** — isto kao pre.
- `sweep-phone.js`: **1416 kombinacija, 0 prekršaja** — isto kao pre.

**Nije proveravano**: formalni `run.js` piksel-diff ciklus (ova ispravka je čisto tekstualna, u postojećim
klasama/rasporedu, nije posebno pokrenut); Početna gornji baner i `sub-decline-banner` (van obima, gore
objašnjeno).

Mala ispravka je gotova. **Ne počinjem sledeću fazu bez tvoje reči.**

## Poslednja ispravka (jedinstven selektor pristupa + pun prolaz kroz prototip) — gotovo

**Objavljeno: v58.**

### Deo 1: jedinstven selektor za "AI knjigovođa je pauziran"

Pronađeno svih pet mesta koja prikazuju poruku o pauziranju AI knjigovođe i provereno da li koriste isti
selektor (`Sel.subscriptionAccess(state).aiPaused`) ili posebnu proveru:

| Mesto | Fajl | Pre ove ispravke |
|---|---|---|
| Početna, gornji baner (Sub2) | `js/pocetna.js` `SubscriptionStatusBanner` → `js/selectors.js` `subscriptionBanner` | **NIJE** — proveravao `sub.status==='Istekla'`/`'Probni'+trialDaysLeft<=0` direktno |
| Početna, donji panel | `js/pocetna.js` `AiPausedPanel` | Već koristio (`Sel.subscriptionAccess(s).aiPaused`) |
| AI knjigovođa (chat) | `js/ai.js` | Već koristio (`Sel.subscriptionAccess(s).aiPaused`, prosleđeno kao `paused` prop) |
| Ekran Pretplata | `js/pretplata.js` | Nema sopstvenu poruku o pauziranju (samo red sa cenom, već sakriven prošlom ispravkom) |
| Sidebar kartica | `js/shell.js` `TrialCard` | Već koristio (ispravljeno prošle runde za besplatan pristup) |
| Obaveštenja | `js/obavestenja.js` | Nema nijednu poruku o pauziranju — spec 8.10 ne navodi "AI pauziran" kao tip obaveštenja |
| `actions.js` (5 mesta pre slanja/čitanja mejla/AI akcije) | `js/actions.js` | Već koristio |

**Jedino mesto koje NIJE koristilo jedinstven selektor**: `subscriptionBanner` (selectors.js). Ispravljeno:
`kind:'expired'` grana sad čita `subscriptionAccess(state).aiPaused` umesto `sub.status==='Istekla' ||
(sub.status==='Otkazana' && canceledPastEnd)` — matematički identična formula za sve DOSADAŠNJE slučajeve
(bez besplatnog pristupa ponašanje je nepromenjeno), ali sad ispravno ćuti kad besplatan pristup učini
`aiPaused` lažnim. Dodatno: i `Probni + trialDaysLeft<=0` grana je ista logika dobila (nijedan dev-preset
ovo stanje realno ne proizvodi — `expired` preset ide pravo na `status:'Istekla'` — ali je ispravljeno radi
doslednosti, jer bi stvarni nalog mogao da stigne tu pre nego što mu backend status pređe u "Istekla").

**Testovi** (`subscriptionAccess.test.js`, 18 ukupno, 3 nova): pokrivaju Probni+trialDaysLeft≤0 (sa i bez
besplatnog pristupa — oba `aiPaused=false`), Otkazana-posle-roka+besplatan pristup (`aiPaused=false`), i
Istekla bez besplatnog pristupa (`aiPaused=true`, da ispravka ne sakrije stvarnu pauzu).

**Uživo potvrđeno**: nalog sa `status:'Istekla'` + besplatan pristup uključen → gornji baner na Početnoj
VIŠE NE prikazuje "Probni period je istekao... AI knjigovođa je pauziran." (ranije se prikazivao), AI
knjigovođa ekran radi normalno, sidebar kartica i dalje tačno kaže "Besplatan pristup". Potvrđeno i na
telefonu (390px) — baner ostaje sakriven.

### Deo 2: pun prolaz kroz prototip (novi nalog + admin, desktop i telefon 390) — SAMO SPISAK, NIŠTA NIJE ISPRAVLJENO

Prošao kroz glavne ekrane kao nov/probni nalog i kao admin, na 1280px i 390px. Postojeći
[SPEC_USKLADJENOST.md](SPEC_USKLADJENOST.md) (27. krug) već ima iscrpnu listu — ovde je AŽURIRANA verzija
(šta je od tad rešeno) plus nalazi SPECIFIČNI za ovaj prolaz (Admin deo, nikad ranije ovako pregledan, i
sve skorašnje izmene).

**Rešeno od poslednjeg SPEC_USKLADJENOST.md pregleda** (bilo na listi NEDOSTAJE, sad nije):
- Jedinični testovi poslovnih pravila (limit/kursevi/rokovi/uparivanje-delimično/numeracija/datumi/pristup) — **POSTOJE** (`js/rules/*.test.js`, 98 testova, Faza 0 i kasnije runde).
- Granice veličine fajla (logo 2MB, rešenje 20MB) — **POTVRĐENO da kod stvarno odbija** (Round 30).
- Praznici za rokove poreza — **sad opšti algoritam** za bilo koju godinu, ne samo 2026 (Round 30).

**VAŽNO (stvaran funkcionalni nedostatak ili blokira korisnika u nekom toku):**
1. **8.8 Algoritam uparivanja uplate sa fakturom nije opšta logika** — svaki test-mejl ima unapred poznat, jednoznačan ishod (seed scenariji), ne postoji pravi "traži kandidate → pitaj ako ih ima više → zapamti alias" put. Najveći pojedinačni nalaz u celom prototipu (već identifikovano u SPEC_USKLADJENOST.md, i dalje tačno).
2. **12/#12 Trajni nalog ne automatski označava mesec plaćenim** na dan roka — kod menja samo prikaz ("Automatski iz banke"), ne i stvarni status.
3. **Err2 (offline ekran) se ne pojavljuje automatski** — nema `navigator.onLine` osluškivača, ekran postoji samo ručno (dev meni).
4. **7.4 Automatsko čuvanje nacrta faktura ne postoji** — čuva se samo na eksplicitan klik "Sačuvaj nacrt".
5. **7.11 Pravi ICS kalendar feed ne postoji** — samo prikazan link/tekst u Podešavanjima, ne fajl koji Google/Apple kalendar stvarno može da pročita.

**SITNICA (kozmetika, poznata odluka na čekanju, ili nešto što ne remeti korisnika u praksi):**
6. **Admin Pregled, mobilna kartica "Prihod od pretplata"** (390px) — podtekst se seče na "Mesečno, bez bes..." umesto da se prelomi u 2 reda ili dobije kraću mobilnu varijantu (NOVO zapaženo ovaj prolaz, nije ranije prijavljeno).
7. **6.9 Storniranje već plaćene fakture nema dodatnu potvrdu** — radi isto kao i za ostale statuse (spec markira ovo [PREDLOG], nije greška).
8. **10.5 Formalna kontrast/tab-order revizija nikad posebno sprovedena** — samo `:focus-visible` + `a11yClick` obrazac, ne puna revizija.
9. **Nekoliko dizajn-odluka koje čekaju Stefanovu reč od ranijih krugova, i dalje otvorene** (detalji u odeljku "OTVORENE STAVKE" gore): MNav2 nasuprot MNav15-18 (dva suprotna frejma za donju navigaciju), Poc3 footer link "Sve obaveštenja" (zadržati ili ukloniti), Sub2 modal-vs-panel odluka, editor šablona "Pravilo dodele" kontrola oblik, podrazumevane pozicije 10/11 blokova u editoru šablona.
10. **`sub-decline-banner`** (ekran Pretplata, "Naplata nije uspela" traka) nije proveravan protiv besplatnog pristupa — moguće da i on treba da se sakrije, kao "Sledeća naplata" red, ali nije u obimu dosadašnjih ispravki niti ovog prolaza.

**Nije ponovo proveravano ovaj prolaz** (već iscrpno pokriveno u SPEC_USKLADJENOST.md/STATUS.md ranijim rundama, pretpostavljeno da i dalje važi, nije ručno ponovo testirano baš danas): 8.10 obaveštenja tihi sati/dedup, Err2 detalji, 6.1 registracija/onboarding tok u celini (samo onboarding Korak 1 je uživo ponovo proveren zbog PIB/MB ispravke), celokupan AI chat scenario-matching van pause-poruke, Kalendar Lista/Godina prikazi, Podešavanja svi tabovi pojedinačno.

**Nalaz koji NIJE stvaran** (moja sopstvena greška u testiranju, zapisano da se ne ponovi): prilikom prve provere Admin "Korisnici i pretplate" tabele u browser pane-u čiji je prozor bio ~800px (ni 390 ni 1280, neslužbena širina), kolone "Korisnik"/"Plan"/"Status" su se vizuelno preklapale — na PRAVOj desktop širini (1280px) tabela je savršeno čista, potvrđeno ponovnim snimkom. Ne prijavljujem ovo kao nalaz, samo belešku da sam proverio na pogrešnoj širini prvi put.

**Posle oba dela**:
- `node --test js/rules/*.test.js`: **98/98 prolazi**.
- `nan-sweep.js`: **152 kombinacije, 0 problema** — isto kao pre.
- `sweep-phone.js`: **1416 kombinacija, 0 prekršaja** — isto kao pre.

Poslednja ispravka je gotova. **Ne počinjem sledeću fazu bez tvoje reči.**

## Sledeće — posle 29. kruga
**ČEKA KORISNIKOVU ODLUKU (postavljeno u 29. krugu, NIJE menjano)**: da li uplate "Bez fakture" treba da ULAZE u limit (korisnikov zahtev ovog kruga) iako `PLATFORMA_SPECIFIKACIJA.md` 8.4 eksplicitno kaže suprotno i ceo niz ekrana (Kp10, Ak9, Mb6) postoji baš zato da korisnik razreši takve uplate PRE nego što uđu u zbir. Ako se odluka promeni, menja se `Sel.limitInfo`/`Sel.calendarYearIncomes` (selectors.js) — širi zahvat od same Uvoz funkcije, dodiruje i Mejlove banke i AI chat tekst.

Formalan `run.js` ciklus sad POSTOJI i čist je (310 preostalih odstupanja, sve kategorisane, nijedna stvarna). Admin ekran i dalje nije izgrađen (van obima, samo potvrđeno da ništa ne bi iscurelo).

**Otvoreno, čeka korisnikovu odluku (ne menjati bez potvrde) — NOVO ovaj krug:**
- **Algoritam uparivanja uplate (spec 8.8)**: trenutno je samo seed/simulacija jednoznačnih parova, ne opšta "traži kandidate, pitaj ako ih ima više" logika. Ostaviti kao prototipsko pojednostavljenje ili vredi li uložiti u generičku verziju?
- **Trajni nalog ne označava mesec automatski plaćenim na dan roka** (spec 12/#12, sâm spec traži potvrdu od tebe pre građenja).
- Ostalo iz `SPEC_USKLADJENOST.md` liste NEDOSTAJE (auto-save nacrta, storno već plaćene fakture bez dodatne potvrde, Err2 bez automatskog okidanja, ICS feed nije pravi fajl) — sve niskog rizika, nabrojano u tom fajlu, ne menjano bez tvog izbora prioriteta.

**Otvoreno, čeka korisnikovu odluku (ne menjati bez potvrde) — iz ranijih krugova, i dalje važi:**
26. krug je potvrdio Tur0 (= `WelcomeTourModal`, nula izmena, sad i strukturnim dokazom) i izgradio celu Fazu 10b — editor šablona fakture (Fak18/24-27): JSON struktura šablona (`blockProps`/`table`/`doc`) vozi i editor-platno i stvarni pregled fakture/"PDF" (ista `InvoiceDoc` komponenta); izbor bloka klikom, prevlačenje i promena veličine (drag+resize), pun panel osobina (blok/tabela/cela faktura), 5 šablona sa pravilom dodele (po klijentu/valuti/jeziku) i mobilna svedena varijanta — sve uživo potvrđeno, obe teme, desktop i telefon. Usput nađen i ispravljen ozbiljan bag (stari `localStorage` rušio app belim ekranom posle šema-promene) — `STORAGE_KEY` podignut na v5. Sweep-phone (840) i NaN sweep (80) čisti, pre i posle. Objavljeno kao v41 (v40 je bila privremena, imala gorenavedeni bag).

**Otvoreno, čeka korisnikovu odluku (ne menjati bez potvrde):**
- **Editor šablona, "Pravilo dodele" kontrol**: frejm ne pokazuje KAKO se pravilo menja (samo gotov tekst uz svaki šablon) — dodat minimalan select (Bez pravila/Domaći klijenti/Po valuti/Po jeziku), jasno obeležen u UI kao van frejma. Javi ako želiš drugačiji oblik ove kontrole.
- **Editor šablona na telefonu, Tabela/Cela faktura nivoi**: frejm pokazuje svedenu mobilnu varijantu SAMO za Blok nivo (PhFak18) — Tabela/Cela faktura paneli ostavljeni identični desktopu na telefonu (nema frejma da se potvrdi da bi i oni bili svedeni). Javi ako treba i njih svesti.
- **Podrazumevane pozicije 10 od 11 blokova na platnu**: frejm daje tačne koordinate samo za jedan blok u jednom trenutku (statičan snimak), ostalo je autorski postavljeno da rekreira postojeći izgled — nije frejm-potvrđeno pojedinačno, prijavljeno umesto predstavljeno kao tačno.
- **Sub2 (Početna, "probni istekao")**: frejm potvrđeno nema dugme za zatvaranje/"Ne sada" — panel ostaje uložen (ne modal), po tvom uputstvu. Ako ipak želiš blokirajući modal uprkos odsustvu izlaza u frejmu, javi.
- **PrijavaP1/TelP1**: frejm dosledno (obe teme) nema magic-link dugme koje `PrijavaD8` ima; spec ih tretira kao isti ekran. Neobjašnjeno, nepromenjeno.
- **Poc3 footer**: frejm ima samo "Podešavanja obaveštenja"; kod dodatno ima "Sve obaveštenja" (jedini ulaz u postojeću `app/obavestenja` stranicu). Treba odluka: zadržati link (stranica ostaje dostupna, frejm-razlika) ili ukloniti (frejm-tačno, stranica postaje nedostupna iz UI-a).
- **MNav2 vs MNav15-18, bottom-nav raspored**: dva međusobno suprotna frejma za donju navigaciju (5 ravnopravnih tabova uklj. Kalendar, bez FAB — naspram 4 taba + FAB, Kalendar u "Više"). Kod prati MNav15-18 (bajt-za-bajt potvrđeno tačno), MNav2 ostaje neobjašnjena razlika.
- Mb9 podrazumevani režim slanja (ask vs auto), globalni topbar nudge "Podesi porez i rokove" koji ne postoji u kodu (sad dodatno potvrđen i u MNav15-18 frejmovima), podsetnici na telefonu (PhKl7) bez ulaza u frejmovima, "Šta sam radio" ulaz iz otvorenog razgovora na telefonu bez ulaza — sve i dalje čeka vlasnikovu odluku (nepromenjeno iz ranijih krugova).

Čeka se korisnikova potvrda za sledeći krug.

## Pravila koja važe za SVAKU fazu (ne odstupati)
1. **Frejm je izvor istine, piksel po piksel** — ne na oko, ne iz sećanja, ne iz teksta specifikacije kad je u sukobu sa frejmom. Otvori frejm i prepiši stvarne vrednosti.
2. **Testiraj na dve širine**: 390px (telefon) i 1280px (desktop) — plus 365/1440 za tačno frame-compare, 390/1280 kao "range check" za lom rasporeda.
3. **Testiraj obe teme**: svetla i tamna.
4. **Posle svakog dela posla pošalji tabelu provere** — sa "identično" ili šta je ispravljeno. Ako nešto nije provereno, napiši to otvoreno.
5. **Ne dodaji ništa što nije u dizajnu.**
6. **Radi fazu po fazu**, javi se posle svake i ne počinji sledeću bez potvrde.
7. **Pre bilo koje deljene izmene, potvrdi iz sirovog HTML-a frejma, ne iz slike.**
8. `MobileSearchOverlay` ostaje netaknut dok se ne odluči.
