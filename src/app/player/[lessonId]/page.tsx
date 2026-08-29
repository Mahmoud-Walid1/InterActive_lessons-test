'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { LessonData } from '@/types/lesson';
import { SAMPLE_LESSONS } from '@/lib/lessons/sampleLessons';
import { getOfflineLesson, getAuthState } from '@/lib/db/offlineStore';
import { unpackAndDecryptLesson } from '@/lib/lessons/lessonPackager';
import { LessonPlayerShell } from '@/components/player/LessonPlayerShell';
import { Loader2, ShieldAlert, Key } from 'lucide-react';
import Link from 'next/link';

export default function LessonPlayerPage() {
  const params = useParams();
  const router = useRouter();
  const lessonId = params?.lessonId as string;

  const [lessonData, setLessonData] = useState<LessonData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadAndDecrypt() {
      try {
        setLoading(true);
        setErrorMsg(null);

        const auth = await getAuthState();
        const licenseKey = auth?.licenseKey || 'DEMO-LICENSE-KEY';

        // Check if stored offline in Dexie IndexedDB
        const offlineRecord = await getOfflineLesson(lessonId).catch((err) => {
          throw new Error(err.message || 'فشل التوثيق الأمني للملف المحمل.');
        });

        if (offlineRecord) {
          const decrypted = await unpackAndDecryptLesson(offlineRecord.encryptedPayload, licenseKey);
          setLessonData(decrypted);
        } else {
          // Stream online from sample lessons
          const rawSample = SAMPLE_LESSONS[lessonId] || SAMPLE_LESSONS['lesson_animals_group'];
          setLessonData(rawSample);
        }
      } catch (e: any) {
        setErrorMsg(e.message || 'تعذر تشغيل الدرس المحمي.');
      } finally {
        setLoading(false);
      }
    }

    loadAndDecrypt();
  }, [lessonId]);

  if (loading) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-[#1B3B36] text-[#FFFDF7] p-6 text-center">
        <Loader2 className="h-12 w-12 animate-spin text-[#E8A93B]" />
        <h2 className="mt-4 font-baloo text-2xl font-bold text-[#E8A93B]">جاري التفكيك والتجميع في الذاكرة (RAM)...</h2>
        <p className="mt-2 font-tajawal text-sm text-[#FFFDF7]/70">يتم فحص المفتاح الرقمي وبصمة الجهاز والتشفير AES-256-GCM</p>
      </div>
    );
  }

  if (errorMsg || !lessonData) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-[#1B3B36] text-[#FFFDF7] p-6 text-center">
        <div className="rounded-3xl border-2 border-[#C1502E] bg-[#FFFDF7] p-8 text-[#1B3B36] max-w-md w-full shadow-2xl">
          <ShieldAlert className="h-12 w-12 text-[#C1502E] mx-auto mb-3" />
          <h2 className="font-baloo text-2xl font-bold text-[#C1502E]">خطأ في الحماية والتوثيق</h2>
          <p className="mt-2 font-tajawal text-sm text-[#1B3B36]/80 leading-relaxed">{errorMsg}</p>
          <div className="mt-6 flex flex-col gap-3">
            <Link
              href="/"
              className="flex items-center justify-center gap-2 rounded-xl bg-[#1B3B36] py-3 font-tajawal text-xs font-bold text-[#FFFDF7]"
            >
              <Key className="h-4 w-4" />
              إعادة تفعيل الاشتراك
            </Link>
            <button
              onClick={() => router.back()}
              className="font-tajawal text-xs font-bold text-[#3E92B0] hover:underline"
            >
              العودة للدروس &larr;
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <LessonPlayerShell lesson={lessonData} />;
}
