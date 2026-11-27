// Klijenti (Korak 8a, frejm Fak6/Fak7/Fak28, spec 7.6).
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { IkonaPretraga, IkonaPlus, IkonaProfilFirma, IkonaTacke } from "@/components/ui/icons";
import { FaktureHeader } from "@/components/fakture/FaktureHeader";
import { formatDatumSrpski } from "@/lib/datum";
import { formatNovacKompaktno } from "@/lib/money";
import { obrisiIliArhivirajKlijentaAction } from "../actions";
import { ClientPanel } from "./ClientPanel";
import type { KlijentRed } from "./klijenti-tipovi";
import styles from "./KlijentiTab.module.css";

export function KlijentiTab({
  klijenti,
  racuni,
  brojevi,
}: {
  klijenti: KlijentRed[];
  racuni: { id: string; currency: string; bank: string; iban: string | null; number: string | null }[];
  brojevi: { fakture: number; klijenti: number; ponavljajuce: number };
}) {
  const router = useRouter();
  const [upit, setUpit] = useState("");
  const [uredjivanje, setUredjivanje] = useState<"new" | string | null>(null);

  const filtrirani = klijenti.filter(
    (k) =>
      !upit.trim() ||
      k.name.toLowerCase().includes(upit.toLowerCase()) ||
      (k.billingEmail ?? "").toLowerCase().includes(upit.toLowerCase()),
  );

  const klijentUredjivanje = uredjivanje && uredjivanje !== "new" ? klijenti.find((k) => k.id === uredjivanje) ?? null : null;

  async function obrisiIliArhiviraj(id: string) {
    await obrisiIliArhivirajKlijentaAction(id);
    setUredjivanje(null);
    router.refresh();
  }

  function opisPodrazumevanog(k: KlijentRed) {
    return `${k.defaultCurrency} · ${k.defaultLang.toUpperCase()} · ${k.defaultDueDays} dana`;
  }

  function opisStavke(k: KlijentRed) {
    if (!k.defaultItemDesc) return null;
    return `${k.defaultItemDesc}, ${formatNovacKompaktno(k.defaultItemAmount ?? 0, k.defaultCurrency)}`;
  }

  if (klijenti.length === 0) {
    return (
      <>
        <FaktureHeader
          brojevi={brojevi}
          dugme={
            <Button varijanta="primarno" onClick={() => setUredjivanje("new")}>
              <IkonaPlus size={18} /> Novi klijent
            </Button>
          }
        />
        <div className={styles.sadrzaj}>
          <div className={styles.pretragaRed}>
            <span className={styles.pretraga}>
              <IkonaPretraga size={16} />
              <input
                placeholder="Traži klijenta po imenu ili mejlu"
                value={upit}
                onChange={(e) => setUpit(e.target.value)}
              />
            </span>
          </div>
          <div className={styles.prazno}>
            <span className={styles.praznaIkonica}>
              <IkonaProfilFirma size={32} />
            </span>
            <div className={styles.praznoTekst}>
              <span className={styles.praznoNaslov}>Još nemaš nijednog klijenta.</span>
              <span className={styles.praznoOpis}>
                Dodaj klijenta pa popunjavam valutu, jezik i rok na svakoj fakturi koju mu napraviš.
              </span>
            </div>
            <Button varijanta="primarno" onClick={() => setUredjivanje("new")}>
              Novi klijent
            </Button>
          </div>
        </div>
        {uredjivanje && (
          <ClientPanel
            klijent={klijentUredjivanje}
            racuni={racuni}
            onClose={() => setUredjivanje(null)}
            onSaved={() => {
              setUredjivanje(null);
              router.refresh();
            }}
            onObrisi={klijentUredjivanje ? () => obrisiIliArhiviraj(klijentUredjivanje.id) : undefined}
          />
        )}
      </>
    );
  }

  return (
    <>
      <FaktureHeader
        brojevi={brojevi}
        dugme={
          <Button varijanta="primarno" onClick={() => setUredjivanje("new")}>
            <IkonaPlus size={18} /> Novi klijent
          </Button>
        }
      />
      <div className={styles.sadrzaj}>
        <div className={styles.pretragaRed}>
          <span className={styles.pretraga}>
            <IkonaPretraga size={16} />
            <input
              placeholder="Traži klijenta po imenu ili mejlu"
              value={upit}
              onChange={(e) => setUpit(e.target.value)}
            />
          </span>
        </div>

        {filtrirani.length === 0 ? (
          <p className={styles.nemaRezultata}>Nema klijenata za &quot;{upit}&quot;.</p>
        ) : (
          <>
            <div className={styles.tabelaWrap}>
              <table className={styles.tabela}>
                <thead>
                  <tr>
                    <th className={styles.kolonaKlijent}>Klijent</th>
                    <th>Država</th>
                    <th>Podrazumevano</th>
                    <th>Podrazumevana stavka</th>
                    <th>Poslednja faktura</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtrirani.map((k) => (
                    <tr key={k.id} className={styles.red} onClick={() => setUredjivanje(k.id)}>
                      <td>
                        <div className={styles.klijentCelija}>
                          <span title={k.name}>{k.name}</span>
                          {k.billingEmail && (
                            <span className={styles.podnaslov} title={k.billingEmail}>
                              {k.billingEmail}
                            </span>
                          )}
                        </div>
                      </td>
                      <td>{k.country}</td>
                      <td>{opisPodrazumevanog(k)}</td>
                      <td className={styles.ellip} title={opisStavke(k) ?? "Iznos se upisuje na fakturi"}>
                        {opisStavke(k) ?? <span className={styles.podnaslov}>Iznos se upisuje na fakturi</span>}
                      </td>
                      <td>
                        {k.poslednjaFaktura ? (
                          formatDatumSrpski(new Date(k.poslednjaFaktura))
                        ) : (
                          <span className={styles.podnaslov}>Nema faktura</span>
                        )}
                      </td>
                      <td></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className={styles.karticeMobilne}>
              {filtrirani.map((k) => (
                <div key={k.id} className={styles.kartaKlijenta} onClick={() => setUredjivanje(k.id)}>
                  <div className={styles.kartaGore}>
                    <div className={styles.klijentCelija}>
                      <span>{k.name}</span>
                      {k.billingEmail && <span className={styles.podnaslov}>{k.billingEmail}</span>}
                    </div>
                    <IkonaTacke size={20} />
                  </div>
                  <span className={styles.kartaStavka}>
                    {opisStavke(k) ?? <span className={styles.podnaslov}>Iznos se upisuje na fakturi</span>}
                  </span>
                  <div className={styles.kartaDole}>
                    <span>{k.country ? `${k.country}, ${opisPodrazumevanog(k)}` : opisPodrazumevanog(k)}</span>
                    <span>{k.poslednjaFaktura ? formatDatumSrpski(new Date(k.poslednjaFaktura)) : "Nema faktura"}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {uredjivanje && (
        <ClientPanel
          klijent={klijentUredjivanje}
          racuni={racuni}
          onClose={() => setUredjivanje(null)}
          onSaved={() => {
            setUredjivanje(null);
            router.refresh();
          }}
          onObrisi={klijentUredjivanje ? () => obrisiIliArhiviraj(klijentUredjivanje.id) : undefined}
        />
      )}
    </>
  );
}
