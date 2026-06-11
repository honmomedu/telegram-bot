'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { FileText, Download, Loader2 } from 'lucide-react';

export function ReportsTab({ employees, orgSlug }: { employees: any[], orgSlug: string }) {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [reportData, setReportData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReport();
  }, [month, employees]);

  const fetchReport = async () => {
    if (employees.length === 0) return;
    setLoading(true);

    const year = parseInt(month.split('-')[0]);
    const m = parseInt(month.split('-')[1]);
    const startDate = new Date(year, m - 1, 1).toISOString();
    const endDate = new Date(year, m, 0, 23, 59, 59).toISOString();

    // Fetch attendance within month, paginate if needed, but for simplicity assuming we get them all
    // using range for larger datasets
    let allAttendance: any[] = [];
    let from = 0;
    const step = 999;
    let hasMore = true;

    while (hasMore) {
       const { data, error } = await supabase
         .from('attendance')
         .select('*')
         .eq('org_slug', orgSlug)
         .gte('check_in_time', startDate)
         .lte('check_in_time', endDate)
         .range(from, from + step);
       
       if (error || !data || data.length === 0) {
         hasMore = false;
       } else {
         allAttendance.push(...data);
         from += step + 1;
         if (data.length <= step) hasMore = false;
       }
    }

    // Process data by employee
    const processed = employees.map(emp => {
      const empsAtt = allAttendance.filter(a => a.employee_code === emp.employee_code);
      // Group by day to calculate days present
      const daysSet = new Set(empsAtt.map(a => new Date(a.check_in_time).toLocaleDateString('en-CA', { timeZone: 'Asia/Phnom_Penh' })));
      
      // Calculate lates (if check in after 8:00 AM)
      let lateCount = 0;
      let totalHours = 0;

      daysSet.forEach(dateStr => {
        const dayAtt = empsAtt.filter(a => new Date(a.check_in_time).toLocaleDateString('en-CA', { timeZone: 'Asia/Phnom_Penh' }) === dateStr);
        // Sort by time
        dayAtt.sort((a,b) => new Date(a.check_in_time).getTime() - new Date(b.check_in_time).getTime());
        const firstIn = new Date(dayAtt[0].check_in_time);
        
        // 8 AM restriction
        const eightAM = new Date(firstIn);
        eightAM.setHours(8, 0, 0, 0);
        
        if (firstIn.getTime() > eightAM.getTime()) {
           lateCount++;
        }

        // Just an approximation: 8 hours per day present if checkout isn't strictly tracked
        // Real app would calculate diff(out, in)
        totalHours += 8;
      });

      return {
        ...emp,
        daysPresent: daysSet.size,
        lateCount,
        totalHours
      };
    });

    setReportData(processed);
    setLoading(false);
  };

  const exportCSV = () => {
    if (reportData.length === 0) return;
    const headers = ['Employee Code', 'Name', 'Days Present', 'Late Count', 'Total Hours'];
    const csvContent = "data:text/csv;charset=utf-8," + 
      headers.join(",") + "\n" + 
      reportData.map(r => `${r.employee_code},"${r.name}",${r.daysPresent},${r.lateCount},${r.totalHours}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `attendance_report_${month}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
       <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
         <div className="flex items-center gap-4">
            <h3 className="font-bold text-lg text-slate-800">របាយការណ៍ (Monthly Report)</h3>
            <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500" />
         </div>
         <button onClick={exportCSV} className="px-4 py-2 bg-slate-900 text-white rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-slate-800">
           <Download className="w-4 h-4" /> ទាញយកជា CSV
         </button>
       </div>

       <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
         <table className="w-full text-left">
           <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
             <tr>
               <th className="px-6 py-4 font-bold">Code</th>
               <th className="px-6 py-4 font-bold">Name</th>
               <th className="px-6 py-4 font-bold text-center">Days Present</th>
               <th className="px-6 py-4 font-bold text-center">Late Days</th>
               <th className="px-6 py-4 font-bold text-center">Total Hours</th>
             </tr>
           </thead>
           <tbody className="divide-y divide-slate-100">
             {loading ? (
               <tr><td colSpan={5} className="p-8 text-center text-slate-500"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></td></tr>
             ) : reportData.map((row) => (
               <tr key={row.id} className="hover:bg-slate-50">
                 <td className="px-6 py-4 font-medium text-slate-800">{row.employee_code}</td>
                 <td className="px-6 py-4 text-slate-600">{row.name}</td>
                 <td className="px-6 py-4 text-center font-bold text-indigo-600">{row.daysPresent}</td>
                 <td className="px-6 py-4 text-center text-amber-500">{row.lateCount}</td>
                 <td className="px-6 py-4 text-center text-slate-600">{row.totalHours}</td>
               </tr>
             ))}
             {!loading && reportData.length === 0 && (
                <tr><td colSpan={5} className="p-8 text-center text-slate-500">គ្មានទិន្នន័យសម្រាប់ខែនេះ</td></tr>
             )}
           </tbody>
         </table>
       </div>
    </div>
  );
}
