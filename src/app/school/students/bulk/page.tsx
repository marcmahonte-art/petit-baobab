import React, { useState } from 'react';
import { useSchoolStore } from '@/stores/school-store';
import { useRouter } from 'next/navigation';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

export const metadata = {
  title: "Importation en masse d'élèves – École",
};

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
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Importation en masse d'élèves</h1>
      {error && <p className="text-red-600">{error}</p>}
      <div>
        <label className="block mb-2 font-medium">Classe cible</label>
        <Select onValueChange={setSelectedClassId} value={selectedClassId}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Sélectionner une classe" />
          </SelectTrigger>
          <SelectContent>
            {classes.map((cls) => (
              <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="block mb-2 font-medium">Fichier JSON des élèves</label>
        <input type="file" accept="application/json" onChange={handleFileChange} className="border rounded p-2 w-full" />
      </div>
      <Button onClick={handleImport} disabled={loading} className="w-full">
        {loading ? 'Importation...' : 'Importer'}
      </Button>
    </div>
  );
}
