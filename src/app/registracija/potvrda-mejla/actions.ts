"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function posaljiPotvrduPonovoAction(email: string): Promise<void> {
  await auth.api.sendVerificationEmail({
    body: { email, callbackURL: "/registracija/potvrda-mejla/gotovo" },
    headers: await headers(),
    asResponse: false,
  });
}
