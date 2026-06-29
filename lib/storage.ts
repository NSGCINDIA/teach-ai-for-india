// ─── Types ────────────────────────────────────────────────────────────────────

export type Role = "volunteer" | "campus_lead" | "admin"

export interface StoredUser {
  id: string
  fullName: string
  niatId: string
  campus: string
  email: string
  password: string
  role: Role
  status: "pending" | "approved" | "rejected"
  createdAt: string
}

export interface Submission {
  id: string
  userId: string
  campus: string
  schoolType: string
  schoolName: string
  village: string
  district: string
  state: string
  pincode: string
  visitType: string
  topicCovered: string
  studentsCount: string
  classes: string[]
  approvalLink: string
  mediaLink: string
  submittedAt: string
}

export type OutreachStatus =
  | "Contacted"
  | "Approval Pending"
  | "Approved"
  | "Scheduled"
  | "Completed"
  | "Declined"

export interface Outreach {
  id: string
  userId: string
  campus: string
  schoolName: string
  schoolType: string
  contactName: string
  contactPhone: string
  village: string
  district: string
  state: string
  expectedStudents: string
  status: OutreachStatus
  notes: string
  createdAt: string
  updatedAt: string
}

export type ReimbursementStatus = "pending" | "approved" | "rejected" | "paid"

export interface Reimbursement {
  id: string
  userId: string
  userName: string
  campus: string
  category: string
  description: string
  amount: number
  spendDate: string
  receiptLink: string
  status: ReimbursementStatus
  reviewNote: string
  reviewedAt: string
  createdAt: string
}

// ─── Keys ─────────────────────────────────────────────────────────────────────

const KEYS = {
  users:          "tafi_users",
  currentUser:    "tafi_current_user",
  submissions:    "tafi_submissions",
  outreach:       "tafi_outreach",
  reimbursements: "tafi_reimbursements",
  seeded:         "tafi_seeded",
} as const

// ─── Default admin (seeded once) ────────────────────────────────────────────────

export const DEFAULT_ADMIN = {
  email:    "admin@teachaiforindia.org",
  password: "admin123",
} as const

function seedAdminIfNeeded(users: StoredUser[]): StoredUser[] {
  const hasAdmin = users.some((u) => u.role === "admin")
  if (hasAdmin) return users
  const admin: StoredUser = {
    id:        "admin-root",
    fullName:  "Platform Admin",
    niatId:    "ADMIN",
    campus:    "HQ",
    email:     DEFAULT_ADMIN.email,
    password:  DEFAULT_ADMIN.password,
    role:      "admin",
    status:    "approved",
    createdAt: "2026-01-01T00:00:00.000Z",
  }
  return [admin, ...users]
}

// Backward-compat: older records had no `role` field — treat them as volunteers.
function normalizeUser(u: Partial<StoredUser>): StoredUser {
  return {
    role: "volunteer",
    status: "pending",
    ...u,
  } as StoredUser
}

// ─── Users ────────────────────────────────────────────────────────────────────

export function getUsers(): StoredUser[] {
  try {
    const raw = JSON.parse(localStorage.getItem(KEYS.users) ?? "[]") as Partial<StoredUser>[]
    const normalized = raw.map(normalizeUser)
    const seeded = seedAdminIfNeeded(normalized)
    // Persist the seeded admin so it survives reloads.
    if (seeded.length !== normalized.length) {
      localStorage.setItem(KEYS.users, JSON.stringify(seeded))
    }
    return seeded
  } catch {
    return []
  }
}

export function saveUsers(users: StoredUser[]): void {
  localStorage.setItem(KEYS.users, JSON.stringify(users))
}

export function addUser(user: StoredUser): void {
  const users = getUsers()
  users.push(user)
  saveUsers(users)
}

export function updateUserStatus(id: string, status: StoredUser["status"]): void {
  const users = getUsers()
  const idx = users.findIndex((u) => u.id === id)
  if (idx !== -1) {
    users[idx].status = status
    saveUsers(users)
    const cur = getCurrentUser()
    if (cur?.id === id) {
      saveCurrentUser({ ...cur, status })
    }
  }
}

export function getUserByEmail(email: string): StoredUser | undefined {
  return getUsers().find((u) => u.email.toLowerCase() === email.toLowerCase())
}

// ─── Current User (Session) ───────────────────────────────────────────────────

export function getCurrentUser(): StoredUser | null {
  try {
    const raw = localStorage.getItem(KEYS.currentUser)
    if (!raw) return null
    return normalizeUser(JSON.parse(raw))
  } catch {
    return null
  }
}

export function saveCurrentUser(user: StoredUser): void {
  localStorage.setItem(KEYS.currentUser, JSON.stringify(user))
}

export function clearCurrentUser(): void {
  localStorage.removeItem(KEYS.currentUser)
}

// ─── Submissions ──────────────────────────────────────────────────────────────

export function getSubmissions(): Submission[] {
  try {
    return JSON.parse(localStorage.getItem(KEYS.submissions) ?? "[]")
  } catch {
    return []
  }
}

export function addSubmission(sub: Submission): { ok: boolean; duplicate: boolean } {
  const all = getSubmissions()
  const today = sub.submittedAt.slice(0, 10)
  const isDupe = all.some(
    (s) =>
      s.campus.toLowerCase()     === sub.campus.toLowerCase()     &&
      s.schoolName.toLowerCase() === sub.schoolName.toLowerCase() &&
      s.visitType.toLowerCase()  === sub.visitType.toLowerCase()  &&
      s.submittedAt.slice(0, 10) === today
  )
  if (isDupe) return { ok: false, duplicate: true }
  all.push(sub)
  localStorage.setItem(KEYS.submissions, JSON.stringify(all))
  return { ok: true, duplicate: false }
}

// ─── Outreach ───────────────────────────────────────────────────────────────────

export function getOutreach(): Outreach[] {
  try {
    return JSON.parse(localStorage.getItem(KEYS.outreach) ?? "[]")
  } catch {
    return []
  }
}

export function addOutreach(o: Outreach): { ok: boolean; duplicate: boolean } {
  const all = getOutreach()
  const isDupe = all.some(
    (x) =>
      x.campus.toLowerCase()     === o.campus.toLowerCase() &&
      x.schoolName.toLowerCase() === o.schoolName.toLowerCase()
  )
  if (isDupe) return { ok: false, duplicate: true }
  all.push(o)
  localStorage.setItem(KEYS.outreach, JSON.stringify(all))
  return { ok: true, duplicate: false }
}

export function updateOutreachStatus(id: string, status: OutreachStatus): void {
  const all = getOutreach()
  const idx = all.findIndex((o) => o.id === id)
  if (idx !== -1) {
    all[idx].status = status
    all[idx].updatedAt = new Date().toISOString()
    localStorage.setItem(KEYS.outreach, JSON.stringify(all))
  }
}

// ─── Reimbursements ─────────────────────────────────────────────────────────────

export function getReimbursements(): Reimbursement[] {
  try {
    return JSON.parse(localStorage.getItem(KEYS.reimbursements) ?? "[]")
  } catch {
    return []
  }
}

export function addReimbursement(r: Reimbursement): void {
  const all = getReimbursements()
  all.push(r)
  localStorage.setItem(KEYS.reimbursements, JSON.stringify(all))
}

export function updateReimbursementStatus(
  id: string,
  status: ReimbursementStatus,
  reviewNote = ""
): void {
  const all = getReimbursements()
  const idx = all.findIndex((r) => r.id === id)
  if (idx !== -1) {
    all[idx].status = status
    all[idx].reviewNote = reviewNote
    all[idx].reviewedAt = new Date().toISOString()
    localStorage.setItem(KEYS.reimbursements, JSON.stringify(all))
  }
}

// ─── Analytics ───────────────────────────────────────────────────────────────────

export interface CampusRollup {
  campus: string
  sessions: number
  students: number
  schools: number
  outreach: number
  volunteers: number
  lastActivity: string | null
}

/** Build per-campus rollups straight from the live records (single source of truth). */
export function getCampusRollups(): CampusRollup[] {
  const subs = getSubmissions()
  const out  = getOutreach()
  const users = getUsers().filter((u) => u.role !== "admin")

  const campuses = new Set<string>([
    ...subs.map((s) => s.campus),
    ...out.map((o) => o.campus),
    ...users.map((u) => u.campus),
  ])

  return Array.from(campuses)
    .filter(Boolean)
    .map((campus) => {
      const cSubs = subs.filter((s) => s.campus === campus)
      const cOut  = out.filter((o) => o.campus === campus)
      const dates = cSubs.map((s) => s.submittedAt).sort()
      return {
        campus,
        sessions:  cSubs.length,
        students:  cSubs.reduce((a, s) => a + (Number(s.studentsCount) || 0), 0),
        schools:   new Set(cSubs.map((s) => s.schoolName.toLowerCase())).size,
        outreach:  cOut.length,
        volunteers: users.filter((u) => u.campus === campus).length,
        lastActivity: dates.length ? dates[dates.length - 1] : null,
      }
    })
    .sort((a, b) => b.sessions - a.sessions)
}

export interface PlatformStats {
  totalStudents: number
  totalSessions: number
  totalSchools: number
  activeCampuses: number
  approvedSpend: number
  pendingSpend: number
  pendingApprovals: number
  pendingReimbursements: number
}

export function getPlatformStats(): PlatformStats {
  const subs    = getSubmissions()
  const rollups = getCampusRollups()
  const reimb   = getReimbursements()
  const users   = getUsers()

  return {
    totalStudents: subs.reduce((a, s) => a + (Number(s.studentsCount) || 0), 0),
    totalSessions: subs.length,
    totalSchools:  new Set(subs.map((s) => s.schoolName.toLowerCase())).size,
    activeCampuses: rollups.filter((c) => c.sessions > 0).length,
    approvedSpend: reimb
      .filter((r) => r.status === "approved" || r.status === "paid")
      .reduce((a, r) => a + r.amount, 0),
    pendingSpend: reimb
      .filter((r) => r.status === "pending")
      .reduce((a, r) => a + r.amount, 0),
    pendingApprovals:      users.filter((u) => u.status === "pending").length,
    pendingReimbursements: reimb.filter((r) => r.status === "pending").length,
  }
}
