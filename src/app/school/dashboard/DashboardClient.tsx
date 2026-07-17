"use client";
import { useState, useEffect } from "react";
import { useSchoolStore } from '@/stores/school-store';
import { useRouter } from "next/navigation";
import DashboardCard from "@/components/school/DashboardCard";
import ClassCard from "@/components/school/ClassCard";

export default function DashboardClient() {
  const { dashboardData, fetchDashboard, loading, error } = useSchoolStore();
  const router = useRouter();

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 30000); // 30 seconds refresh
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full border-4 border-primary border-t-transparent h-12 w-12" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-600">
        <p className="mb-4">{error}</p>
        <button
          onClick={() => fetchDashboard()}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition"
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (!dashboardData) return null;

  const { stars, classrooms, recent_activity, summary } = dashboardData;

  return (
    <div className="space-y-8 p-6">
      {/* Stars bar */}
      <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Solde d'étoiles</h2>
        <div className="flex items-center gap-4">
          <div className="text-3xl font-bold text-primary">{stars.balance} ★</div>
          <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-width"
              style={{ width: `${(stars.balance / stars.monthly_limit) * 100}%` }}
            />
          </div>
          <div className="text-sm text-gray-600">Renouvellement le {stars.renewal_date?.split('T')[0]}</div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard title="Élèves" value={summary.total_students} icon="👨‍🎓" />
        <DashboardCard title="Actifs aujourd'hui" value={summary.active_today} icon="🟢" />
        <DashboardCard title="Dessins" value={summary.total_drawings} icon="✏️" />
        <DashboardCard title="Livres" value={summary.total_books} icon="📚" />
      </div>

      {/* Classes */}
      <section>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Mes classes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classrooms.map((cls) => (
            <ClassCard key={cls.id} cls={cls} onClick={() => router.push(`/school/classes/${cls.id}`)} />
          ))}
        </div>
      </section>

      {/* Recent activity */}
      <section>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Activité récente</h2>
        <ul className="space-y-2">
          {recent_activity.map((act) => (
            <li key={act.id} className="flex items-center gap-2 text-gray-700 bg-white/60 backdrop-blur-sm rounded-md p-2">
              <span className="font-medium">{act.student_name || 'Élève'}</span>
              <span>·</span>
              <span>{act.action.replace('_', ' ')}</span>
              <span className="ml-auto text-sm text-gray-500">{new Date(act.created_at).toLocaleString()}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
