'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAuthState } from '@/lib/db/offlineStore';
import { GraduationCap, Key, ShieldCheck, Download } from 'lucide-react';

export function Header() {
  const [phone, setPhone] = useState<string | null>(null);

  useEffect(() => {
    getAuthState().then((auth) => {
      if (auth && auth.phone) setPhone(auth.phone);
    });
  }, []);

  const triggerPwaInstall = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('open-pwa-install'));
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-[#1B3B36]/10 bg-[#FFFDF7]/95 px-4 backdrop-blur-md">
      <Link href="/grades" className="flex items-center gap-2.5 shrink-0">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1B3B36] text-[#E8A93B] shadow-sm">
          <GraduationCap className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-baloo text-sm sm:text-base font-extrabold text-[#1B3B36] leading-none">
            منصة الدروس التفاعلية
          </h1>
          <p className="hidden sm:block font-tajawal text-[10px] text-[#1B3B36]/70 mt-0.5">
            المرحلة الابتدائية - مشغل أوفلاين مشفر
          </p>
        </div>
      </Link>

      <div className="flex items-center gap-2">
        <button
          onClick={triggerPwaInstall}
          title="تثبيت المنصة"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-[#E8A93B] bg-[#E8A93B]/20 text-[#C1502E] transition hover:bg-[#E8A93B] shadow-sm"
        >
          <Download className="h-4 w-4" />
        </button>

        {phone ? (
          <div className="flex items-center gap-1 rounded-full border border-[#4F7942] bg-[#4F7942]/10 px-2.5 py-1 font-tajawal text-xs font-bold text-[#4F7942]">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span className="truncate max-w-[90px] sm:max-w-none">{phone}</span>
          </div>
        ) : (
          <Link
            href="/"
            className="flex items-center gap-1 rounded-full bg-[#C1502E] px-3 py-1 font-tajawal text-xs font-bold text-[#FFFDF7] shadow-sm hover:bg-[#C1502E]/90"
          >
            <Key className="h-3.5 w-3.5" />
            <span>تفعيل</span>
          </Link>
        )}
      </div>
    </header>
  );
}
