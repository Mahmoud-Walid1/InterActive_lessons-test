export async function encryptPayload(key: CryptoKey, rawText: string): Promise<Blob> {
  const encoder = new TextEncoder();
  const dataBytes = encoder.encode(rawText);
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    dataBytes
  );

  const combined = new Uint8Array(iv.byteLength + encryptedBuffer.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(encryptedBuffer), iv.byteLength);

  return new Blob([combined.buffer], { type: 'application/octet-stream' });
}

export async function decryptPayload(key: CryptoKey, encryptedBlob: Blob): Promise<string> {
  const arrayBuffer = await encryptedBlob.arrayBuffer();
  const fullBytes = new Uint8Array(arrayBuffer);

  const iv = fullBytes.slice(0, 12);
  const dataBytes = fullBytes.slice(12);

  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    dataBytes
  );

  const decoder = new TextDecoder();
  return decoder.decode(decryptedBuffer);
}
