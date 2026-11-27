// Editor šablona fakture (Korak 8d-4, frejm Fak18, desktop, samo nivo "Blok"). Platno crta ISTOM
// komponentom InvoiceDoc kao pregled fakture i PDF (prop "sablon", isti kod, Korak 8d-2) - ovde samo
// dodaje opcioni prop "izmeni" (klik na blok na platnu ga bira, isto kao klik u levoj listi).
"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { TemaProvider } from "@/components/app-shell/TemaContext";
import { FixedThemeTogglePill } from "@/components/app-shell/FixedThemeTogglePill";
import type { Tema } from "@/lib/theme";
import { IkonaX, IkonaChevronDole, IkonaKvacica } from "@/components/ui/icons";
import { Toggle } from "@/components/ui/Toggle";
import { Modal } from "@/components/ui/Modal";
import { InvoiceDoc } from "@/components/invoice/InvoiceDoc";
import {
  NAZIVI_BLOKOVA,
  NAZIVI_KOLONA_TABELE,
  SVE_KOLONE_TABELE,
  NAZIVI_RASPOREDA,
  SVI_RASPOREDI,
  prebaciUkljucenostBloka,
  azurirajSvojstvaBloka,
  validirajSvojstvaBloka,
  prebaciKolonuTabele,
  azurirajTabelu,
  azurirajDokument,
  azurirajAkcentBoju,
  primeniRaspored,
  type PodaciSablona,
  type BlokKljuc,
  type SvojstvaBloka,
  type Raspored,
} from "@/lib/invoice-templates";
import {
  sacuvajSablonAction,
  vratiSablonNaPodrazumevanoAction,
  listaSablonaAction,
  ucitajSablonAction,
  kreirajSablonAction,
  duplirajSablonAction,
  preimenujSablonAction,
  postaviKaoPodrazumevaniAction,
  obrisiSablonAction,
  type StavkaListeSablona,
} from "@/app/(app)/fakture/actions";
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

// Male sličice rasporeda u dijalogu "Raspored" (Korak 8d-6, frejm Fak24) - čisto ilustrativne (nisu
// stvarni prikaz fakture), prepisane piksel po piksel iz okvira (Fak24/Dk_Fak24, kartica 170x226).
// "Ink"/akcent boje (#161A17/#0F2A22/#C8F169) su ISTE u obe teme (predstavljaju boju na papiru, ne boju
// aplikacije) - samo "prigušena" boja traka koristi var(--color-toggle-off-bg) (D9D6D0/343A36, tačan
// token već u app-u za istu namenu).
function Pravougaonik({
  left,
  top,
  width,
  height,
  boja,
  radius = 2,
}: {
  left: number;
  top: number;
  width: number;
  height: number;
  boja: string;
  radius?: number;
}) {
  return <div style={{ position: "absolute", left, top, width, height, background: boja, borderRadius: radius }} />;
}

const PRIGUSENO = "var(--color-toggle-off-bg)";
const INK = "#161A17";
const AKCENT = "#0F2A22";
const LIMETA = "#C8F169";

function RasporedPregled({ raspored }: { raspored: Raspored }) {
  if (raspored === "klasican") {
    return (
      <>
        <Pravougaonik left={12} top={12} width={22} height={22} boja={AKCENT} radius={4} />
        <Pravougaonik left={112} top={16} width={44} height={6} boja={PRIGUSENO} />
        <Pravougaonik left={12} top={50} width={60} height={6} boja={PRIGUSENO} />
        <Pravougaonik left={12} top={60} width={60} height={24} boja={PRIGUSENO} />
        <Pravougaonik left={96} top={50} width={62} height={6} boja={PRIGUSENO} />
        <Pravougaonik left={96} top={60} width={62} height={36} boja={PRIGUSENO} />
        <div
          style={{
            position: "absolute",
            left: 12,
            top: 112,
            width: 146,
            height: 60,
            border: `1px solid ${INK}`,
            background: "var(--color-surface)",
          }}
        />
        <Pravougaonik left={12} top={184} width={60} height={6} boja={PRIGUSENO} />
      </>
    );
  }

  if (raspored === "moderan") {
    return (
      <>
        <Pravougaonik left={0} top={0} width={52} height={226} boja={AKCENT} radius={0} />
        <Pravougaonik left={10} top={12} width={22} height={22} boja={LIMETA} radius={4} />
        <Pravougaonik left={8} top={52} width={36} height={5} boja="rgba(255,255,255,0.5)" />
        <Pravougaonik left={8} top={62} width={36} height={5} boja="rgba(255,255,255,0.5)" />
        <Pravougaonik left={8} top={160} width={36} height={5} boja="rgba(255,255,255,0.5)" />
        <Pravougaonik left={68} top={16} width={70} height={8} boja={PRIGUSENO} />
        <Pravougaonik left={68} top={40} width={60} height={6} boja={PRIGUSENO} />
        <Pravougaonik left={68} top={50} width={60} height={24} boja={PRIGUSENO} />
        <div
          style={{
            position: "absolute",
            left: 68,
            top: 96,
            width: 90,
            height: 70,
            borderTop: `2px solid ${AKCENT}`,
            background: "var(--color-nav-bg-active)",
          }}
        />
      </>
    );
  }

  if (raspored === "minimalan") {
    return (
      <>
        <Pravougaonik left={14} top={18} width={70} height={12} boja={INK} />
        <Pravougaonik left={14} top={44} width={40} height={5} boja={PRIGUSENO} />
        <Pravougaonik left={14} top={54} width={40} height={5} boja={PRIGUSENO} />
        <Pravougaonik left={110} top={44} width={46} height={5} boja={PRIGUSENO} />
        <Pravougaonik left={110} top={54} width={46} height={5} boja={PRIGUSENO} />
        <Pravougaonik left={14} top={92} width={142} height={1} boja={INK} radius={0} />
        <Pravougaonik left={14} top={106} width={142} height={1} boja={PRIGUSENO} radius={0} />
        <Pravougaonik left={14} top={126} width={142} height={1} boja={PRIGUSENO} radius={0} />
        <Pravougaonik left={14} top={146} width={142} height={1} boja={PRIGUSENO} radius={0} />
        <Pravougaonik left={96} top={170} width={60} height={8} boja={INK} />
      </>
    );
  }

  return (
    <>
      <Pravougaonik left={0} top={0} width={170} height={44} boja={AKCENT} radius={0} />
      <Pravougaonik left={10} top={10} width={22} height={22} boja={LIMETA} radius={4} />
      <Pravougaonik left={112} top={16} width={48} height={8} boja="rgba(255,255,255,0.6)" />
      <Pravougaonik left={12} top={58} width={70} height={6} boja={PRIGUSENO} />
      <Pravougaonik left={12} top={68} width={70} height={18} boja={PRIGUSENO} />
      <Pravougaonik left={96} top={58} width={62} height={6} boja={PRIGUSENO} />
      <Pravougaonik left={96} top={68} width={62} height={18} boja={PRIGUSENO} />
      <div
        style={{
          position: "absolute",
          left: 12,
          top: 100,
          width: 146,
          height: 80,
          border: `1px solid ${INK}`,
          background: "var(--color-surface)",
        }}
      />
      <Pravougaonik left={96} top={194} width={60} height={8} boja={AKCENT} />
    </>
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
  sablonId: pocetniId,
  sablon: pocetniSablon,
  pocetnaLista,
  firma,
  racun,
  tema,
}: {
  sablonId: string;
  sablon: PodaciSablona;
  pocetnaLista: StavkaListeSablona[];
  firma: { ownerName: string; name: string; mb: string; pib: string; street: string | null; city: string | null };
  racun: { id: string; currency: string; type: string; bank: string; iban: string | null; swift: string | null; number: string | null } | null;
  tema: Tema;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const povratak = searchParams.get("povratak") || "/fakture";

  const [sablonId, setSablonId] = useState(pocetniId);
  const [sablon, setSablon] = useState(pocetniSablon);
  const [lista, setLista] = useState(pocetnaLista);
  const [sablonOtvoren, setSablonOtvoren] = useState(false);
  const [novoImeOtvoren, setNovoImeOtvoren] = useState(false);
  const [novoImeUnos, setNovoImeUnos] = useState("Novi šablon");
  const [preimenujOtvoren, setPreimenujOtvoren] = useState(false);
  const [preimenujUnos, setPreimenujUnos] = useState("");
  const [potvrdaNapustanja, setPotvrdaNapustanja] = useState<{ akcija: () => void } | null>(null);
  const [brisanjeOtvoreno, setBrisanjeOtvoreno] = useState(false);
  const [izmenjeno, setIzmenjeno] = useState(false);
  const [izabran, setIzabran] = useState<BlokKljuc>("firma");
  const [nivo, setNivo] = useState<"blok" | "tabela" | "cela">("blok");
  const [dodajOtvoren, setDodajOtvoren] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [cuvanje, setCuvanje] = useState<"mirno" | "cuvam">("mirno");
  const [greska, setGreska] = useState<string | null>(null);
  const [rasporedOtvoren, setRasporedOtvoren] = useState(false);
  const [rasporedIzbor, setRasporedIzbor] = useState<Raspored>(sablon.layout);

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
    const rezultat = await sacuvajSablonAction(sablonId, {
      blocks: sablon.blocks,
      blocksOff: sablon.blocksOff,
      blockProps: sablon.blockProps,
      table: sablon.table,
      doc: sablon.doc,
      accentColor: sablon.accentColor,
      layout: sablon.layout,
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
    const podaci = await vratiSablonNaPodrazumevanoAction(sablonId);
    setSablon(podaci);
    setIzmenjeno(false);
    setGreska(null);
  }

  // Zamenjuje otvoreni šablon novim (izabran u meniju, "+ Novi šablon" ili "Dupliraj ovaj šablon") -
  // upisuje i ?sablonId= u URL (router.replace, bez nove stavke u istoriji) da osvežavanje stranice
  // ostane na istom šablonu. "izabran" u platnu (koji blok je selektovan) se vraća na "firma"/nivo "blok",
  // isto kao posle "Vrati na podrazumevano" - stari izbor bloka ne mora da postoji u novom šablonu.
  function ucitajUEditor(id: string, novi: PodaciSablona) {
    setSablonId(id);
    setSablon(novi);
    setIzmenjeno(false);
    setGreska(null);
    setIzabran("firma");
    setNivo("blok");
    const noviParam = new URLSearchParams(searchParams.toString());
    noviParam.set("sablonId", id);
    router.replace(`/fakture/sablon?${noviParam.toString()}`, { scroll: false });
  }

  // Zadatak tačka 1: prebacivanje na drugi šablon ne sme tiho da izgubi nesačuvane izmene. Frejm (Fak27)
  // ne pokazuje poseban dijalog za ovo - window.confirm/window.prompt NISU pouzdani u svim okruženjima
  // (npr. u pregledu unutar ovog alata window.prompt baca grešku umesto da vrati vrednost), zato je
  // upozorenje mali SOPSTVENI dijalog (Modal), ne prozor pretraživača (izveštaj). "akcija" se izvršava tek
  // posle potvrde (ili odmah, ako nema nesačuvanih izmena).
  function saPotvrdomAkoImaIzmena(akcija: () => void) {
    if (!izmenjeno) {
      akcija();
      return;
    }
    setPotvrdaNapustanja({ akcija });
  }

  function naIzborSablona(id: string) {
    setSablonOtvoren(false);
    if (id === sablonId) return;
    saPotvrdomAkoImaIzmena(async () => {
      const rezultat = await ucitajSablonAction(id);
      if (!rezultat.ok) {
        setGreska(rezultat.greska);
        return;
      }
      ucitajUEditor(rezultat.id, rezultat.sablon);
    });
  }

  // "+ Novi šablon" (Fak27) - frejm ne pokazuje KAKO se unosi ime (nema prikazanog dijaloga za to), zato
  // je dodat mali sopstveni dijalog sa poljem za unos, u istom stilu kao ostatak editora (izveštaj).
  function naNoviSablon() {
    setSablonOtvoren(false);
    saPotvrdomAkoImaIzmena(() => {
      setNovoImeUnos("Novi šablon");
      setNovoImeOtvoren(true);
    });
  }

  async function naPotvrdiNoviSablon() {
    const ime = novoImeUnos.trim();
    if (!ime) return;
    const rezultat = await kreirajSablonAction(ime);
    if (!rezultat.ok) {
      setGreska(rezultat.greska);
      return;
    }
    setNovoImeOtvoren(false);
    setLista(await listaSablonaAction());
    ucitajUEditor(rezultat.id, rezultat.sablon);
  }

  function naDupliraj() {
    setSablonOtvoren(false);
    saPotvrdomAkoImaIzmena(async () => {
      const rezultat = await duplirajSablonAction(sablonId);
      if (!rezultat.ok) {
        setGreska(rezultat.greska);
        return;
      }
      setLista(await listaSablonaAction());
      ucitajUEditor(rezultat.id, rezultat.sablon);
    });
  }

  // Preimenovanje i "Postavi kao podrazumevani" (zadatak tačka 3) - frejm (Fak27) ne pokazuje gde se ove
  // dve radnje pokreću (nema olovke/ikonice za preimenovanje ni posebne opcije u redu šablona), zato su
  // dodate kao još dve stavke u ISTOM padajućem meniju, posle "Dupliraj ovaj šablon" (izveštaj). Rade na
  // šablonu koji je TRENUTNO otvoren (isto kao "Sačuvaj šablon"/"Vrati na podrazumevano", zadatak tačka 5).
  // Ne traže potvrdu za nesačuvane izmene (menjaju samo ime/status podrazumevanog, ne i izgled), i spajaju
  // samo TA dva polja u trenutni sablon (ne ceo rezultat.sablon) - da ne bi tiho prepisale neku nesačuvanu
  // IZMENU IZGLEDA koju korisnik u međuvremenu pravi na platnu sa zastarelom verzijom sa servera.
  function naPreimenuj() {
    setSablonOtvoren(false);
    setPreimenujUnos(sablon.name);
    setPreimenujOtvoren(true);
  }

  async function naPotvrdiPreimenovanje() {
    const ime = preimenujUnos.trim();
    if (!ime || ime === sablon.name) {
      setPreimenujOtvoren(false);
      return;
    }
    const rezultat = await preimenujSablonAction(sablonId, ime);
    if (!rezultat.ok) {
      setGreska(rezultat.greska);
      return;
    }
    setSablon((trenutni) => ({ ...trenutni, name: rezultat.sablon.name }));
    setLista((stara) => stara.map((s) => (s.id === rezultat.id ? { ...s, name: rezultat.sablon.name } : s)));
    setPreimenujOtvoren(false);
  }

  async function naPostaviPodrazumevani() {
    setSablonOtvoren(false);
    const rezultat = await postaviKaoPodrazumevaniAction(sablonId);
    if (!rezultat.ok) {
      setGreska(rezultat.greska);
      return;
    }
    setSablon((trenutni) => ({ ...trenutni, isDefault: rezultat.sablon.isDefault }));
    setLista((stara) =>
      stara
        .map((s) => ({ ...s, isDefault: s.id === rezultat.id }))
        .sort((a, b) => (a.isDefault === b.isDefault ? 0 : a.isDefault ? -1 : 1)),
    );
  }

  // "Obriši ovaj šablon" (Korak 8d-7a dopuna) - frejm (Fak27) ne pokazuje ovu stavku, zato je na dnu
  // menija, odvojena linijom (izveštaj). Dugme je onemogućeno za podrazumevani šablon (zadatak tačka 2);
  // server (obrisiSablonAction) proverava isto, nezavisno od dugmeta. Potvrda ide kroz sopstveni dijalog
  // (ne window.confirm, isti razlog kao i kod ostalih dijaloga u ovom fajlu).
  function naObrisi() {
    setSablonOtvoren(false);
    if (sablon.isDefault) return;
    setBrisanjeOtvoreno(true);
  }

  async function naPotvrdiBrisanje() {
    const rezultat = await obrisiSablonAction(sablonId);
    if (!rezultat.ok) {
      setGreska(rezultat.greska);
      setBrisanjeOtvoreno(false);
      return;
    }
    setBrisanjeOtvoreno(false);
    setLista(await listaSablonaAction());
    ucitajUEditor(rezultat.id, rezultat.sablon);
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
              <div style={{ position: "relative" }}>
                <button
                  type="button"
                  className={`${styles.sablonPilula} ${sablonOtvoren ? styles.sablonPilulaOtvorena : ""}`}
                  onClick={() => setSablonOtvoren((v) => !v)}
                >
                  Šablon: {sablon.name}
                  <IkonaChevronDole size={16} />
                </button>
                {sablonOtvoren && (
                  <div className={styles.sablonPadajuci}>
                    {lista.map((s) => {
                      const sIzabran = s.id === sablonId;
                      return (
                        <button
                          key={s.id}
                          type="button"
                          className={`${styles.sablonStavka} ${sIzabran ? styles.sablonStavkaIzabrana : ""}`}
                          onClick={() => naIzborSablona(s.id)}
                        >
                          <span className={styles.sablonStavkaTekst}>
                            <span className={styles.sablonStavkaIme}>
                              {s.name}
                              {s.isDefault && <span className={styles.sablonBadge}>Podrazumevani</span>}
                            </span>
                          </span>
                          <span className={styles.sablonKvacica}>{sIzabran && <IkonaKvacica size={18} />}</span>
                        </button>
                      );
                    })}
                    <div className={styles.sablonRazdvajac} />
                    <button type="button" className={styles.sablonAkcija} onClick={naNoviSablon}>
                      + Novi šablon
                    </button>
                    <button type="button" className={styles.sablonAkcija} onClick={naDupliraj}>
                      Dupliraj ovaj šablon
                    </button>
                    <button type="button" className={styles.sablonAkcija} onClick={naPreimenuj}>
                      Preimenuj ovaj šablon
                    </button>
                    {!sablon.isDefault && (
                      <button type="button" className={styles.sablonAkcija} onClick={naPostaviPodrazumevani}>
                        Postavi kao podrazumevani
                      </button>
                    )}
                    <div className={styles.sablonRazdvajac} />
                    <button
                      type="button"
                      className={`${styles.sablonAkcija} ${styles.sablonAkcijaOpasna}`}
                      disabled={sablon.isDefault}
                      title={sablon.isDefault ? "Prvo postavi drugi šablon kao podrazumevani" : undefined}
                      onClick={naObrisi}
                    >
                      Obriši ovaj šablon
                    </button>
                  </div>
                )}
              </div>
              {izmenjeno && <span className={styles.znacka}>Izmene nisu sačuvane</span>}
            </div>
            <div className={styles.topbarDesno}>
              <button
                type="button"
                className={styles.dugmeMalo}
                onClick={() => {
                  setRasporedIzbor(sablon.layout);
                  setRasporedOtvoren(true);
                }}
              >
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
        {rasporedOtvoren && (
          <Modal naslov="Izaberi raspored" sirina={840} onClose={() => setRasporedOtvoren(false)}>
            <span className={styles.rasporedPodnaslov}>
              Ovo je polazna tačka. Posle možeš sve da menjaš. Tvoji podaci i boje ostaju.
            </span>
            <div className={styles.rasporedGrid}>
              {SVI_RASPOREDI.map((r) => {
                const aktivan = rasporedIzbor === r;
                return (
                  <button
                    key={r}
                    type="button"
                    className={styles.rasporedKartica}
                    onClick={() => setRasporedIzbor(r)}
                  >
                    <div className={`${styles.rasporedOkvirKartice} ${aktivan ? styles.rasporedOkvirIzabran : ""}`}>
                      <RasporedPregled raspored={r} />
                    </div>
                    <span className={aktivan ? styles.rasporedImeIzabrano : styles.rasporedIme}>
                      {NAZIVI_RASPOREDA[r]}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className={styles.rasporedNapomena}>
              Kad primeniš novi raspored, blokove koje si ručno pomerio vraćam na njihova mesta.
            </div>
            <div className={styles.rasporedDugmad}>
              <button type="button" className={styles.dugmeMalo} onClick={() => setRasporedOtvoren(false)}>
                Odustani
              </button>
              <button
                type="button"
                className={`${styles.dugmeMalo} ${styles.dugmePrimarno}`}
                onClick={() => {
                  izmeniSablon(primeniRaspored(sablon, rasporedIzbor));
                  setRasporedOtvoren(false);
                }}
              >
                Primeni raspored
              </button>
            </div>
          </Modal>
        )}
        {potvrdaNapustanja && (
          <Modal naslov="Nesačuvane izmene" onClose={() => setPotvrdaNapustanja(null)}>
            <span className={styles.rasporedPodnaslov}>
              Imaš nesačuvane izmene u šablonu &quot;{sablon.name}&quot;. Ako nastaviš, te izmene će biti izgubljene.
            </span>
            <div className={styles.unosDugmad}>
              <button type="button" className={styles.dugmeMalo} onClick={() => setPotvrdaNapustanja(null)}>
                Odustani
              </button>
              <button
                type="button"
                className={`${styles.dugmeMalo} ${styles.dugmePrimarno}`}
                onClick={() => {
                  const akcija = potvrdaNapustanja.akcija;
                  setPotvrdaNapustanja(null);
                  akcija();
                }}
              >
                Nastavi
              </button>
            </div>
          </Modal>
        )}
        {novoImeOtvoren && (
          <Modal naslov="Novi šablon" onClose={() => setNovoImeOtvoren(false)}>
            <div className={styles.poljeKutija}>
              <input
                type="text"
                className={styles.poljeUnos}
                value={novoImeUnos}
                onChange={(e) => setNovoImeUnos(e.target.value)}
                autoFocus
                placeholder="Naziv šablona"
              />
            </div>
            <div className={styles.unosDugmad}>
              <button type="button" className={styles.dugmeMalo} onClick={() => setNovoImeOtvoren(false)}>
                Odustani
              </button>
              <button
                type="button"
                className={`${styles.dugmeMalo} ${styles.dugmePrimarno}`}
                disabled={!novoImeUnos.trim()}
                onClick={naPotvrdiNoviSablon}
              >
                Napravi šablon
              </button>
            </div>
          </Modal>
        )}
        {preimenujOtvoren && (
          <Modal naslov="Preimenuj šablon" onClose={() => setPreimenujOtvoren(false)}>
            <div className={styles.poljeKutija}>
              <input
                type="text"
                className={styles.poljeUnos}
                value={preimenujUnos}
                onChange={(e) => setPreimenujUnos(e.target.value)}
                autoFocus
                placeholder="Naziv šablona"
              />
            </div>
            <div className={styles.unosDugmad}>
              <button type="button" className={styles.dugmeMalo} onClick={() => setPreimenujOtvoren(false)}>
                Odustani
              </button>
              <button
                type="button"
                className={`${styles.dugmeMalo} ${styles.dugmePrimarno}`}
                disabled={!preimenujUnos.trim()}
                onClick={naPotvrdiPreimenovanje}
              >
                Sačuvaj ime
              </button>
            </div>
          </Modal>
        )}
        {brisanjeOtvoreno && (
          <Modal naslov="Obriši šablon" onClose={() => setBrisanjeOtvoreno(false)}>
            <span className={styles.rasporedPodnaslov}>
              Šablon &quot;{sablon.name}&quot; će biti trajno obrisan. Ovo se ne može poništiti.
            </span>
            <div className={styles.unosDugmad}>
              <button type="button" className={styles.dugmeMalo} onClick={() => setBrisanjeOtvoreno(false)}>
                Odustani
              </button>
              <button
                type="button"
                className={`${styles.dugmeMalo} ${styles.dugmeOpasno}`}
                onClick={naPotvrdiBrisanje}
              >
                Obriši
              </button>
            </div>
          </Modal>
        )}
        <FixedThemeTogglePill />
      </TemaProvider>
    </div>
  );
}
