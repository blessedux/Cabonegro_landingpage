'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { useContentLoader } from '@/hooks/useContentLoader'

interface TerminalLine {
  id: string
  top: number
  text: string
  type: 'highlight' | 'faded'
  scramble?: boolean
}

interface PreloaderProps {
  onComplete?: () => void
  onFadeOutStart?: () => void
  duration?: number
  className?: string
  showDebug?: boolean
}

const TERMINAL_LINES_ES: TerminalLine[] = [
  // Main lines - Cabo Negro specific in Spanish
  { id: 'line-1', top: 0, text: 'Zona Industrial Cabo Negro: Región de Magallanes', type: 'faded', scramble: true },
  { id: 'line-2', top: 0, text: 'Puerta de Entrada Estratégica a la Antártida Asegurada', type: 'highlight', scramble: true },
  { id: 'line-3', top: 30, text: 'Analizando Potencial de Hidrógeno Verde H₂V', type: 'faded', scramble: true },
  { id: 'line-4', top: 30, text: '13% de Producción Mundial de Hidrógeno Verde Detectada', type: 'highlight', scramble: true },
  { id: 'line-5', top: 60, text: 'Inicializando Construcción de Terminal Marítimo', type: 'highlight', scramble: true },
  { id: 'line-6', top: 90, text: 'Ruta Alternativa al Canal de Panamá Activada', type: 'highlight', scramble: true },
  { id: 'line-7', top: 165, text: '300+ Hectáreas de Infraestructura Industrial Lista', type: 'highlight', scramble: true },
  { id: 'line-8', top: 195, text: 'Corredor Principal Ruta 9N Conectado', type: 'highlight', scramble: true },
  { id: 'line-9', top: 225, text: 'Corredor Marítimo Atlántico-Pacífico Abriendo', type: 'highlight', scramble: true },
  { id: 'line-10', top: 255, text: 'Canal de Inversión EDF Estabilizando', type: 'highlight', scramble: true },
  { id: 'line-11', top: 285, text: 'Proyección de Duplicación del PIB Regional Confirmada', type: 'highlight', scramble: true },
  
  // Background faded lines - Technical details in Spanish
  { id: 'bg-1', top: 15, text: 'Potencial Eólico: 7× Capacidad Actual de Chile', type: 'faded', scramble: true },
  { id: 'bg-2', top: 45, text: 'Procesando 200+ Proyectos H₂V Presentados', type: 'faded', scramble: true },
  { id: 'bg-3', top: 75, text: 'Escaneando 3,258 Hectáreas de Expansión Urbana', type: 'faded', scramble: true },
  { id: 'bg-4', top: 105, text: 'Analizando Capacidad Eléctrica de 13 MW', type: 'faded', scramble: true },
  { id: 'bg-5', top: 180, text: 'Procesando Fase 1: Plataforma de 350m + Rampa', type: 'faded', scramble: true },
  { id: 'bg-6', top: 210, text: 'Calibrando Fase 2: Puente de 350m + Muelle de 300m', type: 'faded', scramble: true },
  { id: 'bg-7', top: 240, text: 'Evaluando Evaluación de Riesgo Geopolítico', type: 'faded', scramble: true },
  { id: 'bg-8', top: 270, text: 'Estabilizando Marco de Zonificación Industrial', type: 'faded', scramble: true },
]

// Track running scramble animations to prevent duplicates
const runningScrambles = new WeakMap<HTMLElement, () => void>()

// Custom scramble effect function - reveals letters one by one, never reverts
const scrambleText = (element: HTMLElement, originalText: string, chars: string = '▪', speed: number = 0.1) => {
  if (!element || !originalText) return () => {}
  
  // If already running, don't start again
  if (runningScrambles.has(element)) {
    return runningScrambles.get(element)!
  }
  
  // Ensure we start with all dots
  element.textContent = originalText.split('').map(() => chars[0]).join('')
  
  let iterations = 0
  let isComplete = false
  
  const interval = setInterval(() => {
    if (!element || !element.parentElement || isComplete) {
      clearInterval(interval)
      runningScrambles.delete(element)
      return
    }
    
    // Reveal letters one by one
    element.textContent = originalText
      .split('')
      .map((char, index) => {
        if (index < iterations) {
          // This letter is already revealed - keep it
          return originalText[index]
        }
        // This letter is not yet revealed - show dot
        return chars[0]
      })
      .join('')
    
    // Once all letters are revealed, stop
    if (iterations >= originalText.length) {
      isComplete = true
      clearInterval(interval)
      element.textContent = originalText
      runningScrambles.delete(element)
      return
    }
    
    // Increment to reveal next letter
    iterations += 1
  }, speed * 100)
  
  const cleanup = () => {
    clearInterval(interval)
    runningScrambles.delete(element)
  }
  
  runningScrambles.set(element, cleanup)
  return cleanup
}

// Glitch effect - only affects specific characters temporarily, preserves revealed letters
const glitchText = (element: HTMLElement, originalText: string, chars: string = '▪', speed: number = 0.1) => {
  const currentText = element.textContent || originalText
  const textArray = currentText.split('')
  
  // Only glitch a few random characters that are already revealed, preserve the rest
  const numToGlitch = Math.min(2, Math.floor(textArray.length * 0.15))
  const glitchIndices: number[] = []
  
  // Find revealed characters (not dots) to glitch
  const revealedIndices: number[] = []
  for (let i = 0; i < textArray.length; i++) {
    if (textArray[i] !== chars[0] && textArray[i] === originalText[i]) {
      revealedIndices.push(i)
    }
  }
  
  // Pick random revealed characters to glitch
  for (let i = 0; i < numToGlitch && revealedIndices.length > 0; i++) {
    const randomIndex = Math.floor(Math.random() * revealedIndices.length)
    glitchIndices.push(revealedIndices[randomIndex])
    revealedIndices.splice(randomIndex, 1)
  }
  
  if (glitchIndices.length === 0) return // No characters to glitch
  
  // Store original characters to restore
  const originalChars = glitchIndices.map(i => textArray[i])
  
  // Quick glitch effect on selected characters only
  let glitchIterations = 0
  const maxGlitchIterations = 4
  
  const glitchInterval = setInterval(() => {
    element.textContent = textArray
      .map((char, index) => {
        if (glitchIndices.includes(index) && glitchIterations < maxGlitchIterations) {
          // Glitch this character temporarily
          return chars[Math.floor(Math.random() * chars.length)]
        }
        // Keep current character (preserves revealed state)
        return char
      })
      .join('')
    
    glitchIterations++
    
    if (glitchIterations >= maxGlitchIterations) {
      clearInterval(glitchInterval)
      // Restore original characters (the revealed letters)
      const finalText = textArray.map((char, index) => {
        if (glitchIndices.includes(index)) {
          return originalChars[glitchIndices.indexOf(index)]
        }
        return char
      }).join('')
      element.textContent = finalText
    }
  }, speed * 40) // Faster glitch
  
  return () => clearInterval(glitchInterval)
}

export default function PreloaderEs({ onComplete, onFadeOutStart, duration = 6, className = '', showDebug = false }: PreloaderProps) {
  const [progress, setProgress] = useState(0)
  const [isVisible, setIsVisible] = useState(true)
  const [isFadingOut, setIsFadingOut] = useState(false)
  const [fontsLoaded, setFontsLoaded] = useState(false)
  const [actualProgress, setActualProgress] = useState(0)
  const [debugVisible, setDebugVisible] = useState(showDebug)
  const lastActualProgressRef = useRef(0)
  
  const preloaderRef = useRef<HTMLDivElement>(null)
  const progressBarRef = useRef<HTMLDivElement>(null)
  const terminalLinesRef = useRef<HTMLDivElement[]>([])
  const progressAnimationRef = useRef<ReturnType<typeof gsap.to> | null>(null)
  const animationTlRef = useRef<gsap.core.Timeline | null>(null)
  
  const specialChars = '▪'

  // Use content loader to track actual loading progress
  const { stats, isComplete: contentComplete, progress: realProgress } = useContentLoader({
    onProgress: (progress) => {
      // Only update if change is significant (reduce jumping)
      if (Math.abs(progress - lastActualProgressRef.current) > 2) {
        lastActualProgressRef.current = progress
        setActualProgress(progress)
      }
    },
    minLoadingTime: 2000,
    maxLoadingTime: duration * 1000,
  })

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
      // Independent animation timeline - runs smoothly regardless of loading state
      // These animations continue even when progress bar reaches 100%
      const animationTl = gsap.timeline({ paused: false })
      animationTlRef.current = animationTl

      // Set initial states
      gsap.set(terminalLinesRef.current, { opacity: 0 })

      // Sort terminal lines by top position
      const sortedLines = [...terminalLinesRef.current]
        .filter(line => line !== null && line !== undefined) // Filter out null/undefined
        .sort((a, b) => {
          const aTop = parseInt(a.style.top || '0')
          const bTop = parseInt(b.style.top || '0')
          return aTop - bTop
        })

      // Animation duration - independent of loading (ensures smooth flow)
      const animationDuration = Math.max(duration, 4) // Minimum 4 seconds for smooth animation

      // Animate terminal lines - spread over most of the animation duration
      const textRevealTl = gsap.timeline()
      
      sortedLines.forEach((line, index) => {
        const baseOpacity = index % 2 === 0 ? 1 : 0.7
        // Spread animations over 80% of duration for smooth reveal
        const timePoint = (index / sortedLines.length) * (animationDuration * 0.8)

        // Reveal line opacity
        textRevealTl.to(line, {
          opacity: baseOpacity,
          duration: 0.3
        }, timePoint)

        // Add scramble effect to ALL spans with data-scramble - line by line
        // Each line gets its scramble animation when it becomes visible
        const scrambleSpans = line.querySelectorAll('[data-scramble="true"]')
        
        scrambleSpans.forEach((span, spanIndex) => {
          const originalText = span.getAttribute('data-original-text') || ''
          
          if (!originalText) return // Skip if no original text
          
          // Initialize with dots immediately (before animation starts)
          span.textContent = originalText.split('').map(() => specialChars[0]).join('')
          
          // Start scramble animation when line becomes visible
          // Small delay after line opacity animation starts
          const scrambleDelay = (timePoint + 0.2 + (spanIndex * 0.03)) * 1000
          
          const timeoutId = setTimeout(() => {
            // Verify span still exists and is in the DOM
            if (span && span.parentElement && span.getAttribute('data-scramble') === 'true') {
              const originalTextCheck = span.getAttribute('data-original-text') || ''
              
              if (originalTextCheck) {
                // Start scramble animation - function handles duplicate prevention
                scrambleText(span as HTMLElement, originalTextCheck, specialChars, 0.1) // Consistent speed for all lines
              }
            }
          }, Math.max(0, scrambleDelay))
          
          // Store timeout ID for cleanup if needed
          ;(span as any)._scrambleTimeout = timeoutId
        })
      })

      animationTl.add(textRevealTl, 0)

      // Add glitch effects - spread throughout animation
      for (let i = 0; i < 3; i++) {
        const randomTime = 1 + i * (animationDuration * 0.3)
        animationTl.call(() => {
          const glitchTl = gsap.timeline()
          const allScrambleSpans = document.querySelectorAll('[data-scramble="true"]')
          const randomSpans = []

          const numToGlitch = 3 + Math.floor(Math.random() * 3)
          for (let j = 0; j < numToGlitch; j++) {
            const randomIndex = Math.floor(Math.random() * allScrambleSpans.length)
            randomSpans.push(allScrambleSpans[randomIndex])
          }

          randomSpans.forEach((span) => {
            const text = span.getAttribute('data-original-text') || span.textContent || ''
            
            // Use glitch effect (doesn't reset the text, only glitches a few chars)
            setTimeout(() => {
              glitchText(span as HTMLElement, text, specialChars, 0.1)
            }, Math.random() * 500)
          })
        }, [], randomTime)
      }

      // Staggered disappearing effect - happens near the end but before fade out
      const disappearTl = gsap.timeline()
      disappearTl.to(sortedLines, {
        opacity: 0,
        duration: 0.3,
        stagger: 0.05,
        ease: 'power1.in'
      })

      // Add disappearing effect - happens when progress is high or near animation end
      // This ensures animations complete smoothly even if loading is fast
      animationTl.add(disappearTl, animationDuration - 0.8)

      // Progress bar animation - ONLY element tied to actual loading progress
      // This runs independently from the visual animations above
      if (progressBarRef.current) {
        let lastActualProgress = 0
        let targetProgress = 0
        
        // Smooth progress updates - throttle to avoid jumping
        const updateProgressSmoothly = () => {
          if (progressBarRef.current) {
            // Smoothly interpolate towards actual progress
            const currentProgress = parseFloat(progressBarRef.current.style.width) || 0
            const diff = actualProgress - currentProgress
            
            // Only update if there's a meaningful difference (avoid micro-updates)
            if (Math.abs(diff) > 0.5) {
              // Smooth interpolation (ease out)
              const step = diff * 0.15 // Smooth step size
              const newProgress = Math.min(100, Math.max(0, currentProgress + step))
              
              progressBarRef.current.style.width = `${newProgress}%`
              setProgress(newProgress)
            }
          }
        }

        // Update progress smoothly every 100ms (less frequent = smoother)
        const progressInterval = setInterval(updateProgressSmoothly, 100)

        // Also ensure we reach 100% by the end of duration
        const ensureCompletion = gsap.to(progressBarRef.current, {
          width: '100%',
          duration: duration,
          ease: 'power1.out',
          onUpdate: () => {
            // Only let GSAP drive if actual progress is close or we're near the end
            if (progressBarRef.current) {
              const gsapProgress = parseFloat(progressBarRef.current.style.width) || 0
              const timeElapsed = gsapProgress / 100 * duration
              
              // After 80% of duration, let GSAP finish it smoothly
              if (timeElapsed > duration * 0.8) {
                progressBarRef.current.style.width = `${gsapProgress}%`
                setProgress(gsapProgress)
              } else {
                // Before 80%, let actual progress drive (but smooth it)
                updateProgressSmoothly()
              }
            }
          },
          onComplete: () => {
            setProgress(100)
            clearInterval(progressInterval)
            // Immediately start fade out when progress reaches 100%
            onFadeOutStart?.()
            setIsFadingOut(true)
          }
        })

        progressAnimationRef.current = ensureCompletion

        // Check if progress reaches 100% and trigger immediate fade out
        const checkComplete = setInterval(() => {
          const currentProgress = parseFloat(progressBarRef.current?.style.width || '0') || 0
          if (currentProgress >= 99.5) {
            clearInterval(checkComplete)
            clearInterval(progressInterval)
            if (progressAnimationRef.current && 'kill' in progressAnimationRef.current) {
              progressAnimationRef.current.kill()
            }
            // Ensure we're at 100%
            if (progressBarRef.current) {
              progressBarRef.current.style.width = '100%'
              setProgress(100)
            }
            // Immediately start fade out - no delay
            // Animations continue running during fade (they're independent)
            onFadeOutStart?.()
            setIsFadingOut(true)
            
            // Hide preloader after fade completes (animations will be cleaned up then)
            setTimeout(() => {
              setIsVisible(false)
              onComplete?.()
            }, 600) // Match fade duration
          }
        }, 100) // Check more frequently near completion

        return () => {
          clearInterval(progressInterval)
          clearInterval(checkComplete)
          if (progressAnimationRef.current && 'kill' in progressAnimationRef.current) {
            progressAnimationRef.current.kill()
          }
        }
      }

      // Return the animation timeline (it runs independently and smoothly)
      return animationTl
    }

    // Start independent animations (they run smoothly regardless of loading state)
    animatePreloader()

    return () => {
      // Clean up animations when component unmounts or preloader is fully hidden
      // Animations continue during fade-out, only killed when component unmounts
      if (animationTlRef.current && 'kill' in animationTlRef.current) {
        animationTlRef.current.kill()
        animationTlRef.current = null
      }
      // Clean up progress bar animation
      if (progressAnimationRef.current && 'kill' in progressAnimationRef.current) {
        progressAnimationRef.current.kill()
        progressAnimationRef.current = null
      }
    }
  }, [duration, onComplete, onFadeOutStart, actualProgress, contentComplete])

  if (!isVisible) return null

  // Toggle debug panel with 'D' key
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'd' || e.key === 'D') {
        setDebugVisible(prev => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  return (
    <div 
      ref={preloaderRef}
      className={`fixed inset-0 z-50 bg-white flex items-center justify-center ${isFadingOut ? 'opacity-0' : 'opacity-100'} ${className}`}
      style={{ 
        clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
        transition: isFadingOut ? 'opacity 0.6s ease-out' : 'none',
        pointerEvents: isFadingOut ? 'none' : 'auto'
      }}
    >
      {/* Video Background */}
      <div className="absolute inset-0 overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/cabonegro_preloader.webp" type="video/webm" />
          <source src="/cabonegro_preloader.webp" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        {/* Light overlay for better text readability on white background */}
        <div className="absolute inset-0 bg-white/60" />
      </div>

      {/* Image on Right Side - Desktop Only - Absolute Positioned - Inverted to black */}
      <div className="hidden lg:block absolute right-8 top-1/2 -translate-y-1/2 z-10 opacity-100">
        <img 
          src="/BNWCRANE_preloaderB.png" 
          alt="Cabo Negro Industrial Infrastructure" 
          className="max-h-[300px] w-auto object-contain"
          style={{ filter: 'invert(1)' }}
        />
      </div>

      {/* Terminal Preloader */}
      <div className="w-[95%] sm:w-[90%] max-w-4xl relative overflow-hidden block opacity-100 flex flex-col">
        {/* Border Top - Fixed height to prevent vertical movement */}
        <div className="w-full h-6 sm:h-8 flex justify-between items-center px-2 sm:px-2.5 text-xs sm:text-sm text-black font-secondary uppercase tracking-wider flex-shrink-0">
          <span className="truncate max-w-[45%]">Zona Industrial Cabo Negro</span>
          <span className="truncate max-w-[45%]">Desarrollo Estratégico Activo</span>
        </div>

        {/* Terminal Container - Fixed height to prevent vertical movement */}
        <div className="relative h-[500px] sm:h-[450px] flex-grow overflow-hidden p-2 sm:p-2.5">
          <div className="space-y-2 sm:space-y-3 h-full flex flex-col">
            <div className="flex-grow overflow-hidden">
              {TERMINAL_LINES_ES.map((line, index) => (
                <div
                  key={line.id}
                  ref={(el) => {
                    if (el) {
                      terminalLinesRef.current[index] = el
                    }
                  }}
                  className="text-xs sm:text-sm leading-relaxed sm:leading-tight tracking-wider font-light font-primary px-2 sm:px-2.5"
                >
                  <span 
                    className={`inline-block ${
                      line.type === 'highlight' 
                        ? 'text-black font-normal uppercase tracking-widest' 
                        : 'opacity-50 uppercase tracking-widest text-black'
                    }`}
                    data-scramble={line.scramble ? 'true' : undefined}
                    data-original-text={line.text}
                  >
                    {line.scramble ? '▪'.repeat(line.text.length) : line.text}
                  </span>
                </div>
              ))}
            </div>

            {/* Progress Line - Fixed position at bottom */}
            <div className="mt-auto px-2 sm:px-2.5 flex-shrink-0">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-0">
                <span className="font-normal text-xs sm:text-sm text-black uppercase tracking-widest font-primary">
                  Inicializando
                </span>
                <div className="w-full sm:w-48 h-px bg-black/20 relative overflow-hidden">
                  <div 
                    ref={progressBarRef}
                    className="h-full bg-black"
                    style={{ width: '0%' }}
                  />
                </div>
                <span 
                  className="text-black font-normal text-xs sm:text-sm uppercase tracking-widest font-primary" 
                  data-scramble="true" 
                  data-original-text="Infraestructura Cabo Negro"
                >
                  Infraestructura Cabo Negro
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Border Bottom - Fixed height to prevent vertical movement */}
        <div className="w-full h-6 sm:h-8 flex justify-between items-center px-2 sm:px-2.5 text-xs sm:text-sm text-black font-secondary uppercase tracking-wider flex-shrink-0">
          <span className="truncate max-w-[45%]">Secuencia de Puerta de Entrada Estratégica Completa</span>
          <span className="truncate max-w-[45%]">Zona Industrial Cabo Negro Activa</span>
        </div>
      </div>

      {/* Debug Panel */}
      {debugVisible && (
        <div className="fixed bottom-4 left-4 bg-black/90 text-white p-4 rounded-lg font-mono text-xs z-50 max-w-sm backdrop-blur-sm border border-white/20">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-sm uppercase tracking-wider">Debug Panel</h3>
            <button
              onClick={() => setDebugVisible(false)}
              className="text-white/60 hover:text-white text-lg leading-none"
            >
              ×
            </button>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-white/70">Progress Bar:</span>
              <span className="font-bold">{progress.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">Actual Load:</span>
              <span className={`font-bold ${Math.abs(progress - actualProgress) > 10 ? 'text-yellow-400' : 'text-green-400'}`}>
                {actualProgress.toFixed(1)}%
              </span>
            </div>
            <div className="h-px bg-white/20 my-2" />
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-white/60">Images:</span>
                <span>{stats.images.loaded}/{stats.images.total} ({stats.images.total > 0 ? ((stats.images.loaded / stats.images.total) * 100).toFixed(0) : 0}%)</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-white/60">Fonts:</span>
                <span>{stats.fonts.loaded}/{stats.fonts.total} ({stats.fonts.total > 0 ? ((stats.fonts.loaded / stats.fonts.total) * 100).toFixed(0) : 0}%)</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-white/60">Components:</span>
                <span>{stats.components.mounted}/{stats.components.total} ({stats.components.total > 0 ? ((stats.components.mounted / stats.components.total) * 100).toFixed(0) : 0}%)</span>
              </div>
            </div>
            <div className="h-px bg-white/20 my-2" />
            <div className="flex justify-between text-xs">
              <span className="text-white/60">Difference:</span>
              <span className={Math.abs(progress - actualProgress) > 10 ? 'text-yellow-400' : 'text-green-400'}>
                {(progress - actualProgress).toFixed(1)}%
              </span>
            </div>
            <div className="text-[10px] text-white/40 mt-2 pt-2 border-t border-white/10">
              Press 'D' to toggle
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
