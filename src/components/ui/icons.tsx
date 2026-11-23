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
