import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Users, Star, BookOpen, Pencil } from 'lucide-react';
import { ClassroomWithStats } from '@/types/school';

type ClassCardProps = {
  cls: ClassroomWithStats;
  onClick?: () => void;
};

export default function ClassCard({ cls, onClick }: ClassCardProps) {
  return (
    <motion.div
      className="p-5 bg-white/60 backdrop-blur-sm rounded-xl shadow-sm hover:shadow-md transition cursor-pointer"
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
    >
      <h4 className="text-lg font-medium text-gray-800 mb-2">{cls.name}</h4>
      <p className="text-sm text-gray-600 mb-2">Code : {cls.class_code}</p>
      <div className="flex flex-wrap gap-2 text-sm text-gray-700">
        <span className="flex items-center">
          <Users className="w-4 h-4 mr-1" />{cls.student_count} élèves
        </span>
        <span className="flex items-center">
          <Star className="w-4 h-4 mr-1" />{cls.active_today} actifs aujourd'hui
        </span>
        <span className="flex items-center">
          <Pencil className="w-4 h-4 mr-1" />{cls.total_drawings} dessins
        </span>
        <span className="flex items-center">
          <BookOpen className="w-4 h-4 mr-1" />{cls.total_books} livres
        </span>
      </div>
    </motion.div>
  );
}
