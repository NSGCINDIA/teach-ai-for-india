'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import {
  Search,
  HelpCircle,
  MessageSquare,
  ArrowRight,
  Sparkles,
  BookOpen,
  Users,
  Building,
  ShieldCheck,
  X,
  Compass,
} from 'lucide-react'
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
  items?: FaqItem[]
}

const CATEGORY_ORDER = [
  'All',
  'General',
  'Students',
  'Volunteers',
  'Schools',
  'Parents',
  'Partners & CSR',
  'Funding & Privacy',
]

function normalizeCategory(cat?: string): string {
  if (!cat) return 'General'
  const trimmed = cat.trim()
  const lower = trimmed.toLowerCase()

  if (lower.includes('student')) return 'Students'
  if (lower.includes('volunteer')) return 'Volunteers'
  if (lower.includes('school')) return 'Schools'
  if (lower.includes('parent')) return 'Parents'
  if (lower.includes('csr') || lower.includes('partner')) return 'Partners & CSR'
  if (lower.includes('fund') || lower.includes('privac') || lower.includes('legal')) return 'Funding & Privacy'
  if (lower.includes('about') || lower.includes('general')) return 'General'

  return trimmed
}

export function FAQList({ items = [] }: FaqListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<string>('All')

  const safeItems = useMemo(() => {
    if (!Array.isArray(items)) return []
    return items.map((item) => ({
      ...item,
      normalizedCategory: normalizeCategory(item.category),
    }))
  }, [items])

  // Count items per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: safeItems.length }
    safeItems.forEach((item) => {
      const cat = item.normalizedCategory
      counts[cat] = (counts[cat] || 0) + 1
    })
    return counts
  }, [safeItems])

  // Available categories based on CATEGORY_ORDER and actual data
  const availableCategories = useMemo(() => {
    const set = new Set<string>(['All'])
    safeItems.forEach((item) => set.add(item.normalizedCategory))

    // Sort according to CATEGORY_ORDER
    return CATEGORY_ORDER.filter((cat) => set.has(cat))
  }, [safeItems])

  // Filter items by search query and category
  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    const isAll = activeCategory === 'All'

    return safeItems.filter((item) => {
      const matchesCategory = isAll || item.normalizedCategory === activeCategory

      if (!matchesCategory) return false

      if (!query) return true

      const q = (item.question || '').toLowerCase()
      const a = (item.answer || '').toLowerCase()
      const c = (item.normalizedCategory || '').toLowerCase()

      return q.includes(query) || a.includes(query) || c.includes(query)
    })
  }, [safeItems, activeCategory, searchQuery])

  return (
    <div className="space-y-12">
      {/* 1. Search Bar & Category Navigation */}
      <div className="space-y-6">
        {/* Smart Search Bar */}
        <div className="max-w-2xl mx-auto">
          <div className="relative flex items-center">
            <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              placeholder="Search your question (e.g. curriculum, laptop, volunteer, CSR)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-10 py-6 text-base rounded-2xl border-border/80 bg-card shadow-soft hover:border-brand/30 focus:border-brand focus-visible:ring-2 focus-visible:ring-brand/20 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors"
                aria-label="Clear search"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
        </div>

        {/* Category Tabs Pill Bar */}
        <div className="relative">
          <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto no-scrollbar py-2 px-1">
            {availableCategories.map((category) => {
              const isActive = activeCategory === category
              const count = categoryCounts[category] || 0

              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold tracking-wide transition-all whitespace-nowrap border shadow-soft hover:-translate-y-0.5 shrink-0 ${
                    isActive
                      ? 'bg-brand text-white border-brand shadow-brand/20 shadow-md'
                      : 'bg-card text-muted-foreground border-border hover:border-brand/30 hover:text-foreground'
                  }`}
                >
                  <span>{category}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none ${
                      isActive ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* 2. Quick Audience Directional Callouts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
        <Link
          href="/join"
          className="group flex flex-col justify-between rounded-2xl border border-border bg-card/60 p-5 hover:bg-card hover:border-brand/40 shadow-soft hover:shadow-soft-lg transition-all"
        >
          <div className="flex items-start gap-3.5 mb-3">
            <div className="rounded-xl bg-brand/10 p-2.5 text-brand shrink-0 group-hover:scale-105 transition-transform">
              <Users className="size-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground group-hover:text-brand transition-colors">
                Want to Teach?
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                Join a university campus chapter and facilitate AI workshops in government schools.
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 text-xs font-bold text-brand group-hover:gap-2 transition-all self-end mt-2">
            Apply to Volunteer <ArrowRight className="size-3.5" />
          </span>
        </Link>

        <Link
          href="/contact"
          className="group flex flex-col justify-between rounded-2xl border border-border bg-card/60 p-5 hover:bg-card hover:border-brand/40 shadow-soft hover:shadow-soft-lg transition-all"
        >
          <div className="flex items-start gap-3.5 mb-3">
            <div className="rounded-xl bg-brand-orange/10 p-2.5 text-brand-orange shrink-0 group-hover:scale-105 transition-transform">
              <Building className="size-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground group-hover:text-brand-orange transition-colors">
                Bring AI to Your School
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                Invite our trained campus teams to conduct free, interactive AI workshops for your students.
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 text-xs font-bold text-brand-orange group-hover:gap-2 transition-all self-end mt-2">
            Invite Us <ArrowRight className="size-3.5" />
          </span>
        </Link>

        <Link
          href="/contact"
          className="group flex flex-col justify-between rounded-2xl border border-border bg-card/60 p-5 hover:bg-card hover:border-brand/40 shadow-soft hover:shadow-soft-lg transition-all"
        >
          <div className="flex items-start gap-3.5 mb-3">
            <div className="rounded-xl bg-brand-teal/10 p-2.5 text-brand-teal shrink-0 group-hover:scale-105 transition-transform">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground group-hover:text-brand-teal transition-colors">
                CSR & Partner Support
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                Sponsor school lab kits, rural travel stipends, or explore structured CSR partnerships.
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 text-xs font-bold text-brand-teal group-hover:gap-2 transition-all self-end mt-2">
            Partner With Us <ArrowRight className="size-3.5" />
          </span>
        </Link>
      </div>

      {/* 3. Core FAQ Accordion List */}
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6 px-1">
          <div className="text-sm font-medium text-muted-foreground">
            Showing <strong className="text-foreground">{filteredItems.length}</strong>{' '}
            {filteredItems.length === 1 ? 'question' : 'questions'}
            {activeCategory !== 'All' && <span> in <strong className="text-brand">{activeCategory}</strong></span>}
            {searchQuery && <span> matching &ldquo;<span className="text-foreground">{searchQuery}</span>&rdquo;</span>}
          </div>

          {(activeCategory !== 'All' || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setActiveCategory('All')
                setSearchQuery('')
              }}
              className="text-xs font-semibold text-brand hover:underline"
            >
              Reset filters
            </button>
          )}
        </div>

        {filteredItems.length > 0 ? (
          <Accordion type="single" collapsible className="w-full space-y-3.5">
            {filteredItems.map((item, i) => (
              <AccordionItem
                key={`${item.question}-${i}`}
                value={`faq-item-${i}-${item.question.slice(0, 20)}`}
                className="group border border-border bg-card/40 rounded-2xl px-5 sm:px-7 hover:bg-card hover:border-brand/30 transition-all shadow-soft duration-300"
              >
                <AccordionTrigger className="text-left text-base sm:text-lg font-bold py-5 hover:no-underline [&[data-state=open]]:text-brand transition-colors">
                  <span className="flex items-start sm:items-center gap-3 pr-2">
                    <span className="inline-flex items-center justify-center size-6 rounded-lg bg-brand/10 text-brand text-xs font-semibold shrink-0 mt-0.5 sm:mt-0">
                      Q
                    </span>
                    <span className="flex-1">{item.question}</span>
                    <span className="hidden sm:inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground shrink-0 group-hover:bg-brand/10 group-hover:text-brand transition-colors">
                      {item.normalizedCategory}
                    </span>
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-pretty text-muted-foreground text-sm sm:text-base pb-6 leading-relaxed pl-9 border-t border-border/40 pt-4 mt-1">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          /* Empty Search State */
          <div className="text-center py-16 px-6 rounded-3xl border border-dashed border-border bg-muted/20 max-w-xl mx-auto">
            <HelpCircle className="mx-auto size-12 text-muted-foreground/40 animate-pulse mb-3" />
            <h3 className="font-display text-xl font-bold text-foreground">
              Couldn&apos;t find what you&apos;re looking for?
            </h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              {searchQuery
                ? `We didn't find any questions matching "${searchQuery}". Our team is always happy to answer your questions directly.`
                : `No questions found under ${activeCategory}. Try selecting "All" or reach out to our team directly.`}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery('')
                  setActiveCategory('All')
                }}
                className="rounded-xl w-full sm:w-auto"
              >
                Clear search & filters
              </Button>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-xl text-xs font-semibold bg-brand text-white px-4 py-2 hover:bg-brand/90 transition-all shadow-soft w-full sm:w-auto"
              >
                Contact Us Directly <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* 4. "Still Have a Question?" Closing Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-card via-card/95 to-muted/40 border border-border p-8 sm:p-10 shadow-soft-lg max-w-4xl mx-auto">
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-24 -right-24 size-72 rounded-full bg-brand/5 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -left-24 size-72 rounded-full bg-brand-orange/5 blur-3xl"
        />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          <div className="space-y-3 max-w-lg">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-brand uppercase tracking-wider">
              <Sparkles className="size-3.5" /> Still have a question?
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Didn&apos;t find your answer?
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              We&apos;re always happy to chat. Whether you&apos;re a curious student, an interested educator, or a prospective partner, drop us a note and we&apos;ll get back to you promptly.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto shrink-0">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all h-11 px-6 shadow-soft hover:-translate-y-0.5 bg-brand text-white hover:bg-brand/90"
            >
              <MessageSquare className="size-4" />
              Ask a Question
            </Link>
            <Link
              href="/stories"
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all h-11 px-6 shadow-soft hover:-translate-y-0.5 border border-border bg-card hover:bg-card/85 text-foreground"
            >
              <Compass className="size-4" />
              Explore Stories
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
