"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { IkonaKvacica, IkonaMinus, IkonaUcitavanje } from "@/components/auth-shell/auth-icons";
import type { Tema } from "@/lib/theme";
import { finishOnboardingAction } from "./actions";
import { OnboardingShell } from "./OnboardingShell";
import styles from "./OnboardingBits.module.css";

export function Step4Summary({
  businessName,
  pib,
  street,
  zip,
  city,
  tema,
}: {
  businessName: string;
  pib: string;
  street: string;
  zip: string;
  city: string;
  tema: Tema;
}) {
  const [uToku, pokreni] = useTransition();

  // Mejlovi banke "Povezano" (OnbO10) se ne prikazuje jer stvarno povezivanje još ne postoji (videti
  // izveštaj Koraka 6) - jedini pravi put kroz korak 3 je preskakanje, zato je ovo uvek OnbO11.
  const stavke: Array<{ naslov: string; podnaslov: string; gotovo: boolean }> = [
    { naslov: "Podaci o firmi", podnaslov: `${businessName}, PIB ${pib}`, gotovo: true },
    { naslov: "Podaci za fakture", podnaslov: `${street}, ${zip} ${city}`, gotovo: true },
    {
      naslov: "Mejlovi banke",
      podnaslov: "Podesićeš ovo kasnije u podešavanjima.",
      gotovo: false,
    },
  ];

  return (
    <OnboardingShell
      korak={4}
      naslov="Sve je spremno"
      podnaslov="Tvoja firma je podešena. Odavde dalje faktura, knjiga prihoda i porez idu sami."
      tema={tema}
    >
      <div className={styles.forma}>
        <div className={styles.rezime}>
          {stavke.map((stavka) => (
            <div key={stavka.naslov} className={styles.rezimeRed}>
              <span
                className={`${styles.rezimeKrug} ${stavka.gotovo ? styles.rezimeKrugOk : styles.rezimeKrugNe}`}
              >
                {stavka.gotovo ? <IkonaKvacica size={14} /> : <IkonaMinus size={14} />}
              </span>
              <div>
                <div className={styles.rezimeNaslov}>{stavka.naslov}</div>
                <div className={styles.rezimePodnaslov}>{stavka.podnaslov}</div>
              </div>
            </div>
          ))}
        </div>
        <Button
          type="button"
          varijanta="primarno"
          puniRed
          disabled={uToku}
          onClick={() => pokreni(async () => finishOnboardingAction())}
        >
          {uToku ? (
            <>
              <IkonaUcitavanje size={20} className={styles.spiner} />
              Otvaram aplikaciju...
            </>
          ) : (
            "Uđi u aplikaciju"
          )}
        </Button>
      </div>
    </OnboardingShell>
  );
}
