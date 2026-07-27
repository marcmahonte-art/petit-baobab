import Link from "next/link";
import { CheckCircle2, Circle, CreditCard, FileText, MapPin } from "lucide-react";
import { notFound } from "next/navigation";
import { StoreAuthGate } from "@/components/store/StoreAuthGate";
import { StoreShell } from "@/components/store/StoreShell";
import { StatusBadge } from "@/components/store/StoreCards";
import { getCurrentStoreUser } from "@/lib/store/auth";
import { getStoreOrderDetail } from "@/lib/store/customer-data";
import { formatFcfa, formatStoreDate } from "@/lib/store/format";

export const dynamic = "force-dynamic";

export default async function StoreOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentStoreUser();
  if (!user) return <StoreAuthGate />;
  const { id } = await params;
  const detail = await getStoreOrderDetail(user, id);
  if (!detail) notFound();
  const { order, downloads, invoiceSignedUrl } = detail;
  const timeline = [
    { label: "Commande créée", done: true },
    { label: "Paiement reçu", done: order.payment_status === "paid" },
    { label: "Téléchargement disponible", done: downloads.length > 0 },
  ];

  return (
    <StoreShell title={`Commande ${order.order_number}`} subtitle="Détail complet de la commande, paiement, facture et historique.">
      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <section className="space-y-4">
          <div className="rounded-[24px] border border-[#F0E7DA] bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-[#7A6A5E]">{formatStoreDate(order.created_at)}</p>
                <h2 className="text-2xl font-black">{formatFcfa(order.total)}</h2>
              </div>
              <StatusBadge status={order.payment_status} />
            </div>
          </div>
          <div className="rounded-[24px] border border-[#F0E7DA] bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-black">Produits</h2>
            <div className="divide-y divide-[#F0E7DA]">
              {order.items.map((item) => (
                <div key={item.productId} className="flex items-center justify-between gap-4 py-3">
                  <span className="font-bold">{item.quantity}× {item.title}</span>
                  <span className="font-black text-[#7D6AF8]">{formatFcfa(item.unitPrice * item.quantity)}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <InfoCard icon={<MapPin />} title="Adresse" body={`${order.first_name} ${order.last_name} · ${order.city}, ${order.country}`} />
            <InfoCard icon={<CreditCard />} title="Paiement" body={`${order.payment_method} · ${order.invoice_number || "Facture en préparation"}`} />
          </div>
        </section>
        <aside className="space-y-4">
          <div className="rounded-[24px] border border-[#F0E7DA] bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-black">Timeline</h2>
            <div className="space-y-4">
              {timeline.map((step) => (
                <div key={step.label} className="flex items-center gap-3 text-sm font-black">
                  {step.done ? <CheckCircle2 className="h-5 w-5 text-[#1D9E75]" /> : <Circle className="h-5 w-5 text-[#C9B8A8]" />}
                  {step.label}
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[24px] border border-[#F0E7DA] bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-black">Documents</h2>
            <div className="flex flex-col gap-2">
              {invoiceSignedUrl && <Link href={invoiceSignedUrl} className="inline-flex items-center gap-2 rounded-full bg-[#FFF9F2] px-4 py-2 text-sm font-black"><FileText className="h-4 w-4" /> Facture</Link>}
              <Link href="/store/downloads" className="rounded-full bg-[#7D6AF8] px-4 py-2 text-center text-sm font-black text-white">Voir les téléchargements</Link>
            </div>
          </div>
        </aside>
      </div>
    </StoreShell>
  );
}

function InfoCard({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="rounded-[24px] border border-[#F0E7DA] bg-white p-5 shadow-sm">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#FFF9F2] text-[#7D6AF8]">{icon}</div>
      <h3 className="font-black">{title}</h3>
      <p className="mt-1 text-sm font-semibold text-[#7A6A5E]">{body}</p>
    </div>
  );
}
