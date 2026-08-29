'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Play, Download, CheckCircle2, ShieldAlert, Trash2, RefreshCw } from 'lucide-react';
import { isLessonOffline, saveOfflineLesson, removeOfflineLesson, getAuthState } from '@/lib/db/offlineStore';
import { SAMPLE_LESSONS } from '@/lib/lessons/sampleLessons';
import { packageAndEncryptLesson } from '@/lib/lessons/lessonPackager';
import { DownloadProgress } from './DownloadProgress';

interface LessonCardProps {
  lessonId: string;
  title: string;
  description: string;
  gradeId: string;
  subjectId: string;
}

export function LessonCard({ lessonId, title, description, gradeId, subjectId }: LessonCardProps) {
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [downloading, setDownloading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    isLessonOffline(lessonId).then(setIsOffline);
  }, [lessonId]);

  const handleDownload = async () => {
    try {
      setErrorMsg(null);
      const auth = await getAuthState();
      if (!auth || !auth.licenseKey) {
        setErrorMsg('يرجى تفعيل مفتاح الترخيص أولاً لإمكانية التنزيل أوفلاين.');
        return;
      }

      setDownloading(true);
      setProgress(15);

      const lessonData = SAMPLE_LESSONS[lessonId];
      if (!lessonData) {
        throw new Error('الدرس غير متوفر للتحميل الان.');
      }

      const timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 85) {
            clearInterval(timer);
            return 90;
          }
          return prev + 25;
        });
      }, 200);

      const encryptedBlob = await packageAndEncryptLesson(lessonData, auth.licenseKey);
      await saveOfflineLesson(lessonId, gradeId, subjectId, title, encryptedBlob);

      setProgress(100);
      setTimeout(() => {
        setDownloading(false);
        setIsOffline(true);
      }, 300);
    } catch (e: any) {
      setDownloading(false);
      setErrorMsg(e.message || 'حدث خطأ أثناء تحميل الدرس.');
    }
  };

  const handleRemove = async () => {
    await removeOfflineLesson(lessonId);
    setIsOffline(false);
  };

  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="flex flex-col justify-between rounded-3xl border-2 border-[#0F3D4C]/10 bg-[#FFFFFF] p-6 shadow-sm transition hover:shadow-md"
    >
      <div>
        <div className="flex items-center justify-between gap-2">
          <span className="rounded-full bg-[#F59E0B]/20 px-3 py-1 font-tajawal text-xs font-bold text-[#0F2C3B]">
            درس تفاعلي مشفر
          </span>

          {isOffline ? (
            <span className="flex items-center gap-1.5 rounded-full bg-[#0D9488] px-3 py-1 font-tajawal text-xs font-bold text-[#FFFFFF]">
              <CheckCircle2 className="h-3.5 w-3.5" />
              محمل أوفلاين
            </span>
          ) : (
            <span className="rounded-full bg-[#0284C7]/20 px-3 py-1 font-tajawal text-xs font-bold text-[#0284C7]">
              جاهز للتشغيل أونلاين
            </span>
          )}
        </div>

        <h3 className="mt-4 font-baloo text-xl font-extrabold text-[#0F2C3B]">{title}</h3>
        <p className="mt-2 font-tajawal text-xs leading-relaxed text-[#0F2C3B]/80">{description}</p>
      </div>

      {errorMsg && (
        <div className="mt-3 flex items-center gap-2 rounded-xl bg-[#D97706]/10 p-2.5 font-tajawal text-xs font-bold text-[#D97706]">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="mt-6 flex items-center justify-between gap-3 border-t border-[#0F3D4C]/10 pt-4">
        <Link
          href={`/player/${lessonId}`}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#0F3D4C] py-3 font-tajawal text-xs font-bold text-[#FFFFFF] transition hover:bg-[#0284C7] shadow-sm"
        >
          <Play className="h-4 w-4 fill-current text-[#F59E0B]" />
          تشغيل الدرس الآن
        </Link>

        {isOffline ? (
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleDownload}
              title="تحديث للنسخة الأخيرة"
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#0284C7]/30 bg-[#0284C7]/10 text-[#0284C7] transition hover:bg-[#0284C7] hover:text-[#FFFFFF]"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            <button
              onClick={handleRemove}
              title="حذف من التحميلات الأوفلاين"
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-red-200 bg-red-50 text-red-600 transition hover:bg-red-100"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ) : downloading ? (
          <DownloadProgress progress={progress} />
        ) : (
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 rounded-2xl border-2 border-[#0D9488] bg-[#0D9488]/10 px-4 py-2.5 font-tajawal text-xs font-bold text-[#0D9488] transition hover:bg-[#0D9488] hover:text-[#FFFFFF]"
          >
            <Download className="h-4 w-4" />
            تحميل أوفلاين
          </button>
        )}
      </div>
    </motion.div>
  );
}
