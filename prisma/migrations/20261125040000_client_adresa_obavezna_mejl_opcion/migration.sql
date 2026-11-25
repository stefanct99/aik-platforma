-- Korak 8b ispravka (2026-11-25, odluka vlasnika): kod klijenta obavezni su samo naziv i adresa.
-- Mejl za fakture postaje opcion. "address" je u ovoj bazi oduvek jedno kombinovano tekstualno polje
-- (ulica, mesto, poštanski broj u istom unosu - frejm Fak4 nema odvojena potpolja), pa "obavezna adresa"
-- znači samo da ovo jedno polje ne sme da bude prazno.
--
-- Bez backfill-a: nijedan postojeći red nema prazno/NULL "address" niti prazan "billingEmail" (provereno
-- pre migracije), pa je ovo bezbedno u jednom koraku u oba smera.
ALTER TABLE "client" ALTER COLUMN "billingEmail" DROP NOT NULL;
ALTER TABLE "client" ALTER COLUMN "address" SET NOT NULL;
