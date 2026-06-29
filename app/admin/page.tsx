"use client"

import { useState, useEffect, useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard, Users, Database, FileText, LogOut,
  CheckCircle2, XCircle, Building2, BookOpen,
  School, AlertTriangle, Lightbulb, Download, Filter,
  ChevronDown, Bell, X, Menu, Megaphone, Wallet, FolderOpen,
  IndianRupee, Link2, ImageIcon, Crown, TrendingUp,
} from "lucide-react"
import { cardItem, fadeUp, staggerContainer } from "@/lib/motion"
import {
  getUsers,
  updateUserStatus,
  getSubmissions,
  getOutreach,
  updateOutreachStatus,
  getReimbursements,
  updateReimbursementStatus,
  getCampusRollups,
  getPlatformStats,
  getCurrentUser,
  clearCurrentUser,
  type StoredUser,
  type Submission,
  type Outreach,
  type OutreachStatus,
  type Reimbursement,
} from "@/lib/storage"

const ACCENT = { orange: "#FF9933", green: "#138808", blue: "#1d7adb", red: "#e04040", purple: "#6d28d9" }

const OUTREACH_STATUSES: OutreachStatus[] = ["Contacted", "Approval Pending", "Approved", "Scheduled", "Completed", "Declined"]
const visitTypes = ["All", "Outreach", "Visit 1", "Visit 2", "Visit 3", "Final Visit"]

const OUTREACH_BADGE: Record<OutreachStatus, { bg: string; text: string }> = {
  "Contacted":        { bg: "#eff6ff", text: "#1d4ed8" },
  "Approval Pending": { bg: "#fff7ed", text: "#c2410c" },
  "Approved":         { bg: "#ecfdf5", text: "#047857" },
  "Scheduled":        { bg: "#f5f3ff", text: "#6d28d9" },
  "Completed":        { bg: "#f0fdf4", text: "#138808" },
  "Declined":         { bg: "#fef2f2", text: "#dc2626" },
}

const NAV_ITEMS = [
  { key: "dashboard",  label: "Dashboard",      icon: LayoutDashboard },
  { key: "approvals",  label: "User Approvals", icon: Users },
  { key: "data",       label: "Session Data",   icon: Database },
  { key: "outreach",   label: "Outreach",       icon: Megaphone },
  { key: "reimburse",  label: "Reimbursements", icon: Wallet },
  { key: "evidence",   label: "Evidence Vault", icon: FolderOpen },
  { key: "reports",    label: "Reports",        icon: FileText },
]

function fmtDate(iso: string) {
  if (!iso) return "—"
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
}
const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: React.ElementType; color: string }) {
  return (
    <motion.div
      variants={cardItem}
      whileHover={{ y: -4, transition: { type: "spring", stiffness: 350, damping: 20 } }}
      className="bg-white rounded-2xl border border-border p-5 shadow-sm"
    >
      <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: `${color}18` }}>
        <Icon size={18} style={{ color }} />
      </div>
      <p className="text-2xl font-extrabold text-foreground tracking-tight">{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
    </motion.div>
  )
}

// ─── Section: Dashboard ───────────────────────────────────────────────────────

function DashboardSection() {
  const [stats, setStats]     = useState(() => null as ReturnType<typeof getPlatformStats> | null)
  const [rollups, setRollups] = useState<ReturnType<typeof getCampusRollups>>([])

  useEffect(() => {
    setStats(getPlatformStats())
    setRollups(getCampusRollups())
  }, [])

  // Derived, data-driven insights — no hard-coded campus facts.
  const insights = useMemo(() => {
    const out: { text: string; color: string }[] = []
    if (rollups.length) {
      const top = rollups[0]
      if (top.sessions > 0) out.push({ text: `${top.campus} leads with ${top.sessions} session${top.sessions !== 1 ? "s" : ""} reaching ${top.students.toLocaleString()} students.`, color: ACCENT.green })
      const bestRatio = [...rollups].filter((c) => c.sessions > 0).sort((a, b) => (b.students / b.sessions) - (a.students / a.sessions))[0]
      if (bestRatio) out.push({ text: `${bestRatio.campus} has the highest reach per session at ${Math.round(bestRatio.students / bestRatio.sessions)} students.`, color: ACCENT.orange })
      const idle = rollups.filter((c) => c.sessions === 0)
      if (idle.length) out.push({ text: `${idle.length} campus${idle.length !== 1 ? "es" : ""} have volunteers but no logged sessions yet — follow up needed.`, color: ACCENT.red })
      const totalOutreach = rollups.reduce((a, c) => a + c.outreach, 0)
      if (totalOutreach) out.push({ text: `${totalOutreach} schools are in the outreach pipeline across all campuses.`, color: ACCENT.blue })
    }
    if (!out.length) out.push({ text: "No activity recorded yet. Insights appear as volunteers log sessions and outreach.", color: ACCENT.blue })
    return out
  }, [rollups])

  if (!stats) return null

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Students Impacted" value={stats.totalStudents.toLocaleString()} icon={Users}     color={ACCENT.orange} />
        <StatCard label="Total Sessions"          value={stats.totalSessions}                  icon={BookOpen}  color={ACCENT.green} />
        <StatCard label="Active Campuses"         value={stats.activeCampuses}                 icon={Building2} color={ACCENT.blue} />
        <StatCard label="Schools Reached"         value={stats.totalSchools}                   icon={School}    color={ACCENT.red} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Approved Spend"      value={inr(stats.approvedSpend)} icon={Wallet}      color={ACCENT.green} />
        <StatCard label="Pending Spend"       value={inr(stats.pendingSpend)}  icon={IndianRupee} color={ACCENT.orange} />
        <StatCard label="Pending Approvals"   value={stats.pendingApprovals}   icon={Users}       color={ACCENT.purple} />
        <StatCard label="Claims to Review"    value={stats.pendingReimbursements} icon={TrendingUp} color={ACCENT.red} />
      </div>

      {(stats.pendingApprovals > 0 || stats.pendingReimbursements > 0) && (
        <motion.div variants={fadeUp} className="flex items-start gap-3 rounded-xl border p-3.5 text-xs bg-amber-50 border-amber-200 text-amber-800">
          <AlertTriangle size={13} className="mt-0.5 shrink-0" />
          <span>
            {stats.pendingApprovals > 0 && <>{stats.pendingApprovals} user approval{stats.pendingApprovals !== 1 ? "s" : ""} pending. </>}
            {stats.pendingReimbursements > 0 && <>{stats.pendingReimbursements} reimbursement claim{stats.pendingReimbursements !== 1 ? "s" : ""} awaiting review.</>}
          </span>
        </motion.div>
      )}

      <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-bold text-sm text-foreground">Campus Performance</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Live rollup computed from submitted data — {rollups.length} campus{rollups.length !== 1 ? "es" : ""}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                {["Campus", "Sessions", "Students", "Schools", "Outreach", "Volunteers", "Last Activity"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rollups.length === 0 ? (
                <tr><td colSpan={7}>
                  <div className="py-16 flex flex-col items-center gap-2 text-muted-foreground">
                    <Database size={28} className="opacity-30" />
                    <p className="text-sm">No campus activity yet.</p>
                  </div>
                </td></tr>
              ) : rollups.map((c, i) => (
                <tr key={c.campus} className={`transition-colors hover:bg-muted/30 ${i !== rollups.length - 1 ? "border-b border-border" : ""}`}>
                  <td className="px-5 py-3.5 font-semibold text-foreground">{c.campus}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">{c.sessions}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">{c.students.toLocaleString()}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">{c.schools}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">{c.outreach}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">{c.volunteers}</td>
                  <td className="px-5 py-3.5 text-muted-foreground font-mono text-xs whitespace-nowrap">{c.lastActivity ? fmtDate(c.lastActivity) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      <motion.div variants={fadeUp}>
        <h2 className="font-bold text-sm text-foreground mb-3">Insights &amp; Summary</h2>
        <div className="grid md:grid-cols-2 gap-3">
          {insights.map((ins, i) => (
            <motion.div key={i} variants={cardItem} className="bg-white border border-border rounded-xl p-4 flex gap-3 items-start shadow-sm hover:shadow-md transition-shadow">
              <span className="mt-0.5 shrink-0 w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${ins.color}15` }}>
                <Lightbulb size={13} style={{ color: ins.color }} />
              </span>
              <p className="text-xs text-muted-foreground leading-relaxed">{ins.text}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Section: Approvals ───────────────────────────────────────────────────────

function ApprovalsSection({ onChange }: { onChange: () => void }) {
  const [users, setUsers] = useState<StoredUser[]>([])
  const [toasts, setToasts] = useState<{ id: number; msg: string; type: "ok" | "reject" }[]>([])

  useEffect(() => { setUsers(getUsers().filter((u) => u.status === "pending")) }, [])

  const act = (id: string, approve: boolean) => {
    const user = users.find((u) => u.id === id)
    if (!user) return
    updateUserStatus(id, approve ? "approved" : "rejected")
    setUsers((prev) => prev.filter((u) => u.id !== id))
    onChange()
    const toast = { id: Date.now(), msg: approve ? `${user.fullName} approved.` : `${user.fullName} rejected.`, type: (approve ? "ok" : "reject") as "ok" | "reject" }
    setToasts((t) => [...t, toast])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== toast.id)), 3500)
  }

  return (
    <div className="space-y-6">
      <div className="fixed top-5 right-5 z-50 space-y-2">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div key={t.id} initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 60 }}
              className={`flex items-center gap-2 text-sm font-medium text-white px-4 py-2.5 rounded-xl shadow-lg ${t.type === "ok" ? "bg-[#138808]" : "bg-[#e04040]"}`}>
              {t.type === "ok" ? <CheckCircle2 size={14} /> : <XCircle size={14} />} {t.msg}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div>
        <h2 className="font-bold text-sm text-foreground">Pending User Approvals</h2>
        <p className="text-xs text-muted-foreground mt-0.5">{users.length} user{users.length !== 1 ? "s" : ""} awaiting review</p>
      </div>

      {users.length === 0 ? (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="bg-white border border-border rounded-2xl p-12 flex flex-col items-center gap-3 text-center shadow-sm">
          <CheckCircle2 size={36} className="text-[#138808]" />
          <p className="font-semibold text-foreground">All caught up!</p>
          <p className="text-xs text-muted-foreground">No pending approvals at this time.</p>
        </motion.div>
      ) : (
        <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  {["Full Name", "Role", "NIAT ID", "Campus", "Email", "Signed Up", "Actions"].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {users.map((u, i) => (
                    <motion.tr key={u.id} initial={{ opacity: 1 }} exit={{ opacity: 0, height: 0, overflow: "hidden" }} transition={{ duration: 0.25 }}
                      className={`transition-colors hover:bg-muted/30 ${i !== users.length - 1 ? "border-b border-border" : ""}`}>
                      <td className="px-5 py-3.5 font-semibold text-foreground">{u.fullName}</td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full" style={u.role === "campus_lead" ? { background: "#f5f3ff", color: ACCENT.purple } : { background: "#13880818", color: ACCENT.green }}>
                          {u.role === "campus_lead" ? <><Crown size={10} /> Lead</> : "Volunteer"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-muted-foreground font-mono text-xs">{u.niatId}</td>
                      <td className="px-5 py-3.5"><span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">{u.campus}</span></td>
                      <td className="px-5 py-3.5 text-muted-foreground text-xs">{u.email}</td>
                      <td className="px-5 py-3.5 text-muted-foreground text-xs whitespace-nowrap">{fmtDate(u.createdAt)}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex gap-2">
                          <button onClick={() => act(u.id, true)} className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg text-white transition-opacity hover:opacity-90" style={{ backgroundColor: ACCENT.green }}>
                            <CheckCircle2 size={12} /> Approve
                          </button>
                          <button onClick={() => act(u.id, false)} className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors">
                            <XCircle size={12} /> Reject
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      )}

      <AllUsersTable />
    </div>
  )
}

function AllUsersTable() {
  const [allUsers, setAllUsers] = useState<StoredUser[]>([])
  useEffect(() => { setAllUsers(getUsers()) }, [])
  if (allUsers.length === 0) return null

  const statusBadge = (s: StoredUser["status"]) => {
    if (s === "approved") return { bg: "rgba(19,136,8,0.1)", text: "#138808", label: "Approved" }
    if (s === "rejected") return { bg: "rgba(220,38,38,0.1)", text: "#dc2626", label: "Rejected" }
    return { bg: "rgba(255,153,51,0.12)", text: "#d47000", label: "Pending" }
  }

  return (
    <div>
      <h3 className="font-bold text-sm text-foreground mb-3">All Registered Users ({allUsers.length})</h3>
      <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                {["Name", "Role", "Campus", "Email", "Status"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allUsers.map((u, i) => {
                const badge = statusBadge(u.status)
                return (
                  <tr key={u.id} className={`transition-colors hover:bg-muted/30 ${i !== allUsers.length - 1 ? "border-b border-border" : ""}`}>
                    <td className="px-5 py-3 font-medium text-foreground">{u.fullName}</td>
                    <td className="px-5 py-3 text-muted-foreground text-xs capitalize">{u.role.replace("_", " ")}</td>
                    <td className="px-5 py-3 text-muted-foreground">{u.campus}</td>
                    <td className="px-5 py-3 text-muted-foreground text-xs">{u.email}</td>
                    <td className="px-5 py-3"><span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: badge.bg, color: badge.text }}>{badge.label}</span></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ─── Section: Session Data ────────────────────────────────────────────────────

function DataSection() {
  const [campusFilter, setCampusFilter] = useState("All")
  const [visitFilter, setVisitFilter]   = useState("All")
  const [allSubs, setAllSubs]           = useState<Submission[]>([])

  useEffect(() => { setAllSubs(getSubmissions()) }, [])

  const campusNames = ["All", ...Array.from(new Set(allSubs.map((s) => s.campus)))]
  const filtered = allSubs.filter(
    (s) => (campusFilter === "All" || s.campus === campusFilter) && (visitFilter === "All" || s.visitType === visitFilter)
  )

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-bold text-sm text-foreground">Submitted Session Data</h2>
        <p className="text-xs text-muted-foreground mt-0.5">{filtered.length} record{filtered.length !== 1 ? "s" : ""} found</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium"><Filter size={13} /> Filter:</div>
        {[
          { value: campusFilter, onChange: setCampusFilter, options: campusNames },
          { value: visitFilter,  onChange: setVisitFilter,  options: visitTypes },
        ].map((f, i) => (
          <div key={i} className="relative">
            <select value={f.value} onChange={(e) => f.onChange(e.target.value)}
              className="appearance-none bg-white border border-border rounded-lg px-3 py-1.5 pr-7 text-xs font-medium text-foreground cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring">
              {f.options.map((c) => <option key={c}>{c}</option>)}
            </select>
            <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                {["Campus", "School Name", "Visit Type", "Students", "Topic", "Evidence", "Date"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7}>
                  <div className="py-16 flex flex-col items-center gap-2 text-muted-foreground">
                    <Database size={28} className="opacity-30" />
                    <p className="text-sm">{allSubs.length === 0 ? "No session data yet. Volunteers log sessions from their dashboard." : "No records match the selected filters."}</p>
                  </div>
                </td></tr>
              ) : filtered.map((row, i) => (
                <tr key={row.id} className={`transition-colors hover:bg-muted/30 ${i !== filtered.length - 1 ? "border-b border-border" : ""}`}>
                  <td className="px-5 py-3.5 font-semibold text-foreground whitespace-nowrap">{row.campus}</td>
                  <td className="px-5 py-3.5 text-muted-foreground max-w-[160px] truncate">{row.schoolName}</td>
                  <td className="px-5 py-3.5 whitespace-nowrap"><span className="text-xs font-medium px-2.5 py-1 rounded-full bg-orange-50 text-orange-700">{row.visitType}</span></td>
                  <td className="px-5 py-3.5 text-muted-foreground font-semibold">{row.studentsCount}</td>
                  <td className="px-5 py-3.5 text-muted-foreground max-w-[180px] truncate">{row.topicCovered}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex gap-2">
                      {row.approvalLink ? <a href={row.approvalLink} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground" title="Approval doc"><Link2 size={14} /></a> : <span className="text-muted-foreground/30"><Link2 size={14} /></span>}
                      {row.mediaLink ? <a href={row.mediaLink} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground" title="Media"><ImageIcon size={14} /></a> : <span className="text-muted-foreground/30"><ImageIcon size={14} /></span>}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground font-mono text-xs whitespace-nowrap">{fmtDate(row.submittedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ─── Section: Outreach ────────────────────────────────────────────────────────

function OutreachSection() {
  const [items, setItems] = useState<Outreach[]>([])
  const [statusFilter, setStatusFilter] = useState("All")

  useEffect(() => { setItems(getOutreach()) }, [])

  const setStatus = (id: string, status: OutreachStatus) => {
    updateOutreachStatus(id, status)
    setItems(getOutreach())
  }

  const filtered = items.filter((o) => statusFilter === "All" || o.status === statusFilter)
  const counts = OUTREACH_STATUSES.map((s) => ({ s, n: items.filter((o) => o.status === s).length }))

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-bold text-sm text-foreground">Outreach Pipeline</h2>
        <p className="text-xs text-muted-foreground mt-0.5">{items.length} school{items.length !== 1 ? "s" : ""} across all campuses</p>
      </div>

      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {counts.map(({ s, n }) => {
          const b = OUTREACH_BADGE[s]
          return (
            <div key={s} className="bg-white rounded-xl border border-border p-3 shadow-sm text-center">
              <p className="text-xl font-extrabold" style={{ color: b.text }}>{n}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{s}</p>
            </div>
          )
        })}
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium"><Filter size={13} /> Filter:</div>
        <div className="relative">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="appearance-none bg-white border border-border rounded-lg px-3 py-1.5 pr-7 text-xs font-medium text-foreground cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring">
            {["All", ...OUTREACH_STATUSES].map((c) => <option key={c}>{c}</option>)}
          </select>
          <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                {["Campus", "School", "Contact", "District", "Expected", "Stage", "Update"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7}>
                  <div className="py-16 flex flex-col items-center gap-2 text-muted-foreground">
                    <Megaphone size={28} className="opacity-30" />
                    <p className="text-sm">{items.length === 0 ? "No outreach logged yet." : "No schools match this stage."}</p>
                  </div>
                </td></tr>
              ) : filtered.map((o, i) => {
                const b = OUTREACH_BADGE[o.status]
                return (
                  <tr key={o.id} className={`transition-colors hover:bg-muted/30 ${i !== filtered.length - 1 ? "border-b border-border" : ""}`}>
                    <td className="px-5 py-3.5 font-semibold text-foreground whitespace-nowrap">{o.campus}</td>
                    <td className="px-5 py-3.5 text-foreground max-w-[150px] truncate">{o.schoolName}</td>
                    <td className="px-5 py-3.5 text-muted-foreground text-xs">{o.contactName}{o.contactPhone ? <><br /><span className="font-mono">{o.contactPhone}</span></> : ""}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{o.district}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{o.expectedStudents || "—"}</td>
                    <td className="px-5 py-3.5"><span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: b.bg, color: b.text }}>{o.status}</span></td>
                    <td className="px-5 py-3.5">
                      <div className="relative">
                        <select value={o.status} onChange={(e) => setStatus(o.id, e.target.value as OutreachStatus)}
                          className="appearance-none bg-white border border-border rounded-lg px-2.5 py-1.5 pr-6 text-xs font-medium text-foreground cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring">
                          {OUTREACH_STATUSES.map((s) => <option key={s}>{s}</option>)}
                        </select>
                        <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ─── Section: Reimbursements ──────────────────────────────────────────────────

function ReimburseSection({ onChange }: { onChange: () => void }) {
  const [items, setItems] = useState<Reimbursement[]>([])
  const [statusFilter, setStatusFilter] = useState("All")

  useEffect(() => { setItems(getReimbursements()) }, [])

  const refresh = () => { setItems(getReimbursements()); onChange() }
  const setStatus = (id: string, status: Reimbursement["status"]) => {
    updateReimbursementStatus(id, status)
    refresh()
  }

  const totals = {
    approved: items.filter((r) => r.status === "approved" || r.status === "paid").reduce((a, r) => a + r.amount, 0),
    pending:  items.filter((r) => r.status === "pending").reduce((a, r) => a + r.amount, 0),
    paid:     items.filter((r) => r.status === "paid").reduce((a, r) => a + r.amount, 0),
  }
  const filtered = items.filter((r) => statusFilter === "All" || r.status === statusFilter)

  const badge: Record<Reimbursement["status"], { bg: string; text: string; label: string }> = {
    pending:  { bg: "#fff7ed", text: "#c2410c", label: "Pending" },
    approved: { bg: "#ecfdf5", text: "#047857", label: "Approved" },
    rejected: { bg: "#fef2f2", text: "#dc2626", label: "Rejected" },
    paid:     { bg: "#f0fdf4", text: "#138808", label: "Paid" },
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-bold text-sm text-foreground">Reimbursements</h2>
        <p className="text-xs text-muted-foreground mt-0.5">{items.length} claim{items.length !== 1 ? "s" : ""} · every rupee traceable</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Approved Spend" value={inr(totals.approved)} icon={Wallet} color={ACCENT.green} />
        <StatCard label="Pending Spend" value={inr(totals.pending)} icon={IndianRupee} color={ACCENT.orange} />
        <StatCard label="Paid Out" value={inr(totals.paid)} icon={CheckCircle2} color={ACCENT.blue} />
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium"><Filter size={13} /> Filter:</div>
        <div className="relative">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="appearance-none bg-white border border-border rounded-lg px-3 py-1.5 pr-7 text-xs font-medium text-foreground cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring">
            {["All", "pending", "approved", "rejected", "paid"].map((c) => <option key={c} className="capitalize">{c}</option>)}
          </select>
          <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                {["Claimant", "Campus", "Category", "Description", "Amount", "Receipt", "Status", "Action"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8}>
                  <div className="py-16 flex flex-col items-center gap-2 text-muted-foreground">
                    <Wallet size={28} className="opacity-30" />
                    <p className="text-sm">{items.length === 0 ? "No reimbursement claims yet." : "No claims match this filter."}</p>
                  </div>
                </td></tr>
              ) : filtered.map((r, i) => {
                const b = badge[r.status]
                return (
                  <tr key={r.id} className={`transition-colors hover:bg-muted/30 ${i !== filtered.length - 1 ? "border-b border-border" : ""}`}>
                    <td className="px-5 py-3.5 font-medium text-foreground whitespace-nowrap">{r.userName}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{r.campus}</td>
                    <td className="px-5 py-3.5 text-muted-foreground text-xs">{r.category}</td>
                    <td className="px-5 py-3.5 text-muted-foreground max-w-[180px] truncate">{r.description}</td>
                    <td className="px-5 py-3.5 font-bold text-foreground whitespace-nowrap">{inr(r.amount)}</td>
                    <td className="px-5 py-3.5">
                      {r.receiptLink ? <a href={r.receiptLink} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground"><Link2 size={14} /></a> : <span className="text-muted-foreground/30"><Link2 size={14} /></span>}
                    </td>
                    <td className="px-5 py-3.5"><span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: b.bg, color: b.text }}>{b.label}</span></td>
                    <td className="px-5 py-3.5">
                      <div className="flex gap-1.5">
                        {r.status === "pending" && (
                          <>
                            <button onClick={() => setStatus(r.id, "approved")} className="text-xs font-semibold px-2.5 py-1 rounded-lg text-white hover:opacity-90" style={{ backgroundColor: ACCENT.green }}>Approve</button>
                            <button onClick={() => setStatus(r.id, "rejected")} className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-border text-muted-foreground hover:bg-red-50 hover:text-red-600">Reject</button>
                          </>
                        )}
                        {r.status === "approved" && (
                          <button onClick={() => setStatus(r.id, "paid")} className="text-xs font-semibold px-2.5 py-1 rounded-lg text-white hover:opacity-90" style={{ backgroundColor: ACCENT.blue }}>Mark Paid</button>
                        )}
                        {(r.status === "rejected" || r.status === "paid") && <span className="text-xs text-muted-foreground">—</span>}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ─── Section: Evidence Vault ──────────────────────────────────────────────────

function EvidenceSection() {
  const [subs, setSubs] = useState<Submission[]>([])
  useEffect(() => { setSubs(getSubmissions()) }, [])

  const withEvidence = subs.filter((s) => s.approvalLink || s.mediaLink)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-bold text-sm text-foreground">Evidence Vault</h2>
        <p className="text-xs text-muted-foreground mt-0.5">{withEvidence.length} of {subs.length} sessions have attached evidence</p>
      </div>

      {withEvidence.length === 0 ? (
        <div className="bg-white border border-border rounded-2xl p-12 flex flex-col items-center gap-3 text-center shadow-sm">
          <FolderOpen size={32} className="text-muted-foreground opacity-30" />
          <p className="font-semibold text-foreground">No evidence yet</p>
          <p className="text-xs text-muted-foreground">Approval documents and session media appear here as sessions are logged.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {[...withEvidence].reverse().map((s) => (
            <div key={s.id} className="bg-white rounded-2xl border border-border shadow-sm p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-foreground truncate">{s.schoolName}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{s.campus} · {s.visitType} · {fmtDate(s.submittedAt)}</p>
                </div>
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-orange-50 text-orange-700 shrink-0">{s.studentsCount} students</span>
              </div>
              <div className="flex gap-2 mt-4">
                {s.approvalLink && (
                  <a href={s.approvalLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-border text-foreground hover:bg-muted/50 transition-colors">
                    <Link2 size={13} /> Approval Doc
                  </a>
                )}
                {s.mediaLink && (
                  <a href={s.mediaLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-border text-foreground hover:bg-muted/50 transition-colors">
                    <ImageIcon size={13} /> Photos & Videos
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Section: Reports ─────────────────────────────────────────────────────────

function ReportsSection() {
  const [report, setReport] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)

  const generate = (type: "weekly" | "monthly") => {
    setGenerating(true)
    setReport(null)
    const subs    = getSubmissions()
    const out     = getOutreach()
    const reimb   = getReimbursements()
    const users   = getUsers().filter((u) => u.role !== "admin")
    const rollups = getCampusRollups()
    const stats   = getPlatformStats()
    const top = rollups[0]

    setTimeout(() => {
      setGenerating(false)
      const header = type === "weekly"
        ? `Weekly Report — Week of ${fmtDate(new Date().toISOString())}`
        : `Monthly Report — ${new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" })}`
      setReport(
`${header}

OPERATIONS
• ${stats.totalSessions} sessions logged across ${stats.activeCampuses} active campus(es)
• ${stats.totalStudents.toLocaleString()} students impacted at ${stats.totalSchools} schools
• ${out.length} schools in the outreach pipeline (${out.filter((o) => o.status === "Scheduled").length} scheduled, ${out.filter((o) => o.status === "Completed").length} completed)

TEAM
• ${users.length} registered team members (${users.filter((u) => u.role === "campus_lead").length} campus leads)
• ${users.filter((u) => u.status === "approved").length} approved · ${stats.pendingApprovals} pending approval

FINANCE
• Approved spend: ${inr(stats.approvedSpend)}
• Pending claims awaiting review: ${reimb.filter((r) => r.status === "pending").length} (${inr(stats.pendingSpend)})

HIGHLIGHTS
${top && top.sessions > 0 ? `• ${top.campus} leads with ${top.sessions} sessions and ${top.students.toLocaleString()} students.` : "• No campus activity recorded yet."}
${rollups.filter((c) => c.sessions === 0).length ? `• Follow-up needed: ${rollups.filter((c) => c.sessions === 0).map((c) => c.campus).join(", ")} have no logged sessions.` : "• All campuses with volunteers are actively logging sessions."}`
      )
    }, 700)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-bold text-sm text-foreground">Generate Report</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Auto-generated from live platform data</p>
      </div>
      <div className="flex gap-3">
        {(["weekly", "monthly"] as const).map((type) => (
          <button key={type} onClick={() => generate(type)} disabled={generating}
            className="flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl border text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: type === "weekly" ? ACCENT.orange : ACCENT.green }}>
            <Download size={14} /> {type === "weekly" ? "Weekly Report" : "Monthly Report"}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {generating && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="bg-white border border-border rounded-2xl p-8 flex items-center gap-3 shadow-sm">
            <div className="w-4 h-4 rounded-full border-2 border-[#FF9933] border-t-transparent animate-spin" />
            <span className="text-sm text-muted-foreground">Generating report...</span>
          </motion.div>
        )}
        {report && !generating && (
          <motion.div key="report" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="bg-white border border-border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <FileText size={15} className="text-[#FF9933]" />
              <h3 className="font-bold text-sm text-foreground">Generated Report</h3>
            </div>
            <pre className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap font-sans">{report}</pre>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Main Admin Page ──────────────────────────────────────────────────────────

export default function AdminPage() {
  const router = useRouter()
  const [authChecked, setAuthChecked]     = useState(false)
  const [adminName, setAdminName]         = useState("admin@teachaiforindia.org")
  const [activeSection, setActiveSection] = useState("dashboard")
  const [sidebarOpen, setSidebarOpen]     = useState(false)
  const [pendingCount, setPendingCount]   = useState(0)
  const [reimburseCount, setReimburseCount] = useState(0)

  const recountBadges = () => {
    setPendingCount(getUsers().filter((u) => u.status === "pending").length)
    setReimburseCount(getReimbursements().filter((r) => r.status === "pending").length)
  }

  useEffect(() => {
    const cur = getCurrentUser()
    if (cur?.role !== "admin") { router.replace("/admin-login"); return }
    setAdminName(cur.email)
    setAuthChecked(true)
    recountBadges()
  }, [router])

  useEffect(() => { if (authChecked) recountBadges() }, [activeSection, authChecked])

  function handleLogout() {
    clearCurrentUser()
    router.push("/admin-login")
  }

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f7f8]">
        <span className="w-8 h-8 rounded-full border-2 border-muted border-t-foreground animate-spin" />
      </div>
    )
  }

  const sectionComponents: Record<string, React.ReactNode> = {
    dashboard: <DashboardSection />,
    approvals: <ApprovalsSection onChange={recountBadges} />,
    data:      <DataSection />,
    outreach:  <OutreachSection />,
    reimburse: <ReimburseSection onChange={recountBadges} />,
    evidence:  <EvidenceSection />,
    reports:   <ReportsSection />,
  }

  const badgeFor = (key: string) =>
    key === "approvals" ? pendingCount : key === "reimburse" ? reimburseCount : 0

  return (
    <div className="min-h-screen bg-[#f7f7f8] flex">
      {sidebarOpen && <div className="fixed inset-0 bg-black/30 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-60 bg-white border-r border-border z-40 flex flex-col transition-transform duration-300 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:static md:z-auto`}>
        <div className="px-5 py-5 border-b border-border flex items-center justify-between">
          <Link href="/">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Teach_Ai_1_page-0001-removebg-preview-ZJzf3R1J38t7BLntCYEUuQMl2LbJdV.png"
              alt="Teach AI For India" width={130} height={40}
              className="object-contain" style={{ width: "auto", height: "36px" }}
            />
          </Link>
          <button className="md:hidden text-muted-foreground" onClick={() => setSidebarOpen(false)}><X size={18} /></button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const active = activeSection === item.key
            const badge = badgeFor(item.key)
            return (
              <button key={item.key} onClick={() => { setActiveSection(item.key); setSidebarOpen(false) }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${active ? "bg-[#FF9933] text-white shadow-sm" : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"}`}>
                <Icon size={16} /> {item.label}
                {badge > 0 && (
                  <span className={`ml-auto text-xs font-bold px-1.5 py-0.5 rounded-full ${active ? "bg-white/25 text-white" : "bg-red-100 text-red-600"}`}>{badge}</span>
                )}
              </button>
            )
          })}
        </nav>

        <div className="px-3 pb-5 space-y-1">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-colors">
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-border px-5 py-3.5 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button className="md:hidden text-muted-foreground hover:text-foreground transition-colors" onClick={() => setSidebarOpen(true)}><Menu size={20} /></button>
            <div>
              <h1 className="font-bold text-sm text-foreground">Admin Panel</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">Outreach · sessions · finance · evidence · analytics</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative text-muted-foreground hover:text-foreground transition-colors">
              <Bell size={17} />
              {(pendingCount + reimburseCount) > 0 && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-500 text-white text-[8px] flex items-center justify-center font-bold">{pendingCount + reimburseCount}</span>
              )}
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#FF9933]/20 flex items-center justify-center text-xs font-bold text-[#FF9933]">A</div>
              <div className="hidden sm:block text-right">
                <p className="text-xs font-semibold text-foreground">{adminName}</p>
                <p className="text-[10px] text-muted-foreground">Administrator</p>
              </div>
            </div>
            <span className="hidden sm:block text-xs font-bold px-2.5 py-1 rounded-full text-white" style={{ backgroundColor: ACCENT.green }}>Admin</span>
          </div>
        </header>

        <main className="flex-1 px-5 py-7 max-w-5xl w-full mx-auto">
          <AnimatePresence mode="wait">
            <motion.div key={activeSection} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25, ease: "easeOut" }}>
              {sectionComponents[activeSection]}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
