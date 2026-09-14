import { WordReveal } from '@/components/marketing/word-reveal'

/**
 * "The Tension" — the page's first dark section. Deliberately the only other
 * dark moment besides the closing Invitation, so the contrast against the
 * warm linen sections around it carries real weight.
 */
export function Tension() {
  return (
    <section className="bg-[var(--tai-deep)] px-5 py-14 text-[var(--tai-linen)] md:px-8 md:py-20">
      <div className="max-w-4xl mx-auto text-center">
        <WordReveal
          text="AI is changing how we learn, work, and create. But access to that future is not equally distributed."
          className="font-display text-3xl leading-tight sm:text-4xl md:text-5xl lg:text-6xl"
        />
        <p className="mt-8 text-lg leading-relaxed text-white/75 md:text-xl">
          Private school students are building with AI tools that government school students have
          never even heard of. We saw that gap. We refused to accept it.
        </p>
        <div className="mx-auto mt-10 h-px w-20 bg-[var(--tai-terracotta)]" aria-hidden />
      </div>
    </section>
  )
}
