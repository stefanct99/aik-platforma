import { describe, expect, it } from "vitest";
import { composeInboundAddress, generateInboundCode, slugifyBusinessName } from "./inbound-mail";

describe("slugifyBusinessName", () => {
  it("transliteruje srpsku latinicu i uklanja razmake/znakove", () => {
    expect(slugifyBusinessName("Stephortless PR")).toBe("stephortlesspr");
    expect(slugifyBusinessName("Đurđević Šoštarić d.o.o.")).toBe("djurdjevicsostaricdoo");
  });

  it("nikad ne vraća prazan string", () => {
    expect(slugifyBusinessName("!!!")).toBe("firma");
    expect(slugifyBusinessName("")).toBe("firma");
  });
});

describe("generateInboundCode", () => {
  it("vraća kod tražene dužine, samo mala slova i cifre", () => {
    const kod = generateInboundCode(4);
    expect(kod).toHaveLength(4);
    expect(kod).toMatch(/^[a-z0-9]{4}$/);
  });
});

describe("composeInboundAddress", () => {
  it("spaja slug, kod i domen", () => {
    expect(composeInboundAddress("stephortless", "4k7q")).toBe(
      "stephortless-4k7q@prijem.tvojaiknjigovodja.rs",
    );
  });
});
