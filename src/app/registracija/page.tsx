import { preusmeriAkoPrijavljen } from "@/lib/guest-guard";
import { jeGooglePrijavaPodesena } from "@/lib/google-prijava";
import { RegisterForm } from "./RegisterForm";

export const instant = false;

export default async function RegistracijaPage() {
  await preusmeriAkoPrijavljen();
  return <RegisterForm googlePodesen={jeGooglePrijavaPodesena()} />;
}
