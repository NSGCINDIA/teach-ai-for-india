import { Mail, Phone, MapPin, Clock, ArrowRight } from 'lucide-react'
import { Reveal } from '@/components/marketing/reveal'
import { ContactForm } from '@/components/marketing/contact-form'
import { landingContent } from '@/app/(public)/content'

export function FinalConversationSection() {
  const content = landingContent.finalCta

  return (
    <section id="start-a-conversation" className="tai-section relative overflow-hidden bg-card/40 border-t border-border/80 py-16 md:py-24">
      <div className="tai-container-wide px-5 md:px-8 lg:px-12">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Left Column: Heading, Microcopy, Contact Details */}
          <div className="lg:col-span-5">
            <Reveal>
              <div className="flex items-center gap-2 font-mono text-sm font-bold uppercase tracking-[0.2em] text-brand">
                <span>{content.eyebrow}</span>
                <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[11px] font-semibold text-brand">
                  N&deg; 14
                </span>
              </div>

              <h2 className="tai-text-display mt-3 font-display text-foreground">
                {content.title}
              </h2>

              {/* Mandatory Microcopy */}
              <div className="mt-4 rounded-xl border border-brand/20 bg-brand/5 p-3.5">
                <p className="font-medium text-sm text-brand">
                  {content.microcopy}
                </p>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
                {content.description}
              </p>
            </Reveal>

            {/* Direct Channels */}
            <div className="mt-8 space-y-4 border-t border-border/60 pt-6">
              <Reveal delay={0.1}>
                <a
                  href={`mailto:${content.email}?subject=Teach%20AI%20for%20India%20Inquiry`}
                  className="group flex items-center gap-3 text-sm text-muted-foreground transition-colors hover:text-brand"
                >
                  <span className="grid size-10 place-items-center rounded-xl bg-muted text-brand group-hover:bg-brand group-hover:text-white transition-colors">
                    <Mail className="size-4" />
                  </span>
                  <div>
                    <span className="block text-xs font-mono uppercase text-muted-foreground">Direct Email</span>
                    <span className="font-semibold text-foreground group-hover:text-brand">{content.email}</span>
                  </div>
                </a>
              </Reveal>

              <Reveal delay={0.15}>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="grid size-10 place-items-center rounded-xl bg-muted text-brand">
                    <MapPin className="size-4" />
                  </span>
                  <div>
                    <span className="block text-xs font-mono uppercase text-muted-foreground">Locations</span>
                    <span className="font-semibold text-foreground">{content.location}</span>
                  </div>
                </div>
              </Reveal>

              <Reveal delay={0.2}>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="grid size-10 place-items-center rounded-xl bg-muted text-brand">
                    <Clock className="size-4" />
                  </span>
                  <div>
                    <span className="block text-xs font-mono uppercase text-muted-foreground">Response Time</span>
                    <span className="font-semibold text-foreground">{content.promise}</span>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>

          {/* Right Column: Interactive Form */}
          <div className="lg:col-span-7">
            <Reveal delay={0.15}>
              <div className="rounded-3xl border border-border bg-card p-6 shadow-md sm:p-8">
                <h3 className="font-display text-xl font-bold text-foreground">
                  Send a Message to Our Student Coordinators
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Let us know if you represent a school, organization, company, or are an educator.
                </p>

                <div className="mt-6">
                  <ContactForm />
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}
