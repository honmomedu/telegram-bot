'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { ArrowLeft, UserCircle2, Loader2 } from 'lucide-react';
import Link from 'next/link';

const ClockInWidget = dynamic(() => import('@/components/ClockInWidget').then(mod => mod.ClockInWidget), { ssr: false });
const FaceRegistrationModal = dynamic(() => import('@/components/FaceRegistrationModal').then(mod => mod.FaceRegistrationModal), { ssr: false });

export default function EmployeePage() {
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const initialOrg = searchParams ? (searchParams.get('org') || 'default') : 'default';

  const [isMounted, setIsMounted] = useState(false);
  const [employeeCode, setEmployeeCode] = useState<string | null>(null);
  const [orgSlug, setOrgSlug] = useState<string>(initialOrg);
  const [inputValue, setInputValue] = useState('');
  const [isFaceModalOpen, setFaceModalOpen] = useState(false);
  const [isActivating, setIsActivating] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const code = localStorage.getItem(`employee_code_${orgSlug}`);
    if (code) {
      setEmployeeCode(code);
      // Auto-link on load if inside TG
      checkTelegramLink(code);
    }
  }, [orgSlug]);
  
  const checkTelegramLink = async (code: string) => {
    try {
      const tg = (window as any).Telegram?.WebApp;
      if (tg?.initDataUnsafe?.user?.id) {
         await fetch('/api/employee/activate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ employeeCode: code, telegramId: tg.initDataUnsafe.user.id, orgSlug })
         });
      }
    } catch(e) {}
  };

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
       setIsActivating(true);
       const code = inputValue.trim();
       let telegramId = null;
       try {
         const tg = (window as any).Telegram?.WebApp;
         if (tg?.initDataUnsafe?.user?.id) {
           telegramId = tg.initDataUnsafe.user.id;
         }
       } catch (e) {}

       try {
         await fetch('/api/employee/activate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ employeeCode: code, telegramId, orgSlug })
         });
         localStorage.setItem(`employee_code_${orgSlug}`, code);
         setEmployeeCode(code);
       } catch (e) {
         console.error('Activation failed');
       } finally {
         setIsActivating(false);
       }
    }
  };

  const handleDeactivate = () => {
    localStorage.removeItem(`employee_code_${orgSlug}`);
    setEmployeeCode(null);
  };

  if (!isMounted) return null;

  if (!employeeCode) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-6">
        <Link href="/" className="absolute top-6 left-6 flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors">
           <ArrowLeft className="w-5 h-5" /> ត្រឡប់ក្រោយ
        </Link>
        <div className="w-full max-w-sm bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col items-center">
          <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-6 border border-indigo-100">
             <UserCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">សកម្មជនបុគ្គលិក</h2>
          <p className="text-slate-500 text-sm text-center mb-8">សូមបញ្ចូលលេខកូដបុគ្គលិករបស់អ្នកដើម្បីធ្វើឲ្យឧបករណ៍នេះសកម្មសម្រាប់ការចុះវត្តមាន។</p>

          <form onSubmit={handleActivate} className="w-full space-y-4">
             <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">លេខកូដបុគ្គលិក (Employee ID)</label>
                <input 
                  type="text" 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="EMP-001"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-medium"
                  required
                />
             </div>
             <button type="submit" disabled={isActivating} className="w-full py-3 bg-[var(--brand-600)] hover:bg-[var(--brand-700)] text-white rounded-xl font-bold transition-colors shadow-md disabled:opacity-70 disabled:cursor-not-allowed">
                {isActivating ? <Loader2 className="w-5 h-5 mx-auto animate-spin" /> : 'ដំណើរការ (Activate)'}
             </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
       <FaceRegistrationModal 
          isOpen={isFaceModalOpen} 
          onClose={() => setFaceModalOpen(false)} 
          userId={employeeCode}
          orgSlug={orgSlug}
       />

       <header className="bg-gradient-to-r from-[var(--brand-700)] to-[var(--brand-500)] shrink-0 shadow-[var(--shadow-soft)] z-10 px-6 lg:px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-white/20 rounded-xl backdrop-blur-md flex items-center justify-center border border-white/30">
                 <UserCircle2 className="w-6 h-6 text-white drop-shadow-md" />
             </div>
             <div>
                <span className="text-xl font-bold tracking-tight text-white drop-shadow-sm block leading-none">Employee Check-In</span>
                <span className="text-white/80 text-xs font-medium">ID: {employeeCode} | Org: {orgSlug}</span>
             </div>
          </div>
          <button onClick={handleDeactivate} className="text-xs font-medium px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors border border-white/20">
             ចាកចេញ (Deactivate)
          </button>
       </header>

       <main className="flex-1 max-w-xl mx-auto w-full p-6 flex flex-col gap-6 pt-10">
          <div className="bg-white rounded-3xl shadow-[var(--shadow-soft)] border border-slate-100 p-6 flex flex-col gap-4 text-center items-center">
             <p className="text-slate-500 font-medium">ចង់ប្រើមុខដើម្បីចុះវត្តមាន?</p>
             <button 
                onClick={() => setFaceModalOpen(true)}
                className="px-6 py-2.5 bg-indigo-50 text-indigo-700 font-bold rounded-xl border border-indigo-100 hover:bg-indigo-100 transition-colors"
              >
               + ចុះឈ្មោះមុខរបស់អ្នក
             </button>
          </div>

          <ClockInWidget employeeCode={employeeCode} orgSlug={orgSlug} />
       </main>
    </div>
  );
}
