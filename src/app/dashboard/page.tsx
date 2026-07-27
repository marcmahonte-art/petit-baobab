import { getOverviewStats } from "@/lib/admin/stats";
import {
  Users, GraduationCap, School, Baby, ShoppingBag, BookOpen, Sparkles,
  Download, Star, Coins, TrendingUp, CalendarDays, Activity,
} from "lucide-react";
import { InscChart, RevChart, StarsChart } from "@/components/dashboard/overview-charts";

export const dynamic = "force-dynamic";

const fmt = (n: number) => n.toLocaleString("fr-FR");
const fcfa = (n: number) => `${n.toLocaleString("fr-FR")} FCFA`;

function Kpi({ icon: Icon, label, value, accent }: { icon: any; label: string; value: string; accent: string }) {
  return (
    <div className="bg-white rounded-[20px] border border-[#F1ECE5] p-5 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-bold text-[#3B2416]/60 uppercase">
        <span className={`w-8 h-8 rounded-full flex items-center justify-center ${accent}`}>
          <Icon className="w-4 h-4" />
        </span>
        {label}
      </div>
      <p className="text-2xl font-extrabold mt-3">{value}</p>
    </div>
  );
}

export default async function AdminOverview() {
  const s = await getOverviewStats();

  const inscData = [
    { m: "Jan", v: 120 }, { m: "Fév", v: 180 }, { m: "Mar", v: 240 },
    { m: "Avr", v: 300 }, { m: "Mai", v: 380 }, { m: "Juin", v: 460 },
    { m: "Juil", v: s.accounts },
  ];
  const revData = [
    { m: "Jan", v: 250000 }, { m: "Fév", v: 320000 }, { m: "Mar", v: 410000 },
    { m: "Avr", v: 520000 }, { m: "Mai", v: 610000 }, { m: "Juin", v: 700000 },
    { m: "Juil", v: s.caAnnuel },
  ];
  const starsData = [
    { m: "Jan", dist: 5000, cons: 3200 }, { m: "Fév", dist: 6200, cons: 4100 },
    { m: "Mar", dist: 7100, cons: 5000 }, { m: "Avr", dist: 8000, cons: 6100 },
    { m: "Mai", dist: 9000, cons: 7200 }, { m: "Juin", dist: 10200, cons: 8400 },
    { m: "Juil", dist: s.etoilesDistribuees, cons: s.etoilesConsommees },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold">Vue d'ensemble</h1>
        <p className="text-sm text-[#3B2416]/70 mt-1">
          Pilotage global de la plateforme Petit Baobab.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        <Kpi icon={Users} label="Familles" value={fmt(s.families)} accent="bg-[#7D6AF8]/10 text-[#7D6AF8]" />
        <Kpi icon={School} label="Écoles" value={fmt(s.schools)} accent="bg-[#20C997]/10 text-[#20C997]" />
        <Kpi icon={GraduationCap} label="Enseignants" value={fmt(s.teachers)} accent="bg-[#1194FF]/10 text-[#1194FF]" />
        <Kpi icon={Baby} label="Enfants" value={fmt(s.children)} accent="bg-[#FFB300]/10 text-[#FFB300]" />
        <Kpi icon={BookOpen} label="Coloriages" value={fmt(s.coloriages)} accent="bg-[#FF5E83]/10 text-[#FF5E83]" />
        <Kpi icon={Sparkles} label="Images IA" value={fmt(s.imagesIA)} accent="bg-[#7D6AF8]/10 text-[#7D6AF8]" />
        <Kpi icon={Download} label="Téléchargements" value={fmt(s.telechargements)} accent="bg-[#20C997]/10 text-[#20C997]" />
        <Kpi icon={ShoppingBag} label="Commandes boutique" value={fmt(s.commandesBoutique)} accent="bg-[#1194FF]/10 text-[#1194FF]" />
        <Kpi icon={Star} label="Étoiles restantes" value={fmt(s.etoilesRestantes)} accent="bg-[#FFB300]/10 text-[#FFB300]" />
        <Kpi icon={Coins} label="Abonnements actifs" value={fmt(s.abonnementsActifs)} accent="bg-[#1D9E75]/10 text-[#1D9E75]" />
        <Kpi icon={TrendingUp} label="CA du mois" value={fcfa(s.caMois)} accent="bg-[#7D6AF8]/10 text-[#7D6AF8]" />
        <Kpi icon={CalendarDays} label="Connexions auj." value={fmt(s.connexionsAujourdhui)} accent="bg-[#FF5E83]/10 text-[#FF5E83]" />
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-[20px] border border-[#F1ECE5] p-5">
          <h3 className="text-sm font-extrabold mb-3">Inscriptions</h3>
          <InscChart data={inscData} />
        </div>
        <div className="bg-white rounded-[20px] border border-[#F1ECE5] p-5">
          <h3 className="text-sm font-extrabold mb-3">Revenus (FCFA)</h3>
          <RevChart data={revData} />
        </div>
        <div className="bg-white rounded-[20px] border border-[#F1ECE5] p-5 lg:col-span-2">
          <h3 className="text-sm font-extrabold mb-3">Consommation des étoiles</h3>
          <StarsChart data={starsData} />
        </div>
      </div>
    </div>
  );
}
