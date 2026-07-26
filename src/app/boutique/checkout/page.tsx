"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BoutiqueHeader } from "@/components/boutique/BoutiqueHeader";
import { Footer } from "@/components/boutique/Footer";
import { Breadcrumb } from "@/components/boutique/Breadcrumb";
import { CheckoutSummary } from "@/components/boutique/CheckoutSummary";
import { PaymentMethods, PaymentMethodType } from "@/components/boutique/PaymentMethods";
import { EmptyState } from "@/components/boutique/EmptyState";
import { MiniCart } from "@/components/boutique/MiniCart";
import { useCartStore } from "@/lib/cart-store";
import { Lock, ArrowRight } from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const totalPrice = getTotalPrice();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    country: "Sénégal",
    city: "Dakar",
    receiveEmail: true,
  });

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>("orange_money");
  const [submitting, setSubmitting] = useState(false);

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FFF9F2] text-[#3B2416]">
        <BoutiqueHeader />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-6 py-8">
          <EmptyState title="Votre panier est vide" description="Ajoutez des livres ou produits pour passer commande." />
        </main>
        <Footer />
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    // Simulate order placement
    setTimeout(() => {
      clearCart();
      router.push("/boutique/merci");
    }, 1000);
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
            Finaliser ma commande (Checkout Invité)
          </h1>
          <p className="text-xs md:text-sm text-[#3B2416]/70 mt-1">
            Aucun compte requis. Remplissez vos coordonnées pour recevoir vos téléchargements.
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

              {/* Email Checkbox Requirement */}
              <div className="pt-2">
                <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-[#3B2416]">
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
            <CheckoutSummary items={items} totalPrice={totalPrice} />

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 px-6 rounded-full bg-[#7D6AF8] hover:bg-[#6552E8] text-white font-extrabold text-sm text-center flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#7D6AF8]/30 hover:scale-[1.01] cursor-pointer"
            >
              {submitting ? (
                <span>Traitement en cours...</span>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Payer et télécharger</span>
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
