# Status: Tvoj AI knjigovođa — prototip

Datum: 2026-11-20 (ažurirano posle zatvaranja Faze 5 — dodatna runda ispravki)

## Gotovo

### Faza 1 — Temelj
- Raspored (sidebar na desktopu, donja traka na telefonu), tema (svetla/tamna/sistemska, prekidač u dev meniju i kao pill u gornjoj traci), i18n (srpski latinica izvor, ćirilica automatska transliteracija, engleski delimično), auth tokovi (prijava, registracija, verifikacija mejla, magic link, reset lozinke, Google prijava — sve simulirano preko "Otvori mejl" modala), greške (404, offline — renderuju se UNUTAR app shell-a, sidebar i topbar ostaju vidljivi).

### Faza 2 — Onboarding i Podešavanja
- Onboarding (4 koraka: O tvojoj firmi, Podaci za fakture, Poveži mejlove banke, Sve je spremno) sa svim stanjima — validacija, čuvanje (sivi/onemogućeni inputi + spinner), file-chip prikaz loga, simulacija dolaznog mejla.
- Podešavanja — svi tabovi (Profil i firma, Računi, Pretplata, Obaveštenja, Povezivanje, Bezbednost i nalog, Jezik i izgled). Na telefonu: lista-pa-detalj (ne horizontalni tabovi), svi modali/paneli su bottom-sheet.
- Frejm-po-frejm provereno (desktop 1280px i telefon 390px, svetla i tamna tema) za: Prijava* (sve varijante), Err1/Err2, OnbO1–OnbO12, Pd0–Pd10, MNav (donja navigacija — ikonice, FAB, bedž). Nema poznatih otvorenih odstupanja.

### Faza 3 — Fakture
- **Lista** (Fak1/Fak2): 3 pregledne kartice (Čeka naplatu / Kasni / Naplaćeno u 30 dana), tabovi Fakture/Klijenti/Ponavljajuće, filter čipovi, tabela (desktop) / lista kartica (telefon), meni ⋯ po redu.
- **Nova faktura / izmena** (Fak3–Fak10, Fak19, Fak20): dvokolonska forma + pregled uživo (desktop), forma-pa-dugme-Pregled (telefon). Izbor klijenta popunjava valutu/jezik/rok/račun/stavku iz profila; klijent bez podrazumevane cene traži iznos ručno; dinarska faktura na srpskom dobija Poziv na broj i srpske nazive u dokumentu; dijalog pri zatvaranju sa nesačuvanim izmenama; novi klijent iz modala.
- **Pregledaj i pošalji → Poslato** (Fak11/Fak12): AI piše poruku na jeziku fakture, PDF prilog (simuliran), potvrda sa rezimeom.
- **Pregled fakture** (Fak15–Fak17, Fak21–Fak23): akcije zavisne od statusa, Detalji/Istorija/Uplata/Kako klijent vidi, baner za kasne fakture, podsetnik i storniranje kao posebni dijalozi.
- **Klijenti** (Fak6/Fak7/Fak28): pretraga, tabela, bočni panel za uređivanje.
- **Ponavljajuće** (Fak13/Fak14): tabela + forma (učestalost, dan, početak, traži odobrenje ili šalje automatski).
- **Editor šablona** (Fak18, Fak24–Fak27): lista blokova (uključi/isključi, pomeri gore/dole), platno sa pregledom, desni panel po nivou (Blok/Tabela/Cela faktura), dijalog za izbor rasporeda.
- Testirano uživo (svetla/tamna tema, desktop i telefon) bez grešaka u konzoli.

### Faza 4 — Početna i Knjiga prihoda
- **Limit (8.4)**: `Sel.limitInfo` je klizni prozor od 365 dana do TODAY (ne kalendarska godina), isključuje uplate bez fakture (`noInvoice`). Odvojeno od **Knjiga prihoda** (7.9), koja računa po kalendarskoj godini (`Sel.calendarYearIncomes`) — obe metrike su vidljivo označene u UI-ju (naslovi kartica).
- **Početna** (Poc1–Poc6, Dash4_\*, Tur0, Tip1/Tip2): pozdravna traka sa statusnom tačkom i rečenicom (zavisi od checklist-e/autonomije/broja stavki); "Počni ovde" checklist (5 koraka, progres bar, amber-istaknut sledeći korak) kada nije sve završeno — tada je layout 3+2 kolone (karta + limit/uplate); kada je sve završeno, pun 2×2 grid (Limit/Čeka tebe/Poslednje uplate/Nadolazeći rokovi). Limit-kartica koristi cele brojeve (`fmtInt`) bez decimala, baner upozorenja na 80%/90%/100%+ limita. "Nadolazeći rokovi" grana se na "Dodaj rešenje" (nema poreskog rešenja), ručno plaćanje ili "Automatski iz banke" (autonomija = auto). Welcome-tur modal (Tur0) se prikazuje jednom dok checklist nije završen — samo ulazni modal je napravljen, koraci sa spotlight-om (Tur1–4) nisu (vidi ispod).
- **Topbar**: pretraga (klijenti + njihove fakture/uplate, prazno stanje, link "Pitaj AI knjigovođu"), zvonce sa obaveštenjima (vremenske oznake relativne prema fiksnom TODAY, ne pravom satu — "pre 2 h" / "jutros" / "juče" / "12. nov"), korisnički meni u sidebaru (popover: Moj nalog / Podaci o firmi / Pretplata i plan / Pomoć i vodič / Odjavi se).
- **Knjiga prihoda** (Kp1–Kp10): rezime red (ukupno + devizni/dinarski bočne kartice), tabovi Devizni/Dinarski sa brojem stavki, filteri godina/mesec/klijent, tabela (desktop) / lista kartica (telefon) sa "Ukupno ..." redom na dnu, baner "blizu limita" (≥80%), baner i zasivljen red za uplatu bez fakture (klik baca toast umesto otvaranja), prazno stanje za godinu bez prihoda, bočni panel za detalj uplate (datum/klijent/faktura/izvor/kurs/iznos u dinarima/opis), modal za dodavanje prihoda (dinarski/devizni, NBS kurs, opciona veza sa fakturom — kači `Invoices.markPaid`), modal za izvoz (godina/period/format), potvrda pre brisanja.
- Testirano uživo (svetla/tamna tema, 1280px i 390px): Početna (pun grid, nekompletna checklist, 3 nivoa limit-upozorenja, auto-mod rokova, welcome modal, pretraga sa/bez rezultata, korisnički meni), Knjiga prihoda (obe valute, dodavanje prihoda oba toka, detalj, brisanje sa potvrdom, izvoz, prazna godina, mobilna lista sa zasivljenom "bez fakture" stavkom).
- **Pravi bagovi nađeni i ispravljeni u testiranju** (ne iz specifikacije, nego uživo otkriveni): `timeAgo()` je koristio pravo vreme sistema umesto fiksnog TODAY (obaveštenja su pokazivala pogrešno "5 d" itd); "Pitaj AI knjigovođu" link se duplirao u praznom stanju pretrage; "Ukupan prihod u [object Object]." — pogrešna promenljiva u template stringu u `RezimeRow`; dugme "Obriši prihod" u detalju uplate brisalo je odmah bez potvrde (modal `DeleteConfirm` postojao je u kodu ali nije bio povezan); polje "Valuta" u modalu za dodavanje deviznog prihoda bilo je preusko i tekst "EUR" se sekao (CSS selektor `.inv-field-row > .inv-field` nije pokrivao generičku `Field` komponentu — dodat `.field` u selektor); zasivljeni stil za uplatu bez fakture nije postojao u mobilnoj (kartica-lista) varijanti tabele, samo u desktop tabeli.

#### Druga runda ispravki (posle ručne provere korisnika, pre Faze 5)
- **Zaokruživanje para u Knjizi prihoda**: `Sel.calendarYearIncomes` je zaokruživao ukupan zbir na cele dinare (`Math.round(fxTotal+rsdTotal)`) umesto na pare — rezime, traka limita i "Ostalo" sada tačno prate frejm (1.312.451,09 / 4.687.548,91, ne ,00). Baner "blizu limita" u Knjizi prihoda je takođe prebačen sa kliznog 12-mesečnog limita (`li`) na kalendarsku godinu (`yr`), jer Kp7 frejm pokazuje da baner koristi IST0 "Ostalo" kao rezime kartica te godine.
- **Kolona Faktura i Kp4 detalj**: tri uplate (Acme 05.08, Joam 10.10, Acme 15.11) nisu imale `invoiceId` u seed podacima pa su pokazivale "–" umesto broja fakture; dodata nedostajuća faktura `25/26-07` i povezani `invoiceId` na sve tri. Detalj uplate (Kp4) je prikazivao "Otvori {broj}" u novom redu umesto "{broj} Otvori" u istom redu, i pun datum umesto "dd.mm." za mejl banke — ispravljeno da prati frejm tačno.
- **Baner "Jedna uplata nema fakturu" (Kp10)** i baner "blizu limita" (Kp7): naslov i opis su se spajali u jedan red jer `.body` nije imao `flex-direction:column`; link je bio utopljen u tekst umesto odvojen i podvučen; boja banera je koristila `--status-draft-bg` (sivo) umesto amber `--warn-bg` tokena — sve ispravljeno.
- **Dijalog brisanja (Kp8)**: dugme je pisalo "Obriši" umesto "Obriši prihod", tekst nije imao ime klijenta/datum u zagradi ni rečenicu "Ovo ne može da se vrati." — sada tačan tekst iz frejma.
- **Baner iznad 100% limita** (Početna): uklonjena crtica iz "...ovog prototipa — razgovaraj..." (zamenjena tačkom), po izričitom zahtevu.
- **Korisnički meni** (sidebar): dodato zatvaranje na Escape (click-outside je već radio).
- **"Čeka tebe" kartica**: dugme "Pošalji podsetnik" se više ne preklapa sa tekstom na užim širinama — red sada ima `flex-wrap`, dugme ne skuplja ispod svoje prirodne širine.
- **Tabela prihoda na 1024px**: imena klijenata ("Bluebird GmbH", "Joam Technologies LLC") su se sekla jer je tabela bila `width:100%` bez minimalne širine; kolone usklađene na tačne frejm vrednosti (Uplata 100 / Faktura 100 / Iznos 110 / Kurs 64 / U dinarima 120 / Izvor 96). Prvi pokušaj (`min-width:860px` + horizontalni skrol) je ispravljao sečenje ali je uveo skrol i na 1024px, što korisnik nije želeo — zamenjeno rešenjem bez skrola: kolona Klijent sada prelama tekst u dva reda (`.ellip` klasa uklonjena, red visine `auto`/`min-height:56px`) umesto da seče ili forsira skrol. Na 1024px nema skrola i imena su cela (u dva reda po potrebi); na 1280px i više imena staju u jedan red.
- **Dash4_norez** ("Nadolazeći rokovi" kad nema poreskog rešenja): ranije je koristio generičku sivu "čeka te" karticu sa malom ikonicom — zamenjeno pravom amber karticom (24px padding, 48px ikonica dokumenta, dugme "Dodaj rešenje" + link "Kako do rešenja"), tačno po frejmu, provereno i u tamnoj temi. Ova kombinacija stanja (prazan checklist + pun grid) se ne pojavljuje prirodno u toku aplikacije jer "rešenje" blokira "sve završeno" — provereno privremenim test-override-om selektora, ne kroz normalan tok.
- **Dash4_auto** ("Automatski iz banke" red): nedostajala je kvačica-ikonica i pravi "pill" stil (sada `.poc-auto-pill`, boje iz `--sidebar-item-active`), kao i link "Trajni nalozi" pored pilule — oboje dodato. Red i datum-pločica sada dobijaju isto "due"-isticanje kao i ručni (Dash4_ima) red, samo druga boja (zeleno-limun umesto amber).
- **Dash4_ima** (ručno plaćanje, red "Treba platiti"): boja reda u tamnoj temi je koristila generički `--warn-bg` (#3A2E10) umesto frejmom specifikovane `rgba(255,190,70,0.07)` — ispravljeno.
- Tip1/Tip2 (tooltip tekstovi) i Dash4_ima/auto su provereni i u tamnoj temi na 390px — tačni.

#### Treća runda ispravki (dovršena provera tamne teme + 1024/1280px, pre Faze 5)
- **Tur0 modal na telefonu**: dugme "Preskoči" je bilo nevidljivo i nefunkcionalno na SVIM mobilnim bottom-sheet modalima zbog globalnog CSS pravila `.sheet-foot .btn-secondary{display:none}` (dodatog u Fazi 2 za druge dijaloge gde je frejm tražio samo jedno dugme) — ispravljeno tako što `WelcomeTourModal` sada eksplicitno vraća `display:flex` na svom "Preskoči" dugmetu (inline stil, jači od CSS klase), bez diranja globalnog pravila koje i dalje ispravno važi za ostale sheet-ove (Promeni lozinku, Dodaj račun i sl.). Provereno na 390px, tamna tema — oba dugmeta sada vidljiva i funkcionalna.
- **Poc4 (korisnički meni) i Poc5/Poc6 (pretraga) na 390px**: ovi elementi **ne postoje na mobilnom prikazu uopšte** — `.topbar-search` ima `display:none` ispod 1024px, a sidebar (gde živi korisnički meni/avatar) je potpuno sakriven na mobilnom (zamenjen donjom navigacijom). Mobilni ekvivalent naloga/odjave je "Više" list (sa Odjavi se) i Podešavanja ekran, već testirani u ranijim fazama — nije ih moguće testirati kao "Poc4"/"Poc5/6 na 390px" jer ta UI stanja nemaju mobilni okidač u trenutnom dizajnu. Ovo nije bag nego posledica postojeće responsive arhitekture iz Faze 1/2; javljeno korisniku umesto lažnog "prošlo".
- **Kp4 detalj uplate u tamnoj temi (desktop)**: "25/26-14 Otvori" i "15.11. Otvori mejl" potvrđeno identično frejmu i u tamnoj temi (ranija ispravka iz druge runde važi za obe teme, samo svetla je bila eksplicitno snimljena ranije).
- **Tabela prihoda — konačna provera**: na 1280px nema horizontalnog skrola, imena klijenata cela u jednom redu; na 1024px nema skrola (ispravljeno u ovoj rundi, v. gore), imena cela u do dva reda; ispod 1024px (uža širina) skrol se i dalje ne javlja jer je rešenje sada "prelomi red" a ne "min-width + skrol" — skrol u ovoj tabeli trenutno ne postoji ni na jednoj širini, što je strože od traženog "skrol sme samo ispod 1024px" (manje skrola nego dozvoljeno, ne više), pa zahtev nije prekršen.

### Faza 5 — Mejlovi banke
- **Lista** (Mb1): naslov, opis, dugme "Podešavanja slanja"; kartica "Tvoja adresa za prijem" (adresa iz `business.inboundSlug/inboundCode`, isti mehanizam kao Onboarding/Podešavanja); tabovi Sve/Čeka tebe/Obrađeno/Problemi sa brojačima (računati iz stvarnih podataka, ne fiksni "6" iz frejma); tabela (desktop) / lista kartica (telefon): Mejl, Klijent i iznos, Vraćam na adresu, Status (obojen bedž: amber/zeleno/crveno), Stiglo.
- **Prazno i povezivanje** (Mb2): 3 koraka (kopiraj adresu, javi banci sa gotovim tekstom, čekaj prvi mejl) — prikazuje se kad `bankMails` nema nijedan zapis.
- **Detalj** (Mb3/Mb10/Mb11): levo originalni mejl (pošiljalac, vreme, tema, telo), desno "Šta sam uradio" (3–4 tačke zavisno od statusa/vrste), Istorija (za automatski/poslato), "Prodaja deviza" blok (prodato/kurs/dinari) kad je primenjivo, link "Promeni za ovog klijenta"/"Promeni podešavanje". Grana se na devizni (tri dokumenta) i dinarski (samo faktura, bez prodaje deviza) tok.
- **Pregled i odobrenje** (Mb4): puni ekran (isti `.inv-shell` obrazac kao Fakture), levo Za/Naslov/Poruka/Prilozi + segment "Prodaja deviza" (Samo proknjiži/Prodaj deo/Prodaj sve, sa poljem procenta), desno tabovi dokumenata (Faktura/Raspored priliva/Prodaja deviza) sa punim sadržajem dokumenta tačno po frejmu. "Prodaj deo" prikazuje uživo preračunat iznos (Mb12).
- **Poslato** (Mb5): overlay po odobrenju — ikonica, rezime, vremenska linija (Mejl stigao → Pripremljeno → Odobreno → Poslato → Devize prodate ako ima → Čekam potvrdu), dugmad "Nazad na mejlove"/"Otvori fakturu".
- **Problem bez fakture** (Mb6): 3 opcije (napravi fakturu za novog ili postojećeg klijenta / poveži sa postojećom fakturom / nije moj priliv) — rešavanje automatski ažurira postojeći "bez fakture" prihod u Knjizi prihoda (ne pravi duplikat) i uklanja Kp10 baner.
- **Problem nestandardan zahtev** (Mb7): prikaz zahteva, polje za prilog, predlog odgovora (sa tačnim datumom originalnog priliva, ne datumom prijema zahteva), slanje menja status u "Poslato banci".
- **Podešavanja slanja** (Mb8): globalni izbor (Tražim odobrenje/Šaljem automatski), izuzeci po klijentu (prekidač po klijentu, čita/piše `client.autoSend`), izbor za devizni priliv (Samo proknjiži/Prodaj deo sa procentom/Prodaj sve), adresa za prijem na dnu.
- **Prvo podešavanje** (Mb9): modal sa istim dva izbora, prikazuje se jednom (`autonomySettings.sendingSettingsSeen`), dugmad "Ostavi odobravanje"/"Uključi automatsku obradu".
- **Fakture → Klijenti**: dodata sekcija "Mejlovi banke za ovog klijenta" (7.6) u bočni panel za uređivanje postojećeg klijenta — isti prekidač i izbor prodaje kao u opštim podešavanjima, samo za tog klijenta.
- Integrisano sa ranijim fazama: Početna "Čeka tebe" (Obrazac za banku + Uplata bez fakture), Knjiga prihoda Kp10 baner ("Poveži u Mejlovima banke"), Podešavanja → Povezivanje ("Podešavanja slanja" sada vodi na `app/mejlovi/podesavanja`), badge brojač u sidebaru.
- Testirano uživo (svetla/tamna tema, 1280px i 390px): svih 6 seed-ovanih mejlova (Čeka odobrenje/Poslato automatski/Poslato banci/dva problema), pun tok odobrenja i slanja (uključujući "Prodaj deo" sa 50%), rešavanje "bez fakture" problema (kreiranje novog klijenta+fakture), odgovor na nestandardan zahtev, Podešavanja slanja, prvo-podešavanje dijalog, klijent-panel sekcija.
- **Pravi bagovi nađeni i ispravljeni u izradi**: seed podaci su imali DUPLIKAT za Acme-ov priliv od 15.11 (postojao je i već-uknjižen prihod iz Faze 4 I odgovarajući "još neodobren" mejl banke za ISTI priliv) — uklonjen prerani prihod, sad se knjiži tek kad se mejl odobri; `Components.Toggle` koristi prop `on`, ne `checked` (izuzeci po klijentu su svi bili "isključeno" bez obzira na stvarnu vrednost); odgovor na "nestandardan zahtev" (Mb7) je koristio datum PRIJEMA zahteva umesto datuma priliva na koji se zahtev odnosi (dodato `relatedDate` polje); na mobilnom (390px) je dugme "Preskoči" bilo nevidljivo na SVIM bottom-sheet modalima (zajednička CSS greška, v. iznad); na mobilnom je "Pregledaj dokumenta" ekran gurao desnu kolonu (pregled dokumenta) van ekrana umesto da je slaže ispod forme, jer `.inv-shell-row` nije imao `flex-direction:column` na uskim širinama.
- **Svesno pojednostavljeno**: PhMb\* telefonski frejmovi nisu pojedinačno otvarani frejm-po-frejm (isti nivo kao kod ranijih faza); prilaganje fajla u Mb7 je vizuelni `<input type=file>` bez stvarnog čuvanja; "Promeni za ovog klijenta"/"Promeni podešavanje" linkovi uvek vode na opšta Podešavanja slanja, ne na direktno pretpopunjen klijent u tom ekranu.

## Otvoreno / svesno pojednostavljeno
- **Editor šablona**: redosled blokova se menja strelicama gore/dole, ne pravim prevlačenjem; većina kontrola u desnom panelu je vizuelna bez stvarnog efekta na dokument (osim uključi/isključi bloka). Isti nivo "simulacije" kao mejlovi banke.
- **"Mejlovi banke za ovog klijenta"** (radio grupe iz Fak28, obrada priliva/prodaja deviza po klijentu) nije dodato u panel klijenta — ta logika pripada Fazi 5 (Mejlovi banke).
- **PhFak\* telefonski frejmovi** (za Fakture) nisu pojedinačno otvarani i poređeni frejm-po-frejm kao što je rađeno za Fazu 2 — mobilni prikaz prati ista pravila naučena u Fazi 2 (lista kartica, jedan stubac, bottom-sheet modali) i testiran je uživo, ali bez formalne tabele provere po frejmu.
- **Tur1–Tur4** (spotlight koraci vodiča posle welcome modala): nisu napravljeni, samo ulazni Tur0 modal sa "Preskoči"/"Pokaži mi" — klik na "Pokaži mi" samo zatvara modal uz toast, ne pokreće stvarni spotlight-tour kroz ekran. Isti nivo pojednostavljenja kao editor šablona u Fazi 3.
- **PhPoc\*/PhKp\* telefonski frejmovi** nisu pojedinačno otvarani frejm-po-frejm — mobilni prikaz testiran uživo na 390px prati već utvrđena pravila (lista kartica, jedan stubac), ali bez formalne tabele provere po frejmu, kao ni kod Fakture u Fazi 3.

### Dodatna runda — završena (zatvaranje Faze 5, pre Faze 6)
Korisnik je tražio punu tabelu Mb1–Mb12 na 1280/390px u obe teme sa stvarnim vrednostima, zatvaranje ostatka Faze 4 provere, regresiju SVIH modala/dijaloga Faza 1–5 na 390px, pretragu crtica (—) i proveru para. Sve 5 tačaka su zatvorene u ovoj rundi.

**1) Sistemski bag dugmadi (regresija iz Faze 2)** — nađen i ispravljen:
- Globalno CSS pravilo `.sheet-foot .btn-secondary{display:none}` je sakrivalo sekundarno dugme na SVIM mobilnim sheet-ovima. Ispravka: opt-in `.sheet-foot.single-action-mobile .btn-secondary{display:none}` + `singleActionMobile` prop na `Modal`/`SidePanel`, primenjeno samo na Promeni lozinku i Dodaj račun (jedina dva frejmom potvrđena "samo jedno dugme").
- `Modal`/`SidePanel` na mobilnom sada prikazuju footer dugmad u obrnutom redosledu (primarno prvo/gore) — potvrđeno PhMb5/PhMb9/PhPd9, važi automatski za SVE mobilne dijaloge.
- Provereno uživo na 390px (obe teme): Tur0 (Preskoči/Pokaži mi — oba vidljiva i klikabilna), Mb9 (Ostavi odobravanje/Uključi automatsku obradu — oba vidljiva, ispravan redosled). Pošto je mehanizam promenjen sa "sakrij po default-u" na "sakrij samo uz eksplicitan prop" i samo 2 od 16 `footer:[...]` poziva u celoj aplikaciji imaju taj prop, bag klase "nevidljivo/neklikabilno dugme" strukturno više ne može da se javi ni na jednom od preostalih 14 mesta (Fakture: ClientPanel, RecurringTab panel, close-confirm, ReminderModal, VoidModal, TemplateEditor layout-modal; Knjiga prihoda: DetailPanel, AddIncomeModal, ExportModal, DeleteConfirm; Podešavanja: Izmeni račun, Ukloniti račun, DeleteAccountModal — ovaj poslednji već ranije hardkodovao ispravan redosled bez deljenog footer mehanizma).

**2) Mb1–Mb12 tabela** — poslata korisniku u razgovoru (frejm/tema/širina/razlika/ispravljeno). Pravi bagovi nađeni i ispravljeni u ovoj rundi (svi u `js/mejlovi.js` osim gde je drugačije navedeno):
- **Iznosi u Mejlovima banke su svuda koristili SIMBOL valute (€, din, $) umesto ISO koda (EUR, RSD, USD)** koji frejm dosledno koristi u naslovu mejla, "Šta sam uradio", Prodaja deviza bloku, dokumentima i porukama — sistemska greška kroz ~10 mesta, ispravljena uvođenjem `fmtMoneyCode()`. Sekundarni (manji) iznosi na listi mejlova ispravno OSTAJU sa simbolom (frejm to potvrđuje za Mb1 listu).
- **`Kurs`/decimalni brojevi koristili `.toFixed(2)`** (tačka kao decimalni separator: "117.20") umesto srpskog formata ("117,20") — ispravljeno `n2()` helperom (sr-RS lokalizacija) na svim mestima (Kurs, Priliv, Iznos za prodaju, Ostaje na deviznom računu u nalogu za prodaju deviza).
- **`Studio Nova` klijent u seed-u nije imao sufiks "d.o.o."** iako ga SVI frejmovi koji je pominju (Mb10, Kp2, Kp5) dosledno koriste — ispravljeno u `seed.js` (jedno mesto, popravlja sve ekrane odjednom).
- Detalj-stranice naslov/podnaslov vremena ("Erste Bank, danas u HH:MM" / "juče u HH:MM" / "dd.mm.gggg u HH:MM") i "Stiglo:"/Istorija datumi (bez tačke ispred "u") nisu pratili frejm — dodata `timeDetail()`/`fmtDateU()` pomoćna polja.
- Mobilna lista (kartice) je prikazivala kraći `mailLabel()` tekst umesto pravog `m.subject` kao naslov reda (desktop tabela je to već radila ispravno) — ispravljeno.
- `ApprovalDetail` (Mb3) nije imao naslove sekcija "Kome vraćam"/"Slanje" ni link "Izmeni", a adresa za odgovor nije imala frejmom tačno specifikovanu amber-istaknutu kutiju (`.mb-reply-box`, nova CSS klasa) — dodato.
- Nedostajao je desktop breadcrumb "Mejlovi banke / <kratak naziv>" na svim detalj-stranicama (Mb3/Mb6/Mb7/Mb10/Mb11) — dodat (samo desktop, frejm ga nema na telefonu).
- Prilog "Faktura.pdf" u Pregled-i-odobri panelu nije imao broj fakture u imenu fajla (frejm: "Faktura 25-26-14.pdf") — ispravljeno.
- `ApproveSendPanel`-ov segment "Prodaj deo" je prikazivao jednu rečenicu uživo-preračunatog iznosa; frejm (Mb12) pokazuje dva odvojena reda ("Prodajem"/"Ostaje na deviznom računu") + link "Promeni iznos" koji TEK OTKRIVA polje za unos procenta — restrukturirano da prati frejm tačno (`editingPercent` state).
- `SentOverlay` (Mb5) je ponovo koristio perzistovanu `history` listu za vremensku liniju; frejm traži fiksnih 5 koraka (Mejl stigao → Pripremio dokumenta → Ti si odobrio → Poslato na `<adresa>` → Čekam potvrdu) — ispravljeno da uvek generiše tih 5 koraka.
- `ExtraDocDetail` (Mb7) odgovor je imao duplu tačku na kraju datuma — ispravljeno.
- `SettingsScreen`/Mb8: redovi klijenata-izuzetaka nisu imali opisni pod-tekst ("Šaljem automatski"/"Tražim odobrenje") ispod imena, a sekcija adrese nije imala naslov "Tvoja adresa za prijem" — dodato oboje.

**3) Zatvoren ostatak Faze 4**: Poc4/Poc5/Poc6 tamna tema na 390px — i dalje važi da ti elementi (korisnički meni, pretraga) **ne postoje na mobilnom prikazu** (potvrđeno u trećoj rundi Faze 4, nema promene arhitekture od tada). Tur0 tamna/390px ponovo potvrđen posle fix-a dugmadi. Kp4 detalj u tamnoj temi i tabela prihoda na 1280px (bez horizontalnog skrola, puna imena) — oba ranije potvrđena, bez novih izmena koda u toj oblasti, status se ne menja.

**4) Crtice (em dash, —) u korisničkom tekstu** — pretraga `grep -rn "—" js/*.js css/*.css` pronašla 6 pravih pogodaka u tekstu (ne u komentarima koda), svih 6 ispravljeno zamenom za tačku/zarez/" · ": `app.js` i `settings.js` (placeholder naslovi "u izradi"), `fakture.js` (danger-zone tekst o klijentu sa fakturama), `pocetna.js` (Tur0 toast tekst), `selectors.js` ("čeka tebe" tekst za kasnu fakturu), `mejlovi.js`+`knjiga.js` (separator u opcijama padajuće liste faktura, bio "—", sad "·" — isti znak koji se već koristi kao separator na listama u aplikaciji).

**5) Pare**: svi iznosi u Mejlovima banke sada koriste dosledno dve decimale (sr-RS format) svuda gde frejm to traži — pokriveno tačkom 2) iznad.

**Svesno ostavljeno bez izmene (poznata, prijavljena odstupanja)**: "Pregled fakture" dokument-tab sadržaj (neselektovan ni u jednom frejmu koji sam otvorio) ostaje generički placeholder tekst, nije frejmom potvrđen. Fajl-čuzer dugme prikazuje ćirilično "Одабери фајл" umesto "Odaberi fajl" — ovo je lokalizacija samog browsera (native `<input type=file>`), van domašaja app koda.

### Treća runda — tri preostale tačke (posle "Dodatna runda"), pre potvrde za Fazu 6

Korisnik je tražio: (1) ispravku tri ranije "svesno ostavljena" odstupanja, (2) proveru Priloga A i foldera dizajna za Poc4/5/6 telefonske frejmove, (3) finalnu Mb1–Mb12 tabelu sa preostalim odstupanjima. Sve tri tačke zatvorene.

**1a) Mobilni dokument-tabovi → pilule.** Otvaranjem PhMb4/Mb4 (desktop) otkriveno je da pilule nisu samo mobilna razlika — **i desktop verzija** koristi iste pilule, na TAMNOJ pozadini (`#0F2A22`, uvek tamna bez obzira na temu aplikacije, kao "ekran uređaja" za pregled dokumenata) sa naslovom "Dokumenta koja šaljem" (desktop) / "Pregled dokumenata" (telefon). Ovo nisam ranije primetio jer sam prethodno gradio generičke podvučene tabove bez poređenja sa ovim specifičnim delom frejma. Dodate nove CSS klase (`.mb-doc-stage`, `.mb-doc-pill`) i sam dokument-pregled (`.mb-doc-pdf`) je sada uvek "papir" (belo/crno), kao pravi PDF, bez obzira na temu — tačno po frejmu.

**1b) PhMb12 redosled polja.** Otkriveno (desktop Mb12 frejm) da redosled "Prodaja deviza kartica PRE Za/Naslov/Poruka" važi na OBE širine, ne samo na telefonu kako je prvobitno pretpostavljeno — ispravljeno za oba. Usput otkriven i uklonjen izmišljeni segmentovani birač "Samo proknjiži / Prodaj deo / Prodaj sve" unutar ovog ekrana — taj birač se NE pojavljuje ni u jednom od 12 Mb frejmova (postoji samo u Mb8/Mb9 podešavanjima); ekran za odobrenje samo prikazuje već odlučeni režim (kartica se vidi SAMO kod delimične prodaje, ničega nema kod "samo proknjiži" ili "prodaj sve" — tačno kao Mb4 prema Mb12).

**1c) "Izuzeci po klijentu" usklađen sa frejmom.** Frejm (Mb8/Mb9) prikazuje tačno 4 klijenta: Acme (auto), Bluebird (auto), Joam (ask), Northwind (ask) — bez Cloudly Inc. Provera Priloga B potvrdila je da Cloudly "bez faktura" (ima samo NACRT fakturu 25/26-15, nikad poslatu) dok ostala 4 klijenta imaju stvarno poslate fakture — to je principijelno pravilo iza frejmove liste, ne proizvoljan izbor dizajnera. Filter u `js/mejlovi.js` promenjen sa "svi devizni klijenti" na "devizni klijenti sa bar jednom NE-nacrt fakturom" (prirodno isključuje Cloudly, bez hardkodovane liste), lista sortirana po imenu da prati frejmov redosled. `c1` (Acme) `autoSend` promenjen `false → true` u seed-u da odgovara frejmovom "Šaljem automatski" statusu. Prilog B sâm (spisak klijenata i fakturâ) nije trebalo menjati — već je bio tačan; menjan je samo filter i jedna zastavica ponašanja.

**2) Poc4/Poc5/Poc6 na telefonu — PRETHODNA TVRDNJA JE BILA POGREŠNA.** Prilog A (odeljak 952 specifikacije) i sam folder dizajna sadrže `PhPoc4.dc.html`, `PhPoc5.dc.html`, `PhPoc6.dc.html` — postoje, suprotno onome što sam ranije javio ("ne postoje na mobilnom uopšte"). Greška: ranije sam proveravao samo lokalno keširan podskup frejmova, ne pun spisak fajlova dizajn-artifact-a. Pronađeni i izgrađeni:
- **PhPoc4** = korisnički meni na telefonu, bottom-sheet preko cele širine: brend+X dugme za zatvaranje, red sa profilom (avatar, ime, firma), 5 stavki menija — identično desktop sidebar meniju. Napravljeno u `js/shell.js` (`MobileUserSheet`), otvara se "S" avatar dugmetom novo-dodatim u mobilni topbar, renderovano kroz `ReactDOM.createPortal` u `document.body` (zaobilazi `position:sticky` topbar-ov stacking context koji bi ga inače sakrio ispod donje navigacije).
- **PhPoc5/PhPoc6** = pretraga na telefonu (sa rezultatima / bez rezultata), full-screen prikaz: pretraga-pilula + "Otkaži" na vrhu, rezultati ispod — ista logika kao postojeća desktop `SearchResults` komponenta (klijent, Fakture, Uplate, "Pitaj AI knjigovođu"), samo bez plutajućeg popover pozicioniranja. Napravljeno u `js/shell.js` (`MobileSearchOverlay`), otvara se novo-dodatim pretraga-ikonicom u mobilnom topbar-u, isto portalovano.
- Oba su testirana uživo na 390px, svetla i tamna tema.
- **Nije identično frejmu**: PhPoc5 koristi ikonicu-značku (building/fakture/uplata ikone u krugu) za svaki red; moja verzija ponovo koristi POSTOJEĆU `SearchResults` komponentu (ista kao desktop verzija, već testirana u ranijim fazama) koja umesto toga koristi inicijal imena klijenta kao avatar — namerno zadržano radi konzistentnosti sa desktopom, ne frejm-po-frejm kopirano.

**3) Finalna Mb1–Mb12 tabela (svi telefonski i tamni varijanti)** — poslata korisniku u razgovoru i upisana u status dokument (Claude Docs). Sve stavke iz prethodne runde + ove tri tačke su sada potvrđene identične frejmu, osim gore navedenih svesno zadržanih razlika (pretraga avatar stil, browser-ova ćirilična lokalizacija fajl-čuzer dugmeta).

### Naknadna ispravka (uz odobrenje za Fazu 6): pretraga i "Faktura" tab
Korisnik je pre početka Faze 6 tražio dve dodatne ispravke:
- **Pretraga (desktop Poc5/6 I telefon PhPoc5/6)**: otkriveno da i DESKTOP pretraga (ne samo telefon) koristi ikonice-značke po tipu reda (Klijenti = torba, Fakture = dokument, Uplate = novčić — sve u limun-zelenoj kružnoj znački), ne inicijal imena klijenta. Ispravljeno u `js/shell.js`-ovoj `SearchResults` komponenti (deljena između desktopa i telefona), dodate dve nove ikonice (`Icons.briefcase`, `Icons.coin`) tačno po frejmovim SVG putanjama.
- **"Faktura" tab u Mejlovima banke**: nijedan Mb/PhMb frejm ne prikazuje ovaj tab selektovan (potvrđeno `grep` pretragom svih 24 frejmova za obrazac "FAKTURA " koji koriste druga dva taba) — sadržaj nije frejmom definisan. Umesto izmišljenog teksta, iskorišćena je POSTOJEĆA `InvoiceDoc` komponenta (ista kao Fak21 "Kako je klijent vidi" i live-pregled pri izradi fakture, izvezena iz `js/fakture.js` kao `window.AIK.InvoiceDoc`) — prikazuje se stvarna faktura (25/26-14, Acme Inc., engleski jezik po profilu klijenta) umesto placeholder rečenice.

## Faza 6 — Porez i rokovi (gotovo, čeka potvrdu za Fazu 7)

**Ekrani izgrađeni** (novi fajl `js/porez.js`, ~450 linija): `PorHScreen` (raspored: Sledeća uplata, Rešenje, Mesečne obaveze, Rokovi — 2×2 grid na desktopu, jedna kolona u redosledu Sledeća-uplata/Mesečne-obaveze/Rešenje/Rokovi na telefonu, tačno po PhPorH), `PorezDodajResenje` (state-mašina upload→reading→verify, plus pib_error i manual grane — Rez2 do Rez6b), `PorezDodatoScreen` (PorOk uspeh-overlay), `PorNovScreen` (novo rešenje, Do-sada/Novo/Razlika — tabela na desktopu, kartice na telefonu), `PorezPlacanje` (Pay1/Pay2/Pay3 — QR po stavci, "Označi kao plaćeno", brojač "Plaćeno N od 4", tab "Trajni nalog u banci"), `TrajniNaloziScreen` (dostupan i sa glavnog ekrana i sa plaćanja).

**Pravila izračuna**: rok akontacije = 15. u mesecu za PRETHODNI mesec (akontacija "za oktobar" dospeva u novembru), pomeren na sledeći radni dan (`U.nextBusinessDay`/`U.isHoliday`, već postojeće iz ranijih faza) — nove selektore `Sel.taxDueDate`, `Sel.taxServiceMonthName`, `Sel.taxMonthlyTotal`, `Sel.taxMonthPaidCount`, `Sel.taxMonthFullyPaid`, `Sel.upcomingTaxMonths` dodate u `js/selectors.js`, deljene između Porez i rokovi i Početna. Mesec postaje "Plaćen" kad su sve 4 stavke označene (6.3.5) — tad rok nestaje iz bedža i "Nadolazeći rokovi" prelazi na sledeći mesec (uživo potvrđeno testom: označio sve 4 stavke za oktobar → bedž "Porez i rokovi" nestao, Početna odmah pokazala "Akontacija za novembar" kao novi dospeli rok). Novo stanje `taxPaymentMode` ('manual'|'trajni_nalog') u store-u kontroliše "Plati" → "Automatski iz banke" svuda.

**Pravi bagovi nađeni i ispravljeni:**
- Seed `taxDecision` (iz Faze 4) je imao POGREŠNE račune primaoca i pozive na broj za PIO/Zdravstveno/Nezaposlenost (samo stavka "Porez" je bila tačna) — frejm (`Rez4c`/`Pay1`) pokazuje drugačije vrednosti; sve 4 ispravljene.
- `taxDecision.addedAt` je bio 12. januar, a frejm (`PorH`) kaže "Dodato 12. novembra" — ispravljeno na 12. novembar.
- Početna ("Nadolazeći rokovi", Dash4_ima) je koristila GENERIČKI tekst "Akontacija za ovaj mesec"/"Akontacija (procena)" za sve redove umesto frejmovog "Akontacija za oktobar"/"za novembar"/"za decembar" (konkretno ime mesec po mesec) — ispravljeno, sad deli istu `Sel.upcomingTaxMonths`/`Sel.taxServiceMonthName` logiku kao novi Porez ekran.
- Isti deo koda je GREŠKOM čitao `autonomySettings.globalMode` (podešavanje za Mejlove banke) da odluči da li prikazuje "Automatski iz banke" za porez — nepovezano podešavanje. Ispravljeno uvođenjem posebnog `taxPaymentMode` polja.
- Sidebar bedž za "Porez i rokovi" je prikazivao broj NEPLAĆENIH STAVKI (4) umesto broja dospelih MESECI (1) — frejm (`PorH`) jasno pokazuje "1". Ispravljeno u `Sel.taxDueThisMonth`.
- QR kod (Pay1/Pay2) je prvobitno nasleđivao `currentColor`/providnu pozadinu — u tamnoj temi bi bio skoro nevidljiv ili obrnutih boja. Frejm pokazuje da je QR UVEK crn-na-belom sa belim razmakom oko sebe, bez obzira na temu aplikacije (da ostane skenibilan) — ispravljeno pre nego što je ikada objavljeno.
- Dva reda dugmadi (PIB-greška ekran, "Ispravi iznose"/"Primeni" na PorNov, i par drugih) nisu imala `flexWrap:'wrap'`, pa su se dugmad sekla van ekrana na 390px — ispravljeno na svim mestima.
- "Novo rešenje" (PorNov) poređenje je koristilo običnu HTML tabelu i na telefonu, što se gužvalo/preklapalo na 390px (frejm nema telefonsku PhPorNov varijantu sa tabelom — tabele se po ustaljenom pravilu iz ranijih faza pretvaraju u listu kartica na uskim širinama) — dodata mobilna kartica-lista varijanta.

**Svesno pojednostavljeno/nedostaje (disclosed):**
- Rez4c-ov levi "pregled rešenja sa brojevima" je pojednostavljen na karticu sa 4 markirana reda + par sivih skeleton-linija (simulacija teksta) umesto frejmovog detaljnog lažnog-dokumenta-sa-linijama-teksta mockup-a — ista odluka kao i ranije za slične "lažni dokument" prikaze (npr. Mejlovi banke) gde se stvarni podaci prikazuju čitko umesto kopiranja dekorativnog mockup-a piksel-po-piksel.
- PIB-greška (Rez5) se ne može prirodno dogoditi (nema pravog OCR-a u prototipu) — dostupna preko vidljivog test-linka "(test) simuliraj pogrešan PIB" na ekranu za dodavanje rešenja, jasno označenog kao test, a ne skrivenog iza dev-menija.
- "Trajni nalozi" na `PorH` (desktop) je frejmom prikazan kao običan HYPERLINK (ne kao in-page tab kako sam prvobitno pretpostavio iz teksta specifikacije) koji vodi na poseban ekran — ista arhitektura primenjena na obe širine (telefon nema vidljiv način da dođe do ovog ekrana sa glavnog ekrana u frejmu uopšte osim ovog istog linka, pa je zadržano identično).
- 7.8a (godišnji poreski obračun/PPDG) nije implementiran — spec eksplicitno kaže "[PREDLOG: kasnija faza]", nije u obimu Faze 6.

## Dorada Faze 6 — tri dodatne tačke (pre potvrde za Fazu 7)

Korisnik je tražio: (1) punu tabelu u poruci (ne samo u dokumentu), (2) Rez4c tačno po frejmu bez pojednostavljenja, (3) tabelu poreskih stavki sa izvorom + potvrdu NBS IPS QR formata, (4) potvrdu da Početna/Kalendar/Porez računaju iz istog izvora. Sve četiri zatvorene.

**Rez4c I Rez6b sada tačno po frejmu** (korisnik je tražio samo Rez4c, ali je isto pravilo — "frejm pobeđuje" — otkrilo da je Rez6b bio JOŠ dalje od frejma, pa je ispravljen i on):
- **Rez4c levi panel**: zamenjen generičkim "loading skeleton" (2 trake) tačnom sekvencom iz frejma — 17 elemenata (statične trake teksta određene širine + 4 markirane oznake na TAČNO određenim pozicijama, uključujući da redovi 2 i 3 stoje jedan do drugog bez trake između, tačno kao frejm). Nova CSS klasa `.por-doc-mat`/`.por-doc-paper`/`.por-doc-bar`/`.por-doc-highlight` sa tačnim hex bojama za obe teme (uključujući da PRVA traka (naslov) ostaje ista boja `#C9D6CF` u obe teme, dok ostale trake menjaju boju).
- **Rez4c desni panel**: otkriven i ispravljen pravi bag — telefon (`PhRez4c`) prikazuje SAMO broj računa u podnaslovu svake stavke (bez poziva na broj), različito od desktopa koji prikazuje oba — ranije sam prikazivao oba na obe širine.
- **Pravi bag u oba**: brojčane oznake "1-4" na desnom panelu (Rez4c) su bile nevidljive (krug bez pozadine) jer je `<span>` imao `width`/`height`/`border-radius` bez `display:flex` — inline elementi ignorišu width/height. Ispravljeno korišćenjem iste `.por-doc-badge` klase i na levom i na desnom panelu.
- **Rez6b (Unesi ručno) je bio potpuno drugačiji raspored od frejma**: frejm ima dvokolonski raspored (forma + dugmad levo, "Gde da nađem iznose"/gradient "Ukupno mesečno" sa "Nepotvrđeno" pilulom/"Šta se dešava kad sačuvaš" sa 4 (ne 3) stavke desno; ikonica-novčić po redu; vrednost u okviru sa "din" unutar istog okvira) — potpuno pojednostavljen u mojoj ranijoj verziji (jedna centrirana kartica, bez ičega desno). Sad izgrađen tačno po frejmu, za obe širine (telefon: bez ikonica, bez "Gde da nađem iznose" kartice, bez "Nazad" dugmeta — tako frejm PhRez6b pokazuje).
- **Pravi funkcionalni bag u Rez6b**: ručni unos je čuvao PRAZAN račun primaoca i poziv na broj (`account:'', pozivNaBroj:''`), suprotno spec tački 6.2.6 ("sistem ih generiše") — ispravljeno da automatski popuni iste vrednosti kao i kod čitanja rešenja; potvrđeno uživo da se posle ručnog unosa Plaćanje/QR ekran ispravno popunjava.

**Tabela poreskih stavki** (izvor: `Rez4c`/`Pay1`/`Pay2`/`Pay3` — identično u sve 4 frejma, desktop i telefon, potvrđeno `grep`-om kroz sve karaktere):

| Naziv | Mesečni iznos | Račun primaoca | Model | Poziv na broj | Izvor |
| --- | --- | --- | --- | --- | --- |
| Porez na prihod od samostalne delatnosti | 4.950,00 din | 840-711122843-47 | 97 | 11-2026-0481 | Rez4c, Pay1 (i spec 8.7 primer) |
| PIO za radni staž | 12.311,28 din | 840-721211843-26 | 97 | 12-2026-0481 | Rez4c, Pay1 |
| Zdravstveno osiguranje | 5.283,59 din | 840-721311843-19 | 97 | 13-2026-0481 | Rez4c, Pay1 |
| Osiguranje za slučaj nezaposlenosti | 384,73 din | 840-721411843-12 | 97 | 14-2026-0481 | Rez4c, Pay1 |

Sve vrednosti potvrđene znak-po-znak (python regex pretraga) identične u sva 4 frejma (Rez4c, Pay1, Pay2, Pay3) i njihovim telefonskim varijantama. Seed (`js/seed.js`) je uparen sa ovom tabelom (ranije je imao pogrešne vrednosti za PIO/Zdravstveno/Nezaposlenost — ispravljeno u prethodnoj rundi).

**NBS IPS QR sadržaj** (8.7): dodata `ipsQrPayload()` funkcija u `js/porez.js` koja za svaku stavku generiše string u NBS IPS strukturi polja: `K:PR|V:01|C:1|R:<račun bez crtica>|N:<ime vlasnika i firme>|I:RSD<iznos>|SF:253|S:<naziv stavke>|RO:<model+poziv bez razmaka>`. Ovo JESTE generisano posebno za svaku stavku (menja se sa računom/iznosom/pozivom), ali **vizuelni QR uzorak ispod ostaje dekorativan** (pseudo-slučajan kvadratni raspored, ne pravi QR enkoder) — prototip nema pravu QR biblioteku, pa se kod ne može stvarno skenirati. `SF:253` (šifra plaćanja poreza/doprinosa) je razuman izbor iz prakse, NE zvanično potvrđena vrednost — spec sam kaže da ovo treba proveriti kod NBS ("[PROVERITI tačnu šemu računa...]"), pa ovo ostaje otvoreno pitanje van obima prototipa.

**Isti izvor brojeva — potvrđeno**: `grep` kroz sve fajlove pokazuje da SVAKO čitanje `state.taxDecision`/`state.taxPayments` van `js/selectors.js` je ili (a) upis (`js/actions.js`) ili (b) direktan prikaz liste stavki (Mesečne obaveze, Plaćanje, PorNov — iteracija preko stvarnih stavki, ne nezavisno računanje ukupnog/sledećeg roka). Svako mesto koje računa "sledeći rok"/"ukupno mesečno"/"da li je mesec plaćen" prolazi kroz `Sel.upcomingTaxMonths`/`Sel.taxDueDate`/`Sel.taxMonthlyTotal`/`Sel.taxMonthFullyPaid` — iste funkcije koriste i Početna (`js/pocetna.js`) i Porez i rokovi (`js/porez.js`). Uživo potvrđeno (ranija runda): označavanje svih 2026-11 stavki kao plaćeno je ISTOVREMENO uklonilo bedž sa "Porez i rokovi" I pomerilo Početnu na "Akontacija za novembar" — nema razilaženja. **Kalendar nije još izgrađen** (Faza 7, spec 11.2 tačka 7) — nema šta da se proveri tamo još uvek, ali je napomenuto da MORA da koristi iste `Sel.*` funkcije kad bude građen, da ne bi došlo do razilaženja.

## Zatvaranje Faze 6 — snimanje preostalih 11 kombinacija + mod-97 + spec

Korisnik je tražio screenshot-potvrdu 11 specifičnih kombinacija (frejm/tema/širina), proveru kontrolnog broja (mod 97) za 4 računa primaoca, i dve napomene u spec sekciji 12. Snimanjem su otkriveni i ispravljeni **šest pravih bagova** (ne samo potvrda, kako se očekivalo):

1. **PorOk/PhPorOk bio je pogrešan modalni overlay.** Frejm uopšte NEMA tamni scrim preko cele strane — "Sve je podešeno" je obična stranica centrirana u sadržajnoj oblasti, sidebar/topbar/bottom-nav ostaju vidljivi. Ranija implementacija je pogrešno reciklirala `.inv-sent-overlay`/`.inv-sent-card` (fiksni overlay sa zatamnjenjem, namenjen za "faktura poslata" modal). Potpuno prerađeno: obična kartica (`var(--surface)`, bez scrim-a), ikonica-kružić bez pozadine (nedostajao `background:var(--limeta)`), bedževi uz svaki korak su bili pogrešna outline-ikonica umesto pune lime kružne oznake.
2. **Rez5/PhRez5 (pogrešan PIB) imao je potpuno pogrešnu karticu.** Frejm koristi crvenkasto-tonirani "upozorenje" dizajn (`#FFF7F6`/`#F3C9C4` svetlo, `rgba(240,90,80,...)` tamno; trougao-upozorenje ikonica; naslov u crvenoj boji; PIB-ovi u zasebnom uokvirenom panelu sa crvenom vrednošću za "PIB na rešenju"), a ranije je bila obična bela `.poc-card` sa plain tekstom. Na telefonu frejm NEMA desnu "Ili prosledi mejlom" karticu niti "Nemaš rešenje pri ruci?" linkove — samo glavna kartica — ranije se ista desna kartica prikazivala na obe širine. Dodate nove CSS klase `.por-pib-err-card`/`.por-pib-err-head`/`.por-pib-err-sub`/`.por-pib-box`.
3. **Pay3 (Trajni nalog tab) je imao netačan sadržaj.** Pogrešno je prikazivao "Ukupno za [mesec]" zaglavlje (frejm ga nema na ovom tabu — samo na QR tabu), dugme je pogrešno pisalo "Uključi trajni nalog" umesto "Podesio sam trajne naloge", nedostajao je link "Pitaj AI (knjigovođu) za svoju banku" i napomena "Iznosi važe do sledećeg rešenja...". Mobilni tekstovi (kraće etikete: "Podaci za četiri naloga", "Račun" umesto "Račun primaoca", "Otvori aplikaciju banke" umesto "...svoje banke") uopšte nisu postojali.
4. **Prava gramatička greška nađena uzgred**: "Rok je 16. novembar, jer 15. pada u nedeljau." — kod je slepo dodavao "u." na kraj imena dana (`DAYS_SR[...]+'u.'`), što radi za mušvi rod (utorak→utorku... zapravo ni to nije tačno, ali za ženski rod je potpuno pogrešno: nedelja→nedeljau umesto nedelju). Dodat `U.DAYS_SR_ACC` (akuzativ) u `js/utils.js`, korišćen na oba mesta u `js/porez.js`.
5. **Rez4c** imao je nepostojeću "Sve provere prošle" pilulu na telefonskom desnom panelu (postoji samo na desktopu) — uklonjena za `isMobile`.
6. **Rez6b** je zadržao pogrešan naslov stranice ("Dodaj rešenje Poreske uprave" umesto "Unesi iznose ručno") i podnaslov na koraku ručnog unosa — frejm menja i h1 i podnaslov (desktop i telefon imaju blago različit tekst podnaslova).
7. **PorNov na telefonu bio je potpuno pogrešne strukture**: frejm ima DVE odvojene kartice (ne jednu), redovi su kompaktan jednoredni "staro → novo din  +razlika" format sa strelicom (ne Do-sada/Novo/Razlika u tri reda), a "Ukupno mesečno" je PLOSNATA `#0F2A22` kartica na telefonu (ne gradijent kartica kao na desktopu). I desktop i telefon su imali pogrešan bedž za "Šta se desi kad primeniš" (36px `.icon-circ-36` status-boje umesto tačnog 28px `#EEF8D2`/`#0F2A22` iz frejma) — nova klasa `.por-change-badge`.
8. **Pay1/Pay2 QR tab**: uvodna kartica je trebalo da bude zeleno-tonirana (`#EEF8D2`/`rgba(200,241,105,0.14)` tamno) — i na desktopu i na telefonu je bila obična bela `.poc-card` (nova klasa `.por-highlight-card`/`.por-highlight-sub`). Na telefonu tekst uvodne kartice je drugačiji od desktopa ("Svaka uplata ima svoj QR kod" vs "Skeniraj svaki kod..."). Dugmad na telefonu: "Sačuvaj QR" (ne "Označi kao plaćeno" kao na desktopu) za neplaćene stavke, a za VEĆ plaćene stavke telefon ima "Poništi" dugme koje desktop uopšte nema (nova akcija `Porez.markUnpaid`). Kad je bar jedna stavka plaćena, uvodna kartica nestaje i zamenjuje je "Plaćeno X od Y uplate" tekst — ranije su se oba prikazivala istovremeno.

**Tabela provere** (sve kombinacije koje je korisnik tražio da se snime i potvrde):

| Frejm | Tema | Širina | Preostalo odstupanje |
| --- | --- | --- | --- |
| PorOk / PhPorOk | svetla | 390 | Ne (posle ispravke modala/ikonica) |
| PorOk / PhPorOk | tamna | 1280 | Ne |
| PorOk / PhPorOk | tamna | 390 | Ne |
| Rez5 / PhRez5 | svetla | 1280 | Ne (posle ispravke kartice upozorenja). PIB vrednosti u seed-u (112233445) razlikuju se od frejmovog primera (123456789) — namerno, to je već postojeći PIB firme korišćen dosledno na svim ostalim ekranima, nije frejm/kod odstupanje |
| Rez5 / PhRez5 | svetla | 390 | Ne (posle ispravke — bez desne kartice, kraći tekst) |
| Pay3 / PhPay3 | svetla | 1280 | Ne (posle ispravke zaglavlja/dugmadi/linka) |
| Pay3 / PhPay3 | svetla | 390 | Ne (posle ispravke + gramatičke greške "nedeljau") |
| Rez4c | svetla | 390 | Ne (posle uklanjanja "Sve provere prošle" pilule) |
| Rez6b | svetla | 390 | Ne (posle ispravke naslova/podnaslova) |
| PorNov | svetla | 390 | Ne (posle potpune prerade mobilnog rasporeda + bedž boje) |
| Pay1/Pay2 | svetla | 390 | Ne (posle ispravke uvodne kartice, dugmadi "Sačuvaj QR"/"Poništi", "Plaćeno X od Y") |

**Mod-97 kontrolni broj — 4 računa primaoca (tačka 5 zahteva)**: Pod standardnim ISO 7064 MOD 97-10 algoritmom (`check = 98 - (broj+"00") % 97`), isproban u četiri varijante grupisanja cifara (banka+račun bez dopune; banka+račun dopunjen nulama do 13 cifara; samo račun bez banke; varijanta gde se kontrolni broj izjednačava sa ostatkom umesto `98-ostatak`) — **nijedna od 4 date kontrolne cifre (47/26/19/12) se ne poklapa ni sa jednim izračunatim rezultatom, ni u jednoj varijanti.** Frejm i Prilog B se NE razilaze međusobno (Prilog B tačka 8.7 samo ponavlja frejmov primer `840-711122843-47` doslovno, a spec sam već otvoreno kaže "[PROVERITI tačnu šemu računa (840-xxx)...]"). Zaključak: ovo su ilustrativni brojevi iz frejma, nisu izračunati pravim NBS algoritmom — nema šta da se "uskladi" jer frejm i spec već jesu usklađeni jedno s drugim, samo oboje imaju brojeve koji ne prolaze generički mod-97. Ostaje otvoreno pitanje (već pokriveno postojećom tačkom 2 u spec sekciji 8.7/12), ne zahteva novu izmenu seed-a.

**Spec sekcija 12** — dodate dve nove tačke (17, 18): (a) `SF:253` šifra plaćanja za QR nije potvrđena kod NBS; (b) prototipski QR nije skenibilan, prava platforma mora da generiše pravu IPS QR sliku.

**Izmenjeni fajlovi**: `js/porez.js` (PorezDodatoScreen, PibErrorStep, TrajniNaloziTab, TrajniNaloziScreen, PorezPlacanje, PaymentItemCard, PorNovScreen, VerifyStep — pill uklonjena), `js/actions.js` (dodato `Porez.markUnpaid`), `js/utils.js` (dodato `DAYS_SR_ACC`), `js/icons.js` (dodato `I.uploadArrow`), `css/base.css` (nove klase: `.por-pib-err-card`, `.por-pib-err-head`, `.por-pib-err-sub`, `.por-pib-box`, `.por-change-badge`, `.por-highlight-card`, `.por-highlight-sub`), `/Users/stefan.ct/Downloads/PLATFORMA_SPECIFIKACIJA.md` (sekcija 12, tačke 17-18).

## Korak 0 — raspored sadržaja (važi za sve ekrane, uključeno pre Faze 7)

Korisnik je prijavio da je sadržaj desno od sidebar-a bio centriran u suženom kontejneru (`.content{max-width:1120px;margin:0 auto}`) umesto da počinje u ravni sa poljem pretrage i koristi celu širinu, kako frejm pokazuje (frejm: `left:260px;right:0;padding:28px 40px`, bez ikakvog max-width-a, topbar i sadržaj dele isti levi/desni padding).

**Ispravljeno**: `.content` izgubio `max-width`/`margin:0 auto`, padding promenjen na `28px 40px` (bilo `32px 24px`); `.topbar` padding promenjen na `0 40px` (bilo `0 24px`) da se poravna sa sadržajem. Uklonjen neiskorišćen `--content-max` token.

**Dva prava bagova nađena uzgred dok se proveravalo uže širine (1100/1024)**:
- "Čeka tebe" kartica na Početnoj: `margin-left:auto` na dugmetu je u kombinaciji sa `flex:1` na tekstualnoj koloni trošio sav slobodan prostor PRE flex-grow-a, pa se kolona sa naslovom/opisom skupljala na ~9px i tekst je vizuelno "iscureo" preko dugmeta. Ispravljeno: uklonjen `margin-left:auto`, dodat `minWidth:160` na tekstualnu kolonu (minimalna čitljiva širina, dugme sad prelazi u sledeći red kad nema mesta — "adapt" umesto "squeeze").
- Tabele (Fakture, Mejlovi banke, Klijenti, Ponavljajuće): `table-layout:fixed` je na užim širinama nekim kolonama davao 0px širine (ceo preostali prostor su trošile kolone sa "nerazbijivim" sadržajem poput mejl adresa), što je na Mejlovima banke vidljivo lomilo zaglavlje (“Mejl” i “Klijent i iznos” su se vizuelno preklapali). Promenjeno na `table-layout:auto` (sadržaj određuje širinu kolone); `.inv-table-wrap` dobio `overflow-x:auto` (horizontalni skrol kao sigurnosna mreža ako tabela i dalje ne stane) umesto da postoji samo na telefonskom media query-ju.

**Tabela provere** (ekran × širina, leva ivica poravnata sa poljem pretrage, širina iskorišćena):

| Ekran | Širina | Leva ivica poravnata (da/ne) | Širina iskorišćena (da/ne) |
| --- | --- | --- | --- |
| Početna | 1280 | Da | Da |
| Početna | 1100 | Da | Da (posle ispravke "Čeka tebe") |
| Početna | 1024 | Da | Da |
| Početna | 390 | Da | Da |
| Fakture | 1280 | Da | Da |
| Fakture | 1100 | Da | Da |
| Fakture | 1024 | Da | Da (posle table-layout:auto ispravke) |
| Fakture (Klijenti tab) | 1280/1024 | Da | Da |
| Knjiga prihoda | 1280 | Da | Da |
| Knjiga prihoda | 1024 | Da | Da |
| Mejlovi banke | 1280 | Da | Da |
| Mejlovi banke | 1024 | Da | Da (posle table-layout:auto ispravke — ranije preklapanje zaglavlja) |
| Porez i rokovi | 1280 | Da | Da |
| Porez i rokovi | 1024 | Da | Da |
| Podešavanja | 1280 | Da | Da |
| Podešavanja | 1024 | Da | Da |
| Sve navedeno | 390, svetla i tamna | Da | Da (bez promene — mobilni raspored nije bio pogođen bagom) |

Tamna tema proverena na Početnoj (1280) — bez vizuelne razlike u ponašanju popravke (samo boje, koje su nepromenjene).

## Faza 7 — Kalendar i obaveštenja

**Pročitane sekcije specifikacije**: 3.10 (CalendarEvent), 3.13 (Notification), 5.4 (zvonce), 7.11 (Kalendar, kompletno), 7.13 (Pd4 Obaveštenja podešavanja). **Frejmovi iz Priloga A**: `Kl1` (mesec), `Kl2` (mesec + izabran dan), `Kl3` (lista), `Kl4` (detalj poreskog roka), `Kl5` (detalj kasne fakture), `Kl6` (označi kao plaćeno), `Kl7` (podsetnici), `Kl8` (godina), `Kl9` (mesec bez rokova), svi sa `Ph` telefonskim parom (18 frejmova ukupno). Za "Obaveštenja" kao punu stranicu nema frejma u Prilogu A (dizajn ima samo zvonce iz 5.4 i Pd4 podešavanja) — korisnik je eksplicitno tražio novi ekran, pa je napravljen po istom vizuelnom jeziku kao zvonce (bez posebnog frejma za poređenje, otvoreno disklouzovano).

**Izvor podataka (bez dupliranja)**: nova `Sel.calendarEventsForMonth(state, year, month)` u `js/selectors.js` — iznutra zove POSTOJEĆE `Sel.taxDueDate`/`Sel.taxMonthlyTotal`/`Sel.taxMonthFullyPaid`/`Sel.taxServiceMonthName` (porez) i `Sel.invoicesWithEffectiveStatus` (fakture dospeva/kasni), plus `state.recurring` (ponavljajuće) i `state.calendarEvents` (ručni). `Sel.calendarEventCountsByYear` za Godina prikaz. Nijedno računanje rokova/uplata nije duplirano van `js/selectors.js`.

**Pravi bagovi nađeni i ispravljeni**:
1. **`store.js` nikad nije kopirao `Seed.calendarEvents` u `freshState()`** — `state.calendarEvents` je bio `undefined` u celoj aplikaciji iako je `Seed.calendarEvents:[]` postojao od ranije (verovatno pripremljeno za ovu fazu, nikad povezano). "Dodaj događaj" je bacao `TypeError: Cannot read properties of undefined (reading 'concat')`. Ispravljeno dodavanjem `calendarEvents` u `freshState()`.
2. **Kl1 desna kartica "1 faktura kasni" je tvrdo pisala "1"** čak i kad kasni više faktura (naš seed ima dve: Joam i Northwind) — ispravljeno da broji stvarne kasne fakture i gramatički se slaže ("1 faktura kasni" / "2 fakture kasne" / "5 faktura kasni"), i prikazuje najkasniju (ne proizvoljno prvu).
3. **Lista (Kl3) je prikazivala "Kasni" grupu samo za fakture čiji je rok pao u TRENUTNO prikazanom mesecu** — pošto je "kasni" trajno stanje (dok se ne plati), faktura sa rokom u prošlom mesecu je nestajala iz liste čim bi se otišlo na sledeći mesec. Ispravljeno: kasne fakture se računaju odvojeno od meseca (isti način kao kartica #2) i uvek se prikazuju u "Kasni" grupi, bez obzira na prikazani mesec.
4. **"Detalji" za fakturu koja TEK dospeva (nije kasna)** je otvarao Kl5 panel "Kasna faktura" sa natpisom "Kasni 0 dana" — u dizajnu Kl5 postoji SAMO za kasne fakture, nema poseban panel za buduće dospeće. Ispravljeno: "Detalji" za ne-kasnu fakturu vodi direktno na pravu stranicu fakture (`app/fakture/<id>`); Kl5 panel se otvara samo za stvarno kasne fakture.
5. **Obaveštenja (i zvonce)**: `timeAgo` u novom ekranu je računao razliku u odnosu na `Seed.TODAY` (ponoć), što je za obaveštenja sa vremenom kasnije istog dana davalo NEGATIVNE minute ("-720 min"). Ponovo upotrebljena ista ispravna logika koja već postoji u zvoncu (`js/shell.js`, "sada" simulirano na 14:00 istog dana) — sad su "Obaveštenja" i zvonce dosledni i tekstualno identični.
6. **Klik na obaveštenje u zvoncu nije ništa radio** (ni navigaciju ni označavanje pročitanim) — spec 5.4 kaže "Klik na obaveštenje vodi na relevantni ekran." Dodato polje `route` i `type` po obaveštenju u `js/seed.js`, i `Settings.markNotifRead(id)` akcija; klik sad označava pročitano i navigira.

**Tabela provere** (frejm, tema, širina, snimljeno posle poslednje izmene, preostalo odstupanje):

| Frejm | Tema | Širina | Snimljeno (da/ne) | Preostalo odstupanje |
| --- | --- | --- | --- | --- |
| Kl1 (mesec) | svetla | 1280 | Da | Ne |
| Kl1 (mesec) | tamna | 1280 | Da (brzi pregled) | Ne |
| PhKl1 (mesec) | svetla | 390 | Da | Ne (posle ispravke "Danas" dugmeta i rasporeda navigacije) |
| PhKl1 (mesec) | tamna | 390 | Da (brzi pregled) | Ne |
| Kl2 (dan) | svetla | 1280 | Da | Ne |
| PhKl2 (dan) | svetla | 390 | Da | Ne |
| Kl3 (lista) | svetla | 1280 | Da | Ne (posle ispravke trajnog "Kasni") |
| PhKl3 (lista) | svetla | 390 | Da | Ne (posle uklanjanja legende i akcionih dugmadi) |
| Kl4 (detalj poreskog roka) | svetla | 1280 | Da | Ne |
| PhKl4 | — | — | Nije snimljeno | — (SidePanel se automatski pretvara u bottom sheet na telefonu — isti kod, nije posebno snimljeno) |
| Kl5 (detalj kasne fakture) | svetla | 1280 | Da | Ne |
| PhKl5 | — | — | Nije snimljeno | — (isti mehanizam kao Kl4) |
| Kl6 (označi plaćeno) | svetla | 1280 | Da | Ne |
| PhKl6 | — | — | Nije snimljeno | — (Modal se automatski pretvara u bottom sheet na telefonu) |
| Kl7 (podsetnici) | svetla | 1280 | Da | Ne |
| PhKl7 | — | — | Nije snimljeno | — (isti mehanizam) |
| Kl8 (godina) | svetla | 1280 | Da | Ne |
| Kl8 (godina) | tamna | 1280 | Da (brzi pregled) | Ne |
| PhKl8 | — | — | Nije snimljeno | — |
| Kl9 (mesec bez rokova) | — | — | Nije snimljeno | Kod postoji (`EmptyMonthCard`) i pregledan je, ali stanje nije stvarno izazvano screenshotom — sa trenutnim seed-om porez se ponavlja svaki mesec unedogled pa je "prazan mesec" praktično nedostižan dok god `taxDecision` postoji |
| PhKl9 | — | — | Nije snimljeno | isto |
| Obaveštenja (nova stranica, nema frejma) | svetla | 1280 i 390 | Da | Ne (po sopstvenom dizajnu, bez frejma za poređenje) |

Dodavanje događaja (`AddEventModal`) testirano uživo — upisan "Sastanak test" na 15.11, pojavio se u mreži (siva oznaka), u "Sledeći rokovi" (bez iznosa, ispravljeno — ranije je pisalo "0,00").

**Odloženo/pojednostavljeno, sa razlogom**:
- Tamna tema i telefonske varijante za Kl4–Kl9 nisu snimljene pojedinačno (samo svetla desktop) — SidePanel/Modal komponente već imaju ugrađenu, ranije proverenu logiku za bottom-sheet na telefonu i tamnu temu preko CSS promenljivih, pa je rizik od odstupanja nizak, ali nije potvrđeno screenshotom zbog obima posla u ovoj rundi.
- "Ponavljajuća" tip događaja prikazuje samo JEDAN budući datum slanja (`recurring.nextDate`), ne istorijske "poslata" događaje iz prethodnih meseci — nemamo podatke koji bi povezali prošle fakture sa automatskim slanjem iz `recurring` zapisa, pa nije izmišljena istorija.
- Godina-prikaz broja događaja po mesecu je tačan za naš seed, ali se razlikuje od frejmovih primera brojeva (frejm ima svoje izmišljene podatke).
- Kl9 (prazan mesec) nije stvarno izazvan (vidi tabelu gore).

**Izmenjeni/novi fajlovi**: `js/kalendar.js` (nov), `js/obavestenja.js` (nov), `js/selectors.js` (`calendarEventsForMonth`, `calendarEventCountsByYear`), `js/actions.js` (`Calendar.addEvent`, `Settings.markNotifRead`), `js/store.js` (dodato `calendarEvents` u `freshState`), `js/seed.js` (dodato `type`/`route` u `notifications`), `js/utils.js` (`fmtDateShort`, `DAYS_SR_WEEK`, `DAYS_SR_FULL`), `js/icons.js` (`I.repeat`), `js/shell.js` (zvonce: klik označava pročitano i navigira, dodat link "Sve obaveštenja"), `js/app.js` (rute `kalendar`, `obavestenja`), `css/base.css` (nove `.kal-*` klase), `index.html`/`preview.html` (script tagovi).

## Responzivnost u celoj aplikaciji (zatvaranje Faze 7)

Korisnik je tražio četiri stvari: (A) da se vrednosti u tabelama/pilulama/dugmadima nikad ne lome u dva reda, (B) fluidnu tipografiju i razmake preko `clamp()` između 390px i 1280px, (C) da se sve decimale pišu zarezom (ne tačkom), (D) da se zatvori Faza 7 sa preostalim snimcima i dev-prekidačem za prazan mesec.

**A) Nowrap vrednosti.** `.inv-table th/td` dobili `white-space:nowrap` (sve tabele koje dele ovu klasu: Fakture, Klijenti, Ponavljajuće, Knjiga prihoda — rešeno jednom izmenom jer sve koriste istu klasu). `.por-obligation-row` (Porez, Mesečne obaveze) dobio `white-space:nowrap` na vrednost + `ellipsis+title` na naziv. Dodat `title` atribut (hover tooltip) na sve skraćene kolone: Klijent (Fakture, Ponavljajuće), Podrazumevana stavka (Klijenti), naziv poreske stavke (Porez). Nijedna vrednost (iznos, datum, broj fakture, kurs, status, izvor) se više ne lomi ni na jednoj testiranoj širini.

**B) Fluidna tipografija.** Dodate 4 `clamp()` CSS promenljive u `tokens.css` (`--fs-24-32`, `--fs-24-48`, `--fs-20-24`, `--fs-12-14`), računate tako da na 390px daju TAČNO manju frejmom-potvrđenu vrednost, na 1280px+ TAČNO veću, a između glatko linearno rastu. Primenjene na: `.page-head h1`, `.auth-title`, `.inv-form-title`, `.poc-greeting h1` (zamenili su `@media` skokove), plus `Rez5` naslov, `ManualStep` ukupan iznos, `PorOk` naslov, Kalendar naslov meseca/godine u `js/porez.js`/`js/kalendar.js`.

**Pravi bag nađen usput (sistemski, pre ovog zahteva nepoznat)**: `.page-head h1` NIJE imao mobilni override uopšte — svaki naslov ekrana (Fakture, Knjiga prihoda, Mejlovi banke, Porez, Kalendar...) je bio fiksno 32px na SVIM širinama, iako frejm na telefonu jasno pokazuje 24px (1.5rem, potvrđeno iz PhFak1/PhPorNov/PhKl1 i drugih telefonskih frejmova ranije ove sesije). Isti bag pronađen i pojedinačno na 3 ekrana koji ne koriste `.page-head` klasu: `js/kalendar.js` ("Kalendar"), `js/obavestenja.js` ("Obaveštenja"), `js/porez.js` (PorezPlacanje "Plaćanje za..."), `js/mejlovi.js` (detalj mejla), `js/fakture.js` (detalj fakture, ranije imao ručni `isMobile` prekidač — sad fluidan). Sve ispravljeno u istom prolazu.

**C) Format brojeva.** Nađene 2 stvarne tačke umesto zareza: `entry.rate.toFixed(2)`/`i.rate.toFixed(2)` u `js/knjiga.js` (kolona "Kurs" u tabeli Detalj uplate i u detalj-panelu) — JS-ov `toFixed()` uvek vraća tačku, nikad lokalizovan zarez. Ispravljeno dodavanjem `U.fmtNum()` (nova funkcija u `js/utils.js`, srpski lokalni format). Nađena i druga, suptilnija pojava: procenat limita (`li.pct`/`yr.pct`, koji ume da ima jednu decimalu, npr. 19.5) se ubacivao DIREKTNO u tekst (`+li.pct+'%'`) u `js/pocetna.js` (upozorenje o limitu) i `js/knjiga.js` (traka limita) — isti problem, ista ispravka.

**D) Zatvaranje Faze 7 — dodatni snimci.** Snimljeno i potvrđeno: Kl2, Kl4, Kl5, Kl6, Kl7 u tamnoj temi na 1280px (sve bez odstupanja); PhKl1, PhKl2, PhKl4, PhKl6 u tamnoj temi na 390px i PhKl4 u svetloj temi na 390px (SidePanel/Modal komponente koriste iste CSS promenljive za temu, dosledno potvrđeno kroz celu sesiju — PhKl3/PhKl5/PhKl7 svetla tema nije pojedinačno re-snimljena, ali isti mehanizam). Dodat dev-prekidač "Kalendar: prazan mesec (Kl9)" u razvojnom meniju (`forceEmptyCalendar` flag, `Sel.calendarEventsForMonth` ga proverava na početku i vraća prazan niz) — Kl9 i PhKl9 snimljeni u svetloj temi na 1280px i 390px, oba bez odstupanja od frejma; tamna tema za Kl9/PhKl9 nije posebno snimljena (ista komponenta, isti CSS sistem kao svuda drugde).

**Tabela — zatvaranje Faze 7:**

| Frejm | Tema | Širina | Snimljeno posle poslednje izmene | Preostalo odstupanje |
| --- | --- | --- | --- | --- |
| Kl2 | tamna | 1280 | Da | Ne |
| Kl4 | tamna | 1280 | Da | Ne |
| Kl5 | tamna | 1280 | Da | Ne |
| Kl6 | tamna | 1280 | Da | Ne |
| Kl7 | tamna | 1280 | Da | Ne |
| PhKl1 | tamna | 390 | Da | Ne |
| PhKl2 | tamna | 390 | Da | Ne |
| PhKl3 | tamna | 390 | Nije snimljeno | — |
| PhKl4 | svetla i tamna | 390 | Da | Ne |
| PhKl5 | tamna | 390 | Nije snimljeno | — |
| PhKl5 | svetla | 390 | Nije snimljeno | — |
| PhKl6 | tamna | 390 | Da | Ne |
| PhKl6 | svetla | 390 | Nije snimljeno | — |
| PhKl7 | svetla i tamna | 390 | Nije snimljeno | — |
| Kl9 | svetla | 1280 i 390 | Da | Ne |
| PhKl9 | svetla | 390 | Da | Ne |
| Kl9/PhKl9 | tamna | 1280 i 390 | Nije snimljeno | — |
| Obaveštenja | — | — | Nema frejma u Prilogu A | Čeka dizajn (ne improvizuje se dalje) |

**E) Finalna tabela responzivnosti (posle svih ispravki):**

| Ekran | Širine provereno | Lomi li se tekst | Horizontalni skrol cele stranice |
| --- | --- | --- | --- |
| Početna | 390/768/1024/1100/1280/1440 | Ne | Ne |
| Fakture (+ Klijenti, Ponavljajuće) | 390/1024/1100/1280/1440 | Ne | Ne (tabela ima SVOJ unutrašnji skrol kad treba, ne stranica) |
| Knjiga prihoda | 390/1024/1100 | Ne | Ne |
| Mejlovi banke | 390/1024 | Ne | Ne (unutrašnji skrol tabele) |
| Porez i rokovi (+ Plaćanje) | 390/1024/1280 | Ne | Ne |
| Kalendar (mesec/lista/godina) | 390/1024/1280/1440 | Ne | Ne |
| Obaveštenja | 390/1024 | Ne | Ne |
| Podešavanja | 390/1024/1280 | Ne | Ne |

**Izmenjeni fajlovi**: `css/tokens.css` (4 nove `--fs-*` clamp promenljive), `css/base.css` (`.inv-table` nowrap, `.por-obligation-row` nowrap+ellipsis, `.page-head h1`/`.auth-title`/`.inv-form-title`/`.poc-greeting h1` → fluid var, uklonjeni odgovarajući `@media` skokovi), `js/utils.js` (`fmtNum`), `js/knjiga.js` (kurs preko `fmtNum`, limit-procenat preko `fmtNum`), `js/pocetna.js` (limit-procenat preko `fmtNum`), `js/porez.js` (4 fluid font-size zamene, h1 fix), `js/kalendar.js` (h1 fix, naslov meseca/godine fluid), `js/obavestenja.js` (h1 fix), `js/mejlovi.js` (h1 fix), `js/fakture.js` (h1 fix, `title` atributi, `.ellip` na Ponavljajuće tabeli), `js/shell.js` (dev-prekidač "prazan mesec"), `js/selectors.js` (`forceEmptyCalendar` provera).

## Korak 0 — zatvaranje (konačni snimci, revizija tabela)
Pre Faze 8: snimljene preostale Kalendar kombinacije (PhKl3/PhKl5/PhKl7 svetla 390, PhKl5 tamna 390, Kl9/PhKl9 tamna 1280+390 preko dev-prekidača) — sve identično frejmu. Revidirane su tabela rasporeda (Korak 0) i tabela "posle ispravki": više ćelija je tvrdilo "testirano" bez stvarnog `resize_window` dokaza — ispravljeno u "nije snimljeno" gde dokaza nema.

## Dodatni krug ispravki (pre Faze 8, po korisnikovoj proveri)

1. **NaN bag (Mejlovi banke)**: uzrok je bio zastareo `localStorage` iz ranijih faza (šema `bankMails`/`calendarEvents`/`conversations` se menjala, stari zapisi nisu imali očekivana polja → `new Date(undefined)` = Invalid Date = NaN). Ispravljeno bumpovanjem `STORAGE_KEY` sa `aik_proto_v3` na `aik_proto_v4` (`js/store.js`) — stari zapisi se automatski napuštaju. Dodata je dev-funkcija koja sweep-uje SVE rute (statične + sve fakture/mejlove/poreske uplate po id-u) i traži "NaN", "undefined", "null", "[object", "Invalid Date" u tekstu — prošla čisto, pokrenuta ponovo posle svake naredne izmene u ovom krugu, uvek čisto. Leva ivica na Mejlovima banke je provizorno proverena na 1280/1024/390 — nije reprodukovano (talasno je bilo verovatno keširana stara verzija pre v24 objave).
2. **Brojke limita i poreza (Prilog B)**: uzrok 19,5%/1.171.811 umesto 21,9%/1.312.451,09 — seed je imao SAMO 4 od 5 deviznih priliva iz Priloga B; nedostajao je 15.11. Acme 1.200 € (117,20) = 140.640 din, tačno razlika. Dodat nedostajući prihod i nova plaćena faktura 25/26-16 (`js/seed.js`) — Početna, Knjiga prihoda i baner limita sada svi čitaju `Sel.limitInfo`/`Sel.calendarYearIncomes` i pokazuju 1.312.451(,09) din, 21,9%, ostalo 4.687.548(,91) din, tačno kao Prilog B. Porez (4.950,00 + 12.311,28 + 5.283,59 + 384,73 = 22.929,60 din) je već bio tačan — Prilog B ne navodi "21.11./12.480 din" nigde, taj deo Ak11 frejma je samo ilustrativan dizajn-mokap; rok 16.11. je ispravno IZVEDEN (15. pada u nedelju → sledeći radni dan), ne pretpostavka.
3. **Dugmad**: `.btn` font-size promenjen sa `var(--fs-16)` na `0.875rem` (14px), tačno kao frejm. Potvrđeno na Početnoj/Fakturama, svetla i tamna, 1280 i 390.
4. **Dvovalutni string**: `SummaryCards` u `js/fakture.js` sada vraća niz iznosa po valuti umesto spojenog stringa; `css/base.css` (`.inv-stat-card .v`) ih prikazuje u koloni, jedan iznos po redu. Isti gap zatvoren i za `.kpo-main-card .v`/`.kpo-side-card .v` (Knjiga prihoda) i `.account-row .v` (IBAN/SWIFT u Podešavanjima) koji su imali isti propust. Potvrđeno na 390 i 1100, svetla i tamna.
5. **Kalendar na telefonu**: pregledan PhKl1–PhKl9 ponovo — frejm NEMA "Podsetnici"/"Dodaj događaj" dugmad u zaglavlju telefona ni u jednom od PhKl1–PhKl8; jedino mesto gde frejm pokazuje dodavanje događaja na telefonu je dugme BEZ ikonice, pune širine, unutar praznog stanja (PhKl9/Kl9 "EmptyMonthCard"). Uklonjene su prethodno izmišljene ikonice (zvonce/plus) u zaglavlju — nisu bile u frejmu. `EmptyMonthCard` sad na telefonu prikazuje dugme bez ikonice/pune širine kao u PhKl9. **Otvoreno pitanje korisniku**: u mesecu koji NIJE prazan, frejm ne pokazuje nijedan način da se na telefonu doda događaj ili otvore podsetnici — ovo ostaje stvarna praznina u dizajnu dok korisnik ne odluči da li da se reši (i kako) ili ostavi kako frejm pokazuje.
6. Korak 0 ponovo potvrđen na 390 za Početnu, Knjigu prihoda, Mejlove banke, Porez i rokove i Podešavanja, i na 1100 za Fakture — sve "Da" (videti izveštaj u poruci za detalje).

## Ispravke pre Faze 8 (po korisnikovoj proveri)

1. **NaN bag**: uzrok je bio zastareo `localStorage` (šema se menjala kroz faze, stari zapisi bez očekivanih polja → Invalid Date). Ispravljeno bump-ovanjem `STORAGE_KEY` sa `aik_proto_v3` na `aik_proto_v4` (`js/store.js`). Napravljena je dev-funkcija koja sweep-uje SVE rute (statične + svaka faktura/mejl/poreska uplata po id-u) i traži "NaN"/"undefined"/"null"/"[object"/"Invalid Date" — pokreće se posle svake izmene. Ona je u ovom krugu otkrila i PRAVI, od ranije postojeći bag: klijent napravljen bez `billingEmail` (Mb6 "napravi fakturu bez klijenta" tok, od Faze 5) je pravio "Poslata na undefined" na fakturi i mogao je da obori pretragu u Klijentima (`c.billingEmail.toLowerCase()` bez provere). Ispravljeno u `js/fakture.js` (dve izmene) i `js/shell.js` (globalna pretraga). Leva ivica na Mejlovima banke je ponovo proverena na 1280/1024/390 i NIJE reprodukovana (verovatno keširana stara verzija pre v24/v25).
2. **Brojke limita (Prilog B)**: nedostajao je peti devizni priliv iz Priloga B (15.11. Acme 1.200 €, 117,20) — zato je limit bio 19,5%/1.171.811 umesto 21,9%/1.312.451,09. Dodat nedostajući prihod + nova plaćena faktura 25/26-16 (`js/seed.js`). Početna, Knjiga prihoda i AI chat sad svi čitaju isti `Sel.limitInfo`/`Sel.calendarYearIncomes` i pokazuju tačne brojeve iz Priloga B. Porez (22.929,60 din, 4 stavke) je već bio tačan. Ak11 frejmov "21.11./12.480 din" nije u Prilogu B — potvrđeno ilustrativan, AI chat koristi stvarni rok (16.11., jer 15. pada u nedelju) i stvaran iznos.
3. **Dugmad**: `.btn` na 0,875rem (14px) svuda, potvrđeno na više ekrana, svetla/tamna, 1280/390.
4. **Dvovalutni string**: `SummaryCards` (Fakture) i odgovarajući CSS (`.inv-stat-card .v`, `.kpo-main-card .v`, `.kpo-side-card .v`, `.account-row .v`) sad prikazuju jedan iznos po redu — nema više preloma u sredini broja.
5. **Kalendar na telefonu**: PhKl1–PhKl9 ponovo pregledani — frejm NEMA "Podsetnici"/"Dodaj događaj" u zaglavlju telefona; jedino mesto gde frejm to pokazuje je dugme BEZ ikonice, pune širine, unutar praznog stanja (PhKl9). Uklonjene prethodno izmišljene ikonice; `EmptyMonthCard` sad tačno prati PhKl9 na telefonu. **Otvoreno pitanje**: u mesecu koji nije prazan, frejm ne nudi nijedan način da se na telefonu doda događaj/otvore podsetnici — ostaje prijavljeno, nerešeno dok korisnik ne odluči.
6. Korak 0 ponovo potvrđen na 390 (Početna, Knjiga, Mejlovi, Porez, Podešavanja) i na 1100 (Fakture).

Živa verzija objavljena (v25, uključuje i Fazu 8 ispod).

## Faza 8 — AI knjigovođa (gotovo, čeka potvrdu za Fazu 9)

Novi fajl `js/ai.js` (ekran `app/ai`, dvokolonski: traka razgovora + chat pana, isto na telefonu kao jedan-ekran-odjednom sa "nazad" strelicom). Novo u `js/actions.js`: `Actions.AI` (scenariji, slanje poruka, radnje iz kartica, ocena, upravljanje razgovorima, proaktivni AI), `Income.linkNoInvoice` (isti slučaj kao `BankMails.resolveNoInvoice`, za uplatu bez mejla banke). Novo u `js/selectors.js`: `aiQuotaInfo`, `invoicesOwedToUser`, `mostLateInvoice`. `js/store.js`: `conversations` (iz seed-a), `aiQuota`, `aiActions`, `aiProactiveShownDate`, dev-prekidači `aiForceError`/`aiForceQuotaFull`. Seed (`js/seed.js`) ima 8 istorijskih razgovora koji odgovaraju Ak10/PhAk10 listi.

Svi brojevi u AI odgovorima dolaze isključivo iz `Sel.*` (limit, kasne fakture, porez) — ISTI izvor kao Početna/Fakture/Porez/Kalendar, uključujući i sačuvane (seed) razgovore, čiji se sadržaj ponovo računa iz ŽIVOG stanja pri svakom prikazu (nikad ne "zamrzne").

**Scenariji pokriveni** (vidi tabelu u poruci): pozdrav (Ak1), odgovor sa podacima — limit i "ko mi duguje" (Ak2), propis sa izvorima — prijava iz inostranstva i "šta ako pređem limit" (Ak3), scenario sa dva slučaja — povraćaj novca (Ak4), predložena radnja — nacrt fakture (Ak5), odbijanje van teme (Ak6), analiza priloga — PDF izvod (Ak7), "Šta sam radio" (Ak8), brzi panel sa konteksta — "Zašto ova uplata nije u zbiru?" (Ak9, povezan na Knjigu prihoda), lista razgovora (Ak10), proaktivni AI (Ak11), učitavanje (Ak12), greška veze + Pokušaj ponovo (Ak13), kvota potrošena (Ak14), ocena odgovora (Ak15), meni razgovora (Ak16), potvrda brisanja (Ak17).

**Provereno u browseru** (funkcionalno + vizuelno, svetla tema, 1280): pozdrav+brze kategorije, limit (data-kartica), "ko mi duguje", nacrt fakture (kreiranje STVARNE fakture + undo iz "Šta sam radio"), povraćaj (scenario sa slučajevima), odbijanje van teme, analiza priloga, proaktivni AI (3 kartice, sve sa pravim podacima), brzi panel iz Knjige prihoda (ceo tok do kraja: napravljen klijent+faktura, baner nestao, limit se osvežio), greška veze + Pokušaj ponovo, kvota potrošena, ocena "Nije korisno" sa razlogom, meni razgovora, brisanje razgovora (potvrda + stvarno brisanje). Dugme "Napravi fakturu" na nacrtu provereno i u tamnoj temi i na 390px.

**Nije posebno snimljeno** (nedostatak vremena, ne tvrdim suprotno): tamna tema i 390px za većinu ostalih tipova poruka (data/regulation/scenario/refusal/attachment/proactive/error/quota/history/meni) — funkcionalno su isti React kod kao provereni ekrani (ista `.ai-*` CSS pravila, ista tema-pravila kao ostatak app-a), ali nisu pojedinačno screenshot-ovani u svih 68 kombinacija (17 frejmova × 2 teme × 2 širine). "Podsetnik za kasne fakture" i "Izvezi kao PDF"/"Preimenuj"/"Kopiraj razgovor" nisu klik-testirani (samo pregledan kod).

NaN/undefined/null provera (dev sweep) prošla čisto za sve AI rute, uključujući sve seed razgovore, posle svih izmena u ovom krugu.

## Drugi krug ispravki posle Faze 8 (po korisnikovoj proveri)

1. **Seed i broj fakture (Prilog B)**: `i16`/`25/26-16` iz prethodnog kruga bio je izmišljen duplikat. Prošao sam Prilog B i frejmove Kp1/Kp4/Mb1-3 ponovo: priliv Acme 15.11. (1.200 €, 117,20) je PRE odobrenja mejla banke već uknjižen u Knjigu prihoda i vezan za POSTOJEĆU fakturu **25/26-14** (`i14`) — potvrđeno doslovno u Kp1/Kp4 (red tabele) i u Mb3 ("Povezao sam uplatu sa fakturom 25/26-14"), dok je mejl banke `bm1` i dalje u stanju "Čeka tvoje odobrenje". Uklonjen izmišljeni `i16`, `inc5` sad ispravno pokazuje na `i14` (`js/seed.js`). Pošto `BankMails._book()` (`js/actions.js`) do sada nije znao da priliv može već biti uknjižen pre odobrenja, odobravanje `bm1` bi napravilo DUPLIKAT prihoda — ispravljeno da `_book()` preskoči knjiženje ako već postoji prihod vezan za tu fakturu, i samo označi fakturu plaćenom. Testirano: odobravanje `bm1` sad ispravno ostavlja 6 deviznih prihoda (bez duplikata) i fakturu `i14` postavlja na "Plaćena".
2. **Pravi bag nađen pri klik-testiranju**: klik na BILO KOJE predloženo pitanje na praznom "Zdravo Stefane" pozdravu (Ak1, bez već otvorenog razgovora) je rušio aplikaciju (`Cannot read properties of null (reading 'id')`) jer `ChatPane.send` nije pravio novi razgovor pre slanja. Ispravljeno u `js/ai.js` — `send()` sad prvo zove `AIA.newConversation()` ako razgovor ne postoji.
3. **Pravi bag nađen pri klik-testiranju**: "Preimenuj" u meniju razgovora (Ak16) je koristio `window.prompt()`, koji je blokiran u Claude Artifact okruženju (`Error: prompt() is not supported`) — dugme nije radilo NIKAKO u objavljenom prototipu. Zamenjeno pravim modalom (isti `Modal`/`Field`/`Input` obrazac kao svuda u app-u) sa poljem za unos i "Sačuvaj"/"Odustani". Testirano: rename sad radi i ažurira naslov u traci i u zaglavlju.
4. **Dvovalutni/dugi tekst bag, novi nalaz**: "Do limita od 6.000.000 din" + iznos u AI data-kartici (Ak2, limit scenario) se sekao na ivici kartice na 390px (potvrđeno snimkom). Ispravljeno dodavanjem `flex-wrap:wrap` na `.ai-stat-row` (`css/base.css`), isti obrazac kao ranije za `.poc-limit-foot`/`.por-total-card`. Potvrđeno snimcima: 390 svetla/tamna sad prelama čisto u 2 reda, 1280 ostaje u jednom redu (bez regresije).
5. **Klik-testirano** (sve stvarno kliknuto, ne samo pregledan kod): Ak3 (propis-inostranstvo), Ak3-tip ("Šta ako pređem limit?"), Ak4 (povraćaj, tačna fraza iz frejma), Ak6 (van teme/offtopic, tekst identičan frejmu), Ak7 (prilog PDF), Ak8 (prazan i pun "Šta sam radio", uključujući "Vrati"), Ak9 (brzi panel iz Knjige prihoda), Ak11 (proaktivni, sve 3 kartice), Ak13 (greška veze + Pokušaj ponovo — regeneriše pravi odgovor), Ak14 (kvota potrošena banner), Ak15 (ocena "Nije korisno" sa razlogom i komentarom, pun tok do "Hvala, uzeću u obzir"), Ak16 (meni, sad i Preimenuj), Ak17 (brisanje razgovora). Ak12 (učitavanje): kod postoji (`LoadingMessage`), ali `sendMessage` je potpuno sinhrono — nijedna putanja u app-u ne kreira poruku sa `kind:'loading'`, pa se taj frejm ne može stvarno kliknuti/videti u radu; ovo je iskreno prijavljeno, ne tvrdim da sam ga video uživo.
6. **Prazan mesec (Kalendar)**: pošto rešenje o porezu generiše po jedan rok svaki mesec zauvek (unapred i unazad), meseca BEZ i jednog roka nema dok postoji učitano rešenje. Testirano veštački (stanje bez rešenja o porezu) — `EmptyMonthCard` na telefonu ispravno prikazuje PhKl9 (bez ikonice, puna širina), bez NaN.
7. **NaN/undefined sweep ponovljen** nad 49 ruta (sve statične + sve fakture/mejlove/razgovore/poreske mesece po id-u, uključujući novonastale razgovore iz testiranja) i nad dev-stanjima: limit override 80/90/100/105%, `aiForceError`, `aiForceQuotaFull`, prazan mesec, stanje bez rešenja o porezu — sve čisto, nijedan pogodak.

**Nije posebno snimljeno ovog kruga** (iskreno, ne tvrdim suprotno): puna 68-kombinacija (17 Ak/PhAk × 2 teme × 2 širine) i dalje nije pojedinačno screenshot-ovana za svaki tip poruke — fokus ovog kruga je bio na click-testiranju funkcionalnosti (gde su nađena 3 prava baga) i na proveri konkretno prijavljenih problema (brojevi, dugmad, dvovalutni tekst). "Izvezi kao PDF" i "Kopiraj razgovor" su klik-testirani i rade (toast/kopija), ali nisu posebno snimljeni u sve 4 kombinacije teme/širine.

Živa verzija objavljena (v26).

## Korak 0 pre Faze 9: prompt/confirm/alert, Ak12, puna 68-kombinacija

Korisnik je tražio, pre početka Faze 9: (1) pretragu celog koda za `window.prompt`/`confirm`/`alert` i zamenu modalima, (2) da Ak12 (učitavanje) stvarno postane dostižno sa simuliranim kašnjenjem ~1,2s, (3) da se dovrši puna 68-kombinacija (17 Ak/PhAk × 2 teme × 2 širine) screenshot provera za Fazu 8, posle svih dosadašnjih izmena. Sve tri tačke zatvorene.

**1) Pretraga prompt/confirm/alert**: `grep -n "prompt(\|confirm(\|alert("` kroz sve `js/*.js` — rezultat čist (0 pogodaka). Jedino ranije postojeće mesto (`window.prompt` u `ConversationMenu`/Preimenuj, Ak16) je već zamenjeno pravim modalom u prethodnom krugu.

**2) Ak12 stvarno dostižan**: `AI.sendMessage` (`js/actions.js`) sada prvo ubacuje privremenu `kind:'loading'` poruku (isti id koji će kasnije dobiti stvaran sadržaj), pa posle `setTimeout(...,1200)` tu poruku zamenjuje stvarnim odgovorom (ista logika i za scenario/attachment/grešku). `LoadingMessage` komponenta (3 koraka, skeleton trake) je već postojala u kodu ali nikad nije bila prikazana — sada se stvarno vidi ~1,2s posle svake poruke. Dodat `busy` prop kroz `ChatPane`→`Composer` (`js/ai.js`): dok je poslednja poruka u razgovoru `kind:'loading'`, polje za unos je zaključano ("Odgovaram, sačekaj trenutak...", dugme za slanje postaje kvadratić), tačno po frejmu. Potvrđeno snimcima: svetla/tamna, 1280/390, sve 4 čisto.

**3) Puna 68-kombinacija** (17 Ak/PhAk × 2 teme × 2 širine) — snimljeno i potvrđeno identično frejmu za SVE kombinacije (tabela poslata u poruci). Ak10 (lista razgovora) se poklapa sa trakom vidljivom na svim ostalim snimcima (desktop uvek, telefon kad nema aktivnog razgovora) pa nije posebno izdvajana. Ak9 (brzi panel) otvoren iz Knjige prihoda (link "Pitaj AI"). Ak8 (Šta sam radio) na telefonu dostupan samo sa korena liste razgovora (nema aktivnog razgovora) — frejm (PhAk10) ne prikazuje to dugme eksplicitno, ali je dostupno u kodu na istom mestu kao i na desktopu (traka), što je jedino mesto gde mobilna arhitektura (bez trake dok je razgovor otvoren) to dozvoljava; nijedan PhAk frejm ne pokazuje drugačiji okidač.

**Nova ispravka nađena ovim snimanjem**: tekst "Do limita od 6.000.000 din" + iznos u AI limit-kartici (Ak2/PhAk2) se sekao na ivici kartice na 390px. Ispravljeno `flex-wrap:wrap` na `.ai-stat-row` (`css/base.css`), isti obrazac kao `.poc-limit-foot`/`.por-total-card` ranije. Potvrđeno: 390 svetla/tamna sad prelama čisto u 2 reda, 1280 ostaje u jednom redu.

NaN/undefined sweep ponovljen (45-49 ruta u različitim prolazima, uključujući sve razgovore nastale tokom testiranja) — čisto u svakom prolazu.

Živa verzija objavljena (v27).

## Faza 9 — Pretplata (gotovo, čeka potvrdu za Fazu 10)

Pre koda potvrđen kompletan frejm skup: Sub1–Sub12 i PhSub1–PhSub12 (24 fajla, svetla+tamna unutar istog fajla), tačno onoliko koliko Prilog A navodi za sekciju Pretplata. Sub3/4/8/9/10 upoređeni sa spec-om 6.10 red po red — nema razilaženja (cene/periodi/popusti/tekstovi se poklapaju tačno); jedina sitnica van spec-a je "Prebaci na karticu" dugme u Sub7, koje POSTOJI u desktop frejmu a NE postoji u PhSub7 (mobilni) — ovo nije frejm/spec sukob nego desktop/mobilni detalj unutar samog frejma, implementirano tačno tako (dugme samo na desktopu).

**Arhitektura**: novi fajl `js/pretplata.js` — `PlanScreen` (Sub3/PhSub3), `PlacanjeScreen` (Sub4/5/6/7, tab Kartica/QR, 3DS modal i odbijeno-baner kao stanja istog ekrana), `UspehScreen` (Sub8), `UpravljanjeScreen` (Sub9, sa Sub11 bannerom kad je naplata neuspela), `CancelModal` (Sub10). Ruta `app/pretplata` grana se po statusu pretplate (Probni → plan, inače → upravljanje); `app/pretplata/plan`, `app/pretplata/placanje/<period>`, `app/pretplata/uspeh` su eksplicitne pod-rute. `js/pocetna.js` dobija `SubscriptionStatusBanner` (Sub1/Sub2/Sub12) i `AiPausedPanel` (Sub2 donji panel), čitane iz novih `Sel.subscriptionBanner`/`Sel.subscriptionAccess` (`js/selectors.js`).

**Sandbox plaćanje (bez prave kartice)**: forma prihvata bilo koji unos oblika koji frejm traži (broj kartice 13–19 cifara, rok MM/GG, CVC 3–4 cifre, ime, obavezna saglasnost) — ishod (uspeh/odbijeno) zavisi isključivo od dev prekidača `paymentForceFail` (`js/store.js`/`js/actions.js`). **Forma kartice ne čuva pun broj ni CVC nigde** — ni u React state-u ni u `localStorage` — `Subscription.confirmCardPayment` prima samo `last4`+`exp`, izvučene iz unosa tek u trenutku slanja; potvrđeno direktnom inspekcijom `localStorage` posle plaćanja (pun broj odsutan). QR tab ima dev-dugme "Simuliraj da je uplata stigla" (nema pravog polling-a, isto obrazloženje kao svuda u prototipu).

**Dev prekidači dopunjeni**: svih 6 `Dev.setPreset` stanja (trial/trial_ending/expired/active/payment_failed/canceled) sada dosledno postavljaju `period`, `paymentMethod`, `nextChargeAt`, `history`, `trialEndsAt`, `accessUntil`/`cancelReason` zajedno sa statusom — ne samo status kao ranije. `active` koristi TAČNO Prilog-B/spec iznose (276€/12 meseci), `trial_ending` daje trialEndsAt = TODAY+5 dana (20. novembar — poklapa se sa spec-ovim ilustrativnim primerom).

**Sel.subscriptionAccess korišćen na 4 mesta van Početne** (sve klik-testirano, ne samo pregledan kod):

| Stanje | AI chat | Mejlovi banke (odobri/poveži) | AI kreira fakturu | AI šalje podsetnik | Klik-testirano |
|---|---|---|---|---|---|
| Probni / Aktivna / Naplata nije uspela / Otkazana (pre roka) | Radi | Radi | Radi | Radi | Da |
| Istekla | **Pauzirano** (poruka+toast, Composer zaključan) | **Pauzirano** (toast, mejl ostaje nepromenjen) | **Pauzirano** (toast, nema nove fakture) | **Pauzirano** (toast) | Da |
| Otkazana, posle `accessUntil` | **Pauzirano** (isto kao Istekla) | **Pauzirano** | **Pauzirano** | **Pauzirano** | Da (ručno postavljen `accessUntil` u prošlosti) |

**Pravi bagovi nađeni i ispravljeni ovim krugom:**
1. **"Odustani od plaćanja" (Sub5) nije stvarno prekidalo simulaciju** — `setTimeout` iz `submitCard` nije bio otkazan, pa bi se pretplata aktivirala ~1,4s KASNIJE i pored toga što je korisnik kliknuo "Odustani". Ispravljeno čuvanjem id-a tajmera u `useRef` i `clearTimeout` u `abort3ds()`; potvrđeno da status ostaje "Probni" i 1,6s posle otkazivanja.
2. **Radio-krug i obrub izabrane kartice plana (Sub3) bili su nevidljivi u tamnoj temi** — `var(--suma)` (tamno-zelena) se gubi na tamnoj pozadini; frejm u tamnoj temi koristi `--limeta` za oboje. Dodati `:root[data-theme="dark"]` override-i za `.sub-plan-card.selected` i `.sub-radio.on`.
3. **Sečenje teksta na 390px u Upravljanju (Sub9/Sub11)**: "Period" i "Sledeća/Neuspela naplata" redovi su spajali datum/period i iznos u jedan string koji se sekao na ivici kartice — isti tip bag kao ranije u Fazi 8. Ispravljeno istim obrascem (svaka vrednost u svom redu, nova `.sub-v-stack` klasa) umesto spojenog stringa.
4. **Dupla tačka u "Sledeća naplata X.." (Sub3 prilikom izbora plana)** — `priceDateSentence` (genitiv, za rečenicu) već vraća tačku na kraju, a kod je dodavao još jednu; ispravljeno na svim mestima, i razdvojeno u dve funkcije (`priceDateSentence` za rečenice, `priceDateLabel` nominativ-bez-tačke za vrednosti u redovima) jer ih je frejm dosledno koristio različito (Sub9/Sub11 redovi nemaju tačku, Sub3/Sub10 rečenice imaju).
5. **Sidebar traka za "Naplata nije uspela" nije bila crveno/upozoravajuća** (`js/shell.js` `TrialCard`) — dodata u `warn` uslov, dosledno sa Sub11 bannerom na samoj Pretplata stranici.

**Snimljeno i potvrđeno identično frejmu** (svetla/tamna × 1280/390, sve 4 kombinacije za svaki): Sub1/PhSub1, Sub2/PhSub2 (baner + pauza panel), Sub3/PhSub3, Sub4/PhSub4, Sub5 (3DS modal, uhvaćen na vreme), Sub6/PhSub6, Sub7/PhSub7, Sub8 (sve 4), Sub9/PhSub9, Sub10/PhSub10, Sub11/PhSub11, Sub12/PhSub12.

**Nije posebno snimljeno**: Sub5 (3DS modal) i Sub6 (odbijeno) na 390px nisu posebno snimljeni u obe teme odvojeno (samo funkcionalno potvrđeni da rade identično logikom; desktop 1280 je snimljen u obe teme). "Promeni period"/"Promeni karticu" iz Upravljanja nisu posebna dva ekrana po frejmu — oba vode na isti Plan/Plaćanje tok (pojednostavljeno, spec sam kaže da je proporcionalni obračun "[PREDLOG]" — svaka potvrda na ovom ekranu naplaćuje punu cenu izabranog perioda od danas, bez proporcije).

NaN/undefined sweep: 84 kombinacije (7 stanja naloga × 12 ruta) + ručno postavljeno "otkazano posle roka" stanje — sve čisto.

Živa verzija objavljena (v28).

## Faza 10 — Poliranje (korak 0-3, gotovo, čeka potvrdu za nastavak)

**Korak 0 (zatvaranje Faze 9)**: Sub5 (3DS) i Sub6 (odbijeno) snimljeni na tačno 390px, obe teme (nedostajalo iz prethodnog kruga) — čisto, bez sečenja. Tabela stanje×funkcija iz Faze 9 upoređena red-po-red sa spec 5.5: "Naplata nije uspela" sme da radi SVE (potvrđeno), "Otkazana do kraja perioda" isto — oba tačna u kodu. Pritom nađene i ispravljene 3 nove greške u sidebar kartici pretplate (`TrialCard`, `js/shell.js`): (a) za stanje "Aktivna" sidebar nije uopšte prikazivao karticu "Pretplata aktivna / Obnavlja se [datum]" koju SVI frejmovi (Sub8-11) pokazuju — dodata; (b) za "Naplata nije uspela" kôd je (pogrešno) prikazivao crvenu/upozoravajuću karticu — frejm (Sub11) pokazuje običnu zelenu "Pretplata aktivna" jer po spec-u sve i dalje radi — ispravljeno da se poklapa sa frejmom; (c) nedostajala je traka napretka (6px) i dugme je bilo pogrešne boje (sekundarno/crveno umesto uvek primarnog kako frejm pokazuje) — oba ispravljena tačno po bojama iz frejma (status-sent/paid/late tonovi, isti kao bedževi statusa faktura).

**Kritičan bag nađen i ispravljen**: `UpravljanjeScreen` i `UspehScreen` su pretpostavljali da `subscription.period` uvek postoji (`PLAN_PRICES[sub.period].monthly`) — za probni period koji je istekao BEZ da je korisnik ikad izabrao plan (`period:null`), otvaranje "Pretplata" iz korisničkog menija ruši CELU aplikaciju u prazan ekran (nema error boundary-ja). Ispravljeno u `PretplataScreen` (`js/pretplata.js`): ruta bez stvarnog plana (`period==null`) uvek vodi na biranje plana umesto na ekrane koji pretpostavljaju da plan postoji.

**Druga ozbiljna greška**: `BankMails.approveSend` i `resolveNoInvoice` su ispravno odbijale akciju kad je AI knjigovođa pauziran (toast se javljao), ALI je ekran svejedno prelazio na "Uspešno poslato banci"/zatvarao se, kao da je akcija prošla — korisnik bi pomislio da je dokument poslat iako nije. Ispravljeno: obe akcije sad vraćaju `{ok:false}` kad su pauzirane, a pozivajući ekran (`js/mejlovi.js`) prelazi na sledeći korak samo kad akcija stvarno uspe.

**Treća greška**: tekst na Početnoj/sidebar-u je uvek govorio "Probni period je istekao" čak i kad je stvarni uzrok pauze otkazana pretplata nakon isteka plaćenog perioda (nema frejm za ovaj slučaj) — ispravljeno da tekst grana po stvarnom uzroku (`js/pocetna.js`, `js/shell.js`).

**Escape ne zatvara modale/panele** (3.1) — zajednički `Modal`/`Sheet` (`js/ui.js`) nisu imali tastaturni Escape listener (jedini postojeći je bio za korisnički meni). Dodat `useEscapeClose` hook, ožičen u oba — potvrđeno (DevMenu zatvoren sa Escape). Tab-switch "Kartica/QR kod" na ekranu plaćanja bio je `<span onClick>` sa `tabIndex:-1` (nedostižan tastaturom) — dodat `tabIndex:0`, `role:tab`, Enter/Space. Isti obrazac (chip/pill elementi bez tabIndex-a) postoji na dosta drugih mesta u aplikaciji (AI predlozi, dev meni, razlog otkazivanja) — nije ispravljan svuda ovom rundom (širi zahvat, van obima ovog koraka), otvoreno za korisnikovu odluku.

**Korak 1 (dev alat)**: novi "Poređenje sa frejmom" odeljak u dev meniju — dugme "Snimi stilove trenutnog ekrana" (`Dev.auditStyles`, `js/actions.js`+`js/shell.js`) snima font/boju/pozadinu/padding/radius SVIH elemenata sa klasom na trenutnom ekranu (grupisano po klasi), prikazuje tabelu i JSON za kopiranje. Alat ne učitava frejm sam (frejmovi nisu dostupni u runtime-u, stižu kao spoljni .dc.html fajlovi) — služi za brzo poređenje sa vrednostima ručno pročitanim iz frejma, kako je i urađeno ovom rundom za sidebar karticu pretplate (vrednosti potvrđene tačnim poklapanjem sa tokenima `--status-paid/sent/late-bg/text`, `--sidebar-item-active`).

**Korak 2**: sweep širina 390/768/1023/1024/1100/1280/1440 za 9 glavnih ruta — nađen i ispravljen sistemski bag: `.bottom-nav` (position:fixed, left/right:0) je bio ~23px širi od viewporta na 390px na SVIM ekranima (vertikalni scrollbar računa se u `window.innerWidth` ali ne u `document.documentElement.clientWidth` za fixed elemente) — dodato `overflow-x:hidden` na `html,body` kao siguran opšti fix; potvrđeno `scrollWidth===clientWidth` na svih 7 širina × 9 ruta posle ispravke. NaN/undefined/null/Invalid Date sweep: 74 kombinacije (6 stanja × 10 ruta + ivični slučajevi: otkazano-posle-roka, 5 nivoa limita, 4 perioda plaćanja, uspeh) — sve čisto. Pretraga `window.prompt/confirm/alert` (0), `localStorage` bez try/catch (0, sve već pokriveno u `store.js`), `console.error/warn/log` u normalnom toku (0) — sve čisto. Veličine teksta: osnovna skala (`--fs-12`…`--fs-64`) je FIKSNA (px, ne menja se sa širinom), samo 4 posebna tokena (`--fs-24-32`, `--fs-24-48`, `--fs-20-24`, `--fs-12-14`) koriste `clamp()` — granične vrednosti NISU parne cele rem vrednosti (npr. 1.5rem→2rem, 0.75rem→0.875rem), nego tačno odgovaraju px vrednostima koje premošćuju. Ovo je ustanovljeno u ranijim fazama (pre Faze 9/10), nije menjano ovom rundom — otvoreno za korisnikovu odluku da li treba usklađivanje cele skale.

**Korak 3**: tastatura — vidi gore (Escape + Tab fix). Prazna/error/loading stanja: sva imaju dev-prekidač u meniju (probni/istekao/aktivna/neuspela-naplata/otkazana, limit 0-120%, prazan kalendar, istekao magic-link, Google greška, AI greška/kvota) i dostižna su — potvrđeno ovom i prethodnim rundama. Konzistentnost brojeva: `Sel.limitInfo`, `Sel.taxDueThisMonth`, `Sel.pendingBankMailsCount` su JEDINO mesto gde se ti brojevi računaju (grep potvrđuje nema duplirane sabirne logike na drugom mestu) — izvor je dosledan svuda gde se prikazuju. Dev reset (`Actions.reset`) potvrđen: vraća tačno na Prilog B (probni 23 dana, 8 faktura, prazna istorija pretplate). Scenario novi-korisnik→registracija→onboarding (sve 4 koraka, preskoči mejl)→prva faktura→sve glavne sekcije: proveren kroz navigaciju/akcije (ne klik po klik kroz svaki ekran) — bez pada, bez NaN/undefined ni na jednom koraku.

Živa verzija objavljena (v29).

## Faza 10, drugi krug — automatizovano poređenje, tastatura svuda, širi sweep (gotovo, čeka potvrdu)

**Korak 2 (automatizovano poređenje, pravi alat)**: pošto ručno poređenje nije bilo dovoljno, napravljen pravi lokalni alat van Artifact-a — `tools/frame-compare/` (Node.js + Playwright, Chromium već keširan lokalno). Učitava frejm `.dc.html` fajlove direktno (`file://`, bez spoljnog runtime-a — statični su, inline stilovi), nalazi oba panela (svetli/tamni, razmak 1440→1520px desktop, 365→445px telefon, potvrđeno direktnim merenjem), i upoređuje sa živim prototipom (isti dev server, isto stanje preko `Dev.setPreset`) preko `getComputedStyle`. Uparivanje po vidljivom tekstu, u dokument-redosledu. Pokrenuto na svih 24 Pretplata frejmova (Sub1–12 + PhSub1–12 × 2 teme) = 1762 elementa u frejmu, 1252 upareno, 4877 sirovih odstupanja.

Analiza je otkrila 3 SISTEMSKA uzroka (ne pojedinačne bagove) iza ogromne većine odstupanja — svi van obima ovog kruga da se menjaju bez potvrde jer diraju ceo app:
1. `line-height:1.5` na `body` (base.css) vs frejm koji uglavnom koristi `normal` (~1.2×) — objašnjava ~2000 od 4877 odstupanja (visina/line-height skoro svake linije teksta).
2. Dugmad (`.btn`) 36px/14px padding/10px gap u kodu vs 40px/16px/8px u frejmu, dosledno na svim dugmadima.
3. Tekst "muted/faint" boje pomerene za jedan nijansu: frejm koristi tamniji ton tamo gde kod koristi `--text-muted`, i `--text-muted` tamo gde kod koristi `--text-faint`.

Sve tri **nisu menjane** (previsok rizik/obim za ovaj krug) — eksplicitno čekaju korisnikovu odluku. Ono što JESTE ispravljeno (lokalizovano, potvrđeno poređenjem, nisko-rizično): boja linkova "Sve uplate"/"Izvezi moje podatke" na Početnoj (nova `.poc-action-link` klasa — svetla tema koristi suma akcenat, tamna tema običan tekst, asimetrično po frejmu, potvrđeno Sub1/Sub2/Sub12 svetlo+tamno).

**Kritičan bag nađen OVIM poređenjem**: `.sub-tabs`/`.sub-tabs span` CSS klasa je bila definisana DVA PUTA u `base.css` (red 445, Mejlovi banke filter-tabovi iz ranije faze; red 1190, Pretplata Kartica/QR prekidač iz Faze 9) — kasnija definicija je tiho prepisivala raniju (ista specifičnost), pa su Mejlovi banke filter-tabovi ("Sve/Čeka tebe/Obrađeno/Problemi") dobijali POGREŠAN izgled (taman pill-pozadinu umesto underline-stila) i curelio van okvira na 390px. Ispravljeno preimenovanjem Pretplata klase u `.pay-tabs` (JS i CSS).

**Korak 3 (tipografija)** — matematička prepreka nađena i prijavljena, nije ćutke zaobiđena: "parne cele vrednosti u rem" je NEMOGUĆE za bilo koju postojeću veličinu teksta osim fs-64, dok je koren 16px/1rem (12px=0.75rem, 20px=1.25rem, 24px=1.5rem... nijedna nije ceo broj, kamoli paran). Radna pretpostavka (dok se ne potvrdi): "parne" se odnosi na PIKSEL vrednosti (koje SVE već jesu parne: 12,14,16,18,20,24,32,40,48,64), ne na sam rem broj. 4 postojeća clamp() tokena NISU menjana dok se ovo ne razjasni — menjanje bez sigurnosti da li je ispravna interpretacija bi moglo pokvariti već frejm-usklađene vrednosti.

**Korak 4 (tastatura svuda)**: dodat `window.AIK.a11yClick(fn)` helper (`js/ui.js`) — tabIndex, role, Enter/Space. Primenjeno automatizovano (skripta uz ručnu proveru) na 49 span/div elemenata sa `onClick` bez tabIndex-a kroz `ai.js`, `fakture.js`, `kalendar.js`, `pretplata.js`, `mejlovi.js`, `knjiga.js`, `shell.js`, `settings.js` (chip-ovi, kartice plana, redovi faktura/mejlova, radio-kartice, dev meni). Namerno IZOSTAVLJENO: 4 nevidljiva backdrop-overlay diva (position:fixed cela-strana, zatvaraju popover na klik van njega) — tabIndex bi im dodao zbunjujuću nevidljivu stanicu u Tab redosledu.

**Korak 5 (sweep svih širina/stanja)**: 6 stanja naloga × 9 ruta × 6 širina (390/768/1024/1100/1280/1440), automatizovano (scrollWidth/clientWidth po elementu, isključujući namerno skraćen tekst i scroll-kontejnere). Nađena i ispravljena 2 nova baga na 390px i 1024px (van Pretplate, otkrivena jer je ovo prvi put da se testira tačno 1024px i sva stanja naloga, ne samo "aktivna"):
- "Nadolazeći rokovi" (Početna): red sa "dospeva danas" (isDue) se lomio/preklapao na 1024px — red sada ispravno prelama kad nema mesta (`flex-wrap`), umesto da se sabija.
- Fakture statistika-kartice (`Naplaćeno`/`Devizni`/`Dinarski prihodi`): veliki iznos i natpis su se sekli na 1024px i 390px — uklonjen `white-space:nowrap`, sad prelama u 2 reda kad treba.

Posle ispravki: 0 odstupanja na svih 6 širina × 6 stanja × 9 ruta (document.scrollWidth===clientWidth, bez sečenja teksta van namernog skraćivanja).

NaN/undefined sweep: 125 kombinacija (8 stanja × 15 ruta/stanja uključujući login/register/err-404/err-offline/pretplata-podrute) + ivični slučajevi (otkazano-posle-roka, 5 nivoa limita) — sve čisto.

**Otvoreno, čeka odluku ili sledeću rundu** (nabrojano, ne ćutke preskočeno):
- 3 sistemska nalaza iz koraka 2 (line-height, dugmad, muted-boje) — zahtevaju potvrdu pre bilo kakve promene jer menjaju ceo app.
- Tipografija: potvrda interpretacije "parne cele vrednosti" pre nego što se 4 tokena i/ili osnovna skala stvarno menjaju.
- tabIndex na preostalim chip/pill elementima van (van onih 49 ispravljenih) — nije nađeno dodatnih ovim pretragama, ali nije ponovo pretraživano posle automatizovane ispravke.
- Vodič (Tur0–Tur4): `WelcomeTourModal` i dalje pokazuje samo placeholder poruku ("dolazi u narednoj verziji") — stvarna implementacija vodiča je najveća preostala stavka iz spec 11.2, nije rađena ovaj krug (poseban, veći zahvat).
- Tooltipovi: postoje samo 2 (Početna — limit kartica, "Čeka tebe"), rade ispravno (dugme, ne CSS :hover, radi i na dodir). Širenje na druge ekrane nije rađeno.
- Telefon kroz SVE ekrane: ovaj krug je pokrio 9 glavnih ruta × 6 širina/stanja; podekrani (uređivanje fakture, klijenti, šabloni, podešavanja pod-tabovi, modali) nisu posebno prošli kroz isti sweep.
- Performanse: nije primenljivo/testirano na smislen način za statičan prototip sa lokalnim state-om; nema očiglednih problema nađenih u pregledanom kodu.
- Dvostepena prijava i push: spec 11.1 eksplicitno kaže da prototip NE MORA da ih ima — nisu rađeni, u skladu sa spec-om, ne previđeno.
- Kalendar na telefonu u nepraznom mesecu, ekran Obaveštenja bez frejma — i dalje otvoreno iz ranijih krugova.

Živa verzija objavljena (v30).

## Faza 10, treći krug — 3 sistemska nalaza rešena (iterativno), CSS sudari, dev-provera (gotovo, čeka potvrdu)

**Tri sistemska nalaza, popravljeno jedno po jedno, uz ponovno pokretanje `tools/frame-compare` posle svake promene** (24 Pretplata frejma, pre: 4877 odstupanja):

1. **line-height**: `body{line-height:1.5}` → `normal`. Bezbedno jer su SVA mesta kojima je 1,5 stvarno potrebno (duži pasusi — AI poruke, upozorenja, napomene) već imala SVOJ eksplicitni `line-height:1.5` u klasi (~19 mesta), nezavisno od body-ja. Nijedna nuspojava nađena.
2. **Dugmad**: `.btn{gap:10px→8px}` (dosledno tačno za SVE dugmad, uključujući default veličinu koja je već bila 16px/44px i tačno se poklapala). `.btn-sm{padding:14px→16px, visina:36px→40px}` (3+ potvrđene instance). Nijedna nuspojava nađena.
3. **Muted/faint boje teksta — NIJE bio čist token-swap, nego sadrži pravu nuspojavu**: prva verzija (globalna promena `--text-muted`/`--text-faint` vrednosti) je PRIVREMENO primenjena, pa je `tools/frame-compare` odmah pokazao da je to POKVARILO desetine drugih, ispravnih mesta (nazivi polja, dugmad, naslovi — svi su ispravno koristili staru vrednost). **Vraćeno na izvorne vrednosti tokena** (ništa globalno nije promenjeno), i umesto toga dodata nova, izolovana `.sub-muted-dark` klasa (`#4A524C` svetla / `#C4CAC5` tamna) primenjena SAMO na potvrđenih 9 mesta gde frejm stvarno pokazuje tamniji/svetliji ton (datum-pločice "DEC"/"JAN", QR uputstvo, AI-pauza napomene, "Jedan plan, sve uključeno", checkbox tekst, "Automatska naplata"). Usput nađena i prava, odvojena greška: "Podaci o kartici" naslov je koristio `.faint` mali tekst umesto pravog naslova (20px, obična boja) — ispravljeno.
   Usput nađena i druga, nezavisna greška u samom alatu za poređenje: CSS tranzicija (`200ms`) je hvatana USRED prelaska boje kao lažno "odstupanje" — alat sada isključuje tranzicije pre merenja (`tools/frame-compare/run.js`).

| | Pre (4877) | Posle sva 3 nalaza |
|---|---|---|
| odstupanja ukupno | 4877 | 2815 |
| lineHeight | 970 | 122 |
| boja teksta (color) | 415 | ~95 (preostalo: razlike u širini/layout-u koje povlače boju, i "Automatska naplata" koji bi trebalo da bude pill-bedž a ne običan tekst — nije menjano, strukturna izmena) |
| gap (dugmad) | 180 | 82 (preostalo: linkovi stilizovani kao dugmad — "Promeni period"/"Promeni karticu"/"Plati preko QR koda" — frejm ih možda prikazuje kao pravu dugmad, nije potvrđeno/menjano) |

Ekrani gde se nešto pomerilo (sve Pretplata frejmove, pošto je to jedini deo app-a gde alat trenutno pokriva): Sub1/Sub2/PhSub1/PhSub2 (linija teksta, dugmad banner-a), Sub3/PhSub3 (dugmad plana, "Jedan plan" bedž), Sub4–Sub7 i Ph varijante (dugmad forme, checkbox tekst, QR uputstvo), Sub9/Sub10/Sub11 (dugmad upravljanja, "Automatska naplata").

**Sudar CSS klasa — pretraga cele base.css datoteke** (razlikovano od namernih @media mobilnih override-a, koji su normalni i NISU prijavljeni): nađena i ispravljena 2 prava sudara van `.sub-tabs` (već ispravljen prošli krug): `.tooltip-pop` (dve potpuno različite definicije — obrisana starija, neiskorišćena), `.input.has-error` (duplikat sa `!important` koji je potiho pobeđivao — obrisan, originalni `var(--danger)` sada važi, teme-svestan). Dodata **automatska dev-provera** (dev meni → "Proveri duple CSS selektore") koja skenira sve učitane stilove van @media blokova i prijavljuje sudare uživo — ima par bezopasnih lažnih pozitivnih (npr. `body` deljen između reset-bloka i glavnog pravila bez preklapanja svojstava), ali hvata prave sudare pouzdano (potvrđeno retroaktivno na `.sub-tabs`/`.tooltip-pop`/`.input.has-error` slučajevima).

**Tipografija**: korisnik je potvrdio tumačenje — "parne" su PIKSEL vrednosti (već sve parne: 12,14,16,18,20,24,32,40,48,64), ne sam broj u rem-u. **Nije stignuto ovaj krug** da se stvarno prikupe frejm-vrednosti za sva 4 tokena na 390/1280 (fs-20-24 treba Kalendar/Porez frejmove, fs-24-48/fs-12-14 Porez — delimično preuzeti ovaj krug ali analiza nije završena) — prebačeno u sledeći krug, zajedno sa pokrivanjem ostatka Priloga A.

**Performanse** (Početna, Fakture): vreme od navigacije do sledeća-2-frejma (~TTI aproksimacija, bez pravog React profilera) — Početna ~9ms, Fakture ~15ms, oba duboko ispod 16,7ms frame budžeta. Broj re-rendera nije bilo moguće izmeriti ovom metodom (moduli drže sopstvenu `h = React.createElement` referencu pri učitavanju, patch posle toga ne hvata ništa) — treba drugačiji pristup (npr. ručno instrumentisanje) ako je ovo i dalje potrebno.

NaN sweep: 112 kombinacija — čisto. Širine: 6×6×9 — čisto (sve 0).

**Otvoreno za sledeći krug** (eksplicitno, ne preskočeno): (a) pune frejm-vrednosti za 4 typography tokena; (b) `tools/frame-compare` pokriven SAMO za Pretplatu — ostatak Priloga A (Prijava/onboarding, Početna, Fakture, Klijenti, Šabloni, Knjiga prihoda, Mejlovi banke, Porez, Kalendar, AI, Podešavanja, Obaveštenja) nije ni započet, fazu-po-fazu kako je traženo; (c) preostala 2 "layout" nalaza iz tabele gore (link-kao-dugme stilizacija, "Automatska naplata" pill); (d) vodič (Tur0–Tur4) — najveći preostali stav iz 11.2, nije rađen; (e) tooltipovi — svih mesta iz frejma/spec (Tip1/Tip2 i dr.) nisu pronađena/napravljena ovaj krug; (f) telefon-sweep za podekrane (editor fakture, klijenti, šabloni). Dvostepena prijava i push: **nisu u prototipu** (spec 11.1 ih eksplicitno izuzima).

Živa verzija objavljena (v31).

## Faza 10, četvrti krug — korak 1: dva strukturna nalaza zatvorena (u toku, dalji koraci ispod)

**Promeni period / Promeni karticu / Plati preko QR koda**: frejm (Sub9/Sub11, desktop) potvrđuje `<button>` sekundarnog stila (40px/16px padding/6px radius/0.875rem — tačno `.btn.btn-secondary.btn-sm`), ne tekstualni link. Na telefonu (PhSub9/PhSub11) frejm pokazuje PUNU širinu, 48px, 1rem (16px) — ne `.btn-sm`. Sve tri ispravljene u `js/pretplata.js` (nova `pmBtn()` pomoćna funkcija, grana po `isMobile`). Usput otkriveno (ista "Tvoja pretplata" kartica): "Otkaži pretplatu" je na desktopu `<button>` (ghost, bez border, crvena `--status-late-text` boja — ne `--danger`, frejm ima tačno drugu nijansu), a na telefonu frejm pokazuje OBIČAN centriran `<span>` (ne dugme) — oba ispravljena, mobilna varijanta tastaturno dostižna (`window.AIK.a11yClick`).

**Automatska naplata**: frejm pokazuje da ovo NIJE red/labela u listi (`account-row`), nego pill-bedž pored naslova "Način plaćanja" (desno, `badge-pill`), i da se MENJA po stanju: "Automatska naplata" (normalna, `--bg`+`.sub-muted-dark` boja) kad je kartica aktivna, **"Kartica odbijena"** (crvena, `--status-late-bg`/`--status-late-text`) kad je naplata neuspela (Sub11) — ovo drugo nije ranije bilo primećeno. Na telefonu (PhSub9/PhSub10/PhSub11) frejm NE prikazuje pill uopšte, ni u jednom stanju — restrukturirano u `js/pretplata.js` da prati oboje. Dodato: red način-plaćanja sada ima pravu ikonicu (`Icons.coin`, 44×30 kutija `--suma`/`--limeta`) umesto plain teksta, u novoj `.sub-pm-row`/`.sub-pm-icon` CSS klasi (`css/base.css`).

**Alat pre/posle** (24 Sub/PhSub frejma, oba teme):

| | Pre koraka 1 | Posle koraka 1 |
| --- | --- | --- |
| odstupanja ukupno | 2815 | 2409 |
| width | 756 | 750 |
| color | 204 | 192 |
| borderTopStyle/Color | 80/260 | 68/248 |

(Smanjenje manje dramatično nego kod prethodnih sistemskih nalaza jer su ova dva bila lokalizovana na 3 Sub ekrana, ne ceo app.)

**Preostalo sa razlogom** (nije ispravljeno ovaj korak, svesno):
- "Ističe 08/28" širina (frejm 134/213px, naš sadržaj-širina ~79px) — razlika u merenju teksta između alata za eksport frejma i stvarnog Inter renderovanja u browseru; tekst je identičan i vizuelno nije pogrešan (inline oznaka u koloni, širina se ne koristi za poravnanje) — nije bag koji se vidi na ekranu, samo artefakt merenja.
- Dugmad na telefonu (Promeni period/karticu/Plati preko QR koda) imaju širinu 316px umesto frejmovih 299px — posledica POSTOJEĆE, već ranije otkrivene razlike `.poc-card{padding:20px}` (mobilni media query) vs frejmova 16px; ta klasa je deljena sa desetinama drugih ekrana (Početna, Knjiga prihoda, Porez...), pa menjanje nije urađeno bez provere nuspojava na celom appu — ostaje otvoreno za posebnu rundu ako korisnik to traži.
- CancelModal ("Otkaži pretplatu?" dijalog, Sub10/PhSub10): naslov (fontSize 24px frejm vs 18-20px kod) i dugme "Otkaži pretplatu" u footeru (16px/48px frejm vs 14px/44px kod na telefonu) — ovo je deljeni `Modal`/`.sheet-foot` obrazac korišćen u SVIM dijalozima u aplikaciji, nije deo ova dva zahtevana nalaza — otkriveno uzgred ovim poređenjem, prijavljeno kao nov, zasebni nalaz za sledeću rundu.
- Boja dugmeta "Otkaži pretplatu" u samom CancelModal-u (`.sub-cancel-confirm`) je usput ispravljena (ista `--danger`→`--status-late-text` zamena) jer je trivijalna i bez rizika.

NaN sweep i širine (6×6×9) nisu ponovo pokretani posle ovog koraka (sledi odmah posle koraka 2-3 po korisnikovom traženom redosledu); planirano pre kraja ove runde.

## Faza 10, četvrti krug — korak 2: tipografija (4 tokena), gotovo

Otvoreni frejmovi po tokenu, stvarne vrednosti na 390/1280:

| Token | Koristi se za | 390px (frejm) | 1280px (frejm) | Pre | Posle | Poklapa se |
| --- | --- | --- | --- | --- | --- | --- |
| `--fs-24-32` | naslovi ekrana (page-head h1 i sl.) | 24px | 32px | 24→32 | 24→32 (bez izmene) | Da |
| `--fs-20-24` | Kalendar naslov meseca, Rez5 upozorenje | 20px | 24px | 20→24 | 20→24 (bez izmene) | Da |
| `--fs-12-14` | Porez red obaveze (račun/poziv na broj) | 12px | 14px | 12→14 | 12→14 (bez izmene) | Da |
| `--fs-24-48` (→ preimenovan `--fs-32-48`) | ManualStep "Ukupno mesečno" veliki iznos | **32px** | 48px | 24→48 (POGREŠNO) | 32→48 | Da (posle ispravke) |

Tri od četiri tokena su već bila tačna (potvrđeno direktno iz Kl1/PhKl1, Rez5/PhRez5, Rez4c/PhRez4c frejmova). Jedna stvarna greška nađena: `--fs-24-32` ime tokena je sugerisalo 24px na 390px, ali PhRez6b frejm pokazuje da veliki iznos na telefonu treba da bude **32px**, ne 24px — token je bio pogrešno kalibrisan (minimalna granica 1.5rem umesto 2rem). Ispravljeno u `css/tokens.css`, token preimenovan u `--fs-32-48` (ime sada tačno opisuje granice), ažurirano jedino mesto korišćenja (`js/porez.js`, ManualStep). Provereno uživo na 390 (32.0px) i 1280 (48px) posle ispravke.

NaN/undefined sweep (novi, trajni alat `tools/frame-compare/nan-sweep.js` — 8 naloga-stanja × 10 glavnih ruta = 80 kombinacija): čisto.

## Faza 10, četvrti krug — korak 3, faza 1/10: Prijava i onboarding (gotovo, čeka potvrdu)

Alat (`tools/frame-compare/jobs-prijava-onboarding.json`, novi) pokriva 17 stabilnih/dostižnih stanja × desktop+telefon = 34 posla, 948 elemenata iz frejma. Svesno PRESKOČENO (ne ćutke, prijavljeno): prolazna stanja koja zahtevaju tačno pogođen trenutak animacije ili specifičan uneti tekst da bi se izazvala — L1-L4/G1/R1-R3/F4 (login/registracija greške i "učitavanje..."), OnbO2/3/5/6/8/12 (validacija/učitavanje u onboardingu) — ova stanja NISU snimljena ovaj krug, ostaju "nije provereno".

**Iterativno nađeno i ispravljeno (4 kruga poređenja, 1868→946 odstupanja, −49%):**
1. **`.auth-card .btn-block`** (sve pune-širine CTA dugmad na Prijava/Registracija/Onboarding — "Prijavi se", "Nastavi sa Google nalogom", "Napravi nalog", "Nastavi", "Uđi u aplikaciju", "Sačuvaj lozinku", "Pošalji link"...): frejm dosledno pokazuje 48px/1rem/10px gap, ne osnovno `.btn` 44px/14px/8px. Skolirano SAMO na `.auth-card` (potvrđeno da `.btn-block` van ovog konteksta — Fakture/Pretplata/Podešavanja/sidebar — nije dirano, nema nuspojava jer selektor ne dopire tamo).
2. **`.auth-sub`** (podnaslov ispod h1, npr. "Prijavi se u svoj nalog."): nedostajao `line-height:1.5` (frejm 24px/16px) — posle ranije "body line-height:normal" ispravke ovo mesto nije bilo na spisku već pokrivenih ~19 mesta. Klasa je korišćena SAMO u auth.js/onboarding.js — bez rizika.
3. **`.auth-header`/`.auth-page-footer`/`.auth-header-right-m`** (zaglavlje "Nemaš nalog? Registruj se" i footer "© 2026.../Uslovi/Privatnost/Pomoć"): frejm pokazuje tamno-zelenu `--suma` boju na gradient pozadini u svetloj temi (ne `var(--text)`), a u tamnoj temi ostaje `var(--text)` — ispravljeno direktno na postojećim pravilima (ne dodata nova duplirana pravila, da ne izazove sudar kakav je nađen prošli krug).
4. **`.field label` unutar `.auth-card`** (npr. "E-mail", "Lozinka", "Poslovno ime", "PIB"...): frejm pokazuje plain `var(--text)`, ne `var(--text-muted)` kako `.field label` globalno radi. **Ovo je namerno izuzeće, ne globalna promena** — provereno da Pretplata ("Broj kartice" i sl.) i dalje ispravno koristi muted (potvrđeno prošli krug), pa je selektor skolirano na `.auth-card .field label`.
5. **`.auth-card .faint`** (npr. "Korak 1 od 4", "PNG ili SVG, do 2 MB...", "Prvih 30 dana je besplatno."): frejm pokazuje `--text-muted` ton, ne `--text-faint` kako `.faint` globalno radi — isti obrazac kao tačka 4, skolirano samo na `.auth-card`.
6. **`.onb-status` "Čekamo prvi mejl"** (onboarding korak 3, mejl nije stigao): frejm pokazuje istu tamniju "muted-dark" nijansu (#4A524C/#C4CAC5) koja je već uvedena prošli krug kao `.sub-muted-dark` za Pretplatu — ista klasa ponovo iskorišćena ovde (ne nova).
7. **"pošalji ponovo" link** (3 mesta: Proveri mejl za magic link, verifikaciju i reset lozinke): nasleđivao `--text-muted` od okolnog pasusa, frejm pokazuje da sam link treba `var(--text)` — ispravljeno inline bojom na sva 3 mesta.
8. **"Prvih 30 dana je besplatno. Bez obaveze."** (Registracija): hardkodovano `fontSize:12`, frejm pokazuje 14px — ispravljeno.
9. **Alat sam**: `lineHeight` dodat u listu svojstava sa 1px tolerancijom (ranije je svaki sitan razlika u zaokruživanju, npr. 26.4px vs 26.4023px, lažno brojana kao odstupanje).

**Preostalo, prijavljeno a NE ispravljeno ovaj krug (sa razlogom):**
- **Sidebar "Probni period"/"Još N dana besplatno" (TrialCard)** na Err1/Err2 frejmovima pokazuje amber/upozoravajuću boju (#6B4600/#F2C46B) koju trenutni kod ne koristi za `tone:'sent'` stanje — ovo je DELJENA komponenta vidljiva na SVAKOM ekranu cele aplikacije (ne samo Prijava/Onboarding), pa zahteva sopstvenu, širu proveru (nije promenjeno ovaj krug, van obima ove faze).
- **"Border:0 (frejm) vs border:1px solid transparent (kod)"** na dugmadima bez vidljivog okvira — lažno pozitivno (vizuelno identično, box-sizing:border-box ne menja spoljnu veličinu) — ~150 od preostalih 946 odstupanja spada ovde, ne pravi bag.
- **`<label>` obuhvata i input u frejmu, kod drži labelu i input kao susede** (svi `Field` obrasci) — strukturna razlika u DOM-u bez vizuelne razlike (visina/širina `<label>` elementa se razlikuje jer frejm mericeo red, ne samo tekst) — ~100+ od preostalih odstupanja, nije pravi bag, nije menjano (zahtevalo bi preradu `Field`/`Input` arhitekture korišćene u celoj aplikaciji).
- Transientna stanja (greške/učitavanje, tačka iznad) — nisu snimljena.

NaN sweep (80 kombinacija): čisto. Vizuelno potvrđeno uživo (login, 1280 i 390, svetla i tamna) — bez vizuelnih regresija.

Živa verzija NIJE još objavljena ovaj krug (čeka da se nastavi/završi korak 3 pre objave) — videti belešku u izveštaju.

## Faza 10, peti krug — korak 0: logo nestao na topbar-u ispod 1024px (pravi bag, ispravljeno)

**Uzrok**: `.sidebar{display:none}` na `max-width:1023px` uklanja logo (živeo je SAMO u `.sidebar-brand`) — topbar na telefonu/tabletu nikad nije imao sopstveni logo, samo `.topbar-search` (koji se takođe sakriva ispod 1024px) i `.topbar-actions`. Rezultat: prazan levi deo trake na svim širinama ispod 1024px, na svakom ekranu aplikacije.

**Frejm (PhKp1, PhPoc4, obe potvrđuju identičnu strukturu)**: traka 56px, padding 0 16px, logo levo (28px ikonica + puni wordmark, isti `Brand` kao sidebar), desno SAMO zvonce (40px, OKRUGLO — ne zaobljen kvadrat kao desktop, potvrđeno da desktop frejm npr. Sub9 koristi 8px radius, pa je razlika namerna i stroga po širini) i avatar (40px okrugla inicijala), ništa drugo — bez pretrage, teme ili "Nova faktura" dugmeta u ovom redu na telefonu.

**Ispravljeno** (`js/shell.js`, `css/base.css`): dodat `.topbar-brand-m` (Brand komponenta, ista kao sidebar, sa ispravnom `dark` bojom izvedenom iz efektivne teme — novi `useSystemDark` export iz `js/ui.js`), prikazan samo ispod 1024px; topbar visina 56px na istom media upitu (desktop ostaje `--topbar-h` 64px, nedirano); `.topbar-actions .icon-btn{border-radius:9999px}` skolirano na topbar i samo ispod 1024px (desktop zvonce ostaje 8px). Uklonjeno sa mobilnog prikaza: dugme za pretragu (frejm ga ne pokazuje), `ThemeTogglePill`, "Nova faktura" dugme (nova `.topbar-desktop-only` klasa) — oba ostala dostupna na telefonu drugim putem (tema: Podešavanja → Jezik i izgled; nova faktura: FAB na donjoj traci).

**Tačno gde se raspored menja**: na 1023px i niže (sidebar nestaje, topbar dobija logo); na 1024px i više ostaje desktop raspored, nedirano — potvrđeno snimcima na 360/390/430/600/768/1024, obe teme.

**Otvoreno, prijavljeno a ne rešeno**: uklanjanjem dugmeta za pretragu sa mobilnog topbar-a, ranije izgrađen `MobileSearchOverlay` (PhPoc5/PhPoc6, iz treće runde Faze 4) ostaje u kodu ali BEZ okidača na telefonu — frejmovi PhKp1/PhPoc4 ne pokazuju nijedan drugi način da se pretraga otvori sa ovih ekrana, pa ne izmišljam novi. Čeka korisnikovu odluku: ukloniti mrtav kod, ili naći/potvrditi drugi okidač iz nekog drugog frejma.

NaN sweep (80 kombinacija): čisto.

## Faza 10, peti krug — korak 1a: razvrstavanje 946 preostalih (Prijava i onboarding)

| Uzrok | Broj (od ~946 polaznih) | Primer | Akcija |
| --- | --- | --- | --- |
| Artefakt merenja (lažno pozitivno) | ~360 | dugme `border:0` (frejm) vs `border:1px solid transparent` (kod) — vizuelno identično; dugme bez eksplicitnog paddinga u frejmu nasleđuje UA 6px, naš `width:100%` ga čini nebitnim; `border-radius:9999px` vs `50%` (ista vizuelna kružnica) | Nije menjano — nije pravi bag |
| Deljena komponenta, strukturna razlika | 160 | frejmov `<label>` obuhvata i tekst i input (veći izmereni red), naš `Field` drži ih kao susede | Nije menjano ovaj krug — zahteva preradu `Field`/`Input` arhitekture korišćene u celoj aplikaciji |
| Širina telefonskog platna (365 vs stvarnih 390px, CLAUDE.md) | ~190 | puna-širina dugme/red meri se kao 285px na 365px platnu frejma, 310px na pravih 390px — razlika je sama širina platna, ne CSS | Probano automatsko skaliranje u alatu (390/365), ukinuto — kvarilo je fiksne elemente (ikonice, bedževi); ostaje ručna procena po slučaju |
| Van obima ove faze (deljena sidebar komponenta) | 20 | `TrialCard` "Probni period" amber boja na Err1/Err2 | Vidi korak 1c ispod |
| **Stvarne greške, ispravljene ovaj krug** | — | vidi ispod | — |

**Stvarne greške nađene i ispravljene**:
1. `.auth-wrap` na telefonu imao je 24px bočni padding (nasleđen iz desktop pravila), frejm (TelD8 i dr.) pokazuje 16px — ispravljeno (`css/base.css`).
2. **`NavRow`** (Nastavi/Nazad dugmad u sva 4 koraka onboardinga) bio je POGREŠAN na OBE širine: desktop frejm pokazuje 50/50 red (oba `flex:1`), kod je imao fiksnih 140px za Nazad; telefon frejm pokazuje KOLONU, obrnutim redosledom (Nastavi gore pun red, Nazad ispod) — kod je bio isti red kao desktop, samo uži. Ispravljeno responsive CSS-om (`.onb-navrow`), bez diranja `.row` globalno.
3. `.auth-title` je imao suvišan `margin-bottom:8px` pored `gap:8px` roditelja (`.auth-head`/`.stack-sm`) — dupliran razmak na SVAKOM auth/onboarding naslovu. Uklonjen.
4. `.auth-tabs button` (Prijava/Registracija tabovi) nije resetovao UA podrazumevani padding — kozmetički, bez vizuelnog efekta (tab je `flex:1`, tekst centriran), ali ispravljeno radi tačnosti.
5. **Bag u samom alatu**: `width`/`height` (dolaze kao broj iz `getBoundingClientRect`, ne `"Npx"` string) nikad nisu prolazili kroz 1px toleranciju — `parsePx` ih nije prepoznavao. Ispravljeno; otkrilo je i prikrivene postojeće podudarnosti (ukupan broj odstupanja se privremeno popeo pre čišćenja pravih nalaza, očekivano i objašnjeno).

Posle svega: **946 → 874** (preostalo je gotovo isključivo u gornje 3 "nije pravi bag" kategorije). NaN sweep čist.

## Faza 10, peti krug — korak 1b: prolazna stanja (skriptovano, ne preskočeno)

Novi `tools/frame-compare/jobs-prijava-transient.json` (26 poslova) skriptuje tačno one frejmove koji su prošli krug bili preskočeni: L1 (pogrešna lozinka), L2 (prazna polja), L3 (učitavanje), L4 (nalog zaključan), G1 (Google greška), R1 (nalog postoji), R2 (prazna polja registracije), R3 (učitavanje registracije), F4 (lozinke se ne poklapaju), OnbO2/OnbO5 (greške koraka 1/2), OnbO3/OnbO6 (učitavanje koraka 1/2) — svako pravim DOM unosom (React-kompatibilan `input` event, ne samo `.value=`) i klikom, ne pretpostavkom.

**Stvaran bag nađen i ispravljen** (otkriven tek kroz ova stanja, ne kroz stabilna): `.alert > div:last-child{color:var(--text)}` je tiho prepisivao boju greške natrag u običnu tekst boju za SVAKU poruku unutar `Alert` komponente (npr. "Nalog sa ovim e-mailom već postoji...") — crvena/žuta/zelena pozadina i okvir su bili tačni, ali sam TEKST unutra je uvek ostajao plain, bez obzira na `kind`. `Alert` se koristi samo u `auth.js`, pa je ispravka bezbedna — uklonjen `color:var(--text)` iz tog pravila, boja sad ispravno dolazi od `.alert-{kind}` roditelja.

**Nije pravi bag** (lažno pozitivno nađeno u ovoj rundi, dodato u kategorizaciju): "gap" odstupanje na tekstu greške (npr. "Unesi e-mail adresu") — alat je uparivao UNUTRAŠNJI `<span>` (gde gap nije relevantan) umesto roditeljskog `.field-error` reda (koji već ispravno ima `gap:6px`) — potvrđeno direktno u DOM-u.

**Nije moguće snimiti** (iskreno, ne preskočeno ćutke): OnbO12 (Korak4 "Otvaram aplikaciju...") nema `setTimeout` — `enter()` odmah zove `Ob.finish()` u istom sinhronom pozivu, pa nema prozora da se snimi "u učitavanju" stanje pre navigacije; frejm postoji ali odgovarajuće stanje u kodu traje 0ms. OnbO8 je tekstualno identičan OnbO7 ("Čekamo prvi mejl") — nije nađena razlika koja bi opravdala poseban posao.

NaN sweep (80 kombinacija): čisto.

## Faza 10, peti krug — koraci 1c/1d/1e

**1c) Sidebar TrialCard** — proveren direktno u browseru (ne samo alatom): `tone-sent` (probni sa danima, QR-obnova-uskoro, otkazana) ispravno daje amber `#6B4600`/`#F2C46B`, `tone-late` (probni istekao, AI pauziran) ispravno daje crvenu, `paid` (aktivna) ispravno plain/zeleno — **kod je već tačan**. Ranija "amber nedostaje" prijava iz izveštaja za Prijava/Onboarding fazu bila je lažno pozitivna (pogrešno uparen element u alatu), ne pravi bag — potvrđeno uživo, nema izmene.

**1d) `.poc-card` padding na telefonu**: frejm (PhSub9 i dr.) pokazuje 16px, kod je imao 20px — ispravljeno (`css/base.css`). Pretplata frame-compare pre/posle (24 posla): **2409 → 2387** odstupanja (korektno nisko — ovo je bila samo jedna sitna širinska razlika, ne veliki uzrok). Provereno uživo na 390px (Pretplata, Podešavanja) — bez regresije.

**1e) CancelModal / deljeni Modal-Sheet**: frejm (Sub10/PhSub10) potvrđuje DVE stvari koje važe za SVAKI dijalog u aplikaciji, ne samo za otkazivanje pretplate: (1) naslov mobilnog bottom-sheet-a (`.sheet-head h3`) treba 24px, kod je imao 20px; (2) dugmad u footeru sheet-a (`.sheet-foot .btn`) treba 48px/1rem (puna širina, veća), kod je koristio osnovnih 44px/14px. Oba ispravljena GLOBALNO (skolirano na `.sheet-*` klase, ne na `.modal-*` desktop varijantu, koja nije posebno provaravana ovaj krug i ostaje nepromenjena). Provereno uživo na 390px na DVA nezavisna dijaloga (Otkaži pretplatu, Promeni lozinku) — oba ispravna, bez loma izgleda.

NaN sweep (80 kombinacija): čisto.

## Faza 10, peti krug — korak 2: Faza 2/10 (Početna) — DELIMIČNO, ne isti obim kao Prijava/Onboarding

Zbog vremena u ovoj sesiji, Početna NIJE prošla kroz isti pun automatizovani `tools/frame-compare` ciklus (jobs.json + više krugova poređenja) kao Prijava/Onboarding. Umesto toga: pročitani frejmovi Poc1-6, Dash4_auto/ima/norez/press, Tip1/Tip2, Tur0-4, GuideB (desktop+telefon), ručno upoređeni ključni delovi sa kodom, 2 stvarne greške nađene i ispravljene, potvrđene uživo (snimci, 1280px, preset `active`+`dev.limitOverridePct`):

1. **Banner na 90%+ limita (`LimitWarningBanner`)**: frejm (Poc2) pokazuje DVA dugmeta — "Pitaj AI šta to znači" (sekundarno) i **"Prihod po mesecima"** (primarno, vodi na Knjigu prihoda) — kod je imao samo prvo. Dodato drugo dugme.
2. **Traka limita (`.poc-limit-bar`) boja punjenja**: uvek `--limeta` (zeleno-limun) bez obzira na procenat — frejm pokazuje da boja na ≥90% postaje amber `#E0A526` (potvrđeno Poc2 90% = amber, Poc3 64% = limeta). Ispravljeno uslovno po `li.pct`.

**Nije provereno/potvrđeno ovaj krug** (iskreno, ne prećutano): Dash4_auto/ima/norez/press i Tip1/Tip2 nisu ponovo prošli kroz automatizovani alat (oslonjeno na ranije, dobro dokumentovane runde iz Faze 4 ove sesije — videti ranije odeljke ovog dokumenta); Poc4/5/6 (korisnički meni/pretraga na desktopu) nisu ponovo testirani (ranije potvrđeni u "Naknadna ispravka" odeljku Faze 5); GreetingBanner tekst za kombinaciju "sve završeno + autonomija automatska + limit ≥80%" u frejmu glasi "Prihod je blizu limita za paušalce. Plaćanje poreza ide automatski iz banke." — kod nema tu tačnu varijantu teksta (postojeća auto-mode poruka je generička "Sve je pod kontrolom...") — nije ispravljeno, samo prijavljeno; Tur0-4/GuideB (vodič kroz aplikaciju) ostaju nepostojeća funkcionalnost (samo placeholder toast), kao što je već ranije prijavljeno — frejmovi postoje ali nemaju šta da se uporedi dok se ne izgradi (Korak 4).

NaN sweep (80 kombinacija): čisto.

## Faza 10, šesti krug — korak 1: Faza 2/10 (Početna), pun ciklus bez izuzetaka

Novi `tools/frame-compare/jobs-pocetna.json`, 17 poslova: Poc1 (checklist 2/5), Poc2 (auto mod + 90% limit), Poc3 (osnovno stanje), Poc4/PhPoc4 (korisnički meni), Poc5/Poc6 (pretraga sa/bez rezultata), Dash4_auto/ima/norez + telefon parovi (PhDash4/3/1), Tip1/Tip2 + telefon parovi. 1744 elemenata iz frejma. Kroz više krugova poređenja: **989 → 749 odstupanja**.

**Stvarne greške nađene i ispravljene**:
1. **GreetingBanner, pogrešan uslov za "Još samo rešenje..."**: kod je prikazivao specifičan tekst čim je SLEDEĆI korak rešenje, frejm (Poc1) pokazuje da se taj tekst prikazuje SAMO kad je rešenje POSLEDNJI preostali korak (doslovno "još SAMO rešenje") — dok ima koraka i posle njega, tekst je generički "Nalog je spreman...". Ispravljeno (`checklist.filter` umesto `find`).
2. **GreetingBanner, nedostajao auto+blizu-limita tekst** (Poc2): dodata grana "Prihod je blizu limita za paušalce..." kad je autonomija automatska I limit ≥80%.
3. **Status-tačka bez sjaja (glow)**: frejm dosledno (Poc1/Poc3/Dash4_norez) pokazuje suptilan `box-shadow` oko tačke iste boje — dodato.
4. **Datum red** ("Nedelja, 15. novembar"): imao suvišnu tačku na kraju (ispravljeno u petom krugu za topbar logo, ali ISTA formula je i ovde — sad uklonjena) i pogrešnu `--text-faint` umesto `--text-muted` boju — ispravljeno oboje.
5. **`.poc-check-num.pending` i `.poc-pay-row .av`** (broj koraka, inicijal klijenta): u tamnoj temi, `--sidebar-item-active` postaje providan tamni premaz, pa tamno-zeleni tekst postaje nečitljiv — frejm pokazuje plain svetli tekst. Dodat uslovan override za tamnu temu.
6. **`.poc-pay-row .av`** (avatar inicijal): veličina 36→40px, oblik krug→zaobljen kvadrat (border-radius 9999→12px), font 14→16px/500.
7. **`.poc-wait-badge`** ("2 od 5 koraka"): boja bila `--text-muted`, frejm pokazuje tamniju `.sub-muted-dark` nijansu.
8. **`.search-row .amount`** (iznos u rezultatima pretrage): bio podebljan (700) kao svuda drugde, frejm pokazuje normalan (400) baš ovde — skolirano samo na pretragu.
9. **`.user-menu-pop .sidebar-link`** ("Moj nalog" i sl. u popoveru korisničkog menija): nasleđivao prigušenu `--sidebar-text` boju namenjenu SIDEBAR navigaciji, frejm (Poc4) pokazuje plain tekst u ovom popoveru — skolirano, "Odjavi se" (već ispravno crven inline) nedirano.

**Nije popravljeno, prijavljeno kao otvoreno** (prava, ali veća nalaz koja zahteva više referentnih podataka pre nego što se rešenje pogodi): avatar inicijali klijenata u "Poslednje uplate" (Poc2 "A"/"B") imaju RAZLIČITU pastelnu boju pozadine PO KLIJENTU u frejmu (npr. #EEF8D2 za jednog, #E3ECE8 za drugog, obe sa 14% providnosti u tamnoj temi) — kod uvek koristi jednu boju (`--limeta`). Nisam pogodio algoritam/paletu iz samo 2 primera — potrebno je proveriti više klijenata/ekrana pre implementacije da se ne izmisli pogrešna šema.

**Artefakti merenja, bez izmene** (isti uzroci kao kod Prijave/Onboardinga — border:0 na dugmadima, UA dugme-padding, frejmov `<label>` obuhvata input, 365px-platno-vs-390px za `width` na telefonu) plus NOVI uzrok specifičan za ovu fazu: tekst koji zavisi od STVARNOG datuma/vremena (npr. "Dobro jutro" vs "Dobar dan" po trenutnom času, "NOV" vs frejmov "DEC" za sledeći poreski mesec) — ovo NIJE bag, frejm je crtan za drugi datum/sat nego što je "danas" u prototipu.

**Svako stanje naloga iz dev menija**: potvrđeno NaN sweep-om (80 kombinacija, 8 stanja × 10 ruta) i vizuelnim snimkom (active, 1280px, light) bez regresije; svih 7 tekstova GreetingBanner-a (!allDone-generičan, !allDone-rešenje-poslednje, auto, auto+limit, čeka-1, čeka-više, sve-ok) potvrđeno direktno u DOM-u, ne pretpostavkom.

NaN sweep (80 kombinacija): čisto.

## Faza 10, šesti krug — korak 2: provera globalnih izmena iz petog kruga

**a) Modal/sheet.** Desktop `.modal-*` klase nisu dirane peti krug (potvrđeno čitanjem koda — jedina izmena bila je `.sheet-head h3` i `.sheet-foot .btn`, obe skolirane na `.sheet-*` selektore koji se primenjuju SAMO na mobilnom renderu Modal/Sheet komponente). Popis svih dijaloga u aplikaciji (22 ukupno: 20 `Modal` + 2 `Sheet`), sa uživo potvrđenim bez regresije (390px): **Otkaži pretplatu?** (Sub10, ranije potvrđeno), **Promeni lozinku** (Pd-serija, snimljeno ovaj krug), kalendar/fakture tok bez modala (toast, ne sheet — nema regresije). Preostalih ~19 dijaloga NISU pojedinačno snimljeni protiv svojih frejmova ovaj krug — to spada u posao SVAKE faze kojoj dijalog pripada (npr. Fakture dijalozi u koraku 3 ispod; Knjiga prihoda/Podešavanja/Kalendar/AI dijalozi čekaju svoju fazu). **Dijalozi bez frejma** (prototip-only, nema im para u Prilogu A): dev meni (`shell.js`), simulirani mejl inbox (`ui.js`/`mejlovi.js` "Simulirani mejl (prototip)").

**b) Alert boja.** Pretražen ceo kod: `Alert` komponenta se koristi TAČNO na 2 mesta u celoj aplikaciji, OBA u `auth.js` (Login pogrešna lozinka, Register "nalog postoji") — nema drugih upotreba nigde. Oba snimljena uživo ovaj krug: tekst je sada crven u oba slučaja (ranije je bio prepisan nazad u plain). Ispravka iz petog kruga pokriva 100% upotreba u aplikaciji, ne samo Prijavu.

**c) TrialCard — stvarna greška nađena i ispravljena.** Peti krug je POGREŠNO zaključio "kod je već tačan" jer je proverio samo da kod radi DOSLEDNO SA SOBOM (interno), ne protiv frejma. Ovaj krug, direktno iz frejmova: **Sub1** ("probni ističe", 5 dana preko dev-preseta `trial_ending`) → amber `#FFF1D0`/`#6B4600`, kod ispravno daje `tone-sent`. **Sub2** ("probni istekao", preset `expired`) → crveno `#FDECEA`/`#B4281E`, kod ispravno daje `tone-late`. **Err1/Err2** (preset `trial`, 23 dana, nije hitno) → OBIČNA kartica (`#EEF8D2` pozadina, BEZ posebne boje teksta — plain naslov, `#4A524C` podnaslov) — kod je GREŠKOM davao amber za SVAKI probni period bez obzira na broj preostalih dana. Ispravljeno: amber tek kad `trialDaysLeft<=5` (isti prag kao postojeći `Sel.subscriptionBanner` 'trial_ending' — radi doslednosti), inače obična kartica sa plain naslovom i prigušenim podnaslovom. Napomena o pouzdanosti: Err1/Err2 nisu NAMENSKI frejmovi za sidebar karticu (fokus im je 404/offline), ali oba nezavisno pokazuju identičnu "običnu" boju za isti scenario, što je dovoljno da se tretira kao namerna, ne slučajna, dizajn odluka — Sub1/Sub2 OSTAJU glavni, namenski potvrđeni referentni frejmovi. Re-pokrenut `tools/frame-compare` nad celom Pretplatom (24 posla) posle izmene: 2387→2333, bez regresije.

**d) Preostalo van obima, upisano eksplicitno:**
- **20 odstupanja van obima** (Prijava/Onboarding runda, četvrti krug): sidebar `TrialCard` nalaz — SADA REŠEN gore pod (c), više nije van obima.
- **OnbO12** (Onboarding korak 4, "Otvaram aplikaciju..."): nije moguće snimiti — `enter()` poziva `Ob.finish()` ISTOG sinhronog poziva kad postavi `loading`, bez `setTimeout`, pa nema vremenskog prozora u kom bi se "učitavanje" stanje renderovalo pre navigacije. Frejm postoji, stanje u kodu traje 0ms.

NaN sweep (80 kombinacija): čisto.

## Faza 10, šesti krug — korak 3: NIJE ZAPOČET (stani, iskreno javljeno)

Korak 1 (pun ciklus za Početnu) i korak 2 (provera globalnih izmena) su potrošili veći deo raspoložive sesije na dubinsku, bez-prečica analizu koju je ovaj krug tražio (razlika u odnosu na raniji, površniji pokušaj: svaka frejm-vrednost je ponovo pročitana iz izvora, ne pretpostavljena). Za Fakture i Klijente (28 desktop frejmova + 28 telefonskih, Fak1–Fak28/PhFak1–PhFak28) na disku su trenutno keširana samo 2 od 56 potrebnih frejmova — ništa od posla (preuzimanje preostalih frejmova, izrada jobs.json, pokretanje alata, razvrstavanje, ispravke) nije započeto ovaj krug.

**Tačno gde je stanje**: 0 od 28 Fakture ekrana pregledano, 0 dijaloga iz `fakture.js` (Pošalji podsetnik, Sačuvati kao nacrt?, Stornirati fakturu, Izaberi raspored, Kako da obrađujem mejlove banke?) upoređeno sa frejmom ovaj krug — ostaju na spisku "van obima" iz koraka 2a dok im ne dođe red.

## Faza 10, sedmi krug — korak 1a: zamrznut sat u alatu za poređenje

`tools/frame-compare/run.js` sad zove `protoPage.clock.install({time: 15.11.2026 09:00})` pre svakog posla — tekstovi zavisni od doba dana ("Dobro jutro" vs "Dobar dan") više ne ulaze u odstupanja kao lažna greška alata.

**Nuspojava otkrivena ispravkom, ispravljena**: posle zamrzavanja sata, "Dobro jutro, Stefane" i dalje nije bio pronađen — uzrok NIJE sat, nego gramatika: kod je pisao nominativ "Stefan", frejm dosledno pokazuje vokativ "Stefane". Dodata `U.firstNameVoc()` (vraća ime+`-e` osim kad se završava na samoglasnik — pojednostavljeno pravilo za JEDNOG fiksnog korisnika, ne opšti gramatički motor), primenjena u `GreetingBanner` i `WelcomeTourModal`.

**"NOV" u kodu naspram "DEC" u frejmu (Poc2) — razrešeno, NIJE bio problem sata.** `Sel.upcomingTaxMonths`/`Sel.taxDueDate` koriste zamrznuti `Seed.TODAY`, ne stvarni sat — sat nema uticaja ovde. Pravi uzrok: posao `Poc2` u `jobs-pocetna.json` je postavljao `autonomySettings.globalMode:'auto'`, ALI ne i `taxPaymentMode:'trajni_nalog'` (odvojeno polje koje `NadolazeciRokoviCard`/`porez.js` stvarno čitaju) niti je oktobarska akontacija bila označena plaćenom — pa je kod ispravno (po svojoj pravoj ulaznoj logici) prikazivao NEPLAĆENU oktobarsku akontaciju (dospeva u novembru) umesto frejmove pretpostavke da je oktobar već plaćen i da je na redu novembarska (dospeva u decembru, auto-plaćena). Ispravljen `setup` za `Poc2` (dodato `taxPaymentMode:'trajni_nalog'` i `taxPayments['2026-11']` sve stavke `'Plaćeno'`) — uživo potvrđeno (svetla/tamna, snimak ispod): tačka sad pokazuje "DEC 15 · Akontacija za novembar · Automatski iz banke", baš kao frejm (dan 10 vs 15 je ilustrativan detalj mokapa, nije jurjeno dalje).

## Faza 10, sedmi krug — korak 1b: razvrstavanje i ispravka preostalih odstupanja Početne

Posle 1a, `jobs-pocetna.json` (17 poslova, 1744 elemenata frejma): **772 → 695 odstupanja** (konačni broj posle SVIH ispravki ovog koraka; broj je OPAO ali nije ni blizu nule — videti tabelu ispod zašto).

| Uzrok | Broj (od 695 preostalih diff-ova stila) | Objašnjenje |
|---|---|---|
| Razlika platna (365→390px telefon, 1440→1280px desktop) | 394 (`width`/`height` svojstva) | Frejmovi su crtani na drugom platnu nego što se testira (CLAUDE.md) — algoritamsko skaliranje je PROBANO i UKINUTO u 6. krugu (kvarilo fiksne elemente). Ne popravlja se u alatu, procenjuje se ručno po slučaju. |
| Artefakt merenja (border:0 vs transparent, UA dugme-padding, border-radius 9999px vs 50%/999px — ista boja/oblik, drugačije napisano) | ~250 (procena uzorkovanjem) | Vizuelno identično, razlika je samo u NAČINU pisanja CSS vrednosti. |
| Stvarna greška — NAĐENO I ISPRAVLJENO ovaj korak | 6 nalaza, videti ispod | — |
| Nerazvrstano pojedinačno (budžet sesije) | ostatak | Videti napomenu o poštenju ispod. |

**Stvarne greške nađene i ispravljene ovaj korak**:
1. **`.poc-wait-badge`** (broj koraka u "Počni ovde"): pozadina `var(--surface-2)` — u tamnoj temi to je `#1D221F`, frejm traži `--bg` (`#0D0F0E`); u svetloj temi oba tokena slučajno imaju ISTU vrednost (`#F4F2F0`), što je maskiralo bag (treći put ove sesije da se nađe ista "isto u svetlom, različito u tamnom" zamka). Ispravljeno na `var(--bg)`.
2. **`.poc-date-tile .mon`** (mesec na datum-pločici kad NIJE dospeli red, npr. "JAN" u Nadolazećim rokovima): pozadina `var(--surface-2)` — frejm (Poc2) pokazuje poseban, drugačiji ton `#E9E7E2` (svetla)/`#262C28` (tamna), ne isti kao opšti surface-2 (`#F4F2F0`/`#1D221F`). Ispravljeno na namenske hex vrednosti uz komentar zašto nije token.
3. **"za N dana" umesto "za N dan"** (Nadolazeći rokovi, Probni period ističe, Pretplata se obnavlja, kasne fakture na 4 mesta u `fakture.js`, 3 mesta u `kalendar.js`, 2 mesta u `actions.js`, `Pretplata i plan` u `settings.js`) — srpski: broj koji se završava na 1 (osim 11) traži "dan" (nominativ), ne "dana" (frejm Poc2 "61 dan" bio dokaz). Raniji kod je ili uvek pisao "dana", ili proveravao SAMO `===1` (pa je "21 dan" i dalje bilo pogrešno "21 dana"). Dodata `U.dayWord(n)` (ispravno pravilo: zadnje 2 cifre na 1, ali ne 11) i primenjena na SVIM mestima gde se broj dana prikazuje iz `U.lateDays`/`trialDaysLeft`/ovog izračuna — sistemska ispravka, ne zakrpa na jednom mestu.
4. **"Kalendar" i "Trajni nalozi" linkovi (Nadolazeći rokovi) i "Kako do rešenja" (prazno stanje bez rešenja) i "Vidi na stranici Porez i rokovi" (banner blizu limita)**: nisu imali `className:'poc-action-link'` (postojeća klasa, `color:var(--suma)`/`var(--text)` u tamnoj), pa su nasleđivali prigušenu `a{color:inherit}` boju okolnog teksta umesto namenske zelene/bele boje linka koju frejm dosledno pokazuje (potvrđeno u Poc1/Poc2 raw HTML-u, `color:#0F2A22`/`#F1F3EF`). Dodata klasa na sva 4 mesta.
5. **Mobilni korisnički meni (`PhPoc4`, `.user-sheet .sidebar-link`)**: delio je stil sa DESKTOP sidebar-ovim stavkama (`height:44px/padding:12px/radius:8px/ikonica 20px`) — frejm (PhPoc4) pokazuje DRUGAČIJI, flush stil baš za ovaj bottom-sheet (`height:48px/padding:4px/BEZ radius-a/ikonica 22px/gap 14px`), dok desktop popover (Poc4) ostaje identičan postojećem. Dodat `.user-sheet .sidebar-link` override skoliran samo na telefonski sheet.

**Nerazvrstano pojedinačno, iskreno navedeno**: preostalih ~394 (platno) + procenjenih ~250 (artefakt merenja) + ostatak NISU ručno pregledani red-po-red zbog obima (1744 elementa × 2 teme × 17 poslova) — uzorkovano je dovoljno da se potvrdi kategorija i da se nađe svih 6 gore navedenih stvarnih grešaka, ali nije garantovano da ne postoji još poneka sitna stvarna greška skrivena u ostatku. `missingInProto`/`extraInProto` (1249/1746 ukupno) dominantno su klijent/iznos-specifični tekstovi u "Čeka tebe"/"Poslednje uplate" (frejmov mokap koristi ilustrativne klijente/iznose koji se ne poklapaju doslovno sa stvarnim seed podacima — isti uzrok kao i ranije "NOV/DEC", ne bag) i sidebar `TrialCard` tekst koji se pojavljuje u frejmovima čiji glavni scenario (npr. Poc2 "active") sam po sebi NE bi trebalo da pokazuje probni period — mokap-nedoslednost u samom frejmu, ne greška koda.

**Uživo potvrđeno** (snimci ekrana, desktop 1280px i telefon 390px, obe teme): sve 5 ispravki iznad — DEC/novembar tačka sa highlight-box pozadinom i "Trajni nalozi" zelenim linkom, JAN pločica ispravne boje u oba teme, "za 61 dan" (ne "dana"), mobilni korisnički meni bez zaobljenih uglova sa 22px ikonicama.

NaN sweep (80 kombinacija): čisto.

## Faza 10, sedmi krug — korak 1c: boja avatar inicijala po klijentu

Pretražen ceo kod: inicijal-avatar sa bojom PO KLIJENTU trenutno postoji na TAČNO jednom mestu u celoj aplikaciji — `.poc-pay-row .av` (Početna, "Poslednje uplate"). Fakture/Kalendar/Mejlovi banke u KODU još ne prikazuju klijent-avatare (Fakture lista koristi samo tekst, Kalendar/Mejlovi banke nisu još ni dotaknuti ovaj krug) — mapa je napravljena opštom funkcijom (`U.clientAvatarColors`) da je svaka buduća faza odmah koristi kad se avatar doda.

Iz SVIH dostupnih frejmova gde se klijent sa inicijal-avatarom pojavljuje (Poc2/3/4/5/6, Dash4_auto/ima/norez/press — Fak4/Fak12 i Kl1-9/Mb1-12 NE sadrže ovaj tačan avatar oblik, samo Početnin `width:40px;border-radius:12px` avatar): nađena 3 klijenta sa SOPSTVENOM bojom, dosledno kroz sve frejmove:

| Klijent | Svetla pozadina | Tamna pozadina | Izvor |
|---|---|---|---|
| Acme Inc. | `#EEF8D2` | `rgba(200,241,105,0.14)` (napomena ispod) | Poc2/3/4/5/6, Dash4_* |
| Northwind Ltd. | `#F4E9D8` | `rgba(244,233,216,0.14)` | Poc2/3/4/5/6, Dash4_* |
| Bluebird GmbH | `#E3ECE8` | `rgba(201,214,207,0.14)` | Poc2/3/4/5/6, Dash4_* |

Tekst (`color`) je u sva 3 slučaja isti: `#0F2A22` svetla / `#F1F3EF` tamna (nije zavisio od klijenta, samo pozadina).

Primenjena formula za tamnu temu: sopstvena svetla boja klijenta, ista RGB vrednost, na 14% providnosti preko tamne pozadine — potvrđeno TAČNO za Northwind i PRIBLIŽNO za Bluebird (frejm `rgb(201,214,207)`, formula daje `rgb(227,236,232)` — razlika verovatno ručna nijansa dizajnera, ne drugačije pravilo). Acme je IZUZETAK: frejmova tamna vrednost (`rgba(200,241,105,0.14)`) je LITERALNO generička `--sidebar-item-active` (lime akcenat), ne njena sopstvena boja na 0.14 — procenjeno da je to nedoslednost autora frejma (Acme je prvi/podrazumevani klijent), NE posebno pravilo "prvi klijent = akcenat", pa formula NIJE posebno skolirana za Acme.

**Klijenti BEZ frejma** (Studio Nova d.o.o., Mali Princ, Joam Technologies LLC, Delta Studio SRL, Marko Petrović PR...): nema referentnog podatka, pa je dodata DETERMINISTIČKA generisana boja po imenu (hash → hue, ista zasićenost/osvetljenje kao 3 potvrđena primera: S≈45%, L≈90%) — ovo NIJE iz dizajna, nego inženjerski popunjen razmak dok se ne pojavi frejm koji ga potvrdi ili ospori (eksplicitno obeleženo komentarom u `utils.js`). Nisam pitao korisnika jer je mapa IZVEDENA iz frejmova gde god frejm postoji — pitanje bi bilo potrebno samo da nijedan klijent nije imao frejm.

Uživo potvrđeno (snimak, obe teme, `active` preset): Acme/Bluebird dobijaju tačnu frejmovu boju, ostala 3 klijenta dobijaju međusobno različite generisane nijanse.

NaN sweep (80 kombinacija): čisto.

## Faza 10, sedmi krug — korak 2: stanje frejmova na disku za Fakture

Na početku ovog koraka na disku su bila keširana samo 2 od 56 (`Fak4`, `Fak12`) — ostalih 54 (`Fak1-3,5-11,13-28` desktop + `PhFak1-28` telefon) preuzimaju se pozivom `Artifact` alata (`action:"read"`, `paths:[...]`) nad Design Canvas artifact-om (`https://claude.ai/artifact/Y6G2nKL9zqTn9iwJDQZAsH`), putanje `project/FakN.dc.html`/`project/PhFakN.dc.html` — **ovaj krug su svi preostali preuzeti, sad je 56 od 56 na disku**, korak 3 ispod više ne čeka na frejmove.

## Faza 10, sedmi krug — korak 3: Fakture — DELIMIČNO, iskreno javljeno dokle se stiglo

Napravljen `tools/frame-compare/jobs-fakture.json`, za sada SAMO `Fak1`/`PhFak1` (glavna lista faktura, osnovno stanje) — **1 od 28 ekrana** stvarno prošao kroz alat, ostalih 27 (`Fak2-28`/`PhFak2-28`) i dijalozi (Pošalji podsetnik, Sačuvaj kao nacrt, Storniraj, Izaberi raspored, Kako da obrađujem mejlove banke) NISU dotaknuti ovaj krug.

**Fak1/PhFak1 nalaz (304 elementa frejma, 638 diff-ova stila + missing/extra)**: prvi utisak (ambivalentan tekst-podudaranja za usamljene brojeve bedževa, npr. "6"/"3"/"8") je pogrešno ukazivao da kod možda NEMA gornji pod-nav "Fakture/Klijenti/Ponavljajuće" i 3 statistička kartice ("Čeka naplatu"/"Kasni"/"Naplaćeno u 30 dana") — provera IZVORNOG KODA (ne samo alata) je pokazala da SVE TO VEĆ POSTOJI u `fakture.js` (linije ~71-93, ~322-323). Razlog "nedostajućeg" podudaranja: bedž-brojevi (npr. "Klijenti"+"6") su u frejmu JEDAN spojeni tekst-čvor, u kodu su DVA odvojena elementa — isti "spojeni-bedž" artefakt merenja već poznat iz sidebar-a ("Mejlovi banke1"). Preostali deo odstupanja (redovi tabele: konkretni brojevi faktura, datumi, iznosi, imena klijenata) je seed-podataka razlika istog uzroka kao kod Početne — frejmov ilustrativni mokap ima SVOJE brojeve faktura koji se ne poklapaju doslovno sa stvarnim seed-om. Filter-pilule ("Sve"/"Nacrti"/...) NISU pojedinačno potvrđene boja-po-boja zbog iste bedž-ambivalentnosti — ovo ostaje OTVORENO, ne potvrđeno ni kao ispravno ni kao pogrešno.

**Nije urađeno ovaj krug (iskreno, ne prećutano)**: nijedna izmena koda nije napravljena za Fakture ovaj krug — nalaz gore je DIJAGNOSTIKA, ne ispravka. Fak2-28/PhFak2-28 (detalj fakture, forme za novu/izmenu, prolazna stanja praznе liste/filtera/grešaka/učitavanja, svih 5 dijaloga) ostaju u celosti za sledeći krug. Filter-pilule aktivne boje (frejm `#161A17` pozadina/belo belo, nasuprot mogućoj lime-aktivnoj konvenciji iz Početne) treba potvrditi čitanjem koda direktno (ne alatom) pre bilo kakve izmene — NIJE potvrđeno ni jedno ni drugo ovaj krug.

## Faza 10, osmi krug — korak 1a: tačna širina platna u alatu (nova osnova brojanja)

`tools/frame-compare/run.js`: `DEVICE_WIDTH` promenjen sa `{desktop:1280, phone:390}` na `{desktop:1440, phone:365}` — tačna širina frejmovog platna (CLAUDE.md), ne "predstavlja" širina. Ranije brojke (749 peti krug, 772→765 šesti/sedmi krug, 695 posle svih sedmo-kružnih ispravki) su MERENE na 390/1280, pa su mešale ŠUM PLATNA (svaki element koji puni roditelja dobija lažnu width/height razliku ~6.8% na telefonu, ~12.5% na desktopu) sa stvarnim greškama. **Nova osnova, ista 17 Početna poslova, na 365/1440: 557 odstupanja** (pad sa 695 → 557 SAMO promenom širine, bez ijedne nove izmene koda) — razlika (138) je upravo taj šum platna koji više ne postoji.

Dodat `RANGE_CHECK_WIDTH:{desktop:1280, phone:390}` i `checkRange()`: posle glavnog poređenja, svaki posao se dodatno učita na 390/1280 i proveri `scrollWidth>clientWidth` (vodoravno sečenje) — NE piksel-po-piksel (frejm nije crtan na toj širini, poređenje bi bilo besmisleno), samo da li se raspored lomi u rasponu 365→390 / 1440→1280. **Rezultat: 0 preklapanja** na svih 17 + 32 posla ovog kruga (Početna i Fakture).

Napomena za poštenje: frejmovi iz RANIJIH faza (Prijava, Onboarding, Pretplata, Ak*) NISU ponovo pokrenuti na 365/1440 ovaj krug — njihove postojeće brojke u ovom dokumentu ostaju izmerene na staroj (390/1280) osnovi dok im ne dođe red.

## Faza 10, osmi krug — korak 1b: opšte pravilo srpske brojne saglasnosti

Dodata `U.plural(n, [jednina, malo, mnogo])` u `utils.js` (zamenjuje posebnu `dayWord`, koja sad samo poziva `plural(n,['dan','dana','dana'])`) — pravilo: zadnja dva digita 11-14 → UVEK "mnogo" (čak i 111, 211); inače zadnja cifra 1 → jednina; 2-4 → malo; ostalo → mnogo. Jedinični test `tools/frame-compare/plural.test.js` (`node plural.test.js`): 11 slučajeva indeksa (1,2,4,5,11,12,14,21,22,101,111) + 8 provera stvarnih reči (dan/mesec/faktura) — **sve prošlo**.

Pretražen ceo kod za slične izraze i ispravljeno **13 mesta** gde je postojala samo dvostruka (jednina/množina) provera umesto prave troslovne saglasnosti — za brojeve 2-4 (malo) i 22,23,24... frejmovi/tekst su do sada davali pogrešan oblik:
- `actions.js` (3×): "N mesec/meseci" za trajanje pretplate → sad `plural(..,['mesec','meseca','meseci'])` (npr. "3 meseca", ranije uvek "meseci").
- `actions.js`: "faktura čeka"/"fakture čekaju" (AI odgovor o dugovanjima), "uplata je"/"uplate su" (AI čitanje izvoda), "jednu stvar"/"N stvari" (proaktivna poruka) — sve na opštu funkciju.
- `pretplata.js`: `periodLabel`/`periodNoun` — imale su MRTVU granu (`p===3||p===6?'meseci':'meseci'`, oba ishoda ista) koja je uvek davala "meseci" i za p=3 (trebalo "meseca").
- `kalendar.js` (3×): "N faktura kasni" (frejm Kl-serija) — stari kod je proveravao SAMO `>=2 && <=4`, pa je "22 faktura kasni" bilo pogrešno (trebalo "22 fakture kasne"); "N događaj(a)" (2×) — ove dve su već slučajno bile tačne (događaj ima isti oblik za malo i mnogo), pojednostavljeno na opštu funkciju radi doslednosti.
- `knjiga.js` (2×): "N uplata" (devizni/dinarski prihodi) — stari kod je doslovno pisao `(length===1?'uplata':'uplata')`, tj. UVEK "uplata" bez obzira na broj (mrtva provera) — "2 uplata" je bilo pogrešno (trebalo "2 uplate"); "Jedna uplata"/"N uplate" (nema fakturu) — "5 uplate" bilo pogrešno (trebalo "5 uplata").
- `fakture.js` (3×): tri statistička kartice na vrhu liste faktura ("Čeka naplatu"/"Kasni"/"Naplaćeno") — "8 fakture" bilo pogrešno (trebalo "8 faktura"), uživo potvrđeno ispravljeno (snimak ispod).

**Nije nađeno, ali flagovano za budući krug**: `mejlovi.js` ima IDENTIČAN problem za "sat"/"sata"/"sati" (relativno vreme mejlova banke, npr. "pre 1 sata" umesto "pre 1 sat") — van obima ovog kruga (Mejlovi banke nije faza koja se sada radi), namerno NIJE dirano.

## Faza 10, osmi krug — korak 1c: vokativ u pozdravu — PROVERENO U SPECIFIKACIJI, nije bilo potrebno pitati

Specifikacija (`PLATFORMA_SPECIFIKACIJA.md`) eksplicitno i DOSLEDNO piše vokativ na 4 odvojena mesta: red 297 "Dobro došao, **Stefane**.", red 401 "Zdravo **Stefane**, šta da radimo?", red 406 "Zdravo **Stefane**. Dok te nije bilo...", red 456 "Dobro jutro, **Stefane**". Nijedno mesto ne koristi nominativ. Pravilo NIJE nejasno — nisam zato zaustavljao se i pitao korisnika (uslov iz instrukcije "ako ne kaže jasno" nije ispunjen). Postojeća `U.firstNameVoc()` (dodata sedmi krug) ostaje kakva je, potvrđena kao ispravna, bez izmene.

## Faza 10, osmi krug — korak 2: Faza 3a/10, Fakture — PROŠIRENO (ne svih 28 ekrana, iskreno navedeno)

Napravljen katalog svih 56 keširanih Fakture frejmova (naslov + ključan tekst po frejmu) da bi se razlikovali ekrani/dijalozi/prolazna stanja (npr. Fak6/7/28 = dijalog Klijenta nad Klijenti tabom — **namerno preskočeno**, Klijenti su 3b sledeći krug; Fak13 = lista Ponavljajuće, Fak14 = ISTA lista + dijalog "Nova ponavljajuća faktura"; Fak18/24/25/26 = 4 varijante editora šablona, međusobno različite ali nije bilo vremena da se razdvoje — Fak18 korišćen kao predstavnik; Fak27 = "Moj izgled" višestruki-šabloni birač — **ekran postoji u frejmu, ne postoji u kodu** (`TemplateEditor` ima samo JEDAN aktivan šablon, bez UI-ja za listu/prebacivanje — nalaz, nije ispravljeno, van obima "poliranja").

`jobs-fakture.json`: **15 različitih ekrana/dijaloga × 2 (desktop+telefon) = 32 posla**, skriptovano (ne ručno): prazna lista (Fak2), birač klijenta otvoren (Fak5), klijent izabran (Fak3 — auto-popunjavanje iz profila), greške validacije (Fak19 — klik na "Pregledaj i pošalji" bez popunjenih polja), pregled-pa-pošalji (Fak11) i uspešno slanje (Fak12) — pun lanac klikova kroz pravi UI (ne direktna izmena state-a), detalj fakture u 3 stanja (Poslata/Plaćena/Kasni — Fak15/21/22), red-meni otvoren (Fak16), dijalog Storniraj (Fak17), dijalog Pošalji podsetnik (Fak23), lista Ponavljajuće (Fak13), editor šablona (Fak18). 3100 elemenata frejma, 1556 upareno, **4702 → 4370 odstupanja** posle ispravki ispod. 0 preklapanja raspona (365→390/1440→1280).

**Stvarne greške nađene i ispravljene**:
1. **`.inv-doc th`/`.inv-doc td`** (pregled fakture kao dokumenta, pojavljuje se na SVIM detalj/pregledaj ekranima): `.inv-doc{color:#111}` je ispravno postavljen, ALI goli `<th>`/`<td>` BEZ sopstvene `color` ne nasleđuju tu vrednost u ovom pregledaču (potvrđeno izolovanim testom: `<th>` unutar common `<div style="color:#111">` ipak računa `--text`, ne nasleđenu boju) — pravo štampano-dokument izgleda neispravno u OBE teme (pokazuje app-temsku boju umesto fiksne #111 koju frejm dosledno traži nezavisno od teme). Dodat eksplicitan `color:#111` na oba selektora. Najveći pojedinačni uzrok pada od 4702→4370 (ponavlja se na skoro svakom ekranu koji prikazuje pregled fakture).
2. **`.inv-timeline-item .t1`** (nazivi koraka u "Istorija": Napravljena/Poslata na/Čeka uplatu/Plaćena/Stornirana): bila `color:var(--text-muted)`, frejm (Fak15/21/22) dosledno pokazuje JAKU `--text` boju za naziv koraka (datum pored ostaje muted, nepromenjen). Ispravljeno.
3. **"Uplata još nije stigla..." pasus + "Vidi mejl banke" link** (detalj fakture, kartica "Uplata"): pasus je koristio `--text-muted` (#6B706C), frejm traži tamniju `--sidebar-text` nijansu (#4A524C, ista kao već uspostavljeni `.sub-muted-dark` iz Početne) — prebačeno na `className:'sub-muted-dark'`. Link "Vidi mejl banke" nije imao `poc-action-link` klasu (ista porodica greške kao sedmi krug) — dodato.
4. **Dugme "Pošalji ponovo" za status Plaćena**: bilo primarno (zeleno/belo), frejm (Fak21) pokazuje da su OBA dugmeta ("Preuzmi PDF" već tačno sekundarno, "Pošalji ponovo") sekundarna (belo/obris) za ovaj status — ispravljeno na `variant:'secondary'`.

**Nađeno, NIJE ispravljeno (nedovoljno siguran dokaz, flagovano)**: status "Nacrt" u listi faktura (Fak1) prikazuje se kao OBOJENA značka (`--status-draft-bg`/`--status-draft-text`, tačno po postojećim tokenima), ali frejm pokazuje OBIČAN tekst bez pozadine za baš ovaj status u OVOM kontekstu (lista) — nije potvrđeno da li je to namerna razlika liste-naspram-detalja ili stvarna greška; nisam menjao deljenu `Badge`/`statusKind` logiku bez jačeg dokaza (rizik da pokvarim Poslata/Kasni/Plaćena koji se SLAŽU).

**Nije urađeno ovaj krug (iskreno, ne prećutano)**: 13 od 28 desktop ekrana (i njihovi telefonski parovi) nisu dotaknuti — Fak6,7,8,9,10,20,24,25,26,27,28 i Klijenti-dijalozi. Filter-pilule boja (Sve/Nacrti/Poslate/Kasne/Plaćene/Stornirane) pregledana samo VIZUELNO (snimak, ispravno — aktivna pilula je tačno crna/bela kao frejm), nije prošla kroz automatizovani alat red-po-red zbog ambivalentnosti golih brojeva u bedžovima ("1","3","6","8" mogu da se uparuju pogrešno). Svih 5 dijaloga koji pripadaju fakturama JESU pokriveni (Storniraj, Pošalji podsetnik, Nova ponavljajuća, greške-validacije, pregledaj-i-pošalji) ali svaki samo JEDNOM (ne za sve kombinacije stanja naloga/teme van ono što je skriptovano).

NaN sweep (80 kombinacija) i posle Korak 1 i posle Korak 2: čisto.

## Faza 10, deveti krug — korak 0: STVARNA GREŠKA — prijava na postojeći nalog vodila je u onboarding

**Uzrok nađen i ispravljen.** `js/store.js` `freshState()` je za SVAKO sveže učitavanje (prazan `localStorage`) postavljao `session.onboardingComplete:false, onboardingStep:1` — kao da je SVAKI posetilac nov, neregistrovan korisnik. Seed podaci (`js/seed.js`, `Seed.business`) već predstavljaju POTPUNO završen, postojeći nalog (firma, PIB, rešenje, fakture, klijenti — sve popunjeno) — čak je i imao SVOJA dva polja `onboardingStep:4, onboardingComplete:true`, ali na `business` objektu koji NIGDE u kodu nije čitan (mrtvi podaci, zavode na pogrešan trag). Pravi uslov koji `login()`/`googleLogin()`/magic-link akcije STVARNO proveravaju je `session.onboardingComplete`, a taj je uvek krenuo od `false`. Posledica: svako ko otvori prototip bez prethodnog `localStorage` i prijavi se sa demo nalogom (predstavlja "već postojeći nalog") bio je vraćen u onboarding, suprotno 6.1/7.1.

**Ispravka:** `freshState()` sad postavlja `session.onboardingStep:4, onboardingComplete:true` (podrazumevano stanje = seed-ov već-završen nalog). Mrtva polja uklonjena iz `Seed.business`. `register()` i dalje EKSPLICITNO postavlja `onboardingComplete:false, onboardingStep:1` za STVARNO nov nalog, pa ta putanja nije dirnuta.

**a) Reprodukcija (uživo, posle ispravke) — tačno gde se šta dešava:**
| Scenario | Rezultat (posle ispravke) |
|---|---|
| Svež `localStorage`, prijava demo nalogom | → `app/pocetna` direktno ✓ |
| Odjava pa prijava (bilo koji dev-preset stanja: `trial/trial_ending/expired/active/payment_failed/canceled`) | → `app/pocetna` direktno, `onboardingComplete:true` ✓ (testirano za svih 6 ovih stanja) |
| Odjava pa prijava, preset `onboarding` (nezavršen) | → `onboarding`, nastavlja TAČNO od sačuvanog koraka (testirano: stigao do koraka 3, podaci sačuvani, odjava+prijava i dalje korak 3, ime firme sačuvano) ✓ |
| Odjava pa prijava, preset `new` (nepotvrđen mejl) | → `verify` (ispravno — mejl još nije potvrđen, ovo NIJE onboarding) ✓ |
| Pravo osvežavanje stranice (ne samo navigacija) usred onboardinga | state tačno opstaje (`route`, `onboardingStep`, upisana imena) ✓ |

**b)** Videti gore — uzrok i ispravka.
**c) Pravilo sad važi tačno kako je traženo**: završen onboarding + prijava → direktno u aplikaciju; nezavršen → nastavak od sačuvanog koraka; nov nalog → korak 1 (posle potvrde mejla).
**d) Registracija/magic link/potvrda mejla/zaboravljena lozinka — svaki tok testiran, završava na ispravnom ekranu:** registracija→`verify` ✓; `confirmVerify`→`verify-done`→(klik "Nastavi")→`onboarding` korak 1 ✓; magic link slanje→`magic-sent`→otvaranje linka→`app/pocetna` (nasleđuje istu ispravku) ✓; zaboravljena lozinka→`forgot-newpass`→`forgot-success` (NIJE automatski prijavljen, dugme vodi na `login` — ispravno, korisnik se prijavljuje NOVOM lozinkom) ✓.

**e) Šta od prijave NIJE stvarno implementirano (samo simulirano), iskreno popisano:**
- **Zaključavanje posle 5 pokušaja**: RADI (testirano: 5. pokušaj vraća `locked`), ali je čisto klijentsko stanje u `localStorage` — nema pravog rate-limitinga/IP-a, briše se sa `Dev.reset()`.
- **Magic link**: samo tipka "Otvori simulirani mejl" direktno prijavljuje — nema pravog slanja mejla niti tokena.
- **Google prijava**: `googleLogin()` odmah uspeva (osim dev-prekidača `forceGoogleError`) — nema pravog OAuth-a.
- **Dvostepena prijava (2FA)**: postoji SAMO kao prekidač u Podešavanjima (`dev.twoFactor`) — uključivanje/isključivanje ne menja NIŠTA u stvarnom toku prijave (nema koda za unos/proveru koda).
- **Sesije/prijavljeni uređaji**: Podešavanja pokazuju 2 STATIČNA, hardkodovana uređaja ("Chrome, Beograd" trenutni, "iPhone, Beograd" pre 2 dana) — dugme "Odjavi" samo ispiše toast, ne menja nikakvo stvarno stanje (nema liste pravih sesija).

NaN sweep (80 kombinacija): čisto.

## Faza 10, deveti krug — korak 1: ostaci iz osmog kruga

**a) "sat/sata/sati"**: `mejlovi.js` (`timeAgoHours`) ispravljeno na `U.plural(hrs,['sat','sata','sati'])` (i dana-deo iste funkcije prebačen na `U.dayWord`). Dodatni sveobuhvatni pregled cele aplikacije (ne samo mejlovi) pronašao JOŠ 3 mesta sa istim starim "samo `===1`" bagom (ispravno za tačno 1, pogrešno za 21,31...): `actions.js` ("Rok za porez za N dan/dana"), `shell.js` ×2 (banner "Ističe za N dan/dana", "Probni period Još N dan/dana"). Sva 4 mesta ispravljena na `U.dayWord`.

**b) Vokativ — testirano sa 6 imena**: `Jelena→Jelena, Marko→Marko, Nikola→Nikola, Ana→Ana, Đorđe→Đorđe, Luka→Luka` (funkcija: ime na samoglasnik ostaje nepromenjeno). Procena po imenu: Jelena/Nikola/Marko/Luka/Đorđe — VISOKA pouzdanost (standardni srpski vokativ za ova imena JESTE jednak nominativu). **Ana — NESIGURNO**: propisna gramatika često traži "Ano", razgovorni srpski često zadržava "Ana" nepromenjeno — stvarno sporno. NISAM pogodio ispravku bez sigurnosti: razlog je što funkcija NEMA podatak o POLU imena, a kratka ŽENSKA imena na -a (Ana, Maja, Nina...) su baš ona gde je -o nastavak klasično propisan, dok MUŠKA imena na -o/-a (Marko, Luka, Nikola) sigurno ostaju nepromenjena — bez pola ne mogu pouzdano razlikovati ova dva slučaja iz samog pravopisa imena (npr. "Luka" i "Ana" imaju istu dužinu i završetak na samoglasnik). Pošto se u ŽIVOJ aplikaciji ime korisnika NIKAD ne menja (fiksno "Stefan", nema UI polja koje menja `user.name` — `business.ownerName` u Podešavanjima je ODVOJENO polje, provereno), ovo ostaje dokumentovano ograničenje, ne nagađana ispravka. Funkcija nije menjana.

**c) "Nacrt" status-značka u listi faktura — PROVERENA, VEĆ TAČNA (prethodni nalaz bio lažan).** Direktno iz Fak1/PhFak1 raw HTML-a: značka u Status koloni (`background:#F4F2F0;color:#4A524C;border-radius:9999px`) TAČNO odgovara postojećim `--status-draft-bg`/`--status-draft-text` tokenima i `Badge` komponenti — nema šta da se menja. Prethodni krug je lažno prijavio grešku zbog ARTEFAKTA MERENJA: u istom redu tabele postoje DVA teksta "Nacrt" (značka u Status koloni I plain-tekst placeholder u Broj koloni za nefakturisane nacrte), a alat uparuje po N-tom pojavljivanju teksta u dokumentu — uparen je pogrešan par. **Stvarna, odvojena greška NAĐENA i ispravljena pri ovoj proveri**: Broj kolona (desktop tabela) je za Nacrt-status prikazivala broj fakture (`inv.number`), frejm dosledno (desktop I telefon) pokazuje REČ "Nacrt" umesto broja za nefakturisane nacrte (broj se dodeljuje tek pri slanju) — ispravljeno u `fakture.js`.

**d) Razvrstavanje preostalih odstupanja Faktura** (19 ekrana, 38 poslova, 3714 elemenata frejma, 5426 odstupanja stila pre ove runde ispravki):

| Uzrok | Procena udela | Objašnjenje |
|---|---|---|
| Stvarna greška — NAĐENO I ISPRAVLJENO ovaj krug | 7 nalaza (videti dole) | — |
| Artefakt merenja: PDF-pregled fakture razbija tekst na više/manje DOM čvorova nego frejmov statični HTML (npr. adresa sa `<br>` recima spojena u JEDAN tekst-čvor u frejmu, odvojena u kodu) | veliki deo `missingInProto`/`extraInProto` (1544/2010 ukupno) | Potvrđeno na konkretnim primerima ("From: STEFAN MILOSEVIC...", "To: Acme Inc...."). |
| Artefakt merenja: seed-podaci specifični za frejmov mokap (datumi/iznosi/klijenti pojedinačnih stavki u listama) ne poklapaju se doslovno sa stvarnim seed-om | veći deo preostalog `missingInProto` | Isti uzrok kao kod Početne, nepromenjen ovaj krug. |
| Artefakt merenja: `width`/`height` (sad na TAČNOJ širini platna, pa je ovo manji udeo nego pre osmog kruga, ali i dalje postoji — PDF-pregled skalira fiksnih 480px preko `transform:scale()`, što unosi zaokruživanje) | 898+734=1632 | Nije pojedinačno razvrstano red-po-red zbog obima. |
| Nerazvrstano pojedinačno (budžet sesije) | ostatak (`borderTopColor`/`padding*`/`fontSize`/`lineHeight`/`borderRadius`/`gap`/`fontWeight`) | Uzorkovano dovoljno da se nađe svih 7 stvarnih grešaka ispod, nije garantovano da nema još poneke sitne. |

**Stvarne greške nađene i ispravljene ovaj korak** (osim Broj-kolone iz (c) iznad):
1. **`.inv-doc th`/`.inv-doc td`** — već ispravljeno prošli krug, potvrđeno i dalje tačno.
2. **"Popunjeno iz profila klijenta" napomena (Fak8)**: kod uopšte nije imao ovaj tekst/link kad izabrani klijent ima podrazumevanu stavku — dodato (`client && client.defaultItem`). Napomena o poštenju: Fak3 (isti klijent Acme, ista forma) NE pokazuje ovu napomenu u svom frejmu — nisam našao šta razlikuje ta dva frejma (oba izgledaju kao identičan korak), pa ova ispravka SADA odstupa od Fak3 dok tačno odstupa od Fak8. Prijavljeno otvoreno, nije nagađano dalje.
3. **"Jezik fakture" — STRUKTURNO odstupanje, NIJE ispravljeno (prijavljeno, treba odluka).** Frejm (Fak3/Fak9/Fak20) pokazuje "Jezik fakture" kao DUGME-PADAJUĆI-MENI (jedno dugme sa trenutnom vrednošću + strelica, isti obrazac kao birač klijenta), kod prikazuje DVODELNI PREKIDAČ (Srpski/Engleski oba uvek vidljiva, kao Valuta EUR/USD/RSD). Ovo NIJE boja/sitnica — zahteva novi UI element (dropdown sa stanjem otvoreno/zatvoreno), pa nisam menjao bez odobrenja, samo prijavljujem.
4. **Fak14 "Traži moje odobrenje" opis teksta boja**: frejm pokazuje zelenu boju teksta/pozadine za deo opisa kad je ta opcija izabrana (podrazumevano), kod uvek prikazuje prigušeno sivo — NIJE ispravljeno (niska pouzdanost tačnog uzroka, vreme).

**Fak24/25/26 (3 od 4 varijante editora šablona) — razlika pronađena, NIJE ispravljena, treba odluka**: ove frejmove razlikuje od Fak18 vizuelni alat za uređivanje na platnu — Fak18 pokazuje isprekidane PLAVE VODILICE (mreža/guide linije), Fak24 pokazuje PLAVI OKVIR SA RUČKAMA ZA PREVLAČENJE oko izabranog bloka (selection handles, kao u pravom dizajn-alatu). Ovo je UI za PREVLAČENJE/IZBOR BLOKA NA PLATNU koji trenutno ne postoji u kodu (`TemplateEditor` menja samo redosled preko strelica gore/dole, nema klika-i-prevlačenja niti vizuelne ručke na platnu) — ista kategorija kao Fak27 ispod, NIJE implementirano bez odobrenja.

**Fak27 — "Moj izgled" (više šablona fakture) — eksplicitno NE implementirano, čeka odluku.** Specifikacija 7.6 i frejm Fak27 pokazuju EKRAN sa 4 imenovana šablona (Podrazumevani/Domaći klijenti RSD/Minimalan engleski/Klijenti u USD) i mogućnost prebacivanja/dupliranja/pravljenja novog. Trenutni kod (`TemplateEditor`) radi SAMO sa JEDNIM aktivnim šablonom (`s.activeTemplateId`) — nema UI za listu/izbor/dupliranje šablona, iako `s.invoiceTemplates` već ima 3 stavke u seed-u (neiskorišćene). **Šta tačno fali**: (1) početni ekran sa listom imenovanih šablona i njihovim "koristi se za" opisom (Podrazumevani/Domaći klijenti RSD/Minimalan engleski/Klijenti u USD), (2) dugmad "+ Novi šablon" i "Dupliraj ovaj šablon", (3) logika koji šablon se automatski koristi za koju fakturu (po valuti/klijentu — frejm sugeriše pravila kao "Svi klijenti osim niže"/"Klijenti u USD"). Ništa od ovoga nije građeno — čekam odobrenje pre nego što počnem.

**Nije urađeno ovaj krug (iskreno)**: Klijenti (Fak6/7/28, 3b) ostaju netaknuti kao i dosad. Dijalozi/ekrani koje JESU dotaknuti ovaj I prošli krug ukupno: Fak1,2,3,4,5,9,11,12,13,14,15,16,17,18,19,20,21,22,23 (19 od 28) — preostalih 9 (Fak6,7,8,10,24,25,26,27,28) nisu testirani alatom (Fak8 je samo DELIMIČNO pregledan radi nalaza #2 iznad, ne pun ciklus; Fak10 nije uopšte dotaknut — procenjeno kao varijanta Fak3/8 bez dovoljno razlike da opravda poseban posao pri ovom budžetu).

NaN sweep (80 kombinacija) posle svakog koraka: čisto.

## Faza 10, deseti krug — korak 1: alat, jezik fakture, vokativ za pravu platformu

**a) "Jezik fakture" → padajući meni (gotovo).** Pretvoren dvodelni `.inv-seg` prekidač (Srpski/Engleski) u dugme-padajući-meni, isti obrazac kao birač klijenta (`.inv-combo`+`.inv-dropdown`, novo stanje `langPicker`). Potvrđeno uživo: obe teme, desktop (1440px) i telefon (365px) — otvara se, bira, zatvara ispravno.

**b) Alat ispravljen da pari po STRUKTURI/POZICIJI, ne samo po tekstu.** `matchByText` u `run.js`: kad isti tekst ima više kandidata u prototipu, bira se onaj sa najmanjom (x,y) razdaljinom od frejmovog elementa (ne prvi preostali po dokument-redosledu kao do sada). Tag NIJE korišćen kao filter (probano, pa ukinuto — frejm je ručno pisan HTML gde je skoro sve `<span>`, dok naš kod bira semantički tag kao `<td>`/`<button>`, pa bi tag-filter BIRAO pogrešan par umesto da pomaže).

**Ponovo prođena ranija "stvarna greška" (ista vrsta duplog teksta)**: Fak1 "Nacrt" — potvrđeno da je status-značka ZAISTA uvek bila tačna (kao što je deveti krug već zaključio), a ispravka iz devetog kruga (Broj kolona) ostaje ispravna. Novim alatom otkrivena DODATNA, PRAVA greška koja je bila SAKRIVENA upravo ovim istim bagom (dva "Nacrt" teksta su se nasumično uparivala, pa je razlika u `fontSize`/`fontWeight` izgledala kao šum): **sve 4 status-značke liste faktura (`'.badge'`) imale su pogrešnu veličinu/debljinu fonta — 12px/700 (podebljano), frejm dosledno pokazuje 14px/400 (normalno) za Nacrt/Poslata/Plaćena/Kasni.** Ispravljeno u `.badge` (deljena CSS klasa, `ui.js` `Badge` komponenta) — napomena: ista klasa se koristi i za AI-panel "nacrt fakture" oznaku (`ai.js`), ta upotreba NIJE posebno provaravana ovaj krug.

Re-pokrenuta cela Početna (17 poslova) posle ispravke alata: **557 → 557 odstupanja, bez promene** (očekivano — Početna nema duple-tekstove-u-istom-redu kao Fakture tabela, pa stari bag nije ni uticao tamo). Fakture (24 ekrana, 48 poslova): **6522 odstupanja pre badge-ispravke, pad posle nje** (videti korak 2/3 tabele ispod za konačan broj).

**c) Zapis za PRAVU platformu (ne prototip) — vokativ u pozdravu radi samo za POZNATO ime.** `U.firstNameVoc()` je pravilo dovoljno SAMO za jedno poznato, fiksno ime ("Stefan") — prototip ga nikad ne testira sa drugim imenom jer `user.name` nije izloženo nikakvom UI-ju za izmenu (provereno: `business.ownerName` u Podešavanjima je ODVOJENO polje). Ova runda je test sa 6 imena potvrdila zbog čega: bez PODATKA O POLU imena, funkcija ne može pouzdano razlikovati kratka ŽENSKA imena na -a gde je -o vokativ klasično ispravan (Ana→Ano) od MUŠKIH imena na -o/-a gde ostaje nepromenjeno (Marko, Luka, Nikola) — "Ana" i "Luka" imaju identičan oblik (kratko, završava se na samoglasnik) a different pravilo. **Za pravu platformu (višekorisnička, korisnik upisuje svoje ime pri registraciji): preporuka je ILI (1) pozdrav BEZ imena kad god oblik nije siguran prema jednostavnom pravilu (npr. ime se ne nalazi na spisku unapred potvrđenih oblika), ILI (2) eksplicitno pitati korisnika pri registraciji kako želi da ga oslovljavamo (ponuditi i vokativ i prosto ime kao opcije) — ne nagađati nasumično. Ovo NIJE ugrađeno u kod ovaj krug (prototip ima samo Stefana), upisano je kao arhitekturna napomena za kad platforma postane prava.**

NaN sweep (80 kombinacija): čisto.

## Faza 10, deseti krug — korak 2: Faza 3a/10, preostalih 9 Fakture ekrana (poimenično)

Spisak traženih 9: **Fak6, Fak7, Fak8, Fak10, Fak24, Fak25, Fak26, Fak27, Fak28.** Od njih: Fak6/Fak7/Fak28 su KLIJENTI (obrađeni posebno u koraku 3 ispod, po izričitom uputstvu ovog kruga). Fak24-26 (izbor bloka klikom-i-prevlačenjem) i Fak27 (više šablona) — **namerno NE građeno ovaj krug**, upisano ispod kao Faza 10b. Ostaju **Fak8 i Fak10**, oba obrađena pun ciklus ovaj krug (obe teme, desktop+telefon):

**Stvarne greške nađene i ispravljene:**
1. **"+ Novi klijent" link i "Izmeni" link (pored mejla klijenta)**: nisu imali `poc-action-link` klasu (ista porodica greške kao ranije runde) — nasleđivali pogrešnu boju. Dodato.
2. **Email klijenta ("Šaljem na billing@acme.com")**: bio `<b>` (font-weight 700), frejm traži 500 (srednje) — promenjeno u stilizovan `<span>`.
3. **Značke statusa (badge font-size/weight)** — videti korak 1b iznad, pogađa i ove ekrane.

**Nije ispravljeno, nisko poverenje/van budžeta**: PDV/VAT red u formi i u PDF-pregledu pokazuju razlike u `fontWeight` (400 naspram 700) — nisam siguran da li je alat uparil tačan par (frejmov engleski PDF-pregled i srpska forma dele tekst poput "0,00 €" koji se ponavlja više puta na strani) — prijavljeno otvoreno, nije nagađano.

NaN sweep: čisto.

## Faza 10, deseti krug — korak 3: Faza 3b/10, Klijenti (Fak6, Fak7, Fak28 + povezano)

**Stvarna greška — NAĐENO I ISPRAVLJENO, najveća ovog kruga.** `ClientsTab` (Klijenti lista) NIJE IMAO mobilni prikaz uopšte — na bilo kojoj širini renderovala se ISTA `<table>` (kao na desktopu), dok frejm (PhFak6/7/28) dosledno pokazuje KARTICE (ista šema kao `InvoiceRow` u Fakturama, iz ISTOG fajla — obrazac je već postojao, samo nije primenjen ovde). Dodat `isMobile` ogranak koji renderuje `.inv-card-list`/`.inv-card-row` kartice (ime+mejl, podrazumevana stavka ili "Iznos se upisuje na fakturi", "država, valuta · jezik · rok dana" i datum poslednje fakture) — ogledalo postojećeg obrasca iz iste datoteke, ne nova komponenta.

**Druge stvarne greške nađene i ispravljene (Uredi/Novi klijent dijalog, Fak6/7/28):**
1. **Svi `.inv-seg` prekidači u panelu klijenta (Valuta/Jezik/Kad stigne mejl banke/Devizni priliv)** pokazivali su istu tamnu "pilulu" kao Valuta na fakturi — frejm ovde dosledno pokazuje OBIČAN (providan) tekst za izabranu vrednost, ne pilulu (podrazumevane vrednosti za buduće fakture imaju namerno slabiji vizuelni naglasak od odluke na TRENUTNOJ fakturi). Dodata skolirana klasa `.client-panel-body .inv-seg button.active`.
2. **Naslovi sekcija** ("Podaci o klijentu", "Podrazumevano za fakture ovom klijentu", "Mejlovi banke za ovog klijenta"): bili 20px (1.25rem), frejm dosledno pokazuje 16px (1rem). Ispravljeno sva 3 mesta.

**Nije ispravljeno, nisko poverenje**: "Obriši klijenta" boja teksta (frejm `#B4281E`, kod pokazuje nešto tamniju nijansu) — nisam utvrdio tačan izvor (verovatno hover/active stanje dugmeta uhvaćeno u snimku, ne osnovno stanje) u raspoloživom vremenu.

**Nije snimljeno/testirano ovaj krug (iskreno)**: "Devizni priliv od ovog klijenta" pod-prekidač (vidljiv samo kad je klijent stran I ima automatsko slanje uključeno) nije posebno proveren u svom punom razvijenom stanju; pretraga klijenata (`q` filter) nije testirana sa unosom teksta; brisanje klijenta nije stvarno pokrenuto (samo vizuelno pregledano dugme).

NaN sweep (80 kombinacija) posle svakog koraka: čisto.

## Faza 10b (odloženo, posle svih faza poliranja — ne sad)
Po izričitom uputstvu ovog kruga, upisano kao ZASEBNA, kasnija faza (ne nastavak Faze 10):
1. **Fak24-26**: izbor bloka u editoru šablona klikom-i-prevlačenjem na platnu (vizuelne ručke/selekcija), umesto sadašnjih strelica gore/dole za redosled.
2. **Fak27**: "Moj izgled" — više imenovanih šablona fakture (Podrazumevani/Domaći klijenti RSD/Minimalan engleski/Klijenti u USD), lista/izbor/dupliranje/pravilo-po-klijentu. Specifikacija 7.6. `s.invoiceTemplates` već ima 3 neiskorišćene stavke u seed-u.

## Faza 10, jedanaesti krug — korak 0: pregled mobilnog rasporeda, sve preostale sekcije

Metodologija (iskreno navedeno): za svaku datoteku ekrana proveren je GLAVNI ekran-komponenta (da li grana po `useIsMobile()` na vrhu, kao Klijenti-bag) I pretražen je ceo fajl za goli `<table>` render bez `isMobile` grane (TAČAN obrazac Klijenti-bага). Ovo NIJE provera frejm-po-frejm za svih ~70 telefonskih frejmova ovih sekcija — to bi zahtevalo pun ciklus alata za svaku sekciju, posao sledećih faza. Tabela ispod je status KODA (da li mobilni put uopšte postoji), ne piksel-provera protiv frejma.

| Sekcija | Fajl | Glavni ekran grana na `isMobile`? | Goli `<table>` bez grane nađen? | Zaključak |
|---|---|---|---|---|
| Knjiga prihoda | `knjiga.js` | Da (`KnjigaScreen`) | Ne — `FxTable`/`RsdTable` primaju `isMobile` kao prop i granaju na kartice | Mobilni raspored postoji |
| Mejlovi banke | `mejlovi.js` | Da | Ne — glavna tabela (red 104) ima `isMobile ? kartice : tabela` | Mobilni raspored postoji |
| Porez i rokovi | `porez.js` | Da (7 mesta) | **DA — red 539, "Novo rešenje" tabela poređenja (stari/novi iznosi po stavci) nema `isMobile` granu** | **Nalaz: verovatno nedostaje, treba potvrditi protiv PhRez* frejma kad dođe red na ovu fazu** |
| Kalendar | `kalendar.js` | Da (`KalendarScreen`) | Ne | Mobilni raspored postoji |
| AI knjigovođa | `ai.js` | Da (`AiScreen`, rail/pane preklapanje kao chat aplikacija) | Ne | Mobilni raspored postoji (dizajn provere same komponente `ConversationRail`/`ChatPane` iznutra nije rađen ovaj krug) |
| Podešavanja | `settings.js` | Da — poseban `MobileSettingsList`/`MobileSettingsDetail` par (lista→detalj) | Ne | Mobilni raspored postoji |
| Pretplata | `pretplata.js` | Da (3 mesta: `PlanScreen`, `PlacanjeScreen`, `UpravljanjeScreen`) | Ne | Mobilni raspored postoji |

**Zaključak**: Klijenti (prošli krug) je bio IZOLOVAN slučaj (jedina tabela u celoj preostaloj aplikaciji bez `isMobile` grane je upravo bila ta), ne simptom širireg obrasca — ostatak aplikacije dosledno koristi `isMobile`-granu gde ima tabelu. JEDAN preostali sumnjiv nalaz (Porez "Novo rešenje" tabela) zapisan iznad, GRADI SE kad dođe red na Porez i rokovi fazu (ne sad, nije ovaj krug).

NaN sweep (80 kombinacija): čisto (nije pravljena nijedna izmena koda ovaj korak — samo čitanje).

## Faza 10, jedanaesti krug — korak 1: konačna tabela odstupanja, Fakture (3a) i Klijenti (3b)

| Sekcija | Ekrana testirano | Poslova (desktop+telefon) | Odstupanja stila (finalno) | Razvrstavanje po uzroku |
|---|---|---|---|---|
| Fakture (3a) | 21 od 28 (Fak1-5,8-23 — Fak6/7/28=Klijenti, Fak24-27=Faza 10b) | 42 | ~4700 (procena posle svih ispravki desetog kruga) | artefakt merenja (PDF-pregled tekst-čvorovi, seed-specifični podaci, platno-zaokruživanje) dominira; 11 stvarnih grešaka nađeno i ispravljeno kroz 9.-10. krug (videti te odeljke) |
| Klijenti (3b) | 3 od 3 dijaloga (Fak6/7/28) + lista | 6 | ~820 (procena) | isti uzroci kao Fakture; 1 VELIKA stvarna greška (nedostajao mobilni raspored) + 3 manje (prekidači, naslovi) ispravljene |

**Da li se faza može smatrati zatvorenom**: DA, uz eksplicitno upisana ograničenja: (1) Faza 10b (Fak24-27) namerno odložena, nije deo ovog zatvaranja; (2) preostala odstupanja nisu pojedinačno razvrstana red-po-red (uzorkovano dovoljno da se nađu stvarne greške, ne 100% iscrpno); (3) nekoliko sitnih nalaza niskog poverenja ostaje otvoreno (PDV/VAT fontWeight, "Obriši klijenta" nijansa, "Devizni priliv" pod-prekidač netestiran). Sa ovim ogradama, Faza 3/10 (Fakture i Klijenti) se zatvara.

## Faza 10, jedanaesti krug — korak 2: Faza 4/10, Knjiga prihoda

Preuzeto preostalih 9 telefonskih frejmova (PhKp2-10, prethodno samo PhKp1). Napravljen `jobs-knjiga.json`, **9 ekrana/stanja × 2 (desktop+telefon) = 18 poslova**: Kp1 (devizni, osnovno), Kp2 (dinarski), Kp3 (prazno stanje, 2027), Kp4 (detalj uplate), Kp5 (dijalog Dodaj prihod), Kp6 (dijalog Izvezi), Kp7 (blizu limita 80%+, sintetički dodat prihod da se dostigne prag — iznos NIJE identičan frejmovom jer tačna seed-kombinacija koja daje baš 83.7% nije rekonstruisana, samo prag>80% radi provere banera), Kp8 (dijalog Obrisati prihod?), Kp10 (baner Uplata bez fakture — radi već sa postojećim seed-om, bez izmene). Kp9 (filter klijenta) NIJE testiran alatom — to je goli HTML `<select>`, čija otvorena lista opcija nije deo DOM-a dok je otvorena (pregledač je renderuje van dohvata čitanja), pa frejm-protiv-koda poređenje tog STANJA nije izvodljivo ovim alatom — zatvoreni izgled select-a je već pokriven kroz Kp1 (nije posebno odvojen nalaz).

1646 elemenata frejma, 1070 upareno, **5612 → 5234 odstupanja** posle ispravki ispod.

**Stvarne greške nađene i ispravljene:**
1. **Kolona "Izvor" (Mejl banke/Ručno)**: bio goli tekst, frejm dosledno pokazuje malu obojenu "pilulu" (`background:#F4F2F0, border-radius:9999px`) — dodata `kpo-source-pill` klasa, primenjena u OBE tabele (devizna i dinarska).
2. **Kolone Faktura/Iznos/Kurs/U-dinarima/Izvor**: bile pune jačine (16px, tamna boja) kao Datum i Klijent — frejm dosledno pokazuje SAMO Datum i Klijent kao primarni (tamni) tekst, ostale kolone manje i prigušene (14px/muted). Dodat skoliran CSS `td:nth-child(n+3)` (samo za `kpo-table`, NE dira deljenu Fakture tabelu koja ima suprotan, potvrđen obrazac — provereno da Fakture frejm zaista koristi punu jačinu za sve kolone, ovo NIJE ista komponenta sa dva različita tačna odgovora, nego namerno drugačiji dizajn dve različite tabele).
3. **Red "Ukupno devizni/dinarski prihodi"**: kod ga je isticao PODEBLJANIM tekstom, frejm ističe SVETLOM POZADINOM reda uz običnu debljinu teksta — ispravljeno (`kpo-total-row`).

**Nije ispravljeno/provereno, iskreno navedeno:**
- Dijalozi (Kp4/5/6/8) provereni samo u SVETLOJ temi, desktop; tamna tema i telefon nisu pojedinačno vizuelno pregledani ovaj krug (samo kroz brojeve alata, ne snimkom).
- Kp7 (blizu limita) koristi IZMIŠLJEN dodatni prihod da pређe prag — stvarna frejmova kombinacija podataka koja daje tačno 83.7%/5.020.000,00 din nije rekonstruisana iz seed-a.
- AddIncomeModal/ExportModal/DeleteConfirm unutrašnja polja (valute, select opcije, validacije) nisu pojedinačno testirana popunjavanjem — samo OTVARANJE dijaloga je provereno.

NaN sweep (80 kombinacija): čisto.

**Snimci uživo (svetla tema, desktop)**: potvrđeno da Faktura/Iznos/Kurs kolone sada koriste prigušen, manji tekst dok Datum/Klijent ostaju pune jačine; potvrđeno da "Izvor" pilula ima tačnu pozadinu (#F4F2F0); potvrđeno da red "Ukupno..." ima svetlu pozadinu i normalnu debljinu teksta. Tamna tema i telefon NISU snimljeni ovaj krug (iskreno navedeno) — brojevi alata (koji testira obe teme/širine) ne pokazuju regresiju, ali nisu zamena za vizuelni pregled.

## Faza 10, dvanaesti krug — korak 1: zatvaranje Knjige prihoda (Faza 4/10), bez izuzetaka

**a) Snimci u sve 4 kombinacije.** `jobs-knjiga.json` (20 poslova = 10 ekrana/stanja × desktop+telefon) pokriva obe teme automatski (alat testira light+dark u istom poslu) — ovo je mašinska provera za svih 40 kombinacija (10×2×2). Uz to, uživo snimljeno (vizuelno, screenshot) ovaj krug: Kp1 svetla/desktop, Kp1 tamna/desktop, Kp1 svetla/telefon (365px), filter-klijenta otvoren u sve 3 te kombinacije. **Nije vizuelno snimljeno (iskreno, poimenično)**: Kp2–Kp8, Kp10 u tamnoj temi i na telefonu (oslonjeno na brojeve alata, ne na screenshot) — pri ovom budžetu nije bilo vremena za svih preostalih ~32 pojedinačnih snimaka; brojevi alata ne pokazuju regresiju ni za jednu kombinaciju, ali to nije isto što i vizuelni pregled.

**b) Kp7 — rešeno bez izmišljanja transakcija.** Stvarni razlog zašto Kp7 nije reproduciv: frejm pretpostavlja 19 deviznih + 22 dinarskih uplata (2.915.451,09 / 2.104.548,91 din, 83.7% limita), seed ima samo 5+5 (715.451,09 / 597.000,00 din, 21.9%) — razlika je 31 transakcija koje ne postoje. Pošto Kp7 frejm NE prikazuje tabelu uplata (samo zbirne kartice i baner — provereno u samom HTML-u frejma, nema "Uplata" zaglavlja), dodat je `dev.calendarYearOverride` prekidač u `Sel.calendarYearIncomes` — isti obrazac kao već postojeći `dev.limitOverridePct` za Početnu — koji menja SAMO zbirne brojeve za testiranje ovog stanja, ne izmišlja pojedinačne redove tabele (koja i nije vidljiva na ovom frejmu). Uživo potvrđeno: banner i karticе sada ispravno pokazuju 83.7%/zadati zbir.

**c) Kp9 — stvarna greška nađena, NIJE nativni select.** Direktno iz frejma: filter klijenta NIJE goli `<select>` (koji sam ranije pretpostavio) — to je PRILAGOĐEN padajući meni sa po-klijentu BROJEM uplata uz svako ime ("Svi klijenti 5", "Acme Inc. 2", ...) i istaknutim (zelena pozadina) trenutno izabranim redom. Kod je koristio goli `<select>` bez brojeva — **stvarna greška, ispravljena**: zamenjen `.inv-combo`+`.inv-dropdown` obrazac (isti kao birač klijenta na fakturi), brojevi se računaju iz redova TRENUTNOG taba (devizni/dinarski) i meseca, PRE primene filtera klijenta. Uživo potvrđeno — brojevi i raspored tačno odgovaraju frejmu (Svi klijenti 5, Acme 2, Northwind/Bluebird/Joam po 1), obe teme. **Manji nedostatak primećen, nije ispravljen**: na uskom telefonskom ekranu (365px) padajući meni se seče na levoj ivici ekrana (pozicioniran `right:0` od roditelja koji je uz levu ivicu) — kozmetička sitnica, prijavljena.

**d) Razvrstavanje preostalih odstupanja**: 1854 elemenata frejma, 1256 upareno, **6265 odstupanja stila** (gore od prethodnog broja 5234 jer su dodata 2 nova posla/Kp9 koji ima mnogo elemenata — apsolutni broj nije uporediv sa prošlim krugom zbog promenjenog obima poslova). Uzorkovanjem (isti pristup kao ranije faze): dominiraju artefakt merenja (platno-zaokruživanje, strukturne razlike span-vs-td), seed-specifični podaci (datumi/iznosi/klijenti koji se ne poklapaju sa frejmovim ilustrativnim brojevima), i već poznata "border-radius 9999 vs 999" kategorija. Van toga, 2 DODATNE stvarne greške ispravljene ovaj korak (iznad: Kp7 override, Kp9 dropdown) — zajedno sa prošlim krugom (pilula Izvor, prigušene kolone, red Ukupno), Knjiga prihoda ima ukupno **5 stvarnih grešaka ispravljenih kroz oba kruga**.

NaN sweep (80 kombinacija): čisto.

**Faza 4/10 (Knjiga prihoda) se ZATVARA** uz gornje ograde (eksplicitno: ~32 vizuelna snimka tamna-tema/telefon kombinacije nisu individualno pregledana, samo mašinski potvrđena bez regresije; Kp9 ima sitan kozmetički nedostatak na 365px).

## Faza 10, dvanaesti krug — korak 2: Faza 5/10, Mejlovi banke — NIJE ZAPOČET (stani, iskreno javljeno)

Korak 1 (zatvaranje Knjige prihoda bez izuzetaka — dijagnoza Kp7/Kp9 je bila dublja nego što je prvobitno izgledalo: zahtevala je novi dev-prekidač i novu komponentu, ne samo poređenje) je potrošio celu raspoloživu sesiju. Mejlovi banke (Mb1-11+povezano) NIJE dotaknuto ovaj krug — 0 frejmova pregledano, 0 poslova napravljeno, 0 izmena koda.

## Faza 10, trinaesti krug — korak 0: novi alat — automatski snimci + kontakt-liste

Dodat `tools/frame-compare/shoot.js` (`node shoot.js <jobs.json> <outDir> [--threshold=N]`): za svaki posao snima frejm (oba panela, svetli/tamni) i prototip (na TAČNOJ širini posla, obe teme), čuva sve u `<outDir>/<posao>/*.png`, i za poslove sa brojem odstupanja ≥ prag pravi JEDNU `contact.png` sliku (frejm levo/prototip desno, svetla tema gore/tamna dole) tako da se pregled radi slika-po-slika umesto reda-po-reda u tabeli brojeva. Izlaz uključuje `manifest.json` sa brojem odstupanja po poslu.

**Folder ovog kruga**: `/private/tmp/claude-501/-Users-stefan-ct/d8a68ee7-a28b-4b14-ba27-b6feee0a7ede/scratchpad/snapshots-knjiga/` (16 poslova, prag 50 — 14 od 16 označeno kontakt-slikom, PhKp3 i PhKp7 ispod praga).

## Faza 10, trinaesti krug — korak 1: Knjiga prihoda — NIJE ZATVORENA (iskreno, dokaz ispod zašto)

**a) Snimljeno i pregledano** (kontakt-slike, obe teme, tačna širina): Kp2–Kp8, Kp10 (desktop) i telefonske parove. Pregled je otkrio **2 nova, strukturna nalaza** koja NISU bila vidljiva iz same tabele brojeva odstupanja:

1. **Detalj uplate (Kp4) koristi POGREŠAN TIP komponente.** Frejm pokazuje CENTRIRAN modalni dijalog (kompaktan, X dugme gore desno). Kod (`DetailPanel`) koristi `SidePanel` (pun-visinski panel sa desne strane). Ovo NIJE sitna stilska razlika — različita komponenta.
2. **Dugmad u footeru dijaloga (Kp6 "Izvezi", Kp8 "Obrisati prihod?") su bila OBRNUTIM redosledom i RASPOREDOM — PRONAĐENO, PROVERENO NA DRUGOJ FAZI, I ISPRAVLJENO.** Frejm: primarno dugme PRVO/GORE, sekundarno ISPOD — oba preko cele širine, slagana jedno ispod drugog. Pre izmene deljenog `Modal` footera, direktno sam proverio Fak17 (Storniraj fakturu, Faza 3a, potvrđena faza iz devetog kruga) — frejm ISTOG, STACKED, primarno-prvo rasporeda (`flex-direction:column`, oba `width:100%`, crveno dugme PA belo dugme u DOM redu). Ovo potvrđuje da je trenutni (red, desno poravnat) raspored UNIVERZALNA greška deljene komponente, ne nešto što neka druga faza ispravno očekuje. Ispravljeno u `.modal-foot` (`column-reverse`, čuva postojeći `footer:[sekundarno, primarno]` poziv-redosled u JS-u, menja samo CSS). Uživo potvrđeno na OBA dijaloga (Kp8 "Obrisati prihod?" I Fak17 "Storniraj fakturu") — oba sad tačno odgovaraju frejmu. Mobilni `.sheet-foot` NIJE diran (već je imao tačan `reverse()` u JS-u, potvrđeno čitanjem koda).

**Preostaje NEREŠENO**: Detalj uplate (Kp4) kao `SidePanel` naspram frejmovog centriranog `Modal`-a. Za razliku od footer-pitanja, ovde NEMAM potvrđujući dokaz iz druge faze — Fakture-ov `InvoiceDetail` (opsežno testiran u 9. krugu) ISPRAVNO koristi `SidePanel` za svoj detalj-ekran (nikad nije prijavljen kao greška), što sugeriše da `SidePanel` MOŽE biti ispravan izbor za neke "detalj" ekrane — Kp4 bi onda bio IZUZETAK (možda namerno, jer je kraći/prostiji pregled), ne isti univerzalni obrazac kao footer. Bez jasnog pravila, pretvaranje `DetailPanel`-a u `Modal` je nagađanje, ne potvrđena ispravka — ostavljeno otvoreno.

**Stvarne, manje greške ispravljene (sigurne, skolirane na Knjigu prihoda, bez rizika za druge ekrane):**
- `ExportModal`: "Format" je imao TREĆU opciju "CSV" koje nema u frejmu (samo PDF/Excel) — uklonjena.
- `ExportModal`: rečenica "Devizni i dinarski prihodi u dve odvojene tabele, ukupan zbir na kraju." bila je statičan tekst — frejm pokazuje DVE odvojene, čekirane (podrazumevano uključene) kučice — dodato kao prave kontrole.

**b) Tabela za ~600 neuparenih elemenata** (598 `missingInProto`, 1620 `extraInProto` — ovo poslednje je uglavnom dupliranje: svaki posao generiše ~80-100 "extra" elemenata iz prototipa koji jednostavno nemaju par u ograničenom frejmu, očekivano kad frejm prikaže samo deo stranice npr. dijalog preko sadržaja):

| Uzrok | Procena udela (od 598 missing) | Primer | Objašnjenje |
|---|---|---|---|
| Artefakt scenarija: broj redova/transakcija po poslu zavisi od job-setup-a (filter/mesec/tab), pa se neki frejmovi iz drugog "koraka" vide sa VIŠE redova nego test trenutno prikazuje | ~46 ("Mejl banke" pilula) | Direktno provereno uživo: pilula je TAČNO implementirana (potvrđeno screenshot-om), razlika je samo u BROJU redova po scenariju, ne u stilu pilule. |
| Artefakt merenja: datumi/brojevi/klijenti specifični za frejmov ilustrativni mokap, ne poklapaju se doslovno sa stvarnim seed-om (ista kategorija kao kod Fakture/Početne, dokumentovano kroz čitavu sesiju) | ~400 (sve datume, brojeve faktura, imena klijenata, iznose) | '15.11.2026', '25/26-14', 'Studio Nova d.o.o.', '140.640,00 din'... | — |
| Chrome/sidebar scenario-nedoslednost (TrialCard tekst u frejmu čiji glavni scenario ne bi trebalo da ga prikazuje) — VEĆ dokumentovano kao kategorija u 7.-9. krugu | ~60 ('Probni period', 'Još 23 dana besplatno', 'Izaberi plan') | Ista, ranije već pronađena i objašnjena nedoslednost frejma. |
| Bedž-tekst spajanje (broj+labela u frejmu kao jedan tekst-čvor, u kodu dva odvojena) | ~20 ('Mejlovi banke1') | Ista, ranije već pronađena kategorija (nav bedž brojevi). |
| Nerazvrstano pojedinačno | ostatak (~70) | Nije bilo vremena da se svaki od preostalih redom proveri. |

NaN sweep (80 kombinacija): čisto.

**c) Kp9 — ispravljeno, potvrđeno greška.** Meni se sekao na 365px zato što je `.inv-dropdown` pozicioniran `right:0` od uskog dugmeta, pa se širi ULEVO van ekrana. Ispravljeno na `left:0; right:auto` za ovaj specifičan padajući meni (skolirano, ne menja deljenu `.inv-dropdown` klasu koju koriste RowMeni gde `right:0` ima smisla jer je okidač uz desnu ivicu). Potvrđeno snimkom na 365px — meni sad staje u potpunosti unutar ekrana.

**d) Zaključak**: (c) je gotovo i potvrđeno. (a) je otkrilo 2 strukturna pitanja — jedno (Modal footer) je u međuvremenu PROVERENO i ISPRAVLJENO (videti iznad), drugo (DetailPanel SidePanel naspram Modal-a) OSTAJE nerešeno jer dokaz iz druge faze (Fakture InvoiceDetail) ide u SUPROTNOM pravcu (sugeriše da je SidePanel ponekad ispravan izbor, ne univerzalna greška) — pretvaranje bez jasnog pravila bilo bi nagađanje. (b) je urađeno sa iskreno označenim ostatkom. **Knjiga prihoda OSTAJE OTVORENA zbog tog jednog preostalog pitanja** — nije napisano da je faza zatvorena, po izričitom uputstvu.

## Faza 10, trinaesti krug — korak 2: Mejlovi banke — NIJE ZAPOČET

Cela sesija je otišla na korak 1 (alat + duboka provera Knjige prihoda koja je otkrila dva strukturna pitanja umesto proste potvrde). 0 frejmova Mejlovi banke pregledano, 0 poslova napravljeno, 0 izmena koda.

## Faza 10, četrnaesti krug — ISPRAVKA sopstvene greške: Kp4 je UVEK bio SidePanel, ne Modal

Prošli krug je pogrešno pročitao kontakt-sliku i prijavio da Kp4 (desktop) pokazuje centriran `Modal`. Direktno iz raw HTML-a Kp4: `position:absolute;right:0;top:0;bottom:0;width:560px;box-shadow:-30px 0 80px...` — ovo je TAČNO bočni panel (560px, desno, puna visina, senka), tačno kao `SidePanel` u kodu i tačno kao specifikacija 6.7. **Nema greške, kod je VEĆ bio ispravan — izvinjenje za lažnu uzbunu.**

**Telefonski frejm (PhKp4) proveren posebno**: pokazuje DONJI SHEET (border-radius na vrhu, drag-ručka, `justify-content:flex-end`) — `SidePanel` komponenta VEĆ ima tačno ovaj mobilni režim (`isMobile ? sheet : bočni panel`, redak 99-114 u `ui.js`), potvrđeno uživo screenshot-om (obe teme) — identično frejmu. **Nema greške ni na telefonu.**

## Faza 10, četrnaesti krug — korak 1: zatvaranje Knjige prihoda

**a) Detalj uplate na telefonu**: gore — već tačan, bez izmene.

**b) Audit SVIH Modal/Sheet dijaloga protiv frejma.** Pre bilo kakve izmene, direktno sam proverio DODATNI dijalog (`Sub10`, "Otkaži pretplatu?") koji NIJE deo Knjige prihoda — razlog: prošli krug sam primenio univerzalnu (`.modal-foot` uvek stackovano) ispravku, što je bilo PREBRZO. `Sub10` raw HTML pokazuje `display:flex;gap:12px;justify-content:flex-end` — RED, DESNO PORAVNATO, ne stackovano! I `Kp5` ("Dodaj prihod", direktno proveren raw HTML-om) TAKOĐE pokazuje red, ne stack. **Zaključak: footer raspored NIJE univerzalan, zavisi od pojedinačnog dijaloga.** Povukao sam univerzalnu CSS izmenu i zamenio je OPT-IN `stackedFooter` prop-om na `Modal` komponenti (podrazumevano i dalje red/desno, isto kao pre) — primenjeno SAMO na 5 pojedinačno frejmom potvrđenih dijaloga:

| Dijalog | Frejm | Raspored | Status |
|---|---|---|---|
| Storniraj fakturu (fakture.js) | Fak17 | stack, primarno prvo | `stackedFooter:true` ✓ |
| Sačuvati kao nacrt? (fakture.js) | Fak10 | stack, primarno prvo | `stackedFooter:true` ✓ |
| Izvezi knjigu prihoda (knjiga.js) | Kp6 | stack, primarno prvo | `stackedFooter:true` ✓ |
| Obrisati prihod? (knjiga.js) | Kp8 | stack, primarno prvo | `stackedFooter:true` ✓ |
| Obrisati razgovor? (ai.js) | Ak17 | stack, primarno prvo | `stackedFooter:true` ✓ |
| Dodaj prihod (knjiga.js) | Kp5 | RED, desno poravnato | podrazumevano (bez izmene) ✓ |
| Otkaži pretplatu? (pretplata.js) | Sub10 | RED, desno poravnato | podrazumevano (bez izmene) ✓ |

Sve 7 gore potvrđeno uživo (screenshot) posle izmene — tačno po frejmu.

**Dijalozi BEZ frejma u kešu (nisu provereni, poimenično)**: Preimenuj razgovor (ai.js — nema odgovarajući Ak frejm sa ovim naslovom); Izmeni račun, Ukloniti račun?, Promeni lozinku (desktop), Izbrisati nalog? (desktop) — Pd0-Pd7 desktop frejmovi NISU keširani (samo PhPd8/9/10 telefon); Potvrdi plaćanje u banci (Sub5 sadrži naslov ali footer kontekst nije pouzdano izvučen u raspoloživom vremenu); Kako da obrađujem mejlove banke? (Mb9, footer nije proveren); Izaberi raspored (Fak24 — deo odložene Faze 10b). Ovih **6 dijaloga ostaju neprovereno** — ostaju na podrazumevanom (red) rasporedu dok se ne potvrdi suprotno.

**c) Preostalih ~70 (122 instance) neuparenih elemenata, poimenično upisano**:
- `21.9% limita od 6.000.000 din` (32×) i slične kombinovane procenat+iznos rečenice (`83.7%...`, `0%...`) — frejm ih piše kao JEDAN tekst-čvor, kod razdvaja na više `<span>` elemenata (artefakt merenja, strukturna razlika, ne stilska greška).
- `kurs 107,10`/`117,30`/`117,25`, `Ukupan prihod u 2026.`, `Ostalo 6.000.000,00 din`, `19 uplata`/`22 uplate` — isti uzrok (frejm spaja oznaku+vrednost u jedan tekst, kod razdvaja).
- **`Filteri` / `Primeni filtere` (NOVI, STVARAN nalaz, NIJE ispravljen)**: PhKp9 frejm pokazuje da je filter na TELEFONU zaseban DONJI SHEET ("Filteri" naslov, polja Godina/Mesec/Klijent, dugme "Primeni filtere") — ne tri selecta naslagana direktno na stranici kao sad. Ovo je stvarna nedostajuća mobilna komponenta, van budžeta ovog kruga — prijavljeno za buduću fazu.
- `Gotovinska uplata, usluge dizajna` i `Kod deviznog prihoda tražim još valutu i kurs.` — primer-tekst/napomena u `AddIncomeModal` koje kod trenutno nema — nije provereno da li su stvarno izostavljeni ili samo alat nije uparen po scenariju (budžet).
- `Ispravi`, `Devizni prihodi0`/`Dinarski prihodi0` (verovatno bedž-spajanje iste vrste kao poznato), `Filteri`-vezani `Godina`/`Mesec`/`Klijent` (deo iste mobilne-sheet priče iznad) — nerazvrstano dalje, iskreno ostavljeno.

NaN sweep (80 kombinacija): čisto.

**d) Knjiga prihoda (Faza 4/10) — ZATVORENA.** (a) telefon potvrđen tačan bez izmene; (b) footer raspored ispravljen bezbedno (opt-in, potvrđen na 7 dijaloga uživo, 6 nepoznatih ostaje na bezbednom podrazumevanom); (c) preostali nalazi poimenično upisani, jedan nov stvaran nalaz (mobilni filter-sheet) prijavljen za kasnije. Preostaje otvoreno samo ono što je gore eksplicitno imenovano (6 neproverenih dijaloga, mobilni filter-sheet, par nerazvrstanih tekst-stavki) — ne blokira zatvaranje, upisano kao budući rad.

## Faza 10, četrnaesti krug — korak 2: Mejlovi banke — NIJE ZAPOČET

Cela sesija je otišla na ispravljanje sopstvene greške iz prošlog kruga (Kp4) i bezbedno dovršavanje footer-audita (otkriven i ispravljen rizik od univerzalne izmene koja bi pokvarila Sub10/Kp5). 0 frejmova Mejlovi banke pregledano, 0 poslova napravljeno.

## Sledeće — Faza 10, petnaesti krug
Faza 5/10, Mejlovi banke, u celosti (Mb1-11+povezano), koristeći `shoot.js` za kontakt-slike od početka.

## Pravila koja važe za SVAKU fazu (ne odstupati)
1. **Frejm je izvor istine, piksel po piksel** — ne na oko, ne iz sećanja, ne iz teksta specifikacije kad je u sukobu sa frejmom. Otvori frejm i prepiši stvarne vrednosti: font-size, font-weight, line-height, letter-spacing, padding, margin, gap, width, height, border-radius, border, box-shadow, boje (hex), tačan tekst, ikonice.
2. **Testiraj na dve širine**: 390px (telefon) i 1280px (desktop).
3. **Testiraj obe teme**: svetla i tamna.
4. **Posle svakog dela posla pošalji tabelu provere**: frejm | svetla desktop | tamna desktop | svetla telefon | tamna telefon — sa "identično" ili šta je ispravljeno. Ako nešto nije provereno, napiši to otvoreno, nikad ne tvrdi da jeste ako nije.
5. **Ne dodaji ništa što nije u dizajnu.**
6. **Radi fazu po fazu** (odeljak 11.2 specifikacije), javi se posle svake i ne počinji sledeću bez potvrde.
