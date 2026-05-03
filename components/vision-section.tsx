"use client"

import { useFadeUp } from "@/hooks/use-fade-up"

export default function VisionSection() {
  const ref = useFadeUp()

  return (
    <section className="section-padding bg-white">
      <div ref={ref} className="fade-up max-w-3xl mx-auto text-center">
        {/* Decorative quote mark */}
        <div
          className="text-[5rem] font-serif leading-none mb-3 select-none"
          style={{ color: "#FF9933", opacity: 0.35 }}
          aria-hidden="true"
        >
          &ldquo;
        </div>

        <blockquote>
          <p className="text-2xl md:text-3xl lg:text-[2.2rem] font-bold text-foreground text-balance leading-snug">
            Every student should learn AI{" "}
            <br className="hidden md:block" />
            and use it{" "}
            <span style={{ color: "#138808" }}>responsibly.</span>
          </p>
          <footer className="mt-8 flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              <div className="h-px w-8" style={{ backgroundColor: "#FF9933" }} />
              <p className="section-label text-muted-foreground">Our Shared Vision</p>
              <div className="h-px w-8" style={{ backgroundColor: "#138808" }} />
            </div>
          </footer>
        </blockquote>
      </div>
    </section>
  )
}
