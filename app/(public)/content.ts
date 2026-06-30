/**
 * Editable marketing copy lives in the `content_blocks` table and is fetched via
 * `getContentBlock(key, fallback)`. These fallbacks are the last-known-good copy
 * so the public site is never blank even before the CMS is seeded (PRD §7.1).
 */

export interface HeroContent {
  eyebrow: string
  headline: string
  subheadline: string
}

export interface MissionItem {
  icon: string
  title: string
  description: string
}
export interface MissionContent {
  eyebrow: string
  title: string
  description: string
  items: MissionItem[]
}

export interface HowItWorksStep {
  title: string
  description: string
}
export interface HowItWorksContent {
  steps: HowItWorksStep[]
}

export interface Testimonial {
  quote: string
  name: string
  role: string
}
export interface TestimonialsContent {
  items: Testimonial[]
}

export interface PartnersContent {
  items: { name: string }[]
}

export interface FaqItem {
  question: string
  answer: string
}
export interface FaqContent {
  items: FaqItem[]
}

export interface SocialLink {
  label: string
  href: string
}
export interface ContactInfo {
  email: string
  phone: string
  address: string
  social: SocialLink[]
}

export interface StoryItem {
  title: string
  excerpt: string
  campus?: string
  date?: string
}
export interface StoriesContent {
  items: StoryItem[]
}

// ─── Fallbacks ───────────────────────────────────────────────────────────────

export const HERO_FALLBACK: HeroContent = {
  eyebrow: 'A student-led AI education movement',
  headline: 'AI literacy for every Indian classroom.',
  subheadline:
    "We're building India's first student-led movement bringing applied AI education to government schools — one campus, one classroom, one student at a time.",
}

export const MISSION_FALLBACK: MissionContent = {
  eyebrow: 'Why we exist',
  title: 'Closing the AI divide before it widens',
  description:
    'Access to AI skills is becoming the defining opportunity gap of this decade. We meet it where it matters most.',
  items: [
    {
      icon: 'Sparkles',
      title: 'Applied, not abstract',
      description:
        'Students learn AI by building with it — prompts, projects, and real tools, never slideware.',
    },
    {
      icon: 'Users',
      title: 'Student-led at the core',
      description:
        'University volunteers run every session, mentoring the next generation across their own communities.',
    },
    {
      icon: 'ShieldCheck',
      title: 'Equity first',
      description:
        'We start where access is hardest: government schools across Telangana and Andhra Pradesh.',
    },
  ],
}

export const HOW_IT_WORKS_FALLBACK: HowItWorksContent = {
  steps: [
    {
      title: 'Identify',
      description: 'We map the government schools that need AI exposure the most.',
    },
    {
      title: 'Outreach',
      description: 'Campus teams connect with school leaders and build lasting trust.',
    },
    {
      title: 'Approve',
      description: 'Principals and points-of-contact greenlight a session plan together.',
    },
    {
      title: 'Deliver',
      description: 'Volunteers run hands-on, age-appropriate AI workshops in the classroom.',
    },
    {
      title: 'Report',
      description: 'Every session is documented with photos, attendance, and outcomes.',
    },
  ],
}

export const TESTIMONIALS_FALLBACK: TestimonialsContent = {
  items: [
    {
      quote:
        'The students were spellbound. For many of them it was the first time a computer felt like something they could shape, not just watch.',
      name: 'Anitha R.',
      role: 'Government High School Teacher, Warangal',
    },
    {
      quote:
        'Volunteering here changed how I see my own degree. I am not just learning AI — I am handing it forward.',
      name: 'Karthik M.',
      role: 'Campus Volunteer, Hyderabad',
    },
    {
      quote:
        'A program that treats our children as creators of technology, not just consumers. That is exactly what they deserve.',
      name: 'Suresh Kumar',
      role: 'School Principal, Vijayawada',
    },
  ],
}

export const PARTNERS_FALLBACK: PartnersContent = {
  items: [
    { name: 'University Volunteers' },
    { name: 'Government Schools' },
    { name: 'District Education Offices' },
    { name: 'Community Mentors' },
  ],
}

export const FAQ_FALLBACK: FaqContent = {
  items: [
    {
      question: 'What is Teach AI for India?',
      answer:
        'We are a student-led non-profit movement bringing applied AI literacy to government school students, beginning in Telangana and Andhra Pradesh.',
    },
    {
      question: 'Who runs the sessions?',
      answer:
        'Trained university volunteers organised into campus teams. Each campus has a lead who coordinates outreach, scheduling, and reporting.',
    },
    {
      question: 'Does it cost schools anything?',
      answer:
        'No. Every session is delivered free of charge to partner government schools.',
    },
    {
      question: 'How can I volunteer?',
      answer:
        'Head to the Join page and submit an application. Tell us your preferred campus and why you want to be part of the movement — we will be in touch.',
    },
    {
      question: 'Can my school partner with you?',
      answer:
        'Absolutely. Reach out through the Contact page and our outreach team will start the conversation.',
    },
  ],
}

export const CONTACT_INFO_FALLBACK: ContactInfo = {
  email: 'hello@teachaiforindia.org',
  phone: '+91 90000 00000',
  address: 'Hyderabad, Telangana, India',
  social: [
    { label: 'Instagram', href: '#' },
    { label: 'LinkedIn', href: '#' },
    { label: 'Twitter', href: '#' },
  ],
}

export const STORIES_FALLBACK: StoriesContent = { items: [] }
