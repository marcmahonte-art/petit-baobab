import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSchoolStore } from '@/stores/school-store';
import { Users, Star, BookOpen, Pencil, Plus } from 'lucide-react';

export const metadata = {
  title: 'Mes classes – École',
};

export default function ClassesPage() {
  const { classes, loading, error, fetchClasses } = useSchoolStore();
  const router = useRouter();

  useEffect(() => {
    if (classes.length === 0) fetchClasses();
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
          onClick={() => fetchClasses()}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with create button */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Mes classes</h1>
        <button
          onClick={() => router.push('/school/classes/create')}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition"
        >
          <Plus className="w-5 h-5" />
          Créer une classe
        </button>
      </div>

      {/* Grid of class cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {classes.map((cls) => (
          <div
            key={cls.id}
            className="p-5 bg-white/60 backdrop-blur-sm rounded-xl shadow-sm hover:shadow-md transition cursor-pointer"
            onClick={() => router.push(`/school/classes/${cls.id}`)}
          >
            <h4 className="text-lg font-medium text-gray-800 mb-2">{cls.name}</h4>
            <p className="text-sm text-gray-600 mb-2">Code : {cls.class_code}</p>
            <div className="flex flex-wrap gap-2 text-sm text-gray-700">
              <span className="flex items-center"><Users className="w-4 h-4 mr-1" />{cls.student_count} élèves</span>
              <span className="flex items-center"><Star className="w-4 h-4 mr-1" />{cls.active_today} actifs aujourd'hui</span>
              <span className="flex items-center"><Pencil className="w-4 h-4 mr-1" />{cls.total_drawings} dessins</span>
              <span className="flex items-center"><BookOpen className="w-4 h-4 mr-1" />{cls.total_books} livres</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
