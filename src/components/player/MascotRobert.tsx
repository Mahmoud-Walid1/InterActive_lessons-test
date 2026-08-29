'use client';

import { motion } from 'framer-motion';
import { Bot, MessageSquare } from 'lucide-react';

interface MascotRobertProps {
  tipText?: string;
}

export function MascotRobert({ tipText }: MascotRobertProps) {
  return (
    <div className="fixed bottom-24 right-6 z-30 flex items-end gap-3 max-w-xs pointer-events-none">
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
        className="relative flex flex-col items-center"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-[#1B3B36] bg-[#3E92B0] shadow-xl text-[#FFFDF7]">
          <Bot className="h-10 w-10 text-[#E8A93B]" />
        </div>
        <span className="mt-1 rounded-full bg-[#E8A93B] px-2 py-0.5 font-baloo text-[10px] font-bold text-[#1B3B36]">
          روبرت
        </span>
      </motion.div>

      {tipText && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="pointer-events-auto relative rounded-2xl border-2 border-[#1B3B36] bg-[#FFFDF7] p-3 shadow-lg text-[#1B3B36]"
        >
          <div className="flex items-start gap-2">
            <MessageSquare className="h-4 w-4 shrink-0 text-[#C1502E] mt-1" />
            <p className="font-tajawal text-xs font-bold leading-relaxed">{tipText}</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
