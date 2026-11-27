// Linijske ikonice (debljina 1.5, zaobljeni krajevi), po uzoru na dizajn/Poc1.dc.html i
// dizajn/Pd0.dc.html iz paketa Koraka 4. Boja prati tekst (stroke="currentColor").

import type { SVGProps } from "react";

type IkonicaProps = SVGProps<SVGSVGElement> & { size?: number };

function Ikonica({ size = 20, children, ...props }: IkonicaProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export function IkonaPocetna(props: IkonicaProps) {
  return (
    <Ikonica {...props}>
      <path d="M4 11l8-7 8 7v8a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z" />
    </Ikonica>
  );
}

export function IkonaFakture(props: IkonicaProps) {
  return (
    <Ikonica {...props}>
      <path d="M7 3h7l5 5v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
      <path d="M14 3v5h5M9 13h6M9 17h4" />
    </Ikonica>
  );
}

// Prazno stanje Knjige prihoda (Korak 9a, frejm Kp3) - BLIZU IkonaFakture, ali nije identična (poslednja
// linija "M9 17h6", ne "M9 17h4") - prototip (Icons.book) koristi sopstvenu varijantu, ne deli je sa
// navigacijom.
export function IkonaKnjigaPrihodaPrazno(props: IkonicaProps) {
  return (
    <Ikonica {...props}>
      <path d="M7 3h7l5 5v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
      <path d="M14 3v5h5M9 13h6M9 17h6" />
    </Ikonica>
  );
}

export function IkonaKnjigaPrihoda(props: IkonicaProps) {
  return (
    <Ikonica {...props}>
      <path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z" />
      <path d="M5 17a3 3 0 0 1 3-3h11" />
    </Ikonica>
  );
}

export function IkonaKalendar(props: IkonicaProps) {
  return (
    <Ikonica {...props}>
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M4 10h16M9 3v4M15 3v4" />
    </Ikonica>
  );
}

export function IkonaPorez(props: IkonicaProps) {
  return (
    <Ikonica {...props}>
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path d="M9 8h6M9 12h6M9 16h3" />
    </Ikonica>
  );
}

export function IkonaMejlovi(props: IkonicaProps) {
  return (
    <Ikonica {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </Ikonica>
  );
}

export function IkonaAi(props: IkonicaProps) {
  return (
    <Ikonica {...props}>
      <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />
      <path d="M19 16l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z" />
    </Ikonica>
  );
}

export function IkonaPodesavanja(props: IkonicaProps) {
  return (
    <Ikonica {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" />
    </Ikonica>
  );
}

export function IkonaPretraga(props: IkonicaProps) {
  return (
    <Ikonica {...props}>
      <circle cx="11" cy="11" r="6" />
      <path d="M20 20l-4-4" />
    </Ikonica>
  );
}

export function IkonaZvonce(props: IkonicaProps) {
  return (
    <Ikonica {...props}>
      <path d="M6 17V11a6 6 0 0 1 12 0v6l2 2H4z" />
      <path d="M10 21h4" />
    </Ikonica>
  );
}

export function IkonaPlus(props: IkonicaProps) {
  return (
    <Ikonica {...props}>
      <path d="M12 5v14M5 12h14" />
    </Ikonica>
  );
}

export function IkonaStrelicaDesno(props: IkonicaProps) {
  return (
    <Ikonica {...props}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </Ikonica>
  );
}

export function IkonaTacke(props: IkonicaProps) {
  return (
    <Ikonica {...props}>
      <circle cx="5.5" cy="12" r="2.1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="2.1" fill="currentColor" stroke="none" />
      <circle cx="18.5" cy="12" r="2.1" fill="currentColor" stroke="none" />
    </Ikonica>
  );
}

export function IkonaOdjava(props: IkonicaProps) {
  return (
    <Ikonica {...props}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5M21 12H9" />
    </Ikonica>
  );
}

export function IkonaX(props: IkonicaProps) {
  return (
    <Ikonica {...props}>
      <path d="M18 6 6 18M6 6l12 12" />
    </Ikonica>
  );
}

// Podešavanja, ikonice kartica (preuzete iz dizajn/Pd0.dc.html)
export function IkonaProfilFirma(props: IkonicaProps) {
  return (
    <Ikonica {...props}>
      <rect x="4" y="8" width="16" height="11" rx="2" />
      <path d="M9 8V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M4 13h16" />
    </Ikonica>
  );
}

export function IkonaRacuni(props: IkonicaProps) {
  return (
    <Ikonica {...props}>
      <circle cx="12" cy="12" r="8" />
      <path d="M14.5 9.5c-.5-1-1.5-1.5-2.5-1.5-1.4 0-2.5.7-2.5 1.8 0 2.4 5 1.2 5 3.6 0 1.1-1.1 1.8-2.5 1.8-1.1 0-2.1-.5-2.6-1.5M12 7v1M12 16v1" />
    </Ikonica>
  );
}

export function IkonaPovezivanje(props: IkonicaProps) {
  return <IkonaMejlovi {...props} />;
}

export function IkonaBezbednost(props: IkonicaProps) {
  return (
    <Ikonica {...props}>
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </Ikonica>
  );
}

export function IkonaJezik(props: IkonicaProps) {
  return <IkonaPodesavanja {...props} />;
}

export function IkonaUpload(props: IkonicaProps) {
  return (
    <Ikonica {...props}>
      <path d="M12 16V5M7.5 9.5L12 5l4.5 4.5M5 19h14" />
    </Ikonica>
  );
}

export function IkonaKopiraj(props: IkonicaProps) {
  return (
    <Ikonica {...props}>
      <rect x="8" y="8" width="12" height="12" rx="2" />
      <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
    </Ikonica>
  );
}

export function IkonaKvacica(props: IkonicaProps) {
  return (
    <Ikonica {...props}>
      <path d="M20 6 9 17l-5-5" />
    </Ikonica>
  );
}

export function IkonaOko(props: IkonicaProps) {
  return (
    <Ikonica {...props}>
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </Ikonica>
  );
}

export function IkonaOkoPreko(props: IkonicaProps) {
  return (
    <Ikonica {...props}>
      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-6.4 0-10-7-10-7a18.5 18.5 0 0 1 4.22-5.19M9.9 4.24A10.94 10.94 0 0 1 12 5c6.4 0 10 7 10 7a18.5 18.5 0 0 1-2.16 3.19M14.12 14.12a3 3 0 1 1-4.24-4.24" />
      <path d="M2 2l20 20" />
    </Ikonica>
  );
}

export function IkonaKatanac(props: IkonicaProps) {
  return (
    <Ikonica {...props} size={props.size ?? 16}>
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </Ikonica>
  );
}

// Korak 8a (Fakture): red menija (⋯), filteri, dijalozi.
export function IkonaChevronDole(props: IkonicaProps) {
  return (
    <Ikonica {...props}>
      <path d="M6 9l6 6 6-6" />
    </Ikonica>
  );
}

export function IkonaPreuzmi(props: IkonicaProps) {
  return (
    <Ikonica {...props}>
      <path d="M12 3v12M7 10l5 5 5-5M5 19h14" />
    </Ikonica>
  );
}

export function IkonaKvacicaKrug(props: IkonicaProps) {
  return (
    <Ikonica {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12.5l2.5 2.5L16 9.5" />
    </Ikonica>
  );
}

export function IkonaZastavica(props: IkonicaProps) {
  return (
    <Ikonica {...props}>
      <path d="M5 3v18" />
      <path d="M5 4h11l-2.5 4L16 12H5" />
    </Ikonica>
  );
}

export function IkonaOlovka(props: IkonicaProps) {
  return (
    <Ikonica {...props}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
    </Ikonica>
  );
}

export function IkonaKanta(props: IkonicaProps) {
  return (
    <Ikonica {...props}>
      <path d="M4 7h16M9 7V4h6v3M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13" />
    </Ikonica>
  );
}

export function IkonaSpajalica(props: IkonicaProps) {
  return (
    <Ikonica {...props}>
      <path d="M21 12.5l-8.4 8.4a4.5 4.5 0 0 1-6.4-6.4l9-9a3 3 0 0 1 4.2 4.2l-9 9a1.5 1.5 0 0 1-2.1-2.1l8-8" />
    </Ikonica>
  );
}

export function IkonaSat(props: IkonicaProps) {
  return (
    <Ikonica {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </Ikonica>
  );
}

// Korak 8c (baner iznad liste Ponavljajuće, frejm Fak13): ista putanja kao referenca/prototip/js/icons.js
// I.sparkle, prepisana tačno (prototip isto crta stroke="currentColor", ne fill - isti Ikonica obrazac).
export function IkonaSparkle(props: IkonicaProps) {
  return (
    <Ikonica {...props}>
      <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />
      <path d="M19 16l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z" />
    </Ikonica>
  );
}
