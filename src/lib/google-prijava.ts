// Korak 5: dugme "Nastavi sa Google nalogom" postoji u UI-ju, ali je onemogućeno dok Google OAuth nije
// podešen (GOOGLE_CLIENT_ID i GOOGLE_CLIENT_SECRET u .env). Ista provera koju koristi i src/lib/auth.ts
// da se odluči da li se socialProviders.google uopšte registruje.
export function jeGooglePrijavaPodesena(): boolean {
  return !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET;
}
