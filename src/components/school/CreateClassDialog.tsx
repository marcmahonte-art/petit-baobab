"use client";
import React, { useState } from 'react';
import { useSchoolStore } from '@/stores/school-store';
import { useRouter } from 'next/navigation';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function CreateClassDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [loading, setLoading] = useState(false);
  const { error, createClass } = useSchoolStore();
  const router = useRouter();

  const handleCreate = async () => {
    if (!name.trim()) return;
    setLoading(true);
    await createClass(name.trim(), academicYear.trim() || undefined);
    setLoading(false);
    setOpen(false);
    // Refresh class list then navigate back to list page
    router.push('/school/classes');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition">
          Créer une classe
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-white/60 backdrop-blur-sm rounded-xl">
        <DialogHeader>
          <DialogTitle>Nouvelle classe</DialogTitle>
          <DialogDescription>Entrez le nom et l'année académique (optionnel).</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <Input
            placeholder="Nom de la classe"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            placeholder="Année académique (ex. 2025-2026)"
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
          />
          {error && <p className="text-red-600 text-sm">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={loading}>
            Annuler
          </Button>
          <Button onClick={handleCreate} disabled={loading || !name.trim()}>
            {loading ? 'Création...' : 'Créer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
