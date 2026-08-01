import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BUTTON_IN } from '../animations';
import { usePortfolioStore } from '../store/portfolio-store';

/**
 * ExportButton – déclenche la génération d'un PDF du portfolio via l'endpoint
 * `/api/portfolio/export`. Affiche un spinner pendant le traitement.
 */
export function ExportButton() {
  const [loading, setLoading] = useState(false);
  const childId = usePortfolioStore((s) => s.childId);

  const handleExport = async () => {
    if (!childId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/portfolio/export?childId=${childId}`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `portfolio_${childId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.button
      type="button"
      variants={BUTTON_IN}
      initial="hidden"
      animate="visible"
      whileHover={{ scale: 1.05 }}
      disabled={loading}
      onClick={handleExport}
      className="flex items-center gap-2 rounded-md bg-[#FF8A00] px-4 py-2 text-sm font-semibold text-white hover:bg-[#e07a00] disabled:opacity-50"
    >
      {loading ? 'Export en cours…' : 'Exporter PDF'}
    </motion.button>
  );
}
