'use client';

import { useOrientation } from './useOrientation';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCw, Tablet } from 'lucide-react';

export function LandscapeGuard() {
  const { isPortrait } = useOrientation();

  return (
    <AnimatePresence>
      {isPortrait && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#1B3B36]/95 backdrop-blur-md p-6 text-center text-[#FFFDF7]"
        >
          <div className="relative mb-8 flex items-center justify-center">
            <motion.div
              animate={{ rotate: [0, 90, 0] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
              className="flex items-center justify-center rounded-3xl border-4 border-[#E8A93B] bg-[#FFFDF7] p-8 text-[#1B3B36] shadow-2xl"
            >
              <Tablet className="h-20 w-20 text-[#3E92B0]" />
            </motion.div>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="absolute -right-4 -top-4 rounded-full bg-[#C1502E] p-3 text-[#FFFDF7] shadow-lg"
            >
              <RotateCw className="h-7 w-7" />
            </motion.div>
          </div>

          <h2 className="font-baloo text-3xl font-extrabold text-[#E8A93B] md:text-4xl">
            يرجى تدوير الشاشة بالعرض
          </h2>
          <p className="mt-3 max-w-md font-tajawal text-lg leading-relaxed text-[#FFFDF7]/90">
            للحصول على أفضل تجربة تفاعلية وتشغيل خريطة الدرس بشكل كامل، أدر جهازك للوضع الأفقي 🔄.
          </p>

          <div className="mt-8 rounded-full border border-[#E8A93B]/30 bg-[#FFFDF7]/10 px-6 py-2.5 font-tajawal text-sm text-[#E8A93B]">
            الوضع العرضي إجباري داخل مشغل الدروس التفاعلية
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
