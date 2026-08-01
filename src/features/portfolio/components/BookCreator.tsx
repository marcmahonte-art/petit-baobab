import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BUTTON_IN } from '../animations';
import { usePortfolioStore } from '../store/portfolio-store';
import { fabric } from 'fabric';

/**
 * BookCreator – composant UI permettant à l'enfant de créer un livre illustré.
 * Utilise fabric.js comme canvas de dessin et l'API Magic Drawing d'OpenAI pour
 * générer les images à partir de prompts texte.
 */
export function BookCreator() {
  const [title, setTitle] = useState('');
  const [pages, setPages] = useState<string[]>(['']);
  const childId = usePortfolioStore((s) => s.childId);

  const handleAddPage = () => setPages((p) => [...p, '']);

  const handleGenerateImage = async (pageIndex: number) => {
    if (!childId) return;
    const prompt = pages[pageIndex];
    // Appel à l'endpoint backend qui utilise OpenAI Magic Drawing
    const res = await fetch('/api/drawing/magic', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, childId }),
    });
    if (!res.ok) return;
    const { imageUrl } = await res.json();
    // Insérer l'image dans le canvas
    const canvas = new fabric.Canvas(`canvas-page-${pageIndex}`);
    fabric.Image.fromURL(imageUrl, (img) => {
      canvas.setWidth(600);
      canvas.setHeight(800);
      canvas.add(img);
    });
  };

  return (
    <motion.div
      className="p-4 max-w-4xl mx-auto"
      variants={BUTTON_IN}
      initial="hidden"
      animate="visible"
    >
      <h2 className="text-2xl font-bold mb-4">Créer un livre illustré</h2>
      <input
        type="text"
        placeholder="Titre du livre"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="border rounded p-2 w-full mb-4"
      />
      {pages.map((content, i) => (
        <div key={i} className="mb-6">
          <textarea
            placeholder={`Contenu de la page ${i + 1}`}
            value={content}
            onChange={(e) => {
              const newPages = [...pages];
              newPages[i] = e.target.value;
              setPages(newPages);
            }}
            className="border rounded p-2 w-full h-32 mb-2"
          />
          <button
            type="button"
            onClick={() => handleGenerateImage(i)}
            className="bg-blue-600 text-white px-3 py-1 rounded"
          >
            Générer l'illustration
          </button>
          <canvas id={`canvas-page-${i}`} className="border mt-2" />
        </div>
      ))}
      <button
        type="button"
        onClick={handleAddPage}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        Ajouter une page
      </button>
    </motion.div>
  );
}
