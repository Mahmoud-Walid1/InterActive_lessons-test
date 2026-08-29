'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles, BookOpen, Compass, Award, Globe, GraduationCap } from 'lucide-react';

interface GradeCardProps {
  id: string;
  name: string;
  icon: string;
  color: string;
}

const iconMap: Record<string, any> = {
  Sparkles,
  BookOpen,
  Compass,
  Award,
  Globe,
  GraduationCap
};

export function GradeCard({ id, name, icon, color }: GradeCardProps) {
  const IconComponent = iconMap[icon] || GraduationCap;

  return (
    <Link href={`/grades/${id}/subjects`}>
      <motion.div
        whileHover={{ y: -6, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="group relative overflow-hidden rounded-3xl border-2 border-[#1B3B36]/10 bg-[#FFFDF7] p-6 shadow-md transition hover:shadow-xl"
      >
        <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${color} text-[#FFFDF7] shadow-lg mb-4`}>
          <IconComponent className="h-7 w-7" />
        </div>

        <h3 className="font-baloo text-xl font-extrabold text-[#1B3B36] group-hover:text-[#C1502E] transition-colors">
          {name}
        </h3>
        <p className="mt-1 font-tajawal text-xs text-[#1B3B36]/70">استعرض المواد والدروس التفاعلية</p>
      </motion.div>
    </Link>
  );
}
