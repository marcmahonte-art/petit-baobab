import Link from "next/link";
import { Download, FileText, RefreshCw } from "lucide-react";
import { formatFcfa, formatStoreDate } from "@/lib/store/format";
import type { StoreDownload, StoreOrder } from "@/types/store";

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    paid: "bg-[#E7F8F1] text-[#147B5B]",
    pending: "bg-[#FFF3DE] text-[#9A6500]",
    processing: "bg-[#EEF2FF] text-[#4F46E5]",
    cancelled: "bg-[#FEE2E2] text-[#B91C1C]",
    failed: "bg-[#FEE2E2] text-[#B91C1C]",
    refunded: "bg-[#F3E8FF] text-[#7E22CE]",
  };
  const label: Record<string, string> = {
    paid: "Payée",
    pending: "En attente",
    processing: "En cours",
    cancelled: "Annulée",
    failed: "Échouée",
    refunded: "Remboursée",
  };
  return <span className={`rounded-full px-3 py-1 text-xs font-black ${map[status] || "bg-[#F5EFE6] text-[#3B2416]"}`}>{label[status] || status}</span>;
}

export function OrderCard({ order }: { order: StoreOrder }) {
  return (
    <article className="rounded-[24px] border border-[#F0E7DA] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-black">{order.order_number}</h2>
            <StatusBadge status={order.payment_status} />
          </div>
          <p className="mt-1 text-sm font-semibold text-[#7A6A5E]">{formatStoreDate(order.created_at)}</p>
          <p className="mt-3 text-sm font-bold">{order.items.map((item) => `${item.quantity}× ${item.title}`).join(", ")}</p>
        </div>
        <div className="text-left md:text-right">
          <p className="text-xl font-black text-[#7D6AF8]">{formatFcfa(order.total)}</p>
          <div className="mt-3 flex flex-wrap gap-2 md:justify-end">
            <Link href={`/store/orders/${order.id}`} className="rounded-full bg-[#FFF9F2] px-4 py-2 text-xs font-black">Détails</Link>
            {order.invoice_url && <span className="rounded-full bg-[#E7F8F1] px-4 py-2 text-xs font-black text-[#147B5B]">Facture</span>}
            {order.payment_status === "paid" && <Link href="/store/downloads" className="rounded-full bg-[#7D6AF8] px-4 py-2 text-xs font-black text-white">Téléchargement</Link>}
          </div>
        </div>
      </div>
    </article>
  );
}

export function DownloadCard({ download }: { download: StoreDownload }) {
  const remaining = Math.max(0, download.max_downloads - download.download_count);
  return (
    <article className="rounded-[24px] border border-[#F0E7DA] bg-white p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[20px] bg-[#FFF3DE]">
          <FileText className="h-8 w-8 text-[#FFB300]" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-black">{download.product_title}</h2>
          <p className="mt-1 text-sm font-semibold text-[#7A6A5E]">
            {remaining} téléchargement{remaining > 1 ? "s" : ""} restant{remaining > 1 ? "s" : ""} · expire le {formatStoreDate(download.expires_at)}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href={`/api/payment/download?token=${download.token}`} className="inline-flex items-center gap-2 rounded-full bg-[#7D6AF8] px-4 py-2 text-xs font-black text-white">
              <Download className="h-4 w-4" />
              Télécharger
            </Link>
            <form action="/api/store/downloads/regenerate" method="post">
              <input type="hidden" name="downloadId" value={download.id} />
              <button className="inline-flex items-center gap-2 rounded-full bg-[#FFF9F2] px-4 py-2 text-xs font-black">
                <RefreshCw className="h-4 w-4" />
                Regénérer le lien
              </button>
            </form>
          </div>
        </div>
      </div>
    </article>
  );
}
