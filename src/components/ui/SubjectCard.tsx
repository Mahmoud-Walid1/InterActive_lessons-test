'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Microscope, Calculator, BookMarked, MapPin, Languages, Book } from 'lucide-react';

interface SubjectCardProps {
  id: string;
  name: string;
  icon: string;
  color: string;
  gradeId: string;
}

const subjectIconMap: Record<string, any> = {
  Microscope,
  Calculator,
  BookMarked,
  MapPin,
  Languages
};

export function SubjectCard({ id, name, icon, color, gradeId }: SubjectCardProps) {
  const IconComponent = subjectIconMap[icon] || Book;

  return (
    <Link href={`/grades/${gradeId}/subjects/${id}/lessons`}>
      <motion.div
        whileHover={{ y: -6, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="group relative overflow-hidden rounded-3xl border-2 border-[#1B3B36]/10 bg-[#FFFDF7] p-6 shadow-md transition hover:shadow-xl"
      >
        <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${color} text-[#FFFDF7] shadow-lg mb-4`}>
          <IconComponent className="h-7 w-7" />
        </div>

        <h3 className="font-baloo text-xl font-extrabold text-[#1B3B36] group-hover:text-[#3E92B0] transition-colors">
          مادة {name}
        </h3>
        <p className="mt-1 font-tajawal text-xs text-[#1B3B36]/70">خريطة الوحدات والدروس المشفرة</p>
      </motion.div>
    </Link>
  );
}
