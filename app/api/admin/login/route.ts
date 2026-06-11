import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { password, orgSlug = 'default' } = await req.json();

    const { data } = await supabase
      .from('organizations')
      .select('admin_password')
      .eq('slug', orgSlug)
      .single();

    const envPassword = process.env.ADMIN_PASSWORD;
    const correctPassword = data?.admin_password || envPassword || 'admin123';

    if (password === correctPassword) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false, error: 'Invalid password' }, { status: 401 });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
