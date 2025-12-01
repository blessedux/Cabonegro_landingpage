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
}

const TERMINAL_LINES: TerminalLine[] = [
  // Main lines - Cabo Negro specific
  { id: 'line-1', top: 0, text: '300+ Hectares Available for Land Purchase in Patagonia - Cabo Negro', type: 'highlight', scramble: true },
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

// Track running scramble animations to prevent duplicates
const runningScrambles = new WeakMap<HTMLElement, () => void>()

// Custom scramble effect function - reveals letters one by one, then continues scrambling
// Now accepts onComplete callback to track when initial reveal finishes
// After reveal, continues with subtle continuous scrambling effect
const scrambleText = (
  element: HTMLElement, 
  originalText: string, 
  chars: string = '▪', 
  speed: number = 0.1,
  onComplete?: () => void,
  continueScrambling: boolean = true // New parameter to continue scrambling after reveal
) => {
  if (!element || !originalText) {
    onComplete?.()
    return () => {}
  }
  
  // If already running, don't start again
  if (runningScrambles.has(element)) {
    return runningScrambles.get(element)!
  }
  
  // Ensure we start with all dots
  element.textContent = originalText.split('').map(() => chars[0]).join('')
  
  let iterations = 0
  let isRevealComplete = false
  let continuousScrambleInterval: number | null = null
  let revealRafId: number | null = null
  let lastRevealTime = performance.now()
  const revealInterval = speed * 100 // Time between each letter reveal in ms
  
  // Use requestAnimationFrame for smooth, fluid reveal animation
  const revealAnimation = (currentTime: number) => {
    if (!element || !element.parentElement) {
      if (continuousScrambleInterval !== null) {
        cancelAnimationFrame(continuousScrambleInterval)
      }
      if (revealRafId !== null) {
        cancelAnimationFrame(revealRafId)
      }
      runningScrambles.delete(element)
      onComplete?.()
      return
    }
    
    // Check if enough time has passed to reveal next letter
    if (currentTime - lastRevealTime >= revealInterval) {
      lastRevealTime = currentTime
      
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
      
      // Once all letters are revealed, start continuous scrambling
      if (iterations >= originalText.length && !isRevealComplete) {
        isRevealComplete = true
        element.textContent = originalText
        
        // Call onComplete when reveal is done (for tracking purposes)
        onComplete?.()
        
        // Start continuous subtle scrambling effect - keeps text moving
        // Uses requestAnimationFrame for better performance and doesn't block DOM
        if (continueScrambling) {
          let lastScrambleTime = 0
          const scrambleInterval = 200 + Math.random() * 300 // Random interval for organic feel
          
          const continuousScramble = (scrambleTime: number) => {
            if (!element || !element.parentElement) {
              return
            }
            
            // Only scramble at intervals (not every frame) for performance
            if (scrambleTime - lastScrambleTime >= scrambleInterval) {
              lastScrambleTime = scrambleTime
              
              // Subtle continuous scramble - randomly replace 1-2 characters with dots briefly
              const textArray = originalText.split('')
              const numToScramble = Math.min(2, Math.floor(Math.random() * 2) + 1)
              const indicesToScramble: number[] = []
              
              // Pick random indices to scramble
              for (let i = 0; i < numToScramble; i++) {
                const randomIndex = Math.floor(Math.random() * textArray.length)
                if (!indicesToScramble.includes(randomIndex)) {
                  indicesToScramble.push(randomIndex)
                }
              }
              
              // Apply scramble
              const scrambledText = textArray.map((char, index) => {
                if (indicesToScramble.includes(index)) {
                  return chars[0]
                }
                return char
              }).join('')
              
              element.textContent = scrambledText
              
              // Restore after brief moment using RAF for better performance
              requestAnimationFrame(() => {
                setTimeout(() => {
                  if (element && element.parentElement) {
                    element.textContent = originalText
                  }
                }, 50 + Math.random() * 100) // Random restore time for organic feel
              })
            }
            
            // Continue animation loop
            continuousScrambleInterval = requestAnimationFrame(continuousScramble) as any
          }
          
          continuousScrambleInterval = requestAnimationFrame(continuousScramble) as any
        }
        
        return
      }
      
      // Increment to reveal next letter
      iterations += 1
    }
    
    // Continue animation loop
    revealRafId = requestAnimationFrame(revealAnimation)
  }
  
  // Start the smooth reveal animation
  revealRafId = requestAnimationFrame(revealAnimation)
  
  const cleanup = () => {
    if (revealRafId !== null) {
      cancelAnimationFrame(revealRafId)
    }
    if (continuousScrambleInterval !== null) {
      cancelAnimationFrame(continuousScrambleInterval)
    }
    runningScrambles.delete(element)
    onComplete?.()
  }
  
  // Store RAF ID for cleanup
  revealRafId = requestAnimationFrame(revealAnimation)
  
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

export default function PreloaderEn({ onComplete, onFadeOutStart, duration = 6, className = '' }: PreloaderProps) {
  const [progress, setProgress] = useState(0)
  const [isVisible, setIsVisible] = useState(true)
  const [isFadingOut, setIsFadingOut] = useState(false)
  const [fontsLoaded, setFontsLoaded] = useState(false)
  const [actualProgress, setActualProgress] = useState(0)
  const lastActualProgressRef = useRef(0)
  const actualProgressRef = useRef(0) // Ref to access latest actualProgress without causing re-renders
  
  const preloaderRef = useRef<HTMLDivElement>(null)
  const progressBarRef = useRef<HTMLDivElement>(null)
  const terminalLinesRef = useRef<HTMLDivElement[]>([])
  const progressAnimationRef = useRef<ReturnType<typeof gsap.to> | null>(null)
  const animationTlRef = useRef<gsap.core.Timeline | null>(null)
  const scrambleAnimationsRef = useRef<Set<HTMLElement>>(new Set())
  const allAnimationsCompleteRef = useRef(false)
  const fadeOutStartedRef = useRef(false)
  const maxProgressReachedRef = useRef(0) // Track maximum progress to prevent going backwards
  
  const specialChars = '▪'

  // Track maximum actual progress to prevent backwards movement
  const maxActualProgressRef = useRef(0)
  
  // Use content loader to track actual loading progress
  const { stats, isComplete: contentComplete, progress: realProgress } = useContentLoader({
    onProgress: (progress) => {
      // Always use the maximum progress we've seen (never go backwards)
      const maxProgress = Math.max(maxActualProgressRef.current, progress)
      maxActualProgressRef.current = maxProgress
      
      // Update smoothly - accept any forward progress, no threshold
      // The interpolation will handle smoothness
      if (maxProgress > lastActualProgressRef.current) {
        lastActualProgressRef.current = maxProgress
        actualProgressRef.current = maxProgress // Update ref for access without re-renders
        // Don't set state here - let the RAF loop handle smooth updates
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

  // Function to check if we can start fade out - PROMPTLY when progress reaches 100%
  // Scrambled text continues animating but doesn't block fade out
  const checkAndStartFadeOut = () => {
    if (fadeOutStartedRef.current) return // Already started
    
    const progressComplete = parseFloat(progressBarRef.current?.style.width || '0') >= 99.5
    
    // Fade out PROMPTLY when progress reaches 100%
    // Scrambled text animations continue in background but don't block fade out
    if (progressComplete) {
      fadeOutStartedRef.current = true
      // Start fade out immediately - no waiting for animations
      onFadeOutStart?.()
      setIsFadingOut(true)
      
      // Hide preloader after fade completes - faster transition
      setTimeout(() => {
        setIsVisible(false)
        onComplete?.()
      }, 400) // Faster fade duration for prompt transition
    }
  }

  useEffect(() => {
    if (!preloaderRef.current) return

    const animatePreloader = () => {
      // Independent animation timeline - runs smoothly regardless of loading state
      // These animations continue even when progress bar reaches 100%
      // CRITICAL: This timeline runs like a video - from start to finish, independent of loading
      const animationTl = gsap.timeline({ 
        paused: false,
        // Ensure timeline never pauses or stops based on external state
        onComplete: () => {
          // Only mark animations as complete when timeline actually finishes
          // This ensures the full animation cycle completes
        }
      })
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

      // Animation duration - completely independent of loading (ensures smooth flow like a video)
      // This duration determines the full animation cycle, regardless of loading speed
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
          
          // Track this animation
          scrambleAnimationsRef.current.add(span as HTMLElement)
          
          // Start scramble animation when line becomes visible
          // Small delay after line opacity animation starts
          const scrambleDelay = (timePoint + 0.2 + (spanIndex * 0.03)) * 1000
          
          const timeoutId = setTimeout(() => {
            // Verify span still exists and is in the DOM
            // CRITICAL: Continue animation even if progress is 100% - animations are independent
            if (span && span.parentElement && span.getAttribute('data-scramble') === 'true') {
              const originalTextCheck = span.getAttribute('data-original-text') || ''
              
              if (originalTextCheck) {
                // Start scramble animation with completion callback
                // This animation runs independently - like a video, it completes its full cycle
                // Continue scrambling after reveal completes - text keeps moving even after 100%
                scrambleText(span as HTMLElement, originalTextCheck, specialChars, 0.1, () => {
                  // Remove from tracking when reveal is complete (but scrambling continues)
                  scrambleAnimationsRef.current.delete(span as HTMLElement)
                  
                  // Check if all reveal animations are complete
                  if (scrambleAnimationsRef.current.size === 0) {
                    allAnimationsCompleteRef.current = true
                    // Don't block fade out - scrambled text continues in background
                    // Fade out happens promptly when progress reaches 100%
                  }
                }, true) // Continue scrambling after reveal
              } else {
                // No text, mark as complete immediately
                scrambleAnimationsRef.current.delete(span as HTMLElement)
                // Check if all animations are complete
                if (scrambleAnimationsRef.current.size === 0) {
                  allAnimationsCompleteRef.current = true
                  checkAndStartFadeOut()
                }
              }
            } else {
              // Span removed, mark as complete
              scrambleAnimationsRef.current.delete(span as HTMLElement)
              // Check if all animations are complete
              if (scrambleAnimationsRef.current.size === 0) {
                allAnimationsCompleteRef.current = true
                checkAndStartFadeOut()
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
      // This is part of the animation sequence, not tied to loading
      const disappearTl = gsap.timeline()
      disappearTl.to(sortedLines, {
        opacity: 0,
        duration: 0.3,
        stagger: 0.05,
        ease: 'power1.in'
      })

      // Add disappearing effect - happens at a fixed time in the animation sequence
      // This ensures the full animation cycle completes like a video, regardless of loading speed
      // The animation runs from start to finish, independent of progress bar
      animationTl.add(disappearTl, animationDuration - 0.8)

      // Progress bar animation - ONLY element tied to actual loading progress
      // This runs independently from the visual animations above
      // CRITICAL: Progress bar must ALWAYS move forward, never backwards
      if (progressBarRef.current) {
        // Reset max progress when starting
        maxProgressReachedRef.current = 0
        
        // Function to set progress - ensures it never goes backwards
        const setProgressForward = (newProgress: number) => {
          if (progressBarRef.current) {
            // Always use the maximum between current progress and new progress
            const currentProgress = parseFloat(progressBarRef.current.style.width) || 0
            const targetProgress = Math.max(currentProgress, Math.min(100, newProgress))
            
            // Update max progress reached
            maxProgressReachedRef.current = Math.max(maxProgressReachedRef.current, targetProgress)
            
            // Only update if we're moving forward
            if (targetProgress > currentProgress) {
              progressBarRef.current.style.width = `${targetProgress}%`
              setProgress(targetProgress)
            }
          }
        }
        
        // Smooth progress updates - always moves forward with easing
        // Uses ref to get latest actualProgress without causing animation re-runs
        let lastUpdateTime = performance.now()
        const updateProgressSmoothly = (currentTime: number = performance.now()) => {
          if (progressBarRef.current) {
            const currentProgress = parseFloat(progressBarRef.current.style.width) || 0
            const latestActualProgress = actualProgressRef.current // Get latest from ref
            
            // Use the maximum of actual progress and current progress to prevent going backwards
            const targetProgress = Math.max(currentProgress, latestActualProgress)
            
            // Only update if we can move forward
            if (targetProgress > currentProgress) {
              // Calculate delta time for frame-rate independent animation
              const deltaTime = Math.min((currentTime - lastUpdateTime) / 16.67, 2) // Cap at 2 frames
              lastUpdateTime = currentTime
              
              // Smooth easing interpolation - exponential ease-out for natural feel
              const diff = targetProgress - currentProgress
              // Use smaller step for smoother animation (8% per frame at 60fps = smooth)
              // Adjust based on deltaTime for frame-rate independence
              const easingFactor = 0.08 * deltaTime
              const step = diff * easingFactor
              
              // Ensure minimum step to prevent stalling
              const minStep = 0.1
              const actualStep = Math.max(step, minStep)
              const newProgress = Math.min(100, currentProgress + actualStep)
              
              setProgressForward(newProgress)
            }
          }
        }

        // Update progress smoothly using requestAnimationFrame for better performance
        // This doesn't block the main thread and allows DOM to load beneath
        let rafId: number | null = null
        const updateProgressWithRAF = (currentTime: number) => {
          updateProgressSmoothly(currentTime)
          rafId = requestAnimationFrame(updateProgressWithRAF)
        }
        rafId = requestAnimationFrame(updateProgressWithRAF)

        // GSAP animation to ensure we reach 100% by the end of duration
        // This runs in parallel but respects the forward-only rule
        // Use a proxy object to track GSAP's progress
        const progressProxy = { value: 0 }
        const ensureCompletion = gsap.to(progressProxy, {
          value: 100,
          duration: duration,
          ease: 'power1.out',
          onUpdate: function() {
            if (progressBarRef.current) {
              const gsapProgress = progressProxy.value
              const currentProgress = parseFloat(progressBarRef.current.style.width) || 0
              
              // Only update if GSAP progress is ahead of current progress (forward only)
              if (gsapProgress > currentProgress) {
                setProgressForward(gsapProgress)
              }
            }
          },
          onComplete: () => {
            setProgressForward(100)
            if (rafId !== null) {
              cancelAnimationFrame(rafId)
            }
            // Ensure progress bar is at 100%
            if (progressBarRef.current) {
              progressBarRef.current.style.width = '100%'
              maxProgressReachedRef.current = 100
            }
            setProgress(100)
            // Fade out promptly when progress reaches 100%
            checkAndStartFadeOut()
          }
        })

        progressAnimationRef.current = ensureCompletion

        // Check if progress reaches 100% and trigger fade out promptly
        const checkComplete = () => {
          const currentProgress = parseFloat(progressBarRef.current?.style.width || '0') || 0
          if (currentProgress >= 99.5) {
            if (rafId !== null) {
              cancelAnimationFrame(rafId)
            }
            if (progressAnimationRef.current && 'kill' in progressAnimationRef.current) {
              progressAnimationRef.current.kill()
            }
            // Ensure we're at 100% (forward only)
            setProgressForward(100)
            if (progressBarRef.current) {
              progressBarRef.current.style.width = '100%'
              maxProgressReachedRef.current = 100
            }
            setProgress(100)
            // Fade out promptly - no waiting
            checkAndStartFadeOut()
          } else {
            // Continue checking using RAF for better performance
            requestAnimationFrame(checkComplete)
          }
        }
        
        // Start checking with RAF
        requestAnimationFrame(checkComplete)

        return () => {
          if (rafId !== null) {
            cancelAnimationFrame(rafId)
          }
          if (progressAnimationRef.current && 'kill' in progressAnimationRef.current) {
            progressAnimationRef.current.kill()
          }
        }
      }

      // Return the animation timeline (it runs independently and smoothly)
      return animationTl
    }

    // Start independent animations (they run smoothly regardless of loading state)
    // These animations run like a video - from start to finish, completely independent of loading
    animatePreloader()
    
    // CRITICAL: Ensure animation timeline never pauses, even when progress reaches 100%
    // The animations must complete their full cycle regardless of loading state
    // The timeline is already playing (paused: false in timeline config) and will continue
    if (animationTlRef.current && 'play' in animationTlRef.current) {
      // Explicitly ensure timeline is playing and won't be paused
      animationTlRef.current.play()
    }

    return () => {
      // Clean up animations ONLY when component unmounts
      // Animations continue during fade-out - they must complete their full cycle
      // Only kill when component is actually being removed from DOM
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
    // CRITICAL: Do NOT include actualProgress or contentComplete in dependencies
    // This ensures animations run independently like a video, not re-triggered by loading state
    // Only re-run if duration or callbacks change (which shouldn't happen during animation)
    // The animation timeline runs once from start to finish, like a video playback
  }, [duration, onComplete, onFadeOutStart])

  if (!isVisible) return null


  return (
    <div 
      ref={preloaderRef}
      className={`fixed inset-0 z-50 bg-white flex items-center justify-center ${isFadingOut ? 'opacity-0' : 'opacity-100'} ${className}`}
      style={{ 
        clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
        transition: isFadingOut ? 'opacity 0.4s ease-out' : 'none',
        pointerEvents: isFadingOut ? 'none' : 'auto',
        willChange: 'opacity' // Performance optimization
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

      {/* Circular Gradient Overlay - 3D Tunnel Effect */}
      <div 
        className="absolute inset-0 pointer-events-none z-20"
        style={{
          background: 'radial-gradient(circle at center, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0) 20%, rgba(0, 0, 0, 0.03) 45%, rgba(0, 0, 0, 0.06) 70%, rgba(0, 0, 0, 0.10) 90%, rgba(0, 0, 0, 0.15) 100%)'
        }}
      />

      {/* Image on Right Side - Desktop Only - Absolute Positioned - Inverted to black */}
      <div className="hidden lg:block absolute right-8 top-1/2 -translate-y-1/2 z-10 opacity-100">
        <img 
          src="/BNWCRANE_preloaderB.png" 
          alt="Cabo Negro Industrial Infrastructure" 
          className="max-h-[300px] w-auto object-contain"
          style={{ filter: 'invert(1)' }}
        />
      </div>

      {/* Mobile Icon - Centered behind scrambled text, small and centered */}
      <div className="lg:hidden absolute inset-0 flex items-center justify-center z-0 pointer-events-none">
        <img 
          src="/BNWCRANE_preloaderB.png" 
          alt="Cabo Negro Industrial Infrastructure" 
          className="w-96 h-96 sm:w-[512px] sm:h-[512px] object-contain opacity-100"
          style={{ filter: 'invert(1)' }}
        />
      </div>

      {/* Terminal Preloader */}
      <div className="w-[95%] sm:w-[90%] max-w-4xl relative overflow-hidden block opacity-100 flex flex-col z-10">
        {/* Border Top - Fixed height to prevent vertical movement */}
        <div className="w-full h-6 sm:h-8 flex justify-between items-center px-2 sm:px-2.5 text-xs sm:text-sm text-black font-secondary uppercase tracking-wider flex-shrink-0">
          <span className="truncate max-w-[45%]">Cabo Negro Industrial Zone</span>
          <span className="truncate max-w-[45%]">Strategic Development Active</span>
        </div>

        {/* Terminal Container - Fixed height to prevent vertical movement */}
        <div className="relative h-[500px] sm:h-[450px] flex-grow overflow-hidden p-2 sm:p-2.5">
          <div className="space-y-2 sm:space-y-3 h-full flex flex-col">
            <div className="flex-grow overflow-hidden">
              {TERMINAL_LINES.map((line, index) => (
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
              <div className="flex flex-col gap-2">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-0">
                  <span className="font-normal text-xs sm:text-sm text-black uppercase tracking-widest font-primary">
                    Initializing
                  </span>
                  <div className="w-full sm:w-48 h-px bg-black/20 relative overflow-hidden">
                  <div 
                    ref={progressBarRef}
                    className="h-full bg-black transition-all duration-75 ease-out"
                    style={{ 
                      width: '0%',
                      transition: 'width 0.1s linear' // Smooth CSS transition for visual polish
                    }}
                  />
                  </div>
                  <span 
                    className="text-black font-normal text-xs sm:text-sm uppercase tracking-widest font-primary" 
                    data-scramble="true" 
                    data-original-text="Cabo Negro Infrastructure"
                  >
                    Cabo Negro Infrastructure
                  </span>
                </div>
                {/* Progress Counter - Shows 0-100 */}
                <div className="flex items-center justify-center sm:justify-start">
                  <span className="text-black font-normal text-xs sm:text-sm uppercase tracking-widest font-primary">
                    {Math.round(progress)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Border Bottom - Fixed height to prevent vertical movement */}
        <div className="w-full h-6 sm:h-8 flex justify-between items-center px-2 sm:px-2.5 text-xs sm:text-sm text-black font-secondary uppercase tracking-wider flex-shrink-0">
          <span className="truncate max-w-[45%]">Strategic Gateway Sequence Complete</span>
          <span className="truncate max-w-[45%]">Cabo Negro Industrial Zone Active</span>
        </div>
      </div>

    </div>
  )
}
