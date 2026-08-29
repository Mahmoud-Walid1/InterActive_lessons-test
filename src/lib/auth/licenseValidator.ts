import { ActivationResult } from '@/types/auth';
import { getDeviceFingerprint } from '@/lib/crypto/fingerprint';
import { saveAuthState, getAuthState } from '@/lib/db/offlineStore';

export function formatLicenseKey(input: string): string {
  const clean = input.toUpperCase().replace(/[^A-Z0-9]/g, '');
  const chunks = clean.match(/.{1,4}/g) || [];
  return chunks.slice(0, 4).join('-');
}

export async function validateAndActivateLicense(phone: string, rawKey: string): Promise<ActivationResult> {
  const formattedKey = formatLicenseKey(rawKey);
  if (formattedKey.length < 19) {
    return { success: false, message: 'يرجى إدخال مفتاح ترخيص مكون من 16 حرفاً ورقم بالصيغة الصحيحة (XXXX-XXXX-XXXX-XXXX).' };
  }

  if (!phone || phone.length < 8) {
    return { success: false, message: 'يرجى إدخال رقم هاتف صحيح.' };
  }

  const currentFp = await getDeviceFingerprint();
  const existingAuth = await getAuthState();

  let registeredDevices: string[] = existingAuth?.devices || [];

  if (!registeredDevices.includes(currentFp)) {
    if (registeredDevices.length >= 2) {
      return {
        success: false,
        message: 'لقد تجاوزت الحد الأقصى للأجهزة المسموح بها (جهازان فقط). تواصل مع الدعم الفني لإدارة أجهزتك.'
      };
    }
    registeredDevices.push(currentFp);
  }

  const token = `session_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

  await saveAuthState({
    licenseKey: formattedKey,
    phone,
    deviceFingerprint: currentFp,
    devices: registeredDevices,
    activeSessionToken: token,
    activatedAt: new Date().toISOString()
  });

  return {
    success: true,
    message: 'تم تفعيل التراخيص بنجاح! مرحباً بك في منصة الدروس التفاعلية.',
    deviceCount: registeredDevices.length,
    maxDevices: 2,
    licenseKey: formattedKey,
    phone
  };
}

export function generateSallaLicenseKey(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let key = '';
  for (let i = 0; i < 16; i++) {
    if (i > 0 && i % 4 === 0) key += '-';
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
}
