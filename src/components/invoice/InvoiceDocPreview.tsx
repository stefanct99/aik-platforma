// Pregled uživo koji se skalira sa širinom kolone (Korak 8b ispravka, nalaz vlasnika: "A4 pregled desno
// je premali u odnosu na prostor"). InvoiceDoc OSTAJE netaknut, uvek tačno 480x680 (isti kod kao
// dokument/PDF - "jedan izvor istine", spec/zadatak) - ovde se samo CELA ta kutija skalira preko
// transform:scale, računato iz STVARNE širine kolone (ResizeObserver), da papir ispuni kolonu i raste sa
// prozorom (1440/1920/2560), bez horizontalnog skrola i bez sečenja. Telefonska kartica (zaseban prikaz
// u InvoiceEditor/InvoiceSendStage) ostaje fiksne veličine - frejm PhFak3 je sam fiksne širine platna, ne
// raste sa telefonom.
"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

const PRIRODNA_SIRINA = 480;
const PRIRODNA_VISINA = 680;

export function InvoiceDocPreview({ children }: { children: ReactNode }) {
  const omotRef = useRef<HTMLDivElement>(null);
  const [skala, setSkala] = useState(1);

  useEffect(() => {
    const omot = omotRef.current;
    if (!omot) return;
    const posmatrac = new ResizeObserver((unosi) => {
      const sirina = unosi[0]?.contentRect.width;
      if (sirina) setSkala(sirina / PRIRODNA_SIRINA);
    });
    posmatrac.observe(omot);
    return () => posmatrac.disconnect();
  }, []);

  return (
    <div ref={omotRef} style={{ width: "100%", height: PRIRODNA_VISINA * skala, overflow: "hidden" }}>
      <div style={{ width: PRIRODNA_SIRINA, height: PRIRODNA_VISINA, transform: `scale(${skala})`, transformOrigin: "top left" }}>
        {children}
      </div>
    </div>
  );
}
