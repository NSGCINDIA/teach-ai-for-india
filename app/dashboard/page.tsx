"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {
  ArrowLeft, BookOpen, Users, CheckCircle2, Clock,
  MapPin, School, FileText, Link2, ImageIcon,
  ChevronDown, Hash, LogOut, AlertTriangle, Database,
  Phone, UserPlus, IndianRupee, Receipt, Building2, Crown, Megaphone, Wallet,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  getCurrentUser,
  clearCurrentUser,
  addSubmission,
  getSubmissions,
  getOutreach,
  addOutreach,
  getReimbursements,
  addReimbursement,
  getCampusRollups,
  type StoredUser,
  type Submission,
  type Outreach,
  type OutreachStatus,
  type Reimbursement,
} from "@/lib/storage"

const VISIT_TYPES   = ["Outreach", "Visit 1", "Visit 2", "Visit 3", "Final Visit"]
const CLASS_OPTIONS = ["6th", "7th", "8th", "9th", "10th"]
const SCHOOL_TYPES  = ["Government School", "Private School", "Aided School"]
const OUTREACH_STATUSES: OutreachStatus[] = ["Contacted", "Approval Pending", "Approved", "Scheduled", "Completed", "Declined"]
const EXPENSE_CATEGORIES = ["Travel", "Printing & Stationery", "Teaching Materials", "Food & Refreshments", "Internet/Data", "Other"]

const ACCENT = { orange: "#FF9933", green: "#138808", blue: "#1d7adb", red: "#e04040" }

// ─── Session form types ─────────────────────────────────────────────────────────

interface SessionForm {
  schoolType: string; schoolName: string; village: string; district: string
  state: string; pincode: string; visitType: string; topicCovered: string
  studentsCount: string; classes: string[]; approvalLink: string; mediaLink: string
}
const EMPTY_SESSION: SessionForm = {
  schoolType: "Government School", schoolName: "", village: "", district: "",
  state: "", pincode: "", visitType: "", topicCovered: "",
  studentsCount: "", classes: [], approvalLink: "", mediaLink: "",
}

interface OutreachForm {
  schoolName: string; schoolType: string; contactName: string; contactPhone: string
  village: string; district: string; state: string; expectedStudents: string
  status: OutreachStatus; notes: string
}
const EMPTY_OUTREACH: OutreachForm = {
  schoolName: "", schoolType: "Government School", contactName: "", contactPhone: "",
  village: "", district: "", state: "", expectedStudents: "",
  status: "Contacted", notes: "",
}

interface ReimburseForm {
  category: string; description: string; amount: string; spendDate: string; receiptLink: string
}
const EMPTY_REIMBURSE: ReimburseForm = {
  category: "Travel", description: "", amount: "", spendDate: "", receiptLink: "",
}

interface Errors { [k: string]: string }
type ActiveTab = "session" | "outreach" | "reimburse" | "history" | "campus"

const OUTREACH_BADGE: Record<OutreachStatus, { bg: string; text: string }> = {
  "Contacted":        { bg: "#eff6ff", text: "#1d4ed8" },
  "Approval Pending": { bg: "#fff7ed", text: "#c2410c" },
  "Approved":         { bg: "#ecfdf5", text: "#047857" },
  "Scheduled":        { bg: "#f5f3ff", text: "#6d28d9" },
  "Completed":        { bg: "#f0fdf4", text: "#138808" },
  "Declined":         { bg: "#fef2f2", text: "#dc2626" },
}
const REIMBURSE_BADGE: Record<Reimbursement["status"], { bg: string; text: string; label: string }> = {
  pending:  { bg: "#fff7ed", text: "#c2410c", label: "Pending" },
  approved: { bg: "#ecfdf5", text: "#047857", label: "Approved" },
  rejected: { bg: "#fef2f2", text: "#dc2626", label: "Rejected" },
  paid:     { bg: "#f0fdf4", text: "#138808", label: "Paid" },
}

export default function DashboardPage() {
  const router = useRouter()

  const [currentUser, setCurrentUser] = useState<StoredUser | null>(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [tab, setTab]                 = useState<ActiveTab>("session")

  // Data
  const [mySessions, setMySessions]       = useState<Submission[]>([])
  const [myOutreach, setMyOutreach]       = useState<Outreach[]>([])
  const [myReimburse, setMyReimburse]     = useState<Reimbursement[]>([])

  // Forms
  const [sessionForm, setSessionForm]     = useState<SessionForm>(EMPTY_SESSION)
  const [outreachForm, setOutreachForm]   = useState<OutreachForm>(EMPTY_OUTREACH)
  const [reimburseForm, setReimburseForm] = useState<ReimburseForm>(EMPTY_REIMBURSE)
  const [errors, setErrors]               = useState<Errors>({})
  const [dupeError, setDupeError]         = useState("")
  const [loading, setLoading]             = useState(false)
  const [flash, setFlash]                 = useState("")

  useEffect(() => {
    const user = getCurrentUser()
    if (!user) { router.replace("/login"); return }
    if (user.role === "admin") { router.replace("/admin"); return }
    setCurrentUser(user)
    setAuthChecked(true)
    refreshAll(user)
  }, [router])

  function refreshAll(user: StoredUser) {
    setMySessions(getSubmissions().filter((s) => s.userId === user.id))
    setMyOutreach(getOutreach().filter((o) => o.userId === user.id))
    setMyReimburse(getReimbursements().filter((r) => r.userId === user.id))
  }

  function handleLogout() {
    clearCurrentUser()
    router.push("/login")
  }

  function showFlash(msg: string) {
    setFlash(msg)
    setTimeout(() => setFlash(""), 3500)
  }

  // ── Session submit ──────────────────────────────────────────────
  function submitSession(e: React.FormEvent) {
    e.preventDefault()
    if (!currentUser) return
    const f = sessionForm
    const er: Errors = {}
    if (!f.schoolName.trim())   er.schoolName    = "Required"
    if (!f.village.trim())      er.village       = "Required"
    if (!f.district.trim())     er.district      = "Required"
    if (!f.state.trim())        er.state         = "Required"
    if (!f.pincode.trim())      er.pincode       = "Required"
    if (!f.visitType)           er.visitType     = "Select a visit type"
    if (!f.topicCovered.trim()) er.topicCovered  = "Required"
    if (!f.studentsCount)       er.studentsCount = "Required"
    if (f.classes.length === 0) er.classes       = "Select at least one class"
    setErrors(er)
    if (Object.keys(er).length) return

    setLoading(true)
    setDupeError("")
    const result = addSubmission({
      id: crypto.randomUUID(), userId: currentUser.id, campus: currentUser.campus,
      schoolType: f.schoolType, schoolName: f.schoolName.trim(), village: f.village.trim(),
      district: f.district.trim(), state: f.state.trim(), pincode: f.pincode.trim(),
      visitType: f.visitType, topicCovered: f.topicCovered.trim(), studentsCount: f.studentsCount,
      classes: f.classes, approvalLink: f.approvalLink.trim(), mediaLink: f.mediaLink.trim(),
      submittedAt: new Date().toISOString(),
    })
    setLoading(false)
    if (!result.ok && result.duplicate) {
      setDupeError("This session already exists — same school + visit type was logged today.")
      return
    }
    setSessionForm(EMPTY_SESSION)
    refreshAll(currentUser)
    showFlash(`Session at ${f.schoolName.trim()} recorded.`)
    setTab("history")
  }

  // ── Outreach submit ─────────────────────────────────────────────
  function submitOutreach(e: React.FormEvent) {
    e.preventDefault()
    if (!currentUser) return
    const f = outreachForm
    const er: Errors = {}
    if (!f.schoolName.trim())   er.o_schoolName = "Required"
    if (!f.contactName.trim())  er.o_contact    = "Required"
    if (!f.district.trim())     er.o_district   = "Required"
    setErrors(er)
    if (Object.keys(er).length) return

    setLoading(true)
    setDupeError("")
    const now = new Date().toISOString()
    const result = addOutreach({
      id: crypto.randomUUID(), userId: currentUser.id, campus: currentUser.campus,
      schoolName: f.schoolName.trim(), schoolType: f.schoolType, contactName: f.contactName.trim(),
      contactPhone: f.contactPhone.trim(), village: f.village.trim(), district: f.district.trim(),
      state: f.state.trim(), expectedStudents: f.expectedStudents, status: f.status,
      notes: f.notes.trim(), createdAt: now, updatedAt: now,
    })
    setLoading(false)
    if (!result.ok && result.duplicate) {
      setDupeError("This school is already in your outreach pipeline.")
      return
    }
    setOutreachForm(EMPTY_OUTREACH)
    refreshAll(currentUser)
    showFlash(`${f.schoolName.trim()} added to outreach pipeline.`)
  }

  // ── Reimbursement submit ────────────────────────────────────────
  function submitReimburse(e: React.FormEvent) {
    e.preventDefault()
    if (!currentUser) return
    const f = reimburseForm
    const er: Errors = {}
    if (!f.description.trim())          er.r_desc   = "Required"
    if (!f.amount || Number(f.amount) <= 0) er.r_amount = "Enter a valid amount"
    if (!f.spendDate)                   er.r_date   = "Required"
    setErrors(er)
    if (Object.keys(er).length) return

    setLoading(true)
    addReimbursement({
      id: crypto.randomUUID(), userId: currentUser.id, userName: currentUser.fullName,
      campus: currentUser.campus, category: f.category, description: f.description.trim(),
      amount: Number(f.amount), spendDate: f.spendDate, receiptLink: f.receiptLink.trim(),
      status: "pending", reviewNote: "", reviewedAt: "", createdAt: new Date().toISOString(),
    })
    setLoading(false)
    setReimburseForm(EMPTY_REIMBURSE)
    refreshAll(currentUser)
    showFlash(`Reimbursement claim for ₹${Number(f.amount).toLocaleString("en-IN")} submitted.`)
  }

  // ── Loading auth ────────────────────────────────────────────────
  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <span className="w-8 h-8 rounded-full border-2 border-muted border-t-foreground animate-spin" />
      </div>
    )
  }

  // ── Pending user ────────────────────────────────────────────────
  if (currentUser?.status === "pending") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#fafafa" }}>
        <div className="w-full max-w-md text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: "#FF993318" }}>
            <Clock size={36} style={{ color: ACCENT.orange }} />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-3">Waiting for Approval</h1>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-sm mx-auto">
            Your account is pending admin approval. You&apos;ll get access to your workspace once approved.
          </p>
          <div className="mt-8 p-4 rounded-2xl border border-border bg-white text-left space-y-2.5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Your Account</p>
            <Row label="Name" value={currentUser.fullName} />
            <Row label="Campus" value={currentUser.campus} />
            <Row label="Role" value={currentUser.role === "campus_lead" ? "Campus Lead" : "Volunteer"} />
            <div className="pt-1 border-t border-border flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Status</span>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: "#FF993318", color: ACCENT.orange }}>
                <Clock size={11} /> Pending Approval
              </span>
            </div>
          </div>
          <button onClick={handleLogout} className="mt-6 text-sm text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors">
            Sign out
          </button>
        </div>
      </div>
    )
  }

  const isLead = currentUser?.role === "campus_lead"
  const totalReimbursed = myReimburse
    .filter((r) => r.status === "approved" || r.status === "paid")
    .reduce((a, r) => a + r.amount, 0)

  const TABS: { key: ActiveTab; label: string }[] = [
    { key: "session",   label: "Log Session" },
    { key: "outreach",  label: "Outreach" },
    { key: "reimburse", label: "Reimburse" },
    { key: "history",   label: "History" },
    ...(isLead ? [{ key: "campus" as ActiveTab, label: "Campus" }] : []),
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Flash toast */}
      {flash && (
        <div className="fixed top-5 right-5 z-50">
          <div className="flex items-center gap-2 text-sm font-medium text-white px-4 py-2.5 rounded-xl shadow-lg" style={{ backgroundColor: ACCENT.green }}>
            <CheckCircle2 size={14} /> {flash}
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-border px-4 md:px-8 py-3.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors shrink-0">
            <ArrowLeft size={18} />
          </Link>
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Teach_Ai_1_page-0001-removebg-preview-ZJzf3R1J38t7BLntCYEUuQMl2LbJdV.png"
            alt="Teach AI For India" width={130} height={40}
            className="object-contain" style={{ width: "auto", height: "36px" }}
          />
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden sm:flex items-center gap-2 text-sm">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: ACCENT.orange }}>
              {currentUser?.fullName?.charAt(0) ?? "U"}
            </div>
            <span className="font-medium text-foreground">{currentUser?.fullName}</span>
            <span className="text-muted-foreground">·</span>
            <span className="text-muted-foreground text-xs">{currentUser?.campus}</span>
          </div>
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: isLead ? "#f5f3ff" : "#13880818", color: isLead ? "#6d28d9" : ACCENT.green }}>
            {isLead ? <><Crown size={11} /> Campus Lead</> : <><CheckCircle2 size={11} /> Volunteer</>}
          </span>
          <button onClick={handleLogout} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">{isLead ? "Campus Lead Workspace" : "Volunteer Workspace"}</h1>
          <p className="text-sm text-muted-foreground mt-1">Welcome back, {currentUser?.fullName}</p>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <StatChip label="Sessions"  value={mySessions.length} icon={BookOpen} color={ACCENT.orange} />
          <StatChip label="Students"  value={mySessions.reduce((a, s) => a + Number(s.studentsCount), 0)} icon={Users} color={ACCENT.green} />
          <StatChip label="Outreach"  value={myOutreach.length} icon={Megaphone} color={ACCENT.blue} />
          <StatChip label="Reimbursed" value={`₹${totalReimbursed.toLocaleString("en-IN")}`} icon={Wallet} color={ACCENT.red} />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-muted rounded-xl p-1 mb-6 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => { setTab(t.key); setErrors({}); setDupeError("") }}
              className="flex-1 min-w-fit whitespace-nowrap px-3 py-2 rounded-lg text-sm font-semibold transition-all"
              style={tab === t.key
                ? { backgroundColor: "#fff", color: "#111", boxShadow: "0 1px 3px rgba(0,0,0,0.10)" }
                : { color: "var(--muted-foreground)" }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {dupeError && (
          <div className="flex items-center gap-2.5 text-sm p-3.5 rounded-xl mb-4 border" style={{ backgroundColor: "#fff7ed", borderColor: "#fed7aa", color: "#c2410c" }}>
            <AlertTriangle size={15} className="shrink-0" /> {dupeError}
          </div>
        )}

        {/* ── TAB: Session ── */}
        {tab === "session" && (
          <form onSubmit={submitSession} noValidate>
            <Card title="Log New Session" subtitle="Report a completed school visit. Fields marked * are required.">
              <Field label="Campus Name" icon={<MapPin size={15} />}>
                <Input value={currentUser?.campus ?? ""} disabled className="rounded-xl bg-muted text-muted-foreground cursor-not-allowed" />
              </Field>
              <Field label="School Type *" icon={<School size={15} />}>
                <SelectField value={sessionForm.schoolType} onChange={(v) => setSessionForm((p) => ({ ...p, schoolType: v }))} options={SCHOOL_TYPES} />
              </Field>
              <Field label="School Name *" icon={<School size={15} />} error={errors.schoolName}>
                <Input placeholder="Enter school name" className="rounded-xl" value={sessionForm.schoolName} onChange={(e) => setSessionForm((p) => ({ ...p, schoolName: e.target.value }))} />
              </Field>
              <div className="space-y-2">
                <FieldLabel icon={<MapPin size={15} />} label="School Location *" />
                <div className="grid grid-cols-2 gap-3">
                  <LabelInput label="Village"  placeholder="Village name" value={sessionForm.village}  onChange={(v) => setSessionForm((p) => ({ ...p, village: v }))}  error={errors.village} />
                  <LabelInput label="District" placeholder="District"     value={sessionForm.district} onChange={(v) => setSessionForm((p) => ({ ...p, district: v }))} error={errors.district} />
                  <LabelInput label="State"    placeholder="State"        value={sessionForm.state}    onChange={(v) => setSessionForm((p) => ({ ...p, state: v }))}    error={errors.state} />
                  <LabelInput label="Pincode"  placeholder="6-digit pin"  value={sessionForm.pincode}  onChange={(v) => setSessionForm((p) => ({ ...p, pincode: v }))}  error={errors.pincode} inputMode="numeric" />
                </div>
              </div>
              <Field label="Visit Type *" icon={<Hash size={15} />} error={errors.visitType}>
                <SelectField value={sessionForm.visitType} onChange={(v) => setSessionForm((p) => ({ ...p, visitType: v }))} options={VISIT_TYPES} placeholder="Select visit type" />
              </Field>
              <Field label="Topic Covered *" icon={<BookOpen size={15} />} error={errors.topicCovered}>
                <textarea rows={3} placeholder="Introduction to AI, Prompt Writing, Activities..." className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none" value={sessionForm.topicCovered} onChange={(e) => setSessionForm((p) => ({ ...p, topicCovered: e.target.value }))} />
              </Field>
              <Field label="Number of Students Attended *" icon={<Users size={15} />} error={errors.studentsCount}>
                <Input type="number" min={1} placeholder="e.g. 45" className="rounded-xl" value={sessionForm.studentsCount} onChange={(e) => setSessionForm((p) => ({ ...p, studentsCount: e.target.value }))} />
              </Field>
              <div className="space-y-2">
                <FieldLabel icon={<FileText size={15} />} label="Classes Covered *" />
                <div className="flex flex-wrap gap-2">
                  {CLASS_OPTIONS.map((cls) => {
                    const selected = sessionForm.classes.includes(cls)
                    return (
                      <button key={cls} type="button"
                        onClick={() => setSessionForm((p) => ({ ...p, classes: p.classes.includes(cls) ? p.classes.filter((c) => c !== cls) : [...p.classes, cls] }))}
                        className="px-4 py-1.5 rounded-xl text-sm font-semibold border transition-all"
                        style={selected ? { backgroundColor: ACCENT.orange, borderColor: ACCENT.orange, color: "#fff" } : { backgroundColor: "#fff", borderColor: "var(--border)", color: "var(--muted-foreground)" }}>
                        {cls}
                      </button>
                    )
                  })}
                </div>
                {errors.classes && <p className="text-xs text-destructive">{errors.classes}</p>}
              </div>
              <Field label="Approval Document Link" icon={<Link2 size={15} />}>
                <Input type="url" placeholder="Google Drive link (public access)" className="rounded-xl" value={sessionForm.approvalLink} onChange={(e) => setSessionForm((p) => ({ ...p, approvalLink: e.target.value }))} />
              </Field>
              <Field label="Photos & Videos Link" icon={<ImageIcon size={15} />}>
                <Input type="url" placeholder="Drive folder link with session media" className="rounded-xl" value={sessionForm.mediaLink} onChange={(e) => setSessionForm((p) => ({ ...p, mediaLink: e.target.value }))} />
              </Field>
              <SubmitBar loading={loading} color={ACCENT.orange} label="Submit Session" />
            </Card>
          </form>
        )}

        {/* ── TAB: Outreach ── */}
        {tab === "outreach" && (
          <div className="space-y-6">
            <form onSubmit={submitOutreach} noValidate>
              <Card title="Add School to Outreach" subtitle="Track schools you're reaching out to before sessions begin.">
                <Field label="School Name *" icon={<School size={15} />} error={errors.o_schoolName}>
                  <Input placeholder="School being contacted" className="rounded-xl" value={outreachForm.schoolName} onChange={(e) => setOutreachForm((p) => ({ ...p, schoolName: e.target.value }))} />
                </Field>
                <Field label="School Type" icon={<School size={15} />}>
                  <SelectField value={outreachForm.schoolType} onChange={(v) => setOutreachForm((p) => ({ ...p, schoolType: v }))} options={SCHOOL_TYPES} />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Contact Person *" icon={<UserPlus size={15} />} error={errors.o_contact}>
                    <Input placeholder="Principal / HM name" className="rounded-xl" value={outreachForm.contactName} onChange={(e) => setOutreachForm((p) => ({ ...p, contactName: e.target.value }))} />
                  </Field>
                  <Field label="Contact Phone" icon={<Phone size={15} />}>
                    <Input inputMode="tel" placeholder="Phone number" className="rounded-xl" value={outreachForm.contactPhone} onChange={(e) => setOutreachForm((p) => ({ ...p, contactPhone: e.target.value }))} />
                  </Field>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <LabelInput label="Village"  placeholder="Village"  value={outreachForm.village}  onChange={(v) => setOutreachForm((p) => ({ ...p, village: v }))} />
                  <LabelInput label="District" placeholder="District" value={outreachForm.district} onChange={(v) => setOutreachForm((p) => ({ ...p, district: v }))} error={errors.o_district} />
                  <LabelInput label="State"    placeholder="State"    value={outreachForm.state}    onChange={(v) => setOutreachForm((p) => ({ ...p, state: v }))} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Expected Students" icon={<Users size={15} />}>
                    <Input type="number" min={0} placeholder="e.g. 60" className="rounded-xl" value={outreachForm.expectedStudents} onChange={(e) => setOutreachForm((p) => ({ ...p, expectedStudents: e.target.value }))} />
                  </Field>
                  <Field label="Stage" icon={<Hash size={15} />}>
                    <SelectField value={outreachForm.status} onChange={(v) => setOutreachForm((p) => ({ ...p, status: v as OutreachStatus }))} options={OUTREACH_STATUSES} />
                  </Field>
                </div>
                <Field label="Notes" icon={<FileText size={15} />}>
                  <textarea rows={2} placeholder="Conversation summary, next steps..." className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none" value={outreachForm.notes} onChange={(e) => setOutreachForm((p) => ({ ...p, notes: e.target.value }))} />
                </Field>
                <SubmitBar loading={loading} color={ACCENT.blue} label="Add to Pipeline" />
              </Card>
            </form>

            <ListCard title="My Outreach Pipeline" count={myOutreach.length} emptyIcon={Megaphone} emptyText="No outreach logged yet. Start tracking schools you contact.">
              {myOutreach.length > 0 && (
                <SimpleTable headers={["School", "Contact", "District", "Stage", "Added"]}>
                  {[...myOutreach].reverse().map((o) => {
                    const b = OUTREACH_BADGE[o.status]
                    return (
                      <tr key={o.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="px-5 py-3.5 font-medium text-foreground max-w-[160px] truncate">{o.schoolName}</td>
                        <td className="px-5 py-3.5 text-muted-foreground text-xs">{o.contactName}{o.contactPhone ? ` · ${o.contactPhone}` : ""}</td>
                        <td className="px-5 py-3.5 text-muted-foreground">{o.district}</td>
                        <td className="px-5 py-3.5"><span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: b.bg, color: b.text }}>{o.status}</span></td>
                        <td className="px-5 py-3.5 text-muted-foreground font-mono text-xs whitespace-nowrap">{fmtDate(o.createdAt)}</td>
                      </tr>
                    )
                  })}
                </SimpleTable>
              )}
            </ListCard>
          </div>
        )}

        {/* ── TAB: Reimburse ── */}
        {tab === "reimburse" && (
          <div className="space-y-6">
            <form onSubmit={submitReimburse} noValidate>
              <Card title="Submit Reimbursement Claim" subtitle="Every claim is reviewed by admin. Attach a receipt link for traceability.">
                <Field label="Category" icon={<Receipt size={15} />}>
                  <SelectField value={reimburseForm.category} onChange={(v) => setReimburseForm((p) => ({ ...p, category: v }))} options={EXPENSE_CATEGORIES} />
                </Field>
                <Field label="Description *" icon={<FileText size={15} />} error={errors.r_desc}>
                  <Input placeholder="e.g. Bus fare to Chevella school" className="rounded-xl" value={reimburseForm.description} onChange={(e) => setReimburseForm((p) => ({ ...p, description: e.target.value }))} />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Amount (₹) *" icon={<IndianRupee size={15} />} error={errors.r_amount}>
                    <Input type="number" min={1} placeholder="e.g. 250" className="rounded-xl" value={reimburseForm.amount} onChange={(e) => setReimburseForm((p) => ({ ...p, amount: e.target.value }))} />
                  </Field>
                  <Field label="Date of Spend *" icon={<Clock size={15} />} error={errors.r_date}>
                    <Input type="date" className="rounded-xl" value={reimburseForm.spendDate} onChange={(e) => setReimburseForm((p) => ({ ...p, spendDate: e.target.value }))} />
                  </Field>
                </div>
                <Field label="Receipt Link" icon={<Link2 size={15} />}>
                  <Input type="url" placeholder="Drive / photo link of the receipt" className="rounded-xl" value={reimburseForm.receiptLink} onChange={(e) => setReimburseForm((p) => ({ ...p, receiptLink: e.target.value }))} />
                </Field>
                <SubmitBar loading={loading} color={ACCENT.green} label="Submit Claim" />
              </Card>
            </form>

            <ListCard title="My Reimbursement Claims" count={myReimburse.length} emptyIcon={Wallet} emptyText="No claims submitted yet.">
              {myReimburse.length > 0 && (
                <SimpleTable headers={["Description", "Category", "Amount", "Date", "Status"]}>
                  {[...myReimburse].reverse().map((r) => {
                    const b = REIMBURSE_BADGE[r.status]
                    return (
                      <tr key={r.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="px-5 py-3.5 font-medium text-foreground max-w-[180px] truncate">{r.description}</td>
                        <td className="px-5 py-3.5 text-muted-foreground text-xs">{r.category}</td>
                        <td className="px-5 py-3.5 font-semibold text-foreground whitespace-nowrap">₹{r.amount.toLocaleString("en-IN")}</td>
                        <td className="px-5 py-3.5 text-muted-foreground font-mono text-xs whitespace-nowrap">{fmtDate(r.spendDate)}</td>
                        <td className="px-5 py-3.5"><span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: b.bg, color: b.text }}>{b.label}</span></td>
                      </tr>
                    )
                  })}
                </SimpleTable>
              )}
            </ListCard>
          </div>
        )}

        {/* ── TAB: History ── */}
        {tab === "history" && (
          <ListCard title="My Submitted Sessions" count={mySessions.length} emptyIcon={Database} emptyText="No sessions yet. Your logged sessions will appear here.">
            {mySessions.length > 0 && (
              <SimpleTable headers={["School", "Visit", "Students", "Topic", "Date"]}>
                {[...mySessions].reverse().map((s) => (
                  <tr key={s.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-foreground max-w-[160px] truncate">{s.schoolName}</td>
                    <td className="px-5 py-3.5 whitespace-nowrap"><span className="text-xs font-medium px-2 py-1 rounded-full bg-orange-50 text-orange-700">{s.visitType}</span></td>
                    <td className="px-5 py-3.5 text-muted-foreground font-semibold">{s.studentsCount}</td>
                    <td className="px-5 py-3.5 text-muted-foreground max-w-[160px] truncate">{s.topicCovered}</td>
                    <td className="px-5 py-3.5 text-muted-foreground font-mono text-xs whitespace-nowrap">{fmtDate(s.submittedAt)}</td>
                  </tr>
                ))}
              </SimpleTable>
            )}
          </ListCard>
        )}

        {/* ── TAB: Campus (lead only) ── */}
        {tab === "campus" && isLead && currentUser && <CampusOverview campus={currentUser.campus} />}
      </main>
    </div>
  )
}

// ─── Campus overview (campus lead) ──────────────────────────────────────────────

function CampusOverview({ campus }: { campus: string }) {
  const [rollup, setRollup] = useState<ReturnType<typeof getCampusRollups>[number] | null>(null)
  const [sessions, setSessions] = useState<Submission[]>([])
  const [outreach, setOutreach] = useState<Outreach[]>([])

  useEffect(() => {
    setRollup(getCampusRollups().find((c) => c.campus === campus) ?? null)
    setSessions(getSubmissions().filter((s) => s.campus === campus))
    setOutreach(getOutreach().filter((o) => o.campus === campus))
  }, [campus])

  const students = sessions.reduce((a, s) => a + Number(s.studentsCount), 0)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatChip label="Campus Sessions" value={rollup?.sessions ?? 0} icon={BookOpen} color={ACCENT.orange} />
        <StatChip label="Students Reached" value={students} icon={Users} color={ACCENT.green} />
        <StatChip label="Schools" value={rollup?.schools ?? 0} icon={School} color={ACCENT.blue} />
        <StatChip label="Outreach" value={rollup?.outreach ?? 0} icon={Megaphone} color={ACCENT.red} />
      </div>

      <ListCard title={`${campus} — All Sessions`} count={sessions.length} emptyIcon={Building2} emptyText="No sessions logged at your campus yet.">
        {sessions.length > 0 && (
          <SimpleTable headers={["School", "Visit", "Students", "Date"]}>
            {[...sessions].reverse().map((s) => (
              <tr key={s.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                <td className="px-5 py-3.5 font-medium text-foreground max-w-[180px] truncate">{s.schoolName}</td>
                <td className="px-5 py-3.5 whitespace-nowrap"><span className="text-xs font-medium px-2 py-1 rounded-full bg-orange-50 text-orange-700">{s.visitType}</span></td>
                <td className="px-5 py-3.5 text-muted-foreground font-semibold">{s.studentsCount}</td>
                <td className="px-5 py-3.5 text-muted-foreground font-mono text-xs whitespace-nowrap">{fmtDate(s.submittedAt)}</td>
              </tr>
            ))}
          </SimpleTable>
        )}
      </ListCard>

      <ListCard title={`${campus} — Outreach Pipeline`} count={outreach.length} emptyIcon={Megaphone} emptyText="No outreach logged at your campus yet.">
        {outreach.length > 0 && (
          <SimpleTable headers={["School", "Contact", "Stage", "Added"]}>
            {[...outreach].reverse().map((o) => {
              const b = OUTREACH_BADGE[o.status]
              return (
                <tr key={o.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-3.5 font-medium text-foreground max-w-[180px] truncate">{o.schoolName}</td>
                  <td className="px-5 py-3.5 text-muted-foreground text-xs">{o.contactName}</td>
                  <td className="px-5 py-3.5"><span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: b.bg, color: b.text }}>{o.status}</span></td>
                  <td className="px-5 py-3.5 text-muted-foreground font-mono text-xs whitespace-nowrap">{fmtDate(o.createdAt)}</td>
                </tr>
              )
            })}
          </SimpleTable>
        )}
      </ListCard>
    </div>
  )
}

// ─── Helper components ──────────────────────────────────────────────────────────

function fmtDate(iso: string) {
  if (!iso) return "—"
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  )
}

function StatChip({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: React.ElementType; color: string }) {
  return (
    <div className="bg-white rounded-2xl border border-border p-4 shadow-sm flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}18` }}>
        <Icon size={16} style={{ color }} />
      </div>
      <div className="min-w-0">
        <p className="text-lg font-extrabold text-foreground leading-none truncate">{value}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
      </div>
    </div>
  )
}

function Card({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
      <div className="px-7 py-5 border-b border-border">
        <h2 className="font-bold text-base text-foreground">{title}</h2>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
      <div className="px-7 py-7 space-y-6">{children}</div>
    </div>
  )
}

function SubmitBar({ loading, color, label }: { loading: boolean; color: string; label: string }) {
  return (
    <Button type="submit" disabled={loading} className="w-full rounded-xl text-white font-semibold h-11 hover:opacity-90" style={{ backgroundColor: color }}>
      {loading ? (
        <span className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" /> Submitting...
        </span>
      ) : label}
    </Button>
  )
}

function ListCard({ title, count, emptyIcon: EmptyIcon, emptyText, children }: { title: string; count: number; emptyIcon: React.ElementType; emptyText: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-border">
        <h2 className="font-bold text-sm text-foreground">{title}</h2>
        <p className="text-xs text-muted-foreground mt-0.5">{count} record{count !== 1 ? "s" : ""}</p>
      </div>
      {count === 0 ? (
        <div className="p-12 flex flex-col items-center gap-3 text-center">
          <EmptyIcon size={32} className="text-muted-foreground opacity-30" />
          <p className="text-xs text-muted-foreground max-w-xs">{emptyText}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">{children}</div>
      )}
    </div>
  )
}

function SimpleTable({ headers, children }: { headers: string[]; children: React.ReactNode }) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-border bg-muted/40">
          {headers.map((h) => (
            <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground whitespace-nowrap">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  )
}

function FieldLabel({ icon, label }: { icon?: React.ReactNode; label: string }) {
  return (
    <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
      {icon && <span className="text-muted-foreground">{icon}</span>}
      {label}
    </p>
  )
}

function Field({ label, icon, children, error }: { label: string; icon?: React.ReactNode; children: React.ReactNode; error?: string }) {
  return (
    <div className="space-y-1.5">
      <FieldLabel icon={icon} label={label} />
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

function LabelInput({ label, placeholder, value, onChange, error, inputMode }: {
  label: string; placeholder: string; value: string
  onChange: (v: string) => void; error?: string
  inputMode?: React.InputHTMLAttributes<HTMLInputElement>["inputMode"]
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground font-medium">{label}</p>
      <Input placeholder={placeholder} className="rounded-xl" value={value} onChange={(e) => onChange(e.target.value)} inputMode={inputMode} />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

function SelectField({ value, onChange, options, placeholder = "Select..." }: {
  value: string; onChange: (v: string) => void; options: string[]; placeholder?: string
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-3 pr-8 py-2 text-sm rounded-xl border border-input bg-background text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-ring h-10"
      >
        {placeholder && !options.includes(value) && <option value="">{placeholder}</option>}
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
    </div>
  )
}
