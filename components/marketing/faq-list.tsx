'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, HelpCircle, MessageSquare, ArrowRight, Sparkles } from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { FaqItem } from '@/app/(public)/content'

interface FaqListProps {
  items: FaqItem[]
}

const CATEGORIES = ['all', 'General', 'Volunteering', 'Partnering'] as const
type CategoryType = typeof CATEGORIES[number]

export function FAQList({ items }: FaqListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<CategoryType>('all')

  // Filter logic
  const filteredItems = items.filter((item) => {
    const categoryMatches =
      activeCategory === 'all' || (item.category && item.category.toLowerCase() === activeCategory.toLowerCase())
    const searchMatches =
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())
    return categoryMatches && searchMatches
  })

  return (
    <div className="space-y-10">
      {/* Search and Filters Section */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between border-b border-border/80 pb-8">
        {/* Search Input */}
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3.5 top-1/2 size-4.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search questions or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 border-border bg-background/50 hover:bg-background focus:bg-background transition-all focus-visible:ring-brand/20"
          />
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap gap-2 overflow-x-auto no-scrollbar scroll-smooth">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`rounded-xl px-4 py-2 text-xs font-bold tracking-wide uppercase transition-all whitespace-nowrap shadow-soft hover:-translate-y-0.5 border ${
                activeCategory === category
                  ? 'bg-brand text-white border-brand hover:bg-brand/90'
                  : 'bg-card text-muted-foreground border-border hover:bg-card/85 hover:text-foreground'
              }`}
            >
              {category === 'all' ? 'All Questions' : category}
            </button>
          ))}
        </div>
      </div>

      {/* Accordion Questions List */}
      <div className="max-w-4xl mx-auto">
        {filteredItems.length > 0 ? (
          <Accordion type="single" collapsible className="w-full space-y-4">
            {filteredItems.map((item, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="border border-border bg-card/40 rounded-2xl px-6 hover:bg-card hover:border-brand/25 transition-all shadow-soft duration-300"
              >
                <AccordionTrigger className="text-left text-base font-bold py-5 hover:no-underline [&[data-state=open]]:text-brand">
                  <span className="flex items-center gap-3">
                    <HelpCircle className="size-5 text-brand/75 shrink-0" />
                    {item.question}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-pretty text-muted-foreground text-sm pb-5 leading-relaxed pl-8 border-t border-border/40 pt-4 mt-1">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <div className="text-center py-16 rounded-2xl border border-dashed border-border bg-muted/20">
            <HelpCircle className="mx-auto size-12 text-muted-foreground/50 animate-pulse" />
            <h3 className="mt-4 font-display text-lg font-bold">No results found</h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
              We couldn't find any questions matching "{searchQuery}". Try refining your search or switching categories.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery('')
                setActiveCategory('all')
              }}
              className="mt-5"
            >
              Reset search
            </Button>
          </div>
        )}
      </div>

      {/* CTA Box */}
      <div className="relative overflow-hidden rounded-3xl bg-muted/40 border border-border p-8 md:p-10 shadow-soft-lg max-w-4xl mx-auto">
        <div aria-hidden className="pointer-events-none absolute -bottom-40 -left-40 size-80 rounded-full bg-gradient-to-br from-brand/5 to-transparent blur-2xl" />
        <div className="relative z-10 flex flex-col items-center justify-between gap-6 md:flex-row text-center md:text-left">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1 text-xs font-bold text-brand uppercase tracking-wider">
              <Sparkles className="size-3" /> Still have questions?
            </span>
            <h3 className="font-display text-xl font-bold tracking-tight text-foreground">
              Can't find the answer you are looking for?
            </h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Whether you are a potential volunteer, local government official, or corporate sponsor, our team is here to help.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto shrink-0">
            <Link 
              href="/contact"
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all h-10 px-5 shadow-soft hover:-translate-y-0.5 w-full sm:w-auto bg-brand text-white hover:bg-brand/90"
            >
              <MessageSquare className="size-4" />
              Get in touch
            </Link>
            <Link 
              href="/join"
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all h-10 px-5 shadow-soft hover:-translate-y-0.5 w-full sm:w-auto border border-border bg-card hover:bg-card/85"
            >
              Join movement
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
