export function formatFcfa(value: number): string {
  return `${Math.round(value).toLocaleString("fr-FR")} FCFA`;
}

export function formatStoreDate(value: string | Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function initials(firstName?: string | null, lastName?: string | null, email?: string | null): string {
  const base = [firstName, lastName].filter(Boolean).join(" ") || email || "PB";
  return base
    .split(/\s|@/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}
