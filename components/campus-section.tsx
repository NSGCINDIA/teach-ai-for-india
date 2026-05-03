"use client"

import Link from "next/link"
import { ArrowRight, BookOpen, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useFadeUp } from "@/hooks/use-fade-up"

const campuses = [
  { name: "KKH",          summary: "AI Awareness & Prompt Writing",       sessions: 6,  students: 240, status: "Active"  },
  { name: "CDU",          summary: "Outreach sessions completed",          sessions: 5,  students: 200, status: "Active"  },
  { name: "NSRIT",        summary: "Hands-on AI workshops",                sessions: 6,  students: 240, status: "Ongoing" },
  { name: "NRI",          summary: "Introduction to AI delivered",         sessions: 4,  students: 160, status: "Ongoing" },
  { name: "CIET",         summary: "AI literacy for rural schools",        sessions: 3,  students: 120, status: "Active"  },
  { name: "Chevella",     summary: "120 students impacted this month",     sessions: 7,  students: 280, status: "Active"  },
  { name: "Aurora",       summary: "Ethical AI and Prompt sessions",       sessions: 5,  students: 200, status: "Ongoing" },
  { name: "Annamacharya", summary: "Cluster expansion underway",           sessions: 4,  students: 160, status: "Active"  },
  { name: "MRV",          summary: "2 sessions completed this week",       sessions: 8,  students: 320, status: "Active"  },
]

const statusStyles: Record<string, { bg: string; text: string; dot: string }> = {
  Active:  { bg: "#13880812", text: "#138808", dot: "#138808" },
  Ongoing: { bg: "#FF993312", text: "#c97a20", dot: "#FF9933" },
}

export default function CampusSection() {
  const headingRef = useFadeUp()
  const gridRef = useFadeUp()

  return (
    <section id="campuses" className="section-padding" style={{ backgroundColor: "#f7f7f7" }}>
      <div className="max-w-6xl mx-auto">
        <div ref={headingRef} className="fade-up text-center mb-14">
          <p className="section-label mb-3" style={{ color: "#FF9933" }}>Our Collaborative Hubs</p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground text-balance">
            9 Campuses. One Network.
          </h2>
          <p className="text-muted-foreground mt-3 max-w-lg mx-auto leading-relaxed text-sm">
            Partner engineering colleges driving AI education at the grassroots — each owning a geographic cluster.
          </p>
        </div>

        <div ref={gridRef} className="fade-up grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {campuses.map((campus, i) => {
            const style = statusStyles[campus.status]
            const stagger = ["stagger-1","stagger-2","stagger-3","stagger-4","stagger-5","stagger-6"][i % 6]
            return (
              <div
                key={campus.name}
                className={`card-hover bg-white rounded-2xl border border-border p-5 flex flex-col gap-4 ${stagger}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-base text-foreground">{campus.name}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{campus.summary}</p>
                  </div>
                  <span
                    className="text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5 shrink-0"
                    style={{ backgroundColor: style.bg, color: style.text }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: style.dot }} />
                    {campus.status}
                  </span>
                </div>

                <div className="flex items-center gap-5 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <BookOpen size={12} />
                    <span><span className="font-bold text-foreground">{campus.sessions}</span> sessions</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users size={12} />
                    <span><span className="font-bold text-foreground">{campus.students}</span> students</span>
                  </span>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full rounded-xl text-xs font-semibold mt-auto hover:bg-muted transition-colors"
                  asChild
                >
                  <Link href={`/campus/${campus.name.toLowerCase()}`}>
                    View Campus <ArrowRight size={11} className="ml-1" />
                  </Link>
                </Button>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
