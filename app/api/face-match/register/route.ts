import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { employeeCode, descriptor, orgSlug = 'default' } = await req.json();

    if (!employeeCode || !descriptor || !Array.isArray(descriptor)) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    // Upsert into Supabase (requires service role or proper RLS. For now, doing it via anon/service key).
    const { data, error } = await supabase
      .from('face_enrollments')
      .upsert({ org_slug: orgSlug, employee_code: employeeCode, descriptor: JSON.stringify(descriptor) });

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("Enrollment error:", error);
    return NextResponse.json({ error: "Enrollment failed" }, { status: 500 });
  }
}
