'use client';

import { motion } from 'framer-motion';
import { Bot, MessageSquare } from 'lucide-react';

interface MascotRobertProps {
  tipText?: string;
}

export function MascotRobert({ tipText }: MascotRobertProps) {
  return (
    <div className="fixed bottom-14 left-4 z-30 flex items-end gap-2 max-w-xs pointer-events-none sm:left-6 sm:bottom-16">
      <motion.div
        animate={{ y: [0, -4, 0] }}
        transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
        className="relative flex flex-col items-center shrink-0"
      >
        <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl border-2 border-[#1B3B36] bg-[#3E92B0] shadow-md text-[#FFFDF7]">
          <Bot className="h-6 w-6 text-[#E8A93B]" />
        </div>
        <span className="mt-0.5 rounded-full bg-[#E8A93B] px-2 py-0.2 font-baloo text-[9px] font-bold text-[#1B3B36]">
          فطين
        </span>
      </motion.div>

      {tipText && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 5 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="pointer-events-auto relative rounded-xl border-2 border-[#1B3B36] bg-[#FFFDF7] p-2 shadow-md text-[#1B3B36] max-w-[200px] sm:max-w-xs"
        >
          <div className="flex items-start gap-1.5">
            <MessageSquare className="h-3.5 w-3.5 shrink-0 text-[#C1502E] mt-0.5" />
            <p className="font-tajawal text-[11px] font-bold leading-tight">{tipText}</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
