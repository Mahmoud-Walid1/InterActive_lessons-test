'use client';

import { useEffect } from 'react';

export function SwRegister() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => console.log('Service Worker Registered:', reg.scope))
        .catch((err) => console.error('Service Worker Registration Failed:', err));
    }
  }, []);

  return null;
}
