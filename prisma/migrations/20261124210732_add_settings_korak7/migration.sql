-- Korak 7: Računi, Obaveštenja, Povezivanje (kalendar token)

-- Business: kalendar token i prekidač. Dodato kao nullable prvo da bi se postojeći redovi mogli
-- popuniti nasumičnim tokenom pre nego što se doda NOT NULL + UNIQUE (business tabela već ima redove).
ALTER TABLE "business" ADD COLUMN "calendarToken" TEXT;
ALTER TABLE "business" ADD COLUMN "calendarSyncEnabled" BOOLEAN NOT NULL DEFAULT true;

UPDATE "business"
SET "calendarToken" = md5(random()::text || clock_timestamp()::text || id)
WHERE "calendarToken" IS NULL;

ALTER TABLE "business" ALTER COLUMN "calendarToken" SET NOT NULL;
CREATE UNIQUE INDEX "business_calendarToken_key" ON "business"("calendarToken");

-- BankAccount
CREATE TABLE "bank_account" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "bank" TEXT NOT NULL,
    "number" TEXT,
    "iban" TEXT,
    "swift" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bank_account_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "bank_account_businessId_idx" ON "bank_account"("businessId");

ALTER TABLE "bank_account" ADD CONSTRAINT "bank_account_businessId_fkey"
    FOREIGN KEY ("businessId") REFERENCES "business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- NotificationSettings
CREATE TABLE "notification_settings" (
    "userId" TEXT NOT NULL,
    "rokoviMail" BOOLEAN NOT NULL DEFAULT true,
    "rokoviPush" BOOLEAN NOT NULL DEFAULT true,
    "kasneMail" BOOLEAN NOT NULL DEFAULT true,
    "kasnePush" BOOLEAN NOT NULL DEFAULT true,
    "mejlMail" BOOLEAN NOT NULL DEFAULT true,
    "mejlPush" BOOLEAN NOT NULL DEFAULT true,
    "primetioMail" BOOLEAN NOT NULL DEFAULT true,
    "primetioPush" BOOLEAN NOT NULL DEFAULT false,
    "propisiMail" BOOLEAN NOT NULL DEFAULT true,
    "propisiPush" BOOLEAN NOT NULL DEFAULT false,
    "nedeljniMail" BOOLEAN NOT NULL DEFAULT false,
    "nedeljniPush" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_settings_pkey" PRIMARY KEY ("userId")
);

ALTER TABLE "notification_settings" ADD CONSTRAINT "notification_settings_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
