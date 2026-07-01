import { createClient } from '@/lib/supabase/server'
import type { AttendanceRow } from '@/types/database'

export type MyAttendanceItem = AttendanceRow & {
  session: {
    id: string; topic: string; date: string; session_number: number
    school: { name: string; district: string } | null
  } | null
}

/** The signed-in user's own attendance across sessions (RLS: user_id = auth.uid()). */
export async function listMyAttendance(userId: string, limit = 200): Promise<MyAttendanceItem[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('attendance_records')
    .select('*, session:sessions(id, topic, date, session_number, school:schools(name, district))')
    .eq('user_id', userId)
    .limit(limit)
  const rows = (data as unknown as MyAttendanceItem[] | null) ?? []
  return rows.sort((a, b) => (b.session?.date ?? '').localeCompare(a.session?.date ?? ''))
}
