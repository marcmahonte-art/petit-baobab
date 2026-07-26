"use client";

import { useState } from "react";
import { Mail, CheckCircle2 } from "lucide-react";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <section className="relative overflow-hidden bg-[#7D6AF8] text-white rounded-[24px] p-8 md:p-12 my-8 shadow-xl">
      <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 max-w-2xl mx-auto text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-2">
          <Mail className="w-6 h-6 text-white" />
        </div>

        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
          Recevez des coloriages gratuits chaque mois !
        </h2>

        <p className="text-sm md:text-base text-white/90 leading-relaxed">
          Inscrivez-vous à notre newsletter pour recevoir directement dans votre boîte mail des fiches d'activités et découvrir nos nouvelles sorties.
        </p>

        {subscribed ? (
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#1D9E75] font-bold rounded-full text-sm shadow-md animate-fade-in">
            <CheckCircle2 className="w-5 h-5" />
            <span>Merci pour votre inscription ! À très bientôt.</span>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto pt-2"
          >
            <input
              type="email"
              required
              placeholder="Votre adresse email..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-5 py-3.5 rounded-full text-sm text-[#3B2416] bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FFD95C]"
            />
            <button
              type="submit"
              className="px-6 py-3.5 bg-[#FFD95C] hover:bg-[#ffe075] text-[#3B2416] font-extrabold text-sm rounded-full transition-all shadow-md hover:scale-[1.02] shrink-0"
            >
              S'inscrire
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
