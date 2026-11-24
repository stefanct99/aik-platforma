// Prikaz novca (Korak 8a): iznos se čuva kao ceo broj u najmanjoj jedinici (para/cent), nikad float.
// Pravilo prikaza je Stefanovo eksplicitno uputstvo iz zadatka Koraka 8a ("1.200,00 €, 85.000 din,
// 441,28 $") - RSD BEZ decimala, EUR/USD SA dve decimale, uvek i u listama i na samoj fakturi. Ovo
// namerno odstupa od frejma Fak20 (PDF tamo prikazuje "85.000,00 din" sa decimalama za RSD) - prateći
// Stefanovo pisano pravilo iz ovog koraka, navedeno u izveštaju.
const SIMBOLI: Record<string, string> = { EUR: "€", USD: "$", RSD: "din" };

export function formatNovac(iznosUNajmanjojJedinici: number, valuta: string): string {
  const decimale = valuta === "RSD" ? 0 : 2;
  const iznos = iznosUNajmanjojJedinici / 100;
  const simbol = SIMBOLI[valuta] ?? valuta;
  const broj = iznos.toLocaleString("sr-RS", {
    minimumFractionDigits: decimale,
    maximumFractionDigits: decimale,
  });
  return `${broj} ${simbol}`;
}
