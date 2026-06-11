'use client';

import React, { useState, useEffect } from 'react';
import { Clock, RefreshCw, Download } from 'lucide-react';
import QRCode from 'qrcode';

export function OfficeQRCodeWidget({ orgSlug = 'default' }: { orgSlug?: string }) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [secret, setSecret] = useState<string>('');

  const generateNewQR = async () => {
    // Random secret token for the QR
    const newSecret = "OFFICE_QR_" + Math.random().toString(36).substring(2, 12).toUpperCase();
    setSecret(newSecret);
    
    // Store in localStorage or send to backend to allow validation (ideally back-end saves it per org)
    localStorage.setItem(`current_office_qr_secret_${orgSlug}`, newSecret);

    try {
      // payload data
      const payload = JSON.stringify({ type: 'CHECK_IN_OFFICE', secret: newSecret, orgSlug, timestamp: Date.now() });
      const url = await QRCode.toDataURL(payload, { 
        width: 300,
        margin: 1,
        color: {
          dark: '#0f172a', // Slate 900
          light: '#ffffff'
        }
      });
      setQrCodeDataUrl(url);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    generateNewQR();
    // Regenerate every 60 seconds
    const interval = setInterval(generateNewQR, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleDownload = () => {
    if (!qrCodeDataUrl) return;
    const link = document.createElement('a');
    link.download = `office-qr-${new Date().toISOString().split('T')[0]}.png`;
    link.href = qrCodeDataUrl;
    link.click();
  };

  return (
    <div className="mt-8 p-5 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">QR វត្តមានបច្ចុប្បន្ន</p>
          <Clock className="w-4 h-4 text-slate-400" />
        </div>
        <div className="flex items-center gap-1">
          <button onClick={handleDownload} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors" title="ទាញយក">
            <Download className="w-4 h-4" />
          </button>
          <button onClick={generateNewQR} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors" title="បង្កើតថ្មី">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="w-full aspect-square max-h-[220px] bg-white border border-slate-200 rounded-xl flex items-center justify-center relative overflow-hidden shadow-sm mx-auto">
        {qrCodeDataUrl ? (
          <img src={qrCodeDataUrl} alt="QR Code" className="w-40 h-40 object-contain" />
        ) : (
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        )}
        <div className="absolute inset-0 border-[6px] border-white/40 pointer-events-none rounded-xl"></div>
      </div>
      <p className="text-[11px] text-center text-slate-500 mt-4 font-medium flex items-center justify-center gap-1.5">
        <div className="w-2 h-2 rounded-full bg-[var(--brand-500)] animate-pulse"></div> កូដនឹងប្តូររៀងរាល់ ៦០វិនាទី
      </p>
      <p className="text-[9px] text-center text-slate-300 mt-1 uppercase font-mono">{secret}</p>
    </div>
  );
}
