import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { notifyCheckIn } from "@/lib/telegram";

export async function POST(req: NextRequest) {
  try {
    const { secret, employeeCode, orgSlug = 'default' } = await req.json();

    if (!secret || !employeeCode) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    if (!secret.startsWith('OFFICE_QR_')) {
      return NextResponse.json({ success: false, error: "Invalid secret format" });
    }

    const isGps = secret === 'OFFICE_QR_GPS';

    const { error } = await supabase.from('attendance').insert({
       org_slug: orgSlug,
       employee_code: employeeCode,
       check_in_method: isGps ? 'gps' : 'qr',
       status: 'present'
    });

    if (error) {
       console.error("Supabase error saving scan:", error);
    } else {
       // Fetch employee details to notify
       const { data: employeeData } = await supabase
         .from('employees')
         .select('*')
         .eq('org_slug', orgSlug)
         .eq('employee_code', employeeCode)
         .single();
         
       if (employeeData) {
         await notifyCheckIn(employeeData, isGps ? 'GPS Location' : 'QR Code');
       }
    }

    return NextResponse.json({ success: true, message: 'QR Validated' });

  } catch (error: any) {
    console.error("QR validation error:", error);
    return NextResponse.json({ success: false, error: "Validation failed" }, { status: 500 });
  }
}
