// ============================================================
// Tests — auth callback redirection par rôle (Phase 9.1)
// ============================================================

import { describe, it, expect, vi, beforeEach } from "vitest";

const exchangeMock = vi.fn();
const authClientMock = vi.fn();

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn((...args: any[]) => authClientMock(...args)),
}));

vi.mock("@supabase/ssr", () => ({
  createServerClient: vi.fn(() => ({
    auth: { exchangeCodeForSession: exchangeMock, signOut: vi.fn(), signInWithOtp: vi.fn() },
  })),
}));

vi.mock("@/lib/supabase-server", () => ({
  getSupabaseServer: vi.fn(),
  getSupabaseSsrClient: vi.fn(() => ({
    auth: {
      exchangeCodeForSession: exchangeMock,
      signOut: vi.fn(),
      signInWithOtp: vi.fn(),
    },
  })),
}));

vi.mock("@/lib/auth", () => ({
  setAuthCookies: vi.fn(),
  setRoleCookie: vi.fn(),
  clearAuthCookies: vi.fn(),
}));

import { GET } from "@/app/api/auth/callback/route";

function makeRequest(code: string | null, next = "/parents"): Request {
  const url = new URL("http://localhost/api/auth/callback");
  if (code) url.searchParams.set("code", code);
  url.searchParams.set("next", next);
  return new Request(url.toString());
}

function setupMocks(plan: string | null, hasFamily = false, hasSchool = false) {
  exchangeMock.mockResolvedValue({
    data: { session: { access_token: "at", refresh_token: "rt" }, user: { id: "u1", email: "parent@x.com" } },
    error: null,
  });

  const accountRow = plan
    ? { id: "acc1", plan, has_family_sub: hasFamily, has_school_sub: hasSchool }
    : null;

  authClientMock.mockImplementation(() => ({
    auth: { getUser: vi.fn() },
    from: (table: string) => {
      if (table === "profiles") {
        return { select: () => ({ eq: () => ({ maybeSingle: () => Promise.resolve({ data: { id: "u1" }, error: null }) }) }) };
      }
      if (table === "accounts") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: () => Promise.resolve({ data: accountRow, error: null }),
              single: () => Promise.resolve({ data: accountRow, error: null }),
            }),
          }),
        };
      }
      return { select: () => ({ eq: () => ({ maybeSingle: () => Promise.resolve({ data: null, error: null }) }) }) };
    },
  }));
}

async function getRedirect(res: Response): Promise<string> {
  return res.headers.get("location") || "";
}

describe("auth callback — redirection par rôle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Parent simple (plan: 'free', has_family_sub: true) → redirect /dashboard", async () => {
    setupMocks("free", true, false);
    const res = await GET(makeRequest("code123"));
    const loc = await getRedirect(res);
    expect(loc).toContain("/dashboard");
    expect(loc).not.toContain("/select-space");
    expect(loc).not.toContain("/school/dashboard");
  });

  it("Parent decouverte → redirect /dashboard", async () => {
    setupMocks("decouverte", true, false);
    const res = await GET(makeRequest("code123"));
    expect(await getRedirect(res)).toContain("/dashboard");
  });

  it("Parent super_baobab → redirect /dashboard", async () => {
    setupMocks("super_baobab", true, false);
    const res = await GET(makeRequest("code123"));
    expect(await getRedirect(res)).toContain("/dashboard");
  });

  it("Enseignant pur (ecole_pro, has_family_sub: false, has_school_sub: true) → /school/dashboard", async () => {
    setupMocks("ecole_pro", false, true);
    const res = await GET(makeRequest("code123"));
    const loc = await getRedirect(res);
    expect(loc).toContain("/school/dashboard");
    expect(loc).not.toContain("/select-space");
  });

  it("Compte double (ecole_pro, has_family_sub: true, has_school_sub: true) → /select-space", async () => {
    setupMocks("ecole_pro", true, true);
    const res = await GET(makeRequest("code123"));
    expect(await getRedirect(res)).toContain("/select-space");
  });

  it("Erreur Supabase sur lecture compte → redirection safe /dashboard (pas de crash, pas de {} )", async () => {
    exchangeMock.mockResolvedValue({
      data: { session: { access_token: "at", refresh_token: "rt" }, user: { id: "u1", email: "x@x.com" } },
      error: null,
    });
    authClientMock.mockImplementation(() => ({
      auth: { getUser: vi.fn() },
      from: (table: string) => {
        if (table === "profiles") return { select: () => ({ eq: () => ({ maybeSingle: () => Promise.resolve({ data: { id: "u1" }, error: null }) }) }) };
        if (table === "accounts") return { select: () => ({ eq: () => ({ maybeSingle: () => Promise.resolve({ data: null, error: { message: "boom" } }) }) }) };
        return { select: () => ({ eq: () => ({ maybeSingle: () => Promise.resolve({ data: null, error: null }) }) }) };
      },
    }));
    const res = await GET(makeRequest("code123"));
    // En cas d'erreur de lecture, on redirige vers un espace sûr :
    // pas de crash, pas de page d'erreur /login?error, pas de corps vide {}.
    const loc = await getRedirect(res);
    expect(loc).not.toContain("/login?error");
    expect(loc.startsWith("http://localhost")).toBe(true);
  });
});
