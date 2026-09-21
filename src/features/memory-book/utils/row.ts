import { MemoryBookRecord } from "../types/memory-book.types";

/**
 * Colonnes réellement présentes dans `public.memory_books`
 * (voir `supabase/migrations/24_memory_books.sql`).
 *
 * À tenir à jour si la table évolue : c'est la seule barrière entre
 * `MemoryBookRecord` et PostgREST.
 */
export const MEMORY_BOOK_COLUMNS = [
  "id",
  "profile_id",
  "template_id",
  "title",
  "school_year",
  "theme",
  "status",
  "cover_color",
  "pages_data",
  "thumbnail_url",
  "created_at",
  "updated_at",
] as const;

/**
 * Indique si une clé correspond à une colonne de la table.
 *
 * Sert à construire un `UPDATE` partiel sans y glisser de champ local.
 */
export function isMemoryBookColumn(key: string): boolean {
  return (MEMORY_BOOK_COLUMNS as readonly string[]).includes(key);
}

/**
 * Projette un `MemoryBookRecord` sur les seules colonnes de la table.
 *
 * `MemoryBookRecord` transporte aussi des champs purement locaux (`themeId`,
 * `current_page`, `child_data`, `answers_data`). PostgREST rejette la TOTALITÉ
 * de la requête dès qu'un seul champ envoyé ne correspond à aucune colonne
 * (`PGRST204`) : c'est ce qui faisait échouer chaque insertion et chaque
 * sauvegarde en silence, le cahier ne survivant alors que dans le
 * `localStorage`. On filtre donc explicitement, au lieu d'étaler l'objet.
 */
export function toMemoryBookRow(record: MemoryBookRecord) {
  return {
    id: record.id,
    profile_id: record.profile_id,
    template_id: record.template_id,
    title: record.title,
    school_year: record.school_year,
    theme: record.theme ?? "savane",
    status: record.status,
    cover_color: record.cover_color ?? "#7D6AF8",
    pages_data: record.pages_data,
    thumbnail_url: record.thumbnail_url ?? null,
    created_at: record.created_at,
    updated_at: record.updated_at,
  };
}
