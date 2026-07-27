"use client";

import { useState } from "react";
import { BoutiqueHeader } from "@/components/boutique/BoutiqueHeader";
import { Footer } from "@/components/boutique/Footer";
import { Breadcrumb } from "@/components/boutique/Breadcrumb";
import { CheckoutSummary } from "@/components/boutique/CheckoutSummary";
import { PaymentMethods, PaymentMethodType } from "@/components/boutique/PaymentMethods";
import { MiniCart } from "@/components/boutique/MiniCart";
import { useCartStore } from "@/stores/cart-store";
import { Lock, ArrowRight, BookOpen } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";

export default function CheckoutPage() {
  const { items, getTotalTTC, clearCart } = useCartStore();
  const totalPriceTTC = getTotalTTC();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    country: "Sénégal",
    city: "Dakar",
    acceptTerms: false,
    receiveEmail: true,
  });

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>("orange_money");
  const [submitting, setSubmitting] = useState(false);

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FFF9F2] text-[#3B2416]">
        <BoutiqueHeader />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-6 py-8 flex flex-col items-center justify-center text-center">
          <div className="bg-white p-8 rounded-[24px] border border-[#E5E0D5] max-w-md space-y-4">
            <div className="relative w-32 h-32 mx-auto">
              <Image src="/illustrations/Choisis.webp" alt="Panier vide" fill className="object-contain" />
            </div>
            <h2 className="text-xl font-extrabold text-[#3B2416]">Votre panier est vide</h2>
            <p className="text-xs text-[#3B2416]/70">
              Veuillez ajouter des produits avant d'accéder au paiement.
            </p>
            <Link
              href="/boutique"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#7D6AF8] text-white font-bold text-xs rounded-full shadow-md"
            >
              <BookOpen className="w-4 h-4" />
              <span>Découvrir la boutique</span>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.acceptTerms) {
      toast.error("Veuillez accepter les conditions générales de vente (CGV).");
      return;
    }

    setSubmitting(true);

    try {
      // Créer la commande + facture PayDunya côté serveur
      // (les montants sont recalculés serveur — on n'envoie que les IDs/quantités)
      const res = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          country: formData.country,
          city: formData.city,
          acceptTerms: formData.acceptTerms,
          items: items.map(({ product, quantity }) => ({
            productId: product.id,
            quantity,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.checkout_url) {
        toast.error(
          data.message ||
            "Impossible d'initier le paiement. Veuillez réessayer."
        );
        setSubmitting(false);
        return;
      }

      // Mémoriser l'accès invité pour la page merci / mes-achats
      try {
        localStorage.setItem(
          "pb_boutique_last_order",
          JSON.stringify({
            order_id: data.order_id,
            access_token: data.access_token,
            order_number: data.order_number,
          })
        );
      } catch {
        /* stockage indisponible : la page merci utilisera l'URL */
      }

      toast.success("Redirection vers le paiement sécurisé PayDunya...");
      clearCart();

      // Redirection automatique vers la page de paiement PayDunya
      window.location.href = data.checkout_url as string;
    } catch {
      toast.error("Erreur réseau. Vérifiez votre connexion et réessayez.");
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF9F2] text-[#3B2416] font-sans antialiased">
      <BoutiqueHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-6 py-4">
        <Breadcrumb
          items={[
            { label: "Boutique", href: "/boutique" },
            { label: "Panier", href: "/boutique/panier" },
            { label: "Commander (Invité)" },
          ]}
        />

        <div className="my-6">
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#3B2416]">
            Finaliser ma commande
          </h1>
          <p className="text-xs md:text-sm text-[#3B2416]/70 mt-1">
            Mode invité. Remplissez vos coordonnées puis payez en toute sécurité via PayDunya.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start mb-12">
          {/* Guest Info & Payment Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Guest Info Card */}
            <div className="bg-white rounded-[24px] border border-[#E5E0D5] p-6 md:p-8 shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-[#3B2416] pb-3 border-b border-[#E5E0D5]">
                1. Vos coordonnées de livraison
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#3B2416] mb-1.5">
                    Prénom <span className="text-[#FF5E83]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Aminata"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-[#E5E0D5] bg-[#FFF9F2] text-sm text-[#3B2416] focus:outline-none focus:border-[#7D6AF8]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#3B2416] mb-1.5">
                    Nom <span className="text-[#FF5E83]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Diallo"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-[#E5E0D5] bg-[#FFF9F2] text-sm text-[#3B2416] focus:outline-none focus:border-[#7D6AF8]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#3B2416] mb-1.5">
                    Adresse Email (pour recevoir le PDF) <span className="text-[#FF5E83]">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="exemple@domaine.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-[#E5E0D5] bg-[#FFF9F2] text-sm text-[#3B2416] focus:outline-none focus:border-[#7D6AF8]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#3B2416] mb-1.5">
                    Téléphone / WhatsApp <span className="text-[#FF5E83]">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+221 77 000 00 00"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-[#E5E0D5] bg-[#FFF9F2] text-sm text-[#3B2416] focus:outline-none focus:border-[#7D6AF8]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#3B2416] mb-1.5">
                    Pays <span className="text-[#FF5E83]">*</span>
                  </label>
                  <select
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-[#E5E0D5] bg-[#FFF9F2] text-sm text-[#3B2416] focus:outline-none focus:border-[#7D6AF8]"
                  >
                    <option value="Sénégal">Sénégal</option>
                    <option value="Côte d'Ivoire">Côte d'Ivoire</option>
                    <option value="Mali">Mali</option>
                    <option value="Burkina Faso">Burkina Faso</option>
                    <option value="Cameroun">Cameroun</option>
                    <option value="France">France</option>
                    <option value="Autre">Autre pays</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#3B2416] mb-1.5">
                    Ville <span className="text-[#FF5E83]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Dakar, Abidjan..."
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-[#E5E0D5] bg-[#FFF9F2] text-sm text-[#3B2416] focus:outline-none focus:border-[#7D6AF8]"
                  />
                </div>
              </div>

              {/* CGV & Email Checkboxes */}
              <div className="pt-3 space-y-2 border-t border-[#E5E0D5]">
                <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-[#3B2416]">
                  <input
                    type="checkbox"
                    required
                    checked={formData.acceptTerms}
                    onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
                    className="w-4 h-4 rounded text-[#7D6AF8] focus:ring-[#7D6AF8]"
                  />
                  <span>
                    J'accepte les <span className="text-[#7D6AF8] underline">conditions générales de vente (CGV)</span> <span className="text-[#FF5E83]">*</span>
                  </span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer text-xs text-[#3B2416]/80">
                  <input
                    type="checkbox"
                    checked={formData.receiveEmail}
                    onChange={(e) => setFormData({ ...formData, receiveEmail: e.target.checked })}
                    className="w-4 h-4 rounded text-[#7D6AF8] focus:ring-[#7D6AF8]"
                  />
                  <span>Je souhaite recevoir mes livres et liens de téléchargement par email</span>
                </label>
              </div>
            </div>

            {/* Payment Options Card */}
            <div className="bg-white rounded-[24px] border border-[#E5E0D5] p-6 md:p-8 shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-[#3B2416] pb-3 border-b border-[#E5E0D5]">
                2. Mode de paiement
              </h3>

              <PaymentMethods
                selectedMethod={paymentMethod}
                onSelect={(method) => setPaymentMethod(method)}
              />
            </div>
          </div>

          {/* Right Summary & Submit CTA */}
          <div className="space-y-4">
            <CheckoutSummary items={items} totalPrice={totalPriceTTC} />

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 px-6 rounded-full bg-[#7D6AF8] hover:bg-[#6552E8] text-white font-extrabold text-sm text-center flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#7D6AF8]/30 hover:scale-[1.01] cursor-pointer"
            >
              {submitting ? (
                <span>Redirection vers PayDunya...</span>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Commander et payer</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </main>

      <Footer />
      <MiniCart />
    </div>
  );
}
