import Link from "next/link";
import {
  BarChart3,
  Boxes,
  CreditCard,
  Download,
  Gift,
  MessageSquare,
  Package,
  Settings,
  ShoppingBag,
  Tags,
  Users,
} from "lucide-react";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { PRODUCTS } from "@/lib/mock/products";
import { CATEGORIES } from "@/lib/mock/categories";
import { formatFcfa, formatStoreDate } from "@/lib/store/format";
import type { StoreOrder } from "@/types/store";

export const dynamic = "force-dynamic";

const menu = [
  { label: "Dashboard", icon: BarChart3 },
  { label: "Produits", icon: Package },
  { label: "Catégories", icon: Tags },
  { label: "Commandes", icon: ShoppingBag },
  { label: "Clients", icon: Users },
  { label: "Promotions", icon: Gift },
  { label: "Coupons", icon: CreditCard },
  { label: "Avis", icon: MessageSquare },
  { label: "Statistiques", icon: BarChart3 },
  { label: "Paramètres", icon: Settings },
];

export default async function StoreAdminDashboardPage() {
  const supabase = getSupabaseAdmin();
  const [{ data: orders }, { data: downloads }, { data: reviews }, { data: coupons }, { data: customers }] = await Promise.all([
    supabase.from("shop_orders").select("*").order("created_at", { ascending: false }).limit(200),
    supabase.from("shop_downloads").select("download_count"),
    supabase.from("reviews").select("id,rating,status,product_title,created_at").order("created_at", { ascending: false }).limit(8),
    supabase.from("coupons").select("*").order("created_at", { ascending: false }).limit(8),
    supabase.from("shop_customer_profiles").select("*").order("updated_at", { ascending: false }).limit(8),
  ]);

  const allOrders = (orders || []) as StoreOrder[];
  const paidOrders = allOrders.filter((order) => order.payment_status === "paid");
  const revenue = paidOrders.reduce((sum, order) => sum + order.total, 0);
  const avgCart = paidOrders.length ? Math.round(revenue / paidOrders.length) : 0;
  const totalDownloads = (downloads || []).reduce((sum, row) => sum + (row.download_count || 0), 0);

  const productSales = new Map<string, { title: string; qty: number; revenue: number }>();
  for (const order of paidOrders) {
    for (const item of order.items || []) {
      const current = productSales.get(item.productId) || { title: item.title, qty: 0, revenue: 0 };
      current.qty += item.quantity;
      current.revenue += item.quantity * item.unitPrice;
      productSales.set(item.productId, current);
    }
  }
  const topProducts = [...productSales.values()].sort((a, b) => b.qty - a.qty).slice(0, 6);

  const cards = [
    { label: "CA", value: formatFcfa(revenue), helper: "Commandes payées" },
    { label: "Ventes", value: paidOrders.length, helper: `${allOrders.length} commandes totales` },
    { label: "Panier moyen", value: formatFcfa(avgCart), helper: "Sur ventes payées" },
    { label: "Téléchargements", value: totalDownloads, helper: "PDF servis" },
  ];

  return (
    <div className="min-h-screen bg-[#FFF9F2] p-4 text-[#3B2416] md:p-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 rounded-[28px] bg-[#7D6AF8] p-6 text-white shadow-sm md:p-8">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-white/70">Back office</p>
          <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-black md:text-5xl">Dashboard boutique</h1>
              <p className="mt-2 max-w-2xl text-sm font-bold text-white/75">
                Pilotage complet : ventes, produits, commandes, clients, coupons, avis et téléchargements.
              </p>
            </div>
            <Link href="/dashboard/boutique" className="rounded-full bg-white/15 px-4 py-2 text-sm font-black">Ancien dashboard</Link>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="rounded-[28px] border border-[#F0E7DA] bg-white p-4 shadow-sm">
            <nav className="grid gap-1" aria-label="Menu administrateur boutique">
              {menu.map((item) => {
                const Icon = item.icon;
                return (
                  <a key={item.label} href={`#${item.label.toLowerCase().replaceAll("é", "e")}`} className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-black hover:bg-[#FFF3DE]">
                    <Icon className="h-4 w-4 text-[#7D6AF8]" />
                    {item.label}
                  </a>
                );
              })}
            </nav>
          </aside>

          <main className="space-y-6">
            <section id="dashboard" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {cards.map((card) => (
                <div key={card.label} className="rounded-[24px] border border-[#F0E7DA] bg-white p-5 shadow-sm">
                  <p className="text-xs font-black uppercase tracking-wide text-[#7A6A5E]">{card.label}</p>
                  <p className="mt-2 text-2xl font-black text-[#7D6AF8]">{card.value}</p>
                  <p className="mt-1 text-xs font-bold text-[#7A6A5E]">{card.helper}</p>
                </div>
              ))}
            </section>

            <AdminSection id="commandes" title="Commandes" actionLabel="Exporter CSV" actionHref="/api/store/admin/orders/export">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-sm">
                  <thead className="text-left text-xs font-black uppercase text-[#7A6A5E]">
                    <tr><th className="py-2">Commande</th><th>Client</th><th>Statut</th><th>Total</th><th>Date</th><th>Actions</th></tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0E7DA]">
                    {allOrders.slice(0, 12).map((order) => (
                      <tr key={order.id}>
                        <td className="py-3 font-black">{order.order_number}</td>
                        <td>{order.email}</td>
                        <td>{order.payment_status}</td>
                        <td className="font-black text-[#7D6AF8]">{formatFcfa(order.total)}</td>
                        <td>{formatStoreDate(order.created_at)}</td>
                        <td className="space-x-2 text-xs font-black text-[#7D6AF8]">
                          <button>Imprimer</button>
                          <button>Relancer Email</button>
                          <button>WhatsApp</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </AdminSection>

            <div className="grid gap-6 xl:grid-cols-2">
              <AdminSection id="produits" title="Produits">
                <div className="space-y-3">
                  {PRODUCTS.slice(0, 8).map((product) => (
                    <div key={product.id} className="flex items-center justify-between gap-3 rounded-2xl bg-[#FFF9F2] p-3">
                      <div><p className="font-black">{product.title}</p><p className="text-xs font-bold text-[#7A6A5E]">{formatFcfa(product.price)}</p></div>
                      <div className="flex gap-2 text-xs font-black text-[#7D6AF8]"><button>Modifier</button><button>Archiver</button><button>Mettre en avant</button></div>
                    </div>
                  ))}
                </div>
              </AdminSection>

              <AdminSection id="categories" title="Catégories">
                <div className="grid gap-3">
                  {CATEGORIES.map((category, index) => (
                    <div key={category.id} className="flex items-center justify-between rounded-2xl bg-[#FFF9F2] p-3">
                      <span className="font-black">{category.title}</span>
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-black">Ordre {index + 1}</span>
                    </div>
                  ))}
                </div>
              </AdminSection>
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              <AdminSection id="clients" title="Clients">
                <div className="space-y-3">
                  {(customers || []).map((customer: any) => (
                    <div key={customer.id} className="rounded-2xl bg-[#FFF9F2] p-3">
                      <p className="font-black">{customer.first_name || "Client"} · {customer.email}</p>
                      <p className="text-xs font-bold text-[#7A6A5E]">Dernière activité : {formatStoreDate(customer.updated_at || customer.created_at)}</p>
                    </div>
                  ))}
                </div>
              </AdminSection>

              <AdminSection id="promotions" title="Promotions & coupons">
                <form className="grid gap-3 rounded-2xl bg-[#FFF9F2] p-3">
                  <input placeholder="Code promo" className="h-10 rounded-xl border border-[#F0E7DA] px-3 text-sm font-bold" />
                  <div className="grid grid-cols-2 gap-2">
                    <input placeholder="Pourcentage ou montant" className="h-10 rounded-xl border border-[#F0E7DA] px-3 text-sm font-bold" />
                    <input placeholder="Utilisations max" className="h-10 rounded-xl border border-[#F0E7DA] px-3 text-sm font-bold" />
                  </div>
                  <button type="button" className="h-10 rounded-full bg-[#7D6AF8] text-sm font-black text-white">Créer coupon</button>
                </form>
                <div className="mt-3 space-y-2">
                  {(coupons || []).map((coupon: any) => <p key={coupon.id} className="rounded-xl bg-white px-3 py-2 text-sm font-black">{coupon.code}</p>)}
                </div>
              </AdminSection>
            </div>

            <AdminSection id="statistiques" title="Statistiques">
              <div className="grid gap-4 md:grid-cols-3">
                <MiniChart label="Produits populaires" rows={topProducts.map((p) => `${p.title} · ${p.qty}`)} />
                <MiniChart label="Catégories populaires" rows={CATEGORIES.slice(0, 5).map((c) => c.title)} />
                <MiniChart label="Conversions" rows={["Vue produit → panier", "Panier → checkout", "Checkout → payé"]} />
              </div>
            </AdminSection>

            <AdminSection id="avis" title="Avis">
              <div className="grid gap-3 md:grid-cols-2">
                {(reviews || []).map((review: any) => (
                  <div key={review.id} className="rounded-2xl bg-[#FFF9F2] p-3">
                    <p className="font-black">{review.product_title}</p>
                    <p className="text-xs font-bold text-[#7A6A5E]">{review.rating}/5 · {review.status}</p>
                  </div>
                ))}
              </div>
            </AdminSection>
          </main>
        </div>
      </div>
    </div>
  );
}

function AdminSection({ id, title, children, actionHref, actionLabel }: { id: string; title: string; children: React.ReactNode; actionHref?: string; actionLabel?: string }) {
  return (
    <section id={id} className="rounded-[28px] border border-[#F0E7DA] bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-xl font-black">{title}</h2>
        {actionHref && <a href={actionHref} className="rounded-full bg-[#FFF9F2] px-4 py-2 text-xs font-black text-[#7D6AF8]">{actionLabel}</a>}
      </div>
      {children}
    </section>
  );
}

function MiniChart({ label, rows }: { label: string; rows: string[] }) {
  return (
    <div className="rounded-2xl bg-[#FFF9F2] p-4">
      <p className="mb-3 font-black">{label}</p>
      <div className="space-y-2">
        {rows.length === 0 ? <p className="text-sm font-bold text-[#7A6A5E]">Données à venir</p> : rows.map((row, i) => (
          <div key={row} className="text-sm font-bold">
            <span className="mr-2 text-[#7D6AF8]">{i + 1}.</span>{row}
          </div>
        ))}
      </div>
    </div>
  );
}
