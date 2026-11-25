-- CreateTable
CREATE TABLE "recurring_invoice" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "desc" TEXT,
    "amount" INTEGER,
    "frequency" TEXT NOT NULL DEFAULT 'mesecno',
    "dayOfMonth" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "mode" TEXT NOT NULL DEFAULT 'ask',
    "status" TEXT NOT NULL DEFAULT 'aktivna',
    "nextDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recurring_invoice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "recurring_invoice_businessId_idx" ON "recurring_invoice"("businessId");

-- CreateIndex
CREATE INDEX "recurring_invoice_clientId_idx" ON "recurring_invoice"("clientId");

-- AddForeignKey
ALTER TABLE "recurring_invoice" ADD CONSTRAINT "recurring_invoice_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurring_invoice" ADD CONSTRAINT "recurring_invoice_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
