export async function getDeviceFingerprint(): Promise<string> {
  if (typeof window === 'undefined') return 'server_render_fallback';

  const components: string[] = [];

  // Screen specs
  components.push(`${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}`);
  components.push(navigator.language || '');
  components.push(navigator.hardwareConcurrency ? String(navigator.hardwareConcurrency) : '1');

  // Canvas fingerprinting
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 50;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '16px Tajawal';
      ctx.fillStyle = '#1B3B36';
      ctx.fillRect(10, 10, 100, 30);
      ctx.fillStyle = '#E8A93B';
      ctx.fillText('منصة_الدروس_التفاعلية_2026', 12, 12);
      components.push(canvas.toDataURL().slice(-50));
    }
  } catch (e) {
    components.push('canvas_error');
  }

  // WebGL Renderer fingerprinting
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (gl) {
      const debugInfo = (gl as WebGLRenderingContext).getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        components.push((gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || '');
      }
    }
  } catch (e) {
    components.push('webgl_error');
  }

  const rawString = components.join(':::');
  const encoder = new TextEncoder();
  const data = encoder.encode(rawString);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
