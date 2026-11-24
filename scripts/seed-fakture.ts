// Razvojni seed (Korak 8a): pravi 6 klijenata i 8 faktura sa svim statusima kao u okviru Fak1, za
// datog korisnika. Datumi su računati u odnosu na DANAŠNJI dan da se stvarno vide stanja poput "Kasni 6
// dana" (ne fiksni datumi iz frejma). NIKAD se ne pokreće u produkciji.
import { prisma } from "../src/lib/prisma";
import { createInvoiceWithHistory } from "../src/lib/invoices";

function pre(dana: number): Date {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() - dana);
  return d;
}

async function nadjiIliNapraviRacun(businessId: string, currency: string) {
  const postojeci = await prisma.bankAccount.findFirst({ where: { businessId, currency } });
  if (postojeci) return postojeci;
  return prisma.bankAccount.create({
    data: {
      businessId,
      type: currency === "RSD" ? "RSD" : "devizni",
      currency,
      bank: "Erste Bank",
      number: currency === "RSD" ? "1600000012345678" : null,
      iban: currency === "RSD" ? null : "RS35123456789012345678",
      swift: currency === "RSD" ? null : "GIBARS22",
      isDefault: true,
    },
  });
}

async function main() {
  if (process.env.NODE_ENV === "production") {
    console.error("Ova skripta ne sme da se pokreće u produkciji.");
    process.exitCode = 1;
    return;
  }

  const email = process.argv[2];
  if (!email) {
    console.error("Upotreba: npm run seed:fakture -- email@primer.rs");
    process.exitCode = 1;
    return;
  }

  const korisnik = await prisma.user.findUnique({ where: { email } });
  if (!korisnik) {
    console.error(`Korisnik sa mejlom ${email} ne postoji.`);
    process.exitCode = 1;
    return;
  }
  const biznis = await prisma.business.findFirst({ where: { ownerId: korisnik.id } });
  if (!biznis) {
    console.error(`Korisnik ${email} još nema firmu (onboarding nije završen).`);
    process.exitCode = 1;
    return;
  }

  const racunEur = await nadjiIliNapraviRacun(biznis.id, "EUR");
  const racunUsd = await nadjiIliNapraviRacun(biznis.id, "USD");
  const racunRsd = await nadjiIliNapraviRacun(biznis.id, "RSD");

  const klijentiPodaci = [
    {
      name: "Acme Inc.",
      billingEmail: "billing@acme.com",
      country: "SAD",
      address: "100 Market St, Wilmington, DE 19801",
      defaultCurrency: "EUR",
      defaultLang: "sr",
      defaultDueDays: 3,
      defaultAccountId: racunEur.id,
      defaultItemDesc: "Webflow development",
      defaultItemAmount: 90000,
    },
    {
      name: "Northwind Ltd.",
      billingEmail: "accounts@northwind.com",
      country: "UK",
      address: "12 Kings Road, London EC1A 1BB",
      defaultCurrency: "EUR",
      defaultLang: "sr",
      defaultDueDays: 3,
      defaultAccountId: racunEur.id,
      defaultItemDesc: null,
      defaultItemAmount: null,
    },
    {
      name: "Bluebird GmbH",
      billingEmail: "finance@bluebird.de",
      country: "Nemačka",
      address: "Hauptstrasse 5, 10115 Berlin",
      defaultCurrency: "EUR",
      defaultLang: "sr",
      defaultDueDays: 3,
      defaultAccountId: racunEur.id,
      defaultItemDesc: "Održavanje sajta",
      defaultItemAmount: 240000,
    },
    {
      name: "Joam Technologies LLC",
      billingEmail: "billing@joam.io",
      country: "SAD",
      address: "500 Technology Sq, Cambridge, MA 02139",
      defaultCurrency: "USD",
      defaultLang: "sr",
      defaultDueDays: 3,
      defaultAccountId: racunUsd.id,
      defaultItemDesc: "Maintenance",
      defaultItemAmount: 44128,
    },
    {
      name: "Marko Petrović PR",
      billingEmail: "marko@petrovic.rs",
      country: "Srbija",
      address: "Bulevar oslobođenja 10, 21000 Novi Sad",
      defaultCurrency: "RSD",
      defaultLang: "sr",
      defaultDueDays: 10,
      defaultAccountId: racunRsd.id,
      defaultItemDesc: null,
      defaultItemAmount: null,
    },
    {
      name: "Cloudly Inc.",
      billingEmail: "ap@cloudly.com",
      country: "SAD",
      address: "1 Cloud Way, Austin, TX 78701",
      defaultCurrency: "USD",
      defaultLang: "sr",
      defaultDueDays: 3,
      defaultAccountId: racunUsd.id,
      defaultItemDesc: null,
      defaultItemAmount: null,
    },
  ] as const;

  const klijenti: Record<string, { id: string }> = {};
  for (const podaci of klijentiPodaci) {
    const postojeci = await prisma.client.findFirst({ where: { businessId: biznis.id, name: podaci.name } });
    klijenti[podaci.name] = postojeci ?? (await prisma.client.create({ data: { businessId: biznis.id, ...podaci } }));
  }

  // 8 faktura, isti skup statusa kao u frejmu Fak1 - datumi računati od DANAS.
  await createInvoiceWithHistory(biznis.id, {
    clientId: klijenti["Cloudly Inc."].id,
    currency: "USD",
    lang: "sr",
    issueDate: pre(0),
    dueDays: 3,
    accountId: racunUsd.id,
    items: [{ desc: "Cloud consulting", qty: 1, price: 210000 }],
    status: "nacrt",
  });

  await createInvoiceWithHistory(biznis.id, {
    clientId: klijenti["Acme Inc."].id,
    currency: "EUR",
    lang: "sr",
    issueDate: pre(1),
    dueDays: 3,
    accountId: racunEur.id,
    items: [
      { desc: "Webflow development", qty: 1, price: 90000 },
      { desc: "Additional design revisions", qty: 1, price: 30000 },
    ],
    status: "poslata",
    sentAt: pre(1),
  });

  await createInvoiceWithHistory(biznis.id, {
    clientId: klijenti["Northwind Ltd."].id,
    currency: "EUR",
    lang: "sr",
    issueDate: pre(9),
    dueDays: 3,
    accountId: racunEur.id,
    items: [{ desc: "Maintenance", qty: 1, price: 85000 }],
    status: "poslata",
    sentAt: pre(9),
  }); // rok = pre(6) -> danas je 6 dana posle roka ("Kasni 6 dana")

  await createInvoiceWithHistory(biznis.id, {
    clientId: klijenti["Bluebird GmbH"].id,
    currency: "EUR",
    lang: "sr",
    issueDate: pre(45),
    dueDays: 3,
    accountId: racunEur.id,
    items: [{ desc: "Održavanje sajta", qty: 1, price: 240000 }],
    status: "placena",
    sentAt: pre(45),
    paidDate: pre(20),
  });

  await createInvoiceWithHistory(biznis.id, {
    clientId: klijenti["Marko Petrović PR"].id,
    currency: "RSD",
    lang: "sr",
    issueDate: pre(60),
    dueDays: 10,
    accountId: racunRsd.id,
    items: [
      { desc: "Održavanje sajta", qty: 1, price: 6000000 },
      { desc: "Izrada dodatne stranice", qty: 1, price: 2500000 },
    ],
    status: "placena",
    sentAt: pre(60),
    paidDate: pre(15),
  });

  await createInvoiceWithHistory(biznis.id, {
    clientId: klijenti["Joam Technologies LLC"].id,
    currency: "USD",
    lang: "en",
    issueDate: pre(75),
    dueDays: 3,
    accountId: racunUsd.id,
    items: [{ desc: "Maintenance", qty: 1, price: 44128 }],
    status: "placena",
    sentAt: pre(75),
    paidDate: pre(10),
  });

  await createInvoiceWithHistory(biznis.id, {
    clientId: klijenti["Acme Inc."].id,
    currency: "EUR",
    lang: "sr",
    issueDate: pre(90),
    dueDays: 3,
    accountId: racunEur.id,
    items: [{ desc: "Webflow development", qty: 1, price: 120000 }],
    status: "placena",
    sentAt: pre(90),
    paidDate: pre(25),
  });

  await createInvoiceWithHistory(biznis.id, {
    clientId: klijenti["Bluebird GmbH"].id,
    currency: "EUR",
    lang: "sr",
    issueDate: pre(100),
    dueDays: 3,
    accountId: racunEur.id,
    items: [{ desc: "Održavanje sajta", qty: 1, price: 240000 }],
    status: "stornirana",
    sentAt: pre(100),
    voidedAt: pre(5),
  });

  console.log(`Gotovo: 6 klijenata i 8 faktura napravljeno za ${email}.`);
}

main()
  .catch((greska) => {
    console.error(greska);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
