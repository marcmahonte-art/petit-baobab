"use client";
import React, { useState } from 'react';
import { useSchoolStore } from '@/stores/school-store';
import { useRouter } from 'next/navigation';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';

export default function BulkImportPage() {
  const { classes, addStudentsBulk, loading } = useSchoolStore();
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [fileContent, setFileContent] = useState<string>('');
  const [error, setError] = useState<string>('');
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setFileContent(text);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    setError('');
    if (!selectedClassId) {
      setError('Veuillez sélectionner une classe.');
      return;
    }
    if (!fileContent) {
      setError('Veuillez choisir un fichier JSON.');
      return;
    }
    try {
      const students = JSON.parse(fileContent);
      await addStudentsBulk(selectedClassId, students);
      toast({ title: 'Importation réussie', description: "Les élèves ont été ajoutés." });
      router.push('/school/classes');
    } catch (e: any) {
      setError(e.message || "Erreur lors de l'importation.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6 bg-white rounded-2xl border border-[#F0E7DA] shadow-sm mt-8">
      <h1 className="text-2xl font-bold text-gray-800">Importation en masse d'élèves</h1>
      {error && <p className="text-red-600 text-sm font-semibold">{error}</p>}
      
      <div className="space-y-2">
        <label className="block font-bold text-[#3B2416]">Classe cible</label>
        <select
          value={selectedClassId}
          onChange={(e) => setSelectedClassId(e.target.value)}
          className="w-full border-2 border-[#F0E7DA] bg-white rounded-xl p-3 focus:outline-none focus:border-[#7D6AF8] transition-colors"
        >
          <option value="">Sélectionner une classe</option>
          {classes.map((cls) => (
            <option key={cls.id} value={cls.id}>
              {cls.name} ({cls.class_code})
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="block font-bold text-[#3B2416]">Fichier JSON des élèves</label>
        <input 
          type="file" 
          accept="application/json" 
          onChange={handleFileChange} 
          className="border-2 border-[#F0E7DA] rounded-xl p-3 w-full bg-white focus:outline-none focus:border-[#7D6AF8]" 
        />
      </div>

      <Button onClick={handleImport} disabled={loading} className="w-full py-6 font-bold text-base rounded-xl">
        {loading ? 'Importation...' : 'Importer les élèves'}
      </Button>
    </div>
  );
}
