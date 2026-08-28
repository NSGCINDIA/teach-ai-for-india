/**
 * Editable marketing copy lives in the `content_blocks` table and is fetched via
 * `getContentBlock(key, fallback)`. These fallbacks are the last-known-good copy
 * so the public site is never blank even before the CMS is seeded (PRD §7.1).
 */

export interface HeroContent {
  eyebrow: string
  headline: string
  subheadline: string
  /** Verified current figures, e.g. "1,842 students addressed · 18 schools · 9 campuses" — never wired to live/unverified stats, so the hero can never show a figure that hasn't been confirmed. */
  proofLine: string
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
  category?: string
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

// ─── About / origin story ────────────────────────────────────────────────────

export interface OriginStoryIntro {
  eyebrow: string
  headline: string
  body: string
}

export interface OriginMoment {
  eyebrow: string
  /** Exactly 3 items: "Giving back to society" → "What can we uniquely teach?" → "AI" */
  progression: string[]
  body: string
}

export interface FirstClassroom {
  eyebrow: string
  headline: string
  metaLine: string
  body: string
}

export interface HumanMoment {
  leadIn: string
  quote: string
  attribution: string
  tag: string
  afterNote: string
}

export interface WhatWeBelieve {
  notLine: string
  believeLine: string
}

export interface OperatingLoopStep {
  title: string
  description: string
}
export interface OperatingLoopContent {
  eyebrow: string
  headline: string
  supportingLine: string
  steps: OperatingLoopStep[]
}

export interface VolunteerNote {
  body: string
}

export interface WhyWeContinue {
  eyebrow: string
  headline: string
  body: string
  outcomes: string[]
  ctaLabel: string
  ctaNote: string
}

export interface OriginStoryContent {
  intro: OriginStoryIntro
  originMoment: OriginMoment
  firstClassroom: FirstClassroom
  humanMoment: HumanMoment
  belief: WhatWeBelieve
  operatingLoop: OperatingLoopContent
  volunteerNote: VolunteerNote
  whyWeContinue: WhyWeContinue
}

// ─── Fallbacks ───────────────────────────────────────────────────────────────

export const HERO_FALLBACK: HeroContent = {
  eyebrow: 'Student-led · AI education · India',
  headline: "The future shouldn't\ndepend on what school\nyou go to.",
  subheadline:
    'We bring practical AI literacy into government-school classrooms through student-led campus teams — helping students understand what AI is, how they can use it, and how to use it responsibly.',
  proofLine: '1,842 students addressed · 18 schools · 9 campuses',
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
        'We are a student-led non-profit movement bringing applied AI literacy to government school students, beginning in Telangana and Andhra Pradesh.',
      category: 'General',
    },
    {
      question: 'Who can volunteer?',
      answer:
        'Trained university volunteers organised into campus teams. Each campus has a lead who coordinates outreach, scheduling, and reporting.',
      category: 'Volunteering',
    },
    {
      question: 'What topics are covered in the curriculum?',
      answer:
        'Our curriculum focuses on applied AI literacy: prompt engineering, creative AI tools, generative safe-use guidelines, and introduction to Python coding basics.',
      category: 'General',
    },
    {
      question: 'How do I apply as a volunteer?',
      answer:
        'Head to the Join page and submit an application. Tell us your preferred campus and why you want to be part of the movement — we will be in touch.',
      category: 'Volunteering',
    },
    {
      question: 'What is the time commitment required?',
      answer:
        'Typically 3-4 hours per week, which includes local travel to schools, classroom session delivery, and short reporting tasks.',
      category: 'Volunteering',
    },
    {
      question: 'Do I need prior coding or teaching experience?',
      answer:
        'No. We provide comprehensive training, sandbox environments, and curriculum materials to prepare all volunteers for classroom teaching.',
      category: 'Volunteering',
    },
    {
      question: 'Does it cost schools anything?',
      answer:
        'No. Every session and learning material is delivered entirely free of charge to partner government schools.',
      category: 'Partnering',
    },
    {
      question: 'How can our school partner with you?',
      answer:
        'Reach out through the Contact page and our outreach team will start the coordination process.',
      category: 'Partnering',
    },
    {
      question: 'What infrastructure does the school need?',
      answer:
        'A computer lab with internet connectivity is ideal. If labs are offline or lack equipment, we coordinate with campuses to arrange offline visual setups.',
      category: 'Partnering',
    },
  ],
}

export const CONTACT_INFO_FALLBACK: ContactInfo = {
  email: 'hello@teachaiforindia.org',
  phone: '+91 90000 00000',
  address: 'NxtWave of Innovation in Advanced Technologies: NIAT, Financial District, Nanakramguda, Telangana 500032',
  social: [
    { label: 'Instagram', href: 'https://www.instagram.com/teachai_for.india?igsh=Mnh2OGg2Mjd2ajdh' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/company/teach-ai-for-india-tai/' },
    { label: 'Twitter', href: '#' },
  ],
}

export const STORIES_FALLBACK: StoriesContent = { items: [] }

export const ORIGIN_STORY_FALLBACK: OriginStoryContent = {
  intro: {
    eyebrow: 'Why we exist',
    headline: 'We learned something valuable. We decided to give it back.',
    body:
      "Teach AI for India started in March 2026, inside a small group of NIAT students who wanted to give something back to their community. We weren't trying to build an organization. We were trying to answer one question: what do we actually know that's worth teaching someone else? This is the story of how we answered it, what happened in the first classroom, and why we kept going.",
  },
  originMoment: {
    eyebrow: 'March 2026',
    progression: ['Giving back to society', 'What can we uniquely teach?', 'AI'],
    body:
      "It started inside NSGC, a student group at NIAT looking for a real way to give back. The first instinct was the obvious one — teach mathematics, teach physics, the subjects we knew best. But plenty of people were already teaching those. So we asked a harder question: what could we teach that almost no one else was? We were already learning AI ourselves. No one was teaching it to the students who needed it most.",
  },
  firstClassroom: {
    eyebrow: 'The first classroom',
    headline: 'Our first classroom',
    metaLine: 'MPPS Nandakramaguda · ~150 students · 1 hr 15 min · First session',
    body:
      "Our first pilot was MPPS Nandakramaguda, a government school a short distance from our own campus. About 150 students showed up. We had one hour and fifteen minutes, and one goal — show them what AI actually is. We expected to be introducing something unfamiliar. Instead we found students who already knew AI existed. They'd used image generators. They'd talked to chatbot apps. What they hadn't been shown was what else it could do, or how to use it well.",
  },
  humanMoment: {
    leadIn: 'The session ended. The questions didn’t.',
    quote: 'Anna, when are you coming again?',
    attribution: '— A student, MPPS Nandakramaguda',
    tag: 'Rangareddy · Class 7 · First session',
    afterNote:
      'That one question told us more than any survey could. There was curiosity. There was a connection. There was a reason to come back.',
  },
  belief: {
    notLine: "We don't believe every student needs to become an AI expert.",
    believeLine:
      'We believe every student should understand what AI is, know how to use it, and use it responsibly.',
  },
  operatingLoop: {
    eyebrow: 'How the movement runs',
    headline: "Student-led isn't a tagline. It's how the work gets done.",
    supportingLine:
      'Finding schools, building the curriculum, running the session, improving it — every part of this is done by students, for students.',
    steps: [
      { title: 'Identify a school', description: 'Students map which government schools need this the most and make the first approach.' },
      { title: 'Build the session', description: 'Content, fellows, and cohort plans come together before anyone sets foot in a classroom.' },
      { title: 'Get the campus ready', description: 'Principal approvals, campus permissions, transport, funding — coordinated end to end by students.' },
      { title: 'Enter the classroom', description: 'Volunteers run the session. No script — just the plan and the room.' },
      { title: 'Listen to students', description: "What worked. What didn't. What they actually asked for." },
      { title: 'Improve', description: 'The next session is built on what the last one taught us.' },
      { title: 'Go again', description: 'Another school. Another classroom. The loop keeps running.' },
    ],
  },
  volunteerNote: {
    body:
      "The volunteer program is still taking shape. But the idea behind it is simple: you don't join because you want NGO experience on a résumé. You join because there's something you've learned, and you want to give some of it back.",
  },
  whyWeContinue: {
    eyebrow: 'Why we keep going',
    headline: 'The number of students we reach is only the beginning.',
    body: 'We want to see what they do with what they learned.',
    outcomes: [
      'Studying',
      'Creating content',
      'Building things',
      'Improving their work',
      'Starting something of their own',
      'Discovering a new opportunity',
    ],
    ctaLabel: 'Register your interest',
    ctaNote: "The volunteer program is still being planned. If you want to give some of what you've learned back, this is where to start.",
  },
}
