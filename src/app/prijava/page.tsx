import { preusmeriAkoPrijavljen } from "@/lib/guest-guard";
import { jeGooglePrijavaPodesena } from "@/lib/google-prijava";
import { LoginForm } from "./LoginForm";

// Zavisi od sesije (headers()), ne može da se unapred generiše statički.
export const instant = false;

export default async function PrijavaPage() {
  await preusmeriAkoPrijavljen();
  return <LoginForm googlePodesen={jeGooglePrijavaPodesena()} />;
}
