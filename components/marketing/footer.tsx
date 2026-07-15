import Link from 'next/link'
import { Mail, MapPin, Phone, Sparkles } from 'lucide-react'
import { getContactInfo } from '@/lib/data/public'

const SITE_LINKS = [
  { href: '/about', label: 'About' },
  { href: '/impact', label: 'Impact' },
  { href: '/campuses', label: 'Campuses' },
  { href: '/stories', label: 'Stories' },
]
const ENGAGE_LINKS = [
  { href: '/gallery', label: 'Gallery' },
  { href: '/faq', label: 'FAQ' },
  { href: '/contact', label: 'Contact' },
  { href: '/join', label: 'Volunteer' },
  { href: '/login', label: 'Login' },
]

/** Multi-column site footer with contact details from the CMS and an India-made tagline. */
export async function Footer() {
  const contact = await getContactInfo()

  return (
    <footer className="border-t border-slate-200 bg-white text-slate-600">
      <div className="container-wide px-5 py-14 md:px-8 md:py-16 lg:px-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded-md">
              <span className="grid size-8 place-items-center rounded-lg bg-brand text-white shrink-0 group-hover:scale-105 transition-transform">
                <Sparkles className="size-4.5" aria-hidden />
              </span>
              <span className="font-display text-base font-extrabold tracking-tight text-slate-900">Teach AI for India</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm text-slate-500">
              India&apos;s first student-led AI education movement — applied AI literacy for every classroom.
            </p>
          </div>

          {/* Explore */}
          <nav aria-label="Footer — Explore">
            <h2 className="section-label text-slate-400">Explore</h2>
            <ul className="mt-4 space-y-2.5">
              {SITE_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-slate-600 transition-colors hover:text-brand">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Engage */}
          <nav aria-label="Footer — Get involved">
            <h2 className="section-label text-slate-400">Get involved</h2>
            <ul className="mt-4 space-y-2.5">
              {ENGAGE_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-slate-600 transition-colors hover:text-brand">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact */}
          <div>
            <h2 className="section-label text-slate-400">Contact</h2>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-600">
              <li>
                <a href={`mailto:${contact.email}`} className="inline-flex items-center gap-2 transition-colors hover:text-brand">
                  <Mail className="size-4 shrink-0 text-slate-400" aria-hidden /> {contact.email}
                </a>
              </li>
              <li>
                <a href={`tel:${contact.phone.replace(/\s+/g, '')}`} className="inline-flex items-center gap-2 transition-colors hover:text-brand">
                  <Phone className="size-4 shrink-0 text-slate-400" aria-hidden /> {contact.phone}
                </a>
              </li>
              <li className="inline-flex items-start gap-2 text-slate-600">
                <MapPin className="mt-0.5 size-4 shrink-0 text-slate-400" aria-hidden /> {contact.address}
              </li>
            </ul>
            {contact.social.length > 0 && (
              <ul className="mt-4 flex flex-wrap gap-3">
                {contact.social.map((s) => (
                  <li key={s.label}>
                    <a
                      href={s.href}
                      className="text-sm font-medium text-slate-500 transition-colors hover:text-brand"
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-slate-100 pt-6 text-sm text-slate-500 sm:flex-row">
          <p>© {new Date().getFullYear()} Teach AI for India. All rights reserved.</p>
          <p className="inline-flex items-center gap-1.5 text-slate-500">
            Made with intent in India <span aria-hidden>🇮🇳</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
