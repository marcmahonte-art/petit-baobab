// src/app/school/students/StudentsClient.tsx
"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  Upload,
  Download,
  SlidersHorizontal,
  MoreHorizontal,
  Star,
  Eye,
  Pencil,
  ArrowLeftRight,
  PlusCircle,
  MinusCircle,
  RotateCcw,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Users,
  Palette,
  BookOpen,
  Clock,
  Lightbulb,
  X,
  Trophy,
  MessageSquare,
  Printer,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

const MASCOT_IMAGES: Record<string, string> = {
  awa: "/illustrations/awa.webp",
  lion: "/illustrations/lion.webp",
  robot: "/illustrations/robot.webp",
};

const STATUS_CONFIG: Record<
  string,
  { label: string; className: string }
> = {
  actif: {
    label: "Actif",
    className: "bg-[#10B981]/15 text-[#0E9F6E] border border-[#10B981]/30",
  },
  peu_actif: {
    label: "Peu actif",
    className: "bg-[#FF9500]/15 text-[#F97316] border border-[#FF9500]/30",
  },
  inactif: {
    label: "Inactif",
    className: "bg-[#EF4444]/15 text-[#DC2626] border border-[#EF4444]/30",
  },
};

const PAGE_SIZE = 20;

interface StudentRow {
  id: string;
  classroom_id: string;
  first_name: string;
  last_name: string | null;
  display_name: string | null;
  mascot: string;
  profile_id: string | null;
  classroom_name: string;
  class_code: string;
  activities_count: number;
  drawings_count: number;
  books_count: number;
  stars: number;
  last_active: string | null;
  status: "actif" | "peu_actif" | "inactif";
  badges: string[];
}

interface ClassOption {
  id: string;
  name: string;
  class_code: string;
}

interface Kpis {
  total_students: number;
  active_students: number;
  little_active_students: number;
  inactive_students: number;
  activities_this_week: number;
  stars_earned_this_week: number;
}

function formatLastActivity(dateStr: string | null): string {
  if (!dateStr) return "Jamais";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const time = `${hours}:${minutes}`;

  if (diffHours < 24) return `Aujourd'hui à ${time}`;
  if (diffHours < 48) return `Hier à ${time}`;
  const days = Math.floor(diffHours / 24);
  if (days < 7) return `Il y a ${days} jours`;
  return date.toLocaleDateString("fr-FR");
}

function MascotAvatar({ mascot, size = 48 }: { mascot: string; size?: number }) {
  const src = MASCOT_IMAGES[mascot] || MASCOT_IMAGES.awa;
  return (
    <div
      className="rounded-full overflow-hidden bg-[#FFF8E1] border-2 border-[#F0E7DA] shrink-0"
      style={{ width: size, height: size }}
    >
      <Image
        src={src}
        alt={mascot}
        width={size}
        height={size}
        className="w-full h-full object-cover"
      />
    </div>
  );
}

function StudentName({ student }: { student: StudentRow }) {
  const fullName = student.display_name || `${student.first_name} ${student.last_name || ""}`.trim();
  return (
    <div className="flex flex-col">
      <span className="font-bold text-[#3B2416] text-sm leading-tight">{fullName}</span>
      {student.badges.length > 0 && (
        <span className="text-xs mt-0.5">{student.badges.join(" ")}</span>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.inactif;
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${cfg.className}`}>
      {cfg.label}
    </span>
  );
}

function ClassBadge({ name }: { name: string }) {
  return (
    <span className="inline-block px-2.5 py-1 rounded-lg text-[#7D6AF8] bg-[#7D6AF8]/10 text-xs font-bold">
      {name}
    </span>
  );
}

export default function StudentsClient() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [kpis, setKpis] = useState<Kpis | null>(null);

  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "actif" | "peu_actif" | "inactif">("all");
  const [page, setPage] = useState(1);

  const [drawerStudent, setDrawerStudent] = useState<StudentRow | null>(null);

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/school/students/list");
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || err.message || "Erreur de chargement.");
      }
      const data = await res.json();
      setStudents(data.students || []);
      setClasses(data.classes || []);
      setKpis(data.kpis || null);
    } catch (e: any) {
      setError(e.message || "Impossible de charger les élèves.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [selectedClass, debouncedSearch, activeTab]);

  const filtered = useMemo(() => {
    return students.filter((s) => {
      if (selectedClass !== "all" && s.classroom_id !== selectedClass) return false;
      if (activeTab !== "all" && s.status !== activeTab) return false;
      if (debouncedSearch) {
        const q = debouncedSearch.toLowerCase();
        const hay = `${s.first_name} ${s.last_name || ""} ${s.display_name || ""} ${s.class_code}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [students, selectedClass, debouncedSearch, activeTab]);

  const tabCounts = useMemo(
    () => ({
      all: students.length,
      actif: students.filter((s) => s.status === "actif").length,
      peu_actif: students.filter((s) => s.status === "peu_actif").length,
      inactif: students.filter((s) => s.status === "inactif").length,
    }),
    [students]
  );

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const selectedClassObj = classes.find((c) => c.id === selectedClass);

  const handleAction = (action: string, student: StudentRow) => {
    switch (action) {
      case "view":
      case "edit":
        setDrawerStudent(student);
        break;
      case "change-class":
        toast({ title: "Changer de classe", description: `Fonction à venir pour ${student.first_name}.` });
        break;
      case "add-stars":
        toast({ title: "Ajouter des étoiles", description: `+1 ⭐ pour ${student.first_name}.` });
        break;
      case "remove-stars":
        toast({ title: "Retirer des étoiles", description: `-1 ⭐ pour ${student.first_name}.` });
        break;
      case "reset":
        toast({ title: "Réinitialiser", description: `Progression réinitialisée pour ${student.first_name}.` });
        break;
      case "Trash2":
        toast({ title: "Supprimer", description: `${student.first_name} retiré de la classe.` });
        break;
      default:
        break;
    }
  };

  const TABS = [
    { key: "all", label: "Tous", count: tabCounts.all },
    { key: "actif", label: "Actifs", count: tabCounts.actif },
    { key: "peu_actif", label: "Peu actifs", count: tabCounts.peu_actif },
    { key: "inactif", label: "Inactifs", count: tabCounts.inactif },
  ] as const;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-20 bg-[#F5F0EB] rounded-2xl animate-pulse" />
        <div className="h-14 bg-[#F5F0EB] rounded-2xl animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-[#F5F0EB] rounded-2xl animate-pulse" />
            ))}
          </div>
          <div className="h-80 bg-[#F5F0EB] rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center bg-red-50 border border-red-200 rounded-2xl">
        <p className="mb-4 font-bold text-red-600">{error}</p>
        <button
          onClick={fetchStudents}
          className="px-6 py-2.5 bg-[#7D6AF8] text-white font-bold rounded-xl hover:bg-[#6552E8]"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {/* ───────────── Zone principale ───────────── */}
      <div className="lg:col-span-2 xl:col-span-3 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-[#3B2416]">Mes élèves 👋</h1>
            <p className="text-sm font-semibold text-[#7A6A5E] mt-1">
              Gérez vos élèves et suivez leur progression.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-2 bg-[#FFE9A8] rounded-xl">
              <Star className="w-4 h-4 text-[#F59E0B]" />
              <span className="font-bold text-[#B45309] text-sm">
                {kpis ? `${kpis.active_students} actifs` : "—"}
              </span>
            </div>
            <div className="w-10 h-10 rounded-full overflow-hidden bg-[#FFF8E1] border-2 border-[#F0E7DA]">
              <Image src={MASCOT_IMAGES.awa} alt="Enseignant" width={40} height={40} className="w-full h-full object-cover" />
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="bg-white rounded-2xl border border-[#F0E7DA] shadow-sm p-4 flex flex-col gap-3">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            {/* Sélecteur de classe */}
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="border-2 border-[#F0E7DA] bg-white rounded-xl px-3 py-2.5 text-sm font-bold text-[#3B2416] focus:outline-none focus:border-[#7D6AF8] transition-colors cursor-pointer"
            >
              <option value="all">Toutes les classes</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Recherche */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7A6A5E]" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher un élève..."
                className="pl-10 rounded-xl border-2 border-[#F0E7DA] focus:border-[#7D6AF8]"
              />
            </div>

            {/* Filtres */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="rounded-xl border-2 border-[#F0E7DA] font-bold">
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  Filtres
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 p-2">
                <div className="px-2 py-1.5 text-xs font-bold text-[#7A6A5E]">Statut</div>
                {TABS.filter((t) => t.key !== "all").map((t) => (
                  <DropdownMenuItem
                    key={t.key}
                    onClick={() => setActiveTab(t.key)}
                    className={activeTab === t.key ? "bg-[#7D6AF8]/10 font-bold" : ""}
                  >
                    {t.label} ({t.count})
                  </DropdownMenuItem>
                ))}
                
                <DropdownMenuItem onClick={() => setActiveTab("all")}>
                  Réinitialiser les filtres
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={() => router.push("/school/students/bulk")}
              className="rounded-xl bg-[#7D6AF8] hover:bg-[#6552E8] text-white font-bold"
            >
              <Plus className="w-4 h-4 mr-2" />
              Ajouter un élève
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/school/students/bulk")}
              className="rounded-xl border-2 border-[#F0E7DA] font-bold"
            >
              <Upload className="w-4 h-4 mr-2" />
              Importer
            </Button>
            <Button
              variant="outline"
              onClick={() => toast({ title: "Export CSV", description: "Téléchargement de la liste..." })}
              className="rounded-xl border-2 border-[#F0E7DA] font-bold"
            >
              <Download className="w-4 h-4 mr-2" />
              Exporter CSV
            </Button>
          </div>
        </div>

        {/* Onglets */}
        <div className="flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                activeTab === t.key
                  ? "bg-[#7D6AF8] text-white shadow-md shadow-[#7D6AF8]/20"
                  : "bg-white text-[#7A6A5E] border border-[#F0E7DA] hover:bg-[#F5F0EB]"
              }`}
            >
              {t.label} ({t.count})
            </button>
          ))}
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="bg-white rounded-2xl border border-[#F0E7DA] shadow-sm p-12 text-center">
            <Image
              src={MASCOT_IMAGES.awa}
              alt="Aucun élève"
              width={120}
              height={120}
              className="mx-auto mb-4 opacity-80"
            />
            <p className="text-lg font-bold text-[#3B2416] mb-1">Aucun élève trouvé.</p>
            <p className="text-sm text-[#7A6A5E] mb-4">
              Essayez un autre filtre ou ajoutez de nouveaux élèves.
            </p>
            <Button
              onClick={() => router.push("/school/students/bulk")}
              className="rounded-xl bg-[#7D6AF8] hover:bg-[#6552E8] text-white font-bold"
            >
              <Plus className="w-4 h-4 mr-2" />
              Ajouter un élève
            </Button>
          </div>
        )}

        {/* Tableau (desktop / tablette) */}
        {filtered.length > 0 && (
          <div className="hidden md:block bg-white rounded-2xl border border-[#F0E7DA] shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#F0E7DA] text-xs font-bold text-[#7A6A5E] uppercase">
                  <th className="p-4">Élève</th>
                  <th className="p-4">Classe</th>
                  <th className="p-4 text-center">Activités</th>
                  <th className="p-4 text-center">Étoiles</th>
                  <th className="p-4">Dernière activité</th>
                  <th className="p-4">Statut</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {paginated.map((s, idx) => (
                    <motion.tr
                      key={s.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03, duration: 0.2 }}
                      className="border-b border-[#F5F0EB] last:border-0 hover:bg-[#FFFDF7] transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <MascotAvatar mascot={s.mascot} size={48} />
                          <StudentName student={s} />
                        </div>
                      </td>
                      <td className="p-4">
                        <ClassBadge name={s.classroom_name} />
                      </td>
                      <td className="p-4 text-center font-bold text-[#3B2416]">{s.activities_count}</td>
                      <td className="p-4 text-center font-bold text-[#F59E0B]">+{s.stars} ⭐</td>
                      <td className="p-4 text-sm text-[#7A6A5E]">{formatLastActivity(s.last_active)}</td>
                      <td className="p-4">
                        <StatusBadge status={s.status} />
                      </td>
                      <td className="p-4 text-right">
                        <RowActions student={s} onAction={handleAction} />
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}

        {/* Cartes (mobile) */}
        {filtered.length > 0 && (
          <div className="md:hidden space-y-3">
            {paginated.map((s, idx) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03, duration: 0.2 }}
                className="bg-white rounded-2xl border border-[#F0E7DA] shadow-sm p-4 flex items-center gap-3"
              >
                <MascotAvatar mascot={s.mascot} size={48} />
                <div className="flex-1 min-w-0">
                  <StudentName student={s} />
                  <div className="flex items-center gap-2 mt-1">
                    <ClassBadge name={s.classroom_name} />
                    <span className="text-xs text-[#F59E0B] font-bold">+{s.stars} ⭐</span>
                    <span className="text-xs text-[#7A6A5E]">· {s.activities_count} act.</span>
                  </div>
                </div>
                <RowActions student={s} onAction={handleAction} />
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {filtered.length > 0 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-[#7A6A5E] font-medium">
              {filtered.length} élève{filtered.length > 1 ? "s" : ""}
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="w-9 h-9 rounded-xl border border-[#F0E7DA] bg-white flex items-center justify-center disabled:opacity-40 hover:bg-[#F5F0EB] transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4 text-[#7A6A5E]" />
              </button>
              <span className="text-sm font-bold text-[#3B2416] px-2">
                {page} / {pageCount}
              </span>
              <button
                disabled={page >= pageCount}
                onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                className="w-9 h-9 rounded-xl border border-[#F0E7DA] bg-white flex items-center justify-center disabled:opacity-40 hover:bg-[#F5F0EB] transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4 text-[#7A6A5E]" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ───────────── Panneau latéral droit ───────────── */}
      <aside className="lg:col-span-1 space-y-6">
        {/* Classe actuelle */}
        <div className="bg-white rounded-2xl border border-[#F0E7DA] shadow-sm p-5">
          <h3 className="text-sm font-extrabold text-[#3B2416] mb-3">Classe actuelle</h3>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#FFF8E1] overflow-hidden shrink-0">
              <Image
                src={selectedClassObj ? MASCOT_IMAGES.awa : MASCOT_IMAGES.lion}
                alt="Classe"
                width={48}
                height={48}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <p className="font-bold text-[#3B2416]">{selectedClassObj ? selectedClassObj.name : "Toutes les classes"}</p>
              <p className="text-xs text-[#7A6A5E] font-medium">
                {selectedClassObj
                  ? `${students.filter((s) => s.classroom_id === selectedClass).length} élèves`
                  : `${students.length} élèves`}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => selectedClassObj && router.push(`/school/classes/${selectedClassObj.id}`)}
              className="text-[#7D6AF8] font-bold"
            >
              <Eye className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Aperçu KPI */}
        <div className="bg-white rounded-2xl border border-[#F0E7DA] shadow-sm p-5">
          <h3 className="text-sm font-extrabold text-[#3B2416] mb-4">Aperçu</h3>
          <div className="grid grid-cols-2 gap-3">
            <KpiCard icon={<Users className="w-5 h-5" />} color="#7D6AF8" label="Élèves actifs" value={kpis?.active_students ?? 0} />
            <KpiCard icon={<Palette className="w-5 h-5" />} color="#EC4899" label="Activités / sem." value={kpis?.activities_this_week ?? 0} />
            <KpiCard icon={<Star className="w-5 h-5" />} color="#F59E0B" label="Étoiles gagnées" value={kpis?.stars_earned_this_week ?? 0} />
            <KpiCard icon={<Clock className="w-5 h-5" />} color="#10B981" label="Peu actifs" value={kpis?.little_active_students ?? 0} />
          </div>
        </div>

        {/* Actions rapides */}
        <div className="bg-white rounded-2xl border border-[#F0E7DA] shadow-sm p-5">
          <h3 className="text-sm font-extrabold text-[#3B2416] mb-4">Actions rapides</h3>
          <div className="space-y-2">
            <QuickAction label="Ajouter un élève" icon={<Plus className="w-4 h-4" />} color="#7D6AF8" onClick={() => router.push("/school/students/bulk")} />
            <QuickAction label="Importer" icon={<Upload className="w-4 h-4" />} color="#EC4899" onClick={() => router.push("/school/students/bulk")} />
            <QuickAction label="Imprimer la liste" icon={<Printer className="w-4 h-4" />} color="#3B82F6" onClick={() => window.print()} />
            <QuickAction label="Envoyer un message" icon={<MessageSquare className="w-4 h-4" />} color="#F59E0B" onClick={() => toast({ title: "Message", description: "Fonction à venir." })} />
            <QuickAction label="Gérer les étoiles" icon={<Star className="w-4 h-4" />} color="#10B981" onClick={() => toast({ title: "Étoiles", description: "Fonction à venir." })} />
          </div>
        </div>

        {/* Astuce */}
        <div className="bg-gradient-to-br from-[#FFF8E1] to-[#FFF0D4] rounded-2xl border border-[#F0E7DA] shadow-sm p-5">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="w-5 h-5 text-[#F59E0B]" />
            <h3 className="text-sm font-extrabold text-[#3B2416]">Astuce pédagogique</h3>
          </div>
          <p className="text-xs text-[#7A6A5E] leading-relaxed">
            Encouragez vos élèves en attribuant une étoile après chaque coloriage terminé.
            Cela renforce leur motivation et leur sentiment de progression !
          </p>
        </div>
      </aside>

      {/* Drawer profil élève */}
      <StudentDrawer student={drawerStudent} onClose={() => setDrawerStudent(null)} />
    </div>
  );
}

function RowActions({
  student,
  onAction,
}: {
  student: StudentRow;
  onAction: (action: string, student: StudentRow) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="p-2 rounded-lg hover:bg-[#F5F0EB] transition-colors cursor-pointer">
          <MoreHorizontal className="w-4 h-4 text-[#7A6A5E]" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52 p-1.5">
        <DropdownMenuItem onClick={() => onAction("view", student)}>
          <Eye className="w-4 h-4 mr-2" /> Voir le profil
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onAction("edit", student)}>
          <Pencil className="w-4 h-4 mr-2" /> Modifier
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onAction("change-class", student)}>
          <ArrowLeftRight className="w-4 h-4 mr-2" /> Changer de classe
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => onAction("add-stars", student)}>
          <PlusCircle className="w-4 h-4 mr-2" /> Ajouter des étoiles
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onAction("remove-stars", student)}>
          <MinusCircle className="w-4 h-4 mr-2" /> Retirer des étoiles
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onAction("reset", student)}>
          <RotateCcw className="w-4 h-4 mr-2" /> Réinitialiser progression
        </DropdownMenuItem>
        
        <DropdownMenuItem
          className="text-red-600 focus:text-red-600"
          onClick={() => onAction("Trash2", student)}
        >
          <Trash2 className="w-4 h-4 mr-2" /> Supprimer
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function KpiCard({
  icon,
  color,
  label,
  value,
}: {
  icon: React.ReactNode;
  color: string;
  label: string;
  value: number;
}) {
  return (
    <div className="bg-[#FFFDF7] rounded-xl p-3 border border-[#F0E7DA]">
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center mb-2"
        style={{ backgroundColor: color + "1a", color }}
      >
        {icon}
      </div>
      <p className="text-xl font-black text-[#3B2416]">{value}</p>
      <p className="text-[11px] text-[#7A6A5E] font-medium leading-tight">{label}</p>
    </div>
  );
}

function QuickAction({
  label,
  icon,
  color,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  color: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 w-full p-2.5 rounded-xl hover:bg-[#F5F0EB] transition-colors text-left group cursor-pointer"
    >
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
        style={{ backgroundColor: color + "1a", color }}
      >
        {icon}
      </div>
      <span className="text-sm font-bold text-[#3B2416]">{label}</span>
    </button>
  );
}

function StudentDrawer({
  student,
  onClose,
}: {
  student: StudentRow | null;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {student && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-[#FFFDF7] z-50 shadow-2xl overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black text-[#3B2416]">Profil de l'élève</h2>
                <button onClick={onClose} className="p-2 rounded-lg hover:bg-[#F5F0EB] cursor-pointer">
                  <X className="w-5 h-5 text-[#7A6A5E]" />
                </button>
              </div>

              <div className="flex flex-col items-center text-center mb-6">
                <MascotAvatar mascot={student.mascot} size={96} />
                <h3 className="text-2xl font-black text-[#3B2416] mt-3">
                  {student.display_name ||
                    `${student.first_name} ${student.last_name || ""}`.trim()}
                </h3>
                <div className="flex items-center gap-2 mt-2">
                  <ClassBadge name={student.classroom_name} />
                  <StatusBadge status={student.status} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-white rounded-xl p-4 border border-[#F0E7DA] text-center">
                  <p className="text-2xl font-black text-[#7D6AF8]">{student.activities_count}</p>
                  <p className="text-xs text-[#7A6A5E] font-medium">Activités</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-[#F0E7DA] text-center">
                  <p className="text-2xl font-black text-[#F59E0B]">{student.stars} ⭐</p>
                  <p className="text-xs text-[#7A6A5E] font-medium">Étoiles</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-[#F0E7DA] text-center">
                  <p className="text-2xl font-black text-[#EC4899]">{student.drawings_count}</p>
                  <p className="text-xs text-[#7A6A5E] font-medium">Coloriages</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-[#F0E7DA] text-center">
                  <p className="text-2xl font-black text-[#10B981]">{student.books_count}</p>
                  <p className="text-xs text-[#7A6A5E] font-medium">Livres</p>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 border border-[#F0E7DA] mb-6">
                <p className="text-xs font-bold text-[#7A6A5E] mb-1">Dernière activité</p>
                <p className="font-bold text-[#3B2416]">{formatLastActivity(student.last_active)}</p>
              </div>

              <div className="flex items-center gap-2 text-[#7A6A5E]">
                <Trophy className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {student.badges.length > 0
                    ? `Récompenses : ${student.badges.join(" ")}`
                    : "Aucune récompense pour le moment."}
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
