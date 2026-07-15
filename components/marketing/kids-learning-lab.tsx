'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Rocket, Sparkles, HelpCircle, Brain, RefreshCw, Star, Zap, Flame } from 'lucide-react'

interface FlipCard {
  id: string
  title: string
  illustration: string
  frontText: string
  backText: string
  color: string // Tailwind styling color
  icon: typeof HelpCircle
}

export function KidsLearningLab() {
  const [activeTab, setActiveTab] = useState<'cards' | 'game'>('cards')
  const [flippedCardId, setFlippedCardId] = useState<string | null>(null)
  
  // Rocket game state
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null)
  const [launchState, setLaunchState] = useState<'idle' | 'countdown' | 'launched'>('idle')
  const [countdown, setCountdown] = useState(3)
  const [launchMessage, setLaunchMessage] = useState('')

  const cards: FlipCard[] = [
    {
      id: 'card-1',
      title: 'Magic Prompts',
      illustration: '🪄',
      frontText: 'What is a Prompt?',
      backText: 'A prompt is like a magic spell! It is a set of text instructions you give to an AI to tell it exactly what to create, write, or draw.',
      color: 'from-amber-400 to-orange-500 text-orange-950',
      icon: Sparkles
    },
    {
      id: 'card-2',
      title: 'Neural Networks',
      illustration: '🧠',
      frontText: 'How does AI learn?',
      backText: 'By looking at millions of examples! Just like you learn to recognize a dog by seeing many dogs, AI studies patterns to find connections.',
      color: 'from-cyan-400 to-blue-500 text-blue-950',
      icon: Brain
    },
    {
      id: 'card-3',
      title: 'Generative Power',
      illustration: '🎨',
      frontText: 'What is Generative AI?',
      backText: 'AI that makes new things! Instead of just search pages, it can design unique characters, compose melodies, or write stories on demand.',
      color: 'from-emerald-400 to-teal-500 text-teal-950',
      icon: Star
    }
  ]

  const promptOptions = [
    {
      id: 'prompt-1',
      label: '🌈 Rainbow Fuel',
      prompt: 'Launch a rocket powered by magical liquid rainbow juice!',
      message: 'SUCCESS! AI generated a vibrant neon-green rocket with a giant rainbow tail exhaust. Cruising into orbit!'
    },
    {
      id: 'prompt-2',
      label: '🎈 Bubble Gum Drive',
      prompt: 'Fly a flying saucer powered by popping bubble gum shielding!',
      message: 'ALMOST THERE! A pink bubble gum saucer floats into orbit and blows a giant forcefield. POP!'
    },
    {
      id: 'prompt-3',
      label: '☄️ Shooting Star Thrusters',
      prompt: 'Ignite thrusters made of hot cosmic stardust and comets!',
      message: 'BLAST OFF! Star engines ignite a glowing tail of cosmic dust. Traveling at lightspeed!'
    }
  ]

  const handleLaunch = (option: typeof promptOptions[0]) => {
    setSelectedPrompt(option.id)
    setLaunchState('countdown')
    setCountdown(3)
    setLaunchMessage('')

    // Simulate countdown
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          setLaunchState('launched')
          setLaunchMessage(option.message)
          return 0
        }
        return prev - 1
      })
    }, 800)
  }

  const resetGame = () => {
    setSelectedPrompt(null)
    setLaunchState('idle')
    setLaunchMessage('')
  }

  return (
    <section className="section-padding bg-gradient-to-b from-transparent via-amber-50/10 to-transparent border-t border-b border-border relative overflow-hidden">
      
      {/* Playful Floating Kids Elements */}
      <div className="absolute top-12 left-10 text-4xl opacity-15 select-none animate-bounce" style={{ animationDuration: '4s' }}>🪁</div>
      <div className="absolute bottom-12 right-12 text-4xl opacity-15 select-none animate-bounce" style={{ animationDuration: '5s' }}>🎈</div>
      <div className="absolute top-1/2 right-10 text-3xl opacity-10 select-none animate-pulse">🧩</div>
      <div className="absolute bottom-1/4 left-12 text-3xl opacity-10 select-none animate-spin" style={{ animationDuration: '10s' }}>⚙️</div>

      <div className="container-wide">
        
        {/* Playful Header */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 dark:bg-amber-950 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300 shadow-soft">
            <Zap className="size-3.5" />
            Curiosity Corner
          </span>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-foreground">
            Playful AI Kids Lab
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed text-balance">
            Inspired by hands-on classroom experiments, click below to play with AI concepts just like students in our rural workshops!
          </p>
        </div>

        {/* Playful Tab Switcher */}
        <div className="flex justify-center mt-8">
          <div className="inline-flex p-1 bg-muted dark:bg-card border border-border/80 rounded-2xl shadow-soft">
            <button
              onClick={() => setActiveTab('cards')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'cards'
                  ? 'bg-brand text-white shadow-md'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <HelpCircle className="size-4" />
              AI Flip Cards
            </button>
            <button
              onClick={() => setActiveTab('game')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'game'
                  ? 'bg-brand text-white shadow-md'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Rocket className="size-4" />
              Rocket Launcher Game
            </button>
          </div>
        </div>

        {/* Tab Contents */}
        <div className="mt-12 max-w-4xl mx-auto min-h-[380px]">
          
          {/* Tab 1: Concept Flip Cards */}
          {activeTab === 'cards' && (
            <div className="grid gap-6 sm:grid-cols-3">
              {cards.map((card) => {
                const isFlipped = flippedCardId === card.id
                const Icon = card.icon
                
                return (
                  <div
                    key={card.id}
                    className="relative h-64 w-full perspective cursor-pointer"
                    onClick={() => setFlippedCardId(isFlipped ? null : card.id)}
                  >
                    <motion.div
                      animate={{ rotateY: isFlipped ? 180 : 0 }}
                      transition={{ duration: 0.6, ease: 'easeInOut' }}
                      style={{ transformStyle: 'preserve-3d' }}
                      className="absolute inset-0 w-full h-full rounded-2xl shadow-soft border border-border bg-card dark:bg-card/40 flex flex-col justify-between p-6 select-none"
                    >
                      {/* FRONT OF CARD */}
                      <div
                        style={{ backfaceVisibility: 'hidden' }}
                        className="absolute inset-0 p-6 flex flex-col justify-between"
                      >
                        <div className="flex justify-between items-start">
                          <span className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
                            {card.title}
                          </span>
                          <Icon className="size-4 text-brand-orange" />
                        </div>
                        <div className="text-center space-y-3 my-auto">
                          <span className="text-5xl block animate-bounce" style={{ animationDuration: '3s' }}>
                            {card.illustration}
                          </span>
                          <h4 className="font-display font-extrabold text-base text-foreground leading-snug">
                            {card.frontText}
                          </h4>
                        </div>
                        <p className="text-[10px] text-center text-muted-foreground font-semibold uppercase tracking-wider">
                          Click to reveal explanation
                        </p>
                      </div>

                      {/* BACK OF CARD */}
                      <div
                        style={{
                          backfaceVisibility: 'hidden',
                          transform: 'rotateY(180deg)'
                        }}
                        className="absolute inset-0 p-6 flex flex-col justify-between"
                      >
                        <div className="flex justify-between items-start">
                          <span className="text-xs font-extrabold uppercase tracking-wider text-brand">
                            Explanation
                          </span>
                          <RefreshCw className="size-4 text-brand/60" />
                        </div>
                        <p className="text-xs text-foreground/90 font-medium leading-relaxed my-auto">
                          {card.backText}
                        </p>
                        <p className="text-[10px] text-center text-brand font-bold uppercase tracking-wider">
                          Click to flip back
                        </p>
                      </div>

                    </motion.div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Tab 2: Rocket Launcher Game */}
          {activeTab === 'game' && (
            <div className="bg-card dark:bg-slate-900/40 border border-border rounded-3xl p-6 sm:p-8 shadow-soft grid gap-8 md:grid-cols-[1.2fr_1fr] items-center relative overflow-hidden">
              
              {/* Left Column: Game controls */}
              <div className="space-y-6">
                <div>
                  <h3 className="font-display font-extrabold text-lg text-foreground flex items-center gap-1.5">
                    <Rocket className="size-4 text-brand" />
                    Write a Rocket Prompt
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Select a creative fuel prompt combination below to build and launch your digital rocket.
                  </p>
                </div>

                <div className="space-y-3">
                  {promptOptions.map((opt) => {
                    const isSelected = selectedPrompt === opt.id
                    return (
                      <button
                        key={opt.id}
                        onClick={() => handleLaunch(opt)}
                        disabled={launchState === 'countdown'}
                        className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start justify-between group ${
                          isSelected
                            ? 'border-brand bg-brand/5 dark:bg-brand/10 ring-2 ring-brand/10'
                            : 'border-border/80 hover:border-brand/45 hover:bg-muted/30'
                        }`}
                      >
                        <div className="space-y-1">
                          <span className="text-xs font-extrabold text-foreground leading-none">
                            {opt.label}
                          </span>
                          <p className="text-[11px] text-muted-foreground leading-relaxed">
                            "{opt.prompt}"
                          </p>
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 group-hover:bg-brand group-hover:text-white transition-all ${
                          isSelected ? 'bg-brand text-white' : 'bg-muted text-muted-foreground'
                        }`}>
                          Launch
                        </span>
                      </button>
                    )
                  })}
                </div>

                {launchState !== 'idle' && (
                  <button
                    onClick={resetGame}
                    className="text-xs text-muted-foreground hover:text-brand font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <RefreshCw className="size-3.5" />
                    Reset Launchpad
                  </button>
                )}
              </div>

              {/* Right Column: Visual launchpad */}
              <div className="relative aspect-square w-full max-w-[320px] bg-slate-950 dark:bg-slate-900 border border-slate-800 rounded-2xl p-4 overflow-hidden flex flex-col items-center justify-between text-center select-none mx-auto shadow-inner">
                {/* Background stars */}
                <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black z-0 opacity-80" />
                <div className="absolute top-8 left-12 size-1 rounded-full bg-white opacity-40 animate-pulse" />
                <div className="absolute top-20 right-16 size-1 rounded-full bg-white opacity-60 animate-pulse" style={{ animationDelay: '1s' }} />
                <div className="absolute bottom-16 left-20 size-1 rounded-full bg-white opacity-30 animate-pulse" style={{ animationDelay: '2s' }} />

                {/* Status Indicator */}
                <span className="text-[10px] font-mono tracking-widest text-slate-400 z-10 uppercase border border-slate-800 rounded-full px-3 py-1 bg-black/40">
                  {launchState === 'idle' && 'Launchpad: Standing by'}
                  {launchState === 'countdown' && `Counting Down: T-minus ${countdown}`}
                  {launchState === 'launched' && 'Status: Orbit Achieved'}
                </span>

                {/* Main animated area */}
                <div className="relative flex-1 w-full flex items-center justify-center z-10 min-h-[160px]">
                  
                  {/* Countdown overlay */}
                  {launchState === 'countdown' && (
                    <motion.span
                      key={countdown}
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1.2, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      className="absolute font-display font-extrabold text-5xl text-amber-500 drop-shadow"
                    >
                      {countdown}
                    </motion.span>
                  )}

                  {/* Rocket body rendering */}
                  <AnimatePresence>
                    {launchState !== 'countdown' && (
                      <motion.div
                        initial={{ y: 80, scale: 0.8, opacity: 0 }}
                        animate={{
                          y: launchState === 'launched' ? -60 : 0,
                          scale: 1,
                          opacity: 1
                        }}
                        transition={{
                          type: 'spring',
                          stiffness: 80,
                          damping: 15
                        }}
                        className="relative flex flex-col items-center"
                      >
                        {/* Glowing rocket plume */}
                        {launchState === 'launched' && (
                          <div className="absolute -bottom-8 flex flex-col items-center">
                            <Flame className="size-8 text-amber-500 animate-pulse" />
                            <div className="w-4 h-12 bg-gradient-to-t from-transparent via-orange-500/20 to-orange-500 rounded-full blur-sm" />
                          </div>
                        )}
                        <Rocket className={`size-14 text-brand-teal drop-shadow-md ${
                          launchState === 'launched' ? 'animate-bounce' : ''
                        }`} />
                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>

                {/* Output simulated message overlay */}
                <div className="z-10 w-full min-h-[64px] flex items-center justify-center px-4 bg-slate-900/60 dark:bg-black/40 border border-slate-800 rounded-xl">
                  {launchState === 'idle' && (
                    <p className="text-[11px] text-slate-400 leading-normal italic text-pretty">
                      "Choose one of the fuel options on the left to test the rocket prompt."
                    </p>
                  )}
                  {launchState === 'countdown' && (
                    <p className="text-[11px] text-amber-500 leading-normal font-mono">
                      Checking rocket thrust parameters...
                    </p>
                  )}
                  {launchState === 'launched' && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-[11px] text-emerald-400 font-mono leading-normal leading-relaxed text-left"
                    >
                      {launchMessage}
                    </motion.p>
                  )}
                </div>

              </div>
            </div>
          )}

        </div>

      </div>
    </section>
  )
}
