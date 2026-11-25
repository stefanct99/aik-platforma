// Nova faktura / izmena (Korak 8b, spec 7.4, frejmovi Fak3/4/5/8/9/10/19/20 i PhFak ekvivalenti).
// Pun ekran PREKO aplikacije (bez Sidebar/TopBar - potvrđeno direktno iz frejma: nema stavki menija,
// sadržaj je "position:absolute;inset:0" sa sopstvenom gornjom trakom "Zatvori"/status pilula), zato je
// ruta NAMERNO van (app) grupe (isto rešenje kao /fakture/[id]/dokument - videti taj page.tsx).
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { FixedThemeTogglePill } from "@/components/app-shell/FixedThemeTogglePill";
import { TemaProvider } from "@/components/app-shell/TemaContext";
import type { Tema } from "@/lib/theme";
import { IkonaUpozorenje } from "@/components/auth-shell/auth-icons";
import { IkonaX, IkonaChevronDole, IkonaKanta } from "@/components/ui/icons";
import { InvoiceDoc } from "./InvoiceDoc";
import { ClientPanel } from "@/app/(app)/fakture/klijenti/ClientPanel";
import type { NoviKlijent } from "@/app/(app)/fakture/actions";
import { sacuvajNacrtAction, promeniBrojAction, obrisiNacrtAction } from "@/app/(app)/fakture/actions";
import { izracunajUkupno } from "@/lib/invoice-status";
import { formatNovacKompaktno, formatNovacPuno } from "@/lib/money";
import { formatDatumSrpski, formatVremeSrpski } from "@/lib/datum";
import { InvoiceSendStage } from "./InvoiceSendStage";
import styles from "./InvoiceEditor.module.css";

export type KlijentZaFakturu = {
  id: string;
  name: string;
  billingEmail: string | null;
  defaultCurrency: string;
  defaultLang: "sr" | "en";
  defaultDueDays: number;
  defaultAccountId: string | null;
  defaultItemDesc: string | null;
  defaultItemAmount: number | null;
  country: string | null;
  pib: string | null;
  address: string | null;
};

export type RacunZaFakturu = {
  id: string;
  currency: string;
  type: string;
  bank: string;
  iban: string | null;
  swift: string | null;
  number: string | null;
};

export type StavkaForme = { desc: string; qty: number; price: number };

export type PostojecaFaktura = {
  id: string;
  broj: string;
  status: "nacrt" | "poslata";
  clientId: string;
  currency: string;
  lang: "sr" | "en";
  issueDate: string;
  dueDays: number;
  accountId: string | null;
  note: string | null;
  items: StavkaForme[];
};

export type PocetniDuplikat = {
  clientId: string;
  currency: string;
  lang: "sr" | "en";
  dueDays: number;
  accountId: string | null;
  note: string | null;
  items: StavkaForme[];
};

const ROK_PRESETI = [3, 7, 15, 30];
const PRAZNA_STAVKA: StavkaForme = { desc: "", qty: 1, price: 0 };

function podrazumevaneStavkeZaKlijenta(k: KlijentZaFakturu | undefined): StavkaForme[] {
  if (k?.defaultItemDesc && k.defaultItemAmount != null) {
    return [{ desc: k.defaultItemDesc, qty: 1, price: k.defaultItemAmount }];
  }
  return [{ ...PRAZNA_STAVKA }];
}

function oznakaKlijentaUListi(k: KlijentZaFakturu): string {
  if (k.defaultCurrency === "RSD") return "Dinarski klijent";
  if (k.defaultItemDesc && k.defaultItemAmount != null) {
    return `${k.defaultItemDesc}, ${formatNovacKompaktno(k.defaultItemAmount, k.defaultCurrency)}`;
  }
  return "Iznos upisuješ na fakturi";
}

export function InvoiceEditor({
  postojeca,
  pocetniDuplikat,
  klijenti,
  racuni,
  firma,
  sledeciBroj,
  tema,
}: {
  postojeca: PostojecaFaktura | null;
  pocetniDuplikat: PocetniDuplikat | null;
  klijenti: KlijentZaFakturu[];
  racuni: RacunZaFakturu[];
  firma: { ownerName: string; name: string; mb: string; pib: string; street: string | null; city: string | null };
  sledeciBroj: string;
  tema: Tema;
}) {
  const router = useRouter();
  const polazna = postojeca ?? pocetniDuplikat;

  const [svaKlijenti, setSvaKlijenti] = useState(klijenti);
  const [trenutniId, setTrenutniId] = useState<string | null>(postojeca?.id ?? null);
  const [broj, setBroj] = useState(postojeca?.broj ?? sledeciBroj);
  // Poslednji POTVRĐENI broj (ono što je stvarno u bazi) - odvojeno od "broj" (prikazana/menjana vrednost
  // polja na svaki taster). Ref, ne state: ne sme da izazove ponovni render, i mora da bude dostupan bez
  // zakasnelog "closure" snapshot-a unutar async naPromenuBroja.
  const brojPotvrdjen = useRef(broj);
  const [clientId, setClientId] = useState<string | null>(polazna?.clientId ?? null);
  const klijent = svaKlijenti.find((k) => k.id === clientId);

  const [currency, setCurrency] = useState(polazna?.currency ?? klijent?.defaultCurrency ?? "EUR");
  const [lang, setLang] = useState<"sr" | "en">(polazna?.lang ?? klijent?.defaultLang ?? "sr");
  const pocetniRokJePreset = polazna ? ROK_PRESETI.includes(polazna.dueDays) : true;
  const [rokPreset, setRokPreset] = useState<string>(
    polazna ? (pocetniRokJePreset ? String(polazna.dueDays) : "drugi") : "7",
  );
  const [rokPrilagodjen, setRokPrilagodjen] = useState(polazna?.dueDays ?? 7);
  const dueDays = rokPreset === "drugi" ? rokPrilagodjen : Number(rokPreset);
  const [accountId, setAccountId] = useState<string | null>(polazna?.accountId ?? klijent?.defaultAccountId ?? null);
  const [note, setNote] = useState(polazna?.note ?? "Hvala na saradnji");
  const [items, setItems] = useState<StavkaForme[]>(polazna?.items ?? podrazumevaneStavkeZaKlijenta(klijent));

  const [klijentPicker, setKlijentPicker] = useState(false);
  const [pretragaKlijenta, setPretragaKlijenta] = useState("");
  const [jezikPicker, setJezikPicker] = useState(false);
  const [noviKlijentOtvoren, setNoviKlijentOtvoren] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [zatvoriPotvrda, setZatvoriPotvrda] = useState(false);
  const [brojGreska, setBrojGreska] = useState<string | null>(null);
  const [stage, setStage] = useState<"edit" | "send" | "sent">("edit");
  const [potvrda, setPotvrda] = useState<{
    broj: string;
    klijentIme: string;
    billingEmail: string;
    ukupno: number;
    valuta: string;
    rokIso: string;
  } | null>(null);

  const [cuvanjeStanje, setCuvanjeStanje] = useState<"prazno" | "izmenjeno" | "cuvam" | "sacuvano">(
    trenutniId ? "sacuvano" : "prazno",
  );
  const [sacuvanoU, setSacuvanoU] = useState<string | null>(postojeca ? formatVremeSrpski(new Date()) : null);
  const vremeTajmera = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prviRender = useRef(true);

  const account = racuni.find((r) => r.id === accountId) ?? racuni.find((r) => r.currency === currency) ?? null;
  const ukupno = izracunajUkupno(items);
  // issueDate je ZAKLJUČAN od prvog čuvanja (spec 7.4) - za postojeću fakturu prikazuje STVARAN datum
  // izdavanja, nikad "danas"; za novu/duplikat pokazuje danas (biće i stvarno "danas" kad se prvi put
  // sačuva, videti sacuvajNacrt u src/lib/invoices.ts).
  const datumIzdavanja = postojeca ? new Date(postojeca.issueDate) : new Date();
  const dodatneValute = useMemo(
    () => Array.from(new Set(racuni.map((r) => r.currency))).filter((c) => !["EUR", "USD", "RSD"].includes(c)),
    [racuni],
  );

  const imaIStogaSeMoraPitatiPriZatvaranju = Boolean(trenutniId || clientId || items.some((it) => it.desc || it.price));

  const errClient = !clientId;
  const errItems = !items.some((it) => it.desc.trim() && it.price > 0);
  const brojGresaka = (errClient ? 1 : 0) + (errItems ? 1 : 0);

  function postaviIzKlijenta(k: KlijentZaFakturu) {
    setClientId(k.id);
    setCurrency(k.defaultCurrency);
    setLang(k.defaultLang);
    const jePreset = ROK_PRESETI.includes(k.defaultDueDays);
    setRokPreset(jePreset ? String(k.defaultDueDays) : "drugi");
    setRokPrilagodjen(k.defaultDueDays);
    setAccountId(k.defaultAccountId);
    setItems(podrazumevaneStavkeZaKlijenta(k));
    setKlijentPicker(false);
    setPretragaKlijenta("");
  }

  function izmeniStavku(i: number, polje: keyof StavkaForme, vrednost: string | number) {
    setItems((trenutne) => trenutne.map((st, idx) => (idx === i ? { ...st, [polje]: vrednost } : st)));
  }
  function dodajStavku() {
    setItems((trenutne) => [...trenutne, { ...PRAZNA_STAVKA }]);
  }
  function obrisiStavku(i: number) {
    setItems((trenutne) => trenutne.filter((_, idx) => idx !== i));
  }

  function formDataZaSlanje(): FormData {
    const fd = new FormData();
    fd.set("clientId", clientId ?? "");
    fd.set("currency", currency);
    fd.set("lang", lang);
    fd.set("dueDays", String(dueDays));
    fd.set("accountId", accountId ?? "");
    fd.set("note", note);
    fd.set("stavke", JSON.stringify(items.map((it) => ({ desc: it.desc, qty: it.qty, price: it.price / 100 }))));
    return fd;
  }

  async function cuvajNacrt(): Promise<string | null> {
    if (!imaIStogaSeMoraPitatiPriZatvaranju) return null;
    setCuvanjeStanje("cuvam");
    const rezultat = await sacuvajNacrtAction(trenutniId, { id: null, broj: null, sacuvanoU: null, greska: null }, formDataZaSlanje());
    if (rezultat.greska) {
      setCuvanjeStanje("izmenjeno");
      return null;
    }
    setTrenutniId(rezultat.id);
    if (rezultat.broj) {
      setBroj(rezultat.broj);
      brojPotvrdjen.current = rezultat.broj;
    }
    setCuvanjeStanje("sacuvano");
    setSacuvanoU(rezultat.sacuvanoU);
    return rezultat.id;
  }

  // Automatsko čuvanje (zadatak tačka 3): kratak zastoj (2s) posle poslednje izmene polja, ne posle
  // svakog tastera - i nikad za potpuno praznu formu (tad ne pravi nacrt, "Prazna forma koju korisnik
  // zatvori ne ostavlja nacrt").
  useEffect(() => {
    if (prviRender.current) {
      prviRender.current = false;
      return;
    }
    if (stage !== "edit") return;
    if (!imaIStogaSeMoraPitatiPriZatvaranju) return;
    // setState se namerno NE poziva direktno u telu efekta (React pravilo) - zakazuje se za sledeći
    // mikrotask, praktično istog trenutka za korisnika.
    queueMicrotask(() => setCuvanjeStanje("izmenjeno"));
    if (vremeTajmera.current) clearTimeout(vremeTajmera.current);
    vremeTajmera.current = setTimeout(() => {
      cuvajNacrt();
    }, 2000);
    return () => {
      if (vremeTajmera.current) clearTimeout(vremeTajmera.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId, currency, lang, dueDays, accountId, note, items, stage]);

  async function naSacuvajNacrt() {
    if (vremeTajmera.current) clearTimeout(vremeTajmera.current);
    await cuvajNacrt();
  }

  async function naPregledajIPosalji() {
    if (errClient || errItems) {
      setShowErrors(true);
      return;
    }
    if (vremeTajmera.current) clearTimeout(vremeTajmera.current);
    const id = await cuvajNacrt();
    if (id) setStage("send");
  }

  function zatvori() {
    if (vremeTajmera.current) clearTimeout(vremeTajmera.current);
    if (imaIStogaSeMoraPitatiPriZatvaranju) {
      setZatvoriPotvrda(true);
    } else {
      router.push("/fakture");
    }
  }

  async function odbaciIZatvori() {
    if (trenutniId && (!postojeca || postojeca.status === "nacrt")) {
      await obrisiNacrtAction(trenutniId);
    }
    router.push("/fakture");
  }

  async function sacuvajNacrtIZatvori() {
    await cuvajNacrt();
    router.push("/fakture");
  }

  async function naPromenuBroja(noviBroj: string) {
    const potvrdjeni = brojPotvrdjen.current;
    if (!trenutniId || noviBroj === potvrdjeni) return; // broj se dodeljuje tek pri prvom čuvanju, i nema promene da se šalje
    const rezultat = await promeniBrojAction(trenutniId, noviBroj);
    if (!rezultat.ok) {
      setBroj(potvrdjeni); // odbijena izmena se NE prikazuje kao da je sačuvana (ni u polju ni u pregledu)
      setBrojGreska(rezultat.greska);
    } else {
      brojPotvrdjen.current = noviBroj;
      setBrojGreska(null);
      router.refresh();
    }
  }

  if (stage === "send" || stage === "sent") {
    return (
      <div className="appShell" data-theme={tema === "sistem" ? undefined : tema}>
        <TemaProvider initialTema={tema}>
          <InvoiceSendStage
            id={trenutniId!}
            broj={broj}
            klijent={klijent ?? null}
            valuta={currency}
            jezik={lang}
            ukupno={ukupno}
            rokDana={dueDays}
            firma={firma}
            account={account}
            stavke={items}
            datumIzdavanja={datumIzdavanja}
            posalji={potvrda}
            onPosalji={(p) => {
              setPotvrda(p);
              setStage("sent");
            }}
            onNazad={() => setStage("edit")}
            onZatvoriPoslato={() => router.push("/fakture")}
          />
        </TemaProvider>
      </div>
    );
  }

  const indikator = cuvanjeStanje === "cuvam" ? "Čuvam..." : cuvanjeStanje === "sacuvano" && sacuvanoU ? `sačuvano u ${sacuvanoU}` : "nije sačuvano";

  return (
    <div className="appShell" data-theme={tema === "sistem" ? undefined : tema}>
      <TemaProvider initialTema={tema}>
    <div className={styles.omot}>
      <div className={styles.red}>
        <div className={styles.formaKolona}>
          <div className={styles.gornjaTraka}>
            <button type="button" className={styles.zatvoriPilula} onClick={zatvori}>
              <IkonaX size={18} /> Zatvori
            </button>
            <span className={styles.statusPilula}>
              <span className={styles.statusPilulaDesktop}>{postojeca?.status === "poslata" ? "Izmena, " : "Nacrt, "}</span>
              {indikator}
            </span>
          </div>

          <div className={styles.telo}>
            <h1 className={styles.naslov}>{postojeca ? "Izmena fakture" : "Nova faktura"}</h1>

            {postojeca?.status === "poslata" && (
              <div className={styles.upozorenjePoslata}>
                <IkonaUpozorenje size={18} />
                <span>Menjaš fakturu koja je već poslata klijentu. Klijent i dalje ima staru verziju dok je ponovo ne pošalješ.</span>
              </div>
            )}

            {showErrors && brojGresaka > 0 && (
              <div className={styles.banerGreska}>
                <IkonaUpozorenje size={18} />
                <span>
                  {brojGresaka === 1 ? "Još jedno polje treba da popuniš pre slanja." : "Još dva polja treba da popuniš pre slanja."}
                </span>
              </div>
            )}

            <div className={styles.poljeOmot} style={{ position: "relative" }}>
              <span className={styles.labela}>Klijent</span>
              <button
                type="button"
                className={styles.kombo}
                onClick={() => setKlijentPicker((v) => !v)}
              >
                <span className={styles.komboTekst}>{klijent ? klijent.name : "Izaberi klijenta"}</span>
                <IkonaChevronDole size={16} />
              </button>
              <span className={styles.noviKlijentGore}>
                <a href="#" onClick={(e) => { e.preventDefault(); setNoviKlijentOtvoren(true); }}>
                  + Novi klijent
                </a>
              </span>
              {klijentPicker && (
                <div className={styles.padajuciKlijent}>
                  <input
                    className={styles.pretragaKlijenta}
                    placeholder="Traži klijenta"
                    value={pretragaKlijenta}
                    onChange={(e) => setPretragaKlijenta(e.target.value)}
                    autoFocus
                  />
                  {svaKlijenti
                    .filter((k) => k.name.toLowerCase().includes(pretragaKlijenta.trim().toLowerCase()))
                    .map((k) => (
                      <button key={k.id} type="button" className={styles.klijentRed} onClick={() => postaviIzKlijenta(k)}>
                        <span className={styles.klijentRedGlavno}>
                          <span>{k.name}</span>
                          {k.billingEmail && <span className={styles.klijentRedMejl}>{k.billingEmail}</span>}
                        </span>
                        <span className={styles.klijentRedOznaka}>{oznakaKlijentaUListi(k)}</span>
                      </button>
                    ))}
                  <button
                    type="button"
                    className={styles.noviKlijentDole}
                    onClick={() => {
                      setKlijentPicker(false);
                      setNoviKlijentOtvoren(true);
                    }}
                  >
                    + Novi klijent
                  </button>
                </div>
              )}
              {showErrors && errClient && (
                <div className={styles.poljeGreska}>
                  <IkonaUpozorenje size={16} />
                  <span>Izaberi klijenta kome šalješ fakturu.</span>
                </div>
              )}
            </div>

            {klijent?.billingEmail && (
              <div className={styles.saljemNa}>
                <span>
                  Šaljem na <b>{klijent.billingEmail}</b>
                </span>
              </div>
            )}
            {klijent?.defaultItemDesc && (
              <p className={styles.hintTekst}>Popunjeno iz profila klijenta: valuta, jezik, rok, račun i stavka.</p>
            )}
            {klijent && !klijent.defaultItemDesc && items.length === 1 && !items[0].desc && (
              <p className={styles.hintTekst}>{klijent.name} nema podrazumevanu cenu, pa iznos upisuješ svaki put.</p>
            )}

            <div className={styles.redPolja}>
              <div className={styles.poljeOmot}>
                <span className={styles.labela}>Valuta</span>
                <div className={styles.segmentiran}>
                  {["EUR", "USD", "RSD", ...dodatneValute].map((c) => (
                    <button
                      key={c}
                      type="button"
                      className={currency === c ? styles.aktivno : ""}
                      onClick={() => setCurrency(c)}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <div className={styles.poljeOmot} style={{ position: "relative" }}>
                <span className={styles.labela}>Jezik fakture</span>
                <button type="button" className={styles.kombo} onClick={() => setJezikPicker((v) => !v)}>
                  <span className={styles.komboTekst}>{lang === "sr" ? "Srpski" : "Engleski"}</span>
                  <IkonaChevronDole size={16} />
                </button>
                {jezikPicker && (
                  <div className={styles.padajuciMali}>
                    <button type="button" onClick={() => { setLang("sr"); setJezikPicker(false); }}>
                      Srpski
                    </button>
                    <button type="button" onClick={() => { setLang("en"); setJezikPicker(false); }}>
                      Engleski
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.redPolja}>
              <div className={styles.poljeOmot}>
                <span className={styles.labela}>Broj</span>
                <input
                  className={styles.unosProst}
                  value={broj}
                  disabled={!trenutniId}
                  title={!trenutniId ? "Broj se dodeljuje pri prvom čuvanju." : undefined}
                  onChange={(e) => setBroj(e.target.value)}
                  onBlur={(e) => naPromenuBroja(e.target.value)}
                />
                {brojGreska && <span className={styles.poljeGreskaTekst}>{brojGreska}</span>}
              </div>
              <div className={styles.poljeOmot}>
                <span className={styles.labela}>Datum izdavanja</span>
                <input className={styles.unosProst} value={formatDatumSrpski(datumIzdavanja)} disabled readOnly />
              </div>
              <div className={styles.poljeOmot} style={{ position: "relative" }}>
                <span className={styles.labela}>Rok</span>
                <select
                  className={styles.kombo}
                  value={rokPreset}
                  onChange={(e) => setRokPreset(e.target.value)}
                >
                  {ROK_PRESETI.map((d) => (
                    <option key={d} value={String(d)}>
                      {d} dana
                    </option>
                  ))}
                  <option value="drugi">Drugi broj dana</option>
                </select>
                {rokPreset === "drugi" && (
                  <input
                    type="number"
                    min={1}
                    className={styles.unosProst}
                    value={rokPrilagodjen}
                    onChange={(e) => setRokPrilagodjen(Math.max(1, Number(e.target.value) || 1))}
                    style={{ marginTop: "var(--space-2)" }}
                  />
                )}
              </div>
            </div>

            <div className={styles.karticaStavke}>
              <span className={styles.naslovSekcije}>Stavke</span>
              <div className={styles.zaglavljeStavki}>
                <span className={styles.stOpis}>Opis</span>
                <span className={styles.stKol}>Kol.</span>
                <span className={styles.stCena}>Cena</span>
                <span className={styles.stIznos}>Iznos</span>
                <span style={{ width: 28 }} />
              </div>
              {items.map((it, i) => (
                <div className={styles.redStavke} key={i}>
                  <input
                    className={`${styles.unosProst} ${styles.stOpis}`}
                    placeholder="Opis stavke"
                    value={it.desc}
                    onChange={(e) => izmeniStavku(i, "desc", e.target.value)}
                  />
                  <input
                    type="number"
                    min={1}
                    className={`${styles.unosProst} ${styles.stKol}`}
                    value={it.qty}
                    onChange={(e) => izmeniStavku(i, "qty", Math.max(1, Number(e.target.value) || 1))}
                  />
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Upiši iznos"
                    className={`${styles.unosProst} ${styles.stCena}`}
                    value={it.price ? it.price / 100 : ""}
                    onChange={(e) => izmeniStavku(i, "price", Math.round((Number(e.target.value) || 0) * 100))}
                  />
                  <span className={styles.stIznosPrikaz}>{formatNovacPuno(it.qty * it.price, currency)}</span>
                  {items.length > 1 ? (
                    <button type="button" className={styles.ukloniStavku} onClick={() => obrisiStavku(i)} aria-label="Ukloni stavku">
                      <IkonaKanta size={16} />
                    </button>
                  ) : (
                    <span style={{ width: 28 }} />
                  )}
                </div>
              ))}
              <button type="button" className={styles.dodajStavku} onClick={dodajStavku}>
                + Dodaj stavku
              </button>
              {showErrors && errItems && (
                <div className={styles.poljeGreska}>
                  <IkonaUpozorenje size={16} />
                  <span>Upiši opis stavke i iznos veći od 0.</span>
                </div>
              )}
              <div className={styles.redUkupno}>
                <span>PDV (nisam u sistemu PDV)</span>
                <span>{formatNovacKompaktno(0, currency)}</span>
              </div>
              <div className={`${styles.redUkupno} ${styles.redUkupnoGlavni}`}>
                <span>Ukupno</span>
                <span>{formatNovacPuno(ukupno, currency)}</span>
              </div>
            </div>

            <div className={styles.poljeOmot}>
              <span className={styles.labela}>Račun za uplatu</span>
              <select className={styles.kombo} value={accountId ?? ""} onChange={(e) => setAccountId(e.target.value || null)}>
                <option value="">–</option>
                {racuni
                  .filter((r) => r.currency === currency)
                  .map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.bank}, {r.currency}
                      {r.type === "RSD" ? ` ${r.number ?? ""}` : ` ${r.iban ?? ""}`}
                    </option>
                  ))}
              </select>
            </div>

            {currency === "RSD" && lang === "sr" && (
              <div className={styles.poljeOmot}>
                <span className={styles.labela}>Poziv na broj</span>
                <input className={styles.unosProst} value={`97 ${broj}`} disabled readOnly />
              </div>
            )}

            <div className={styles.poljeOmot}>
              <span className={styles.labela}>Napomena</span>
              <input className={styles.unosProst} value={note} onChange={(e) => setNote(e.target.value)} />
            </div>

            <div className={styles.pregledMobilni}>
              <span className={styles.naslovSekcije}>Pregled uživo</span>
              <div className={styles.papirOmotMobilni}>
                <div className={styles.papirSkaliranMobilni}>
                  <InvoiceDoc
                    broj={broj}
                    valuta={currency}
                    jezik={lang}
                    datumIzdavanja={datumIzdavanja}
                    dueDays={dueDays}
                    stavke={items}
                    klijent={klijent ?? null}
                    firma={firma}
                    racun={account}
                  />
                </div>
              </div>
            </div>

            <div className={styles.dugmad}>
              {postojeca?.status === "poslata" ? (
                <>
                  <a href="#" className={styles.promeniIzgledLink} onClick={(e) => e.preventDefault()}>
                    Promeni izgled fakture
                  </a>
                  <Button type="button" varijanta="primarno" onClick={naSacuvajNacrt}>
                    {cuvanjeStanje === "cuvam" ? "Čuvam..." : "Sačuvaj izmene"}
                  </Button>
                </>
              ) : (
                <>
                  <Button type="button" varijanta="sekundarno" onClick={naSacuvajNacrt}>
                    Sačuvaj nacrt
                  </Button>
                  <a href="#" className={styles.promeniIzgledLink} onClick={(e) => e.preventDefault()}>
                    Promeni izgled fakture
                  </a>
                  <Button type="button" varijanta="primarno" onClick={naPregledajIPosalji}>
                    Pregledaj i pošalji
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className={styles.pregledKolona}>
          <div className={styles.pregledNatpis}>
            <span>Pregled uživo</span>
            <a href="#" onClick={(e) => e.preventDefault()}>
              Promeni izgled fakture
            </a>
          </div>
          <div className={styles.papirOmot}>
            <InvoiceDoc
              broj={broj}
              valuta={currency}
              jezik={lang}
              datumIzdavanja={datumIzdavanja}
              dueDays={dueDays}
              stavke={items}
              klijent={klijent ?? null}
              firma={firma}
              racun={account}
            />
          </div>
        </div>
      </div>

      <FixedThemeTogglePill />

      {noviKlijentOtvoren && (
        <ClientPanel
          klijent={null}
          racuni={racuni}
          onClose={() => setNoviKlijentOtvoren(false)}
          onSaved={(noviKlijent?: NoviKlijent) => {
            setNoviKlijentOtvoren(false);
            if (noviKlijent) {
              const kaoKlijentZaFakturu: KlijentZaFakturu = { ...noviKlijent };
              setSvaKlijenti((trenutni) => [...trenutni, kaoKlijentZaFakturu]);
              postaviIzKlijenta(kaoKlijentZaFakturu);
            }
          }}
        />
      )}

      {zatvoriPotvrda && (!postojeca || postojeca.status === "nacrt") && (
        <Modal naslov="Sačuvati kao nacrt?" onClose={() => setZatvoriPotvrda(false)}>
          <div className={styles.dijalogTelo}>
            <p>Ova faktura još nije poslata. Mogu da je sačuvam kao nacrt, pa nastaviš kad ti odgovara.</p>
            <div className={styles.dijalogDugmad}>
              <Button type="button" varijanta="sekundarno" onClick={() => setZatvoriPotvrda(false)}>
                Nastavi izmene
              </Button>
              <Button type="button" varijanta="opasno" onClick={odbaciIZatvori}>
                Odbaci fakturu
              </Button>
              <Button type="button" varijanta="primarno" onClick={sacuvajNacrtIZatvori}>
                Sačuvaj nacrt
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {zatvoriPotvrda && postojeca?.status === "poslata" && (
        <Modal naslov="Odbaciti izmene?" onClose={() => setZatvoriPotvrda(false)}>
          <div className={styles.dijalogTelo}>
            <p>Faktura je već poslata - izmene koje nisi sačuvao se gube. Ne diram ono što je ranije poslato klijentu.</p>
            <div className={styles.dijalogDugmad}>
              <Button type="button" varijanta="sekundarno" onClick={() => setZatvoriPotvrda(false)}>
                Nastavi izmene
              </Button>
              <Button type="button" varijanta="opasno" onClick={() => router.push(`/fakture/${postojeca.id}`)}>
                Odbaci izmene
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
      </TemaProvider>
    </div>
  );
}
