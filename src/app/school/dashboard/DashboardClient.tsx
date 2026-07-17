"use client";
import { useState, useEffect } from "react";
import { useSchoolStore } from "@/stores/school-store";
import { useRouter } from "next/navigation";
import { Plus, ArrowRight } from "lucide-react";
import SchoolHeader from "@/components/school/SchoolHeader";
import StatsBar from "@/components/school/StatsBar";
import ClassCard from "@/components/school/ClassCard";
import RecentActivities from "@/components/school/RecentActivities";
import MotivationBanner from "@/components/school/MotivationBanner";
import RightPanel from "@/components/school/RightPanel";

export default function DashboardClient() {
  const { dashboardData, fetchDashboard, loading, error } = useSchoolStore();
  const router = useRouter();
  const [selectedShareClass, setSelectedShareClass] = useState<any>(null);

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 30000); // 30 seconds refresh
    return () => clearInterval(interval);
  }, []);

  // Update default selected class for sharing when dashboard data loads
  useEffect(() => {
    if (dashboardData?.classrooms?.length && !selectedShareClass) {
      setSelectedShareClass(dashboardData.classrooms[0]);
    }
  }, [dashboardData, selectedShareClass]);

  if (loading && !dashboardData) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full border-4 border-[#7D6AF8] border-t-transparent h-12 w-12" />
      </div>
    );
  }

  if (error && !dashboardData) {
    return (
      <div className="p-6 text-center text-red-600 bg-red-50 border border-red-200 rounded-2xl">
        <p className="mb-4 font-bold">{error}</p>
        <button
          onClick={() => fetchDashboard()}
          className="px-6 py-2.5 bg-[#7D6AF8] text-white font-bold rounded-xl hover:bg-[#6552E8] transition-colors"
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (!dashboardData) return null;

  const { teacher, stars, classrooms, recent_activity, summary } = dashboardData;

  const handleShareClass = (cls: any) => {
    setSelectedShareClass(cls);
  };

  return (
    <div className="space-y-6">
      {/* 1. School Top Header Greeting */}
      <SchoolHeader
        teacherName={teacher.name}
        teacherRole={teacher.role}
        starsRemaining={stars.remaining}
        avatar={teacher.avatar}
      />

      {/* 2. Stats Bar Summary */}
      <StatsBar
        totalClasses={summary.total_classes}
        totalStudents={summary.total_students}
        totalColoriages={summary.total_coloriages}
        totalBooks={summary.total_books}
        starsBalance={stars.balance}
        starsLimit={stars.monthly_limit}
      />

      {/* 3. Main Dashboard Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* Left/Center Main Column */}
        <div className="lg:col-span-2 xl:col-span-3 space-y-6">
          {/* Section header: Mes classes */}
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
              <button
                onClick={() => router.push("/school/classes/create")}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-[#7D6AF8] hover:bg-[#6552E8] text-white font-bold text-xs rounded-xl shadow-sm shadow-[#7D6AF8]/20 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Nouvelle classe</span>
              </button>
            </div>

            {/* Classes list card grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {classrooms.slice(0, 6).map((cls, idx) => (
                <ClassCard
                  key={cls.id}
                  cls={cls}
                  index={idx}
                  onClick={() => router.push(`/school/classes/${cls.id}`)}
                  onShare={() => handleShareClass(cls)}
                />
              ))}
            </div>

            {/* View all classes link button */}
            <div className="flex justify-center pt-2">
              <button
                onClick={() => router.push("/school/classes")}
                className="flex items-center gap-2 px-6 py-3 border-2 border-[#F0E7DA] bg-white text-[#7C69F6] font-bold text-xs rounded-2xl hover:bg-[#F5F0EB] transition-colors cursor-pointer"
              >
                <span>Voir toutes mes classes</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </section>

          {/* Section: Recent Activities */}
          <section>
            <RecentActivities
              activities={recent_activity}
              onViewAll={() => router.push("/school/activities")}
            />
          </section>

          {/* Weekly Motivation Banner */}
          <MotivationBanner starsEarnedThisWeek={summary.stars_earned_this_week} />
        </div>

        {/* Right Sidebar Widget Panel */}
        <div className="lg:col-span-1">
          <RightPanel selectedClass={selectedShareClass} stars={stars} />
        </div>
      </div>
    </div>
  );
}
