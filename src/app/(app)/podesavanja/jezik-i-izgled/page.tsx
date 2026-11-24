import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { isValidTema } from "@/lib/theme";
import { SettingsPageHeader } from "@/components/settings/SettingsPageHeader";
import { JezikIIzgledForm } from "./JezikIIzgledForm";

// Zavisi od sesije (headers()). Prijava i onboarding su zaštićeni u src/app/(app)/layout.tsx.
export const instant = false;

export default async function JezikIIzgledPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const tema = session!.user.theme;

  return (
    <>
      <SettingsPageHeader naslov="Jezik i izgled" opis="Kako se prikazuju tekst, datumi i boje." />
      <JezikIIzgledForm initialTema={isValidTema(tema) ? tema : "sistem"} />
    </>
  );
}
