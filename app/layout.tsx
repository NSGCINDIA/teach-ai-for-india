import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'Teach AI For India — Student-Led AI Education Movement',
  description:
    'Scaling AI literacy across government schools in India. Empowering students with real-world AI skills, creativity, and future-ready knowledge across 8+ campuses in Telangana & Andhra Pradesh.',
  keywords: 'AI education, India, NGO, students, government schools, Telangana, Andhra Pradesh',
  openGraph: {
    title: 'Teach AI For India',
    description: 'Building India\'s First Student-Led AI Education Movement',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} bg-background`}>
      <body className="font-sans antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
