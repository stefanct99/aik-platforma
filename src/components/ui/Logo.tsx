// Znak (dizajn sistem, Korak 4): preuzet iz
// referenca/korak4/KORAK4_PAKET/dizajn-sistem/assets/Logos/znak.svg.

export function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <rect width="64" height="64" rx="15" fill="#0F2A22" />
      <line x1="14" y1="24" x2="38" y2="24" stroke="#F4F3EE" strokeWidth={4.5} strokeLinecap="round" />
      <line x1="14" y1="34" x2="44" y2="34" stroke="#F4F3EE" strokeWidth={4.5} strokeLinecap="round" />
      <line x1="14" y1="44" x2="30" y2="44" stroke="#F4F3EE" strokeWidth={4.5} strokeLinecap="round" />
      <path
        d="M47 8C48 15 50 17 57 18C50 19 48 21 47 28C46 21 44 19 37 18C44 17 46 15 47 8Z"
        fill="#C8F169"
      />
    </svg>
  );
}
