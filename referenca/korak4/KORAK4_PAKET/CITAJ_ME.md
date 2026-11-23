# Paket za Korak 4: okvir aplikacije i Podešavanja

Ovo je paket dizajna za Korak 4 (okvir aplikacije + Podešavanja, kartica "Profil i firma").

## Šta je u paketu

- `dizajn-sistem/`: tokeni (boje, tipografija, razmaci), pravila (README.md), komponente (dugme, polje, kartica, značka), logo. Ovo je izvor istine za izgled. Veličine teksta su samo parne vrednosti (12, 14, 16, 18, 20, 24, 32, 40, 48, 64), u rem.
- `dizajn/Pd0` do `Pd10`: Podešavanja na desktopu (Pd0 pregled sa karticama, Pd1 Profil i firma, Pd2 Računi, Pd3 Pretplata, Pd4 Obaveštenja, Pd5 Povezivanje, Pd6 Bezbednost i nalog, Pd7 Jezik i izgled, Pd8 dijalog za promenu lozinke, Pd9 brisanje naloga, Pd10 dodavanje računa).
- `dizajn/PhPd0` do `PhPd10`: ista Podešavanja na telefonu (390 px).
- `dizajn/Poc1` i `PhPoc1`: Početna, služi SAMO kao primer okvira aplikacije (levi meni, gornja traka, donja traka na telefonu). Početna se ne pravi u ovom koraku.

## Važno

- Podaci u frejmovima (naziv firme, PIB, matični broj, iznosi, "Još 23 dana besplatno") su samo primeri. PIB iz frejmova ne prolazi kontrolnu cifru, ne koristiti ga kao test podatak.
- Frejmovi mogu da imaju i tamnu varijantu. Tamni izgled se NE pravi sada, ali boje u kodu treba držati kao promenljive (CSS variables) da bi se kasnije dodao bez prepravke.
- Specifikacija je u referenca/specifikacije/PLATFORMA_SPECIFIKACIJA.md, odeljci 5 (struktura aplikacije) i 7.13 (Podešavanja). Ako se frejm i specifikacija ne slažu, javiti, ne birati samostalno.
