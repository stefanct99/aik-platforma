# AI knjigovođa za paušalce: kompletna specifikacija platforme

Verzija 1.0, novembar 2026. Vlasnik proizvoda: Stefan Milošević (Stephortless).
Ovaj dokument opisuje platformu (aplikaciju), ne marketinški sajt. Namenjen je Claude Code-u kao jedini izvor istine za pravljenje prototipa, a zatim i proizvoda.

---

## 0. Kako da koristiš ovaj dokument

1. Pročitaj odeljke 1 do 5 pre nego što napišeš ijednu liniju koda. Oni objašnjavaju poentu, pojmove i pravila koja važe na svakom ekranu.
2. Odeljak 6 opisuje tokove od početka do kraja (registracija, devizni priliv, faktura, porez, pretplata). Svaki tok je podeljen na korake i stanja.
3. Odeljak 7 opisuje svaki ekran: čemu služi, šta sadrži, svako dugme, svako stanje i šta se desi kad se klikne.
4. Odeljci 8 do 10 su poslovna pravila, podaci i integracije, nefunkcionalni zahtevi.
5. Odeljak 11 je predlog redosleda gradnje i definicija prototipa. Odeljak 12 su poznate nedoslednosti u dizajnu koje treba rešiti po navedenom pravilu. Prilog A povezuje ovaj dokument sa dizajn frejmovima.
6. Dizajn je nacrtan u Claude Design fajlu "Tvoj AI Knjigovodja" (tabovi "Platforma (app) - ..."). Svaki frejm ima ID (na primer `Fak3`, `Mb4`, `Pd8`) koji se pominje u ovom dokumentu u zagradama. Kad se tekst ovog dokumenta i dizajn razlikuju u izgledu, dizajn pobeđuje. Kad se razlikuju u ponašanju, ovaj dokument pobeđuje.
7. Svi tekstovi na ekranu (srpski, latinica) treba da budu preuzeti iz dizajna, ne izmišljani. Ovde su citirani u navodnicima gde je tačan tekst važan.

Oznake pouzdanosti koje se koriste u dokumentu:

- **[ODLUČENO]** Stefan je to izričito odlučio.
- **[IZ DIZAJNA]** Vidi se u nacrtanim frejmovima, a nije posebno diskutovano.
- **[PREDLOG]** Predlog za implementaciju koji Claude Code može da promeni uz obrazloženje.
- **[PROVERITI]** Činjenica o zakonu, banci ili spoljnom sistemu koju treba potvrditi pre nego što se proglasi tačnom u proizvodu.

---

## 1. Proizvod

### 1.1 Poenta u jednoj rečenici

Tvoj AI knjigovođa je aplikacija koja u potpunosti zamenjuje knjigovođu paušalcu u Srbiji. AI knjigovođa sve radi sam (pravi fakture, knjiži uplate, popunjava dokumenta za banku, računa limit, priprema uplate poreza), a korisnik samo odobrava.

Slogan: "Tvoj AI knjigovođa. Sve što radi knjigovođa. Bez knjigovođe."

### 1.2 Za koga

- Isključivo paušalno oporezovani preduzetnici u Srbiji (ne d.o.o., ne preduzetnici koji vode knjige). Samo srpsko tržište.
- Tipičan korisnik: frilenser ili vlasnik male radnje koji naplaćuje uglavnom iz inostranstva u evrima ili dolarima i dinarski od domaćih klijenata, nema knjigovođu i sve radi sam.
- Prvi korisnik i uzorak problema je sam Stefan: svakog meseca prima devizne uplate, za svaku šalje banci tri dokumenta (fakturu, raspored priliva, nalog za prodaju deviza), pravi i šalje fakture, plaća porez i doprinose.

### 1.3 Šta korisnik dobija (a ne šta aplikacija ima)

Korisnik dobija svog knjigovođu. Ne brine o knjigama, novcu, limitima, prilivima i rashodima. Zato svaki ekran vodi ka jednoj odluci: pogledaj, proveri, odobri.

Pravilo pisanja tekstova u aplikaciji: uvek "AI knjigovođa ti pravi / radi ovo", nikad golo "AI radi". Ton je smiren, jednostavan, za nekoga ko ne zna knjigovodstvo. Ti forma, kratke rečenice, bez žargona, bez crtica (em dash) u tekstu.

### 1.4 Ono što aplikacija NIJE (granice)

- Nije aplikacija za d.o.o. firme, PDV obveznike ni preduzetnike koji vode poslovne knjige. Kad korisnik pređe limit, aplikacija ga upozorava i objašnjava šta sledi, ali ne vodi složene poslovne knjige.
- Nije banka i ne plaća umesto korisnika. Porez i doprinosi se plaćaju QR kodom (IPS) ili trajnim nalogom koji korisnik sam podešava u svojoj banci. Aplikacija nikad ne traži lozinku za e-banking niti pristup bankovnom računu.
- Ne čita korisnikov inbox. Aplikacija ima sopstvenu adresu za prijem (po korisniku) na koju banka šalje (ili korisnik prosleđuje) mejlove o prilivima.
- Nije opšti chat. AI knjigovođa odgovara isključivo o poslovanju paušalca u Srbiji.

### 1.5 Brend

- Dva imena ostaju: "Tvoj AI knjigovođa" (naziv usluge i slogan) i "Fakturica" (radno ime proizvoda). Konačan izbor imena nije zatvoren [ODLUČENO da se zadrže oba]. Zato ime u kodu treba da bude konfiguracija, ne hardkodovan string. U dizajnu se u headeru piše "tvoj AI knjigovođa" gde je "AI" na limeta zelenoj pozadini kao ikonica, a reč "knjigovođa" je podebljana.
- Domen: `tvojaiknjigovodja.rs`. Adresa za prijem mejlova: `<korisnik>@prijem.tvojaiknjigovodja.rs`.

### 1.6 Dizajn pravci

- Uzor: Wise (preglednost, velike ikonice, veliki font) i Ramp (čistiji izgled, kontrolna tabla).
- Svetli i tamni izgled su obavezni (podešavanje "Jezik i izgled": Svetli, Tamni, Kao na uređaju). Dizajn tamnih varijanti postoji u tabu "Platforma (app) - tamni izgled".
- Tokeni su u `design-system.json` i `tokens.json` (folder dizajn sistema). Glavne boje: Šuma `#0F2A22` (sidebar, primarna dugmad), Limeta `#C8F169` (akcenat, AI oznaka; nikad kao tekst na svetloj pozadini), Kost `#F4F3EE` (pozadina), Bela (kartice), Grafit `#1C211E` (tekst). Fontovi: Manrope 700/800 za naslove i iznose, Inter 400/600 za tekst. Veličine teksta samo parne vrednosti (12, 14, 16, 18, 20, 24, 32, 40, 48, 64 px). Iznosi koriste tabularne cifre.
- Svaki ekran ima četiri osnovna stanja: prazno, učitavanje (skeleton), greška, uspeh.

---

## 2. Rečnik pojmova

| Pojam | Značenje u aplikaciji |
|---|---|
| Paušalac | Preduzetnik koji plaća fiksan mesečni porez i doprinose po rešenju Poreske uprave i ne vodi složene poslovne knjige. |
| Limit | Granica od 6.000.000 din prihoda u 12 meseci. Ako se pređe, menja se način oporezivanja. Aplikacija ga stalno prati. [PROVERITI aktuelni iznos pre objave, vidi 8.4] |
| Rešenje | Rešenje Poreske uprave koje stiže u poresko sanduče na portalu ePorezi (obično u januaru) i sadrži mesečne iznose poreza i doprinosa. |
| Akontacija | Mesečna uplata poreza i doprinosa (četiri uplate: porez, PIO, zdravstveno, nezaposlenost). Rok je 15. u mesecu za prethodni mesec. Ako 15. pada u neradni dan, rok je sledeći radni dan (primer iz dizajna: 15. nov je nedelja, rok 16. nov). |
| IPS QR | NBS standard QR koda za instant plaćanje, koji mobilno bankarstvo skenira i popuni nalog. |
| Priliv | Uplata na račun korisnika (devizni ili dinarski). Banka o njemu šalje mejl. |
| Obrazac za banku / dokumenta za banku | Za devizni priliv banka traži tri dokumenta: faktura, raspored priliva, nalog za prodaju deviza. Za dinarski priliv traži samo fakturu. |
| Raspored priliva | Dokument kojim se devizni priliv rasporeduje na osnov (usluge itd.). |
| Nalog za prodaju deviza | Dokument kojim korisnik nalaže banci da proda deo ili ceo devizni priliv. |
| Knjiga prihoda (KPO) | Evidencija ostvarenog prometa po datumu uplate. Devizni i dinarski prihodi su razdvojeni. |
| Storno | Poništavanje fakture. Stornirana faktura ostaje u istoriji, ali se ne računa u prihod. |
| Ponavljajuća faktura | Faktura koja se priprema automatski na zadati dan (na primer svakog 1. u mesecu). |
| Stalni klijent | Klijent sa sačuvanim podrazumevanim podacima (valuta, jezik, rok, račun, opciono stavka i cena). |
| Odobrenje | Korisnikov klik kojim dozvoljava da se nešto pošalje van aplikacije (banci, klijentu). Ništa se ne šalje bez odobrenja, osim ako je korisnik izričito uključio automatsko slanje. |
| Čeka tebe | Lista stvari koje AI knjigovođa ne može da uradi bez korisnika (potvrda za koju je fakturu stigla uplata, odobrenje dokumenata). |
| Probni period | 30 dana besplatno, bez obaveze i bez unosa kartice. Posle toga nalog prelazi u režim samo pregleda ako nije izabran plan. |

---

## 3. Domenski model (podaci)

Ovo je logički model. Konkretnu šemu baze određuje Claude Code. Svi novčani iznosi se čuvaju kao celobrojni iznos u najmanjoj jedinici (pare/centi) uz kod valute.

### 3.1 Korisnik i firma

- **Korisnik (User):** ime i prezime, e-mail (jedinstven), lozinka (hash) ili Google identitet, potvrđen e-mail (da/ne), dvostepena prijava (da/ne), tema (svetla/tamna/sistem), jezik (srpski latinica, srpski ćirilica, engleski), format datuma, datum kreiranja.
- **Firma (Business):** poslovno ime, ime vlasnika, PIB (9 cifara), matični broj (8 cifara), šifra delatnosti (4 cifre sa nazivom, na primer 6201 Računarsko programiranje), datum otvaranja/registracije, adresa (ulica i broj, mesto, poštanski broj od 5 cifara), kontakt mejl, telefon, logo (PNG ili SVG do 2 MB), adresa za prijem mejlova (`<slug>-<kod>@prijem.tvojaiknjigovodja.rs`), status onboardinga, status rešenja.
- Jedan korisnik ima jednu firmu u prvoj verziji. Model treba da dozvoli kasnije više firmi bez prepravke.

### 3.2 Računi firme (BankAccount)

Proizvoljan broj računa, u bilo kojoj valuti, bez ograničenja [ODLUČENO]. Polja: tip (dinarski ili devizni), valuta, banka, broj računa (dinarski) ili IBAN i SWIFT (devizni), oznaka "podrazumevani za fakture u ovoj valuti". Na fakturi se prikazuje račun koji odgovara valuti fakture.

### 3.3 Klijent (Client)

Naziv, država, mejl za fakture (billing mejl), adresa (ulica, mesto, poštanski broj, država), tip (domaći dinarski ili inostrani), podrazumevani podaci: valuta, jezik fakture (srpski, engleski), rok plaćanja u danima, račun za uplatu, opciono podrazumevana stavka (opis i iznos). Pravila obrade mejlova banke po klijentu (vidi 7.7). Poslednja faktura (izvedeno). Klijent bez faktura može da se obriše.

### 3.4 Faktura (Invoice)

Broj (format `25/26-15`, vidi 8.2), klijent, valuta (EUR, USD, RSD, proširivo), jezik, datum izdavanja, rok (dani i izračunat datum), stavke (opis, količina, cena, iznos; jedinica mere opciono), PDV linija (uvek 0 jer paušalac nije u sistemu PDV: "PDV (nisam u sistemu PDV)"), ukupno, račun za uplatu, napomena, poziv na broj (za dinarske fakture), šablon izgleda, status.

Statusi fakture: **Nacrt** (nije poslata), **Poslata** (čeka uplatu), **Kasni** (rok istekao, izvedeno iz datuma), **Plaćena**, **Stornirana**. Svaka faktura ima istoriju događaja (napravljena, poslata, rok istekao, uplata stigla, podsetnici, storno).

### 3.5 Ponavljajuća faktura (RecurringInvoice)

Klijent, stavka (opis, iznos, može da bude prazan: "Iznos se upisuje pri slanju"), učestalost (mesečno u prvoj verziji), dan u mesecu, datum početka, datum završetka (ili "Nikad"), režim slanja (traži odobrenje ili šalje automatski), status (Aktivna, Pauzirana), datum sledeće fakture.

### 3.6 Uplata/Prihod (Income)

Datum uplate, klijent (može da bude "Nepoznat pošiljalac"), faktura (može da bude prazno), valuta, iznos, kurs (NBS na dan priliva, samo za devizne), iznos u dinarima, izvor ("Mejl banke", "Ručno"), vrsta (devizni, dinarski), opis. Uplata bez fakture ne ulazi u zbir ni u limit dok se ne poveže sa fakturom (vidi 7.9 i 7.10).

### 3.7 Mejl banke (BankMail)

Primljeni mejl: pošiljalac, tema, telo, prilozi, vreme prijema, adresa za povraćaj (čita se iz teksta mejla, može da se razlikuje od pošiljaoca [ODLUČENO]), tip (devizni priliv, dinarski priliv, zahtev za dodatni dokument, ostalo), prepoznat iznos, valuta, pošiljalac priliva, povezani klijent i faktura, status obrade. Statusi: **Čeka tvoje odobrenje**, **Poslato automatski**, **Poslato banci**, **Treba mi tvoja pomoć** (problem), **Odbačeno**. Istorija radnji (stiglo, pripremljeno, odobreno, poslato, devize prodate).

### 3.8 Dokumenta za banku (BankDocument)

Tri tipa: faktura (PDF iz šablona), raspored priliva (PDF), nalog za prodaju deviza (PDF). Svaki je vezan za mejl banke i uplatu.

### 3.9 Rešenje Poreske uprave i mesečne obaveze

- **TaxDecision:** fajl (PDF ili slika do 20 MB), godina, PIB sa rešenja, status (pročitano, potvrđeno, nepotvrđeno ručno uneto), datum dodavanja.
- **TaxObligation:** za svaku od četiri stavke: naziv, mesečni iznos, račun primaoca, poziv na broj, model/šifra. Stavke: Porez na prihod od samostalne delatnosti, PIO za radni staž, Zdravstveno osiguranje, Osiguranje za slučaj nezaposlenosti. Ukupno mesečno je zbir.
- **TaxPayment:** za svaki mesec i svaku stavku status (Neplaćeno, Plaćeno), datum plaćanja, način (QR, trajni nalog, ručno označeno).

### 3.10 Kalendar događaj (CalendarEvent)

Tip: Država (rok poreza i doprinosa), Dospeva (faktura dospeva), Kasni (faktura kasni), Ponavljajuća (faktura se šalje), Ručni (korisnik dodaje). Datum, naslov, iznos, veza ka fakturi ili obavezi, status (čeka, plaćeno), podsetnici.

### 3.11 AI razgovor (Conversation, Message, AIAction)

Razgovor: naslov, vreme, poruke (korisnik i AI), prilozi (PDF izvod), ocena poruke (Korisno, Nije korisno, razlog). Radnja (AIAction): šta je AI uradio u ime korisnika (napravio nacrt fakture, poslao podsetnik, poslao dokumenta banci, označio porez kao plaćen), vreme, može li da se vrati ("Vrati").

### 3.12 Pretplata (Subscription, Payment)

Status (Probni, Aktivna, Istekla/Pauzirana, Naplata nije uspela, Otkazana), plan (jedan plan "Sve uključeno"), period (1, 3, 6 ili 12 meseci), cena po mesecu, način plaćanja (kartica sa automatskom obnovom, ili QR bez obnove), datum sledeće naplate, istorija plaćanja sa računima (PDF). Razlog otkazivanja (opciono).

### 3.13 Obaveštenja (Notification) i podešavanja obaveštenja

Obaveštenje: tip, naslov, tekst, vreme, pročitano. Podešavanje po tipu i kanalu (mejl, push). Tipovi: Rokovi za porez, Kasne fakture, Novi mejl banke, AI je nešto primetio, Promena propisa, Nedeljni pregled.

---

## 4. Najvažnija pravila ponašanja (važe svuda)

### 4.1 Matrica autonomije: šta AI radi sam, a šta traži odobrenje

Ovo je srž proizvoda. Podrazumevano se traži odobrenje za sve što izlazi van aplikacije.

| Radnja | Podrazumevano | Korisnik može da promeni |
|---|---|---|
| Pročitati mejl banke, prepoznati iznos, pošiljaoca i zahtev | Automatski | Ne |
| Upariti uplatu sa fakturom | Automatski kad je jednoznačno; ako nije, ide u "Čeka tebe" | Ne |
| Knjižiti uplatu u knjigu prihoda | Automatski kad je upareno | Ne |
| Pripremiti dokumenta za banku | Automatski | Ne |
| Poslati dokumenta banci | Traži odobrenje | Da: globalno i po klijentu "Šaljem automatski" |
| Prodati devize | Samo proknjiži, ne prodaje | Da: prodaj deo (procenat ili iznos) ili prodaj ceo, globalno i po klijentu |
| Napraviti nacrt fakture | Automatski (nacrt) | Ne |
| Poslati fakturu klijentu | Traži odobrenje (klik "Pošalji fakturu") | Ne |
| Ponavljajuća faktura na dan slanja | Priprema i pita za odobrenje | Da: "Šaljem automatski" po klijentu |
| Podsetnik klijentu za kasnu fakturu | Priprema tekst, korisnik pošalje | Ne u v1 [PREDLOG: kasnije automatski] |
| Plaćanje poreza i doprinosa | Nikad ne plaća. Priprema QR kodove i uputstvo za trajni nalog | Ne |
| Obavestiti korisnika | Automatski prema podešavanjima obaveštenja | Da |
| Svaka radnja AI u ime korisnika | Zabeležena u istoriji "Šta sam radio" | Ne |

Pravilo za razvoj: nijedna funkcija koja šalje mejl van sistema (banci ili klijentu) ne sme da se izvrši bez odobrenja ili bez eksplicitno uključenog automatskog režima za taj slučaj.

### 4.2 Pravilo "1 uplata = 1 faktura"

Uvek je jedna uplata vezana za jednu fakturu. Prijavljeni iznos je uvek pun iznos priliva. Provizija banke se oduzima posle, nikad pre prijave. [ODLUČENO]

### 4.3 Devizni i dinarski prilivi se tretiraju različito

- Devizni priliv: tri dokumenta, mogućnost prodaje deviza (samo proknjiži, deo, sve), kurs NBS na dan priliva za knjigu prihoda.
- Dinarski priliv: banka traži samo fakturu, nema prodaje, ceo iznos se knjiži u dinarima.
- Dnevni izvodi (dinarski) idu u tab Promet i izvodi [ODLUČENO]. U trenutnom dizajnu izvod se prilaže u AI chat (frejm Ak7) i čita se. Poseban tab "Promet i izvodi" još nije nacrtan, vidi 12.

### 4.4 Limit se uvek vidi

Na početnoj, u knjizi prihoda, u kalendaru i u chatu uvek se prikazuje koliko je prihoda ostvareno u poslednjih 12 meseci i koliko je ostalo do 6.000.000 din. Pri 80 do 90% limita pojavljuje se upozorenje (vidi 7.2 i 7.9). Prihod se računa po datumu uplate, devizni po kursu NBS na dan priliva.

### 4.5 Format brojeva, datuma i jezik

- Iznosi u srpskom formatu: `1.200,00 €`, `140.640,00 din`, `441,28 $`. Valuta posle iznosa.
- Datumi: `15.11.2026.` (podrazumevano) ili `2026-11-15` (podešavanje). U tekstu se piše "15. novembar".
- Jezik aplikacije: srpski latinica (podrazumevano), srpski ćirilica, engleski. Jezik fakture je nezavisan od jezika aplikacije i bira se po klijentu (srpski ili engleski).
- Aplikacija je u celosti lokalizovana. Svi tekstovi idu kroz sistem prevoda (i18n), ne hardkodovano.

### 4.6 Obeležavanje AI rada

Šta je AI uradio vidi se kroz limeta "AI" oznaku, a istorija radnji (frejm Ak8) pokazuje svaku radnju u ime korisnika. Radnje koje mogu da se vrate imaju link "Vrati". Čovek uvek ima poslednju reč.

### 4.7 Stanja svakog ekrana

Svaki ekran mora da ima: prazno stanje (objašnjenje i jedno dugme), učitavanje (skeleton), grešku (šta se desilo i šta da uradi, bez tehničkog jezika) i uspeh (kratka potvrda). Greške preko cele stranice: "Ove stranice nema" (Err1) i "Nema veze sa internetom" (Err2, "Tvoji podaci su sigurni... ništa što si upisao nije izgubljeno").

### 4.8 Nikad "nisam siguran"

AI knjigovođa ne prikazuje stanje "nisam siguran". Na svako knjigovodstveno pitanje odgovara, a kad je slučaj nejasan daje odgovor po scenarijima sa preporukom i izvorom (Ak4). [ODLUČENO]

### 4.9 Bezbednost podataka (principi)

- Korisnik vidi samo svoj nalog. Administratori sistema ne smeju da imaju pristup bankovnim i finansijskim podacima korisnika. [ODLUČENO]
- Brisanje naloga briše fakture, knjigu prihoda, dokumenta i razgovore. Izvoz podataka postoji pre brisanja.
- Konkretne tehničke odluke (lokacija podataka, enkripcija, rokovi čuvanja i brisanja) prepuštene su implementaciji i dokumentuju se tek kad su sprovedene. Stranica "Bezbednost" na sajtu se piše na kraju i sme da sadrži samo ono što je stvarno implementirano.

---

## 5. Struktura aplikacije i navigacija

### 5.1 Mapa ekrana

Prijavljeni deo aplikacije ima ovih 9 glavnih sekcija (levi meni na desktopu):

1. **Početna** (kontrolna tabla)
2. **Fakture** (tabovi: Fakture, Klijenti, Ponavljajuće)
3. **Knjiga prihoda**
4. **Kalendar**
5. **Porez i rokovi** (značka sa brojem kad ima nešto što čeka)
6. **Mejlovi banke** (značka sa brojem neobrađenih)
7. **AI knjigovođa** (chat)
8. **Podešavanja** (tabovi: Profil i firma, Računi, Pretplata, Obaveštenja, Povezivanje, Bezbednost i nalog, Jezik i izgled)
9. **Pretplata** (poseban ekran, otvara se iz trake probnog perioda ili iz Podešavanja)

Van prijavljenog dela: Prijava, Registracija, potvrda e-maila, reset lozinke, magic link, onboarding (4 koraka), greške 404 i offline.

Planirani, a još nenacrtan tab "Promet i izvodi" (dinarski dnevni izvodi) vidi odeljak 12.

### 5.2 Desktop raspored (1280 px i više)

- **Levi meni** (264 px, boja Šuma): gore znak i naziv "tvoj AI knjigovođa", ispod primarno dugme "Nova faktura" (Limeta), zatim stavke menija: Početna, Fakture, Knjiga prihoda, Kalendar, Porez i rokovi, Mejlovi banke, AI knjigovođa, Podešavanja. Dole kartica probnog perioda ("Probni period / Još 23 dana besplatno / Izaberi plan"), zatim korisnik (avatar sa inicijalom, "Stefan Milošević", "Stephortless PR", "Odjavi se").
- **Gornja traka:** globalna pretraga ("Pretraži fakture, klijente, uplate"), dugme "Nova faktura", zvonce sa obaveštenjima, profil.
- **Sadržaj:** do 1120 px širine, naslov stranice i opisni red ispod naslova, zatim kartice.
- Kartice: zaobljenje `radius-lg`, padding 24 px.

### 5.3 Telefon raspored (390 px)

- Donja traka sa 5 stavki: **Početna, Fakture, Faktura (veliko centralno dugme "+"), Porez, Više**. Ostale sekcije (Knjiga prihoda, Kalendar, Mejlovi banke, AI knjigovođa, Podešavanja, Pretplata) su iza dugmeta "Više" (sheet sa listom).
- Gornji deo: znak i naziv, avatar. Padding 16 px, dodirne površine najmanje 44 px.
- Tabele iz desktopa postaju liste kartica. Modali postaju "bottom sheet" ekrani. Dijalozi potvrde ostaju centrirani.
- Svaki ekran iz desktopa ima telefonsku varijantu sa istim sadržajem i stanjima (frejmovi sa prefiksom `Ph`, `Tel`, `MNav`). Isto ponašanje, samo drugačiji raspored. Nema funkcije koja postoji samo na jednom uređaju.
- Brzi AI panel (Ak9 desktop, PhAk9 telefon): plutajuće dugme na svakom ekranu otvara AI chat u panelu, sa kontekstom ekrana na kome si.

### 5.4 Globalni elementi (na svakom ekranu)

**Pretraga (gornja traka).** Pretražuje fakture (po broju, klijentu, iznosu), klijente (naziv, mejl), uplate (klijent, iznos), mejlove banke. Rezultati grupisani po tipu. Klik vodi na detalj. Prečica: `/` ili `Cmd/Ctrl+K`. [PREDLOG]

**Zvonce (obaveštenja).** Lista obaveštenja u aplikaciji, najnovija gore, nepročitana su istaknuta. Klik na obaveštenje vodi na relevantni ekran. "Označi sve kao pročitano". Isti događaji idu na mejl i push prema podešavanjima (7.13).

**Traka probnog perioda.** U levom meniju: "Probni period / Još 23 dana besplatno / Izaberi plan". Na dan 3 ili manje postaje upozorenje ("Još 5 dana besplatno" je primer iz dizajna, Sub1). Posle isteka: "Istekao je 20. novembra" (Sub2) i crvena nota. Klik vodi na Pretplatu.

**Traka upozorenja o pretplati.** Kad se obnavlja QR načinom plaćanja: "Porez i rokovi | Pretplata | Ističe za 3 dana | Plati QR kodom" (Sub12).

**Vodič kroz aplikaciju (guided tour).** Pri prvom ulasku posle onboardinga pet kratkih tooltip koraka (Tur0 do Tur4) pokazuju: početnu karticu "Počni ovde", limit prihoda, "Čeka tebe", rokove, AI knjigovođu. Može da se preskoči i da se ponovo pokrene iz pomoći. Pored osnovnih brojki stoje "?" ikonice sa kratkim objašnjenjima (Tip1: "Prihod u poslednjih 12 meseci? Paušalci mogu da zarade do 6.000.000 din u 12 meseci. Računam sve tvoje uplate i javim ti kad se približiš." i Tip2 za "Čeka tebe").

**Pomoć.** Link "Pomoć" u podnožju prijave i onboardinga i unutar aplikacije. Podrška ide preko AI pomoći, pa preko ljudi (kontakt forma). [PREDLOG: v1 može samo mejl podrške]

**Prečice tastature.** `N` nova faktura, `G pa H` početna itd. su opcione. [PREDLOG, nije u dizajnu]

### 5.5 Lista kontrola prava pristupa po stanju naloga

| Stanje naloga | Šta radi | Šta ne radi |
|---|---|---|
| Registrovan, e-mail nepotvrđen | Samo ekran "Potvrdi e-mail" | Sve ostalo |
| Onboarding nezavršen | Ulazi u aplikaciju, vidi karticu "Počni ovde" sa preostalim koracima | Funkcije koje zavise od izostavljenih podataka daju uputstvo (npr. porez bez rešenja) |
| Probni period (30 dana) | Sve | Nema ograničenja osim dnevne kvote AI poruka (20 dnevno, Ak14) |
| Aktivna pretplata | Sve, bez dnevne kvote AI poruka | |
| Pretplata istekla (pauziran) | Pregled i izvoz svih podataka | AI knjigovođa je pauziran: ne čita nove mejlove banke, ne priprema dokumenta, ne šalje podsetnike, ne generiše ponavljajuće fakture, AI chat traži plan. Podaci ostaju sačuvani. Baner "Istekao je 20. novembra. AI knjigovođa je pauziran. Izaberi plan da nastavi." |
| Naplata nije uspela | Sve radi 3 dana dok pokušavam ponovo | Posle neuspeha prelazi u istekla |
| Otkazana (do kraja plaćenog perioda) | Sve radi do kraja plaćenog perioda | Posle toga isto kao istekla |

---

## 6. Glavni tokovi od početka do kraja

Svaki tok navodi korake, šta korisnik vidi, šta se dešava u pozadini i šta se može pokvariti. Ekrani su detaljno opisani u odeljku 7.

### 6.1 Prvi dan: od registracije do prve fakture

1. **Registracija** (`PrijavaReg`). Polja: Ime i prezime, E-mail, Lozinka, kvačica "Prihvatam Uslove korišćenja i Politiku privatnosti". Dugme "Nastavi sa Google nalogom" (alternativa). Poruka "Prvih 30 dana je besplatno. Bez obaveze." Nema kartice.
2. **Potvrda e-maila** (`PrijavaV1`). Šalje se link, nalog je neaktivan dok se ne klikne. Dugmad: "Otvori mejl", "Pošalji ponovo", "Promeni e-mail". Klik na link vodi na `PrijavaV2` "E-mail je potvrđen" sa dugmetom "Nastavi". Za Google prijavu potvrda se preskače.
3. **Onboarding korak 1 od 4: O tvojoj firmi** (`OnbO1`): Poslovno ime, PIB (9 cifara), Matični broj (8 cifara), Šifra delatnosti (izbor sa pretragom, npr. 6201), Datum otvaranja. "Nastavi" čuva i vodi dalje.
4. **Korak 2 od 4: Podaci za fakture** (`OnbO4`): Ulica i broj, Mesto, Poštanski broj (5 cifara), Logo (neobavezno, PNG ili SVG do 2 MB, drag and drop). "Nazad", "Nastavi".
5. **Korak 3 od 4: Poveži mejlove banke** (`OnbO7`): prikazuje se korisnikova adresa za prijem, dugme "Kopiraj" (menja se u "Kopirano"), tri koraka (otvori mejl na koji stižu obaveštenja banke, podesi prosleđivanje na adresu iznad, čim stigne prvi mejl javićemo ti ovde). Stanje "Čekamo prvi mejl" sa indikatorom. Kad stigne prvi mejl, stanje se menja u "Prvi mejl je stigao. Sve radi." (`OnbO9`). Dugme "Podesiću ovo kasnije" preskače korak.
6. **Korak 4 od 4: Sve je spremno** (`OnbO10`): rezime (Podaci o firmi, Podaci za fakture, Mejlovi banke "Povezano" ili "Podesićeš ovo kasnije u podešavanjima", `OnbO11`). Dugme "Uđi u aplikaciju" (`OnbO12` je stanje učitavanja "Otvaram aplikaciju...").
7. **Početna sa karticom "Počni ovde"** (`Poc1` do `Poc6`): "Dobro došao, Stefane. Nalog je spreman. Još par koraka i krećem da radim umesto tebe." Pet koraka sa napretkom ("2 od 5 koraka"): 1 Nalog napravljen, 2 Podaci o firmi sačuvani, 3 Dodaj rešenje Poreske uprave, 4 Poveži mejlove banke, 5 Napravi prvu fakturu. Završeni koraci su označeni, naredni imaju dugme. Kad su svih pet gotovi kartica nestaje (`Dash4_*` su početne u svojim završnim stanjima).
8. **Vodič** (`Tur0` do `Tur4`) se pokreće jednom.

Pravila: onboarding je prekidiv. Korisnik koji zatvori browser u koraku 2 vraća se u korak 2. Svaki korak čuva podatke odmah, ne tek na kraju. "Pomoć" je uvek u zaglavlju.

### 6.2 Dodavanje rešenja Poreske uprave (porez postaje automatski)

Ovo je ključni tok jer od rešenja zavise iznosi poreza, QR kodovi i rokovi.

1. Ulaz sa početne ("Dodaj rešenje" u kartici "Počni ovde" ili banera "Još samo rešenje Poreske uprave i sve je spremno") ili iz Porez i rokovi. Naslov "Dodaj rešenje Poreske uprave" (`Rez2`).
2. Tri načina: (a) povuci PDF ili sliku (do 20 MB) ili "Izaberi fajl sa računara", (b) prosledi mejl sa rešenjem u prilogu na adresu za prijem ("Kopiraj adresu"), (c) "Unesi iznose ručno" (`Rez6b`). Link "Kako do rešenja" objašnjava kako se rešenje preuzima sa portala ePorezi (sanduče).
3. **Čitanje** (`Rez3`): "AI knjigovođa čita rešenje..." sa tri koraka progresa: Čitam iznose poreza i doprinosa, Proveravam PIB i naziv firme, Upoređujem doprinose sa stopama.
4. **Provera** (`Rez4c`): prikazuje se rešenje sa numerisanim oznakama odakle je svaki iznos uzet (1 Porez na prihod, 2 PIO, 3 Zdravstveno, 4 Nezaposlenost) i listu pročitanih podataka sa računima primaoca i pozivima na broj ("Sve provere prošle"). Ukupno mesečno 22.929,60 din. Korisnik ispravlja ako se nešto ne poklapa, pa "Sačuvaj".
5. **Greška PIB** (`Rez5`): "Ovo rešenje nije za tvoju firmu. PIB na rešenju se ne poklapa sa PIB-om firme koju si uneo. Zbog toga ga nisam upisao." Prikazuje oba PIB-a. Dugmad: "Učitaj drugo rešenje", "Proveri podatke firme".
6. **Ručni unos** (`Rez6b`): četiri polja mesečnih iznosa (Porez, PIO, Zdravstveno, Nezaposlenost). Račun primaoca i poziv na broj korisnik ne unosi, sistem ih generiše. Dugmad "Sačuvaj iznose", "Nazad". Pomoć "Gde da nađem iznose? Uz rešenje stižu četiri uplatnice. Svaka ima svoj iznos."
7. **Uspeh** (`PorOk`): "Sve je podešeno. Rešenje je sačuvano. Od sada pratim porez i doprinose umesto tebe." Četiri potvrde: sačuvani mesečni iznosi, pripremljene četiri uplate (račun, poziv na broj, QR), rokovi dodati u kalendar, podsetnici. Dugmad "Plati prvu uplatu", "Idi na početnu".
8. **Novo rešenje za sledeću godinu** (`PorNov`): kad se doda novo rešenje poredi se sa starim ("Šta se promenilo / Iznosi su veći"), tabela Uplata, Do sada, Novo, Razlika, ukupno razlika. "Šta se desi kad primeniš": nove uplate važe od sledeće akontacije uz nove QR kodove, a ako korisnik plaća trajnim nalogom, treba ažurirati naloge u banci (aplikacija daje nove podatke). Dugmad za primenu ili odbacivanje.

### 6.3 Mesečno plaćanje poreza i doprinosa

1. Aplikacija prikazuje "Sledeća uplata" na početnoj i na Porez i rokovi: "Akontacija za oktobar, 22.929,60 din, Treba platiti, Plati". Rok je 15. u mesecu za prethodni mesec, a ako je neradni dan, sledeći radni (primer: 16. novembar jer je 15. nedelja). Aplikacija sama računa datum.
2. Klik na "Plati" otvara "Plaćanje za oktobar" (`Pay1`): četiri uplate, svaka sa statusom (Neplaćeno), iznosom, računom primaoca, pozivom na broj, dugmetom "Kopiraj podatke" i "Označi kao plaćeno". Tabovi: **Skeniraj QR kod** i **Trajni nalog u banci**.
3. **Skeniraj QR kod** (`Pay1`, `Pay2`): za svaku stavku prikazuje se IPS QR kod. Korisnik u mobilnoj banci bira "skeniranje IPS QR koda" i potvrđuje. Posle uplate klikne "Označi kao plaćeno" za tu stavku. Brojač "Plaćeno 2 od 4 uplate".
4. **Trajni nalog u banci** (`Pay3`): "Podesi jednom, do sledećeg rešenja ne moraš da brineš o uplatama." Prikazuje podatke za četiri trajna naloga ("Mesečno, 10. u mesecu") i uputstvo "Kako se podešava" u tri koraka. Kad korisnik izabere ovaj način, početna prikazuje "Plaćanje poreza ide automatski iz banke" i na rokovima piše "Automatski iz banke" umesto "Plati".
5. Kad su sve četiri stavke označene kao plaćene, mesec postaje Plaćeno, rok nestaje iz "Čeka tebe" i kalendar ga prebacuje u istoriju.
6. Aplikacija nikad ne zna sa sigurnošću da je uplata izvršena (nema pristup banci). Zato je "Označi kao plaćeno" ručni korak, a podsetnik traje do tada.

### 6.4 Pravljenje i slanje fakture

1. Ulaz: "Nova faktura" (levi meni, zaglavlje, Fakture lista, brzi AI panel, "Napravi prvu fakturu" iz prazne liste).
2. **Forma** (`Fak3` do `Fak10`): izbor klijenta (pretraga ili "+ Novi klijent"), kad se izabere popunjavaju se valuta, jezik, rok, račun i stavka iz profila klijenta ("Popunjeno iz profila klijenta: valuta, jezik, rok, račun i stavka", `Fak8`, uz link "Izmeni profil"). Ako klijent nema podrazumevanu cenu, stavka je prazna sa porukom "Northwind nema podrazumevanu cenu, pa iznos upisuješ svaki put" (`Fak9`). Desno je pregled fakture uživo.
3. **Validacija** (`Fak19`): "Još dva polja treba da popuniš pre slanja", "Izaberi klijenta kome šalješ fakturu", "Upiši opis stavke i iznos veći od 0".
4. **Sačuvaj nacrt** čuva nacrt u listi (status Nacrt). Zatvaranje sa nesačuvanim izmenama traži potvrdu (`Fak10`).
5. **Pregledaj i pošalji** (`Fak11`): ekran mejla: Za (billing mejl klijenta, "+ Dodaj još jednu adresu"), Naslov, Poruka (AI je napisala poruku na jeziku fakture: "Napisao sam poruku na engleskom jer je to jezik fakture. Slobodno je izmeni."), prilog PDF (84 KB, napravljen iz šablona), "Pošalji kopiju i meni". Dugmad "Nazad na izmene", "Sačuvaj nacrt", "Pošalji fakturu".
6. **Poslato** (`Fak12`): "Faktura 25/26-15 je poslata. Acme Inc. je dobio mejl. Sad pratim uplatu: čim banka pošalje mejl, sam knjižim da je plaćena." Dugmad "Nazad na fakture", "Preuzmi PDF", "Napravi još jednu".
7. Status prelazi Nacrt na Poslata. Na rok se faktura prebacuje u Kasni ako uplata nije stigla.

### 6.5 Devizni priliv: od mejla banke do knjige prihoda (srž proizvoda)

Ovo je najvažniji tok i razlog zašto proizvod postoji.

1. **Banka šalje mejl** na adresu za prijem: "Priliv 1.200,00 EUR, potrebna dokumentacija" (od obavestenja@banka). Mejl kaže da je evidentiran priliv i traži: fakturu, raspored priliva i nalog za prodaju deviza, i navodi adresu na koju treba poslati (npr. devizni.dokumenta@erstebank.rs). Ta adresa se čita iz teksta mejla, ne iz polja "Od".
2. **AI pročita mejl** (automatski): prepoznaje iznos, valutu, pošiljaoca, šta se traži i kome da vrati.
3. **Upari sa fakturom:** traži otvorenu fakturu istog klijenta i iznosa. Tri ishoda: (a) jednoznačno, upari automatski; (b) nema fakture ili ima više kandidata, ide u "Treba mi tvoja pomoć" (vidi 6.6); (c) mejl nije standardan zahtev (npr. "potvrda o poreklu sredstava", `Mb7`), ide u problem.
4. **Pripremi tri dokumenta:** faktura 25/26-14 (PDF iz šablona), raspored priliva (datum, nalogodavac, PIB, banka, IBAN, iznos priliva, pošiljalac, broj fakture, osnov priliva, šifra osnova), nalog za prodaju deviza (ako je izabrana prodaja; vidi 7.7 i 8.5).
5. **Čeka tvoje odobrenje** (podrazumevano) ili **Poslato automatski** (ako je za tog klijenta ili globalno uključeno). U odobrenju (`Mb3`, `Mb4`) korisnik vidi: originalni mejl banke, "Šta sam uradio" (4 do 5 tačaka, npr. "Pročitao sam mejl: banka traži tri dokumenta", "Povezao sam uplatu sa fakturom 25/26-14", "Pripremio sam fakturu, raspored priliva i nalog za prodaju deviza"), spreman odgovor banci (Za, Naslov "Re: ...", Poruka, prilozi), pregled svakog dokumenta u tabovima, dugmad "Odobri i pošalji banci", "Odloži", "Odbaci".
6. **Slanje:** mejl se šalje na adresu iz mejla banke, sa tri priloga, sa opcionom kopijom korisniku. Status "Poslato banci" (`Mb5`): "Dokumenta su poslata banci. Priliv od 1.200,00 EUR je prijavljen. Faktura 25/26-14 je označena kao plaćena." Vremenska linija: Mejl banke je stigao, Pripremio sam dokumenta, Ti si odobrio slanje, Poslato na adresu, Čekam potvrdu banke.
7. **Knjiženje:** u Knjigu prihoda se upisuje uplata (izvor "Mejl banke") sa kursom NBS na dan priliva i iznosom u dinarima. Faktura postaje Plaćena. Limit se osvežava. Ako je prodata deviza, beleži se "Devize prodate" u istoriji (`Mb11`).
8. **Obaveštenje** korisniku prema podešavanjima ("Novi mejl banke").

Dinarski priliv (`Mb10`): banka traži samo fakturu. AI šalje samo fakturu, nema rasporeda ni prodaje deviza, ceo iznos se knjiži u dinarima i faktura se označava kao plaćena.

### 6.6 Problem: priliv bez fakture i drugi izuzeci

Mejl ulazi u stanje **Treba mi tvoja pomoć** kad AI ne može sam:

- **Priliv bez fakture** (`Mb6`): "Ne mogu da povežem ovaj priliv. Nemam fakturu na 1.250,00 € za pošiljaoca Delta Studio SRL. Reci mi šta da radim." Opcije: (1) **Napravi fakturu za ovaj priliv** (izaberi klijenta, ostalo popunjava iz profila; može i novi klijent), (2) **Poveži sa postojećom fakturom** (lista faktura koje čekaju uplatu), (3) **Nije moj priliv** (odbaci). Uplata ne ulazi u zbir ni u limit dok se ne poveže (Kp10: "Jedna uplata nema fakturu. Uplata od 1.250,00 € ne ulazi u zbir dok je ne povežeš sa fakturom." sa linkom "Poveži u Mejlovima banke", i baner na početnoj "Čeka tebe"). AI chat to objašnjava (Ak9) i nudi "Napravi fakturu" i "Poveži sa postojećom".
- **Banka traži nešto što nije standardan obrazac** (`Mb7`): "Ovo nije standardan obrazac. Banka traži potvrdu o poreklu sredstava, rok je 5 radnih dana. Ovo ne mogu da popunim sam." Korisnik ima "Odgovori banci": polje "Priloži dokument (na primer ugovor ili faktura)", predlog teksta odgovora na adresu iz mejla, dugme "Pošalji odgovor". Rok je prikazan i ulazi u kalendar.
- **Prodaja deviza delimična** (`Mb12`): u odobrenju se prikazuje blok "Prodaja deviza: Prodajem 600,00 EUR (50 %), Ostaje na deviznom računu 600,00 EUR, Promeni iznos".
- **Mejl nije od banke ili nije priliv:** AI ga svrstava u "Ostalo" i ne radi ništa, korisnik može da ga otvori i odbaci.
- **Greška slanja:** ako slanje ne uspe (odbijena adresa, tehnička greška), status ostaje "Čeka tebe" sa porukom šta je pošlo naopako i dugmetom "Pokušaj ponovo". Nikad se ne tvrdi da je poslato ako nije.

### 6.7 Kasna faktura i podsetnik

1. Faktura čiji je rok prošao a nije plaćena dobija status **Kasni** (izvedeno iz datuma, ne ručno). Pojavljuje se u listi (crveni status "Kasni 6 dana"), na početnoj kao "Kasne fakture", u kalendaru kao događaj "Kasni", u "Čeka tebe".
2. **Podsetnik klijentu** (`Fak23`): dugme "Pošalji podsetnik" otvara mejl: Za (billing mejl), Naslov ("Reminder: invoice 25/26-13"), Poruka (ljubazan podsetnik na jeziku fakture), prilog PDF fakture. "Napisao sam ljubazan podsetnik na engleskom. Slobodno ga izmeni." Dugmad "Odustani", "Pošalji podsetnik". Slanje se beleži u istoriji fakture.
3. Podešavanje kalendara "Kad faktura kasni: Svakih 7 dana dok se ne plati" odnosi se na podsetnike korisniku, ne klijentu.
4. Ručno "Označi kao plaćenu" (`Kl6`: datum plaćanja i potvrda) dozvoljeno je kad uplata nije stigla preko mejla banke (gotovina, drugi račun). Tada se pravi unos u Knjigu prihoda sa izvorom "Ručno".

### 6.8 Ponavljajuće fakture

1. Fakture, tab Ponavljajuće: lista (Klijent, Stavka, Ponavlja se, Sledeća faktura, Slanje, Status Aktivna/Pauzirana). Dugme "Nova ponavljajuća faktura".
2. Forma (`Fak14`): Kome i šta (Klijent, Opis, Iznos), Kad se ponavlja (Učestalost Mesečno, Dan u mesecu, Počinje, Završava ili "Nikad"), "Šta radim kad dođe taj dan": **Pripremim fakturu i pitam te za odobrenje** (Preporučeno: dobiješ obaveštenje, proveriš iznos i šalješ jednim klikom) ili **Šaljem automatski, bez pitanja** (koristi samo ako je iznos uvek isti). Dugmad "Odustani", "Sačuvaj".
3. Na zadati dan sistem pravi nacrt (ili šalje). Klijent bez podrazumevane cene ima "Iznos se upisuje pri slanju", uvek traži odobrenje.
4. Status Pauzirana zaustavlja generisanje bez brisanja. Akcije po redu: Pauziraj ili Nastavi, Uredi, Obriši.
5. Iz fakture: "Napravi ponavljajuću od ove" (meni ⋯, `Fak16`) predpopunjava formu.
6. U kalendaru: događaj tipa Ponavljajuća, "25/26-17 se šalje".

### 6.9 Storniranje i duplikat

- Meni fakture (⋯, `Fak16`): Izmeni fakturu, Dupliraj fakturu, Preuzmi PDF, Napravi ponavljajuću od ove, Storniraj fakturu.
- **Storniraj** (`Fak17`): "Stornirati fakturu 25/26-14? Stornirana faktura ostaje u istoriji, ali se ne računa u tvoj prihod. Ovo ne može da se vrati." Kvačica "Obavesti Acme Inc. mejlom o storniranju". Dugmad "Storniraj fakturu", "Odustani".
- Ako je faktura već plaćena (uplata u knjizi), storniranje zahteva dodatnu potvrdu da se uplata uklanja iz prihoda, ili vodi na proceduru povraćaja (AI objašnjava u chatu, Ak4: povraćaj zbog pogrešne fakture znači storno plus nova faktura). [PREDLOG: blokirati storno plaćene fakture i ponuditi vodič]
- Izmena već poslate fakture: dozvoljena samo uz upozorenje da klijent ima staru verziju. [PREDLOG]
- Dupliranje pravi novi nacrt sa novim brojem i današnjim datumom.

### 6.10 Pretplata: od probnog perioda do plaćanja

1. 30 dana besplatno bez kartice. Na početnoj i u levom meniju stalno piše koliko dana je ostalo. Na dan 5 ("Još 5 dana besplatno") upozorenje na početnoj: "Probni period ističe za 5 dana, 20. novembra. Do tada sve radi. Posle toga AI knjigovođa se pauzira dok ne izabereš plan, a tvoji podaci ostaju sačuvani." sa dugmetom "Vidi planove".
2. **Izbor plana** (`Sub3`): jedan plan "Sve uključeno", cena po periodu: Mesečno 29 € (bez obaveze), 3 meseca 27 € mesečno (ukupno 81, štediš 6), 6 meseci 25 € (150, štediš 24), 12 meseci 23 € (276, štediš 72, "Najbolja cena"). Spisak šta je uključeno. Pregled desno: Plan, Period, Cena, Za plaćanje danas, datum sledeće naplate, "Otkažeš kad god želiš, do kraja plaćenog perioda sve radi".
3. **Plaćanje** (`Sub4`): tabovi **Kartica** i **QR kod**. Kartica: broj kartice, rok trajanja, kod na poleđini, ime na kartici, kvačica pristanka na automatsku obnovu ("Pristajem da se pretplata automatski obnavlja svakih 12 meseci sa ove kartice. Otkažem kad god želim."). Napomena: "Podatke o kartici obrađuje procesor plaćanja. Broj kartice ne čuvam." Dugme "Plati 276 €".
4. **3D Secure** (`Sub5`): "Potvrdi plaćanje u banci. Otvori aplikaciju svoje banke i potvrdi uplatu od 276 €. Ne zatvaraj ovaj prozor. Čekam potvrdu, još 02:00." Dugme "Odustani od plaćanja".
5. **Odbijeno** (`Sub6`): "Banka je odbila plaćanje. Proveri datum isteka i kod na poleđini kartice, pa pokušaj ponovo. Ako se ponovi, pozovi svoju banku ili plati preko QR koda." Dugme "Pokušaj ponovo".
6. **QR kod** (`Sub7`): "Skeniraj QR kod. Čekam uplatu." Prikazuje primaoca, račun, iznos u dinarima po srednjem kursu NBS na današnji dan (32.347,20 din), poziv na broj, svrhu "Pretplata 12 meseci". Dugmad "Sačuvaj QR kod", "Kopiraj sve podatke", "Prebaci na karticu". Napomena: ne moraš da osvežavaš stranicu, javim čim uplata stigne. Za QR uplatu pretplata se ne obnavlja sama: tri dana pre isteka stiže novi QR kod.
7. **Uspeh** (`Sub8`): "Pretplata je aktivna. Uplata je potvrđena. AI knjigovođa nastavlja da radi tamo gde je stao." Plan, Period, Plaćeno, Sledeća naplata. Dugmad "Preuzmi račun (PDF)", "Idi na početnu".
8. **Upravljanje** (`Sub9`): status Aktivna, plan, period, sledeća naplata, "Promeni period", "Otkaži pretplatu", način plaćanja (kartica •••• 4417, "Promeni karticu", "Plati preko QR koda"), istorija plaćanja sa računima.
9. **Otkazivanje** (`Sub10`): "Otkaži pretplatu? Pretplata ostaje aktivna do 15. novembra 2027. Posle toga se AI knjigovođa pauzira, a ti i dalje vidiš i izvoziš sve svoje podatke." Neobavezno "Šta nije bilo dobro?" (Preskupo je, Ne koristim dovoljno, Prelazim na knjigovođu, Nešto drugo). Dugmad "Zadrži pretplatu" (primarno) i potvrda otkazivanja.
10. **Neuspela obnova** (`Sub11`): "Naplata od 276 € nije prošla. Pokušaću ponovo za 3 dana, do tada sve radi. Možeš i odmah da platiš drugom karticom ili preko QR koda." Dugmad "Pokušaj ponovo", "Plati drugom karticom".
11. **Istekao probni** (`Sub2`): "Probni period je istekao 20. novembra. AI knjigovođa je pauziran. Izaberi plan da nastavi."

Plaćanje i obnovu obrađuje procesor plaćanja (npr. Stripe ili domaći ekvivalent koji podržava EUR kartice i IPS za dinarski QR). Konačan izbor procesora ostaje Claude Code-u uz Stefanovu potvrdu, vidi 9.

### 6.11 Pitanje AI knjigovođi

1. Ulaz: stavka "AI knjigovođa" u meniju ili brzi panel na bilo kom ekranu. Početak (`Ak1`): "Zdravo Stefane, šta da radimo? Znam tvoje fakture, uplate i rokove. Pitaj me bilo šta o poslovanju." sa predloženim pitanjima u tri grupe: Moji brojevi (Koliko sam zaradio ove godine? Ko mi duguje novac?), Rokovi i porez (Šta moram da platim sledeće? Napravi fakturu za Acme, Pošalji podsetnik za kasne fakture), Propisi (Da li prijavljujem priliv iz inostranstva? Šta ako pređem limit?).
2. Odgovori su četiri vrste: (a) sa podacima korisnika (`Ak2`, uz dugmad "Otvori Knjigu prihoda", "Pogledaj kalendar" i napomenu odakle su brojevi), (b) o propisu sa izvorima (`Ak3`: izvori sa datumom važenja), (c) nejasan slučaj po scenarijima uz preporuku (`Ak4`), (d) radnja uz potvrdu (`Ak5`, nacrt fakture sa dugmadima "Napravi fakturu", "Izmeni", "Odbaci").
3. Pitanja van teme (`Ak6`) AI ljubazno odbija i vraća na teme sa predlozima.
4. Prilozi (`Ak7`): korisnik može da priloži PDF izvod, AI ga čita i prikazuje šta je već u knjizi, a šta ne, sa dugmadima "Dodaj u knjigu prihoda", "Poveži sa fakturom".
5. Istorija radnji (`Ak8`): "Šta sam radio" panel prikazuje sve radnje u ime korisnika sa vremenom, a povratne imaju "Vrati".
6. AI se javlja prvi (`Ak11`): kad korisnik otvori chat posle odsustva, AI kaže "Zdravo Stefane. Dok te nije bilo, primetio sam tri stvari" sa karticama (uplata bez fakture, faktura kasni, rok za porez) i dugmadima za akciju.
7. Stanja: radi (`Ak12`, koraci progresa), greška (`Ak13`, "Veza je pukla pre nego što sam završio... Pokušaj ponovo, Javi problem"), kvota potrošena (`Ak14`: probni period 20 poruka dnevno, nove stižu u 00:00), ocena odgovora (`Ak15`: Korisno ili Nije korisno, uz razloge: Netačan podatak, Nejasno objašnjenje, Nedostaje izvor, Nije ono što sam pitao, Drugo, komentar).
8. Upravljanje razgovorima (`Ak10`, `Ak16`, `Ak17`): lista prethodnih po datumu, pretraga, meni razgovora (Preimenuj, Kopiraj razgovor, Izvezi kao PDF, Obriši razgovor), potvrda brisanja ("Razgovor se trajno briše. Tvoje fakture i knjiga prihoda ostaju netaknute.").

### 6.12 Brisanje naloga i izvoz podataka

1. **Izvoz** (Podešavanja, Povezivanje, "Izvoz podataka: Sve fakture, prihode i dokumenta u jednom paketu", "Preuzmi"). Paket: ZIP sa PDF fakturama, CSV knjige prihoda, dokumentima za banku, rešenjem. Priprema može da traje, korisnik dobija mejl sa linkom kad je spreman. Knjiga prihoda ima i zaseban izvoz (7.9).
2. **Brisanje** (`Pd9`): "Izbrisati nalog? Brišu se fakture, knjiga prihoda, dokumenta i razgovori sa AI knjigovođom. Pre toga izvezi podatke, jer ovo ne može da se vrati." Korisnik mora da otkuca `IZBRISI` da bi se aktiviralo dugme "Trajno izbriši nalog". Aktivna pretplata se otkazuje. Posle brisanja stiže mejl potvrde. Zakonske obaveze čuvanja podataka (računovodstvene isprave) proverava Claude Code sa Stefanom pre implementacije [PROVERITI].

---

## 7. Ekrani: sve što postoji na svakom ekranu

Format: čemu služi, raspored, elementi (sa dugmadima), ponašanje, stanja. Tokovi iz odeljka 6 se ne ponavljaju, nego se pominju.

### 7.1 Prijava, registracija i greške

**Raspored:** centrirana kartica na Kost pozadini, znak i naziv gore, podnožje "© 2026 tvoj AI knjigovođa | Uslovi | Privatnost | Pomoć". Gore desno link za prebacivanje ("Nemaš nalog? Registruj se" / "Već imaš nalog? Prijavi se"). Tabovi "Prijava" i "Registracija".

**Prijava** (`PrijavaD8`, `PrijavaP1`): naslov "Dobro došao nazad", opis "Prijavi se u svoj nalog.". Elementi: dugme "Nastavi sa Google nalogom", razdelnik "ili", polje E-mail, polje Lozinka (sa prikaži/sakrij), link "Zaboravljena lozinka?", primarno dugme "Prijavi se", sekundarno "Pošalji mi link za prijavu" (magic link).

Stanja prijave:
- Prazno polja validacija (`PrijavaL2`): "Unesi e-mail adresu", "Unesi lozinku".
- Učitavanje (`PrijavaL3`): dugme "Prijavljivanje...".
- Pogrešni podaci (`PrijavaL1`): "Pogrešan e-mail ili lozinka. Pokušaj ponovo ili resetuj lozinku." Poruka je ista bez obzira da li e-mail postoji (ne otkrivati postojanje naloga).
- Zaključan nalog (`PrijavaL4`): posle 5 uzastopnih neuspešnih pokušaja [PREDLOG: broj] "Nalog je privremeno zaključan. Previše neuspešnih pokušaja prijave. Pokušaj ponovo za 15 minuta ili resetuj lozinku." Dugmad "Resetuj lozinku", "Nazad na prijavu".
- Google greška (`PrijavaG1`): "Prijava preko Google naloga nije uspela. Pokušaj ponovo ili se prijavi mejlom."
- Magic link poslat (`PrijavaM1`): "Proveri mejl. Poslali smo ti link za prijavu na stefan@firma.rs. Važi 15 minuta." Dugmad "Otvori mejl", "Nije stigao? Proveri spam ili pošalji ponovo", "Nazad na prijavu".
- Link istekao ili iskorišćen (`PrijavaE1`): "Link je istekao. Ovaj link više ne važi jer je istekao ili je već iskorišćen. Pošalji novi i pokušaj ponovo." Dugmad "Pošalji novi link", "Nazad na prijavu". Magic link je jednokratan.
- Dvostepena prijava: ako je uključena, posle lozinke se traži šestocifreni kod iz aplikacije za overu. [PREDLOG, ekran nije nacrtan]

**Registracija** (`PrijavaReg`, `PrijavaR1` do `R3`): naslov "Napravi nalog", "Prvih 30 dana je besplatno.". Polja: Ime i prezime, E-mail, Lozinka (min 8 karaktera, jedno veliko slovo, jedan broj), kvačica "Prihvatam Uslove korišćenja i Politiku privatnosti" (linkovi). Dugme "Napravi nalog". Napomena "Prvih 30 dana je besplatno. Bez obaveze."
- Validacije (`R2`): "Unesi ime i prezime", "Unesi ispravnu e-mail adresu", "Lozinka mora imati najmanje 8 karaktera", "Moraš da prihvatiš uslove da bi nastavio".
- Postojeći e-mail (`R1`): "Nalog sa ovim e-mailom već postoji. Prijavi se ili resetuj lozinku."
- Učitavanje (`R3`): "Pravim nalog...".
- Posle uspeha: ekran "Potvrdi e-mail" (`PrijavaV1`) pa "E-mail je potvrđen" (`PrijavaV2`).

**Zaboravljena lozinka** (`F1` do `F5`): unos e-maila ("Pošalji link"), potvrda "Proveri mejl... Važi 60 minuta.", nova lozinka (dva polja, tri pravila vidljiva uz polje, "Lozinke se ne poklapaju"), uspeh "Lozinka je promenjena. Sada se možeš prijaviti novom lozinkom." Reset link važi 60 minuta i jednokratan je. Posle promene lozinke odjavljuju se sve ostale sesije.

**Greške cele stranice:**
- 404 (`Err1`): "Ove stranice nema. Link je možda star ili je stranica premeštena. Tvoji podaci su na svom mestu." Dugmad "Nazad na početnu", "Pitaj AI knjigovođu".
- Offline (`Err2`): "Nema veze sa internetom. Tvoji podaci su sigurni. Pokušaj ponovo čim se veza vrati, a ništa što si upisao nije izgubljeno." Dugme "Pokušaj ponovo". Zahteva da forme čuvaju nesačuvane unose lokalno [PREDLOG].
- 500 i ostale greške servera: ista struktura (naslov, jedna rečenica šta da radi, dugme), bez tehničkih detalja.

**Sesije:** sesija traje 30 dana uz klizno produžavanje [PREDLOG]. Odjava "Odjavi se" (levi meni, dole). Podešavanja, Bezbednost, prikazuju prijavljene uređaje sa "Odjavi".

### 7.2 Početna (kontrolna tabla)

**Namena:** odgovara na pitanja "da li je sve pod kontrolom?" i "šta čeka mene?" za deset sekundi.

**Raspored (desktop):** gore datum ("Nedelja, 15. novembar"), pozdrav "Dobro jutro, Stefane" (po dobu dana), rečenica stanja ("Jedna stvar čeka tebe. Rok za plaćanje je sutra." ili "Sve je pod kontrolom. Plaćanje poreza ide automatski iz banke."). Zatim:

1. **Kartica "Počni ovde"** (samo dok onboarding nije gotov, vidi 6.1) ili baner stanja (probni period, pretplata, rešenje nedostaje: "Još samo rešenje Poreske uprave i sve je spremno." sa dugmetom "Dodaj rešenje Poreske uprave").
2. **Limit prihoda:** "Prihod u poslednjih 12 meseci: 3.840.000 od 6.000.000 din", traka napretka, "Do limita ostaje 2.160.000 din", projekcija "Po tvom tempu limit ne prelaziš ove godine" (ili upozorenje, vidi dalje). Kad nema prihoda: 0 i "Pratim od prve uplate". "?" ikonica objašnjava (Tip1).
3. **Čeka tebe** (broj u značci): lista stavki koje traže odluku, svaka sa jednim dugmetom:
   - "Uplata od Northwind Ltd. Za fakturu 2024-017?" dugme "Potvrdi" (potvrda pariranja)
   - "Obrazac za banku. Spreman, pregledaj pa pošalji" dugme "Pregledaj"
   - ostale vrste: faktura nacrt za ponavljajuću, kasna faktura sa predlogom podsetnika, uplata bez fakture, rok za porez.
   Prazno stanje: "Nema ničega što čeka tebe." Redosled: prvo najhitnije (rokovi), pa novac, pa ostalo.
4. **Poslednje uplate** (sa linkom "Sve uplate" prema Knjizi prihoda): avatar sa inicijalom klijenta, naziv, "Faktura 2024-015 · Danas, 09:12", iznos u valuti i u dinarima. Prazno: "Još nema uplata. Čim stigne prva, upisujem je ovde".
5. **Nadolazeći rokovi:** datumska pločica ("NOV 16"), naziv ("Akontacija za oktobar"), iznos i oznaka "Treba platiti" sa dugmetom "Plati" ili "Automatski iz banke" kad su trajni nalozi, ili "za 30 dana" za udaljene rokove.
6. **Upozorenje limita** (pojavljuje se po potrebi): pri 80% ("Približavaš se limitu za paušalce. Do 6.000.000 din ti je ostalo 980.000 din. Kad ga pređeš, gubiš pravo na paušalno oporezivanje, pa te upozoravam unapred.", vidi `Kp7`), pri 100% jače upozorenje sa objašnjenjem šta sledi i dugmetom "Pitaj AI knjigovođu".

**Stanja početne:** novi nalog (Poc), nalog sa svim podešenim (Dash4_ima), bez rešenja (Dash4_norez), automatsko plaćanje (Dash4_auto), pritisak zbog limita (Dash4_press), probni period ističe (`Sub1`), istekao (`Sub2`), pretplata QR (`Sub12`), vodič (Tur), tooltipovi (Tip).

**Brzi AI:** plutajuće dugme dole desno.

### 7.3 Fakture: lista

**Namena:** sve fakture u svim valutama, filtriranje, brzo delovanje.

**Elementi:**
- Naslov "Fakture", opis "Sve tvoje fakture na jednom mestu, u svim valutama.", dugme "Nova faktura".
- Tabovi: **Fakture** (broj), **Klijenti** (broj), **Ponavljajuće** (broj).
- Tri pregledne kartice: "Čeka naplatu" (zbir po valutama, broj faktura), "Kasni" (zbir, "1 faktura, Northwind Ltd."), "Naplaćeno u poslednjih 30 dana" (zbir po valutama).
- Filter čipovi sa brojem: Sve, Nacrti, Poslate, Kasne, Plaćene, Stornirane. Padajući: Sve valute, Poslednjih 90 dana (30, 90, godina, sve).
- Tabela: Broj, Klijent, Datum, Rok, Iznos, Status. Nacrt prikazuje "Nije poslata" u koloni rok. Status značke: Nacrt (siva), Poslata (plava), Kasni (crvena sa brojem dana), Plaćena (zelena), Stornirana (siva sa precrtavanjem).
- Klik na red otvara pregled fakture (7.5). Meni po redu (⋯): Otvori, Dupliraj, Preuzmi PDF, Pošalji ponovo, Označi kao plaćenu, Storniraj. Nacrt: Nastavi uređivanje, Obriši.
- Sortiranje po koloni, paginacija ili beskonačno skrolovanje (50 po strani) [PREDLOG].

**Prazno** (`Fak2`): "Još nemaš nijednu fakturu. Napravi prvu i ja se brinem za ostalo." sa tri koraka (Izabereš klijenta i valutu, Ja popunjavam broj, datum i podatke o tvojoj firmi, Pregledaš i šalješ klijentu jednim klikom) i dugmetom "Napravi prvu fakturu".

**Telefon:** lista kartica, filteri su horizontalni čipovi, FAB "+" u donjoj traci.

### 7.4 Nova faktura i uređivanje

**Raspored:** pun ekran (preko aplikacije) sa dve kolone: levo forma, desno **Pregled uživo** fakture u izabranom šablonu. Gore: "Zatvori", status "Nacrt, nije sačuvano". Telefon: forma pa dugme "Pregled" koje otvara pregled preko celog ekrana.

**Polja forme (redom):**
1. **Klijent**: padajući sa pretragom (`Fak5`: naziv, mejl, kratka oznaka podrazumevane stavke ili "Iznos upisuješ na fakturi", oznaka "Dinarski klijent"), "+ Novi klijent". Posle izbora: "Šaljem na billing@acme.com" sa "Izmeni". Pri izboru postojećeg klijenta: poruka "Popunjeno iz profila klijenta..." i "Izmeni profil".
2. **Valuta**: EUR, USD, RSD (segmentirano). Dodatne valute iz Podešavanja, Računi. Menja račun za uplatu i format iznosa.
3. **Jezik fakture**: Srpski, Engleski. Menja sve fiksne nazive u dokumentu ("DATE", "INVOICE No", "TOTAL AMOUNT" u engleskom, "DATUM", "FAKTURA br.", "Kupac", "Izdavalac" u srpskom).
4. **Broj**: automatski ("25/26-15"), može da se promeni uz proveru jedinstvenosti.
5. **Datum izdavanja**: danas po podrazumevanom.
6. **Rok**: broj dana (3, 7, 15, 30, drugi), prikazuje izračunat datum.
7. **Stavke**: tabela Opis, Kol., Cena, Iznos, "+ Dodaj stavku", brisanje stavke. Iznos je izveden. Količina podrazumevano 1.
8. **PDV**: red "PDV (nisam u sistemu PDV)" sa 0. Nije menjivo.
9. **Ukupno**.
10. **Račun za uplatu**: podrazumevani račun za valutu fakture, izbor drugog računa iz liste. Dinarska faktura (`Fak20`, srpski jezik, klijent Marko Petrović PR) dodaje **Poziv na broj** ("97 25/26-11") [PREDLOG: model 97 sa brojem fakture], a dokument koristi srpske nazive (DATUM, FAKTURA br., Kupac, Izdavalac, Matični broj, PIB, Podaci za uplatu, OPIS, IZNOS RSD).
11. **Napomena**: tekst, podrazumevano "Hvala na saradnji" (iz šablona).
12. Dugmad: "Sačuvaj nacrt", "Pregledaj i pošalji", "Promeni izgled fakture" (otvara editor šablona 7.6).

**Novi klijent** (`Fak4`, modal): sekcija "Podaci o klijentu": Naziv klijenta, Mejl za fakture ("Fakture šaljem na ovu adresu."), Država, PIB ili VAT (neobavezno), Adresa. Sekcija "Podrazumevano za fakture ovom klijentu" ("Kad izabereš klijenta, ovo se popuni samo. Na svakoj fakturi možeš da promeniš."): Valuta, Jezik fakture, Rok plaćanja, Račun za uplatu, Podrazumevana stavka (nije obavezno: Opis i Cena; "Ako klijent uvek plaća isto. Ako se iznos menja, ostavi prazno i upisaću ga na fakturi."). Dugmad "Odustani", "Sačuvaj klijenta" (vraća na fakturu sa izabranim novim klijentom).

**Dijalog pri zatvaranju** (`Fak10`): "Sačuvati kao nacrt? Ova faktura još nije poslata. Mogu da je sačuvam kao nacrt, pa nastaviš kad ti odgovara." Dugmad "Sačuvaj nacrt", "Odbaci fakturu", "Nastavi izmene".

**Validacija** (`Fak19`): crveni baner "Još dva polja treba da popuniš pre slanja", polja označena, poruke uz polja. Dugme "Pregledaj i pošalji" ostaje aktivno i vodi na prvu grešku [PREDLOG].

**Automatsko čuvanje:** nacrt se automatski čuva lokalno i na serveru svakih nekoliko sekundi. Status "Nacrt, sačuvano u 16:52".

**Brojanje:** broj fakture se rezerviše tek pri slanju ili čuvanju nacrta, ne pri otvaranju forme [PREDLOG]. Za format vidi 8.2.

### 7.5 Pregled fakture

Raspored: breadcrumb "Fakture / 25/26-14", naslov "Faktura 25/26-14" sa statusom, rezime "Acme Inc., 1.200,00 €". Akcije u zavisnosti od statusa:
- **Poslata:** "Pošalji ponovo", "Označi kao plaćenu", meni ⋯ (`Fak16`).
- **Kasni:** "Označi kao plaćenu", "Pošalji podsetnik", baner "Klijent kasni 6 dana. Rok je istekao 09.11.2026. Mogu da mu pošaljem ljubazan podsetnik." (`Fak22`).
- **Plaćena:** "Preuzmi PDF", "Pošalji ponovo", u uplati: "Uplata je stigla 02.11.2026 i povezana sam je sa ovom fakturom. Našao sam je u mejlu banke. Vidi mejl banke" (`Fak21`).
- **Nacrt:** "Nastavi uređivanje", "Obriši".
- **Stornirana:** samo čitanje, prikaz "Stornirana" sa datumom i razlogom.

Sekcije: **Detalji** (Klijent sa mejlom, Iznos, Izdata, Rok za uplatu, Račun za uplatu), **Istorija** (vremenska linija: Napravljena, Poslata na mejl, Čeka uplatu ili Rok je istekao, Plaćena), **Uplata** (status uplate ili objašnjenje: "Uplata još nije stigla. Čim banka pošalje mejl, povezaću je sa ovom fakturom." za poslate, "Svakog dana proveravam mejlove banke." za kasne), **Kako je klijent vidi** (PDF pregled sa dugmetom "Preuzmi PDF").

Telefon: isti sadržaj u jednoj koloni, akcije u sticky traci.

### 7.6 Klijenti, Ponavljajuće i editor šablona

**Klijenti** (`Fak6`, `Fak7`, `Fak28`): tab sa listom, pretraga "Traži klijenta po imenu ili mejlu", dugme "Novi klijent". Tabela: Klijent (naziv i mejl), Država, Podrazumevano (valuta, jezik, rok), Podrazumevana stavka, Poslednja faktura. Klijent bez faktura: "Nema faktura". Klik otvara bočni panel **Uredi klijenta** (`Fak7`, `Fak28`): Podaci o klijentu (naziv, mejl za fakture, država, adresa), Podrazumevano (valuta, jezik, rok, račun, podrazumevana stavka sa iznosom ili "Iznos se upisuje na fakturi"), sekcija **Mejlovi banke za ovog klijenta** (vidi 7.7), "Obriši klijenta" (samo ako nema faktura, inače "Arhiviraj" [PREDLOG]), "Odustani", "Sačuvaj izmene".

**Ponavljajuće** (`Fak13`, `Fak14`): vidi 6.8.

**Editor šablona fakture** (`Fak18`, `Fak24` do `Fak27`):
- Pun ekran: gore "Zatvori", "Šablon: Moj izgled", "Izmene nisu sačuvane", dugmad "Raspored", "Vrati na podrazumevano", "Sačuvaj šablon".
- **Levo "Blokovi"** (prevuci da promeniš redosled, uključi ili isključi): Logo, Datum, Broj fakture, Podaci o klijentu, Podaci o tvojoj firmi, Bankovni podaci, Tabela stavki, Ukupno, Rok plaćanja, Napomena, Potpis i pečat, "+ Dodaj blok".
- **Sredina:** platno sa fakturom (A4), zumiranje (− 100% +), prekidači Mreža, Vodilice, Primer podataka. Blokovi se prevlače slobodno po platnu, menja im se veličina. Toggle "Blok / Tabela / Cela faktura" bira nivo podešavanja.
- **Desno** panel prema izabranom nivou:
  - Blok (`Fak24`): Poravnanje (Levo, Sredina, Desno), Veličina teksta (Manji, Srednji, Veći), Boja teksta, Font, Pozicija X i Y, Širina, Visina, Pozadina bloka, Okvir oko bloka.
  - Tabela stavki (`Fak25`): Kolone koje se prikazuju (Opis, Količina, Jedinica mere, Cena, Popust, Iznos), Linije (Okvir, Horizontalne, Bez), Razmak redova (Gusto, Normalno, Prostrano), Naizmenična boja redova, Boja zaglavlja tabele.
  - Cela faktura (`Fak26`): Boja akcenta, Font naslova, Font teksta, Margine (Uske, Srednje, Široke), Traka u boji na vrhu, Vodeni žig, Tekst u podnožju, Veličina loga (Mali, Srednji, Veliki), Oblik loga (Kvadrat, Krug).
- **Raspored** dijalog (`Fak24`): "Izaberi raspored. Ovo je polazna tačka. Posle možeš sve da menjaš. Tvoji podaci i boje ostaju." Četiri rasporeda: Klasičan, Moderan (traka sa strane), Minimalan, Kompaktan (traka na vrhu). Napomena: "Kad primeniš novi raspored, blokove koje si ručno pomerio vraćam na njihova mesta." Dugmad "Odustani", "Primeni raspored".
- **Više šablona** (`Fak27`): padajući izbor šablona "Moj izgled (Podrazumevani)", "Srpski, dinarske fakture", "Domaći klijenti (RSD)", "Minimalan, engleski", "Klijenti u USD". Pravilo dodele: "Svi klijenti osim niže" ili po klijentu/valuti/jeziku. "+ Novi šablon", "Dupliraj ovaj šablon".
- Šablon se primenjuje i na PDF koji ide banci (faktura kao prilog) i na PDF u mejlu klijentu.
- Implementacija PDF-a mora biti istovetna u pregledu i u stvarnom fajlu (renderovanje na serveru iz iste definicije šablona). [PREDLOG: definisati šablon kao JSON strukturu sa pozicijama blokova]

### 7.7 Mejlovi banke

**Namena:** centralno mesto za ono što banka traži. AI pripremi, korisnik odobri.

**Lista** (`Mb1`): naslov "Mejlovi banke", opis "Banka mi šalje obrasce, ja ih popunim i vratim.", dugme "Podešavanja slanja". Kartica "Tvoja adresa za prijem" sa stanjem "Povezano, poslednji mejl pre 2 sata", adresom i linkom "Kako da javim banci". Tabovi sa brojem: **Sve, Čeka tebe, Obrađeno, Problemi**. Tabela: Mejl (tema, banka), Klijent i iznos, Vraćam na adresu, Status, Stiglo. Statusi: Čeka tvoje odobrenje, Poslato automatski, Poslato banci, Treba mi tvoja pomoć. Klik otvara detalj.

**Prazno i povezivanje** (`Mb2`): "Još nije stigao nijedan mejl banke. Da bih radio umesto tebe, banka treba da šalje obrasce i na moju adresu." Tri koraka: 1 Kopiraj svoju adresu, 2 Javi banci (gotov tekst "Poštovani, molim vas da sve obrasce i zahteve za devizne priliv šaljete i na adresu ... ", "Kopiraj tekst", ili podesi prosleđivanje u internet bankarstvu), 3 Čekaj prvi mejl.

**Detalj** (`Mb3`, `Mb6`, `Mb7`, `Mb10`, `Mb11`): naslov "Priliv 1.200,00 EUR", podnaslov sa klijentom i statusom, akcije "Odbaci", "Pregledaj dokumenta". Levo "Mejl banke" (originalni tekst, pošiljalac, vreme, prilozi), desno "Šta sam uradio" (pročitao, povezao, pripremio), pa **Istorija** (Poslato banci, Devize prodate sa vremenom). Za Poslato: "Otvori fakturu", "Na adresu ...".

**Pregled i odobrenje** (`Mb4`): "Nazad", status "Čeka tvoje odobrenje", "Odobri i pošalji banci". Polja Za, Naslov, Poruka, Prilozi, "Pošalji kopiju i meni", "Odloži". Tabovi dokumenata: Faktura, Raspored priliva, Prodaja deviza (prikaz PDF-a). Dokumenta mogu da se skinu. Ako su podaci pogrešni, korisnik može da uredi poruku, a ne dokumente [PREDLOG: izmena dokumenta kroz "Izmeni podatke" koji ih regeneriše].

**Podešavanja slanja** (`Mb8`, `Mb9`):
- **Šta radim kad stigne mejl banke:** (1) Tražim tvoje odobrenje (preporučeno), (2) Šaljem automatski, bez pitanja.
- **Izuzeci po klijentu:** lista klijenata sa prekidačem "Šaljem automatski" ili "Tražim odobrenje". Automatski izuzetak važi bez obzira na globalni izbor.
- **Devizni priliv: šta radim sa novcem:** (1) Samo proknjiži, ne prodaj, (2) Prodaj deo priliva (procenat ili iznos, "Koliko prodajem: 50 % priliva"), (3) Prodaj ceo priliv automatski. Napomena: kad se prodaje, banci šaljem i nalog za prodaju deviza. Kod dinarskog priliva nema prodaje.
- Ista podešavanja po klijentu (`Fak28`): "Kao u opštim podešavanjima / Uvek pitaj za odobrenje / Obradi sve automatski" i "Devizni priliv od ovog klijenta: Samo proknjiži / Prodaj deo po izboru / Prodaj sve automatski". Prodaja važi samo uz automatsku obradu.
- **Prvo podešavanje** (`Mb9`, "Kako da obrađujem mejlove banke?"): dijalog pri prvom mejlu sa izborom "Tražim tvoje odobrenje" ili "Sve radim sam i javim ti", pa izbor za devize. "Izaberi jednom, a možeš da promeniš kad god hoćeš."
- Adresa za prijem prikazana na dnu sa napomenom "Banka treba da šalje obrasce i na ovu adresu. Odgovaram na adresu koju banka napiše u mejlu."

**Pravila ekrana:** svaki mejl koji AI obradi automatski ostaje vidljiv sa tačnim tekstom koji je poslat. Korisnik uvek može da vidi šta je otišlo banci.

### 7.8 Porez i rokovi

**Namena:** sve o porezu i doprinosima paušalca na jednom mestu.

**Raspored** (`PorH`): naslov "Porez i rokovi", opis "Rešenje Poreske uprave, mesečne uplate i rokovi na jednom mestu.", tabovi **Sledeća uplata** i **Trajni nalozi**.
1. **Sledeća uplata:** pločica datuma, "Akontacija za oktobar", "22.929,60 din Treba platiti", "Plati". Napomena o roku ("Rok je 16. novembar, jer 15. pada u nedelju.").
2. **Rešenje:** "Resenje_2026.pdf, Dodato 12. novembra. Iznosi važe do novog rešenja, koje stiže u januaru." Dugmad "Pogledaj", "Dodaj novo rešenje".
3. **Mesečne obaveze** (iz rešenja za 2026): četiri stavke sa iznosima i ukupno mesečno.
4. **Rokovi:** lista narednih meseci (DEC 15 Akontacija za novembar, JAN ...).
5. **Plaćanje za mesec** (`Pay1` do `Pay3`): vidi 6.3.
6. Bez rešenja: prazno stanje sa "Dodaj rešenje Poreske uprave" (6.2), pregled mesečnih uplata nije dostupan, rokovi se ne računaju.
7. Novo rešenje: 6.2, korak 8.

**Pravila:** nikad se ne prikazuje iznos koji nije iz rešenja ili iz ručnog unosa korisnika. AI ne računa porez "napamet".

### 7.8a Napomena o godišnjem poreskom obračunu

Godišnja prijava (PPDG) i drugi godišnji poreski dokumenti nisu u prvoj verziji. Aplikacija priprema podatke i izvoz knjige prihoda koje korisnik može da priloži. [PREDLOG: kasnija faza]

### 7.9 Knjiga prihoda (KPO)

**Namena:** zakonska evidencija ostvarenog prometa po datumu uplate, plus stalan pregled limita.

**Raspored** (`Kp1`, `Kp2`): naslov "Knjiga prihoda", opis "Prihodi se vode po datumu uplate.", dugmad "Izvezi", "Dodaj prihod".

**Rezime kartice:** "Ukupan prihod u 2026.: 1.312.451,09 din", "21.9% limita od 6.000.000 din" sa trakom, "Ostalo 4.687.548,91 din". Dve manje kartice: "Devizni prihodi: 715.451,09 din, 5 uplata" i "Dinarski prihodi: 597.000,00 din, 5 uplata".

**Tabovi:** Devizni prihodi (broj), Dinarski prihodi (broj). Filteri: godina (2026, 2027...), Svi meseci, Svi klijenti.

**Devizna tabela** (`Kp1`): Uplata (datum), Klijent, Faktura (link), Iznos (u valuti), Kurs (NBS na dan uplate), U dinarima, Izvor (Mejl banke ili Ručno). Poslednji red "Ukupno devizni prihodi".
**Dinarska tabela** (`Kp2`): Uplata, Klijent, Faktura, Iznos u dinarima, Izvor. Poslednji red "Ukupno dinarski prihodi".

**Detalj uplate** (`Kp4`, bočni panel): "Prihod 15.11.2026. Uplata od Acme Inc.": datum uplate, faktura (link "Otvori"), "Mejl banke od 15.11. Otvori mejl", "Upisano u dinarima" po kursu, kurs i njegov izvor (NBS srednji kurs na dan), dugmad "Obriši prihod", izmena opisa.

**Ručni unos** (`Kp5`, "Dodaj prihod"): Vrsta prihoda (Dinarski, Devizni), Klijent, Datum uplate, Iznos, za devizni još Valuta i Kurs (AI predlaže kurs NBS za taj dan, korisnik može da promeni), Faktura (opciono, lista neplaćenih), Opis (nije obavezno, npr. "Gotovinska uplata, usluge dizajna"). Napomena "Kod deviznog prihoda tražim još valutu i kurs." Dugmad "Odustani", "Sačuvaj prihod". Ručni unos ima izvor "Ručno" i ulazi u limit.

**Izvoz** (`Kp6`, "Izvezi knjigu prihoda"): "Dobijaš dokument koji možeš da pošalješ knjigovođi ili priložiš uz prijavu." Izbor: Godina, Period (cela godina, kvartal, mesec), Format (PDF, XLSX, CSV). Dugme "Izvezi". Izvezeni dokument ima propisanu formu KPO knjige (vidi 8.6).

**Brisanje** (`Kp8`): "Obrisati prihod? Prihod od 1.200,00 € (Acme Inc., 15.11.2026) se uklanja iz knjige. Zbir i limit od 6.000.000 din se ponovo računaju." Faktura se vraća u status Poslata (ili Kasni). Dugmad "Obriši", "Odustani".

**Filteri** (`Kp9`): popunjeni filteri sa brojačima rezultata, "Očisti filtere".

**Prazno** (`Kp3`, nova godina): "Još nema prihoda u 2027. Čim stigne uplata, upisujem je ovde sam. Možeš i ručno da dodaš prihod koji ja ne vidim, na primer gotovinu." Limit 0 din, 0%.

**Blizu limita** (`Kp7`): baner "Približavaš se limitu za paušalce..." sa linkom "Vidi na stranici Porez i rokovi", crvena traka i kartica sa 83,7% limita.

**Uplata bez fakture** (`Kp10`): baner "Jedna uplata nema fakturu. Uplata od 1.250,00 € ne ulazi u zbir dok je ne povežeš sa fakturom." Link "Poveži u Mejlovima banke". U tabeli je red "Nepoznat pošiljalac | Bez fakture" sa zasivljenim iznosom. Ne ulazi u ukupno ni u limit dok se ne poveže.

**Pravila:** brisanje i izmena uplata se beleže u istoriji. Uplata iz stare godine ostaje u toj godini. Limit se računa iz poslednjih 12 meseci (klizno), ne iz kalendarske godine, osim ako Claude Code utvrdi drugačije [PROVERITI, vidi 8.4]. Na ekranu se prikazuje "Ukupan prihod u 2026." (kalendarska godina) i na početnoj "u poslednjih 12 meseci". Ova razlika mora da bude jasno označena u UI.

### 7.10 Uplata bez fakture (poseban tok)

Pogledaj 6.6. Ekran u Mejlovima banke (`Mb6`). Stanje je "Treba mi tvoja pomoć". Rešava se kroz tri opcije: napraviti fakturu, povezati sa postojećom, odbaciti. Dok nije rešeno: početna "Čeka tebe", knjiga prihoda baner (`Kp10`), AI chat objašnjenje (`Ak9`: "Zašto ova uplata nije u zbiru?"), AI proaktivno javljanje (`Ak11`).

### 7.11 Kalendar

**Namena:** rokovi za državu, fakture i ponavljajuće fakture na jednom mestu.

**Raspored** (`Kl1`): naslov "Kalendar", opis "Rokovi za državu, fakture i ponavljajuće fakture na jednom mestu.", dugmad "Podsetnici", "Dodaj događaj". Kontrole: navigacija meseca (strelice, "Novembar 2026"), "Danas", prebacivač **Mesec | Lista | Godina**, filter čipovi: Država, Dospeva, Kasni, Ponavljajuća (boje po tipu).

**Mesec:** mreža 7 kolona (Pon do Ned) sa događajima u ćelijama ("25/26-11 dospela", "Porez i doprinosi", "25/26-13 dospeva", "25/26-17 se šalje"). Danas je istaknut. Desno kartica: "1 faktura kasni" (Joam Technologies LLC, "25/26-11, kasni 12 dana", 441,28 $, "Pošalji podsetnik", "Otvori"), pa "Sledeći rokovi" sa listom (datum, naslov, iznos).

**Izabran dan** (`Kl2`): klik na dan otvara panel "Ponedeljak, 16. novembar, Sutra, 2 događaja" sa karticama događaja: Porez i doprinosi ("Za novembar, rok 16.11., 38.540,00 din", "Označi kao plaćeno", "Detalji"), faktura ("Northwind Ltd., 900,00 €, Pošalji podsetnik, Otvori fakturu"). Napomena o pomeranju roka: "Rok 15.11. pada u nedelju, zato je plaćanje do ponedeljka 16.11."

**Lista** (`Kl3`): čipovi Svi, Država, Kasne, redovi grupisani po datumu: "Kasni" prvo, pa "Sutra, 16.11." itd., svaki sa naslovom, tipom ("Plaćanje državi", "Ponavljajuća faktura se šalje", "Dospeva"), iznosom i dugmetom akcije ("Označi kao plaćeno", "Pošalji podsetnik", "Detalji").

**Detalj roka za državu** (`Kl4`): modal ili panel "Porez i doprinosi za novembar, 38.540,00 din, Rok 16.11.2026., Čeka plaćanje", Primalac "Poreska uprava", Račun, Poziv na broj, Svrha, QR blok "Plati preko mobilnog bankarstva. Skeniraj kod i uplatnica je popunjena.", dugmad "Zatvori", "Označi kao plaćeno". Napomena: u dizajnu je ovaj iznos "Porez i doprinosi za novembar" kao zbirni, a stvarne uplate su četiri stavke iz 6.3 [vidi 12, nedoslednost]. 
**Detalj kasne fakture** (`Kl5`): "Kasna faktura, Kasni 12 dana", sa podacima fakture i dugmadima "Pošalji podsetnik", "Otvori fakturu", "Označi kao plaćeno".

**Označi kao plaćeno** (`Kl6`): dijalog "Porez i doprinosi za novembar, 38.540,00 din. Rok prelazi u istoriju i podsetnik se gasi." Polje "Datum plaćanja" (podrazumevano danas), dugmad "Odustani", "Potvrdi".

**Podsetnici** (`Kl7`, "Kako te podsećam"): kanali: Obaveštenje u aplikaciji (zvonce i obaveštenje na telefonu), Mejl (na adresu naloga). Kada: "7 dana ranije" i "3 dana ranije" (za rokove prema državi), "Na dan roka" (ujutru u 09:00), "Kad faktura kasni" (svakih 7 dana dok se ne plati). Svaki je prekidač, mogu da se menjaju dani. Dugmad "Odustani", "Sačuvaj". Isti podaci se vide u Podešavanjima, Obaveštenja.

**Godina** (`Kl8`): 12 mini kartica meseci sa brojem događaja ("4 događaja", "sad" za tekući). Klik otvara mesec.
**Mesec bez događaja** (`Kl9`): "Nema rokova u ovom mesecu. Rokovi se pojave čim izdaš fakturu ili poveže uplata. Možeš i sam da dodaš događaj."

**Dodaj događaj:** naslov, datum, vreme (opciono), beleška, podsetnik. Ručni događaji su samo korisnikovi i ne utiču na druge ekrane.

**Pretplata na kalendar:** Podešavanja, Povezivanje daje privatni link (`tvojaiknjigovodja.rs/cal/<token>`) koji korisnik dodaje u Google ili Apple Kalendar (ICS feed). Token može da se regeneriše. Feed sadrži rokove za državu, rokove faktura i ponavljajuće. [ODLUČENO: "Rokovi i podsetnici u tvom Google ili Apple kalendaru"]

### 7.12 AI knjigovođa (chat)

Tokovi su u 6.11. Ovde su pravila i raspored.

**Raspored** (`Ak1` do `Ak17`): dvokolonski. Levo traka razgovora: "Novi razgovor", pretraga ("Pretraži razgovore"), grupe po datumu (Danas, Ovog meseca, Juče, Ranije), dugme "Šta sam radio" (istorija radnji). Desno razgovor: poruke, polje za unos "Pitaj o fakturama, prilivima, porezu...", dugme priloži (PDF izvod), pošalji. Ispod polja uvek stoji napomena: "Odgovaram samo o poslovanju. Za važne odluke proveri izvor, jer mogu da pogrešim."

**Vrste odgovora (komponente):**
1. **Tekst sa karticom podataka** (`Ak2`): rečenica, kartica sa brojem ("Do limita od 6.000.000 din: 4.687.548,91 din"), dugmad "Otvori Knjigu prihoda", "Pogledaj kalendar", napomena izvora brojeva.
2. **Odgovor o propisu** (`Ak3`): kratak odgovor plus "Izvori" (naziv propisa i godina/važi do). Odgovori o propisima se zasnivaju samo na proverenim izvorima (zakoni, uputstva Poreske uprave, mišljenja Ministarstva finansija).
3. **Odgovor po scenarijima** (`Ak4`): "Postupak zavisi od razloga, pa evo oba slučaja" sa karticama Slučaj 1, Slučaj 2, "Moja preporuka", izvori, i pitanje "Koji je tvoj slučaj?" sa čipovima izbora.
4. **Predložena radnja** (`Ak5`): kartica nacrta (npr. Faktura 25/26-15, Klijent, Stavka, Iznos, Rok), dugmad "Napravi fakturu" (izvršava), "Izmeni", "Odbaci". Ništa se ne izvršava bez klika.
5. **Odbijanje van teme** (`Ak6`): kratko ljubazno odbijanje i tri predloga.
6. **Analiza priloga** (`Ak7`): "Pročitao sam izvod. Dve uplate su već u tvojoj knjizi prihoda, a jednu nemam." sa tri reda (Već u knjizi, Već u knjizi, Nepoznata uplata) i dugmadima "Dodaj u knjigu prihoda", "Poveži sa fakturom". Priložen izvod ne ulazi u knjigu bez klika.
7. **Povratna informacija:** "Korisno | Nije korisno" ispod svakog odgovora, pa kratak upitnik (`Ak15`).

**Panel "Šta sam radio"** (`Ak8`): "Sve što sam uradio u tvoje ime. Ono što može da se vrati ima link Vrati." Stavke: Napravio nacrt fakture 25/26-15 (Danas, 16:52, Vrati), Poslao podsetnik, Poslao dokumenta banci, Označio porez kao plaćen. "Zatvori".

**Proaktivni AI** (`Ak11`): kad korisnik uđe u aplikaciju posle odsustva ili kad nastane važan događaj, AI otvara razgovor sa kratkim rezimeom ("Primetio sam tri stvari") i dugmadima. Traka razgovora pokazuje značku "Primetio sam tri stvari". Ne spamuje: najviše jedna proaktivna poruka dnevno [PREDLOG].

**Brzi panel** (`Ak9`, `PhAk9`): isti chat u panelu preko trenutnog ekrana, sa kontekstom ("Zašto ova uplata nije u zbiru?" kad je otvorena Knjiga prihoda). Dugme "Otvori ceo razgovor".

**Pravila ponašanja modela (ključno za prompt i evaluaciju):**
- Odgovara samo na teme paušalnog poslovanja u Srbiji: fakture, uplate, devizni prilivi, porez, doprinosi, rokovi, limit, propisi za paušalce, Poreska uprava, NBS kursevi, rad aplikacije.
- Brojke o korisniku uzima isključivo iz njegovih podataka (alat/funkcija za upit), nikad ne izmišlja. Ako podatak ne postoji, kaže da ga nema i nudi da ga doda.
- Za propise navodi izvor sa datumom važenja. Ako izvor ne može da pronađe, kaže koji deo ne može da potvrdi i preporučuje proveru (ali ne završava sa "nisam siguran", vidi 4.8: daje scenarije).
- Radnje (pravljenje fakture, slanje podsetnika, slanje banci, označavanje plaćenim) izvodi samo posle eksplicitnog klika korisnika na kartici radnje, i zapisuje u istoriju.
- Ne daje opštu pravnu ili poresku optimizaciju, ne savetuje izbegavanje poreza, ne komentariše teme van paušala (PDV, d.o.o.) osim da kaže da nije u opsegu i uputi na knjigovođu.
- Odbija da radi sa kreditnim karticama, lozinkama i pristupom bankama.
- Jezik odgovora prati jezik aplikacije korisnika (srpski latinica, ćirilica ili engleski).
- Kvota: probni period 20 poruka dnevno, plaćeni nalog bez dnevnog ograničenja (uz razumnu tehničku zaštitu od zloupotrebe).

**Izvoz razgovora:** "Izvezi kao PDF", "Kopiraj razgovor". Brisanje je trajno.

### 7.13 Podešavanja

Uvod: "Podaci o firmi, računi, obaveštenja i bezbednost naloga." Pregled (`Pd0`) je lista kartica koje vode u sedam tabova (na telefonu je to lista pa detalj). Opisi kartica: Profil i firma (Podaci koji idu na fakture), Računi (Dinarski i devizni računi), Pretplata (Plan i naplata), Obaveštenja (Šta i kako te obaveštavam), Povezivanje (Mejl banke, kalendar, izvoz), Bezbednost i nalog (Lozinka i prijava), Jezik i izgled (Jezik, formati, tema). Naslov prikazuje i "Stephortless PR, paušalac od 14.03.2024."

**Profil i firma** (`Pd1`): "Ovi podaci idu na tvoje fakture i izveštaje. Menjaš ih bez ponovnog podešavanja." Polja: Naziv firme, Ime i prezime vlasnika, PIB (9 cifara), Matični broj (8 cifara), Datum registracije, Adresa, Šifra delatnosti, Kontakt mejl, Telefon. Logo. Dugmad "Odustani", "Sačuvaj izmene". Promena PIB-a ili naziva upozorava da se odnosi samo na buduće fakture, stare ostaju nepromenjene.

**Računi** (`Pd2`, `Pd10`): "Na fakturama se prikazuje račun koji odgovara valuti fakture." Kartice: Dinarski račun RSD (Za fakture, Banka, Broj računa), Devizni račun EUR (IBAN, SWIFT), "Izmeni", "Ukloni", "Dodaj račun". Dodavanje (`Pd10`): tip, Banka, Broj računa ili IBAN i SWIFT, **Valuta** (EUR, USD, GBP, CHF itd.), "Podrazumevani za fakture u ovoj valuti", "Odustani", "Sačuvaj račun". Bez ograničenja broja. Uklanjanje računa koji se koristi na nacrtima traži zamenu.

**Pretplata** (`Pd3`, kratak rezime): "Ukratko o tvom planu. Sve ostalo je u delu Pretplata." Kartice: Trenutni plan ("Još 23 dana besplatno. Ništa se ne naplaćuje dok ne izabereš plan."), Način plaćanja ("Nije dodat"), Sledeća naplata ("Nema, probni period"), Računi i fakture za pretplatu ("Pojaviće se ovde"). Dugme "Otvori Pretplatu".

**Obaveštenja** (`Pd4`): "Rokovi za državu uvek stižu u aplikaciji. Ovde biraš gde ti ih još šaljem." Tabela sa prekidačima po kanalu (Mejl, Push): Rokovi za porez (Podsetnik pre isteka roka), Kasne fakture (Kad faktura probije rok plaćanja), Novi mejl banke (Kad stigne priliv ili zahtev banke), AI je nešto primetio (Uplata bez fakture, blizu limita), Promena propisa (Kad se promeni nešto što te se tiče), Nedeljni pregled (Kratak rezime svakog ponedeljka). Obaveštenja u aplikaciji za rokove za državu ne mogu da se isključe.

**Povezivanje** (`Pd5`): (1) Mejlovi banke: status "Povezano", adresa za prijem sa "Kopiraj", link "Podešavanja slanja". (2) Kalendar: "Link za pretplatu na kalendar" sa "Kopiraj" i "Generiši novi". (3) Izvoz podataka: "Preuzmi".

**Bezbednost i nalog** (`Pd6`, `Pd8`, `Pd9`): "Lozinka, prijava i brisanje naloga." (1) Lozinka ("Poslednja promena pre 3 meseca", "Promeni"): dijalog `Pd8` sa poljima Trenutna lozinka, Nova lozinka, Ponovi novu lozinku, napomena "Najmanje 8 znakova. Posle promene ostajemo prijavljeni samo na ovom uređaju.", "Sačuvaj lozinku", "Odustani". (2) Dvostepena prijava (prekidač, kod iz aplikacije za overu pri prijavi). (3) Prijavljeni uređaji (lista: "Chrome, Beograd, Ovaj uređaj, aktivan sada, Trenutni", "iPhone, Beograd, Pre 2 dana, Odjavi"). (4) Brisanje naloga (6.12, `Pd9`).

**Jezik i izgled** (`Pd7`): Jezik (Srpski latinica, Srpski ćirilica, English), Format datuma (15.11.2026. ili 2026-11-15), Izgled (Svetli, Tamni, Kao na uređaju). Prikaz se menja odmah. "Sačuvaj izmene". Tamni izgled je kompletno nacrtan (tab "Platforma (app) - tamni izgled", frejmovi `Dk_*`).

### 7.14 Pretplata

Detaljno u 6.10. Ekrani: izbor plana (`Sub3`), plaćanje karticom (`Sub4`), 3DS (`Sub5`), odbijeno (`Sub6`), QR (`Sub7`), uspeh (`Sub8`), upravljanje (`Sub9`), otkazivanje (`Sub10`), neuspela naplata (`Sub11`), upozorenje pred istek (`Sub1`, `Sub12`), istekao (`Sub2`).

Dodatna pravila:
- Cena je prikazana u evrima, naplata karticom u evrima ili dinarskoj protivvrednosti po srednjem kursu NBS [PROVERITI sa procesorom plaćanja]. QR je u dinarima po srednjem kursu NBS na dan prikaza.
- Promena perioda i prelaz sa QR na karticu dozvoljeni su u svakom trenutku, razlika se obračunava proporcionalno [PREDLOG].
- Račun za pretplatu (PDF) izdaje firma koja naplaćuje ("Fakturica d.o.o." u dizajnu, PLACEHOLDER: pravno lice i podaci se definišu pre lansiranja). Račun mora da ispuni zakonske zahteve.
- Pre isteka: tri dana pre se šalje mejl i obaveštenje. Posle isteka: režim pauze (5.5).
- Pretplata ne ograničava broj faktura, klijenata ni uplata (jedan plan, sve uključeno).

### 7.15 Pomoćni ekrani i mobilni specifikum

- **Obaveštenja (zvonce):** panel sa listom, vidi 5.4.
- **Globalna pretraga:** vidi 5.4.
- **Vodič:** vidi 5.4.
- **Više (telefon):** sheet sa listom sekcija, profilom i "Odjavi se".
- **Telefon, posebnosti:** kamera za otpremanje rešenja (fotografija direktno), "Podeli" za PDF fakturu, QR kod za plaćanje otvara bankarsku aplikaciju preko deep linka ako je moguće [PREDLOG], povlačenje za osvežavanje liste, push obaveštenja (zahtevaju PWA ili nativnu aplikaciju, vidi 10).

---

## 8. Poslovna pravila (detaljno)

### 8.1 Statusi fakture i prelazi

| Iz | U | Okidač |
|---|---|---|
| (novo) | Nacrt | Korisnik sačuva nacrt, ili AI napravi nacrt (chat, ponavljajuća) |
| Nacrt | Poslata | Korisnik klikne "Pošalji fakturu" (mejl uspešno predat), ili automatsko slanje ponavljajuće |
| Poslata | Kasni | Automatski: danas je posle roka i nema uplate. Računa se dnevno, u 00:05 po vremenu Srbije |
| Poslata ili Kasni | Plaćena | Uplata povezana (iz mejla banke ili ručno "Označi kao plaćenu") |
| Plaćena | Poslata ili Kasni | Brisanje povezane uplate iz knjige prihoda |
| Poslata, Kasni, Nacrt | Stornirana | Storno potvrda (6.9). Nacrt može da se obriše umesto storno |
| Stornirana | (kraj) | Ne vraća se |

Kasni nije posebno pamćen status, nego izvedena vrednost (Poslata + rok prošao). Prikaz se ponaša kao poseban status. "Kasni N dana" se računa od dana posle roka.

### 8.2 Numeracija faktura

Format iz dizajna: `25/26-15`. Deo pre crtice je oznaka perioda ("25/26"), a posle crtice redni broj. [PROVERITI sa Stefanom značenje "25/26" i pravilo resetovanja rednog broja; do odluke: prefiks je podešavanje firme sa podrazumevanom vrednošću `GG/GG` po poslovnoj godini, a brojač se resetuje na 1 pri promeni prefiksa.]
- Brojevi su jedinstveni po firmi, bez rupa u nizu. Nacrt rezerviše broj tek kad se sačuva ili pošalje. Brisanje nacrta ne sme da napravi rupu: ako je nacrt imao broj, broj se vraća samo ako je poslednji u nizu.
- Stornirana faktura zadržava broj. Storno ne proizvodi novi broj (storno dokument nosi oznaku sa referencom).
- Korisnik može da promeni broj ručno (uz upozorenje da zakon traži redosled).

### 8.3 Kursevi

- Za devizne uplate koristi se **srednji kurs NBS na dan uplate** za valutu uplate. [PROVERITI da li zakon traži srednji kurs NBS ili kupovni kurs banke; dizajn koristi NBS.]
- Kurs se preuzima iz zvanične NBS liste i čuva uz svaku uplatu (nepromenljivo posle upisa, osim ručne izmene korisnika).
- Za dane bez objavljenog kursa (vikend, praznik) koristi se poslednji objavljeni kurs. [PROVERITI]
- Ručni unos devizne uplate: kurs se predlaže automatski, korisnik može da ga izmeni.
- Cena pretplate u dinarima po kursu NBS na dan prikaza QR koda.

### 8.4 Limit od 6.000.000 din

- Limit za paušalno oporezivanje se prati kao **zbir prihoda u poslednjih 12 meseci** (klizno) i prikazuje na početnoj, a u knjizi se pored toga vidi zbir za kalendarsku godinu. [PROVERITI sa zakonom: da li je merilo kalendarska godina ili klizno 12 meseci, i aktuelni iznos pragova za 2026/2027. Iznos mora biti podesiv u konfiguraciji, ne hardkodovan.]
- Uplate bez fakture ne ulaze (4.2, 7.10). Storno i obrisane uplate se oduzimaju.
- Praćenje: 80% (upozorenje), 90% (jače upozorenje), 100% i više (kritično, objašnjenje posledica i predlog da se razgovara sa AI knjigovođom ili ljudskim knjigovođom).
- Projekcija "po tvom tempu": linearna ekstrapolacija iz poslednjih 12 meseci. Ne obećava ništa ("Po tvom tempu limit ne prelaziš ove godine" je procena, ne garancija). Tekst projekcije se ne prikazuje ako je istorija kraća od 2 meseca [PREDLOG].
- Kad se limit pređe, aplikacija ne prekida rad, nego objašnjava šta sledi i beleži da je korisnik izašao iz paušalnog režima. Dalje poslovne knjige nisu u obimu.

### 8.5 Prodaja deviza

- Tri režima: samo proknjiži, prodaj deo (procenat ili fiksan iznos), prodaj sve. Podešava se globalno i po klijentu, klijent ima prednost.
- Nalog za prodaju deviza se priprema i šalje banci samo ako je izabrana prodaja (deo ili sve). Kod "samo proknjiži" ne priprema se nalog.
- Aplikacija ne izvršava prodaju. Ona samo priprema nalog koji banka izvršava. Kurs po kome banka proda je kurs banke. Knjiga prihoda koristi kurs NBS (8.3).
- Kod dinarskog priliva prodaja ne postoji.

### 8.6 Knjiga prihoda: sadržaj i izvoz

- Svaka stavka: redni broj, datum uplate, klijent, broj fakture, opis, iznos u valuti, kurs, iznos u dinarima, izvor. Devizni i dinarski prihodi se vode i prikazuju razdvojeno, a ukupno je zbir.
- Izvoz u formi propisane knjige (KPO) ili sličnoj; tačan obrazac proverava Claude Code sa aktuelnim propisima ([PROVERITI]). Izvoz PDF mora da bude pogodan za štampu i da ima zaglavlje (naziv firme, PIB, godina) i potpisno polje.
- Izmena ili brisanje stavke ostavlja trag (ko, kada, šta).

### 8.7 Rokovi za porez i doprinose

- Rok akontacije: 15. u mesecu za prethodni mesec. Ako je 15. neradni dan (vikend ili državni praznik u Srbiji), rok je sledeći radni dan. Kalendar državnih praznika se čuva u konfiguraciji i ažurira jednom godišnje.
- Mesečne obaveze su četiri stavke iz rešenja (porez, PIO, zdravstveno, nezaposlenost). Iznosi važe do novog rešenja.
- Račun primaoca i poziv na broj za svaku stavku se generišu po šemi Poreske uprave koristeći PIB korisnika i oznaku perioda. U dizajnu su primeri (`840-711122843-47`, `97 11-2026-0481`). [PROVERITI tačnu šemu računa (840-xxx), modele plaćanja, šifre plaćanja i oblikovanje poziva na broj. Ovo je ključni deo ispravnosti QR koda.] Alternativa je da rešenje samo sadrži te podatke i da se oni prepišu iz rešenja (preporučeno za prototip: čitati iz rešenja, ne računati).
- Svaka uplata ima status Neplaćeno ili Plaćeno, ručno označeno. Mesec je Plaćen kada su sve četiri stavke plaćene.
- QR: IPS QR NBS standard (verzija i polja po NBS specifikaciji): primalac, račun, iznos, šifra plaćanja, svrha, poziv na broj. QR se generiše na serveru ili klijentu, a ispravnost se proverava testnim skeniranjem u više bankarskih aplikacija.

### 8.8 Uparivanje uplate sa fakturom (algoritam)

1. Iz mejla banke izvuci: iznos, valutu, pošiljaoca (naziv), datum, referencu ako postoji.
2. Kandidati: fakture u statusu Poslata ili Kasni, ista valuta, isti iznos (tolerancija 0, osim ako je banka naplatila proviziju i iznos u mejlu je neto; tada uvek važi pravilo 4.2: pun iznos fakture je merilo, a razlika je upozorenje).
3. Ako je tačno jedan kandidat i naziv pošiljaoca se poklapa sa klijentom (približno poklapanje), uparivanje je pouzdano i automatsko.
4. Ako je tačno jedan kandidat, a naziv se ne poklapa, ide u "Čeka tebe" sa pitanjem "Za fakturu 25/26-14?" i dugmetom "Potvrdi" (primer: "Uplata od Northwind Ltd. Za fakturu 2024-017?").
5. Ako ima više kandidata ili nijedan, stanje je "Treba mi tvoja pomoć" (6.6).
6. Nakon potvrde pamti se pravilo klijent-pošiljalac (alias), da sledeći put bude automatski.
7. Svako automatsko uparivanje se beleži u istoriji uz obrazloženje ("Povezao sam uplatu sa fakturom 25/26-14").

### 8.9 Ponavljajuće fakture

- Generisanje: dnevni posao u 07:00 po vremenu Srbije proverava ponavljajuće sa datumom sledeće fakture jednakim danas. Ako je dan u mesecu veći od broja dana tog meseca (npr. 31.), koristi se poslednji dan meseca.
- Iznos: iz stavke, ili prazno ako klijent nema podrazumevanu cenu (tada obavezno traži odobrenje).
- Nakon slanja ili odobrenja, "Sledeća faktura" se pomera na sledeći period.
- Pauziranje i nastavak: pri nastavku ne nadoknađuju se propuštene fakture, nego počinje od sledećeg datuma.
- Datum završetka: posle njega se ponavljajuća arhivira.

### 8.10 Obaveštenja

- Događaji koji generišu obaveštenje: rok za porez (7, 3 dana ranije i na dan, podešivo), kasna faktura (na prvi dan, pa svakih 7 dana), novi mejl banke, AI primetio, promena propisa, nedeljni pregled (ponedeljkom 08:00), kraj probnog perioda, neuspela naplata.
- Kanali: aplikacija (obavezno za rokove), mejl, push. Podešavanje je po tipu i kanalu (7.13).
- Deduplikacija: isti događaj se ne šalje dvaput na istom kanalu. Tihi sati: bez push obaveštenja između 22:00 i 07:00 [PREDLOG].
- Svi mejlovi aplikacije imaju link za odjavu od neesencijalnih obaveštenja.

### 8.11 Kvote i zaštita

- AI poruke: probni period 20 dnevno; plaćeni bez ograničenja (tehničko ograničenje protiv zloupotrebe, npr. 200 dnevno, poruka "Previše poruka, pokušaj ponovo za sat vremena").
- Veličine: logo 2 MB, rešenje 20 MB, prilog u AI chatu 10 MB [PREDLOG], PDF fakture oko 100 KB.
- Brzina pokušaja prijave: 5 pokušaja pa zaključavanje 15 minuta.

---

## 9. Integracije i spoljni sistemi

| Sistem | Čemu služi | Napomena |
|---|---|---|
| Primanje mejlova (inbound email) | Adresa `<slug>-<kod>@prijem.tvojaiknjigovodja.rs` prima mejlove banke i prosleđena rešenja | Servis za dolazne mejlove (npr. Postmark Inbound, SES, Mailgun ili sopstveni SMTP). Kod u adresi je nasumičan da se adresa ne pogodi. Mejl se parsira (tekst, HTML, prilozi) |
| Slanje mejlova (outbound) | Mejlovi klijentima, banci, korisniku | Slanje u ime korisnika: Reply-To je korisnikov mejl, From je naš domen sa imenom korisnika ("Stefan Milosevic Stephortless via ..."). SPF, DKIM, DMARC obavezni. [PREDLOG: kasnije opcija slanja sa korisnikove adrese preko OAuth] |
| AI model (LLM) | Čitanje mejlova banke, čitanje rešenja (PDF ili slika), chat, pisanje poruka | Ulaz su podaci korisnika, nikad podaci drugih korisnika. Svi pozivi sa alatima (funkcije koje čitaju podatke korisnika i izvode radnje po potvrdi). Izlaz ima strukturu (JSON) gde se parsira. Evaluacioni skup pre lansiranja (vidi 11) |
| Čitanje dokumenta (OCR) | Rešenje Poreske uprave (PDF ili slika) | Multimodalni model ili OCR plus model. Rezultat uvek prolazi proveru korisnika (6.2, korak 4) i proveru PIB-a |
| NBS kursna lista | Kurs za devizne uplate i QR pretplate | Preuzimanje dnevno, keširanje, rezerva ako servis ne radi |
| Generisanje PDF | Fakture, raspored priliva, nalog za prodaju deviza, izvoz knjige | Serverski render iz definicije šablona (HTML u PDF). Dokumenta za banku imaju fiksan oblik koji korisnik ne menja |
| IPS QR | Plaćanje poreza i pretplate | Po NBS specifikaciji (8.7) |
| Procesor plaćanja | Kartice (3DS, automatska obnova), webhooks | Izabrati procesor koji radi sa srpskim pravnim licem i evro karticama (npr. Stripe ako je dostupan za firmu, ili domaći procesor). Aplikacija ne čuva broj kartice (samo token i poslednje četiri cifre) |
| Prijava preko Google naloga | OAuth | Samo osnovni profil (ime, e-mail). Ne traži se pristup Gmail-u |
| Push obaveštenja | Web push (PWA) ili nativno | Prototip: samo mejl i obaveštenja u aplikaciji. Push u sledećoj fazi |
| Kalendar (ICS) | Pretplata na rokove | Privatni token po korisniku, regeneracija |
| Analitika proizvoda | Merenje ključnih događaja | Bez osetljivih podataka (iznosi i nazivi klijenata se ne šalju) |

Kritično: aplikacija nikad ne traži ni jedan pristup bankovnom računu ni lozinku za e-banking (4.9).

---

## 10. Nefunkcionalni zahtevi i predlog tehnologije

### 10.1 Predlog (Claude Code može da promeni uz obrazloženje)

- **Frontend:** React sa TypeScript, Vite ili Next.js, Tailwind CSS sa tokenima iz dizajn sistema, komponentna biblioteka sopstvena (Button, Input, StatCard, StatusBadge, PrilivCard, Cover) prema `components/` iz dizajn sistema. Responzivno (390 px, 768 px, 1280 px i više). PWA.
- **Backend:** TypeScript (Node) ili Python, REST ili tRPC, red poslova (queue) za pozadinske zadatke (dolazni mejlovi, AI obrada, generisanje ponavljajućih, dnevni kursevi, obračun kasnih).
- **Baza:** PostgreSQL. Novac kao celobrojni (minor units) plus valuta. Sve tabele po korisniku (multi-tenant, jedna firma = jedan tenant), red-level pristup.
- **Fajlovi:** objektno skladište (PDF fakture, dokumenta, rešenja, prilozi).
- **Hosting:** Cloudflare (stranice, CDN, WAF, DNS) ili slično, aplikacija i baza u EU regionu. Konačna lokacija podataka i dobavljač se biraju u implementaciji (otvoreno pitanje, 12).
- **Auth:** e-mail i lozinka (hash Argon2 ili bcrypt), magic link, Google OAuth, TOTP dvostepena prijava, upravljanje sesijama.
- **i18n:** srpski (latinica kao izvorni), ćirilica (automatska transliteracija iz latinice u sloju prikaza), engleski.

### 10.2 Bezbednost

- Šifrovanje u prenosu (TLS) i u mirovanju. Osetljiva polja (IBAN, PIB) dodatno šifrovana na nivou polja [PREDLOG].
- Admin pristup bez čitanja finansijskih podataka korisnika (4.9). Pristup podršci samo uz privremeno, korisnikovo odobrenje.
- OWASP kontrole, CSP, zaštita od CSRF, ograničavanje brzine, validacija ulaza, bezbedan prijem priloga (skeniranje, ograničenje tipa i veličine).
- **Zaštita od prompt injection:** sadržaj mejlova banke, rešenja i priloga je nepoverljiv ulaz. AI nikad ne izvršava instrukcije iz tog sadržaja. Radnje koje šalju van aplikacije uvek prolaze potvrdu korisnika ili eksplicitnu automatizaciju koju je korisnik uključio, a primalac slanja se uzima iz mejla banke samo po pravilima iz 6.5 (adresa iz teksta mejla se prikazuje korisniku na odobrenje i, za automatsku obradu, proverava se da pripada domenu banke koju je korisnik povezao [PREDLOG: zaštita od preusmeravanja dokumenata na tuđu adresu]).
- Evidencija radnji (audit log) za sve izmene podataka i radnje AI.
- Rezervne kopije i plan oporavka. Brisanje naloga uklanja podatke u definisanom roku [PROVERITI zakonske rokove čuvanja].

### 10.3 Privatnost i usklađenost

- Zakon o zaštiti podataka o ličnosti (Srbija) i GDPR gde je primenljivo. Uslovi korišćenja i Politika privatnosti su stranice sajta (u izradi, sa placeholder podacima o pravnom licu). Aplikacija povezuje na njih u registraciji i podnožju.
- Aplikacija ne tvrdi da je ovlašćeni knjigovođa niti da zamenjuje poresku odgovornost. Tekst napomene u chatu ("Za važne odluke proveri izvor, jer mogu da pogrešim") ostaje. Pravni tekst uslova pišu pravnici.
- Logovanje: bez sadržaja finansijskih podataka u logovima.

### 10.4 Performanse i pouzdanost

- Početna se učitava za manje od 2 sekunde na prosečnoj vezi (skeleton odmah). AI odgovori streamuju.
- Pozadinski poslovi su idempotentni (ponovno pokretanje ne šalje dva puta mejl banci). Svaka poruka koja izlazi van aplikacije ima jedinstven ključ.
- Obrada dolaznog mejla banke traje do jednog minuta, obaveštenje korisniku stiže posle.

### 10.5 Pristupačnost

- Kontrast najmanje 4,5:1 (limeta nikad kao tekst na svetloj pozadini), fokus vidljiv, navigacija tastaturom, ARIA oznake, statusi nikad samo bojom nego i tekstom, dodirne površine 44 px.

### 10.6 Testiranje

- Jedinični testovi za poslovna pravila (limit, kursevi, rokovi, uparivanje, numeracija).
- Skup primera mejlova banke (devizni, dinarski, zahtev za dodatni dokument, nepoznat pošiljalac, više kandidata) za evaluaciju AI čitanja sa ciljem tačnosti pre uključivanja automatskog slanja.
- Skup rešenja Poreske uprave (PDF, fotografije, loš kvalitet) za čitanje.
- End-to-end scenariji iz odeljka 6 (svih 12 tokova).
- Provera QR kodova u više banaka.

---

## 11. Plan gradnje i definicija prototipa

### 11.1 Šta je prototip (cilj)

Prototip je radna aplikacija koja pokazuje vrednost kroz tri scenarija sa stvarnim podacima iz seed baze (Prilog B) i bez stvarnih spoljnih sistema gde to nije neophodno:

1. **Prvi dan:** registracija, onboarding, rešenje (čitanje uz proveru), prva faktura, početna sa limitom.
2. **Devizni priliv:** simulirani dolazni mejl banke, AI čitanje, uparivanje, dokumenta, odobrenje, knjiga prihoda, limit se menja.
3. **Porez i pretplata:** mesečno plaćanje QR kodom, kalendar, kraj probnog perioda, plaćanje.

Prototip ne mora da ima: stvarnu naplatu, push, produkciono slanje mejlova banci, dvostepenu prijavu. Mora da ima: sve ekrane i stanja iz odeljka 7 koja su u dizajnu, dostupne i na telefonu.

### 11.2 Predlog redosleda (faze)

1. **Temelj:** dizajn tokeni i komponente, raspored (levi meni, donja traka), i18n okvir, tema svetla i tamna, auth (registracija, prijava, reset, magic link, potvrda mejla), greške 404 i offline.
2. **Podaci i onboarding:** model podataka (3), onboarding 4 koraka, Podešavanja (Profil, Računi, Izgled), seed podaci.
3. **Fakture:** klijenti, nova faktura, pregled uživo, PDF, slanje mejlom, lista, pregled fakture, storno, dupliraj, šablon (osnovni, pa editor).
4. **Knjiga prihoda i limit:** ručni unos, izvoz, kursevi NBS, početna kartica limita i upozorenja.
5. **Mejlovi banke:** adresa za prijem, prijem i parsiranje mejla, AI čitanje, uparivanje, dokumenta za banku, odobrenje, slanje, problemi, podešavanja slanja.
6. **Porez i rokovi:** čitanje rešenja (uz proveru), ručni unos, mesečne uplate, QR, trajni nalozi, novo rešenje.
7. **Kalendar i obaveštenja:** događaji iz svih izvora, podsetnici, ICS, zvonce, mejlovi.
8. **AI knjigovođa:** chat sa alatima, odgovori sa izvorima, radnje sa potvrdom, istorija radnji, proaktivne poruke, brzi panel.
9. **Pretplata:** izbor plana, plaćanje karticom i QR (sandbox), upravljanje, režim pauze.
10. **Poliranje:** vodič, tooltipovi, prazna stanja, performanse, pristupačnost, telefon kroz sve ekrane, dvostepena prijava, push.

### 11.3 Kako se ovaj dokument dalje održava

Svaka promena proizvoda prolazi kroz razgovor sa Stefanom u glavnom chatu, koji piše prompt za Claude Code sa pozivanjem na odeljke i ID-jeve frejmova iz ovog dokumenta. Verzija dokumenta se podiže (1.1, 1.2) uz kratak spisak izmena na kraju.

---

## 12. Poznate nedoslednosti i otvorena pitanja

Dok se ne reši, primenjuje se navedeno podrazumevano pravilo.

| # | Tema | Šta se vidi u dizajnu | Podrazumevano pravilo |
|---|---|---|---|
| 1 | Tab "Promet i izvodi" | Odlučeno da postoji (dnevni dinarski izvodi), nije nacrtan. Izvod se danas prilaže kroz AI chat (`Ak7`) | U prototipu samo prilog u chatu. Poseban tab se dizajnira naknadno |
| 2 | Limit: kalendarska godina ili 12 meseci | Početna: "u poslednjih 12 meseci". Knjiga: "Ukupan prihod u 2026." | Oba se prikazuju sa jasnim oznakama (7.9). Zakonsko merilo proveriti (8.4) |
| 3 | Brojke u primerima | Početna 3.840.000 din (primer), Knjiga 1.312.451,09 din. Različiti demo podaci | Brojke u dizajnu su ilustrativne. Seed u Prilogu B koristi jedan konzistentan skup |
| 4 | Rok poreza: zbirna uplata i četiri uplate | Kalendar: "Porez i doprinosi za novembar, 38.540,00 din". Porez: 22.929,60 din ukupno u četiri stavke | Izvor istine je Porez i rokovi (četiri stavke iz rešenja). Kalendar prikazuje jedan događaj po mesecu sa zbirom iz rešenja i vodi na plaćanje |
| 5 | Naziv proizvoda | "tvoj AI knjigovođa" i "Fakturica" | Ime je konfiguracija (1.5) |
| 6 | Pravno lice naplate | "Fakturica d.o.o." na QR i računu | Placeholder, definisati pre lansiranja |
| 7 | Brojevi faktura | `25/26-15` ali i `2024-017` u delovima početne | Koristiti format iz 8.2. Primeri `2024-0xx` su zastareli tekst u nekim frejmovima |
| 8 | Podešavanja, Povezivanje | Adresa za prijem `stephortless@racuni...` u `Pd5`, `stefan-4k7q@prijem...` u drugim frejmovima | Format `<slug>-<kod>@prijem.tvojaiknjigovodja.rs` (3.1) |
| 9 | Dvostepena prijava | Prekidač postoji (`Pd6`), ekran za unos koda nije nacrtan | U prototipu opciono, kasnije dizajn |
| 10 | Brisanje klijenta sa fakturama | Dugme "Obriši klijenta" u panelu | Dozvoljeno samo bez faktura, inače arhiviranje |
| 11 | Podsetnik klijentu: automatski | Podsetnik se šalje ručno | V1 ručno, kasnije opcija automatskog |
| 12 | Trajni nalog i potvrda plaćanja | Aplikacija ne zna da li je plaćeno | Kad je izabran trajni nalog, mesec se automatski označava kao plaćen na dan roka uz upozorenje korisniku "ako nešto nije prošlo, javi mi" [PREDLOG, potvrditi sa Stefanom] |
| 13 | Podrška | "Podrška preko AI pomoći, pa preko ljudi" | V1: AI pomoć plus mejl podrške |
| 14 | Pravila banke | Dizajn pretpostavlja da banka šalje standardizovane mejlove (primer Erste Bank) | Parser mora da radi sa više banaka. U prototipu: skup primera. Stvarni mejlovi se skupljaju od korisnika |
| 15 | Lokacija podataka, dobavljač hostinga, procesor plaćanja | Nisu odlučeni | Claude Code predlaže sa obrazloženjem, Stefan potvrđuje |
| 16 | Kontrola naloga firme sa više korisnika (knjigovođa pristup) | Ne postoji | Van obima v1 |

---

## Prilog A: Mapa dizajn frejmova po sekcijama

Frejmovi se nalaze u Claude Design fajlu na tabovima "Platforma (app) - ...". Prefiks `Ph`, `Tel`, `MNav` označava telefonsku varijantu, `Dk_` tamnu temu.

| Sekcija | Frejmovi (desktop) | Opis |
|---|---|---|
| Prijava, registracija, greške | `PrijavaD8, P1, L1 do L4, G1, M1, E1, F1 do F5, Reg, R1 do R3, V1, V2, Err1, Err2` | Svi tokovi autentikacije i greške |
| Onboarding | `OnbO1 do OnbO12` | 4 koraka, validacije, učitavanje, preskakanje mejlova banke |
| Početna | `Poc1 do Poc6, Dash4_auto, Dash4_ima, Dash4_norez, Dash4_press, Tur0 do Tur4, Tip1, Tip2, GuideB` | Početno stanje, vodič, tooltipovi, stanja zavisna od podataka |
| Porez i rokovi | `PorH, PorNov, PorOk, Pay1 do Pay3, Rez2 do Rez6b` | Početna stranica, novo rešenje, uspeh, plaćanje, unos rešenja |
| Fakture | `Fak1 do Fak28` | Lista, prazno, nova faktura (varijante), klijenti, ponavljajuće, pregled, meni, storno, šablon editor, podsetnik |
| Mejlovi banke | `Mb1 do Mb12` | Lista, prazno i povezivanje, detalj, odobrenje, poslato, problemi, podešavanja, prvo podešavanje, dinarski, devizni, delimična prodaja |
| Knjiga prihoda | `Kp1 do Kp10` | Devizni, dinarski, prazno, detalj, ručni unos, izvoz, blizu limita, brisanje, filteri, uplata bez fakture |
| Kalendar | `Kl1 do Kl9` | Mesec, izabran dan, lista, detalji, plaćeno, podsetnici, godina, prazno |
| AI knjigovođa | `Ak1 do Ak17` | Chat, odgovori, radnje, istorija, brzi panel, proaktivno, greške, kvota, ocena, razgovori |
| Podešavanja | `Pd0 do Pd10` | Pregled i svih sedam tabova, promena lozinke, brisanje naloga, dodavanje računa |
| Pretplata | `Sub1 do Sub12` | Probni period, plan, plaćanje karticom i QR, 3DS, odbijeno, uspeh, upravljanje, otkazivanje, neuspela naplata |
| Telefon | `MNav*`, `Ph*`, `Tel*` (oko 160 frejmova) | Isti ekrani prilagođeni telefonu, navigacija |
| Tamna tema | `Dk_*` | Tamne varijante ekrana |

---

## Prilog B: Seed podaci za prototip (usklađeni, zamenjuju nedosledne primere iz dizajna)

**Korisnik:** Stefan Milošević, stefan@stephortless.com, +381 60 123 4567.
**Firma:** Stephortless PR, PIB 112233445, MB 66554433, šifra 6201 Računarsko programiranje, registrovana 14.03.2024., Bulevar kralja Aleksandra 12, Beograd.
**Računi:** Dinarski RSD 160-0000123456-78 (Banka Primer); Devizni EUR IBAN RS35 1600 0000 1234 5678 90, SWIFT BANKRSBG. Dodatni USD račun.
**Klijenti:** Acme Inc. (SAD, EUR, EN, rok 3 dana, stavka "Webflow development" 900 €), Northwind Ltd. (UK, EUR, EN, bez podrazumevane cene), Bluebird GmbH (Nemačka, EUR, EN, "Održavanje" 2.400 €), Joam Technologies LLC (SAD, USD, EN, "Maintenance" 441,28 $), Marko Petrović PR (Srbija, RSD, SR, rok 10 dana), Cloudly Inc. (SAD, USD, EN, bez faktura).
**Fakture (primer):** 25/26-10 Northwind 900 € plaćena 14.09.; 25/26-11 Joam 441,28 $ kasni; 25/26-12 Bluebird 2.400 € plaćena 02.11.; 25/26-13 Northwind 850 € kasni; 25/26-14 Acme 1.200 € poslata; nacrt Cloudly 2.100 $.
**Prihodi 2026 (devizni):** 05.08. Acme 1.200 € (kurs 117,25), 14.09. Northwind 900 € (117,30), 10.10. Joam 441,28 $ (107,10), 02.11. Bluebird 2.400 € (117,20), 15.11. Acme 1.200 € (117,20). **Dinarski:** 03.07. Pekara Zlatni Klas 45.000, 22.08. ..., 17.09. ..., 28.10. Mali Princ 96.000, 15.11. Studio Nova 180.000 (ukupno 597.000).
**Rešenje:** Porez 4.950,00; PIO 12.311,28; Zdravstveno 5.283,59; Nezaposlenost 384,73; ukupno 22.929,60 din mesečno.
**Mejlovi banke (za simulaciju):** priliv 1.200 € Acme (čeka odobrenje), 2.400 € Bluebird (poslato automatski), 1.250 € Delta Studio SRL (problem, nema fakture), 441,28 USD Joam (poslato), dinarski 180.000 RSD Studio Nova (poslato automatski), zahtev za dodatni dokument (potvrda o poreklu sredstava, rok 5 radnih dana).
**Stanje naloga:** probni period sa 23 dana, aplikacija u svim stanjima iz odeljka 5.5 dostupna preko prekidača u razvojnom meniju.

Tekstovi na ekranu koji nisu citirani ovde preuzimaju se iz dizajn frejmova (Prilog A).

---

*Kraj dokumenta. Verzija 1.0.*
