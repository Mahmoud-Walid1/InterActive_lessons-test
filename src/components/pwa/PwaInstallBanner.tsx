'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Smartphone, Share, PlusSquare, X } from 'lucide-react';

export function PwaInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [showIOSModal, setShowIOSModal] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    const handleCustomTrigger = () => {
      if (isIosDevice) {
        setShowIOSModal(true);
      } else if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choice: any) => {
          if (choice.outcome === 'accepted') {
            setShowBanner(false);
          }
          setDeferredPrompt(null);
        });
      } else {
        setShowBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('open-pwa-install', handleCustomTrigger);

    if (!isStandalone) {
      setShowBanner(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('open-pwa-install', handleCustomTrigger);
    };
  }, [deferredPrompt]);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    } else {
      setShowIOSModal(true);
    }
  };

  return (
    <>
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-lg rounded-3xl border-3 border-[#E8A93B] bg-[#1B3B36] p-4 text-[#FFFDF7] shadow-2xl"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#E8A93B] text-[#1B3B36] shadow-md">
                  <Smartphone className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-baloo font-bold text-[#E8A93B] text-sm sm:text-base">تثبيت المنصة على جهازك 📲</h4>
                  <p className="font-tajawal text-xs text-[#FFFDF7]/85 leading-snug">
                    اضغط تثبيت لإضافة آيقونة المنصة على شاشتك التشغيلية بدون إنترنت.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleInstallClick}
                  className="flex items-center gap-1.5 rounded-xl bg-[#C1502E] px-3.5 py-2 font-tajawal text-xs font-bold text-[#FFFDF7] transition hover:bg-[#C1502E]/90 shadow-sm"
                >
                  <Download className="h-4 w-4" />
                  تثبيت الآن
                </button>
                <button
                  onClick={() => setShowBanner(false)}
                  className="rounded-lg p-1 text-[#FFFDF7]/60 hover:bg-[#FFFDF7]/10"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showIOSModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          >
            <div className="w-full max-w-sm rounded-3xl border-2 border-[#E8A93B] bg-[#FFFDF7] p-6 text-[#1B3B36] shadow-2xl">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="font-baloo text-lg font-bold text-[#1B3B36]">تعليمات التثبيت 📲</h3>
                <button onClick={() => setShowIOSModal(false)}>
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-4 space-y-3 font-tajawal text-xs">
                {isIOS ? (
                  <>
                    <div className="flex items-center gap-3 rounded-2xl bg-[#F2E6C4] p-3">
                      <Share className="h-6 w-6 text-[#3E92B0] shrink-0" />
                      <span>1. اضغط زر <strong>مشاركة (Share)</strong> في Safari.</span>
                    </div>
                    <div className="flex items-center gap-3 rounded-2xl bg-[#F2E6C4] p-3">
                      <PlusSquare className="h-6 w-6 text-[#4F7942] shrink-0" />
                      <span>2. اختر <strong>إضافة إلى الشاشة الرئيسية (Add to Home Screen)</strong>.</span>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-3 rounded-2xl bg-[#F2E6C4] p-3">
                    <Download className="h-6 w-6 text-[#3E92B0] shrink-0" />
                    <span>اضغط زر القائمة (الثلاث نقاط) بالمتصفح ثم اختر <strong>"تثبيت التطبيق"</strong> أو <strong>"إضافة للشاشة الرئيسية"</strong>.</span>
                  </div>
                )}
              </div>

              <button
                onClick={() => setShowIOSModal(false)}
                className="mt-5 w-full rounded-xl bg-[#1B3B36] py-2.5 font-tajawal text-xs font-bold text-[#FFFDF7]"
              >
                فهمت ذلك!
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
