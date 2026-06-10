import type {Metadata} from 'next';
import { Kantumruy_Pro } from 'next/font/google';
import './globals.css';

const kantumruy = Kantumruy_Pro({
  weight: ['400', '500', '600', '700'],
  subsets: ['khmer', 'latin'],
  variable: '--font-kantumruy',
});

export const metadata: Metadata = {
  title: 'SecureAttend | HR & Payroll System',
  description: 'Multi-tenant employee attendance and HR/payroll system with geofencing, AI face match, QR, and NFC.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="km">
      <body className={`${kantumruy.variable} font-sans antialiased bg-slate-50 text-slate-900 border-slate-200 transition-colors`} suppressHydrationWarning>{children}</body>
    </html>
  );
}
