'use client';

import { useState } from 'react';
import { LessonData } from '@/types/lesson';
import { SlideCard } from './SlideCard';
import { InteractiveQuiz } from './InteractiveQuiz';
import { StarRewardScreen } from './StarRewardScreen';
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
    <div className="relative flex h-[100dvh] w-screen flex-col items-center justify-between overflow-hidden bg-[#F8FAFC] select-none touch-none">
      <LandscapeGuard />

      {/* Top Bar - Ultra-compact for 16:9 Landscape screens (h-9) */}
      <div className="z-20 flex h-9 w-full shrink-0 items-center justify-between border-b border-[#0F3D4C]/10 bg-[#FFFFFF]/90 px-4 py-0.5 backdrop-blur-sm">
        <Link
          href={`/grades/${lesson.gradeId}/subjects/${lesson.subjectId}/lessons`}
          className="flex items-center gap-1 font-tajawal text-xs font-bold text-[#0F2C3B] hover:text-[#D97706]"
        >
          <ArrowRight className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">العودة</span>
        </Link>
        <h2 className="font-baloo text-xs font-bold text-[#0F2C3B] sm:text-sm truncate max-w-[50vw]">
          {lesson.title}
        </h2>
        <span className="rounded-full bg-[#F59E0B] px-2 py-0.5 font-baloo text-[10px] sm:text-xs font-bold text-[#0F2C3B]">
          {currentSlideIdx + 1} / {slidesCount}
        </span>
      </div>

      {/* Main Slide Workspace - Perfectly auto-scaled to fit 16:9 screen height without any vertical page scroll */}
      <div className="relative z-10 flex h-[calc(100dvh-5rem)] w-full max-w-4xl items-center justify-center p-1 overflow-hidden">
        {currentSlide.type === 'quiz' && currentSlide.quiz ? (
          <InteractiveQuiz quiz={currentSlide.quiz} onAnswerSelected={() => {}} />
        ) : currentSlide.type === 'summary' ? (
          <StarRewardScreen onReplay={() => setCurrentSlideIdx(0)} />
        ) : (
          <SlideCard key={currentSlide.id} slide={currentSlide} />
        )}
      </div>

      {/* Bottom Navigation Shell - Compact height (h-11) */}
      <div className="z-20 flex h-11 w-full shrink-0 items-center justify-between border-t-2 border-[#0F3D4C] bg-[#0F3D4C] px-6 text-[#FFFFFF]">
        <button
          onClick={handlePrev}
          disabled={currentSlideIdx === 0}
          className="flex h-7 w-7 items-center justify-center rounded-full bg-[#F59E0B] text-[#0F2C3B] shadow transition hover:scale-105 disabled:opacity-40"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        {/* Progress Dots */}
        <div className="flex items-center gap-1.5">
          {lesson.slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlideIdx(idx)}
              className={`h-2 rounded-full transition-all ${
                idx === currentSlideIdx ? 'w-5 bg-[#F59E0B]' : 'w-2 bg-[#FFFFFF]/30'
              }`}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          disabled={currentSlideIdx === slidesCount - 1}
          className="flex h-7 w-7 items-center justify-center rounded-full bg-[#F59E0B] text-[#0F2C3B] shadow transition hover:scale-105 disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
