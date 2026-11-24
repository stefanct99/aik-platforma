// Izvoz podataka (Korak 7, spec 6.12 i 7.13): stvaran izvoz svega što korisnik TRENUTNO ima (profil
// firme, računi, podešavanja obaveštenja, izgled/jezik) u jednom ZIP paketu. Fakture, knjiga prihoda i
// dokumenta ne postoje još (budući koraci) - paket se tada proširuje, spec 6.12 sam to predviđa
// ("Knjiga prihoda ima i zaseban izvoz"). Priprema je ovde trenutna (mali JSON podaci), zato je izvoz
// sinhron direktan preuzimanje, ne "stiže mejl kad bude spreman" kako spec opisuje za veće pakete sa
// fakturama - to dolazi kad paket stvarno postane veliki.

import { prisma } from "./prisma";
import { getBusinessForUser } from "./business";
import { getAccountsForUser } from "./bank-accounts";
import { getNotificationSettings } from "./notification-settings";
import { createZip } from "./zip";

export async function napraviIzvozPodataka(userId: string): Promise<Buffer> {
  const korisnik = await prisma.user.findUnique({ where: { id: userId } });
  const biznis = await getBusinessForUser(userId);
  const racuni = await getAccountsForUser(userId);
  const obavestenja = await getNotificationSettings(userId);

  const profil = {
    nalog: {
      ime: korisnik?.name,
      email: korisnik?.email,
      izgled: korisnik?.theme,
      nalogNapravljen: korisnik?.createdAt,
    },
    firma: biznis
      ? {
          naziv: biznis.name,
          imeVlasnika: biznis.ownerName,
          pib: biznis.pib,
          maticniBroj: biznis.mb,
          sifraDelatnosti: `${biznis.delatnostCode} ${biznis.delatnostName}`,
          datumRegistracije: biznis.regDate,
          adresa: { ulica: biznis.street, mesto: biznis.city, postanskiBroj: biznis.zip },
          kontaktMejl: biznis.contactEmail,
          telefon: biznis.phone,
          adresaZaPrijemMejlovaBanke: `${biznis.inboundSlug}-${biznis.inboundCode}`,
        }
      : null,
  };

  const racuniZaIzvoz = racuni.map((racun) => ({
    tip: racun.type,
    valuta: racun.currency,
    banka: racun.bank,
    brojRacuna: racun.number,
    iban: racun.iban,
    swift: racun.swift,
    podrazumevani: racun.isDefault,
  }));

  const obavestenjaZaIzvoz = {
    rokoviZaPorez: { mejl: obavestenja.rokoviMail, push: obavestenja.rokoviPush },
    kasneFakture: { mejl: obavestenja.kasneMail, push: obavestenja.kasnePush },
    noviMejlBanke: { mejl: obavestenja.mejlMail, push: obavestenja.mejlPush },
    aiJeNestoPrimetio: { mejl: obavestenja.primetioMail, push: obavestenja.primetioPush },
    promenaPropisa: { mejl: obavestenja.propisiMail, push: obavestenja.propisiPush },
    nedeljniPregled: { mejl: obavestenja.nedeljniMail, push: obavestenja.nedeljniPush },
  };

  return createZip([
    { ime: "profil.json", sadrzaj: Buffer.from(JSON.stringify(profil, null, 2)) },
    { ime: "racuni.json", sadrzaj: Buffer.from(JSON.stringify(racuniZaIzvoz, null, 2)) },
    { ime: "obavestenja.json", sadrzaj: Buffer.from(JSON.stringify(obavestenjaZaIzvoz, null, 2)) },
    {
      ime: "procitaj-me.txt",
      sadrzaj: Buffer.from(
        "Ovo je izvoz podataka sa tvoj AI knjigovođa platforme.\r\n" +
          "Sadrži podatke o firmi, računima i podešavanjima obaveštenja.\r\n" +
          "Fakture, knjiga prihoda i dokumenta će biti deo ovog izvoza u budućoj verziji.\r\n",
      ),
    },
  ]);
}
