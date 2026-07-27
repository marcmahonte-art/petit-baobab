import Link from "next/link";
import { Mail } from "lucide-react";

export function StoreAuthGate() {
  return (
    <div className="min-h-screen bg-[#FFF9F2] px-4 py-16 text-[#3B2416]">
      <div className="mx-auto max-w-xl rounded-[28px] border border-[#F0E7DA] bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#7D6AF8]/10">
          <Mail className="h-7 w-7 text-[#7D6AF8]" />
        </div>
        <h1 className="mt-5 text-3xl font-black">Connecte-toi avec ton lien magique</h1>
        <p className="mt-3 text-sm font-semibold text-[#7A6A5E]">
          Après ton achat, Petit Baobab t’envoie un lien sans mot de passe pour retrouver tes commandes,
          factures, téléchargements et favoris.
        </p>
        <form action="/api/store/magic-link" method="post" className="mt-6 space-y-3">
          <label className="sr-only" htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="ton@email.com"
            className="h-12 w-full rounded-2xl border border-[#F0E7DA] bg-[#FFF9F2] px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-[#7D6AF8]"
          />
          <button className="h-12 w-full rounded-full bg-[#7D6AF8] px-5 text-sm font-black text-white transition hover:scale-[1.02]">
            Recevoir mon lien magique
          </button>
        </form>
        <Link href="/boutique" className="mt-5 inline-block text-sm font-black text-[#7D6AF8] hover:underline">
          Retour à la boutique
        </Link>
      </div>
    </div>
  );
}
