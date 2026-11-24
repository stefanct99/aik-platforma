-- CreateTable
CREATE TABLE "login_attempt" (
    "email" TEXT NOT NULL,
    "failedCount" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "login_attempt_pkey" PRIMARY KEY ("email")
);
