import { LessonData } from '@/types/lesson';
import { deriveMasterKey } from '@/lib/crypto/keyDerivation';
import { encryptPayload, decryptPayload } from '@/lib/crypto/aesGcm';
import { getDeviceFingerprint } from '@/lib/crypto/fingerprint';

export async function packageAndEncryptLesson(
  lesson: LessonData,
  licenseKey: string
): Promise<Blob> {
  const fp = await getDeviceFingerprint();
  const masterKey = await deriveMasterKey(licenseKey, fp);
  const jsonString = JSON.stringify(lesson);
  return encryptPayload(masterKey, jsonString);
}

export async function unpackAndDecryptLesson(
  encryptedBlob: Blob,
  licenseKey: string
): Promise<LessonData> {
  const fp = await getDeviceFingerprint();
  const masterKey = await deriveMasterKey(licenseKey, fp);
  const jsonString = await decryptPayload(masterKey, encryptedBlob);
  return JSON.parse(jsonString) as LessonData;
}
