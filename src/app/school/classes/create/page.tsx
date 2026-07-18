"use client";
import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSchoolStore } from '@/stores/school-store';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ImagePlus, X } from 'lucide-react';
import Image from 'next/image';

export default function CreateClassPage() {
  const [name, setName] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { error, createClass } = useSchoolStore();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);

    let imageUrl = '';
    if (imageFile) {
      const formData = new FormData();
      formData.append('file', imageFile);
      try {
        const uploadRes = await fetch('/api/school/upload', {
          method: 'POST',
          body: formData,
        });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          imageUrl = uploadData.url || '';
        }
      } catch {
        // upload échoué, on crée la classe sans image
      }
    }

    await createClass(name.trim(), academicYear.trim() || undefined, imageUrl);
    setLoading(false);
    router.push('/school/classes');
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-6 bg-white rounded-2xl shadow-sm border border-[#F0E7DA]">
      <h1 className="text-2xl font-bold text-[#3B2416] mb-4">Créer une nouvelle classe</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          placeholder="Nom de la classe"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="border-[#F0E7DA]"
        />
        <Input
          placeholder="Année académique (ex. 2025-2026)"
          value={academicYear}
          onChange={(e) => setAcademicYear(e.target.value)}
          className="border-[#F0E7DA]"
        />

        {/* Image upload */}
        <div>
          <p className="text-sm font-bold text-[#3B2416] mb-2">Image de la classe (optionnelle)</p>
          {imagePreview ? (
            <div className="relative w-full h-40 rounded-xl overflow-hidden border border-[#F0E7DA]">
              <Image
                src={imagePreview}
                alt="Aperçu"
                fill
                className="object-cover"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 p-1 bg-white rounded-full shadow cursor-pointer"
              >
                <X className="w-4 h-4 text-red-500" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center gap-2 w-full h-40 rounded-xl border-2 border-dashed border-[#F0E7DA] bg-[#FFF9F2] hover:bg-[#F5F0EB] transition-colors cursor-pointer"
            >
              <ImagePlus className="w-6 h-6 text-[#7A6A5E]" />
              <span className="text-sm font-medium text-[#7A6A5E]">Choisir une image</span>
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}
        <Button type="submit" disabled={loading || !name.trim()} className="w-full py-6 font-bold text-base rounded-xl">
          {loading ? 'Création...' : 'Créer la classe'}
        </Button>
      </form>
    </div>
  );
}
