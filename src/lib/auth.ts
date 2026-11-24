import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { magicLink } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "./prisma";
import { posaljiRazvojniMejl } from "./mail";
import { jeDozvoljenaAdminPrijava } from "./admin-dev-gate";

// Korak 5, spec 7.1: admin se ne prijavljuje magic linkom NI lozinkom van razvojnog režima (dok ne
// postoji TOTP dvostepena prijava). Ista provera se koristi na oba mesta.
async function jeAdminBlokiranZaPrijavu(email: string): Promise<boolean> {
  if (jeDozvoljenaAdminPrijava()) return false;
  const korisnik = await prisma.user.findUnique({ where: { email } });
  return korisnik?.role === "admin";
}

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
      theme: {
        type: ["svetli", "tamni", "sistem"],
        required: false,
        defaultValue: "sistem",
        // Menja se samo preko src/lib/theme.ts (Podešavanja > Jezik i izgled), ne preko Better Auth-a.
        input: false,
      },
    },
  },
  // Korak 5, spec 7.1: lozinka min 8 karaktera (veliko slovo i broj se proveravaju odvojeno, u
  // src/lib/password-rules.ts, na istom polju i za registraciju i za novu lozinku posle reseta).
  // Heširanje lozinki: Better Auth podrazumevano koristi scrypt (node:crypto), ne Argon2 ni bcrypt kako
  // spec 7.1 traži - namerno nije zamenjeno nečim drugim (zadatak traži da se koristi šta Better Auth
  // nudi), videti izveštaj Koraka 5 za objašnjenje zašto je scrypt i dalje bezbedan izbor.
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    requireEmailVerification: true,
    // Posle uspešnog reseta lozinke, sve OSTALE sesije se odjavljuju (spec 7.1).
    revokeSessionsOnPasswordReset: true,
    resetPasswordTokenExpiresIn: 60 * 60, // 60 minuta (spec 7.1)
    sendResetPassword: async ({ user, url }) => {
      if (await jeAdminBlokiranZaPrijavu(user.email)) return;
      await posaljiRazvojniMejl(user.email, "Link za novu lozinku", url);
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      if (await jeAdminBlokiranZaPrijavu(user.email)) return;
      await posaljiRazvojniMejl(user.email, "Potvrda e-maila", url);
    },
  },
  // Google prijava (Korak 5): dugme postoji u UI-ju, ali je onemogućeno dok GOOGLE_CLIENT_ID i
  // GOOGLE_CLIENT_SECRET ne postoje u .env - vidi src/lib/google-prijava.ts. Čim se dodaju ključevi,
  // ništa drugo u kodu ne treba da se menja.
  ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    ? {
        socialProviders: {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          },
        },
      }
    : {}),
  plugins: [
    magicLink({
      // Spec 7.1: magic link važi 15 minuta i jednokratan je (jednokratnost je ugrađena u Better Auth,
      // token se troši pri prvoj upotrebi).
      expiresIn: 60 * 15,
      // Magic link NIKAD ne pravi nov nalog (spec 6.1: nalog se pravi isključivo kroz registraciju, sa
      // imenom, lozinkom i prihvatanjem uslova). Nepostojeći e-mail na magic link ide na PrijavaE1.
      disableSignUp: true,
      sendMagicLink: async ({ email, url }) => {
        if (await jeAdminBlokiranZaPrijavu(email)) {
          console.warn(
            `[bezbednost] Admin prijava magic linkom odbijena van razvojnog režima za ${email}.`,
          );
          return;
        }
        await posaljiRazvojniMejl(email, "Link za prijavu", url);
      },
    }),
    // Mora biti poslednji dodatak (better-auth preporuka za Next.js server akcije).
    nextCookies(),
  ],
});

export { jeAdminBlokiranZaPrijavu };
