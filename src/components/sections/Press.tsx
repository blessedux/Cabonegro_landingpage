'use client'

import React, { useRef, useState } from 'react'
import { TimelineContent } from '@/components/ui/timeline-animation'
import { VerticalCutReveal } from '@/components/ui/vertical-cut-reveal'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { MagicText } from '@/components/ui/magic-text'

interface PressArticle {
  id: number
  title: string
  description: string
  image: string
  link: string
  source: string
  date: string
}

const pressArticles: PressArticle[] = [
  {
    id: 1,
    title: 'Cabo Negro: Strategic Gateway to the South',
    description: 'New industrial complex set to transform maritime logistics in Patagonia',
    image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1200&auto=format&fit=crop',
    link: 'https://example.com/article1',
    source: 'Maritime News',
    date: '2024-01-15'
  },
  {
    id: 2,
    title: 'Hydrogen Economy Infrastructure Development',
    description: 'Cabo Negro positioned as key hub for green hydrogen export operations',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&auto=format&fit=crop',
    link: 'https://example.com/article2',
    source: 'Energy Today',
    date: '2024-02-20'
  },
  {
    id: 3,
    title: 'Industrial Park Expansion in Patagonia',
    description: 'Major investment in sustainable industrial infrastructure for Southern Chile',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&auto=format&fit=crop',
    link: 'https://example.com/article3',
    source: 'Industrial Weekly',
    date: '2024-03-10'
  },
  {
    id: 4,
    title: 'Environmental Compliance and Sustainability',
    description: 'Cabo Negro sets new standards for eco-friendly port operations',
    image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1200&auto=format&fit=crop',
    link: 'https://example.com/article4',
    source: 'Green Business',
    date: '2024-04-05'
  }
]

export default function Press() {
  const heroRef = useRef<HTMLDivElement>(null)
  const [currentArticle, setCurrentArticle] = useState(0)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  const revealVariants = {
    visible: (i: number) => ({
      y: 0,
      opacity: 1,
      filter: 'blur(0px)',
      transition: {
        delay: i * 0.4,
        duration: 0.5,
      },
    }),
    hidden: {
      filter: 'blur(10px)',
      y: -20,
      opacity: 0,
    },
  }

  const scaleVariants = {
    visible: (i: number) => ({
      opacity: 1,
      filter: 'blur(0px)',
      transition: {
        delay: i * 0.4,
        duration: 0.5,
      },
    }),
    hidden: {
      filter: 'blur(10px)',
      opacity: 0,
    },
  }

  const nextArticle = () => {
    setCurrentArticle((prev) => (prev + 1) % pressArticles.length)
  }

  const prevArticle = () => {
    setCurrentArticle((prev) => (prev - 1 + pressArticles.length) % pressArticles.length)
  }

  const goToArticle = (index: number) => {
    setCurrentArticle(index)
  }

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe) {
      nextArticle()
    }
    if (isRightSwipe) {
      prevArticle()
    }
  }

  const currentArticleData = pressArticles[currentArticle]

  return (
    <section className="py-8 px-4 bg-white relative z-[10] min-h-screen" ref={heroRef} data-keep-navbar-black="true">
      <div className="max-w-6xl mx-auto">
        <div className="relative">
          {/* Header */}
          <div className="flex justify-between items-center mb-8 w-[85%] absolute lg:top-4 md:top-0 sm:-top-2 -top-3 z-10">
            <div className="flex items-center gap-2 text-xl">
              <span className="text-cyan-500 animate-spin">✱</span>
              <TimelineContent
                as="span"
                animationNum={0}
                timelineRef={heroRef}
                customVariants={revealVariants}
                className="text-sm font-medium text-gray-600"
              >
                PRESS & MEDIA
              </TimelineContent>
            </div>
          </div>

          {/* Image Frame with Slider */}
          <TimelineContent
            as="figure"
            animationNum={4}
            timelineRef={heroRef}
            customVariants={scaleVariants}
            className="relative group"
          >
            <div
              className="relative w-full overflow-hidden"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <svg
                className="w-full"
                width="100%"
                height="100%"
                viewBox="0 0 100 40"
                preserveAspectRatio="xMidYMid slice"
              >
                <defs>
                  <clipPath
                    id="clip-inverted"
                    clipPathUnits="objectBoundingBox"
                  >
                    <path
                      d="M0.0998072 1H0.422076H0.749756C0.767072 1 0.774207 0.961783 0.77561 0.942675V0.807325C0.777053 0.743631 0.791844 0.731953 0.799059 0.734076H0.969813C0.996268 0.730255 1.00088 0.693206 0.999875 0.675159V0.0700637C0.999875 0.0254777 0.985045 0.00477707 0.977629 0H0.902473C0.854975 0 0.890448 0.138535 0.850165 0.138535H0.0204424C0.00408849 0.142357 0 0.180467 0 0.199045V0.410828C0 0.449045 0.0136283 0.46603 0.0204424 0.469745H0.0523086C0.0696245 0.471019 0.0735527 0.497877 0.0733523 0.511146V0.915605C0.0723903 0.983121 0.090588 1 0.0998072 1Z"
                      fill="#D9D9D9"
                    />
                  </clipPath>
                </defs>
                <AnimatePresence mode="wait">
                  <motion.image
                    key={currentArticle}
                    clipPath="url(#clip-inverted)"
                    preserveAspectRatio="xMidYMid slice"
                    width="100%"
                    height="100%"
                    xlinkHref={currentArticleData.image}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                  />
                </AnimatePresence>
              </svg>

              {/* Navigation Arrows */}
              <button
                onClick={prevArticle}
                className="absolute left-4 top-[80%] p-2 bg-black/60 hover:bg-black/80 backdrop-blur-md rounded-full border border-white/20 text-white transition-all hover:scale-110 active:scale-95 z-20"
                aria-label="Previous article"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={nextArticle}
                className="absolute right-4 top-[80%] p-2 bg-black/60 hover:bg-black/80 backdrop-blur-md rounded-full border border-white/20 text-white transition-all hover:scale-110 active:scale-95 z-20"
                aria-label="Next article"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              {/* Slider Indicators */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                {pressArticles.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToArticle(index)}
                    className={`h-2 rounded-full transition-all ${
                      index === currentArticle
                        ? 'bg-white w-8'
                        : 'bg-white/30 hover:bg-white/50 w-2'
                    }`}
                    aria-label={`Go to article ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </TimelineContent>

          {/* Article Info */}
          <div className="flex flex-wrap lg:justify-start justify-between items-center py-3 text-sm">
            <TimelineContent
              as="div"
              animationNum={5}
              timelineRef={heroRef}
              customVariants={revealVariants}
              className="flex gap-4"
            >
              <div className="flex items-center gap-2 mb-2 sm:text-base text-xs">
                <span className="text-cyan-500 font-bold">{currentArticleData.source}</span>
                <span className="text-gray-300">|</span>
                <span className="text-gray-600">{currentArticleData.date}</span>
              </div>
            </TimelineContent>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid md:grid-cols-3 gap-8 mt-8">
          <div className="md:col-span-2">
            <h1 className="sm:text-4xl md:text-5xl text-2xl !leading-[110%] font-semibold text-gray-900 mb-8">
              <VerticalCutReveal
                splitBy="words"
                staggerDuration={0.1}
                staggerFrom="first"
                reverse={true}
                transition={{
                  type: 'spring',
                  stiffness: 250,
                  damping: 30,
                  delay: 3,
                }}
              >
                {currentArticleData.title}
              </VerticalCutReveal>
            </h1>

            <TimelineContent
              as="div"
              animationNum={9}
              timelineRef={heroRef}
              customVariants={revealVariants}
              className="text-gray-600"
            >
              <TimelineContent
                as="div"
                animationNum={10}
                timelineRef={heroRef}
                customVariants={revealVariants}
                className="sm:text-base text-xs"
              >
                <p className="leading-relaxed text-justify mb-6">
                  {currentArticleData.description}
                </p>
              </TimelineContent>
            </TimelineContent>
          </div>

          <div className="md:col-span-1">
            <div className="text-right">
              <TimelineContent
                as="div"
                animationNum={12}
                timelineRef={heroRef}
                customVariants={revealVariants}
                className="text-cyan-500 text-2xl font-bold mb-2"
              >
                CABO NEGRO
              </TimelineContent>
              <TimelineContent
                as="div"
                animationNum={13}
                timelineRef={heroRef}
                customVariants={revealVariants}
                className="text-gray-600 text-sm mb-8"
              >
                Press & Media Coverage
              </TimelineContent>

              <TimelineContent
                as="div"
                animationNum={14}
                timelineRef={heroRef}
                customVariants={revealVariants}
                className="mb-6"
              >
                <p className="text-gray-900 font-medium mb-4">
                  Read the full article for more details
                </p>
              </TimelineContent>

              <TimelineContent
                as="a"
                animationNum={15}
                timelineRef={heroRef}
                customVariants={revealVariants}
                href={currentArticleData.link}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-neutral-900 hover:bg-neutral-950 shadow-lg shadow-neutral-900 border border-neutral-700 flex w-fit ml-auto gap-2 hover:gap-4 transition-all duration-300 ease-in-out text-white px-5 py-3 rounded-lg cursor-pointer font-semibold"
              >
                READ ARTICLE <ArrowRight className="" />
              </TimelineContent>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
