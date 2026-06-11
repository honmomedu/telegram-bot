'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { CreditCard, Send, Plus, Loader2 } from 'lucide-react';

export function PayrollTab({ employees, orgSlug }: { employees: any[], orgSlug: string }) {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [payrollData, setPayrollData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [adjustments, setAdjustments] = useState<any[]>([]);

  useEffect(() => {
    fetchPayroll();
  }, [month, employees]);

  const fetchPayroll = async () => {
    if (employees.length === 0) return;
    setLoading(true);

    // Fetch adjustments
    const { data: adjData } = await supabase
      .from('payroll_adjustments')
      .select('*')
      .eq('org_slug', orgSlug)
      .eq('month', month);
    
    setAdjustments(adjData || []);

    const year = parseInt(month.split('-')[0]);
    const m = parseInt(month.split('-')[1]);
    const startDate = new Date(year, m - 1, 1).toISOString();
    const endDate = new Date(year, m, 0, 23, 59, 59).toISOString();

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

    const processed = employees.map(emp => {
      const empsAtt = allAttendance.filter(a => a.employee_code === emp.employee_code);
      const daysSet = new Set(empsAtt.map(a => new Date(a.check_in_time).toLocaleDateString('en-CA', { timeZone: 'Asia/Phnom_Penh' })));
      const daysPresent = daysSet.size;
      const totalHours = daysPresent * 8; // Simplified

      const empAdjs = (adjData || []).filter((a: any) => a.employee_code === emp.employee_code);
      const totalAdditions = empAdjs.filter((a: any) => a.type === 'addition').reduce((sum: number, a: any) => sum + parseFloat(a.amount), 0);
      const totalDeductions = empAdjs.filter((a: any) => a.type === 'deduction').reduce((sum: number, a: any) => sum + parseFloat(a.amount), 0);

      let gross = 0;
      if (emp.salary_type === 'hourly') {
         gross = totalHours * parseFloat(emp.hourly_rate || 0);
      } else {
         gross = parseFloat(emp.base_salary || 0);
         // Simplified absent deduction for fixed salary (assuming 22 working days)
         if (daysPresent < 22) {
            gross = (gross / 22) * daysPresent;
         }
      }

      const net = gross + totalAdditions - totalDeductions;

      return {
        ...emp,
        daysPresent,
        totalHours,
        gross,
        totalAdditions,
        totalDeductions,
        net
      };
    });

    setPayrollData(processed);
    setLoading(false);
  };

  const updateSalarySettings = async (empId: string, updates: any) => {
    await supabase.from('employees').update(updates).eq('id', empId);
    alert('រក្សាទុករួចរាល់');
    // update local state slightly or refresh
  };

  const addAdjustment = async (empId: string, empCode: string, type: 'addition'|'deduction') => {
    const amtStr = prompt(`Enter ${type} amount ($):`);
    if (!amtStr) return;
    const amount = parseFloat(amtStr);
    if (isNaN(amount) || amount <= 0) return;
    
    const desc = prompt("Enter description:");
    
    await supabase.from('payroll_adjustments').insert({
       org_slug: orgSlug,
       employee_code: empCode,
       month,
       amount,
       type,
       description: desc || ''
    });
    
    fetchPayroll();
  };

  const sendPayslip = async (data: any) => {
    if (!data.telegram_id) {
      alert('បុគ្គលិកនេះមិនទាន់បានភ្ជាប់ Telegram ទេ។');
      return;
    }
    
    // Call the bot notification API to send payslip
    // Create a new API route or pass to existing telegram bot api
    try {
      const res = await fetch('/api/payslip/send', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
            telegramId: data.telegram_id,
            name: data.name,
            month,
            gross: data.gross,
            additions: data.totalAdditions,
            deductions: data.totalDeductions,
            net: data.net
         })
      });
      if (res.ok) {
        alert('បញ្ជូនរួចរាល់ (Sent)!');
      } else {
        alert('បញ្ជូនបរាជ័យ (Failed)');
      }
    } catch(e) {
      alert('Error sending payslip');
    }
  };

  return (
    <div className="space-y-6">
       <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
         <div className="flex items-center gap-4">
            <h3 className="font-bold text-lg text-slate-800">បើកប្រាក់ខែ (Payroll processing)</h3>
            <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500" />
         </div>
         <div className="text-sm text-slate-500">គណនា: ផ្អែកលើទិន្នន័យជាក់ស្តែង (Auto-calculated based on attendance)</div>
       </div>

       <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
         <table className="w-full text-left">
           <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
             <tr>
               <th className="px-6 py-4 font-bold">Employee</th>
               <th className="px-6 py-4 font-bold">Type</th>
               <th className="px-6 py-4 font-bold">Base / Rate</th>
               <th className="px-6 py-4 font-bold text-right">Gross</th>
               <th className="px-6 py-4 font-bold text-right">Net</th>
               <th className="px-6 py-4 font-bold text-center">Action</th>
             </tr>
           </thead>
           <tbody className="divide-y divide-slate-100">
             {loading ? (
               <tr><td colSpan={6} className="p-8 text-center text-slate-500"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></td></tr>
             ) : payrollData.map((row) => (
               <tr key={row.id} className="hover:bg-slate-50">
                 <td className="px-6 py-4">
                    <div className="font-medium text-slate-800">{row.name}</div>
                    <div className="text-xs text-slate-500">{row.employee_code} • {row.daysPresent} days</div>
                 </td>
                 <td className="px-6 py-4">
                    <select 
                      value={row.salary_type || 'fixed'} 
                      onChange={(e) => updateSalarySettings(row.id, { salary_type: e.target.value })}
                      className="px-2 py-1 text-sm bg-slate-100 rounded border-none focus:ring-0"
                    >
                      <option value="fixed">Fixed</option>
                      <option value="hourly">Hourly</option>
                    </select>
                 </td>
                 <td className="px-6 py-4">
                    <input 
                      type="number" 
                      defaultValue={row.salary_type === 'hourly' ? row.hourly_rate : row.base_salary}
                      onBlur={(e) => {
                         if (row.salary_type === 'hourly') {
                           updateSalarySettings(row.id, { hourly_rate: parseFloat(e.target.value) });
                         } else {
                           updateSalarySettings(row.id, { base_salary: parseFloat(e.target.value) });
                         }
                      }}
                      className="w-20 px-2 py-1 text-sm bg-slate-50 border border-slate-200 rounded"
                    />
                 </td>
                 <td className="px-6 py-4 text-right text-slate-600">${row.gross.toFixed(2)}</td>
                 <td className="px-6 py-4 text-right font-bold text-indigo-600">${row.net.toFixed(2)}</td>
                 <td className="px-6 py-4 text-center flex items-center justify-center gap-2">
                    <button onClick={() => addAdjustment(row.id, row.employee_code, 'addition')} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg text-xs font-bold" title="Add Bonus">+ ថែម</button>
                    <button onClick={() => addAdjustment(row.id, row.employee_code, 'deduction')} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-bold" title="Deduct">- កាត់</button>
                    <button onClick={() => sendPayslip(row)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg inline-flex items-center gap-1" title="Send Payslip to Telegram">
                       <Send className="w-4 h-4" />
                    </button>
                 </td>
               </tr>
             ))}
             {!loading && payrollData.length === 0 && (
                <tr><td colSpan={6} className="p-8 text-center text-slate-500">គ្មានទិន្នន័យ</td></tr>
             )}
           </tbody>
         </table>
       </div>
    </div>
  );
}
