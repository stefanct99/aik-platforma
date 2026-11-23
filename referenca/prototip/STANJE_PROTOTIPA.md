# Stanje prototipa — tvoj AI knjigovođa

Ovaj dokument je napisan za dve publike: Stefana (vlasnika proizvoda, ne programera) i programera koji će kasnije graditi pravu platformu. Svaka tvrdnja ovde je proverena direktno u kodu ovog direktorijuma (ne prepisana iz starijih izveštaja po sećanju). Osnov su `SPEC_USKLADJENOST.md`, `STATUS.md` i stvaran pregled fajlova u `js/`, uz dodatak za Uvoz i Admin, koji u `SPEC_USKLADJENOST.md` nisu obrađeni jer su izgrađeni posle tog izveštaja.

## 1. Šta je ovaj prototip

Ovo je radni model cele aplikacije "tvoj AI knjigovođa", napravljen da se vidi i testira svaki ekran, svaki tok i svako pravilo ponašanja pre nego što se piše prava platforma. Radi u pregledaču kao jedna stranica (Claude Artifact), bez pravog servera, baze ili spoljnih servisa — sve što izgleda kao "banka je poslala mejl" ili "AI je pročitao rešenje" je unapred pripremljena gluma, ne stvaran događaj. Podaci žive samo u pregledaču korisnika (localStorage) i nestaju ako se obrišu. Svrha mu je da odgovori na pitanje "da li ovaj ekran i ovo pravilo imaju smisla", ne da bude deo proizvoda koji se isporučuje korisnicima — ništa odavde se ne "uključuje", prava platforma se piše iznova, uz ponovnu upotrebu onoga što je navedeno u odeljku 3.

## 2. Stanje po oblastima

Oznake: **IMPLEMENTIRANO** (radi kao što bi radilo u pravoj aplikaciji, samo sa lokalnim podacima umesto pravog servera), **SIMULIRANO** (izgleda i ponaša se kao da radi, ali iza toga stoji unapred pripremljen odgovor, ne prava logika ili pravi spoljni sistem), **NEDOSTAJE** (nije izgrađeno, ili je prostor koji zahteva server/mrežu i prototip ga namerno nema).

| Oblast | Status | Šta tačno |
|---|---|---|
| **Onboarding** (registracija, potvrda mejla, uvod) | IMPLEMENTIRANO (tok) / SIMULIRANO (mejl) | Svi koraci rade, prekid i nastavak rade (korak se pamti). Mejl za potvrdu se ne šalje stvarno — korisnik u prototipu klikne dugme koje glumi da je mejl stigao, umesto da stvarno stigne u inbox. |
| **Rešenje poreske uprave** (unos, čitanje mesečnih obaveza) | IMPLEMENTIRANO (tok) / SIMULIRANO (čitanje) | Tri načina unosa rade (foto/PDF, ručno, kasnije). "AI čita rešenje" je tajmer od par sekundi posle kog se pojave unapred pripremljeni brojevi iz seed podataka — nijedan stvaran fajl se ne analizira. Provera pogrešnog PIB-a radi (poredi uneti PIB sa seed vrednošću), to jeste prava logika, samo je ulazni podatak unapred poznat. |
| **Fakture** (lista, nova, pregled, slanje, storno) | IMPLEMENTIRANO (tok) / SIMULIRANO (slanje, PDF) | Svi statusi i prelazi između njih su prava logika (izvedeni iz datuma, ne upisani ručno). Brojevi faktura se dodeljuju tek pri čuvanju, ne pri otvaranju forme — ispravno. "Pošalji fakturu" samo menja status u aplikaciji, ne šalje pravi mejl. "Preuzmi PDF" je uvek isti toast, nijedan fajl se stvarno ne pravi. Automatsko čuvanje nacrta na nekoliko sekundi ne postoji — nacrt se čuva samo na klik "Sačuvaj nacrt" (videti odeljak 4). Storniranje već plaćene fakture ne traži dodatnu potvrdu (videti odeljak 4). |
| **Šabloni fakture** (izgled, uređivanje) | IMPLEMENTIRANO | Pun uređivač: biranje bloka klikom, prevlačenje i promena veličine, panel osobina za blok/tabelu/celu fakturu, više šablona sa pravilom dodele (po klijentu, valuti ili jeziku), isti podaci voze i uređivač i stvaran pregled fakture. Ovo je stvarna logika, ne gluma. |
| **Klijenti** | IMPLEMENTIRANO | Svi podaci o klijentu postoje i koriste se u fakturama. Brisanje klijenta je dozvoljeno samo ako nema faktura na njega. |
| **Knjiga prihoda** | IMPLEMENTIRANO (prikaz) / SIMULIRANO (izvoz) | Tabele, filteri, ručni unos i detalj po stavci rade sa pravim izvedenim brojevima. "Izvezi" dugme je toast, ne pravi fajl (ni CSV ni PDF). |
| **Limit od 6.000.000 din** | IMPLEMENTIRANO | Računa se klizno za poslednjih 12 meseci (ne po kalendarskoj godini), sa upozorenjima na 80/90/100%, i prikazuje se na sva 4 mesta gde spec traži (Početna, Knjiga prihoda, Kalendar, AI razgovor). Jedno još nerazjašnjeno pitanje: da li uplate "bez fakture" treba da ulaze u ovaj zbir (videti odeljak 5). |
| **Porez i rokovi** | IMPLEMENTIRANO (datumi, tok) / SIMULIRANO (QR, šema uplatnice) | Pomeranje roka kad 15. padne na neradni dan radi ispravno. Broj računa i poziv na broj su unapred uneti seed podaci, ne generisani po pravoj šemi iz PIB-a. QR kod na uplatnici je slika koja liči na QR kod, ne skenira se stvarnim telefonom. Trajni nalog menja samo prikaz teksta ("Automatski iz banke") — ne označava mesec kao plaćen sam od sebe na dan roka, iako to spec traži kao podrazumevano pravilo (videti odeljak 4). |
| **Kalendar** | IMPLEMENTIRANO (prikaz) / NEDOSTAJE (pravi feed) | Mesec, lista, godina i dan rade, svi događaji se računaju iz stvarnog stanja (rokovi, fakture, ponavljajuće, ručni unosi). Veza sa Google/Apple kalendarom (pretplata na kalendar, ICS) je samo prikazan tekst/link u Podešavanjima — ne postoji stvaran fajl koji bi neki pravi kalendar mogao da pročita. |
| **Mejlovi banke** | IMPLEMENTIRANO (obrada) / SIMULIRANO (prijem) | Kad mejl "stigne" (dugme u razvojnom meniju), sva dalja obrada je prava logika: automatsko slanje obrasca banci (globalno ili izuzetak po klijentu), devizni/dinarski tok, uplata bez fakture sa sve tri opcije. Sam prijem mejla od banke je uvek simuliran klik, nikad pravi dolazak mejla. Algoritam koji bira KOJOJ fakturi uplata pripada nije opšta logika — svaki test slučaj u seed podacima već ima unapred određen, jednoznačan ishod (videti odeljak 4, ovo je najvažniji nalaz u celom dokumentu). |
| **AI knjigovođa** | IMPLEMENTIRANO (tok, radnje) / SIMULIRANO (sami odgovori) | Razgovor, istorija, kvota od 20 poruka dnevno u probnom periodu, prilozi, radnje sa potvrdom na klik — sve je prava logika. Sami odgovori AI-ja nisu iz pravog jezičkog modela — prototip prepoznaje ključne reči u pitanju i vraća jedan od unapred pripremljenih odgovora. Pitanje van pokrivenih tema dobija opšti odgovor, ne stvarno razumevanje. |
| **Pretplata** | IMPLEMENTIRANO (tok, statusi) / SIMULIRANO (naplata) | Probni period, promena plana, otkazivanje, istorija plaćanja sve rade. Naplata karticom ili QR kodom je odglumljena (uključujući i odbijenu karticu) — nijedan pravi procesor plaćanja ne postoji. |
| **Podešavanja** | IMPLEMENTIRANO | Svih 7 tabova radi (profil, firma, pretplata, obaveštenja, povezivanje, bezbednost, jezik i izgled). |
| **Obaveštenja** | IMPLEMENTIRANO (struktura) / SIMULIRANO (dostava) / DELIMIČNO (okidanje) | Zvonce, lista, označavanje pročitanog i podešavanje po kanalu (mejl/push) rade. Proveren je kod i potvrđeno: jedino "stigao je novi mejl banke" stvarno upisuje obaveštenje kroz kod. Ostale vrste koje se vide u listi (rok za porez, kasna faktura, nedeljni pregled, promena propisa) su samo seed primeri za izgled ekrana — kod ih ne generiše sam od sebe kad se odgovarajući događaj desi. Kanal "mejl"/"push" ne šalje ništa stvarno van aplikacije. |
| **Uvoz (Prenos dosadašnjeg poslovanja)** | IMPLEMENTIRANO (tok, logika) / SIMULIRANO (čitanje dokumenata) | Ulaz preko Knjige prihoda, tri načina (dokumenta, naš šablon, ručni unos), provera sa izmenom/uklanjanjem stavki, čuvanje. Učitavanje pravog CSV šablona STVARNO čita i parsira fajl (datumi, iznosi, valute). "Učitaj dokumenta" uvek daje fiksnih 6 stavki bez obzira šta je stvarno u fajlu — to je simulirano OCR čitanje. Ako se učita više CSV fajlova odjednom, obrađuje se samo prvi, uz trajnu poruku korisniku (videti odeljak 4). Upis u admin dnevnik (preko `importState.history`) sadrži samo broj stavki i datum, nikad sadržaj. |
| **Admin** | IMPLEMENTIRANO (Pregled, Korisnici, Odobri pristup, Dnevnik, Podrška) | Svih 5 ekrana rade sa stvarno izvedenim brojevima iz generisane liste od 128 korisnika (deterministički generisana, ista na svakom učitavanju). "Odobri besplatan pristup" je prava radnja — premešta nalog, upisuje u dnevnik, brojke na Pregledu i Korisnicima se stvarno menjaju. Agregati koji nemaju vezu sa pojedinačnim nalozima (mesečni prihod, levak registracija do plaćanja, korišćenje funkcija, ocene AI odgovora) su fiksne vrednosti iz specifikacije, ne izvedene iz događaja — spec sam kaže da pravo beleženje događaja dolazi tek sa pravom platformom. Meni radnji po korisniku ima samo jednu stvarnu stavku ("Odobri besplatan pristup"); preostale tri (produži probni, dodaj popust, promeni plan) pokazuju poruku "dolazi kasnije", bez prave forme, jer njihov izgled nije nacrtan ni u jednom frejmu. |

## 3. Šta se prenosi, šta se piše ispočetka

**Može direktno da se prenese ili posluži kao osnova:**
- **Tekstovi i ton**: sve poruke, nazivi dugmadi, objašnjenja grešaka, i18n sadržaj (`js/i18n.js`) — pisani su pažljivo i usklađeni sa specifikacijom, mogu se preneti skoro bez izmene.
- **Poslovna pravila kao specifikacija ponašanja**: formule i logika u `js/selectors.js` i `js/actions.js` (status fakture iz datuma, klizni limit, pomeranje roka na radni dan, matrica autonomije, pravila prelaska pretplate) su tačan zapis ŠTA platforma treba da radi — programer može da ih čita kao izvršnu specifikaciju i prepiše u pravi backend jezik, umesto da ponovo smišlja pravila od nule.
- **Izgled i komponente**: `css/tokens.css` i `css/base.css` (boje, razmaci, tipografija, sve CSS klase) su već usklađeni piksel po piksel sa dizajnom kroz mnogo krugova provere — mogu se preneti u pravi frontend sistem dizajna skoro direktno, ili barem kao tačna referenca vrednosti.
- **Struktura podataka**: oblici objekata (faktura, klijent, uplata, mejl banke, korisnik u adminu) iz `js/seed.js` su dobar prvi nacrt šeme baze — ne konačan (nema ograničenja, indeksa, tipova na nivou baze), ali pokazuje koja polja stvarno trebaju.
- **Redosled i sadržaj ekrana**: koji ekran posle kog dolazi, koja polja su obavezna, šta se dešava kad nešto nedostaje (prazna stanja) — sve je već isprobano i vredi ga zadržati kao plan ekrana.

**Mora da se napiše ispočetka (prototip ovde ne pomaže, samo pokazuje ŠTA treba da postoji):**
- Pravi server, baza podataka, autentifikacija, sesije, višekorisnički pristup.
- Primanje i slanje pravih mejlova (banka, potvrda naloga, fakture klijentima).
- Pravi poziv jezičkom modelu za AI knjigovođu, uključujući zaštitu od ubačenih instrukcija iz sadržaja mejla/dokumenta (prompt injection) — u prototipu ovo pitanje i ne postoji jer nema pravog poziva modelu.
- Pravo čitanje dokumenata (OCR/razumevanje rešenja poreske uprave).
- Pravi procesor plaćanja za pretplatu i NBS kursnu listu uživo.
- Generisanje pravih PDF fajlova i ICS kalendarskog feed-a.
- Algoritam uparivanja uplate sa fakturom kao OPŠTA logika (ne fiksni test slučajevi) — ovo je verovatno najveći pojedinačni posao koji treba isplanirati, jer prototip ovde samo glumi ishod, ne pravi pravi izbor između više kandidata.
- Pozadinski poslovi koji ne zavise od toga da je neko otvorio aplikaciju (dnevno generisanje ponavljajućih faktura, dnevno označavanje "kasni", slanje automatskih podsetnika, nedeljni pregled) — u prototipu sve ovo postoji samo kao da se desilo u trenutku kad korisnik otvori ekran, ne kao pravi raspoređen posao.
- Bezbednost na nivou servera (ko sme šta da vidi, šifrovanje, prava provera uloge na serveru, ne samo u kodu pregledača).

## 4. Poznata ograničenja i greške koje nisu ispravljene

Ovo su stvari koje rade drugačije od pravog ponašanja i koje niko još nije tražio da se isprave (nisu greške otkrivene a zaboravljene, nego svesno ostavljene dok se ne odluči da li i kako da se grade dalje):

- **Uparivanje uplate sa fakturom nije opšta logika.** Svaki test slučaj u seed podacima ima unapred poznat, jednoznačan ishod (tačno jedna faktura za tačno jednu uplatu). Pravi slučaj "više mogućih faktura, koja je prava" ili "nijedna ne odgovara" se nikad stvarno ne testira kroz pravi algoritam, samo kroz hardkodovan scenario koji već zna odgovor.
- **Prijava koristi fiksnu lozinku.** U `js/actions.js` postoji `DEMO_PASSWORD = 'demo1234'` — bilo koji unet mejl koji se poklapa sa seed nalogom, uz tačno ovu lozinku, prijavljuje korisnika. Ovo je namerno pojednostavljenje za testiranje (nema pravog sistema naloga), ne nešto što liči na pravu proveru lozinke.
- **Trajni nalog ne označava mesec kao plaćen sam od sebe.** Kad korisnik izabere "trajni nalog", menja se samo tekst na ekranu ("Automatski iz banke") — spec traži da se na dan roka mesec sam označi kao plaćen, to nije izgrađeno.
- **Automatsko čuvanje nacrta fakture ne postoji.** Nacrt se čuva samo kad korisnik klikne "Sačuvaj nacrt", ne periodično u pozadini.
- **Storniranje već plaćene fakture ne traži dodatnu potvrdu.** Radi identično kao storniranje bilo kog drugog statusa, iako spec predlaže posebno upozorenje za ovaj slučaj.
- **Vokativ imena je opšte pravilo, ne spisak poznatih imena.** `U.firstNameVoc` u `js/utils.js` radi jedno jednostavno pravilo: ako se ime završava na samoglasnik, ostaje isto, inače se dodaje "e" na kraj (Stefan postaje Stefane). Ovo pogađa većinu imena korišćenih u aplikaciji, ali nije pravo poznavanje srpske gramatike — ime poput "Petar" bi po ovom pravilu dobilo pogrešan oblik "Petare" umesto ispravnog "Petre". Nije ograničeno na spisak, ali ni ispravno za svako ime.
- **Dugme "Nazad" ne prati pravu istoriju kretanja.** Aplikacija nema ni adresnu traku ni pravu istoriju stranica (namerno, po pravilima projekta) — svako dugme "Nazad" vodi na JEDNU unapred određenu stranicu koju je programer odabrao za to mesto, ne na stranicu sa koje je korisnik stvarno došao.
- **Upload više CSV fajlova odjednom u Uvozu.** Ako korisnik odabere dva ili više CSV fajlova za "Popuni naš šablon", obrađuje se samo prvi — aplikacija to jasno piše korisniku trajnom porukom, ali ne obrađuje ostale fajlove niti ih spaja.

Pored ovih, iz `SPEC_USKLADJENOST.md` vredi ponoviti (bez ponovnog opisivanja, videti taj fajl za detalje): formalna provera kontrasta boja i redosleda tabulatora nikad nije posebno sprovedena; jedinični automatizovani testovi postoje samo za jedno pravilo (množina brojeva), ostala poslovna pravila su provaravana samo ručno uživo; nije potvrđeno da li kod stvarno odbija fajlove preko dozvoljene veličine za logo firme (2 MB) i rešenje poreske uprave (20 MB) — tekst na ekranu navodi granicu, ali provereno je da jedino Uvoz stvarno odbija prevelik fajl u kodu, logo i rešenje nemaju tu proveru.

## 5. Sve [PROVERITI] stavke na jednom mestu

Ovo su tačke gde sama specifikacija (platforma ili admin dodatak) kaže da nešto nije odlučeno ili nacrtano, i prototip to svesno nije izmišljao:

1. **Algoritam uparivanja uplate (spec 8.8)** — da li vredi graditi kao opštu logiku sa traženjem kandidata, ili ostaje prototipsko pojednostavljenje do prave platforme.
2. **Trajni nalog, automatsko označavanje plaćenog meseca (spec 12/#12)** — spec sam traži potvrdu vlasnika pre građenja.
3. **Uplate "bez fakture" u limitu** — korisnik je u jednom trenutku tražio da uđu u zbir, iako spec 8.4 eksplicitno kaže suprotno i ceo niz ekrana postoji da ih pre toga razreši. Nije menjano bez jasne odluke, jer dotiče i Mejlove banke i AI razgovor.
4. **Dodatna potvrda za storniranje već plaćene fakture (spec, [PREDLOG])** — nije izgrađena.
5. **Sadržaj menija radnji po korisniku u Adminu (Produži probni/Dodaj popust/Promeni plan)** — admin specifikacija sama kaže da tačan izgled ovih dijaloga nije nacrtan.
6. **Prikaz besplatnog pristupa u korisnikovoj (ne admin) aplikaciji** — kartica u bočnom meniju i ekran Pretplata bi trebalo da pokažu da je pristup besplatan, ali admin specifikacija sama kaže da ovo nije nacrtano, i nije dirano.
7. **Upravljanje prijavama u Admin/Podršci** (promena statusa prijave, odgovor korisniku) — nije nacrtano, ekran je ostao samo za čitanje.
8. **Dodatne admin uloge (npr. podrška samo za čitanje)** — spec sam kaže da za sada postoji samo jedan admin, ovo ostaje otvoreno pitanje za kasnije.
9. **Pravilo dodele šablona fakture** (po klijentu/valuti/jeziku) — kontrola za biranje pravila je dodata jer frejm ne pokazuje kako se to menja u UI, samo gotov tekst uz svaki šablon; vredi potvrditi da li je ovaj oblik kontrole u redu.
10. **Dva frejma za donju telefonsku navigaciju koji se razlikuju** (jedan sa 5 ravnopravnih stavki uključujući Kalendar, drugi sa 4 stavke plus veliko dugme i Kalendar u "Više") — kod prati noviji, brojčano potvrđeniji frejm, stariji ostaje neobjašnjena razlika.
11. **Nekoliko manjih razlika između dva međusobno suprotna frejma** iz ranijih faza (Sub2 panel bez dugmeta za zatvaranje, PrijavaP1 bez magic link dugmeta koje srodan ekran ima, Poc3 footer sa dodatnim linkom koji frejm nema) — nabrojano u `STATUS.md`, nijedno nije menjano bez odluke.

## 6. Predlog izolacije sloja podataka

Dobra vest: pristup lokalnom skladištu je već skoro potpuno izolovan. Pretraga celog `js/` direktorijuma pokazuje da `localStorage` **direktno** koristi samo jedan fajl:

- **`js/store.js`** — jedino mesto koje čita (`localStorage.getItem`) i piše (`localStorage.setItem`) lokalno skladište. Svi ostali fajlovi (svih petnaestak ekrana, `actions.js`, `selectors.js`) nikad ne diraju `localStorage` sami — oni uvek prolaze kroz `store.getState()` i `store.setState()`.

Ovo znači da bi se prava mreža mogla uvesti sa malim brojem izmena ako se napravi novi `data/` modul koji preuzme ulogu koju danas ima `store.js`, sa otprilike ovakvim funkcijama (grupisano po istim oblastima koje već postoje u `js/actions.js`, jer se nazivi i granice tamo već prirodno poklapaju sa onim što bi prави API imao):

- `data.auth.login(email, lozinka)`, `data.auth.logout()`, `data.auth.register(...)` — danas `Actions.Auth`, sa `DEMO_PASSWORD` proverom koja bi se zamenila pravim pozivom serveru.
- `data.business.get()/update(...)` — podaci o firmi.
- `data.invoices.list()/create(...)/update(...)/send(...)/void(...)` — fakture, danas `Actions.Invoices`.
- `data.clients.list()/create(...)/update(...)/delete(...)` — klijenti.
- `data.income.list()/record(...)` — uplate i Knjiga prihoda.
- `data.bankMails.list()/approve(...)/reject(...)` — mejlovi banke (prijem bi ovde postao pravi webhook umesto dev-meni dugmeta).
- `data.tax.getDecision()/uploadDecision(...)/markMonthPaid(...)` — porez i rokovi.
- `data.calendar.events(mesec, godina)` — kalendar, verovatno izveden na serveru iz ostalih podataka, ne posebna tabela.
- `data.ai.sendMessage(tekst)/listConversations()` — AI knjigovođa, ovde bi stvaran poziv modelu zamenio `matchScenario`.
- `data.subscription.get()/changePlan(...)/cancel(...)/pay(...)` — pretplata, sa pravim procesorom plaćanja iza `pay`.
- `data.settings.get()/update(...)` — podešavanja i obaveštenja.
- `data.uvoz.parseFile(fajl)/commit(stavke)` — uvoz dosadašnjeg poslovanja.
- `data.admin.overview()/users(filteri)/grantFreeAccess(...)/log(filteri)/supportTickets()` — admin, sa stvarnom proverom uloge NA SERVERU (danas je provera samo u kodu pregledača, što admin specifikacija sama navodi kao nešto što prava platforma mora da ispravi).

Svaka od ovih funkcija bi vraćala `Promise` (pravi mrežni poziv je uvek asinhron, za razliku od današnjeg trenutnog čitanja iz `localStorage`), što znači da bi `js/actions.js` i ekrani morali da dodaju čekanje na odgovor i stanje učitavanja — ovo je najveća STVARNA izmena koja bi bila potrebna u ostatku koda, jer danas ništa u aplikaciji ne čeka ništa (sve je trenutno). Sama zamena "gde se podaci čuvaju" bi, zahvaljujući već postojećoj izolaciji u `store.js`, bila mala i usredsređena izmena, ne prepravka celog projekta.
