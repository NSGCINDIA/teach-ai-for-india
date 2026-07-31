import type { OperationalPhase } from '@/types/database'

export interface OperationalPhaseMeta {
  label: string
  stepNumber: number // 1 to 7 corresponding to operational milestone
  category: 'team' | 'execution' | 'session_1' | 'session_2' | 'session_3' | 'session_4'
  description: string
}

export const OPERATIONAL_PHASE_META: Record<OperationalPhase, OperationalPhaseMeta> = {
  team_preparation: {
    label: 'Building Volunteer Team',
    stepNumber: 1,
    category: 'team',
    description: 'Requesting volunteer availability for the school team',
  },
  team_ready: {
    label: 'Volunteer Team Confirmed',
    stepNumber: 2,
    category: 'team',
    description: 'Team confirmed, ready for execution planning',
  },
  execution_planning: {
    label: 'Execution Planning',
    stepNumber: 3,
    category: 'execution',
    description: 'Execution Lead drafting logistics and budget plan',
  },
  execution_ready: {
    label: 'Execution Plan Approved',
    stepNumber: 4,
    category: 'execution',
    description: 'Dual approval complete, ready to schedule Session 1',
  },
  // Session 1
  session_1_planning: {
    label: 'Session 1 Planning',
    stepNumber: 5,
    category: 'session_1',
    description: 'Preparing delivery plan for Session 1',
  },
  session_1_ready: {
    label: 'Session 1 Scheduled',
    stepNumber: 5,
    category: 'session_1',
    description: 'Session 1 date, team, and logistics ready',
  },
  session_1_in_progress: {
    label: 'Session 1 In Progress',
    stepNumber: 5,
    category: 'session_1',
    description: 'Session 1 currently being delivered',
  },
  session_1_report_required: {
    label: 'Session 1 Report Pending',
    stepNumber: 5,
    category: 'session_1',
    description: 'Awaiting delivery report, attendance, and evidence',
  },
  session_1_submitted: {
    label: 'Session 1 Under Review',
    stepNumber: 5,
    category: 'session_1',
    description: 'Report submitted, awaiting Campus Lead verification',
  },
  session_1_verified: {
    label: 'Session 1 Completed',
    stepNumber: 5,
    category: 'session_1',
    description: 'Session 1 verified',
  },
  // Session 2
  session_2_planning: {
    label: 'Session 2 Planning',
    stepNumber: 6,
    category: 'session_2',
    description: 'Preparing delivery plan for Session 2',
  },
  session_2_ready: {
    label: 'Session 2 Scheduled',
    stepNumber: 6,
    category: 'session_2',
    description: 'Session 2 date, team, and logistics ready',
  },
  session_2_in_progress: {
    label: 'Session 2 In Progress',
    stepNumber: 6,
    category: 'session_2',
    description: 'Session 2 currently being delivered',
  },
  session_2_report_required: {
    label: 'Session 2 Report Pending',
    stepNumber: 6,
    category: 'session_2',
    description: 'Awaiting delivery report, attendance, and evidence',
  },
  session_2_submitted: {
    label: 'Session 2 Under Review',
    stepNumber: 6,
    category: 'session_2',
    description: 'Report submitted, awaiting Campus Lead verification',
  },
  session_2_verified: {
    label: 'Session 2 Completed',
    stepNumber: 6,
    category: 'session_2',
    description: 'Session 2 verified',
  },
  // Session 3
  session_3_planning: {
    label: 'Session 3 Planning',
    stepNumber: 7,
    category: 'session_3',
    description: 'Preparing delivery plan for Session 3',
  },
  session_3_ready: {
    label: 'Session 3 Scheduled',
    stepNumber: 7,
    category: 'session_3',
    description: 'Session 3 date, team, and logistics ready',
  },
  session_3_in_progress: {
    label: 'Session 3 In Progress',
    stepNumber: 7,
    category: 'session_3',
    description: 'Session 3 currently being delivered',
  },
  session_3_report_required: {
    label: 'Session 3 Report Pending',
    stepNumber: 7,
    category: 'session_3',
    description: 'Awaiting delivery report, attendance, and evidence',
  },
  session_3_submitted: {
    label: 'Session 3 Under Review',
    stepNumber: 7,
    category: 'session_3',
    description: 'Report submitted, awaiting Campus Lead verification',
  },
  session_3_verified: {
    label: 'Session 3 Completed',
    stepNumber: 7,
    category: 'session_3',
    description: 'Session 3 verified',
  },
  // Session 4
  session_4_planning: {
    label: 'Session 4 Planning',
    stepNumber: 7,
    category: 'session_4',
    description: 'Preparing delivery plan for Session 4',
  },
  session_4_ready: {
    label: 'Session 4 Scheduled',
    stepNumber: 7,
    category: 'session_4',
    description: 'Session 4 date, team, and logistics ready',
  },
  session_4_in_progress: {
    label: 'Session 4 In Progress',
    stepNumber: 7,
    category: 'session_4',
    description: 'Session 4 currently being delivered',
  },
  session_4_report_required: {
    label: 'Session 4 Report Pending',
    stepNumber: 7,
    category: 'session_4',
    description: 'Awaiting delivery report, attendance, and evidence',
  },
  session_4_submitted: {
    label: 'Session 4 Under Review',
    stepNumber: 7,
    category: 'session_4',
    description: 'Report submitted, awaiting Campus Lead verification',
  },
  session_4_verified: {
    label: 'Session 4 Completed',
    stepNumber: 7,
    category: 'session_4',
    description: 'Session 4 verified — School Program Complete!',
  },
}

export function getOperationalProgress(phase: OperationalPhase | null): {
  percent: number
  label: string
  currentStep: number
  totalSteps: number
} {
  if (!phase) {
    return { percent: 0, label: 'Not Started', currentStep: 0, totalSteps: 6 }
  }

  const ORDER: OperationalPhase[] = [
    'team_preparation',
    'team_ready',
    'execution_planning',
    'execution_ready',
    'session_1_planning', 'session_1_ready', 'session_1_in_progress', 'session_1_report_required', 'session_1_submitted', 'session_1_verified',
    'session_2_planning', 'session_2_ready', 'session_2_in_progress', 'session_2_report_required', 'session_2_submitted', 'session_2_verified',
    'session_3_planning', 'session_3_ready', 'session_3_in_progress', 'session_3_report_required', 'session_3_submitted', 'session_3_verified',
    'session_4_planning', 'session_4_ready', 'session_4_in_progress', 'session_4_report_required', 'session_4_submitted', 'session_4_verified',
  ]

  const idx = ORDER.indexOf(phase)
  if (idx < 0) return { percent: 0, label: 'Active', currentStep: 1, totalSteps: 6 }

  const total = ORDER.length
  const percent = Math.round(((idx + 1) / total) * 100)
  const meta = OPERATIONAL_PHASE_META[phase]

  return {
    percent,
    label: meta?.label ?? phase,
    currentStep: meta?.stepNumber ?? 1,
    totalSteps: 6,
  }
}
