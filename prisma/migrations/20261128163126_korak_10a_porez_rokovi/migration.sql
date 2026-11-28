-- CreateTable
CREATE TABLE "tax_decision" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "pib" TEXT,
    "fileName" TEXT,
    "source" TEXT NOT NULL DEFAULT 'rucno',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tax_decision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tax_obligation" (
    "id" TEXT NOT NULL,
    "decisionId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "monthlyAmount" INTEGER NOT NULL,
    "recipientAccount" TEXT,
    "referenceNumber" TEXT,

    CONSTRAINT "tax_obligation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tax_payment" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "obligationId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'neplaceno',
    "paidDate" TIMESTAMP(3),
    "method" TEXT,

    CONSTRAINT "tax_payment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "tax_decision_businessId_idx" ON "tax_decision"("businessId");

-- CreateIndex
CREATE UNIQUE INDEX "tax_decision_businessId_year_key" ON "tax_decision"("businessId", "year");

-- CreateIndex
CREATE INDEX "tax_obligation_decisionId_idx" ON "tax_obligation"("decisionId");

-- CreateIndex
CREATE UNIQUE INDEX "tax_obligation_decisionId_kind_key" ON "tax_obligation"("decisionId", "kind");

-- CreateIndex
CREATE INDEX "tax_payment_businessId_year_month_idx" ON "tax_payment"("businessId", "year", "month");

-- CreateIndex
CREATE INDEX "tax_payment_obligationId_idx" ON "tax_payment"("obligationId");

-- CreateIndex
CREATE UNIQUE INDEX "tax_payment_obligationId_year_month_key" ON "tax_payment"("obligationId", "year", "month");

-- AddForeignKey
ALTER TABLE "tax_decision" ADD CONSTRAINT "tax_decision_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tax_obligation" ADD CONSTRAINT "tax_obligation_decisionId_fkey" FOREIGN KEY ("decisionId") REFERENCES "tax_decision"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tax_payment" ADD CONSTRAINT "tax_payment_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tax_payment" ADD CONSTRAINT "tax_payment_obligationId_fkey" FOREIGN KEY ("obligationId") REFERENCES "tax_obligation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
