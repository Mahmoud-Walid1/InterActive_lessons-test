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

  // Animation variants for cartoon scene elements
  const sceneAnimationVariants: Record<string, any> = {
    bounce: { y: [0, -12, 0], transition: { repeat: Infinity, duration: 2, ease: 'easeInOut' } },
    flap: { rotate: [-5, 5, -5], y: [0, -6, 0], transition: { repeat: Infinity, duration: 1.5, ease: 'easeInOut' } },
    swim: { x: [-15, 15, -15], transition: { repeat: Infinity, duration: 3, ease: 'easeInOut' } },
    slither: { x: [-10, 10, -10], rotate: [-3, 3, -3], transition: { repeat: Infinity, duration: 2, ease: 'easeInOut' } },
    pulse: { scale: [1, 1.1, 1], transition: { repeat: Infinity, duration: 2, ease: 'easeInOut' } },
    float: { y: [0, -10, 0], transition: { repeat: Infinity, duration: 2.5, ease: 'easeInOut' } },
  };

  const currentAnim = slide.sceneAnimation ? sceneAnimationVariants[slide.sceneAnimation] : sceneAnimationVariants.bounce;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.3 }}
      className="flex w-full max-w-2xl flex-col items-center justify-center p-1.5 text-center my-auto max-h-full overflow-y-auto no-scrollbar"
    >
      {/* Eyebrow badge */}
      {slide.eyebrow && (
        <motion.span
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-1 inline-flex items-center gap-1 rounded-full border border-dashed border-[#D97706] bg-[#FFFFFF] px-3 py-0.5 font-tajawal text-[10px] sm:text-[11px] font-bold text-[#D97706]"
        >
          {slide.eyebrow}
        </motion.span>
      )}

      {/* Main Slide Title with Cartoon Scene Icon Animation */}
      <div className="flex items-center justify-center gap-2">
        <motion.h1
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-baloo text-lg sm:text-2xl font-extrabold text-[#0F2C3B]"
        >
          {slide.title}
        </motion.h1>
        <motion.span animate={currentAnim} className="text-2xl sm:text-3xl inline-block">
          {slide.title.includes('حيوانات') ? '🦁' : slide.title.includes('كسور') ? '🍕' : '✨'}
        </motion.span>
      </div>

      {slide.subtitle && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mt-0.5 max-w-lg font-tajawal text-[11px] sm:text-xs text-[#0F2C3B]/80 leading-snug"
        >
          {slide.subtitle}
        </motion.p>
      )}

      {/* Sequential / Staggered Traits List */}
      {slide.traits && (
        <ul className="mt-2 flex flex-col gap-1.5 w-full max-w-md text-right">
          {slide.traits.map((trait, idx) => (
            <motion.li
              key={idx}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + idx * 0.12 }}
              className="flex items-center gap-2 rounded-xl border border-[#0F2C3B]/10 bg-[#FFFFFF] p-2 shadow-xs font-tajawal text-[11px] sm:text-xs text-[#0F2C3B]"
            >
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#0D9488]" />
              <span>{trait}</span>
            </motion.li>
          ))}
        </ul>
      )}

      {/* Sequential Interactive Group Chips */}
      {slide.groups && (
        <div className="mt-2 grid w-full grid-cols-1 sm:grid-cols-3 gap-2 max-w-xl">
          {slide.groups.map((group, idx) => {
            const isOpen = openChipId === group.id;
            return (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + idx * 0.1 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setOpenChipId(isOpen ? null : group.id)}
                className="cursor-pointer rounded-xl border-2 border-[#0F3D4C] bg-[#FFFFFF] p-2 text-center shadow-xs transition hover:shadow-md"
              >
                <motion.span animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 2 + idx * 0.5 }} className="text-2xl block mb-0.5">
                  {group.emoji}
                </motion.span>
                <div className="flex items-center justify-center gap-1 font-baloo text-xs sm:text-sm font-bold text-[#0F2C3B]">
                  <span>{group.name}</span>
                  <ChevronDown className={`h-3 w-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </div>
                {isOpen && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-1 border-t border-[#0F2C3B]/10 pt-1 font-tajawal text-[10px] text-[#0F2C3B]/80 leading-normal text-right"
                  >
                    {group.detail}
                  </motion.p>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Reveal Question */}
      {slide.reveal && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-2 w-full max-w-md">
          <button
            onClick={() => setShowReveal(!showReveal)}
            className="flex w-full items-center justify-between rounded-xl border-2 border-[#D97706] bg-[#FFFFFF] p-2 font-baloo font-bold text-xs text-[#D97706] shadow-xs transition hover:bg-[#D97706]/10"
          >
            <div className="flex items-center gap-1.5">
              <HelpCircle className="h-3.5 w-3.5" />
              <span>{slide.reveal.question}</span>
            </div>
            <span className="font-tajawal text-[10px] underline">اضغط للإجابة</span>
          </button>
          {showReveal && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-1 rounded-xl border border-[#0D9488] bg-[#0D9488]/10 p-2 font-tajawal text-[11px] text-[#0F2C3B] text-right leading-relaxed"
            >
              {slide.reveal.answer}
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Cartoon Example Icons */}
      {slide.examples && (
        <div className="mt-2 flex flex-wrap justify-center gap-4">
          {slide.examples.map((ex, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + idx * 0.15 }}
              className="flex flex-col items-center"
            >
              <motion.span animate={{ rotate: [-4, 4, -4] }} transition={{ repeat: Infinity, duration: 2 }} className="text-2xl sm:text-3xl">
                {ex.emoji}
              </motion.span>
              <span className="mt-0.5 font-baloo font-bold text-[10px] sm:text-xs text-[#0F2C3B]">{ex.name}</span>
            </motion.div>
          ))}
        </div>
      )}

      {/* Mascot Fateen Tip Card placed at the VERY BOTTOM */}
      {slide.mascotTip && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-2.5 flex items-center gap-2 rounded-xl border-2 border-[#0284C7]/30 bg-[#0284C7]/10 px-3 py-1.5 text-right shadow-xs max-w-md w-full"
        >
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#0F3D4C] text-[#F59E0B] shadow-xs">
            <Bot className="h-4 w-4" />
          </div>
          <div>
            <span className="font-baloo text-[10px] font-extrabold text-[#0284C7] block leading-none">نصيحة فطين 💡</span>
            <p className="font-tajawal text-[10px] sm:text-xs font-bold text-[#0F2C3B] leading-snug mt-0.5">
              {slide.mascotTip.replace(/روبرت/g, 'فطين')}
            </p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
