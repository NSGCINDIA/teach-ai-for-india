import Link from "next/link"
import { ArrowLeft, Users, BookOpen, MapPin, CheckCircle2, CalendarCheck } from "lucide-react"
import { Button } from "@/components/ui/button"

const campusData: Record<string, { sessions: number; students: number; status: string; location: string; description: string }> = {
  mrv:          { sessions: 8, students: 320, status: "Active", location: "Hyderabad, Telangana", description: "One of the flagship campuses with the highest number of sessions and students impacted." },
  cdu:          { sessions: 5, students: 200, status: "Active", location: "Hyderabad, Telangana", description: "Active hub for AI outreach sessions with strong student engagement." },
  nsrit:        { sessions: 6, students: 240, status: "Ongoing", location: "Vizag, Andhra Pradesh", description: "Partnered campus delivering consistent AI workshops to government schools." },
  nri:          { sessions: 4, students: 160, status: "Ongoing", location: "Vijayawada, Andhra Pradesh", description: "Growing campus with structured delivery of the core AI curriculum." },
  ciet:         { sessions: 3, students: 120, status: "Active", location: "Hyderabad, Telangana", description: "Recently onboarded campus showing rapid growth in sessions and student reach." },
  chevella:     { sessions: 7, students: 280, status: "Active", location: "Chevella, Telangana", description: "Rural-focused campus bringing AI education to remote government schools." },
  aurora:       { sessions: 5, students: 200, status: "Ongoing", location: "Hyderabad, Telangana", description: "Technically strong team delivering innovative AI prompting workshops." },
  annamacharya: { sessions: 4, students: 160, status: "Active", location: "Tirupati, Andhra Pradesh", description: "Southern-most campus connecting AI education to Tirupati district schools." },
}

const sessions = [
  { topic: "Introduction to AI", date: "Apr 10, 2025", students: 42 },
  { topic: "Prompt Writing", date: "Apr 18, 2025", students: 38 },
  { topic: "AI Tools Workshop", date: "Apr 28, 2025", students: 45 },
]

export default async function CampusPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params
  const campus = campusData[name.toLowerCase()]

  if (!campus) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Campus not found</h1>
          <Button asChild variant="outline" className="rounded-xl mt-4">
            <Link href="/#campuses"><ArrowLeft size={14} className="mr-1" /> Back to Campuses</Link>
          </Button>
        </div>
      </div>
    )
  }

  const statusColor = campus.status === "Active" ? "#138808" : "#FF9933"
  const displayName = name.charAt(0).toUpperCase() + name.slice(1)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border px-6 py-4 flex items-center gap-3">
        <Link href="/#campuses" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="font-bold text-base text-foreground">{displayName.toUpperCase()} Campus</h1>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <MapPin size={11} /> {campus.location}
          </p>
        </div>
        <span
          className="ml-auto text-xs font-semibold px-3 py-1 rounded-full text-white"
          style={{ backgroundColor: statusColor }}
        >
          {campus.status}
        </span>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-10 space-y-8">
        {/* Description */}
        <div className="bg-white rounded-2xl border border-border p-7 shadow-sm">
          <p className="text-sm text-muted-foreground leading-relaxed">{campus.description}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { label: "Sessions Completed", value: campus.sessions, icon: BookOpen, color: "#FF9933" },
            { label: "Students Impacted", value: campus.students, icon: Users, color: "#138808" },
            { label: "Goals Met", value: "3/3", icon: CheckCircle2, color: "#1d7adb" },
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

        {/* Session history */}
        <div>
          <h2 className="font-bold text-base text-foreground mb-4">Session History</h2>
          <div className="space-y-3">
            {sessions.map((session) => (
              <div key={session.topic} className="bg-white rounded-2xl border border-border p-5 shadow-sm flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center">
                    <CalendarCheck size={14} className="text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-foreground">{session.topic}</p>
                    <p className="text-xs text-muted-foreground">{session.date}</p>
                  </div>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
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
