import Link from "next/link"
import { BookOpen, Users, CheckCircle2, Plus, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

const recentSessions = [
  { campus: "MRV", topic: "AI Awareness Session", students: 45, date: "May 2, 2025" },
  { campus: "CDU", topic: "Prompt Writing Workshop", students: 38, date: "May 1, 2025" },
  { campus: "Chevella", topic: "Hands-on AI Tools", students: 52, date: "Apr 30, 2025" },
]

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="bg-white border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <h1 className="font-bold text-base text-foreground">Team Dashboard</h1>
        </div>
        <span className="text-xs text-muted-foreground px-3 py-1 rounded-full bg-muted">MRV Campus</span>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-10 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Sessions Logged", value: "8", icon: BookOpen, color: "#FF9933" },
            { label: "Students Impacted", value: "320", icon: Users, color: "#138808" },
            { label: "Goals Completed", value: "3/5", icon: CheckCircle2, color: "#1d7adb" },
          ].map((stat) => {
            const Icon = stat.icon
            return (
              <div key={stat.label} className="bg-white rounded-2xl border border-border p-6 shadow-sm flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${stat.color}18` }}>
                  <Icon size={20} style={{ color: stat.color }} />
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Submit session */}
        <div className="bg-white rounded-2xl border border-border p-7 shadow-sm flex items-center justify-between gap-4">
          <div>
            <h2 className="font-bold text-base text-foreground">Log a New Session</h2>
            <p className="text-sm text-muted-foreground mt-1">Submit session data in under 60 seconds</p>
          </div>
          <Button className="rounded-xl text-white font-semibold hover:opacity-90 shrink-0" style={{ backgroundColor: "#FF9933" }}>
            <Plus size={15} className="mr-1" /> Log Session
          </Button>
        </div>

        {/* Recent sessions */}
        <div>
          <h2 className="font-bold text-base text-foreground mb-4">Recent Sessions</h2>
          <div className="space-y-3">
            {recentSessions.map((session) => (
              <div key={session.topic} className="bg-white rounded-2xl border border-border p-5 shadow-sm flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-sm text-foreground">{session.topic}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{session.campus} &bull; {session.date}</p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-muted text-muted-foreground shrink-0">
                  {session.students} students
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
