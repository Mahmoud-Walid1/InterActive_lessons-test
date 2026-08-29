'use client';

import { useState } from 'react';
import { LessonData } from '@/types/lesson';
import { SlideCard } from './SlideCard';
import { InteractiveQuiz } from './InteractiveQuiz';
import { StarRewardScreen } from './StarRewardScreen';
import { MascotRobert } from './MascotRobert';
import { LandscapeGuard } from '../orientation/LandscapeGuard';
import { ChevronRight, ChevronLeft, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface LessonPlayerShellProps {
  lesson: LessonData;
}

export function LessonPlayerShell({ lesson }: LessonPlayerShellProps) {
  const [currentSlideIdx, setCurrentSlideIdx] = useState<number>(0);
  const slidesCount = lesson.slides.length;
  const currentSlide = lesson.slides[currentSlideIdx];

  const handleNext = () => {
    if (currentSlideIdx < slidesCount - 1) {
      setCurrentSlideIdx(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentSlideIdx > 0) {
      setCurrentSlideIdx(prev => prev - 1);
    }
  };

  return (
    <div className="relative flex h-screen w-screen flex-col items-center justify-between overflow-hidden bg-[#FBF3DE]">
      <LandscapeGuard />

      {/* Top Bar */}
      <div className="z-20 flex w-full items-center justify-between border-b border-[#1B3B36]/10 bg-[#FFFDF7]/80 px-6 py-3 backdrop-blur-sm">
        <Link
          href={`/grades/${lesson.gradeId}/subjects/${lesson.subjectId}/lessons`}
          className="flex items-center gap-1.5 font-tajawal text-sm font-bold text-[#1B3B36] hover:text-[#C1502E]"
        >
          <ArrowRight className="h-4 w-4" />
          العودة للدروس
        </Link>
        <h2 className="font-baloo text-base font-bold text-[#1B3B36] md:text-lg">{lesson.title}</h2>
        <span className="rounded-full bg-[#E8A93B] px-3 py-1 font-baloo text-xs font-bold text-[#1B3B36]">
          {currentSlideIdx + 1} من {slidesCount}
        </span>
      </div>

      {/* Main Slide Workspace */}
      <div className="relative z-10 flex h-full w-full items-center justify-center p-4">
        {currentSlide.type === 'quiz' && currentSlide.quiz ? (
          <InteractiveQuiz quiz={currentSlide.quiz} onAnswerSelected={() => {}} />
        ) : currentSlide.type === 'summary' ? (
          <StarRewardScreen onReplay={() => setCurrentSlideIdx(0)} />
        ) : (
          <SlideCard slide={currentSlide} />
        )}
      </div>

      {/* Mascot Robert Floating */}
      <MascotRobert tipText={currentSlide.mascotTip} />

      {/* Bottom Navigation Shell */}
      <div className="z-20 flex h-20 w-full items-center justify-between border-t-2 border-[#1B3B36] bg-[#1B3B36] px-8 text-[#FFFDF7]">
        <button
          onClick={handlePrev}
          disabled={currentSlideIdx === 0}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E8A93B] text-[#1B3B36] shadow-lg transition hover:scale-105 disabled:opacity-40"
        >
          <ChevronRight className="h-6 w-6" />
        </button>

        {/* Progress Dots */}
        <div className="flex items-center gap-2">
          {lesson.slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlideIdx(idx)}
              className={`h-3 rounded-full transition-all ${
                idx === currentSlideIdx ? 'w-8 bg-[#E8A93B]' : 'w-3 bg-[#FFFDF7]/30'
              }`}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          disabled={currentSlideIdx === slidesCount - 1}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E8A93B] text-[#1B3B36] shadow-lg transition hover:scale-105 disabled:opacity-40"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
}
