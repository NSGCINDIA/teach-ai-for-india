export default function VisionSection() {
  return (
    <section
      className="section-padding"
      style={{
        background:
          "radial-gradient(ellipse 100% 80% at 50% 50%, rgba(255,153,51,0.07) 0%, rgba(19,136,8,0.07) 100%), #fafafa",
      }}
    >
      <div className="max-w-3xl mx-auto text-center">
        {/* Quote mark */}
        <div
          className="text-7xl font-serif leading-none mb-4 select-none"
          style={{ color: "#FF9933", opacity: 0.5 }}
          aria-hidden="true"
        >
          &ldquo;
        </div>

        <blockquote>
          <p className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground text-balance leading-tight">
            Every student should learn AI and use it{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #138808, #0d6606)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              responsibly.
            </span>
          </p>
          <footer className="mt-6">
            <p className="text-xs uppercase tracking-widest font-semibold text-muted-foreground">
              Our Shared Vision
            </p>
          </footer>
        </blockquote>
      </div>
    </section>
  )
}
