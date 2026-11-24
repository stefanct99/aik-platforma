import { preusmeriAkoPrijavljen } from "@/lib/guest-guard";
import { MagicLinkForm } from "./MagicLinkForm";

export const instant = false;

export default async function MagicLinkPage() {
  await preusmeriAkoPrijavljen();
  return <MagicLinkForm />;
}
