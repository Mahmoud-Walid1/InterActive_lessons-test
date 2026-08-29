'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAuthState } from '@/lib/db/offlineStore';
import { GraduationCap, Key, ShieldCheck, Download, Sparkles } from 'lucide-react';

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
    <div className="sticky top-0 z-30 w-full shadow-sm">
      {/* Top Salla Store Announcement Marquee Bar */}
      <div className="flex h-7 w-full items-center justify-between bg-[#0F3D4C] px-4 font-tajawal text-[10px] text-[#FFFFFF] overflow-hidden">
        <div className="flex items-center gap-4 animate-pulse truncate">
          <span className="flex items-center gap-1 text-[#F59E0B] font-bold">
            <Sparkles className="h-3 w-3" />
            أهلاً وسهلاً بكم في متجر العلوم والتقنية للجميع
          </span>
          <span className="hidden md:inline">✦ نتشرف بخدمتكم</span>
          <span className="hidden md:inline">✦ جميع منتجاتنا رقمية ومشفرة</span>
        </div>
        <span className="text-[9px] text-[#F59E0B] shrink-0 font-bold">منصة الابتدائية التفاعلية</span>
      </div>

      {/* Main Header Bar */}
      <header className="flex h-14 w-full items-center justify-between border-b border-[#0F3D4C]/10 bg-[#FFFFFF] px-4 backdrop-blur-md">
        <Link href="/grades" className="flex items-center gap-2.5 shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#0F3D4C] to-[#0284C7] text-[#FFFFFF] shadow-sm">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-baloo text-sm sm:text-base font-extrabold text-[#0F2C3B] leading-none">
              متجر العلوم والتقنية
            </h1>
            <p className="hidden sm:block font-tajawal text-[10px] text-[#0284C7] font-bold mt-0.5">
              منصة الدروس التفاعلية للأجهزة المحمولة
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={triggerPwaInstall}
            title="تثبيت المنصة"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-[#0284C7] bg-[#0284C7]/10 text-[#0284C7] transition hover:bg-[#0284C7] hover:text-[#FFFFFF] shadow-sm"
          >
            <Download className="h-4 w-4" />
          </button>

          {phone ? (
            <div className="flex items-center gap-1 rounded-full border border-[#0D9488] bg-[#0D9488]/10 px-2.5 py-1 font-tajawal text-xs font-bold text-[#0D9488]">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span className="truncate max-w-[90px] sm:max-w-none">{phone}</span>
            </div>
          ) : (
            <Link
              href="/"
              className="flex items-center gap-1 rounded-full bg-[#0284C7] px-3.5 py-1 font-tajawal text-xs font-bold text-[#FFFFFF] shadow-sm hover:bg-[#0F3D4C]"
            >
              <Key className="h-3.5 w-3.5" />
              <span>تفعيل</span>
            </Link>
          )}
        </div>
      </header>
    </div>
  );
}
