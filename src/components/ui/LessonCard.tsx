'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Play, Download, CheckCircle2, ShieldAlert, Trash2 } from 'lucide-react';
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
      }, 250);

      const encryptedBlob = await packageAndEncryptLesson(lessonData, auth.licenseKey);
      await saveOfflineLesson(lessonId, gradeId, subjectId, title, encryptedBlob);

      setProgress(100);
      setTimeout(() => {
        setDownloading(false);
        setIsOffline(true);
      }, 400);
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
      className="flex flex-col justify-between rounded-3xl border-2 border-[#1B3B36]/10 bg-[#FFFDF7] p-6 shadow-md transition hover:shadow-lg"
    >
      <div>
        <div className="flex items-center justify-between gap-2">
          <span className="rounded-full bg-[#E8A93B]/20 px-3 py-1 font-tajawal text-xs font-bold text-[#1B3B36]">
            درس تفاعلي مشفر
          </span>

          {isOffline ? (
            <span className="flex items-center gap-1.5 rounded-full bg-[#4F7942] px-3 py-1 font-tajawal text-xs font-bold text-[#FFFDF7]">
              <CheckCircle2 className="h-3.5 w-3.5" />
              محمل أوفلاين
            </span>
          ) : (
            <span className="rounded-full bg-[#3E92B0]/20 px-3 py-1 font-tajawal text-xs font-bold text-[#3E92B0]">
              جاهز للتشغيل أونلاين
            </span>
          )}
        </div>

        <h3 className="mt-4 font-baloo text-xl font-extrabold text-[#1B3B36]">{title}</h3>
        <p className="mt-2 font-tajawal text-xs leading-relaxed text-[#1B3B36]/80">{description}</p>
      </div>

      {errorMsg && (
        <div className="mt-3 flex items-center gap-2 rounded-xl bg-[#C1502E]/10 p-2.5 font-tajawal text-xs font-bold text-[#C1502E]">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="mt-6 flex items-center justify-between gap-3 border-t border-[#1B3B36]/10 pt-4">
        <Link
          href={`/player/${lessonId}`}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#1B3B36] py-3 font-tajawal text-xs font-bold text-[#FFFDF7] transition hover:bg-[#1B3B36]/90 shadow-md"
        >
          <Play className="h-4 w-4 fill-current text-[#E8A93B]" />
          تشغيل الدرس الآن
        </Link>

        {isOffline ? (
          <button
            onClick={handleRemove}
            title="حذف من التحميلات الأوفلاين"
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-red-200 bg-red-50 text-red-600 transition hover:bg-red-100"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        ) : downloading ? (
          <DownloadProgress progress={progress} />
        ) : (
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 rounded-2xl border-2 border-[#4F7942] bg-[#4F7942]/10 px-4 py-2.5 font-tajawal text-xs font-bold text-[#4F7942] transition hover:bg-[#4F7942] hover:text-[#FFFDF7]"
          >
            <Download className="h-4 w-4" />
            تحميل أوفلاين
          </button>
        )}
      </div>
    </motion.div>
  );
}
