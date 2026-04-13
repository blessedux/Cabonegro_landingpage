'use client'

import { useRef, useState, useEffect } from 'react'
import { useInView, motion, useMotionTemplate, useMotionValue, type MotionValue } from 'framer-motion'
import Image from 'next/image'

interface HeroText {
  title: string
  subtitle: string
  learnMore: string
}

/** Scroll-linked motion for the terminal page bridge: media zooms + blur; content moves (parallax). */
export interface TerminalHeroScrollMotion {
  mediaScale: MotionValue<number>
  /** Keep at 0 for a “fixed” background; optional nudge if needed */
  mediaY: MotionValue<string>
  contentY: MotionValue<number>
  /** Blur on poster/video only (px), e.g. 0 → 10 */
  mediaBlur: MotionValue<number>
}

interface TerminalMaritimoHeroProps {
  text: HeroText
  locale: string
  scrollMotion?: TerminalHeroScrollMotion | null
}

// Grain filter rendered as inline SVG — zero extra bytes, purely declarative
function GrainFilter() {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden>
      <defs>
        <filter id="terminal-grain" x="0%" y="0%" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.72"
            numOctaves="4"
            stitchTiles="stitch"
            result="noise"
          />
          <feColorMatrix type="saturate" values="0" in="noise" result="grayNoise" />
          <feBlend in="SourceGraphic" in2="grayNoise" mode="multiply" result="blended" />
          <feComponentTransfer in="blended">
            <feFuncA type="linear" slope="1" />
          </feComponentTransfer>
        </filter>
      </defs>
    </svg>
  )
}

export function TerminalMaritimoHero({ text, locale, scrollMotion }: TerminalMaritimoHeroProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [videoLoaded, setVideoLoaded] = useState(false)
  const [videoSrc, setVideoSrc] = useState<string | null>(null)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  // Detect reduced-motion once on mount
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mq.matches)
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  // Watch hero entering the viewport; only then inject the video src
  const isInView = useInView(sectionRef, { once: true, amount: 0.01 })

  useEffect(() => {
    if (!isInView || prefersReducedMotion) return

    // Respect data-saver mode
    const conn = (navigator as any).connection
    if (conn?.saveData) return

    // Gate on connection quality — skip video on 2G / slow-2G
    const effective = conn?.effectiveType ?? '4g'
    if (effective === '2g' || effective === 'slow-2g') return

    // Inject sources; browser picks the first supported type
    setVideoSrc('/videos/terminal-hero-480p.mp4')
  }, [isInView, prefersReducedMotion])

  // Re-load video once the src has been set
  useEffect(() => {
    if (videoSrc && videoRef.current) {
      videoRef.current.load()
    }
  }, [videoSrc])

  const showVideo = !!videoSrc && !prefersReducedMotion

  const mediaMotion = scrollMotion
    ? {
        scale: scrollMotion.mediaScale,
        y: scrollMotion.mediaY,
      }
    : undefined

  const contentMotion = scrollMotion ? { y: scrollMotion.contentY } : undefined

  const blurZeroRef = useRef(useMotionValue(0))
  const blurPx = scrollMotion?.mediaBlur ?? blurZeroRef.current
  const mediaBlurFilter = useMotionTemplate`blur(${blurPx}px)`

  return (
    <section
      ref={sectionRef}
      data-hero-section="true"
      className="relative h-[100dvh] min-h-[100dvh] w-full overflow-hidden bg-black"
    >
      {/* Hidden SVG grain filter definition */}
      <GrainFilter />

      {/* Media stack: scale on outer layer; blur on poster/video only; mediaY≈0 reads “fixed” vs scrolling copy */}
      <motion.div
        className="absolute inset-0 will-change-transform"
        style={{
          zIndex: 1,
          transformOrigin: 'center top',
          ...mediaMotion,
        }}
      >
        <motion.div className="absolute inset-0 will-change-[filter]" style={{ filter: mediaBlurFilter }}>
          {/* Poster — always shown; fades out once video is playing */}
          <div
            className="absolute inset-0 w-full h-full"
            style={{
              opacity: videoLoaded ? 0 : 1,
              transition: 'opacity 1s ease-in-out',
              pointerEvents: 'none',
            }}
          >
            <Image
              src="/cabonegro_slide2.webp"
              alt="Cabo Negro Maritime Terminal"
              fill
              className="object-cover object-top"
              priority
              quality={90}
              sizes="100vw"
            />
          </div>

          {/* Video — lazy-loaded, fades in when ready */}
          {showVideo && (
            <video
              ref={videoRef}
              autoPlay
              muted
              loop
              playsInline
              preload="none"
              className="absolute inset-0 h-full w-full object-cover object-top"
              style={{
                opacity: videoLoaded ? 1 : 0,
                transition: 'opacity 1s ease-in-out',
              }}
              onCanPlay={() => setVideoLoaded(true)}
              onCanPlayThrough={() => setVideoLoaded(true)}
            >
              <source src="/videos/terminal-hero-480p.webm" type="video/webm" />
              <source src="/videos/terminal-hero-480p.mp4" type="video/mp4" />
            </video>
          )}
        </motion.div>

        {/* Film-grain overlay */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            zIndex: 4,
            backgroundImage:
              'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'0.12\'/%3E%3C/svg%3E")',
            backgroundRepeat: 'repeat',
            backgroundSize: '180px 180px',
            mixBlendMode: 'overlay',
            opacity: 0.55,
          }}
        />

        {/* Gradient overlay for text readability */}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/65"
          style={{ zIndex: 3 }}
        />
      </motion.div>

      {/* Hero content — moves faster than media for parallax */}
      <motion.div
        className="relative flex h-full flex-col items-center justify-center px-6 text-center"
        style={{
          zIndex: 10,
          ...contentMotion,
        }}
      >
        <h1 className="text-5xl md:text-6xl font-medium tracking-tighter mb-4 text-white">
          {text.title}
        </h1>
        <p className="mx-auto max-w-[42ch] text-xl md:text-2xl mb-6 text-white">
          {text.subtitle}
        </p>

        {/* COMPAS Marine logo */}
        <div className="mt-24">
          <a
            href="https://compasmarine.cl/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block transition-opacity hover:opacity-80"
          >
            <Image
              src="/logos/COMPAS_MARINE.png"
              alt="COMPAS Marine"
              width={220}
              height={110}
              className="object-contain"
              style={{ filter: 'brightness(0) invert(1)' }}
            />
          </a>
          <p className="mt-4 text-sm italic text-white/70">{text.learnMore}</p>
        </div>
      </motion.div>
    </section>
  )
}
