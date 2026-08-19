import type { Metadata } from 'next'
import { Manrope } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AppProviders } from '@/providers/app-providers'
import './globals.css'

const manrope = Manrope({ 
  subsets: ['latin'], 
  variable: '--font-body',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
})

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
      className={manrope.variable}
    >
      <body className="font-sans antialiased">
        <AppProviders>{children}</AppProviders>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
