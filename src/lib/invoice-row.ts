// Tip reda liste faktura (Korak 8a) - deljen između servera (page.tsx) i klijentske komponente.
export type FakturaRed = {
  id: string;
  number: string;
  status: "nacrt" | "poslata" | "placena" | "stornirana";
  currency: string;
  issueDate: string; // ISO
  dueDays: number;
  clientId: string;
  clientName: string;
  clientEmail: string | null;
  total: number;
  paidDate: string | null;
};
