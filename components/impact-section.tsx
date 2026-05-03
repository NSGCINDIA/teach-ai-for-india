import { Users, School, CalendarCheck, Map, Building2, Heart } from "lucide-react"

const stats = [
  {
    value: "1,820+",
    label: "Students Impacted",
    icon: Users,
    color: "#FF9933",
  },
  {
    value: "41",
    label: "Schools Targeted",
    icon: School,
    color: "#138808",
  },
  {
    value: "123",
    label: "Sessions Planned",
    icon: CalendarCheck,
    color: "#1d7adb",
  },
  {
    value: "2",
    label: "States",
    icon: Map,
    color: "#FF9933",
  },
  {
    value: "8+",
    label: "Campuses",
    icon: Building2,
    color: "#138808",
  },
  {
    value: "30+",
    label: "Volunteers",
    icon: Heart,
    color: "#e04040",
  },
]

export default function ImpactSection() {
  return (
    <section id="impact" className="section-padding" style={{ backgroundColor: "#f8f9fa" }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: "#FF9933" }}>
            Our Growing Impact
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground text-balance">
            Making a Real Difference Across India
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <div
                key={stat.label}
                className="card-hover bg-white rounded-2xl border border-border p-6 flex flex-col items-center text-center gap-3 shadow-sm"
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${stat.color}18` }}
                >
                  <Icon size={20} style={{ color: stat.color }} />
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-foreground leading-none">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{stat.label}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
