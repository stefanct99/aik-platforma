export function OnboardingShell({
  korak,
  naslov,
  podnaslov,
  children,
}: {
  korak: 1 | 2 | 3 | 4;
  naslov: string;
  podnaslov: string;
  children: React.ReactNode;
}) {
  return (
    <main>
      <p>Korak {korak} od 4</p>
      <h1>{naslov}</h1>
      <p>{podnaslov}</p>
      {children}
    </main>
  );
}
