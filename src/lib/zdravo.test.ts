import { describe, expect, it } from "vitest";
import { pozdrav } from "./zdravo";

describe("pozdrav", () => {
  it("vraća pozdrav sa prosleđenim imenom", () => {
    expect(pozdrav("Stefan")).toBe("Zdravo, Stefan.");
  });
});
