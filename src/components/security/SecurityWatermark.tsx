'use client';

import { useEffect, useState } from 'react';
import { getAuthState } from '@/lib/db/offlineStore';

export function SecurityWatermark() {
  const [watermarkText, setWatermarkText] = useState<string>('');

  useEffect(() => {
    getAuthState().then((auth) => {
      if (auth && auth.phone) {
        setWatermarkText(`مرخص لـ: ${auth.phone} | ${auth.licenseKey}`);
      }
    });
  }, []);

  if (!watermarkText) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-40 flex flex-wrap items-center justify-around overflow-hidden opacity-[0.06] select-none">
      {Array.from({ length: 12 }).map((_, i) => (
        <span key={i} className="rotate-[-25deg] font-mono text-xs font-bold text-[#1B3B36]">
          {watermarkText}
        </span>
      ))}
    </div>
  );
}
