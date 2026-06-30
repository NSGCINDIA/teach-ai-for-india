import type { Metadata } from 'next'
import Link from 'next/link'
import { getContentBlock } from '@/lib/data/public'
import { FAQ_FALLBACK, type FaqContent } from '@/app/(public)/content'
import { PageHeader } from '@/components/marketing/page-header'
import { Reveal } from '@/components/marketing/reveal'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

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
        <div className="container-wide max-w-3xl">
          <Reveal>
            <Accordion type="single" collapsible className="w-full">
              {faq.items.map((item, i) => (
                <AccordionItem key={i} value={`item-${i}`}>
                  <AccordionTrigger className="text-base font-semibold">{item.question}</AccordionTrigger>
                  <AccordionContent className="text-pretty text-muted-foreground">{item.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Reveal>

          <Reveal>
            <p className="mt-10 text-center text-muted-foreground">
              Still have a question?{' '}
              <Link href="/contact" className="font-medium text-brand underline-offset-4 hover:underline">
                Get in touch
              </Link>
              .
            </p>
          </Reveal>
        </div>
      </section>
    </>
  )
}
