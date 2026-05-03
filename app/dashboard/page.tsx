"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {
  ArrowLeft, User, BookOpen, Users, CheckCircle2, Clock,
  MapPin, School, FileText, Link2, ImageIcon,
  ChevronDown, Hash, CheckCircle, LogOut, AlertTriangle, Database,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  getCurrentUser,
  clearCurrentUser,
  addSubmission,
  getSubmissions,
  type StoredUser,
  type Submission,
} from "@/lib/storage"

const VISIT_TYPES   = ["Outreach", "Visit 1", "Visit 2", "Visit 3", "Final Visit"]
const CLASS_OPTIONS = ["6th", "7th", "8th", "9th", "10th"]

interface FormData {
  schoolType:    string
  schoolName:    string
  village:       string
  district:      string
  state:         string
  pincode:       string
  visitType:     string
  topicCovered:  string
  studentsCount: string
  classes:       string[]
  approvalLink:  string
  mediaLink:     string
}

const EMPTY_FORM: FormData = {
  schoolType:    "Government School",
  schoolName:    "",
  village:       "",
  district:      "",
  state:         "",
  pincode:       "",
  visitType:     "",
  topicCovered:  "",
  studentsCount: "",
  classes:       [],
  approvalLink:  "",
  mediaLink:     "",
}

interface Errors { [k: string]: string }

type ActiveTab = "submit" | "history"

export default function DashboardPage() {
  const router = useRouter()

  // ── Auth state ────────────────────────────────────────────────
  const [currentUser, setCurrentUser]   = useState<StoredUser | null>(null)
  const [authChecked, setAuthChecked]   = useState(false)

  // ── Form state ────────────────────────────────────────────────
  const [tab, setTab]                   = useState<ActiveTab>("submit")
  const [submitted, setSubmitted]       = useState(false)
  const [loading, setLoading]           = useState(false)
  const [errors, setErrors]             = useState<Errors>({})
  const [dupeError, setDupeError]       = useState(false)
  const [form, setForm]                 = useState<FormData>(EMPTY_FORM)
  const [lastSubmitted, setLastSubmitted] = useState<string>("")

  // ── Submitted data ─────────────────────────────────────────────
  const [mySubmissions, setMySubmissions] = useState<Submission[]>([])

  useEffect(() => {
    const user = getCurrentUser()

    if (!user) {
      router.replace("/login")
      return
    }

    setCurrentUser(user)
    setAuthChecked(true)

    // Load this user's submissions
    const all = getSubmissions()
    setMySubmissions(all.filter((s) => s.userId === user.id))
  }, [router])

  function refreshSubmissions(userId: string) {
    const all = getSubmissions()
    setMySubmissions(all.filter((s) => s.userId === userId))
  }

  function handleLogout() {
    clearCurrentUser()
    router.push("/login")
  }

  function setField(field: keyof FormData, value: string) {
    setForm((p) => ({ ...p, [field]: value }))
    setErrors((p) => { const e = { ...p }; delete e[field]; return e })
    setDupeError(false)
  }

  function toggleClass(cls: string) {
    setForm((p) => ({
      ...p,
      classes: p.classes.includes(cls)
        ? p.classes.filter((c) => c !== cls)
        : [...p.classes, cls],
    }))
    setErrors((p) => { const e = { ...p }; delete e.classes; return e })
  }

  function validate(): boolean {
    const e: Errors = {}
    if (!form.schoolName.trim())   e.schoolName    = "School name is required"
    if (!form.village.trim())      e.village       = "Village is required"
    if (!form.district.trim())     e.district      = "District is required"
    if (!form.state.trim())        e.state         = "State is required"
    if (!form.pincode.trim())      e.pincode       = "Pincode is required"
    if (!form.visitType)           e.visitType     = "Select a visit type"
    if (!form.topicCovered.trim()) e.topicCovered  = "Topic is required"
    if (!form.studentsCount)       e.studentsCount = "Enter number of students"
    if (form.classes.length === 0) e.classes       = "Select at least one class"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate() || !currentUser) return

    setLoading(true)
    setDupeError(false)

    const newSub: Submission = {
      id:            crypto.randomUUID(),
      userId:        currentUser.id,
      campus:        currentUser.campus,
      schoolType:    form.schoolType,
      schoolName:    form.schoolName.trim(),
      village:       form.village.trim(),
      district:      form.district.trim(),
      state:         form.state.trim(),
      pincode:       form.pincode.trim(),
      visitType:     form.visitType,
      topicCovered:  form.topicCovered.trim(),
      studentsCount: form.studentsCount,
      classes:       form.classes,
      approvalLink:  form.approvalLink.trim(),
      mediaLink:     form.mediaLink.trim(),
      submittedAt:   new Date().toISOString(),
    }

    const result = addSubmission(newSub)

    setLoading(false)

    if (!result.ok && result.duplicate) {
      setDupeError(true)
      return
    }

    setLastSubmitted(form.schoolName.trim())
    refreshSubmissions(currentUser.id)
    setSubmitted(true)
  }

  // ── Not yet checked auth ──────────────────────────────────────
  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <span className="w-8 h-8 rounded-full border-2 border-muted border-t-foreground animate-spin" />
      </div>
    )
  }

  // ── Pending user ──────────────────────────────────────────────
  if (currentUser?.status === "pending") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#fafafa" }}>
        <div className="w-full max-w-md text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: "#FF993318" }}>
            <Clock size={36} style={{ color: "#FF9933" }} />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-3">Waiting for Approval</h1>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-sm mx-auto">
            Your account is pending admin approval. Please wait until you are approved before accessing the dashboard.
          </p>
          <div className="mt-8 p-4 rounded-2xl border border-border bg-white text-left space-y-2.5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Your Account</p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Name</span>
              <span className="font-medium">{currentUser.fullName}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Campus</span>
              <span className="font-medium">{currentUser.campus}</span>
            </div>
            <div className="pt-1 border-t border-border flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Status</span>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: "#FF993318", color: "#FF9933" }}>
                <Clock size={11} /> Pending Approval
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="mt-6 text-sm text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    )
  }

  // ── Submission success ─────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: "#13880818" }}>
            <CheckCircle size={36} style={{ color: "#138808" }} />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Data Submitted Successfully</h2>
          <p className="text-sm text-muted-foreground mb-8">
            Your session data for <strong>{lastSubmitted}</strong> has been recorded.
          </p>
          <div className="space-y-3">
            <Button
              onClick={() => { setSubmitted(false); setForm(EMPTY_FORM); setDupeError(false) }}
              className="w-full rounded-xl text-white font-semibold h-11 hover:opacity-90"
              style={{ backgroundColor: "#FF9933" }}
            >
              Submit Another Session
            </Button>
            <Button
              variant="outline"
              onClick={() => { setSubmitted(false); setForm(EMPTY_FORM); setTab("history") }}
              className="w-full rounded-xl h-11"
            >
              View My Submissions
            </Button>
            <Button variant="outline" asChild className="w-full rounded-xl h-11">
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // ── Main dashboard ────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-border px-4 md:px-8 py-3.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors shrink-0">
            <ArrowLeft size={18} />
          </Link>
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Teach_Ai_1_page-0001-removebg-preview-ZJzf3R1J38t7BLntCYEUuQMl2LbJdV.png"
            alt="Teach AI For India"
            width={130}
            height={40}
            className="object-contain"
            style={{ width: "auto", height: "36px" }}
          />
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden sm:flex items-center gap-2 text-sm">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: "#FF9933" }}>
              {currentUser?.fullName?.charAt(0) ?? "U"}
            </div>
            <span className="font-medium text-foreground">{currentUser?.fullName}</span>
            <span className="text-muted-foreground">·</span>
            <span className="text-muted-foreground text-xs">{currentUser?.campus}</span>
          </div>
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: "#13880818", color: "#138808" }}>
            <CheckCircle2 size={11} /> Approved
          </span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-10">
        {/* Page title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Team Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Welcome back, {currentUser?.fullName}</p>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { label: "Sessions",  value: mySubmissions.length,                                      icon: BookOpen,     color: "#FF9933" },
            { label: "Students",  value: mySubmissions.reduce((a, s) => a + Number(s.studentsCount), 0), icon: Users,       color: "#138808" },
            { label: "Campus",    value: currentUser?.campus ?? "",                                  icon: MapPin,       color: "#1d7adb" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-2xl border border-border p-4 shadow-sm flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}18` }}>
                <Icon size={16} style={{ color }} />
              </div>
              <div className="min-w-0">
                <p className="text-lg font-extrabold text-foreground leading-none truncate">{value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-muted rounded-xl p-1 mb-6">
          {(["submit", "history"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all"
              style={
                tab === t
                  ? { backgroundColor: "#fff", color: "#111", boxShadow: "0 1px 3px rgba(0,0,0,0.10)" }
                  : { color: "var(--muted-foreground)" }
              }
            >
              {t === "submit" ? "Log Session" : `My Submissions (${mySubmissions.length})`}
            </button>
          ))}
        </div>

        {/* ── TAB: Submit ── */}
        {tab === "submit" && (
          <form onSubmit={handleSubmit} noValidate>
            {/* Dupe error */}
            {dupeError && (
              <div className="flex items-center gap-2.5 text-sm p-3.5 rounded-xl mb-4 border" style={{ backgroundColor: "#fff7ed", borderColor: "#fed7aa", color: "#c2410c" }}>
                <AlertTriangle size={15} className="shrink-0" />
                This data has already been submitted. Same campus + school + visit type + date already exists.
              </div>
            )}

            <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
              <div className="px-7 py-5 border-b border-border">
                <h2 className="font-bold text-base text-foreground">Log New Session</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Fields marked * are required</p>
              </div>

              <div className="px-7 py-7 space-y-6">

                {/* Campus — locked */}
                <Field label="Campus Name" icon={<MapPin size={15} />}>
                  <Input value={currentUser?.campus ?? ""} disabled className="rounded-xl bg-muted text-muted-foreground cursor-not-allowed" />
                </Field>

                {/* School Type */}
                <Field label="School Type *" icon={<School size={15} />}>
                  <SelectField value={form.schoolType} onChange={(v) => setField("schoolType", v)} options={["Government School", "Private School", "Aided School"]} />
                </Field>

                {/* School Name */}
                <Field label="School Name *" icon={<School size={15} />} error={errors.schoolName}>
                  <Input placeholder="Enter school name" className="rounded-xl" value={form.schoolName} onChange={(e) => setField("schoolName", e.target.value)} />
                </Field>

                {/* Location */}
                <div className="space-y-2">
                  <FieldLabel icon={<MapPin size={15} />} label="School Location *" />
                  <div className="grid grid-cols-2 gap-3">
                    <LabelInput label="Village"  placeholder="Village name"  value={form.village}  onChange={(v) => setField("village", v)}  error={errors.village} />
                    <LabelInput label="District" placeholder="District"      value={form.district} onChange={(v) => setField("district", v)} error={errors.district} />
                    <LabelInput label="State"    placeholder="State"         value={form.state}    onChange={(v) => setField("state", v)}    error={errors.state} />
                    <LabelInput label="Pincode"  placeholder="6-digit pin"   value={form.pincode}  onChange={(v) => setField("pincode", v)}  error={errors.pincode} inputMode="numeric" />
                  </div>
                </div>

                {/* Visit Type */}
                <Field label="Visit Type *" icon={<Hash size={15} />} error={errors.visitType}>
                  <SelectField value={form.visitType} onChange={(v) => setField("visitType", v)} options={VISIT_TYPES} placeholder="Select visit type" />
                </Field>

                {/* Topic */}
                <Field label="Topic Covered *" icon={<BookOpen size={15} />} error={errors.topicCovered}>
                  <textarea
                    rows={3}
                    placeholder="Introduction to AI, Prompt Writing, Activities..."
                    className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                    value={form.topicCovered}
                    onChange={(e) => setField("topicCovered", e.target.value)}
                  />
                </Field>

                {/* Students */}
                <Field label="Number of Students Attended *" icon={<Users size={15} />} error={errors.studentsCount}>
                  <Input type="number" min={1} placeholder="e.g. 45" className="rounded-xl" value={form.studentsCount} onChange={(e) => setField("studentsCount", e.target.value)} />
                </Field>

                {/* Classes */}
                <div className="space-y-2">
                  <FieldLabel icon={<FileText size={15} />} label="Classes Covered *" />
                  <div className="flex flex-wrap gap-2">
                    {CLASS_OPTIONS.map((cls) => {
                      const selected = form.classes.includes(cls)
                      return (
                        <button
                          key={cls}
                          type="button"
                          onClick={() => toggleClass(cls)}
                          className="px-4 py-1.5 rounded-xl text-sm font-semibold border transition-all"
                          style={
                            selected
                              ? { backgroundColor: "#FF9933", borderColor: "#FF9933", color: "#fff" }
                              : { backgroundColor: "#fff", borderColor: "var(--border)", color: "var(--muted-foreground)" }
                          }
                        >
                          {cls}
                        </button>
                      )
                    })}
                  </div>
                  {errors.classes && <p className="text-xs text-destructive">{errors.classes}</p>}
                </div>

                {/* Links */}
                <Field label="Approval Document Link" icon={<Link2 size={15} />}>
                  <Input type="url" placeholder="Google Drive link (public access)" className="rounded-xl" value={form.approvalLink} onChange={(e) => setField("approvalLink", e.target.value)} />
                </Field>

                <Field label="Photos & Videos Link" icon={<ImageIcon size={15} />}>
                  <Input type="url" placeholder="Drive folder link with session media" className="rounded-xl" value={form.mediaLink} onChange={(e) => setField("mediaLink", e.target.value)} />
                </Field>
              </div>

              <div className="px-7 py-5 border-t border-border bg-muted/30">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl text-white font-semibold h-11 hover:opacity-90"
                  style={{ backgroundColor: "#FF9933" }}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                      Submitting...
                    </span>
                  ) : (
                    "Submit Data"
                  )}
                </Button>
              </div>
            </div>
          </form>
        )}

        {/* ── TAB: History ── */}
        {tab === "history" && (
          <div className="space-y-4">
            {mySubmissions.length === 0 ? (
              <div className="bg-white rounded-2xl border border-border p-12 flex flex-col items-center gap-3 text-center shadow-sm">
                <Database size={32} className="text-muted-foreground opacity-30" />
                <p className="font-semibold text-foreground">No submissions yet</p>
                <p className="text-xs text-muted-foreground">Your logged sessions will appear here.</p>
                <Button
                  variant="outline"
                  onClick={() => setTab("submit")}
                  className="mt-2 rounded-xl text-sm"
                >
                  Log your first session
                </Button>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                  <div>
                    <h2 className="font-bold text-sm text-foreground">My Submitted Sessions</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">{mySubmissions.length} record{mySubmissions.length !== 1 ? "s" : ""}</p>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/40">
                        {["School", "Visit", "Students", "Topic", "Date"].map((h) => (
                          <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[...mySubmissions].reverse().map((sub, i) => (
                        <tr
                          key={sub.id}
                          className={`transition-colors hover:bg-muted/30 ${i !== mySubmissions.length - 1 ? "border-b border-border" : ""}`}
                        >
                          <td className="px-5 py-3.5 font-medium text-foreground max-w-[160px] truncate">{sub.schoolName}</td>
                          <td className="px-5 py-3.5 whitespace-nowrap">
                            <span className="text-xs font-medium px-2 py-1 rounded-full bg-orange-50 text-orange-700">{sub.visitType}</span>
                          </td>
                          <td className="px-5 py-3.5 text-muted-foreground font-semibold">{sub.studentsCount}</td>
                          <td className="px-5 py-3.5 text-muted-foreground max-w-[160px] truncate">{sub.topicCovered}</td>
                          <td className="px-5 py-3.5 text-muted-foreground font-mono text-xs whitespace-nowrap">
                            {new Date(sub.submittedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

// ── Helper components ─────────────────────────────────────────────────────────

function FieldLabel({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
      <span className="text-muted-foreground">{icon}</span>
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
