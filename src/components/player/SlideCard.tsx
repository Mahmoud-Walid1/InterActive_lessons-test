'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { LessonSlide } from '@/types/lesson';
import { CheckCircle2, HelpCircle, ChevronDown, Bot } from 'lucide-react';

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
        <span className="mb-1 inline-flex items-center gap-1 rounded-full border border-dashed border-[#D97706] bg-[#FFFFFF] px-3 py-0.5 font-tajawal text-[11px] font-bold text-[#D97706]">
          {slide.eyebrow}
        </span>
      )}

      <h1 className="font-baloo text-xl font-extrabold text-[#0F2C3B] sm:text-3xl">
        {slide.title}
      </h1>

      {slide.subtitle && (
        <p className="mt-1 max-w-xl font-tajawal text-xs text-[#0F2C3B]/80 sm:text-sm leading-relaxed">
          {slide.subtitle}
        </p>
      )}

      {slide.traits && (
        <ul className="mt-2.5 flex flex-col gap-1.5 w-full max-w-md text-right">
          {slide.traits.map((trait, idx) => (
            <motion.li
              key={idx}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex items-center gap-2 rounded-xl border border-[#0F2C3B]/10 bg-[#FFFFFF] p-2.5 shadow-xs font-tajawal text-xs text-[#0F2C3B]"
            >
              <CheckCircle2 className="h-4 w-4 shrink-0 text-[#0D9488]" />
              <span>{trait}</span>
            </motion.li>
          ))}
        </ul>
      )}

      {slide.groups && (
        <div className="mt-2.5 grid w-full grid-cols-1 sm:grid-cols-3 gap-2 max-w-2xl">
          {slide.groups.map((group) => {
            const isOpen = openChipId === group.id;
            return (
              <motion.div
                key={group.id}
                whileHover={{ scale: 1.02 }}
                onClick={() => setOpenChipId(isOpen ? null : group.id)}
                className="cursor-pointer rounded-xl border-2 border-[#0F3D4C] bg-[#FFFFFF] p-2.5 text-center shadow-xs transition hover:shadow-md"
              >
                <span className="text-2xl block mb-1">{group.emoji}</span>
                <div className="flex items-center justify-center gap-1 font-baloo text-sm font-bold text-[#0F2C3B]">
                  <span>{group.name}</span>
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </div>
                {isOpen && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-1.5 border-t border-[#0F2C3B]/10 pt-1.5 font-tajawal text-[11px] text-[#0F2C3B]/80 leading-normal text-right"
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
        <div className="mt-2.5 w-full max-w-lg">
          <button
            onClick={() => setShowReveal(!showReveal)}
            className="flex w-full items-center justify-between rounded-xl border-2 border-[#D97706] bg-[#FFFFFF] p-2.5 font-baloo font-bold text-xs text-[#D97706] shadow-xs transition hover:bg-[#D97706]/10"
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
              className="mt-1.5 rounded-xl border border-[#0D9488] bg-[#0D9488]/10 p-2.5 font-tajawal text-xs text-[#0F2C3B] text-right leading-relaxed"
            >
              {slide.reveal.answer}
            </motion.div>
          )}
        </div>
      )}

      {slide.examples && (
        <div className="mt-2.5 flex flex-wrap justify-center gap-4">
          {slide.examples.map((ex, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <span className="text-3xl">{ex.emoji}</span>
              <span className="mt-0.5 font-baloo font-bold text-xs text-[#0F2C3B]">{ex.name}</span>
            </div>
          ))}
        </div>
      )}

      {/* Mascot Fateen Tip Card placed at the VERY BOTTOM under all slide content */}
      {slide.mascotTip && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 flex items-center gap-2.5 rounded-2xl border-2 border-[#0284C7]/30 bg-[#0284C7]/10 px-3.5 py-2 text-right shadow-xs max-w-lg w-full"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#0F3D4C] text-[#F59E0B] shadow-sm">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <span className="font-baloo text-[11px] font-extrabold text-[#0284C7] block leading-none">نصيحة فطين 💡</span>
            <p className="font-tajawal text-xs font-bold text-[#0F2C3B] leading-snug mt-0.5">
              {slide.mascotTip.replace(/روبرت/g, 'فطين')}
            </p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
