/*
  Warnings:

  - You are about to drop the `invoice_draft_stub` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "invoice_draft_stub" DROP CONSTRAINT "invoice_draft_stub_bankAccountId_fkey";

-- DropTable
DROP TABLE "invoice_draft_stub";

-- CreateTable
CREATE TABLE "client" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "country" TEXT,
    "billingEmail" TEXT NOT NULL,
    "pib" TEXT,
    "address" TEXT,
    "defaultCurrency" TEXT NOT NULL DEFAULT 'EUR',
    "defaultLang" TEXT NOT NULL DEFAULT 'sr',
    "defaultDueDays" INTEGER NOT NULL DEFAULT 7,
    "defaultAccountId" TEXT,
    "defaultItemDesc" TEXT,
    "defaultItemAmount" INTEGER,
    "autoSendMode" TEXT NOT NULL DEFAULT 'nasledi',
    "fxMode" TEXT NOT NULL DEFAULT 'proknjizi',
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoice_counter" (
    "businessId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "lastNumber" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "invoice_counter_pkey" PRIMARY KEY ("businessId","year")
);

-- CreateTable
CREATE TABLE "invoice" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "lang" TEXT NOT NULL DEFAULT 'sr',
    "issueDate" TIMESTAMP(3) NOT NULL,
    "dueDays" INTEGER NOT NULL,
    "note" TEXT,
    "accountId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'nacrt',
    "sentAt" TIMESTAMP(3),
    "paidDate" TIMESTAMP(3),
    "voidedAt" TIMESTAMP(3),
    "voidNotifyClient" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoice_item" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "desc" TEXT NOT NULL,
    "qty" INTEGER NOT NULL DEFAULT 1,
    "price" INTEGER NOT NULL,
    "redosled" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "invoice_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoice_event" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "tip" TEXT NOT NULL,
    "datum" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "napomena" TEXT,

    CONSTRAINT "invoice_event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "income" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "invoiceId" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "currency" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "rate" DOUBLE PRECISION,
    "amountRsd" INTEGER,
    "source" TEXT NOT NULL DEFAULT 'rucno',
    "kind" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "income_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "client_businessId_idx" ON "client"("businessId");

-- CreateIndex
CREATE INDEX "invoice_businessId_idx" ON "invoice"("businessId");

-- CreateIndex
CREATE INDEX "invoice_clientId_idx" ON "invoice"("clientId");

-- CreateIndex
CREATE UNIQUE INDEX "invoice_businessId_number_key" ON "invoice"("businessId", "number");

-- CreateIndex
CREATE INDEX "invoice_item_invoiceId_idx" ON "invoice_item"("invoiceId");

-- CreateIndex
CREATE INDEX "invoice_event_invoiceId_idx" ON "invoice_event"("invoiceId");

-- CreateIndex
CREATE INDEX "income_businessId_idx" ON "income"("businessId");

-- CreateIndex
CREATE INDEX "income_invoiceId_idx" ON "income"("invoiceId");

-- AddForeignKey
ALTER TABLE "client" ADD CONSTRAINT "client_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client" ADD CONSTRAINT "client_defaultAccountId_fkey" FOREIGN KEY ("defaultAccountId") REFERENCES "bank_account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice" ADD CONSTRAINT "invoice_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice" ADD CONSTRAINT "invoice_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice" ADD CONSTRAINT "invoice_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "bank_account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_item" ADD CONSTRAINT "invoice_item_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_event" ADD CONSTRAINT "invoice_event_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "income" ADD CONSTRAINT "income_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "income" ADD CONSTRAINT "income_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;
