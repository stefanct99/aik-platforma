import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { isValidJezik, isValidFormatDatuma } from "@/lib/theme";
import { SettingsPageHeader } from "@/components/settings/SettingsPageHeader";
import { JezikIIzgledForm } from "./JezikIIzgledForm";

// Zavisi od sesije (headers()). Prijava i onboarding su zaštićeni u src/app/(app)/layout.tsx.
export const instant = false;

export default async function JezikIIzgledPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const jezik = session!.user.jezik;
  const formatDatuma = session!.user.formatDatuma;

  return (
    <>
      <SettingsPageHeader naslov="Jezik i izgled" opis="Kako se prikazuju tekst, datumi i boje." />
      <JezikIIzgledForm
        initialJezik={isValidJezik(jezik) ? jezik : "sr-lat"}
        initialFormatDatuma={isValidFormatDatuma(formatDatuma) ? formatDatuma : "dmy"}
      />
    </>
  );
}
