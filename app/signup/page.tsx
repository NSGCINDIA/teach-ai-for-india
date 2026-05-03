"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { User, Mail, Lock, Hash, MapPin, ArrowRight, CheckCircle2, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const CAMPUSES = ["KKH", "CDU", "NSRIT", "NRI", "CIET", "Chevella", "Aurora", "Annamacharya", "MRV"]

type UIState = "form" | "success"

interface FormData {
  fullName: string
  niatId: string
  campus: string
  email: string
  password: string
  confirmPassword: string
}

interface Errors {
  fullName?: string
  niatId?: string
  campus?: string
  email?: string
  password?: string
  confirmPassword?: string
}

export default function SignupPage() {
  const [uiState, setUiState] = useState<UIState>("form")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<FormData>({
    fullName: "", niatId: "", campus: "", email: "", password: "", confirmPassword: "",
  })
  const [errors, setErrors] = useState<Errors>({})

  function set(field: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  function validate(): boolean {
    const e: Errors = {}
    if (!form.fullName.trim())     e.fullName    = "Full name is required"
    if (!form.niatId.trim())       e.niatId      = "NIAT ID is required"
    if (!form.campus)              e.campus      = "Please select a campus"
    if (!form.email.includes("@")) e.email       = "Enter a valid email address"
    if (form.password.length < 8)  e.password    = "Password must be at least 8 characters"
    if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords do not match"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setUiState("success")
    }, 900)
  }

  // ── Success screen ────────────────────────────────────────────
  if (uiState === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#fafafa" }}>
        <div className="w-full max-w-md text-center">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ backgroundColor: "#13880818" }}
          >
            <CheckCircle2 size={36} style={{ color: "#138808" }} />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-3">Account Created Successfully</h1>
          <p className="text-muted-foreground leading-relaxed text-sm max-w-sm mx-auto">
            Your account is pending admin approval. Please wait until you are approved before accessing the dashboard.
          </p>

          <div className="mt-8 p-4 rounded-2xl border border-border bg-white text-left space-y-2.5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Account Summary</p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Name</span>
              <span className="font-medium text-foreground">{form.fullName}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Campus</span>
              <span className="font-medium text-foreground">{form.campus}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Email</span>
              <span className="font-medium text-foreground">{form.email}</span>
            </div>
            <div className="pt-1 border-t border-border flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Status</span>
              <span
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
                style={{ backgroundColor: "#FF993318", color: "#FF9933" }}
              >
                Pending Approval
              </span>
            </div>
          </div>

          <Button
            asChild
            className="mt-6 w-full rounded-xl text-white font-semibold h-11 hover:opacity-90"
            style={{ backgroundColor: "#FF9933" }}
          >
            <Link href="/login">Go to Login <ArrowRight size={14} className="ml-1.5" /></Link>
          </Button>
        </div>
      </div>
    )
  }

  // ── Signup form ───────────────────────────────────────────────
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{
        background: "radial-gradient(ellipse 120% 80% at 50% 0%, rgba(19,136,8,0.08) 0%, transparent 60%), #fafafa",
      }}
    >
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex justify-center mb-5">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Teach_Ai_1_page-0001-removebg-preview-ZJzf3R1J38t7BLntCYEUuQMl2LbJdV.png"
              alt="Teach AI For India"
              width={200}
              height={78}
              className="object-contain"
              style={{ width: "auto", height: "52px" }}
              priority
            />
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Create Account</h1>
          <p className="text-sm text-muted-foreground mt-1">Join your campus team</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-border shadow-sm p-8 space-y-4" noValidate>

          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="fullName">Full Name</label>
            <div className="relative">
              <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <Input id="fullName" placeholder="Your full name" className="pl-9 rounded-xl" value={form.fullName} onChange={(e) => set("fullName", e.target.value)} />
            </div>
            {errors.fullName && <p className="text-xs text-destructive">{errors.fullName}</p>}
          </div>

          {/* NIAT ID */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="niatId">NIAT ID</label>
            <div className="relative">
              <Hash size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <Input id="niatId" placeholder="e.g. NIAT2024001" className="pl-9 rounded-xl" value={form.niatId} onChange={(e) => set("niatId", e.target.value)} />
            </div>
            {errors.niatId && <p className="text-xs text-destructive">{errors.niatId}</p>}
          </div>

          {/* Campus */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="campus">Campus</label>
            <div className="relative">
              <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none z-10" />
              <select
                id="campus"
                value={form.campus}
                onChange={(e) => set("campus", e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-input bg-background text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-ring h-10"
              >
                <option value="">Select your campus</option>
                {CAMPUSES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            {errors.campus && <p className="text-xs text-destructive">{errors.campus}</p>}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="email">Email Address</label>
            <div className="relative">
              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <Input id="email" type="email" placeholder="you@campus.edu" className="pl-9 rounded-xl" value={form.email} onChange={(e) => set("email", e.target.value)} />
            </div>
            {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="password">Password</label>
            <div className="relative">
              <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <Input id="password" type={showPassword ? "text" : "password"} placeholder="Min. 8 characters" className="pl-9 pr-9 rounded-xl" value={form.password} onChange={(e) => set("password", e.target.value)} />
              <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="confirmPassword">Confirm Password</label>
            <div className="relative">
              <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <Input id="confirmPassword" type={showConfirm ? "text" : "password"} placeholder="Re-enter password" className="pl-9 pr-9 rounded-xl" value={form.confirmPassword} onChange={(e) => set("confirmPassword", e.target.value)} />
              <button type="button" onClick={() => setShowConfirm((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword}</p>}
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl text-white font-semibold hover:opacity-90 h-11 mt-2"
            style={{ backgroundColor: "#138808" }}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                Creating account...
              </span>
            ) : (
              <>Create Account <ArrowRight size={15} className="ml-1" /></>
            )}
          </Button>

          <p className="text-center text-xs text-muted-foreground pt-1">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold hover:underline" style={{ color: "#FF9933" }}>Sign in</Link>
          </p>
        </form>

        <p className="text-center text-xs text-muted-foreground mt-5">
          <Link href="/" className="hover:underline">&larr; Back to home</Link>
        </p>
      </div>
    </div>
  )
}
