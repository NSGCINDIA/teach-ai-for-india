import { School, RefreshCw, Network, Users } from "lucide-react"

const metrics = [
  { value: "41", label: "Schools Target", color: "#FF9933" },
  { value: "3", label: "Visits per School", color: "#138808" },
  { value: "2x", label: "Parallel Teams", color: "#1d7adb" },
  { value: "8+", label: "Campuses", color: "#e04040" },
]

const pillars = [
  {
    icon: School,
    title: "41 Registered Schools",
    description: "Identified for the first phase across Telangana and Andhra Pradesh districts.",
    color: "#FF9933",
  },
  {
    icon: RefreshCw,
    title: "3 Visits per School",
    description: "Three structured sessions per school ensure deep conceptual understanding and retention.",
    color: "#138808",
  },
  {
    icon: Network,
    title: "Cluster-Based Execution",
    description: "Schools grouped geographically into clusters for efficient, scalable deployment.",
    color: "#1d7adb",
  },
  {
    icon: Users,
    title: "Parallel Execution Teams",
    description: "Multiple campus teams working simultaneously to maximize outreach and coverage.",
    color: "#e04040",
  },
]

export default function ExecutionModel() {
  return (
    <section className="section-padding bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: "#138808" }}>
            Scale Through a Cluster-Based Model
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground text-balance">
            Built to Scale Rapidly
          </h2>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto leading-relaxed">
            A distributed execution model that ensures consistent quality at every school.
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {metrics.map((m) => (
            <div
              key={m.label}
              className="rounded-2xl border border-border bg-white p-6 text-center shadow-sm"
              style={{ borderTopWidth: 3, borderTopColor: m.color }}
            >
              <p className="text-3xl font-extrabold" style={{ color: m.color }}>{m.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{m.label}</p>
            </div>
          ))}
        </div>

        {/* Pillar cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {pillars.map((pillar) => {
            const Icon = pillar.icon
            return (
              <div
                key={pillar.title}
                className="card-hover rounded-2xl border border-border bg-white p-6 shadow-sm flex gap-4 items-start"
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${pillar.color}18` }}
                >
                  <Icon size={20} style={{ color: pillar.color }} />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-foreground mb-1">{pillar.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{pillar.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
