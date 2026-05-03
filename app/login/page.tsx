"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Mail, Lock, ArrowRight, Clock, CheckCircle2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

// Simulated users
const MOCK_USERS = [
  { email: "approved@campus.edu", password: "password123", status: "approved", campus: "MRV" },
  { email: "pending@campus.edu",  password: "password123", status: "pending",  campus: "CDU" },
]

type UIState = "form" | "pending" | "error"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail]       = useState("")
  const [password, setPassword] = useState("")
  const [uiState, setUiState]   = useState<UIState>("form")
  const [loading, setLoading]   = useState(false)

  function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    setTimeout(() => {
      const user = MOCK_USERS.find(
        (u) => u.email === email.trim().toLowerCase() && u.password === password
      )

      if (!user) {
        setUiState("error")
        setLoading(false)
        return
      }

      if (user.status === "pending") {
        setUiState("pending")
        setLoading(false)
        return
      }

      // approved — go to dashboard
      router.push("/dashboard")
    }, 900)
  }

  // ── Pending screen ───────────────────────────────────────────
  if (uiState === "pending") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#fafafa" }}>
        <div className="w-full max-w-md text-center">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ backgroundColor: "#FF993318" }}
          >
            <Clock size={36} style={{ color: "#FF9933" }} />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-3">Waiting for Approval</h1>
          <p className="text-muted-foreground leading-relaxed text-sm max-w-sm mx-auto">
            Your account is under review. You will get access once admin approves your account.
          </p>
          <div className="mt-8 p-4 rounded-2xl border border-border bg-white text-left space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Account Info</p>
            <p className="text-sm text-foreground font-medium">{email}</p>
            <span
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{ backgroundColor: "#FF993318", color: "#FF9933" }}
            >
              <Clock size={11} /> Pending Approval
            </span>
          </div>
          <button
            onClick={() => { setUiState("form"); setEmail(""); setPassword("") }}
            className="mt-6 text-sm text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors"
          >
            Try a different account
          </button>
        </div>
      </div>
    )
  }

  // ── Login form ───────────────────────────────────────────────
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background: "radial-gradient(ellipse 120% 80% at 50% 0%, rgba(255,153,51,0.10) 0%, transparent 60%), #fafafa",
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
          <h1 className="text-2xl font-bold text-foreground">Team Login</h1>
          <p className="text-sm text-muted-foreground mt-1">Sign in to your campus account</p>
        </div>

        {/* Error banner */}
        {uiState === "error" && (
          <div
            className="flex items-center gap-2.5 text-sm p-3.5 rounded-xl mb-4 border"
            style={{ backgroundColor: "#fff1f0", borderColor: "#fca5a5", color: "#dc2626" }}
          >
            <AlertCircle size={15} className="shrink-0" />
            Invalid email or password. Try{" "}
            <code className="font-mono text-xs">approved@campus.edu</code> or{" "}
            <code className="font-mono text-xs">pending@campus.edu</code>
          </div>
        )}

        {/* Card */}
        <form
          onSubmit={handleLogin}
          className="bg-white rounded-2xl border border-border shadow-sm p-8 space-y-5"
        >
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="email">
              Email address
            </label>
            <div className="relative">
              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <Input
                id="email"
                type="email"
                placeholder="you@campus.edu"
                className="pl-9 rounded-xl"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setUiState("form") }}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="pl-9 rounded-xl"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setUiState("form") }}
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl text-white font-semibold hover:opacity-90 h-11"
            style={{ backgroundColor: "#FF9933" }}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                Signing in...
              </span>
            ) : (
              <>Sign In <ArrowRight size={15} className="ml-1" /></>
            )}
          </Button>

          <div className="relative flex items-center gap-3">
            <span className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">or</span>
            <span className="flex-1 h-px bg-border" />
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full rounded-xl font-semibold h-11"
            asChild
          >
            <Link href="/signup">Create Account</Link>
          </Button>
        </form>

        {/* Demo hint */}
        <div className="mt-4 p-3.5 rounded-xl bg-white border border-border text-xs text-muted-foreground space-y-1">
          <p className="font-semibold text-foreground text-xs mb-1.5">Demo credentials</p>
          <p className="flex items-center gap-1.5"><CheckCircle2 size={11} style={{ color: "#138808" }} /> <span className="font-mono">approved@campus.edu</span> / <span className="font-mono">password123</span> — goes to dashboard</p>
          <p className="flex items-center gap-1.5"><Clock size={11} style={{ color: "#FF9933" }} /> <span className="font-mono">pending@campus.edu</span> / <span className="font-mono">password123</span> — shows waiting screen</p>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-5">
          <Link href="/" className="hover:underline">&larr; Back to home</Link>
        </p>
      </div>
    </div>
  )
}
