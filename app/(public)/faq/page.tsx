import type { Metadata } from 'next'
import { getContentBlock } from '@/lib/data/public'
import { FAQ_FALLBACK, type FaqContent, type FaqItem } from '@/app/(public)/content'
import { FAQHero } from '@/components/marketing/faq-hero'
import { FAQList } from '@/components/marketing/faq-list'
import { FAQSchema } from '@/components/marketing/faq-schema'
import { Reveal } from '@/components/marketing/reveal'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'FAQ',
  description:
    'Frequently asked questions about Teach AI for India — our student-led classrooms powered by NIAT students, volunteer onboarding, school partnerships, student safety, and impact.',
}

export default async function FaqPage() {
  const cmsFaq = await getContentBlock<FaqContent>('faq', FAQ_FALLBACK)

  // Merge items so that all categorized questions are present, while preserving any custom CMS entries
  const seen = new Set<string>()
  const items: FaqItem[] = []

  // Add all comprehensive fallback items first
  for (const item of FAQ_FALLBACK.items) {
    if (item?.question) {
      const key = item.question.trim().toLowerCase()
      if (!seen.has(key)) {
        seen.add(key)
        items.push(item)
      }
    }
  }

  // Also include any unique custom questions added in CMS
  if (cmsFaq?.items && Array.isArray(cmsFaq.items)) {
    for (const item of cmsFaq.items) {
      if (item?.question) {
        const key = item.question.trim().toLowerCase()
        if (!seen.has(key)) {
          seen.add(key)
          items.push(item)
        }
      }
    }
  }

  return (
    <>
      {/* Schema.org FAQPage JSON-LD */}
      <FAQSchema items={items} />

      {/* 1. Hero Section */}
      <FAQHero />

      {/* 2. Interactive FAQ Section (Search, Categories, Audiences, Accordions, Closer) */}
      <section className="section-padding pt-10 md:pt-14 pb-20">
        <div className="container-wide">
          <Reveal>
            <FAQList items={items} />
          </Reveal>
        </div>
      </section>
    </>
  )
}
