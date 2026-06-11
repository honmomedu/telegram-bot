import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { notifyCheckIn } from "@/lib/telegram";

function euclideanDistance(desc1: number[], desc2: number[]) {
  return Math.sqrt(desc1.reduce((sum, val, i) => sum + Math.pow(val - desc2[i], 2), 0));
}

export async function POST(req: NextRequest) {
  try {
    const { descriptor, fallbackEnrollments, orgSlug = 'default' } = await req.json();

    if (!descriptor || !Array.isArray(descriptor)) {
      return NextResponse.json({ error: "Invalid descriptor" }, { status: 400 });
    }

    let enrollmentsMap: Record<string, number[]> = {};

    // In a real app we fetch directly from DB
    const { data: dbRecords } = await supabase.from('face_enrollments').select('employee_code, descriptor').eq('org_slug', orgSlug);
    
    if (dbRecords && dbRecords.length > 0) {
      for (const rec of dbRecords) {
        enrollmentsMap[rec.employee_code] = typeof rec.descriptor === 'string' ? JSON.parse(rec.descriptor) : rec.descriptor;
      }
    } else if (fallbackEnrollments) {
      try {
        enrollmentsMap = JSON.parse(fallbackEnrollments);
      } catch (e) {}
    }

    const THRESHOLD = 0.5;
    let bestMatch = { distance: 1.0, employeeCode: '' };

    for (const [employeeCode, savedDesc] of Object.entries(enrollmentsMap)) {
       const distance = euclideanDistance(descriptor, savedDesc);
       if (distance < bestMatch.distance) {
         bestMatch = { distance, employeeCode };
       }
    }

    if (bestMatch.distance < THRESHOLD) {
      // Create attendance record
      const { error } = await supabase.from('attendance').insert({
         org_slug: orgSlug,
         employee_code: bestMatch.employeeCode,
         check_in_method: 'face',
         status: 'present'
      });

      if (!error) {
         const { data: employeeData } = await supabase
           .from('employees')
           .select('*')
           .eq('org_slug', orgSlug)
           .eq('employee_code', bestMatch.employeeCode)
           .single();
         if (employeeData) {
            await notifyCheckIn(employeeData, 'Face ID');
         }
      }

      return NextResponse.json({ 
        match: true, 
        employeeCode: bestMatch.employeeCode, 
        message: 'អត្តសញ្ញាណត្រូវបានផ្ទៀងផ្ទាត់ (Match found)', 
        distance: bestMatch.distance 
      });
    }

    return NextResponse.json({ match: false, message: 'មិនត្រូវបានស្គាល់ (Unknown face or low confidence)' });
  } catch (error: any) {
    console.error("Match error:", error);
    return NextResponse.json({ error: "Matching failed" }, { status: 500 });
  }
}

