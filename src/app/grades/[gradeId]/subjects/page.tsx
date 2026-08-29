'use client';

import { useParams } from 'next/navigation';
import { Header } from '@/components/ui/Header';
import { SubjectCard } from '@/components/ui/SubjectCard';
import { PRIMARY_GRADES, SUBJECTS_LIST } from '@/lib/lessons/sampleLessons';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function SubjectsPage() {
  const params = useParams();
  const gradeId = params?.gradeId as string;
  const grade = PRIMARY_GRADES.find(g => g.id === gradeId) || PRIMARY_GRADES[3];

  return (
    <div className="min-h-screen bg-[#FBF3DE]">
      <Header />

      <main className="mx-auto max-w-6xl px-6 py-10">
        <Link
          href="/grades"
          className="inline-flex items-center gap-2 font-tajawal text-xs font-bold text-[#1B3B36] hover:text-[#C1502E] mb-6"
        >
          <ArrowRight className="h-4 w-4" />
          العودة لاختيار الصف
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <span className="inline-block rounded-full bg-[#3E92B0]/20 px-4 py-1.5 font-tajawal text-xs font-bold text-[#3E92B0]">
            الخطوة الثانية: اختر المادة - {grade.name}
          </span>
          <h2 className="mt-3 font-baloo text-3xl font-extrabold text-[#1B3B36] md:text-4xl">
            مواد {grade.name}
          </h2>
          <p className="mt-2 font-tajawal text-sm text-[#1B3B36]/80">
            تصفح المواد التفاعلية المجهزة بعروض وبطاقات وأسئلة تقييمية ومحملات أوفلاين.
          </p>
        </motion.div>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SUBJECTS_LIST.map((subject) => (
            <SubjectCard
              key={subject.id}
              id={subject.id}
              name={subject.name}
              icon={subject.icon}
              color={subject.color}
              gradeId={gradeId}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
