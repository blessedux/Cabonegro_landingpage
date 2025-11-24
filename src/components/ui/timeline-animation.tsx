'use client'

import { useRef, useEffect, useState, ReactNode } from 'react'
import { motion, useScroll, useTransform, Variants } from 'framer-motion'
import { cn } from '@/lib/utils'

interface TimelineContentProps {
  as?: keyof JSX.IntrinsicElements | React.ComponentType<any>
  animationNum: number
  timelineRef: React.RefObject<HTMLElement>
  customVariants?: Variants
  className?: string
  children: ReactNode
  [key: string]: any
}

export function TimelineContent({
  as: Component = 'div',
  animationNum,
  timelineRef,
  customVariants,
  className,
  children,
  ...props
}: TimelineContentProps) {
  const [isVisible, setIsVisible] = useState(false)
  const elementRef = useRef<HTMLElement>(null)

  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ['start end', 'end start']
  })

  // Calculate when this specific element should animate
  // Each element animates at a different scroll progress point
  const elementProgress = useTransform(
    scrollYProgress,
    [0, 1],
    [0, 1]
  )

  useEffect(() => {
    const unsubscribe = elementProgress.on('change', (latest) => {
      // Trigger animation when scroll progress reaches threshold
      // Adjust threshold based on animationNum for staggered effect
      const threshold = (animationNum * 0.1) % 1
      if (latest >= threshold && !isVisible) {
        setIsVisible(true)
      }
    })

    // Also check initial state
    const initialProgress = elementProgress.get()
    const threshold = (animationNum * 0.1) % 1
    if (initialProgress >= threshold) {
      setIsVisible(true)
    }

    return unsubscribe
  }, [elementProgress, animationNum, isVisible])

  // Default variants if none provided
  const defaultVariants: Variants = {
    visible: {
      y: 0,
      opacity: 1,
      filter: 'blur(0px)',
      transition: {
        duration: 0.5,
      },
    },
    hidden: {
      filter: 'blur(10px)',
      y: -20,
      opacity: 0,
    },
  }

  const variants = customVariants || defaultVariants

  // Map common HTML elements to motion components
  const getMotionComponent = () => {
    if (typeof Component === 'string') {
      switch (Component) {
        case 'a':
          return motion.a
        case 'button':
          return motion.button
        case 'span':
          return motion.span
        case 'h1':
          return motion.h1
        case 'h2':
          return motion.h2
        case 'h3':
          return motion.h3
        case 'p':
          return motion.p
        case 'figure':
          return motion.figure
        case 'div':
        default:
          return motion.div
      }
    }
    return motion.div
  }

  const MotionComponent = getMotionComponent()

  return (
    <MotionComponent
      ref={elementRef as any}
      initial="hidden"
      animate={isVisible ? 'visible' : 'hidden'}
      variants={variants}
      className={cn(className)}
      {...props}
    >
      {children}
    </MotionComponent>
  )
}

