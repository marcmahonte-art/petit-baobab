import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BUTTON_IN } from '../animations';
import { usePortfolioStore } from '../store/portfolio-store';
import { Canvas, FabricImage } from 'fabric';

/**
 * StoryCreator – composant UI permettant à l'enfant de créer une histoire personnalisée.
 * Chaque chapitre peut être illustré à l'aide de l'endpoint `/api/drawing/magic`.
 */
export function StoryCreator() {
  const [title, setTitle] = useState('');
  const [chapters, setChapters] = useState<string[]>(['']);
  const childId = usePortfolioStore((s) => s.childId);

  const addChapter = () => setChapters((c) => [...c, '']);

  const generateIllustration = async (index: number) => {
    if (!childId) return;
    const prompt = chapters[index];
    const res = await fetch('/api/drawing/magic', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, childId }),
    });
    if (!res.ok) return;
    const { imageUrl } = await res.json();
    const canvas = new Canvas(`canvas-chapter-${index}`);
    FabricImage.fromURL(imageUrl).then((img) => {
      canvas.setDimensions({ width: 600, height: 800 });
      canvas.add(img);
    });
  };

  return (
    <motion.div className="p-4 max-w-4xl mx-auto" variants={BUTTON_IN} initial="hidden" animate="visible">
      <h2 className="text-2xl font-bold mb-4">Créer une histoire personnalisée</h2>
      <input type="text" placeholder="Titre de l'histoire" value={title} onChange={(e) => setTitle(e.target.value)} className="border rounded p-2 w-full mb-4" />
      {chapters.map((text, i) => (
        <div key={i} className="mb-6">
          <textarea placeholder={`Chapitre ${i + 1}`} value={text} onChange={(e) => {
            const newChapters = [...chapters];
            newChapters[i] = e.target.value;
            setChapters(newChapters);
          }} className="border rounded p-2 w-full h-32 mb-2" />
          <button onClick={() => generateIllustration(i)} className="bg-blue-600 text-white px-3 py-1 rounded mr-2">Générer illustration</button>
          <canvas id={`canvas-chapter-${i}`} className="border mt-2" />
        </div>
      ))}
      <button onClick={addChapter} className="bg-green-600 text-white px-4 py-2 rounded">Ajouter un chapitre</button>
    </motion.div>
  );
}
