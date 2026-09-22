import { afterEach, describe, expect, it, vi } from "vitest";
import { generateUuid, isValidUuid } from "../uuid";

// Version 4 (nibble `4` en 3ᵉ groupe) et variante RFC 4122 (`8|9|a|b` en tête
// du 4ᵉ groupe) : c'est exactement ce que la colonne `UUID` de Postgres attend.
const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("isValidUuid", () => {
  it("accepte un UUID de la base", () => {
    expect(isValidUuid("3ece233a-354c-4765-83e5-4385f749cccc")).toBe(true);
    expect(isValidUuid(generateUuid())).toBe(true);
  });

  it("refuse la valeur de repli des pages, qui ferait rejeter l'insertion en 22P02", () => {
    expect(isValidUuid("default_child")).toBe(false);
  });

  it("refuse les valeurs non textuelles et les identifiants tronqués", () => {
    expect(isValidUuid(undefined)).toBe(false);
    expect(isValidUuid(null)).toBe(false);
    expect(isValidUuid(42)).toBe(false);
    expect(isValidUuid("")).toBe(false);
    expect(isValidUuid("d3015b09-865d-4a1e-bcf4-5a4517819de")).toBe(false);
  });
});

describe("generateUuid", () => {
  it("produit un UUID v4 conforme", () => {
    expect(generateUuid()).toMatch(UUID_V4);
  });

  it("ne réutilise pas deux fois le même identifiant", () => {
    const ids = new Set(Array.from({ length: 500 }, () => generateUuid()));
    expect(ids.size).toBe(500);
  });

  it("reste conforme sans crypto.randomUUID (contexte non sécurisé, ex. HTTP)", () => {
    const original = globalThis.crypto;
    vi.stubGlobal("crypto", {
      getRandomValues: (bytes: Uint8Array) => original.getRandomValues(bytes),
    });

    expect(generateUuid()).toMatch(UUID_V4);
  });

  it("reste conforme sans Web Crypto du tout", () => {
    vi.stubGlobal("crypto", undefined);

    expect(generateUuid()).toMatch(UUID_V4);
  });

  it("ne retombe jamais sur l'ancien format mb_<timestamp>, rejeté en 22P02", () => {
    vi.stubGlobal("crypto", undefined);

    for (let i = 0; i < 50; i += 1) {
      expect(generateUuid()).not.toMatch(/^mb_/);
    }
  });
});
