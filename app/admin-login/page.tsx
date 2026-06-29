"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Mail, Lock, ShieldCheck, ArrowRight, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getUserByEmail, saveCurrentUser, getCurrentUser, DEFAULT_ADMIN } from "@/lib/storage"

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail]       = useState("")
  const [password, setPassword] = useState("")
  const [error, setError]       = useState(false)
  const [loading, setLoading]   = useState(false)

  useEffect(() => {
    const cur = getCurrentUser()
    if (cur?.role === "admin") router.replace("/admin")
  }, [router])

  function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      const user = getUserByEmail(email.trim().toLowerCase())
      if (!user || user.password !== password || user.role !== "admin") {
        setError(true)
        setLoading(false)
        return
      }
      saveCurrentUser(user)
      router.push("/admin")
    }, 500)
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background:
          "radial-gradient(ellipse 120% 80% at 50% 0%, rgba(19,136,8,0.10) 0%, rgba(255,255,255,0) 60%), #fafafa",
      }}
    >
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex justify-center mb-6">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Teach_Ai_1_page-0001-removebg-preview-ZJzf3R1J38t7BLntCYEUuQMl2LbJdV.png"
              alt="Teach AI For India — NIAT Student General Council"
              width={200}
              height={78}
              className="object-contain"
            />
          </Link>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-3 text-white" style={{ backgroundColor: "#138808" }}>
            <ShieldCheck size={12} />
            Admin Portal
          </div>
          <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
          <p className="text-sm text-muted-foreground mt-1">Platform administrator access</p>
        </div>

        {error && (
          <div
            className="flex items-center gap-2.5 text-sm p-3.5 rounded-xl mb-4 border"
            style={{ backgroundColor: "#fff1f0", borderColor: "#fca5a5", color: "#dc2626" }}
          >
            <AlertCircle size={15} className="shrink-0" />
            Invalid admin credentials.
          </div>
        )}

        {/* Card */}
        <form onSubmit={handleLogin} className="bg-white rounded-2xl border border-border shadow-sm p-8 space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="email">
              Admin Email
            </label>
            <div className="relative">
              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="admin@teachaiforindia.org"
                className="pl-9 rounded-xl"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(false) }}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="pl-9 rounded-xl"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(false) }}
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl text-white font-semibold mt-2 hover:opacity-90"
            style={{ backgroundColor: "#138808" }}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                Signing in...
              </span>
            ) : (
              <>Access Admin Panel <ArrowRight size={15} className="ml-1" /></>
            )}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Team member?{" "}
            <Link href="/login" className="font-semibold hover:underline" style={{ color: "#FF9933" }}>
              Team Login
            </Link>
          </p>
        </form>

        {/* Default credentials hint */}
        <div className="mt-4 p-3.5 rounded-xl bg-white border border-border text-xs text-muted-foreground">
          <p className="font-semibold text-foreground mb-1">Default admin login</p>
          <p className="font-mono">{DEFAULT_ADMIN.email}</p>
          <p className="font-mono">{DEFAULT_ADMIN.password}</p>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          <Link href="/" className="hover:underline">
            &larr; Back to home
          </Link>
        </p>
      </div>
    </div>
  )
}
