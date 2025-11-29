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

export default function PreloaderZh({ onComplete, onFadeOutStart, duration = 6, className = '' }: PreloaderProps) {
  const [progress, setProgress] = useState(0)
  const [isVisible, setIsVisible] = useState(true)
  const [isFadingOut, setIsFadingOut] = useState(false)
  const [fontsLoaded, setFontsLoaded] = useState(false)
  
  const preloaderRef = useRef<HTMLDivElement>(null)
  const progressBarRef = useRef<HTMLDivElement>(null)
  const terminalLinesRef = useRef<HTMLDivElement[]>([])
  const progressAnimationRef = useRef<ReturnType<typeof gsap.to> | null>(null)
  
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
      const tl = gsap.timeline()

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

      // Smooth, independent progress bar animation using GSAP
      // This ensures fluid animation that doesn't pause or get stuck
      if (progressBarRef.current) {
        progressAnimationRef.current = gsap.fromTo(progressBarRef.current, 
          { width: '0%' },
          {
            width: '100%',
            duration: duration,
            ease: 'none', // Linear progression for smooth, consistent animation
            onUpdate: () => {
              // Update React state for display purposes, but animation is handled by GSAP
              if (progressBarRef.current) {
                const currentWidth = progressBarRef.current.style.width
                const percent = parseFloat(currentWidth) || 0
                setProgress(percent)
              }
            },
            onComplete: () => {
              setProgress(100)
              // Start fade out immediately when progress reaches 100%
              onFadeOutStart?.()
              setIsFadingOut(true)
            }
          }
        )
      }

      // Complete and hide immediately after fade transition
      tl.call(() => {
        setIsVisible(false)
        onComplete?.()
      }, [], duration - 0.3)

      return tl
    }

    // Start animation
    const mainTl = animatePreloader()

    return () => {
      mainTl.kill()
      // Clean up progress bar animation
      if (progressAnimationRef.current) {
        progressAnimationRef.current.kill()
        progressAnimationRef.current = null
      }
    }
  }, [duration, onComplete])

  if (!isVisible) return null

  return (
    <div 
      ref={preloaderRef}
      className={`fixed inset-0 z-50 bg-white flex items-center justify-center transition-opacity duration-300 ${isFadingOut ? 'opacity-0' : 'opacity-100'} ${className}`}
      style={{ clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)' }}
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
        {/* Light overlay for better text readability */}
        <div className="absolute inset-0 bg-white/60" />
      </div>

      {/* Image on Right Side - Desktop Only - Absolute Positioned */}
      <div className="hidden lg:block absolute right-8 top-1/2 -translate-y-1/2 z-10 opacity-100">
        <img 
          src="/BNWCRANE_preloaderB.png" 
          alt="Cabo Negro Industrial Infrastructure" 
          className="max-h-[300px] w-auto object-contain"
        />
      </div>

      {/* Mobile Icon - Centered behind scrambled text, small and centered */}
      <div className="lg:hidden absolute inset-0 flex items-center justify-center z-0 pointer-events-none">
        <img 
          src="/BNWCRANE_preloaderB.png" 
          alt="Cabo Negro Industrial Infrastructure" 
          className="w-96 h-96 sm:w-[512px] sm:h-[512px] object-contain opacity-100"
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
        <div className="relative h-[450px] sm:h-[400px] flex-grow overflow-hidden p-2 sm:p-2.5">
          <div className="space-y-2 sm:space-y-3 h-full flex flex-col">
            <div className="flex-grow overflow-hidden">
              {TERMINAL_LINES_ZH.map((line, index) => (
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
                        ? 'text-black font-normal uppercase tracking-widest' 
                        : 'opacity-50 uppercase tracking-widest text-black'
                    }`}
                    data-scramble={line.scramble ? 'true' : undefined}
                    data-original-text={line.text}
                  >
                    {line.text}
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
