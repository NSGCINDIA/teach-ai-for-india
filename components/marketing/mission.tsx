'use client'

import { useState, useEffect } from 'react'
import { SectionHeading } from '@/components/shared/section-heading'
import { Reveal } from '@/components/marketing/reveal'
import type { MissionContent } from '@/app/(public)/content'
import { Sparkles, Users, ShieldCheck, Play, UserCheck, BarChart3, HelpCircle, Code, HeartHandshake } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const ICON_MAP: Record<string, any> = {
  Sparkles: Sparkles,
  Users: Users,
  ShieldCheck: ShieldCheck,
}

export function Mission({ content }: { content: MissionContent }) {
  const [activeTab, setActiveTab] = useState(0)

  // Tab 0 Sandbox State
  const [promptInput, setPromptInput] = useState('Explain AI to a 10 year old')
  const [promptOutput, setPromptOutput] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [hasRun, setHasRun] = useState(false)

  // Tab 1 Volunteers State
  const [selectedVolunteer, setSelectedVolunteer] = useState(0)
  const volunteers = [
    {
      name: 'Ananya S.',
      role: 'Chapter Lead',
      college: 'VNR VJIET, Hyderabad',
      impact: 'Taught 4 sessions (120+ kids)',
      quote: 'Watching government school students build their first web utility using AI prompt guides makes every weekend travel worth it.',
    },
    {
      name: 'Rahul K.',
      role: 'Curriculum lead',
      college: 'SR University, Warangal',
      impact: 'Taught 6 sessions (180+ kids)',
      quote: 'We adapt complex AI structures into simple Telugu-English hands-on guides. Language should never restrict digital coding.',
    },
    {
      name: 'Vikram M.',
      role: 'Mentor volunteer',
      college: 'AU College of Engineering, Vizag',
      impact: 'Taught 3 sessions (90+ kids)',
      quote: 'Students went from never touching a laptop keyboard to prompting image-generators for creative storytelling in under 3 hours.',
    },
  ]

  // Tab 2 Slider State
  const [simulationSessions, setSimulationSessions] = useState(40)

  const handleRunPrompt = () => {
    if (isRunning) return
    setIsRunning(true)
    setPromptOutput('')
    
    const responses: Record<string, string> = {
      'Explain AI to a 10 year old': '🤖 Think of AI like a puppy. It doesn\'t know how to fetch until you show it how to do it many times. We train AI by showing it pictures and text examples, so it can help us write code and draw images!',
      'How to build a website using prompts': '🌐 First, describe what you want in simple words: "Create a page with a blue background and a counter button." Next, paste the prompt into an LLM code generator. Copy the code into your browser and test it instantly!',
      'Why prompt engineering is important': '⚡ Prompting is the new coding. It teaches you how to think logically, dissect large problems into small steps, and communicate instructions clearly to get the exact result you need.'
    }

    const defaultResp = `🚀 Prompt processed successfully! Running Node on regional client sandbox... Input length: ${promptInput.length} chars. TAI classroom prompt verified.`
    const responseText = responses[promptInput] || defaultResp
    
    let index = 0
    let currentOutput = ''
    
    setTimeout(() => {
      setIsRunning(false)
      setHasRun(true)
      const interval = setInterval(() => {
        if (index < responseText.length) {
          currentOutput += responseText[index]
          setPromptOutput(currentOutput)
          index++
        } else {
          clearInterval(interval)
        }
      }, 10)
    }, 600)
  }

  return (
    <section className="section-padding relative overflow-hidden bg-transparent">
      {/* Decorative radial background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70rem] h-[70rem] bg-gradient-to-tr from-brand-teal/5 via-transparent to-brand/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container-wide relative z-10">
        <Reveal>
          <SectionHeading eyebrow={content.eyebrow} title={content.title} description={content.description} />
        </Reveal>

        <div className="mt-14 grid gap-10 lg:grid-cols-[1fr_1.2fr]">
          {/* Left Column: Interactive Tab Selectors */}
          <div className="flex flex-col gap-4 justify-center">
            {content.items.map((item, i) => {
              const IconComp = ICON_MAP[item.icon] || Sparkles
              const isActive = activeTab === i
              return (
                <Reveal key={item.title} delay={i * 0.08}>
                  <button
                    onClick={() => setActiveTab(i)}
                    className={`w-full text-left p-6 rounded-2xl border transition-all duration-300 flex gap-5 items-start ${
                      isActive
                        ? 'bg-card border-brand shadow-soft-lg ring-1 ring-brand/20 dark:bg-card/40'
                        : 'border-border bg-card/40 hover:bg-card/75 dark:bg-card/10'
                    }`}
                  >
                    <span
                      className={`grid size-12 shrink-0 place-items-center rounded-xl transition-colors duration-300 ${
                        isActive ? 'bg-brand text-white' : 'bg-brand/10 text-brand'
                      }`}
                    >
                      <IconComp className="size-6" />
                    </span>
                    <div>
                      <h3 className="font-display text-lg font-extrabold text-foreground">{item.title}</h3>
                      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                    </div>
                  </button>
                </Reveal>
              )
            })}
          </div>

          {/* Right Column: Visual Interactive Sandbox Container */}
          <div className="relative min-h-[440px] rounded-3xl border border-border bg-card/65 dark:bg-card/15 backdrop-blur-md p-8 shadow-soft-xl flex flex-col justify-between overflow-hidden">
            
            {/* Top Bar Decoration */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-brand via-brand-orange to-brand-teal" />

            <AnimatePresence mode="wait">
              {activeTab === 0 && (
                <motion.div
                  key="sandbox-view"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col h-full gap-6"
                >
                  <div className="flex justify-between items-center border-b border-border/80 pb-4">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-brand">Pillar 1: Applied Sandbox</span>
                      <h4 className="font-display font-extrabold text-lg mt-0.5">Prompt Classroom simulator</h4>
                    </div>
                    <span className="text-xs px-2.5 py-1 bg-emerald-500/10 text-emerald-500 font-extrabold rounded-full flex items-center gap-1.5 animate-pulse">
                      <span className="size-1.5 rounded-full bg-emerald-500" />
                      Live Terminal
                    </span>
                  </div>

                  <div className="space-y-4">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Choose a prompt to simulate:</label>
                    <div className="grid gap-2">
                      {[
                        'Explain AI to a 10 year old',
                        'How to build a website using prompts',
                        'Why prompt engineering is important'
                      ].map((prompt) => (
                        <button
                          key={prompt}
                          disabled={isRunning}
                          onClick={() => {
                            setPromptInput(prompt)
                            setHasRun(false)
                          }}
                          className={`text-left px-4 py-2.5 text-xs rounded-lg border transition-all ${
                            promptInput === prompt
                              ? 'border-brand/40 bg-brand/5 text-brand font-semibold'
                              : 'border-border/60 hover:bg-muted/50 text-muted-foreground'
                          }`}
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex-1 rounded-xl bg-slate-950 dark:bg-slate-900 border border-slate-800 p-4 text-xs font-mono text-slate-100 flex flex-col justify-between min-h-[160px]">
                    <div className="space-y-2">
                      <div className="flex gap-2 text-slate-500">
                        <span>$</span>
                        <span className="text-slate-300">{promptInput}</span>
                      </div>
                      
                      {isRunning && (
                        <div className="flex items-center gap-2 text-brand">
                          <span className="animate-spin size-3.5 border-2 border-brand border-t-transparent rounded-full" />
                          <span>Generating AI tokens...</span>
                        </div>
                      )}

                      {promptOutput && (
                        <p className="text-emerald-400 leading-relaxed whitespace-pre-wrap">{promptOutput}</p>
                      )}

                      {!isRunning && !promptOutput && (
                        <p className="text-slate-500 italic">Click "Run Prompt" to watch compilation...</p>
                      )}
                    </div>

                    <div className="flex justify-between items-center mt-4 pt-2 border-t border-slate-900">
                      <span className="text-[10px] text-slate-600">Model: TAI-Playground-v1.4</span>
                      <button
                        onClick={handleRunPrompt}
                        disabled={isRunning}
                        className="bg-brand hover:bg-brand-orange text-white text-xs font-bold py-1.5 px-4 rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-50"
                      >
                        <Play className="size-3 fill-current" />
                        Run Prompt
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 1 && (
                <motion.div
                  key="volunteer-view"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col h-full gap-6"
                >
                  <div className="flex justify-between items-center border-b border-border/80 pb-4">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-brand">Pillar 2: Student-Led Chapters</span>
                      <h4 className="font-display font-extrabold text-lg mt-0.5">Meet the Campus Mentors</h4>
                    </div>
                    <span className="text-xs px-2.5 py-1 bg-brand-orange/15 text-brand-orange font-extrabold rounded-full flex items-center gap-1.5">
                      <UserCheck className="size-3.5" />
                      Chapters active
                    </span>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-3">
                    {volunteers.map((vol, index) => (
                      <button
                        key={vol.name}
                        onClick={() => setSelectedVolunteer(index)}
                        className={`p-3 text-center rounded-xl border transition-all ${
                          selectedVolunteer === index
                            ? 'border-brand-orange/50 bg-brand-orange/5 text-foreground'
                            : 'border-border/60 hover:bg-muted/40 text-muted-foreground'
                        }`}
                      >
                        <div className="font-display font-bold text-sm">{vol.name}</div>
                        <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mt-0.5">{vol.role}</div>
                      </button>
                    ))}
                  </div>

                  <div className="flex-1 p-6 rounded-2xl bg-muted/30 border border-border/60 flex flex-col justify-between">
                    <p className="italic text-muted-foreground text-sm leading-relaxed text-pretty">
                      "{volunteers[selectedVolunteer].quote}"
                    </p>

                    <div className="mt-4 pt-4 border-t border-border flex justify-between items-center text-xs">
                      <div>
                        <div className="font-bold text-foreground">{volunteers[selectedVolunteer].college}</div>
                        <div className="text-[10px] text-brand uppercase font-extrabold mt-0.5">College Affiliation</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-foreground">{volunteers[selectedVolunteer].impact}</div>
                        <div className="text-[10px] text-brand-teal uppercase font-extrabold mt-0.5">Direct Impact</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 2 && (
                <motion.div
                  key="equity-view"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col h-full gap-6"
                >
                  <div className="flex justify-between items-center border-b border-border/80 pb-4">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-brand">Pillar 3: Regional Equity</span>
                      <h4 className="font-display font-extrabold text-lg mt-0.5">Impact Multiplier Simulator</h4>
                    </div>
                    <span className="text-xs px-2.5 py-1 bg-brand-teal/15 text-brand-teal font-extrabold rounded-full flex items-center gap-1.5">
                      <BarChart3 className="size-3.5" />
                      100% Free Labs
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold uppercase text-muted-foreground">Adjust Session Count:</span>
                      <span className="font-display font-black text-brand text-lg">{simulationSessions} sessions</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="200"
                      value={simulationSessions}
                      onChange={(e) => setSimulationSessions(Number(e.target.value))}
                      className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-brand"
                    />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="p-4 rounded-xl border border-border bg-slate-50 dark:bg-slate-900/30 flex flex-col justify-between">
                      <div>
                        <div className="text-xs font-bold uppercase text-muted-foreground">Estimated Students Reached</div>
                        <div className="font-display font-black text-3xl text-foreground mt-2">
                          {(simulationSessions * 35).toLocaleString('en-IN')}+
                        </div>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">
                        Based on typical classroom capacities of 35-40 students per interactive session.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl border border-border bg-slate-50 dark:bg-slate-900/30 flex flex-col justify-between">
                      <div>
                        <div className="text-xs font-bold uppercase text-muted-foreground">Vernacular Language Support</div>
                        <div className="font-display font-black text-3xl text-brand-teal mt-2">
                          Telugu & English
                        </div>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">
                        Curriculums are fully translated into regional mediums so no child is excluded.
                      </p>
                    </div>
                  </div>

                  <div className="text-center py-2 border-t border-border mt-2 text-[11px] text-muted-foreground flex items-center justify-center gap-1.5">
                    <HeartHandshake className="size-3.5 text-brand" />
                    Every single session counts toward closing the rural-urban digital tech divide.
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}
