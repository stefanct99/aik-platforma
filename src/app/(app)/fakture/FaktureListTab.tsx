// Lista faktura (Korak 8a, frejm Fak1/Fak2, PhFak1/PhFak2, spec 7.3).
"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { IkonaFakture, IkonaPretraga, IkonaChevronDole } from "@/components/ui/icons";
import { StatusZnacka } from "@/components/fakture/StatusZnacka";
import { RedMenija, type StavkaMenija } from "@/components/fakture/RedMenija";
import { OznaciPlacenomDialog } from "@/components/fakture/OznaciPlacenomDialog";
import { StornoDialog } from "@/components/fakture/StornoDialog";
import { efektivniStatus, type EfektivniStatus } from "@/lib/invoice-status";
import { labelaStatusa } from "@/lib/invoice-display";
import { formatNovacKompaktno } from "@/lib/money";
import { formatDatumSrpski } from "@/lib/datum";
import { obrisiNacrtAction } from "./actions";
import type { FakturaRed } from "@/lib/invoice-row";
import styles from "./FaktureListTab.module.css";

const FILTERI: { kljuc: string; naziv: string; status?: EfektivniStatus }[] = [
  { kljuc: "sve", naziv: "Sve" },
  { kljuc: "nacrti", naziv: "Nacrti", status: "nacrt" },
  { kljuc: "poslate", naziv: "Poslate", status: "poslata" },
  { kljuc: "kasne", naziv: "Kasne", status: "kasni" },
  { kljuc: "placene", naziv: "Plaćene", status: "placena" },
  { kljuc: "stornirane", naziv: "Stornirane", status: "stornirana" },
];

const PERIODI = [
  { kljuc: "30", naziv: "Poslednjih 30 dana" },
  { kljuc: "90", naziv: "Poslednjih 90 dana" },
  { kljuc: "godina", naziv: "Ova godina" },
  { kljuc: "sve", naziv: "Sve" },
];

const PO_STRANI = 50;

type Prosireni = FakturaRed & { efektivni: EfektivniStatus };

function uPeriodu(iso: string, period: string, danas: Date): boolean {
  if (period === "sve") return true;
  const datum = new Date(iso);
  if (period === "godina") return datum.getUTCFullYear() === danas.getUTCFullYear();
  const dani = Number(period);
  const razlikaDana = (danas.getTime() - datum.getTime()) / 86400000;
  return razlikaDana <= dani && razlikaDana >= 0;
}

export function FaktureListTab({ redovi, danasIso }: { redovi: FakturaRed[]; danasIso: string }) {
  const router = useRouter();
  const danas = useMemo(() => new Date(danasIso), [danasIso]);
  const [filter, setFilter] = useState("sve");
  const [valuta, setValuta] = useState("sve");
  const [period, setPeriod] = useState("90");
  const [pretraga, setPretraga] = useState("");
  const [sortKolona, setSortKolona] = useState<"number" | "clientName" | "issueDate" | "dueDate" | "total">(
    "issueDate",
  );
  const [sortSilazno, setSortSilazno] = useState(true);
  const [strana, setStrana] = useState(1);
  const [oznaciId, setOznaciId] = useState<string | null>(null);
  const [stornoId, setStornoId] = useState<string | null>(null);

  const prosireni: Prosireni[] = useMemo(
    () =>
      redovi.map((r) => ({
        ...r,
        efektivni: efektivniStatus(r.status, new Date(r.issueDate), r.dueDays, danas),
      })),
    [redovi, danas],
  );

  const valute = useMemo(() => Array.from(new Set(redovi.map((r) => r.currency))).sort(), [redovi]);

  const brojacPoFilteru = (kljuc: string, status?: EfektivniStatus) =>
    status ? prosireni.filter((r) => r.efektivni === status).length : prosireni.length;

  const filtrirani = useMemo(() => {
    const aktivniFilter = FILTERI.find((f) => f.kljuc === filter);
    return prosireni.filter((r) => {
      if (aktivniFilter?.status && r.efektivni !== aktivniFilter.status) return false;
      if (valuta !== "sve" && r.currency !== valuta) return false;
      if (!uPeriodu(r.issueDate, period, danas)) return false;
      if (pretraga.trim()) {
        const upit = pretraga.trim().toLowerCase();
        if (!r.clientName.toLowerCase().includes(upit) && !r.number.toLowerCase().includes(upit)) return false;
      }
      return true;
    });
  }, [prosireni, filter, valuta, period, pretraga, danas]);

  const sortirani = useMemo(() => {
    const kopija = filtrirani.slice();
    kopija.sort((a, b) => {
      let rez = 0;
      if (sortKolona === "number") rez = a.number.localeCompare(b.number);
      else if (sortKolona === "clientName") rez = a.clientName.localeCompare(b.clientName);
      else if (sortKolona === "issueDate") rez = new Date(a.issueDate).getTime() - new Date(b.issueDate).getTime();
      else if (sortKolona === "dueDate") {
        rez =
          new Date(a.issueDate).getTime() +
          a.dueDays * 86400000 -
          (new Date(b.issueDate).getTime() + b.dueDays * 86400000);
      } else if (sortKolona === "total") rez = a.total - b.total;
      return sortSilazno ? -rez : rez;
    });
    return kopija;
  }, [filtrirani, sortKolona, sortSilazno]);

  const ukupnoStrana = Math.max(1, Math.ceil(sortirani.length / PO_STRANI));
  const naStrani = sortirani.slice((strana - 1) * PO_STRANI, strana * PO_STRANI);

  function promeniSort(kolona: typeof sortKolona) {
    if (sortKolona === kolona) setSortSilazno((v) => !v);
    else {
      setSortKolona(kolona);
      setSortSilazno(true);
    }
  }

  const poslate = prosireni.filter((r) => r.efektivni === "poslata");
  const kasne = prosireni.filter((r) => r.efektivni === "kasni");
  const placeno30 = prosireni.filter((r) => {
    if (r.efektivni !== "placena" || !r.paidDate) return false;
    const dani = (danas.getTime() - new Date(r.paidDate).getTime()) / 86400000;
    return dani >= 0 && dani <= 30;
  });

  function zbirPoValuti(lista: Prosireni[]): string[] {
    const mapa = new Map<string, number>();
    lista.forEach((r) => mapa.set(r.currency, (mapa.get(r.currency) ?? 0) + r.total));
    if (mapa.size === 0) return [formatNovacKompaktno(0, "EUR")];
    return Array.from(mapa.entries()).map(([c, v]) => formatNovacKompaktno(v, c));
  }

  if (redovi.length === 0) {
    return (
      <div className={styles.prazno}>
        <span className={styles.praznaIkonica}>
          <IkonaFakture size={32} />
        </span>
        <div className={styles.praznoTekst}>
          <span className={styles.praznoNaslov}>Još nemaš nijednu fakturu</span>
          <span className={styles.praznoOpis}>Napravi prvu i ja se brinem za ostalo.</span>
        </div>
        <div className={styles.praznoKoraci}>
          {["Izabereš klijenta i valutu.", "Ja popunjavam broj, datum i podatke o tvojoj firmi.", "Pregledaš i šalješ klijentu jednim klikom."].map(
            (tekst, i) => (
              <div key={i} className={styles.praznoKorak}>
                <span className={styles.praznoBroj}>{i + 1}</span>
                <span>{tekst}</span>
              </div>
            ),
          )}
        </div>
        <Button varijanta="primarno" onClick={() => router.push("/fakture/nova")}>
          Napravi prvu fakturu
        </Button>
      </div>
    );
  }

  function stavkeMenija(red: Prosireni): StavkaMenija[] {
    if (red.efektivni === "nacrt") {
      return [
        { kljuc: "nastavi", tekst: "Nastavi uređivanje", href: `/fakture/izmeni/${red.id}` },
        {
          kljuc: "obrisi",
          tekst: "Obriši",
          opasno: true,
          onClick: async () => {
            await obrisiNacrtAction(red.id);
            router.refresh();
          },
        },
      ];
    }
    const stavke: StavkaMenija[] = [
      { kljuc: "otvori", tekst: "Otvori", href: `/fakture/${red.id}` },
      { kljuc: "dupliraj", tekst: "Dupliraj", href: `/fakture/nova?dupliraj=${red.id}` },
      { kljuc: "pdf", tekst: "Preuzmi PDF", href: `/api/fakture/${red.id}/pdf` },
      // "Pošalji ponovo" i dalje vodi na praznu formu (nasleđeno iz 8a) - stvarno ponovno slanje nije u
      // obimu Koraka 8b (videti izveštaj, tačka "šta ostaje otvoreno").
      { kljuc: "posalji", tekst: "Pošalji ponovo", href: "/fakture/nova" },
    ];
    if (red.efektivni !== "placena") {
      stavke.push({ kljuc: "placena", tekst: "Označi kao plaćenu", onClick: () => setOznaciId(red.id) });
    }
    if (red.efektivni !== "stornirana") {
      stavke.push({ kljuc: "storno", tekst: "Storniraj", opasno: true, onClick: () => setStornoId(red.id) });
    }
    return stavke;
  }

  const oznaciRed = oznaciId ? prosireni.find((r) => r.id === oznaciId) : null;
  const stornoRed = stornoId ? prosireni.find((r) => r.id === stornoId) : null;

  return (
    <div className={styles.sadrzaj}>
      <div className={styles.kartice}>
        <div className={styles.kartica}>
          <span className={styles.karticaLabela}>Čeka naplatu</span>
          <span className={styles.karticaVrednost}>
            {zbirPoValuti(poslate).map((v) => (
              <span key={v} className={styles.vrednostRed}>
                {v}
              </span>
            ))}
          </span>
          <span className={styles.karticaLabela}>
            {poslate.length} {poslate.length === 1 ? "faktura" : "fakture"}
          </span>
        </div>
        <div className={`${styles.kartica} ${styles.karticaKasni}`}>
          <span className={styles.karticaLabela}>Kasni</span>
          <span className={`${styles.karticaVrednost} ${styles.vrednostKasni}`}>
            {zbirPoValuti(kasne).map((v) => (
              <span key={v} className={styles.vrednostRed}>
                {v}
              </span>
            ))}
          </span>
          <span className={styles.karticaLabela}>
            {kasne.length > 0 ? `${kasne.length} ${kasne.length === 1 ? "faktura" : "fakture"}, ${kasne[0].clientName}` : "Nema kašnjenja"}
          </span>
        </div>
        <div className={`${styles.kartica} ${styles.karticaTreca}`}>
          <span className={styles.karticaLabela}>Naplaćeno u poslednjih 30 dana</span>
          <span className={styles.karticaVrednost}>
            {zbirPoValuti(placeno30).map((v) => (
              <span key={v} className={styles.vrednostRed}>
                {v}
              </span>
            ))}
          </span>
          <span className={styles.karticaLabela}>
            {placeno30.length} {placeno30.length === 1 ? "faktura" : "fakture"}
          </span>
        </div>
      </div>

      <div className={styles.alatnaTraka}>
        <div className={styles.cipovi}>
          {FILTERI.map((f) => (
            <button
              key={f.kljuc}
              type="button"
              className={`${styles.cip} ${filter === f.kljuc ? styles.cipAktivan : ""}`}
              onClick={() => {
                setFilter(f.kljuc);
                setStrana(1);
              }}
            >
              {f.naziv}
              <span className={styles.cipBroj}>{brojacPoFilteru(f.kljuc, f.status)}</span>
            </button>
          ))}
        </div>
        <div className={styles.padajuciDesktop}>
          <span className={styles.selectOmot}>
            <select value={valuta} onChange={(e) => setValuta(e.target.value)} className={styles.select}>
              <option value="sve">Sve valute</option>
              {valute.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
            <IkonaChevronDole size={16} />
          </span>
          <span className={styles.selectOmot}>
            <select value={period} onChange={(e) => setPeriod(e.target.value)} className={styles.select}>
              {PERIODI.map((p) => (
                <option key={p.kljuc} value={p.kljuc}>
                  {p.naziv}
                </option>
              ))}
            </select>
            <IkonaChevronDole size={16} />
          </span>
        </div>
        <div className={styles.pretragaMobilna}>
          <IkonaPretraga size={18} />
          <input
            placeholder="Traži fakturu"
            value={pretraga}
            onChange={(e) => setPretraga(e.target.value)}
          />
        </div>
      </div>

      {naStrani.length === 0 ? (
        <p className={styles.nemaRezultata}>Nema faktura za izabrane filtere.</p>
      ) : (
        <>
          <div className={styles.tabelaWrap}>
            <table className={styles.tabela}>
              <thead>
                <tr>
                  <th onClick={() => promeniSort("number")}>Broj</th>
                  <th onClick={() => promeniSort("clientName")}>Klijent</th>
                  <th onClick={() => promeniSort("issueDate")}>Datum</th>
                  <th onClick={() => promeniSort("dueDate")}>Rok</th>
                  <th className={styles.desno} onClick={() => promeniSort("total")}>
                    Iznos
                  </th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {naStrani.map((red) => (
                  <tr
                    key={red.id}
                    className={styles.red}
                    onClick={() => router.push(`/fakture/${red.id}`)}
                  >
                    <td className={red.efektivni === "stornirana" ? styles.prigusen : ""}>
                      {red.efektivni === "nacrt" ? "Nacrt" : red.number}
                    </td>
                    <td className={styles.ellip}>{red.clientName}</td>
                    <td>{red.efektivni === "nacrt" ? "Nije poslata" : formatDatumSrpski(new Date(red.issueDate))}</td>
                    <td>
                      {red.efektivni === "nacrt"
                        ? "–"
                        : formatDatumSrpski(new Date(new Date(red.issueDate).getTime() + red.dueDays * 86400000))}
                    </td>
                    <td className={`${styles.desno} ${red.efektivni === "stornirana" ? styles.precrtano : ""}`}>
                      {formatNovacKompaktno(red.total, red.currency)}
                    </td>
                    <td>
                      <StatusZnacka status={red.efektivni} tekst={labelaStatusa(red.efektivni, new Date(red.issueDate), red.dueDays, danas)} />
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <RedMenija stavke={stavkeMenija(red)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={styles.karticeListaMobilna}>
            {naStrani.map((red) => (
              <div
                key={red.id}
                className={styles.kartaReda}
                onClick={() => router.push(`/fakture/${red.id}`)}
              >
                <div className={styles.kartaRedGore}>
                  <span>{red.clientName}</span>
                  <StatusZnacka status={red.efektivni} tekst={labelaStatusa(red.efektivni, new Date(red.issueDate), red.dueDays, danas)} />
                </div>
                <div className={styles.kartaRedPod}>
                  {red.efektivni === "nacrt" ? "Nacrt" : red.number} ·{" "}
                  {red.efektivni === "nacrt" ? "Nije poslata" : `Rok ${formatDatumSrpski(new Date(new Date(red.issueDate).getTime() + red.dueDays * 86400000))}`}
                </div>
                <div className={styles.kartaRedIznos}>{formatNovacKompaktno(red.total, red.currency)}</div>
              </div>
            ))}
          </div>

          {ukupnoStrana > 1 && (
            <div className={styles.paginacija}>
              <Button varijanta="sekundarno" disabled={strana <= 1} onClick={() => setStrana((s) => s - 1)}>
                Prethodna
              </Button>
              <span>
                Strana {strana} od {ukupnoStrana}
              </span>
              <Button
                varijanta="sekundarno"
                disabled={strana >= ukupnoStrana}
                onClick={() => setStrana((s) => s + 1)}
              >
                Sledeća
              </Button>
            </div>
          )}
        </>
      )}

      {oznaciRed && (
        <OznaciPlacenomDialog
          invoiceId={oznaciRed.id}
          broj={oznaciRed.number}
          onClose={() => setOznaciId(null)}
          onSacuvano={() => router.refresh()}
        />
      )}
      {stornoRed && (
        <StornoDialog
          invoiceId={stornoRed.id}
          broj={stornoRed.number}
          nazivKlijenta={stornoRed.clientName}
          onClose={() => setStornoId(null)}
          onSacuvano={() => router.refresh()}
        />
      )}
    </div>
  );
}
