'use client'

import { useEffect, useState, useRef } from 'react'

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
  }, [isVisible, end, duration])

  return (
    <div ref={ref} className={className}>
      {prefix}{count.toFixed(1)}{suffix}
    </div>
  )
}

export default function Stats() {
  return (
    <section className="py-20 px-6 bg-white/5">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Cabo Negro by the Numbers
          </h2>
          <p className="text-gray-400 text-lg max-w-3xl mx-auto">
            Key statistics that define the scale and impact of Chile's premier industrial and maritime hub
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <div className="text-center p-6 bg-white/5 rounded-xl border border-white/10">
            <div className="text-5xl md:text-6xl font-bold mb-4 text-white">
              <AnimatedCounter end={13} suffix="%" />
            </div>
            <p className="text-gray-300 text-sm font-medium mb-2">of world's green hydrogen</p>
            <p className="text-gray-500 text-xs">Magallanes production potential</p>
          </div>
          
          <div className="text-center p-6 bg-white/5 rounded-xl border border-white/10">
            <div className="text-5xl md:text-6xl font-bold mb-4 text-white">
              <AnimatedCounter end={300} suffix="+" />
            </div>
            <p className="text-gray-300 text-sm font-medium mb-2">hectares</p>
            <p className="text-gray-500 text-xs">Industrial park area</p>
          </div>
          
          <div className="text-center p-6 bg-white/5 rounded-xl border border-white/10">
            <div className="text-5xl md:text-6xl font-bold mb-4 text-white">
              <AnimatedCounter end={200} suffix="+" />
            </div>
            <p className="text-gray-300 text-sm font-medium mb-2">H₂V projects</p>
            <p className="text-gray-500 text-xs">Filed or under review at SEA</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="text-center p-6 bg-white/5 rounded-xl border border-white/10">
            <div className="text-4xl md:text-5xl font-bold mb-4 text-white">
              <AnimatedCounter end={13} suffix=" MW" />
            </div>
            <p className="text-gray-300 text-sm font-medium mb-2">electrical capacity</p>
            <p className="text-gray-500 text-xs">Current infrastructure</p>
          </div>
          
          <div className="text-center p-6 bg-white/5 rounded-xl border border-white/10">
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