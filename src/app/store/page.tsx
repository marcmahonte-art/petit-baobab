import Link from "next/link";
import { Download, Heart, Package, Star } from "lucide-react";
import { StoreAuthGate } from "@/components/store/StoreAuthGate";
import { StoreShell } from "@/components/store/StoreShell";
import { StoreMotion } from "@/components/store/StoreMotion";
import { OrderCard } from "@/components/store/StoreCards";
import { ensureStoreProfile, getCurrentStoreUser } from "@/lib/store/auth";
import { getStoreDownloadsForUser, getStoreOrdersForUser, getStoreReviews, getStoreWishlist } from "@/lib/store/customer-data";
import { formatFcfa, initials } from "@/lib/store/format";

export const dynamic = "force-dynamic";

export default async function StoreDashboardPage() {
  const user = await getCurrentStoreUser();
  if (!user) return <StoreAuthGate />;

  const [profile, orders, downloads, wishlist, reviews] = await Promise.all([
    ensureStoreProfile(user),
    getStoreOrdersForUser(user),
    getStoreDownloadsForUser(user),
    getStoreWishlist(user),
    getStoreReviews(user),
  ]);
  const paidOrders = orders.filter((order) => order.payment_status === "paid");
  const totalSpent = paidOrders.reduce((sum, order) => sum + order.total, 0);

  const stats = [
    { label: "Achats", value: orders.length, icon: Package, href: "/store/orders" },
    { label: "PDF disponibles", value: downloads.length, icon: Download, href: "/store/downloads" },
    { label: "Favoris", value: wishlist.length, icon: Heart, href: "/store/favorites" },
    { label: "Avis", value: reviews.length, icon: Star, href: "/store/reviews" },
  ];

  return (
    <StoreShell title="Mon espace" subtitle="Tes achats, factures, favoris et téléchargements Petit Baobab au même endroit.">
      <div className="space-y-6">
        <StoreMotion>
          <section className="rounded-[28px] bg-[#7D6AF8] p-6 text-white shadow-sm md:p-8">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/15 text-xl font-black">
                  {initials(profile?.first_name, profile?.last_name, user.email)}
                </div>
                <div>
                  <h2 className="text-2xl font-black">Bonjour {profile?.first_name || "Petit Baobab"} 👋</h2>
                  <p className="mt-1 text-sm font-bold text-white/75">{user.email}</p>
                </div>
              </div>
              <div className="rounded-[22px] bg-white/14 px-5 py-4">
                <p className="text-xs font-black uppercase tracking-wide text-white/70">Montant total</p>
                <p className="text-2xl font-black">{formatFcfa(totalSpent)}</p>
              </div>
            </div>
          </section>
        </StoreMotion>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <StoreMotion key={stat.label} delay={index * 0.04}>
                <Link href={stat.href} className="block rounded-[24px] border border-[#F0E7DA] bg-white p-5 shadow-sm transition hover:-translate-y-0.5">
                  <Icon className="h-5 w-5 text-[#7D6AF8]" />
                  <p className="mt-4 text-3xl font-black">{stat.value}</p>
                  <p className="text-sm font-bold text-[#7A6A5E]">{stat.label}</p>
                </Link>
              </StoreMotion>
            );
          })}
        </div>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black">Derniers achats</h2>
            <Link href="/store/orders" className="text-sm font-black text-[#7D6AF8]">Tout voir</Link>
          </div>
          {orders.slice(0, 3).map((order) => <OrderCard key={order.id} order={order} />)}
          {orders.length === 0 && <p className="rounded-[24px] bg-white p-6 text-sm font-bold text-[#7A6A5E]">Aucune commande liée à cet email pour le moment.</p>}
        </section>
      </div>
    </StoreShell>
  );
}
