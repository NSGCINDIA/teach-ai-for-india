import Link from 'next/link'
import { Mail, MapPin, Phone } from 'lucide-react'
import { getContactInfo } from '@/lib/data/public'

const EXPLORE_LINKS = [
  { href: '/about', label: 'About' },
  { href: '/impact', label: 'Impact' },
  { href: '/campuses', label: 'Campuses' },
  { href: '/stories', label: 'Stories' },
  { href: '/gallery', label: 'Gallery' },
]
const INVOLVED_LINKS = [
  { href: '/join', label: 'Volunteer' },
  { href: '/faq', label: 'FAQ' },
  { href: '/contact', label: 'Contact' },
  { href: '/join', label: 'Partner' },
]

/** Dark, utilitarian site footer — the last of the page's three dark moments. */
export async function Footer() {
  const contact = await getContactInfo()

  return (
    <footer className="bg-[var(--tai-ink)] text-white/70">
      <div className="tai-container-wide px-5 pb-10 pt-20 md:px-8 lg:px-12">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="text-sm font-bold uppercase tracking-wide text-white">
              TEACH <span className="text-[var(--tai-crimson-subtle)]">AI</span> FOR INDIA
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/50">
              Student-led applied AI education for every classroom.
            </p>
            <p className="mt-3 text-sm text-white/40">Based in Hyderabad, Telangana</p>
          </div>

          <nav aria-label="Footer — Explore">
            <h2 className="tai-eyebrow text-white/40">Explore</h2>
            <ul className="mt-4 space-y-2.5">
              {EXPLORE_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-white/60 transition-colors hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Footer — Get involved">
            <h2 className="tai-eyebrow text-white/40">Get involved</h2>
            <ul className="mt-4 space-y-2.5">
              {INVOLVED_LINKS.map((l, i) => (
                <li key={`${l.href}-${i}`}>
                  <Link href={l.href} className="text-sm text-white/60 transition-colors hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="tai-eyebrow text-white/40">Connect</h2>
            <ul className="mt-4 space-y-2.5 text-sm text-white/60">
              <li>
                <a href={`mailto:${contact.email}`} className="inline-flex items-center gap-2 transition-colors hover:text-white">
                  <Mail className="size-4 shrink-0 text-white/30" aria-hidden /> {contact.email}
                </a>
              </li>
              <li>
                <a href={`tel:${contact.phone.replace(/\s+/g, '')}`} className="inline-flex items-center gap-2 transition-colors hover:text-white">
                  <Phone className="size-4 shrink-0 text-white/30" aria-hidden /> {contact.phone}
                </a>
              </li>
              <li className="inline-flex items-start gap-2">
                <MapPin className="mt-0.5 size-4 shrink-0 text-white/30" aria-hidden /> {contact.address}
              </li>
            </ul>
            {contact.social.length > 0 && (
              <ul className="mt-4 flex flex-wrap gap-3">
                {contact.social.map((s) => (
                  <li key={s.label}>
                    <a
                      href={s.href}
                      className="text-sm font-medium text-white/50 transition-colors hover:text-white"
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

        <div className="mt-16 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-sm text-white/40 sm:flex-row">
          <p>© {new Date().getFullYear()} Teach AI for India. All rights reserved.</p>
          <p className="inline-flex items-center gap-1.5">
            Made with intent in India <span aria-hidden>🇮🇳</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
