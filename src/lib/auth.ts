import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { magicLink } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "./prisma";
import { sendMagicLinkEmail } from "./magic-link-mail";
import { jeDozvoljenaAdminPrijava } from "./admin-dev-gate";

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  user: {
    additionalFields: {
      role: {
        type: ["user", "admin"],
        required: false,
        defaultValue: "user",
        // Uloga se nikad ne postavlja preko aplikacije, samo ručno (scripts/make-admin.ts).
        input: false,
      },
    },
  },
  plugins: [
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        const korisnik = await prisma.user.findUnique({ where: { email } });
        if (korisnik?.role === "admin" && !jeDozvoljenaAdminPrijava()) {
          console.warn(
            `[bezbednost] Admin prijava magic linkom odbijena van razvojnog režima za ${email}.`,
          );
          return;
        }
        await sendMagicLinkEmail(email, url);
      },
    }),
    // Mora biti poslednji dodatak (better-auth preporuka za Next.js server akcije).
    nextCookies(),
  ],
});
