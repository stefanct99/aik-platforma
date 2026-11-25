// Gornja traka (spec 5.2, 5.3): na desktopu pretraga + prekidač teme + zvonce + "Nova faktura", na
// telefonu znak + zvonce + avatar. Pretraga i zvonce su u frejmu, ali bez prave logike (nema pretrage ni
// obaveštenja), zato su onemogućeni i bez izmišljenog sadržaja (npr. bez lažne tačkice "ima novo").

import Link from "next/link";
import { Wordmark } from "@/components/ui/Wordmark";
import { IkonaPlus, IkonaPretraga, IkonaZvonce } from "@/components/ui/icons";
import dugmeStyles from "@/components/ui/Button.module.css";
import { TopBarTemaPrekidac } from "./TopBarTemaPrekidac";
import styles from "./TopBar.module.css";

export function TopBar({ inicijal }: { inicijal: string }) {
  return (
    <div className={styles.traka}>
      <div className={styles.mobilnoLevo}>
        <Link href="/pocetna">
          <Wordmark />
        </Link>
      </div>

      <div className={styles.pretraga} aria-disabled="true">
        <IkonaPretraga size={18} />
        Pretraži fakture, klijente, uplate
      </div>

      <div className={styles.desno}>
        <div className={styles.temaDesktop}>
          <TopBarTemaPrekidac />
        </div>
        <button
          type="button"
          className={styles.zvonce}
          disabled
          aria-label="Obaveštenja (dolazi uskoro)"
          title="Obaveštenja dolaze uskoro"
        >
          <IkonaZvonce size={20} />
        </button>
        <Link href="/podesavanja" className={styles.avatarMobilni} aria-label="Podešavanja i profil">
          {inicijal}
        </Link>
        <Link
          href="/fakture/nova"
          className={`${dugmeStyles.dugme} ${dugmeStyles.primarno} ${styles.novaFakturaDesktop}`}
        >
          <IkonaPlus size={18} /> Nova faktura
        </Link>
      </div>
    </div>
  );
}
