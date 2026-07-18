"use client";
import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Users, Eye, Share2, MoreHorizontal, Pencil, Archive, Trash2 } from "lucide-react";
import { ClassroomWithStats } from "@/types/school";

const CLASS_ILLUSTRATIONS = [
  "/illustrations/school/class-1.png",
  "/illustrations/school/class-2.png",
  "/illustrations/school/class-3.png",
  "/illustrations/school/class-4.png",
  "/illustrations/school/class-5.png",
  "/illustrations/school/class-6.png",
];

type ClassCardProps = {
  cls: ClassroomWithStats;
  onClick?: () => void;
  onShare?: () => void;
  index?: number;
};

function formatLastActivity(dateStr: string | null): string {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const time = `${hours}:${minutes}`;

  if (diffHours < 24) {
    return `Aujourd'hui à ${time}`;
  } else if (diffHours < 48) {
    return `Hier à ${time}`;
  } else {
    return `${date.toLocaleDateString("fr-FR")} à ${time}`;
  }
}

export default function ClassCard({ cls, onClick, onShare, index = 0 }: ClassCardProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const illustrationSrc =
    CLASS_ILLUSTRATIONS[(cls.illustration_index - 1) % CLASS_ILLUSTRATIONS.length];
  
  const progressColor = cls.completion_percentage >= 75 
    ? "#10B981" 
    : cls.completion_percentage >= 50 
      ? "#FF9500" 
      : "#F59E0B";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.35 }}
      className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all cursor-pointer overflow-hidden group border border-[#F0E7DA]"
      onClick={onClick}
    >
      {/* Illustration header */}
      <div className="relative h-[130px] bg-gradient-to-br from-[#FFF8E1] to-[#FFF0D4] overflow-hidden">
        <Image
          src={illustrationSrc}
          alt={cls.name}
          width={300}
          height={130}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Badge name */}
        <span
          className="inline-block px-3 py-1 rounded-lg text-white text-xs font-bold mb-2"
          style={{ backgroundColor: cls.color_badge }}
        >
          {cls.name}
        </span>

        {/* Code */}
        <p className="text-xs text-[#7A6A5E] font-medium mb-2">{cls.class_code}</p>

        {/* Student count */}
        <div className="flex items-center gap-1.5 text-sm text-[#3B2416] mb-3">
          <Users className="w-3.5 h-3.5 text-[#7A6A5E]" />
          <span className="font-medium">{cls.student_count} élèves</span>
        </div>

        {/* Progress bar */}
        <div className="mb-2">
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="font-bold" style={{ color: progressColor }}>
              {cls.completion_percentage}%
            </span>
            <span className="text-[#7A6A5E] font-medium">activités complétées</span>
          </div>
          <div className="w-full h-2 bg-[#F5F0EB] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${cls.completion_percentage}%`,
                backgroundColor: progressColor,
              }}
            />
          </div>
        </div>

        {/* Last activity */}
        <p className="text-[11px] text-[#7A6A5E] mb-3">
          <span className="font-medium">Dernière activité</span>
          <br />
          {formatLastActivity(cls.last_activity_at)}
        </p>

        {/* Action icons */}
        <div className="flex items-center gap-2 pt-2 border-t border-[#F5F0EB]">
          <button
            className="p-1.5 rounded-lg hover:bg-[#F5F0EB] transition-colors cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/school/classes/${cls.id}`);
            }}
            title="Voir la classe"
          >
            <Eye className="w-4 h-4 text-[#7A6A5E]" />
          </button>
          <button
            className="p-1.5 rounded-lg hover:bg-[#F5F0EB] transition-colors cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              onShare?.();
            }}
            title="Partager"
          >
            <Share2 className="w-4 h-4 text-[#7A6A5E]" />
          </button>
          <div className="relative">
            <button
              className="p-1.5 rounded-lg hover:bg-[#F5F0EB] transition-colors cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(!menuOpen);
              }}
              title="Plus d'options"
            >
              <MoreHorizontal className="w-4 h-4 text-[#7A6A5E]" />
            </button>
            {menuOpen && (
              <div
                className="absolute right-0 bottom-full mb-1 z-50 w-44 bg-white rounded-xl border border-[#F0E7DA] shadow-lg p-1.5"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-[#3B2416] hover:bg-[#F5F0EB] transition-colors cursor-pointer"
                  onClick={() => { setMenuOpen(false); router.push(`/school/classes/${cls.id}/edit`); }}
                >
                  <Pencil className="w-4 h-4" /> Modifier
                </button>
                <button
                  className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-[#3B2416] hover:bg-[#F5F0EB] transition-colors cursor-pointer"
                  onClick={() => { setMenuOpen(false); /* archiver */ }}
                >
                  <Archive className="w-4 h-4" /> Archiver
                </button>
                <button
                  className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                  onClick={() => { setMenuOpen(false); /* supprimer */ }}
                >
                  <Trash2 className="w-4 h-4" /> Supprimer
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
