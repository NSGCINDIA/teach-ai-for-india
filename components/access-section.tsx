import Link from "next/link"
import { LayoutDashboard, ShieldCheck, ArrowRight, Zap, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AccessSection() {
  return (
    <section id="access" className="section-padding bg-white">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: "#FF9933" }}>
            Platform Access
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground text-balance">
            Your Gateway to the Platform
          </h2>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto leading-relaxed">
            Two portals built for two different audiences — campus teams and platform administrators.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Team Dashboard */}
          <div className="card-hover rounded-2xl border border-border bg-white p-8 shadow-sm flex flex-col gap-6">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: "#FF993318" }}
            >
              <LayoutDashboard size={26} style={{ color: "#FF9933" }} />
            </div>

            <div>
              <h3 className="font-bold text-xl text-foreground mb-2">Team Dashboard</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                For campus team members to submit session data, log attendance, and track their impact — all in under 60 seconds.
              </p>
            </div>

            <ul className="space-y-2.5 text-sm">
              {[
                { icon: Zap, text: "Submit session data in under 60 seconds" },
                { icon: BarChart3, text: "Track your campus performance" },
              ].map((item) => {
                const Icon = item.icon
                return (
                  <li key={item.text} className="flex items-center gap-3 text-muted-foreground">
                    <Icon size={14} style={{ color: "#FF9933" }} className="shrink-0" />
                    {item.text}
                  </li>
                )
              })}
            </ul>

            <Button
              asChild
              className="mt-auto rounded-xl font-semibold text-white hover:opacity-90 transition-all"
              style={{ backgroundColor: "#FF9933" }}
            >
              <Link href="/login">
                Login <ArrowRight size={15} className="ml-1" />
              </Link>
            </Button>
          </div>

          {/* Admin Panel */}
          <div
            className="card-hover rounded-2xl p-8 flex flex-col gap-6 text-white"
            style={{ background: "linear-gradient(135deg, #138808, #0d5e06)" }}
          >
            <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center">
              <ShieldCheck size={26} className="text-white" />
            </div>

            <div>
              <h3 className="font-bold text-xl text-white mb-2">Admin Panel</h3>
              <p className="text-sm text-white/75 leading-relaxed">
                For platform administrators to monitor all campuses, review session data, manage teams, and track aggregate impact across all 8+ campuses in real time.
              </p>
            </div>

            <ul className="space-y-2.5 text-sm">
              {[
                { icon: BarChart3, text: "Track impact across all campuses" },
                { icon: Zap, text: "Manage teams and sessions" },
              ].map((item) => {
                const Icon = item.icon
                return (
                  <li key={item.text} className="flex items-center gap-3 text-white/80">
                    <Icon size={14} className="text-white/70 shrink-0" />
                    {item.text}
                  </li>
                )
              })}
            </ul>

            <Button
              asChild
              variant="outline"
              className="mt-auto rounded-xl font-semibold bg-white/10 text-white border-white/30 hover:bg-white/20 transition-all"
            >
              <Link href="/admin-login">
                Admin Access <ArrowRight size={15} className="ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
