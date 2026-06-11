'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Nfc, CheckCircle, XCircle } from 'lucide-react';

export default function KioskPage() {
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const orgSlug = searchParams ? (searchParams.get('org') || 'default') : 'default';

  const [inputVal, setInputVal] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [employeeDetails, setEmployeeDetails] = useState<{name: string, action: string, time: string} | null>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);

  // Keep input focused
  useEffect(() => {
    const focusInput = () => {
      if (status === 'idle') {
        inputRef.current?.focus();
      }
    };
    focusInput();
    window.addEventListener('click', focusInput);
    return () => window.removeEventListener('click', focusInput);
  }, [status]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    setStatus('loading');
    const cardId = inputVal.trim();
    setInputVal('');

    try {
      const res = await fetch('/api/attendance/kiosk', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ cardId, orgSlug })
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
         setStatus('success');
         setEmployeeDetails({
            name: data.name,
            action: data.action === 'in' ? 'CHECKED IN' : 'CHECKED OUT',
            time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
         });
      } else {
         setStatus('error');
         setMessage(data.error || 'Failed to process card');
      }
    } catch(err) {
      setStatus('error');
      setMessage('Network error');
    }

    // Reset after 3 seconds
    setTimeout(() => {
      setStatus('idle');
      setMessage('');
      setEmployeeDetails(null);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-white text-center">
       {/* Hidden input field for the NFC/RFID USB reader */}
       <form onSubmit={handleSubmit} className="absolute opacity-0 pointer-events-none">
          <input 
            ref={inputRef}
            type="text" 
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            autoFocus
          />
       </form>

       <div className="w-full max-w-2xl bg-slate-800 rounded-3xl p-12 shadow-2xl relative overflow-hidden">
          {status === 'idle' && (
            <div className="flex flex-col items-center space-y-8 animate-in fade-in zoom-in duration-300">
               <div className="w-40 h-40 bg-indigo-500/10 rounded-full flex items-center justify-center relative">
                  <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full animate-ping" style={{ animationDuration: '3s' }}></div>
                  <Nfc className="w-20 h-20 text-indigo-400" />
               </div>
               <div>
                 <h1 className="text-4xl font-bold tracking-tight mb-2">Please Sweep Your Card</h1>
                 <p className="text-xl text-slate-400 font-medium">ចាក់កាតរបស់អ្នក</p>
               </div>
            </div>
          )}

          {status === 'loading' && (
            <div className="flex flex-col items-center space-y-6">
               <div className="w-24 h-24 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
               <h2 className="text-2xl font-medium text-slate-300">Processing...</h2>
            </div>
          )}

          {status === 'success' && employeeDetails && (
            <div className="flex flex-col items-center space-y-6 animate-in slide-in-from-bottom-8 fade-in duration-500">
               <div className="w-32 h-32 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center">
                 <CheckCircle className="w-16 h-16" />
               </div>
               <div className="space-y-2">
                  <h2 className="text-emerald-400 font-bold tracking-widest uppercase text-xl">{employeeDetails.action}</h2>
                  <div className="text-5xl font-black text-white">{employeeDetails.name}</div>
                  <div className="text-2xl text-slate-300 font-medium font-mono pt-4">{employeeDetails.time}</div>
               </div>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center space-y-6 animate-in shake duration-300">
               <div className="w-24 h-24 bg-rose-500/20 text-rose-400 rounded-full flex items-center justify-center">
                 <XCircle className="w-12 h-12" />
               </div>
               <h2 className="text-3xl font-bold text-white">{message}</h2>
               <p className="text-rose-400">សូមព្យាយាមម្តងទៀត / Please try again</p>
            </div>
          )}
       </div>
       
       <div className="fixed bottom-6 right-6 opacity-30 text-xs font-mono select-none">
          Kiosk Mode • Org: {orgSlug}
       </div>
    </div>
  );
}
