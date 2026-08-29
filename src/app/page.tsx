'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { validateAndActivateLicense, formatLicenseKey } from '@/lib/auth/licenseValidator';
import { getAuthState } from '@/lib/db/offlineStore';
import { Key, Phone, ShieldCheck, ArrowLeft, Sparkles, Smartphone } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LandingActivationPage() {
  const router = useRouter();
  const [phone, setPhone] = useState<string>('');
  const [licenseKey, setLicenseKey] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    getAuthState().then((auth) => {
      if (auth && auth.licenseKey) {
        setLicenseKey(auth.licenseKey);
        if (auth.phone) setPhone(auth.phone);
      }
    });
  }, []);

  const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatLicenseKey(e.target.value);
    setLicenseKey(formatted);
  };

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      const result = await validateAndActivateLicense(phone, licenseKey);
      if (!result.success) {
        setErrorMessage(result.message);
      } else {
        setSuccessMessage(result.message);
        setTimeout(() => {
          router.push('/grades');
        }, 1000);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'حدث خطأ في التفعيل.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-b from-[#FBF3DE] to-[#F2E6C4]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg rounded-3xl border-3 border-[#1B3B36] bg-[#FFFDF7] p-8 shadow-2xl"
      >
        <div className="flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1B3B36] text-[#E8A93B] shadow-lg mb-4">
            <Sparkles className="h-8 w-8" />
          </div>
          <h1 className="font-baloo text-3xl font-extrabold text-[#1B3B36]">
            تفعيل منصة الدروس التفاعلية
          </h1>
          <p className="mt-2 font-tajawal text-sm text-[#1B3B36]/80 leading-relaxed">
            أدخل رقم الهاتف ومفتاح الترخيص المكون من 16 حرفاً المرفق مع فاتورة الشراء من متجر سلة.
          </p>
        </div>

        <form onSubmit={handleActivate} className="mt-8 space-y-4">
          <div>
            <label className="mb-1.5 block font-tajawal text-xs font-bold text-[#1B3B36]">
              رقم هاتف المشترك
            </label>
            <div className="relative">
              <Phone className="absolute right-3.5 top-3.5 h-5 w-5 text-[#1B3B36]/40" />
              <input
                type="tel"
                required
                placeholder="05XXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-2xl border-2 border-[#1B3B36]/20 bg-[#FFFDF7] py-3 pr-11 pl-4 font-mono text-sm text-[#1B3B36] focus:border-[#E8A93B] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block font-tajawal text-xs font-bold text-[#1B3B36]">
              مفتاح الترخيص (16 حرفاً من سلة)
            </label>
            <div className="relative">
              <Key className="absolute right-3.5 top-3.5 h-5 w-5 text-[#1B3B36]/40" />
              <input
                type="text"
                required
                maxLength={19}
                placeholder="XXXX-XXXX-XXXX-XXXX"
                value={licenseKey}
                onChange={handleKeyChange}
                className="w-full rounded-2xl border-2 border-[#1B3B36]/20 bg-[#FFFDF7] py-3 pr-11 pl-4 font-mono text-sm text-[#1B3B36] focus:border-[#E8A93B] focus:outline-none tracking-widest uppercase"
              />
            </div>
          </div>

          {errorMessage && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-3.5 font-tajawal text-xs font-bold text-red-600">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="flex items-center gap-2 rounded-2xl border border-[#4F7942] bg-[#4F7942]/10 p-3.5 font-tajawal text-xs font-bold text-[#4F7942]">
              <ShieldCheck className="h-5 w-5 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#C1502E] py-3.5 font-tajawal font-bold text-[#FFFDF7] shadow-lg transition hover:bg-[#C1502E]/90 disabled:opacity-50"
          >
            <span>{loading ? 'جاري التوثيق والتفعيل...' : 'تفعيل وتأكيد الجهاز'}</span>
            <ArrowLeft className="h-5 w-5" />
          </button>
        </form>

        <div className="mt-6 flex items-center justify-between border-t border-[#1B3B36]/10 pt-4 font-tajawal text-xs text-[#1B3B36]/70">
          <div className="flex items-center gap-1.5">
            <Smartphone className="h-4 w-4 text-[#3E92B0]" />
            <span>مسموح بجهازين لكل تفعيل</span>
          </div>
          <button
            onClick={() => router.push('/grades')}
            className="font-bold text-[#3E92B0] hover:underline"
          >
            الانتقال للدروس مباشرة &larr;
          </button>
        </div>
      </motion.div>
    </div>
  );
}
