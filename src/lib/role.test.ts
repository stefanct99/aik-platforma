import { describe, expect, it } from "vitest";
import { isValidRole } from "./role";

describe("isValidRole", () => {
  it("prihvata samo user i admin", () => {
    expect(isValidRole("user")).toBe(true);
    expect(isValidRole("admin")).toBe(true);
  });

  it("odbija bilo koju treću vrednost", () => {
    expect(isValidRole("superadmin")).toBe(false);
    expect(isValidRole("")).toBe(false);
    expect(isValidRole("Admin")).toBe(false);
  });
});
