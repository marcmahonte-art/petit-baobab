import { StoreAuthGate } from "@/components/store/StoreAuthGate";
import { StoreShell } from "@/components/store/StoreShell";
import { OrderCard } from "@/components/store/StoreCards";
import { getCurrentStoreUser } from "@/lib/store/auth";
import { getStoreOrdersForUser } from "@/lib/store/customer-data";

export const dynamic = "force-dynamic";

export default async function StoreOrdersPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string; page?: string }> }) {
  const user = await getCurrentStoreUser();
  if (!user) return <StoreAuthGate />;
  const params = await searchParams;
  const page = Math.max(1, Number(params.page || 1));
  const perPage = 8;
  const orders = await getStoreOrdersForUser(user, params.q, params.status);
  const paginated = orders.slice((page - 1) * perPage, page * perPage);

  return (
    <StoreShell title="Mes achats" subtitle="Recherche, filtre et retrouve toutes tes commandes Petit Baobab.">
      <form className="mb-5 grid gap-3 rounded-[24px] border border-[#F0E7DA] bg-white p-4 md:grid-cols-[1fr_220px_auto]">
        <input name="q" defaultValue={params.q || ""} placeholder="Rechercher une commande ou un produit" className="h-11 rounded-2xl border border-[#F0E7DA] bg-[#FFF9F2] px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-[#7D6AF8]" />
        <select name="status" defaultValue={params.status || "all"} className="h-11 rounded-2xl border border-[#F0E7DA] bg-[#FFF9F2] px-4 text-sm font-bold outline-none">
          <option value="all">Tous les statuts</option>
          <option value="paid">Payée</option>
          <option value="pending">En attente</option>
          <option value="cancelled">Annulée</option>
          <option value="refunded">Remboursée</option>
        </select>
        <button className="h-11 rounded-full bg-[#7D6AF8] px-5 text-sm font-black text-white">Filtrer</button>
      </form>
      <div className="space-y-3">
        {paginated.map((order) => <OrderCard key={order.id} order={order} />)}
        {paginated.length === 0 && <p className="rounded-[24px] bg-white p-6 text-sm font-bold text-[#7A6A5E]">Aucune commande trouvée.</p>}
      </div>
      <div className="mt-5 flex justify-between text-sm font-black text-[#7D6AF8]">
        {page > 1 ? <a href={`/store/orders?page=${page - 1}`}>Page précédente</a> : <span />}
        {page * perPage < orders.length ? <a href={`/store/orders?page=${page + 1}`}>Page suivante</a> : <span />}
      </div>
    </StoreShell>
  );
}
