import type { Metadata } from 'next'
import { Inter, Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AppProviders } from '@/providers/app-providers'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-body', display: 'swap' })
const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['500', '600', '700', '800'],
  display: 'swap',
})
const jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono-code', display: 'swap' })

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://teachaiforindia.org'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Teach AI for India — Student-Led AI Education Movement',
    template: '%s — Teach AI for India',
  },
  description:
    'Building India\'s first student-led AI education movement. Applied AI literacy for government school students across Telangana & Andhra Pradesh.',
  keywords: ['AI education', 'India', 'NGO', 'government schools', 'Telangana', 'Andhra Pradesh', 'AI literacy', 'students'],
  openGraph: {
    title: 'Teach AI for India',
    description: 'Building India\'s first student-led AI education movement.',
    url: siteUrl,
    siteName: 'Teach AI for India',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: 'Teach AI for India' },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${jakarta.variable} ${jetbrains.variable}`}
    >
      <body className="font-sans antialiased">
        <AppProviders>{children}</AppProviders>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
