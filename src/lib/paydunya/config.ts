// Configuration PayDunya — variables d'environnement uniquement.
// PAYDUNYA_MODE: "live" en production, sinon sandbox.

export const PAYDUNYA_MODE =
  process.env.PAYDUNYA_MODE === "live" ? "live" : "test";

export const PAYDUNYA_BASE_URL =
  PAYDUNYA_MODE === "live"
    ? "https://app.paydunya.com/api/v1"
    : "https://app.paydunya.com/sandbox-api/v1";

export function getPaydunyaHeaders(): Record<string, string> {
  return {
    "Content-Type": "application/json",
    "PAYDUNYA-MASTER-KEY": process.env.PAYDUNYA_MASTER_KEY || "",
    "PAYDUNYA-PRIVATE-KEY": process.env.PAYDUNYA_PRIVATE_KEY || "",
    "PAYDUNYA-TOKEN": process.env.PAYDUNYA_TOKEN || "",
  };
}

export function getAppUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://www.monpetitbaobab.com"
  );
}

export function assertPaydunyaConfigured(): string | null {
  if (!process.env.PAYDUNYA_MASTER_KEY) return "PAYDUNYA_MASTER_KEY manquante";
  if (!process.env.PAYDUNYA_PRIVATE_KEY) return "PAYDUNYA_PRIVATE_KEY manquante";
  if (!process.env.PAYDUNYA_TOKEN) return "PAYDUNYA_TOKEN manquante";
  return null;
}
