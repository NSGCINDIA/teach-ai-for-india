import type { Metadata } from 'next'
import { Inter, Plus_Jakarta_Sans } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AppProviders } from '@/providers/app-providers'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-body', display: 'swap' })

// No `weight` list on purpose. Naming weights makes next/font emit a separate
// static face per weight, and the browser then downloads each one it encounters
// — the latin subset alone was ~27 KB × 500/600/700/800. Omitting `weight` picks
// up the variable font instead: one file, every weight, ~a quarter of the bytes.
const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

// JetBrains Mono was dropped: its latin subset was a 40 KB high-priority
// download competing with render-blocking CSS, and it is only ever used for
// incidental labels — a mock URL bar, certificate serials, inline code spans —
// where a system mono is indistinguishable. See --font-mono in globals.css.

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://teachaiforindia.org'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'TEACHAIFORINDIA — Student-Led AI Education Movement',
    template: '%s — TEACHAIFORINDIA',
  },
  description:
    'Building India\'s first student-led AI education movement. Applied AI literacy for government school students across Telangana & Andhra Pradesh.',
  keywords: ['AI education', 'India', 'NGO', 'government schools', 'Telangana', 'Andhra Pradesh', 'AI literacy', 'students'],
  openGraph: {
    title: 'TEACHAIFORINDIA',
    description: 'Building India\'s first student-led AI education movement.',
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
      className={`${inter.variable} ${jakarta.variable}`}
    >
      <body className="font-sans antialiased">
        <AppProviders>{children}</AppProviders>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
