// GET /api/school/billing/invoices
// Proxy vers /api/billing/payments (qui gère déjà pagination/recherche/tri + invoice_number).
export { GET } from "@/app/api/billing/payments/route";
