'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { LessonSlide } from '@/types/lesson';
import { CheckCircle2, HelpCircle, ChevronDown } from 'lucide-react';

interface SlideCardProps {
  slide: LessonSlide;
}

export function SlideCard({ slide }: SlideCardProps) {
  const [openChipId, setOpenChipId] = useState<string | null>(null);
  const [showReveal, setShowReveal] = useState<boolean>(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex w-full max-w-4xl flex-col items-center justify-center p-4 text-center"
    >
      {slide.eyebrow && (
        <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border-2 border-dashed border-[#C1502E] bg-[#FFFDF7] px-4 py-1 font-tajawal text-xs font-bold text-[#C1502E]">
          {slide.eyebrow}
        </span>
      )}

      <h1 className="font-baloo text-2xl font-extrabold text-[#1B3B36] md:text-4xl">
        {slide.title}
      </h1>

      {slide.subtitle && (
        <p className="mt-2 max-w-2xl font-tajawal text-sm text-[#1B3B36]/80 md:text-base leading-relaxed">
          {slide.subtitle}
        </p>
      )}

      {slide.traits && (
        <ul className="mt-6 flex flex-col gap-2.5 w-full max-w-lg text-right">
          {slide.traits.map((trait, idx) => (
            <motion.li
              key={idx}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.15 }}
              className="flex items-center gap-3 rounded-xl border border-[#1B3B36]/10 bg-[#FFFDF7] p-3 shadow-sm font-tajawal text-sm text-[#1B3B36]"
            >
              <CheckCircle2 className="h-5 w-5 shrink-0 text-[#4F7942]" />
              <span>{trait}</span>
            </motion.li>
          ))}
        </ul>
      )}

      {slide.groups && (
        <div className="mt-6 grid w-full grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl">
          {slide.groups.map((group) => {
            const isOpen = openChipId === group.id;
            return (
              <motion.div
                key={group.id}
                whileHover={{ scale: 1.03 }}
                onClick={() => setOpenChipId(isOpen ? null : group.id)}
                className="cursor-pointer rounded-2xl border-2 border-[#1B3B36] bg-[#FFFDF7] p-4 text-center shadow-md transition hover:shadow-xl"
              >
                <span className="text-4xl block mb-2">{group.emoji}</span>
                <div className="flex items-center justify-center gap-1 font-baloo text-lg font-bold text-[#1B3B36]">
                  <span>{group.name}</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </div>
                {isOpen && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-2 border-t border-[#1B3B36]/10 pt-2 font-tajawal text-xs text-[#1B3B36]/80 leading-relaxed text-right"
                  >
                    {group.detail}
                  </motion.p>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {slide.reveal && (
        <div className="mt-6 w-full max-w-xl">
          <button
            onClick={() => setShowReveal(!showReveal)}
            className="flex w-full items-center justify-between rounded-2xl border-2 border-[#C1502E] bg-[#FFFDF7] p-4 font-baloo font-bold text-[#C1502E] shadow-md transition hover:bg-[#F2E6C4]/30"
          >
            <div className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              <span>{slide.reveal.question}</span>
            </div>
            <span className="font-tajawal text-xs underline">اضغط للإجابة</span>
          </button>
          {showReveal && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 rounded-2xl border border-[#4F7942] bg-[#4F7942]/10 p-4 font-tajawal text-sm text-[#1B3B36] text-right leading-relaxed"
            >
              {slide.reveal.answer}
            </motion.div>
          )}
        </div>
      )}

      {slide.examples && (
        <div className="mt-6 flex flex-wrap justify-center gap-6">
          {slide.examples.map((ex, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <span className="text-5xl">{ex.emoji}</span>
              <span className="mt-1 font-baloo font-bold text-sm text-[#1B3B36]">{ex.name}</span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
