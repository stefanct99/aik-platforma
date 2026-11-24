// Ikonice za prijavu/registraciju/reset (Korak 5), prepisane iz referenca/prototip/js/icons.js.
// Debljina linije 1.8 (ne 1.5 kao u src/components/ui/icons.tsx) jer je to stvarna vrednost koju
// prototip koristi (Icon() u js/icons.js), ne 1.5 iz dizajn-sistem/README.md - frejm/prototip pobeđuje.
// Nije menjan src/components/ui/icons.tsx (Korak 4 okvir aplikacije), to je van opsega ovog koraka.

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
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export function IkonaOko(props: IkonicaProps) {
  return (
    <Ikonica {...props}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
    </Ikonica>
  );
}

export function IkonaOkoPreko(props: IkonicaProps) {
  return (
    <Ikonica {...props}>
      <path d="M3 3l18 18" />
      <path d="M10.6 5.1A10.8 10.8 0 0 1 12 5c6.5 0 10 7 10 7a14 14 0 0 1-3 3.9M6.3 6.5A14.4 14.4 0 0 0 2 12s3.5 7 10 7a10.4 10.4 0 0 0 4.2-.9" />
      <path d="M9.5 10a2.5 2.5 0 0 0 3.5 3.5" />
    </Ikonica>
  );
}

export function IkonaKatanac(props: IkonicaProps) {
  return (
    <Ikonica {...props}>
      <path d="M5 11h14v9H5z" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </Ikonica>
  );
}

export function IkonaSanduce(props: IkonicaProps) {
  return (
    <Ikonica {...props}>
      <path d="M3 7h5l2 3h4l2-3h5v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    </Ikonica>
  );
}

export function IkonaMejl(props: IkonicaProps) {
  return (
    <Ikonica {...props}>
      <path d="M4 6h16v12H4z" />
      <path d="M4 7l8 6 8-6" />
    </Ikonica>
  );
}

export function IkonaUpozorenje(props: IkonicaProps) {
  return (
    <Ikonica {...props}>
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
      <path d="M10.3 3.9 2.4 18a1 1 0 0 0 .9 1.5h17.4a1 1 0 0 0 .9-1.5L13.7 3.9a1 1 0 0 0-1.4 0Z" />
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

export function IkonaKvacicaKrug(props: IkonicaProps) {
  return (
    <Ikonica {...props}>
      <path d="M21 11.1V12a9 9 0 1 1-5.3-8.2" />
      <path d="M22 4 12 14.01l-3-3" />
    </Ikonica>
  );
}

export function IkonaSat(props: IkonicaProps) {
  return (
    <Ikonica {...props}>
      <path d="M12 8v4l3 2" />
      <path d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z" />
    </Ikonica>
  );
}

export function IkonaStrelicaLevo(props: IkonicaProps) {
  return (
    <Ikonica {...props}>
      <path d="M15 18l-6-6 6-6" />
    </Ikonica>
  );
}

export function IkonaSunce(props: IkonicaProps) {
  return (
    <Ikonica {...props}>
      <path d="M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </Ikonica>
  );
}

export function IkonaMesec(props: IkonicaProps) {
  return (
    <Ikonica {...props}>
      <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z" />
    </Ikonica>
  );
}

export function IkonaGoogleG(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        fill="#4285F4"
        d="M23 12.3c0-.8-.1-1.5-.2-2.2H12v4.2h6.2a5.3 5.3 0 0 1-2.3 3.5v2.9h3.7c2.2-2 3.4-5 3.4-8.4z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.1 0 5.7-1 7.6-2.8l-3.7-2.9c-1 .7-2.3 1.1-3.9 1.1-3 0-5.5-2-6.4-4.7H1.8v3C3.7 21.5 7.5 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.6 14.7a7.2 7.2 0 0 1 0-4.6v-3H1.8a12 12 0 0 0 0 10.6l3.8-3z"
      />
      <path
        fill="#EA4335"
        d="M12 4.8c1.7 0 3.2.6 4.4 1.7l3.3-3.3A11.5 11.5 0 0 0 12 0C7.5 0 3.7 2.5 1.8 6.1l3.8 3C6.5 6.8 9 4.8 12 4.8z"
      />
    </svg>
  );
}
