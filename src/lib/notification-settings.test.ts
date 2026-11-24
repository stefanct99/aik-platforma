import { randomUUID } from "node:crypto";
import { afterAll, describe, expect, it } from "vitest";
import { prisma } from "./prisma";
import { getNotificationSettings, setNotification } from "./notification-settings";

const napravljeniKorisnici: string[] = [];

async function napraviKorisnika() {
  const korisnik = await prisma.user.create({
    data: { id: randomUUID(), name: "Test", email: `test-${randomUUID()}@primer.rs` },
  });
  napravljeniKorisnici.push(korisnik.id);
  return korisnik;
}

afterAll(async () => {
  await prisma.notificationSettings.deleteMany({ where: { userId: { in: napravljeniKorisnici } } });
  await prisma.user.deleteMany({ where: { id: { in: napravljeniKorisnici } } });
});

describe("getNotificationSettings", () => {
  it("podrazumevane vrednosti su tačno one iz frejma Pd4", async () => {
    const korisnik = await napraviKorisnika();
    const podesavanja = await getNotificationSettings(korisnik.id);

    expect(podesavanja.rokoviMail).toBe(true);
    expect(podesavanja.rokoviPush).toBe(true);
    expect(podesavanja.kasneMail).toBe(true);
    expect(podesavanja.kasnePush).toBe(true);
    expect(podesavanja.mejlMail).toBe(true);
    expect(podesavanja.mejlPush).toBe(true);
    expect(podesavanja.primetioMail).toBe(true);
    expect(podesavanja.primetioPush).toBe(false);
    expect(podesavanja.propisiMail).toBe(true);
    expect(podesavanja.propisiPush).toBe(false);
    expect(podesavanja.nedeljniMail).toBe(false);
    expect(podesavanja.nedeljniPush).toBe(false);
  });

  it("drugi poziv vraća isti red, ne pravi duplikat", async () => {
    const korisnik = await napraviKorisnika();
    await getNotificationSettings(korisnik.id);
    await getNotificationSettings(korisnik.id);

    const svi = await prisma.notificationSettings.findMany({ where: { userId: korisnik.id } });
    expect(svi.length).toBe(1);
  });
});

describe("setNotification", () => {
  it("menja tačno jedno polje, ostala ostaju nepromenjena", async () => {
    const korisnik = await napraviKorisnika();
    await getNotificationSettings(korisnik.id);

    await setNotification(korisnik.id, "nedeljni", "mail", true);

    const posle = await getNotificationSettings(korisnik.id);
    expect(posle.nedeljniMail).toBe(true);
    expect(posle.rokoviMail).toBe(true);
  });

  it("izolacija: izmena korisnika A ne utiče na podrazumevane vrednosti korisnika B", async () => {
    const korisnikA = await napraviKorisnika();
    const korisnikB = await napraviKorisnika();

    await setNotification(korisnikA.id, "rokovi", "mail", false);

    const podesavanjaB = await getNotificationSettings(korisnikB.id);
    expect(podesavanjaB.rokoviMail).toBe(true);
  });
});
