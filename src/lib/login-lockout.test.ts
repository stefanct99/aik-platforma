import { randomUUID } from "node:crypto";
import { afterAll, describe, expect, it } from "vitest";
import { prisma } from "./prisma";
import { jeZakljucano, resetujNeuspehe, zabeleziNeuspeh } from "./login-lockout";

const koriscenMejlovi: string[] = [];
function noviMejl() {
  const mejl = `test-${randomUUID()}@primer.rs`;
  koriscenMejlovi.push(mejl);
  return mejl;
}

afterAll(async () => {
  await prisma.loginAttempt.deleteMany({ where: { email: { in: koriscenMejlovi } } });
});

describe("zabeleziNeuspeh / jeZakljucano", () => {
  it("nije zaključano pre prvog pokušaja", async () => {
    const mejl = noviMejl();
    expect(await jeZakljucano(mejl)).toBe(false);
  });

  it("ne zaključava posle manje od 5 pokušaja", async () => {
    const mejl = noviMejl();
    for (let i = 0; i < 4; i++) {
      const zakljucalo = await zabeleziNeuspeh(mejl);
      expect(zakljucalo).toBe(false);
    }
    expect(await jeZakljucano(mejl)).toBe(false);
  });

  it("zaključava tačno na 5. uzastopni neuspeh", async () => {
    const mejl = noviMejl();
    for (let i = 0; i < 4; i++) await zabeleziNeuspeh(mejl);
    const zakljucaloPetiPut = await zabeleziNeuspeh(mejl);
    expect(zakljucaloPetiPut).toBe(true);
    expect(await jeZakljucano(mejl)).toBe(true);
  });

  it("radi i za e-mail koji ne odgovara nijednom nalogu (čuva se po e-mailu, ne po korisniku)", async () => {
    const mejl = `ne-postoji-${randomUUID()}@primer.rs`;
    koriscenMejlovi.push(mejl);
    for (let i = 0; i < 5; i++) await zabeleziNeuspeh(mejl);
    expect(await jeZakljucano(mejl)).toBe(true);
  });

  it("resetujNeuspehe otključava nalog (uspešna prijava)", async () => {
    const mejl = noviMejl();
    for (let i = 0; i < 5; i++) await zabeleziNeuspeh(mejl);
    expect(await jeZakljucano(mejl)).toBe(true);

    await resetujNeuspehe(mejl);
    expect(await jeZakljucano(mejl)).toBe(false);
  });

  it("otključava se posle isteka vremena zaključavanja (simulirano ručnim pomeranjem lockedUntil u prošlost)", async () => {
    const mejl = noviMejl();
    for (let i = 0; i < 5; i++) await zabeleziNeuspeh(mejl);
    expect(await jeZakljucano(mejl)).toBe(true);

    // Simulira "15 minuta kasnije" bez pravog čekanja u testu.
    await prisma.loginAttempt.update({
      where: { email: mejl },
      data: { lockedUntil: new Date(Date.now() - 1000) },
    });
    expect(await jeZakljucano(mejl)).toBe(false);
  });

  it("nije osetljivo na veličinu slova u e-mailu", async () => {
    const mejl = noviMejl();
    for (let i = 0; i < 5; i++) await zabeleziNeuspeh(mejl.toUpperCase());
    expect(await jeZakljucano(mejl.toLowerCase())).toBe(true);
  });
});
