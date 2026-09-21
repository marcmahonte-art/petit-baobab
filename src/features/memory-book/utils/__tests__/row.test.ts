import { describe, expect, it } from "vitest";
import { isMemoryBookColumn, MEMORY_BOOK_COLUMNS, toMemoryBookRow } from "../row";
import { MemoryBookRecord } from "../../types/memory-book.types";

function makeRecord(overrides: Partial<MemoryBookRecord> = {}): MemoryBookRecord {
  return {
    id: "d3015b09-865d-4a1e-bcf4-5a4517819def",
    profile_id: "11111111-2222-4333-8444-555555555555",
    template_id: "cahier_10_pages_marketing_v1",
    title: "Cahier de Souvenirs de Mon Enfant",
    school_year: "2025 - 2026",
    status: "draft",
    pages_data: [],
    created_at: "2026-09-21T00:00:00.000Z",
    updated_at: "2026-09-21T00:00:00.000Z",
    ...overrides,
  };
}

describe("toMemoryBookRow", () => {
  it("ne conserve que les colonnes de la table", () => {
    const row = toMemoryBookRow(makeRecord());

    expect(Object.keys(row).sort()).toEqual([...MEMORY_BOOK_COLUMNS].sort());
  });

  it("écarte les champs locaux, qui feraient rejeter la requête entière (PGRST204)", () => {
    const row = toMemoryBookRow(
      makeRecord({
        current_page: 4,
        themeId: "savane",
        child_data: { firstName: "Awa" },
        answers_data: { "p-prenom": "Awa" },
      })
    );

    for (const localKey of ["current_page", "themeId", "child_data", "answers_data"]) {
      expect(row).not.toHaveProperty(localKey);
    }
  });

  it("renseigne les valeurs par défaut prévues par la table", () => {
    const row = toMemoryBookRow(
      makeRecord({ theme: undefined, cover_color: undefined, thumbnail_url: undefined })
    );

    expect(row.theme).toBe("savane");
    expect(row.cover_color).toBe("#7D6AF8");
    expect(row.thumbnail_url).toBeNull();
  });

  it("préserve les valeurs fournies", () => {
    const row = toMemoryBookRow(
      makeRecord({ theme: "ocean", cover_color: "#000000", thumbnail_url: "/x.png" })
    );

    expect(row.theme).toBe("ocean");
    expect(row.cover_color).toBe("#000000");
    expect(row.thumbnail_url).toBe("/x.png");
  });
});

describe("isMemoryBookColumn", () => {
  it("reconnaît les colonnes réelles", () => {
    for (const column of MEMORY_BOOK_COLUMNS) {
      expect(isMemoryBookColumn(column)).toBe(true);
    }
  });

  it("rejette les champs purement locaux", () => {
    for (const localKey of ["current_page", "themeId", "child_data", "answers_data"]) {
      expect(isMemoryBookColumn(localKey)).toBe(false);
    }
  });
});
