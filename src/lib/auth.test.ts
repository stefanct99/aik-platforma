import { randomUUID } from "node:crypto";
import { afterAll, describe, expect, it } from "vitest";
import { APIError } from "better-auth";
import { auth } from "./auth";
import { prisma } from "./prisma";
import { jeZakljucano, zabeleziNeuspeh } from "./login-lockout";

// Integracioni testovi Koraka 5 (prijava, registracija, potvrda e-maila, zaboravljena lozinka): pozivaju
// se auth.api.* metode direktno (bez prave HTTP ture), isto kao server akcije koje ih koriste. Rade nad
// aik_test (videti vitest.setup.ts i src/lib/test-db-safety.ts), nikad nad aik_dev. Svaki test pravi
// sopstvenog korisnika sa nasumičnim mejlom, i sve što napravi briše na kraju (afterAll).

const praznaZaglavlja = () => new Headers();

const napravljeniKorisnici: string[] = [];

function nasumicniEmail() {
  const email = `test-${randomUUID()}@primer.rs`;
  napravljeniKorisnici.push(email);
  return email;
}

afterAll(async () => {
  await prisma.loginAttempt.deleteMany({ where: { email: { in: napravljeniKorisnici } } });
  await prisma.session.deleteMany({ where: { user: { email: { in: napravljeniKorisnici } } } });
  await prisma.account.deleteMany({ where: { user: { email: { in: napravljeniKorisnici } } } });
  await prisma.user.deleteMany({ where: { email: { in: napravljeniKorisnici } } });
});

async function registrujKorisnika(email: string, lozinka = "DobraLozinka1") {
  await auth.api.signUpEmail({
    body: { name: "Test Korisnik", email, password: lozinka },
    headers: praznaZaglavlja(),
    asResponse: false,
  });
}

async function potvrdiEmail(email: string) {
  await prisma.user.update({ where: { email }, data: { emailVerified: true } });
}

describe("registracija", () => {
  it("pravi neaktivan (nepotvrđen) nalog", async () => {
    const email = nasumicniEmail();
    await registrujKorisnika(email);

    const korisnik = await prisma.user.findUnique({ where: { email } });
    expect(korisnik).not.toBeNull();
    expect(korisnik?.emailVerified).toBe(false);
  });

  it("odbija lozinku kraću od 8 karaktera", async () => {
    const email = nasumicniEmail();
    await expect(registrujKorisnika(email, "Kratka1")).rejects.toThrow(APIError);
  });

  it("Better Auth sam po sebi ne baca grešku za duplikat (zato registrujSeAction radi sopstvenu proveru pre poziva)", async () => {
    // Better Auth podrazumevano maskira duplikat mejla generičkim uspehom (privatnost: ne otkriva da
    // mejl postoji). Spec 7.1 traži TAČNO određenu poruku za ovaj slučaj (R1), pa src/app/registracija/
    // actions.ts radi sopstvenu prisma.user.findUnique proveru PRE poziva signUpEmail - ovaj test
    // dokumentuje zašto je ta provera neophodna (signUpEmail sam po sebi ne bi odbio duplikat).
    const email = nasumicniEmail();
    await registrujKorisnika(email);

    await expect(registrujKorisnika(email, "DrugaLozinka2")).resolves.not.toThrow();
  });
});

describe("prijava", () => {
  it("odbija prijavu nepotvrđenog naloga (EMAIL_NOT_VERIFIED)", async () => {
    const email = nasumicniEmail();
    await registrujKorisnika(email);

    await expect(
      auth.api.signInEmail({
        body: { email, password: "DobraLozinka1" },
        headers: praznaZaglavlja(),
        asResponse: false,
      }),
    ).rejects.toMatchObject({ body: { code: "EMAIL_NOT_VERIFIED" } });
  });

  it("uspeva sa ispravnom lozinkom na potvrđenom nalogu", async () => {
    const email = nasumicniEmail();
    await registrujKorisnika(email);
    await potvrdiEmail(email);

    const rezultat = await auth.api.signInEmail({
      body: { email, password: "DobraLozinka1" },
      headers: praznaZaglavlja(),
      asResponse: false,
    });
    expect(rezultat.user.email).toBe(email);
  });

  it("odbija pogrešnu lozinku", async () => {
    const email = nasumicniEmail();
    await registrujKorisnika(email);
    await potvrdiEmail(email);

    await expect(
      auth.api.signInEmail({
        body: { email, password: "PogresnaLozinka1" },
        headers: praznaZaglavlja(),
        asResponse: false,
      }),
    ).rejects.toMatchObject({ body: { code: "INVALID_EMAIL_OR_PASSWORD" } });
  });

  it("vraća istu grešku za nepostojeći mejl kao za pogrešnu lozinku", async () => {
    const email = nasumicniEmail();
    await registrujKorisnika(email);
    await potvrdiEmail(email);

    let greskaPogresnaLozinka: unknown;
    try {
      await auth.api.signInEmail({
        body: { email, password: "PogresnaLozinka1" },
        headers: praznaZaglavlja(),
        asResponse: false,
      });
    } catch (e) {
      greskaPogresnaLozinka = e;
    }

    let greskaNepostojeciMejl: unknown;
    try {
      await auth.api.signInEmail({
        body: { email: `ne-postoji-${randomUUID()}@primer.rs`, password: "PogresnaLozinka1" },
        headers: praznaZaglavlja(),
        asResponse: false,
      });
    } catch (e) {
      greskaNepostojeciMejl = e;
    }

    expect(greskaPogresnaLozinka).toBeInstanceOf(APIError);
    expect(greskaNepostojeciMejl).toBeInstanceOf(APIError);
    expect((greskaPogresnaLozinka as APIError).body?.code).toBe(
      (greskaNepostojeciMejl as APIError).body?.code,
    );
  });
});

describe("zaključavanje posle neuspešnih pokušaja (integracija sa prijavom)", () => {
  it("nalog se zaključava tek posle 5 neuspelih pokušaja prijave", async () => {
    const email = nasumicniEmail();
    await registrujKorisnika(email);
    await potvrdiEmail(email);

    for (let i = 0; i < 4; i++) {
      await expect(
        auth.api.signInEmail({
          body: { email, password: "PogresnaLozinka1" },
          headers: praznaZaglavlja(),
          asResponse: false,
        }),
      ).rejects.toThrow(APIError);
      await zabeleziNeuspeh(email);
    }
    expect(await jeZakljucano(email)).toBe(false);

    await zabeleziNeuspeh(email);
    expect(await jeZakljucano(email)).toBe(true);
  });
});

describe("magic link", () => {
  // Bez callbackURL: magicLinkVerify tada vraća JSON (sesiju/korisnika) umesto da baci redirekciju -
  // isti kod koji se u aplikaciji stvarno koristi (callbackURL u pravom linku), samo što ovde čitamo
  // rezultat direktno umesto kroz HTTP redirekciju, radi lakšeg testiranja.
  async function posaljiIUzmiToken(email: string) {
    await auth.api.signInMagicLink({
      body: { email, callbackURL: "/pocetna" },
      headers: praznaZaglavlja(),
      asResponse: false,
    });
    const verifikacija = await prisma.verification.findFirst({
      where: { identifier: { startsWith: "magic-link:" } },
      orderBy: { createdAt: "desc" },
    });
    if (!verifikacija) throw new Error("Magic link token nije sačuvan u bazi");
    return verifikacija.identifier.replace("magic-link:", "");
  }

  it("prijavljuje korisnika sa ispravnim linkom", async () => {
    const email = nasumicniEmail();
    await registrujKorisnika(email);
    await potvrdiEmail(email);

    const token = await posaljiIUzmiToken(email);
    const rezultat = await auth.api.magicLinkVerify({
      query: { token },
      headers: praznaZaglavlja(),
      asResponse: false,
    });
    expect(rezultat?.user.email).toBe(email);
  });

  it("link je jednokratan, druga upotreba ne uspeva", async () => {
    const email = nasumicniEmail();
    await registrujKorisnika(email);
    await potvrdiEmail(email);

    const token = await posaljiIUzmiToken(email);
    await auth.api.magicLinkVerify({
      query: { token },
      headers: praznaZaglavlja(),
      asResponse: false,
    });

    await expect(
      auth.api.magicLinkVerify({
        query: { token },
        headers: praznaZaglavlja(),
        asResponse: false,
      }),
    ).rejects.toThrow();
  });

  it("ne pravi nov nalog za nepostojeći mejl (disableSignUp)", async () => {
    const email = `ne-postoji-${randomUUID()}@primer.rs`;
    await auth.api.signInMagicLink({
      body: { email, callbackURL: "/pocetna" },
      headers: praznaZaglavlja(),
      asResponse: false,
    });
    const verifikacija = await prisma.verification.findFirst({
      where: { identifier: { startsWith: "magic-link:" } },
      orderBy: { createdAt: "desc" },
    });
    const token = verifikacija!.identifier.replace("magic-link:", "");

    await expect(
      auth.api.magicLinkVerify({
        query: { token },
        headers: praznaZaglavlja(),
        asResponse: false,
      }),
    ).rejects.toThrow();

    const korisnik = await prisma.user.findUnique({ where: { email } });
    expect(korisnik).toBeNull();
  });
});

describe("reset lozinke", () => {
  async function zatraziIUzmiToken(email: string) {
    await auth.api.requestPasswordReset({
      body: { email, redirectTo: "/zaboravljena-lozinka/nova-lozinka" },
      headers: praznaZaglavlja(),
      asResponse: false,
    });
    const verifikacija = await prisma.verification.findFirst({
      where: { identifier: { startsWith: "reset-password:" } },
      orderBy: { createdAt: "desc" },
    });
    if (!verifikacija) throw new Error("Reset token nije sačuvan u bazi");
    return verifikacija.identifier.replace("reset-password:", "");
  }

  it("menja lozinku i nova lozinka odmah radi za prijavu", async () => {
    const email = nasumicniEmail();
    await registrujKorisnika(email);
    await potvrdiEmail(email);

    const token = await zatraziIUzmiToken(email);
    await auth.api.resetPassword({
      body: { newPassword: "NovaLozinka2", token },
      headers: praznaZaglavlja(),
      asResponse: false,
    });

    const rezultat = await auth.api.signInEmail({
      body: { email, password: "NovaLozinka2" },
      headers: praznaZaglavlja(),
      asResponse: false,
    });
    expect(rezultat.user.email).toBe(email);
  });

  it("token je jednokratan, druga upotreba ne uspeva", async () => {
    const email = nasumicniEmail();
    await registrujKorisnika(email);
    await potvrdiEmail(email);

    const token = await zatraziIUzmiToken(email);
    await auth.api.resetPassword({
      body: { newPassword: "NovaLozinka2", token },
      headers: praznaZaglavlja(),
      asResponse: false,
    });

    await expect(
      auth.api.resetPassword({
        body: { newPassword: "TrecaLozinka3", token },
        headers: praznaZaglavlja(),
        asResponse: false,
      }),
    ).rejects.toThrow();
  });

  it("odjavljuje ostale sesije posle uspešnog reseta (revokeSessionsOnPasswordReset)", async () => {
    const email = nasumicniEmail();
    await registrujKorisnika(email);
    await potvrdiEmail(email);

    const prijava = await auth.api.signInEmail({
      body: { email, password: "DobraLozinka1" },
      headers: praznaZaglavlja(),
      asResponse: false,
    });
    const korisnik = await prisma.user.findUnique({ where: { email } });
    const sesijePre = await prisma.session.count({ where: { userId: korisnik!.id } });
    expect(sesijePre).toBeGreaterThan(0);
    expect(prijava.token).toBeTruthy();

    const token = await zatraziIUzmiToken(email);
    await auth.api.resetPassword({
      body: { newPassword: "NovaLozinka2", token },
      headers: praznaZaglavlja(),
      asResponse: false,
    });

    const sesijePosle = await prisma.session.count({ where: { userId: korisnik!.id } });
    expect(sesijePosle).toBe(0);
  });
});

describe("promena lozinke (Korak 7, Bezbednost i nalog)", () => {
  // Isti obrazac kao auth.api.signInEmail iznad, samo preko stvarnog Set-Cookie kolačića (kao što bi
  // pregledač uradio) da bi se pozvao changePassword "kao" prijavljeni korisnik, bez pogađanja kako je
  // Better Auth kolačić potpisan.
  async function prijaviSeIUzmiKolacic(email: string, lozinka: string) {
    const odgovor = await auth.api.signInEmail({
      body: { email, password: lozinka },
      headers: praznaZaglavlja(),
      asResponse: true,
    });
    const setCookie = odgovor.headers.get("set-cookie");
    if (!setCookie) throw new Error("Prijava nije vratila kolačić sesije");
    const kolacic = setCookie.split(";")[0];
    return new Headers({ Cookie: kolacic });
  }

  it("menja lozinku sa ispravnom trenutnom lozinkom", async () => {
    const email = nasumicniEmail();
    await registrujKorisnika(email);
    await potvrdiEmail(email);
    const zaglavlja = await prijaviSeIUzmiKolacic(email, "DobraLozinka1");

    await auth.api.changePassword({
      body: { currentPassword: "DobraLozinka1", newPassword: "NovaLozinka2", revokeOtherSessions: false },
      headers: zaglavlja,
      asResponse: false,
    });

    const rezultat = await auth.api.signInEmail({
      body: { email, password: "NovaLozinka2" },
      headers: praznaZaglavlja(),
      asResponse: false,
    });
    expect(rezultat.user.email).toBe(email);
  });

  it("odbija pogrešnu trenutnu lozinku (INVALID_PASSWORD)", async () => {
    const email = nasumicniEmail();
    await registrujKorisnika(email);
    await potvrdiEmail(email);
    const zaglavlja = await prijaviSeIUzmiKolacic(email, "DobraLozinka1");

    await expect(
      auth.api.changePassword({
        body: { currentPassword: "PogresnaLozinka1", newPassword: "NovaLozinka2", revokeOtherSessions: false },
        headers: zaglavlja,
        asResponse: false,
      }),
    ).rejects.toMatchObject({ body: { code: "INVALID_PASSWORD" } });
  });

  it("sa revokeOtherSessions gasi sve OSTALE sesije, ali ne i trenutnu", async () => {
    const email = nasumicniEmail();
    await registrujKorisnika(email);
    await potvrdiEmail(email);
    const korisnik = await prisma.user.findUnique({ where: { email } });

    // Dve "prijave" = dva uređaja (dve sesije istog korisnika).
    const zaglavljaUredjaj1 = await prijaviSeIUzmiKolacic(email, "DobraLozinka1");
    await prijaviSeIUzmiKolacic(email, "DobraLozinka1"); // uređaj 2, kolačić nam ovde ne treba

    const sesijePre = await prisma.session.count({ where: { userId: korisnik!.id } });
    expect(sesijePre).toBeGreaterThanOrEqual(2);

    const odgovor = await auth.api.changePassword({
      body: { currentPassword: "DobraLozinka1", newPassword: "NovaLozinka2", revokeOtherSessions: true },
      headers: zaglavljaUredjaj1,
      asResponse: true,
    });

    const sesijePosle = await prisma.session.findMany({ where: { userId: korisnik!.id } });
    expect(sesijePosle.length).toBe(1);

    // changePassword sa revokeOtherSessions pravi NOVU sesiju (i nov kolačić) za uređaj sa kog je
    // lozinka promenjena - stari kolačić uređaja 1 više ne radi, ali nalog ostaje prijavljen na njemu
    // preko ovog novog kolačića (to i jeste svrha "ostajemo prijavljeni samo na ovom uređaju").
    const novKolacic = odgovor.headers.get("set-cookie")?.split(";")[0];
    expect(novKolacic).toBeTruthy();
    const provera = await auth.api.getSession({ headers: new Headers({ Cookie: novKolacic! }) });
    expect(provera?.user.email).toBe(email);
  });
});
