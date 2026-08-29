'use client';

import { useState } from 'react';
import { Header } from '@/components/ui/Header';
import { generateSallaLicenseKey } from '@/lib/auth/licenseValidator';
import { Key, Copy, Plus, Download, Check, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function SallaLicensesAdminPage() {
  const [keysList, setKeysList] = useState<string[]>([]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleGenerateSingle = () => {
    const newKey = generateSallaLicenseKey();
    setKeysList(prev => [newKey, ...prev]);
  };

  const handleGenerateBatch = (count: number) => {
    const newKeys: string[] = [];
    for (let i = 0; i < count; i++) {
      newKeys.push(generateSallaLicenseKey());
    }
    setKeysList(prev => [...newKeys, ...prev]);
  };

  const handleCopy = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleExportCSV = () => {
    if (keysList.length === 0) return;
    const csvContent = 'data:text/csv;charset=utf-8,LicenseKey,MaxDevices\n' +
      keysList.map(k => `${k},2`).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `salla_license_keys_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#FBF3DE]">
      <Header />

      <main className="mx-auto max-w-5xl px-6 py-10">
        <Link
          href="/grades"
          className="inline-flex items-center gap-2 font-tajawal text-xs font-bold text-[#1B3B36] hover:text-[#C1502E] mb-6"
        >
          <ArrowRight className="h-4 w-4" />
          العودة للمنصة
        </Link>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[#1B3B36]/10 pb-6">
          <div>
            <span className="inline-block rounded-full bg-[#E8A93B]/20 px-3.5 py-1 font-tajawal text-xs font-bold text-[#1B3B36]">
              لوحة تحكم الأدمن
            </span>
            <h1 className="mt-2 font-baloo text-3xl font-extrabold text-[#1B3B36]">
              مولّد مفاتيح التفعيل لمتجر سلة (Salla)
            </h1>
            <p className="mt-1 font-tajawal text-xs text-[#1B3B36]/70">
              أنشئ مفاتيح سريعة مكونة من 16 حرفاً مقسمة لمجموعات رباعية تمهيداً لرفعه على المنتجات الرقمية بمتجر سلة.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleGenerateSingle}
              className="flex items-center gap-1.5 rounded-2xl bg-[#1B3B36] px-4 py-2.5 font-tajawal text-xs font-bold text-[#FFFDF7] shadow-md hover:bg-[#1B3B36]/90"
            >
              <Plus className="h-4 w-4" />
              مفتاح جديد
            </button>
            <button
              onClick={() => handleGenerateBatch(10)}
              className="flex items-center gap-1.5 rounded-2xl bg-[#3E92B0] px-4 py-2.5 font-tajawal text-xs font-bold text-[#FFFDF7] shadow-md hover:bg-[#3E92B0]/90"
            >
              مجموعة (10 مفاتيح)
            </button>
            {keysList.length > 0 && (
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 rounded-2xl bg-[#4F7942] px-4 py-2.5 font-tajawal text-xs font-bold text-[#FFFDF7] shadow-md hover:bg-[#4F7942]/90"
              >
                <Download className="h-4 w-4" />
                تصدير CSV لسلة
              </button>
            )}
          </div>
        </div>

        <div className="mt-8">
          <div className="flex items-center justify-between font-tajawal text-xs font-bold text-[#1B3B36] mb-3">
            <span>المفاتيح المُولّدة حديثاً ({keysList.length})</span>
            <span>الحد المسموح: جهازان (Max 2 Devices)</span>
          </div>

          {keysList.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-[#1B3B36]/20 bg-[#FFFDF7] p-12 text-center">
              <Key className="h-12 w-12 text-[#1B3B36]/30 mb-3" />
              <p className="font-tajawal text-sm text-[#1B3B36]/70">
                لم تقم بتوليد أي مفتاح تفعيل بعد. اضغط على أزرار التوليد بالأعلى للبدء.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {keysList.map((key, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between rounded-2xl border-2 border-[#1B3B36]/10 bg-[#FFFDF7] p-4 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E8A93B]/20 text-[#1B3B36]">
                      <Key className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="font-mono text-base font-bold text-[#1B3B36] tracking-wider">
                        {key}
                      </span>
                      <p className="font-tajawal text-[10px] text-[#1B3B36]/60">جاهز للبيع على سلة - أقصى حد: 2 جهاز</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleCopy(key)}
                    className="flex items-center gap-1 rounded-xl bg-[#F2E6C4] px-3 py-1.5 font-tajawal text-xs font-bold text-[#1B3B36] hover:bg-[#E8A93B]"
                  >
                    {copiedKey === key ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-[#4F7942]" />
                        <span>تم النسخ</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>نسخ</span>
                      </>
                    )}
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
