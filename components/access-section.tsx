"use client"

import Link from "next/link"
import { LayoutDashboard, ShieldCheck, ArrowRight, Zap, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useFadeUp } from "@/hooks/use-fade-up"

export default function AccessSection() {
  const headingRef = useFadeUp()
  const cardsRef = useFadeUp()

  return (
    <section id="access" className="section-padding" style={{ backgroundColor: "#f7f7f7" }}>
      <div className="max-w-4xl mx-auto">
        <div ref={headingRef} className="fade-up text-center mb-14">
          <p className="section-label mb-3" style={{ color: "#FF9933" }}>Platform Access</p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground text-balance">
            Your Gateway to the Platform
          </h2>
          <p className="text-muted-foreground mt-3 max-w-md mx-auto leading-relaxed text-sm">
            Two portals built for two roles — campus teams and platform administrators.
          </p>
        </div>

        <div ref={cardsRef} className="fade-up grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Team Dashboard */}
          <div className="stagger-1 card-hover rounded-2xl border border-border bg-white p-8 flex flex-col gap-5">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: "#FF993318" }}
            >
              <LayoutDashboard size={22} style={{ color: "#FF9933" }} />
            </div>

            <div>
              <h3 className="font-bold text-xl text-foreground mb-2">Team Dashboard</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Submit session data in under 60 seconds. Log attendance, track your campus progress, and keep your cluster on schedule.
              </p>
            </div>

            <ul className="space-y-2 text-sm">
              {[
                { icon: Zap,       text: "Submit session data in under 60 seconds" },
                { icon: BarChart3, text: "Track your campus performance live" },
              ].map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-2.5 text-muted-foreground">
                  <Icon size={13} style={{ color: "#FF9933" }} className="shrink-0" />
                  {text}
                </li>
              ))}
            </ul>

            <Button
              asChild
              className="mt-auto rounded-xl font-semibold text-white hover:opacity-90 transition-opacity h-11"
              style={{ backgroundColor: "#FF9933" }}
            >
              <Link href="/login">
                Login <ArrowRight size={14} className="ml-1.5" />
              </Link>
            </Button>
          </div>

          {/* Admin Panel */}
          <div
            className="stagger-2 card-hover rounded-2xl p-8 flex flex-col gap-5 text-white"
            style={{ background: "linear-gradient(145deg, #138808, #0b5c07)" }}
          >
            <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center">
              <ShieldCheck size={22} className="text-white" />
            </div>

            <div>
              <h3 className="font-bold text-xl text-white mb-2">Admin Panel</h3>
              <p className="text-sm text-white/70 leading-relaxed">
                Track impact across all campuses in real time. Review session data, manage teams, and see aggregate numbers across all 9 campuses at once.
              </p>
            </div>

            <ul className="space-y-2 text-sm">
              {[
                { icon: BarChart3, text: "Real-time impact across all campuses" },
                { icon: Zap,       text: "Manage teams, sessions, and clusters" },
              ].map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-2.5 text-white/75">
                  <Icon size={13} className="text-white/60 shrink-0" />
                  {text}
                </li>
              ))}
            </ul>

            <Button
              asChild
              variant="outline"
              className="mt-auto rounded-xl font-semibold bg-white/10 text-white border-white/25 hover:bg-white/20 transition-colors h-11"
            >
              <Link href="/admin-login">
                Admin Access <ArrowRight size={14} className="ml-1.5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
