"use client"

import { Activity, Users, BookOpen, Wifi, Clock } from "lucide-react"
import { useFadeUp } from "@/hooks/use-fade-up"

const activities = [
  {
    campus: "MRV Campus",
    event: "2 sessions completed this week",
    students: 84,
    status: "Live",
    icon: BookOpen,
    time: "2 hrs ago",
  },
  {
    campus: "CDU",
    event: "1 outreach session completed",
    students: 40,
    status: "Live",
    icon: Users,
    time: "5 hrs ago",
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

const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
  Live:    { bg: "#13880814", text: "#138808", dot: "#138808" },
  Active:  { bg: "#FF993314", text: "#c97a20", dot: "#FF9933" },
  Ongoing: { bg: "#1d7adb14", text: "#1d7adb", dot: "#1d7adb" },
}

const staggerClasses = ["stagger-1","stagger-2","stagger-3","stagger-4","stagger-5"]

export default function LiveExecution() {
  const headerRef = useFadeUp()
  const gridRef = useFadeUp()

  return (
    <section className="section-padding-sm bg-white border-t border-border">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div ref={headerRef} className="fade-up flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5 mb-10">
          <div>
            <div
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider mb-3 text-white"
              style={{ backgroundColor: "#138808" }}
            >
              <Wifi size={10} />
              Live System
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">Real-Time Activity</h2>
            <p className="text-muted-foreground mt-1.5 text-sm">Live student and campus progress across India</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted px-3.5 py-2 rounded-lg self-start sm:self-auto">
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: "#138808" }} />
            5 campuses active
          </div>
        </div>

        {/* Cards */}
        <div ref={gridRef} className="fade-up grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          {activities.map((item, i) => {
            const Icon = item.icon
            const cfg = statusConfig[item.status]
            return (
              <div
                key={item.campus}
                className={`card-hover rounded-2xl border border-border bg-white p-5 flex flex-col gap-3 ${staggerClasses[i]}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: cfg.bg }}
                  >
                    <Icon size={15} style={{ color: cfg.text }} />
                  </div>
                  <span
                    className="text-[11px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1"
                    style={{ backgroundColor: cfg.bg, color: cfg.text }}
                  >
                    <span className="w-1 h-1 rounded-full" style={{ backgroundColor: cfg.dot }} />
                    {item.status}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-sm text-foreground">{item.campus}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{item.event}</p>
                </div>
                <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-2 border-t border-border mt-auto">
                  <span className="flex items-center gap-1">
                    <Users size={10} />
                    {item.students} students
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={10} />
                    {item.time}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
