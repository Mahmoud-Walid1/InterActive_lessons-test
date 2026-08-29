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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex w-full max-w-3xl flex-col items-center justify-center p-2 text-center my-auto"
    >
      {slide.eyebrow && (
        <span className="mb-1.5 inline-flex items-center gap-1 rounded-full border border-dashed border-[#C1502E] bg-[#FFFDF7] px-3 py-0.5 font-tajawal text-[11px] font-bold text-[#C1502E]">
          {slide.eyebrow}
        </span>
      )}

      <h1 className="font-baloo text-xl font-extrabold text-[#1B3B36] sm:text-3xl">
        {slide.title}
      </h1>

      {slide.subtitle && (
        <p className="mt-1 max-w-xl font-tajawal text-xs text-[#1B3B36]/80 sm:text-sm leading-relaxed">
          {slide.subtitle}
        </p>
      )}

      {slide.traits && (
        <ul className="mt-3 flex flex-col gap-1.5 w-full max-w-md text-right">
          {slide.traits.map((trait, idx) => (
            <motion.li
              key={idx}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex items-center gap-2 rounded-lg border border-[#1B3B36]/10 bg-[#FFFDF7] p-2 shadow-sm font-tajawal text-xs text-[#1B3B36]"
            >
              <CheckCircle2 className="h-4 w-4 shrink-0 text-[#4F7942]" />
              <span>{trait}</span>
            </motion.li>
          ))}
        </ul>
      )}

      {slide.groups && (
        <div className="mt-3 grid w-full grid-cols-1 sm:grid-cols-3 gap-2.5 max-w-2xl">
          {slide.groups.map((group) => {
            const isOpen = openChipId === group.id;
            return (
              <motion.div
                key={group.id}
                whileHover={{ scale: 1.02 }}
                onClick={() => setOpenChipId(isOpen ? null : group.id)}
                className="cursor-pointer rounded-xl border-2 border-[#1B3B36] bg-[#FFFDF7] p-2.5 text-center shadow-sm transition hover:shadow-md"
              >
                <span className="text-2xl block mb-1">{group.emoji}</span>
                <div className="flex items-center justify-center gap-1 font-baloo text-sm font-bold text-[#1B3B36]">
                  <span>{group.name}</span>
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </div>
                {isOpen && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-1.5 border-t border-[#1B3B36]/10 pt-1.5 font-tajawal text-[11px] text-[#1B3B36]/80 leading-normal text-right"
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
        <div className="mt-3 w-full max-w-lg">
          <button
            onClick={() => setShowReveal(!showReveal)}
            className="flex w-full items-center justify-between rounded-xl border-2 border-[#C1502E] bg-[#FFFDF7] p-2.5 font-baloo font-bold text-xs text-[#C1502E] shadow-sm transition hover:bg-[#F2E6C4]/30"
          >
            <div className="flex items-center gap-1.5">
              <HelpCircle className="h-4 w-4" />
              <span>{slide.reveal.question}</span>
            </div>
            <span className="font-tajawal text-[10px] underline">اضغط للإجابة</span>
          </button>
          {showReveal && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-1.5 rounded-xl border border-[#4F7942] bg-[#4F7942]/10 p-2.5 font-tajawal text-xs text-[#1B3B36] text-right leading-relaxed"
            >
              {slide.reveal.answer}
            </motion.div>
          )}
        </div>
      )}

      {slide.examples && (
        <div className="mt-3 flex flex-wrap justify-center gap-4">
          {slide.examples.map((ex, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <span className="text-3xl">{ex.emoji}</span>
              <span className="mt-0.5 font-baloo font-bold text-xs text-[#1B3B36]">{ex.name}</span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
