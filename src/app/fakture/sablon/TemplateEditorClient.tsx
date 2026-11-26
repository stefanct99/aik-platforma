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
  prebaciUkljucenostBloka,
  azurirajSvojstvaBloka,
  validirajSvojstvaBloka,
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

// "Primer podataka" (frejm Fak18, prototip TemplateEditor sampleInv/sampleClient) - isti izmišljeni
// klijent i stavke kao u prototipu, firma/račun su STVARNI (prosleđeni odozgo, iz page.tsx).
const PRIMER_BROJ = "25/26-15";
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
                      className={`${styles.blokRed} ${!ukljucen ? styles.blokRedIskljucen : ""} ${izabran === blok ? styles.blokRedIzabran : ""}`}
                      onClick={() => setIzabran(blok)}
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
                  izmeni={{ izabran, onOdaberi: setIzabran }}
                />
              </SkaliraniCanvas>
            </div>

            <div className={styles.panelKolona}>
              <div className={styles.nivoPrekidac}>
                <span className={styles.nivoAktivan}>Blok</span>
                <span className={styles.nivoOnemogucen} title="Dolazi u narednom koraku (8d-4b)">
                  Tabela
                </span>
                <span className={styles.nivoOnemogucen} title="Dolazi u narednom koraku (8d-4b)">
                  Cela faktura
                </span>
              </div>

              <div className={styles.izabraniNaslov}>
                <span className={styles.izabraniIme}>{NAZIVI_BLOKOVA[izabran]}</span>
                <span className={styles.izabraniPodnaslov}>Izabrani blok</span>
              </div>

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
            </div>
          </div>
        </div>
        <FixedThemeTogglePill />
      </TemaProvider>
    </div>
  );
}
