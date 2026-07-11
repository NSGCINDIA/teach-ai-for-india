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
        'The students showed strong interest and picked things up quickly. With proper teaching, they have clear potential to grow and perform well.',
      name: 'Balaji',
      role: 'Principal, ZPH High School Sontyam',
    },
    {
      quote:
        'All the volunteers did a solid job delivering the sessions clearly and effectively. The students were fully engaged and genuinely enjoyed the learning experience.',
      name: 'Srinivas',
      role: 'Principal, ZPH High School Pendurthi',
    },
    {
      quote:
        'The sessions were very interactive and our students were eager to participate in all the hands-on AI exercises.',
      name: 'Pushpa Latha',
      role: 'Principal, ZPHS Agiripalli',
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
        'We are a student-led movement bringing applied AI literacy to government school students across Telangana and Andhra Pradesh, empowering the next generation of responsible digital creators.',
    },
    {
      question: 'Who can volunteer?',
      answer:
        'Any university student at one of our participating partner campuses can volunteer. We recruit and train volunteers to facilitate interactive AI workshops in local schools.',
    },
    {
      question: 'How do campuses join?',
      answer:
        'Higher education institutions can join the movement by establishing an official campus chapter. Student leads or college administrators can contact us to start onboarding.',
    },
    {
      question: 'How are schools selected?',
      answer:
        'We focus where the digital divide is widest, partnering with government schools, state residential schools, and Gurukulams in collaboration with local education offices.',
    },
    {
      question: 'Is there any fee?',
      answer:
        'No. Every session, curriculum material, and workshop delivered by Teach AI for India is completely free of charge to partner schools and students.',
    },
    {
      question: 'Who conducts sessions?',
      answer:
        'Sessions are conducted on the ground by trained university volunteers organized into campus teams, led by an execution lead for each session.',
    },
    {
      question: 'How can organizations partner?',
      answer:
        'We partner with educational institutions, NGOs, corporate sponsors, and government offices. Contact us or email partners@teachaiforindia.org to explore collaboration.',
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
