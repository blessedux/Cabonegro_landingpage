"use client"

import * as React from "react"
import {
  HTMLMotionProps,
  MotionValue,
  Variants,
  motion,
  useMotionTemplate,
  useScroll,
  useTransform,
} from "framer-motion"

import { cn } from "@/lib/utils"

interface ContainerScrollContextValue {
  scrollYProgress: MotionValue<number>
}

interface ContainerInsetProps extends HTMLMotionProps<"div"> {
  insetYRange?: [number, number]
  insetXRange?: [number, number]
  roundednessRange?: [number, number]
}

const SPRING_TRANSITION_CONFIG = {
  type: "spring",
  stiffness: 100,
  damping: 16,
  mass: 0.75,
  restDelta: 0.005,
}

const variants: Variants = {
  hidden: {
    filter: "blur(10px)",
    opacity: 0,
  },
  visible: {
    filter: "blur(0px)",
    opacity: 1,
  },
}

const ContainerScrollContext = React.createContext<
  ContainerScrollContextValue | undefined
>(undefined)

function useContainerScrollContext() {
  const context = React.useContext(ContainerScrollContext)
  if (!context) {
    throw new Error(
      "useContainerScrollContext must be used within a ContainerScroll Component"
    )
  }
  return context
}

export const ContainerScroll: React.FC<
  React.HTMLAttributes<HTMLDivElement>
> = ({ children, className, ...props }) => {
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: scrollRef,
    offset: ["start start", "end start"], // Changed to keep sticky longer - starts when top hits viewport top, ends when bottom hits viewport top
    layoutEffect: false // Prevent hydration issues
  })

  return (
    <ContainerScrollContext.Provider value={{ scrollYProgress }}>
      <div
        ref={scrollRef}
        className={cn("relative min-h-svh w-full", className)}
        {...props}
      >
        {children}
      </div>
    </ContainerScrollContext.Provider>
  )
}

ContainerScroll.displayName = "ContainerScroll"

interface ContainerAnimatedProps extends HTMLMotionProps<"div"> {
  inputRange?: number[]
  outputRange?: number[]
}

export const ContainerAnimated = React.forwardRef<
  HTMLDivElement,
  ContainerAnimatedProps
>(
  (
    {
      className,
      transition,
      style,
      inputRange = [0.2, 0.8],
      outputRange = [80, 0],
      initial: propInitial,
      animate: propAnimate,
      ...props
    },
    ref
  ) => {
    const { scrollYProgress } = useContainerScrollContext()
    const y = useTransform(scrollYProgress, inputRange, outputRange)
    
    // If initial and animate are explicitly set, use them and skip whileInView fade-in
    // But keep scroll-based animations (y transform) working
    const shouldSkipFadeIn = propInitial === "visible" && propAnimate === "visible"
    
    return (
      <motion.div
        ref={ref}
        className={cn("", className)}
        variants={variants}
        initial={propInitial !== undefined ? propInitial : "hidden"}
        animate={propAnimate !== undefined ? propAnimate : undefined}
        whileInView={shouldSkipFadeIn ? undefined : "visible"}
        viewport={shouldSkipFadeIn ? undefined : { once: true }}
        style={{ y, ...style }}
        // Only skip transition for fade-in variants, not for scroll transforms
        transition={shouldSkipFadeIn ? { opacity: { duration: 0 }, filter: { duration: 0 }, ...transition } : { ...SPRING_TRANSITION_CONFIG, ...transition }}
        {...props}
      />
    )
  }
)

ContainerAnimated.displayName = "ContainerAnimated"

export const ContainerSticky = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("sticky left-0 top-0 h-screen w-full flex flex-col items-center justify-center", className)}
      {...props}
    />
  )
})

ContainerSticky.displayName = "ContainerSticky"

export const HeroVideo = React.forwardRef<
  HTMLVideoElement,
  HTMLMotionProps<"video">
>(({ style, className, transition, ...props }, ref) => {
  const { scrollYProgress } = useContainerScrollContext()
  const scale = useTransform(scrollYProgress, [0, 0.8], [0.7, 1])

  return (
    <motion.video
      ref={ref}
      className={cn(
        "relative z-10 size-auto max-h-full max-w-full ",
        className
      )}
      autoPlay
      muted
      loop
      playsInline
      style={{ scale, ...style }}
      {...props}
    />
  )
})

HeroVideo.displayName = "HeroVideo"

export const HeroButton = React.forwardRef<
  HTMLButtonElement,
  HTMLMotionProps<"button">
>(({ className, transition, ...props }, ref) => {
  return (
    <motion.button
      whileHover={{
        scale: 1.015,
      }}
      whileTap={{
        scale: 0.985,
      }}
      ref={ref}
      className={cn(
        "group relative flex w-fit items-center rounded-full border border-[#84cc16] bg-gray-950/10 px-4 py-2 shadow-[0px_4px_24px_#84cc16] transition-colors hover:bg-slate-950/50",
        className
      )}
      {...props}
    />
  )
})

HeroButton.displayName = "HeroButton"

export const ContainerInset = React.forwardRef<
  HTMLDivElement,
  ContainerInsetProps
>(
  (
    {
      className,
      style,
      insetYRange = [45, 0],
      insetXRange = [45, 0],
      roundednessRange = [1000, 16],
      transition,
      ...props
    },
    ref
  ) => {
    const { scrollYProgress } = useContainerScrollContext()

    const insetY = useTransform(scrollYProgress, [0, 0.8], insetYRange)
    const insetX = useTransform(scrollYProgress, [0, 0.8], insetXRange)
    const roundedness = useTransform(scrollYProgress, [0, 1], roundednessRange)

    const clipPath = useMotionTemplate`inset(${insetY}% ${insetX}% ${insetY}% ${insetX}% round ${roundedness}px)`

    return (
      <motion.div
        ref={ref}
        className={cn(
          "relative pointer-events-none overflow-hidden",
          className
        )}
        style={{
          clipPath,
          ...style,
        }}
        {...props}
      />
    )
  }
)

ContainerInset.displayName = "ContainerInset"

