export function trebaPreusmeravanjeNaOnboarding(
  onboardingCompletedAt: Date | null | undefined,
): boolean {
  return !onboardingCompletedAt;
}

export function trebaPreusmeravanjeNaPocetnu(
  onboardingCompletedAt: Date | null | undefined,
): boolean {
  return !!onboardingCompletedAt;
}
