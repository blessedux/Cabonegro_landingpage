'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { MagicText } from '@/components/ui/magic-text'
import { X } from 'lucide-react'

interface AnimatedCounterProps {
  end: number
  duration?: number
  suffix?: string
  prefix?: string
  className?: string
  start?: number
}

function AnimatedCounter({ end, duration = 2000, suffix = '', prefix = '', className = '', start = 0 }: AnimatedCounterProps) {
  const [count, setCount] = useState(start)
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true)
        }
      },
      { threshold: 0.3 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [isVisible])

  useEffect(() => {
    if (!isVisible) return

    let startTime: number
    let animationFrame: number

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      const currentCount = easeOutQuart * (end - start) + start
      
      setCount(currentCount)

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    animationFrame = requestAnimationFrame(animate)

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
    }
  }, [isVisible, end, duration, start])

  return (
    <div ref={ref} className={className}>
      {prefix}{end === 2.1 ? count.toFixed(1) : Math.round(count)}{suffix}
    </div>
  )
}

export default function Stats() {
  const statsRef = useRef(null)
  const [expandedCard, setExpandedCard] = useState<number | null>(null)
  const { scrollYProgress } = useScroll({
    target: statsRef,
    offset: ["start end", "end start"]
  })

  // Animated background pattern based on scroll
  const backgroundOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.3, 0.6, 0.4])
  const patternScale = useTransform(scrollYProgress, [0, 1], [1, 1.2])

  const statCards = [
    {
      id: 0,
      value: 13,
      suffix: '%',
      title: 'of world\'s green hydrogen',
      subtitle: 'Magallanes production potential',
      expandedContent: 'Magallanes region has the potential to produce 13% of the world\'s green hydrogen due to its exceptional wind resources and strategic location.'
    },
    {
      id: 1,
      value: 300,
      suffix: '+',
      title: 'hectares',
      subtitle: 'Industrial park area',
      expandedContent: 'Over 300 hectares of ready-to-build industrial infrastructure, connected to Route 9N and equipped with essential utilities.'
    },
    {
      id: 2,
      value: 200,
      suffix: '+',
      title: 'H₂V projects',
      subtitle: 'Filed or under review at SEA',
      expandedContent: 'More than 200 hydrogen projects are currently filed or under review at the Environmental Assessment Service, showcasing the region\'s potential.'
    },
    {
      id: 3,
      value: 13,
      suffix: ' MW',
      title: 'electrical capacity',
      subtitle: 'Current infrastructure',
      expandedContent: '13 MW of electrical capacity currently available, with plans for expansion to support the growing industrial demand.'
    },
    {
      id: 4,
      value: 2.1,
      suffix: '×',
      start: 0.6,
      title: 'regional GDP',
      subtitle: 'Expected growth from H₂V',
      expandedContent: 'Hydrogen projects are expected to double the regional GDP, creating significant economic opportunities and employment.'
    }
  ]

  return (
    <section 
      ref={statsRef} 
      className="py-20 px-6 relative overflow-hidden"
      style={{
        backgroundImage: 'url(/cabonegro_wirefram2.webp)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Animated background pattern overlay */}
      <motion.div 
        className="absolute inset-0 opacity-30"
        style={{ scale: patternScale, opacity: backgroundOpacity }}
      >
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
                            radial-gradient(circle at 80% 80%, rgba(16, 185, 129, 0.1) 0%, transparent 50%),
                            radial-gradient(circle at 40% 20%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)`,
          backgroundSize: '200% 200%',
        }} />
      </motion.div>
      {/* Background overlay for better Instext readability */}
      <div className="absolute inset-0 bg-black/60"></div>
      
      <div className="container mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            Cabo Negro by the Numbers
          </h2>
          <div className="max-w-3xl mx-auto">
            <MagicText 
              text="Key statistics that define the scale and impact of Chile's premier industrial and maritime hub"
              className="text-gray-400 text-lg"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <div className="text-center p-6 bg-black/40 backdrop-blur-md rounded-xl border border-white/20 shadow-2xl">
            <div className="text-5xl md:text-6xl font-bold mb-4 text-white">
              <AnimatedCounter end={13} suffix="%" />
            </div>
            <p className="text-gray-300 text-sm font-medium mb-2">of world's green hydrogen</p>
            <p className="text-gray-500 text-xs">Magallanes production potential</p>
          </div>
          
          <div className="text-center p-6 bg-black/40 backdrop-blur-md rounded-xl border border-white/20 shadow-2xl">
            <div className="text-5xl md:text-6xl font-bold mb-4 text-white">
              <AnimatedCounter end={300} suffix="+" />
            </div>
            <p className="text-gray-300 text-sm font-medium mb-2">hectares</p>
            <p className="text-gray-500 text-xs">Industrial park area</p>
          </div>
          
          <div className="text-center p-6 bg-black/40 backdrop-blur-md rounded-xl border border-white/20 shadow-2xl">
            <div className="text-5xl md:text-6xl font-bold mb-4 text-white">
              <AnimatedCounter end={200} suffix="+" />
            </div>
            <p className="text-gray-300 text-sm font-medium mb-2">H₂V projects</p>
            <p className="text-gray-500 text-xs">Filed or under review at SEA</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="text-center p-6 bg-black/40 backdrop-blur-md rounded-xl border border-white/20 shadow-2xl">
            <div className="text-4xl md:text-5xl font-bold mb-4 text-white">
              <AnimatedCounter end={13} suffix=" MW" />
            </div>
            <p className="text-gray-300 text-sm font-medium mb-2">electrical capacity</p>
            <p className="text-gray-500 text-xs">Current infrastructure</p>
          </div>
          
          <div className="text-center p-6 bg-black/40 backdrop-blur-md rounded-xl border border-white/20 shadow-2xl">
            <div className="text-4xl md:text-5xl font-bold mb-4 text-white">
              <AnimatedCounter end={2.1} start={0.6} suffix="×" />
            </div>
            <p className="text-gray-300 text-sm font-medium mb-2">regional GDP</p>
            <p className="text-gray-500 text-xs">Expected growth from H₂V</p>
          </div>
        </div>
      </div>
    </section>
  )
}