"use client"

import { Activity, Users, BookOpen, Wifi } from "lucide-react"

const activities = [
  {
    campus: "MRV Campus",
    event: "2 sessions completed this week",
    students: 84,
    status: "Live",
    icon: BookOpen,
    time: "2 hours ago",
  },
  {
    campus: "CDU",
    event: "1 outreach session completed",
    students: 40,
    status: "Live",
    icon: Users,
    time: "5 hours ago",
  },
  {
    campus: "Chevella",
    event: "120 students impacted",
    students: 120,
    status: "Active",
    icon: Activity,
    time: "Today",
  },
  {
    campus: "Aurora",
    event: "AI Awareness session delivered",
    students: 65,
    status: "Active",
    icon: BookOpen,
    time: "Yesterday",
  },
  {
    campus: "NSRIT",
    event: "Prompt Writing workshop held",
    students: 90,
    status: "Ongoing",
    icon: Users,
    time: "Yesterday",
  },
]

const statusColor: Record<string, string> = {
  Live: "#138808",
  Active: "#FF9933",
  Ongoing: "#1d7adb",
}

export default function LiveExecution() {
  return (
    <section className="section-padding bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-3 text-white"
              style={{ backgroundColor: "#138808" }}>
              <Wifi size={11} />
              LIVE SYSTEM
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">Real-Time Activity</h2>
            <p className="text-muted-foreground mt-1">Live updates from campuses across India</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted px-4 py-2 rounded-xl">
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: "#138808" }} />
            5 campuses active
          </div>
        </div>

        {/* Activity feed */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {activities.map((item) => {
            const Icon = item.icon
            const color = statusColor[item.status]
            return (
              <div
                key={item.campus}
                className="card-hover rounded-2xl border border-border bg-white p-5 flex flex-col gap-3 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${color}18` }}
                  >
                    <Icon size={17} style={{ color }} />
                  </div>
                  <span
                    className="text-xs font-semibold px-2.5 py-1 rounded-full"
                    style={{ backgroundColor: `${color}18`, color }}
                  >
                    {item.status}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-sm text-foreground">{item.campus}</p>
                  <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">{item.event}</p>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border">
                  <span className="flex items-center gap-1">
                    <Users size={11} />
                    {item.students} students
                  </span>
                  <span>{item.time}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
