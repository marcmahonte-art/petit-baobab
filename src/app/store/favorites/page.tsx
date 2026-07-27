import Link from "next/link";
import { Heart, Search, Trash2 } from "lucide-react";
import { StoreAuthGate } from "@/components/store/StoreAuthGate";
import { StoreShell } from "@/components/store/StoreShell";
import { getCurrentStoreUser } from "@/lib/store/auth";
import { getStoreWishlist } from "@/lib/store/customer-data";
import { PRODUCTS } from "@/lib/mock/products";
import { formatFcfa } from "@/lib/store/format";

export const dynamic = "force-dynamic";

export default async function StoreFavoritesPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const user = await getCurrentStoreUser();
  if (!user) return <StoreAuthGate />;
  const params = await searchParams;
  const wishlist = await getStoreWishlist(user);
  const filtered = wishlist.filter((item) => !params.q || item.product_title.toLowerCase().includes(params.q.toLowerCase()));
  const existingIds = new Set(wishlist.map((item) => item.product_id));

  return (
    <StoreShell title="Mes favoris" subtitle="Ta wishlist Petit Baobab : ajoute, recherche et retire les produits qui t’intéressent.">
      <form className="mb-5 flex gap-3 rounded-[24px] border border-[#F0E7DA] bg-white p-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-3.5 h-4 w-4 text-[#7A6A5E]" />
          <input name="q" defaultValue={params.q || ""} placeholder="Rechercher dans mes favoris" className="h-11 w-full rounded-2xl border border-[#F0E7DA] bg-[#FFF9F2] pl-10 pr-4 text-sm font-bold outline-none" />
        </div>
        <button className="rounded-full bg-[#7D6AF8] px-5 text-sm font-black text-white">Rechercher</button>
      </form>
      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((item) => (
          <article key={item.id} className="rounded-[24px] border border-[#F0E7DA] bg-white p-5 shadow-sm">
            <Heart className="h-5 w-5 fill-[#FF5E83] text-[#FF5E83]" />
            <h2 className="mt-4 text-lg font-black">{item.product_title}</h2>
            <p className="mt-1 text-sm font-bold text-[#7A6A5E]">{item.product_price ? formatFcfa(item.product_price) : "Prix boutique"}</p>
            <div className="mt-4 flex gap-2">
              <Link href={`/boutique/${item.product_id}`} className="rounded-full bg-[#7D6AF8] px-4 py-2 text-xs font-black text-white">Voir</Link>
              <form action="/api/store/favorites" method="post">
                <input type="hidden" name="intent" value="delete" />
                <input type="hidden" name="productId" value={item.product_id} />
                <button className="inline-flex items-center gap-2 rounded-full bg-[#FFF9F2] px-4 py-2 text-xs font-black"><Trash2 className="h-4 w-4" /> Supprimer</button>
              </form>
            </div>
          </article>
        ))}
      </div>
      <section className="mt-8 rounded-[24px] border border-[#F0E7DA] bg-white p-5">
        <h2 className="text-lg font-black">Ajouter un produit</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {PRODUCTS.filter((p) => !existingIds.has(p.id)).slice(0, 8).map((product) => (
            <form key={product.id} action="/api/store/favorites" method="post" className="flex items-center justify-between gap-3 rounded-2xl bg-[#FFF9F2] p-3">
              <input type="hidden" name="intent" value="add" />
              <input type="hidden" name="productId" value={product.id} />
              <input type="hidden" name="productTitle" value={product.title} />
              <input type="hidden" name="productPrice" value={product.price} />
              <span className="text-sm font-black">{product.title}</span>
              <button className="rounded-full bg-white px-3 py-2 text-xs font-black text-[#7D6AF8]">Ajouter</button>
            </form>
          ))}
        </div>
      </section>
    </StoreShell>
  );
}
