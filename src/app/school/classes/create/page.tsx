import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSchoolStore } from '@/stores/school-store';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Créer une classe – École',
};

export default function CreateClassPage() {
  const [name, setName] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [loading, setLoading] = useState(false);
  const { error, createClass } = useSchoolStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    await createClass(name.trim(), academicYear.trim() || undefined);
    setLoading(false);
    router.push('/school/classes');
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-6 bg-white/60 backdrop-blur-sm rounded-xl shadow-md">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Créer une nouvelle classe</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          placeholder="Nom de la classe"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Input
          placeholder="Année académique (ex. 2025-2026)"
          value={academicYear}
          onChange={(e) => setAcademicYear(e.target.value)}
        />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <Button type="submit" disabled={loading || !name.trim()} className="w-full">
          {loading ? 'Création...' : 'Créer la classe'}
        </Button>
      </form>
    </div>
  );
}
