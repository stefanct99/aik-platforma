export type KlijentRed = {
  id: string;
  name: string;
  billingEmail: string | null;
  country: string | null;
  pib: string | null;
  address: string;
  defaultCurrency: string;
  defaultLang: string;
  defaultDueDays: number;
  defaultAccountId: string | null;
  defaultItemDesc: string | null;
  defaultItemAmount: number | null;
  autoSendMode: string;
  fxMode: string;
  archived: boolean;
  poslednjaFaktura: string | null; // ISO
  imaFaktura: boolean;
};
