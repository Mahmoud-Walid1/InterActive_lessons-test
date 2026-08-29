import { db } from './dexieDb';
import { OfflineLessonRecord, AuthStateRecord } from '@/types/offline';
import { getDeviceFingerprint } from '@/lib/crypto/fingerprint';

export async function saveOfflineLesson(
  lessonId: string,
  gradeId: string,
  subjectId: string,
  title: string,
  encryptedPayload: Blob
): Promise<void> {
  const fp = await getDeviceFingerprint();
  const record: OfflineLessonRecord = {
    lessonId,
    gradeId,
    subjectId,
    title,
    encryptedPayload,
    downloadedAt: new Date().toISOString(),
    checksum: String(encryptedPayload.size),
    deviceSignature: fp
  };
  await db.downloaded_lessons.put(record);
}

export async function getOfflineLesson(lessonId: string): Promise<OfflineLessonRecord | undefined> {
  const record = await db.downloaded_lessons.get(lessonId);
  if (!record) return undefined;

  const currentFp = await getDeviceFingerprint();
  if (record.deviceSignature !== currentFp) {
    throw new Error('فشل التوثيق: الملف المحمل تم نقله من جهاز آخر وغير صالح للتشغيل.');
  }

  return record;
}

export async function isLessonOffline(lessonId: string): Promise<boolean> {
  const count = await db.downloaded_lessons.where('lessonId').equals(lessonId).count();
  return count > 0;
}

export async function removeOfflineLesson(lessonId: string): Promise<void> {
  await db.downloaded_lessons.delete(lessonId);
}

export async function saveAuthState(state: Omit<AuthStateRecord, 'id'>): Promise<void> {
  await db.auth_state.put({ ...state, id: 'current_user' });
}

export async function getAuthState(): Promise<AuthStateRecord | undefined> {
  return db.auth_state.get('current_user');
}
