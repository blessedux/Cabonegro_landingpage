'use client'

import { useRef } from 'react'
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion'
import Image from 'next/image'
import type { HeroBridgeScrollMotion } from '@/components/sections/heroBridgeScrollMotion'

interface HeroText {
  title: string
  subtitle: string
}

function GrainFilter() {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden>
      <defs>
        <filter id="parque-logistico-grain" x="0%" y="0%" width="100%" height="100%">
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

interface ParqueLogisticoHeroProps {
  text: HeroText
  imageAlt: string
  scrollMotion?: HeroBridgeScrollMotion | null
}

export function ParqueLogisticoHero({ text, imageAlt, scrollMotion }: ParqueLogisticoHeroProps) {
  const sectionRef = useRef<HTMLElement>(null)

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
          <div className="absolute inset-0 w-full h-full">
            <Image
              src="/image15.webp"
              alt={imageAlt}
              fill
              className="object-cover object-top"
              priority
              quality={90}
              sizes="100vw"
            />
          </div>
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
        <h1 className="text-5xl md:text-6xl font-medium tracking-tighter mb-4 text-white">{text.title}</h1>
        <p className="mx-auto max-w-[42ch] text-xl md:text-2xl text-white">{text.subtitle}</p>
      </motion.div>
    </section>
  )
}
