"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export default function PrijavaPage() {
  const [email, setEmail] = useState("");
  const [ucitava, setUcitava] = useState(false);
  const [poruka, setPoruka] = useState<string | null>(null);

  async function posaljiLink() {
    setUcitava(true);
    setPoruka(null);
    const { error } = await authClient.signIn.magicLink({
      email,
      callbackURL: "/pocetna",
    });
    setUcitava(false);
    setPoruka(
      error
        ? "Nešto nije u redu. Pokušaj ponovo."
        : "Link za prijavu je poslat. U razvojnom režimu ga nađeš u terminalu servera.",
    );
  }

  return (
    <main>
      <h1>Prijava</h1>
      <p>Upiši svoju mejl adresu, poslaćemo ti link za prijavu.</p>
      <input
        type="email"
        value={email}
        onChange={(dogadjaj) => setEmail(dogadjaj.target.value)}
        placeholder="tvoj@mejl.rs"
      />
      <button onClick={posaljiLink} disabled={ucitava || !email}>
        {ucitava ? "Šaljem..." : "Pošalji link za prijavu"}
      </button>
      {poruka && <p>{poruka}</p>}
    </main>
  );
}
