'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Star, RotateCcw, Home } from 'lucide-react';
import Link from 'next/link';

interface StarRewardScreenProps {
  starsCount?: number;
  onReplay: () => void;
}

export function StarRewardScreen({ starsCount = 3, onReplay }: StarRewardScreenProps) {
  useEffect(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }, []);

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="flex flex-col items-center justify-center p-2 text-center my-auto max-w-sm w-full"
    >
      <div className="rounded-2xl border-2 border-[#E8A93B] bg-[#FFFDF7] p-5 shadow-xl w-full">
        <h2 className="font-baloo text-xl font-extrabold text-[#1B3B36]">أحسنت يا بطل! 🎉</h2>
        <p className="mt-1 font-tajawal text-xs text-[#1B3B36]/80">لقد أنجزت جميع أنشطة الدرس بنجاح واستحققت النجوم:</p>

        <div className="my-3 flex justify-center gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.15, type: 'spring' }}
            >
              <Star
                className={`h-9 w-9 ${
                  i < starsCount
                    ? 'fill-[#E8A93B] text-[#E8A93B] drop-shadow'
                    : 'text-gray-300'
                }`}
              />
            </motion.div>
          ))}
        </div>

        <div className="flex gap-2 mt-4">
          <button
            onClick={onReplay}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#3E92B0] py-2 font-tajawal text-xs font-bold text-[#FFFDF7] hover:bg-[#3E92B0]/90 shadow-sm"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            إعادة الدرس
          </button>
          <Link
            href="/grades"
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#1B3B36] py-2 font-tajawal text-xs font-bold text-[#FFFDF7] hover:bg-[#1B3B36]/90 shadow-sm"
          >
            <Home className="h-3.5 w-3.5" />
            الدروس
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
