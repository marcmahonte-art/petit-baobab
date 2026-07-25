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
  Loader2,
  Save,
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
  bobo: "/illustrations/mascots/bobo-lion.png",
  kaya: "/illustrations/mascots/kaya-elephant.png",
  zuri: "/illustrations/mascots/zuri-girafe.png",
  momo: "/illustrations/mascots/momo-singe.png",
  kiki: "/illustrations/mascots/kiki-perroquet.png",
  baobab: "/illustrations/mascots/baobab-guide.png",
};

const MASCOTS = ["bobo", "kaya", "zuri", "momo", "kiki", "baobab"] as const;

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  actif: { label: "Actif", className: "bg-[#10B981]/15 text-[#0E9F6E] border border-[#10B981]/30" },
  peu_actif: { label: "Peu actif", className: "bg-[#FF9500]/15 text-[#F97316] border border-[#FF9500]/30" },
  inactif: { label: "Inactif", className: "bg-[#EF4444]/15 text-[#DC2626] border border-[#EF4444]/30" },
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
      <Image src={src} alt={mascot} width={size} height={size} className="w-full h-full object-cover" />
    </div>
  );
}

function StudentName({ student }: { student: StudentRow }) {
  const fullName = student.display_name || `${student.first_name} ${student.last_name || ""}`.trim();
  return (
    <div className="flex flex-col">
      <span className="font-bold text-[#3B2416] text-sm leading-tight">{fullName}</span>
      {student.badges.length > 0 && <span className="text-xs mt-0.5">{student.badges.join(" ")}</span>}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.inactif;
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${cfg.className}`}>{cfg.label}</span>
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
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Modales
  const [editStudent, setEditStudent] = useState<StudentRow | null>(null);
  const [moveStudent, setMoveStudent] = useState<StudentRow | null>(null);

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

  // ───────────── Actions reliées à Supabase ─────────────

  const runAction = useCallback(
    async (key: string, student: StudentRow, extra?: any) => {
      setActionLoading(key + student.id);
      try {
        let res: Response;
        let payload: any = undefined;
        let method = "POST";
        let url = `/api/school/students/${student.id}`;

        switch (key) {
          case "change-class":
            method = "PATCH";
            payload = { classroom_id: extra.classroomId };
            break;
          case "add-stars":
          case "remove-stars":
            url = `/api/school/students/${student.id}/stars`;
            payload = { amount: key === "add-stars" ? Math.abs(extra.amount || 1) : -Math.abs(extra.amount || 1) };
            break;
          case "reset":
            url = `/api/school/students/${student.id}/reset`;
            break;
          case "delete":
            method = "DELETE";
            url = `/api/school/students/${student.id}`;
            break;
          default:
            break;
        }

        res = await fetch(url, {
          method,
          headers: payload ? { "Content-Type": "application/json" } : undefined,
          body: payload ? JSON.stringify(payload) : undefined,
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || data.message || "Opération échouée.");

        const labels: Record<string, string> = {
          "change-class": "Classe mise à jour",
          "add-stars": data.message || "Étoiles ajoutées",
          "remove-stars": data.message || "Étoiles retirées",
          reset: "Progression réinitialisée",
          delete: `${student.first_name} retiré de la classe`,
        };
        toast({ title: "Succès", description: labels[key] || "Opération réussie" });

        // Rafraîchir les données après mutation
        await fetchStudents();
        if (drawerStudent?.id === student.id) setDrawerStudent(null);
      } catch (e: any) {
        toast({ title: "Erreur", description: e.message });
      } finally {
        setActionLoading(null);
      }
    },
    [fetchStudents, drawerStudent]
  );

  const handleAction = (action: string, student: StudentRow) => {
    switch (action) {
      case "view":
        setDrawerStudent(student);
        break;
      case "edit":
        setEditStudent(student);
        break;
      case "change-class":
        setMoveStudent(student);
        break;
      case "add-stars":
        runAction("add-stars", student, { amount: 1 });
        break;
      case "remove-stars":
        runAction("remove-stars", student, { amount: 1 });
        break;
      case "reset":
        runAction("reset", student);
        break;
      case "delete":
        runAction("delete", student);
        break;
      default:
        break;
    }
  };

  const exportCSV = useCallback(() => {
    const header = ["Prénom", "Nom", "Classe", "Code classe", "Activités", "Étoiles", "Dernière activité", "Statut"];
    const rows = students.map((s) => [
      s.first_name,
      s.last_name || "",
      s.classroom_name,
      s.class_code,
      String(s.activities_count),
      String(s.stars),
      s.last_active ? new Date(s.last_active).toLocaleString("fr-FR") : "Jamais",
      STATUS_CONFIG[s.status]?.label || s.status,
    ]);
    const csv = [header, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "eleves-petit-baobab.csv";
    link.click();
    URL.revokeObjectURL(link.href);
    toast({ title: "Export CSV", description: `${students.length} élèves exportés.` });
  }, [students]);

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
            <h1 className="text-3xl font-black text-[#3B2416]">Mes élèves</h1>
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

            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7A6A5E]" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher un élève..."
                className="pl-10 rounded-xl border-2 border-[#F0E7DA] focus:border-[#7D6AF8]"
              />
            </div>

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

          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={() => router.push("/school/students/add")}
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
              onClick={exportCSV}
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
            <Image src={MASCOT_IMAGES.awa} alt="Aucun élève" width={120} height={120} className="mx-auto mb-4 opacity-80" />
            <p className="text-lg font-bold text-[#3B2416] mb-1">Aucun élève trouvé.</p>
            <p className="text-sm text-[#7A6A5E] mb-4">Essayez un autre filtre ou ajoutez de nouveaux élèves.</p>
            <Button
              onClick={() => router.push("/school/students/add")}
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
                      <td className="p-4 text-center font-bold text-[#F59E0B]">+{s.stars}</td>
                      <td className="p-4 text-sm text-[#7A6A5E]">{formatLastActivity(s.last_active)}</td>
                      <td className="p-4">
                        <StatusBadge status={s.status} />
                      </td>
                      <td className="p-4 text-right">
                        <RowActions
                          student={s}
                          actionLoading={actionLoading}
                          onAction={handleAction}
                        />
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
                    <span className="text-xs text-[#F59E0B] font-bold">+{s.stars}</span>
                    <span className="text-xs text-[#7A6A5E]">· {s.activities_count} act.</span>
                  </div>
                </div>
                <RowActions student={s} actionLoading={actionLoading} onAction={handleAction} />
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {filtered.length > 0 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-[#7A6A5E] font-medium">{filtered.length} élève{filtered.length > 1 ? "s" : ""}</p>
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

        <div className="bg-white rounded-2xl border border-[#F0E7DA] shadow-sm p-5">
          <h3 className="text-sm font-extrabold text-[#3B2416] mb-4">Aperçu</h3>
          <div className="grid grid-cols-2 gap-3">
            <KpiCard icon={<Users className="w-5 h-5" />} color="#7D6AF8" label="Élèves actifs" value={kpis?.active_students ?? 0} />
            <KpiCard icon={<Palette className="w-5 h-5" />} color="#EC4899" label="Activités / sem." value={kpis?.activities_this_week ?? 0} />
            <KpiCard icon={<Star className="w-5 h-5" />} color="#F59E0B" label="Étoiles gagnées" value={kpis?.stars_earned_this_week ?? 0} />
            <KpiCard icon={<Clock className="w-5 h-5" />} color="#10B981" label="Peu actifs" value={kpis?.little_active_students ?? 0} />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#F0E7DA] shadow-sm p-5">
          <h3 className="text-sm font-extrabold text-[#3B2416] mb-4">Actions rapides</h3>
          <div className="space-y-2">
            <QuickAction label="Ajouter un élève" icon={<Plus className="w-4 h-4" />} color="#7D6AF8" onClick={() => router.push("/school/students/add")} />
            <QuickAction label="Importer" icon={<Upload className="w-4 h-4" />} color="#EC4899" onClick={() => router.push("/school/students/bulk")} />
            <QuickAction label="Imprimer la liste" icon={<Printer className="w-4 h-4" />} color="#3B82F6" onClick={() => window.print()} />
            <QuickAction label="Envoyer un message" icon={<MessageSquare className="w-4 h-4" />} color="#F59E0B" onClick={() => toast({ title: "Message", description: "Fonction à venir." })} />
            <QuickAction label="Gérer les étoiles" icon={<Star className="w-4 h-4" />} color="#10B981" onClick={() => toast({ title: "Étoiles", description: "Sélectionnez un élève pour gérer ses étoiles." })} />
          </div>
        </div>

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
      <StudentDrawer student={drawerStudent} onClose={() => setDrawerStudent(null)} onEdit={setEditStudent} />

      {/* Modal Modifier */}
      <EditStudentModal
        student={editStudent}
        classes={classes}
        onClose={() => setEditStudent(null)}
        onSaved={() => {
          setEditStudent(null);
          fetchStudents();
        }}
      />

      {/* Modal Changer de classe */}
      <MoveStudentModal
        student={moveStudent}
        classes={classes}
        onClose={() => setMoveStudent(null)}
        onMoved={() => {
          setMoveStudent(null);
          fetchStudents();
        }}
        runAction={runAction}
        actionLoading={actionLoading}
      />
    </div>
  );
}

function RowActions({
  student,
  actionLoading,
  onAction,
}: {
  student: StudentRow;
  actionLoading: string | null;
  onAction: (action: string, student: StudentRow) => void;
}) {
  const busy = actionLoading === "add-stars" + student.id || actionLoading === "remove-stars" + student.id || actionLoading === "reset" + student.id || actionLoading === "delete" + student.id;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="p-2 rounded-lg hover:bg-[#F5F0EB] transition-colors cursor-pointer" disabled={busy}>
          {busy ? <Loader2 className="w-4 h-4 text-[#7A6A5E] animate-spin" /> : <MoreHorizontal className="w-4 h-4 text-[#7A6A5E]" />}
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
        <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => onAction("delete", student)}>
          <Trash2 className="w-4 h-4 mr-2" /> Supprimer
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function KpiCard({ icon, color, label, value }: { icon: React.ReactNode; color: string; label: string; value: number }) {
  return (
    <div className="bg-[#FFFDF7] rounded-xl p-3 border border-[#F0E7DA]">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2" style={{ backgroundColor: color + "1a", color }}>
        {icon}
      </div>
      <p className="text-xl font-black text-[#3B2416]">{value}</p>
      <p className="text-[11px] text-[#7A6A5E] font-medium leading-tight">{label}</p>
    </div>
  );
}

function QuickAction({ label, icon, color, onClick }: { label: string; icon: React.ReactNode; color: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex items-center gap-3 w-full p-2.5 rounded-xl hover:bg-[#F5F0EB] transition-colors text-left group cursor-pointer">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: color + "1a", color }}>
        {icon}
      </div>
      <span className="text-sm font-bold text-[#3B2416]">{label}</span>
    </button>
  );
}

function ModalShell({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between p-5 border-b border-[#F0E7DA]">
            <h2 className="text-lg font-black text-[#3B2416]">{title}</h2>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-[#F5F0EB] cursor-pointer">
              <X className="w-5 h-5 text-[#7A6A5E]" />
            </button>
          </div>
          <div className="p-5">{children}</div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function EditStudentModal({
  student,
  classes,
  onClose,
  onSaved,
}: {
  student: StudentRow | null;
  classes: ClassOption[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [mascot, setMascot] = useState<string>("bobo");
  const [classroomId, setClassroomId] = useState<string>("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (student) {
      setFirstName(student.first_name);
      setLastName(student.last_name || "");
      setDisplayName(student.display_name || "");
      setMascot(student.mascot);
      setClassroomId(student.classroom_id);
    }
  }, [student]);

  if (!student) return null;

  const handleSave = async () => {
    if (firstName.trim().length < 2) {
      toast({ title: "Erreur", description: "Le prénom doit faire au moins 2 caractères." });
      return;
    }
    const display = displayName.trim() || `${firstName.trim()} ${lastName.trim()}`.trim();
    try {
      setSaving(true);
      const res = await fetch(`/api/school/students/${student.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: firstName.trim(),
          last_name: lastName.trim() || null,
          display_name: display,
          mascot,
          classroom_id: classroomId,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Échec de la modification.");
      toast({ title: "Succès", description: "Élève mis à jour." });
      onSaved();
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalShell title={`Modifier ${student.first_name}`} onClose={onClose}>
      <div className="space-y-4">
        <div>
          <label className="block font-bold text-[#3B2416] text-sm mb-1">Prénom</label>
          <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="rounded-xl border-2 border-[#F0E7DA]" />
        </div>
        <div>
          <label className="block font-bold text-[#3B2416] text-sm mb-1">Nom</label>
          <Input value={lastName} onChange={(e) => setLastName(e.target.value)} className="rounded-xl border-2 border-[#F0E7DA]" />
        </div>
        <div>
          <label className="block font-bold text-[#3B2416] text-sm mb-1">Nom affiché</label>
          <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Optionnel" className="rounded-xl border-2 border-[#F0E7DA]" />
        </div>
        <div>
          <label className="block font-bold text-[#3B2416] text-sm mb-1">Mascotte</label>
          <div className="flex gap-2">
            {MASCOTS.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMascot(m)}
                className={`rounded-xl border-2 p-1 transition-all ${mascot === m ? "border-[#7D6AF8] ring-2 ring-[#7D6AF8]/30" : "border-[#F0E7DA]"}`}
              >
                <Image src={MASCOT_IMAGES[m]} alt={m} width={44} height={44} className="rounded-lg object-cover" />
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block font-bold text-[#3B2416] text-sm mb-1">Classe</label>
          <select
            value={classroomId}
            onChange={(e) => setClassroomId(e.target.value)}
            className="w-full border-2 border-[#F0E7DA] bg-white rounded-xl px-3 py-2.5 text-sm font-bold text-[#3B2416] focus:outline-none focus:border-[#7D6AF8]"
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-2 pt-2">
          <Button variant="outline" onClick={onClose} className="flex-1 rounded-xl border-2 border-[#F0E7DA] font-bold">
            Annuler
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 rounded-xl bg-[#7D6AF8] hover:bg-[#6552E8] text-white font-bold"
          >
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Enregistrer
          </Button>
        </div>
      </div>
    </ModalShell>
  );
}

function MoveStudentModal({
  student,
  classes,
  onClose,
  onMoved,
  runAction,
  actionLoading,
}: {
  student: StudentRow | null;
  classes: ClassOption[];
  onClose: () => void;
  onMoved: () => void;
  runAction: (key: string, student: StudentRow, extra?: any) => void;
  actionLoading: string | null;
}) {
  const [targetClass, setTargetClass] = useState<string>("");
  useEffect(() => {
    if (student) setTargetClass(student.classroom_id);
  }, [student]);

  if (!student) return null;
  const busy = actionLoading === "change-class" + student.id;
  const otherClasses = classes.filter((c) => c.id !== student.classroom_id);

  const handleMove = () => {
    if (!targetClass || targetClass === student.classroom_id) {
      toast({ title: "Info", description: "Sélectionnez une classe différente." });
      return;
    }
    runAction("change-class", student, { classroomId: targetClass });
  };

  return (
    <ModalShell title={`Changer de classe — ${student.first_name}`} onClose={onClose}>
      <div className="space-y-4">
        <p className="text-sm text-[#7A6A5E]">Classe actuelle : <span className="font-bold text-[#3B2416]">{student.classroom_name}</span></p>
        <div>
          <label className="block font-bold text-[#3B2416] text-sm mb-1">Nouvelle classe</label>
          <select
            value={targetClass}
            onChange={(e) => setTargetClass(e.target.value)}
            className="w-full border-2 border-[#F0E7DA] bg-white rounded-xl px-3 py-2.5 text-sm font-bold text-[#3B2416] focus:outline-none focus:border-[#7D6AF8]"
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        {otherClasses.length === 0 && (
          <p className="text-xs text-[#F59E0B] font-medium">Aucune autre classe disponible. Créez une classe depuis « Mes classes ».</p>
        )}
        <div className="flex gap-2 pt-2">
          <Button variant="outline" onClick={onClose} className="flex-1 rounded-xl border-2 border-[#F0E7DA] font-bold">
            Annuler
          </Button>
          <Button onClick={handleMove} disabled={busy} className="flex-1 rounded-xl bg-[#7D6AF8] hover:bg-[#6552E8] text-white font-bold">
            {busy ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ArrowLeftRight className="w-4 h-4 mr-2" />}
            Déplacer
          </Button>
        </div>
      </div>
    </ModalShell>
  );
}

function StudentDrawer({
  student,
  onClose,
  onEdit,
}: {
  student: StudentRow | null;
  onClose: () => void;
  onEdit: (s: StudentRow) => void;
}) {
  return (
    <AnimatePresence>
      {student && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
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
                  {student.display_name || `${student.first_name} ${student.last_name || ""}`.trim()}
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
                  <p className="text-2xl font-black text-[#F59E0B]">{student.stars}</p>
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

              <div className="flex items-center gap-2 text-[#7A6A5E] mb-6">
                <Trophy className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {student.badges.length > 0 ? `Récompenses : ${student.badges.join(" ")}` : "Aucune récompense pour le moment."}
                </span>
              </div>

              <Button
                onClick={() => onEdit(student)}
                className="w-full rounded-xl bg-[#7D6AF8] hover:bg-[#6552E8] text-white font-bold"
              >
                <Pencil className="w-4 h-4 mr-2" /> Modifier les informations
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
