import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getPrihodiZaKorisnika } from "@/lib/prihodi-db";
import { getClientsForUser } from "@/lib/clients";
import { pocetakDanaUtc } from "@/lib/datum";
import { KnjigaPrihodaTab } from "./KnjigaPrihodaTab";

export const instant = false;

export default async function KnjigaPrihodaPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/prijava");

  const [redovi, klijenti] = await Promise.all([
    getPrihodiZaKorisnika(session.user.id),
    getClientsForUser(session.user.id),
  ]);

  return (
    <KnjigaPrihodaTab
      redovi={redovi}
      klijenti={klijenti.map((k) => ({ id: k.id, name: k.name }))}
      danasIso={pocetakDanaUtc().toISOString()}
    />
  );
}
