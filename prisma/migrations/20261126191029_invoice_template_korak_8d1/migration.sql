-- AlterTable
ALTER TABLE "invoice" ADD COLUMN     "templateSnapshot" JSONB;

-- CreateTable
CREATE TABLE "invoice_template" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "layout" TEXT NOT NULL DEFAULT 'klasican',
    "accentColor" TEXT NOT NULL DEFAULT '#0F2A22',
    "blocks" JSONB NOT NULL,
    "blocksOff" JSONB NOT NULL,
    "blockProps" JSONB NOT NULL,
    "table" JSONB NOT NULL,
    "doc" JSONB NOT NULL,
    "assignRule" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoice_template_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "invoice_template_businessId_idx" ON "invoice_template"("businessId");

-- AddForeignKey
ALTER TABLE "invoice_template" ADD CONSTRAINT "invoice_template_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
