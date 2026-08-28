import { WordReveal } from '@/components/marketing/word-reveal'

/**
 * "The Tension" — the page's first dark section. Deliberately the only other
 * dark moment besides the closing Invitation, so the contrast against the
 * warm linen sections around it carries real weight.
 */
export function Tension() {
  return (
    <section className="bg-[var(--tai-deep)] px-5 py-24 text-[var(--tai-linen)] md:px-8 md:py-32">
      <div className="tai-prose mx-auto text-center">
        <WordReveal
          text="AI is changing how we learn, work, and create. But access to that future is not equally distributed."
          className="font-display text-3xl leading-tight md:text-5xl"
        />
        <p className="mt-8 text-base leading-relaxed text-white/60 md:text-lg">
          Private school students are building with AI tools that government school students have
          never even heard of. We saw that gap. We refused to accept it.
        </p>
        <div className="mx-auto mt-10 h-px w-20 bg-[var(--tai-terracotta)]" aria-hidden />
      </div>
    </section>
  )
}
