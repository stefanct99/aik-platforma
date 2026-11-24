// Obaveštenja (Korak 7, spec 7.13): po jedan red po korisniku (NotificationSettings), podrazumevane
// vrednosti tačno iz frejma Pd4. Stvarno slanje mejla i push obaveštenja se NE pravi (nema mail
// servisa) - ovo samo čuva izbor korisnika, da bude spremno kad ti servisi postoje.

import { prisma } from "./prisma";
import { VRSTE_OBAVESTENJA, type VrstaObavestenja, type Kanal } from "./notification-settings-types";

export { VRSTE_OBAVESTENJA, type VrstaObavestenja, type Kanal };

function poljeZaKljuc(kljuc: VrstaObavestenja, kanal: Kanal): string {
  return `${kljuc}${kanal === "mail" ? "Mail" : "Push"}`;
}

// Kreira red sa podrazumevanim vrednostima pri prvom čitanju (korisnik ga nikad sam ne pravi).
export async function getNotificationSettings(userId: string) {
  const postojece = await prisma.notificationSettings.findUnique({ where: { userId } });
  if (postojece) return postojece;
  return prisma.notificationSettings.create({ data: { userId } });
}

export async function setNotification(
  userId: string,
  kljuc: VrstaObavestenja,
  kanal: Kanal,
  vrednost: boolean,
) {
  await getNotificationSettings(userId); // osigurava da red postoji pre update-a
  return prisma.notificationSettings.update({
    where: { userId },
    data: { [poljeZaKljuc(kljuc, kanal)]: vrednost },
  });
}
