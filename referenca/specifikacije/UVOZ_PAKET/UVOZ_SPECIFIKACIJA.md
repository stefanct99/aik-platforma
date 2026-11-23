# Prenos dosadašnjeg poslovanja (uvoz prethodnih prihoda)

Dopuna glavne specifikacije (PLATFORMA_SPECIFIKACIJA.md). Oznake: [ODLUČENO] odluka vlasnika, [PREDLOG] moj predlog koji vlasnik nije potvrdio, [PROVERITI] otvoreno pitanje, [IZ DIZAJNA] preuzeto iz frejmova.

## 1. Zašto ovo postoji

Većina korisnika neće početi 1. januara. Doći će u martu, aprilu ili kasnije, kad već imaju prihode, fakture i knjigovođu koji je do tada vodio sve. Bez prenosa istorije aplikacija bi pokazivala pogrešne brojke, i to opasno:

- **Limit od 6.000.000 din** bi pokazivao premalo prihoda, pa bi korisnik mislio da je daleko od limita a nije.
- **Knjiga prihoda** bi bila nepotpuna.
- **Brojevi faktura** bi krenuli ispočetka umesto da nastave (posle 25/26-14 ide 25/26-15).
- **Stare neplaćene fakture** ne bi bile praćene.
- **Akontacije za prošle mesece** bi izgledale neplaćene i kasne.

Napomena: porez i doprinosi paušalca su fiksni mesečni iznosi iz rešenja, ne računaju se iz prihoda. Zato istorija ne menja koliko se plaća, nego tačnost limita, knjige, brojeva faktura i statusa rokova. [ODLUČENO]

## 2. Odluke

1. **Koliko unazad:** 12 meseci od današnjeg dana, ne samo od januara, jer se limit računa klizno u poslednjih 12 meseci (spec 8.4). [PREDLOG, PROVERITI sa knjigovođom ili Poreskom upravom]
2. **Načini unosa:** (a) učitavanje dokumenata koje AI čita, (b) naš šablon, (c) ručni unos. Izvodi iz banke kao izvor kasnije. [PREDLOG]
3. **Uvezene stavke i fakture se ne menjaju** kao fakture iz aplikacije: nemaju pregled u šablonu i PDF iz aplikacije, imaju oznaku "Uvoz". [PREDLOG]
4. **Ulaz:** (a) kao korak "Prenesi dosadašnje poslovanje" u kartici "Počni ovde", (b) dugme u praznoj Knjizi prihoda, (c) Podešavanja, Povezivanje. Onboarding od 4 koraka se ne menja. [PREDLOG]

## 3. Tok (frejmovi Uv0 do Uv6 desktop, PhUv0 do PhUv6 telefon)

**Ulaz (Uv0 / PhUv0).** Knjiga prihoda bez prihoda: u zaglavlju dugme "Prenesi poslovanje" (sa ikonom za otpremanje, pored "Izvezi KPO"), ispod njega baner "Počeo si usred godine?" sa dugmetom "Prenesi dosadašnje poslovanje" (obrub u lime boji). Oba otvaraju korak 1 preko celog ekrana. Isto dugme i isti baner postavljaju se i u karticu "Počni ovde" na Početnoj i u Podešavanja (izgled tih mesta nije nacrtan, ponoviti komponente iz Uv0). Baner nestaje kad je uvoz potvrđen, dugme u zaglavlju ostaje. [IZ DIZAJNA]

**Širina:** na desktopu je kontejner celog toka 1120 px na svih šest koraka. Tabela u koraku 4 je preko cele širine sa fiksnim kolonama bez prelamanja teksta, a "Šta će se promeniti" je traka sa četiri broja ispod tabele. [IZ DIZAJNA]

Ceo tok je preko celog ekrana (bez sidebar-a), sa zaglavljem "Zatvori" i "Prenesi dosadašnje poslovanje", trakom koraka i donjom trakom sa dugmadima. [IZ DIZAJNA]

**Korak 1, izbor načina (Uv1).** Polje "Prihodi od" (podrazumevano 12 meseci unazad, 15.11.2025. u primeru) sa objašnjenjem o limitu. Tri kartice za izbor (radio): "Učitaj dokumenta" (podrazumevano), "Popuni naš šablon" (sa linkom "Preuzmi šablon"), "Unesi ručno". Link "Počni od nule" za korisnike bez prethodnih prihoda. Dugmad: Zatvori, Dalje.

**Korak 2, učitavanje (Uv2).** Zona za prevlačenje (PDF, XLSX, CSV, JPG, PNG, do 20 MB po fajlu), lista učitanih fajlova sa statusom, napomena da se dokumenta čuvaju uz stavke i vidi ih samo korisnik, link za šablon. Dugmad: Nazad, Pročitaj dokumenta.

**Korak 3, čitanje (Uv3).** Progres sa četiri stavke (čitam stavke iz knjige prihoda i faktura, povezujem uplate sa fakturama, proveravam kurseve NBS za devizne uplate, pripremam pregled), isti obrazac kao čitanje rešenja (Rez3). Ništa se ne čuva dok korisnik ne potvrdi. Dugme: Odustani.

**Korak 4, provera (Uv4).** Sažetak (broj stavki, koliko pročitano bez problema, koliko traži proveru). Tabela: Datum, Klijent, Faktura, Iznos (u valuti), U dinarima, Status (Pročitano ili Proveri). Stavka koja traži proveru je istaknuta i ima poruku sa akcijom "Uredi stavku" (npr. nema fakturu, nepoznat klijent, kurs nije jasan). Ispod tabele traka "Šta će se promeniti": prihod u 12 meseci, traka i procenat limita, ostatak do limita, sledeći broj fakture, izvor u knjizi "Uvoz". Svaka stavka može da se ispravi ili ukloni pre čuvanja. Dugmad: Nazad, Potvrdi i sačuvaj. Na telefonu su stavke kartice.

**Ručni unos (Uv5).** Tabela sa redovima (Datum uplate, Klijent, Faktura, Valuta, Iznos), dugme "Dodaj red", zbir u dnu. Devizni iznosi se preračunavaju po kursu NBS na dan uplate. Dugmad: Nazad, Sačuvaj prihode.

**Korak 4 završen, gotovo (Uv6).** Potvrda "Prihodi su preneti", rezime (limit osvežen, sledeći broj fakture, uplate povezane sa fakturama). Pitanje "Da li si već platio akontacije za prošle mesece?" (Da, sve do poslednjeg meseca su plaćene, ili Ne, neke nisu: tada se pokazuju koje čekaju). Obavezna kvačica potvrde "Potvrđujem da su uneti svi moji prihodi od [datum]. Limit je tačan samo ako su uneti svi prihodi." Dugme: Idi na knjigu prihoda.

## 4. Posledice u aplikaciji

- **Knjiga prihoda:** uvezene stavke imaju izvor "Uvoz", datum uplate je originalan (ne datum uvoza), a devizne su po kursu NBS na dan uplate. Mogu da se filtriraju. [PREDLOG]
- **Limit i Početna:** prihod u poslednjih 12 meseci uključuje uvezene stavke. Dok korisnik ne potvrdi kompletnost, limit na Početnoj i u Knjizi prikazuje napomenu "Tačan je samo ako su uneti svi prihodi od [datum]". [PREDLOG]
- **Brojač faktura:** sledeći broj nastavlja posle najvećeg uvezenog broja u istoj numeraciji (npr. 25/26-05, sledeća je 25/26-6), uz mogućnost da korisnik promeni. [PREDLOG]
- **Akontacije:** meseci pre današnjeg označeni kao plaćeni po izboru korisnika, da se ne prikazuju kasne. Rešenje Poreske uprave se dodaje odvojeno (6.2).
- **Neplaćene fakture iz uvoza** ulaze u praćenje (kasne, podsetnici) kao i ostale, ali bez PDF-a iz aplikacije. [PREDLOG]
- **Kalendar:** ne dodaje događaje za prošlost.
- **AI knjigovođa:** zna da su stavke uvezene i to kaže kad ga neko pita odakle brojka ("Ovo je iz tvojih prenetih dokumenata").

## 5. Pravila tačnosti

1. Ništa se ne upisuje bez potvrde na ekranu provere. [ODLUČENO]
2. AI označava stavke koje nije siguran ("Proveri") i objašnjava zašto. Ne pogađa iznose.
3. Original dokumenta ostaje vezan za stavku i može da se otvori.
4. Duplikati: ista kombinacija datum, klijent, iznos, broj fakture se prijavljuje kao moguće duplo.
5. Uvoz može da se pokrene više puta (dodaje stavke, ne briše postojeće). Brisanje uvezene stavke se beleži u istoriji. [PREDLOG]
6. U UI se jasno kaže da AI može da pogreši i da korisnik proveri sa knjigovođom. Pravni tekst proverava pravnik pre objave. [PROVERITI]

## 6. Prototip

Prototip nema pravo čitanje dokumenata. Ponašanje se simulira:
- Učitavanje bilo kog fajla daje isti izmišljen skup od 6 stavki (primer iz frejma: Acme Inc., Northwind Ltd., Bluebird SRL, domaći klijent, jedan nepoznat pošiljalac bez fakture). Izmišljeni podaci se jasno obeležavaju u kodu.
- Šablon je pravi fajl za preuzimanje (CSV) sa kolonama: Datum uplate, Klijent, Broj fakture, Valuta, Iznos, Kurs (opciono). Učitavanje tog šablona radi stvarno (parsira CSV).
- Ručni unos radi stvarno.
- Čuvanje stvarno dodaje uplate u Knjigu prihoda (izvor "Uvoz"), osvežava limit, pomera brojač faktura, postavlja akontacije po izboru.
- Dev meni: "Resetuj uvoz" vraća prethodno stanje.

## 7. Za pravu platformu

- Čitanje dokumenata modelom sa strukturisanim izlazom (datum, klijent, broj fakture, valuta, iznos, kurs), sa pouzdanošću po polju i obaveznim pregledom.
- Podrška za različite oblike knjige prihoda (Excel iz softvera knjigovođe, PDF, skenirana slika). Pravi oblik se uči iz stvarnih primera od prvih korisnika. [PROVERITI]
- Zaštita podataka: učitana dokumenta su sadržaj naloga i admin ih ne vidi. Rok čuvanja i brisanje na zahtev. [PROVERITI sa pravnikom]
- Dnevnik uvoza (ko, kada, koliko stavki) za potrebe podrške, bez sadržaja.

## 8. Otvorena pitanja

1. Potvrda pravila o 12 meseci unazad (sekcija 2, tačka 1).
2. Tačan oblik KPO knjige koju daju knjigovođe (Excel, PDF, kolone).
3. Da li se uvoze i izdate fakture bez uplate (neplaćene), i kako se prikazuju (frejm za listu faktura sa oznakom "Uvezena" nije nacrtan).
4. Ulaz iz Početne ("Počni ovde") i iz Podešavanja nije nacrtan; ponoviti dugme i baner iz Uv0.
5. Da li se akontacije iz prošlosti mogu pojedinačno menjati (nije nacrtano).

## Prilog A: mapa frejmova

Svaki fajl u `dizajn/` ima svetlu temu levo i tamnu desno. Desktop 1440 px, telefon 365 px.

| Fajl | Ekran |
|---|---|
| Uv0 / PhUv0 | Ulaz iz Knjige prihoda |
| Uv1 / PhUv1 | Izbor načina |
| Uv2 / PhUv2 | Učitavanje dokumenata |
| Uv3 / PhUv3 | Čitanje dokumenata |
| Uv4 / PhUv4 | Provera pročitanog |
| Uv5 / PhUv5 | Ručni unos |
| Uv6 / PhUv6 | Gotovo |
