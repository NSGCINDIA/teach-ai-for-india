import type { Metadata } from 'next'
import { getContentBlock } from '@/lib/data/public'
import { FAQ_FALLBACK, type FaqContent } from '@/app/(public)/content'
import { PageHeader } from '@/components/marketing/page-header'
import { FAQList } from '@/components/marketing/faq-list'
import { Reveal } from '@/components/marketing/reveal'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'FAQ',
  description: 'Frequently asked questions about Teach AI for India — volunteering, partnering, and how the program works.',
}

export default async function FaqPage() {
  const faq = await getContentBlock<FaqContent>('faq', FAQ_FALLBACK)

  return (
    <>
      <PageHeader
        eyebrow="FAQ"
        title="Questions, answered"
        description="Everything you might want to know before joining, partnering, or supporting the movement."
      />

      <section className="section-padding">
        <div className="container-wide">
          <Reveal>
            <FAQList items={faq?.items || FAQ_FALLBACK.items} />
          </Reveal>
        </div>
      </section>
    </>
  )
}
