import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { Telegraf } from 'telegraf';

const botToken = process.env.TELEGRAM_BOT_TOKEN;
let bot: Telegraf | null = null;
if (botToken) {
  bot = new Telegraf(botToken);
}

export async function GET(request: Request) {
  // Optional: Check auth header to verify it's Vercel cron
  
  if (!bot) {
    return NextResponse.json({ error: 'TELEGRAM_BOT_TOKEN missing' }, { status: 500 });
  }

  const month = new Date().toISOString().slice(0, 7); // Current month
  const year = parseInt(month.split('-')[0]);
  const m = parseInt(month.split('-')[1]);
  const startDate = new Date(year, m - 1, 1).toISOString();
  const endDate = new Date(year, m, 0, 23, 59, 59).toISOString();

  // Paginated fetch of employees
  const employees: any[] = [];
  let eFrom = 0;
  const eStep = 999;
  let eHasMore = true;
  while(eHasMore) {
    const { data, error } = await supabase.from('employees').select('*').range(eFrom, eFrom + eStep);
    if(error || !data || data.length === 0) {
      eHasMore = false;
    } else {
      employees.push(...data);
      eFrom += eStep + 1;
      if (data.length <= eStep) eHasMore = false;
    }
  }

  // Fetch adjustments for month
  const { data: adjData } = await supabase.from('payroll_adjustments').select('*').eq('month', month);

  // Paginate attendance
  let allAttendance: any[] = [];
  let aFrom = 0;
  const aStep = 999;
  let aHasMore = true;

  while (aHasMore) {
     const { data, error } = await supabase
       .from('attendance')
       .select('*')
       .gte('check_in_time', startDate)
       .lte('check_in_time', endDate)
       .range(aFrom, aFrom + aStep);
     
     if (error || !data || data.length === 0) {
       aHasMore = false;
     } else {
       allAttendance.push(...data);
       aFrom += aStep + 1;
       if (data.length <= aStep) aHasMore = false;
     }
  }

  let sentCount = 0;

  for (const emp of employees) {
     if (!emp.telegram_id) continue;

     const empsAtt = allAttendance.filter(a => a.org_slug === emp.org_slug && a.employee_code === emp.employee_code);
     const daysSet = new Set(empsAtt.map(a => new Date(a.check_in_time).toLocaleDateString('en-CA', { timeZone: 'Asia/Phnom_Penh' })));
     const daysPresent = daysSet.size;
     const totalHours = daysPresent * 8; 

     const empAdjs = (adjData || []).filter((a: any) => a.org_slug === emp.org_slug && a.employee_code === emp.employee_code);
     const totalAdditions = empAdjs.filter((a: any) => a.type === 'addition').reduce((sum: number, a: any) => sum + parseFloat(a.amount), 0);
     const totalDeductions = empAdjs.filter((a: any) => a.type === 'deduction').reduce((sum: number, a: any) => sum + parseFloat(a.amount), 0);

     let gross = 0;
     if (emp.salary_type === 'hourly') {
        gross = totalHours * parseFloat(emp.hourly_rate || 0);
     } else {
        gross = parseFloat(emp.base_salary || 0);
        if (daysPresent < 22) {
           gross = (gross / 22) * daysPresent;
        }
     }

     const net = gross + totalAdditions - totalDeductions;

     const message = `
🔔 *កំណត់ត្រាប្រាក់ខែ (Auto Payslip)*
🗓 ខែ (Month): ${month}
👤 បុគ្គលិក (Employee): ${emp.name}

💵 *ប្រាក់ខែគោលម៉ោង (Gross):* $${gross.toFixed(2)}
➕ *ប្រាក់ថែម (Additions):* $${totalAdditions.toFixed(2)}
➖ *ប្រាក់កាត់ (Deductions):* $${totalDeductions.toFixed(2)}

✅ *ប្រាក់ត្រូវបើកសរុប (Net Pay):* $${net.toFixed(2)}
`;
     try {
       await bot.telegram.sendMessage(emp.telegram_id, message, { parse_mode: 'Markdown' });
       sentCount++;
     } catch (e) {
       console.error(`Failed to send to ${emp.telegram_id}`);
     }
  }

  return NextResponse.json({ success: true, sentCount });
}
