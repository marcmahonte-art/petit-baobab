"use client";
import { useState, useEffect } from "react";
import { useSchoolStore } from "@/stores/school-store";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import DashboardHeader from "@/components/school/DashboardHeader";
import DashboardStats from "@/components/school/DashboardStats";
import ClassesGrid from "@/components/school/ClassesGrid";
import RecentActivities from "@/components/school/RecentActivities";
import MotivationBanner from "@/components/school/MotivationBanner";
import RightPanel from "@/components/school/RightPanel";
import { useRealtimeStars } from "@/lib/hooks/useRealtimeStars";
import { useAuthStore } from "@/lib/auth-store";

export default function DashboardClient() {
  const { dashboardData, fetchDashboard, loading, error } = useSchoolStore();
  const router = useRouter();
  const [selectedShareClass, setSelectedShareClass] = useState<any>(null);

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 30000); // Refresh every 30s (fallback)
    return () => clearInterval(interval);
  }, []);

  // Temps réel : dès qu'une mise à jour du solde de l'école arrive, on
  // rafraîchit le tableau de bord (complète le polling 30s ci-dessus).
  const accountId = dashboardData?.stars?.account_id;
  useRealtimeStars(accountId, () => {
    fetchDashboard();
  });

  // Set default share classroom when data loads
  useEffect(() => {
    if (dashboardData?.classrooms?.length && !selectedShareClass) {
      setSelectedShareClass(dashboardData.classrooms[0]);
    }
  }, [dashboardData, selectedShareClass]);

  if (error && !dashboardData) {
    return (
      <div className="p-6 text-center text-red-600 bg-red-50 border border-red-200 rounded-2xl max-w-xl mx-auto mt-12">
        <p className="mb-4 font-bold text-lg">Erreur de chargement</p>
        <p className="text-sm text-red-500 mb-6">{error}</p>
        <button
          onClick={() => fetchDashboard()}
          className="px-6 py-2.5 bg-[#7D6AF8] hover:bg-[#6552E8] text-white font-bold rounded-xl transition-colors shadow-sm"
        >
          Réessayer
        </button>
      </div>
    );
  }

  const summary = dashboardData?.summary;
  const stars = dashboardData?.stars || { balance: 0, monthly_limit: 1000, renewal_date: new Date().toISOString() };

  const handleShareClass = (cls: any) => {
    setSelectedShareClass(cls);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header showing teacher details */}
      <DashboardHeader />

      {/* 2. Stats row showing main metrics */}
      <DashboardStats />

      {/* 3. Main 3-Column Dashboard Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* Left main area (2/3 width) */}
        <div className="lg:col-span-2 xl:col-span-3 space-y-6">
          {/* Section: Classes */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-[#3B2416]">
                  Mes classes
                </h2>
                <p className="text-xs font-semibold text-[#7A6A5E] mt-0.5">
                  Gérez vos classes et suivez la progression de vos élèves.
                </p>
              </div>

              {/* Add classroom button */}
              {dashboardData?.classrooms && dashboardData.classrooms.length > 0 && (
                <button
                  onClick={() => router.push("/school/classes/create")}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-[#7D6AF8] hover:bg-[#6552E8] text-white font-bold text-xs rounded-xl shadow-sm shadow-[#7D6AF8]/20 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nouvelle classe</span>
                </button>
              )}
            </div>

            {/* ClassesGrid Component */}
            <ClassesGrid onShareClass={handleShareClass} />
          </section>

          {/* Section: Recent Activities Feed */}
          <section>
            <RecentActivities />
          </section>

          {/* Motivation banner for stars */}
          {summary && summary.stars_earned_this_week > 0 && (
            <MotivationBanner starsEarnedThisWeek={summary.stars_earned_this_week} />
          )}
        </div>

        {/* Right sidebar column (1/3 width) */}
        <div className="lg:col-span-1">
          <RightPanel selectedClass={selectedShareClass} stars={stars} />
        </div>
      </div>
    </div>
  );
}
