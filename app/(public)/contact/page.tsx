import type { Metadata } from 'next'
import { Mail, MapPin, Phone } from 'lucide-react'
import { getContactInfo } from '@/lib/data/public'
import { PageHeader } from '@/components/marketing/page-header'
import { ContactForm } from '@/components/marketing/contact-form'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch with Teach AI for India — partner a school, ask a question, or say hello.',
}

export default async function ContactPage() {
  const contact = await getContactInfo()

  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Let’s talk"
        description="Whether you want to partner a school, support the mission, or just learn more — we’d love to hear from you."
      />

      <section className="section-padding">
        <div className="container-wide grid gap-12 lg:grid-cols-[1fr_1.4fr]">
          <aside className="space-y-6">
            <h2 className="font-display text-2xl font-bold">Reach us directly</h2>
            <ul className="space-y-5 text-sm">
              <li className="flex gap-4">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand">
                  <Mail className="size-5" aria-hidden />
                </span>
                <div>
                  <p className="font-display font-bold">Email</p>
                  <a href={`mailto:${contact.email}`} className="text-muted-foreground transition-colors hover:text-brand">
                    {contact.email}
                  </a>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand">
                  <Phone className="size-5" aria-hidden />
                </span>
                <div>
                  <p className="font-display font-bold">Phone</p>
                  <a
                    href={`tel:${contact.phone.replace(/\s+/g, '')}`}
                    className="text-muted-foreground transition-colors hover:text-brand"
                  >
                    {contact.phone}
                  </a>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand">
                  <MapPin className="size-5" aria-hidden />
                </span>
                <div>
                  <p className="font-display font-bold">Based in</p>
                  <p className="text-muted-foreground">{contact.address}</p>
                </div>
              </li>
            </ul>
          </aside>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft md:p-8">
            <h2 className="font-display text-2xl font-bold">Send us a message</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Fields marked <span className="text-error">*</span> are required.
            </p>
            <div className="mt-6">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
