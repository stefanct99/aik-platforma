// Izvoz Knjige prihoda (Korak 9g-1) - deo koji dotiče bazu, odvojen od izvoz-prihoda.ts (čiste funkcije)
// iz istog razloga kao prihodi.ts/prihodi-db.ts. Ruta (route.ts) ostaje tanka (samo sesija/parsiranje
// parametara/odgovor) - ISTI obrazac kao actions.ts (trenutniKorisnik + pozivanje -db.ts funkcije), zato
// se ruta sama ne testira vitest-om (ni actions.ts to nema - testira se E2E), nego OVA funkcija.
import { getBusinessForUser } from "./business";
import {
  filtrirajZaIzvoz,
  napraviTabeleIzvoza,
  type PeriodIzvoza,
  type TabelaIzvoza,
} from "./izvoz-prihoda";
import { getPrihodiZaKorisnika } from "./prihodi-db";

export type PodaciZaIzvoz = {
  firma: { naziv: string; pib: string };
  tabele: TabelaIzvoza[];
};

export async function pripremiIzvoz(
  userId: string,
  godina: number,
  period: PeriodIzvoza,
  odvojeno: boolean,
  zbir: boolean,
  danas: Date = new Date(),
): Promise<PodaciZaIzvoz | null> {
  const biznis = await getBusinessForUser(userId);
  if (!biznis) return null;

  const redovi = await getPrihodiZaKorisnika(userId, danas);
  const zaPeriod = filtrirajZaIzvoz(redovi, godina, period);
  const tabele = napraviTabeleIzvoza(zaPeriod, odvojeno, zbir);

  return { firma: { naziv: biznis.name, pib: biznis.pib }, tabele };
}
