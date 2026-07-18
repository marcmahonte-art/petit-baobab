"use client";
import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSchoolStore } from '@/stores/school-store';
import { Users, Star, BookOpen, Pencil, Plus, X, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const MASCOTS = [
  { value: 'awa', label: 'Awa', emoji: '🐵' },
  { value: 'lion', label: 'Lion', emoji: '🦁' },
  { value: 'robot', label: 'Robot', emoji: '🤖' },
] as const;

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

  const [showForm, setShowForm] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [mascot, setMascot] = useState('awa');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!selectedClass || selectedClass.id !== id) {
      fetchClassDetail(id);
    }
    if (selectedClass && selectedClass.id === id) {
      fetchStudents(id);
    }
  }, [id, selectedClass?.id]);

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/school/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classroom_id: id,
          students: [{
            first_name: firstName.trim(),
            last_name: lastName.trim() || undefined,
            display_name: firstName.trim(),
            mascot,
          }],
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        const msg = data.message || data.error || "Impossible d'ajouter l'élève.";
        toast({ title: 'Erreur', description: msg });
        return;
      }
      toast({ title: 'Élève ajouté', description: `${firstName} a été ajouté(e) à la classe.` });
      setFirstName('');
      setLastName('');
      setMascot('awa');
      setShowForm(false);
      fetchStudents(id);
      fetchClassDetail(id);
    } catch (err: any) {
      toast({ title: 'Erreur', description: err.message });
    } finally {
      setSaving(false);
    }
  };

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
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-gray-800">{name}</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#7D6AF8] hover:bg-[#6552E8] text-white font-bold text-sm rounded-xl shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter un élève</span>
          </button>
          <button
            onClick={() => router.push('/school/classes')}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition cursor-pointer"
          >
            Retour
          </button>
        </div>
      </div>

      {/* Add student form */}
      {showForm && (
        <form onSubmit={handleAddStudent} className="p-5 bg-white rounded-xl border border-[#F0E7DA] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#3B2416]">Ajouter un élève</h3>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="p-1 hover:bg-[#F5F0EB] rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4 text-[#7A6A5E]" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-[#3B2416] mb-1">Prénom *</label>
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                minLength={2}
                maxLength={50}
                placeholder="Prénom de l'élève"
                className="w-full h-11 px-4 rounded-xl border-2 border-[#F0E7DA] bg-white text-[#3B2416] font-medium outline-none focus:border-[#7D6AF8] transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#3B2416] mb-1">Nom (optionnel)</label>
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Nom de famille"
                className="w-full h-11 px-4 rounded-xl border-2 border-[#F0E7DA] bg-white text-[#3B2416] font-medium outline-none focus:border-[#7D6AF8] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-[#3B2416] mb-2">Mascotte</label>
            <div className="flex gap-2">
              {MASCOTS.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setMascot(m.value)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all cursor-pointer ${
                    mascot === m.value
                      ? 'border-[#7D6AF8] bg-[#7D6AF8]/10'
                      : 'border-[#F0E7DA] hover:border-[#7D6AF8]/50'
                  }`}
                >
                  <span className="text-lg">{m.emoji}</span>
                  <span className="text-sm font-bold text-[#3B2416]">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-xl border border-[#F0E7DA] text-[#7A6A5E] font-bold text-sm hover:bg-[#F5F0EB] transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving || !firstName.trim()}
              className="px-5 py-2 bg-[#7D6AF8] hover:bg-[#6552E8] disabled:opacity-50 text-white font-bold text-sm rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
            >
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Ajout...</> : 'Ajouter'}
            </button>
          </div>
        </form>
      )}

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
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Élèves de la classe ({students.length})
          </h2>
        </div>
        {students.length === 0 ? (
          <div className="text-center py-12 bg-white/40 rounded-xl border border-dashed border-[#F0E7DA]">
            <p className="text-sm font-medium text-[#7A6A5E]">Aucun élève dans cette classe.</p>
            <p className="text-xs text-[#7A6A5E] mt-1">Cliquez sur "+ Ajouter un élève" pour commencer.</p>
          </div>
        ) : (
          <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-[#F0E7DA]">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-[#7A6A5E] uppercase tracking-wider">Nom</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-[#7A6A5E] uppercase tracking-wider">Mascotte</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-[#7A6A5E] uppercase tracking-wider">Profil</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0E7DA]">
                {students.map((st) => (
                  <tr key={st.id} className="hover:bg-[#FFF9F2] transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-[#3B2416]">{st.display_name || st.first_name}</td>
                    <td className="px-4 py-3 text-sm text-[#7A6A5E] capitalize">{st.mascot}</td>
                    <td className="px-4 py-3 text-xs text-[#7A6A5E] break-all font-mono">{st.profile_id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
