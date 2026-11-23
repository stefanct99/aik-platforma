Faza 11: admin deo aplikacije.

Pre početka pročitaj STATUS.md i CLAUDE.md, pa ADMIN_PAKET/CITAJ_ME.md i ADMIN_SPECIFIKACIJA.md u celosti, i pregledaj frejmove Adm1 do Adm5 i PhAdm0 do PhAdm5 u ADMIN_PAKET/dizajn (svaki fajl ima svetlu temu levo i tamnu desno). Frejmovi su izvor istine za izgled, specifikacija za ponašanje. Ništa ne dodaj što nije u njima. Sve označeno [PROVERITI] ili [PREDLOG] prijavi i pitaj.

Pravilo koje se ne krši: admin vidi samo metapodatke i zbirne brojke. Nikad fakture, iznose, klijente, mejlove banke, sadržaj uvoza ni učitana dokumenta.

Radi redom i posle svakog koraka stani, objavi i javi broj verzije sa snimcima:
0. Topbar i logo (korak 0 iz specifikacije), pa ugradnja ulaza u Admin u navigaciju za uloge koje ga smeju (desktop sidebar, telefon "Više").
1. Uloge i pristup: prekidač uloge u dev meniju, Sel.admin* selektori, ruta app/admin zaštićena ulogom. Korisnik bez uloge ne vidi stavku u meniju i ne sme da otvori rutu.
2. Pregled (Adm1): brojke, grafikon i definicije metrika iz sekcije 5. MRR ne uključuje besplatan pristup.
3. Korisnici i pretplate (Adm2) sa seed podacima iz Priloga B (128 korisnika: 18 trial, 79 aktivnih, 5 neuspelih naplata, 26 otkazanih, MRR 4.236 EUR).
4. Odobri besplatan pristup (Adm3): izbor roka i razlog, upis u dnevnik, bez uticaja na MRR.
5. Dnevnik radnji (Adm4): neizmenljiv, svaka admin radnja se upisuje.
6. Podrška (Adm5).
7. Provera: frame-compare (desktop 1440, telefon 365, obe teme), sweep-phone.js (360, 390, 393, 430), nan-sweep.js, formalni run.js piksel-diff sa tabelom odstupanja. Test tri uloge: bez uloge, admin, podrška. Potvrdi da nijedan admin ekran ne čita fakture, iznose, klijente ni uvoz.

Pravila izgleda: iste boje i komponente kao ostatak aplikacije, veličine teksta u rem sa parnim vrednostima, srpski format, bez crtica u tekstu. U izveštaju napiši broj verzije na početku i navedi sve što nije snimljeno. Ne počinji sledeću fazu bez Stefanove reči.
