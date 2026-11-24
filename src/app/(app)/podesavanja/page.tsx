import { headers } from "next/headers";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { getBusinessForUser } from "@/lib/business";
import { formatDatum } from "@/lib/datum";
import { isValidFormatDatuma } from "@/lib/theme";
import { IkonaStrelicaDesno } from "@/components/ui/icons";
import { PODESAVANJA_STAVKE } from "@/components/settings/podesavanjaStavke";
import styles from "./pregled.module.css";

// Zavisi od sesije (headers()). Prijava i onboarding su zaštićeni u src/app/(app)/layout.tsx.
export const instant = false;

export default async function PodesavanjaPregledPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const biznis = await getBusinessForUser(session!.user.id);
  const ime = session!.user.name || "Korisnik";
  const inicijal = (ime.trim().charAt(0) || "?").toUpperCase();
  const formatDatuma = isValidFormatDatuma(session!.user.formatDatuma) ? session!.user.formatDatuma : "dmy";

  return (
    <>
      <h1 className={styles.mobilniNaslov}>Podešavanja</h1>

      <div className={styles.profil}>
        <span className={styles.avatar}>{inicijal}</span>
        <div>
          <div className={styles.profilIme}>{ime}</div>
          <div className={styles.profilPodnaslov}>
            {biznis!.name}, paušalac od {formatDatum(biznis!.regDate, formatDatuma)}
          </div>
        </div>
      </div>

      <div className={styles.lista} style={{ marginTop: "var(--space-4)" }}>
        {PODESAVANJA_STAVKE.map(({ slug, naziv, opis, Ikona }) => (
          <Link key={slug} href={`/podesavanja/${slug}`} className={styles.stavka}>
            <span className={styles.stavkaIkona}>
              <Ikona size={20} />
            </span>
            <span className={styles.stavkaTekst}>
              <span className={styles.stavkaNaziv}>{naziv}</span>
              <span className={styles.stavkaOpis}>{opis}</span>
            </span>
            <span className={styles.strelica}>
              <IkonaStrelicaDesno size={16} />
            </span>
          </Link>
        ))}
      </div>
    </>
  );
}
