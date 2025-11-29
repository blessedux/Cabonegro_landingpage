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

const TERMINAL_LINES_ZH: TerminalLine[] = [
  // Main lines - Cabo Negro specific in Mandarin Chinese (objective tone)
  { id: 'line-1', top: 0, text: '卡波内格罗工业区：麦哲伦地区', type: 'faded', scramble: true },
  { id: 'line-2', top: 0, text: '智利南部战略位置', type: 'highlight', scramble: true },
  { id: 'line-3', top: 30, text: '分析可用土地开发潜力', type: 'faded', scramble: true },
  { id: 'line-4', top: 30, text: '77公顷海域特许权已确认', type: 'highlight', scramble: true },
  { id: 'line-5', top: 60, text: '直接连接9号公路北段', type: 'highlight', scramble: true },
  { id: 'line-6', top: 90, text: '比格尔海峡战略通道', type: 'highlight', scramble: true },
  { id: 'line-7', top: 165, text: '5000平方米土地地块可用', type: 'highlight', scramble: true },
  { id: 'line-8', top: 195, text: '物流工业区已确定', type: 'highlight', scramble: true },
  { id: 'line-9', top: 225, text: '港口基础设施评估中', type: 'highlight', scramble: true },
  { id: 'line-10', top: 255, text: '工业监管框架已批准', type: 'highlight', scramble: true },
  { id: 'line-11', top: 285, text: '工业开发已启动', type: 'highlight', scramble: true },
  
  // Background faded lines - Technical details in Mandarin Chinese
  { id: 'bg-1', top: 15, text: '区域风力发电潜力已确定', type: 'faded', scramble: true },
  { id: 'bg-2', top: 45, text: '评估工业开发能力', type: 'faded', scramble: true },
  { id: 'bg-3', top: 75, text: '3258公顷城市扩张计划', type: 'faded', scramble: true },
  { id: 'bg-4', top: 105, text: '13兆瓦电力容量可用', type: 'faded', scramble: true },
  { id: 'bg-5', top: 180, text: '第一阶段：350米平台+坡道', type: 'faded', scramble: true },
  { id: 'bg-6', top: 210, text: '第二阶段：350米桥梁+300米码头', type: 'faded', scramble: true },
  { id: 'bg-7', top: 240, text: '地缘政治风险评估已完成', type: 'faded', scramble: true },
  { id: 'bg-8', top: 270, text: '工业分区框架已建立', type: 'faded', scramble: true },
]

// Track running scramble animations to prevent duplicates
const runningScrambles = new WeakMap<HTMLElement, () => void>()

// Custom scramble effect function - reveals letters one by one, never reverts
// Now accepts onComplete callback to track when animation finishes
const scrambleText = (
  element: HTMLElement, 
  originalText: string, 
  chars: string = '▪', 
  speed: number = 0.1,
  onComplete?: () => void
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
  let isComplete = false
  
  const interval = setInterval(() => {
    if (!element || !element.parentElement || isComplete) {
      clearInterval(interval)
      runningScrambles.delete(element)
      onComplete?.()
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
      onComplete?.()
      return
    }
    
    // Increment to reveal next letter
    iterations += 1
  }, speed * 100)
  
  const cleanup = () => {
    clearInterval(interval)
    runningScrambles.delete(element)
    onComplete?.()
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

export default function PreloaderZh({ onComplete, onFadeOutStart, duration = 6, className = '' }: PreloaderProps) {
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
      
      // Only update if change is significant (reduce jumping) and it's forward
      if (maxProgress > lastActualProgressRef.current && Math.abs(maxProgress - lastActualProgressRef.current) > 2) {
        lastActualProgressRef.current = maxProgress
        actualProgressRef.current = maxProgress // Update ref for access without re-renders
        setActualProgress(maxProgress)
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

  // Function to check if we can start fade out (both progress and animations complete)
  const checkAndStartFadeOut = () => {
    if (fadeOutStartedRef.current) return // Already started
    
    const progressComplete = parseFloat(progressBarRef.current?.style.width || '0') >= 99.5
    
    // Check if animations are complete
    // Animations are complete ONLY when:
    // 1. We have no running animations (size === 0) AND
    // 2. We've marked them as complete OR there were no animations to begin with
    const hasRunningAnimations = scrambleAnimationsRef.current.size > 0
    const animationsComplete = !hasRunningAnimations && (allAnimationsCompleteRef.current || scrambleAnimationsRef.current.size === 0)
    
    // Only fade out when BOTH progress is complete AND all animations are finished
    if (progressComplete && animationsComplete) {
      fadeOutStartedRef.current = true
      // Start fade out smoothly
      onFadeOutStart?.()
      setIsFadingOut(true)
      
      // Hide preloader after fade completes
      setTimeout(() => {
        setIsVisible(false)
        onComplete?.()
      }, 600) // Match fade duration
    } else {
      // If progress is complete but animations aren't, keep progress at 100% and wait
      // This ensures the progress bar doesn't freeze mid-animation
      if (progressComplete && hasRunningAnimations) {
        // Keep progress at 100% while waiting for animations
        if (progressBarRef.current) {
          progressBarRef.current.style.width = '100%'
          setProgress(100)
        }
      }
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
                scrambleText(span as HTMLElement, originalTextCheck, specialChars, 0.1, () => {
                  // Remove from tracking when complete
                  scrambleAnimationsRef.current.delete(span as HTMLElement)
                  
                  // Check if all animations are complete
                  if (scrambleAnimationsRef.current.size === 0) {
                    allAnimationsCompleteRef.current = true
                    // Trigger fade out if progress is also complete
                    // But don't stop animations - they should complete naturally
                    checkAndStartFadeOut()
                  }
                })
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
        
        // Smooth progress updates - always moves forward
        // Uses ref to get latest actualProgress without causing animation re-runs
        const updateProgressSmoothly = () => {
          if (progressBarRef.current) {
            const currentProgress = parseFloat(progressBarRef.current.style.width) || 0
            const latestActualProgress = actualProgressRef.current // Get latest from ref
            
            // Use the maximum of actual progress and current progress to prevent going backwards
            const targetProgress = Math.max(currentProgress, latestActualProgress)
            
            // Only update if we can move forward
            if (targetProgress > currentProgress) {
              // Smooth interpolation towards target (but never backwards)
              const diff = targetProgress - currentProgress
              const step = diff * 0.2 // Smooth step size (20% of difference)
              const newProgress = Math.min(100, currentProgress + step)
              
              setProgressForward(newProgress)
            }
          }
        }

        // Update progress smoothly every 100ms (less frequent = smoother)
        const progressInterval = setInterval(updateProgressSmoothly, 100)

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
            clearInterval(progressInterval)
            // Ensure progress bar is at 100%
            if (progressBarRef.current) {
              progressBarRef.current.style.width = '100%'
              maxProgressReachedRef.current = 100
            }
            setProgress(100)
            // Check if we can start fade out (wait for animations if needed)
            // This will wait for animations to complete even if progress is 100%
            checkAndStartFadeOut()
          }
        })

        progressAnimationRef.current = ensureCompletion

        // Check if progress reaches 100% and trigger fade out (after animations complete)
        const checkComplete = setInterval(() => {
          const currentProgress = parseFloat(progressBarRef.current?.style.width || '0') || 0
          if (currentProgress >= 99.5) {
            clearInterval(checkComplete)
            clearInterval(progressInterval)
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
            // Check if we can start fade out (wait for animations if needed)
            // This will NOT fade out if animations are still running
            checkAndStartFadeOut()
            
            // Continue checking periodically in case animations complete later
            // This ensures we don't miss the completion if progress reached 100% first
            const animationCheckInterval = setInterval(() => {
              if (fadeOutStartedRef.current) {
                clearInterval(animationCheckInterval)
                return
              }
              checkAndStartFadeOut()
            }, 100)
            
            // Clean up after a reasonable timeout (shouldn't be needed, but safety)
            setTimeout(() => {
              clearInterval(animationCheckInterval)
            }, 10000) // 10 second max wait
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
          <span className="truncate max-w-[45%]">卡波内格罗工业区</span>
          <span className="truncate max-w-[45%]">战略开发进行中</span>
        </div>

        {/* Terminal Container - Fixed height to prevent vertical movement */}
        <div className="relative h-[500px] sm:h-[450px] flex-grow overflow-hidden p-2 sm:p-2.5">
          <div className="space-y-2 sm:space-y-3 h-full flex flex-col">
            <div className="flex-grow overflow-hidden">
              {TERMINAL_LINES_ZH.map((line, index) => (
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
                  初始化中
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
                  data-original-text="卡波内格罗基础设施"
                >
                  卡波内格罗基础设施
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Border Bottom - Fixed height to prevent vertical movement */}
        <div className="w-full h-6 sm:h-8 flex justify-between items-center px-2 sm:px-2.5 text-xs sm:text-sm text-black font-secondary uppercase tracking-wider flex-shrink-0">
          <span className="truncate max-w-[45%]">战略门户序列完成</span>
          <span className="truncate max-w-[45%]">卡波内格罗工业区已激活</span>
        </div>
      </div>

    </div>
  )
}
