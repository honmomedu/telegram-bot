import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const slug = url.searchParams.get('slug') || 'default';

  try {
    const { data } = await supabase.from('organizations').select('attendance_methods').eq('slug', slug).single();
    if (data && data.attendance_methods) {
      return NextResponse.json({ methods: data.attendance_methods });
    }
  } catch(e) {}

  return NextResponse.json({ methods: { gps: true, qr: true, face: true, manual: true } });
}
