"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  ArrowLeft, User, BookOpen, Users, CheckCircle2,
  MapPin, School, FileText, Link2, ImageIcon,
  ChevronDown, Hash, CheckCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

// Mock logged-in user
const MOCK_USER = {
  name: "Arjun Reddy",
  email: "arjun@campus.edu",
  campus: "MRV",
  role: "Team Member",
}

const VISIT_TYPES   = ["Outreach", "Visit 1", "Visit 2", "Visit 3", "Final Visit"]
const CLASS_OPTIONS = ["6th", "7th", "8th", "9th", "10th"]

interface FormData {
  schoolType:      string
  schoolName:      string
  village:         string
  district:        string
  state:           string
  pincode:         string
  visitType:       string
  topicCovered:    string
  studentsCount:   string
  classes:         string[]
  approvalLink:    string
  mediaLink:       string
}

interface Errors { [k: string]: string }

export default function DashboardPage() {
  const [submitted, setSubmitted] = useState(false)
  const [loading,   setLoading]   = useState(false)
  const [errors,    setErrors]    = useState<Errors>({})

  const [form, setForm] = useState<FormData>({
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
  })

  function setField(field: keyof FormData, value: string) {
    setForm((p) => ({ ...p, [field]: value }))
    setErrors((p) => { const e = { ...p }; delete e[field]; return e })
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
    if (!form.schoolName.trim())    e.schoolName    = "School name is required"
    if (!form.village.trim())       e.village       = "Village is required"
    if (!form.district.trim())      e.district      = "District is required"
    if (!form.state.trim())         e.state         = "State is required"
    if (!form.pincode.trim())       e.pincode       = "Pincode is required"
    if (!form.visitType)            e.visitType     = "Select a visit type"
    if (!form.topicCovered.trim())  e.topicCovered  = "Topic is required"
    if (!form.studentsCount)        e.studentsCount = "Enter number of students"
    if (form.classes.length === 0)  e.classes       = "Select at least one class"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    setTimeout(() => { setLoading(false); setSubmitted(true) }, 900)
  }

  // ── Success state ─────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ backgroundColor: "#13880818" }}
          >
            <CheckCircle size={36} style={{ color: "#138808" }} />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Data Submitted Successfully</h2>
          <p className="text-sm text-muted-foreground mb-8">
            Your session data for <strong>{form.schoolName}</strong> has been recorded.
          </p>
          <div className="space-y-3">
            <Button
              onClick={() => { setSubmitted(false); setForm({ schoolType: "Government School", schoolName: "", village: "", district: "", state: "", pincode: "", visitType: "", topicCovered: "", studentsCount: "", classes: [], approvalLink: "", mediaLink: "" }) }}
              className="w-full rounded-xl text-white font-semibold h-11 hover:opacity-90"
              style={{ backgroundColor: "#FF9933" }}
            >
              Submit Another Session
            </Button>
            <Button variant="outline" asChild className="w-full rounded-xl h-11">
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

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
          <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: "#FF9933" }}>
              {MOCK_USER.name.charAt(0)}
            </div>
            <span className="font-medium text-foreground">{MOCK_USER.campus}</span>
          </div>
          <span
            className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{ backgroundColor: "#13880818", color: "#138808" }}
          >
            <CheckCircle2 size={11} /> Approved Member
          </span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-10">

        {/* Page title */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Team Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Submit session data quickly and easily</p>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <User size={12} /> {MOCK_USER.email}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin size={12} /> {MOCK_USER.campus} Campus
            </span>
          </div>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { label: "Sessions", value: "8",   icon: BookOpen,    color: "#FF9933" },
            { label: "Students", value: "320",  icon: Users,       color: "#138808" },
            { label: "Goals",    value: "3 / 5", icon: CheckCircle2, color: "#1d7adb" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-2xl border border-border p-4 shadow-sm flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}18` }}>
                <Icon size={16} style={{ color }} />
              </div>
              <div className="min-w-0">
                <p className="text-lg font-extrabold text-foreground leading-none">{value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Session form */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">

            <div className="px-7 py-5 border-b border-border">
              <h2 className="font-bold text-base text-foreground">Log New Session</h2>
              <p className="text-xs text-muted-foreground mt-0.5">All fields marked with * are required</p>
            </div>

            <div className="px-7 py-7 space-y-6">

              {/* 1. Campus Name */}
              <Field label="Campus Name" icon={<MapPin size={15} />}>
                <Input
                  value={MOCK_USER.campus}
                  disabled
                  className="rounded-xl bg-muted text-muted-foreground cursor-not-allowed"
                />
              </Field>

              {/* 2. School Type */}
              <Field label="School Type *" icon={<School size={15} />}>
                <SelectField
                  value={form.schoolType}
                  onChange={(v) => setField("schoolType", v)}
                  options={["Government School"]}
                />
              </Field>

              {/* 3. School Name */}
              <Field label="School Name *" icon={<School size={15} />} error={errors.schoolName}>
                <Input
                  placeholder="Enter school name"
                  className="rounded-xl"
                  value={form.schoolName}
                  onChange={(e) => setField("schoolName", e.target.value)}
                />
              </Field>

              {/* 4. Location */}
              <div className="space-y-2">
                <FieldLabel icon={<MapPin size={15} />} label="School Location *" />
                <div className="grid grid-cols-2 gap-3">
                  <LabelInput label="Village" placeholder="Village name" value={form.village}   onChange={(v) => setField("village", v)}   error={errors.village} />
                  <LabelInput label="District" placeholder="District"    value={form.district}  onChange={(v) => setField("district", v)}  error={errors.district} />
                  <LabelInput label="State"    placeholder="State"       value={form.state}     onChange={(v) => setField("state", v)}     error={errors.state} />
                  <LabelInput label="Pincode"  placeholder="6-digit pin" value={form.pincode}   onChange={(v) => setField("pincode", v)}   error={errors.pincode} inputMode="numeric" />
                </div>
              </div>

              {/* 5. Visit Type */}
              <Field label="Visit Type *" icon={<Hash size={15} />} error={errors.visitType}>
                <SelectField
                  value={form.visitType}
                  onChange={(v) => setField("visitType", v)}
                  options={VISIT_TYPES}
                  placeholder="Select visit type"
                />
              </Field>

              {/* 6. Topic Covered */}
              <Field label="Topic Covered *" icon={<BookOpen size={15} />} error={errors.topicCovered}>
                <textarea
                  rows={3}
                  placeholder="Introduction to AI, Prompt Writing, Activities..."
                  className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  value={form.topicCovered}
                  onChange={(e) => setField("topicCovered", e.target.value)}
                />
              </Field>

              {/* 7. Students Attended */}
              <Field label="Number of Students Attended *" icon={<Users size={15} />} error={errors.studentsCount}>
                <Input
                  type="number"
                  min={1}
                  placeholder="e.g. 45"
                  className="rounded-xl"
                  value={form.studentsCount}
                  onChange={(e) => setField("studentsCount", e.target.value)}
                />
              </Field>

              {/* 8. Classes Covered */}
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

              {/* 9. Approval Document */}
              <Field label="Approval Document Link" icon={<Link2 size={15} />}>
                <Input
                  type="url"
                  placeholder="Google Drive link (public access)"
                  className="rounded-xl"
                  value={form.approvalLink}
                  onChange={(e) => setField("approvalLink", e.target.value)}
                />
              </Field>

              {/* 10. Photos & Videos */}
              <Field label="Photos & Videos Link" icon={<ImageIcon size={15} />}>
                <Input
                  type="url"
                  placeholder="Drive folder link with session media"
                  className="rounded-xl"
                  value={form.mediaLink}
                  onChange={(e) => setField("mediaLink", e.target.value)}
                />
              </Field>

            </div>

            {/* Footer */}
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
      </main>
    </div>
  )
}

// ── Small helper components ───────────────────────────────────────

function FieldLabel({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
      <span className="text-muted-foreground">{icon}</span>
      {label}
    </p>
  )
}

function Field({
  label, icon, children, error,
}: {
  label: string
  icon?: React.ReactNode
  children: React.ReactNode
  error?: string
}) {
  return (
    <div className="space-y-1.5">
      <FieldLabel icon={icon} label={label} />
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

function LabelInput({
  label, placeholder, value, onChange, error, inputMode,
}: {
  label: string
  placeholder: string
  value: string
  onChange: (v: string) => void
  error?: string
  inputMode?: React.InputHTMLAttributes<HTMLInputElement>["inputMode"]
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground font-medium">{label}</p>
      <Input
        placeholder={placeholder}
        className="rounded-xl"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        inputMode={inputMode}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

function SelectField({
  value, onChange, options, placeholder = "Select...",
}: {
  value: string
  onChange: (v: string) => void
  options: string[]
  placeholder?: string
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-3 pr-8 py-2 text-sm rounded-xl border border-input bg-background text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-ring h-10"
      >
        {placeholder && !options.includes(value) && (
          <option value="">{placeholder}</option>
        )}
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
    </div>
  )
}
