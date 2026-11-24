-- Jezik i format datuma (Korak 7, Pd7): konstantan default, nema potrebe za backfill korak-po-korak
-- (nije unique/random kao calendarToken).
ALTER TABLE "user" ADD COLUMN "jezik" TEXT NOT NULL DEFAULT 'sr-lat';
ALTER TABLE "user" ADD COLUMN "formatDatuma" TEXT NOT NULL DEFAULT 'dmy';
