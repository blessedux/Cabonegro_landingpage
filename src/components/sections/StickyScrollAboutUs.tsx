'use client'

import { useEffect, useRef, useCallback } from 'react'

interface StickySection {
  label: string
  title: string
  description: string
  imageUrl: string
  imageAlt: string
}

interface StickyScrollAboutUsProps {
  sections?: StickySection[]
}

const defaultSections: StickySection[] = [
  {
    label: 'Integrated Knowledge',
    title: 'Support your users with popular topics',
    description: 'Statistics show that people browsing your webpage who receive live assistance with a chat widget are more likely to make a purchase.',
    imageUrl: 'https://cruip-tutorials.vercel.app/sticky-scrolling/illustration-01.png',
    imageAlt: 'Illustration 01'
  },
  {
    label: 'Authentic Experiences',
    title: 'Personalise the support experience',
    description: 'Statistics show that people browsing your webpage who receive live assistance with a chat widget are more likely to make a purchase.',
    imageUrl: 'https://cruip-tutorials.vercel.app/sticky-scrolling/illustration-02.png',
    imageAlt: 'Illustration 02'
  },
  {
    label: 'Live Assistance',
    title: 'Scale your sales using automation',
    description: 'Statistics show that people browsing your webpage who receive live assistance with a chat widget are more likely to make a purchase.',
    imageUrl: 'https://cruip-tutorials.vercel.app/sticky-scrolling/illustration-03.png',
    imageAlt: 'Illustration 03'
  },
  {
    label: 'Satisfaction Guaranteed',
    title: 'Make customer satisfaction easier',
    description: 'Statistics show that people browsing your webpage who receive live assistance with a chat widget are more likely to make a purchase.',
    imageUrl: 'https://cruip-tutorials.vercel.app/sticky-scrolling/illustration-04.png',
    imageAlt: 'Illustration 04'
  }
]

export default function StickyScrollAboutUs({ sections = defaultSections }: StickyScrollAboutUsProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  // Remap value from one range to another
  const remapValue = useCallback((value: number, start1: number, end1: number, start2: number, end2: number): number => {
    const remapped = ((value - start1) * (end2 - start2)) / (end1 - start1) + start2
    return remapped > 0 ? remapped : 0
  }, [])

  // Handle scroll and update section visibility/scale
  const handleSections = useCallback(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    const sectionElements = container.querySelectorAll('section')
    
    if (sectionElements.length === 0) return

    const viewportTop = window.scrollY
    const containerHeight = container.clientHeight
    const containerTop = container.offsetTop
    const containerBottom = containerTop + containerHeight
    const sectionsCount = sectionElements.length

    let scrollValue: number

    if (containerBottom <= viewportTop) {
      // The bottom edge of the stickContainer is above the viewport
      scrollValue = sectionsCount + 1
    } else if (containerTop >= viewportTop) {
      // The top edge of the stickContainer is below the viewport
      scrollValue = 0
    } else {
      // The stickContainer intersects with the viewport
      scrollValue = remapValue(viewportTop, containerTop, containerBottom, 0, sectionsCount + 1)
    }

    const activeIndex = Math.floor(scrollValue) >= sectionsCount 
      ? sectionsCount - 1 
      : Math.floor(scrollValue)

    // Update CSS variables for each section
    sectionElements.forEach((section, i) => {
      if (i === activeIndex) {
        section.style.setProperty('--stick-visibility', '1')
        section.style.setProperty('--stick-scale', '1')
      } else {
        section.style.setProperty('--stick-visibility', '0')
        section.style.setProperty('--stick-scale', '.8')
      }
    })
  }, [remapValue])

  // Initialize container
  const initContainer = useCallback(() => {
    if (!containerRef.current) return
    
    const container = containerRef.current
    const sectionElements = container.querySelectorAll('section')
    const sectionsCount = sectionElements.length
    
    // Set CSS variable for container height - matches original format
    // This creates scroll space: (sectionsCount + 1) * 100vh
    const heightValue = `${sectionsCount + 1}00vh`
    container.style.setProperty('--stick-items', heightValue)
    
    // Also set minHeight directly to ensure it works
    container.style.minHeight = heightValue
    
    // Temporarily disable transitions for initialization
    container.classList.add('[&_*]:!transition-none')
    
    setTimeout(() => {
      container.classList.remove('[&_*]:!transition-none')
      // Trigger initial calculation
      handleSections()
    }, 10)
  }, [handleSections])

  useEffect(() => {
    // Initialize container after a small delay to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      initContainer()
      handleSections()
    }, 100)

    // Add scroll listener with throttling
    let ticking = false
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleSections()
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', handleSections)

    // Cleanup
    return () => {
      clearTimeout(timeoutId)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', handleSections)
    }
  }, [initContainer, handleSections])

  return (
    <div className="relative font-inter antialiased">
      <main className="relative min-h-screen flex flex-col justify-center bg-slate-50">
        <div className="w-full max-w-6xl mx-auto px-4 md:px-6 py-24">
          {/* Scroll down indicator */}
          <div className="h-[calc(100vh-6rem)] flex items-center justify-center text-4xl font-bold text-slate-300 text-center">
            Scroll down
          </div>

          {/* Sticky Scroll Animation Container */}
          <div
            ref={containerRef}
            className="max-w-md mx-auto lg:max-w-none"
            style={{
              minHeight: 'var(--stick-items, 500vh)'
            }}
          >
            {/* Sticky wrapper - this sticks to the top of viewport and creates the sticky effect */}
            <div className="lg:sticky lg:top-0 lg:h-screen space-y-16 lg:space-y-0 relative">
              {sections.map((section, index) => (
                <section
                  key={index}
                  className="lg:absolute lg:inset-0 lg:z-[var(--stick-visibility)]"
                  style={{
                    '--stick-visibility': index === 0 ? '1' : '0',
                    '--stick-scale': index === 0 ? '1' : '.8'
                  } as React.CSSProperties}
                >
                  <div className="flex flex-col lg:h-full lg:flex-row space-y-4 space-y-reverse lg:space-y-0 lg:space-x-20 lg:items-center">
                    {/* Text Content */}
                    <div className="flex-1 flex items-center lg:opacity-[var(--stick-visibility)] transition-opacity duration-300 order-1 lg:order-none">
                      <div className="space-y-3">
                        <div className="relative inline-flex text-indigo-500 font-semibold">
                          {section.label}
                          <svg
                            className="fill-indigo-300 absolute top-full w-full"
                            xmlns="http://www.w3.org/2000/svg"
                            width="166"
                            height="4"
                          >
                            <path d="M98.865 1.961c-8.893.024-17.475.085-25.716.182-2.812.019-5.023.083-7.622.116l-6.554.067a2910.9 2910.9 0 0 0-25.989.38c-4.04.067-7.709.167-11.292.27l-1.34.038c-2.587.073-4.924.168-7.762.22-2.838.051-6.054.079-9.363.095-1.994.007-2.91-.08-3.106-.225l-.028-.028c-.325-.253.203-.463 1.559-.62l.618-.059c.206-.02.42-.038.665-.054l1.502-.089 3.257-.17 2.677-.132c.902-.043 1.814-.085 2.744-.126l1.408-.06c4.688-.205 10.095-.353 16.167-.444C37.413 1.22 42.753.98 49.12.824l1.614-.037C54.041.707 57.588.647 61.27.6l1.586-.02c4.25-.051 8.53-.1 12.872-.14C80.266.4 84.912.373 89.667.354l2.866-.01c8.639-.034 17.996 0 27.322.03 6.413.006 13.168.046 20.237.12l2.368.027c1.733.014 3.653.05 5.712.105l2.068.064c5.89.191 9.025.377 11.823.64l.924.09c.802.078 1.541.156 2.21.233 1.892.233.29.343-3.235.364l-3.057.02c-.446.003-.89.008-1.33.014a305.77 305.77 0 0 1-4.33-.004c-2.917-.005-5.864-.018-8.783-.019l-4.982.003a447.91 447.91 0 0 1-3.932-.02l-4.644-.023-4.647-.014c-9.167-.026-18.341-.028-26.923.03l-.469-.043Z" />
                          </svg>
                        </div>
                        <h2 className="text-4xl text-slate-900 font-extrabold">
                          {section.title}
                        </h2>
                        <p className="text-lg text-slate-500">
                          {section.description}
                        </p>
                      </div>
                    </div>

                    {/* Image Content - Centered vertically in viewport */}
                    <div className="flex-1 flex items-center justify-center lg:scale-[var(--stick-scale)] lg:opacity-[var(--stick-visibility)] transition duration-300">
                      <img
                        width="512"
                        height="480"
                        src={section.imageUrl}
                        alt={section.imageAlt}
                        className="w-full h-auto max-w-[512px]"
                      />
                    </div>
                  </div>
                </section>
              ))}
            </div>
          </div>

          {/* Scroll up indicator */}
          <div className="h-[calc(100vh-6rem)] flex items-center justify-center text-4xl font-bold text-slate-300 text-center">
            Scroll up
          </div>
        </div>
      </main>
    </div>
  )
}
