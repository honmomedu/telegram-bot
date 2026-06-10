'use client';

import React from 'react';
import { Clock, Bell } from 'lucide-react';
import { ClockInWidget } from '@/components/ClockInWidget';

export default function SecureAttendDashboard() {
  const [duckMood, setDuckMood] = React.useState(false);

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
      {/* Sidebar - Sleek Theme */}
      <div className="w-64 h-full bg-gradient-to-b from-indigo-700 to-violet-800 text-white flex-col hidden md:flex">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl backdrop-blur-md flex items-center justify-center border border-white/30">
            <ShieldIcon className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">SecureAttend</span>
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-4">
          <div className="bg-white/15 px-4 py-3 rounded-xl flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-indigo-300"></div>
            <span className="font-medium">ផ្ទាំងគ្រប់គ្រង</span>
          </div>
          <div className="px-4 py-3 rounded-xl flex items-center gap-3 hover:bg-white/5 transition-colors cursor-pointer opacity-80">
            <span className="w-2 h-2 rounded-full border border-white/40"></span>
            <span>វត្តមានបុគ្គលិក</span>
          </div>
          <div className="px-4 py-3 rounded-xl flex items-center gap-3 hover:bg-white/5 transition-colors cursor-pointer opacity-80">
            <span className="w-2 h-2 rounded-full border border-white/40"></span>
            <span>បញ្ជីឈ្មោះបុគ្គលិក</span>
          </div>
          <div className="px-4 py-3 rounded-xl flex items-center gap-3 hover:bg-white/5 transition-colors cursor-pointer opacity-80">
            <span className="w-2 h-2 rounded-full border border-white/40"></span>
            <span>បើកប្រាក់បៀវត្សរ៍</span>
          </div>
          <div className="px-4 py-3 rounded-xl flex items-center gap-3 hover:bg-white/5 transition-colors cursor-pointer opacity-80">
            <span className="w-2 h-2 rounded-full border border-white/40"></span>
            <span>របាយការណ៍</span>
          </div>
        </nav>

        <div className="p-6 border-t border-white/10">
          <div className="bg-white/10 rounded-lg p-3 flex items-center gap-3 hover:bg-white/15 transition-colors cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-indigo-400 border border-white/20 flex items-center justify-center">
              <span className="text-xs font-bold">BR</span>
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold truncate">វិទ្យាល័យ ប៊ុន រ៉ានី</p>
              <p className="text-[10px] opacity-60 uppercase tracking-widest">Admin Portal</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Sleek Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 lg:px-8 shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-slate-700">ទិដ្ឋភាពទូទៅថ្ងៃនេះ</h2>
            <span className="hidden sm:inline-block px-3 py-1 bg-green-50 text-green-600 text-xs font-bold rounded-full border border-green-100">
              ប្រព័ន្ធដំណើរការធម្មតា
            </span>
          </div>
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="relative group">
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></div>
              <div className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <Bell className="w-6 h-6" />
              </div>
            </div>
            <div className="hidden sm:block h-8 w-[1px] bg-slate-200"></div>
            <div className="flex items-center gap-3">
              <p className="text-sm font-medium hidden sm:block">សុខ ចាន់ដារ៉ា</p>
              <div className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center font-bold text-indigo-600 border border-slate-200">SC</div>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
          {/* Dashboard Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
              <p className="text-slate-400 text-sm font-medium mb-1">បុគ្គលិកសរុប</p>
              <div className="flex items-end justify-between">
                <h3 className="text-3xl font-bold text-slate-800">1,240</h3>
                <span className="text-green-500 text-xs font-bold">+4 ថ្មី</span>
              </div>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
              <p className="text-slate-400 text-sm font-medium mb-1">វត្តមានថ្ងៃនេះ</p>
              <div className="flex items-end justify-between">
                <h3 className="text-3xl font-bold text-indigo-600">1,185</h3>
                <span className="text-slate-400 text-xs text-right">95.5% នៃសរុប</span>
              </div>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
              <p className="text-slate-400 text-sm font-medium mb-1">មកយឺត</p>
              <div className="flex items-end justify-between">
                <h3 className="text-3xl font-bold text-orange-500">42</h3>
                <span className="text-orange-500/80 text-xs font-bold">-12% ធៀបខែមុn</span>
              </div>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 border-l-4 border-l-red-500">
              <p className="text-slate-400 text-sm font-medium mb-1">អវត្តមាន</p>
              <div className="flex items-end justify-between">
                <h3 className="text-3xl font-bold text-red-600">13</h3>
                <span className="text-slate-400 text-xs">គ្មានច្បាប់</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start flex-1 min-h-0">
            <div className="lg:col-span-8 flex flex-col gap-6 w-full">
              {/* Reuse our ClockInWidget but it fits perfectly into the sleek theme container */}
              <ClockInWidget />
              
              {/* Footer System Status Bar Extracted from Sleek Theme */}
              <div className="h-12 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-between px-6 shrink-0 w-full">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-[11px] font-bold text-indigo-900 uppercase tracking-wide">Telegram Bot ភ្ជាប់រួចរាល់ - សារកំពុងដំណើរការ</span>
                </div>
                <div className="hidden sm:flex items-center gap-4">
                  <span className="text-[11px] text-indigo-400 font-medium italic">Supabase: Connected</span>
                  <span className="text-[11px] text-indigo-400 font-medium italic">Version 1.0.4-prod</span>
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-4 flex flex-col gap-6 w-full">
              {/* Sleek Theme Controls panel */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col w-full">
                <div className="p-5 border-b border-slate-100">
                  <h3 className="font-bold text-slate-700">ការគ្រប់គ្រងប្រព័ន្ធ</h3>
                </div>
                <div className="p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-slate-800">AI Face Tracking</p>
                      <p className="text-xs text-slate-400">ដំណើរការដោយ AI Accuracy 99.8%</p>
                    </div>
                    <div className="w-10 h-5 bg-indigo-600 rounded-full relative cursor-pointer shadow-sm">
                      <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full transition-all"></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-slate-800">GPS Geofencing</p>
                      <p className="text-xs text-slate-400">Radius: 100 ម៉ែត្រជុំវិញស្ថាប័ន</p>
                    </div>
                    <div className="w-10 h-5 bg-indigo-600 rounded-full relative cursor-pointer shadow-sm">
                      <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full transition-all"></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-100 pt-6 mt-2">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-slate-800 flex items-center gap-2">Duck Mood 🦆</p>
                      <p className="text-xs text-slate-400">បើកមុខងារទាហ្វូង</p>
                    </div>
                    <div 
                      onClick={() => setDuckMood(!duckMood)}
                      className={`w-10 h-5 rounded-full relative cursor-pointer shadow-sm transition-colors ${duckMood ? 'bg-yellow-400' : 'bg-slate-200'}`}
                    >
                      <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${duckMood ? 'right-1' : 'left-1'}`}></div>
                    </div>
                  </div>
                  <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">QR វត្តមានបច្ចុប្បន្ន</p>
                    <div className="w-full aspect-square max-h-[200px] bg-white border border-slate-200 rounded flex items-center justify-center relative overflow-hidden">
                       <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=SecureAttendCheckIn" alt="QR Code" className="w-32 h-32 object-contain" />
                       <div className="absolute inset-0 border-4 border-white opacity-20 pointer-events-none"></div>
                    </div>
                    <p className="text-[10px] text-center text-slate-400 mt-2 italic flex items-center justify-center gap-1">
                      <Clock className="w-3 h-3" /> កូដនឹងប្តូររៀងរាល់ ៦០វិនាទី
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function StatCard() {
  return null; // the sleek theme replaced this component pattern with inline cards in the layout structure. It's safe to just return null or remove usage.
}

function ShieldIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2-1 4-2 7-2 2.5 0 4.5 1 6.5 2a1 1 0 0 1 1 1z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}
