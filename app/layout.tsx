import type { Metadata } from 'next'
import { Manrope, Fraunces, Anton } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AppProviders } from '@/providers/app-providers'
import './globals.css'

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
})

/**
 * The workspace display face.
 *
 * The dashboard had no display family at all: `--font-display` was an alias for
 * Manrope, so every `font-display` heading in the product rendered in the body
 * font and the utility did nothing. Fraunces is a soft, warm serif that belongs
 * beside cream surfaces and maroon, and it gives the operational side of the
 * product the same editorial voice the public site gets from Instrument Serif
 * without being the same typeface.
 *
 * `preload: false` on purpose: it is used only for page titles and the school
 * command bar, and the public site overrides `--font-display` with its own
 * serif, so preloading it on every route would buy nothing.
 */
const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
  preload: false,
  weight: ['600', '700'],
})

/**
 * The poster voice — one heading per screen, never body or section copy.
 *
 * Anton stands in for Futura Display, which is the reference for this treatment
 * but is a licensed Bauer/Neufville face: it is not on Google Fonts and cannot
 * be self-hosted without buying it. Anton is the closest freely-licensable
 * equivalent for that weight and width — heavy, condensed, flat-terminalled,
 * built for caps at large sizes.
 */
const anton = Anton({
  subsets: ['latin'],
  variable: '--font-anton',
  display: 'swap',
  preload: false,
  weight: '400',
})

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://teachaiforindia.org'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'TEACHAIFORINDIA — Student-Led AI Education Movement',
    template: '%s — TEACHAIFORINDIA',
  },
  description:
    'AI is reaching every classroom. But not every child. Applied AI literacy for government school students across Telangana & Andhra Pradesh.',
  keywords: ['AI education', 'India', 'NGO', 'government schools', 'Telangana', 'Andhra Pradesh', 'AI literacy', 'students'],
  openGraph: {
    title: 'TEACHAIFORINDIA',
    description: 'AI is reaching every classroom. But not every child.',
    url: siteUrl,
    siteName: 'TEACHAIFORINDIA',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: 'TEACHAIFORINDIA' },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${manrope.variable} ${fraunces.variable} ${anton.variable}`}
    >
      <body className="font-sans antialiased">
        <AppProviders>{children}</AppProviders>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
