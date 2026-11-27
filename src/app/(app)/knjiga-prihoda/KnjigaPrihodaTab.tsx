// Knjiga prihoda (Korak 9a, frejmovi Kp1/Kp2/Kp3/Kp9) - lista (desktop): kartice zbira, podtabovi
// Devizni/Dinarski, filteri Godina/Mesec/Klijent, tabele, prazno stanje. NAMERNO ne grade se (sledeći
// koraci, zadatak): upozorenje o limitu (baner), baner "uplata bez fakture", detalj uplate, dodavanje,
// brisanje, izvoz, telefon - dugmad "Izvezi"/"Dodaj prihod" su zato bez onClick (još ne rade ništa).
"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { IkonaPlus, IkonaChevronDole, IkonaKnjigaPrihodaPrazno } from "@/components/ui/icons";
import { formatDatumSrpski } from "@/lib/datum";
import { formatNovacPuno, formatNovacKompaktno } from "@/lib/money";
import { izracunajPausalniLimit, LIMIT_PAUSALACA } from "@/lib/pausalni-limit";
import {
  godinePrihoda,
  grupisiPoGodini,
  filtrirajRedove,
  ukupanPrihodUGodini,
  brojUplataPoKlijentu,
  uplataRec,
  type PrihodRed,
} from "@/lib/prihodi";
import styles from "./KnjigaPrihodaTab.module.css";

const MESECI = [
  "Januar",
  "Februar",
  "Mart",
  "April",
  "Maj",
  "Jun",
  "Jul",
  "Avgust",
  "Septembar",
  "Oktobar",
  "Novembar",
  "Decembar",
];

// "U dinarima"/"Iznos u dinarima"/red "Ukupno" u tabelama nemaju oznaku valute (prototip: fmtMoney(...).
// replace(' din','')) - za razliku od kartica zbira, koje oznaku ZADRŽAVAJU (isti frejmovi, Kp1/Kp2).
function dinBezOznake(iznosRsd: number): string {
  return formatNovacPuno(iznosRsd, "RSD").replace(" din", "");
}

function formatProcenat(p: number): string {
  return p.toLocaleString("sr-RS", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

export function KnjigaPrihodaTab({
  redovi,
  klijenti,
  danasIso,
}: {
  redovi: PrihodRed[];
  klijenti: { id: string; name: string }[];
  danasIso: string;
}) {
  const router = useRouter();
  const danas = useMemo(() => new Date(danasIso), [danasIso]);
  const godine = useMemo(() => godinePrihoda(danas), [danas]);

  const [godina, setGodina] = useState(danas.getUTCFullYear());
  const [tab, setTab] = useState<"devizni" | "dinarski">("devizni");
  const [mesec, setMesec] = useState<number | null>(null);
  const [klijentId, setKlijentId] = useState<string | null>(null);
  const [klijentOtvoren, setKlijentOtvoren] = useState(false);

  const { devizni, dinarski } = useMemo(() => grupisiPoGodini(redovi, godina), [redovi, godina]);
  const ukupnoGodina = useMemo(() => ukupanPrihodUGodini(devizni, dinarski), [devizni, dinarski]);
  const limit = useMemo(
    () => izracunajPausalniLimit(redovi.map((r) => ({ datum: new Date(r.datumIso), iznosRsd: r.iznosRsd })), danas),
    [redovi, danas],
  );

  const redoviTaba = tab === "devizni" ? devizni : dinarski;
  const redoviZaBrojace = useMemo(() => filtrirajRedove(redoviTaba, mesec, null), [redoviTaba, mesec]);
  const prikazaniRedovi = useMemo(
    () => filtrirajRedove(redoviTaba, mesec, klijentId),
    [redoviTaba, mesec, klijentId],
  );
  const klijentiZaPadajuci = useMemo(() => brojUplataPoKlijentu(redoviZaBrojace), [redoviZaBrojace]);
  const izabraniKlijent = klijentId ? klijenti.find((k) => k.id === klijentId) : null;

  const prazno = devizni.length === 0 && dinarski.length === 0;

  function ocistiFiltere() {
    setMesec(null);
    setKlijentId(null);
  }

  return (
    <div className={styles.sadrzaj}>
      <div className={styles.glava}>
        <div className={styles.glavaTekst}>
          <h1 className={styles.naslov}>Knjiga prihoda</h1>
          <p className={styles.opis}>Prihodi se vode po datumu uplate.</p>
        </div>
        <div className={styles.akcije}>
          <Button type="button" varijanta="sekundarno">
            Izvezi
          </Button>
          <Button type="button" varijanta="primarno">
            <IkonaPlus size={18} /> Dodaj prihod
          </Button>
        </div>
      </div>

      <div className={styles.kartice}>
        <div className={styles.glavnaKartica}>
          <div className={styles.glavnaVrh}>
            <span className={styles.labelaMuted}>Ukupan prihod u {godina}.</span>
            <span className={styles.vrednostVelika}>{formatNovacPuno(ukupnoGodina, "RSD")}</span>
          </div>
          <div className={styles.traka}>
            <div
              className={limit.procenat >= 80 ? styles.trakaIspunaUpozorenje : styles.trakaIspuna}
              style={{ width: `${Math.min(100, limit.procenat)}%` }}
            />
          </div>
          <div className={styles.trakaFoot}>
            <span>
              {formatProcenat(limit.procenat)}% limita od {formatNovacKompaktno(LIMIT_PAUSALACA, "RSD")}
            </span>
            <span>Ostalo {formatNovacPuno(limit.preostalo, "RSD")}</span>
          </div>
        </div>
        <div className={styles.sporedneKartice}>
          <div className={styles.sporednaKartica}>
            <span className={styles.labelaMuted}>Devizni prihodi</span>
            <span className={styles.vrednostSrednja}>{formatNovacPuno(ukupanPrihodUGodini(devizni, []), "RSD")}</span>
            <span className={styles.labelaMuted}>
              {devizni.length} {uplataRec(devizni.length)}
            </span>
          </div>
          <div className={styles.sporednaKartica}>
            <span className={styles.labelaMuted}>Dinarski prihodi</span>
            <span className={styles.vrednostSrednja}>{formatNovacPuno(ukupanPrihodUGodini([], dinarski), "RSD")}</span>
            <span className={styles.labelaMuted}>
              {dinarski.length} {uplataRec(dinarski.length)}
            </span>
          </div>
        </div>
      </div>

      {prazno ? (
        <>
          <div className={styles.redFilteraProsto}>
            <div className={styles.podtabovi}>
              <button
                type="button"
                className={tab === "devizni" ? styles.podtabAktivan : styles.podtab}
                onClick={() => setTab("devizni")}
              >
                Devizni prihodi <span className={tab === "devizni" ? styles.brojAktivan : styles.broj}>{devizni.length}</span>
              </button>
              <button
                type="button"
                className={tab === "dinarski" ? styles.podtabAktivan : styles.podtab}
                onClick={() => setTab("dinarski")}
              >
                Dinarski prihodi <span className={tab === "dinarski" ? styles.brojAktivan : styles.broj}>{dinarski.length}</span>
              </button>
            </div>
            <span className={styles.selectOmot}>
              <select
                className={styles.select}
                value={godina}
                onChange={(e) => setGodina(Number(e.target.value))}
              >
                {godine.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
              <IkonaChevronDole size={16} />
            </span>
          </div>
          <div className={styles.prazno}>
            <span className={styles.praznaIkonica}>
              <IkonaKnjigaPrihodaPrazno size={28} />
            </span>
            <span className={styles.praznoNaslov}>Još nema prihoda u {godina}.</span>
            <span className={styles.praznoOpis}>
              Čim stigne uplata, upisujem je ovde sam. Možeš i ručno da dodaš prihod koji ja ne vidim, na primer
              gotovinu.
            </span>
            <Button type="button" varijanta="primarno">
              <IkonaPlus size={18} /> Dodaj prihod
            </Button>
          </div>
        </>
      ) : (
        <>
          <div className={styles.redPodtabovaIFiltera}>
            <div className={styles.podtabovi}>
              <button
                type="button"
                className={tab === "devizni" ? styles.podtabAktivan : styles.podtab}
                onClick={() => setTab("devizni")}
              >
                Devizni prihodi <span className={tab === "devizni" ? styles.brojAktivan : styles.broj}>{devizni.length}</span>
              </button>
              <button
                type="button"
                className={tab === "dinarski" ? styles.podtabAktivan : styles.podtab}
                onClick={() => setTab("dinarski")}
              >
                Dinarski prihodi <span className={tab === "dinarski" ? styles.brojAktivan : styles.broj}>{dinarski.length}</span>
              </button>
            </div>
            <div className={styles.filteri}>
              <span className={styles.selectOmot}>
                <select className={styles.select} value={godina} onChange={(e) => setGodina(Number(e.target.value))}>
                  {godine.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
                <IkonaChevronDole size={16} />
              </span>
              <span className={styles.selectOmot}>
                <select
                  className={styles.select}
                  value={mesec ?? ""}
                  onChange={(e) => setMesec(e.target.value ? Number(e.target.value) : null)}
                >
                  <option value="">Svi meseci</option>
                  {MESECI.map((m, i) => (
                    <option key={m} value={i + 1}>
                      {m}
                    </option>
                  ))}
                </select>
                <IkonaChevronDole size={16} />
              </span>
              <div className={styles.klijentOmot}>
                <button
                  type="button"
                  className={styles.kombo}
                  onClick={() => setKlijentOtvoren((v) => !v)}
                >
                  <span>{izabraniKlijent ? izabraniKlijent.name : "Svi klijenti"}</span>
                  <IkonaChevronDole size={16} />
                </button>
                {klijentOtvoren && (
                  <div className={styles.padajuciKlijent} role="listbox">
                    <button
                      type="button"
                      className={!klijentId ? styles.klijentRedAktivan : styles.klijentRed}
                      onClick={() => {
                        setKlijentId(null);
                        setKlijentOtvoren(false);
                      }}
                    >
                      <span>Svi klijenti</span>
                      <span className={styles.brojBledo}>{redoviZaBrojace.length}</span>
                    </button>
                    {klijentiZaPadajuci.map((k) => (
                      <button
                        key={k.klijentId}
                        type="button"
                        className={klijentId === k.klijentId ? styles.klijentRedAktivan : styles.klijentRed}
                        onClick={() => {
                          setKlijentId(k.klijentId);
                          setKlijentOtvoren(false);
                        }}
                      >
                        <span>{k.klijentIme}</span>
                        <span className={styles.brojBledo}>{k.broj}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {mesec != null || klijentId != null ? (
                <a
                  href="#"
                  className={styles.ocistiFiltere}
                  onClick={(e) => {
                    e.preventDefault();
                    ocistiFiltere();
                  }}
                >
                  Očisti filtere
                </a>
              ) : null}
            </div>
          </div>

          <div className={styles.tabelaWrap}>
            {tab === "devizni" ? (
              <table className={styles.tabela}>
                <thead>
                  <tr>
                    <th className={styles.kolonaUplata}>Uplata</th>
                    <th className={styles.kolonaKlijent}>Klijent</th>
                    <th className={styles.kolonaFaktura}>Faktura</th>
                    <th className={`${styles.kolonaIznos} ${styles.desno}`}>Iznos</th>
                    <th className={`${styles.kolonaKurs} ${styles.desno}`}>Kurs</th>
                    <th className={`${styles.kolonaDinari} ${styles.desno}`}>U dinarima</th>
                    <th className={`${styles.kolonaIzvor} ${styles.desno}`}>Izvor</th>
                  </tr>
                </thead>
                <tbody>
                  {prikazaniRedovi.map((r) => (
                    <tr key={r.id} className={styles.red} onClick={() => r.fakturaId && router.push(`/fakture/${r.fakturaId}`)}>
                      <td className={styles.kolonaUplata}>{formatDatumSrpski(new Date(r.datumIso))}</td>
                      <td className={`${styles.kolonaKlijent} ${styles.ellip}`} title={r.klijentIme ?? "–"}>
                        {r.klijentIme ?? "–"}
                      </td>
                      <td className={styles.kolonaFaktura} title={r.brojFakture ?? undefined}>
                        {r.brojFakture ?? "–"}
                      </td>
                      <td className={`${styles.kolonaIznos} ${styles.desno}`}>{formatNovacPuno(r.iznos, r.valuta)}</td>
                      <td className={`${styles.kolonaKurs} ${styles.desno}`}>
                        {r.kurs != null ? r.kurs.toLocaleString("sr-RS", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "–"}
                      </td>
                      <td className={`${styles.kolonaDinari} ${styles.desno}`}>
                        {r.iznosRsd != null ? dinBezOznake(r.iznosRsd) : "–"}
                      </td>
                      <td className={`${styles.kolonaIzvor} ${styles.desno}`}>
                        <span className={r.izvor === "rucno" ? styles.znackaRucno : styles.znackaMejl}>
                          {r.izvor === "rucno" ? "Ručno" : "Mejl banke"}
                        </span>
                      </td>
                    </tr>
                  ))}
                  <tr className={styles.redUkupno}>
                    <td colSpan={5}>Ukupno devizni prihodi</td>
                    <td className={styles.desno}>{dinBezOznake(ukupanPrihodUGodini(filtrirajRedove(devizni, mesec, klijentId), []))}</td>
                    <td />
                  </tr>
                </tbody>
              </table>
            ) : (
              <table className={styles.tabela}>
                <thead>
                  <tr>
                    <th className={styles.kolonaUplata}>Uplata</th>
                    <th className={styles.kolonaKlijent}>Klijent</th>
                    <th className={styles.kolonaFakturaRsd}>Faktura</th>
                    <th className={`${styles.kolonaDinariRsd} ${styles.desno}`}>Iznos u dinarima</th>
                    <th className={`${styles.kolonaIzvor} ${styles.desno}`}>Izvor</th>
                  </tr>
                </thead>
                <tbody>
                  {prikazaniRedovi.map((r) => (
                    <tr key={r.id} className={styles.red} onClick={() => r.fakturaId && router.push(`/fakture/${r.fakturaId}`)}>
                      <td className={styles.kolonaUplata}>{formatDatumSrpski(new Date(r.datumIso))}</td>
                      <td className={`${styles.kolonaKlijent} ${styles.ellip}`} title={r.klijentIme ?? "–"}>
                        {r.klijentIme ?? "–"}
                      </td>
                      <td className={styles.kolonaFakturaRsd} title={r.brojFakture ?? undefined}>
                        {r.brojFakture ?? "–"}
                      </td>
                      <td className={`${styles.kolonaDinariRsd} ${styles.desno}`}>{dinBezOznake(r.iznosRsd ?? 0)}</td>
                      <td className={`${styles.kolonaIzvor} ${styles.desno}`}>
                        <span className={r.izvor === "rucno" ? styles.znackaRucno : styles.znackaMejl}>
                          {r.izvor === "rucno" ? "Ručno" : "Mejl banke"}
                        </span>
                      </td>
                    </tr>
                  ))}
                  <tr className={styles.redUkupno}>
                    <td colSpan={3}>Ukupno dinarski prihodi</td>
                    <td className={styles.desno}>{dinBezOznake(ukupanPrihodUGodini([], filtrirajRedove(dinarski, mesec, klijentId)))}</td>
                    <td />
                  </tr>
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}
