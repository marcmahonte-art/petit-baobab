// src/app/school/classes/ClientPage.tsx
"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSchoolStore } from '@/stores/school-store';
import { Plus } from 'lucide-react';
import ClassCard from '@/components/school/ClassCard';
import RightPanel from '@/components/school/RightPanel';

export default function ClassesClient() {
  const { classes, loading, error, fetchClasses, dashboardData } = useSchoolStore();
  const router = useRouter();
  const [selectedShareClass, setSelectedShareClass] = useState<any>(null);

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (classes.length > 0 && !selectedShareClass) {
      setSelectedShareClass(classes[0]);
    }
  }, [classes, selectedShareClass]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full border-4 border-[#7D6AF8] border-t-transparent h-12 w-12" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-600 bg-red-50 border border-red-200 rounded-2xl">
        <p className="mb-4 font-bold">{error}</p>
        <button
          onClick={() => fetchClasses()}
          className="px-6 py-2.5 bg-[#7D6AF8] text-white font-bold rounded-xl hover:bg-[#6552E8]"
        >
          Réessayer
        </button>
      </div>
    );
  }

  const handleShare = (cls: any) => {
    setSelectedShareClass(cls);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {/* List Area */}
      <div className="lg:col-span-2 xl:col-span-3 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black text-[#3B2416]">Mes classes</h1>
            <p className="text-xs font-semibold text-[#7A6A5E] mt-0.5">
              Gérez toutes vos classes Petit Baobab.
            </p>
          </div>
          <button
            onClick={() => router.push('/school/classes/create')}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-[#7D6AF8] hover:bg-[#6552E8] text-white font-bold text-xs rounded-xl shadow-sm shadow-[#7D6AF8]/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Créer une classe
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {classes.map((cls, idx) => (
            <ClassCard
              key={cls.id}
              cls={cls}
              index={idx}
              onClick={() => router.push(`/school/classes/${cls.id}`)}
              onShare={() => handleShare(cls)}
            />
          ))}
        </div>
      </div>

      {/* Right Sidebar Panel */}
      <div className="lg:col-span-1">
        <RightPanel
          selectedClass={selectedShareClass}
          stars={dashboardData?.stars || { balance: 0, monthly_limit: 1000, renewal_date: new Date().toISOString() }}
        />
      </div>
    </div>
  );
}
