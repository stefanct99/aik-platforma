// Editor šablona fakture (Korak 8d-4, frejm Fak18, desktop, samo nivo "Blok"). Platno crta ISTOM
// komponentom InvoiceDoc kao pregled fakture i PDF (prop "sablon", isti kod, Korak 8d-2) - ovde samo
// dodaje opcioni prop "izmeni" (klik na blok na platnu ga bira, isto kao klik u levoj listi).
"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { TemaProvider } from "@/components/app-shell/TemaContext";
import { FixedThemeTogglePill } from "@/components/app-shell/FixedThemeTogglePill";
import type { Tema } from "@/lib/theme";
import { IkonaX, IkonaChevronDole } from "@/components/ui/icons";
import { Toggle } from "@/components/ui/Toggle";
import { InvoiceDoc } from "@/components/invoice/InvoiceDoc";
import {
  NAZIVI_BLOKOVA,
  NAZIVI_KOLONA_TABELE,
  SVE_KOLONE_TABELE,
  prebaciUkljucenostBloka,
  azurirajSvojstvaBloka,
  validirajSvojstvaBloka,
  prebaciKolonuTabele,
  azurirajTabelu,
  azurirajDokument,
  azurirajAkcentBoju,
  type PodaciSablona,
  type BlokKljuc,
  type SvojstvaBloka,
} from "@/lib/invoice-templates";
import { sacuvajSablonAction, vratiSablonNaPodrazumevanoAction } from "@/app/(app)/fakture/actions";
import styles from "./TemplateEditorClient.module.css";

// Boje za "Boja teksta" (Korak 8d-4, frejm Fak18) - tačne vrednosti iz frejma, NE iz prototipa (koji ima
// drugačijih 5: '#161A17','#0F2A22','#6B706C','#B4281E','#1D5FC2') - frejm je ovde pobedio (izveštaj).
// Iste boje u obe teme (ovo je boja ŠTAMPANOG teksta na uvek-svetlom papiru, ne boja aplikacije) - tamni
// frejm (Dk_Fak18) menja prvu u #C8F169 i ne pokazuje nijedan izabran blok, što izgleda kao previd u
// dizajnu, ne namerna razlika (izveštaj).
const BOJE_TEKSTA = ["#0F2A22", "#161A17", "#2F5D12", "#1F4FBF", "#B4281E", "#8A5A00"];

// Boje za "Boja zaglavlja tabele" (Korak 8d-4b, frejm Fak25) - SAMO 4, ne 6 kao "Boja teksta"/"Boja akcenta"
// (ni prototip ni zadatak ovo ne navode tačno, frejm je presudio). Podrazumevano headerColor je "#ffffff"
// (= "bez pozadine", iz Koraka 8d-2) - nije među ovih 4, pa po podrazumevanom nijedan kvadratić nije
// aktivan (isto kao "Boja teksta" bloka gde podrazumevano #111 takođe nije među 6 ponuđenih boja).
const BOJE_ZAGLAVLJA_TABELE = ["#0F2A22", "#161A17", "#2F5D12", "#1F4FBF"];

// "Primer podataka" (frejm Fak18, prototip TemplateEditor sampleInv/sampleClient) - isti izmišljeni
// klijent i stavke kao u prototipu, firma/račun su STVARNI (prosleđeni odozgo, iz page.tsx).
// Broj "25/26-15" iz frejma/prototipa je NEISPRAVAN (15 nije mesec - format N/GG-M ima mesec 1-12,
// vidi src/lib/invoice-numbering.ts) - ispravka, 26.11.2026, zamenjen ispravnim primerom.
const PRIMER_BROJ = "25/26-11";
const PRIMER_KLIJENT = { name: "Acme Inc.", address: "100 Market St, Wilmington, DE 19801", country: "United States" };
const PRIMER_STAVKE = [
  { desc: "Webflow development", qty: 1, price: 90000 },
  { desc: "Additional design revisions", qty: 1, price: 30000 },
];
const PRIMER_NAPOMENA = "Hvala na saradnji";

function IkonaRucka() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <circle cx="9" cy="6" r="1.6" />
      <circle cx="15" cy="6" r="1.6" />
      <circle cx="9" cy="12" r="1.6" />
      <circle cx="15" cy="12" r="1.6" />
      <circle cx="9" cy="18" r="1.6" />
      <circle cx="15" cy="18" r="1.6" />
    </svg>
  );
}

const PRIRODNA_SIRINA = 480;
const PRIRODNA_VISINA = 680;

// Isti mehanizam skaliranja kao InvoiceDocPreview (ResizeObserver + transform:scale, da papir raste sa
// prozorom na 1920/2560px kao i na ostalim usavršenim ekranima), sa dodatim množiocem za zum dugmad
// (−/100%/+) iz frejma - na 100% papir ispunjava raspoloživu širinu platna, zum ide dalje od toga.
function SkaliraniCanvas({ zoom, children }: { zoom: number; children: ReactNode }) {
  const omotRef = useRef<HTMLDivElement>(null);
  const [sirinaOmota, setSirinaOmota] = useState(0);

  useEffect(() => {
    const omot = omotRef.current;
    if (!omot) return;
    const posmatrac = new ResizeObserver((unosi) => {
      const sirina = unosi[0]?.contentRect.width;
      if (sirina) setSirinaOmota(sirina);
    });
    posmatrac.observe(omot);
    return () => posmatrac.disconnect();
  }, []);

  const osnovnaSirina = Math.min(sirinaOmota, 640);
  const skala = osnovnaSirina > 0 ? (osnovnaSirina / PRIRODNA_SIRINA) * (zoom / 100) : 0;

  return (
    <div ref={omotRef} style={{ width: "100%", flex: "1 1 auto", minHeight: 0, display: "flex", justifyContent: "center" }}>
      <div
        className={styles.platnoOmot}
        style={{ width: PRIRODNA_SIRINA * skala, height: PRIRODNA_VISINA * skala, flex: "none" }}
      >
        <div style={{ width: PRIRODNA_SIRINA, height: PRIRODNA_VISINA, transform: `scale(${skala})`, transformOrigin: "top left" }}>
          {children}
        </div>
      </div>
    </div>
  );
}

function BrojnoPolje({
  labela,
  vrednost,
  onChange,
  greska,
}: {
  labela: string;
  vrednost: number;
  onChange: (vrednost: number) => void;
  greska?: string;
}) {
  return (
    <div className={styles.polje}>
      <span className={styles.labela}>{labela}</span>
      <div className={styles.poljeKutija}>
        <input
          type="number"
          className={styles.poljeUnos}
          value={vrednost}
          onChange={(e) => {
            const broj = Number(e.target.value);
            if (Number.isFinite(broj)) onChange(broj);
          }}
        />
        <span className={styles.poljeJedinica}>px</span>
      </div>
      {greska && <span className={styles.labela}>{greska}</span>}
    </div>
  );
}

export function TemplateEditorClient({
  sablon: pocetniSablon,
  firma,
  racun,
  tema,
}: {
  sablon: PodaciSablona;
  firma: { ownerName: string; name: string; mb: string; pib: string; street: string | null; city: string | null };
  racun: { id: string; currency: string; type: string; bank: string; iban: string | null; swift: string | null; number: string | null } | null;
  tema: Tema;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const povratak = searchParams.get("povratak") || "/fakture";

  const [sablon, setSablon] = useState(pocetniSablon);
  const [izmenjeno, setIzmenjeno] = useState(false);
  const [izabran, setIzabran] = useState<BlokKljuc>("firma");
  const [nivo, setNivo] = useState<"blok" | "tabela" | "cela">("blok");
  const [dodajOtvoren, setDodajOtvoren] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [cuvanje, setCuvanje] = useState<"mirno" | "cuvam">("mirno");
  const [greska, setGreska] = useState<string | null>(null);

  function izmeniSablon(novi: PodaciSablona) {
    setSablon(novi);
    setIzmenjeno(true);
  }

  function naPrebaciBlok(blok: BlokKljuc) {
    izmeniSablon(prebaciUkljucenostBloka(sablon, blok));
  }

  function naIzmenuSvojstva(izmena: Partial<SvojstvaBloka>) {
    if (Object.keys(validirajSvojstvaBloka(izmena)).length > 0) return;
    izmeniSablon(azurirajSvojstvaBloka(sablon, izabran, izmena));
  }

  async function naSacuvaj() {
    setCuvanje("cuvam");
    const rezultat = await sacuvajSablonAction({
      blocks: sablon.blocks,
      blocksOff: sablon.blocksOff,
      blockProps: sablon.blockProps,
      table: sablon.table,
      doc: sablon.doc,
      accentColor: sablon.accentColor,
    });
    setCuvanje("mirno");
    if (!rezultat.ok) {
      setGreska(rezultat.greska);
      return;
    }
    setGreska(null);
    setSablon(rezultat.sablon);
    setIzmenjeno(false);
  }

  async function naVratiPodrazumevano() {
    const podaci = await vratiSablonNaPodrazumevanoAction();
    setSablon(podaci);
    setIzmenjeno(false);
    setGreska(null);
  }

  const bp = sablon.blockProps[izabran];
  const bpGreske = validirajSvojstvaBloka(bp);

  return (
    <div className="appShell" data-theme={tema === "sistem" ? undefined : tema}>
      <TemaProvider initialTema={tema}>
        <div className={styles.shell}>
          <div className={styles.topbar}>
            <div className={styles.topbarLevo}>
              <button type="button" className={styles.zatvoriPilula} onClick={() => router.push(povratak)}>
                <IkonaX size={18} /> Zatvori
              </button>
              <span className={styles.sablonPilula}>Šablon: {sablon.name}</span>
              {izmenjeno && <span className={styles.znacka}>Izmene nisu sačuvane</span>}
            </div>
            <div className={styles.topbarDesno}>
              {/* "Raspored" otvara dijalog sa 4 predloška rasporeda - dolazi u Koraku 8d-6, ovde je samo
                  vidljivo i onemogućeno (zadatak Korak 8d-4 tačka 2). */}
              <button type="button" className={styles.dugmeMalo} disabled>
                Raspored
              </button>
              <button type="button" className={styles.dugmeMalo} onClick={naVratiPodrazumevano}>
                Vrati na podrazumevano
              </button>
              <button
                type="button"
                className={`${styles.dugmeMalo} ${styles.dugmePrimarno}`}
                onClick={naSacuvaj}
                disabled={cuvanje === "cuvam"}
              >
                {cuvanje === "cuvam" ? "Čuvam..." : "Sačuvaj šablon"}
              </button>
            </div>
          </div>

          {greska && <div className={styles.greskaTraka}>{greska}</div>}

          <div className={styles.telo}>
            <div className={styles.blokoviKolona}>
              <div className={styles.blokoviNaslov}>
                <span>Blokovi</span>
                <span className={styles.hint}>Prevuci da promeniš redosled, uključi ili isključi.</span>
              </div>
              <div className={styles.blokoviLista}>
                {sablon.blocks.map((blok) => {
                  const ukljucen = !sablon.blocksOff.includes(blok);
                  return (
                    <div
                      key={blok}
                      className={`${styles.blokRed} ${!ukljucen ? styles.blokRedIskljucen : ""} ${nivo !== "cela" && izabran === blok ? styles.blokRedIzabran : ""}`}
                      onClick={() => {
                        setIzabran(blok);
                        setNivo("blok");
                      }}
                    >
                      <span className={styles.rucka}>
                        <IkonaRucka />
                      </span>
                      <span className={styles.blokIme}>{NAZIVI_BLOKOVA[blok]}</span>
                      <Toggle on={ukljucen} onChange={() => naPrebaciBlok(blok)} label={`Uključi ${NAZIVI_BLOKOVA[blok]}`} />
                    </div>
                  );
                })}
              </div>
              <div style={{ position: "relative" }}>
                <button
                  type="button"
                  className={styles.dugmeMalo}
                  style={{ width: "100%" }}
                  disabled={sablon.blocksOff.length === 0}
                  onClick={() => setDodajOtvoren((v) => !v)}
                >
                  + Dodaj blok
                </button>
                {dodajOtvoren && sablon.blocksOff.length > 0 && (
                  <div className={styles.dodajPadajuci}>
                    {sablon.blocksOff.map((blok) => (
                      <button
                        key={blok}
                        type="button"
                        onClick={() => {
                          naPrebaciBlok(blok);
                          setIzabran(blok);
                          setNivo("blok");
                          setDodajOtvoren(false);
                        }}
                      >
                        {NAZIVI_BLOKOVA[blok]}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className={styles.canvasKolona}>
              <div className={styles.zumRed}>
                <button type="button" className={styles.zumDugme} onClick={() => setZoom((z) => Math.max(50, z - 10))}>
                  −
                </button>
                <span className={styles.zumVrednost}>{zoom}%</span>
                <button type="button" className={styles.zumDugme} onClick={() => setZoom((z) => Math.min(150, z + 10))}>
                  +
                </button>
                <span className={styles.razdvajac} />
                <span className={styles.oznakaInertna}>Mreža</span>
                <span className={styles.oznakaInertna}>Vodilice</span>
                <span className={styles.oznakaInertna}>Primer podataka</span>
              </div>
              <SkaliraniCanvas zoom={zoom}>
                <InvoiceDoc
                  broj={PRIMER_BROJ}
                  valuta="EUR"
                  jezik="en"
                  datumIzdavanja={new Date()}
                  dueDays={3}
                  stavke={PRIMER_STAVKE}
                  klijent={PRIMER_KLIJENT}
                  firma={firma}
                  racun={racun}
                  sablon={sablon}
                  napomena={PRIMER_NAPOMENA}
                  izmeni={{
                    izabran: nivo === "cela" ? null : izabran,
                    onOdaberi: (blok) => {
                      setIzabran(blok);
                      setNivo("blok");
                    },
                  }}
                />
              </SkaliraniCanvas>
            </div>

            <div className={styles.panelKolona}>
              <div className={styles.nivoPrekidac}>
                <button
                  type="button"
                  className={nivo === "blok" ? styles.nivoAktivan : styles.nivoNeaktivan}
                  onClick={() => setNivo("blok")}
                >
                  Blok
                </button>
                <button
                  type="button"
                  className={nivo === "tabela" ? styles.nivoAktivan : styles.nivoNeaktivan}
                  onClick={() => {
                    setNivo("tabela");
                    setIzabran("stavke");
                  }}
                >
                  Tabela
                </button>
                <button
                  type="button"
                  className={nivo === "cela" ? styles.nivoAktivan : styles.nivoNeaktivan}
                  onClick={() => setNivo("cela")}
                >
                  Cela faktura
                </button>
              </div>

              <div className={styles.izabraniNaslov}>
                <span className={styles.izabraniIme}>
                  {nivo === "cela" ? "Cela faktura" : NAZIVI_BLOKOVA[izabran]}
                </span>
                <span className={styles.izabraniPodnaslov}>{nivo === "cela" ? "Važi za svaki blok" : "Izabrani blok"}</span>
              </div>

              {nivo === "blok" && (
                <>
                  <div className={styles.kontrola}>
                    <span className={styles.labela}>Poravnanje</span>
                    <div className={styles.segment}>
                      {(
                        [
                          ["left", "Levo"],
                          ["center", "Sredina"],
                          ["right", "Desno"],
                        ] as const
                      ).map(([v, lb]) => (
                        <button
                          key={v}
                          type="button"
                          className={bp.align === v ? styles.segmentAktivan : ""}
                          onClick={() => naIzmenuSvojstva({ align: v })}
                        >
                          {lb}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className={styles.kontrola}>
                    <span className={styles.labela}>Veličina teksta</span>
                    <div className={styles.segment}>
                      {(
                        [
                          ["manji", "Manji"],
                          ["normal", "Srednji"],
                          ["veci", "Veći"],
                        ] as const
                      ).map(([v, lb]) => (
                        <button
                          key={v}
                          type="button"
                          className={bp.size === v ? styles.segmentAktivan : ""}
                          onClick={() => naIzmenuSvojstva({ size: v })}
                        >
                          {lb}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className={styles.kontrola}>
                    <span className={styles.labela}>Boja teksta</span>
                    <div className={styles.svatchRed}>
                      {BOJE_TEKSTA.map((c) => (
                        <button
                          key={c}
                          type="button"
                          className={`${styles.svatch} ${bp.color.toLowerCase() === c.toLowerCase() ? styles.svatchAktivan : ""}`}
                          style={{ background: c }}
                          aria-label={c}
                          onClick={() => naIzmenuSvojstva({ color: c })}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Font - samo prikaz, jedna opcija (Arial), kao u prototipu. */}
                  <div className={styles.kontrola}>
                    <span className={styles.labela}>Font</span>
                    <div className={styles.fontPrikaz}>
                      <span>{bp.font}</span>
                      <IkonaChevronDole size={16} />
                    </div>
                  </div>

                  <div className={styles.dvaPolja}>
                    <BrojnoPolje labela="Pozicija X" vrednost={bp.x} onChange={(v) => naIzmenuSvojstva({ x: v })} greska={bpGreske.x} />
                    <BrojnoPolje labela="Pozicija Y" vrednost={bp.y} onChange={(v) => naIzmenuSvojstva({ y: v })} greska={bpGreske.y} />
                  </div>
                  <div className={styles.dvaPolja}>
                    <BrojnoPolje labela="Širina" vrednost={bp.w} onChange={(v) => naIzmenuSvojstva({ w: v })} greska={bpGreske.w} />
                    <BrojnoPolje labela="Visina" vrednost={bp.h} onChange={(v) => naIzmenuSvojstva({ h: v })} greska={bpGreske.h} />
                  </div>

                  <div className={styles.prekidacRed}>
                    <span>Pozadina bloka</span>
                    <Toggle on={bp.bg} onChange={(v) => naIzmenuSvojstva({ bg: v })} label="Pozadina bloka" />
                  </div>
                  <div className={styles.prekidacRed}>
                    <span>Okvir oko bloka</span>
                    <Toggle on={bp.border} onChange={(v) => naIzmenuSvojstva({ border: v })} label="Okvir oko bloka" />
                  </div>
                </>
              )}

              {nivo === "tabela" && (
                <>
                  <div className={styles.kontrola}>
                    <span className={styles.labela}>Kolone</span>
                    <div className={styles.kolonaLista}>
                      {SVE_KOLONE_TABELE.map((kolona) => (
                        <div key={kolona} className={styles.kolonaRed}>
                          <span>{NAZIVI_KOLONA_TABELE[kolona]}</span>
                          <Toggle
                            on={sablon.table.cols.includes(kolona)}
                            onChange={() => izmeniSablon(prebaciKolonuTabele(sablon, kolona))}
                            label={`Uključi kolonu ${NAZIVI_KOLONA_TABELE[kolona]}`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className={styles.kontrola}>
                    <span className={styles.labela}>Linije</span>
                    <div className={styles.segment}>
                      {(
                        [
                          ["okvir", "Okvir"],
                          ["horizontalne", "Horizontalne"],
                          ["bez", "Bez"],
                        ] as const
                      ).map(([v, lb]) => (
                        <button
                          key={v}
                          type="button"
                          className={sablon.table.lines === v ? styles.segmentAktivan : ""}
                          onClick={() => izmeniSablon(azurirajTabelu(sablon, { lines: v }))}
                        >
                          {lb}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className={styles.kontrola}>
                    <span className={styles.labela}>Razmak redova</span>
                    <div className={styles.segment}>
                      {(
                        [
                          ["gusto", "Gusto"],
                          ["normalno", "Normalno"],
                          ["prostrano", "Prostrano"],
                        ] as const
                      ).map(([v, lb]) => (
                        <button
                          key={v}
                          type="button"
                          className={sablon.table.density === v ? styles.segmentAktivan : ""}
                          onClick={() => izmeniSablon(azurirajTabelu(sablon, { density: v }))}
                        >
                          {lb}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className={styles.prekidacRed}>
                    <span>Naizmenična boja redova</span>
                    <Toggle
                      on={sablon.table.zebra}
                      onChange={(v) => izmeniSablon(azurirajTabelu(sablon, { zebra: v }))}
                      label="Naizmenična boja redova"
                    />
                  </div>

                  <div className={styles.kontrola}>
                    <span className={styles.labela}>Boja zaglavlja tabele</span>
                    <div className={styles.svatchRed}>
                      {BOJE_ZAGLAVLJA_TABELE.map((c) => (
                        <button
                          key={c}
                          type="button"
                          className={`${styles.svatch} ${sablon.table.headerColor.toLowerCase() === c.toLowerCase() ? styles.svatchAktivan : ""}`}
                          style={{ background: c }}
                          aria-label={c}
                          onClick={() => izmeniSablon(azurirajTabelu(sablon, { headerColor: c }))}
                        />
                      ))}
                    </div>
                  </div>
                </>
              )}

              {nivo === "cela" && (
                <>
                  <div className={styles.kontrola}>
                    <span className={styles.labela}>Boja akcenta</span>
                    <div className={styles.svatchRed}>
                      {BOJE_TEKSTA.map((c) => (
                        <button
                          key={c}
                          type="button"
                          className={`${styles.svatch} ${sablon.accentColor.toLowerCase() === c.toLowerCase() ? styles.svatchAktivan : ""}`}
                          style={{ background: c }}
                          aria-label={c}
                          onClick={() => izmeniSablon(azurirajAkcentBoju(sablon, c))}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Font naslova/teksta - samo prikaz, jedna opcija, kao u prototipu (zadatak tačka 2). */}
                  <div className={styles.kontrola}>
                    <span className={styles.labela}>Font naslova</span>
                    <div className={styles.fontPrikaz}>
                      <span>{sablon.doc.titleFont}</span>
                      <IkonaChevronDole size={16} />
                    </div>
                  </div>
                  <div className={styles.kontrola}>
                    <span className={styles.labela}>Font teksta</span>
                    <div className={styles.fontPrikaz}>
                      <span>{sablon.doc.textFont}</span>
                      <IkonaChevronDole size={16} />
                    </div>
                  </div>

                  <div className={styles.kontrola}>
                    <span className={styles.labela}>Margine</span>
                    <div className={styles.segment}>
                      {(
                        [
                          ["uske", "Uske"],
                          ["srednje", "Srednje"],
                          ["siroke", "Široke"],
                        ] as const
                      ).map(([v, lb]) => (
                        <button
                          key={v}
                          type="button"
                          className={sablon.doc.margins === v ? styles.segmentAktivan : ""}
                          onClick={() => izmeniSablon(azurirajDokument(sablon, { margins: v }))}
                        >
                          {lb}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className={styles.prekidacRed}>
                    <span>Traka u boji na vrhu</span>
                    <Toggle
                      on={sablon.doc.topBar}
                      onChange={(v) => izmeniSablon(azurirajDokument(sablon, { topBar: v }))}
                      label="Traka u boji na vrhu"
                    />
                  </div>

                  {/* Vodeni žig - samo prikaz, 'Bez' (zadatak tačka 2). */}
                  <div className={styles.kontrola}>
                    <span className={styles.labela}>Vodeni žig</span>
                    <div className={styles.fontPrikaz}>
                      <span>Bez</span>
                      <IkonaChevronDole size={16} />
                    </div>
                  </div>

                  <div className={styles.kontrola}>
                    <span className={styles.labela}>Tekst u podnožju</span>
                    <div className={styles.poljeKutija}>
                      <input
                        type="text"
                        className={styles.poljeUnos}
                        value={sablon.doc.footerText}
                        onChange={(e) => izmeniSablon(azurirajDokument(sablon, { footerText: e.target.value }))}
                        placeholder="Npr. Hvala na saradnji"
                      />
                    </div>
                  </div>

                  <div className={styles.kontrola}>
                    <span className={styles.labela}>Veličina loga</span>
                    <div className={styles.segment}>
                      {(
                        [
                          ["mali", "Mali"],
                          ["srednji", "Srednji"],
                          ["veliki", "Veliki"],
                        ] as const
                      ).map(([v, lb]) => (
                        <button
                          key={v}
                          type="button"
                          className={sablon.doc.logoSize === v ? styles.segmentAktivan : ""}
                          onClick={() => izmeniSablon(azurirajDokument(sablon, { logoSize: v }))}
                        >
                          {lb}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className={styles.kontrola}>
                    <span className={styles.labela}>Oblik loga</span>
                    <div className={styles.segment}>
                      {(
                        [
                          ["kvadrat", "Kvadrat"],
                          ["krug", "Krug"],
                        ] as const
                      ).map(([v, lb]) => (
                        <button
                          key={v}
                          type="button"
                          className={sablon.doc.logoShape === v ? styles.segmentAktivan : ""}
                          onClick={() => izmeniSablon(azurirajDokument(sablon, { logoShape: v }))}
                        >
                          {lb}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        <FixedThemeTogglePill />
      </TemaProvider>
    </div>
  );
}
