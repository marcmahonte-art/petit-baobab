// ============================================================
// Petit Baobab — Sélecteur d'espace (parent + école) (Phase 6.2)
// ============================================================

import { redirect } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Users, School as SchoolIcon, ChevronRight, LogOut } from "lucide-react";
import { getServerUser } from "@/lib/auth";
import { getSupabaseServer } from "@/lib/supabaseServer";
import { clearAuthCookies } from "@/lib/auth";

export const metadata = {
  title: "Choisir mon espace – Petit Baobab",
};

const FAMILY_BLUE = "#1194FF";
const FAMILY_BLUE_BG = "#E6F1FB";
const SCHOOL_GREEN = "#1D9E75";
const SCHOOL_GREEN_BG = "#E1F5EE";

export default async function SelectSpacePage() {
  const user = await getServerUser();
  if (!user) redirect("/login");

  const supabase = await getSupabaseServer();
  const { data: account } = await supabase
    .from("accounts")
    .select("plan, has_family_sub, has_school_sub")
    .eq("user_id", user.id)
    .single();

  // Pas les deux flags → rediriger selon le plan
  if (!account || !account.has_family_sub || !account.has_school_sub) {
    if (account?.has_school_sub) redirect("/school/dashboard");
    redirect("/dashboard");
  }

  const displayName = user.email ? user.email.split("@")[0] : "Cher utilisateur";

  async function handleLogout() {
    "use server";
    await clearAuthCookies();
  }

  return (
    <main className="min-h-screen bg-[#FFF9F2] flex flex-col">
      <header className="flex items-center justify-between px-5 md:px-10 py-5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-petit-baobab.svg" alt="Petit Baobab" className="h-9 w-auto" />
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-[#3B2416] hidden sm:inline">{displayName}</span>
          <form
            action={async () => {
              "use server";
              await handleLogout();
              redirect("/login");
            }}
          >
            <button
              type="submit"
              className="flex items-center gap-1.5 text-sm font-bold text-[#7A6A5E] hover:text-[#1C1C3A] cursor-pointer bg-transparent border-none"
            >
              <LogOut className="w-4 h-4" /> Se déconnecter
            </button>
          </form>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 pb-12">
        <div className="w-full max-w-2xl">
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#1C1C3A] text-center mb-1">
            Où voulez-vous aller aujourd&apos;hui ?
          </h1>
          <p className="text-sm font-semibold text-[#7A6A5E] text-center mb-8">
            Votre compte a accès aux deux espaces.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Espace famille */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              whileHover={{ y: -4 }}
              className="rounded-[20px] p-6 border-2"
              style={{ backgroundColor: FAMILY_BLUE_BG, borderColor: "transparent" }}
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                style={{ backgroundColor: FAMILY_BLUE }}
              >
                <Users className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-extrabold text-[#1C1C3A] mb-2">Espace famille</h2>
              <p className="text-sm font-semibold text-[#5A6B7A] mb-6 leading-relaxed">
                Dessins et livres de votre enfant à la maison. Accédez à vos abonnements personnels.
              </p>
              <Link
                href="/dashboard"
                className="w-full h-12 rounded-full font-bold text-white flex items-center justify-center gap-2 transition-transform active:scale-95"
                style={{ backgroundColor: FAMILY_BLUE }}
              >
                Accéder <ChevronRight className="w-4 h-4" />
              </Link>
            </motion.div>

            {/* Espace école */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              whileHover={{ y: -4 }}
              className="rounded-[20px] p-6 border-2"
              style={{ backgroundColor: SCHOOL_GREEN_BG, borderColor: "transparent" }}
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                style={{ backgroundColor: SCHOOL_GREEN }}
              >
                <SchoolIcon className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-extrabold text-[#1C1C3A] mb-2">Espace école</h2>
              <p className="text-sm font-semibold text-[#3F6B5C] mb-6 leading-relaxed">
                Gérez vos classes, suivez vos élèves. Tableau de bord enseignant.
              </p>
              <Link
                href="/school/dashboard"
                className="w-full h-12 rounded-full font-bold text-white flex items-center justify-center gap-2 transition-transform active:scale-95"
                style={{ backgroundColor: SCHOOL_GREEN }}
              >
                Accéder <ChevronRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>

          {/* Checkbox mémoriser le choix */}
          <div className="mt-6 flex items-center justify-center gap-2">
            <input
              type="checkbox"
              id="remember-space"
              className="w-4 h-4 accent-[#7D6AF8]"
              onChange={(e) => {
                if (e.target.checked) {
                  localStorage.setItem("pb-default-space", "1");
                } else {
                  localStorage.removeItem("pb-default-space");
                }
              }}
            />
            <label htmlFor="remember-space" className="text-sm font-semibold text-[#7A6A5E] cursor-pointer">
              Se souvenir de mon choix par défaut
            </label>
          </div>
        </div>
      </div>
    </main>
  );
}
