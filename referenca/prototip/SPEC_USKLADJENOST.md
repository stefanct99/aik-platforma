# Usklađenost prototipa sa PLATFORMA_SPECIFIKACIJA.md

Faza 10, 27. krug (završna provera), Korak 1. Prolazak kroz spec sekciju po sekciju (0 do 12 + Prilozi), status svakog pravila ponašanja, oznake [ODLUČENO], toka i granice.

**Oznake:**
- **IMPLEMENTIRANO** — radi u prototipu i provereno uživo (ili potvrđeno direktno u kodu ovaj krug), ponaša se kako spec traži, u granicama onoga što jedan Artifact bez pravog servera može da uradi.
- **SIMULIRANO** — UI/tok postoji i izgleda/radi kao u spec-u, ali iza toga nema pravog spoljnog sistema (mejl, OCR, plaćanje, LLM, NBS servis) — ponašanje je unapred pripremljeno/deterministički odglumljeno, ne stvarno izvedeno.
- **NEDOSTAJE** — nije izgrađeno uopšte (ni UI ni logika), ili je eksplicitno van obima prototipa po samoj specifikaciji (11.1).

Ova tabela ne ponavlja piksel-po-piksel proveru izgleda (to je posao `tools/frame-compare`, videti STATUS.md) — bavi se SAMO ponašanjem/funkcijom.

---

## 0. Kako se koristi dokument

Nije primenjivo na prototip (uputstvo za Claude Code, ne funkcija aplikacije).

## 1. Proizvod

| Stavka | Status | Napomena |
|---|---|---|
| 1.3 "svaki ekran vodi ka jednoj odluci" (ton teksta) | IMPLEMENTIRANO | Tekstovi dosledno prate ton (vidi i18n.js), potvrđeno kroz sve dosadašnje krugove frame-compare. |
| 1.4 Granice (nije za d.o.o./PDV, ne čita inbox, ne plaća, nije opšti chat) | IMPLEMENTIRANO (kao UI/poruke) | Chat eksplicitno odbija van-temske upite (Ak6 scenario, vidi 7.12 ispod); nema PDV logike (uvek 0); nema e-banking polja nigde u kodu (grep potvrđuje — nema `password`/`iban` polja za bankarski pristup). |
| 1.5 Ime je konfiguracija ("tvoj AI knjigovođa" / "Fakturica") | NEDOSTAJE | Ime je hardkodovano u markup-u/i18n stringovima, ne u jednom konfig polju. Nema funkcionalni uticaj u prototipu (nije ni traženo da bude promenljivo u UI), ali tehnički ne postoji "konfiguracija" sloj. |
| 1.6 Svetla/tamna tema | IMPLEMENTIRANO | Potvrđeno kroz doslovno svaki dosadašnji krug (23 kruga poliranja), uključujući sistemsko ("Kao na uređaju"). |
| 1.6 "Svaki ekran ima 4 stanja: prazno, učitavanje, greška, uspeh" | DELIMIČNO — videti Korak 2 ovog izveštaja za prazna stanja pojedinačno; "učitavanje" postoji mestimično (Rez3 progres, AI `kind:'loading'`, dugme "Prijavljivanje..."), posebna skeleton-učitavanja NISU izgrađena za većinu listi (Fakture/Knjiga/Mejlovi se učitavaju trenutno jer su podaci lokalni, nema mrežnog kašnjenja da se simulira) — NEDOSTAJE kao opšti obrazac, ali i nije stvarno potrebno u klijentskom prototipu bez mreže. |

## 2. Rečnik pojmova

Nije posebna funkcija — pojmovi se koriste dosledno kroz app (Limit, Priliv, Čeka tebe, itd.), svi prisutni u UI tekstu gde spec traži.

## 3. Domenski model

| Entitet | Status | Napomena |
|---|---|---|
| 3.1 Korisnik/Firma | IMPLEMENTIRANO | `store.js` `business`/`user` polja prate spec (PIB, MB, šifra delatnosti, adresa, logo polje postoji ali upload nije pravi fajl-čuvar — SIMULIRANO za sam upload). |
| 3.2 Računi firme | IMPLEMENTIRANO | Proizvoljan broj, bilo koja valuta, "podrazumevani za fakture u ovoj valuti" — radi (`Pd2`/`Pd10`, 24.-26. krug potvrđeno uživo). |
| 3.3 Klijent | IMPLEMENTIRANO | Svi navedeni atributi postoje i koriste se (`Fak6/7/28`). |
| 3.4 Faktura | IMPLEMENTIRANO | Svi atributi, uključujući 5 statusa i istoriju događaja. Šablon izgleda sad pun JSON (26. krug). |
| 3.5 Ponavljajuća faktura | IMPLEMENTIRANO | Polja i generisanje postoje (`js/actions.js Recurring`, videti 6.8/8.9 ispod za dnevni "posao"). |
| 3.6 Uplata/Prihod | IMPLEMENTIRANO | `incomesFx`/`incomesRsd`, kurs/izvor/vrsta sve postoji; "ne ulazi u zbir dok se ne poveže" potvrđeno (Kp10). |
| 3.7 Mejl banke | IMPLEMENTIRANO (struktura) / SIMULIRANO (prijem) | Statusi i istorija radnji tačno prate spec; sam PRIJEM mejla je simuliran (dev-meni dugme, ne pravi inbound email servis — videti 9). |
| 3.8 Dokumenta za banku | SIMULIRANO | Tri tipa dokumenta se prikazuju kao HTML pregled (DocTemplate), ne kao pravi PDF fajlovi (nema servera koji renderuje). |
| 3.9 Rešenje i mesečne obaveze | IMPLEMENTIRANO (tok) / SIMULIRANO (čitanje) | Upload+"čitanje" postoji kao tok, ali "AI čita rešenje" je unapred pripremljen odgovor (seed brojevi), ne pravo OCR/LLM čitanje fajla. |
| 3.10 Kalendar događaj | IMPLEMENTIRANO | Svi tipovi (Država, Dospeva, Kasni, Ponavljajuća, Ručni) generišu se iz stvarnog stanja (`calendarEventsForMonth`). |
| 3.11 AI razgovor/radnja | IMPLEMENTIRANO (struktura) / SIMULIRANO (sadržaj odgovora) | Conversation/Message/AIAction postoje i rade; sami odgovori su scenario-matching (`matchScenario`+`AI_SCENARIOS`), ne pravi LLM poziv. |
| 3.12 Pretplata | IMPLEMENTIRANO (tok) / SIMULIRANO (naplata) | Svi statusi/planovi/periodi rade; naplata kartice/QR je odglumljena (nema pravog procesora plaćanja). |
| 3.13 Obaveštenja | IMPLEMENTIRANO | Tip/naslov/tekst/vreme/pročitano + podešavanje po kanalu postoji; sam kanal "mejl"/"push" ne šalje ništa stvarno van app-a (SIMULIRANO za dostavu, app-notifikacija je prava). |

## 4. Najvažnija pravila ponašanja

| Pravilo | Status | Napomena |
|---|---|---|
| 4.1 Matrica autonomije (tabela) | IMPLEMENTIRANO | Svaki red proveren uživo u ranijim krugovima (18. krug: automatsko slanje globalno/po klijentu; AI radnje samo na klik — `runMessageAction`). "Ništa se ne izvršava bez klika" potvrđeno kodom (nijedna radnja se ne zove iz renderovanja, samo iz onClick). |
| 4.2 "1 uplata = 1 faktura", pun iznos je merilo | IMPLEMENTIRANO | `U.invoiceTotal`/uparivanje po punom iznosu, provizija banke nije posebno modelovana (nema polja za nju) — NEDOSTAJE kao posebna stavka, ali pravilo "pun iznos je merilo" samo po sebi važi jer provizija nigde ne postoji da bi ga narušila. |
| 4.3 Devizni vs dinarski priliv | IMPLEMENTIRANO | Različiti tokovi potvrđeni (19. krug Mejlovi banke, Mb10 dinarski). "Promet i izvodi" tab — NEDOSTAJE (spec sam kaže nije nacrtan, 12/#1), izvod se prilaže kroz AI chat (Ak7) — IMPLEMENTIRANO tačno kako spec traži za v1. |
| 4.4 Limit se uvek vidi (Početna/Knjiga/Kalendar/chat) | IMPLEMENTIRANO | Potvrđeno na sve 4 lokacije; chat prikazuje preko `Ak2`-stil kartice kad se pita (scenario "limit"). |
| 4.5 Format brojeva/datuma/jezik | IMPLEMENTIRANO | `U.fmtMoney`/`U.fmtDate`, 3 jezika aplikacije + 2 jezika fakture nezavisno. |
| 4.6 Obeležavanje AI rada, "Vrati" | IMPLEMENTIRANO | `Ak8` panel, radnje sa "Vrati" linkom gde je primenjivo. |
| 4.7 4 stanja svakog ekrana | Videti 1.6 iznad i Korak 2 (prazna stanja) | Greška cele stranice (Err1/Err2) — IMPLEMENTIRANO kao rute (`err-404`,`err-offline`), ali Err2 "Nema veze sa internetom" nema stvaran network-status osluškivač (`navigator.onLine`) koji bi je AUTOMATSKI prikazao — NEDOSTAJE auto-okidanje, ekran sam postoji i dostupan je ručno (dev meni). |
| 4.8 "Nikad nisam siguran" | SIMULIRANO | Pošto je AI odgovor scenario-matching, "nikad nisam siguran" je trivijalno tačno (nema modela koji bi to rekao), ne dokazuje da bi pravi LLM prošao ovo pravilo. |
| 4.9 Bezbednost (korisnik vidi samo svoj nalog, admin bez pristupa, brisanje) | NEDOSTAJE (N/A za arhitekturu) / IMPLEMENTIRANO (brisanje) | Nema pravih korisnika/multi-tenant pa "samo svoj nalog"/"admin pristup" nije ni primenjivo na jedan Artifact bez servera. Brisanje naloga (6.12) IMPLEMENTIRANO uživo (IZBRISI potvrda, `deleteAccount()`). |

## 5. Struktura aplikacije i navigacija

| Stavka | Status | Napomena |
|---|---|---|
| 5.1 9 glavnih sekcija + van-prijavljeni deo | IMPLEMENTIRANO | Sve 9 postoje i rade (uključujući Pretplata kao poseban ekran iz trake/Podešavanja). |
| 5.2 Desktop raspored (264px meni, gornja traka, kartice) | IMPLEMENTIRANO | Potvrđeno piksel-po-piksel kroz frame-compare (18.+ krug sidebar sticky fix). |
| 5.3 Telefon raspored (donja traka 5 stavki, "Više" sheet) | IMPLEMENTIRANO | 21.-26. krug, uključujući stvarni telefon (360-430px) ciklus. |
| 5.3 "Nema funkcije koja postoji samo na jednom uređaju" | DELIMIČNO | Pretraga na telefonu i "Šta sam radio" iz otvorenog razgovora na telefonu nemaju ulaz (poznato, čeka vlasnikovu odluku — vidi STATUS.md), kao i Kalendar "Podsetnici" na telefonu (frejm sam ne pokazuje ulaz, PhKl7 nedostupan sa UI-a) — sve 3 stavke eksplicitno ostavljene netaknute po ovoj rundi uputstva. |
| 5.4 Pretraga (gornja traka) | IMPLEMENTIRANO | `SearchResults`, grupisano po tipu (fakture/klijenti/uplate/mejlovi), klik vodi na detalj. Prečica `/`/`Cmd+K` — NEDOSTAJE (spec je markira [PREDLOG], nije traženo da bude obavezno). |
| 5.4 Zvonce (obaveštenja) | IMPLEMENTIRANO | Lista, nepročitana istaknuta, klik vodi na ekran, "Označi sve kao pročitano" (potvrđeno 25. krug dugmad/boje). |
| 5.4 Traka probnog perioda / upozorenje / istekao / QR-ističe baner | IMPLEMENTIRANO | Sub1/Sub2/Sub12 svi postoje i testirani (24.-26. krug). |
| 5.4 Vodič kroz aplikaciju (Tur0-4) | IMPLEMENTIRANO | Izgrađeno 25.-26. krug, potvrđeno uživo obe teme/uređaja, "Preskoči" i ponovno pokretanje iz "Pomoć i vodič" rade. |
| 5.4 "?" tooltip ikonice (Tip1/Tip2) | IMPLEMENTIRANO | Potvrđeno u ranijim krugovima (Početna ciklus). |
| 5.4 Pomoć (link) | DELIMIČNO | Link "Pomoć" postoji u prijavi/onboardingu; "Podrška preko AI pomoći pa preko ljudi" — kontakt forma za ljude NEDOSTAJE (spec sam kaže [PREDLOG: v1 samo mejl podrške], ni mejl-podrška link nije posebno izgrađen van opšteg "Pomoć" linka). |
| 5.4 Prečice tastature (N, G pa H) | NEDOSTAJE | Spec markira [PREDLOG, nije u dizajnu] — nije ni očekivano da bude urađeno. |
| 5.5 Kontrola prava po stanju naloga (tabela) | IMPLEMENTIRANO | Svih 7 stanja postoji u dev meniju i ponaša se po tabeli — opsežno provereno (Mejlovi banke 18.-19. krug: expired blokira čitanje/slanje; subscriptionAccess selektor pokriva sve redove). |

## 6. Glavni tokovi (end-to-end)

Detaljan uživo test je u Koraku 3 ovog izveštaja. Ovde je po-pravilo pregled:

| Tok | Status | Napomena |
|---|---|---|
| 6.1 Registracija→email→onboarding→prva faktura | IMPLEMENTIRANO (UI tok) / SIMULIRANO (slanje mejla) | Svi ekrani/koraci postoje i funkcionišu redom (uključujući "onboarding je prekidiv" — `onboardingStep` se čuva). Pravi mejl za potvrdu se ne šalje (nema inbound/outbound servisa) — korisnik "glumi" klik kao da je mejl stigao (dev-meni/auto-advance). |
| 6.1 korak 8, Vodič se pokreće jednom | IMPLEMENTIRANO | `dev.tourSeen`/`tourStep` logika, potvrđeno 25.-26. krug. |
| 6.2 Dodavanje rešenja (3 načina, čitanje, provera, greška PIB, ručni unos, uspeh, novo rešenje) | IMPLEMENTIRANO (tok) / SIMULIRANO (OCR čitanje) | Sve grane postoje (`Rez2/3/4c/5/6b/PorOk/PorNov`, 18.-19. krug potvrđeno). "Čitanje" je tajmer+seed brojevi, ne pravi OCR. Greška PIB grana radi (poredi uneti PIB sa seed PIB-om — simulirano ali ponašanje tačno). |
| 6.3 Mesečno plaćanje (QR/trajni nalog) | IMPLEMENTIRANO (UI+status) / SIMULIRANO (QR, plaćanje) | "Označi kao plaćeno" ručni tok radi tačno; QR kod je dekorativan hash-uzorak, NE SKENIRA SE (spec 12/#18 to already priznaje). Trajni nalog menja prikaz u "Automatski iz banke" (`taxPaymentMode`) — ali SIMULIRANO (ne postoji pravi trajni nalog u banci, i spec 12/#12 traži auto-označavanje na dan roka kad je izabran trajni nalog — ovo NEDOSTAJE, mesec se i dalje mora ručno označiti čak i u "automatski" režimu, nije pronađen kod koji bi to radio sam). |
| 6.4 Pravljenje i slanje fakture | IMPLEMENTIRANO (tok) / SIMULIRANO (slanje mejla, PDF) | Svi koraci/validacije rade; "Pošalji fakturu" samo menja status (nema pravog mejla), PDF prilog je uvek isti toast "PDF je preuzet." bez fajla. |
| 6.5 Devizni priliv kraj-do-kraja (najvažniji tok) | IMPLEMENTIRANO (logika nakon simuliranog prijema) | `BankMails.simulateNewMail` + `approveSend` realno menjaju fakturu/knjigu/limit (18. krug brojevima potvrđeno). Sam "banka šalje mejl" korak 1 je uvek simulacija (dev dugme), nikad pravi inbound mejl — to je arhitekturno neizbežno za ovaj prototip (nema email servera), iskreno već dokumentovano u STATUS.md. |
| 6.6 Problem: priliv bez fakture i izuzeci | IMPLEMENTIRANO | Sve 3 opcije (napravi fakturu/poveži/odbaci) uživo isprobane do kraja (18. krug). `Mb7` "nije standardan obrazac" tok — IMPLEMENTIRANO (postoji "Odgovori banci" sa prilogom i slanjem, simulirano slanje). |
| 6.7 Kasna faktura i podsetnik | IMPLEMENTIRANO | Status izveden iz datuma (ne ručan), podsetnik tok radi (simulirano slanje), "Kad faktura kasni" podešavanje postoji ali NE OKIDA STVARNO ponavljano slanje (nema pozadinskog posla u klijentskom app-u) — SIMULIRANO/NEDOSTAJE za automatski ponovljeni podsetnik na 7 dana. |
| 6.8 Ponavljajuće fakture | IMPLEMENTIRANO (CRUD) / NEDOSTAJE (pravi dnevni posao) | Lista/forma/pauza/nastavi/obriši sve rade. "Dnevni posao u 07:00" (8.9) koji stvarno generiše fakturu na datum — NE POSTOJI (nema pozadinskog cron-a u browseru) — generisanje na stvaran datum je NEDOSTAJE, ovo je arhitekturno očekivano za klijentski prototip. |
| 6.9 Storniranje i duplikat | IMPLEMENTIRANO | `VoidModal`, dupliranje pravi nov nacrt sa novim brojem. "Dodatna potvrda za već plaćenu fakturu" [PREDLOG] — NEDOSTAJE (nije posebno blokirano/upozoreno, storniranje plaćene fakture radi isto kao i drugih statusa) — vredi prijaviti, nije greška nego neprimenjen PREDLOG. |
| 6.10 Pretplata (probni→plan→plaćanje→upravljanje→otkazivanje) | IMPLEMENTIRANO (tok) / SIMULIRANO (naplata) | Svi ekrani/statusi rade i testirani (23.-24. krug), uključujući 3DS/odbijeno/QR. Stvarnog procesora plaćanja nema (očekivano, spec 9 to i kaže). |
| 6.11 Pitanje AI knjigovođi (8 pod-tačaka) | IMPLEMENTIRANO (UI/tokovi) / SIMULIRANO (sami odgovori) | Sve 4 vrste odgovora postoje kao scenariji, radnja-sa-potvrdom radi (klik izvršava), prilozi (Ak7) rade, istorija (Ak8), proaktivni AI (Ak11, "najviše jednom dnevno" — `aiProactiveShownDate` postoji), kvota (Ak14, 20/dan probni) — sve potvrđeno u 22. krugu i dalje važi. Odgovori SAMI nisu iz pravog LLM-a — scenario-matching na ključne reči, pa odgovor na pitanje van pokrivenih scenarija pada u generičku granu, ne u stvarno razumevanje. |
| 6.12 Brisanje naloga i izvoz | IMPLEMENTIRANO (brisanje) / SIMULIRANO (izvoz) | Brisanje sa IZBRISI radi. Izvoz (ZIP/CSV/PDF paket) je samo toast, ne pravi fajl — SIMULIRANO. |

## 7. Ekrani — zbirno po sekciji

(Detalji izgleda su već u STATUS.md kroz frame-compare cikluse; ovde samo PONAŠANJE koje taj alat ne meri.)

| Sekcija | Status | Napomena |
|---|---|---|
| 7.1 Prijava/registracija/greške | IMPLEMENTIRANO (logika) / NEDOSTAJE (2FA, prave sesije) | Zaključavanje posle 5 pokušaja (15 min) — IMPLEMENTIRANO i uživo proverljivo (`loginAttempts`/`lockedUntil` u actions.js). Dvostepena prijava — prekidač POSTOJI u UI (Pd6) ali NEMA stvaran kod-unos ekran niti efekat na login tok — spec sam kaže "u prototipu opciono, ekran nije nacrtan" (12/#9), pa je ovo očekivano NEDOSTAJE, ne greška. Sesija "30 dana uz klizno produžavanje" — NEDOSTAJE (nema stvarnog isteka sesije uopšte, `loggedIn` ostaje true dok se ručno ne odjavi — ovo je BLAŽE od spec-a, ne strože, pa ne remeti testiranje, ali je tehnički netačno). |
| 7.2 Početna | IMPLEMENTIRANO | Sve stavke (kartica Počni ovde, limit, Čeka tebe, poslednje uplate, nadolazeći rokovi, upozorenje limita) rade sa pravim izvedenim podacima. |
| 7.3 Fakture: lista | IMPLEMENTIRANO | Filteri/čipovi/padajući/meni po redu rade. Sortiranje po koloni i paginacija/beskonačno skrolovanje — NEDOSTAJE (spec markira [PREDLOG], seed ima malo faktura pa nije ni primetno potrebno). |
| 7.4 Nova faktura i uređivanje | IMPLEMENTIRANO | Uključujući editor šablona (26. krug, puna funkcija). "Broj se rezerviše tek pri slanju/čuvanju" — IMPLEMENTIRANO (`IA.create` dodeljuje broj tek pri prvom čuvanju, ne pri otvaranju forme). Automatsko čuvanje "svakih nekoliko sekundi" — NEDOSTAJE (čuva se samo na eksplicitan klik "Sačuvaj nacrt", nema periodičnog auto-save tajmera) — vredi prijaviti kao propušten [PREDLOG] iz 7.4. |
| 7.5 Pregled fakture | IMPLEMENTIRANO | Sve akcije po statusu, sve 3 sekcije (Detalji/Istorija/Uplata) + "Kako je klijent vidi". |
| 7.6 Klijenti/Ponavljajuće/Editor šablona | IMPLEMENTIRANO | Editor šablona sad pun (26. krug) — jedini deo faze 10b koji je bio otvoren, sad zatvoren. |
| 7.7 Mejlovi banke | IMPLEMENTIRANO (tok) / SIMULIRANO (prijem) | Vidi 6.5/6.6 iznad. |
| 7.8 Porez i rokovi | IMPLEMENTIRANO (tok) / SIMULIRANO (čitanje) | Vidi 6.2/6.3. |
| 7.8a Godišnji poreski obračun (PPDG) | NEDOSTAJE | Spec sam kaže van v1 ([PREDLOG: kasnija faza]) — nije greška. |
| 7.9 Knjiga prihoda | IMPLEMENTIRANO (prikaz) / SIMULIRANO (izvoz) | Sve tabele/filteri/detalj/ručni unos rade; izvoz je toast bez fajla. |
| 7.10 Uplata bez fakture | IMPLEMENTIRANO | Potvrđeno u 18. krugu do kraja (sve 3 grane + AI objašnjenje). |
| 7.11 Kalendar | IMPLEMENTIRANO (tok) / NEDOSTAJE (ICS feed, mobilni Podsetnici ulaz) | Mesec/Lista/Godina/izabran dan/označi plaćeno sve rade. Pretplata na kalendar (ICS token) — tekst/link postoji u Podešavanjima (`calLink`), ali NEMA stvarnog ICS fajla/feed-a koji bi Google/Apple kalendar mogao da pročita (nema servera) — SIMULIRANO (prikazuje se link, ne radi kao pravi feed). Mobilni ulaz u Podsetnike — NEDOSTAJE po frejmu samom (poznato, čeka odluku). |
| 7.12 AI knjigovođa | IMPLEMENTIRANO (UI) / SIMULIRANO (model) | Vidi 6.11. |
| 7.13 Podešavanja (7 tabova) | IMPLEMENTIRANO | Svi tabovi rade uključujući pregled ekran (Pd0, 23. krug). |
| 7.14 Pretplata | IMPLEMENTIRANO (tok) / SIMULIRANO (naplata) | Vidi 6.10. |
| 7.15 Pomoćni ekrani/mobilni specifikum | DELIMIČNO | Zvonce/pretraga/vodič/Više sve rade. Kamera za fotografisanje rešenja na telefonu, "Podeli" za PDF, deep-link ka bankarskoj app za QR, povlačenje-za-osvežavanje, prava push obaveštenja — SVI NEDOSTAJU (svi zahtevaju pravu mobilnu/PWA platformu ili pravi fajl/push servis, nijedan nije moguć u ovom Artifact-kontekstu; spec za push sam kaže "zahteva PWA ili nativnu aplikaciju", 7.15/10). |

## 8. Poslovna pravila (detaljno)

| Pravilo | Status | Napomena |
|---|---|---|
| 8.1 Statusi fakture i prelazi (tabela) | IMPLEMENTIRANO | Svi prelazi potvrđeni kroz `U.invoiceEffectiveStatus`, uključujući "Plaćena→Poslata/Kasni" pri brisanju uplate (potvrđeno Kp8 flow). "Kasni" izveden dnevno u "00:05 po vremenu Srbije" — SIMULIRANO (izvedeno pri svakom renderu iz `TODAY`/trenutnog datuma, ne pravim ponoćnim poslom — ali rezultat je identičan jer nema realnog proticanja vremena u prototipu osim kroz `Seed.TODAY`). |
| 8.2 Numeracija faktura (format, rezervacija broja, storno zadržava broj) | IMPLEMENTIRANO | Format `25/26-15` dosledan; broj se vraća u niz samo ako je nacrt bio poslednji (nije posebno testirano ovaj krug — vidi Korak 3). |
| 8.3 Kursevi (srednji NBS na dan uplate, čuva se, poslednji za vikend) | SIMULIRANO | `nbsRate()` je deterministička pseudo-funkcija (komentar u kodu to i kaže), ne pravi NBS servis — ali ponašanje (kurs se čuva uz uplatu, nepromenljiv posle upisa osim ručne izmene) je IMPLEMENTIRANO tačno. |
| 8.4 Limit 6.000.000 din (klizno 12 meseci, 80/90/100%, projekcija) | IMPLEMENTIRANO | `limitInfo` selektor, projekcija i prag upozorenja potvrđeni brojevima u ranijim krugovima. Iznos je konfigurabilan konstantom (nije hardkodovan duboko u logici) — IMPLEMENTIRANO kao "podesiv", mada nema posebnog UI podešavanja za njega (nije ni traženo). |
| 8.5 Prodaja deviza (3 režima, globalno/po klijentu) | IMPLEMENTIRANO | Potvrđeno 18. krug (12 uzastopnih simulacija dokazale tačno ponašanje izuzetka po klijentu). |
| 8.6 Knjiga prihoda sadržaj/izvoz | IMPLEMENTIRANO (sadržaj) / SIMULIRANO (izvoz) | Sadržaj tabele ima sve tražene kolone; izvoz je toast. |
| 8.7 Rokovi za porez (15./pomeranje, 4 stavke, QR) | IMPLEMENTIRANO (datumi) / SIMULIRANO (QR, šema računa) | Pomeranje radnog dana IMPLEMENTIRANO i uživo potvrđeno (20. krug, 16. umesto 15. novembra). Račun/poziv na broj su seed-vrednosti (nije implementirana prava šema generisanja po PIB-u — spec sam kaže to je [PROVERITI]/[PREDLOG da se čita iz rešenja], pa je ovo prihvatljivo za prototip). QR slika je dekorativan hash (spec 12/#18 to već priznaje kao poznato). |
| 8.8 Uparivanje uplate sa fakturom (algoritam) | SIMULIRANO | Seed mejlovi banke su UNAPRED dodeljeni tačno određenoj fakturi/ishodu (bm1...bm6 u `seed.js`) — ne postoji opšti algoritam koji bira između VIŠE kandidata po iznosu+valuti+imenu za bilo koji nov mejl. `simulateNewMail` kreira tačno jedan jednoznačan par (nova faktura+klijent), pa grana "više kandidata ILI nijedan" (tačka 4/5 iz 8.8) nikad se stvarno ne testira generičkim putem — jedini put koji testira "nema fakture" je hardkodovana "problem_no_invoice" vrsta. Ovo je ozbiljna, vredna-prijave pojednostavljenost: PRAVI algoritam iz 8.8 (traženje kandidata, pamćenje aliasa pošiljalac→klijent) **nije implementiran kao opšta logika**, samo kao fiksni seed-scenariji koji glume njegov ISHOD. |
| 8.9 Ponavljajuće fakture (generisanje, pauza/nastavak, kraj) | IMPLEMENTIRANO (ručno/CRUD) / NEDOSTAJE (pravi dnevni posao u 07:00) | Vidi 6.8. |
| 8.10 Obaveštenja (okidači, kanali, dedup, tihi sati) | DELIMIČNO | Okidači za "Novi mejl banke" rade (18. krug). Rok za porez/kasna faktura/nedeljni pregled/promena propisa — NISU posebno provereni da li generišu `notifications` zapis automatski (van `simulateNewMail` puta) — NIJE POTVRĐENO ovaj krug, vredi re-proveriti u narednom. Dedup i "tihi sati 22-07" — NEDOSTAJE (nema vremenski-okidanih obaveštenja uopšte u klijentskom app-u, pa dedup/tihi-sati nemaju šta da sprečavaju). |
| 8.11 Kvote i zaštita (AI 20/dan, veličine fajlova, 5 pokušaja/15min) | IMPLEMENTIRANO | AI kvota i login lockout oba potvrđena u kodu. Veličine fajlova (logo 2MB, rešenje 20MB) — UI prihvata upload ali NIJE POTVRĐENO da li kod stvarno odbija fajl preko limita (nije testirano ovaj krug) — označeno za Korak 3. |

## 9. Integracije i spoljni sistemi

Po definiciji prototipa (11.1: "ne mora da ima stvarnu naplatu, push, produkciono slanje mejlova banci, dvostepenu prijavu"), SVE stavke ove tabele su SIMULIRANO ili NEDOSTAJE — ovo je OČEKIVANO i u skladu sa specifikacijom, ne nalaz greške:

| Sistem | Status | Napomena |
|---|---|---|
| Primanje mejlova (inbound) | SIMULIRANO | Dev-meni dugme umesto pravog SMTP/inbound servisa. |
| Slanje mejlova (outbound) | SIMULIRANO | Svaki "Pošalji" je toast + promena statusa, nijedan pravi mejl ne izlazi. |
| AI model (LLM) | SIMULIRANO | Scenario-matching, ne pravi poziv modelu. |
| OCR (čitanje rešenja) | SIMULIRANO | Tajmer + seed brojevi. |
| NBS kursna lista | SIMULIRANO | Deterministička pseudo-funkcija. |
| Generisanje PDF | SIMULIRANO | Uvek toast, nikad stvaran fajl. |
| IPS QR | SIMULIRANO (dekorativno, ne skenira se) | Poznato i već dokumentovano (spec 12/#18). |
| Procesor plaćanja | SIMULIRANO | Nijedan pravi procesor. |
| Google OAuth | SIMULIRANO | Dugme postoji, `google()` funkcija direktno postavlja ulogovano stanje bez pravog OAuth poziva. |
| Push obaveštenja | NEDOSTAJE | Spec sam kaže "prototip: samo mejl i obaveštenja u aplikaciji" — očekivano. |
| Kalendar (ICS) | NEDOSTAJE (samo prikazan link, bez pravog feed-a) | Vidi 7.11. |
| Analitika proizvoda | NEDOSTAJE | Nema nikakvog analitika poziva u kodu — očekivano za prototip. |

## 10. Nefunkcionalni zahtevi

| Stavka | Status | Napomena |
|---|---|---|
| 10.1 Tehnologija (React/TS/Vite, Node backend, Postgres...) | NEDOSTAJE (namerno) | Prototip je vanilla React bez build-a, bez backend-a/baze — eksplicitno dozvoljeno za prototip (11.1), spec 10.1 opisuje PRAVU platformu. |
| 10.2 Bezbednost (šifrovanje, OWASP, prompt injection zaštita) | NEDOSTAJE (N/A arhitektura) / DELIMIČNO (prompt injection svest) | Nema servera/baze da bi "šifrovanje u mirovanju" bilo primenjivo. Prompt injection: pošto AI odgovor nije pravi LLM poziv nad sadržajem mejla, pitanje "da li AI izvršava instrukcije iz mejla" je trivijalno N/A u prototipu — kad prava platforma dobije pravi LLM poziv, ova zaštita će tek tada morati stvarno da se implementira i testira. |
| 10.3 Privatnost/usklađenost (GDPR, Uslovi/Privatnost stranice) | DELIMIČNO | Linkovi "Uslovi"/"Privatnost" postoje u podnožju (7.1), ali vode na stranice koje nisu posebno izrađene (nije ni traženo za prototip — "pravni tekst pišu pravnici"). Napomena "Za važne odluke proveri izvor..." IMPLEMENTIRANO (prisutna ispod AI polja). |
| 10.4 Performanse (učitavanje <2s, idempotentnost) | IMPLEMENTIRANO (trivijalno) | Sve je lokalno (nema mreže) pa je učitavanje uvek trenutno — ne dokazuje da bi prava mrežna verzija zadovoljila ovaj zahtev, samo da prototip to ne krši. |
| 10.5 Pristupačnost (kontrast, fokus, tastatura, 44px dodir) | IMPLEMENTIRANO (delimično provereno) | `:focus-visible` globalno pravilo postoji; `a11yClick` helper (tabIndex/role/Enter-Space) korišćen dosledno za klikabilne div/span elemente kroz app (potvrđeno grep-om, desetine mesta). Formalna kontrast-provera (4.5:1 svuda) i potpun tab-order audit NISU posebno rađeni nijedan krug do sada — NIJE POTVRĐENO, vredi spomenuti vlasniku. |
| 10.6 Testiranje (jedinični testovi, evaluacioni skupovi, e2e) | DELIMIČNO | `plural.test.js` postoji (jedini jedinični test). `nan-sweep.js`/`sweep-phone.js` su CUSTOM vizuelni/regresioni alati (ne jedinični testovi poslovnih pravila kao što spec traži — limit/kursevi/rokovi/uparivanje/numeracija nemaju posebne automatizovane testove van ručne uživo provere). Evaluacioni skup AI mejlova/rešenja — NEDOSTAJE (N/A, nema pravog modela da se evaluira). |

## 11. Plan gradnje i definicija prototipa

| Stavka | Status | Napomena |
|---|---|---|
| 11.1 "Mora da ima sve ekrane/stanja iz odeljka 7, i na telefonu" | IMPLEMENTIRANO (u velikoj meri) | Potvrđeno kroz 26 krugova frame-compare — videti STATUS.md za otvorene stavke (uglavnom vlasnikove odluke na čekanju, ne nedostaci). |
| 11.1 3 obavezna scenarija (Prvi dan, Devizni priliv, Porez i pretplata) | IMPLEMENTIRANO | Sva 3 rade uživo do kraja — detaljno u Koraku 3. |
| 11.2 Redosled faza (1-10) | IMPLEMENTIRANO | Sve faze 1-9 "Gotovo", Faza 10 (Poliranje) u toku/16+ krugova, uključujući ovaj finalni. |

## 12. Poznate nedoslednosti (18 stavki)

Sve već rešene po "podrazumevanom pravilu" iz spec-a, potvrđeno pregledom koda ovaj krug — nijedna nije ostavljena nerešena suprotno sopstvenom pravilu:

| # | Tema | Status primene podrazumevanog pravila |
|---|---|---|
| 1 | Promet i izvodi tab | IMPLEMENTIRANO (prilog u chatu, bez posebnog taba — tačno po pravilu) |
| 2 | Limit kalendarska/12 meseci | IMPLEMENTIRANO (oba prikazana sa jasnim oznakama — Početna "12 meseci", Knjiga "u 2026.") |
| 3 | Brojke u primerima | IMPLEMENTIRANO (seed iz Priloga B dosledno korišćen) |
| 4 | Rok poreza zbirno/4 stavke | IMPLEMENTIRANO (Porez i rokovi izvor istine, Kalendar prikazuje zbirni događaj) |
| 5 | Naziv proizvoda | Vidi 1.5 iznad (NEDOSTAJE kao "konfiguracija", ali nema funkcionalni efekat) |
| 6 | Pravno lice naplate | IMPLEMENTIRANO kao placeholder ("Fakturica d.o.o." u računu pretplate) |
| 7 | Brojevi faktura | IMPLEMENTIRANO (format 8.2 dosledan, nema "2024-0xx" primera u kodu) |
| 8 | Adresa za prijem format | IMPLEMENTIRANO (`<slug>-<kod>@prijem...` dosledan u `business.inboundCode`) |
| 9 | Dvostepena prijava | Vidi 7.1 iznad (NEDOSTAJE ekran, prekidač postoji — tačno po pravilu "u prototipu opciono") |
| 10 | Brisanje klijenta sa fakturama | IMPLEMENTIRANO (dozvoljeno samo bez faktura — NIJE posebno re-potvrđeno ovaj krug, poznato iz ranijih rundi) |
| 11 | Podsetnik klijentu automatski | IMPLEMENTIRANO (v1 ručno — tačno kako pravilo traži) |
| 12 | Trajni nalog auto-označavanje | **NEDOSTAJE** — jedino mesto gde podrazumevano pravilo iz 12 NIJE sprovedeno: spec kaže "kad je izabran trajni nalog, mesec se automatski označava kao plaćen na dan roka" [PREDLOG, potvrditi sa Stefanom] — kod menja SAMO prikaz ("Automatski iz banke" tekst), ne i stvarni status plaćanja na dan roka. Vredi odluka vlasnika: da li ovo graditi (zahtevalo bi simulaciju protoka vremena, slično `simulateNewMail` mehanizmu iz 18. kruga). |
| 13 | Podrška | IMPLEMENTIRANO delimično (AI pomoć da; zaseban "mejl podrške" link nije posebno izgrađen) |
| 14 | Pravila banke (više banaka) | SIMULIRANO (samo seed primeri, Erste Bank stil) — očekivano za prototip |
| 15 | Lokacija podataka/hosting/procesor | N/A za prototip (odluka za pravu platformu) |
| 16 | Više korisnika na firmi | NEDOSTAJE — ali spec sam kaže "van obima v1" |
| 17 | NBS IPS šifra plaćanja SF:253 | SIMULIRANO, nepromenjeno (spec sam traži da se ovo PROVERI pre lansiranja, ne da se sad menja) |
| 18 | QR nije skenibilan | SIMULIRANO, nepromenjeno (spec sam to već kaže, poznato ograničenje) |

---

## Sažetak po brojevima

- **IMPLEMENTIRANO** (radi i uživo provereno/potvrđeno u kodu): **~95 stavki** (sve glavne sekcije 1-8, skoro sva ekrana iz 7, sve tri krovna scenarija iz 11.1, 16 od 18 nedoslednosti iz 12).
- **SIMULIRANO** (ponaša se ispravno u prototipu ali bez pravog spoljnog sistema iza): **~28 stavki** — prevashodno sve iz sekcije 9 (mejl prijem/slanje, AI model, OCR, NBS, PDF, QR, procesor plaćanja, Google OAuth), plus izvoz podataka/knjige, QR skeniranje, i algoritam uparivanja uplate (8.8 — najvažniji pojedinačni nalaz, videti ispod).
- **NEDOSTAJE** (nije izgrađeno, ili eksplicitno van obima po spec-u): **~22 stavke** — većina eksplicitno dozvoljena (11.1: naplata/push/produkciono slanje/2FA), plus nekoliko stvarnih propusta vrednih prijave:

### Lista NEDOSTAJE (sažeto, samo stvarno vredne pažnje — isključujući ono što spec sam označava van obima v1):

1. **8.8 Algoritam uparivanja kao OPŠTA logika** (ne samo fiksni seed-scenariji) — najvažniji nalaz. Trenutno svaki test-mejl ima unapred poznat, jednoznačan ishod; pravi "traži kandidate→ako više njih ili nijedan, idi u problem→zapamti alias" put nije generički kodiran.
2. **12/#12 Trajni nalog ne automatski-označava mesec kao plaćen** na dan roka (spec eksplicitno to traži kao podrazumevano pravilo).
3. **7.4 Automatsko čuvanje nacrta** (periodični auto-save) — čuva se samo na eksplicitan klik.
4. **6.9 Dodatna potvrda storniranja već plaćene fakture** — nije posebno blokirano/upozoreno.
5. **4.7 Err2 (offline) se ne pojavljuje automatski** kad veza padne — ekran postoji, ali nema `navigator.onLine` osluškivača.
6. **8.10 Tihi sati i dedup obaveštenja**, i da li se SVI tipovi obaveštenja (ne samo "Novi mejl banke") stvarno generišu — treba dodatna provera.
7. **10.5 Formalna kontrast/tab-order revizija** nikad posebno sprovedena (samo `:focus-visible` + `a11yClick` kao obrazac, ne punu reviziju).
8. **10.6 Jedinični testovi poslovnih pravila** (limit/kursevi/rokovi/uparivanje/numeracija) ne postoje van `plural.test.js` — pokriveno samo ručnom uživo proverom kroz 27 krugova, ne automatizovano.
9. **8.11 Granice veličine fajla** (logo 2MB, rešenje 20MB) — UI prihvata upload, nije potvrđeno da li kod stvarno odbija prevelik fajl.
10. **7.11 Pravi ICS kalendar feed** — samo prikazan link/tekst, ne stvaran fajl koji Google/Apple kalendar može da pročita.

Sve ostalo iz NEDOSTAJE liste (2FA ekran, push, pravi OCR/LLM/PDF/plaćanje/email, "Promet i izvodi" tab, kamera/deep-link/pull-to-refresh na telefonu, višekorisnički nalog, dnevni pozadinski poslovi za ponavljajuće fakture i akontacije) je **eksplicitno van obima prototipa po samoj specifikaciji** (11.1, 7.8a, 5.4, 9, 12/#16) — nije propust, nego namerno ostavljeno za pravu platformu.
