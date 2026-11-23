import { describe, expect, it } from "vitest";
import { proveriDaJeTestBaza } from "./test-db-safety";

describe("proveriDaJeTestBaza", () => {
  it("prolazi kad ime baze završava na _test", () => {
    expect(() => proveriDaJeTestBaza("postgresql://stefan.ct@localhost:5432/aik_test")).not.toThrow();
  });

  it("baca grešku kad URL nije podešen", () => {
    expect(() => proveriDaJeTestBaza(undefined)).toThrow(/DATABASE_URL_TEST nije podešen/);
  });

  it("baca grešku kad ime baze NE završava na _test (npr. prava razvojna baza)", () => {
    expect(() => proveriDaJeTestBaza("postgresql://stefan.ct@localhost:5432/aik_dev")).toThrow(
      /aik_dev.*ne završava na "_test"/,
    );
  });

  it("baca grešku kad URL nije ispravan", () => {
    expect(() => proveriDaJeTestBaza("nije-url")).toThrow(/nije ispravan URL/);
  });
});
