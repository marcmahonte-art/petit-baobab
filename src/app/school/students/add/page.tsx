"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSchoolStore } from '@/stores/school-store';
import { Button } from '@/components/ui/button';
import { UserPlus, ArrowLeft } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const MASCOTS = [
  { value: 'bobo', label: 'Bôbô le Lion', emoji: '🦁' },
  { value: 'kaya', label: "Kaya l'Éléphant", emoji: '🐘' },
  { value: 'zuri', label: 'Zuri la Girafe', emoji: '🦒' },
  { value: 'momo', label: 'Momo le Singe', emoji: '🐒' },
  { value: 'kiki', label: 'Kiki le Perroquet', emoji: '🦜' },
  { value: 'baobab', label: 'Petit Baobab', emoji: '🌳' },
] as const;

export default function AddStudentPage() {
  const router = useRouter();
  const { classes, fetchClasses } = useSchoolStore();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [mascot, setMascot] = useState('bobo');
  const [classroomId, setClassroomId] = useState('');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    fetchClasses();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !classroomId) return;
    setLoading(true);
    try {
      const res = await fetch('/api/school/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classroom_id: classroomId,
          students: [
            {
              first_name: firstName.trim(),
              last_name: lastName.trim() || undefined,
              display_name: firstName.trim(),
              mascot,
            },
          ],
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: 'Erreur', description: data.error || "Impossible d'ajouter l'élève." });
        return;
      }
      toast({ title: 'Élève ajouté', description: `${firstName} a été ajouté(e) à la classe.` });
      router.push('/school/classes/' + classroomId);
    } catch (err: any) {
      toast({ title: 'Erreur', description: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-6 bg-white rounded-2xl shadow-sm border border-[#F0E7DA]">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1 text-sm text-[#7A6A5E] hover:text-[#3B2416] mb-4 cursor-pointer bg-transparent border-none"
      >
        <ArrowLeft className="w-4 h-4" /> Retour
      </button>

      <h1 className="text-2xl font-bold text-[#3B2416] mb-1">Ajouter un élève</h1>
      <p className="text-sm text-[#7A6A5E] mb-6">Créez un élève qui pourra se connecter avec le code de la classe.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-[#3B2416] mb-1">Classe</label>
          <select
            value={classroomId}
            onChange={(e) => setClassroomId(e.target.value)}
            required
            className="w-full h-12 px-4 rounded-xl border-2 border-[#F0E7DA] bg-white text-[#3B2416] font-medium outline-none focus:border-[#7D6AF8] transition-colors"
          >
            <option value="">Sélectionner une classe</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name} ({cls.class_code})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold text-[#3B2416] mb-1">Prénom</label>
          <input
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            minLength={2}
            maxLength={50}
            placeholder="Prénom de l'élève"
            className="w-full h-12 px-4 rounded-xl border-2 border-[#F0E7DA] bg-white text-[#3B2416] font-medium outline-none focus:border-[#7D6AF8] transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-[#3B2416] mb-1">Nom (optionnel)</label>
          <input
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Nom de famille"
            className="w-full h-12 px-4 rounded-xl border-2 border-[#F0E7DA] bg-white text-[#3B2416] font-medium outline-none focus:border-[#7D6AF8] transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-[#3B2416] mb-2">Mascotte</label>
          <div className="grid grid-cols-3 gap-2">
            {MASCOTS.map((m) => (
              <button
                key={m.value}
                type="button"
                onClick={() => setMascot(m.value)}
                className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all cursor-pointer ${
                  mascot === m.value
                    ? 'border-[#7D6AF8] bg-[#7D6AF8]/10'
                    : 'border-[#F0E7DA] hover:border-[#7D6AF8]/50'
                }`}
              >
                <span className="text-2xl">{m.emoji}</span>
                <span className="text-xs font-bold text-[#3B2416]">{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading || !firstName.trim() || !classroomId}
          className="w-full py-6 font-bold text-base rounded-xl"
        >
          {loading ? 'Ajout...' : <><UserPlus className="w-4 h-4" /> Ajouter l'élève</>}
        </Button>
      </form>
    </div>
  );
}
