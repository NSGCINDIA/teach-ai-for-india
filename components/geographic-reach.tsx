import { MapPin, Building2, School } from "lucide-react"

const states = [
  {
    name: "Telangana",
    campuses: 5,
    schools: 24,
    description: "Hyderabad, Warangal, Nizamabad and surrounding districts",
    color: "#FF9933",
    bg: "from-orange-50 to-white",
  },
  {
    name: "Andhra Pradesh",
    campuses: 3,
    schools: 17,
    description: "Vijayawada, Vizag, Tirupati and surrounding districts",
    color: "#138808",
    bg: "from-green-50 to-white",
  },
]

export default function GeographicReach() {
  return (
    <section
      className="section-padding text-white"
      style={{
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 60%, #0a2a0a 100%)",
      }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: "#FF9933" }}>
            Geographic Reach
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-white text-balance">
            2 States.{" "}
            <span style={{ color: "#FF9933" }}>One</span>{" "}
            <span style={{ color: "#138808" }}>Mission.</span>
          </h2>
          <p className="text-white/70 mt-3 max-w-xl mx-auto leading-relaxed">
            Currently operational across Telangana and Andhra Pradesh, bringing future-ready education
            to both urban and remote village schools.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {states.map((state) => (
            <div
              key={state.name}
              className="card-hover rounded-2xl p-7 border flex flex-col gap-5"
              style={{
                background: "rgba(255,255,255,0.05)",
                borderColor: `${state.color}40`,
              }}
            >
              {/* Header */}
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${state.color}22` }}
                >
                  <MapPin size={18} style={{ color: state.color }} />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">{state.name}</h3>
                  <p className="text-xs text-white/50">{state.description}</p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div
                  className="rounded-xl p-4 flex items-center gap-3"
                  style={{ backgroundColor: `${state.color}15` }}
                >
                  <Building2 size={16} style={{ color: state.color }} />
                  <div>
                    <p className="text-xl font-extrabold text-white">{state.campuses}</p>
                    <p className="text-xs text-white/60">Campuses</p>
                  </div>
                </div>
                <div
                  className="rounded-xl p-4 flex items-center gap-3"
                  style={{ backgroundColor: `${state.color}15` }}
                >
                  <School size={16} style={{ color: state.color }} />
                  <div>
                    <p className="text-xl font-extrabold text-white">{state.schools}</p>
                    <p className="text-xs text-white/60">Schools</p>
                  </div>
                </div>
              </div>

              {/* Status badge */}
              <div
                className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full w-fit"
                style={{ backgroundColor: `${state.color}20`, color: state.color }}
              >
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: state.color }} />
                Operational
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
