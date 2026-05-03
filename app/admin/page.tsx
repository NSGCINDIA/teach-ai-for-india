import Link from "next/link"
import { Building2, Users, BookOpen, TrendingUp, ArrowLeft, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const campuses = [
  { name: "MRV", sessions: 8, students: 320, status: "Active" },
  { name: "CDU", sessions: 5, students: 200, status: "Active" },
  { name: "NSRIT", sessions: 6, students: 240, status: "Ongoing" },
  { name: "NRI", sessions: 4, students: 160, status: "Ongoing" },
  { name: "CIET", sessions: 3, students: 120, status: "Active" },
  { name: "Chevella", sessions: 7, students: 280, status: "Active" },
  { name: "Aurora", sessions: 5, students: 200, status: "Ongoing" },
  { name: "Annamacharya", sessions: 4, students: 160, status: "Active" },
]

const statusColor: Record<string, string> = {
  Active: "#138808",
  Ongoing: "#FF9933",
}

export default function AdminPage() {
  const totalStudents = campuses.reduce((sum, c) => sum + c.students, 0)
  const totalSessions = campuses.reduce((sum, c) => sum + c.sessions, 0)

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="bg-white border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <h1 className="font-bold text-base text-foreground">Admin Panel</h1>
        </div>
        <span
          className="text-xs font-semibold px-3 py-1 rounded-full text-white"
          style={{ backgroundColor: "#138808" }}
        >
          Administrator
        </span>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-10 space-y-8">
        {/* Aggregate stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Students", value: totalStudents.toLocaleString(), icon: Users, color: "#FF9933" },
            { label: "Total Sessions", value: totalSessions, icon: BookOpen, color: "#138808" },
            { label: "Active Campuses", value: "8+", icon: Building2, color: "#1d7adb" },
            { label: "Schools Covered", value: "41", icon: TrendingUp, color: "#e04040" },
          ].map((stat) => {
            const Icon = stat.icon
            return (
              <div key={stat.label} className="bg-white rounded-2xl border border-border p-5 shadow-sm">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: `${stat.color}18` }}>
                  <Icon size={17} style={{ color: stat.color }} />
                </div>
                <p className="text-2xl font-extrabold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
              </div>
            )
          })}
        </div>

        {/* Campus table */}
        <div>
          <h2 className="font-bold text-base text-foreground mb-4">All Campuses</h2>
          <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground">Campus</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground">Sessions</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground">Students</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground">Status</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {campuses.map((campus, i) => {
                    const color = statusColor[campus.status]
                    return (
                      <tr key={campus.name} className={i !== campuses.length - 1 ? "border-b border-border" : ""}>
                        <td className="px-5 py-4 font-semibold text-foreground">{campus.name}</td>
                        <td className="px-5 py-4 text-muted-foreground">{campus.sessions}</td>
                        <td className="px-5 py-4 text-muted-foreground">{campus.students}</td>
                        <td className="px-5 py-4">
                          <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: `${color}18`, color }}>
                            {campus.status}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <Button variant="outline" size="sm" className="rounded-lg text-xs h-7" asChild>
                            <Link href={`/campus/${campus.name.toLowerCase()}`}>
                              View <ArrowRight size={11} className="ml-1" />
                            </Link>
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
