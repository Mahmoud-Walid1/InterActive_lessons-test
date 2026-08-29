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
      className="flex flex-col items-center justify-center p-6 text-center"
    >
      <div className="rounded-3xl border-3 border-[#E8A93B] bg-[#FFFDF7] p-8 shadow-2xl max-w-md w-full">
        <h2 className="font-baloo text-3xl font-extrabold text-[#1B3B36]">أحسنت يا بطل! 🎉</h2>
        <p className="mt-2 font-tajawal text-sm text-[#1B3B36]/80">لقد أنجزت جميع أنشطة الدرس بنجاح واستحققت النجوم:</p>

        <div className="my-6 flex justify-center gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.2, type: 'spring' }}
            >
              <Star
                className={`h-14 w-14 ${
                  i < starsCount
                    ? 'fill-[#E8A93B] text-[#E8A93B] drop-shadow-md'
                    : 'text-gray-300'
                }`}
              />
            </motion.div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <button
            onClick={onReplay}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#3E92B0] py-3 font-tajawal font-bold text-[#FFFDF7] hover:bg-[#3E92B0]/90 shadow-md"
          >
            <RotateCcw className="h-4 w-4" />
            إعادة الدرس
          </button>
          <Link
            href="/grades"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#1B3B36] py-3 font-tajawal font-bold text-[#FFFDF7] hover:bg-[#1B3B36]/90 shadow-md"
          >
            <Home className="h-4 w-4" />
            خريطة الدروس
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
