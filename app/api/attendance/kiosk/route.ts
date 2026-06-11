import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { notifyCheckIn } from '@/lib/telegram';

export async function POST(req: NextRequest) {
  try {
    const { cardId, orgSlug = 'default' } = await req.json();

    if (!cardId) {
      return NextResponse.json({ error: "Missing card ID" }, { status: 400 });
    }

    // Find employee by nfc_card_id
    const { data: employee, error: empError } = await supabase
       .from('employees')
       .select('*')
       .eq('org_slug', orgSlug)
       .eq('nfc_card_id', cardId)
       .single();

    if (empError || !employee) {
       return NextResponse.json({ error: "Card not registered" }, { status: 404 });
    }

    // Get today's start and end logic or just grab the latest attendance today
    const todayStart = new Date();
    todayStart.setHours(0,0,0,0);
    
    const { data: lastAttendance } = await supabase
       .from('attendance')
       .select('id, check_in_time, check_out_time')
       .eq('org_slug', orgSlug)
       .eq('employee_code', employee.employee_code)
       .gte('check_in_time', todayStart.toISOString())
       .order('check_in_time', { ascending: false })
       .limit(1)
       .single();

    let action: 'in' | 'out' = 'in';

    if (lastAttendance) {
        const lastTime = new Date(lastAttendance.check_out_time || lastAttendance.check_in_time).getTime();
        const now = Date.now();
        if (now - lastTime < 1000 * 60 * 1) { // 1 min buffer
           return NextResponse.json({ error: "Too soon to tap again" }, { status: 429 });
        }
        
        // If there's no check_out_time on the latest record, we check out
        if (!lastAttendance.check_out_time) {
            action = 'out';
            const { error: attError } = await supabase
               .from('attendance')
               .update({ check_out_time: new Date().toISOString() })
               .eq('id', lastAttendance.id);
            
            if (attError) {
               return NextResponse.json({ error: "Database error" }, { status: 500 });
            }
            
            await notifyCheckIn(employee, 'NFC (OUT)');
            return NextResponse.json({ success: true, name: employee.name, action });
        }
    }

    // Insert new check-in attendance
    const { error: attError } = await supabase.from('attendance').insert({
       org_slug: orgSlug,
       employee_code: employee.employee_code,
       check_in_method: 'nfc',
       status: 'present'
    });
    
    if (attError) {
       return NextResponse.json({ error: "Database error" }, { status: 500 });
    }
    
    await notifyCheckIn(employee, 'NFC (IN)');

    return NextResponse.json({ 
      success: true, 
      name: employee.name,
      action
    });

  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
