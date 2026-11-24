"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Alert } from "./Alert";
import { IkonaGoogleG } from "./auth-icons";
import styles from "./AuthBits.module.css";

// "Nastavi sa Google nalogom" (Korak 5): dugme postoji kao u frejmu, ali je onemogućeno dok Google
// OAuth nije podešen (GOOGLE_CLIENT_ID/SECRET), BEZ lažne greške pri kliku. `podeseno` se računa na
// serveru (process.env nije javno dostupan u pregledaču) i prosleđuje kao prop, videti
// src/lib/google-prijava.ts. Greška (PrijavaG1) se prikazuje isto mesto/izgled kao pogrešna lozinka
// (auth.js: google() samo postavlja isti formErr, nema posebnog ekrana).
export function GoogleDugme({ podeseno }: { podeseno: boolean }) {
  const [greska, setGreska] = useState(false);

  async function nastaviSaGoogleom() {
    setGreska(false);
    const { error } = await authClient.signIn.social({ provider: "google", callbackURL: "/pocetna" });
    if (error) setGreska(true);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {greska && (
        <Alert>Prijava preko Google naloga nije uspela. Pokušaj ponovo ili se prijavi mejlom.</Alert>
      )}
      <button
        type="button"
        className={styles.googleDugme}
        disabled={!podeseno}
        title={!podeseno ? "Google prijava još nije podešena" : undefined}
        onClick={nastaviSaGoogleom}
      >
        <IkonaGoogleG /> Nastavi sa Google nalogom
      </button>
    </div>
  );
}
