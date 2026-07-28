"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Building2,
  User,
  Bell,
  GraduationCap,
  CreditCard,
  Shield,
  Download,
  Puzzle,
  AlertTriangle,
  ChevronRight,
  Pencil,
  Check,
  X,
  Globe,
  Mail,
  Phone,
  MapPin,
  Save,
  Loader2,
  Smartphone,
  Monitor,
  LogOut,
  RefreshCw,
  ExternalLink,
  Star,
  Crown,
  FileText,
  History,
  School,
  Users,
  BookOpen,
  Palette,
  Sparkles,
  Activity,
  Eye,
  EyeOff,
  Copy,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { getSupabaseClient } from "@/lib/supabase-client";
import { useAuthStore } from "@/lib/auth-store";
import type { BillingData } from "@/lib/billing/server";

const PLAN_LABELS: Record<string, string> = {
  free: "Gratuit",
  decouverte: "Découverte",
  super_baobab: "Super Baobab",
  "super-baobab": "Super Baobab",
  ecole_pro: "École Pro",
  "ecole-pro": "École Pro",
};

interface ParametresClientProps {
  user: { id: string; email: string };
  account: any;
  billing: BillingData | null;
  teacherProfile: { full_name: string | null; avatar_url: string | null } | null;
}

export default function ParametresClient({ user, account, billing, teacherProfile }: ParametresClientProps) {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);
  const [saving, setSaving] = useState(false);
  const [schoolForm, setSchoolForm] = useState({
    name: account?.school_name || "",
    address: account?.address || "",
    city: account?.city || "",
    country: account?.country || "",
    phone: account?.phone || "",
    email: account?.email || user.email || "",
    website: account?.website || "",
    logo_url: account?.school_logo_url || "",
  });
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    whatsappNotifications: false,
    newsletter: true,
    weeklyReport: true,
    language: "fr",
  });
  const [pedagogicalConfig, setPedagogicalConfig] = useState({
    maxStudents: 200,
    maxClasses: 10,
    starsEnabled: true,
    badgesEnabled: true,
    aiBooksEnabled: true,
    aiDrawingsEnabled: true,
    activitiesEnabled: true,
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: "", newPassword: "", confirm: "" });
  const [editingSchool, setEditingSchool] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const supabase = getSupabaseClient();
  const initials = teacherProfile?.full_name
    ? teacherProfile.full_name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
    : user.email.slice(0, 2).toUpperCase();
  const teacherName = teacherProfile?.full_name || user.email.split("@")[0];
  const planName = PLAN_LABELS[account?.plan] || account?.plan || "École Pro";

  async function handleSaveSchool() {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("accounts")
        .update({
          school_name: schoolForm.name,
          address: schoolForm.address,
          city: schoolForm.city,
          country: schoolForm.country,
          phone: schoolForm.phone,
          email: schoolForm.email,
          website: schoolForm.website,
          school_logo_url: schoolForm.logo_url || null,
        })
        .eq("id", account.id);
      if (error) throw error;
      toast.success("Informations de l'établissement mises à jour.");
      setEditingSchool(false);
    } catch (e: any) {
      toast.error(e.message || "Erreur lors de la sauvegarde.");
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword() {
    if (passwordForm.newPassword !== passwordForm.confirm) {
      toast.error("Les mots de passe ne correspondent pas.");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: passwordForm.newPassword });
      if (error) throw error;
      toast.success("Mot de passe mis à jour.");
      setShowPasswordForm(false);
      setPasswordForm({ current: "", newPassword: "", confirm: "" });
    } catch (e: any) {
      toast.error(e.message || "Erreur lors du changement de mot de passe.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSavePreferences() {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("accounts")
        .update({
          settings: preferences,
        })
        .eq("id", account.id);
      if (error) throw error;
      toast.success("Préférences enregistrées.");
    } catch (e: any) {
      toast.error(e.message || "Erreur lors de la sauvegarde.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSavePedagogical() {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("accounts")
        .update({
          settings: { ...(account?.settings || {}), ...pedagogicalConfig },
        })
        .eq("id", account.id);
      if (error) throw error;
      toast.success("Configuration pédagogique enregistrée.");
    } catch (e: any) {
      toast.error(e.message || "Erreur lors de la sauvegarde.");
    } finally {
      setSaving(false);
    }
  }

  async function handleLogoutAll() {
    try {
      await supabase.auth.signOut({ scope: "others" });
      toast.success("Toutes les autres sessions ont été déconnectées.");
    } catch {
      toast.error("Erreur lors de la déconnexion des sessions.");
    }
  }

  async function handleDeleteSchool(permanent: boolean) {
    setSaving(true);
    try {
      if (permanent) {
        const { error } = await supabase
          .from("accounts")
          .update({ deleted_at: new Date().toISOString() })
          .eq("id", account.id);
        if (error) throw error;
        await logout();
        router.push("/");
        toast.success("Compte école supprimé.");
      } else {
        const { error } = await supabase
          .from("accounts")
          .update({ archived_at: new Date().toISOString() })
          .eq("id", account.id);
        if (error) throw error;
        toast.success("École archivée.");
      }
    } catch (e: any) {
      toast.error(e.message || "Erreur.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 text-xs font-semibold text-[#7A6A5E] mb-1"
      >
        <span>École</span>
        <ChevronRight className="w-3 h-3" />
        <span className="text-[#3B2416]">Paramètres</span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <h1 className="text-[28px] md:text-[36px] font-extrabold text-[#3B2416] leading-tight">
          Paramètres
        </h1>
        <p className="text-[15px] font-semibold text-[#7A6A5E] mt-0.5">
          Gérez votre établissement, votre abonnement et vos préférences.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-[70%_30%] gap-6">
        {/* Main Column */}
        <div className="space-y-6">
          {/* 1. Établissement */}
          <SectionCard icon={Building2} title="Informations de l'établissement" index={0}>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative w-14 h-14 shrink-0">
                    {schoolForm.logo_url ? (
                      <img
                        src={schoolForm.logo_url}
                        alt="Logo école"
                        className="w-full h-full rounded-xl object-cover border border-[#E5E0D5]"
                        onError={() => setSchoolForm({ ...schoolForm, logo_url: "" })}
                      />
                    ) : (
                      <div className="w-full h-full rounded-xl bg-[#7D6AF8]/10 flex items-center justify-center text-xl font-extrabold text-[#7D6AF8]">
                        {schoolForm.name ? schoolForm.name[0].toUpperCase() : "E"}
                      </div>
                    )}
                    {editingSchool && (
                      <label className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#7D6AF8] flex items-center justify-center cursor-pointer shadow-md hover:bg-[#6552E8] transition-colors">
                        <Pencil className="w-3 h-3 text-white" />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={uploadingLogo}
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            setUploadingLogo(true);
                            try {
                              const formData = new FormData();
                              formData.append("file", file);
                              const res = await fetch("/api/school/upload", {
                                method: "POST",
                                body: formData,
                              });
                              if (!res.ok) throw new Error("Upload échoué");
                              const { url } = await res.json();
                              setSchoolForm({ ...schoolForm, logo_url: url });
                              // Sauvegarder immédiatement
                              const { error } = await supabase
                                .from("accounts")
                                .update({ school_logo_url: url })
                                .eq("id", account.id);
                              if (error) throw error;
                              toast.success("Logo mis à jour.");
                            } catch (e: any) {
                              toast.error(e.message || "Erreur upload logo.");
                            } finally {
                              setUploadingLogo(false);
                            }
                          }}
                        />
                      </label>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#3B2416]">{schoolForm.name || "Nom non défini"}</p>
                    <p className="text-xs text-[#7A6A5E]">{schoolForm.email}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingSchool(!editingSchool)}
                  className="cursor-pointer"
                >
                  {editingSchool ? <X className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
                  {editingSchool ? "Annuler" : "Modifier"}
                </Button>
              </div>

              {editingSchool ? (
                <form
                  onSubmit={(e) => { e.preventDefault(); handleSaveSchool(); }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#3B2416] mb-1">Nom de l'école</label>
                      <Input
                        value={schoolForm.name}
                        onChange={(e) => setSchoolForm({ ...schoolForm, name: e.target.value })}
                        placeholder="Ex: École Primaire de..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#3B2416] mb-1">Site internet</label>
                      <Input
                        value={schoolForm.website}
                        onChange={(e) => setSchoolForm({ ...schoolForm, website: e.target.value })}
                        placeholder="https://..."
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-[#3B2416] mb-1">Adresse</label>
                      <Input
                        value={schoolForm.address}
                        onChange={(e) => setSchoolForm({ ...schoolForm, address: e.target.value })}
                        placeholder="Rue, quartier..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#3B2416] mb-1">Ville</label>
                      <Input
                        value={schoolForm.city}
                        onChange={(e) => setSchoolForm({ ...schoolForm, city: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#3B2416] mb-1">Pays</label>
                      <Input
                        value={schoolForm.country}
                        onChange={(e) => setSchoolForm({ ...schoolForm, country: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#3B2416] mb-1">Téléphone</label>
                      <Input
                        value={schoolForm.phone}
                        onChange={(e) => setSchoolForm({ ...schoolForm, phone: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#3B2416] mb-1">Email</label>
                      <Input
                        type="email"
                        value={schoolForm.email}
                        onChange={(e) => setSchoolForm({ ...schoolForm, email: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit" disabled={saving} className="cursor-pointer">
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Enregistrer
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <InfoRow icon={MapPin} label="Adresse" value={`${schoolForm.address || "—"}, ${schoolForm.city || ""}, ${schoolForm.country || ""}`} />
                  <InfoRow icon={Phone} label="Téléphone" value={schoolForm.phone || "—"} />
                  <InfoRow icon={Mail} label="Email" value={schoolForm.email} />
                  <InfoRow icon={Globe} label="Site web" value={schoolForm.website || "—"} />
                </div>
              )}
            </div>
          </SectionCard>

          {/* 2. Compte administrateur */}
          <SectionCard icon={User} title="Compte administrateur" index={1}>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="w-14 h-14">
                  <AvatarImage src={teacherProfile?.avatar_url || undefined} />
                  <AvatarFallback className="bg-[#7D6AF8] text-white font-bold text-lg">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-bold text-[#3B2416]">{teacherName}</p>
                  <p className="text-xs text-[#7A6A5E]">{user.email}</p>
                  <p className="text-xs text-[#7A6A5E]">Administrateur</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-[#FFF9F2] text-xs">
                <div>
                  <span className="text-[#7A6A5E]">Date de création</span>
                  <p className="font-bold text-[#3B2416]">
                    {account?.created_at
                      ? new Date(account.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
                      : "—"}
                  </p>
                </div>
                <div>
                  <span className="text-[#7A6A5E]">Dernière connexion</span>
                  <p className="font-bold text-[#3B2416]">
                    {account?.last_login_at
                      ? new Date(account.last_login_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
                      : "—"}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowPasswordForm(!showPasswordForm)} className="cursor-pointer">
                  <Eye className="w-4 h-4" />
                  Changer le mot de passe
                </Button>
                <Button variant="outline" size="sm" className="cursor-pointer" disabled>
                  <Shield className="w-4 h-4" />
                  Activer MFA
                </Button>
              </div>

              {showPasswordForm && (
                <form
                  onSubmit={(e) => { e.preventDefault(); handleChangePassword(); }}
                  className="space-y-3 p-4 rounded-xl bg-[#FFF9F2] border border-[#E5E0D5]"
                >
                  <Input
                    type="password"
                    placeholder="Nouveau mot de passe"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    required
                    minLength={6}
                  />
                  <Input
                    type="password"
                    placeholder="Confirmer le mot de passe"
                    value={passwordForm.confirm}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                    required
                    minLength={6}
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setShowPasswordForm(false)} className="cursor-pointer">
                      Annuler
                    </Button>
                    <Button type="submit" size="sm" disabled={saving} className="cursor-pointer">
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                      Mettre à jour
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </SectionCard>

          {/* 3. Préférences */}
          <SectionCard icon={Bell} title="Préférences" index={2}>
            <div className="space-y-4">
              <div className="space-y-3">
                {[
                  { key: "emailNotifications", label: "Notifications Email", desc: "Recevoir les alertes par email" },
                  { key: "whatsappNotifications", label: "Notifications WhatsApp", desc: "Recevoir les alertes sur WhatsApp" },
                  { key: "newsletter", label: "Newsletter", desc: "Recevoir nos actualités et offres" },
                  { key: "weeklyReport", label: "Rapport hebdomadaire", desc: "Recevoir le rapport de la semaine chaque lundi" },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-bold text-[#3B2416]">{item.label}</p>
                      <p className="text-xs text-[#7A6A5E]">{item.desc}</p>
                    </div>
                    <button
                      onClick={() => setPreferences({ ...preferences, [item.key]: !(preferences as any)[item.key] })}
                      className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${
                        (preferences as any)[item.key] ? "bg-[#7D6AF8]" : "bg-gray-200"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                          (preferences as any)[item.key] ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#E5E0D5]">
                <div>
                  <p className="text-sm font-bold text-[#3B2416]">Langue</p>
                  <p className="text-xs text-[#7A6A5E]">Langue d'interface</p>
                </div>
                <select
                  value={preferences.language}
                  onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                  className="px-3 py-2 rounded-xl border border-[#E5E0D5] bg-white text-sm font-bold text-[#3B2416] focus:outline-none focus:border-[#7D6AF8]"
                >
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                </select>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSavePreferences} disabled={saving} size="sm" className="cursor-pointer">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Enregistrer
                </Button>
              </div>
            </div>
          </SectionCard>

          {/* 4. Configuration pédagogique */}
          <SectionCard icon={GraduationCap} title="Configuration pédagogique" index={3}>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#3B2416] mb-1">Max. élèves</label>
                  <Input
                    type="number"
                    value={pedagogicalConfig.maxStudents}
                    onChange={(e) => setPedagogicalConfig({ ...pedagogicalConfig, maxStudents: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#3B2416] mb-1">Max. classes</label>
                  <Input
                    type="number"
                    value={pedagogicalConfig.maxClasses}
                    onChange={(e) => setPedagogicalConfig({ ...pedagogicalConfig, maxClasses: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <p className="text-xs font-bold text-[#3B2416] uppercase tracking-wide">Fonctionnalités activées</p>
                {[
                  { key: "starsEnabled", label: "Étoiles", icon: Star },
                  { key: "badgesEnabled", label: "Badges", icon: CheckCircle2 },
                  { key: "aiBooksEnabled", label: "Livres IA", icon: BookOpen },
                  { key: "aiDrawingsEnabled", label: "Dessins IA", icon: Palette },
                  { key: "activitiesEnabled", label: "Activités", icon: Activity },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-2">
                      <item.icon className="w-4 h-4 text-[#7D6AF8]" />
                      <span className="text-sm font-semibold text-[#3B2416]">{item.label}</span>
                    </div>
                    <button
                      onClick={() => setPedagogicalConfig({ ...pedagogicalConfig, [item.key]: !(pedagogicalConfig as any)[item.key] })}
                      className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${
                        (pedagogicalConfig as any)[item.key] ? "bg-[#1D9E75]" : "bg-gray-200"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                          (pedagogicalConfig as any)[item.key] ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSavePedagogical} disabled={saving} size="sm" className="cursor-pointer">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Enregistrer
                </Button>
              </div>
            </div>
          </SectionCard>

          {/* 5. Abonnement */}
          <SectionCard icon={CreditCard} title="Abonnement" index={4}>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-extrabold text-[#3B2416]">{planName}</p>
                  <p className="text-xs text-[#7A6A5E]">
                    {billing?.subscription?.renew_at
                      ? `Renouvellement le ${new Date(billing.subscription.renew_at).toLocaleDateString("fr-FR")}`
                      : "Aucun abonnement actif"}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FFF8E1] border border-[#FFE08A]">
                  <Star className="w-4 h-4 text-[#FFB300] fill-[#FFB300]" />
                  <span className="text-sm font-bold text-[#3B2416]">{account?.stars_balance || 0}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center text-xs">
                <div className="p-3 rounded-xl bg-[#FFF9F2]">
                  <p className="text-[#7A6A5E]">Classes</p>
                  <p className="text-lg font-extrabold text-[#3B2416]">{billing?.account?.id ? "—" : "—"} / {pedagogicalConfig.maxClasses}</p>
                </div>
                <div className="p-3 rounded-xl bg-[#FFF9F2]">
                  <p className="text-[#7A6A5E]">Élèves</p>
                  <p className="text-lg font-extrabold text-[#3B2416]">{billing?.account?.id ? "—" : "—"} / {pedagogicalConfig.maxStudents}</p>
                </div>
                <div className="p-3 rounded-xl bg-[#FFF9F2]">
                  <p className="text-[#7A6A5E]">Étoiles</p>
                  <p className="text-lg font-extrabold text-[#3B2416]">{account?.stars_balance || 0}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button onClick={() => router.push("/school/dashboard/billing")} variant="default" size="sm" className="cursor-pointer">
                  <CreditCard className="w-4 h-4" />
                  Gérer mon abonnement
                </Button>
                <Button onClick={() => router.push("/school/etoiles")} variant="outline" size="sm" className="cursor-pointer">
                  <Star className="w-4 h-4" />
                  Acheter des étoiles
                </Button>
                <Button onClick={() => router.push("/school/dashboard/billing")} variant="ghost" size="sm" className="cursor-pointer">
                  <History className="w-4 h-4" />
                  Historique
                </Button>
              </div>
            </div>
          </SectionCard>

          {/* 6. Sécurité */}
          <SectionCard icon={Shield} title="Sécurité" index={5}>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#FFF9F2]">
                <div className="flex items-center gap-3">
                  <Monitor className="w-8 h-8 text-[#7D6AF8]" />
                  <div>
                    <p className="text-sm font-bold text-[#3B2416]">Session en cours</p>
                    <p className="text-xs text-[#7A6A5E]">Cet appareil • Actif maintenant</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-[#1D9E75]/10 text-[#1D9E75] text-[10px] font-bold">Actuelle</span>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={handleLogoutAll} className="cursor-pointer">
                  <LogOut className="w-4 h-4" />
                  Déconnecter toutes les sessions
                </Button>
              </div>
            </div>
          </SectionCard>

          {/* 7. Export */}
          <SectionCard icon={Download} title="Export" index={6}>
            <div className="space-y-3">
              <p className="text-xs text-[#7A6A5E]">Exportez vos données aux formats CSV, Excel ou PDF.</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { label: "Élèves", icon: Users },
                  { label: "Classes", icon: School },
                  { label: "Rapports", icon: FileText },
                  { label: "Livres", icon: BookOpen },
                  { label: "Coloriages", icon: Palette },
                ].map((item) => (
                  <Button key={item.label} variant="outline" size="sm" className="justify-start cursor-pointer" disabled>
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Button>
                ))}
              </div>
              <div className="flex gap-2 pt-1">
                <span className="px-2 py-1 rounded-md bg-[#F5F0EB] text-[10px] font-bold text-[#7A6A5E]">CSV</span>
                <span className="px-2 py-1 rounded-md bg-[#F5F0EB] text-[10px] font-bold text-[#7A6A5E]">Excel</span>
                <span className="px-2 py-1 rounded-md bg-[#F5F0EB] text-[10px] font-bold text-[#7A6A5E]">PDF</span>
              </div>
            </div>
          </SectionCard>

          {/* 8. Intégrations */}
          <SectionCard icon={Puzzle} title="Intégrations" index={7}>
            <div className="space-y-3">
              {[
                { name: "Orange Money", icon: Smartphone, connected: true },
                { name: "Moov Money", icon: Smartphone, connected: false },
                { name: "Carte bancaire", icon: CreditCard, connected: true },
                { name: "WhatsApp Business", icon: Phone, connected: false },
                { name: "Google Classroom", icon: School, connected: false },
                { name: "Microsoft Teams", icon: Users, connected: false },
              ].map((integration, i) => (
                <div key={integration.name} className="flex items-center justify-between p-3 rounded-xl hover:bg-[#FFF9F2] transition-colors border border-[#F0E7DA]/50">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#F5F0EB] flex items-center justify-center">
                      <integration.icon className="w-4 h-4 text-[#7A6A5E]" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#3B2416]">{integration.name}</p>
                      <p className={`text-[11px] font-semibold ${integration.connected ? "text-[#1D9E75]" : "text-[#B0A092]"}`}>
                        {integration.connected ? "Connecté" : "Non connecté"}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" disabled className="cursor-pointer">
                    Configurer
                  </Button>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* 9. Zone dangereuse */}
          <SectionCard icon={AlertTriangle} title="Zone dangereuse" index={8} danger>
            <div className="space-y-3">
              <p className="text-xs text-red-600/70">
                Ces actions sont irréversibles. Soyez certain avant de continuer.
              </p>
              <div className="flex flex-wrap gap-2">
                <Dialog.Root>
                  <Dialog.Trigger asChild>
                    <Button variant="outline" size="sm" className="border-red-200 text-red-600 hover:bg-red-50 cursor-pointer">
                      <ArchiveIcon className="w-4 h-4" />
                      Archiver l'école
                    </Button>
                  </Dialog.Trigger>
                  <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 bg-black/40 z-[100] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
                    <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-[#F0E7DA] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]">
                      <Dialog.Title className="text-lg font-extrabold text-[#3B2416] mb-2">
                        Archiver l'établissement ?
                      </Dialog.Title>
                      <Dialog.Description className="text-sm text-[#7A6A5E] mb-6">
                        L'école sera désactivée. Vous pourrez la réactiver plus tard.
                      </Dialog.Description>
                      <div className="flex justify-end gap-2">
                        <Dialog.Close asChild>
                          <Button variant="outline" size="sm" className="cursor-pointer">Annuler</Button>
                        </Dialog.Close>
                        <Dialog.Close asChild>
                          <Button onClick={() => handleDeleteSchool(false)} size="sm" className="bg-[#FF5E83] hover:bg-red-600 cursor-pointer">
                            Archiver
                          </Button>
                        </Dialog.Close>
                      </div>
                    </Dialog.Content>
                  </Dialog.Portal>
                </Dialog.Root>

                <Dialog.Root>
                  <Dialog.Trigger asChild>
                    <Button size="sm" className="bg-red-600 hover:bg-red-700 cursor-pointer">
                      <XCircle className="w-4 h-4" />
                      Supprimer définitivement
                    </Button>
                  </Dialog.Trigger>
                  <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 bg-black/40 z-[100] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
                    <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-[#F0E7DA] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]">
                      <Dialog.Title className="text-lg font-extrabold text-[#3B2416] mb-2">
                        Supprimer définitivement ?
                      </Dialog.Title>
                      <Dialog.Description className="text-sm text-[#7A6A5E] mb-6">
                        Cette action est irréversible. Toutes les données de l'école seront perdues.
                      </Dialog.Description>
                      <div className="flex justify-end gap-2">
                        <Dialog.Close asChild>
                          <Button variant="outline" size="sm" className="cursor-pointer">Annuler</Button>
                        </Dialog.Close>
                        <Dialog.Close asChild>
                          <Button
                            onClick={() => handleDeleteSchool(true)}
                            size="sm"
                            className="bg-red-600 hover:bg-red-700 cursor-pointer"
                          >
                            Tout supprimer
                          </Button>
                        </Dialog.Close>
                      </div>
                    </Dialog.Content>
                  </Dialog.Portal>
                </Dialog.Root>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-[20px] bg-white border border-[#F0E7DA] p-6 shadow-sm"
          >
            <h3 className="text-sm font-extrabold text-[#3B2416] uppercase tracking-wide mb-4">Raccourcis</h3>
            <div className="space-y-2">
              {[
                { label: "Facturation", icon: CreditCard, href: "/school/dashboard/billing" },
                { label: "Étoiles", icon: Star, href: "/school/etoiles" },
                { label: "Classes", icon: School, href: "/school/classes" },
                { label: "Élèves", icon: Users, href: "/school/students" },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={() => router.push(item.href)}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl hover:bg-[#FFF9F2] text-sm font-bold text-[#7A6A5E] hover:text-[#3B2416] transition-colors cursor-pointer"
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                  <ChevronRight className="w-3.5 h-3.5 ml-auto text-[#B0A092]" />
                </button>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-[20px] bg-gradient-to-br from-[#7D6AF8] to-[#6552E8] p-6 shadow-sm text-white"
          >
            <Crown className="w-8 h-8 mb-3 opacity-80" />
            <h3 className="text-base font-extrabold mb-1">Plan {planName}</h3>
            <p className="text-xs opacity-80 mb-4">
              {billing?.subscription?.renew_at
                ? `Renouvellement le ${new Date(billing.subscription.renew_at).toLocaleDateString("fr-FR")}`
                : "Profitez de toutes les fonctionnalités"}
            </p>
            <Button
              onClick={() => router.push("/school/dashboard/billing")}
              size="sm"
              className="w-full bg-white/20 hover:bg-white/30 text-white border border-white/30 cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" />
              Gérer mon abonnement
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function SectionCard({
  icon: Icon,
  title,
  children,
  index,
  danger,
}: {
  icon: any;
  title: string;
  children: React.ReactNode;
  index: number;
  danger?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.3 }}
      className={`rounded-[20px] border p-6 shadow-sm ${
        danger
          ? "bg-red-50/50 border-red-200"
          : "bg-white border-[#F0E7DA]"
      }`}
    >
      <div className="flex items-center gap-2.5 mb-4">
        <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
          danger ? "bg-red-100" : "bg-[#FFF5CC]"
        }`}>
          <Icon className={`w-4 h-4 ${danger ? "text-red-500" : "text-[#FFB300]"}`} />
        </div>
        <h3 className={`text-base font-extrabold ${danger ? "text-red-600" : "text-[#3B2416]"}`}>
          {title}
        </h3>
      </div>
      {children}
    </motion.div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="w-4 h-4 text-[#7A6A5E] mt-0.5 shrink-0" />
      <div>
        <p className="text-xs text-[#7A6A5E]">{label}</p>
        <p className="text-sm font-bold text-[#3B2416]">{value}</p>
      </div>
    </div>
  );
}

function ArchiveIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="5" rx="1" />
      <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" />
      <path d="M10 12h4" />
    </svg>
  );
}
