'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'

interface TerminalLine {
  id: string
  top: number
  text: string
  type: 'highlight' | 'faded'
  scramble?: boolean
}

interface PreloaderProps {
  onComplete?: () => void
  duration?: number
  className?: string
}

const TERMINAL_LINES: TerminalLine[] = [
  // Main lines - Cabo Negro specific
  { id: 'line-1', top: 0, text: 'Cabo Negro Industrial Zone: Magallanes Region', type: 'faded', scramble: true },
  { id: 'line-2', top: 0, text: 'Strategic Gateway to Antarctica Secured', type: 'highlight', scramble: true },
  { id: 'line-3', top: 30, text: 'Analyzing H₂V Green Hydrogen Potential', type: 'faded', scramble: true },
  { id: 'line-4', top: 30, text: '13% Global Green Hydrogen Production Detected', type: 'highlight', scramble: true },
  { id: 'line-5', top: 60, text: 'Initializing Maritime Terminal Construction', type: 'highlight', scramble: true },
  { id: 'line-6', top: 90, text: 'Panama Canal Alternative Route Activated', type: 'highlight', scramble: true },
  { id: 'line-7', top: 165, text: '300+ Hectares Industrial Infrastructure Ready', type: 'highlight', scramble: true },
  { id: 'line-8', top: 195, text: 'Route 9N Main Corridor Connected', type: 'highlight', scramble: true },
  { id: 'line-9', top: 225, text: 'Atlantic-Pacific Maritime Corridor Opening', type: 'highlight', scramble: true },
  { id: 'line-10', top: 255, text: 'EDF Investment Pipeline Stabilizing', type: 'highlight', scramble: true },
  { id: 'line-11', top: 285, text: 'Regional GDP Doubling Projection Confirmed', type: 'highlight', scramble: true },
  
  // Background faded lines - Technical details
  { id: 'bg-1', top: 15, text: 'Wind Power Potential: 7× Chile Current Capacity', type: 'faded', scramble: true },
  { id: 'bg-2', top: 45, text: 'Processing 200+ Filed H₂V Projects', type: 'faded', scramble: true },
  { id: 'bg-3', top: 75, text: 'Scanning 3,258 Hectares Urban Expansion', type: 'faded', scramble: true },
  { id: 'bg-4', top: 105, text: 'Analyzing 13 MW Electrical Capacity', type: 'faded', scramble: true },
  { id: 'bg-5', top: 180, text: 'Processing Phase 1: 350m Platform + Ramp', type: 'faded', scramble: true },
  { id: 'bg-6', top: 210, text: 'Calibrating Phase 2: 350m Bridge + 300m Pier', type: 'faded', scramble: true },
  { id: 'bg-7', top: 240, text: 'Evaluating Geopolitical Risk Assessment', type: 'faded', scramble: true },
  { id: 'bg-8', top: 270, text: 'Stabilizing Industrial Zoning Framework', type: 'faded', scramble: true },
]


// Custom scramble effect function
const scrambleText = (element: HTMLElement, originalText: string, chars: string = '▪', speed: number = 0.1) => {
  let iterations = 0
  const maxIterations = originalText.length * 2
  
  const interval = setInterval(() => {
    element.textContent = originalText
      .split('')
      .map((char, index) => {
        if (index < iterations) {
          return originalText[index]
        }
        return chars[Math.floor(Math.random() * chars.length)]
      })
      .join('')
    
    if (iterations >= originalText.length) {
      clearInterval(interval)
      element.textContent = originalText
    }
    
    iterations += 1 / 3
  }, speed * 100)
  
  return () => clearInterval(interval)
}

export default function Preloader({ onComplete, duration = 6, className = '' }: PreloaderProps) {
  const [progress, setProgress] = useState(0)
  const [isVisible, setIsVisible] = useState(true)
  const [isFadingOut, setIsFadingOut] = useState(false)
  const [fontsLoaded, setFontsLoaded] = useState(false)
  
  const preloaderRef = useRef<HTMLDivElement>(null)
  const progressBarRef = useRef<HTMLDivElement>(null)
  const terminalLinesRef = useRef<HTMLDivElement[]>([])
  
  const specialChars = '▪'

  // Check if fonts are loaded to prevent flash
  useEffect(() => {
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        setFontsLoaded(true)
      })
    } else {
      // Fallback for browsers without font loading API
      setTimeout(() => {
        setFontsLoaded(true)
      }, 100)
    }
  }, [])

  useEffect(() => {
    if (!preloaderRef.current) return

    const animatePreloader = () => {
      const tl = gsap.timeline({
        onComplete: () => {
          // Start fade out animation
          setIsFadingOut(true)
          
          // After fade out completes, hide preloader and call onComplete
          setTimeout(() => {
            setIsVisible(false)
            onComplete?.()
          }, 1000) // 1 second fade out duration
        }
      })

      // Set initial states
      gsap.set(terminalLinesRef.current, { opacity: 0 })

      // Sort terminal lines by top position
      const sortedLines = [...terminalLinesRef.current].sort((a, b) => {
        const aTop = parseInt(a.style.top || '0')
        const bTop = parseInt(b.style.top || '0')
        return aTop - bTop
      })

      // Animate terminal lines
      const textRevealTl = gsap.timeline()
      
      sortedLines.forEach((line, index) => {
        const baseOpacity = index % 2 === 0 ? 1 : 0.7
        const timePoint = (index / sortedLines.length) * (duration * 0.8)

        // Reveal line
        textRevealTl.to(line, {
          opacity: baseOpacity,
          duration: 0.3
        }, timePoint)

        // Add scramble effect to spans with data-scramble
        const scrambleSpans = line.querySelectorAll('[data-scramble="true"]')
        scrambleSpans.forEach((span) => {
          const originalText = span.getAttribute('data-original-text') || span.textContent || ''
          
          // Use custom scramble effect
          setTimeout(() => {
            scrambleText(span as HTMLElement, originalText, specialChars, 0.3)
          }, (timePoint + 0.1) * 1000)
        })
      })

      tl.add(textRevealTl, 0)

      // Add glitch effects
      for (let i = 0; i < 3; i++) {
        const randomTime = 1 + i * 1.5
        tl.call(() => {
          const glitchTl = gsap.timeline()
          const allScrambleSpans = document.querySelectorAll('[data-scramble="true"]')
          const randomSpans = []

          const numToGlitch = 3 + Math.floor(Math.random() * 3)
          for (let j = 0; j < numToGlitch; j++) {
            const randomIndex = Math.floor(Math.random() * allScrambleSpans.length)
            randomSpans.push(allScrambleSpans[randomIndex])
          }

          randomSpans.forEach((span) => {
            const text = span.textContent || span.getAttribute('data-original-text') || ''
            
            // Use custom scramble effect for glitch
            setTimeout(() => {
              scrambleText(span as HTMLElement, text, specialChars, 0.1)
            }, Math.random() * 500)
          })
        }, [], randomTime)
      }

      // Staggered disappearing effect
      const disappearTl = gsap.timeline()
      disappearTl.to(sortedLines, {
        opacity: 0,
        duration: 0.2,
        stagger: 0.1,
        ease: 'power1.in'
      })

      tl.add(disappearTl, duration - 1)

      // Progress bar animation
      tl.eventCallback('onUpdate', () => {
        const progressPercent = Math.min(99, tl.progress() * 100)
        setProgress(progressPercent)
      })

      // Force final progress update
      tl.call(() => {
        setProgress(100)
      }, [], duration - 0.5)

      return tl
    }

    // Start animation
    const mainTl = animatePreloader()

    return () => {
      mainTl.kill()
    }
  }, [duration, onComplete])

  if (!isVisible) return null

  return (
    <div 
      ref={preloaderRef}
      className={`fixed inset-0 z-50 bg-black flex items-center justify-center transition-opacity duration-1000 ${isFadingOut ? 'opacity-0' : 'opacity-100'} ${className}`}
      style={{ clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)' }}
    >
      {/* Pure Black Background */}
      <div className="absolute inset-0 bg-black" />

      {/* Terminal Preloader */}
      <div className="w-[95%] sm:w-[90%] max-w-4xl h-auto py-4 relative overflow-hidden block opacity-100">
        {/* Border Top */}
        <div className="absolute top-0 left-0 w-full h-6 sm:h-8 flex justify-between items-center px-2 sm:px-2.5 text-xs sm:text-sm text-white font-secondary uppercase tracking-wider">
          <span className="truncate">Cabo Negro Industrial Zone</span>
          <span className="truncate">Strategic Development Active</span>
        </div>

        {/* Terminal Container */}
        <div className="relative min-h-[400px] sm:min-h-[350px] mt-6 sm:mt-8 overflow-hidden p-2 sm:p-2.5">
          <div className="space-y-2 sm:space-y-3">
            {TERMINAL_LINES.map((line, index) => (
              <div
                key={line.id}
                ref={(el) => {
                  if (el) terminalLinesRef.current[index] = el
                }}
                className="text-xs sm:text-sm leading-relaxed sm:leading-tight tracking-wider font-light font-primary px-2 sm:px-2.5"
              >
                <span 
                  className={`inline-block ${
                    line.type === 'highlight' 
                      ? 'text-white font-normal uppercase tracking-widest' 
                      : 'opacity-50 uppercase tracking-widest'
                  }`}
                  data-scramble={line.scramble ? 'true' : undefined}
                  data-original-text={line.text}
                >
                  {line.text}
                </span>
              </div>
            ))}

            {/* Progress Line */}
            <div className="mt-4 sm:mt-6 px-2 sm:px-2.5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-0">
                <span className="font-normal text-xs sm:text-sm text-white uppercase tracking-widest font-primary">
                  Initializing
                </span>
                <div className="w-full sm:w-48 h-px bg-white/20 relative overflow-hidden">
                  <div 
                    ref={progressBarRef}
                    className="h-full bg-white transition-none"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span 
                  className="text-white font-normal text-xs sm:text-sm uppercase tracking-widest font-primary" 
                  data-scramble="true" 
                  data-original-text="H₂V Infrastructure"
                >
                  H₂V Infrastructure
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Border Bottom */}
        <div className="absolute bottom-0 left-0 w-full h-6 sm:h-8 flex justify-between items-center px-2 sm:px-2.5 text-xs sm:text-sm text-white font-secondary uppercase tracking-wider">
          <span className="truncate">Strategic Gateway Sequence Complete</span>
          <span className="truncate">Cabo Negro Industrial Zone Active</span>
        </div>
      </div>
    </div>
  )
}