"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { setNotification, type Kanal, type VrstaObavestenja } from "@/lib/notification-settings";

export async function promeniObavestenjeAction(
  kljuc: VrstaObavestenja,
  kanal: Kanal,
  vrednost: boolean,
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/prijava");
  await setNotification(session.user.id, kljuc, kanal, vrednost);
}
