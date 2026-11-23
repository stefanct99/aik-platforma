# CLAUDE.md — Tvoj AI knjigovođa (prototip)

Ovaj direktorijum (`/Users/stefan.ct/aik-prototip`) je izvor istine za kod prototipa platforme "tvoj AI knjigovođa" (aplikacija za paušalce u Srbiji). Prototip živi kao Claude Artifact, ne na pravom domenu.

**Pre bilo kakvog rada, pročitaj `STATUS.md` u ovom direktorijumu** — tu piše šta je gotovo, šta je otvoreno i koja je sledeća faza.

## Fajlovi i gde je šta

- **Specifikacija**: `/Users/stefan.ct/Downloads/PLATFORMA_SPECIFIKACIJA.md` — kompletna specifikacija (domenski model, glavni tokovi odeljak 6, ekrani odeljak 7, poslovna pravila odeljak 8, Prilog A = mapa frejmova po sekciji, Prilog B = seed podaci, odeljak 12 = poznate nedoslednosti i podrazumevana pravila kad nešto nije jasno).
- **Dizajn** (izvor istine za izgled, piksel po piksel, pobeđuje tekst specifikacije kad su u sukobu): Claude Design Canvas artifact — https://claude.ai/artifact/Y6G2nKL9zqTn9iwJDQZAsH ("Tvoj AI Knjigovodja"). Svaki frejm je fajl `project/<FrameID>.dc.html` (npr. `Fak1.dc.html`, `PhPd3.dc.html`, `Pd4.dc.html`). **Svetla i tamna tema su UNUTAR istog fajla**, jedna pored druge — nisu odvojeni "dizajn/svetli" i "dizajn/tamni" folderi kao što specifikacija pominje; to je samo stariji način opisivanja istog materijala. Desktop frejmovi: canvas širine 2960px (dva panela po 1440px). Telefon frejmovi: canvas širine 810px (dva panela po 365px, što odgovara 390px telefonskoj širini). Frejm ID-jevi po sekciji ekrana su u Prilogu A specifikacije (npr. Fakture = Fak1–Fak28 / PhFak1–PhFak28, Knjiga prihoda = Kp1–Kp10 / PhKp1–PhKp10, Početna = Poc1–Poc6 / Dash4_\* / Tur0–Tur4 / Tip1–Tip2, sve sa Ph-prefiksom za telefon).
- **Prototip kod** (ovaj direktorijum):
  - `index.html` — čist fragment, bez meta tagova (Artifact skeleton ih ubacuje sam pri objavljivanju). Ovo se objavljuje.
  - `preview.html` — ISTO + injektovan `<meta charset>` i `<meta viewport>` na vrhu, samo za lokalni test. **Nikad ne objavljuj ovaj fajl.**
  - `css/tokens.css` — design tokeni (boje, razmaci, radijusi), svetla i tamna varijanta.
  - `css/base.css` — sve CSS klase za ceo prototip.
  - `js/*.js` — vanilla React (bez JSX, bez bildera), `h = React.createElement`, globalni `window.AIK` namespace.
- **Status dokument** (Claude Docs, duži istorijat sa tabelama provere po frejmu): https://claude.ai/artifact/9cyH4R9occ2xqgTWMq5cxa
- **Živi prototip** (Claude Artifact): https://claude.ai/artifact/NyjBXaVRJaxN6zwXzS5aU6

## Pravila koja važe za SVAKU fazu (korisnik je ovo eksplicitno tražio, ne odstupati)

1. **Frejm je izvor istine, piksel po piksel.** Ne pretpostavljaj iz teksta specifikacije ili iz sećanja — otvori frejm i prepiši stvarne vrednosti: font-size, font-weight, line-height, letter-spacing, padding, margin, gap, width, height, border-radius, border, box-shadow, boje (hex), tačan tekst, ikonice. Kad frejm i tekst specifikacije (ili apstraktan dizajn-sistem iz nekog drugog artifact-a) nisu usklađeni, frejm pobeđuje.
2. **Testiraj na dve širine**: 390px (telefon) i 1280px (desktop).
3. **Testiraj obe teme**: svetla i tamna.
4. **Posle svakog dela posla pošalji tabelu provere**: frejm | svetla desktop | tamna desktop | svetla telefon | tamna telefon, sa "identično" ili šta je tačno ispravljeno. Ako nešto nije provereno, napiši to otvoreno — nikad ne tvrdi da je provereno ako nije.
5. **Ne dodaji ništa što nije u dizajnu.**
6. **Radi fazu po fazu** (odeljak 11.2 specifikacije) i javi se posle svake, pre prelaska na sledeću — ne počinji sledeću fazu bez izričite potvrde.

## Lokalni test workflow

1. Izmeni fajlove direktno u ovom direktorijumu — ovo JESTE izvor, nema posebne scratchpad kopije koju treba sinhronizovati.
2. Pokreni dev server preko `.claude/launch.json` konfiguracije `aik-proto` (Python `http.server` na portu 8743, servira ovaj direktorijum).
3. Otvori `http://localhost:8743/preview.html` — **ne `/` ili `/index.html`**, jer taj fajl nema meta tagove potrebne za ispravan lokalni prikaz (kodiranje karaktera i mobilni viewport).
4. Python-ov `http.server` ne šalje cache-control header, pa browser ume agresivno da keš-uje i CSS i JS fajlove čak i posle izmene na disku. Ako posle izmene ne vidiš promenu uživo, to je prvi sumnjivi uzrok — navigiraj ponovo na `preview.html?v=<nov-timestamp>` I dodaj `?v=<isti-timestamp>` na SVE `<link>`/`<script>` tagove unutar `preview.html` (ne samo JS, i CSS), pa tek onda proveri da li je greška stvarna.
5. Posle potvrđenih izmena uživo, objavi preko Artifact tool-a na URL iznad, koristeći `index.html` (ne `preview.html`) kao glavni fajl, plus svaki izmenjeni `css/`/`js/` fajl u listi dodatnih fajlova.

## Arhitektura (ukratko)

- Vanilla React 18 (UMD build sa unpkg, bez bildera/Babel-a), `h = React.createElement` svuda, globalni `window.AIK` namespace, obične `<script>` tagove u fiksnom redosledu (zavisnosti moraju biti pre zavisnih fajlova).
- `js/store.js` — ceo state prototipa (nema pravog backend-a), čuva se u `localStorage` (ključ `aik_proto_v3`). Promena šeme state-a → stari zapisi se plitko spajaju preko `Object.assign(freshState(), parsed)`, što može ostaviti "stare" oblike podataka; po potrebi resetuj preko dev menija ili `localStorage.clear()`.
- `js/actions.js` — sve akcije grupisane po domenu (`Auth`, `Dev`, `Onboarding`, `Business`, `Settings`, `Invoices`, `Clients`, `Recurring`, `Templates`), svaka zove `store.setState(...)` i po potrebi `store.toast(...)`.
- `js/selectors.js` — izvedene vrednosti (limit, kasne fakture, "čeka tebe" brojevi).
- `js/utils.js` — formatiranje (datumi, novac), NBS kurs (pseudo-deterministički po datumu), pomoćne funkcije za fakture.
- `js/app.js` — router (`AppRouter`), čita `route` iz store-a (oblik `"app/<sekcija>/<podputanja>"` ili posebne rute kao `"login"`, `"onboarding"`), prosleđuje `sub` podputanju odgovarajućem `window.AIK.Screens.<sekcija>` modulu.
- Svaki ekran-modul (`auth.js`, `onboarding.js`, `settings.js`, `fakture.js`, ...) sam registruje svoje komponente u `window.AIK.Screens` na kraju fajla.
- Mobilni prikaz NIJE u posebnim fajlovima — isti JS modul grana se po `useIsMobile()` hook-u (`window.matchMedia('(max-width: 1023px)')`), isto za CSS media query prag.
- Hash-routing (`#/putanja`) je zabranjen unutar Artifact-a — zato se navigacija radi isključivo kroz `store.navigate(route)` i in-memory state, nikad kroz URL hash.
