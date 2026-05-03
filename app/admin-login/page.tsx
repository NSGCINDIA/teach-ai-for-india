"use client"

import Link from "next/link"
import Image from "next/image"
import { Mail, Lock, ShieldCheck, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function AdminLoginPage() {
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

        {/* Card */}
        <div className="bg-white rounded-2xl border border-border shadow-sm p-8 space-y-4">
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
              />
            </div>
          </div>

          <Button
            className="w-full rounded-xl text-white font-semibold mt-2 hover:opacity-90"
            style={{ backgroundColor: "#138808" }}
            asChild
          >
            <Link href="/admin">
              Access Admin Panel <ArrowRight size={15} className="ml-1" />
            </Link>
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Team member?{" "}
            <Link href="/login" className="font-semibold hover:underline" style={{ color: "#FF9933" }}>
              Team Login
            </Link>
          </p>
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
