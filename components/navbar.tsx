"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const navLinks = [
  { label: "Impact", href: "/#impact" },
  { label: "Program", href: "/#program" },
  { label: "Campuses", href: "/#campuses" },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handler, { passive: true })
    return () => window.removeEventListener("scroll", handler)
  }, [])

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-white/96 backdrop-blur-md shadow-sm border-b border-border"
          : "bg-transparent"
      )}
    >
      <nav className="max-w-7xl mx-auto px-5 md:px-10 h-[60px] flex items-center justify-between gap-6">
        {/* Logo — compact brand lockup */}
        <Link href="/" className="flex items-center shrink-0" aria-label="Teach AI For India home">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Teach_Ai_1_page-0001-removebg-preview-ZJzf3R1J38t7BLntCYEUuQMl2LbJdV.png"
            alt="Teach AI For India"
            width={130}
            height={48}
            className="object-contain h-9 w-auto"
            priority
          />
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-0.5 flex-1 justify-center">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          <Button variant="ghost" size="sm" asChild className="text-sm font-medium">
            <Link href="/login">Login</Link>
          </Button>
          <Button
            size="sm"
            asChild
            className="text-white text-sm font-semibold rounded-lg px-4 hover:opacity-90 transition-opacity"
            style={{ backgroundColor: "#138808" }}
          >
            <Link href="/admin-login">Admin Access</Link>
          </Button>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          {open ? <X size={19} /> : <Menu size={19} />}
        </button>
      </nav>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden bg-white border-t border-border px-5 pb-5 pt-2 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <div className="flex gap-2 pt-3 border-t border-border mt-2">
            <Button variant="outline" size="sm" className="flex-1 rounded-lg" asChild>
              <Link href="/login" onClick={() => setOpen(false)}>Login</Link>
            </Button>
            <Button
              size="sm"
              className="flex-1 text-white rounded-lg hover:opacity-90"
              style={{ backgroundColor: "#138808" }}
              asChild
            >
              <Link href="/admin-login" onClick={() => setOpen(false)}>Admin Access</Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  )
}
