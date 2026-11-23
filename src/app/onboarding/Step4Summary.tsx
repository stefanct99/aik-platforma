import { finishOnboardingAction, goBackAction } from "./actions";
import { OnboardingShell } from "./OnboardingShell";

export function Step4Summary({
  businessName,
  pib,
  street,
  zip,
  city,
}: {
  businessName: string;
  pib: string;
  street: string;
  zip: string;
  city: string;
}) {
  return (
    <OnboardingShell
      korak={4}
      naslov="Sve je spremno"
      podnaslov="Tvoja firma je podešena. Odavde dalje faktura, knjiga prihoda i porez idu sami."
    >
      <ul>
        <li>
          Podaci o firmi: {businessName}, PIB {pib}
        </li>
        <li>
          Podaci za fakture: {street}, {zip} {city}
        </li>
        <li>Mejlovi banke: podesićeš ovo kasnije u podešavanjima.</li>
      </ul>
      <form action={finishOnboardingAction}>
        <button type="submit">Uđi u aplikaciju</button>
      </form>
      <form action={goBackAction}>
        <input type="hidden" name="trenutniKorak" value={4} />
        <button type="submit">Nazad</button>
      </form>
    </OnboardingShell>
  );
}
