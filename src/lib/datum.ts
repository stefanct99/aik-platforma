// Srpski format datuma (spec 7.13: "paušalac od 14.03.2024."): DD.MM.GGGG. sa tačkom na kraju.
export function formatDatumSrpski(datum: Date): string {
  // UTC, ne lokalno vreme: datum se čuva kao kalendarski dan (iz <input type="date">), ne kao trenutak,
  // pa lokalna vremenska zona servera ne sme da ga pomeri za jedan dan.
  const dan = String(datum.getUTCDate()).padStart(2, "0");
  const mesec = String(datum.getUTCMonth() + 1).padStart(2, "0");
  const godina = datum.getUTCFullYear();
  return `${dan}.${mesec}.${godina}.`;
}
