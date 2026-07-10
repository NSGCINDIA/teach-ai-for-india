/**
 * Database types — hand-authored to mirror supabase/migrations exactly.
 * Shaped to match `supabase gen types` so it drops in as the SupabaseClient
 * generic: createClient<Database>(). Regenerate with the CLI once the project
 * exists to keep this in lockstep.
 *
 * NOTE: Row shapes MUST be `type` aliases (not `interface`). Supabase's
 * GenericSchema constraint requires `Record<string, unknown>`-compatible types,
 * and TS interfaces do not satisfy an index signature — using `interface` here
 * silently makes `supabase.from(...)` resolve to `never`.
 */

// ─── Enums (mirror 0001_schema.sql) ──────────────────────────────────────────
export type UserRole =
  | 'super_admin' | 'campus_lead' | 'outreach_lead'
  | 'exec_lead' | 'volunteer_lead' | 'volunteer'
  | 'campus_mgmt_admin' | 'finance_lead'

export type SchoolTypeEnum = 'government' | 'government_aided' | 'private'
export type BoardType = 'state' | 'cbse' | 'icse' | 'other'
export type SchoolStatus =
  | 'lead_identified' | 'outreach_requested' | 'outreach_approved' | 'visit_completed'
  | 'registered' | 'sessions_active' | 'completed' | 'archived'
export type SessionType =
  | 'awareness' | 'hands_on' | 'prompt_writing' | 'ethics_safety'
  | 'application_project' | 'followup'
export type SessionStatus =
  | 'planned' | 'in_progress' | 'reported' | 'campus_approved' | 'verified' | 'cancelled'
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'left_early'
export type ReimbursementStatus =
  | 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'paid'
export type TravelMode = 'auto' | 'bus' | 'cab' | 'train' | 'own_vehicle' | 'other'
export type MediaFileType =
  | 'photo' | 'video' | 'document' | 'receipt' | 'letter' | 'presentation' | 'other'
  | 'team_photo' | 'principal_photo' | 'student_group_photo' | 'student_testimonial' | 'teacher_testimonial'
export type ApprovalStatus = 'pending' | 'approved' | 'rejected'
export type MediaEntityType = 'session' | 'school' | 'campus' | 'reimbursement' | 'school_visit'
export type ApplicationStatus = 'new' | 'reviewing' | 'invited' | 'rejected'

type Timestamps = { created_at: string; updated_at: string }

// ─── Row shapes ──────────────────────────────────────────────────────────────
export type CampusRow = Timestamps & {
  id: string; name: string; university_name: string; city: string; state: string
  slug: string; lead_user_id: string | null; is_active: boolean
  target_schools: number; target_students: number; target_sessions: number
  quarter: string | null; description: string | null; hero_image_url: string | null
}

export type UserRow = Timestamps & {
  id: string; email: string; full_name: string; phone: string | null
  role: UserRole; campus_id: string | null; avatar_url: string | null
  is_active: boolean; invited_by: string | null; invited_at: string | null
  last_login_at: string | null; niat_id: string | null
}

export type SignupRequestStatus = 'pending' | 'approved' | 'rejected'
export type SignupRequestRow = {
  id: string; auth_user_id: string | null; full_name: string; niat_id: string; phone: string | null
  email: string; campus_id: string | null; requested_role: UserRole; status: SignupRequestStatus
  reviewed_by: string | null; reviewed_at: string | null; created_at: string
}

// Signup rate limiting (0021_signup_rate_limit.sql)
export type SignupAttemptRow = {
  id: number; ip_address: string; created_at: string
}

export type SchoolRow = Timestamps & {
  id: string; name: string; school_type: SchoolTypeEnum; board: BoardType
  state: string; district: string; cluster: string | null; mandal: string | null
  address: string | null; dise_code: string | null; campus_id: string | null
  outreach_lead_id: string | null; status: SchoolStatus; next_action_date: string | null
  notes: string | null; total_sessions: number; total_students: number
  is_duplicate_flagged: boolean; created_by: string | null
}

export type SchoolContactRow = {
  id: string; school_id: string; name: string; designation: string
  phone: string | null; email: string | null; whatsapp: string | null
  is_primary: boolean; created_at: string
}

export type SchoolStatusHistoryRow = {
  id: string; school_id: string; previous_status: string | null; new_status: string
  changed_by: string | null; note: string | null; created_at: string
}

export type SessionRow = Timestamps & {
  id: string; school_id: string; campus_id: string | null; session_number: number
  session_type: SessionType; date: string; start_time: string | null
  end_time: string | null; duration_minutes: number | null; status: SessionStatus
  topic: string; student_count: number | null; volunteer_count: number | null
  team_members_present: string[]; notes: string | null; challenges: string | null
  next_steps: string | null; improvement_notes: string | null
  type_details: Record<string, unknown>; previous_session_id: string | null
  created_by: string | null; reviewed_by: string | null; reviewed_at: string | null
  verified_by: string | null; verified_at: string | null
}

export type SessionPlanStatus = 'draft' | 'approved' | 'cancelled'

export type SessionPlanRow = Timestamps & {
  id: string; school_id: string; campus_id: string | null; status: SessionPlanStatus
  coordinator_name: string | null; coordinator_phone: string | null
  coordinator_designation: string | null
  student_strength: number | null; num_classes: number | null
  num_sections: number | null; num_classrooms: number | null
  has_lab: boolean; has_projector: boolean; has_internet: boolean
  session_type: SessionType; topic: string | null
  planned_date: string | null; backup_date: string | null
  start_time: string | null; end_time: string | null
  approval_letter_path: string | null; image_paths: string[]
  logistics_notes: string | null; session_id: string | null
  created_by: string | null; approved_by: string | null; approved_at: string | null
}

export type AttendanceRow = {
  id: string; session_id: string; user_id: string; status: AttendanceStatus
  arrival_time: string | null; departure_time: string | null; notes: string | null
  marked_by: string | null; created_at: string
}

export type AssignmentStatus =
  | 'assigned' | 'accepted' | 'declined' | 'replacement_requested' | 'cancelled'

export type SessionAssignmentRow = Timestamps & {
  id: string; session_id: string; volunteer_id: string; campus_id: string | null
  status: AssignmentStatus; note: string | null; assigned_by: string | null
  assigned_at: string; responded_at: string | null
}

export type AvailabilityStatus = 'available' | 'unavailable' | 'tentative'
export type CertificateKind = 'participation' | 'milestone' | 'excellence' | 'completion'

export type AnnouncementRow = Timestamps & {
  id: string; campus_id: string | null; title: string; body: string
  pinned: boolean; posted_by: string | null
}

export type AvailabilityRow = Timestamps & {
  id: string; volunteer_id: string; campus_id: string | null; date: string
  status: AvailabilityStatus; note: string | null
}

export type CertificateRow = {
  id: string; volunteer_id: string; campus_id: string | null; kind: CertificateKind
  title: string; description: string | null; sessions_count: number | null
  serial: string | null; issued_by: string | null; issued_at: string; created_at: string
}

export type ReimbursementRow = Timestamps & {
  id: string; reference_number: string; claimant_id: string; session_id: string | null
  campus_id: string | null; amount: number; travel_mode: TravelMode; reason: string | null
  claim_date: string; status: ReimbursementStatus; reviewed_by: string | null
  reviewed_at: string | null; reviewer_note: string | null; payment_date: string | null
  payment_reference: string | null; payment_method: string | null; anomaly_flags: string[]
}

export type MediaAssetRow = {
  id: string; storage_path: string | null; external_url: string | null
  file_name: string; file_type: MediaFileType
  mime_type: string | null; file_size_bytes: number | null
  entity_type: MediaEntityType; entity_id: string; campus_id: string | null
  school_id: string | null; session_id: string | null; is_featured: boolean
  is_public: boolean; approval_status: ApprovalStatus; caption: string | null
  uploaded_by: string | null; approved_by: string | null; deleted_at: string | null
  created_at: string
}

export type NotificationRow = {
  id: string; recipient_id: string; type: string; title: string; body: string | null
  action_url: string | null; entity_type: string | null; entity_id: string | null
  is_read: boolean; read_at: string | null; created_at: string
}

export type ContentBlockRow = {
  id: string; block_key: string; content: Record<string, unknown>
  updated_by: string | null; updated_at: string
}

export type AuditLogRow = {
  id: string; actor_id: string | null; action: string; entity_type: string
  entity_id: string | null; detail: Record<string, unknown>; created_at: string
}

export type VolunteerApplicationRow = {
  id: string; full_name: string; email: string; phone: string | null
  campus_slug: string | null; motivation: string | null; status: ApplicationStatus
  reviewed_by: string | null; created_at: string
}

export type ContactMessageRow = {
  id: string; name: string; email: string; subject: string | null
  message: string; is_handled: boolean; created_at: string
}

// Campus budgets (0027_campus_budgets.sql)
export type CampusBudgetRow = Timestamps & {
  id: string; campus_id: string; period: string
  allocated_amount: number; reserved_amount: number; notes: string | null
  created_by: string | null
}

// Outreach visit requests (0028_outreach_visit_requests.sql)
export type OutreachVisitRequestRow = Timestamps & {
  id: string; school_id: string; campus_id: string | null
  purpose: string; proposed_visit_date: string; estimated_travel_cost: number
  team_member_ids: string[]
  status: ApprovalStatus
  campus_lead_review: ApprovalStatus; campus_lead_reviewed_by: string | null
  campus_lead_reviewed_at: string | null; campus_lead_note: string | null
  finance_lead_review: ApprovalStatus; finance_lead_reviewed_by: string | null
  finance_lead_reviewed_at: string | null; finance_lead_note: string | null
  created_by: string | null
}

// Budget increase requests (0032_budget_increase_requests.sql)
export type BudgetIncreaseRequestRow = Timestamps & {
  id: string; campus_id: string; period: string; budget_id: string | null
  requested_amount: number; reason: string
  status: ApprovalStatus
  reviewed_by: string | null; reviewed_at: string | null; review_note: string | null
  created_by: string | null
}

// Outreach requests (0037_outreach_requests_and_school_visits.sql)
export type OutreachRequestRow = Timestamps & {
  id: string; school_id: string; campus_id: string | null
  reason: string; proposed_approach: string | null
  status: ApprovalStatus
  reviewed_by: string | null; reviewed_at: string | null; review_note: string | null
  created_by: string | null
}

// School visits (0037_outreach_requests_and_school_visits.sql)
export type SchoolVisitRow = {
  id: string; school_id: string; campus_id: string | null
  visited_by: string | null; team_member_ids: string[]
  visited_at: string; notes: string | null
  created_by: string | null; created_at: string
}

// Execution plans (0029_execution_plans.sql)
export type ExecutionPlanRow = Timestamps & {
  id: string; session_id: string; campus_id: string | null
  logistics_notes: string
  has_laptop: boolean; has_projector: boolean; has_hdmi_cable: boolean
  has_extension_board: boolean; has_speaker: boolean; has_internet_device: boolean
  other_equipment: string | null
  teaching_resources: string | null
  estimated_transport_cost: number; session_ready: boolean
  status: ApprovalStatus
  campus_lead_review: ApprovalStatus; campus_lead_reviewed_by: string | null
  campus_lead_reviewed_at: string | null; campus_lead_note: string | null
  finance_lead_review: ApprovalStatus; finance_lead_reviewed_by: string | null
  finance_lead_reviewed_at: string | null; finance_lead_note: string | null
  created_by: string | null
}

// View rows
export type PublicImpactStats = {
  schools_reached: number; students_impacted: number; sessions_completed: number
  active_campuses: number; states_count: number
}
export type PublicCampusCard = {
  id: string; name: string; slug: string; university_name: string; city: string
  state: string; description: string | null; hero_image_url: string | null
  lead_name: string | null; lead_avatar_url: string | null
  schools_reached: number; students_impacted: number; sessions_completed: number
}
export type CampusRollup = {
  campus_id: string; name: string; slug: string
  target_schools: number; target_students: number; target_sessions: number; quarter: string | null
  schools_total: number; schools_reached: number; sessions_completed: number
  students_impacted: number; volunteers: number; last_session_date: string | null
}
// Curriculum progress (0030_mandatory_evidence.sql)
export type SchoolSessionProgressRow = {
  school_id: string; latest_session_id: string
  latest_session_number: number; latest_session_status: SessionStatus
}
// Campus Finance Dashboard (0031_finance_lead_reimbursements.sql)
export type CampusFinanceSummary = {
  campus_id: string; campus_name: string; period: string | null
  budget_id: string | null; allocated_amount: number | null; reserved_amount: number | null
  approved_expenses: number; paid_total: number; unpaid_liabilities: number; pending_count: number
  remaining_amount: number | null
}
// Analytics (0012_analytics_views.sql)
export type ProgramSummary = {
  schools_total: number; schools_reached: number; sessions_completed: number
  students_impacted: number; active_volunteers: number; active_campuses: number
  states_count: number; approved_spend: number; pending_claims: number
  target_students: number; target_sessions: number; target_schools: number
}
export type CampusPerformance = {
  campus_id: string; name: string; slug: string
  target_schools: number; target_students: number; target_sessions: number; quarter: string | null
  schools_total: number; schools_reached: number; sessions_completed: number
  students_impacted: number; volunteers: number; approved_spend: number
  last_session_date: string | null
}
export type StatusCount = { status: string; count: number }
export type MonthlyActivity = { month: string; sessions_completed: number; students_impacted: number }
// Public campus detail (0013_public_campus_detail.sql)
export type PublicCampusSession = {
  id: string; campus_id: string | null; topic: string; session_type: SessionType
  date: string; student_count: number | null; school_name: string; school_district: string
}
export type PublicCampusTeamMember = {
  id: string; campus_id: string | null; full_name: string; role: UserRole; avatar_url: string | null
}

// ─── Database generic (supabase-js) ──────────────────────────────────────────
type TableDef<Row, Insert = Partial<Row>, Update = Partial<Row>> = {
  Row: Row; Insert: Insert; Update: Update; Relationships: []
}

export interface Database {
  public: {
    Tables: {
      campuses: TableDef<CampusRow>
      users: TableDef<UserRow>
      schools: TableDef<SchoolRow>
      school_contacts: TableDef<SchoolContactRow>
      school_status_history: TableDef<SchoolStatusHistoryRow>
      sessions: TableDef<SessionRow>
      attendance_records: TableDef<AttendanceRow>
      reimbursements: TableDef<ReimbursementRow>
      media_assets: TableDef<MediaAssetRow>
      notifications: TableDef<NotificationRow>
      content_blocks: TableDef<ContentBlockRow>
      audit_log: TableDef<AuditLogRow>
      volunteer_applications: TableDef<VolunteerApplicationRow>
      contact_messages: TableDef<ContactMessageRow>
      signup_requests: TableDef<SignupRequestRow>
      signup_attempts: TableDef<SignupAttemptRow>
      session_plans: TableDef<SessionPlanRow>
      session_assignments: TableDef<SessionAssignmentRow>
      announcements: TableDef<AnnouncementRow>
      volunteer_availability: TableDef<AvailabilityRow>
      certificates: TableDef<CertificateRow>
      campus_budgets: TableDef<CampusBudgetRow>
      outreach_visit_requests: TableDef<OutreachVisitRequestRow>
      execution_plans: TableDef<ExecutionPlanRow>
      budget_increase_requests: TableDef<BudgetIncreaseRequestRow>
      outreach_requests: TableDef<OutreachRequestRow>
      school_visits: TableDef<SchoolVisitRow>
    }
    Views: {
      public_impact_stats: { Row: PublicImpactStats; Relationships: [] }
      public_campus_cards: { Row: PublicCampusCard; Relationships: [] }
      campus_rollups: { Row: CampusRollup; Relationships: [] }
      finance_campus_spend: { Row: { campus_id: string | null; pending_count: number; approved_total: number; paid_total: number; unpaid_liabilities: number; month_to_date: number }; Relationships: [] }
      finance_monthly_trend: { Row: { month: string; approved_total: number }; Relationships: [] }
      program_summary: { Row: ProgramSummary; Relationships: [] }
      campus_performance: { Row: CampusPerformance; Relationships: [] }
      session_funnel: { Row: StatusCount; Relationships: [] }
      school_pipeline: { Row: StatusCount; Relationships: [] }
      monthly_activity: { Row: MonthlyActivity; Relationships: [] }
      public_campus_sessions: { Row: PublicCampusSession; Relationships: [] }
      public_campus_team: { Row: PublicCampusTeamMember; Relationships: [] }
      school_session_progress: { Row: SchoolSessionProgressRow; Relationships: [] }
      campus_finance_summary: { Row: CampusFinanceSummary; Relationships: [] }
    }
    Functions: {
      change_school_status: {
        Args: { p_school_id: string; p_new_status: SchoolStatus; p_note?: string }
        Returns: undefined
      }
      find_similar_schools: {
        Args: { p_name: string; p_district: string; p_max_distance?: number }
        Returns: { id: string; name: string; district: string; campus_id: string | null; status: SchoolStatus; distance: number }[]
      }
      reimbursement_window_days: {
        Args: Record<string, never>
        Returns: number
      }
      approve_session_plan: {
        Args: { p_plan_id: string }
        Returns: string
      }
      assign_volunteers: {
        Args: { p_session_id: string; p_volunteer_ids: string[] }
        Returns: number
      }
      respond_to_assignment: {
        Args: { p_assignment_id: string; p_status: AssignmentStatus; p_note?: string }
        Returns: undefined
      }
      set_campus_budget: {
        Args: { p_campus_id: string; p_period: string; p_allocated_amount: number; p_note?: string }
        Returns: string
      }
      finance_allocate_campus_budget: {
        Args: { p_campus_id: string; p_allocated_amount: number; p_note?: string }
        Returns: string
      }
      create_budget_increase_request: {
        Args: { p_campus_id: string; p_requested_amount: number; p_reason: string }
        Returns: string
      }
      review_budget_increase_request: {
        Args: { p_request_id: string; p_decision: ApprovalStatus; p_note?: string }
        Returns: undefined
      }
      create_outreach_visit_request: {
        Args: {
          p_school_id: string; p_purpose: string; p_proposed_visit_date: string
          p_estimated_travel_cost: number; p_team_member_ids: string[]
        }
        Returns: string
      }
      review_outreach_visit_request_campus: {
        Args: { p_request_id: string; p_decision: ApprovalStatus; p_note?: string }
        Returns: undefined
      }
      review_outreach_visit_request_finance: {
        Args: { p_request_id: string; p_decision: ApprovalStatus; p_note?: string }
        Returns: undefined
      }
      create_outreach_request: {
        Args: { p_school_id: string; p_reason: string; p_proposed_approach?: string }
        Returns: string
      }
      review_outreach_request: {
        Args: { p_request_id: string; p_decision: ApprovalStatus; p_note?: string }
        Returns: undefined
      }
      log_school_visit: {
        Args: {
          p_school_id: string; p_visited_at: string
          p_notes?: string; p_team_member_ids?: string[]
        }
        Returns: string
      }
      create_execution_plan: {
        Args: {
          p_session_id: string; p_logistics_notes: string
          p_has_laptop: boolean; p_has_projector: boolean; p_has_hdmi_cable: boolean
          p_has_extension_board: boolean; p_has_speaker: boolean; p_has_internet_device: boolean
          p_other_equipment?: string; p_teaching_resources?: string
          p_estimated_transport_cost?: number; p_session_ready?: boolean
        }
        Returns: string
      }
      review_execution_plan_campus: {
        Args: { p_plan_id: string; p_decision: ApprovalStatus; p_note?: string }
        Returns: undefined
      }
      review_execution_plan_finance: {
        Args: { p_plan_id: string; p_decision: ApprovalStatus; p_note?: string }
        Returns: undefined
      }
      review_reimbursement_finance: {
        Args: { p_reimbursement_id: string; p_decision: ReimbursementStatus; p_note?: string }
        Returns: undefined
      }
      pay_reimbursement_finance: {
        Args: {
          p_reimbursement_id: string; p_payment_date?: string
          p_payment_reference?: string; p_payment_method?: string
        }
        Returns: undefined
      }
    }
    Enums: {
      user_role: UserRole; school_type: SchoolTypeEnum; board_type: BoardType
      school_status: SchoolStatus; session_type: SessionType; session_status: SessionStatus
      attendance_status: AttendanceStatus; reimbursement_status: ReimbursementStatus
      travel_mode: TravelMode; media_file_type: MediaFileType; approval_status: ApprovalStatus
      media_entity_type: MediaEntityType; application_status: ApplicationStatus
    }
    CompositeTypes: Record<string, never>
  }
}
