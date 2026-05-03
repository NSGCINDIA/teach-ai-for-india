import Link from "next/link"
import { ArrowRight, BookOpen, Users, CheckCircle2 } from "lucide-react"
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

const statusStyles: Record<string, { bg: string; text: string; dot: string }> = {
  Active: { bg: "#13880818", text: "#138808", dot: "#138808" },
  Ongoing: { bg: "#FF993318", text: "#c97a20", dot: "#FF9933" },
}

export default function CampusSection() {
  return (
    <section id="campuses" className="section-padding" style={{ backgroundColor: "#f8f9fa" }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: "#FF9933" }}>
            Our Collaborative Hubs
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground text-balance">
            Teach AI Across 8 Campuses
          </h2>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto leading-relaxed">
            Partner engineering colleges driving the AI education movement at the grassroots level.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {campuses.map((campus) => {
            const style = statusStyles[campus.status]
            return (
              <div
                key={campus.name}
                className="card-hover bg-white rounded-2xl border border-border p-5 shadow-sm flex flex-col gap-4"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-base text-foreground">{campus.name}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Campus</p>
                  </div>
                  <span
                    className="text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5 shrink-0"
                    style={{ backgroundColor: style.bg, color: style.text }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: style.dot }} />
                    {campus.status}
                  </span>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <BookOpen size={13} className="text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Sessions</p>
                      <p className="text-sm font-bold text-foreground">{campus.sessions}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={13} className="text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Students</p>
                      <p className="text-sm font-bold text-foreground">{campus.students}</p>
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full rounded-xl text-xs font-semibold mt-auto"
                  asChild
                >
                  <Link href={`/campus/${campus.name.toLowerCase()}`}>
                    View Campus <ArrowRight size={12} className="ml-1" />
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
