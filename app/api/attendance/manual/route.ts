import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { notifyCheckIn } from '@/lib/telegram';

export async function POST(req: NextRequest) {
  try {
    const { employeeCode, orgSlug = 'default', action } = await req.json();

    if (!employeeCode || !action) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    const { data: employee, error: empError } = await supabase
       .from('employees')
       .select('*')
       .eq('org_slug', orgSlug)
       .eq('employee_code', employeeCode)
       .single();

    if (empError || !employee) {
       return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    if (action === 'in') {
      const { error: attError } = await supabase.from('attendance').insert({
         org_slug: orgSlug,
         employee_code: employeeCode,
         check_in_method: 'manual',
         status: 'present'
      });
      
      if (attError) {
         return NextResponse.json({ error: "Database error" }, { status: 500 });
      }
      
      await notifyCheckIn(employee, 'Manual Proxy (IN)');
    } else if (action === 'out') {
      // Find latest check in today without checkout
      const todayStart = new Date();
      todayStart.setHours(0,0,0,0);
      
      const { data: lastAttendance } = await supabase
         .from('attendance')
         .select('id, check_out_time')
         .eq('org_slug', orgSlug)
         .eq('employee_code', employeeCode)
         .gte('check_in_time', todayStart.toISOString())
         .order('check_in_time', { ascending: false })
         .limit(1)
         .single();
         
      if (lastAttendance && !lastAttendance.check_out_time) {
         const { error: attError } = await supabase
            .from('attendance')
            .update({ check_out_time: new Date().toISOString() })
            .eq('id', lastAttendance.id);
            
         if (attError) {
            return NextResponse.json({ error: "Database error" }, { status: 500 });
         }
      } else {
         return NextResponse.json({ error: "No active check-in found to check out" }, { status: 400 });
      }

      await notifyCheckIn(employee, 'Manual Proxy (OUT)');
    }

    return NextResponse.json({ 
      success: true, 
      name: employee.name
    });

  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
