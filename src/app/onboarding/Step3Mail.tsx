import { continueFromStep3Action, goBackAction } from "./actions";
import { OnboardingShell } from "./OnboardingShell";

export function Step3Mail() {
  return (
    <OnboardingShell
      korak={3}
      naslov="Poveži mejlove banke"
      podnaslov="Banka ti šalje obaveštenje o svakoj uplati. Mi ga pročitamo i sami uparimo uplatu sa fakturom. Ne tražimo lozinku za e-banking."
    >
      <p>Ovo podešavaš u sledećem koraku razvoja aplikacije. Za sada samo nastavi dalje.</p>
      <form action={continueFromStep3Action}>
        <button type="submit">Podesiću ovo kasnije</button>
      </form>
      <form action={goBackAction}>
        <input type="hidden" name="trenutniKorak" value={3} />
        <button type="submit">Nazad</button>
      </form>
    </OnboardingShell>
  );
}
