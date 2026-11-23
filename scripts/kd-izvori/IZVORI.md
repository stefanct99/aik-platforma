# Izvori za šifre delatnosti (KD 2025 i KD 2010)

Preuzeto 2026-11-23 sa zvaničnog sajta Republičkog zavoda za statistiku Srbije (RZS),
stranica https://www.stat.gov.rs/istrazivanja/klasifikacije/.

Direktno preuzeti na ovom računaru (ne menjati ručno, ponovo preuzeti ako RZS objavi novu verziju):

- `kd2025_struktura.xlsx` ⟵ https://www.stat.gov.rs/media/421934/kd2025_struktura.xlsx
  (Prilog 1 Uredbe o klasifikaciji delatnosti, "Sl. glasnik RS" br. 91/2026, struktura KD 2025)
- `tabela-veza-kd2010-i-kd2025.xlsx` ⟵ https://www.stat.gov.rs/media/421935/tabela-veza-kd2010-i-kd2025.xlsx
  (Prilog 2 Uredbe: Tabela veza između KD 2010 i KD 2025)
- `klasifikacija-delatnosti-2010-puni-nazivi.xls` ⟵ https://www.stat.gov.rs/media/2620/klasifikacija-delatnosti-2010-puni-nazivi.xls
  (Klasifikacija delatnosti 2010, Uredba "Sl. glasnik RS" br. 54/10)

Zvaničan tekst same Uredbe (za proveru, nije programski obrađen):
https://www.stat.gov.rs/media/421937/уредба-о-класификацији-делатности_кд-2025.pdf

Fajlovi u ovom direktorijumu se komituju u git (mali su, i to je dokaz odakle su podaci potekli).
Skripta koja ih obrađuje je `scripts/generate-kd-data.ts`, izlaz ide u `src/data/kd/`.
