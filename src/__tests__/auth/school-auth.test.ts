// ============================================================
// Tests — requireTeacherPage (garde des PAGES de l'espace école)
// ============================================================
//
// Contexte : le proxy ne teste que la PRÉSENCE du cookie `sb-access-token`.
// Un cookie forgé ou expiré passait donc la garde et affichait une coquille de
// page vide. `requireTeacherPage()` fait la vraie vérification (session +
// plan ecole_pro) et REDIRIGE, contrairement à `getTeacherSession()` qui
// renvoie une NextResponse pour les routes API.
//
// On mocke `redirect` pour qu'il LÈVE (comme le fait Next en interne) : cela
// interrompt le composant, exactement comme en production.

import { describe, it, expect, vi, beforeEach } from "vitest";

const redirectMock = vi.fn((url: string) => {
  throw new Error(`REDIRECT:${url}`);
});

vi.mock("next/navigation", () => ({
  redirect: (url: string) => redirectMock(url),
}));

vi.mock("@/lib/auth", () => ({
  getServerUser: vi.fn(),
}));

vi.mock("@/lib/supabaseServer", () => ({
  getSupabaseServer: vi.fn(),
}));

import { requireTeacherPage } from "@/lib/school-auth";
import { getServerUser } from "@/lib/auth";
import { getSupabaseServer } from "@/lib/supabaseServer";

/** Chaîne Supabase minimale : from().select().eq().single() */
function mockSupabase(account: Record<string, unknown> | null) {
  vi.mocked(getSupabaseServer).mockResolvedValue({
    from: () => ({
      select: () => ({
        eq: () => ({
          single: async () => ({
            data: account,
            error: account ? null : { message: "no rows" },
          }),
        }),
      }),
    }),
  } as never);
}

const USER = { id: "u1", email: "prof@ecole.fr" };

describe("requireTeacherPage", () => {
  beforeEach(() => {
    redirectMock.mockClear();
    vi.mocked(getServerUser).mockReset();
    vi.mocked(getSupabaseServer).mockReset();
  });

  it("visiteur non connecté → redirige vers /login?space=school", async () => {
    vi.mocked(getServerUser).mockResolvedValue(null as never);

    await expect(requireTeacherPage()).rejects.toThrow(
      "REDIRECT:/login?space=school"
    );
    expect(redirectMock).toHaveBeenCalledWith("/login?space=school");
  });

  it("connecté sans compte → redirige vers /parents", async () => {
    vi.mocked(getServerUser).mockResolvedValue(USER as never);
    mockSupabase(null);

    await expect(requireTeacherPage()).rejects.toThrow("REDIRECT:/parents");
    expect(redirectMock).toHaveBeenCalledWith("/parents");
  });

  it("connecté mais plan famille → redirige vers /parents", async () => {
    vi.mocked(getServerUser).mockResolvedValue(USER as never);
    mockSupabase({ id: "a1", user_id: "u1", plan: "famille" });

    await expect(requireTeacherPage()).rejects.toThrow("REDIRECT:/parents");
    expect(redirectMock).toHaveBeenCalledWith("/parents");
  });

  it("enseignant ecole_pro → AUCUNE redirection, retourne user + account", async () => {
    const account = { id: "a1", user_id: "u1", plan: "ecole_pro" };
    vi.mocked(getServerUser).mockResolvedValue(USER as never);
    mockSupabase(account);

    const result = await requireTeacherPage();

    expect(redirectMock).not.toHaveBeenCalled();
    expect(result.user).toEqual(USER);
    expect(result.account).toEqual(account);
  });
});
