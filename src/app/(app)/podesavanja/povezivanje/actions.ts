"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { regenerateCalendarToken, setCalendarSyncEnabled } from "@/lib/business";

async function trenutniKorisnik() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/prijava");
  return session.user;
}

export async function generisiNoviKalendarTokenAction() {
  const korisnik = await trenutniKorisnik();
  const biznis = await regenerateCalendarToken(korisnik.id);
  return biznis.calendarToken;
}

export async function promeniKalendarSinhronizacijuAction(ukljuceno: boolean) {
  const korisnik = await trenutniKorisnik();
  await setCalendarSyncEnabled(korisnik.id, ukljuceno);
}
