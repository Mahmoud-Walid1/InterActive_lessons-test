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
    <div className="relative flex h-[100dvh] w-screen flex-col items-center justify-between overflow-hidden bg-[#FBF3DE]">
      <LandscapeGuard />

      {/* Top Bar - Compact for 16:9 Landscape screens */}
      <div className="z-20 flex h-10 w-full shrink-0 items-center justify-between border-b border-[#1B3B36]/10 bg-[#FFFDF7]/90 px-4 py-1 backdrop-blur-sm">
        <Link
          href={`/grades/${lesson.gradeId}/subjects/${lesson.subjectId}/lessons`}
          className="flex items-center gap-1 font-tajawal text-xs font-bold text-[#1B3B36] hover:text-[#C1502E]"
        >
          <ArrowRight className="h-3.5 w-3.5" />
          العودة
        </Link>
        <h2 className="font-baloo text-xs font-bold text-[#1B3B36] sm:text-sm truncate max-w-[50vw]">
          {lesson.title}
        </h2>
        <span className="rounded-full bg-[#E8A93B] px-2.5 py-0.5 font-baloo text-[11px] font-bold text-[#1B3B36]">
          {currentSlideIdx + 1} / {slidesCount}
        </span>
      </div>

      {/* Main Slide Workspace - Fits 16:9 screen perfectly */}
      <div className="relative z-10 flex h-[calc(100dvh-5.5rem)] w-full max-w-5xl items-center justify-center p-2 overflow-y-auto">
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

      {/* Bottom Navigation Shell - Compact height */}
      <div className="z-20 flex h-12 w-full shrink-0 items-center justify-between border-t-2 border-[#1B3B36] bg-[#1B3B36] px-6 text-[#FFFDF7]">
        <button
          onClick={handlePrev}
          disabled={currentSlideIdx === 0}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E8A93B] text-[#1B3B36] shadow transition hover:scale-105 disabled:opacity-40"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        {/* Progress Dots */}
        <div className="flex items-center gap-1.5">
          {lesson.slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlideIdx(idx)}
              className={`h-2.5 rounded-full transition-all ${
                idx === currentSlideIdx ? 'w-6 bg-[#E8A93B]' : 'w-2.5 bg-[#FFFDF7]/30'
              }`}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          disabled={currentSlideIdx === slidesCount - 1}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E8A93B] text-[#1B3B36] shadow transition hover:scale-105 disabled:opacity-40"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
