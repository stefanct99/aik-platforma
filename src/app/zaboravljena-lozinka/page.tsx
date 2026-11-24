import { preusmeriAkoPrijavljen } from "@/lib/guest-guard";
import { ForgotForm } from "./ForgotForm";

export const instant = false;

export default async function ZaboravljenaLozinkaPage() {
  await preusmeriAkoPrijavljen();
  return <ForgotForm />;
}
