import { prisma } from "../src/lib/prisma";

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("Upotreba: npm run make-admin -- email@primer.rs");
    process.exitCode = 1;
    return;
  }

  const korisnik = await prisma.user.findUnique({ where: { email } });
  if (!korisnik) {
    console.error(
      `Korisnik sa mejlom ${email} ne postoji. Mora se prvo bar jednom prijaviti (magic link) da bi nalog bio napravljen.`,
    );
    process.exitCode = 1;
    return;
  }

  await prisma.user.update({ where: { email }, data: { role: "admin" } });
  console.log(`Korisnik ${email} je sada admin.`);
}

main()
  .catch((greska) => {
    console.error(greska);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
