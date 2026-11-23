export function Polje({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label>
        <span>{label}</span>
        {children}
      </label>
      {error && <p>{error}</p>}
    </div>
  );
}
