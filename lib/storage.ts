// ─── Types ────────────────────────────────────────────────────────────────────

export interface StoredUser {
  id: string
  fullName: string
  niatId: string
  campus: string
  email: string
  password: string
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

// ─── Keys ─────────────────────────────────────────────────────────────────────

const KEYS = {
  users:       "tafi_users",
  currentUser: "tafi_current_user",
  submissions: "tafi_submissions",
} as const

// ─── Users ────────────────────────────────────────────────────────────────────

export function getUsers(): StoredUser[] {
  try {
    return JSON.parse(localStorage.getItem(KEYS.users) ?? "[]")
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
    // Also update currentUser if it's the same person
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
    return JSON.parse(raw) as StoredUser
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
  // Dupe check: same campus + schoolName + visitType + date (date = day of submission)
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
