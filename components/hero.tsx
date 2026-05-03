"use client"

import Link from "next/link"
import { ArrowRight, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useFadeUp } from "@/hooks/use-fade-up"

const trustStats = [
  { value: "1,820+", label: "Students" },
  { value: "8+", label: "Campuses" },
  { value: "2", label: "States" },
  { value: "41", label: "Schools" },
]

export default function Hero() {
  const badgeRef = useFadeUp()
  const headingRef = useFadeUp()
  const subRef = useFadeUp()
  const ctaRef = useFadeUp()
  const statsRef = useFadeUp()

  return (
    <section
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-[60px]"
      style={{
        background:
          "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(255,153,51,0.10) 0%, transparent 65%), #fafafa",
      }}
    >
      {/* India stripe accent at top */}
      <div className="absolute top-[60px] left-0 right-0 h-[2px] india-stripe opacity-70" />

      <div className="max-w-4xl mx-auto px-5 md:px-10 text-center py-28">
        {/* Live badge */}
        <div ref={badgeRef} className="fade-up inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-border bg-white shadow-sm text-xs font-semibold text-foreground mb-7">
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: "#138808" }} />
          Live Across 8 Campuses
        </div>

        {/* Heading */}
        <h1
          ref={headingRef}
          className="fade-up stagger-1 text-[2.6rem] md:text-6xl lg:text-[4.5rem] font-extrabold tracking-tight text-foreground text-balance leading-[1.05] mb-5"
        >
          {"Building India's First"}{" "}
          <span style={{ color: "#FF9933" }}>Student-Led</span>{" "}
          AI Education{" "}
          <span style={{ color: "#138808" }}>Movement</span>
        </h1>

        {/* Subtext */}
        <p
          ref={subRef}
          className="fade-up stagger-2 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-9 leading-relaxed text-pretty"
        >
          Scaling AI literacy across government schools through campus-led execution, structured learning, and real community impact.
        </p>

        {/* CTA Buttons */}
        <div ref={ctaRef} className="fade-up stagger-3 flex flex-col sm:flex-row gap-3 justify-center items-center">
          <Button
            size="lg"
            asChild
            className="text-white font-semibold px-8 rounded-xl shadow-sm hover:shadow-md transition-all hover:opacity-90 h-12 text-base"
            style={{ backgroundColor: "#FF9933" }}
          >
            <Link href="#access">
              Get Started <ArrowRight size={16} className="ml-1.5" />
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            asChild
            className="font-semibold px-8 rounded-xl h-12 text-base hover:bg-muted transition-all"
          >
            <Link href="#impact">
              View Impact <TrendingUp size={16} className="ml-1.5" />
            </Link>
          </Button>
        </div>

        {/* Trust bar */}
        <div ref={statsRef} className="fade-up stagger-4 mt-16 flex flex-wrap items-center justify-center gap-8">
          {trustStats.map((item, i) => (
            <div key={item.label} className="flex flex-col items-center gap-0.5">
              <span className="text-2xl font-extrabold text-foreground leading-none">{item.value}</span>
              <span className="text-xs text-muted-foreground uppercase tracking-widest">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
