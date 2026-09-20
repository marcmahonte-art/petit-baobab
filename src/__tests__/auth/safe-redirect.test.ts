// ============================================================
// Tests — validation des redirections internes (`?next=`)
// ============================================================

import { describe, it, expect } from "vitest";
import { safeInternalPath } from "@/lib/auth/safe-redirect";

describe("safeInternalPath", () => {
  it.each([
    "/dashboard",
    "/learn/dashboard",
    "/parametres",
    "/boutique/panier",
    "/a/b?c=d#e",
  ])("accepte le chemin interne %s", (value) => {
    expect(safeInternalPath(value)).toBe(value);
  });

  it.each([
    ["URL absolue https", "https://site-pirate.example"],
    ["URL absolue http", "http://site-pirate.example"],
    ["URL protocole-relative", "//site-pirate.example"],
    ["antislash (normalisé en // par certains navigateurs)", "/\\site-pirate.example"],
    ["chemin contenant un antislash", "/redir\\ection"],
    ["schéma javascript", "javascript:alert(1)"],
    ["chemin relatif sans slash initial", "dashboard"],
    ["retour à la ligne (injection d'en-tête)", "/dashboard\nLocation: https://x.example"],
    ["tabulation", "/dash\tboard"],
    ["chaîne vide", ""],
    ["espaces uniquement", "   "],
    ["null", null],
    ["undefined", undefined],
  ])("refuse %s", (_label, value) => {
    expect(safeInternalPath(value as string | null | undefined)).toBeNull();
  });

  it("tolère les espaces autour d'un chemin valide", () => {
    expect(safeInternalPath("  /dashboard  ")).toBe("/dashboard");
  });
});
