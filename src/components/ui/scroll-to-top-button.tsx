'use client'

import { useState, useEffect, useRef } from 'react'
import { ArrowUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ScrollToTopButtonProps {
  className?: string
}

export function ScrollToTopButton({ className }: ScrollToTopButtonProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [opacity, setOpacity] = useState(0)
  const [isScrolling, setIsScrolling] = useState(false)
  const isScrollingRef = useRef(false)
  const scrollProgressRef = useRef(0)
  const animationFrameRef = useRef<number | null>(null)

  useEffect(() => {
    const checkScrollPosition = () => {
      // Don't update UI during programmatic scroll
      if (isScrollingRef.current) return

      const faqElement = document.getElementById('FAQ')
      if (!faqElement) return

      const faqRect = faqElement.getBoundingClientRect()
      const scrollY = window.scrollY || window.pageYOffset
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight

      // Calculate when we've scrolled past the FAQ section (entering footer)
      // faqRect.bottom < 0 means the FAQ bottom is above the viewport top
      const faqBottom = faqElement.offsetTop + faqElement.offsetHeight
      const distancePastFAQ = Math.max(0, scrollY - faqBottom)
      
      // Show button as soon as we start scrolling past FAQ
      const isPastFAQ = distancePastFAQ > 0
      setIsVisible(isPastFAQ)

      if (isPastFAQ) {
        // Calculate scroll progress from FAQ bottom to page bottom (for circular progress)
        const scrollableDistance = documentHeight - windowHeight - faqBottom
        const progress = scrollableDistance > 0 
          ? Math.min(Math.max(distancePastFAQ / scrollableDistance, 0), 1)
          : 0
        scrollProgressRef.current = progress
        setScrollProgress(progress)

        // Calculate opacity: fade in immediately as we pass FAQ, fade out when scrolling back up
        // Use a smooth fade over 200px past the FAQ section
        const fadeDistance = 200
        const calculatedOpacity = Math.min(distancePastFAQ / fadeDistance, 1)
        
        setOpacity(calculatedOpacity)
      } else {
        // Fade out when scrolling back up past FAQ
        setOpacity(0)
      }
    }

    window.addEventListener('scroll', checkScrollPosition, { passive: true })
    checkScrollPosition() // Initial check

    return () => {
      window.removeEventListener('scroll', checkScrollPosition)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()

    // Prevent multiple clicks during animation
    if (isScrollingRef.current) {
      console.log('[ScrollToTop] Click ignored - already scrolling')
      return
    }

    console.log('[ScrollToTop] Button clicked, starting scroll animation')
    isScrollingRef.current = true
    setIsScrolling(true)

    // Cancel any existing animation
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }

    const startPosition = window.pageYOffset || window.scrollY || document.documentElement.scrollTop
    const targetPosition = 0
    const startTime = performance.now()
    const duration = 800 // 800ms scroll duration
    const initialProgress = scrollProgressRef.current

    console.log('[ScrollToTop] Start position:', startPosition, 'Initial progress:', initialProgress)

    const animateScroll = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // Easing function (ease-in-out-cubic)
      const easeInOutCubic = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2

      const currentPosition = startPosition + (targetPosition - startPosition) * easeInOutCubic
      
      // Use scrollTo with smooth behavior as fallback, but we control the animation
      window.scrollTo({
        top: currentPosition,
        behavior: 'auto' // Disable native smooth scroll to avoid conflicts
      })

      // Update scroll progress for circular animation
      const scrollProgressValue = initialProgress + (1 - initialProgress) * easeInOutCubic
      scrollProgressRef.current = scrollProgressValue
      setScrollProgress(scrollProgressValue)

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animateScroll)
      } else {
        // Ensure we're at the top
        window.scrollTo({ top: 0, behavior: 'auto' })
        console.log('[ScrollToTop] Animation complete')
        
        // Reset state after animation completes
        isScrollingRef.current = false
        setIsScrolling(false)
        setTimeout(() => {
          setScrollProgress(0)
          scrollProgressRef.current = 0
        }, 200)
        
        animationFrameRef.current = null
      }
    }

    animationFrameRef.current = requestAnimationFrame(animateScroll)
  }

  if (!isVisible) return null

  // Calculate stroke-dasharray for circular progress
  // Circle starts from left side (12 o'clock position when rotated -90deg)
  const radius = 24
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference * (1 - scrollProgress)

  return (
    <button
      onClick={handleClick}
      className={cn(
        'fixed bottom-8 right-8 z-50 group',
        'w-14 h-14 rounded-full',
        'bg-white/90 backdrop-blur-sm',
        'hover:bg-white',
        'transition-all duration-300',
        'shadow-lg hover:shadow-xl',
        'flex items-center justify-center',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500',
        className
      )}
      style={{ opacity }}
      aria-label="Scroll back to top"
    >
      {/* Circular progress border - white border that animates */}
      <svg
        className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none"
        viewBox="0 0 56 56"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background circle (subtle) */}
        <circle
          cx="28"
          cy="28"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-gray-200"
        />
        {/* Animated progress circle - cyan blue accent color */}
        <circle
          cx="28"
          cy="28"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="text-cyan-400 transition-all duration-75"
          style={{
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
          }}
        />
      </svg>

      {/* Arrow icon */}
      <ArrowUp
        className={cn(
          'w-6 h-6 text-cyan-400 relative z-10',
          'transition-transform duration-300',
          'group-hover:translate-y-[-2px]',
          isScrolling && 'animate-pulse'
        )}
      />
    </button>
  )
}

