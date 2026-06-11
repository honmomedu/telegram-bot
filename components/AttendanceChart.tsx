'use client';

import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { date: '01/06', present: 1100, late: 50 },
  { date: '02/06', present: 1120, late: 45 },
  { date: '03/06', present: 1150, late: 40 },
  { date: '04/06', present: 1140, late: 60 },
  { date: '05/06', present: 1160, late: 35 },
  { date: '08/06', present: 1130, late: 55 },
  { date: '09/06', present: 1180, late: 20 },
];

export function AttendanceChart() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 w-full mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-slate-700">របាយការណ៍វត្តមានប្រចាំសប្តាហ៍ (Weekly Trends)</h3>
          <p className="text-xs text-slate-400">ទិន្នន័យ៣០ថ្ងៃចុងក្រោយ / Last 30 days trends</p>
        </div>
        <select className="text-sm border border-slate-200 rounded-lg px-2 py-1 bg-slate-50 text-slate-600 outline-none cursor-pointer">
          <option>៣០ ថ្ងៃចុងក្រោយ (30 Days)</option>
          <option>៧ ថ្ងៃចុងក្រោយ (7 Days)</option>
        </select>
      </div>
      <div className="h-64 w-full" suppressHydrationWarning>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorLate" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dx={-10} />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Area type="monotone" dataKey="present" name="មកទៀងទាត់ (On Time)" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorPresent)" />
            <Area type="monotone" dataKey="late" name="មកយឺត (Late)" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorLate)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
