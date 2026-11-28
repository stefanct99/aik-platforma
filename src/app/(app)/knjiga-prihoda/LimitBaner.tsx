// Baner upozorenja na limit (Korak 9f, frejm Kp7 - samo prag 80%, piksel po piksel; 90/100 su odluka
// zadatka, bez frejma - crvenkasta "opasnost" varijanta izvedena iz postojećih --color-alert-danger-*
// tokena). Ostaje uz Knjigu prihoda (ne u src/components/ui/) - danas ga koristi samo ova stranica; ako
// ga Početna ili Porez i rokovi ponovo iskoriste, preseliti ga tad u ui/, ne pre toga.
import Link from "next/link";
import { IkonaUpozorenje } from "@/components/ui/icons";
import { sadrzajLimitBanera } from "@/lib/pausalni-limit";
import styles from "./LimitBaner.module.css";

export function LimitBaner({
  procenat,
  preostalo,
}: {
  procenat: number;
  preostalo: number;
}) {
  const sadrzaj = sadrzajLimitBanera(procenat, preostalo);
  if (!sadrzaj) return null;

  const klasa = `${styles.baner} ${
    sadrzaj.nivo === "opasnost" ? styles.opasnost : styles.upozorenje
  }`;

  return (
    <div className={klasa}>
      <IkonaUpozorenje className={styles.ikonica} />
      <div className={styles.tekst}>
        <span className={styles.naslov}>{sadrzaj.naslov}</span>
        <span className={styles.poruka}>{sadrzaj.poruka}</span>
        <Link href="/porez" className={styles.link}>
          Vidi na stranici Porez i rokovi
        </Link>
      </div>
    </div>
  );
}
