import React, { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSchoolStore } from '@/stores/school-store';
import { Users, Star, BookOpen, Pencil } from 'lucide-react';

export const metadata = {
  title: 'Détail de la classe – École',
};

export default function ClassDetailPage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const {
    selectedClass,
    loadingDetail,
    errorDetail,
    fetchClassDetail,
    students,
    fetchStudents,
  } = useSchoolStore();

  useEffect(() => {
    if (!selectedClass || selectedClass.id !== id) {
      fetchClassDetail(id);
    }
    // Fetch students after class detail is loaded
    if (selectedClass && selectedClass.id === id) {
      fetchStudents(id);
    }
  }, [id, selectedClass?.id]);

  if (loadingDetail) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full border-4 border-primary border-t-transparent h-12 w-12" />
      </div>
    );
  }

  if (errorDetail) {
    return (
      <div className="p-6 text-center text-red-600">
        <p className="mb-4">{errorDetail}</p>
        <button
          onClick={() => fetchClassDetail(id)}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition"
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (!selectedClass) return null;

  const { name, class_code, student_count, active_today, total_drawings, total_books } = selectedClass;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">{name}</h1>
        <button
          onClick={() => router.push('/school/classes')}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
        >
          Retour
        </button>
      </div>

      {/* Class stats card */}
      <div className="p-5 bg-white/60 backdrop-blur-sm rounded-xl shadow-sm">
        <p className="text-sm text-gray-600 mb-2">Code de classe : <span className="font-medium">{class_code}</span></p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-2 text-gray-700">
            <Users className="w-5 h-5" />
            <span>{student_count} élèves</span>
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <Star className="w-5 h-5" />
            <span>{active_today} actifs aujourd'hui</span>
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <Pencil className="w-5 h-5" />
            <span>{total_drawings} dessins</span>
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <BookOpen className="w-5 h-5" />
            <span>{total_books} livres</span>
          </div>
        </div>
      </div>

      {/* Students table */}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Élèves de la classe</h2>
        <table className="min-w-full bg-white/60 backdrop-blur-sm rounded-lg shadow-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Nom</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Mascotte</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Profil ID</th>
            </tr>
          </thead>
          <tbody>
            {students.map((st) => (
              <tr key={st.id} className="border-t">
                <td className="px-4 py-2 text-gray-800">{st.display_name || st.first_name}</td>
                <td className="px-4 py-2 text-gray-800 capitalize">{st.mascot}</td>
                <td className="px-4 py-2 text-gray-800 break-all">{st.profile_id}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
