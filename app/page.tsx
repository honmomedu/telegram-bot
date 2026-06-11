'use client';

import React, { useState, useEffect } from 'react';
import { Clock, Bell } from 'lucide-react';
import dynamic from 'next/dynamic';
import { AttendanceChart } from '@/components/AttendanceChart';

import { OfficeQRCodeWidget } from '@/components/OfficeQRCodeWidget';
import Link from 'next/link';

const FaceRegistrationModal = dynamic(() => import('@/components/FaceRegistrationModal').then(mod => mod.FaceRegistrationModal), { ssr: false });

function RealTimeClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-xl backdrop-blur-md border border-white/20">
      <Clock className="w-5 h-5 text-white/90" />
      <span className="text-white font-medium tracking-wide">
        {time.toLocaleTimeString('km-KH', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
      </span>
      <span className="text-white/60 text-sm ml-2 hidden sm:block">
        {time.toLocaleDateString('km-KH', { weekday: 'short', month: 'short', day: 'numeric' })}
      </span>
    </div>
  );
}

export default function SecureAttendDashboard() {
  const [duckMood, setDuckMood] = useState(false);
  const [isFaceModalOpen, setFaceModalOpen] = useState(false);

  return (
    <div className={`h-screen bg-slate-50 flex overflow-hidden font-sans select-none text-slate-800 relative ${duckMood ? 'bg-yellow-50' : ''}`}>
      {duckMood && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden flex items-center justify-center">
          {[...Array(15)].map((_, i) => (
            <div 
              key={i}
              className="absolute text-5xl animate-bounce opacity-40"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDuration: `${Math.random() * 2 + 1}s`,
                animationDelay: `${Math.random() * 2}s`
              }}
            >
              🦆
            </div>
          ))}
        </div>
      )}
      
      <FaceRegistrationModal 
        isOpen={isFaceModalOpen} 
        onClose={() => setFaceModalOpen(false)} 
        // Dummy ID for local testing. In reality this comes from logged-in user session
        userId="user-1234-5678" 
      />

      {/* Main Content Area (Full Width since we are putting logo in the header) */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-gradient-to-r from-[var(--brand-700)] to-[var(--brand-500)] shrink-0 shadow-[var(--shadow-soft)] z-10">
          <div className="flex items-center justify-between px-6 lg:px-8 h-20 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl backdrop-blur-md flex items-center justify-center border border-white/30">
                 <div className="w-5 h-5 bg-white rounded-sm drop-shadow-md"></div>
              </div>
              <span className="text-xl font-bold tracking-tight text-white drop-shadow-sm">SecureAttend</span>
            </div>

            <RealTimeClock />

            <div className="flex items-center gap-4 sm:gap-6">
              <div className="relative group">
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[var(--brand-600)]"></div>
                <div className="text-white/80 hover:text-white cursor-pointer transition-colors p-2 bg-white/5 rounded-full hover:bg-white/10">
                  <Bell className="w-5 h-5" />
                </div>
              </div>
              <div className="hidden sm:block h-8 w-[1px] bg-white/20"></div>
              <div className="flex items-center gap-3 bg-white/10 pl-3 pr-1.5 py-1.5 rounded-full border border-white/20 cursor-pointer hover:bg-white/20 transition-colors">
                <p className="text-sm font-medium text-white hidden sm:block drop-shadow-sm">សុខ ចាន់ដារ៉ា</p>
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center font-bold text-[var(--brand-600)] shadow-inner text-sm">SC</div>
              </div>
            </div>
          </div>
          
          <div className="px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight drop-shadow-md">អរុណសួស្តី, ចាន់ដារ៉ា! 👋</h1>
              <p className="text-white/80 mt-1 font-medium">នេះជារបាយការណ៍សង្ខេបសម្រាប់ថ្ងៃនេះ។</p>
            </div>
            <span className="px-4 py-1.5 bg-emerald-500/20 text-emerald-100 text-xs font-bold rounded-full border border-emerald-500/30 backdrop-blur-md">
              ប្រព័ន្ធដំណើរការធម្មតា
            </span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8 -mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
            <div className="bg-[var(--surface-main)] p-6 rounded-2xl shadow-[var(--shadow-soft)] border border-slate-100">
              <p className="text-slate-500 text-sm font-medium mb-2">បុគ្គលិកសរុប</p>
              <div className="flex items-end justify-between">
                <h3 className="text-3xl font-bold text-slate-800">1,240</h3>
                <span className="text-emerald-500 text-xs font-bold bg-emerald-50 px-2 py-1 rounded-md">+4 ថ្មី</span>
              </div>
            </div>
            <div className="bg-[var(--surface-main)] p-6 rounded-2xl shadow-[var(--shadow-soft)] border border-slate-100">
              <p className="text-slate-500 text-sm font-medium mb-2">វត្តមានថ្ងៃនេះ</p>
              <div className="flex items-end justify-between">
                <h3 className="text-3xl font-bold text-[var(--brand-600)]">1,185</h3>
                <span className="text-slate-400 text-xs font-medium">95.5% នៃសរុប</span>
              </div>
            </div>
            <div className="bg-[var(--surface-main)] p-6 rounded-2xl shadow-[var(--shadow-soft)] border border-slate-100">
              <p className="text-slate-500 text-sm font-medium mb-2">មកយឺត</p>
              <div className="flex items-end justify-between">
                <h3 className="text-3xl font-bold text-orange-500">42</h3>
                <span className="text-orange-600 text-xs font-bold bg-orange-50 px-2 py-1 rounded-md">-12% ធៀបខែមុន</span>
              </div>
            </div>
            <div className="bg-[var(--surface-main)] p-6 rounded-2xl shadow-[var(--shadow-soft)] border border-slate-100 border-l-4 border-l-red-500">
              <p className="text-slate-500 text-sm font-medium mb-2">អវត្តមាន</p>
              <div className="flex items-end justify-between">
                <h3 className="text-3xl font-bold text-red-600">13</h3>
                <span className="text-slate-400 text-xs font-medium">គ្មានច្បាប់</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start min-h-0">
            <div className="lg:col-span-8 flex flex-col gap-8 w-full">
              <div className="bg-indigo-600 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6">
                 <div className="relative z-10">
                    <h3 className="text-2xl font-bold mb-2 tracking-tight">បុគ្គលិកចុះវត្តមានទីនេះ</h3>
                    <p className="text-indigo-200 text-sm max-w-sm leading-relaxed">ចូលទៅកាន់ទំព័រចុះវត្តមានសម្រាប់បុគ្គលិក (មុខ, QR, ទីតាំង) នៅលើតំណភ្ជាប់ខាងក្រោម។</p>
                 </div>
                 <div className="relative z-10 flex gap-3">
                    <Link href="/employee" className="px-6 py-3 bg-white text-indigo-700 font-bold rounded-xl shadow-md hover:bg-indigo-50 transition-colors whitespace-nowrap">
                      មុខងារបុគ្គលិក →
                    </Link>
                    <Link href="/admin" className="px-6 py-3 bg-indigo-500/50 text-white font-bold rounded-xl hover:bg-indigo-500 transition-colors whitespace-nowrap border border-indigo-400">
                      គ្រប់គ្រងប្រព័ន្ធ (Admin)
                    </Link>
                 </div>
                 <div className="absolute right-0 bottom-0 opacity-10 w-64 h-64 bg-white rounded-full blur-3xl transform translate-x-1/3 translate-y-1/3"></div>
              </div>
              <AttendanceChart />
              
              <div className="h-14 bg-indigo-50/50 border border-[var(--brand-100)] rounded-2xl flex items-center justify-between px-6 w-full shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </span>
                  <span className="text-xs font-bold text-[var(--brand-700)] uppercase tracking-wide">Telegram Bot ភ្ជាប់រួចរាល់ - សារកំពុងដំណើរការ</span>
                </div>
                <div className="hidden sm:flex items-center gap-6">
                  <span className="text-xs text-[var(--brand-600)] font-medium">Supabase: Connected</span>
                  <span className="text-xs text-slate-400 font-medium">Version 1.0.4-prod</span>
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-4 flex flex-col gap-8 w-full">
              <div className="bg-[var(--surface-main)] rounded-3xl shadow-[var(--shadow-soft)] border border-slate-100 flex flex-col w-full overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                  <h3 className="font-bold text-slate-800 text-lg">ការគ្រប់គ្រងប្រព័ន្ធ</h3>
                  <p className="text-xs text-slate-500 mt-1">System Controls & Settings</p>
                </div>
                <div className="p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-slate-800">AI Face Tracking</p>
                      <p className="text-xs text-slate-500">ដំណើរការដោយ AI Accuracy 99.8%</p>
                    </div>
                    <button 
                       onClick={() => setFaceModalOpen(true)}
                       className="text-xs px-4 py-2 bg-[var(--brand-50)] text-[var(--brand-600)] rounded-lg font-bold border border-[var(--brand-100)] hover:bg-[var(--brand-100)] transition-colors shadow-sm"
                    >
                      ចុះឈ្មោះមុខ
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between border-t border-slate-100 pt-6 mt-2">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-slate-800 flex items-center gap-2">Duck Mood 🦆</p>
                      <p className="text-xs text-slate-500">បើកមុខងារទាហ្វូងលេងៗ</p>
                    </div>
                    <div 
                      onClick={() => setDuckMood(!duckMood)}
                      className={`w-12 h-6 rounded-full relative cursor-pointer shadow-inner transition-colors ${duckMood ? 'bg-yellow-400' : 'bg-slate-200'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${duckMood ? 'right-1' : 'left-1'}`}></div>
                    </div>
                  </div>
                  
                  <OfficeQRCodeWidget />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
