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
  const [isScrolling, setIsScrolling] = useState(false)
  const animationFrameRef = useRef<number | null>(null)

  useEffect(() => {
    const checkScrollPosition = () => {
      const faqElement = document.getElementById('FAQ')
      if (!faqElement) return

      const faqRect = faqElement.getBoundingClientRect()
      const scrollY = window.scrollY || window.pageYOffset
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight

      // Show button when we're below the FAQ section
      const isBelowFAQ = faqRect.bottom < 0
      setIsVisible(isBelowFAQ)

      if (isBelowFAQ && !isScrolling) {
        // Calculate scroll progress from FAQ bottom to page bottom
        const faqBottom = faqElement.offsetTop + faqElement.offsetHeight
        const scrollableDistance = documentHeight - windowHeight - faqBottom
        const currentScroll = Math.max(0, scrollY - faqBottom)
        const progress = scrollableDistance > 0 
          ? Math.min(Math.max(currentScroll / scrollableDistance, 0), 1)
          : 0
        setScrollProgress(progress)
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
  }, [isScrolling])

  const handleClick = () => {
    setIsScrolling(true)
    const startPosition = window.pageYOffset
    const targetPosition = 0
    const startTime = performance.now()
    const duration = 1000 // 1000ms scroll duration

    const animateScroll = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // Easing function (ease-in-out-cubic)
      const easeInOutCubic = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2

      const currentPosition = startPosition + (targetPosition - startPosition) * easeInOutCubic
      window.scrollTo(0, currentPosition)

      // Update scroll progress for circular animation (starts from current progress, completes to 1)
      // The circle should animate from left side (starting position) and complete as we reach top
      const initialProgress = scrollProgress
      const scrollProgressValue = initialProgress + (1 - initialProgress) * easeInOutCubic
      setScrollProgress(scrollProgressValue)

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animateScroll)
      } else {
        setIsScrolling(false)
        // Reset progress after a brief delay
        setTimeout(() => {
          setScrollProgress(0)
        }, 200)
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
        {/* Animated progress circle */}
        <circle
          cx="28"
          cy="28"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="text-gray-700 transition-all duration-75"
          style={{
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
          }}
        />
      </svg>

      {/* Arrow icon */}
      <ArrowUp
        className={cn(
          'w-6 h-6 text-gray-700 relative z-10',
          'transition-transform duration-300',
          'group-hover:translate-y-[-2px]',
          isScrolling && 'animate-pulse'
        )}
      />
    </button>
  )
}

