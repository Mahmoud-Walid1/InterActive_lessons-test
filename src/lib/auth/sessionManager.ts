import { getAuthState } from '@/lib/db/offlineStore';

export async function checkSingleActiveSession(): Promise<{ isAuthorized: boolean; reason?: string }> {
  if (typeof window === 'undefined') return { isAuthorized: true };

  const auth = await getAuthState();
  if (!auth || !auth.licenseKey) {
    return { isAuthorized: false, reason: 'لم يتم تفعيل أي اشتراك على هذا الجهاز.' };
  }

  // Session activity pulse in BroadcastChannel
  try {
    const channel = new BroadcastChannel(`edu_session_${auth.licenseKey}`);
    channel.postMessage({ type: 'PING_SESSION', senderToken: auth.activeSessionToken });
  } catch (e) {
    // Fallback if BroadcastChannel not supported
  }

  return { isAuthorized: true };
}
