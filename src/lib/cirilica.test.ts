import { describe, expect, it } from "vitest";
import { cirilicaULatinicu } from "./cirilica";

describe("cirilicaULatinicu", () => {
  it("transliteruje naslov sektora pisan velikim slovima (digrafi VELIKI)", () => {
    expect(cirilicaULatinicu("ПОЉОПРИВРЕДА, ШУМАРСТВО И РИБАРСТВО")).toBe(
      "POLJOPRIVREDA, ŠUMARSTVO I RIBARSTVO",
    );
  });

  it("transliteruje običnu rečenicu (digrafi malim slovima)", () => {
    expect(
      cirilicaULatinicu("Биљна и сточарска производња, лов и повезане услужне делатности"),
    ).toBe("Biljna i stočarska proizvodnja, lov i povezane uslužne delatnosti");
  });

  it("transliteruje rečenicu koja počinje digrafom (sintetički primer, ne iz KD spiska)", () => {
    expect(cirilicaULatinicu("Љуљашка је играчка.")).toBe("Ljuljaška je igračka.");
  });

  it("ne dira cifre i znake interpunkcije", () => {
    expect(cirilicaULatinicu("62.10")).toBe("62.10");
    expect(cirilicaULatinicu("A, B (C)")).toBe("A, B (C)");
  });
});
