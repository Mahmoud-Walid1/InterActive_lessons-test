import type { Metadata } from 'next';
import './globals.css';
import { AntiTamperGuard } from '@/components/security/AntiTamperGuard';
import { SecurityWatermark } from '@/components/security/SecurityWatermark';
import { PwaInstallBanner } from '@/components/pwa/PwaInstallBanner';
import { SwRegister } from '@/components/pwa/SwRegister';

export const metadata: Metadata = {
  title: 'منصة الدروس التفاعلية للأجهزة المحمولة',
  description: 'تطبيق ويب تفاعلي محمول ومحمي بالتشفير للدروس التعليمية الموجهة للمرحلة الابتدائية',
  manifest: '/manifest.json',
};

export const viewport = {
  themeColor: '#1B3B36',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;600;700;800&family=Tajawal:wght@400;500;700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#FBF3DE] text-[#1B3B36] antialiased">
        <SwRegister />
        <AntiTamperGuard />
        <SecurityWatermark />
        {children}
        <PwaInstallBanner />
      </body>
    </html>
  );
}
