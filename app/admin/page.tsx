"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard, Users, Database, FileText, LogOut,
  CheckCircle2, XCircle, Building2, BookOpen, TrendingUp,
  School, AlertTriangle, Lightbulb, Download, Filter,
  ChevronDown, Bell, X, Menu,
} from "lucide-react"
import { cardItem, fadeUp, staggerContainer } from "@/lib/motion"

// ─── Mock Data ───────────────────────────────────────────────────────────────

const pendingUsers = [
  { id: 1, name: "Riya Sharma", niatId: "NIAT-2024-001", campus: "MRV", email: "riya.sharma@niat.edu" },
  { id: 2, name: "Arjun Reddy", niatId: "NIAT-2024-002", campus: "CDU", email: "arjun.reddy@niat.edu" },
  { id: 3, name: "Priya Lakshmi", niatId: "NIAT-2024-003", campus: "NSRIT", email: "priya.lakshmi@niat.edu" },
  { id: 4, name: "Karan Mehta", niatId: "NIAT-2024-004", campus: "Aurora", email: "karan.mehta@niat.edu" },
  { id: 5, name: "Sneha Patel", niatId: "NIAT-2024-005", campus: "NRI", email: "sneha.patel@niat.edu" },
]

const campusData = [
  { name: "KKH",          sessions: 6,  students: 240, status: "Active" },
  { name: "CDU",          sessions: 5,  students: 200, status: "Active" },
  { name: "NSRIT",        sessions: 7,  students: 280, status: "Ongoing" },
  { name: "NRI",          sessions: 4,  students: 160, status: "Ongoing" },
  { name: "CIET",         sessions: 3,  students: 120, status: "Active" },
  { name: "Chevella",     sessions: 8,  students: 320, status: "Active" },
  { name: "Aurora",       sessions: 5,  students: 200, status: "Ongoing" },
  { name: "Annamacharya", sessions: 4,  students: 160, status: "Active" },
  { name: "MRV",          sessions: 9,  students: 360, status: "Active" },
]

const sessionData = [
  { campus: "MRV",          school: "ZP High School Miyapur",     visit: "First Visit",  students: 65,  topic: "Intro to AI",         date: "2024-04-28" },
  { campus: "Chevella",     school: "MPPS Chevella Central",       visit: "Second Visit", students: 72,  topic: "Prompt Writing",      date: "2024-04-27" },
  { campus: "CDU",          school: "ZP High School Dundigal",     visit: "First Visit",  students: 58,  topic: "AI Awareness",        date: "2024-04-26" },
  { campus: "NSRIT",        school: "MPPS Bheemunipatnam",         visit: "Third Visit",  students: 80,  topic: "AI for Education",    date: "2024-04-25" },
  { campus: "KKH",          school: "ZP High School Kandukur",     visit: "First Visit",  students: 45,  topic: "Intro to AI",         date: "2024-04-24" },
  { campus: "NRI",          school: "MPPS Agiripalli",             visit: "Second Visit", students: 60,  topic: "Hands-on Learning",   date: "2024-04-23" },
  { campus: "Aurora",       school: "ZP High School Bhongir",      visit: "First Visit",  students: 52,  topic: "AI Awareness",        date: "2024-04-22" },
  { campus: "CIET",         school: "MPPS Warangal South",         visit: "Second Visit", students: 48,  topic: "Ethical AI",          date: "2024-04-21" },
  { campus: "Annamacharya", school: "ZP High School Rajampet",     visit: "Third Visit",  students: 70,  topic: "AI for Education",    date: "2024-04-20" },
  { campus: "MRV",          school: "MPPS Miyapur West",           visit: "Second Visit", students: 63,  topic: "Prompt Writing",      date: "2024-04-19" },
  { campus: "Chevella",     school: "ZP High School Shankarpally", visit: "First Visit",  students: 55,  topic: "Intro to AI",         date: "2024-04-18" },
  { campus: "CDU",          school: "MPPS Patancheru",             visit: "Second Visit", students: 67,  topic: "Hands-on Learning",   date: "2024-04-17" },
]

const insights = [
  { text: "MRV campus conducted 9 sessions this month impacting 360+ students — highest performer overall.", color: "#138808" },
  { text: "Chevella shows highest engagement this week with 72 students per session on average.", color: "#FF9933" },
  { text: "CDU has pending session updates — last submission was 3 days ago.", color: "#e04040" },
  { text: "CIET and NRI are growing steadily with consistent bi-weekly school visits.", color: "#1d7adb" },
  { text: "Across all campuses, 'Intro to AI' remains the most popular topic this month.", color: "#138808" },
]

const alerts = [
  { text: "KKH campus has not submitted session data in the last 4 days.", level: "warning" },
  { text: "3 user approvals are pending review.", level: "warning" },
  { text: "CDU submitted data successfully for April 17–24.", level: "info" },
  { text: "Monthly report is due in 3 days.", level: "warning" },
]

const NAV_ITEMS = [
  { key: "dashboard",  label: "Dashboard",      icon: LayoutDashboard },
  { key: "approvals",  label: "User Approvals", icon: Users },
  { key: "data",       label: "Session Data",   icon: Database },
  { key: "reports",    label: "Reports",        icon: FileText },
]

const visitTypes = ["All", "First Visit", "Second Visit", "Third Visit"]
const campusNames = ["All", ...campusData.map((c) => c.name)]

// ─── Helpers ─────────────────────────────────────────────────────────────────

const statusStyle: Record<string, { bg: string; text: string }> = {
  Active:  { bg: "rgba(19,136,8,0.1)",   text: "#138808" },
  Ongoing: { bg: "rgba(255,153,51,0.12)", text: "#d47000" },
}

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
  const total = campusData.reduce((s, c) => s + c.students, 0)
  const sessions = campusData.reduce((s, c) => s + c.sessions, 0)
  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Students Impacted" value={total.toLocaleString()} icon={Users}       color="#FF9933" />
        <StatCard label="Total Sessions"           value={sessions}              icon={BookOpen}    color="#138808" />
        <StatCard label="Active Campuses"          value={campusData.filter(c => c.status === "Active").length} icon={Building2} color="#1d7adb" />
        <StatCard label="Schools Covered"          value="41"                    icon={School}      color="#e04040" />
      </div>

      {/* Campus performance */}
      <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-bold text-sm text-foreground">Campus Performance</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Live view of all 9 campuses</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                {["Campus", "Sessions", "Students Impacted", "Status"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {campusData.map((c, i) => {
                const s = statusStyle[c.status]
                return (
                  <tr
                    key={c.name}
                    className={`transition-colors hover:bg-muted/30 ${i !== campusData.length - 1 ? "border-b border-border" : ""}`}
                  >
                    <td className="px-5 py-3.5 font-semibold text-foreground">{c.name}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{c.sessions}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{c.students.toLocaleString()}</td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: s.bg, color: s.text }}>
                        {c.status}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Insights */}
      <motion.div variants={fadeUp}>
        <h2 className="font-bold text-sm text-foreground mb-3">Insights &amp; Summary</h2>
        <div className="grid md:grid-cols-2 gap-3">
          {insights.map((ins, i) => (
            <motion.div
              key={i}
              variants={cardItem}
              className="bg-white border border-border rounded-xl p-4 flex gap-3 items-start shadow-sm hover:shadow-md transition-shadow"
            >
              <span className="mt-0.5 shrink-0 w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${ins.color}15` }}>
                <Lightbulb size={13} style={{ color: ins.color }} />
              </span>
              <p className="text-xs text-muted-foreground leading-relaxed">{ins.text}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Alerts */}
      <motion.div variants={fadeUp}>
        <h2 className="font-bold text-sm text-foreground mb-3">Alerts</h2>
        <div className="space-y-2">
          {alerts.map((a, i) => (
            <div key={i} className={`flex items-start gap-3 rounded-xl border p-3.5 text-xs ${
              a.level === "warning"
                ? "bg-amber-50 border-amber-200 text-amber-800"
                : "bg-blue-50 border-blue-200 text-blue-800"
            }`}>
              <AlertTriangle size={13} className="mt-0.5 shrink-0" />
              {a.text}
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Section: Approvals ───────────────────────────────────────────────────────

function ApprovalsSection() {
  const [users, setUsers] = useState(pendingUsers)
  const [toasts, setToasts] = useState<{ id: number; msg: string; type: "ok" | "reject" }[]>([])

  const act = (id: number, approve: boolean) => {
    const user = users.find((u) => u.id === id)!
    setUsers((prev) => prev.filter((u) => u.id !== id))
    const toast = { id: Date.now(), msg: approve ? `${user.name} approved successfully.` : `${user.name} was rejected.`, type: (approve ? "ok" : "reject") as "ok" | "reject" }
    setToasts((t) => [...t, toast])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== toast.id)), 3500)
  }

  return (
    <div className="space-y-6">
      {/* Toasts */}
      <div className="fixed top-5 right-5 z-50 space-y-2">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 60 }}
              className={`flex items-center gap-2 text-sm font-medium text-white px-4 py-2.5 rounded-xl shadow-lg ${t.type === "ok" ? "bg-[#138808]" : "bg-[#e04040]"}`}
            >
              {t.type === "ok" ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
              {t.msg}
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
                  {["Full Name", "NIAT ID", "Campus", "Email", "Actions"].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {users.map((u, i) => (
                    <motion.tr
                      key={u.id}
                      initial={{ opacity: 1 }}
                      exit={{ opacity: 0, height: 0, overflow: "hidden" }}
                      transition={{ duration: 0.25 }}
                      className={`transition-colors hover:bg-muted/30 ${i !== users.length - 1 ? "border-b border-border" : ""}`}
                    >
                      <td className="px-5 py-3.5 font-semibold text-foreground">{u.name}</td>
                      <td className="px-5 py-3.5 text-muted-foreground font-mono text-xs">{u.niatId}</td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">{u.campus}</span>
                      </td>
                      <td className="px-5 py-3.5 text-muted-foreground text-xs">{u.email}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex gap-2">
                          <button
                            onClick={() => act(u.id, true)}
                            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg text-white transition-opacity hover:opacity-90"
                            style={{ backgroundColor: "#138808" }}
                          >
                            <CheckCircle2 size={12} /> Approve
                          </button>
                          <button
                            onClick={() => act(u.id, false)}
                            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
                          >
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
    </div>
  )
}

// ─── Section: Session Data ────────────────────────────────────────────────────

function DataSection() {
  const [campusFilter, setCampusFilter] = useState("All")
  const [visitFilter, setVisitFilter] = useState("All")

  const filtered = sessionData.filter(
    (s) => (campusFilter === "All" || s.campus === campusFilter) && (visitFilter === "All" || s.visit === visitFilter)
  )

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-bold text-sm text-foreground">Submitted Session Data</h2>
        <p className="text-xs text-muted-foreground mt-0.5">{filtered.length} records found</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
          <Filter size={13} /> Filter:
        </div>
        <div className="relative">
          <select
            value={campusFilter}
            onChange={(e) => setCampusFilter(e.target.value)}
            className="appearance-none bg-white border border-border rounded-lg px-3 py-1.5 pr-7 text-xs font-medium text-foreground cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {campusNames.map((c) => <option key={c}>{c}</option>)}
          </select>
          <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        </div>
        <div className="relative">
          <select
            value={visitFilter}
            onChange={(e) => setVisitFilter(e.target.value)}
            className="appearance-none bg-white border border-border rounded-lg px-3 py-1.5 pr-7 text-xs font-medium text-foreground cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {visitTypes.map((v) => <option key={v}>{v}</option>)}
          </select>
          <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                {["Campus", "School Name", "Visit Type", "Students", "Topic Covered", "Date"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="wait">
                {filtered.map((row, i) => (
                  <motion.tr
                    key={`${row.campus}-${row.school}-${i}`}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: i * 0.03, duration: 0.2 }}
                    className={`transition-colors hover:bg-muted/30 ${i !== filtered.length - 1 ? "border-b border-border" : ""}`}
                  >
                    <td className="px-5 py-3.5 font-semibold text-foreground whitespace-nowrap">{row.campus}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{row.school}</td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{
                        background: row.visit === "First Visit" ? "rgba(29,122,219,0.1)" : row.visit === "Second Visit" ? "rgba(255,153,51,0.1)" : "rgba(19,136,8,0.1)",
                        color: row.visit === "First Visit" ? "#1d7adb" : row.visit === "Second Visit" ? "#d47000" : "#138808",
                      }}>
                        {row.visit}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground font-semibold">{row.students}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{row.topic}</td>
                    <td className="px-5 py-3.5 text-muted-foreground font-mono text-xs whitespace-nowrap">{row.date}</td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-16 flex flex-col items-center gap-2 text-muted-foreground">
              <Database size={28} className="opacity-30" />
              <p className="text-sm">No records match the selected filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Section: Reports ────────────────────────────────────────────────────────

function ReportsSection() {
  const [report, setReport] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)

  const generate = (type: "weekly" | "monthly") => {
    setGenerating(true)
    setReport(null)
    setTimeout(() => {
      setGenerating(false)
      const totalStudents = campusData.reduce((s, c) => s + c.students, 0)
      const totalSessions = campusData.reduce((s, c) => s + c.sessions, 0)
      setReport(
        type === "weekly"
          ? `Weekly Report — Week of April 22–28, 2024\n\n${totalSessions} total sessions were conducted across ${campusData.length} campuses, impacting ${totalStudents.toLocaleString()} students. MRV led with 9 sessions. Chevella showed the highest per-session student count at 72. CDU, NSRIT, and Aurora submitted regular updates. 'Intro to AI' remained the most covered topic across campuses. 3 user approvals are pending action.`
          : `Monthly Report — April 2024\n\n${totalSessions * 4} sessions estimated across all campuses throughout April, reaching approximately ${(totalStudents * 3.8).toLocaleString()} students across Telangana and Andhra Pradesh. MRV and Chevella performed above monthly targets. CIET and KKH are tracking steady growth. All 9 campuses remain active with consistent school visits. The cluster-based model is showing measurable scale — 41 schools covered in total.`
      )
    }, 900)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-bold text-sm text-foreground">Generate Report</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Auto-generate a text summary of operations</p>
      </div>
      <div className="flex gap-3">
        {(["weekly", "monthly"] as const).map((type) => (
          <button
            key={type}
            onClick={() => generate(type)}
            disabled={generating}
            className="flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl border text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: type === "weekly" ? "#FF9933" : "#138808" }}
          >
            <Download size={14} />
            {type === "weekly" ? "Weekly Report" : "Monthly Report"}
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
  const [activeSection, setActiveSection] = useState("dashboard")
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const sectionComponents: Record<string, React.ReactNode> = {
    dashboard: <DashboardSection />,
    approvals: <ApprovalsSection />,
    data:      <DataSection />,
    reports:   <ReportsSection />,
  }

  return (
    <div className="min-h-screen bg-[#f7f7f8] flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/30 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-60 bg-white border-r border-border z-40 flex flex-col transition-transform duration-300 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:static md:z-auto`}>
        {/* Logo */}
        <div className="px-5 py-5 border-b border-border flex items-center justify-between">
          <Link href="/">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Teach_Ai_1_page-0001-removebg-preview-ZJzf3R1J38t7BLntCYEUuQMl2LbJdV.png"
              alt="Teach AI For India"
              width={130}
              height={40}
              className="object-contain"
              style={{ width: "auto", height: "36px" }}
            />
          </Link>
          <button className="md:hidden text-muted-foreground" onClick={() => setSidebarOpen(false)}>
            <X size={18} />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const active = activeSection === item.key
            return (
              <button
                key={item.key}
                onClick={() => { setActiveSection(item.key); setSidebarOpen(false) }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? "bg-[#FF9933] text-white shadow-sm"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                }`}
              >
                <Icon size={16} />
                {item.label}
                {item.key === "approvals" && (
                  <span className={`ml-auto text-xs font-bold px-1.5 py-0.5 rounded-full ${active ? "bg-white/25 text-white" : "bg-red-100 text-red-600"}`}>
                    {pendingUsers.length}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="px-3 pb-5">
          <Link
            href="/"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut size={16} />
            Logout
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-border px-5 py-3.5 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button className="md:hidden text-muted-foreground hover:text-foreground transition-colors" onClick={() => setSidebarOpen(true)}>
              <Menu size={20} />
            </button>
            <div>
              <h1 className="font-bold text-sm text-foreground">Admin Dashboard</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">Manage operations and track impact across campuses</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative text-muted-foreground hover:text-foreground transition-colors">
              <Bell size={17} />
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-500 text-white text-[8px] flex items-center justify-center font-bold">3</span>
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#FF9933]/20 flex items-center justify-center text-xs font-bold text-[#FF9933]">
                A
              </div>
              <div className="hidden sm:block text-right">
                <p className="text-xs font-semibold text-foreground">admin@teachai.in</p>
                <p className="text-[10px] text-muted-foreground">Administrator</p>
              </div>
            </div>
            <span className="hidden sm:block text-xs font-bold px-2.5 py-1 rounded-full text-white" style={{ backgroundColor: "#138808" }}>
              Admin
            </span>
          </div>
        </header>

        {/* Section content */}
        <main className="flex-1 px-5 py-7 max-w-5xl w-full mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              {sectionComponents[activeSection]}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
