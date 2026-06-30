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

export const ATTENDANCE_META: Record<AttendanceStatus, { label: string; tone: StatusTone }> = {
  present:    { label: 'Present',    tone: 'success' },
  late:       { label: 'Late',       tone: 'pending' },
  left_early: { label: 'Left early', tone: 'pending' },
  absent:     { label: 'Absent',     tone: 'muted' },
}

/** A volunteer counts toward the session if they showed up at all. */
export const PRESENT_STATUSES: AttendanceStatus[] = ['present', 'late', 'left_early']
