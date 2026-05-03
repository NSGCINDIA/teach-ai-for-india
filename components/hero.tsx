"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowRight, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Hero() {
  return (
    <section
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16"
      style={{
        background:
          "radial-gradient(ellipse 120% 80% at 50% 0%, rgba(255,153,51,0.12) 0%, rgba(255,255,255,0) 55%), radial-gradient(ellipse 120% 80% at 50% 100%, rgba(19,136,8,0.10) 0%, rgba(255,255,255,0) 55%), #fafafa",
      }}
    >
      {/* Decorative top stripe */}
      <div
        className="absolute top-16 left-0 right-0 h-1"
        style={{
          background: "linear-gradient(90deg, #FF9933 0%, #ffffff 50%, #138808 100%)",
        }}
      />

      <div className="max-w-5xl mx-auto px-4 md:px-8 text-center py-24">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-white shadow-sm text-sm font-medium text-foreground mb-8">
          <span
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ backgroundColor: "#138808" }}
          />
          Live Across 8 Campuses
        </div>

        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-utVImw7aIF3hRy6UnXGxCDPl9BkpVL.png"
            alt="Teach AI For India"
            width={120}
            height={120}
            className="rounded-2xl shadow-lg"
            priority
          />
        </div>

        {/* Heading */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground text-balance mb-6 leading-[1.1]">
          Building India&apos;s First{" "}
          <span
            className="inline-block"
            style={{
              background: "linear-gradient(135deg, #FF9933, #e8820a)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Student-Led
          </span>{" "}
          AI Education{" "}
          <span
            className="inline-block"
            style={{
              background: "linear-gradient(135deg, #138808, #0d6606)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Movement
          </span>
        </h1>

        {/* Subtext */}
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed text-pretty">
          Scaling AI literacy across multiple campuses, empowering government school students with
          real-world AI skills, creativity, and future-ready knowledge.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <Button
            size="lg"
            asChild
            className="text-white font-semibold px-8 rounded-xl shadow-md hover:shadow-lg transition-all hover:scale-105"
            style={{ backgroundColor: "#FF9933" }}
          >
            <Link href="#access">
              Get Started <ArrowRight size={16} className="ml-1" />
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            asChild
            className="font-semibold px-8 rounded-xl hover:scale-105 transition-all"
          >
            <Link href="#impact">
              View Impact <TrendingUp size={16} className="ml-1" />
            </Link>
          </Button>
        </div>

        {/* Trust bar */}
        <div className="mt-14 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
          {[
            { value: "1,820+", label: "Students" },
            { value: "8+", label: "Campuses" },
            { value: "2", label: "States" },
            { value: "41", label: "Schools" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <span className="font-bold text-foreground text-base">{item.value}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
