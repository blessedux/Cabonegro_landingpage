'use client'

import { useRef, ReactNode } from 'react'
import { motion, useInView, Variants } from 'framer-motion'
import { cn } from '@/lib/utils'

interface TimelineContentProps extends Record<string, unknown> {
  as?: keyof JSX.IntrinsicElements | React.ComponentType<unknown>
  animationNum: number
  timelineRef: React.RefObject<HTMLElement | null>
  customVariants?: Variants
  className?: string
  children: ReactNode
}

/**
 * Scroll-reveal wrapper. Uses viewport intersection (not parent scroll progress)
 * so content reliably animates when it enters the viewport.
 * Pass `custom={animationNum}` into variant functions via the `custom` prop on motion.
 */
export function TimelineContent({
  as: Component = 'div',
  animationNum,
  timelineRef: _timelineRef,
  customVariants,
  className,
  children,
  ...props
}: TimelineContentProps) {
  const elementRef = useRef<HTMLElement | null>(null)
  const isInView = useInView(elementRef, {
    once: true,
    amount: 0.12,
    margin: '0px 0px -12% 0px',
  })

  const defaultVariants: Variants = {
    visible: {
      y: 0,
      opacity: 1,
      filter: 'blur(0px)',
      transition: {
        duration: 0.5,
        delay: animationNum * 0.06,
      },
    },
    hidden: {
      filter: 'blur(10px)',
      y: -20,
      opacity: 0,
    },
  }

  const variants = customVariants ?? defaultVariants

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
      // Polymorphic motion.* ref targets differ (div, a, span); HTMLElement ref is valid at runtime
      ref={elementRef as never}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={variants}
      custom={animationNum}
      className={cn(className)}
      {...props}
    >
      {children}
    </MotionComponent>
  )
}
