// Ekran slanja i potvrda (Korak 8b, spec 7.4/6.7/8.1, frejmovi Fak11/Fak12, PhFak11/PhFak12). Polja Za/
// Naslov/Poruka su za PREGLED pre slanja (frejm: "Slobodno je izmeni") - stvarna razvojna poruka koju
// sendInvoice ispisuje u terminal uvek koristi prave, server-izračunate podatke (pravi mejl klijenta,
// pravi broj/iznos), ne ono što je ovde otkucano - mejl servis još ne postoji (zadatak tačka 6), pa nema
// pravog slanja koje bi ove izmene stvarno nosilo.
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Polje } from "@/components/ui/Polje";
import { IkonaStrelicaLevo, IkonaUpozorenje } from "@/components/auth-shell/auth-icons";
import { IkonaSpajalica, IkonaKvacicaKrug } from "@/components/ui/icons";
import { FixedThemeTogglePill } from "@/components/app-shell/FixedThemeTogglePill";
import { InvoiceDoc } from "./InvoiceDoc";
import { InvoiceDocPreview } from "./InvoiceDocPreview";
import { posaljiFakturuAction, posaljiPonovoAction } from "@/app/(app)/fakture/actions";
import { formatNovacPuno } from "@/lib/money";
import { formatDatumSrpski } from "@/lib/datum";
import type { KlijentZaFakturu, RacunZaFakturu, StavkaForme } from "./InvoiceEditor";
import styles from "./InvoiceSendStage.module.css";

export type PotvrdaSlanja = {
  broj: string;
  klijentIme: string;
  billingEmail: string;
  ukupno: number;
  valuta: string;
  rokIso: string;
};

export function InvoiceSendStage({
  id,
  broj,
  klijent,
  valuta,
  jezik,
  rokDana,
  firma,
  account,
  stavke,
  datumIzdavanja,
  posalji,
  onPosalji,
  onNazad,
  onZatvoriPoslato,
  rezim = "prvo",
}: {
  id: string;
  broj: string;
  klijent: KlijentZaFakturu | null;
  valuta: string;
  jezik: "sr" | "en";
  ukupno: number;
  rokDana: number;
  firma: { ownerName: string; name: string; mb: string; pib: string; street: string | null; city: string | null };
  account: RacunZaFakturu | null;
  stavke: StavkaForme[];
  datumIzdavanja: Date;
  posalji: PotvrdaSlanja | null;
  onPosalji: (p: PotvrdaSlanja) => void;
  onNazad: () => void;
  onZatvoriPoslato: () => void;
  // "Pošalji ponovo" (Korak 8d ispravka) - VEĆ poslata/plaćena faktura ponovo prolazi kroz ISTI ekran,
  // ali bez čuvanja nacrta (broj/status/rok/stavke se ne diraju) i sa drugim tekstom na par mesta koja
  // bi inače lagala (nema "izmena" pre ovoga, uplata se možda već prati ili je već stigla).
  rezim?: "prvo" | "ponovo";
}) {
  const router = useRouter();
  const imeFirme = `${(firma.ownerName || "").trim()} ${firma.name}`.trim();
  const [naslov, setNaslov] = useState(`Invoice ${broj} from ${imeFirme}`);
  const [poruka, setPoruka] = useState(
    jezik === "sr" ? `Poštovani,\n\nU prilogu je faktura ${broj}.\n\nHvala.` : `Dear team,\n\nPlease find attached invoice ${broj}.\n\nThanks.`,
  );
  const [kopijaMeni, setKopijaMeni] = useState(false);
  const [uToku, setUToku] = useState(false);
  const [greska, setGreska] = useState<string | null>(null);
  // Klijent bez sačuvanog mejla (Korak 8b ispravka, tačka 4): "Za" se unosi ručno ovde, samo za OVU
  // poruku - ne menja trajno profil klijenta (korisnik nije tražio da se čuva).
  const [adresa, setAdresa] = useState(klijent?.billingEmail ?? "");
  const [adresaGreska, setAdresaGreska] = useState<string | null>(null);

  async function posaljiKlik() {
    const trim = adresa.trim();
    if (!trim || !trim.includes("@")) {
      setAdresaGreska("Upiši ispravnu adresu pre slanja.");
      return;
    }
    setAdresaGreska(null);
    setUToku(true);
    setGreska(null);

    if (rezim === "ponovo") {
      const fd = new FormData();
      fd.set("adresa", trim);
      const rezultat = await posaljiPonovoAction(id, { errors: {}, posalji: null }, fd);
      setUToku(false);
      if (rezultat.errors.email) {
        setAdresaGreska(rezultat.errors.email);
        return;
      }
      if (rezultat.posalji) onPosalji(rezultat.posalji);
      return;
    }

    const fd = new FormData();
    fd.set("clientId", klijent?.id ?? "");
    fd.set("currency", valuta);
    fd.set("lang", jezik);
    fd.set("dueDays", String(rokDana));
    fd.set("accountId", account?.id ?? "");
    fd.set("note", "");
    fd.set("adresa", trim);
    fd.set("stavke", JSON.stringify(stavke.map((s) => ({ desc: s.desc, qty: s.qty, price: s.price / 100 }))));

    const rezultat = await posaljiFakturuAction(id, { id: null, errors: {}, posalji: null }, fd);
    setUToku(false);
    if (rezultat.errors.email) {
      setAdresaGreska(rezultat.errors.email);
      return;
    }
    const prvaGreska = Object.values(rezultat.errors)[0];
    if (prvaGreska) {
      setGreska(prvaGreska);
      return;
    }
    if (rezultat.posalji) onPosalji(rezultat.posalji);
  }

  if (posalji) {
    return (
      <div className={styles.senkaPotvrde}>
        <div className={styles.karticaPotvrde}>
          <span className={styles.ikonaKrug}>
            <IkonaKvacicaKrug size={32} />
          </span>
          <div className={styles.tekstStog}>
            <span className={styles.naslovPotvrde}>
              Faktura {posalji.broj} je {rezim === "ponovo" ? "ponovo poslata" : "poslata"}
            </span>
            <span className={styles.opisPotvrde}>
              {rezim === "ponovo"
                ? `${posalji.klijentIme} je ponovo dobio mejl sa fakturom.`
                : `${posalji.klijentIme} je dobio mejl. Sad pratim uplatu: čim banka pošalje mejl, sam knjižim da je plaćena.`}
            </span>
          </div>
          <div className={styles.kv}>
            <div className={styles.kvRed}>
              <span>Poslato na</span>
              <span>{posalji.billingEmail}</span>
            </div>
            <div className={styles.kvRed}>
              <span>Iznos</span>
              <span>{formatNovacPuno(posalji.ukupno, posalji.valuta)}</span>
            </div>
            <div className={styles.kvRed}>
              <span>Rok za uplatu</span>
              <span>{formatDatumSrpski(new Date(posalji.rokIso))}</span>
            </div>
          </div>
          <div className={styles.dugmadPotvrde}>
            <Button type="button" varijanta="primarno" onClick={onZatvoriPoslato}>
              Nazad na fakture
            </Button>
            <Button
              type="button"
              varijanta="sekundarno"
              onClick={() => window.open(`/api/fakture/${id}/pdf`, "_blank", "noopener")}
            >
              Preuzmi PDF
            </Button>
            <Button
              type="button"
              varijanta="tiho"
              onClick={() => {
                // Pravi (ne klijentski) navigacija, namerno: korisnik je VEĆ na /fakture/nova (ovaj
                // isti URL, Fak12 dugme "Napravi još jednu") - router.push na isti URL je no-op u
                // Next.js App Router-u (nema promene putanje), pa bi React zadržao CEO stari prikaz
                // (uključujući potvrdu slanja i sve staro stanje forme - broj, klijent, stavke) umesto
                // prazne forme. window.location.href forsira pravo, puno učitavanje stranice.
                // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- namerno puno učitavanje, vidi komentar iznad
                window.location.href = "/fakture/nova";
              }}
            >
              Napravi još jednu
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.omot}>
      <div className={styles.red}>
        <div className={styles.formaKolona}>
          <div className={styles.gornjaTraka}>
            <button type="button" className={styles.nazadPilula} onClick={onNazad}>
              <IkonaStrelicaLevo size={18} /> {rezim === "ponovo" ? "Nazad na fakturu" : "Nazad na izmene"}
            </button>
            {rezim === "prvo" && <span className={styles.statusPilulaDesktop}>Nacrt, još nije poslato</span>}
          </div>

          <div className={styles.telo}>
            <h1 className={styles.naslov}>Pregledaj i pošalji</h1>

            {greska && (
              <div className={styles.banerGreska}>
                <IkonaUpozorenje size={18} />
                <span>{greska}</span>
              </div>
            )}

            <Polje
              label="Za"
              value={adresa}
              onChange={(e) => setAdresa(e.target.value)}
              error={adresaGreska ?? undefined}
              placeholder={klijent?.billingEmail ? undefined : "Upiši mejl adresu"}
            />
            <a href="#" className={styles.linkMali} onClick={(e) => e.preventDefault()}>
              + Dodaj još jednu adresu
            </a>
            <Polje label="Naslov" value={naslov} onChange={(e) => setNaslov(e.target.value)} />
            <div className={styles.poljeOmot}>
              <span className={styles.labela}>Poruka</span>
              <textarea className={styles.tekstualnoPolje} rows={4} value={poruka} onChange={(e) => setPoruka(e.target.value)} />
              <span className={styles.hintTekst}>
                Napisao sam poruku na {jezik === "sr" ? "srpskom" : "engleskom"} jer je to jezik fakture. Slobodno je izmeni.
              </span>
            </div>
            <div className={styles.prilogRed}>
              <IkonaSpajalica size={18} />
              <div>
                <div>Invoice {broj.replace("/", "-")}.pdf</div>
                <div className={styles.hintTekst}>Napravljen iz tvog šablona.</div>
              </div>
            </div>
            <label className={styles.kvacicaRed}>
              <input type="checkbox" checked={kopijaMeni} onChange={(e) => setKopijaMeni(e.target.checked)} />
              Pošalji kopiju i meni
            </label>

            <div className={styles.dugmad}>
              <Button
                type="button"
                varijanta="sekundarno"
                disabled={uToku}
                onClick={rezim === "ponovo" ? onNazad : () => router.push("/fakture")}
              >
                {rezim === "ponovo" ? "Odustani" : "Sačuvaj nacrt"}
              </Button>
              <Button type="button" varijanta="primarno" disabled={uToku} onClick={posaljiKlik}>
                {uToku ? "Šaljem..." : "Pošalji fakturu"}
              </Button>
            </div>
          </div>
        </div>

        <div className={styles.pregledKolona}>
          <div className={styles.pregledNatpis}>
            <span>Ovo dobija klijent</span>
            <span>PDF u prilogu</span>
          </div>
          <div className={styles.papirOmot}>
            <InvoiceDocPreview>
              <InvoiceDoc
                broj={broj}
                valuta={valuta}
                jezik={jezik}
                datumIzdavanja={datumIzdavanja}
                dueDays={rokDana}
                stavke={stavke}
                klijent={klijent}
                firma={firma}
                racun={account}
              />
            </InvoiceDocPreview>
          </div>
        </div>

        <div className={styles.pregledMobilni}>
          <span className={styles.naslovSekcije}>Faktura u prilogu</span>
          <div className={styles.papirOmotMobilni}>
            <div className={styles.papirSkaliranMobilni}>
              <InvoiceDoc
                broj={broj}
                valuta={valuta}
                jezik={jezik}
                datumIzdavanja={datumIzdavanja}
                dueDays={rokDana}
                stavke={stavke}
                klijent={klijent}
                firma={firma}
                racun={account}
              />
            </div>
          </div>
        </div>
      </div>
      <FixedThemeTogglePill />
    </div>
  );
}
