// Facture PDF boutique — générée avec jsPDF, stockée dans le bucket PRIVÉ
// shop-files (invoices/...). Retourne le chemin storage (pas d'URL publique).
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import type { ShopOrderRow } from "@/lib/paydunya/webhook";

interface ShopInvoiceParams {
  invoiceNumber: string;
  order: ShopOrderRow;
  createdAt: string;
}

function fcfa(n: number): string {
  return `${n.toLocaleString("fr-FR")} FCFA`;
}

export async function generateShopInvoicePdf(
  params: ShopInvoiceParams
): Promise<string | null> {
  try {
    const { jsPDF } = await import("jspdf");
    const { invoiceNumber, order } = params;
    const doc = new jsPDF({ format: "a4", unit: "mm" });
    const pageW = 210;
    const margin = 20;
    let y = margin;

    const primary = "#7D6AF8";
    const dark = "#3B2416";
    const muted = "#7A6A5E";

    // En-tête
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(primary);
    doc.text("Petit Baobab — Boutique", margin, y);
    y += 8;
    doc.setFontSize(9);
    doc.setTextColor(muted);
    doc.setFont("helvetica", "normal");
    doc.text("Facture d'achat — produits numériques", margin, y);
    y += 14;

    doc.setDrawColor(primary);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageW - margin, y);
    y += 10;

    // Référence + date + client
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(dark);
    doc.text(`FACTURE ${invoiceNumber}`, margin, y);
    y += 8;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(muted);
    doc.text(
      `Date : ${new Date(params.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}`,
      margin, y
    );
    y += 5;
    doc.text(`Commande : ${order.order_number}`, margin, y);
    y += 5;
    doc.text(`Client : ${order.first_name} ${order.last_name}`, margin, y);
    y += 5;
    doc.text(`Email : ${order.email}`, margin, y);
    y += 12;

    // Lignes produits
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(dark);
    doc.text("Produit", margin, y);
    doc.text("Qté", pageW - margin - 50, y);
    doc.text("Total", pageW - margin, y, { align: "right" });
    y += 3;
    doc.setDrawColor("#F0E7DA");
    doc.setLineWidth(0.3);
    doc.line(margin, y, pageW - margin, y);
    y += 7;

    doc.setFont("helvetica", "normal");
    for (const item of order.items) {
      const title = item.title.length > 55 ? `${item.title.slice(0, 52)}...` : item.title;
      doc.setTextColor(dark);
      doc.text(title, margin, y);
      doc.text(String(item.quantity), pageW - margin - 50, y);
      doc.text(fcfa(item.unitPrice * item.quantity), pageW - margin, y, { align: "right" });
      y += 7;
    }

    y += 3;
    doc.line(margin, y, pageW - margin, y);
    y += 9;

    // Totaux (TVA : produits numériques — TVA non applicable, art. 293B-like ;
    // le total HT stocké sert de référence comptable)
    doc.setFontSize(10);
    doc.setTextColor(muted);
    doc.text("Total HT", margin, y);
    doc.setTextColor(dark);
    doc.text(fcfa(order.total_ht), pageW - margin, y, { align: "right" });
    y += 6;
    doc.setTextColor(muted);
    doc.text("TVA (18%)", margin, y);
    doc.setTextColor(dark);
    doc.text(fcfa(order.total - order.total_ht), pageW - margin, y, { align: "right" });
    y += 8;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(dark);
    doc.text("Total TTC", margin, y);
    doc.setTextColor(primary);
    doc.text(fcfa(order.total), pageW - margin, y, { align: "right" });
    y += 16;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(muted);
    doc.text("Paiement sécurisé via PayDunya (Orange Money, Moov Money, Carte bancaire)", margin, y);
    y += 4;
    doc.text("Petit Baobab — Éveillez la créativité de vos enfants", margin, y);

    // Upload dans le bucket PRIVÉ shop-files
    const pdfBuffer = doc.output("arraybuffer");
    const supabase = getSupabaseAdmin();
    const filePath = `invoices/${order.id}/${invoiceNumber}.pdf`;

    const { error: upErr } = await supabase.storage
      .from("shop-files")
      .upload(filePath, new Blob([pdfBuffer], { type: "application/pdf" }), {
        contentType: "application/pdf",
        upsert: true,
      });

    if (upErr) {
      console.error("[shop-invoice] upload échoué:", upErr.message);
      return null;
    }

    // On retourne le CHEMIN storage — les URLs signées sont générées à la
    // demande par /api/payment/status (jamais d'URL publique).
    return filePath;
  } catch (err) {
    console.error("[shop-invoice] génération échouée:", err);
    return null;
  }
}
