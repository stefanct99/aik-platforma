-- AlterTable
ALTER TABLE "income" ADD COLUMN     "clientId" TEXT;

-- CreateIndex
CREATE INDEX "income_clientId_idx" ON "income"("clientId");

-- AddForeignKey
ALTER TABLE "income" ADD CONSTRAINT "income_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "client"("id") ON DELETE SET NULL ON UPDATE CASCADE;
