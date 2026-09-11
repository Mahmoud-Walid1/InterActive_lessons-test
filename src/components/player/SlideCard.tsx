'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { LessonSlide } from '@/types/lesson';
import { CheckCircle2, HelpCircle, ChevronDown, Bot, Check, X, Sparkles } from 'lucide-react';

interface SlideCardProps {
  slide: LessonSlide;
}

export function SlideCard({ slide }: SlideCardProps) {
  const [openChipId, setOpenChipId] = useState<string | null>(null);
  const [showReveal, setShowReveal] = useState<boolean>(false);

  // States for new interactive types
  const [tfAnswer, setTfAnswer] = useState<boolean | null>(null);
  const [selectedMatchLeft, setSelectedMatchLeft] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [tapCount, setTapCount] = useState<number>(0);
  const [activeHotspotIdx, setActiveHotspotIdx] = useState<number | null>(null);

  const handleMatchSelect = (id: string, side: 'left' | 'right') => {
    if (side === 'left') {
      setSelectedMatchLeft(id);
    } else if (selectedMatchLeft) {
      if (selectedMatchLeft === id) {
        setMatchedPairs([...matchedPairs, id]);
      }
      setSelectedMatchLeft(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.99, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.99, y: -8 }}
      transition={{ duration: 0.3 }}
      className="flex w-full max-w-2xl flex-col items-center justify-center p-1.5 text-center my-auto max-h-full overflow-y-auto no-scrollbar"
    >
      {/* Eyebrow badge */}
      {slide.eyebrow && (
        <motion.span
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-1 inline-flex items-center gap-1 rounded-full border border-dashed border-[#D97706] bg-[#FFFFFF] px-3 py-0.5 font-tajawal text-[10px] sm:text-[11px] font-bold text-[#D97706]"
        >
          {slide.eyebrow}
        </motion.span>
      )}

      {/* Main Slide Title */}
      <div className="flex items-center justify-center gap-2">
        <motion.h1
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-baloo text-lg sm:text-2xl font-extrabold text-[#0F2C3B]"
        >
          {slide.title}
        </motion.h1>
      </div>

      {slide.subtitle && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.08 }}
          className="mt-0.5 max-w-lg font-tajawal text-[11px] sm:text-xs text-[#0F2C3B]/80 leading-snug"
        >
          {slide.subtitle}
        </motion.p>
      )}

      {/* 1. Traits List */}
      {slide.traits && (
        <ul className="mt-2 flex flex-col gap-1.5 w-full max-w-md text-right">
          {slide.traits.map((trait, idx) => (
            <motion.li
              key={idx}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + idx * 0.08 }}
              className="flex items-center gap-2 rounded-xl border border-[#0F2C3B]/10 bg-[#FFFFFF] p-2 shadow-xs font-tajawal text-[11px] sm:text-xs text-[#0F2C3B]"
            >
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#0D9488]" />
              <span>{trait}</span>
            </motion.li>
          ))}
        </ul>
      )}

      {/* 2. Interactive Group Chips */}
      {slide.groups && (
        <div className="mt-2 grid w-full grid-cols-1 sm:grid-cols-3 gap-2 max-w-xl">
          {slide.groups.map((group, idx) => {
            const isOpen = openChipId === group.id;
            return (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + idx * 0.08 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setOpenChipId(isOpen ? null : group.id)}
                className="cursor-pointer rounded-xl border-2 border-[#0F3D4C] bg-[#FFFFFF] p-2 text-center shadow-xs transition hover:shadow-md"
              >
                <span className="text-2xl block mb-0.5">{group.emoji}</span>
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

      {/* 3. Reveal Question */}
      {slide.reveal && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-2 w-full max-w-md"
        >
          <button
            onClick={() => setShowReveal(!showReveal)}
            className="flex w-full items-center justify-between rounded-xl border-2 border-[#D97706] bg-[#FFFFFF] p-2 font-baloo font-bold text-xs text-[#D97706] shadow-xs transition hover:bg-[#D97706]/10 cursor-pointer"
          >
            <div className="flex items-center gap-1.5">
              <HelpCircle className="h-3.5 w-3.5" />
              <span>{slide.reveal.question}</span>
            </div>
            <span className="font-tajawal text-[10px] underline">اضغط للإجابة</span>
          </button>
          {showReveal && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-1 rounded-xl border border-[#0D9488] bg-[#0D9488]/10 p-2 font-tajawal text-[11px] text-[#0F2C3B] text-right leading-relaxed"
            >
              {slide.reveal.answer}
            </motion.div>
          )}
        </motion.div>
      )}

      {/* 4. True or False */}
      {slide.trueFalse && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 w-full max-w-md rounded-2xl border-2 border-[#0F3D4C] bg-[#FFFFFF] p-4 text-center shadow-xs"
        >
          <p className="font-baloo text-base font-extrabold text-[#0F2C3B] mb-3">
            {slide.trueFalse.statement}
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => setTfAnswer(true)}
              className={`flex items-center gap-1.5 rounded-xl border-2 px-5 py-2 font-baloo font-bold text-sm transition cursor-pointer ${
                tfAnswer === true
                  ? slide.trueFalse.isTrue
                    ? 'border-[#0D9488] bg-[#0D9488] text-white'
                    : 'border-[#D97706] bg-[#D97706] text-white'
                  : 'border-[#0D9488] bg-[#0D9488]/10 text-[#0D9488] hover:bg-[#0D9488]/20'
              }`}
            >
              <Check className="h-4 w-4" />
              <span>صح</span>
            </button>
            <button
              onClick={() => setTfAnswer(false)}
              className={`flex items-center gap-1.5 rounded-xl border-2 px-5 py-2 font-baloo font-bold text-sm transition cursor-pointer ${
                tfAnswer === false
                  ? !slide.trueFalse.isTrue
                    ? 'border-[#0D9488] bg-[#0D9488] text-white'
                    : 'border-[#D97706] bg-[#D97706] text-white'
                  : 'border-[#D97706] bg-[#D97706]/10 text-[#D97706] hover:bg-[#D97706]/20'
              }`}
            >
              <X className="h-4 w-4" />
              <span>خطأ</span>
            </button>
          </div>
          {tfAnswer !== null && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-2 font-tajawal text-xs font-bold text-[#0F2C3B]"
            >
              {tfAnswer === slide.trueFalse.isTrue
                ? 'إجابة صحيحة وممتازة! 🌟'
                : 'محاولة طيبة، راجع المعلومة وحاول مجدداً!'}
            </motion.p>
          )}
        </motion.div>
      )}

      {/* 5. Match Pairs */}
      {slide.matchPairs && (
        <div className="mt-3 grid grid-cols-2 gap-3 w-full max-w-md">
          <div className="flex flex-col gap-2">
            {slide.matchPairs.pairs.map((p) => {
              const isMatched = matchedPairs.includes(p.id);
              const isSelected = selectedMatchLeft === p.id;
              return (
                <button
                  key={`left-${p.id}`}
                  onClick={() => !isMatched && handleMatchSelect(p.id, 'left')}
                  className={`flex items-center gap-2 p-2 rounded-xl border-2 font-tajawal text-xs font-bold transition cursor-pointer ${
                    isMatched
                      ? 'border-[#0D9488] bg-[#0D9488]/20 text-[#0D9488]'
                      : isSelected
                      ? 'border-[#0284C7] bg-[#0284C7]/20 text-[#0284C7]'
                      : 'border-[#0F2C3B]/20 bg-[#FFFFFF] text-[#0F2C3B]'
                  }`}
                >
                  <span>{p.leftEmoji}</span>
                  <span>{p.leftText}</span>
                </button>
              );
            })}
          </div>
          <div className="flex flex-col gap-2">
            {slide.matchPairs.pairs.map((p) => {
              const isMatched = matchedPairs.includes(p.id);
              return (
                <button
                  key={`right-${p.id}`}
                  onClick={() => !isMatched && handleMatchSelect(p.id, 'right')}
                  className={`flex items-center gap-2 p-2 rounded-xl border-2 font-tajawal text-xs font-bold transition cursor-pointer ${
                    isMatched
                      ? 'border-[#0D9488] bg-[#0D9488]/20 text-[#0D9488]'
                      : 'border-[#0F2C3B]/20 bg-[#FFFFFF] text-[#0F2C3B]'
                  }`}
                >
                  <span>{p.rightEmoji}</span>
                  <span>{p.rightText}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 6. Fill in the Blank */}
      {slide.fillBlank && (
        <div className="mt-3 w-full max-w-md rounded-2xl border-2 border-[#0F3D4C] bg-[#FFFFFF] p-3 shadow-xs">
          <p className="font-baloo text-sm font-bold text-[#0F2C3B] mb-3">
            {slide.fillBlank.sentenceBefore}{' '}
            <span className="inline-block px-3 py-1 border-2 border-dashed border-[#0284C7] rounded-lg bg-[#0284C7]/10 text-[#0284C7]">
              {selectedWord || '...'}
            </span>{' '}
            {slide.fillBlank.sentenceAfter}
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {slide.fillBlank.wordBank.map((w, i) => (
              <button
                key={i}
                onClick={() => setSelectedWord(w)}
                className={`px-3 py-1.5 rounded-full border-2 font-tajawal text-xs font-bold transition cursor-pointer ${
                  selectedWord === w
                    ? w === slide.fillBlank?.blankAnswer
                      ? 'border-[#0D9488] bg-[#0D9488] text-white'
                      : 'border-[#D97706] bg-[#D97706] text-white'
                    : 'border-[#0F3D4C]/30 bg-[#FFFFFF] text-[#0F2C3B] hover:border-[#0284C7]'
                }`}
              >
                {w}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 7. Tap to Count */}
      {slide.tapToCount && (
        <div className="mt-3 w-full max-w-md rounded-2xl border-2 border-[#0F3D4C] bg-[#FFFFFF] p-3 shadow-xs text-center">
          <span className="font-baloo text-base font-extrabold text-[#D97706] block mb-2">
            العدد: {tapCount} من {slide.tapToCount.targetCount}
          </span>
          <div className="flex flex-wrap justify-center gap-3">
            {Array.from({ length: slide.tapToCount.targetCount }).map((_, i) => (
              <motion.button
                key={i}
                whileTap={{ scale: 0.9 }}
                onClick={() => setTapCount(Math.min(slide.tapToCount!.targetCount, tapCount + 1))}
                className={`w-11 h-11 rounded-full text-2xl border-2 flex items-center justify-center cursor-pointer transition ${
                  i < tapCount
                    ? 'border-[#0D9488] bg-[#0D9488]/20 scale-95'
                    : 'border-[#0F3D4C]/30 bg-[#FFFFFF]'
                }`}
              >
                {slide.tapToCount!.itemEmoji}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* 8. Hotspot Explore */}
      {slide.hotspot && (
        <div className="mt-3 relative w-full max-w-md aspect-video rounded-2xl border-2 border-[#0F3D4C] bg-[#FFFFFF] flex items-center justify-center overflow-hidden shadow-xs">
          <span className="text-6xl">{slide.hotspot.fallbackGraphic || '🌿'}</span>
          {slide.hotspot.points.map((pt, i) => (
            <button
              key={pt.id}
              onClick={() => setActiveHotspotIdx(activeHotspotIdx === i ? null : i)}
              style={{ top: `${pt.yPercent}%`, left: `${pt.xPercent}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-[#D97706] text-white font-baloo font-bold text-xs flex items-center justify-center shadow-md cursor-pointer hover:scale-110 transition"
            >
              {i + 1}
            </button>
          ))}
          {activeHotspotIdx !== null && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-2 inset-x-2 bg-white/95 backdrop-blur-xs border border-[#D97706] rounded-xl p-2 text-right font-tajawal text-xs shadow-md"
            >
              <strong>{slide.hotspot.points[activeHotspotIdx].title}:</strong>{' '}
              {slide.hotspot.points[activeHotspotIdx].detail}
            </motion.div>
          )}
        </div>
      )}

      {/* Example Icons */}
      {slide.examples && (
        <div className="mt-2 flex flex-wrap justify-center gap-4">
          {slide.examples.map((ex, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 + idx * 0.08 }}
              className="flex flex-col items-center"
            >
              <span className="text-2xl sm:text-3xl">{ex.emoji}</span>
              <span className="mt-0.5 font-baloo font-bold text-[10px] sm:text-xs text-[#0F2C3B]">{ex.name}</span>
            </motion.div>
          ))}
        </div>
      )}

      {/* Mascot Tip */}
      {slide.mascotTip && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
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
