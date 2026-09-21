// ============================================================
// Tests — limiteur de débit en mémoire
// ============================================================
//
// Contexte : /api/help est PUBLIC (le widget d'aide s'affiche aussi pour les
// visiteurs anonymes) et appelle OpenAI. Sans limite, n'importe qui peut
// boucler dessus et consommer le budget du compte. Le débit est donc le seul
// garde-fou possible sur cette route.

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { rateLimit, clientIp, resetRateLimit } from "@/lib/rate-limit";

describe("rateLimit", () => {
  beforeEach(() => {
    resetRateLimit();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-20T20:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("autorise exactement `limit` appels puis bloque", () => {
    for (let i = 1; i <= 3; i += 1) {
      expect(rateLimit("k", 3, 60_000).allowed).toBe(true);
    }

    const blocked = rateLimit("k", 3, 60_000);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("les clés sont indépendantes (une IP ne pénalise pas une autre)", () => {
    expect(rateLimit("ip-a", 1, 60_000).allowed).toBe(true);
    expect(rateLimit("ip-a", 1, 60_000).allowed).toBe(false);

    // Une autre clé dispose de son propre quota.
    expect(rateLimit("ip-b", 1, 60_000).allowed).toBe(true);
  });

  it("la fenêtre se réouvre après expiration", () => {
    expect(rateLimit("k", 1, 60_000).allowed).toBe(true);
    expect(rateLimit("k", 1, 60_000).allowed).toBe(false);

    // 61 s plus tard : nouveau quota.
    vi.setSystemTime(new Date("2026-09-20T20:01:01Z"));
    expect(rateLimit("k", 1, 60_000).allowed).toBe(true);
  });

  it("retryAfterSeconds décroît avec le temps et reste >= 1", () => {
    rateLimit("k", 1, 60_000);
    const first = rateLimit("k", 1, 60_000);
    expect(first.allowed).toBe(false);
    expect(first.retryAfterSeconds).toBe(60);

    vi.setSystemTime(new Date("2026-09-20T20:00:30Z"));
    const later = rateLimit("k", 1, 60_000);
    expect(later.allowed).toBe(false);
    expect(later.retryAfterSeconds).toBe(30);
  });
});

describe("clientIp", () => {
  it("prend la PREMIÈRE entrée de x-forwarded-for (IP cliente, pas le proxy)", () => {
    const req = new Request("http://localhost/api/help", {
      headers: { "x-forwarded-for": "203.0.113.7, 70.41.3.18, 150.172.238.178" },
    });
    expect(clientIp(req)).toBe("203.0.113.7");
  });

  it("tolère les espaces autour des entrées", () => {
    const req = new Request("http://localhost/api/help", {
      headers: { "x-forwarded-for": "  203.0.113.7 , 10.0.0.1 " },
    });
    expect(clientIp(req)).toBe("203.0.113.7");
  });

  it("retombe sur x-real-ip si x-forwarded-for est absent", () => {
    const req = new Request("http://localhost/api/help", {
      headers: { "x-real-ip": "198.51.100.4" },
    });
    expect(clientIp(req)).toBe("198.51.100.4");
  });

  it("renvoie \"unknown\" si aucun en-tête (mieux que pas de limite du tout)", () => {
    const req = new Request("http://localhost/api/help");
    expect(clientIp(req)).toBe("unknown");
  });

  it("ignore un x-forwarded-for vide plutôt que de renvoyer une chaîne vide", () => {
    const req = new Request("http://localhost/api/help", {
      headers: { "x-forwarded-for": "   " },
    });
    expect(clientIp(req)).toBe("unknown");
  });
});
