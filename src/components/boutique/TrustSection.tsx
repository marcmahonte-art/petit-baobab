import { Download, ShieldCheck, Printer, Heart } from "lucide-react";

export function TrustSection() {
  const features = [
    {
      icon: <Download className="w-6 h-6 text-[#7D6AF8]" />,
      title: "Téléchargement immédiat",
      description: "Accédez immédiatement à vos livres au format PDF dès validation de la commande.",
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-[#1D9E75]" />,
      title: "Paiement sécurisé",
      description: "Payez en toute sécurité par Orange Money, Moov Money, PayDunya ou Carte bancaire.",
    },
    {
      icon: <Printer className="w-6 h-6 text-[#F59E0B]" />,
      title: "Compatible imprimante",
      description: "Imprimez facilement à la maison ou à l'école en format A4 haute résolution.",
    },
    {
      icon: <Heart className="w-6 h-6 text-[#FF5E83]" />,
      title: "Pensé pour les enfants africains",
      description: "Des illustrations authentiques valorisant la faune, les contes et la diversité culturelle.",
    },
  ];

  return (
    <section className="py-12 my-8 bg-white rounded-[24px] border border-[#E5E0D5] p-6 md:p-10 shadow-sm">
      <div className="text-center max-w-xl mx-auto mb-10">
        <h2 className="text-2xl font-extrabold text-[#3B2416]">
          Pourquoi choisir Petit Baobab ?
        </h2>
        <p className="text-xs md:text-sm text-[#3B2416]/70 mt-1">
          Une expérience pensée avec soin pour le bonheur des enfants et la sérénité des parents.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, idx) => (
          <div
            key={idx}
            className="flex flex-col items-center text-center p-5 rounded-[20px] bg-[#FFF9F2] border border-[#E5E0D5]/60 hover:shadow-md transition-shadow"
          >
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mb-4 shadow-sm">
              {feature.icon}
            </div>
            <h3 className="text-base font-bold text-[#3B2416] mb-2">
              {feature.title}
            </h3>
            <p className="text-xs text-[#3B2416]/70 leading-relaxed">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
