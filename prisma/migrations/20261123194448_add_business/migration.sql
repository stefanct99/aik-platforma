-- CreateTable
CREATE TABLE "business" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ownerName" TEXT NOT NULL,
    "pib" TEXT NOT NULL,
    "mb" TEXT NOT NULL,
    "delatnostCode" TEXT NOT NULL,
    "delatnostName" TEXT NOT NULL,
    "regDate" TIMESTAMP(3) NOT NULL,
    "street" TEXT,
    "city" TEXT,
    "zip" TEXT,
    "contactEmail" TEXT,
    "phone" TEXT,
    "logoUrl" TEXT,
    "inboundSlug" TEXT NOT NULL,
    "inboundCode" TEXT NOT NULL,
    "onboardingStep" INTEGER NOT NULL DEFAULT 1,
    "onboardingCompletedAt" TIMESTAMP(3),
    "taxDecisionStatus" TEXT NOT NULL DEFAULT 'nije_dodato',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "business_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "business_pib_key" ON "business"("pib");

-- CreateIndex
CREATE INDEX "business_ownerId_idx" ON "business"("ownerId");

-- CreateIndex
CREATE UNIQUE INDEX "business_inboundSlug_inboundCode_key" ON "business"("inboundSlug", "inboundCode");

-- AddForeignKey
ALTER TABLE "business" ADD CONSTRAINT "business_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
