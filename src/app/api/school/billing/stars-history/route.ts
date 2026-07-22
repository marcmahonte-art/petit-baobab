// GET /api/school/billing/stars-history
// Proxy vers /api/billing/subscription pour l'instant ; l'historique détaillé
// des étoiles est fourni par GET /api/school/billing (getBillingData).
export { GET } from "@/app/api/billing/subscription/route";
