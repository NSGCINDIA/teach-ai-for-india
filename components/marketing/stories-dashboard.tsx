'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, Calendar, Clock, ArrowRight, X, User, Quote, Landmark, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/format'
import { Reveal } from '@/components/marketing/reveal'

export interface RichStory {
  title: string
  excerpt: string
  campus: string
  date: string
  category: 'Classroom Joy' | 'Volunteer Journey' | 'Innovations'
  readTime: string
  image: string
  author: {
    name: string
    avatar: string
    role: string
  }
  quote?: string
  fullContent: string[]
}

const RICH_STORIES: RichStory[] = [
  {
    title: 'The First Prompt in Warangal',
    excerpt: 'How 45 government school children created their first digital drawings using text instructions, led by GRIET student volunteers.',
    campus: 'GRIET Hyderabad',
    date: '2026-06-15',
    category: 'Classroom Joy',
    readTime: '3 min read',
    image: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&q=80&w=800',
    author: {
      name: 'Sneha Reddy',
      avatar: 'SR',
      role: 'Chapter Lead, GRIET'
    },
    quote: 'The room fell completely silent when the AI interpreter generated their first custom Telugu prompt into a drawing. It was magic.',
    fullContent: [
      'We set out at 7:00 AM from our campus, loading four spare monitors and keyboards into the auto-rickshaw. The target was a small government high school on the outskirts of Warangal. The computer lab there had been dormant for two years due to system configuration issues.',
      'By noon, our volunteer team had resolved the configuration blocks, boot-loaded the machines, and connected the lab to a mobile hotspot. When the first class of ninth graders walked in, many had never typed on a keyboard.',
      'We started not with theory, but with prompts. We asked them to describe a dream rocket. One student suggested "A rocket flying through a rainbow sky powered by bubble gum." We translated it into Telugu script, ran it, and when the vibrant, neon rocket appeared on the screen, the entire room erupted in cheers.',
      'This single session laid the foundation. Today, this Warangal school has a recurring weekly AI club managed entirely by our GRIET junior volunteer team.'
    ]
  },
  {
    title: 'Breaking the English Barrier near Vijayawada',
    excerpt: 'How local translation models helped kids in a remote school write code and launch prompts in Telugu.',
    campus: 'AUCE Visakhapatnam',
    date: '2026-06-28',
    category: 'Innovations',
    readTime: '4 min read',
    image: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&q=80&w=800',
    author: {
      name: 'Ravi Teja',
      avatar: 'RT',
      role: 'Outreach Coordinator, AUCE'
    },
    quote: 'AI shouldn’t require English fluency. By localizing the tools, we saw children program complex loops in minutes.',
    fullContent: [
      'A common challenge in rural classrooms is the English literacy barrier. Most coding blocks and AI user interfaces are built entirely in English, which instantly alienates government school students who study in local mediums.',
      'To solve this, our AUCE engineering volunteers built a lightweight Telugu translation layer wrapper. It maps simple Telugu words like "తయారుచేయి" (Create), "రంగు" (Color), and "పెంచు" (Increase) onto visual parameters.',
      'In our session near Vijayawada, kids used these Telugu parameters to construct prompts and shape simple web layouts. The excitement of seeing their own language dictate computer behavior was a profound shift.',
      'It proved that technology literacy is not about English acquisition — it is about logical thinking, and language should never be the barrier.'
    ]
  },
  {
    title: "From Volunteer to Mentor: Karthik's Reflections",
    excerpt: 'Karthik shares his experience of travelling 30km every weekend to setup temporary labs in rural classrooms.',
    campus: 'CBIT Hyderabad',
    date: '2026-07-02',
    category: 'Volunteer Journey',
    readTime: '3 min read',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=800',
    author: {
      name: 'Karthik M.',
      avatar: 'KM',
      role: 'Senior Volunteer, CBIT'
    },
    quote: 'Teaching these kids teaches you. You learn to strip away the jargon and speak the language of absolute curiosity.',
    fullContent: [
      'I joined Teach AI for India thinking I would just be explaining neural networks or prompt basics. I didn’t realize it would completely rewrite how I see my own education.',
      'Travelling to rural government schools requires patience. Sometimes the power goes out mid-session, sometimes a projector bulb fuses. You learn to adapt on the fly, organizing unplugged logic games on blackboards using chalk.',
      'The children teach us resilience. They walk miles to get to school, yet their energy to learn the latest tech is boundless. Seeing a girl build a custom logic flowchart for a crop-rotation checker makes every kilometer of the weekend commute worth it.',
      'This experience has given my engineering degree a clear purpose: technology is only as good as the hands you place it in.'
    ]
  },
  {
    title: 'The Weekend Hackathon at VNR VJIET',
    excerpt: 'Volunteers host a weekend workshop where school children design village solution prototypes using AI helpers.',
    campus: 'VNR VJIET',
    date: '2026-07-04',
    category: 'Classroom Joy',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=800',
    author: {
      name: 'Ananya S.',
      avatar: 'AS',
      role: 'Hackathon Organizer'
    },
    quote: 'They didn’t just make toys. They designed water conservation checkers and solar light planners using block logic.',
    fullContent: [
      'We hosted 50 students from five local government schools in our university computer lab for a special weekend hackathon event.',
      'Instead of complex IDEs, we paired students with our volunteers as "copilots" who translated the children’s village improvements ideas into prompt instructions.',
      'One group designed a "Glow Path Finder" — a simple conceptual layout showing where solar lamps should be placed in dark alleyways based on input traffic indicators. Another made a simple Telugu voice chatbot that gives basic plant disease remedies.',
      'By the end of the day, these eighth and ninth graders were pitching their prototypes to our department dean. It showed that when given access, their ambition matches any private school.'
    ]
  }
]

export function StoriesDashboard() {
  const [selectedCategory, setSelectedCategory] = useState<'All' | 'Classroom Joy' | 'Volunteer Journey' | 'Innovations'>('All')
  const [activeStory, setActiveStory] = useState<RichStory | null>(null)

  const filteredStories = useMemo(() => {
    if (selectedCategory === 'All') return RICH_STORIES
    return RICH_STORIES.filter(s => s.category === selectedCategory)
  }, [selectedCategory])

  // Use the first story as the featured hero item
  const featuredStory = RICH_STORIES[0]

  return (
    <div className="space-y-12">
      
      {/* Category Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2 border-b border-border/60 pb-6">
        {(['All', 'Classroom Joy', 'Volunteer Journey', 'Innovations'] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
              selectedCategory === cat
                ? 'bg-brand text-white shadow-soft shadow-brand/20'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/80'
            }`}
          >
            {cat === 'All' ? 'All Stories' : cat}
          </button>
        ))}
      </div>

      {/* Featured Story Spotlights Card */}
      {selectedCategory === 'All' && (
        <Reveal>
          <div className="group relative overflow-hidden rounded-3xl border border-border/80 bg-card/65 dark:bg-card/25 shadow-soft-lg transition-all hover:shadow-soft-xl hover:border-brand/30">
            {/* Background absolute glow */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-brand/5 to-brand-teal/5 blur-3xl rounded-full opacity-60 pointer-events-none" />
            
            <div className="grid gap-6 md:grid-cols-12 items-stretch">
              <div className="relative md:col-span-5 aspect-[4/3] md:aspect-auto overflow-hidden">
                <img 
                  src={featuredStory.image} 
                  alt={featuredStory.title} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-card/5" />
                <span className="absolute top-4 left-4 inline-flex items-center gap-1 rounded-full bg-brand-orange px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
                  <Sparkles size={11} className="animate-spin-slow" /> FEATURED STORY
                </span>
              </div>
              
              <div className="md:col-span-7 p-6 md:p-10 flex flex-col justify-between text-left">
                <div>
                  <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-wider text-brand">
                    <span>{featuredStory.category}</span>
                    <span>•</span>
                    <span>{featuredStory.readTime}</span>
                  </div>
                  <h3 className="font-display text-2xl md:text-3.5xl font-extrabold text-foreground mt-3 group-hover:text-brand transition-colors duration-300 leading-tight">
                    {featuredStory.title}
                  </h3>
                  <p className="text-sm md:text-base text-muted-foreground mt-4 leading-relaxed font-medium">
                    {featuredStory.excerpt}
                  </p>
                </div>

                <div className="mt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-border/40 pt-6">
                  <div className="flex items-center gap-3">
                    <span className="grid size-10 place-items-center rounded-xl bg-brand/10 text-brand font-bold text-sm">
                      {featuredStory.author.avatar}
                    </span>
                    <div>
                      <h5 className="text-xs font-bold text-foreground">{featuredStory.author.name}</h5>
                      <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider mt-0.5">{featuredStory.author.role}</p>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => setActiveStory(featuredStory)}
                    className="group rounded-full bg-brand hover:bg-brand/90 text-white text-xs font-bold"
                  >
                    Read full story
                    <ArrowRight className="size-3.5 ml-1.5 transition-transform group-hover:translate-x-0.5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      )}

      {/* Grid of filtered Stories */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredStories.map((story, i) => {
          // Skip the first story in 'All' view to avoid duplication with featured
          if (selectedCategory === 'All' && story.title === featuredStory.title) return null
          
          return (
            <Reveal key={story.title} delay={i * 0.05}>
              <article 
                onClick={() => setActiveStory(story)}
                className="group cursor-pointer flex h-full flex-col rounded-2xl border border-border/80 bg-card/65 dark:bg-card/25 p-5 shadow-soft transition-all duration-300 hover:translate-y-[-4px] hover:shadow-soft-lg hover:border-brand/20 text-left justify-between"
              >
                <div>
                  <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-muted">
                    <img 
                      src={story.image} 
                      alt={story.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
                    />
                    <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider text-white ${
                      story.category === 'Classroom Joy' ? 'bg-brand' :
                      story.category === 'Volunteer Journey' ? 'bg-brand-orange' : 'bg-brand-teal'
                    }`}>
                      {story.category}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center gap-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    <span className="flex items-center gap-1">
                      <Calendar size={11} />
                      {formatDate(story.date)}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock size={11} />
                      {story.readTime}
                    </span>
                  </div>

                  <h4 className="font-display text-lg font-bold text-foreground group-hover:text-brand transition-colors duration-300 mt-3 leading-snug">
                    {story.title}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-2 line-clamp-3 leading-relaxed">
                    {story.excerpt}
                  </p>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-border/40 pt-4">
                  <div className="flex items-center gap-2">
                    <span className="grid size-8 place-items-center rounded-lg bg-muted text-muted-foreground font-bold text-xs">
                      {story.author.avatar}
                    </span>
                    <div>
                      <h5 className="text-[11px] font-bold text-foreground leading-none">{story.author.name}</h5>
                      <span className="text-[9px] text-muted-foreground mt-0.5 block">{story.campus}</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-brand group-hover:text-brand-orange flex items-center transition-colors">
                    Read <ArrowRight size={12} className="ml-1 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </article>
            </Reveal>
          )
        })}
      </div>

      {/* Immersive Overlay Reader pane */}
      <AnimatePresence>
        {activeStory && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-end bg-black/40 backdrop-blur-sm p-4 select-text"
          >
            {/* Close trigger on background click */}
            <div className="absolute inset-0 cursor-pointer" onClick={() => setActiveStory(null)} />

            {/* Sliding Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative w-full max-w-2xl h-full bg-card border-l border-border rounded-l-3xl shadow-2xl flex flex-col justify-between overflow-hidden"
            >
              
              {/* Header Image block */}
              <div className="relative aspect-[21/9] w-full shrink-0">
                <img src={activeStory.image} alt={activeStory.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-black/30 to-transparent" />
                
                {/* Close Button */}
                <button
                  onClick={() => setActiveStory(null)}
                  className="absolute top-4 right-4 grid size-9 place-items-center rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors backdrop-blur-sm"
                  aria-label="Close reader"
                >
                  <X size={18} />
                </button>

                <div className="absolute bottom-4 left-6 text-left">
                  <span className="px-3 py-1 bg-brand text-white text-[10px] font-bold uppercase tracking-wider rounded-lg">
                    {activeStory.category}
                  </span>
                  <h4 className="font-display font-extrabold text-white text-lg md:text-xl mt-2 drop-shadow-md">
                    {activeStory.campus}
                  </h4>
                </div>
              </div>

              {/* Scrollable Story Content */}
              <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-6 text-left">
                <div className="flex items-center gap-3 text-xs font-semibold text-muted-foreground">
                  <span className="flex items-center gap-1"><Calendar size={12} /> {formatDate(activeStory.date)}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><Clock size={12} /> {activeStory.readTime}</span>
                </div>

                <h3 className="font-display text-2xl md:text-3.5xl font-extrabold text-foreground leading-tight">
                  {activeStory.title}
                </h3>

                {/* Quote block */}
                {activeStory.quote && (
                  <div className="relative border-l-4 border-brand bg-brand/5 p-4 rounded-r-xl">
                    <Quote className="absolute right-4 top-2 size-8 text-brand/10" />
                    <p className="text-sm font-semibold italic text-foreground leading-relaxed pr-8">
                      "{activeStory.quote}"
                    </p>
                  </div>
                )}

                {/* Body paragraphs */}
                <div className="space-y-4 text-sm md:text-base text-muted-foreground leading-relaxed">
                  {activeStory.fullContent.map((p, idx) => (
                    <p key={idx}>{p}</p>
                  ))}
                </div>
              </div>

              {/* Bottom Author profile block */}
              <div className="border-t border-border/60 bg-muted/30 p-6 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <span className="grid size-11 place-items-center rounded-xl bg-brand/15 text-brand font-extrabold text-sm">
                    {activeStory.author.avatar}
                  </span>
                  <div className="text-left">
                    <h5 className="text-sm font-bold text-foreground">{activeStory.author.name}</h5>
                    <p className="text-xs text-muted-foreground">{activeStory.author.role}</p>
                  </div>
                </div>
                
                <Button 
                  onClick={() => setActiveStory(null)} 
                  variant="outline" 
                  className="rounded-full text-xs font-bold"
                >
                  Done Reading
                </Button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SECTION 1: Magic Prompts Ticker */}
      <Reveal>
        <div className="rounded-3xl border border-border/80 bg-brand/5 dark:bg-brand/10 p-8 overflow-hidden relative mt-16">
          <div className="absolute -top-12 -left-12 size-36 bg-brand-teal/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-12 -right-12 size-36 bg-brand-orange/10 rounded-full blur-2xl" />
          
          <div className="text-center max-w-2xl mx-auto mb-6 relative z-10">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-teal/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-teal">
              <Sparkles size={11} className="animate-spin-slow" /> Sparking Imagination
            </span>
            <h3 className="font-display text-xl md:text-2xl font-extrabold text-foreground mt-2">
              Magic prompts from the classroom
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Here are some of the wildest, most creative text prompts written by children in our workshops:
            </p>
          </div>

          {/* Scrolling Ticker */}
          <div className="relative w-full overflow-hidden py-2 select-none">
            <div className="flex gap-4 animate-marquee whitespace-nowrap">
              {/* Repeated twice for seamless infinite scrolling */}
              {[...PROMPTS, ...PROMPTS].map((prompt, idx) => (
                <div 
                  key={idx}
                  className="inline-block px-5 py-3 rounded-2xl bg-card border border-border/60 shadow-soft text-xs font-semibold text-foreground"
                >
                  ✨ "{prompt}"
                </div>
              ))}
            </div>
          </div>
        </div>
      </Reveal>

      {/* SECTION 2: Classroom Scrapbook Grid */}
      <Reveal>
        <div className="space-y-6 mt-16">
          <div className="text-left">
            <h3 className="font-display text-2xl font-extrabold text-foreground">Classroom Scrapbook</h3>
            <p className="text-sm text-muted-foreground mt-1">Snapshots of laughter, focus, and breakthroughs from our active campuses.</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {SCRAPBOOK_PHOTOS.map((photo, idx) => (
              <div 
                key={idx}
                className="group relative bg-card border border-border/80 p-3.5 rounded-2xl shadow-soft hover:shadow-soft-lg transition-all duration-300 hover:rotate-1 text-left"
              >
                {/* Polaroid pin element */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 size-3 rounded-full bg-brand-orange/60 shadow-inner z-20 pointer-events-none" />
                
                <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
                  <img 
                    src={photo.src} 
                    alt={photo.caption} 
                    className="w-full h-full object-cover transition-all duration-500 group-hover:scale-103"
                  />
                </div>
                <div className="mt-4">
                  <span className="text-[10px] font-bold text-brand uppercase tracking-wider">{photo.campus}</span>
                  <p className="text-xs font-semibold text-muted-foreground mt-1 line-clamp-2">{photo.caption}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

    </div>
  )
}

const PROMPTS = [
  "A flying school bus powered by big watermelon rockets",
  "A peacock teaching coding to a group of friendly monkeys in a forest",
  "A computer made entirely of shiny multi-colored candy blocks",
  "An AI robot chef serving hot Hyderabadi biryani to smiling kids",
  "A cycle that flies to the moon when you pedal super fast",
  "A school building with a giant slide coming out from the second floor",
  "An automated homework helper pen with cute little butterfly wings",
  "A massive computer chip growing in a green organic farm under the sun"
]

const SCRAPBOOK_PHOTOS = [
  {
    src: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=400',
    campus: 'CBIT Hyderabad',
    caption: 'Setting up our very first temporary AI learning laboratory'
  },
  {
    src: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&q=80&w=400',
    campus: 'GRIET Hyderabad',
    caption: 'Explaining prompt-engineering variables on the blackboard'
  },
  {
    src: 'https://images.unsplash.com/photo-1510531704581-5b2870972060?auto=format&fit=crop&q=80&w=400',
    campus: 'AUCE Visakhapatnam',
    caption: 'Government school kids collaborating on their first prompt task'
  },
  {
    src: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=400',
    campus: 'VNR VJIET',
    caption: 'Celebrating logic flows and prototype creations'
  }
]
