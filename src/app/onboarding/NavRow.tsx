// "Nazad"/"Nastavi" red (OnbO4-O9), tačno po referenca/prototip/js/onboarding.js (NavRow): desktop je
// red 50/50, telefon je kolona OBRNUTOG redosleda (Nastavi gore, pun red; Nazad ispod, pun red) - vidi
// OnboardingBits.module.css (.navRed column-reverse na mobilnom).

import { Button } from "@/components/ui/Button";
import { IkonaUcitavanje } from "@/components/auth-shell/auth-icons";
import styles from "./OnboardingBits.module.css";

export function NavRow({
  onBack,
  loading,
  nextLabel = "Nastavi",
  loadingLabel,
}: {
  onBack: () => void;
  loading?: boolean;
  nextLabel?: string;
  loadingLabel?: string;
}) {
  return (
    <div className={styles.navRed}>
      <div className={styles.navNazad}>
        <Button
          type="button"
          varijanta="sekundarno"
          puniRed
          disabled={loading}
          onClick={onBack}
        >
          Nazad
        </Button>
      </div>
      <div className={styles.navNastavi}>
        <Button type="submit" varijanta="primarno" puniRed disabled={loading}>
          {loading ? (
            <>
              <IkonaUcitavanje size={20} className={styles.spiner} />
              {loadingLabel ?? "Čuvam..."}
            </>
          ) : (
            nextLabel
          )}
        </Button>
      </div>
    </div>
  );
}
