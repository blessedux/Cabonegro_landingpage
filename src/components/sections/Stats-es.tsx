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
  }, [isVisible, end, duration, start])

  return (
    <div ref={ref} className={className}>
      {prefix}{end === 2.1 ? count.toFixed(1) : Math.round(count)}{suffix}
    </div>
  )
}

export default function StatsEs() {
  return (
    <section className="py-20 px-6 bg-white/5">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Cabo Negro en Números
          </h2>
          <p className="text-gray-400 text-lg max-w-3xl mx-auto">
            Estadísticas clave que definen la escala e impacto del principal centro industrial y marítimo de Chile
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <div className="text-center p-6 bg-white/5 rounded-xl border border-white/10">
            <div className="text-5xl md:text-6xl font-bold mb-4 text-white">
              <AnimatedCounter end={13} suffix="%" />
            </div>
            <p className="text-gray-300 text-sm font-medium mb-2">del hidrógeno verde mundial</p>
            <p className="text-gray-500 text-xs">Potencial de producción de Magallanes</p>
          </div>
          
          <div className="text-center p-6 bg-white/5 rounded-xl border border-white/10">
            <div className="text-5xl md:text-6xl font-bold mb-4 text-white">
              <AnimatedCounter end={300} suffix="+" />
            </div>
            <p className="text-gray-300 text-sm font-medium mb-2">hectáreas</p>
            <p className="text-gray-500 text-xs">Área del parque industrial</p>
          </div>
          
          <div className="text-center p-6 bg-white/5 rounded-xl border border-white/10">
            <div className="text-5xl md:text-6xl font-bold mb-4 text-white">
              <AnimatedCounter end={200} suffix="+" />
            </div>
            <p className="text-gray-300 text-sm font-medium mb-2">proyectos H₂V</p>
            <p className="text-gray-500 text-xs">Presentados o en revisión en SEA</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="text-center p-6 bg-white/5 rounded-xl border border-white/10">
            <div className="text-4xl md:text-5xl font-bold mb-4 text-white">
              <AnimatedCounter end={13} suffix=" MW" />
            </div>
            <p className="text-gray-300 text-sm font-medium mb-2">capacidad eléctrica</p>
            <p className="text-gray-500 text-xs">Infraestructura actual</p>
          </div>
          
          <div className="text-center p-6 bg-white/5 rounded-xl border border-white/10">
            <div className="text-4xl md:text-5xl font-bold mb-4 text-white">
              <AnimatedCounter end={2.1} start={0.6} suffix="×" />
            </div>
            <p className="text-gray-300 text-sm font-medium mb-2">PIB regional</p>
            <p className="text-gray-500 text-xs">Crecimiento esperado del H₂V</p>
          </div>
        </div>
      </div>
    </section>
  )
}
