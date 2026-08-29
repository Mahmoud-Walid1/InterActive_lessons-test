'use client';

import { Header } from '@/components/ui/Header';
import { GradeCard } from '@/components/ui/GradeCard';
import { PRIMARY_GRADES } from '@/lib/lessons/sampleLessons';
import { motion } from 'framer-motion';

export default function GradesPage() {
  return (
    <div className="min-h-screen bg-[#FBF3DE]">
      <Header />

      <main className="mx-auto max-w-6xl px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <span className="inline-block rounded-full bg-[#E8A93B]/20 px-4 py-1.5 font-tajawal text-xs font-bold text-[#1B3B36]">
            الخطوة الأولى: اختر المرحلة الدراسية
          </span>
          <h2 className="mt-3 font-baloo text-3xl font-extrabold text-[#1B3B36] md:text-4xl">
            صفوف المرحلة الابتدائية
          </h2>
          <p className="mt-2 font-tajawal text-sm text-[#1B3B36]/80">
            اختر الصف الدراسي للوصول لكافة المواد التعليمية والدروس المحملة أوفلاين.
          </p>
        </motion.div>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PRIMARY_GRADES.map((grade) => (
            <GradeCard
              key={grade.id}
              id={grade.id}
              name={grade.name}
              icon={grade.icon}
              color={grade.color}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
