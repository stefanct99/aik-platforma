"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function OdjaviSeDugme({ className }: { className?: string }) {
  const router = useRouter();

  async function odjaviSe() {
    await authClient.signOut();
    router.push("/prijava");
  }

  return (
    <button type="button" onClick={odjaviSe} className={className}>
      Odjavi se
    </button>
  );
}
