import type { SessionType, AttendanceStatus } from '@/types/database'
import type { StatusTone } from '@/lib/constants/status'

/** Session-type catalogue (PRD §7.4). Each type carries one extra detail field. */
export const SESSION_TYPE_META: Record<SessionType, { label: string; blurb: string }> = {
  awareness:           { label: 'Awareness',           blurb: 'Intro to AI — what it is, why it matters.' },
  hands_on:            { label: 'Hands-on',            blurb: 'Students use AI tools directly.' },
  prompt_writing:      { label: 'Prompt Writing',      blurb: 'Crafting effective prompts.' },
  ethics_safety:       { label: 'Ethics & Safety',     blurb: 'Responsible, safe AI use.' },
  application_project: { label: 'Application Project',  blurb: 'Building a small project with AI.' },
  followup:            { label: 'Follow-up',           blurb: 'Revisit, reinforce, assess.' },
}

/**
 * Conditional field per session type, stored in sessions.type_details (jsonb).
 * Surfaced in the report form when that type is selected (PRD §7.4).
 */
export const SESSION_TYPE_FIELD: Record<SessionType, { key: string; label: string; placeholder: string }> = {
  awareness:           { key: 'reach_summary',      label: 'Reach summary',        placeholder: 'Classes / grades covered, key messages landed' },
  hands_on:            { key: 'tools_used',         label: 'Tools used',           placeholder: 'e.g. ChatGPT, Claude, Teachable Machine' },
  prompt_writing:      { key: 'sample_prompts',     label: 'Sample prompts',       placeholder: 'Notable prompts students wrote' },
  ethics_safety:       { key: 'topics_covered',     label: 'Topics covered',       placeholder: 'Bias, privacy, deepfakes, safe use…' },
  application_project: { key: 'project_description', label: 'Project description',  placeholder: 'What the students built' },
  followup:            { key: 'followup_summary',   label: 'Follow-up summary',    placeholder: 'What was revisited and assessed' },
}

export interface CurriculumStage { title: string }

/**
 * Suggested titles for a school's first 4 sessions, keyed by
 * sessions.session_number — advisory, not a contract: a school's total
 * session count is unbounded (school lifecycle v2, 0036/0037), so any
 * session_number is legal and numbers beyond 4 fall back to a generic label.
 * A school's position is read off its highest session_number (see
 * school_session_progress, 0030_mandatory_evidence.sql) — session_type
 * itself is untouched (locked-in decision, high blast radius across forms/
 * SESSION_TYPE_FIELD/session_plans/the public timeline).
 */
export const CURRICULUM_META: Record<number, CurriculumStage> = {
  1: { title: 'AI Awareness' },
  2: { title: 'AI Conversations & Prompt Engineering' },
  3: { title: 'AI Safety, Ethics & Future Careers' },
  4: { title: 'Using AI for Building & Problem Solving' },
}

export function curriculumStageLabel(sessionNumber: number): string {
  return CURRICULUM_META[sessionNumber]?.title ?? 'Additional Session'
}

export const ATTENDANCE_META: Record<AttendanceStatus, { label: string; tone: StatusTone }> = {
  present:    { label: 'Present',    tone: 'success' },
  late:       { label: 'Late',       tone: 'pending' },
  left_early: { label: 'Left early', tone: 'pending' },
  absent:     { label: 'Absent',     tone: 'muted' },
}

/** A volunteer counts toward the session if they showed up at all. */
export const PRESENT_STATUSES: AttendanceStatus[] = ['present', 'late', 'left_early']
