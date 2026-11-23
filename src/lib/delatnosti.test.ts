import { describe, expect, it } from "vitest";
import { DELATNOSTI, findDelatnost, isValidDelatnostCode } from "./delatnosti";

describe("delatnosti", () => {
  it("ima tačno spisak iz prototipa (7 šifara)", () => {
    expect(DELATNOSTI).toHaveLength(7);
  });

  it("findDelatnost pronalazi naziv po šifri", () => {
    expect(findDelatnost("6201")).toEqual({ code: "6201", name: "Računarsko programiranje" });
    expect(findDelatnost("0000")).toBeNull();
  });

  it("isValidDelatnostCode prihvata samo šifre iz spiska", () => {
    expect(isValidDelatnostCode("6201")).toBe(true);
    expect(isValidDelatnostCode("9999")).toBe(false);
  });
});
