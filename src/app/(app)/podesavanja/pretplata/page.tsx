import { headers } from "next/headers";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { izracunajProbniPeriod, recDan } from "@/lib/subscription";
import { SettingsPageHeader } from "@/components/settings/SettingsPageHeader";
import { Button } from "@/components/ui/Button";
import styles from "./PretplataTab.module.css";

export const instant = false;

export default async function PretplataPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const { danaOstalo } = izracunajProbniPeriod(session!.user.createdAt);
  const procenat = Math.round((danaOstalo / 30) * 100);

  return (
    <>
      <SettingsPageHeader naslov="Pretplata" opis="Ukratko o tvom planu. Sve ostalo je u delu Pretplata." />

      <div className={styles.hero}>
        <span className={styles.heroLabela}>Trenutni plan</span>
        <span className={styles.heroPlan}>Probni period</span>
        <div className={styles.heroTraka}>
          <div className={styles.heroTrakaPopunjena} style={{ width: `${procenat}%` }} />
        </div>
        <span className={styles.heroTekst}>
          Još {danaOstalo} {recDan(danaOstalo)} besplatno. Ništa se ne naplaćuje dok ne izabereš plan.
        </span>
        <div>
          <Link href="/pretplata">
            <Button varijanta="akcent">Izaberi plan</Button>
          </Link>
        </div>
      </div>

      <div className={styles.redovi}>
        <div className={styles.red}>
          <span className={styles.kljuc}>Način plaćanja</span>
          <span>Nije dodat</span>
        </div>
        <div className={styles.red}>
          <span className={styles.kljuc}>Sledeća naplata</span>
          <span>Nema, probni period</span>
        </div>
        <div className={styles.red}>
          <span className={styles.kljuc}>Računi i fakture za pretplatu</span>
          <span>Pojaviće se ovde</span>
        </div>
      </div>

      <div className={styles.napomena}>
        <span>Plan, kartica i otkazivanje su u delu Pretplata.</span>
        <Link href="/pretplata">
          <Button varijanta="sekundarno">Otvori Pretplatu</Button>
        </Link>
      </div>
    </>
  );
}
