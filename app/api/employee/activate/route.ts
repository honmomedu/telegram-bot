import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { employeeCode, telegramId, orgSlug = 'default' } = await req.json();

    if (!employeeCode) {
      return NextResponse.json({ error: "Employee code required" }, { status: 400 });
    }

    // Upsert employee to make sure they exist for our demo
    const { data: existing, error: findError } = await supabase
       .from('employees')
       .select('*')
       .eq('org_slug', orgSlug)
       .eq('employee_code', employeeCode)
       .single();

    if (!existing) {
       // Insert if not exist to keep UI running
       await supabase.from('employees').insert({
          org_slug: orgSlug,
          employee_code: employeeCode,
          name: employeeCode,
          telegram_id: telegramId || null
       });
    } else if (telegramId && existing.telegram_id !== telegramId) {
       // Link telegram ID if it was provided
       await supabase.from('employees').update({ telegram_id: telegramId }).eq('org_slug', orgSlug).eq('employee_code', employeeCode);
    }
    
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
