import type {Metadata} from 'next';
import { Kantumruy_Pro } from 'next/font/google';
import Script from 'next/script';
import './globals.css';

const kantumruyPro = Kantumruy_Pro({
  subsets: ['khmer', 'latin'],
  variable: '--font-kantumruy-pro',
});

export const metadata: Metadata = {
  title: 'សាលារៀន.org',
  description: 'ប្រព័ន្ធគ្រប់គ្រងសាលារៀន និងវត្តមាន / School Management & Attendance',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="km">
      <head>
        <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
      </head>
      <body className={`${kantumruyPro.variable} font-sans antialiased bg-slate-50 text-slate-900 border-slate-200 transition-colors`} suppressHydrationWarning>{children}</body>
    </html>
  );
}

