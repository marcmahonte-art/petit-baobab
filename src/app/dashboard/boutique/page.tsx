// Page ADMIN — statistiques boutique (/dashboard/boutique).
// NOUVELLE route : aucun fichier existant du dashboard n'est modifié.
// Server Component : lit les stats via service_role (jamais exposé client).
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import Link from "next/link";
import {
  BarChart3, ShoppingBag, CreditCard, Download, TrendingUp, ArrowLeft,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface OrderStatRow {
  total: number;
  payment_status: string;
  items: Array<{ productId: string; title: string; quantity: number; unitPrice: number }>;
  created_at: string;
}

function fcfa(n: number): string {
  return `${n.toLocaleString("fr-FR")} FCFA`;
}

export default async function BoutiqueAdminPage() {
  const supabase = getSupabaseAdmin();

  const [{ data: orders }, { count: downloadCount }, { data: downloadRows }] =
    await Promise.all([
      supabase
        .from("shop_orders")
        .select("total, payment_status, items, created_at")
        .order("created_at", { ascending: false })
        .limit(1000),
      supabase
        .from("shop_downloads")
        .select("id", { count: "exact", head: true }),
      supabase
        .from("shop_downloads")
        .select("download_count"),
    ]);

  const all = (orders || []) as OrderStatRow[];
  const paid = all.filter((o) => o.payment_status === "paid");
  const revenue = paid.reduce((s, o) => s + o.total, 0);
  const totalDownloadsUsed = (downloadRows || []).reduce(
    (s, d) => s + (d.download_count || 0), 0
  );

  // Produits les plus vendus (sur commandes payées)
  const productSales = new Map<string, { title: string; qty: number; revenue: number }>();
  for (const order of paid) {
    for (const item of order.items || []) {
      const cur = productSales.get(item.productId) || { title: item.title, qty: 0, revenue: 0 };
      cur.qty += item.quantity;
      cur.revenue += item.quantity * item.unitPrice;
      productSales.set(item.productId, cur);
    }
  }
  const topProducts = [...productSales.values()]
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 8);

  // Répartition des statuts de paiement
  const statusCounts = all.reduce<Record<string, number>>((acc, o) => {
    acc[o.payment_status] = (acc[o.payment_status] || 0) + 1;
    return acc;
  }, {});

  const cards = [
    { label: "Chiffre d'affaires", value: fcfa(revenue), icon: <TrendingUp className="w-5 h-5 text-[#1D9E75]" /> },
    { label: "Ventes payées", value: String(paid.length), icon: <CreditCard className="w-5 h-5 text-[#7D6AF8]" /> },
    { label: "Commandes totales", value: String(all.length), icon: <ShoppingBag className="w-5 h-5 text-[#F59E0B]" /> },
    { label: "Téléchargements", value: `${totalDownloadsUsed} / ${downloadCount ?? 0} liens`, icon: <Download className="w-5 h-5 text-[#FF5E83]" /> },
  ];

  return (
    <div className="min-h-screen bg-[#FFF9F2] text-[#3B2416] font-sans antialiased p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold flex items-center gap-2">
              <BarChart3 className="w-7 h-7 text-[#7D6AF8]" />
              Statistiques boutique
            </h1>
            <p className="text-sm text-[#3B2416]/70 mt-1">
              Vue d'ensemble des ventes, paiements et téléchargements.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#7D6AF8] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour au dashboard
          </Link>
        </div>

        {/* Cartes stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((c) => (
            <div key={c.label} className="bg-white rounded-[20px] border border-[#E5E0D5] p-5 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-bold text-[#3B2416]/60 uppercase">
                {c.icon}
                {c.label}
              </div>
              <p className="text-xl font-extrabold mt-2">{c.value}</p>
            </div>
          ))}
        </div>

        {/* Statuts paiements */}
        <div className="bg-white rounded-[24px] border border-[#E5E0D5] p-6 shadow-sm">
          <h2 className="text-sm font-extrabold uppercase tracking-wide mb-4">Paiements par statut</h2>
          <div className="flex flex-wrap gap-3">
            {Object.entries(statusCounts).length === 0 ? (
              <p className="text-sm text-[#3B2416]/50">Aucune commande pour le moment.</p>
            ) : (
              Object.entries(statusCounts).map(([status, count]) => (
                <span
                  key={status}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FFF9F2] border border-[#E5E0D5] text-xs font-bold"
                >
                  {status}
                  <span className="text-[#7D6AF8]">{count}</span>
                </span>
              ))
            )}
          </div>
        </div>

        {/* Produits les plus vendus */}
        <div className="bg-white rounded-[24px] border border-[#E5E0D5] p-6 shadow-sm">
          <h2 className="text-sm font-extrabold uppercase tracking-wide mb-4">Produits les plus vendus</h2>
          {topProducts.length === 0 ? (
            <p className="text-sm text-[#3B2416]/50">Aucune vente payée pour le moment.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-[#3B2416]/60 uppercase border-b border-[#E5E0D5]">
                  <th className="py-2">Produit</th>
                  <th className="py-2 text-right">Quantité</th>
                  <th className="py-2 text-right">Revenu</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((p) => (
                  <tr key={p.title} className="border-b border-[#F0E7DA] last:border-0">
                    <td className="py-2.5 font-semibold">{p.title}</td>
                    <td className="py-2.5 text-right font-bold">{p.qty}</td>
                    <td className="py-2.5 text-right font-bold text-[#1D9E75]">{fcfa(p.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
