const APP_SALT = new TextEncoder().encode('EDU_PLATFORM_SECURE_SALT_2026_PRIMARY_LESSONS');

export async function deriveMasterKey(licenseKey: string, fingerprint: string): Promise<CryptoKey> {
  const combinedSecret = `${licenseKey}:::${fingerprint}`;
  const encoder = new TextEncoder();
  const secretBytes = encoder.encode(combinedSecret);

  const baseKey = await crypto.subtle.importKey(
    'raw',
    secretBytes,
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: APP_SALT,
      iterations: 100000,
      hash: 'SHA-256'
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}
