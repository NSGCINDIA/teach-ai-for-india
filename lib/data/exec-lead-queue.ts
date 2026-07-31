import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'

export interface ExecLeadWorkItem {
  id: string
  name: string
  district: string
  status: string
  operational_phase: string | null
  required_volunteers: number
  student_strength: number
  digital_classrooms: number
  has_projector: boolean
  has_internet: boolean
  has_lab: boolean
  execPlanStatus?: string | null
}

export interface ExecLeadQueueData {
  needingPlanCount: number
  awaitingApprovalCount: number
  executionReadyCount: number
  workItems: ExecLeadWorkItem[]
}

export const getExecLeadQueue = cache(async (campusId?: string | null): Promise<ExecLeadQueueData> => {
  const supabase = await createClient()

  let query = supabase
    .from('schools')
    .select(`
      id, name, district, status, operational_phase, required_volunteers,
      plan:session_plans(student_strength, digital_classrooms, has_projector, has_internet, has_lab),
      execPlan:school_execution_plans(status)
    `)
    .eq('status', 'sessions_active')

  if (campusId) {
    query = query.eq('campus_id', campusId)
  }

  const { data: schools } = await query
  if (!schools || schools.length === 0) {
    return {
      needingPlanCount: 0,
      awaitingApprovalCount: 0,
      executionReadyCount: 0,
      workItems: [],
    }
  }

  const workItems: ExecLeadWorkItem[] = schools.map((s) => {
    const p = Array.isArray(s.plan) ? s.plan[0] : s.plan
    const ep = Array.isArray(s.execPlan) ? s.execPlan[0] : s.execPlan
    return {
      id: s.id,
      name: s.name,
      district: s.district,
      status: s.status,
      operational_phase: s.operational_phase,
      required_volunteers: s.required_volunteers ?? 2,
      student_strength: p?.student_strength ?? 0,
      digital_classrooms: p?.digital_classrooms ?? 0,
      has_projector: p?.has_projector ?? false,
      has_internet: p?.has_internet ?? false,
      has_lab: p?.has_lab ?? false,
      execPlanStatus: ep?.status ?? null,
    }
  })

  const needingPlanCount = workItems.filter(
    (w) => w.operational_phase === 'team_ready' || w.operational_phase === 'execution_planning' || !w.execPlanStatus,
  ).length

  const awaitingApprovalCount = workItems.filter(
    (w) => w.execPlanStatus === 'submitted' || w.execPlanStatus === 'campus_approved',
  ).length

  const executionReadyCount = workItems.filter(
    (w) => w.execPlanStatus === 'approved' || w.operational_phase === 'execution_ready',
  ).length

  return {
    needingPlanCount,
    awaitingApprovalCount,
    executionReadyCount,
    workItems,
  }
})
