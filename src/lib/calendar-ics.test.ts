import { describe, expect, it } from "vitest";
import { generisiPrazanIcs } from "./calendar-ics";

describe("generisiPrazanIcs", () => {
  it("pravi ispravan ICS zaglavlje bez događaja", () => {
    const ics = generisiPrazanIcs("Test Firma - tvoj AI knjigovođa");
    expect(ics.startsWith("BEGIN:VCALENDAR\r\n")).toBe(true);
    expect(ics.trim().endsWith("END:VCALENDAR")).toBe(true);
    expect(ics).toContain("VERSION:2.0");
    expect(ics).toContain("X-WR-CALNAME:Test Firma - tvoj AI knjigovođa");
    expect(ics).not.toContain("BEGIN:VEVENT");
  });

  it("izbegava zarez/tačka-zarez u nazivu da ne pokvari ICS format", () => {
    const ics = generisiPrazanIcs("Firma; d.o.o., ogranak");
    expect(ics).toContain("X-WR-CALNAME:Firma\\; d.o.o.\\, ogranak");
  });
});
