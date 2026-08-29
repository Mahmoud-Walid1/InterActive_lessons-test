'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAuthState } from '@/lib/db/offlineStore';
import { GraduationCap, Key, ShieldCheck } from 'lucide-react';

export function Header() {
  const [phone, setPhone] = useState<string | null>(null);

  useEffect(() => {
    getAuthState().then((auth) => {
      if (auth && auth.phone) setPhone(auth.phone);
    });
  }, []);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b-2 border-[#1B3B36]/10 bg-[#FFFDF7]/90 px-6 py-4 backdrop-blur-md">
      <Link href="/grades" className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1B3B36] text-[#E8A93B]">
          <GraduationCap className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-baloo text-lg font-extrabold text-[#1B3B36]">منصة الدروس التفاعلية</h1>
          <p className="font-tajawal text-[11px] text-[#1B3B36]/70">المرحلة الابتدائية - مشغل أوفلاين مشفر</p>
        </div>
      </Link>

      <div className="flex items-center gap-3">
        {phone ? (
          <div className="flex items-center gap-2 rounded-full border border-[#4F7942] bg-[#4F7942]/10 px-3.5 py-1.5 font-tajawal text-xs font-bold text-[#4F7942]">
            <ShieldCheck className="h-4 w-4" />
            <span>مُفعل: {phone}</span>
          </div>
        ) : (
          <Link
            href="/"
            className="flex items-center gap-1.5 rounded-full bg-[#C1502E] px-4 py-1.5 font-tajawal text-xs font-bold text-[#FFFDF7] shadow-sm hover:bg-[#C1502E]/90"
          >
            <Key className="h-3.5 w-3.5" />
            تفعيل الاشتراك
          </Link>
        )}

        <Link
          href="/admin/licenses"
          className="rounded-full border border-[#1B3B36]/20 bg-[#F2E6C4] px-3.5 py-1.5 font-tajawal text-xs font-bold text-[#1B3B36] hover:bg-[#E8A93B]"
        >
          مولّد سيرة سلة
        </Link>
      </div>
    </header>
  );
}
