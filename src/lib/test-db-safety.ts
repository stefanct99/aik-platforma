// Bezbednosna provera (Korak 3): automatski testovi koji diraju bazu NE SMEJU nikad da se povežu na
// pravu razvojnu bazu (aik_dev), ni slučajno. Ovo je čista, direktno testabilna provera, koju
// vitest.setup.ts poziva PRE nego što se bilo šta drugo iz testova pokrene (videti taj fajl). Ime baze
// iz URL-a mora da se završava na "_test", inače se prekida sa jasnom porukom.

export function proveriDaJeTestBaza(databaseUrl: string | undefined): void {
  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL_TEST nije podešen u .env.local. Testovi koji koriste bazu ne mogu da se pokrenu " +
        "bez posebne test baze (ime mora da se završava na _test). Vidi README.",
    );
  }

  let imeBaze: string;
  try {
    imeBaze = new URL(databaseUrl).pathname.replace(/^\//, "");
  } catch {
    throw new Error(`DATABASE_URL_TEST nije ispravan URL: "${databaseUrl}".`);
  }

  if (!imeBaze.endsWith("_test")) {
    throw new Error(
      `Testovi pokušavaju da se povežu na bazu "${imeBaze}", čije ime se ne završava na "_test". ` +
        "Zaustavljeno PRE bilo kakvog upisa, da se slučajno ne dirne razvojna baza (aik_dev).",
    );
  }
}
