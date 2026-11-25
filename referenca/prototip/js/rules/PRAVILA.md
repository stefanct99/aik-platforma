# PRAVILA.md — poslovna pravila izdvojena u `js/rules/`

Ovaj dokument je za programera koji gradi pravu platformu. On opisuje osam poslovnih pravila izdvojenih u
Fazi 0 (plus `identifiers.js`, odeljak 9, dodat u Round 30 — UI-sanitizacija, ne poslovno pravilo, ali
testirana istim obrascem) iz prototipa ("tvoj AI knjigovođa") u čiste funkcije, bez state-a, bez DOM-a i
bez implicitnog čitanja trenutnog vremena — vreme se svuda prosleđuje kao parametar (`now`/`today`).

**Namena**: ovo je spisak pravila koja moraju da prežive prelazak sa prototipa na pravu platformu.
Svaka funkcija ispod treba da bude prepisana u TypeScript (sa tipovima) u pravoj platformi — logika se ne
menja, samo se prepisuje u pravi jezik/okruženje. Testovi (`*.test.js`, pokreću se sa `node --test
js/rules/*.test.js`) su izvršna specifikacija: ako TypeScript prepis producira iste rezultate za iste
ulaze kao testovi ispod, prepis je ispravan.

**Šta NIJE ovde, namerno**: `store.js` (state cele aplikacije), DOM/React komponente, `localStorage`,
NBS kurs *generisanje* (`U.nbsRate` u `js/utils.js` — ostaje pseudo-deterministički po datumu, van ovog
modula, iako ga neka pravila ispod *koriste* kroz injektovan parametar), i sve što je čisto UI (boje,
raspored, tekst dugmadi) — to je prikaz pravila, ne samo pravilo.

## Round 30 — pet ispravki (posle Faze 0, v55)

Svaka ispravka ispod ima test koji je NAJPRE pao protiv starog ponašanja, pa je implementacija promenjena
dok test nije prošao (potvrđeno pri pisanju, videti `node --test` izveštaj u STATUS.md za ovaj krug):

1. **Onboarding PIB/matični broj** (`js/rules/identifiers.js`, novo) — nije pravilo specifikacije nego
   UI-sanitizacija, ali testirano istim obrascem. Videti odeljak 9 ispod.
2. **Limit — prag 90%** (`js/rules/limit.js`, `limitWarningTier`) — videti odeljak 1 ispod.
3. **Praznici za bilo koju godinu** (`js/rules/taxDeadlines.js`, prepisano) — videti odeljak 4 ispod.
4. **Datumi koji ne postoje** (`js/rules/uvoz.js`, `parseSrDateFlexible` + novo `looksLikeDateShape`) —
   videti odeljak 7 ispod.
5. **Besplatan pristup povezan** (`js/rules/subscriptionAccess.js`, novo `effectiveAccess`) — videti
   odeljak 5 ispod.

---

## 1. Limit od 6.000.000 din

**Spec**: 8.4 (Limit od 6.000.000 din), 4.4 (Limit se uvek vidi).
**Fajl**: `js/rules/limit.js` — `computeLimitInfo({ fxIncomes, rsdIncomes }, now)`, konstanta `LIMIT = 6000000`.

**Pravilo**: klizni prozor od 365 dana unazad od `now` (NE kalendarska godina). Uplate sa `noInvoice:
true` ("bez fakture") se **isključuju** iz zbira — ovo je eksplicitna odluka iz specifikacije 8.4,
potvrđena u STATUS.md istorijatu uprkos privremenom zahtevu da uđu u zbir; ne menjati bez nove, jasne
odluke. Devizne uplate se računaju po kursu **sačuvanom uz uplatu** (`amount*rate`), kurs se ne izvodi
ponovo iz datuma. Rezultat: `total` (zbir u din), `pct` (procenat limita, **ne** ograničen na 100 —
raste i preko), `remaining` (nikad ispod 0), `monthsOfHistory`.

**Pragovi 80/90/100 (Round 30, nalaz 2 — ispravljeno)**: `limitWarningTier(pct)` vraća `null`/`80`/`90`/`100`
— tri nivoa iz spec 8.4 ("80% upozorenje, 90% jače upozorenje, 100%+ kritično"). Koriste ga
`js/pocetna.js` (`LimitWarningBanner`) i `js/knjiga.js` (`KnjigaLimitWarning`, isti tekst u kraćem obliku)
za Početnu i Knjigu prihoda — oba ekrana sad imaju sve tri tačke, ne samo 80/100 binarno kao ranije. Oba
takođe zovu `Actions.Business.checkLimitThreshold()` koji šalje JEDNO obaveštenje (zvonce) po pragu, prvi
put kad se taj prag dostigne (`state.limitNotifTier` pamti najviši već prijavljen prag) — baner ostaje
TRAJNO vidljiv dok uslov važi (kao i ostale trake stanja u aplikaciji), samo se zvonce ne ponavlja.
**Kalendar**: nema mesta u nijednom frejmu gde bi limit upozorenje trebalo da se prikaže (spec 7.11 ne
pominje limit uopšte) — namerno NIJE dodato, prijavljeno umesto izmišljeno. **AI razgovor**:
`AI_SCENARIOS.limit` (actions.js) već dinamički prikazuje tačan procenat za bilo koji prag; statički
scenario `limit-prekoracen` već pominje "80% i 90%" u tekstu — oba potvrđena, bez izmene.

**Tabela testova** (`limit.test.js`, 9 testova):

| Test | Ulaz (skraćeno) | Očekivani izlaz |
|---|---|---|
| prazno stanje | `fxIncomes:[], rsdIncomes:[]` | `total=0, pct=0, remaining=6000000` |
| tačno 6.000.000 din | jedna RSD uplata 6.000.000 | `total=6000000, pct=100, remaining=0` |
| preko 100% | RSD uplata 6.600.000 | `pct=110` (ne staje na 100), `remaining=0` |
| **granica: tačno 365 dana pre now** | uplata na `now - 365 dana` | ULAZI u zbir (`total=1000`) — granica je `>=` |
| **granica: 366 dana pre now** | uplata na `now - 366 dana` | NE ulazi (`total=0`) |
| uplata bez fakture | jedna sa `noInvoice:true` (100.000) + jedna bez (50.000) | samo 50.000 ulazi u `total` |
| devizni kurs sačuvan | FX uplata `amount:1000, rate:117.2` | `total=117200` (1000×117.2, kurs se NE preračunava) |
| **prestupna godina (2024)** | uplata 29.02.2024, `now` = 01.03.2024 | `total=1000` (1 dan unazad, bez greške na 29. feb) |
| RSD + FX zajedno | FX 100×100 + RSD 5000 | `total=15000` |
| **limitWarningTier granice** | `79.9`/`80`/`89.99`/`90`/`100`/`150` | `null`/`80`/`80`/`90`/`100`/`100` (preko 100 ostaje 100, nema četvrtog nivoa) |

---

## 2. Status fakture izveden iz datuma i uplata

**Spec**: 8.1 (Statusi fakture i prelazi).
**Fajl**: `js/rules/invoiceStatus.js` — `invoiceTotal(inv)`, `invoiceDueDate(inv)`,
`isInvoiceLate(inv, today)`, `invoiceEffectiveStatus(inv, today)`, `lateDays(inv, today)`.

**Pravilo**: pet stanja — Nacrt, Poslata, Kasni, Plaćena, Stornirana. "Kasni" **nije upisano polje**, nego
se **izvodi** pri svakom pozivu iz `today`: samo faktura sa upisanim statusom `Poslata` može efektivno
postati "Kasni", i to tek pošto prođe `invoiceDueDate` (`issueDate + dueDays`). Nacrt/Plaćena/Stornirana
nikad ne "kasne", bez obzira na datume. `lateDays` nikad nije negativan (pre roka vraća 0).

**Tabela testova** (`invoiceStatus.test.js`, 6 testova):

| Test | Ulaz (skraćeno) | Očekivani izlaz |
|---|---|---|
| `invoiceTotal` podrazumevano qty | stavke `{price:100}` i `{qty:2,price:50}` | `200` |
| **rok preko granice meseca** | izdato 31. januara 2026, `dueDays:7` | rok = 7. februar (januar ima 31 dan) |
| Nacrt/Plaćena/Stornirana nikad ne kasne | rok davno prošao (2020→2030) | `isInvoiceLate=false` za sva tri statusa |
| **granica: tačno na rok** | `today` = tačan dan roka | `isInvoiceLate=false` |
| **granica: dan posle roka** | `today` = rok+1 dan | `isInvoiceLate=true` |
| `invoiceEffectiveStatus` | Poslata posle roka vs. Plaćena/Nacrt posle istog datuma | samo Poslata→"Kasni", ostali nepromenjeni |
| `lateDays` nikad negativan | `today` = rok, rok+3, pre roka | `0, 3, 0` |

---

## 3. Numeracija faktura

**[PREGAŽENO u pravoj platformi, Korak 8a — Stefan je odlučio drugačije pravilo od onoga što je ovaj
odeljak i `invoiceNumbering.js` opisivalo.]** Novi format je `N/GG-M` (N = redni broj u KALENDARSKOJ
GODINI IZDAVANJA, GG = poslednje dve cifre te godine, M = mesec izdavanja bez vodeće nule — primeri:
`1/27-1`, `25/26-11`, `41/26-12`), brojač se vraća na 1 svakog 1. januara. Videti
`referenca/specifikacije/PLATFORMA_SPECIFIKACIJA.md` odeljak 8.2 (ažuriran) i `src/lib/invoice-
numbering.ts`/`src/lib/invoices.ts` u pravoj platformi za puno pravilo i implementaciju. `js/rules/
invoiceNumbering.js` ispod i njegovi testovi NISU menjani (ovo je prototip, van obima platforme) — opis
ispod ostaje tačan ZA PROTOTIP, samo više nije pravilo koje prava platforma sledi.

**Spec**: 8.2 (Numeracija faktura) - stari opis, pre odluke sa Stefanom.
**Fajl**: `js/rules/invoiceNumbering.js` — `nextInvoiceNumber(numbers, prefix='25/26')`.

**Pravilo (prototip, staro)**: format `"<prefiks>-<broj>"` (npr. `"25/26-6"`), **bez vodeće nule**. Sledeći broj nastavlja
posle **najvećeg** postojećeg broja u nizu (ne posle broja stavki — storno zadržava svoj broj, pa niz
može imati rupe, i to je u redu). Nevažeći/nebrojčani nastavci (korisnik ručno upiše stari broj iz
prethodnog sistema knjigovođe pri uvozu) se **ignorišu**, ne ruše `Math.max`. Prazna lista počinje od 1.
Uvezene fakture (iz Uvoza) ulaze u isti niz brojeva i računaju se u "najveći".

**Tabela testova** (`invoiceNumbering.test.js`, 6 testova):

| Test | Ulaz | Očekivani izlaz |
|---|---|---|
| prazna lista | `[]` | `"25/26-1"` |
| nastavlja posle najvećeg (rupe ok) | `['25/26-1','25/26-3']` | `"25/26-4"` |
| bez vodeće nule | `['25/26-6']` | `"25/26-7"` (ne `"-07"`) |
| nevažeći nastavci se ignorišu | `['25/26-5','STARI-SISTEM-ABC']` | `"25/26-6"` |
| uvezene fakture se računaju | `['25/26-2','25/26-20']` | `"25/26-21"` |
| podrazumevani prefiks | `nextInvoiceNumber([])` bez drugog argumenta | `"25/26-1"` |

---

## 4. Rokovi za porez

**Spec**: 8.7 (Rokovi za porez i doprinose).
**Fajl**: `js/rules/taxDeadlines.js` — `orthodoxEaster(year)`, `stateHolidayAnchors(year)`,
`holidaySetForYear(year)`, `isWeekend(d)`, `isHoliday(d)`, `nextBusinessDay(d)`, `taxDueDate(key)` (key je
`"YYYY-MM"`), `HOLIDAYS_2026` (zadržano radi kompatibilnosti, sad IZRAČUNATO za 2026, ne ručno prepisano).

**Pravilo**: akontacija dospeva 15. u mesecu, pomerena na **sledeći radni dan** kad 15. padne na vikend
ili praznik (uključujući lanac uzastopnih praznika/vikenda).

**Round 30, nalaz 3 (ISPRAVLJENO)**: praznici se sad računaju OPŠTIM ALGORITMOM za bilo koju godinu, ne
više fiksan spisak samo za 2026. **Izvor**: "Zakon o državnim i drugim praznicima u Republici Srbiji"
("Sl. glasnik RS", br. 43/2001, 101/2007, 92/2011) — konsolidovan tekst pročitan sa paragraf.rs (Round 30
istraživanje; **NIJE primarni izvor/Službeni glasnik sâm**).

Neradni dani (čl. 1/1a/2): Nova godina (1-2. januar), Božić (7. januar), Sretenje/Dan državnosti (15-16.
februar), Vaskršnji praznici (Veliki petak do 2. dana Vaskrsa — 4 dana, pravoslavni Uskrs po algoritmu
ispod), Praznik rada (1-2. maj), Dan primirja (11. novembar). **Namerno izostavljeno** (zakon ih izričito
NE tretira kao neradne): Dan pobede (9. maj, čl. 3 ga izuzima iako je naveden kao praznik) i "radni
praznici" iz čl. 5 (Sveti Sava, Dan sećanja na žrtve holokausta, Vidovdan, Dan sećanja na srpske žrtve u
Drugom svetskom ratu — zakon kaže "praznuju se RADNO").

**Pravoslavni Uskrs** (`orthodoxEaster`): Julijanski algoritam (Meeus/Jones/Butcher, Julijanska varijanta)
+ 13 dana razlike kalendara (važi 1900-2099, [PROVERITI] van tog opsega). Nezavisno proverene vrednosti:
2026 = 12. april, 2027 = 2. maj, 2028 = 16. april (calendardate.com i dr.).

**čl. 3a (nadoknada)**: kad datum na koji se praznik slavi padne u NEDELJU, ne radi se ni prvog narednog
radnog dana — primenjeno ovde na SVAKI pojedinačni datum iz spiska praznika (ne samo "prvi dan" kad ih ima
više uzastopnih).

**[PROVERITI], nerešene pravne nedoumice (nisu primarni izvor, dokumentovano umesto rešeno)**:
1. Tekst pročitan sa paragraf.rs ne pokazuje datum konsolidacije niti potvrđuje da li postoji izmena posle
   92/2011 (npr. pominjana 2023/2024 izmena).
2. Tekst pominje nadoknadu SAMO za nedelju, ne i za subotu — ovde NEMA nadoknade za praznik u subotu.
3. **Vaskrsna nedelja je PO DEFINICIJI uvek nedelja**, pa nadoknada primenjena po pojedinačnom datumu (ne
   po celom višednevnom prazniku) znači da Vaskršnji praznici dobijaju dodatni neradni dan SVAKE godine —
   nisam mogao da potvrdim da li zakon ovo stvarno primenjuje na višednevne praznike ili samo na
   jednodnevne proslave. Testirano kao TRENUTNO ponašanje, ne kao potvrđeno pravno tačno.

**Tabela testova** (`taxDeadlines.test.js`, 12 testova):

| Test | Ulaz | Očekivani izlaz |
|---|---|---|
| orthodoxEaster 2026/2027/2028 | `orthodoxEaster(2026\|2027\|2028)` | 12. april / 2. maj / 16. april |
| Vaskršnji praznici van 2026 | datumi oko Uskrsa 2027/2028 | Veliki petak i 2. dan Vaskrsa su praznik za obe godine |
| fiksni praznici za bilo koju godinu | 2026/2027/2028 × 8 fiksnih datuma | svi `true` |
| **Dan pobede (9. maj) NIJE neradan** | `isHoliday(9.5.2026)` | `false` (čl. 3 ga izričito izuzima) |
| "radni praznici" (čl. 5) NISU neradni | Sveti Sava (27.1), Vidovdan (28.6) | `false` za oba |
| novembar 2026 | `taxDueDate('2026-11')` (15. nov. je nedelja) | 16. novembar (ponedeljak) |
| **lanac vikend+praznik** | `taxDueDate('2026-02')` | rezultat je radni dan; svaki preskočeni dan je proverljivo vikend ili praznik |
| **radi za 2027/2028, ne samo 2026** | `taxDueDate('2027-02')` (Sretenje je fiksan datum, Mon/Tue) | 17. februar (sreda) |
| radni dan bez praznika | `nextBusinessDay(17.11.2026)` | nepromenjen |
| **čl. 3a: Sretenje u nedelji (2026)** | 15.2.2026 je nedelja, 16. je već praznik | 17. februar je dodatni neradni dan, 18. nije |
| **čl. 3a: Uskrs u nedelji (2026)** | 12.4.2026 je nedelja, 13. je već praznik | 14. april je dodatni neradni dan, 15. nije |
| **[PROVERITI] subota bez nadoknade** | 2.5.2026 (subota, 2. dan Praznika rada) | 4. maj (ponedeljak posle) NIJE neradan |

---

## 5. Pretplata i pristup

**Spec**: 5.5 (Lista kontrola prava pristupa po stanju naloga); ADMIN_SPECIFIKACIJA.md odeljak 6 (besplatan pristup).
**Fajl**: `js/rules/subscriptionAccess.js` — `computeAccess(sub, now)`, `isFreeAccessActive(freeAccess, now)`,
`effectiveAccess(sub, freeAccess, now)` (Round 30, novo), `freeAccessCardInfo(freeAccess, now)` (mala
ispravka posle Round 30, novo).

**Pravilo**: pet mogućih stanja naloga (Probni, Aktivna, Istekla, Naplata nije uspela, Otkazana).
`computeAccess` vraća `aiPaused` — da li je AI knjigovođa pauziran. "Istekla" pauzira. "Otkazana" radi
**normalno do `accessUntil`** (kraj već plaćenog perioda), posle toga je isto kao "Istekla"
(`canceledPastEnd:true`). Probni period **nikad** ne pauzira AI, čak ni pri isteku (to ide kroz dnevnu
kvotu poruka, posebno pravilo, nije ovde). "Naplata nije uspela" i "Aktivna" ne pauziraju.

**Round 30, nalaz 5 (POVEZANO)**: `effectiveAccess(sub, freeAccess, now)` slaže `isFreeAccessActive` PREKO
`computeAccess` — kad je besplatan pristup aktivan, `aiPaused` je UVEK `false` bez obzira na stvarno stanje
pretplate (daje pun pristup i nalogu koji ima istekao probni period ili je otkazan). Kad besplatan pristup
prestane (ukinut ili mu prođe rok), `effectiveAccess` se vraća na stvarno stanje pretplate ispod (ništa se
trajno ne menja u samoj pretplati). `selectors.js`'s `Sel.subscriptionAccess` sad poziva `effectiveAccess`
umesto `computeAccess` direktno, čitajući novo `state.freeAccess` polje (`{noEnd}` ili `{untilIso}` ili
`null`, paralelno sa `state.subscription`).

**Žično u aplikaciji**: `Actions.Admin.grantFreeAccess`/`revokeFreeAccess` (admin ekran, Korisnici → meni
tri tačke → "Odobri"/"Ukini besplatan pristup") rade na ADMIN-OVOM fejk 128-pool-u (`adminData.users`/
`adminData.freeAccess`), ČUVAJUĆI `priorStatus`/`priorPlan`/`priorBadge`/`priorNextBilling` da "Ukini" vrati
tačno prethodno stanje — ovo JESTE stvarna radnja, testirana uživo (grant pa revoke, potvrđeno da se vraća
prethodni status/plan/bedž). Za STVARNI (jedini) nalog u prototipu nema pravog puta kroz UI da admin
dodeli SEBI besplatan pristup (fejk-pool je odvojen od `state.subscription`) — dodat je `dev.*` test-
prekidač (`Actions.Dev.setFreeAccess(true/false)`, u Razvojnom meniju, "Besplatan pristup (test)") da se
`effectiveAccess` logika proveri uživo na stvarnom nalogu, isti obrazac kao postojeći limit-override test.
**Prikaz u korisnikovoj (ne-admin) aplikaciji — mala ispravka POSLE Round 30 (tekst, ne izgled)**: Round
30 je ostavio ovo neizgrađeno i prijavio nalaz (sidebar kartica je prikazivala "Pretplata aktivna /
Obnavlja se 1. jan 1970." za nalog sa besplatnim pristupom i `nextChargeAt:null`). Stefan je tražio samo
ISPRAVKU TEKSTA, ne nov izgled: nova `freeAccessCardInfo(freeAccess, now)` vraća `null` (nije aktivan) ili
`{noEnd, untilIso}` (bez datuma — formatiranje ostaje na UI, svaki ekran ima svoj format). `js/shell.js`'s
`TrialCard` je sad prva provera (pre Probni/qr_renewal/Otkazana/else grana): kad je aktivan, prikazuje
"Besplatan pristup" / "Bez roka" ili "Do 14. dec 2026" (isti `fmtShortYear` format kao ostale kartice),
isti vizuelni ton kao "Pretplata aktivna" (bez dugmeta). Ekran Pretplata (`js/pretplata.js`,
`UpravljanjeScreen`): red "Sledeća naplata"/"Neuspela naplata" je SAKRIVEN kad je besplatan pristup
aktivan (pokazivao je npr. "—, 276 €" za Otkazana+besplatan pristup — cena koja se zapravo ne naplaćuje),
ostali redovi (Status, Plan, Period, Način plaćanja) ostaju nepromenjeni, nije izmišljen nov red. **Nije provereno/nije u obimu (u ovoj ispravci)**: `sub-decline-banner` (red "Naplata nije uspela" sa
dugmićima za ponovni pokušaj na ekranu Pretplata) nije dirana — veći je od "reda" i nije eksplicitno
tražena.

**Poslednja ispravka (jedinstven selektor pristupa svuda)**: nalaz iz prošle ispravke — Početna gornji
baner (`SubscriptionStatusBanner`, preko `Sel.subscriptionBanner`) i dalje je pokazivao "AI knjigovođa je
pauziran" uz besplatan pristup — je sad ISPRAVLJEN. Uzrok: `js/selectors.js`'s `subscriptionBanner`
proveravao je `sub.status==='Istekla' || (Otkazana && canceledPastEnd)` DIREKTNO, posebnom formulom, ne
preko `Sel.subscriptionAccess(state).aiPaused` koji svi OSTALI prikazi (Početna `AiPausedPanel`, AI
knjigovođa chat composer, sidebar kartica, `actions.js`'s provere pre slanja/čitanja mejla) već koriste.
Ispravka: `subscriptionBanner`'s `kind:'expired'` grana sad čita ISTI `subscriptionAccess(state).aiPaused`
— nema više posebne formule. Pregledano i svih pet traženih mesta (Početna baner + panel, AI knjigovođa,
Pretplata, Obaveštenja, sidebar baner): **Obaveštenja nema nijednu poruku o pauziranju AI** (spec 8.10 ne
navodi "AI pauziran" kao tip obaveštenja — potvrđeno, ništa za ispraviti); ostala četiri već su ili
ispravljena ili su oduvek koristila ispravan selektor.

**Tabela testova** (`subscriptionAccess.test.js`, 18 testova):

| Test | Ulaz | Očekivani izlaz |
|---|---|---|
| Istekla | `{status:'Istekla'}` | `aiPaused=true` |
| Probni nikad ne pauzira | `{status:'Probni', trialDaysLeft:0}` | `aiPaused=false` |
| Otkazana pre accessUntil | `accessUntil` u budućnosti | `aiPaused=false, canceledPastEnd=false` |
| Otkazana posle accessUntil | `accessUntil` u prošlosti | `aiPaused=true, canceledPastEnd=true` |
| Naplata nije uspela / Aktivna | oba statusa | `aiPaused=false` za oba |
| isFreeAccessActive bez roka | `{noEnd:true}` | `true` |
| isFreeAccessActive sa rokom | `untilIso` u budućnosti vs. prošlosti | `true` / `false` |
| **effectiveAccess: istekao probni + besplatan pristup** | `{status:'Istekla'}, {noEnd:true}` | `aiPaused=false, freeAccess=true` |
| **effectiveAccess: besplatan pristup sa prošlim rokom** | `{status:'Istekla'}, {untilIso: prošlost}` | `aiPaused=true, freeAccess=false` (pada na stvarno stanje) |
| **effectiveAccess: bez besplatnog pristupa = isto kao computeAccess** | `{status:'Aktivna'}, null` | identično `computeAccess` |
| **effectiveAccess: ukidanje vraća prethodno stanje** | `{status:'Istekla'}` sa pa bez `{noEnd:true}` | `aiPaused` false→true (Istekla ostaje Istekla) |
| isFreeAccessActive prazan ulaz | `null`, `{}` | `false` za oba |
| **freeAccessCardInfo: nije aktivan** | `null`, i `{untilIso: prošlost}` | `null` za oba |
| **freeAccessCardInfo: bez roka** | `{noEnd:true}` | `{noEnd:true, untilIso:null}` |
| **freeAccessCardInfo: sa rokom u budućnosti** | `{untilIso: budućnost}` | `{noEnd:false, untilIso: isti}` |
| **effectiveAccess: Probni trialDaysLeft≤0, sa i bez besplatnog pristupa** | `{status:'Probni',trialDaysLeft:0}`, `null`/`{noEnd:true}` | `aiPaused=false` za oba (potvrđuje da Početna baner sad ispravno NE prikazuje "pauziran" za ovaj slučaj) |
| **effectiveAccess: Otkazana posle roka + besplatan pristup** | `{status:'Otkazana',accessUntil:prošlost}`, `{noEnd:true}` | `aiPaused=false, canceledPastEnd=false` |
| **effectiveAccess: Istekla bez besplatnog pristupa i dalje pauzira** | `{status:'Istekla'}`, `null` | `aiPaused=true` (ispravka ne sme da sakrije stvarnu pauzu) |

---

## 6. Matrica autonomije i slanje obrasca banci

**Spec**: 4.1 (Matrica autonomije), 7.7 (Mejlovi banke — izuzetak po klijentu), 8.5 (Prodaja deviza).
**Fajl**: `js/rules/autonomy.js` — `effectiveAutoSend(client, autonomySettings)`,
`effectiveFxMode(client, autonomySettings)`, `computeFxSale(amount, currency, mode, pct, rate)`.

**Pravilo**: globalno podešavanje (`globalMode: 'ask'|'auto'`, i globalni `fxMode`) važi za sve klijente,
**osim** ako klijent ima sopstveni izuzetak koji ga pregazi. Za `fxMode`, vrednost `'none'` na klijentu
znači eksplicitno "nema izuzetka, koristi globalni" (isto kao `null`/odsutno polje — `'none'` postoji kao
posebna vrednost u formi). `computeFxSale` računa **koliko deviza se prodaje** za dati priliv po
efektivnom režimu: `book_only` → ništa (`null`), `sell_all` → ceo iznos, `sell_part` → `amount*pct/100`,
zaokruženo. Napomena: samo IZVRŠENJE (upis u store, toast) ostaje u `actions.js` — to je efekat, ne
pravilo.

**Tabela testova** (`autonomy.test.js`, 8 testova):

| Test | Ulaz | Očekivani izlaz |
|---|---|---|
| autoSend bez izuzetka | `client=null`, `globalMode:'auto'` / `'ask'` | `true` / `false` |
| autoSend izuzetak pregazi globalno | `{autoSend:true}` uz `globalMode:'ask'` | `true` (klijent pobeđuje) |
| fxMode bez izuzetka | `client=null` ili `{fxMode:'none'}` ili `{fxMode:null}` | prati globalni `fxMode` |
| fxMode izuzetak pregazi globalni | `{fxMode:'sell_all'}` uz globalni `'book_only'` | `'sell_all'` |
| computeFxSale book_only | `mode:'book_only'` | `null` |
| computeFxSale sell_all | `amount:1000, mode:'sell_all'` | `{amount:1000, currency, rate}` |
| computeFxSale sell_part | `amount:1000, pct:50` | `{amount:500, percent:50}` |
| **sell_part zaokruživanje** | `amount:333, pct:33` | `Math.round(333*33)/100` (proveri tačnu formulu pri prepisu — zaokružuje se `amount*pct`, pa tek onda deli sa 100, ne `amount*pct/100` zaokruženo) |

---

## 7. Uvoz (Prenos dosadašnjeg poslovanja)

**Spec**: UVOZ_SPECIFIKACIJA.md odeljci 4–6; deli pravilo limita sa odeljkom 1/8.4 iznad.
**Fajl**: `js/rules/uvoz.js` — `uvozCsvTemplate()`, `parseUvozCsv(text)`, `parseSrDateFlexible(str)`,
`looksLikeDateShape(str)` (Round 30, novo), `parseSrNumber(str)`, `findClientId(clients, name)`,
`isDuplicate(deps, cand)`, `buildItem(raw, deps, nbsRateFn, now)`, `projectedLimitAdd(items, now)`.

**Pravilo**: parsira SAMO sopstveni CSV šablon (zaglavlje + srpski format datuma/broja). `parseSrNumber`
pretvara `"1.200,00"` → `1200` (tačka-hiljade, zarez-decimala). `parseSrDateFlexible` prihvata
`dd.mm.gggg[.]` ili ISO `gggg-mm-dd`, i eksplicitno proverava mesec (1–12) **i dan protiv stvarnog broja
dana u datom mesecu** (`daysInMonth`, Round 30 ispravka — videti dole) **pre** konstrukcije `Date` objekta
— jer `new Date(g,m,d)` inače tiho prelama van-opsega vrednosti (`32.13.2026` bi inače postalo
`01.02.2027`). `isDuplicate` traži postojeću stavku sa **istim danom + iznosom (tolerancija ±0,5) + brojem
fakture (ako postoji)** među VEĆ SAČUVANIM stavkama (ne proverava protiv drugih redova u istom pregledu
uvoza). `buildItem` sastavlja jednu stavku pregleda: nalazi klijenta po imenu, računa iznos u dinarima
(kurs injektovan kroz `nbsRateFn`, ne pozvan direktno), i označava status `'ok'` ili `'review'` sa listom
objašnjenja (nema datum, nema iznos, bez fakture, mogući duplikat). `projectedLimitAdd` računa efekat na
limit **istim pravilom** kao `js/rules/limit.js` (365 dana, isključuje bez fakture) — ovo mora da ostane
usklađeno sa limit.js, inače "Šta će se promeniti" u Uvozu pokazuje drugačiji broj od onoga što Knjiga
prihoda stvarno prikaže posle čuvanja (ovo je bila stvarna greška, ispravljena u 28. krugu, videti
STATUS.md).

**Round 30, nalaz 4 (ISPRAVLJENO — bio je NAĐEN NALAZ u Fazi 0)**: `parseSrDateFlexible` sad proverava dan
protiv STVARNOG broja dana u datom mesecu (`daysInMonth(year,month) = new Date(year,month,0).getDate()`,
uključujući prestupne godine za februar), ne više samo protiv fiksnog opsega 1–31. `"31.04.2026"` (april
ima 30 dana) i `"29.02.2026"` (2026 nije prestupna) sad ispravno vraćaju `null` umesto da se tiho prelome u
sledeći dan/mesec. Nova `looksLikeDateShape(str)` proverava samo OBLIK (regex), bez obzira da li je
vrednost moguć datum — `buildItem` je koristi da razlikuje dve UI poruke: **"Taj datum ne postoji."**
(oblik prepoznat, vrednost nemoguća, npr. `"31.04.2026"`) od **"Nisam prepoznala datum"** (ne liči na
datum uopšte, npr. `"nešto besmisleno"`). Jedino mesto u aplikaciji sa slobodnim unosom datuma kao teksta
je Uvoz CSV (sve ostalo — ručni unos uplate, Uvoz "Unesi ručno" korak — koristi pravi `<input type=date>`,
koji po definiciji ne može da proizvede nepostojeći datum) — ispravka ovde pokriva "svuda" iz zahteva.

**Tabela testova** (`uvoz.test.js`, 22 testa):

| Test | Ulaz (skraćeno) | Očekivani izlaz |
|---|---|---|
| parseSrNumber format | `"1.200,00"`, `"85.000,50"`, `""`, `null` | `1200`, `85000.5`, `NaN`, `NaN` |
| datum dd.mm.gggg(.) | `"15.03.2026."` | 15. mart 2026. |
| **granica: 31 u mesecu sa 31 danom** | `"31.01.2026"` | validan, 31. januar |
| mesec/dan van opsega 1–31/1–12 | `"32.13.2026"` | `null` (odbijen, ne prelama) |
| **ISPRAVLJENO: 31 u mesecu sa 30 dana** | `"31.04.2026"` | `null` (odbijen — ranije se tiho pretvaralo u 1. maj) |
| **29.02. neprestupna vs. prestupna** | `"29.02.2026"` / `"29.02.2024"` | `null` / 29. februar 2024 validan |
| **31. februar (ISO oblik)** | `"2026-02-31"` | `null` |
| **looksLikeDateShape** | `"31.04.2026"` / `"neki tekst"` / `""` | `true` (oblik tačan) / `false` / `false` |
| ISO format | `"2026-03-15"` | 15. mart 2026. |
| prazno/neprepoznatljivo | `""`, `"neki tekst"` | `null` za oba |
| parseUvozCsv sopstveni šablon | `uvozCsvTemplate()` | 2 reda, ispravno parsirani navodnici oko iznosa |
| parseUvozCsv prazno | `""`, samo zaglavlje | `[]` za oba |
| findClientId bez obzira na veličinu slova | `"acme inc."` vs. klijent `"Acme Inc."` | pronađen; nepostojeći/prazan → `null` |
| isDuplicate pun poklapanje | isti dan+iznos+broj fakture | `true` |
| isDuplicate različit broj fakture | isti dan/iznos, drugi broj | `false` |
| isDuplicate van tolerancije | iznos 1200 vs. 1201 (tolerancija 0,5) | `false` |
| buildItem ispravan red | validni datum/iznos, bez izuzetaka | `status:'ok'`, `issues:[]` |
| buildItem bez fakture | `noInvoice:true` | `status:'review'`, objašnjenje prisutno |
| buildItem neprepoznat CSV datum | `dateRaw:"nešto besmisleno"`, `amount:0` | `status:'review'`, "Nisam prepoznala datum" |
| **buildItem datum koji ne postoji** | `dateRaw:"31.04.2026"` | `status:'review'`, **"Taj datum ne postoji."** |
| buildItem prazan ručni red | bez `dateRaw`/`amountRaw`, `date:''`, `amount:0` | `issues:[]` (čeka unos, ne prijavljuje grešku unapred) |
| buildItem injektovan kurs | `nbsRateFn` špijuniran, vraća 117.2 za EUR | `item.rate=117.2`, funkcija pozvana sa valutom `'EUR'`, ne pozvana interno |

---

## 8. Množina i vokativ

**Spec**: 4.5 (Format brojeva, datuma i jezik — lokalizacija), korišćeno u 7.2 (Početna, pozdrav "Dobro
jutro, Stefane"). Nije posebno specificirano kao gramatičko pravilo u specifikaciji — ovo je
implementaciona odluka prototipa za srpski jezik.
**Fajl**: `js/rules/text.js` — `plural(n, forms)`, `pluralIdx(n)`, `firstNameVoc(fullName)`.

**Pravilo — množina (opšte, radi ispravno za bilo koju imenicu uz tri zadata oblika)**: zadnja dva cifre
broja odlučuju oblik — `11`–`14` su UVEK "mnogo" (čak i `111`, `211`...), inače zadnja cifra `1` →
jednina, `2`–`4` → "malo" (genitiv jednine), inače → "mnogo" (genitiv množine). `forms` je niz od tri
oblika `[jednina, malo, mnogo]` (npr. `['dan','dana','dana']`).

**Pravilo — vokativ imena (POZNATO OGRANIČENJE, namerno NEREŠENO ovde)**: `firstNameVoc` **nije** opšti
srpski gramatički motor, nego jedno prosto pravilo: ime na samoglasnik ostaje isto, inače se dodaje "e".
Radi za većinu imena korišćenih u aplikaciji (Stefan→Stefane, Marko→Marko, Nikola→Nikola, Dragan→Dragane,
Ana→Ana), ali daje **pogrešan** oblik za imena sa ispadanjem samoglasnika u vokativu — npr. "Petar" bi po
ovom pravilu dobilo "Petare", a ispravan srpski vokativ je "Petre". Test ispod to eksplicitno pokazuje
kao poznatu grešku. **Prava platforma treba pravi gramatički rečnik ili bibilioteku za srpski vokativ**,
ne ovo prosto pravilo, ako želi ispravan vokativ za sva imena.

**Tabela testova** (`text.test.js`, 7 testova):

| Test | Ulaz | Očekivani izlaz |
|---|---|---|
| jednina | `1, 21, 31, 101` | `pluralIdx=0` za sve |
| malo | `2, 4, 22` | `pluralIdx=1` za sve |
| **mnogo uključujući 11–14 izuzetak** | `0, 5, 11, 12, 14, 111, 211` | `pluralIdx=2` za sve (111/211 i dalje "mnogo" jer zadnja dva cifre su 11) |
| plural vraća oblik iz niza | `plural(1,['dan','dana','dana'])`, `plural(5,...)`, `plural(2,['stvar','stvari','stvari'])` | `'dan'`, `'dana'`, `'stvari'` |
| vokativ na samoglasnik nepromenjen | `"Nikola Jovanović"`, `"Ana Stojanović"` | `"Nikola"`, `"Ana"` |
| vokativ na suglasnik +e | `"Stefan Milošević"`, `"Marko Petrović"`, `"Dragan Lazić"` | `"Stefane"`, `"Marko"` (završava na samoglasnik), `"Dragane"` |
| **POZNATO OGRANIČENJE: "Petar"** | `"Petar Nikolić"` | `"Petare"` (NE ispravno `"Petre"`) — namerno dokumentovana greška |

---

## 9. Identifikatori firme (PIB/matični broj) — Round 30, novo

**Spec**: 3.1 (Firma: "PIB (9 cifara), matični broj (8 cifara)").
**Fajl**: `js/rules/identifiers.js` — `sanitizeDigits(str, maxLen)`, `isValidPib(str)`, `isValidMb(str)`.

**Pravilo**: `sanitizeDigits` uklanja sve osim cifara iz unetog/nalepljenog teksta (razmaci, crte, tekst
oko brojeva) i seče na `maxLen` ako je dat — reusable za bilo koje "samo cifre" polje, ne samo PIB/MB.
`isValidPib`/`isValidMb` proveravaju tačnu dužinu (9/8 cifara).

**Round 30, nalaz 1 — pravi uzrok i ispravka (ovo NIJE poslovno pravilo, nego ispravka prototipske mane)**:
onboarding Korak 1 (`js/onboarding.js`, `Step1`) je inicijalizovao polja PIB/Matični broj iz
`state.business` — ali prototip ima JEDAN deljeni seed poslovni zapis (nema pravog "praznog" naloga po
registraciji), pa su ta polja UVEK stizala već popunjena demo vrednošću, do tačno `maxLength` (9/8 cifara).
Ručno kucanje bez prethodnog brisanja je zato izgledalo kao da polje "ne prima unos" (stvarni uzrok:
standardno ponašanje `maxLength` na punom polju, ne mana React-a/maske — potvrđeno direktnim JS testom da
`onChange`/`sanitizeDigits` ispravno rade kad polje ima mesta). **Ispravka**: `Step1` sad proverava da li
`business.pib`/`business.mb` i dalje JEDNAKI seed podrazumevanim vrednostima
(`window.AIK.Seed.business.pib/mb`) — ako jesu, polje počinje PRAZNO (korisnik kuca svoje od nule); ako je
korisnik VEĆ sačuvao svoj PIB/MB u OVOM onboarding toku (klik Nastavi pa Nazad), vraća se ono što je sâm
uneo, ne prazno. Ovo je osobina JEDNOG-deljenog-seed-a u prototipu, ne prava poslovna logika — prava
platforma kreira stvarno prazan zapis po registraciji i ovaj heuristički test ("da li je jednako seed
vrednosti") joj NIJE potreban. Dodato i `inputMode="numeric"` + `pattern="[0-9]*"` na oba polja (tastatura
sa ciframa na telefonu, potvrđeno da postoji u DOM-u — vizuelna provera prave tastature zahteva pravi
telefon/emulator van ovog alata, "nije proveravano" uživo na fizičkom uređaju).

**Tabela testova** (`identifiers.test.js`, 6 testova):

| Test | Ulaz | Očekivani izlaz |
|---|---|---|
| sanitizeDigits uklanja sve osim cifara | `"112 233 445"`, `"112-233-445"`, `"PIB: 112233445"` | `"112233445"` za sva tri |
| sanitizeDigits prazno/null/undefined | `''`, `null`, `undefined` | `''` za sve |
| **sanitizeDigits maxLen seče** | `"1122334455555"` sa `maxLen:9` | `"112233445"` (seče na 9) |
| sanitizeDigits bez maxLen ne seče | `"123456789012"` | nepromenjeno |
| isValidPib tačno 9 cifara | `"112233445"` (9) vs. 8/10 cifara vs. sa slovom vs. prazno | `true` samo za tačno 9 cifara |
| isValidMb tačno 8 cifara | `"66554433"` (8) vs. 7/9 cifara vs. prazno | `true` samo za tačno 8 cifara |

---

## 10. Klijent — obavezna polja (Korak 8b ispravka, 2026-11-25)

**[ODLUČENO sa Stefanom, Korak 8b ispravka 2026-11-25 — PREGAZI spec 3.3 i prototip, koji su tražili i
mejl.]** Ovo pravilo nema prototipski `js/rules/*.js` fajl (nije jedno od osam pravila iz Faze 0) - unet
je direktno kao odluka vlasnika, bez izvršne specifikacije u prototipu. Dokumentovano ovde jer je
korisnik eksplicitno tražio da se evidentira pored ostalih odluka koje PREGAZE raniji tekst.

**Pravilo**: kod klijenta su obavezni SAMO naziv i adresa (jedno kombinovano tekstualno polje u pravoj
platformi - ulica, mesto i poštanski broj su već u istom unosu, frejm Fak4 nema odvojena potpolja za njih).
Mejl za fakture, PIB, država i sve ostalo su opcioni - prazno polje nikad ne blokira čuvanje klijenta ni
slanje fakture. Ako je PIB unet, i dalje se proverava ISO 7064 MOD 11,10 (odeljak 9 iznad, `isValidPib`
princip) bez obzira na valutu/zemlju klijenta - greška se prikazuje SAMO kad je uneti PIB pogrešan, nikad
zato što je prazan.

**Posledice u pravoj platformi** (`src/lib/clients.ts`, `validirajKlijentaPodatke`; `prisma/schema.prisma`,
model `Client`): `billingEmail` je sad nullable kolona (migracija
`20261125040000_client_adresa_obavezna_mejl_opcion`), `address` je obavezna (NOT NULL, ista migracija -
bezbedno u jednom koraku jer nijedan postojeći red nije imao prazno `address` ni `billingEmail`). Ekran
slanja fakture (Fak11) traži ručan unos adrese kad klijent nema sačuvan mejl, i ne dozvoljava slanje dok
ta adresa nije ispravna - videti `src/lib/invoices.ts`, `sendInvoice`.

---

## Rezime: svi nalazi (poznata ograničenja) iz Faze 0, na jednom mestu

1. ~~Limit — pragovi 80/90/100 nisu pravilo, nego UI provera~~ **ISPRAVLJENO u Round 30** (odeljak 1):
   `limitWarningTier` sad postoji, 90% se proverava i prikazuje na Početnoj i Knjizi prihoda.
2. ~~Rokovi za porez — spisak praznika je fiksan samo za 2026.~~ **ISPRAVLJENO u Round 30** (odeljak 4):
   opšti algoritam (pravoslavni Uskrs + fiksni praznici) radi za bilo koju godinu — ostaju NOVI
   [PROVERITI] oko tačnog pravnog tumačenja, videti Round 30 rezime ispod.
3. ~~Besplatan pristup (admin) nije povezan sa stvarnim pristupom korisnika~~ **POVEZANO u Round 30**
   (odeljak 5): `effectiveAccess` sad daje pun pristup; PRIKAZ u korisnikovoj aplikaciji i dalje namerno
   neizgrađen (ADMIN_SPEC "nije nacrtano, ne improvizovati").
4. ~~`parseSrDateFlexible` ne proverava stvarni broj dana u mesecu~~ **ISPRAVLJENO u Round 30** (odeljak
   7): `"31.04.2026"` sad vraća `null` umesto da tiho postane `1. maj`.
5. **`firstNameVoc` nije opšti srpski vokativ** (odeljak 8) — **I DALJE NEISPRAVLJENO**: imena sa
   ispadanjem samoglasnika (npr. "Petar") i dalje dobijaju pogrešan oblik. Nije bilo u obimu Round 30.

## Rezime: novi nalazi iz Round 30, na jednom mestu

1. **Pragovi 80/90/100 — Kalendar nema mesta za limit upozorenje** (odeljak 1): nijedan frejm/spec odeljak
   7.11 ne pominje limit na Kalendaru — namerno nije dodato, prijavljeno umesto izmišljeno.
2. **Zakon o praznicima — tri pravne nedoumice, ne primarni izvor** (odeljak 4): (a) tekst pročitan sa
   paragraf.rs, ne Službeni glasnik; (b) čl. 3a pominje nadoknadu samo za nedelju, ne i za subotu — ovde
   NEMA nadoknade za subotu; (c) Vaskrsna nedelja je uvek nedelja, pa Vaskršnji praznici dobijaju dodatni
   neradni dan SVAKE godine pod ovde primenjenim tumačenjem — nije potvrđeno da li zakon ovo stvarno
   primenjuje na višednevne praznike.
3. **Besplatan pristup — sidebar kartica se kvari kad je uključen na nalogu bez `nextChargeAt`** (odeljak
   5): prikazuje "Pretplata aktivna / Obnavlja se 1. jan 1970." — poznat, neispravljen nalaz (čeka pravi
   dizajn za prikaz besplatnog pristupa).
4. **Besplatan pristup na stvarnom nalogu nema pravi put kroz UI** (odeljak 5): samo preko `dev.*`
   test-prekidača (Razvojni meni) — admin-ov fejk 128-pool je odvojen od `state.subscription`.
5. **Onboarding PIB/MB polja** (odeljak 9): ispravka je prototipska (heuristika "jednako seed vrednosti"),
   ne prava poslovna logika — prava platforma je ne nasleđuje jer kreira stvarno prazan zapis po
   registraciji.

Nalazi 1-4 iz Faze 0 su ispravljeni ovog kruga, uz test koji je prvo pao pa prošao za svaku ispravku
(`node --test js/rules/*.test.js`). Nijedan od pet NOVIH nalaza iznad nije ispravljen — svi su van obima
onoga što je ovaj krug tražio, ili čekaju dizajn/pravnu potvrdu koju ne mogu sâm da dam.
