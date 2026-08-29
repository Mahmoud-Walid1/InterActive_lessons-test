'use client';

import { useParams } from 'next/navigation';
import { Header } from '@/components/ui/Header';
import { LessonCard } from '@/components/ui/LessonCard';
import { PRIMARY_GRADES, SUBJECTS_LIST, SAMPLE_LESSONS } from '@/lib/lessons/sampleLessons';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, BookOpen } from 'lucide-react';

export default function LessonsMapPage() {
  const params = useParams();
  const gradeId = params?.gradeId as string;
  const subjectId = params?.subjectId as string;

  const grade = PRIMARY_GRADES.find(g => g.id === gradeId) || PRIMARY_GRADES[3];
  const subject = SUBJECTS_LIST.find(s => s.id === subjectId) || SUBJECTS_LIST[0];

  const lessons = Object.values(SAMPLE_LESSONS).filter(
    (l) => l.gradeId === gradeId && l.subjectId === subjectId
  );

  const defaultLesson = SAMPLE_LESSONS['lesson_animals_group'];

  return (
    <div className="min-h-screen bg-[#FBF3DE]">
      <Header />

      <main className="mx-auto max-w-6xl px-6 py-10">
        <Link
          href={`/grades/${gradeId}/subjects`}
          className="inline-flex items-center gap-2 font-tajawal text-xs font-bold text-[#1B3B36] hover:text-[#C1502E] mb-6"
        >
          <ArrowRight className="h-4 w-4" />
          العودة لاختيار المواد
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <span className="inline-block rounded-full bg-[#4F7942]/20 px-4 py-1.5 font-tajawal text-xs font-bold text-[#4F7942]">
            خريطة دروس: مادة {subject.name} - {grade.name}
          </span>
          <h2 className="mt-3 font-baloo text-3xl font-extrabold text-[#1B3B36] md:text-4xl">
            الدروس التفاعلية المتاحة
          </h2>
          <p className="mt-2 font-tajawal text-sm text-[#1B3B36]/80">
            يمكنك تشغيل الدرس مباشرة أونلاين أو ضغط زر التحميل للاستمتاع به أوفلاين بدون اتصال إنترنت.
          </p>
        </motion.div>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2">
          {lessons.length > 0 ? (
            lessons.map((lesson) => (
              <LessonCard
                key={lesson.id}
                lessonId={lesson.id}
                title={lesson.title}
                description={lesson.description}
                gradeId={gradeId}
                subjectId={subjectId}
              />
            ))
          ) : (
            <LessonCard
              lessonId={defaultLesson.id}
              title={defaultLesson.title}
              description={defaultLesson.description}
              gradeId={gradeId}
              subjectId={subjectId}
            />
          )}
        </div>
      </main>
    </div>
  );
}
