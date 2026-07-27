import { Star, Trash2 } from "lucide-react";
import { StoreAuthGate } from "@/components/store/StoreAuthGate";
import { StoreShell } from "@/components/store/StoreShell";
import { getCurrentStoreUser } from "@/lib/store/auth";
import { getPurchasedReviewTargets, getStoreOrdersForUser, getStoreReviews } from "@/lib/store/customer-data";

export const dynamic = "force-dynamic";

export default async function StoreReviewsPage() {
  const user = await getCurrentStoreUser();
  if (!user) return <StoreAuthGate />;
  const [orders, reviews] = await Promise.all([getStoreOrdersForUser(user), getStoreReviews(user)]);
  const targets = getPurchasedReviewTargets(orders);

  return (
    <StoreShell title="Mes avis" subtitle="Note les produits achetés, modifie ou supprime tes commentaires. Une note par commande et par produit.">
      <section className="mb-6 rounded-[24px] border border-[#F0E7DA] bg-white p-5">
        <h2 className="text-lg font-black">Écrire ou modifier un avis</h2>
        <form action="/api/store/reviews" method="post" className="mt-4 grid gap-3 md:grid-cols-2">
          <input type="hidden" name="intent" value="upsert" />
          <select name="target" required className="h-11 rounded-2xl border border-[#F0E7DA] bg-[#FFF9F2] px-4 text-sm font-bold outline-none">
            <option value="">Choisir un achat</option>
            {targets.map((target) => (
              <option key={`${target.orderId}:${target.productId}`} value={`${target.orderId}:${target.productId}:${target.productTitle}`}>
                {target.productTitle}
              </option>
            ))}
          </select>
          <select name="rating" required className="h-11 rounded-2xl border border-[#F0E7DA] bg-[#FFF9F2] px-4 text-sm font-bold outline-none">
            {[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating} étoiles</option>)}
          </select>
          <textarea name="comment" placeholder="Ton commentaire" className="min-h-28 rounded-2xl border border-[#F0E7DA] bg-[#FFF9F2] p-4 text-sm font-bold outline-none md:col-span-2" />
          <input name="photos" placeholder="URLs photos séparées par des virgules" className="h-11 rounded-2xl border border-[#F0E7DA] bg-[#FFF9F2] px-4 text-sm font-bold outline-none md:col-span-2" />
          <button className="h-11 rounded-full bg-[#7D6AF8] px-5 text-sm font-black text-white md:col-span-2">Enregistrer l’avis</button>
        </form>
      </section>
      <div className="grid gap-4 md:grid-cols-2">
        {reviews.map((review) => (
          <article key={review.id} className="rounded-[24px] border border-[#F0E7DA] bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-black">{review.product_title}</h2>
                <div className="mt-2 flex gap-1 text-[#FFB300]">{Array.from({ length: review.rating }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}</div>
              </div>
              <span className="rounded-full bg-[#FFF9F2] px-3 py-1 text-xs font-black">{review.status}</span>
            </div>
            <p className="mt-4 text-sm font-semibold text-[#7A6A5E]">{review.comment || "Sans commentaire."}</p>
            <form action="/api/store/reviews" method="post" className="mt-4">
              <input type="hidden" name="intent" value="delete" />
              <input type="hidden" name="reviewId" value={review.id} />
              <button className="inline-flex items-center gap-2 rounded-full bg-[#FFF9F2] px-4 py-2 text-xs font-black"><Trash2 className="h-4 w-4" /> Supprimer</button>
            </form>
          </article>
        ))}
      </div>
    </StoreShell>
  );
}
