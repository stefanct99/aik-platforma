-- Korak 7 (Računi): minimalan zamenik za proveru "račun je u upotrebi na nacrtu fakture", dok Fakture
-- kao stvarna funkcija ne postoje (videti komentar na modelu u schema.prisma).
CREATE TABLE "invoice_draft_stub" (
    "id" TEXT NOT NULL,
    "bankAccountId" TEXT NOT NULL,
    "broj" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invoice_draft_stub_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "invoice_draft_stub_bankAccountId_idx" ON "invoice_draft_stub"("bankAccountId");

ALTER TABLE "invoice_draft_stub" ADD CONSTRAINT "invoice_draft_stub_bankAccountId_fkey"
    FOREIGN KEY ("bankAccountId") REFERENCES "bank_account"("id") ON DELETE CASCADE ON UPDATE CASCADE;
