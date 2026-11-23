# Admin deo aplikacije: specifikacija

Verzija: 1. Dopuna glavne specifikacije platforme (PLATFORMA_SPECIFIKACIJA.md). Ovaj dokument ništa ne menja u postojećim sekcijama, samo dodaje novi odeljak "Admin".

Oznake: [ODLUČENO] odluka vlasnika, [IZ DIZAJNA] preuzeto iz frejmova, [PREDLOG] moj predlog koji vlasnik nije potvrdio, [PROVERITI] otvoreno pitanje.

---

## 0. Poenta admin dela (pročitaj prvo)

Aplikacija "tvoj AI knjigovođa" je proizvod za paušalce u Srbiji. Vlasnik proizvoda (Stefan) ne koristi aplikaciju samo kao korisnik, nego je i vodi kao posao. Zato mu je neophodan poseban deo aplikacije, vidljiv samo njemu, u kome u svakom trenutku vidi **tačno stanje proizvoda**:

1. **Koliko ima korisnika i šta rade:** registracije, ko je završio podešavanje, ko je poslao prvu fakturu, ko je platio. To je glavni pokazatelj da li proizvod radi.
2. **Koliko zarađuje:** prihod od pretplata, probni periodi koji ističu, neuspele naplate, otkazivanja.
3. **Besplatan pristup:** vlasnik i ljudi koje on odabere (tim, partneri, testeri) koriste punu aplikaciju besplatno. To mora da bude lako, bez kartice i bez naplate, a da se ne meša sa pravim prihodom u statistici.
4. **Podrška i kvalitet:** prijave problema i ocene AI odgovora, da se vidi gde proizvod greši.
5. **Odgovornost:** svaka radnja admina se beleži, da se zna ko je šta i kada uradio.

**Najvažnije ograničenje: admin vidi metapodatke i zbirne brojke, nikad sadržaj korisnikovog naloga.** Korisnici poveravaju aplikaciji finansijske podatke (fakture, uplate, mejlove banke, klijente). Admin ih ne vidi: ni iznose, ni klijente, ni fakture, ni mejlove, ni tekst razgovora sa AI. Vidi samo plan, status naplate, datume, aktivnost u zbirnom obliku (npr. broj faktura, ne same fakture) i prijave koje je korisnik sam poslao. Ovo je [ODLUČENO] i važi bez izuzetka.

## 1. Šta admin NIJE

- Nije način da admin čita tuđe podatke. Nema "uđi u nalog korisnika" u prvoj verziji. [ODLUČENO]
- Nije novi proizvod: koristi isti izgled, iste komponente, isti sidebar i iste boje kao ostatak aplikacije (svetla i tamna tema).
- Nije deo korisničkog iskustva: običan korisnik ne vidi ni stavku u meniju, ni ekrane, ni ne može da ih otvori preko direktnog linka.

## 2. Uloge i pristup

- Postoji jedna uloga: **admin**. Samo jedan admin (vlasnik). [ODLUČENO]
- Uloga je polje na nalogu (`role: "user" | "admin"`). Svaki nalog je podrazumevano `user`.
- Isti nalog koristi aplikaciju kao običan korisnik (sopstvena firma, fakture, itd.) i otvara admin deo. Nema posebnog admin naloga.
- Zaštita: svaki admin ekran i svaka admin radnja proverava ulogu. Neadmin koji otvori admin adresu dobija ekran 404 (ne "nemaš pristup", da se ne otkriva da ekran postoji). [PREDLOG]
- Na pravoj platformi: obavezna dvostepena prijava za admin ulogu, i admin radnje idu preko servera koji proverava ulogu, ne preko klijenta. [PREDLOG, PROVERITI]

## 3. Navigacija

**Desktop:** u sidebar-u se ispod "Podešavanja" pojavljuje stavka **Admin** (ikonica štita). Vidi je samo nalog sa ulogom admin. Aktivna stavka ima isti stil kao ostale aktivne stavke. [IZ DIZAJNA]

**Raspored (desktop):** sidebar je uvek visok tačno koliko prozor pregledača (100vh) i zalepljen, ne pomera se sa stranicom. Kartica pretplate i korisnik su zalepljeni za dno sidebar-a. Skroluje se samo desni deo sa sadržajem, a gornja traka ostaje na vrhu. Ovo važi za ceo prototip, pa i za admin ekrane. [ODLUČENO]

**Telefon:** Admin je u meniju "Više" (donji sheet), ispod "Podešavanja". Donja navigacija se ne menja. Kad je Admin otvoren, "Više" je označeno kao aktivno. [IZ DIZAJNA: PhAdm0]

**Unutar Admin ekrana, četiri taba** (stil pilula, kao tabovi u Mejlovima banke):
1. Pregled
2. Korisnici i pretplate
3. Dnevnik radnji
4. Podrška

Na telefonu je red tabova horizontalno pomerljiv.

**Gornja traka (desktop):** pretraga sa leve strane ("Pretraži korisnike i pretplate"), a sa desne strane zvonce za obaveštenja. Admin ekrani nemaju dugme "Nova faktura" u gornjoj traci. Svi ostali ekrani aplikacije ga zadržavaju. [ODLUČENO] Prekidač izgleda (svetli/tamni) u frejmovima stoji odmah uz zvonce i služi samo za prikaz u dizajnu, nije deo proizvoda.

## 4. Ekrani

Frejmovi su izvor istine za izgled. Ovaj dokument je izvor istine za ponašanje. Kad se razilaze, javi.

### 4.1 Pregled (Adm1 / PhAdm1) [IZ DIZAJNA]

Naslov "Admin", podnaslov: "Pregled aplikacije. Vidiš samo zbirne brojke i podatke o pretplatama, ne fakture, iznose ni klijente korisnika." Gore desno: izbor perioda (podrazumevano "Poslednjih 30 dana") i dugme "Izvezi izveštaj".

Elementi, redom:

1. **Četiri kartice sa brojkama:**
   - Ukupno korisnika (podnaslov: broj novih u izabranom periodu)
   - Aktivne pretplate (podnaslov: procenat od svih korisnika)
   - Probni period (podnaslov: koliko ističe u narednih 7 dana)
   - Mesečni prihod od pretplata (podnaslov: "Bez naloga sa besplatnim pristupom")
2. **Nove registracije po danima:** linijski grafik za izabrani period, sa zbirom u zaglavlju kartice i tri oznake datuma ispod.
3. **Od registracije do plaćanja:** četiri horizontalne trake (Registracija, Završen onboarding, Prva faktura, Plaćena pretplata) sa brojem korisnika i dužinom trake srazmernom prvoj stavci.
4. **Korišćenje funkcija:** prosek po aktivnom korisniku mesečno za AI poruke, fakture, kalendar, mejlove banke (horizontalne trake).
5. **Zahteva pažnju:** tri reda sa brojem: neuspele naplate, probni koji ističe za 7 dana, nove prijave problema. Svaki red vodi na odgovarajući tab sa unapred postavljenim filterom.

Definicije svih brojki su u sekciji 5.

### 4.2 Korisnici i pretplate (Adm2 / PhAdm2) [IZ DIZAJNA]

Naslov "Korisnici i pretplate". Dugmad gore desno: "Izvezi" i primarno "Odobri besplatan pristup".

- **Filteri (pilule sa brojem):** Svi, Probni, Aktivni, Naplata nije uspela, Otkazani. Desno: izbor plana i sortiranje po poslednjoj aktivnosti.
- **Tabela (desktop), kolone:** Korisnik (inicijali, ime, naziv firme), Plan, Status (bedž), Registrovan, Aktivnost, Sledeća naplata, meni radnji (tri tačke). Ispod tabele: "Prikazano X od Y" i Prethodna/Sledeća.
- **Na telefonu:** svaki korisnik je kartica (inicijali, ime, firma, meni radnji; plan i status; Registrovan, Aktivnost, Naplata).
- **Statusi (bedž):** Aktivna (zeleno), Probni sa brojem dana (amber), Naplata nije uspela (crveno), Otkazana (neutralno), Admin besplatno (zeleno).
- **Meni radnji po korisniku:** Odobri besplatan pristup, Ukini besplatan pristup, Produži probni period, Dodaj popust, Promeni plan. Svaka radnja traži potvrdu i upisuje se u dnevnik (4.4). [PREDLOG: tačan sadržaj menija nije nacrtan, PROVERITI sa vlasnikom]
- Admin vidi korisnikovo ime, naziv firme i email (potrebno da bi ga prepoznao). Ne vidi ništa više. [ODLUČENO]

### 4.3 Odobri besplatan pristup (Adm3 / PhAdm3) [IZ DIZAJNA]

Modal na desktopu, donji sheet na telefonu. Naslov "Odobri besplatan pristup", opis: "Nalog dobija pun plan bez naplate. Ne ulazi u mesečni prihod u statistici."

Polja:
1. **Korisnik:** izbor postojećeg naloga (pretraga po imenu, firmi ili emailu).
2. **Plan:** "Pun plan, svi delovi aplikacije". Za sada jedina opcija.
3. **Trajanje:** "Bez roka" ili do izabranog datuma. Pomoćni tekst: "Besplatan pristup možeš da ukineš u bilo kom trenutku."
4. **Interna napomena:** slobodan tekst. Pomoćni tekst: "Vidi samo admin. Ne prikazuje se korisniku."

Dugmad: "Otkaži" i primarno "Odobri pristup".

Ponašanje:
- Nalog dobija status "Admin besplatno" i pun pristup svim funkcijama (isto kao aktivna pretplata za `Sel.subscriptionAccess`).
- Nalog sa besplatnim pristupom ne ulazi u "Mesečni prihod od pretplata" niti u "Aktivne pretplate" kao plaćena pretplata. U brojkama o korisnicima ulazi kao korisnik. [PREDLOG, PROVERITI: da li besplatni ulaze u "Aktivne pretplate"]
- Ako je zadat datum, na taj dan pristup prestaje i nalog prelazi u stanje koje bi imao da nikad nije dobio besplatan pristup (probni ako traje, inače istekao). [PREDLOG]
- Ukidanje: isto pravilo.
- Radnja se upisuje u dnevnik.
- Kod korisnika u njegovoj aplikaciji: kartica pretplate u sidebar-u i na ekranu Pretplata mora da prikaže da je pristup besplatan. [PROVERITI: tekst i izgled nisu nacrtani, ne improvizovati, pitati]

### 4.4 Dnevnik radnji (Adm4 / PhAdm4) [IZ DIZAJNA]

Naslov "Dnevnik radnji", podnaslov: "Svaka radnja admina se beleži. Zapisi se ne mogu menjati ni brisati."

- Filteri (pilule sa brojem): Sve radnje, Besplatan pristup, Popusti i produženja, Promene plana, Izvozi.
- Tabela: Vreme, Radnja, Korisnik, Detalj. Telefon: kartica po zapisu.
- **Šta se beleži:** odobren/ukinut besplatan pristup, produžen probni period, dodat popust, promenjen plan, izvezen izveštaj (sa opisom šta je izvezeno). Svaki zapis ima vreme, admina koji je radio, radnju, ciljni nalog (ako postoji) i detalj.
- Zapisi su samo za čitanje. Nema izmene i brisanja ni preko aplikacije ni preko admin ekrana. [ODLUČENO]

### 4.5 Podrška (Adm5 / PhAdm5) [IZ DIZAJNA]

Naslov "Podrška", podnaslov: "Prijave problema i ocene AI odgovora. Ocene prikazuju razlog i oblast, ne tekst razgovora."

- **Prijave problema (levo):** lista prijava koje su korisnici poslali iz aplikacije (npr. "Javi problem" na ekranu greške veze, ili iz pomoći). Kolone: naslov, oblast (Fakture, Mejlovi banke, Porez i rokovi, Pretplata, Knjiga prihoda...), vreme, status bedž (Otvoreno, Hitno, Rešeno). U zaglavlju: broj otvorenih.
- **Ocene AI odgovora (desno):** procenat korisnih odgovora, broj ocena "Nije korisno", i raspodela po razlogu (Netačan podatak, Nije odgovorio na pitanje, Previše dugo, Drugo). Razlozi dolaze iz čipova koje korisnik bira u prozoru za ocenu (frejm Ak15). Admin ne vidi pitanje ni odgovor, samo oblast i razlog.
- Oba bloka su iste visine na desktopu. [ODLUČENO]
- Promena statusa prijave (Otvoreno, Rešeno) i odgovor korisniku nisu nacrtani. [PROVERITI]

## 5. Definicije brojki

Sve brojke se računaju iz istog izvora (selektori `Sel.admin*`), nikad ručno unete.

| Brojka | Definicija |
|---|---|
| Ukupno korisnika | Broj naloga sa ulogom `user` (uključujući otkazane i besplatne) |
| Novi u periodu | Nalozi čiji je datum registracije u izabranom periodu |
| Probni period | Nalozi u stanju probnog perioda koji nije istekao |
| Probni ističe za 7 dana | Probni nalozi čiji probni period ističe u narednih 7 dana |
| Aktivne pretplate | Nalozi sa plaćenom aktivnom pretplatom (bez besplatnih, bez probnih) [PROVERITI] |
| Naplata nije uspela | Nalozi u stanju "Naplata nije uspela" |
| Otkazani | Nalozi sa otkazanom pretplatom (u periodu pristupa ili posle) |
| Mesečni prihod od pretplata (MRR) | Zbir mesečnog iznosa svih aktivnih plaćenih pretplata. Plan na više meseci se deli na mesece. Bez besplatnih naloga i bez probnih |
| Registracija (grafik) | Broj naloga po danu registracije u izabranom periodu |
| Završen onboarding | Nalozi koji su završili onboarding |
| Prva faktura | Nalozi koji su poslali bar jednu fakturu |
| Plaćena pretplata | Nalozi koji su ikada platili pretplatu [PROVERITI: ikada ili trenutno] |
| Korišćenje funkcija | Prosečan mesečni broj događaja po aktivnom korisniku: AI poruke, poslate fakture, kalendarski događaji, obrađeni mejlovi banke |
| Procenat korisnih AI odgovora | 1 minus (odgovori ocenjeni sa "Nije korisno" podeljeni sa svim ocenjenim odgovorima) |

Provera doslednosti u prikazu: Ukupno korisnika mora biti jednako zbiru Probni, Aktivni, Naplata nije uspela i Otkazani (plus besplatni ako se računaju zasebno). Brojke u filterima na ekranu Korisnici moraju da se poklapaju sa karticama na Pregledu.

## 6. Veza sa stanjima naloga i pretplatom

Postojeća stanja naloga (probni, ističe, istekao, aktivan, naplata nije uspela, otkazan) i funkcija `Sel.subscriptionAccess` ostaju kako su. Dodaje se jedno stanje: **besplatan pristup (admin)**. Ono daje isti pristup kao aktivna pretplata i ne podleže pauziranju AI knjigovođe. Svuda gde se proverava pristup koristi se isti selektor. Prikaz stanja u korisnikovoj aplikaciji: [PROVERITI].

## 7. Pravila

1. Admin ne vidi i ne izvozi sadržaj naloga korisnika. Izvoz iz admina sadrži samo metapodatke i zbirne brojke.
2. Svaka admin radnja koja menja stanje naloga prolazi kroz potvrdu i upisuje se u dnevnik.
3. Dnevnik se ne menja i ne briše.
4. Besplatni nalozi se ne računaju u prihod.
5. Brojke se računaju iz podataka, ne ručno.
6. Svi iznosi sa valutom u srpskom formatu (1.234,56 din, 4.236 €), datumi u formatu 20.11.2026., bez crtica u tekstu.
7. Izgled: iste boje, razmaci i komponente kao ostatak aplikacije. Veličine teksta u rem sa parnim piksel vrednostima, fluidno skaliranje kao u ostatku aplikacije, vrednosti se nigde ne lome u dva reda.

## 8. Prototip (Claude artifact)

Prototip nema pravi server ni prave korisnike, pa admin radi nad izmišljenim podacima iz Priloga B.

- **Dev meni:** novi prekidač "Uloga: korisnik / admin". Samo u ulozi admin se vidi stavka Admin u sidebar-u (desktop) i u meniju "Više" (telefon). U ulozi korisnik, direktno otvaranje admin rute daje ekran "stranica ne postoji".
- Podrazumevano u prototipu: uloga admin uključena, jer je to Stefanov nalog.
- Akcije su stvarne u okviru prototipa: "Odobri pristup" menja status odabranog naloga i upisuje zapis u dnevnik, a brojke na Pregledu se preračunavaju.
- Seed podaci su u Prilogu B. Reset seed-a u dev meniju vraća i njih.
- Izvoz i slanje: simulirani (toast "Izvezeno").
- Dvostepena prijava za admin ulogu: van prototipa.

## 9. Za pravu platformu (kasnije, ne sada)

Da bi admin pokazivao **tačne** podatke od prvog dana, platforma od početka mora da beleži događaje. Bez toga se istorija ne može rekonstruisati.

**Događaji koje treba beležiti (sa vremenom i id-jem naloga):**
`signup`, `email_verified`, `onboarding_completed`, `first_invoice_sent`, `invoice_sent`, `bank_mail_processed`, `calendar_event_created`, `ai_message_sent`, `ai_answer_rated` (sa razlogom), `support_report_created`, `trial_started`, `trial_ended`, `subscription_started`, `subscription_renewed`, `payment_failed`, `subscription_canceled`, `plan_changed`, `comp_access_granted`, `comp_access_revoked`, `admin_action` (svaka admin radnja).

**Bezbednost i pravo:**
- Uloga se proverava na serveru za svaki admin zahtev.
- Dvostepena prijava za admin.
- Admin ne dobija pristup tabelama sa sadržajem naloga (fakture, klijenti, mejlovi, razgovori), nego samo agregatima i metapodacima. Najbolje i na nivou baze (poseban prikaz/pogled za admin).
- Pregled se vodi po Zakonu o zaštiti podataka o ličnosti: u uslovima korišćenja i politici privatnosti mora da piše šta admin vidi. Pre lansiranja proveriti sa pravnikom.
- Dnevnik radnji: nepromenljiv, sa čuvanjem određenog broja godina. [PROVERITI sa pravnikom]

## 10. Otvorena pitanja

1. Da li besplatni nalozi ulaze u "Aktivne pretplate"? (trenutno: ne)
2. "Plaćena pretplata" u toku do plaćanja: ikada plaćeno ili trenutno plaćeno?
3. Sadržaj menija radnji po korisniku (4.2) i dijalozi za produženje, popust i promenu plana.
4. Prikaz besplatnog pristupa u korisnikovoj aplikaciji (sidebar kartica, ekran Pretplata).
5. Upravljanje prijavama u Podršci (promena statusa, odgovor korisniku).
6. Poseban detalj jednog korisnika (plan, istorija naplata, aktivnost bez sadržaja): nije nacrtan, ne pravi bez dizajna.
7. Dodatne admin uloge (npr. podrška samo za čitanje): za sada samo jedan admin. Test uloga je samo user i admin; "Podrška" je tab, ne uloga. [ODLUČENO]
8. Obaveštenja admina (npr. mejl kad naplata ne uspe): nije predviđeno.

## Prilog A: mapa frejmova

Svaki fajl u `dizajn/` sadrži dva panela jedan pored drugog: levo svetla tema, desno tamna tema. Desktop frejmovi su 1440 px široki po panelu, telefon 365 px.

| Fajl | Ekran |
|---|---|
| Adm1.dc.html | Pregled |
| Adm2.dc.html | Korisnici i pretplate |
| Adm3.dc.html | Odobri besplatan pristup (modal preko Adm2) |
| Adm4.dc.html | Dnevnik radnji |
| Adm5.dc.html | Podrška |
| PhAdm0.dc.html | Telefon: meni "Više" sa stavkom Admin |
| PhAdm1.dc.html | Telefon: Pregled |
| PhAdm2.dc.html | Telefon: Korisnici i pretplate |
| PhAdm3.dc.html | Telefon: Odobri besplatan pristup (donji sheet) |
| PhAdm4.dc.html | Telefon: Dnevnik radnji |
| PhAdm5.dc.html | Telefon: Podrška |

## Prilog B: seed podaci za prototip

**Ukupno 128 korisnika (bez naloga sa besplatnim pristupom, uključujući vlasnikov; ti nalozi su u listi pod "Sve" ali se ne broje u Ukupno, četiri pilule ni MRR):** 18 probnih, 79 aktivnih, 5 naplata nije uspela, 26 otkazanih. 39 novih u poslednjih 30 dana. Mesečni prihod od pretplata 4.236 €. Tok: Registracija 128, Završen onboarding 109, Prva faktura 92, Plaćena pretplata 79. Korišćenje funkcija (prosek mesečno): AI poruke 23,5, Fakture 14,2, Kalendar 9,1, Mejlovi banke 6,8. Zahteva pažnju: 5 neuspelih naplata, 6 probnih koji ističu za 7 dana, 3 nove prijave problema. AI ocene: 91% korisnih, 31 ocena "Nije korisno" (Netačan podatak 14, Nije odgovorio na pitanje 9, Previše dugo 5, Drugo 3).

Registracije po danima (30 dana, od starijeg ka novijem): 0,1,1,2,1,0,2,1,1,3,1,0,2,1,2,1,0,1,2,1,3,1,1,2,0,2,1,2,1,3 (zbir 39).

**Korisnici (prvih osam prikazanih):**

| Korisnik | Firma | Plan | Status | Registrovan | Aktivnost | Sledeća naplata |
|---|---|---|---|---|---|---|
| Marko Petrović | Petrović Dizajn | Aktivna, 12 meseci | Aktivna | 12.03.2026. | Danas | 15.03.2027. |
| Jelena Ilić | Ilić Prevodi | Aktivna, 3 meseca | Aktivna | 28.09.2026. | Juče | 28.12.2026. |
| Nikola Jovanović | NJ Foto | Probni period | Probni, ističe za 3 dana | 10.11.2026. | Pre 2 dana | 23.11.2026. |
| Ana Stojanović | Stojanović Web | Aktivna, 6 meseci | Naplata nije uspela | 02.06.2026. | Pre 5 dana | Pokušaj 22.11. |
| Luka Marković | Marković Audio | Probni period | Probni, ističe za 12 dana | 17.11.2026. | Danas | 02.12.2026. |
| Milica Đorđević | MD Kopirajting | Otkazana | Otkazana | 14.01.2026. | Pre 18 dana | Pristup do 14.12. |
| Stefan Milošević | Stephortless PR | Besplatan pristup | Admin, besplatno | 01.11.2026. | Danas | Bez roka |
| Petar Nikolić | Nikolić Konsalting | Aktivna, 1 mesec | Aktivna | 05.11.2026. | Pre 3 dana | 05.12.2026. |

Ostalih 120 korisnika se generiše tako da brojke po statusima iz tabele iznad budu tačne.

**Dnevnik radnji (primer, 48 zapisa ukupno; filteri: Besplatan pristup 9, Popusti i produženja 17, Promene plana 14, Izvozi 8):**

| Vreme | Radnja | Korisnik | Detalj |
|---|---|---|---|
| 20.11.2026. 11:42 | Odobren besplatan pristup | Petar Nikolić | Pun plan, bez roka |
| 19.11.2026. 16:05 | Produžen probni period | Nikola Jovanović | +7 dana, do 30.11.2026. |
| 19.11.2026. 09:18 | Ručni popust | Ana Stojanović | 20% na sledeću naplatu |
| 17.11.2026. 14:30 | Ukinut besplatan pristup | Dragan Lazić | Pun plan vraćen na probni |
| 14.11.2026. 10:12 | Izvezen izveštaj | Sistem | Korisnici, 01. do 14. nov |
| 12.11.2026. 18:44 | Promenjen plan | Jelena Ilić | Iz 1 meseca u 3 meseca |
| 08.11.2026. 12:01 | Odobren besplatan pristup | Stefan Milošević | Pun plan, bez roka |

**Prijave problema:** "Faktura se ne šalje klijentu" (Fakture, pre 2 h, Otvoreno), "Mejl banke nije stigao" (Mejlovi banke, pre 7 h, Hitno), "Pogrešan rok za porez" (Porez i rokovi, juče, Otvoreno), "Ne mogu da promenim karticu" (Pretplata, pre 2 dana, Rešeno), "Izvoz knjige ne radi" (Knjiga prihoda, pre 4 dana, Rešeno). Otvorenih: 3.
