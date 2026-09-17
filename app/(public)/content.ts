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
  headline: 'Every child deserves\na chance to build\nwith AI.',
  subheadline:
    'We bring practical AI education to students in government schools, helping them move from simply using technology to creating with it.',
  proofLine: '1,842 students addressed · 20+ schools · 9 campuses',
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
        'Anna, can it make a picture of Allu Arjun? Can we build something like this again next week?',
      name: 'Raju',
      role: 'Class 7, MPPS Nandakramaguda',
    },
    {
      quote:
        'I thought computers only worked for typing exams or games someone else made. Today I wrote three prompts myself and made a Telugu space picture.',
      name: 'Kavitha',
      role: 'Class 8, ZPHS Bachupally',
    },
    {
      quote:
        'When the image appeared on the screen, everyone stood up and clapped. We didn’t want the session to end.',
      name: 'Sai',
      role: 'Class 9, ZPH High School Pendurthi',
    },
    {
      quote:
        'The students showed strong interest and picked things up quickly. With proper teaching, they have clear potential to grow and perform well.',
      name: 'Balaji',
      role: 'Principal, ZPH High School Sontyam',
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
    // General / About
    {
      question: 'What is Teach AI for India?',
      answer:
        'Teach AI for India is a student-led social initiative bringing practical AI literacy to students in government and community schools. University students form campus chapters, undergo rigorous pedagogy training, and deliver interactive, hands-on AI workshops directly in local classrooms.',
      category: 'General',
    },
    {
      question: 'Is this a student-led initiative?',
      answer:
        'Yes. Teach AI for India was founded and is led by university students who believe that high-quality AI education should not be restricted by geography or family income. While mentored by technology professionals, our student campus teams handle outreach, curriculum facilitation, and classroom sessions.',
      category: 'General',
    },
    {
      question: 'Why focus on AI education in government schools?',
      answer:
        'While private schools rapidly integrate AI and computing into daily learning, government school students face a compounding opportunity gap. We teach students that AI is not an intimidating black box or just for entertainment, but a powerful creative tool they can use to solve problems in their own lives and communities.',
      category: 'General',
    },
    {
      question: 'How is Teach AI for India different from typical coding programs?',
      answer:
        'We do not teach abstract syntax or require expensive setups. Our curriculum focuses on applied AI literacy: understanding machine intelligence, prompt engineering, critical evaluation of AI outputs, creative problem solving, and safe technology habits, taught with relatable everyday analogies in local languages.',
      category: 'General',
    },
    {
      question: 'Where do you currently operate?',
      answer:
        'Our active campus chapters operate primarily across Telangana and Andhra Pradesh, with student-led teams in Hyderabad, Vijayawada, Vizag, and surrounding districts. We continue to expand as new university campus chapters complete their verification and onboarding.',
      category: 'General',
    },

    // Students
    {
      question: 'Who can attend Teach AI workshops?',
      answer:
        'Our sessions are designed primarily for middle and high school students (grades 6 through 10) in partner government and community schools. Workshops are arranged directly with school administrations during school hours or dedicated activity periods.',
      category: 'Students',
    },
    {
      question: 'Do I need my own laptop or prior coding experience?',
      answer:
        'Not at all. You do not need any prior coding knowledge, and you do not need your own device. When schools lack computer labs, our volunteers bring demonstration devices and run collaborative offline and interactive group activities.',
      category: 'Students',
    },
    {
      question: 'What will I actually learn and build in a workshop?',
      answer:
        'You will learn how AI models "see" and "think", how to write clear prompts to generate stories, artwork, and educational aids, how to identify AI hallucinations or biases, and how to brainstorm AI solutions for real community challenges.',
      category: 'Students',
    },
    {
      question: 'Is there any fee or cost to attend?',
      answer:
        'No. Teach AI for India workshops, learning materials, and student guides are 100% free of cost for all participating students.',
      category: 'Students',
    },
    {
      question: 'Do students get a certificate or recognition?',
      answer:
        'Yes. Every student who participates in our workshop series receives a Certificate of Completion celebrating their curiosity and new foundational AI skills.',
      category: 'Students',
    },

    // Volunteers
    {
      question: 'Who can volunteer with Teach AI for India?',
      answer:
        'University and college students who are passionate about education equity and technology. We look for individuals with empathy, strong communication skills, patience, and a willingness to commit to classroom teaching.',
      category: 'Volunteers',
    },
    {
      question: 'What is the weekly time commitment?',
      answer:
        'Volunteers commit approximately 3 to 4 hours per week. This includes weekend prep/sync, travel to local partner schools, interactive classroom teaching, and session feedback logging.',
      category: 'Volunteers',
    },
    {
      question: 'Do volunteers receive training before entering classrooms?',
      answer:
        'Yes. Every volunteer completes our specialized training module covering classroom management, age-appropriate AI analogies, interactive teaching pedagogy, and child safeguarding standards before their first school visit.',
      category: 'Volunteers',
    },
    {
      question: 'What does a volunteer actually do during a session?',
      answer:
        'Volunteers facilitate interactive discussions, guide students through live AI prompts and experiments, help students overcome hesitation with technology, and translate technical concepts into intuitive local language explanations.',
      category: 'Volunteers',
    },
    {
      question: 'How do campus teams work?',
      answer:
        'Volunteers belong to a recognized campus chapter led by a Campus Lead and Co-Leads. The campus team handles school outreach, session scheduling, teaching materials, and safety protocols under central guidelines.',
      category: 'Volunteers',
    },

    // Schools
    {
      question: 'How can our school host a Teach AI workshop?',
      answer:
        'School headmasters, teachers, or administrators can submit an inquiry through our Contact page or reach out to our local campus outreach team. We coordinate dates, align with school timetables, and handle curriculum delivery.',
      category: 'Schools',
    },
    {
      question: 'Does it cost our school anything?',
      answer:
        'Zero. There are no fees for the school, students, or staff. All learning resources, printed activity sheets, and mentorship are provided completely free.',
      category: 'Schools',
    },
    {
      question: 'What infrastructure or lab setup is required?',
      answer:
        'A functional computer lab with internet access is ideal, but not mandatory. Our curriculum is adaptable: our volunteer teams bring laptops, offline demonstrations, and unplugged algorithmic thinking exercises when computer labs are unavailable.',
      category: 'Schools',
    },
    {
      question: 'Can teachers observe or participate in the sessions?',
      answer:
        'Absolutely! We strongly encourage school teachers to join, observe, and engage in the sessions. We also share teaching reference kits so teachers can continue AI discussions with students throughout the year.',
      category: 'Schools',
    },
    {
      question: 'How do you ensure student safety and classroom discipline?',
      answer:
        'All sessions are conducted during school-approved hours in the presence of school staff. Volunteers adhere to strict child safeguarding protocols, professional conduct guidelines, and verified identity verification.',
      category: 'Schools',
    },

    // Parents
    {
      question: 'Is AI safe and age-appropriate for my child?',
      answer:
        'Yes. Our curriculum emphasizes digital safety, responsible AI usage, and data privacy. Students are taught to critically examine AI outputs and never share personal information online.',
      category: 'Parents',
    },
    {
      question: 'Will this interfere with my child\'s regular school studies?',
      answer:
        'No. Workshops are scheduled in coordination with school authorities during designated activity periods, substitution hours, or weekend community sessions so regular academic classes are never disrupted.',
      category: 'Parents',
    },
    {
      question: 'How does learning AI help my child\'s future?',
      answer:
        'AI is rapidly transforming every career path. By demystifying AI early, students build confidence with modern digital tools, develop logical thinking, and discover that they too can pursue careers in technology and innovation.',
      category: 'Parents',
    },

    // Partners & CSR
    {
      question: 'How can corporations or foundations partner with Teach AI for India?',
      answer:
        'Organizations can support our movement through CSR grants, sponsoring hardware/laptops for rural schools, funding campus chapter toolkits, or engaging employees as guest industry mentors.',
      category: 'Partners & CSR',
    },
    {
      question: 'What impact metrics and reporting do you provide to partners?',
      answer:
        'We provide transparent, structured impact reporting including verified student attendance, pre- and post-workshop learning assessments, school feedback surveys, and verifiable classroom documentation.',
      category: 'Partners & CSR',
    },
    {
      question: 'Can our corporate volunteers participate directly?',
      answer:
        'Yes. We organize joint volunteering and mentorship days where corporate teams can co-facilitate workshops, share industry insights, and inspire students alongside our university campus teams.',
      category: 'Partners & CSR',
    },
    {
      question: 'How is funding utilized?',
      answer:
        '100% of external contributions directly support classroom delivery: student workbook printing, offline hardware kits for schools without labs, volunteer travel stipends to remote rural schools, and curriculum development.',
      category: 'Partners & CSR',
    },

    // Funding & Privacy
    {
      question: 'How is Teach AI for India funded?',
      answer:
        'Teach AI for India operates as a grassroots student-led initiative supported by academic institutions, philanthropic partners, CSR grants, and community contributions.',
      category: 'Funding & Privacy',
    },
    {
      question: 'How do you protect student privacy and data?',
      answer:
        'We maintain strict student privacy standards. We do not collect personal identifying information (PII) from children, we do not require students to create third-party accounts, and all classroom photography is conducted strictly with institutional consent.',
      category: 'Funding & Privacy',
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
