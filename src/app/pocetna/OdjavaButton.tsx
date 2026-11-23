"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function OdjavaButton() {
  const router = useRouter();

  async function odjaviSe() {
    await authClient.signOut();
    router.push("/prijava");
  }

  return <button onClick={odjaviSe}>Odjava</button>;
}
