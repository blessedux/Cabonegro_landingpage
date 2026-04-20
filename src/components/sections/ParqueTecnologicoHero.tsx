'use client'

import { useRef, useState, useEffect } from 'react'
import { useInView, motion, useMotionTemplate, useMotionValue } from 'framer-motion'
import Image from 'next/image'
import type { HeroBridgeScrollMotion } from '@/components/sections/heroBridgeScrollMotion'

interface ParqueTecnologicoHeroProps {
  title: string
  subtitle: string
  posterSrc: string
  videoSrc: string
  posterAlt: string
  scrollMotion?: HeroBridgeScrollMotion | null
}

function GrainFilter() {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden>
      <defs>
        <filter id="parque-tecnologico-grain" x="0%" y="0%" width="100%" height="100%">
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

function HeroTitle({ title }: { title: string }) {
  if (!title.includes('&')) {
    return <>{title}</>
  }
  const parts = title.split(' & ')
  const first = parts[0]
  const rest = parts.slice(1).join(' & ')
  return (
    <>
      {first}
      <br className="hidden md:block" />
      & {rest}
    </>
  )
}

export function ParqueTecnologicoHero({
  title,
  subtitle,
  posterSrc,
  videoSrc,
  posterAlt,
  scrollMotion,
}: ParqueTecnologicoHeroProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [videoLoaded, setVideoLoaded] = useState(false)
  const [injectedVideoSrc, setInjectedVideoSrc] = useState<string | null>(null)
  const [videoFailed, setVideoFailed] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mq.matches)
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const isInView = useInView(sectionRef, { once: true, amount: 0.01 })

  useEffect(() => {
    if (!isInView || prefersReducedMotion || videoFailed) return

    const conn = (navigator as any).connection
    if (conn?.saveData) return

    const effective = conn?.effectiveType ?? '4g'
    if (effective === '2g' || effective === 'slow-2g') return

    setInjectedVideoSrc(videoSrc)
  }, [isInView, prefersReducedMotion, videoFailed, videoSrc])

  useEffect(() => {
    if (injectedVideoSrc && videoRef.current) {
      videoRef.current.load()
    }
  }, [injectedVideoSrc])

  const showVideo = !!injectedVideoSrc && !prefersReducedMotion && !videoFailed

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
      <GrainFilter />

      <motion.div
        className="absolute inset-0 will-change-transform"
        style={{
          zIndex: 1,
          transformOrigin: 'center top',
          ...mediaMotion,
        }}
      >
        <motion.div className="absolute inset-0 will-change-[filter]" style={{ filter: mediaBlurFilter }}>
          <div
            className="absolute inset-0 w-full h-full"
            style={{
              opacity: videoLoaded && showVideo ? 0 : 1,
              transition: 'opacity 1s ease-in-out',
              pointerEvents: 'none',
            }}
          >
            <Image
              src={posterSrc}
              alt={posterAlt}
              fill
              className="object-cover object-top"
              priority
              quality={90}
              sizes="100vw"
            />
          </div>

          {showVideo && (
            <video
              ref={videoRef}
              src={injectedVideoSrc!}
              autoPlay
              muted
              loop
              playsInline
              preload="none"
              crossOrigin="anonymous"
              className="absolute inset-0 h-full w-full object-cover object-top"
              style={{
                opacity: videoLoaded ? 1 : 0,
                transition: 'opacity 1s ease-in-out',
                backgroundColor: '#000000',
              }}
              onCanPlay={() => setVideoLoaded(true)}
              onCanPlayThrough={() => setVideoLoaded(true)}
              onLoadedData={() => setVideoLoaded(true)}
              onError={() => setVideoFailed(true)}
            />
          )}
        </motion.div>

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

        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/65"
          style={{ zIndex: 3 }}
        />
      </motion.div>

      <motion.div
        className="relative flex h-full flex-col items-center justify-center px-6 text-center"
        style={{
          zIndex: 10,
          ...contentMotion,
        }}
      >
        <h1 className="text-5xl md:text-6xl font-medium tracking-tighter mb-4 text-white">
          <HeroTitle title={title} />
        </h1>
        {subtitle ? (
          <p className="mx-auto max-w-[42ch] text-xl md:text-2xl mb-6 text-white">{subtitle}</p>
        ) : null}
        <div className="flex justify-center mt-6">
          <Image
            src="/logos/patagon_white.png"
            alt="Patagon Valley"
            width={160}
            height={64}
            className="object-contain"
          />
        </div>
      </motion.div>
    </section>
  )
}
