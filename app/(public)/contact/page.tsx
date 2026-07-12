import type { Metadata } from 'next'
import { Mail, MapPin, Phone, Clock, Share2, Instagram, Linkedin, Twitter } from 'lucide-react'
import { getContactInfo } from '@/lib/data/public'
import { PageHeader } from '@/components/marketing/page-header'
import { ContactForm } from '@/components/marketing/contact-form'
import { Reveal } from '@/components/marketing/reveal'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch with Teach AI for India — partner a school, ask a question, or say hello.',
}

export default async function ContactPage() {
  const contact = await getContactInfo()

  // Helper to map social labels to icons
  const getSocialIcon = (label: string) => {
    switch (label.toLowerCase()) {
      case 'instagram':
        return <Instagram className="size-5" />
      case 'linkedin':
        return <Linkedin className="size-5" />
      case 'twitter':
        return <Twitter className="size-5" />
      default:
        return <Share2 className="size-5" />
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Let’s talk"
        description="Whether you want to partner a school, support the mission, or just learn more — we’d love to hear from you."
      />

      <section className="section-padding">
        <div className="container-wide grid gap-10 lg:grid-cols-[1.1fr_1.4fr]">
          
          {/* Info Panel */}
          <aside className="space-y-8">
            <Reveal>
              <div className="space-y-3">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
                  <Clock className="size-3.5" />
                  Replies within 24 hours
                </div>
                <h2 className="font-display text-3xl font-extrabold tracking-tight">Reach us directly</h2>
                <p className="text-muted-foreground text-sm max-w-md">
                  Have a question about volunteering, school partnerships, or donations? Contact our operations hub directly.
                </p>
              </div>
            </Reveal>

            {/* Direct Cards */}
            <Reveal>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                
                {/* Email Card */}
                <div className="group flex gap-4 rounded-2xl border border-border bg-card/50 p-5 shadow-soft hover:shadow-soft-md transition-all hover:bg-card">
                  <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand group-hover:scale-105 transition-transform">
                    <Mail className="size-5.5" aria-hidden />
                  </span>
                  <div className="space-y-0.5">
                    <p className="font-display font-bold text-sm text-foreground">Email</p>
                    <a 
                      href={`mailto:${contact.email}`} 
                      className="text-sm text-muted-foreground transition-colors hover:text-brand break-all"
                    >
                      {contact.email}
                    </a>
                  </div>
                </div>

                {/* Phone Card */}
                <div className="group flex gap-4 rounded-2xl border border-border bg-card/50 p-5 shadow-soft hover:shadow-soft-md transition-all hover:bg-card">
                  <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand group-hover:scale-105 transition-transform">
                    <Phone className="size-5.5" aria-hidden />
                  </span>
                  <div className="space-y-0.5">
                    <p className="font-display font-bold text-sm text-foreground">Phone</p>
                    <a 
                      href={`tel:${contact.phone.replace(/\s+/g, '')}`} 
                      className="text-sm text-muted-foreground transition-colors hover:text-brand"
                    >
                      {contact.phone}
                    </a>
                  </div>
                </div>

                {/* Address Card */}
                <div className="group flex gap-4 rounded-2xl border border-border bg-card/50 p-5 shadow-soft hover:shadow-soft-md transition-all hover:bg-card">
                  <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand group-hover:scale-105 transition-transform">
                    <MapPin className="size-5.5" aria-hidden />
                  </span>
                  <div className="space-y-0.5">
                    <p className="font-display font-bold text-sm text-foreground">Based in</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{contact.address}</p>
                  </div>
                </div>

              </div>
            </Reveal>

            {/* Stylized Vector Map Mockup */}
            <Reveal>
              <div className="relative overflow-hidden rounded-2xl border border-border bg-muted/40 h-44 flex items-center justify-center shadow-inner group">
                <svg className="absolute inset-0 size-full stroke-muted-foreground/15 stroke-1" fill="none">
                  <path d="M-100 40h400M-100 80h400M-100 120h400M20-20v200M120-20v200M220-20v200M-20 0l160 160M160-20l-160 160" />
                  <circle cx="120" cy="70" r="50" className="fill-none stroke-brand/5 stroke-1" />
                  <circle cx="120" cy="70" r="20" className="fill-brand/5 stroke-brand/10 stroke-1" />
                </svg>
                <div className="relative z-10 flex flex-col items-center">
                  <span className="relative flex size-6 items-center justify-center">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand/30 opacity-75"></span>
                    <span className="relative inline-flex size-3.5 rounded-full bg-brand shadow-soft"></span>
                  </span>
                  <span className="mt-2 text-xs font-bold text-foreground">Hyderabad HQ</span>
                  <span className="text-[10px] text-muted-foreground">Telangana, India</span>
                </div>
              </div>
            </Reveal>

            {/* Social Panel */}
            {contact.social?.length > 0 && (
              <Reveal>
                <div className="space-y-3 pt-2">
                  <p className="font-display font-bold text-sm text-foreground">Follow our journey</p>
                  <div className="flex flex-wrap gap-2">
                    {contact.social.map((soc, i) => (
                      <a
                        key={i}
                        href={soc.href}
                        className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-xs font-semibold text-muted-foreground transition-all hover:-translate-y-0.5 hover:border-brand/35 hover:bg-brand/5 hover:text-brand shadow-soft"
                      >
                        {getSocialIcon(soc.label)}
                        {soc.label}
                      </a>
                    ))}
                  </div>
                </div>
              </Reveal>
            )}

          </aside>
 
          {/* Contact Form Container */}
          <Reveal>
            <div className="rounded-3xl border border-border bg-card p-6 shadow-soft-lg md:p-10 relative overflow-hidden">
              <div aria-hidden className="pointer-events-none absolute -top-40 -right-40 size-80 rounded-full bg-gradient-to-br from-brand/5 to-transparent blur-2xl" />
              <div className="relative z-10">
                <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">Send us a message</h2>
                <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                  Fill in the form below and we will get in touch with you. Fields marked <span className="text-error font-semibold">*</span> are required.
                </p>
                <div className="mt-8">
                  <ContactForm />
                </div>
              </div>
            </div>
          </Reveal>

        </div>
      </section>
    </>
  )
}
