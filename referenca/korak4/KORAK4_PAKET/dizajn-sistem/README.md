# Fakturica dizajn sistem

Fakturica je AI knjigovođa za paušalce. Slogan i opisni red: **tvoj AI knjigovođa**. Isti sistem služi i ime i slogan, pa važi za oba koncepta (02 i 03).

## Princip

- **Fakturica sredi sve. Ti samo odobravaš.** Svaki ekran vodi ka jednoj jasnoj odluci: pogledaj, proveri, odobri.
- **Mirno i sigurno.** Novac i porez su stresni. Dizajn je tih: puno prostora, malo boja, jasni iznosi.
- **AI se vidi, ali ne viče.** Limeta oznaka "AI" pokazuje šta je AI uradila. Čovek uvek ima poslednju reč.

## Ton

- Ti forma, kratke rečenice, srpski jezik, latinica.
- Bez žargona: "uplata legla" umesto "transakcija procesuirana".
- Bez crtica (em dash) u tekstu. Koristi tačku ili zarez.
- Iznosi u srpskom formatu: `3.000,00 €`, `352.140,00 RSD`.

## Boje

| Uloga | Token | Kada |
|---|---|---|
| Šuma | `forest-900` | sidebar, hero, primarna dugmad, znak |
| Limeta | `lime-400` | akcent na tamnoj pozadini, AI oznaka, glavni poziv na akciju u sidebaru |
| Kost | `bone` | pozadina aplikacije |
| Bela | `white` | kartice, polja, modali |
| Grafit | `ink` | tekst i iznosi |
| Mahovina | `ink-muted` | sporedni tekst |

Pravila:
- Limeta nikad kao boja teksta na svetloj pozadini (slab kontrast). Na svetloj pozadini limeta je samo pozadina, a tekst preko nje je `forest-900`.
- Statusne boje (`success`, `warning`, `danger`, `info`) uvek idu u paru sa svojom `-bg` pozadinom i uvek uz tekst, nikad samo boja.

## Tipografija

- Naslovi i iznosi: **Manrope** 700 i 800.
- Tekst: **Inter** 400 i 600.
- Oba fonta sa Google Fonts.
- **Veličine samo u rem i samo parne vrednosti u px** (12, 14, 16, 18, 20, 24, 32, 40, 48, 64). Nikad 13, 15 ili 12.5.
- Iznosi koriste tabularne cifre (`font-variant-numeric: tabular-nums`).

## Ikonice

Linijske ikonice, debljina linije 1.5px, zaobljeni krajevi, veličine 16, 20 i 24px. Boja prati tekst.

## Stanja

Svaki ekran ima četiri osnovna stanja: **prazno** (šta ovde ide i jedno dugme), **učitavanje** (skeleton blokovi u boji `border`), **greška** (šta se desilo i šta da uradiš) i **uspeh** (kratka potvrda).

Stanja uplate: Stigla, AI uparila, Čeka potvrdu, Poslato banci, Legla, Banka odbila, Za proveru.

## Raspored

- Mobilni: 390px, padding 16px, donja traka sa 5 stavki.
- Tablet: 768px.
- Desktop: 1280px i više, sidebar 264px u boji `forest-900`, sadržaj do 1120px.
- Kartice: `radius-lg`, padding 24px na desktopu i 16px na mobilnom.
- Dodirne površine na mobilnom najmanje 44px.

## Logo

Znak je zaobljen kvadrat u boji šume sa tri knjigovodstvene linije i limeta iskrom (AI). Fajlovi su u grupi **Logos**.
