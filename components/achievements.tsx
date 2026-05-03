import { Trophy, Star, TrendingUp } from "lucide-react"

const achievements = [
  {
    icon: Trophy,
    title: "8 Schools Completed",
    description:
      "Fully graduated the first batch from all three phases of the programme, with student projects and contributions.",
    color: "#FF9933",
  },
  {
    icon: Star,
    title: "First Round Success",
    description:
      "Positive feedback from students and educators across all schools, with measurable improvement in AI literacy.",
    color: "#138808",
  },
  {
    icon: TrendingUp,
    title: "Rapid Expansion",
    description:
      "Scaled from 3 to 8 campuses in a single academic year, with further expansion already in progress.",
    color: "#1d7adb",
  },
]

export default function Achievements() {
  return (
    <section className="section-padding bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: "#FF9933" }}>
            Milestones Achieved
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground text-balance">
            Progress That Speaks
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {achievements.map((item) => {
            const Icon = item.icon
            return (
              <div
                key={item.title}
                className="card-hover rounded-2xl border border-border bg-white p-7 shadow-sm flex flex-col items-center text-center gap-5"
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: `${item.color}18` }}
                >
                  <Icon size={30} style={{ color: item.color }} />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
